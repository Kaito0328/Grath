use crate::codec::{
    is_type_api_target, type_api_export_name, BoundaryKind, BoundaryMode, CodecPlan, CodecRegistry,
    RustPrimitive, RustType,
};
use crate::types::{ApiReport, EnumVariantFields, FunctionInfo, StructInfo, TypeApiInfo};
use anyhow::Result;
use convert_case::{Case, Casing};
use regex::Regex;
use std::collections::HashSet;
use std::fs;
use std::path::Path;

/// DTO Rust names conventionally end in `Dto`.  Avoid exposing an awkward
/// `FooDtoDto` type while retaining the established `Foo` -> `FooDto` rule.
fn dto_ts_name(name: &str) -> String {
    if name.ends_with("Dto") {
        name.to_string()
    } else {
        format!("{}Dto", name)
    }
}

fn resolve_wasm_dts_path(output_path: &Path) -> std::path::PathBuf {
    for ancestor in output_path.ancestors() {
        let candidate = ancestor.join("wasm-pkg/wasm_lib.d.ts");
        if candidate.exists() {
            return candidate;
        }
    }

    output_path
        .parent()
        .and_then(Path::parent)
        .and_then(Path::parent)
        .map(|root| root.join("wasm-pkg/wasm_lib.d.ts"))
        .unwrap_or_else(|| Path::new("wasm-pkg/wasm_lib.d.ts").to_path_buf())
}
use tera::{Context, Tera};

fn rust_type_to_ts_wasm(ty: &str) -> Option<String> {
    let mut t = ty.trim().replace(' ', "");
    if t.starts_with("&mut") {
        t = t[4..].to_string();
    } else if t.starts_with('&') {
        t = t[1..].to_string();
    }

    // Result-like return types.
    // Support both fully-qualified and aliased forms, and both `Result<T, E>` and `Result<T>`.
    if let Some(inner) = t
        .strip_prefix("Result<")
        .or_else(|| t.strip_prefix("std::result::Result<"))
        .or_else(|| t.strip_prefix("core::result::Result<"))
        .or_else(|| t.strip_prefix("anyhow::Result<"))
    {
        if t.ends_with('>') {
            let inner = &inner[..inner.len() - 1];
            let ok = inner.split_once(',').map(|(ok, _)| ok).unwrap_or(inner);
            return rust_type_to_ts_wasm(ok);
        }
    }

    if let Some(inner) = t
        .strip_prefix("Vec<")
        .or_else(|| t.strip_prefix("std::vec::Vec<"))
        .or_else(|| t.strip_prefix("alloc::vec::Vec<"))
    {
        if !t.ends_with('>') {
            return None;
        }
        let inner = &inner[..inner.len() - 1];
        return match inner {
            "f64" => Some("Float64Array".to_string()),
            "f32" => Some("Float32Array".to_string()),
            "u8" => Some("Uint8Array".to_string()),
            _ => None,
        };
    }

    // Handle fully-qualified primitives like `std::string::String` by looking at the last segment.
    let last = t.rsplit("::").next().unwrap_or(&t);

    match last {
        "()" => Some("void".to_string()),
        "bool" => Some("boolean".to_string()),
        "String" | "str" | "char" => Some("string".to_string()),
        "f64" | "f32" | "i32" | "u32" | "i16" | "u16" | "i8" | "u8" | "usize" | "isize" => {
            Some("number".to_string())
        }
        // In this SDK we prefer ergonomic number APIs for JS consumers.
        // Large integers may lose precision, but this keeps wrapper generation complete.
        "i64" | "u64" => Some("number".to_string()),
        _ => None,
    }
}

fn is_i64_u64_like(ty: &str) -> bool {
    let mut t = ty.trim().replace(' ', "");
    if t.starts_with("&mut") {
        t = t[4..].to_string();
    } else if t.starts_with('&') {
        t = t[1..].to_string();
    }

    if let Some(inner) = t
        .strip_prefix("Result<")
        .or_else(|| t.strip_prefix("std::result::Result<"))
        .or_else(|| t.strip_prefix("core::result::Result<"))
        .or_else(|| t.strip_prefix("anyhow::Result<"))
    {
        if t.ends_with('>') {
            let inner = &inner[..inner.len() - 1];
            let ok = inner.split_once(',').map(|(ok, _)| ok).unwrap_or(inner);
            return is_i64_u64_like(ok);
        }
    }

    if let Some(inner) = t.strip_prefix("Option<") {
        if t.ends_with('>') {
            let inner = &inner[..inner.len() - 1];
            return is_i64_u64_like(inner);
        }
    }

    let last = t.rsplit("::").next().unwrap_or(&t);
    matches!(last, "i64" | "u64")
}

