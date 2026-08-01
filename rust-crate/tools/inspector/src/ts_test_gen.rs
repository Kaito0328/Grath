use crate::codec::{
    is_type_api_target, BoundaryCodec, BoundaryKind, BoundaryMode, CodecPlan, CodecRegistry, RustPrimitive,
    RustType,
};
use crate::notion::model::TestCaseYaml;
use crate::types::{ApiReport, FunctionArgInfo, FunctionInfo, TypeApiInfo};
use anyhow::Result;
use convert_case::{Case, Casing};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

fn is_vec_like_return(ret: &str) -> bool {
    let t = ret.trim().replace(' ', "");
    t.starts_with("Vec<") || t.starts_with("Result<Vec<")
}

fn escape_ts_literal(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"")
}

fn is_json_string_expected(return_type: &str, expected: &str) -> bool {
    let ret = return_type.trim().replace(' ', "");
    let expected = expected.trim();
    let is_string_like = ret == "String"
        || ret.starts_with("Result<String>")
        || ret.starts_with("std::result::Result<String>");
    let is_json_like = (expected.starts_with('{') && expected.ends_with('}'))
        || (expected.starts_with('[') && expected.ends_with(']'));
    is_string_like && is_json_like && !expected.contains("\\\"")
}

pub fn generate_ts_test(
    report: &ApiReport,
    yaml_path: &str,
    output_path: &str,
    target_crate: &str,
) -> Result<()> {
    generate_ts_test_with_boundary_types(report, yaml_path, output_path, target_crate, &[])
}

