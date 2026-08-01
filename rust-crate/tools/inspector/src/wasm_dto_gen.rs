use crate::types::ApiReport;
use anyhow::Result;
use convert_case::{Case, Casing};
use regex::Regex;
use serde::Serialize;
use std::collections::HashSet;
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize)]
pub struct DtoExportGenReport {
    pub crate_name: String,
    pub dto_module_file: String,
    pub output_file: String,
    pub note_missing_dto_module: bool,
    pub note_patched_include: bool,
    pub generated: Vec<String>,
    pub skipped_collision: Vec<String>,
    pub skipped_unsupported: Vec<SkippedItem>,
}

#[derive(Debug, Serialize)]
pub struct SkippedItem {
    pub target_struct: String,
    pub function_name: String,
    pub reason: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum ReceiverKind {
    None,
    Ref,
    MutRef,
    Value,
    MutValue,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum Ty {
    Unit,
    Bool,
    String,
    StrRef,
    I64,
    U64,
    SelfType,
    Named(String),
    Vec(Box<Ty>),
    Boxed(Box<Ty>),
    Ref(Box<Ty>),
    MutRef(Box<Ty>),
    Unknown(String),
}

fn norm(s: &str) -> String {
    s.split_whitespace().collect::<String>()
}

fn parse_type(raw: &str) -> Ty {
    let s = norm(raw);
    if s == "()" {
        return Ty::Unit;
    }
    if s == "&str" {
        return Ty::StrRef;
    }
    if s.starts_with("&mut") {
        return Ty::MutRef(Box::new(parse_type(&s[4..])));
    }
    if s.starts_with('&') {
        return Ty::Ref(Box::new(parse_type(&s[1..])));
    }
    if s.starts_with("Vec<") && s.ends_with('>') {
        let inner = &s[4..s.len() - 1];
        return Ty::Vec(Box::new(parse_type(inner)));
    }
    if s.starts_with("Box<") && s.ends_with('>') {
        let inner = &s[4..s.len() - 1];
        return Ty::Boxed(Box::new(parse_type(inner)));
    }

    match s.as_str() {
        "bool" => Ty::Bool,
        "String" => Ty::String,
        "i64" => Ty::I64,
        "u64" => Ty::U64,
        "Self" => Ty::SelfType,
        _ => Ty::Named(s),
    }
}

fn parse_receiver(arg: &str) -> Option<ReceiverKind> {
    match arg.trim() {
        "& self" => Some(ReceiverKind::Ref),
        "& mut self" => Some(ReceiverKind::MutRef),
        "self" => Some(ReceiverKind::Value),
        "mut self" => Some(ReceiverKind::MutValue),
        _ => None,
    }
}

#[derive(Debug, Clone)]
struct ParsedArg {
    name: String,
    ty: Ty,
}

fn parse_named_arg(arg: &str) -> Option<ParsedArg> {
    let trimmed = arg.trim();
    let mut parts = trimmed.splitn(2, ':');
    let name = parts.next()?.trim().to_string();
    let ty_raw = parts.next()?.trim();
    Some(ParsedArg {
        name,
        ty: parse_type(ty_raw),
    })
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum Ret {
    Unit,
    Bool,
    String,
    I64,
    U64,
    SelfType,
    Named(String),
    Result(Box<Ret>),
    Unknown(String),
}

fn parse_return_type(raw: &str, target_struct: &str) -> Ret {
    let s = norm(raw);
    if s == "()" {
        return Ret::Unit;
    }
    if s.starts_with("Result<") && s.ends_with('>') {
        let inner = &s[7..s.len() - 1];
        return Ret::Result(Box::new(parse_return_type(inner, target_struct)));
    }

    match s.as_str() {
        "bool" => Ret::Bool,
        "String" => Ret::String,
        "i64" => Ret::I64,
        "u64" => Ret::U64,
        "Self" => Ret::SelfType,
        other if other == target_struct => Ret::SelfType,
        _ => Ret::Named(s),
    }
}

fn dto_type_name(rust_type: &str) -> String {
    format!("{}Dto", rust_type)
}

fn from_dto_fn_name(rust_type: &str) -> String {
    format!("{}_from_dto", rust_type.to_case(Case::Snake))
}

fn to_dto_fn_name(rust_type: &str) -> String {
    format!("{}_to_dto", rust_type.to_case(Case::Snake))
}

fn type_prefixes(target_struct: &str) -> (String, String) {
    let type_snake = target_struct.to_case(Case::Snake);
    let type_js_prefix = target_struct.to_case(Case::Camel);
    (type_snake, type_js_prefix)
}

fn scan_reserved_fn_names(dto_module_code: &str) -> HashSet<String> {
    let re = Regex::new(r"\bpub\s+fn\s+([A-Za-z_][A-Za-z0-9_]*)\b").unwrap();
    re.captures_iter(dto_module_code)
        .filter_map(|c| c.get(1).map(|m| m.as_str().to_string()))
        .collect()
}

fn ensure_exports_include(dto_module_path: &Path, crate_name: &str) -> Result<bool> {
    let include_line = format!("include!(\"{}_dto.exports.generated.rs\");", crate_name);
    let mut code = fs::read_to_string(dto_module_path)?;

    if code.contains(&include_line) {
        return Ok(false);
    }

    if !code.ends_with('\n') {
        code.push('\n');
    }
    code.push_str("\n// --- Generated exports from api-specs (auto) ---\n");
    code.push_str(&format!(
        "// The inspector pipeline writes this file at build time for '{crate_name}'.\n"
    ));
    code.push_str(&include_line);
    code.push('\n');
    fs::write(dto_module_path, code)?;
    Ok(true)
}

fn render_conversion_from_jsvalue(
    arg_name: &str,
    ty: &Ty,
    known_structs: &HashSet<String>,
) -> Option<(String, String)> {
    // Returns: (decode_stmt(s), rust_expr_for_call)
    match ty {
        Ty::I64 => Some((
            format!("{arg_name}_i64"),
            format!("i64_from_str({arg_name})?"),
        )),
        Ty::U64 => Some((
            format!("{arg_name}_u64"),
            format!("u64_from_str({arg_name})?"),
        )),
        Ty::String => Some((arg_name.to_string(), arg_name.to_string())),
        Ty::StrRef => Some((arg_name.to_string(), arg_name.to_string())),
        Ty::Bool => Some((arg_name.to_string(), arg_name.to_string())),
        Ty::SelfType => None,
        Ty::Named(name) if known_structs.contains(name) => {
            let dto = dto_type_name(name);
            let from = from_dto_fn_name(name);
            let decode = format!(
                "let {arg_name}_dto: {dto} = serde_wasm_bindgen::from_value({arg_name}_value).map_err(js_error_from_serde)?;\n    let {arg_name}_rust = {from}(&{arg_name}_dto)?;"
            );
            Some((decode, format!("{arg_name}_rust")))
        }
        Ty::Ref(inner) => {
            let (decode, call) = render_conversion_from_jsvalue(arg_name, inner, known_structs)?;
            Some((decode, format!("&{call}")))
        }
        Ty::MutRef(inner) => {
            let (decode, call) = render_conversion_from_jsvalue(arg_name, inner, known_structs)?;
            Some((decode, format!("&mut {call}")))
        }
        Ty::Vec(inner) => match inner.as_ref() {
            Ty::Named(n) if known_structs.contains(n) => {
                let dto = dto_type_name(n);
                let from = from_dto_fn_name(n);
                let decode = format!(
                        "let {arg_name}_dto: Vec<{dto}> = serde_wasm_bindgen::from_value({arg_name}_value).map_err(js_error_from_serde)?;\n    let {arg_name}_rust = {arg_name}_dto.iter().map({from}).collect::<Result<Vec<_>, _>>()?;"
                    );
                Some((decode, format!("{arg_name}_rust")))
            }
            _ => None,
        },
        _ => None,
    }
}

fn render_return_conversion(
    ret: &Ret,
    target_struct: &str,
    out_expr: &str,
    fallible: bool,
    known_structs: &HashSet<String>,
) -> Option<String> {
    let wrap_err = if fallible {
        ".map_err(|e| js_error_from_to_app_error(e, None))?"
    } else {
        ""
    };

    match ret {
        Ret::Unit => Some("Ok(())".to_string()),
        Ret::Bool | Ret::String => Some(format!("Ok({out_expr})")),
        Ret::I64 | Ret::U64 => Some(format!("Ok({out_expr}.to_string())")),
        Ret::SelfType => {
            let to_dto = to_dto_fn_name(target_struct);
            Some(format!(
                "serde_wasm_bindgen::to_value(&{to_dto}(&{out_expr})).map_err(js_error_from_serde)"
            ))
        }
        Ret::Named(name) if known_structs.contains(name) => {
            let to_dto = to_dto_fn_name(name);
            Some(format!(
                "serde_wasm_bindgen::to_value(&{to_dto}(&{out_expr})).map_err(js_error_from_serde)"
            ))
        }
        Ret::Result(inner) => {
            // Result<T>: map Err to JsError and then convert the Ok value.
            let inner_conv =
                render_return_conversion(inner, target_struct, "out", false, known_structs)?;
            Some(format!(
                "{{\n    let out = {out_expr}{wrap_err};\n    {inner_conv}\n}}"
            ))
        }
        _ => None,
    }
}

pub fn generate_wasm_dto_exports(
    report: &ApiReport,
    dto_module_file: &str,
    output_file: &str,
    crate_name: &str,
) -> Result<DtoExportGenReport> {
    let dto_module_path = Path::new(dto_module_file);
    if !dto_module_path.exists() {
        let report = DtoExportGenReport {
            crate_name: crate_name.to_string(),
            dto_module_file: dto_module_file.to_string(),
            output_file: output_file.to_string(),
            note_missing_dto_module: true,
            note_patched_include: false,
            generated: Vec::new(),
            skipped_collision: Vec::new(),
            skipped_unsupported: Vec::new(),
        };

        if let Some(parent) = Path::new(output_file).parent() {
            fs::create_dir_all(parent)?;
        }
        let report_path = format!("{}.report.json", output_file);
        fs::write(report_path, serde_json::to_string_pretty(&report)?)?;
        return Ok(report);
    }

    let dto_module_code = fs::read_to_string(dto_module_path)?;
    let reserved_fn_names = scan_reserved_fn_names(&dto_module_code);
    let note_patched_include = ensure_exports_include(dto_module_path, crate_name)?;

    let mut reserved = HashSet::<String>::new();
    reserved.extend(reserved_fn_names);

    let mut generated = Vec::new();
    let mut skipped_collision = Vec::new();
    let mut skipped_unsupported = Vec::new();

    let mut known_structs = HashSet::<String>::new();
    for block in &report.impl_blocks {
        if block.crate_name == crate_name {
            known_structs.insert(block.target_struct.clone());
        }
    }

    let mut code = String::new();
    code.push_str("// --- Auto-generated by inspector (dto exports) ---\n");
    code.push_str(&format!(
        "// This file is included from wasm/src/{}_dto.rs.\n",
        crate_name
    ));
    code.push_str("// Do not edit by hand.\n\n");

    for block in &report.impl_blocks {
        if block.crate_name != crate_name {
            continue;
        }
        let (type_snake, type_js_prefix) = type_prefixes(&block.target_struct);

        for func in &block.functions {
            if func.visibility != "pub" {
                continue;
            }

            let ret = parse_return_type(&func.return_type, &block.target_struct);

            let mut receiver = ReceiverKind::None;
            let mut args = Vec::new();
            for a in &func.args {
                if let Some(r) = parse_receiver(a) {
                    receiver = r;
                    continue;
                }
                if let Some(na) = parse_named_arg(a) {
                    args.push(na);
                } else {
                    skipped_unsupported.push(SkippedItem {
                        target_struct: block.target_struct.clone(),
                        function_name: func.name.clone(),
                        reason: format!("Unsupported arg format: '{a}'"),
                    });
                }
            }

            let fn_name = format!("{type_snake}_{}_dto", func.name);
            if reserved.contains(&fn_name) {
                skipped_collision.push(format!(
                    "{}::{} -> {}",
                    block.target_struct, func.name, fn_name
                ));
                continue;
            }

            // Build wasm-bindgen js_name.
            let js_name = format!("{}{}Dto", type_js_prefix, func.name.to_case(Case::Pascal));

            // Build signature.
            let mut sig_args = Vec::new();
            let mut decode_stmts = Vec::new();
            let mut call_args = Vec::new();
            let mut is_supported = true;

            if receiver != ReceiverKind::None {
                let dto = dto_type_name(&block.target_struct);
                let from = from_dto_fn_name(&block.target_struct);
                let self_binding = match receiver {
                    ReceiverKind::MutRef => {
                        decode_stmts.push(format!(
                            "let self_dto: {dto} = serde_wasm_bindgen::from_value(self_value).map_err(js_error_from_serde)?;\n    let mut self_rust = {from}(&self_dto)?;"
                        ));
                        "self_rust".to_string()
                    }
                    _ => {
                        decode_stmts.push(format!(
                            "let self_dto: {dto} = serde_wasm_bindgen::from_value(self_value).map_err(js_error_from_serde)?;\n    let self_rust = {from}(&self_dto)?;"
                        ));
                        "self_rust".to_string()
                    }
                };
                sig_args.push("self_value: JsValue".to_string());
                call_args.push(self_binding);
            }

            for arg in &args {
                let arg_ty = &arg.ty;

                match arg_ty {
                    Ty::StrRef => {
                        sig_args.push(format!("{}: &str", arg.name));
                        call_args.push(arg.name.clone());
                    }
                    Ty::String => {
                        sig_args.push(format!("{}: String", arg.name));
                        call_args.push(arg.name.clone());
                    }
                    Ty::I64 | Ty::U64 => {
                        // Policy v1: 64-bit ints cross the boundary as decimal strings.
                        sig_args.push(format!("{}: &str", arg.name));
                        // decode happens inline in call_args via helper parse.
                        let (_, call) =
                            render_conversion_from_jsvalue(&arg.name, arg_ty, &known_structs)
                                .unwrap_or((String::new(), arg.name.clone()));
                        call_args.push(call);
                    }
                    Ty::Bool => {
                        sig_args.push(format!("{}: bool", arg.name));
                        call_args.push(arg.name.clone());
                    }
                    _ => {
                        // DTO-ish values are passed as JsValue.
                        sig_args.push(format!("{}_value: JsValue", arg.name));
                        let Some((decode, call)) =
                            render_conversion_from_jsvalue(&arg.name, arg_ty, &known_structs)
                        else {
                            skipped_unsupported.push(SkippedItem {
                                target_struct: block.target_struct.clone(),
                                function_name: func.name.clone(),
                                reason: format!("Unsupported arg type: '{:?}'", arg_ty),
                            });
                            is_supported = false;
                            break;
                        };
                        decode_stmts.push(decode);
                        call_args.push(call);
                    }
                }
            }

            if !is_supported {
                continue;
            }

            // Generate call expression.
            let call_expr = if receiver == ReceiverKind::None {
                format!(
                    "{}::{}({})",
                    block.target_struct,
                    func.name,
                    call_args.join(", ")
                )
            } else {
                // receiver is the first element in call_args
                let self_expr = call_args
                    .first()
                    .cloned()
                    .unwrap_or_else(|| "self_rust".to_string());
                let rest = call_args
                    .iter()
                    .skip(1)
                    .cloned()
                    .collect::<Vec<_>>()
                    .join(", ");
                if rest.is_empty() {
                    format!("{self_expr}.{}()", func.name)
                } else {
                    format!("{self_expr}.{}({rest})", func.name)
                }
            };

            // Choose return type + conversion.
            let (rust_ret_ty, body) = match (&ret, receiver) {
                (Ret::Unit, ReceiverKind::MutRef | ReceiverKind::MutValue) => {
                    // B-1: in-place ops return a new DTO.
                    let to = to_dto_fn_name(&block.target_struct);
                    (
                        "JsValue".to_string(),
                        format!(
                            "{call_expr};\n    serde_wasm_bindgen::to_value(&{to}(&self_rust)).map_err(js_error_from_serde)"
                        ),
                    )
                }
                (Ret::Result(_), _) => {
                    // Fallible: map error and then convert.
                    let conv = render_return_conversion(
                        &ret,
                        &block.target_struct,
                        &call_expr,
                        true,
                        &known_structs,
                    );
                    let Some(conv) = conv else {
                        skipped_unsupported.push(SkippedItem {
                            target_struct: block.target_struct.clone(),
                            function_name: func.name.clone(),
                            reason: format!("Unsupported return type: '{}'", func.return_type),
                        });
                        continue;
                    };
                    // The conversion already yields a Result<...> expression.
                    // We need to infer return type from the top-level conversion.
                    let rust_ret_ty = match ret {
                        Ret::Result(inner) => match inner.as_ref() {
                            Ret::Bool => "bool",
                            Ret::String => "String",
                            Ret::I64 | Ret::U64 => "String",
                            Ret::SelfType | Ret::Named(_) => "JsValue",
                            Ret::Unit => "()",
                            _ => "JsValue",
                        },
                        _ => "JsValue",
                    }
                    .to_string();
                    (rust_ret_ty, conv)
                }
                _ => {
                    let conv = render_return_conversion(
                        &ret,
                        &block.target_struct,
                        &call_expr,
                        false,
                        &known_structs,
                    );
                    let Some(conv) = conv else {
                        skipped_unsupported.push(SkippedItem {
                            target_struct: block.target_struct.clone(),
                            function_name: func.name.clone(),
                            reason: format!("Unsupported return type: '{}'", func.return_type),
                        });
                        continue;
                    };
                    let rust_ret_ty = match ret {
                        Ret::Unit => "()",
                        Ret::Bool => "bool",
                        Ret::String => "String",
                        Ret::I64 | Ret::U64 => "String",
                        Ret::SelfType | Ret::Named(_) => "JsValue",
                        Ret::Result(_) => "JsValue",
                        Ret::Unknown(_) => "JsValue",
                    }
                    .to_string();

                    (rust_ret_ty, conv)
                }
            };

            // Render function.
            code.push_str(&format!("#[wasm_bindgen(js_name = {js_name})]\n"));
            code.push_str(&format!(
                "pub fn {fn_name}({}) -> Result<{rust_ret_ty}, JsError> {{\n",
                sig_args.join(", ")
            ));
            if !decode_stmts.is_empty() {
                code.push_str("    ");
                code.push_str(&decode_stmts.join("\n\n    "));
                code.push_str("\n\n");
            }
            code.push_str("    ");
            code.push_str(&body);
            code.push_str("\n}\n\n");

            generated.push(format!(
                "{}::{} -> {} ({})",
                block.target_struct, func.name, fn_name, js_name
            ));

            reserved.insert(fn_name);
        }
    }

    // Ensure output directory exists.
    if let Some(parent) = Path::new(output_file).parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(output_file, code)?;

    let report = DtoExportGenReport {
        crate_name: crate_name.to_string(),
        dto_module_file: dto_module_file.to_string(),
        output_file: output_file.to_string(),
        note_missing_dto_module: false,
        note_patched_include,
        generated,
        skipped_collision,
        skipped_unsupported,
    };

    let report_path = format!("{}.report.json", output_file);
    fs::write(report_path, serde_json::to_string_pretty(&report)?)?;

    Ok(report)
}