fn has_public_api_bindings(report: &ApiReport) -> bool {
    report.impl_blocks.iter().any(|b| {
        b.target_struct.ends_with("Api")
            && b.functions
                .iter()
                .any(|f| f.visibility == "pub" && !f.args.iter().any(|a| a.contains("self")))
    })
}

fn rust_type_to_ts(ty: &str, known_structs: &HashSet<String>) -> String {
    let mut t = ty.trim().replace(" ", "");
    if t.starts_with("&mut") {
        t = t[4..].to_string();
    } else if t.starts_with("&") {
        t = t[1..].to_string();
    }

    if t == "()" {
        return "void".to_string();
    }
    if t == "bool" {
        return "boolean".to_string();
    }
    if t == "String" || t == "str" || t == "char" {
        return "string".to_string();
    }
    if t.starts_with("Result<") {
        return rust_type_to_ts(&t[7..t.len() - 1], known_structs);
    }
    if t.starts_with("Option<") {
        return format!(
            "{} | null",
            rust_type_to_ts(&t[7..t.len() - 1], known_structs)
        );
    }
    if t.starts_with("Vec<") {
        return format!("{}[]", rust_type_to_ts(&t[4..t.len() - 1], known_structs));
    }
    if t.starts_with("Box<") {
        return rust_type_to_ts(&t[4..t.len() - 1], known_structs);
    }

    if t == "i64" || t == "u64" || t == "i128" || t == "u128" || t == "usize" || t == "isize" {
        return "number | string".to_string();
    }
    if t == "f32"
        || t == "f64"
        || t == "i32"
        || t == "u32"
        || t == "i16"
        || t == "u16"
        || t == "i8"
        || t == "u8"
    {
        return "number".to_string();
    }

    if known_structs.contains(&t) {
        return dto_ts_name(&t);
    }
    if t == "Self" {
        return "any".to_string();
    }
    "unknown".to_string()
}

fn generate_ts_type_def(s: &StructInfo, known_structs: &HashSet<String>) -> String {
    let ts_name = dto_ts_name(&s.name);
    if !s.enum_variants.is_empty() {
        let mut out = format!("export type {} = \n", ts_name);
        for variant in &s.enum_variants {
            match &variant.fields {
                EnumVariantFields::Unit => {
                    out.push_str(&format!("  | {{ kind: \"{}\" }}\n", variant.name));
                }
                EnumVariantFields::Unnamed(items) if items.len() == 1 => {
                    out.push_str(&format!(
                        "  | {{ kind: \"{}\"; value: {} }}\n",
                        variant.name,
                        dto_ts_type(&items[0])
                    ));
                }
                EnumVariantFields::Unnamed(items) => {
                    out.push_str(&format!(
                        "  | {{ kind: \"{}\"; value: [{}] }}\n",
                        variant.name,
                        items.iter().map(dto_ts_type).collect::<Vec<_>>().join(", ")
                    ));
                }
                EnumVariantFields::Named(fields) => {
                    out.push_str(&format!("  | {{ kind: \"{}\";", variant.name));
                    for field in fields {
                        out.push_str(&format!(
                            " {}: {};",
                            field.name,
                            dto_ts_type(&field.rust_type)
                        ));
                    }
                    out.push_str(" }\n");
                }
            }
        }
        out.push_str(";\n");
        return out;
    }
    let is_enum = s
        .fields
        .iter()
        .any(|f| !f.contains(":") || f.contains("(") || f.contains("{"));

    let mut out = format!("export type {} = \n", ts_name);

    if is_enum {
        for (i, f) in s.fields.iter().enumerate() {
            let prefix = if i == 0 { "  | " } else { "  | " };

            if f.contains("(") {
                let parts: Vec<&str> = f.splitn(2, '(').collect();
                let kind = parts[0].trim();
                let inner = parts[1].trim_end_matches(')').trim();
                let mapped = rust_type_to_ts(inner, known_structs);
                out.push_str(&format!(
                    "{prefix}{{ kind: \"{}\"; value: {} }}\n",
                    kind, mapped
                ));
            } else if f.contains("{") {
                out.push_str(&format!(
                    "{prefix}{{ kind: \"{}\"; value: Record<string, unknown> }}\n",
                    f.split('{').next().unwrap().trim()
                ));
            } else {
                out.push_str(&format!("{prefix}{{ kind: \"{}\" }}\n", f.trim()));
            }
        }
        out.push_str(";\n");
    } else {
        out.push_str("  {\n");
        for f in &s.fields {
            let parts: Vec<&str> = f.splitn(2, ':').collect();
            if parts.len() == 2 {
                let fname = parts[0].trim();
                let ftype = parts[1].trim();
                let ts_type = rust_type_to_ts(ftype, known_structs);
                out.push_str(&format!("    {}: {};\n", fname, ts_type));
            }
        }
        out.push_str("  };\n");
    }
    out
}