pub fn generate_ts_test_with_boundary_types(
    report: &ApiReport,
    yaml_path: &str,
    output_path: &str,
    target_crate: &str,
    known_boundary_types: &[String],
) -> Result<()> {
    if !Path::new(yaml_path).exists() {
        println!("No test cases found at {}, skipping test gen.", yaml_path);
        return Ok(());
    }
    let yaml_content = fs::read_to_string(yaml_path)?;
    let test_cases: Vec<TestCaseYaml> = serde_yaml::from_str(&yaml_content)?;

    let mut cases_by_func: HashMap<String, Vec<TestCaseYaml>> = HashMap::new();
    for case in test_cases {
        cases_by_func
            .entry(case.function.clone())
            .or_default()
            .push(case);
    }

    // Mode selection:
    // - algebraic keeps legacy DTO-style tests
    // - other crates: generate tests for *Api impl blocks using wrapper functions
    let is_dto_mode = target_crate == "algebraic";

    let ts_ns = crate::to_ts_ident(target_crate);
    let wrapper_file = crate::to_ts_ident(target_crate);
    let type_api_registry = type_api_codec_registry(report, known_boundary_types);

    let mut code = String::new();
    code.push_str("/* eslint-disable */\n");
    if is_dto_mode {
        code.push_str("// --- Auto-generated TS Tests (DTO style) ---\n");
    } else {
        code.push_str("// --- Auto-generated TS Tests (Api wrapper style) ---\n");
    }
    code.push_str("import { describe, it, expect, beforeAll } from 'vitest';\n");
    code.push_str(&format!(
        "import * as {} from '../wrappers/{}';\n\n",
        ts_ns, wrapper_file
    ));
    code.push_str("function normalizeJsonNumbers(value: unknown): unknown {\n");
    code.push_str("  if (typeof value === 'number') {\n");
    code.push_str("    return Number(value.toPrecision(15));\n");
    code.push_str("  }\n");
    code.push_str("  if (Array.isArray(value)) {\n");
    code.push_str("    return value.map((item) => normalizeJsonNumbers(item));\n");
    code.push_str("  }\n");
    code.push_str("  if (value && typeof value === 'object') {\n");
    code.push_str("    return Object.fromEntries(\n");
    code.push_str("      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeJsonNumbers(item)])\n");
    code.push_str("    );\n");
    code.push_str("  }\n");
    code.push_str("  return value;\n");
    code.push_str("}\n\n");
    code.push_str(&format!(
        "describe('{} wasm integration', () => {{\n",
        target_crate
    ));
    code.push_str("  beforeAll(async () => {\n");
    code.push_str("    const wasm = await import('wasm-lib');\n");
    code.push_str(&format!("    {}.setWasmFromWasmLib(wasm);\n", ts_ns));
    code.push_str("  });\n\n");

    for (func_key, cases) in cases_by_func {
        let parts: Vec<&str> = func_key.split("::").collect();
        if parts.len() != 2 {
            continue;
        }
        let struct_name = parts[0];
        let method_name = parts[1];

        if let Some(type_api) = report
            .type_apis
            .iter()
            .find(|api| api.api_struct == struct_name)
        {
            let Some(func_info) = type_api.functions.iter().find(|f| f.name == method_name) else {
                continue;
            };
            code.push_str(&format!("  describe('{}', () => {{\n", func_key));
            for (idx, case) in cases.iter().enumerate() {
                render_type_api_case(
                    &mut code,
                    ts_ns.as_str(),
                    type_api,
                    func_info,
                    case,
                    idx,
                    &type_api_registry,
                );
            }
            code.push_str("  });\n\n");
            continue;
        }

        let func_opt = report
            .impl_blocks
            .iter()
            .filter(|b| b.target_struct == struct_name)
            .flat_map(|b| &b.functions)
            .find(|f| f.name == method_name);

        let Some(func_info) = func_opt else {
            continue;
        };

        if is_dto_mode {
            let ts_method_name = method_name.to_case(Case::Camel);
            let func_call_name = format!(
                "{}{}Dto",
                struct_name.to_case(Case::Camel),
                ts_method_name.to_case(Case::Pascal)
            );

            code.push_str(&format!("  describe('{}', () => {{\n", func_key));
            for (idx, case) in cases.iter().enumerate() {
                code.push_str(&format!("    it('case {}', () => {{\n", idx + 1));
                let mut arg_vars = Vec::new();
                for (i, arg_def) in func_info.args.iter().enumerate() {
                    let input_val = if i < case.inputs.len() {
                        &case.inputs[i]
                    } else {
                        ""
                    };
                    let var_name = format!("arg{}", i);
                    let (type_name, _) = parse_arg_type(arg_def);

                    let init_expr =
                        generate_input_parser(type_name, input_val, target_crate, struct_name);
                    code.push_str(&format!("      const {} = {};\n", var_name, init_expr));
                    arg_vars.push(var_name);
                }
                let result_var = "result";
                code.push_str(&format!(
                    "      const {} = {}.{}({});\n",
                    result_var,
                    ts_ns,
                    func_call_name,
                    arg_vars.join(", ")
                ));

                let raw_ret = func_info.return_type.trim();
                if raw_ret == "()" {
                    code.push_str("      // Void return type\n");
                } else {
                    let ret_is_object = is_object_type(&func_info.return_type, report);
                    let escaped_expected = escape_ts_literal(&case.expected);
                    if ret_is_object {
                        let is_latex = case.expected.contains('\\');
                        let format_func = if is_latex {
                            format!("{}.{}ToLatexDto", ts_ns, struct_name.to_case(Case::Camel))
                        } else {
                            format!("{}.{}FormatDto", ts_ns, struct_name.to_case(Case::Camel))
                        };
                        code.push_str(&format!(
                            "      const formatted = {}({});\n",
                            format_func, result_var
                        ));
                        code.push_str(&format!(
                            "      expect(formatted).toBe(\"{}\");\n",
                            escaped_expected
                        ));
                    } else {
                        code.push_str(&format!(
                            "      expect(String({})).toBe(\"{}\");\n",
                            result_var, escaped_expected
                        ));
                    }
                }
                code.push_str("    });\n");
            }
            code.push_str("  });\n\n");
            continue;
        }

        // Api wrapper style: only generate tests for *Api structs.
        if !struct_name.ends_with("Api") {
            continue;
        }

        let wrapper_func = method_name.to_case(Case::Camel);
        code.push_str(&format!("  describe('{}', () => {{\n", func_key));

        for (idx, case) in cases.iter().enumerate() {
            code.push_str(&format!("    it('case {}', () => {{\n", idx + 1));
            let mut arg_vars = Vec::new();

            for (i, arg_def) in func_info.args.iter().enumerate() {
                let input_val = if i < case.inputs.len() {
                    &case.inputs[i]
                } else {
                    ""
                };
                let var_name = format!("arg{}", i);
                let (type_name, _) = parse_arg_type(arg_def);
                let init_expr = generate_api_input_expr(type_name, input_val);
                code.push_str(&format!("      const {} = {};\n", var_name, init_expr));
                arg_vars.push(var_name);
            }

            let result_var = "result";
            code.push_str(&format!(
                "      const {} = {}.{}({});\n",
                result_var,
                ts_ns,
                wrapper_func,
                arg_vars.join(", ")
            ));

            if func_info.return_type.trim() == "()" {
                code.push_str("      // Void return type\n");
            } else if is_vec_like_return(&func_info.return_type) {
                let escaped_expected = escape_ts_literal(&case.expected);
                code.push_str("      const out = Array.from(result as any).join(',');\n");
                code.push_str(&format!(
                    "      expect(out).toBe(\"{}\");\n",
                    escaped_expected
                ));
            } else if is_json_string_expected(&func_info.return_type, &case.expected) {
                let escaped_expected = escape_ts_literal(&case.expected);
                code.push_str(&format!(
                    "      expect(normalizeJsonNumbers(JSON.parse(String({})))).toEqual(normalizeJsonNumbers(JSON.parse(\"{}\")));\n",
                    result_var, escaped_expected
                ));
            } else {
                let escaped_expected = escape_ts_literal(&case.expected);
                code.push_str(&format!(
                    "      expect(String({})).toBe(\"{}\");\n",
                    result_var, escaped_expected
                ));
            }
            code.push_str("    });\n");
        }
        code.push_str("  });\n\n");
    }
    code.push_str("});\n");

    fs::write(output_path, code)?;
    println!("Generated TS tests at: {}", output_path);
    // Deleted the hardcoded generated algebraic tests (moved them to static tests dir in previous step).
    Ok(())
}