fn generate_enabled_dto_type_defs(report: &ApiReport) -> String {
    let dto_names: HashSet<String> = report
        .structs
        .iter()
        .filter(|item| item.dto_candidate && item.dto_enabled)
        .map(|item| item.name.clone())
        .collect();
    report
        .structs
        .iter()
        .filter(|item| item.dto_candidate && item.dto_enabled)
        .map(|item| generate_ts_type_def(item, &dto_names))
        .collect::<Vec<_>>()
        .join("\n")
}

pub fn generate_ts_wrapper(
    report: &ApiReport,
    output_path: &str,
    target_crate: &str,
    known_boundary_types: &[String],
) -> Result<()> {
    let output_path = Path::new(output_path);
    if let Some(parent) = output_path.parent() {
        fs::create_dir_all(parent)?;
    }

    let mut tera = Tera::default();
    let template_wrapper = include_str!("../templates/ts_wrapper.tera");
    let template_stub = include_str!("../templates/ts_wrapper_stub.tera");
    tera.add_raw_template("wrapper", template_wrapper)?;
    tera.add_raw_template("stub", template_stub)?;

    if target_crate != "algebraic" {
        // For non-DTO crates, only overwrite when we can actually generate useful API bindings.
        // This avoids clobbering hand-written wrappers (e.g., statistics/linalg).
        if !has_public_api_bindings(report) {
            if output_path.exists() {
                return Ok(());
            }
            let mut context = Context::new();
            let module_type_name = format!("{}Module", target_crate.to_case(Case::Pascal));
            context.insert("module_name", &module_type_name);
            let code = tera.render("stub", &context)?;
            fs::write(output_path, code)?;
            return Ok(());
        }

        let module_type_name = format!("{}Module", target_crate.to_case(Case::Pascal));
        let mut code = String::new();
        code.push_str("/* eslint-disable */\n/* tslint:disable */\n");
        code.push_str("// --- Auto-generated TypeScript Wrapper (wasm class bindings) ---\n\n");
        code.push_str(&format!(
            "export type {} = typeof import(\"wasm-lib\");\n\n",
            module_type_name
        ));
        code.push_str(&format!(
            "let wasm: {} | null = null;\n\n",
            module_type_name
        ));
        code.push_str(&format!(
            "export function setWasm(module: {}) {{\n    wasm = module;\n}}\n\n",
            module_type_name
        ));
        code.push_str(&format!("export function setWasmFromWasmLib(wasmLib: unknown) {{\n    setWasm(wasmLib as {});\n}}\n\n", module_type_name));
        code.push_str(&format!(
            "function getWasm(): {} {{\n    if (!wasm) {{\n        throw new Error(\"wasm module is not set for {}. Call setWasmFromWasmLib() after wasm initialization.\");\n    }}\n    return wasm;\n}}\n\n",
            module_type_name,
            target_crate.to_case(Case::Pascal)
        ));

        if !report.type_apis.is_empty() {
            let type_api_registry = type_api_codec_registry(report, known_boundary_types);
            code.push_str(&generate_enabled_dto_type_defs(report));
            if report
                .structs
                .iter()
                .any(|item| item.dto_candidate && item.dto_enabled)
            {
                code.push('\n');
            }
            code.push_str(&render_type_api_wasm_interface(
                &module_type_name,
                &report.type_apis,
                &type_api_registry,
            ));
            code.push('\n');
            for api in &report.type_apis {
                code.push_str(&render_type_api_class(api, &type_api_registry));
                code.push('\n');
            }
        }

        for block in &report.impl_blocks {
            if !block.target_struct.ends_with("Api") {
                continue;
            }
            let wasm_class = format!("Wasm{}", block.target_struct);

            for func in &block.functions {
                if func.visibility != "pub" {
                    continue;
                }
                if func.args.iter().any(|a| a.contains("self")) {
                    continue;
                }

                let mut ts_args = Vec::new();
                let mut call_args = Vec::new();
                let mut ok = true;

                for arg_def in &func.args {
                    let parts: Vec<&str> = arg_def.splitn(2, ':').collect();
                    if parts.len() != 2 {
                        ok = false;
                        break;
                    }
                    let arg_name = parts[0].trim();
                    let rust_ty = parts[1].trim();
                    let Some(ts_ty) = rust_type_to_ts_wasm(rust_ty) else {
                        ok = false;
                        break;
                    };
                    let rust_norm = rust_ty.replace(' ', "");
                    let rust_last = rust_norm.rsplit("::").next().unwrap_or(&rust_norm);
                    if rust_last == "u64" || rust_last == "i64" {
                        ts_args.push(format!("{}: number | bigint", arg_name));
                        call_args.push(format!(
                            "(typeof {0} === \"bigint\" ? {0} : BigInt(Math.trunc(Number({0}))))",
                            arg_name
                        ));
                    } else {
                        ts_args.push(format!("{}: {}", arg_name, ts_ty));
                        call_args.push(arg_name.to_string());
                    }
                }
                if !ok {
                    continue;
                }

                let Some(ts_ret) = rust_type_to_ts_wasm(&func.return_type) else {
                    continue;
                };
                let ret_is_i64_u64 = is_i64_u64_like(&func.return_type);
                let ts_name = func.name.to_case(Case::Camel);
                code.push_str(&format!(
                    "export function {}({}): {} {{\n",
                    ts_name,
                    ts_args.join(", "),
                    ts_ret
                ));
                if ts_ret == "void" {
                    code.push_str(&format!(
                        "    getWasm().{}.{}({});\n",
                        wasm_class,
                        func.name,
                        call_args.join(", ")
                    ));
                    code.push_str("}\n\n");
                } else {
                    if ret_is_i64_u64 && ts_ret == "number" {
                        code.push_str(&format!(
                            "    return Number(getWasm().{}.{}({}));\n",
                            wasm_class,
                            func.name,
                            call_args.join(", ")
                        ));
                    } else {
                        code.push_str(&format!(
                            "    return getWasm().{}.{}({});\n",
                            wasm_class,
                            func.name,
                            call_args.join(", ")
                        ));
                    }
                    code.push_str("}\n\n");
                }
            }
        }

        fs::write(output_path, code)?;
        return Ok(());
    }

    let mut known_structs = HashSet::new();
    let mut prefixes = Vec::new();
    for s in &report.structs {
        known_structs.insert(s.name.clone());
        if !s.name.ends_with("Error") && s.name != "Token" {
            prefixes.push((s.name.to_case(Case::Camel), s.name.clone()));
        }
    }

    let mut type_defs = Vec::new();
    for s in &report.structs {
        if s.name.ends_with("Error") || s.name == "Token" {
            continue;
        }
        type_defs.push(generate_ts_type_def(s, &known_structs));
    }

    // Parse wasm_lib.d.ts to find all dynamically generated and handcrafted Wasm exports
    let wasm_dts_path = resolve_wasm_dts_path(Path::new(output_path));
    let wasm_dts_content = fs::read_to_string(wasm_dts_path).unwrap_or_default();
    let re = Regex::new(r"export function ([a-zA-Z0-9_]+)\((.*?)\): (.*?);").unwrap();

    let mut exported_funcs = Vec::new();
    let mut wrapper_funcs = Vec::new();

    for cap in re.captures_iter(&wasm_dts_content) {
        let js_name = cap[1].to_string();
        let args_str = cap[2].to_string();
        let ret_str = cap[3].to_string();

        // Check if this function belongs to one of our crate's structs
        let mut matched_struct = None;
        for (prefix, sname) in &prefixes {
            if js_name.starts_with(prefix) {
                matched_struct = Some((prefix.clone(), sname.clone()));
                break;
            }
        }

        if let Some((_prefix, sname)) = matched_struct {
            exported_funcs.push(js_name.clone());

            let ts_dto_type = dto_ts_name(&sname);

            let mut ts_args = Vec::new();
            let mut call_args = Vec::new();

            let args_split: Vec<&str> = args_str
                .split(',')
                .map(|s| s.trim())
                .filter(|s| !s.is_empty())
                .collect();
            for arg_raw in args_split {
                let parts: Vec<&str> = arg_raw.split(':').collect();
                if parts.len() == 2 {
                    let name = parts[0].trim();
                    let mut ty = parts[1].trim().to_string();

                    // Upgrade `any` to DTO type if it looks like a DTO
                    if ty == "any" {
                        // Just use the matched struct DTO type as a good fallback for generic `any` values
                        ty = ts_dto_type.clone();
                        if name.contains("terms")
                            || name.contains("factors")
                            || name.contains("array")
                        {
                            ty = format!("{}[]", ty);
                        }
                    }
                    if name.contains("numer")
                        || name.contains("denom")
                        || name.contains("n")
                        || name.contains("d")
                    {
                        if ty == "bigint" || ty == "number" {
                            ty = "number | string".to_string();
                        }
                    }

                    ts_args.push(format!("{}: {}", name, ty));
                    call_args.push(format!("{} as any", name));
                }
            }

            let mut ret_type = ret_str.trim().to_string();
            if ret_type == "any" {
                // Return type heuristics based on naming
                if js_name.contains("Format") || js_name.contains("ToLatex") {
                    ret_type = "string".to_string();
                } else if js_name.contains("Is") {
                    ret_type = "boolean".to_string();
                } else {
                    ret_type = ts_dto_type.clone();
                }
            }

            let call = if ret_type != "void" && ret_type != "unknown" {
                format!(
                    "return getWasm().{}({}) as unknown as {};",
                    js_name,
                    call_args.join(", "),
                    ret_type
                )
            } else {
                format!("getWasm().{}({});", js_name, call_args.join(", "))
            };

            let func_str = format!(
                "export function {}({}) {{\n  {}\n}}",
                js_name,
                ts_args.join(", "),
                call
            );
            wrapper_funcs.push(func_str);
        }
    }

    let module_type_name = format!("{}DtoModule", target_crate.to_case(Case::Pascal));
    let mut context = Context::new();
    context.insert("type_defs", &type_defs);
    context.insert("module_name", &module_type_name);
    context.insert("exported_funcs", &exported_funcs);
    context.insert("wrapper_funcs", &wrapper_funcs);

    let code = tera.render("wrapper", &context)?;
    fs::write(output_path, code)?;

    Ok(())
}

fn type_api_codec_registry(report: &ApiReport, known_boundary_types: &[String]) -> CodecRegistry {
    let mut boundary_types: Vec<String> = report.structs.iter().map(|s| s.name.clone()).collect();
    boundary_types.extend(known_boundary_types.iter().cloned());
    boundary_types.extend(
        report
            .type_apis
            .iter()
            .filter_map(|api| api.target_type.base_ident().map(str::to_owned)),
    );
    let dto_types = report
        .structs
        .iter()
        .filter(|item| item.dto_candidate && item.dto_enabled)
        .map(|item| item.name.clone())
        .collect::<Vec<_>>();
    CodecRegistry::with_dto_types(boundary_types, dto_types)
}

fn render_type_api_wasm_interface(
    module_type_name: &str,
    apis: &[TypeApiInfo],
    registry: &CodecRegistry,
) -> String {
    let mut code = String::new();
    code.push_str("type TypeApiWasmBindings = {\n");
    for api in apis {
        for func in &api.functions {
            if func.visibility != "pub" {
                continue;
            }
            if let Some(signature) = render_type_api_wasm_signature(api, func, registry) {
                code.push_str(&signature);
            } else {
                eprintln!(
                    "[inspector] skipped Type API TypeScript binding {}::{}; see api-specs/*/unsupported for the boundary reason",
                    api.api_struct, func.name
                );
            }
        }
    }
    code.push_str("};\n\n");
    code.push_str(&format!(
        "function getTypeApiWasm(): {} & TypeApiWasmBindings {{\n    return getWasm() as {} & TypeApiWasmBindings;\n}}\n",
        module_type_name, module_type_name
    ));
    code.push_str(
        r#"
function normalizeDtoValue<T>(value: T): T {
    if (value instanceof Map) {
        return Object.fromEntries(Array.from(value.entries(), ([key, item]) => [String(key), normalizeDtoValue(item)])) as T;
    }
    if (Array.isArray(value)) {
        return value.map((item) => normalizeDtoValue(item)) as T;
    }
    if (value && typeof value === "object" && !ArrayBuffer.isView(value)) {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeDtoValue(item)])) as T;
    }
    return value;
}
"#,
    );
    code
}