fn render_type_api_case(
    code: &mut String,
    ts_ns: &str,
    type_api: &TypeApiInfo,
    func_info: &FunctionInfo,
    case: &TestCaseYaml,
    idx: usize,
    registry: &CodecRegistry,
) {
    code.push_str(&format!("    it('case {}', () => {{\n", idx + 1));

    let args = func_info.boundary_args();
    if args.len() != func_info.args.len() || args.iter().any(|arg| arg.is_receiver) {
        code.push_str("      // Skipped: incomplete structured argument metadata.\n");
        code.push_str("    });\n");
        return;
    }
    let first_arg_is_receiver = args
        .first()
        .is_some_and(|arg| is_type_api_target(type_api, &arg.rust_type));

    let start_index = if first_arg_is_receiver { 1 } else { 0 };
    if first_arg_is_receiver {
        let input = case.inputs.first().map(String::as_str).unwrap_or("");
        let dto_target = matches!(
            registry.classify_arg(&type_api.target_type),
            CodecPlan::Supported(ref codec) if matches!(codec.mode, BoundaryMode::Dto)
        );
        if dto_target {
            code.push_str(&format!(
                "      const receiver = {}.{}.fromDto({});\n",
                ts_ns, type_api.ts_name, input
            ));
        } else {
            code.push_str(&format!(
                "      const receiver = {}.{}.fromString(\"{}\");\n",
                ts_ns,
                type_api.ts_name,
                escape_ts_literal(input)
            ));
        }
    }

    let mut arg_vars = Vec::new();
    for (arg_index, arg) in args.iter().enumerate().skip(start_index) {
        let input_val = case.inputs.get(arg_index).map(String::as_str).unwrap_or("");
        let var_name = format!("arg{}", arg_index);
        let Some(init_expr) = generate_type_api_input_expr(arg, input_val, ts_ns, type_api, registry)
        else {
            code.push_str("      // Skipped: unsupported Type API test boundary.\n");
            code.push_str("    });\n");
            return;
        };
        code.push_str(&format!("      const {} = {};\n", var_name, init_expr));
        arg_vars.push(var_name);
    }

    let method = func_info.name.to_case(Case::Camel);
    let call = if first_arg_is_receiver {
        format!("receiver.{}({})", method, arg_vars.join(", "))
    } else {
        format!("{}.{}.{}({})", ts_ns, type_api.ts_name, method, arg_vars.join(", "))
    };

    if let Some(expected_error) = &case.expected_error {
        let code_literal = escape_ts_literal(&expected_error.code);
        let message_literal = escape_ts_literal(&expected_error.message);
        code.push_str("      let caught: unknown;\n      try {\n");
        code.push_str(&format!("        {};\n", call));
        code.push_str("      } catch (error) {\n        caught = error;\n      }\n");
        code.push_str("      expect(caught).toBeDefined();\n");
        code.push_str(&format!(
            "      expect(String(caught)).toContain(\"{}\");\n      expect(String(caught)).toContain(\"{}\");\n",
            code_literal, message_literal
        ));
    } else {
        code.push_str(&format!("      const result = {};\n", call));
        render_type_api_expectation(
            code,
            type_api,
            &func_info.boundary_return(),
            &case.expected,
            registry,
        );
    }
    code.push_str("    });\n");
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

fn generate_type_api_input_expr(
    arg: &FunctionArgInfo,
    input_val: &str,
    ts_ns: &str,
    type_api: &TypeApiInfo,
    registry: &CodecRegistry,
) -> Option<String> {
    if is_type_api_target(type_api, &arg.rust_type) {
        let CodecPlan::Supported(codec) = registry.classify_arg(&arg.rust_type) else {
            return None;
        };
        return if matches!(codec.mode, BoundaryMode::Dto) {
            Some(format!("{}.{}.fromDto({})", ts_ns, type_api.ts_name, input_val.trim()))
        } else {
            Some(format!(
                "{}.{}.fromString(\"{}\")",
                ts_ns,
                type_api.ts_name,
                escape_ts_literal(input_val)
            ))
        };
    }

    let CodecPlan::Supported(codec) = registry.classify_arg(&arg.rust_type) else {
        return None;
    };
    codec_input_expr(&arg.rust_type, &codec, input_val, registry)
}

fn codec_input_expr(
    ty: &RustType,
    codec: &BoundaryCodec,
    input: &str,
    registry: &CodecRegistry,
) -> Option<String> {
    if input.trim() == "null" && matches!(codec.kind, BoundaryKind::Option(_)) {
        return Some("null".to_string());
    }
    // Composite DTO values (tuples, fixed arrays, and maps included) already
    // have their JSON/TypeScript shape in YAML.  Passing that shape through
    // avoids each generator re-parsing Rust's nested type spelling.
    if matches!(codec.mode, BoundaryMode::Dto) {
        return Some(input.trim().to_string());
    }
    match ty.without_reference() {
        RustType::Primitive(RustPrimitive::I64 | RustPrimitive::U64) => {
            Some(format!("{}n", input.trim()))
        }
        RustType::Primitive(_) => Some(input.trim().to_string()),
        RustType::String | RustType::Str => Some(format!("\"{}\"", escape_ts_literal(input))),
        RustType::Vec(inner) => {
            if matches!(codec.mode, BoundaryMode::Dto) {
                return Some(input.trim().to_string());
            }
            let values = input
                .split(',')
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .map(|value| match inner.without_reference() {
                    RustType::Primitive(RustPrimitive::I64 | RustPrimitive::U64) => {
                        format!("{}n", value)
                    }
                    RustType::String | RustType::Str => format!("\"{}\"", escape_ts_literal(value)),
                    RustType::Primitive(_) => value.to_string(),
                    _ => format!("\"{}\"", escape_ts_literal(value)),
                })
                .collect::<Vec<_>>()
                .join(", ");
            let array = format!("[{}]", values);
            match codec.kind {
                BoundaryKind::TypedArray => match inner.without_reference() {
                    RustType::Primitive(RustPrimitive::F64) => Some(format!("new Float64Array({array})")),
                    RustType::Primitive(RustPrimitive::F32) => Some(format!("new Float32Array({array})")),
                    RustType::Primitive(RustPrimitive::U8) => Some(format!("new Uint8Array({array})")),
                    _ => None,
                },
                _ => Some(array),
            }
        }
        RustType::Option(inner) => {
            let CodecPlan::Supported(nested) = registry.classify_arg(inner) else {
                return None;
            };
            codec_input_expr(inner, &nested, input, registry)
        }
        RustType::Path(_) if matches!(codec.kind, BoundaryKind::StringBoundary) => {
            Some(format!("\"{}\"", escape_ts_literal(input)))
        }
        _ => None,
    }
}

fn render_type_api_expectation(
    code: &mut String,
    type_api: &TypeApiInfo,
    return_ty: &RustType,
    expected: &str,
    registry: &CodecRegistry,
) {
    let value_ty = match return_ty {
        RustType::Result { ok, .. } => ok.as_ref(),
        _ => return_ty,
    };
    if matches!(value_ty, RustType::Unit) {
        return;
    }
    let escaped_expected = escape_ts_literal(expected);
    match registry.classify_return(value_ty) {
        CodecPlan::Supported(codec) if matches!(codec.mode, BoundaryMode::Dto) => {
            let actual = if is_type_api_target(type_api, value_ty) {
                "result.toDto()"
            } else {
                "result"
            };
            code.push_str(&format!(
                "      expect(normalizeJsonNumbers({})).toEqual(normalizeJsonNumbers(JSON.parse(\"{}\")));\n",
                actual, escaped_expected
            ));
        }
        CodecPlan::Supported(codec) if matches!(codec.kind, BoundaryKind::TypedArray | BoundaryKind::PrimitiveArray) => {
            code.push_str("      const out = Array.from(result as any).join(',');\n");
            code.push_str(&format!("      expect(out).toBe(\"{}\");\n", escaped_expected));
        }
        CodecPlan::Supported(_) => {
            code.push_str(&format!(
                "      expect(String(result)).toBe(\"{}\");\n",
                escaped_expected
            ));
        }
        CodecPlan::Unsupported(reason) => {
            code.push_str(&format!(
                "      throw new Error(\"Unsupported Type API return boundary: {}\");\n",
                escape_ts_literal(&reason.reason)
            ));
        }
    }
}

fn generate_api_input_expr(type_name: &str, input_val: &str) -> String {
    let mut t = type_name.trim();
    t = t.trim_start_matches('&').trim();
    if t.starts_with("mut") {
        t = t.trim_start_matches("mut").trim();
    }

    let t_no_space = t.replace(' ', "");
    if t_no_space.starts_with("Vec<") && t_no_space.ends_with('>') {
        let inner = &t_no_space[4..t_no_space.len() - 1];
        let parts: Vec<&str> = input_val
            .split(',')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();

        let arr = format!("[{}]", parts.join(", "));
        return match inner {
            "f64" => format!("new Float64Array({})", arr),
            "f32" => format!("new Float32Array({})", arr),
            "u8" => format!("new Uint8Array({})", arr),
            _ => "undefined".to_string(),
        };
    }

    match t_no_space.as_str() {
        "i64" | "u64" | "usize" | "isize" => input_val.to_string(),
        "i32" | "u32" | "f64" | "f32" => input_val.to_string(),
        "bool" => input_val.to_string(),
        "String" | "str" => format!("\"{}\"", escape_ts_literal(input_val)),
        _ => "undefined".to_string(),
    }
}

fn parse_arg_type(arg_def: &str) -> (&str, bool) {
    if arg_def.contains("self") {
        return ("Self", true);
    }
    let parts: Vec<&str> = arg_def.split(':').collect();
    if parts.len() == 2 {
        (parts[1].trim(), false)
    } else {
        ("unknown", false)
    }
}

fn generate_input_parser(
    type_name: &str,
    input_val: &str,
    namespace: &str,
    self_type: &str,
) -> String {
    let mut t = type_name.trim().trim_start_matches('&').trim();
    if t.starts_with("mut") {
        t = t.trim_start_matches("mut").trim();
    }
    let parse_self_func = format!("{}.{}ParseDto", namespace, self_type.to_case(Case::Camel));

    let t_no_space = t.replace(' ', "");
    if t_no_space.starts_with("Vec<") && t_no_space.ends_with('>') {
        let inner = &t_no_space[4..t_no_space.len() - 1];
        let parts: Vec<&str> = input_val
            .split(',')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();

        match inner {
            "i64" | "u64" | "usize" | "isize" => {
                let elems = parts
                    .iter()
                    .map(|s| format!("{}n", s))
                    .collect::<Vec<_>>()
                    .join(", ");
                return format!("[{}]", elems);
            }
            "i32" | "u32" | "f64" | "f32" => {
                return format!("[{}]", parts.join(", "));
            }
            "String" | "str" => {
                let elems = parts
                    .iter()
                    .map(|s| format!("\"{}\"", escape_ts_literal(s)))
                    .collect::<Vec<_>>()
                    .join(", ");
                return format!("[{}]", elems);
            }
            "Self" => {
                let elems = parts
                    .iter()
                    .map(|s| format!("{}(\"{}\")", parse_self_func, escape_ts_literal(s)))
                    .collect::<Vec<_>>()
                    .join(", ");
                return format!("[{}]", elems);
            }
            _ => {
                if matches!(inner.chars().next(), Some(c) if c.is_uppercase()) {
                    let parse_func =
                        format!("{}.{}ParseDto", namespace, inner.to_case(Case::Camel));
                    let elems = parts
                        .iter()
                        .map(|s| format!("{}(\"{}\")", parse_func, escape_ts_literal(s)))
                        .collect::<Vec<_>>()
                        .join(", ");
                    return format!("[{}]", elems);
                }
                return "undefined".to_string();
            }
        }
    }

    match t {
        "i64" | "u64" | "usize" | "isize" => format!("{}n", input_val), // Can pass BigInt / decimal String here, wrapper accepts any
        "i32" | "u32" | "f64" | "f32" => input_val.to_string(),
        "bool" => input_val.to_string(),
        "String" | "str" => format!("\"{}\"", escape_ts_literal(input_val)),
        "Self" => format!("{}(\"{}\")", parse_self_func, escape_ts_literal(input_val)),
        _ => {
            if matches!(t.chars().next(), Some(c) if c.is_uppercase()) {
                format!(
                    "{}.{}ParseDto(\"{}\")",
                    namespace,
                    t.to_case(Case::Camel),
                    escape_ts_literal(input_val)
                )
            } else {
                "undefined".to_string()
            }
        }
    }
}

fn is_object_type(type_name: &str, report: &ApiReport) -> bool {
    let t = type_name.trim();
    if t == "Self" || t.starts_with("Result") {
        return true;
    }
    if t == "String" || t == "bool" || t == "()" {
        return false;
    }
    report.structs.iter().any(|s| s.name == t)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{ApiReport, FunctionArgInfo, FunctionInfo, ImplBlockInfo, TypeApiInfo};
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn escape_ts_literal_escapes_backslash_and_quote() {
        assert_eq!(escape_ts_literal("\""), "\\\"");
        assert_eq!(escape_ts_literal("\\"), "\\\\");
        assert_eq!(
            escape_ts_literal("{\"k\":\"a\\\\b\"}"),
            "{\\\"k\\\":\\\"a\\\\\\\\b\\\"}"
        );
    }

    #[test]
    fn generate_ts_test_escapes_expected_json_string() {
        let report = ApiReport {
            structs: vec![],
            impl_blocks: vec![ImplBlockInfo {
                crate_name: "statistics".to_string(),
                target_struct: "StatisticsApi".to_string(),
                functions: vec![FunctionInfo {
                    name: "get_descriptive_stats".to_string(),
                    visibility: "pub".to_string(),
                    args: vec!["csv: String".to_string()],
                    return_type: "Result<String>".to_string(),
                    doc: String::new(),
                    source_code: String::new(),
                    typed_args: vec![],
                    typed_return: None,
                    codec_args: vec![],
                    codec_return: None,
                }],
            }],
            crate_apis: vec![],
            type_apis: vec![],
            unsupported: vec![],
        };

        let uniq = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("time")
            .as_nanos();
        let tmp_dir = std::env::temp_dir().join(format!("inspector-ts-test-{}", uniq));
        fs::create_dir_all(&tmp_dir).expect("mkdir");
        let yaml_path = tmp_dir.join("statistics.yml");
        let out_path = tmp_dir.join("statistics.test.ts");

        let yaml = r#"
- function: StatisticsApi::get_descriptive_stats
  inputs:
    - "1,2,3"
  expected: '{"mean":2.0,"note":"a\\b"}'
"#;

        fs::write(&yaml_path, yaml).expect("write yaml");
        generate_ts_test(
            &report,
            yaml_path.to_str().expect("yaml str"),
            out_path.to_str().expect("out str"),
            "statistics",
        )
        .expect("generate");

        let generated = fs::read_to_string(&out_path).expect("read out");
        assert!(generated.contains("expect(normalizeJsonNumbers(JSON.parse(String(result)))).toEqual(normalizeJsonNumbers(JSON.parse(\"{\\\"mean\\\":2.0,\\\"note\\\":\\\"a\\\\\\\\b\\\"}\")));"));

        let _ = fs::remove_file(&yaml_path);
        let _ = fs::remove_file(&out_path);
        let _ = fs::remove_dir(&tmp_dir);
    }

    #[test]
    fn type_api_tests_use_structured_argument_types() {
        let report = ApiReport {
            structs: vec![],
            impl_blocks: vec![],
            crate_apis: vec![],
            type_apis: vec![TypeApiInfo {
                crate_name: "linalg".to_string(),
                api_struct: "RationalMatrixApi".to_string(),
                target_type: RustType::parse_str("Matrix<Rational>"),
                ts_name: "RationalMatrix".to_string(),
                functions: vec![FunctionInfo {
                    name: "zeros".to_string(),
                    visibility: "pub".to_string(),
                    // Deliberately stale legacy values: Type API rendering must
                    // use the structured `usize` metadata below.
                    args: vec!["rows: String".to_string(), "cols: String".to_string()],
                    return_type: "String".to_string(),
                    doc: String::new(),
                    source_code: String::new(),
                    typed_args: vec![
                        FunctionArgInfo {
                            name: "rows".to_string(),
                            rust_type: RustType::parse_str("usize"),
                            is_receiver: false,
                        },
                        FunctionArgInfo {
                            name: "cols".to_string(),
                            rust_type: RustType::parse_str("usize"),
                            is_receiver: false,
                        },
                    ],
                    typed_return: Some(RustType::parse_str("Matrix<Rational>")),
                    codec_args: vec![],
                    codec_return: None,
                }],
            }],
            unsupported: vec![],
        };

        let uniq = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("time")
            .as_nanos();
        let tmp_dir = std::env::temp_dir().join(format!("inspector-type-api-test-{}", uniq));
        fs::create_dir_all(&tmp_dir).expect("mkdir");
        let yaml_path = tmp_dir.join("linalg.yml");
        let out_path = tmp_dir.join("linalg.test.ts");
        fs::write(
            &yaml_path,
            "- function: RationalMatrixApi::zeros\n  inputs: [\"2\", \"3\"]\n  expected: 0,0,0;0,0,0\n",
        )
        .expect("write yaml");

        generate_ts_test(
            &report,
            yaml_path.to_str().expect("yaml str"),
            out_path.to_str().expect("out str"),
            "linalg",
        )
        .expect("generate");

        let generated = fs::read_to_string(&out_path).expect("read generated");
        assert!(generated.contains("const arg0 = 2;"));
        assert!(generated.contains("const arg1 = 3;"));
        assert!(generated.contains("RationalMatrix.zeros(arg0, arg1)"));
        assert!(!generated.contains("const arg0 = \"2\";"));

        let _ = fs::remove_file(&yaml_path);
        let _ = fs::remove_file(&out_path);
        let _ = fs::remove_dir(&tmp_dir);
    }
}