fn render_type_api_wasm_signature(
    api: &TypeApiInfo,
    func: &FunctionInfo,
    registry: &CodecRegistry,
) -> Option<String> {
    let args = func.boundary_args();
    if args.len() != func.args.len() || args.iter().any(|arg| arg.is_receiver) {
        return None;
    }
    let is_instance = args
        .first()
        .is_some_and(|arg| is_type_api_target(api, &arg.rust_type));

    let public_args = if is_instance { &args[1..] } else { &args[..] };
    let mut wasm_args = Vec::new();

    if is_instance {
        let target_type = &args[0].rust_type;
        let CodecPlan::Supported(codec) = registry.classify_arg(target_type) else {
            return None;
        };
        wasm_args.push(format!("value: {}", codec.ts_input_type));
    }

    for arg in public_args {
        let CodecPlan::Supported(codec) = registry.classify_arg(&arg.rust_type) else {
            return None;
        };
        if matches!(codec.kind, BoundaryKind::StringBoundary) {
            wasm_args.push(format!("{}: string", arg.name));
        } else {
            wasm_args.push(format!(
                "{}: {}",
                arg.name,
                type_api_public_ts_type(&arg.rust_type, &codec, true)
            ));
        }
    }

    let ret_ty = func.boundary_return();
    let wasm_ret = type_api_wasm_return(api, &ret_ty, registry)?;
    let wasm_func = type_api_export_name(api, &func.name);

    Some(format!(
        "    {}({}): {};\n",
        wasm_func,
        wasm_args.join(", "),
        wasm_ret
    ))
}

fn type_api_wasm_return(
    api: &TypeApiInfo,
    ty: &RustType,
    registry: &CodecRegistry,
) -> Option<String> {
    let value_ty = match ty {
        RustType::Result { ok, .. } => ok.as_ref(),
        _ => ty,
    };
    if matches!(value_ty, RustType::Unit) {
        return Some("void".to_string());
    }
    if is_type_api_target(api, value_ty) {
        return match registry.classify_return(value_ty) {
            CodecPlan::Supported(codec) => Some(codec.ts_output_type),
            CodecPlan::Unsupported(_) => None,
        };
    }
    match registry.classify_return(value_ty) {
        CodecPlan::Supported(codec) if matches!(codec.kind, BoundaryKind::StringBoundary) => {
            Some("string".to_string())
        }
        CodecPlan::Supported(codec) => Some(type_api_public_ts_type(ty, &codec, false)),
        CodecPlan::Unsupported(_) => None,
    }
}

fn render_type_api_class(api: &TypeApiInfo, registry: &CodecRegistry) -> String {
    let mut code = String::new();
    let target_is_dto = matches!(
        registry.classify_arg(&api.target_type),
        CodecPlan::Supported(ref codec) if matches!(codec.mode, BoundaryMode::Dto)
    );
    let dto_type = api
        .target_type
        .base_ident()
        .map(dto_ts_name)
        .unwrap_or_else(|| dto_ts_name(&api.ts_name));
    code.push_str(&format!("export class {} {{\n", api.ts_name));
    if target_is_dto {
        code.push_str(&format!(
            "    private constructor(private readonly raw: {}) {{}}\n\n",
            dto_type
        ));
        code.push_str(&format!(
            "    static fromDto(value: {}): {} {{\n        return new {}(value);\n    }}\n\n",
            dto_type, api.ts_name, api.ts_name
        ));
        code.push_str(&format!(
            "    toDto(): {} {{\n        return this.raw;\n    }}\n\n",
            dto_type
        ));
    } else {
        code.push_str("    private constructor(private readonly raw: string) {}\n\n");
        code.push_str(&format!(
            "    static fromString(value: string): {} {{\n        return new {}(value);\n    }}\n\n",
            api.ts_name, api.ts_name
        ));
        code.push_str("    toString(): string {\n        return this.raw;\n    }\n\n");
    }

    for func in &api.functions {
        if func.visibility != "pub" {
            continue;
        }
        if let Some(method) = render_type_api_method(api, func, registry) {
            code.push_str(&method);
            code.push('\n');
        } else {
            eprintln!(
                "[inspector] skipped Type API TypeScript method {}::{}; see api-specs/*/unsupported for the boundary reason",
                api.api_struct, func.name
            );
        }
    }

    code.push_str("}\n");
    code
}

fn render_type_api_method(
    api: &TypeApiInfo,
    func: &FunctionInfo,
    registry: &CodecRegistry,
) -> Option<String> {
    let args = func.boundary_args();
    if args.len() != func.args.len() || args.iter().any(|arg| arg.is_receiver) {
        return None;
    }
    let is_instance = args
        .first()
        .is_some_and(|arg| is_type_api_target(api, &arg.rust_type));

    let public_args = if is_instance { &args[1..] } else { &args[..] };
    let mut ts_args = Vec::new();
    let mut call_args = Vec::new();
    let target_is_dto = matches!(
        registry.classify_arg(&api.target_type),
        CodecPlan::Supported(ref codec) if matches!(codec.mode, BoundaryMode::Dto)
    );

    if is_instance {
        call_args.push("this.raw".to_string());
    }

    for arg in public_args {
        if is_type_api_target(api, &arg.rust_type) {
            ts_args.push(format!("{}: {}", arg.name, api.ts_name));
            call_args.push(if target_is_dto {
                format!("{}.toDto()", arg.name)
            } else {
                format!("{}.toString()", arg.name)
            });
        } else {
            let CodecPlan::Supported(codec) = registry.classify_arg(&arg.rust_type) else {
                return None;
            };
            ts_args.push(format!(
                "{}: {}",
                arg.name,
                type_api_public_ts_type(&arg.rust_type, &codec, true)
            ));
            let call_arg = if matches!(codec.kind, BoundaryKind::BigIntPrimitive) {
                format!(
                    "typeof {0} === \"bigint\" ? {0} : BigInt(Math.trunc({0}))",
                    arg.name
                )
            } else {
                arg.name.clone()
            };
            call_args.push(call_arg);
        }
    }

    let ret_ty = func.boundary_return();
    let (ts_ret, wrap_return) = type_api_ts_return(api, &ret_ty, registry)?;
    let dto_nullable_return = matches!(
        match &ret_ty {
            RustType::Result { ok, .. } => ok.as_ref(),
            other => other,
        },
        RustType::Option(_)
    ) && matches!(registry.classify_return(&ret_ty), CodecPlan::Supported(ref codec) if matches!(codec.mode, BoundaryMode::Dto));
    let dto_return = matches!(
        registry.classify_return(&ret_ty),
        CodecPlan::Supported(ref codec) if matches!(codec.mode, BoundaryMode::Dto)
    );
    let wasm_func = type_api_export_name(api, &func.name);
    let ts_name = func.name.to_case(Case::Camel);
    let prefix = if is_instance { "" } else { "static " };

    let mut code = String::new();
    code.push_str(&format!(
        "    {}{}({}): {} {{\n",
        prefix,
        ts_name,
        ts_args.join(", "),
        ts_ret
    ));
    match wrap_return {
        TypeApiReturnWrap::Class => {
            let factory = if target_is_dto {
                "fromDto"
            } else {
                "fromString"
            };
            let value = if dto_return {
                format!(
                    "normalizeDtoValue(getTypeApiWasm().{}({}))",
                    wasm_func,
                    call_args.join(", ")
                )
            } else {
                format!("getTypeApiWasm().{}({})", wasm_func, call_args.join(", "))
            };
            code.push_str(&format!(
                "        return {}.{}({});\n",
                api.ts_name, factory, value
            ));
        }
        TypeApiReturnWrap::String => {
            code.push_str(&format!(
                "        return getTypeApiWasm().{}({});\n",
                wasm_func,
                call_args.join(", ")
            ));
        }
        TypeApiReturnWrap::Native => {
            if dto_nullable_return {
                code.push_str(&format!(
                    "        return (normalizeDtoValue(getTypeApiWasm().{}({})) ?? null) as {};\n",
                    wasm_func,
                    call_args.join(", "),
                    ts_ret
                ));
            } else if dto_return {
                code.push_str(&format!(
                    "        return normalizeDtoValue(getTypeApiWasm().{}({}));\n",
                    wasm_func,
                    call_args.join(", ")
                ));
            } else {
                code.push_str(&format!(
                    "        return getTypeApiWasm().{}({});\n",
                    wasm_func,
                    call_args.join(", ")
                ));
            }
        }
        TypeApiReturnWrap::Void => {
            code.push_str(&format!(
                "        getTypeApiWasm().{}({});\n",
                wasm_func,
                call_args.join(", ")
            ));
        }
    }
    code.push_str("    }\n");
    Some(code)
}

enum TypeApiReturnWrap {
    Class,
    String,
    Native,
    Void,
}

fn type_api_ts_return(
    api: &TypeApiInfo,
    ty: &RustType,
    registry: &CodecRegistry,
) -> Option<(String, TypeApiReturnWrap)> {
    match ty {
        RustType::Result { ok, .. } => type_api_ts_return(api, ok, registry),
        RustType::Unit => Some(("void".to_string(), TypeApiReturnWrap::Void)),
        _ if is_type_api_target(api, ty) => Some((api.ts_name.clone(), TypeApiReturnWrap::Class)),
        _ => match registry.classify_return(ty) {
            CodecPlan::Supported(codec) if matches!(codec.kind, BoundaryKind::StringBoundary) => {
                Some(("string".to_string(), TypeApiReturnWrap::String))
            }
            CodecPlan::Supported(codec) => Some((
                type_api_public_ts_type(ty, &codec, false),
                TypeApiReturnWrap::Native,
            )),
            CodecPlan::Unsupported(_) => None,
        },
    }
}

fn type_api_public_ts_type(
    ty: &RustType,
    codec: &crate::codec::BoundaryCodec,
    input: bool,
) -> String {
    if !matches!(codec.mode, BoundaryMode::Dto) {
        return if input {
            codec.ts_input_type.clone()
        } else {
            codec.ts_output_type.clone()
        };
    }
    dto_ts_type(ty)
}

/// The registry owns the decision to use DTO transport. This renderer only
/// turns an already-approved DTO Rust shape into the public TS spelling.
fn dto_ts_type(ty: &RustType) -> String {
    match ty.without_reference() {
        RustType::Unit => "void".to_string(),
        RustType::Primitive(RustPrimitive::Bool) => "boolean".to_string(),
        RustType::Primitive(RustPrimitive::I64 | RustPrimitive::U64) => {
            "number | bigint".to_string()
        }
        RustType::Primitive(_) => "number".to_string(),
        RustType::String | RustType::Str => "string".to_string(),
        RustType::Option(inner) => format!("{} | null", dto_ts_type(inner)),
        RustType::Vec(inner) => format!("{}[]", dto_ts_type(inner)),
        RustType::Array { inner, .. } => format!("{}[]", dto_ts_type(inner)),
        RustType::Tuple(items) => format!(
            "[{}]",
            items.iter().map(dto_ts_type).collect::<Vec<_>>().join(", ")
        ),
        RustType::Result { ok, .. } => dto_ts_type(ok),
        RustType::Path(path) if matches!(path.last_segment(), Some("Box")) => path
            .args
            .first()
            .map(dto_ts_type)
            .unwrap_or_else(|| "unknown".to_string()),
        RustType::Path(path) if matches!(path.last_segment(), Some("HashMap" | "BTreeMap")) => path
            .args
            .get(1)
            .map(|value| format!("Record<string, {}>", dto_ts_type(value)))
            .unwrap_or_else(|| "Record<string, unknown>".to_string()),
        RustType::Path(path) => path
            .last_segment()
            .map(dto_ts_name)
            .unwrap_or_else(|| "unknown".to_string()),
        _ => "unknown".to_string(),
    }
}
