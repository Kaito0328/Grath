use crate::types::{ApiReport, FunctionInfo, InspectorConfig};
use anyhow::Result;
use serde::Deserialize;
use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::io::Write;
use std::path::Path;

fn is_vec_return_type(ret: &str) -> bool {
    let t = ret.trim().replace(' ', "");
    if t.starts_with("Vec<") {
        return true;
    }
    if t.starts_with("Result<Vec<") {
        return true;
    }
    false
}

fn is_matrix_return_type(ret: &str) -> bool {
    let t = ret.trim().replace(' ', "");
    t.starts_with("Matrix<")
        || t.starts_with("Result<Matrix<")
        || t.starts_with("std::result::Result<Matrix<")
}

fn compact_type(raw: &str) -> String {
    raw.replace(' ', "").replace("&mut", "").replace('&', "")
}

/// Returns true when a type is a DTO or a Vec/Option nesting whose leaf is an
/// explicitly DTO-enabled public type. The runner uses serde_json for this
/// path, while legacy string APIs retain their existing parsers.
fn is_dto_json_type(raw: &str, dto_types: &HashSet<String>) -> bool {
    let ty = compact_type(raw);
    let ty = if let Some(value) = ty.strip_prefix("Result<").and_then(|v| v.strip_suffix('>')) {
        value.split_once(',').map(|(ok, _)| ok).unwrap_or(value)
    } else {
        ty.as_str()
    };
    let mut current = ty;
    loop {
        if let Some(inner) = current
            .strip_prefix("Vec<")
            .and_then(|v| v.strip_suffix('>'))
        {
            current = inner;
            continue;
        }
        if let Some(inner) = current
            .strip_prefix("Option<")
            .and_then(|v| v.strip_suffix('>'))
        {
            current = inner;
            continue;
        }
        if let Some(inner) = current
            .strip_prefix('[')
            .and_then(|v| v.split_once(';').map(|(inner, _)| inner))
        {
            current = inner;
            continue;
        }
        break;
    }
    if dto_types.contains(current.rsplit("::").next().unwrap_or(current)) {
        return true;
    }
    // Tuple and map expressions are decoded as their complete serde JSON
    // shape when any component is an explicit DTO.
    dto_types.iter().any(|name| current.contains(name))
}

#[derive(Debug, Deserialize)]
struct YamlTestCase {
    function: String,
}

fn load_yaml_function_keys(target_crate: &str) -> Vec<String> {
    let yaml_path = Path::new("integration-tests")
        .join("test_cases")
        .join(format!("{}.yml", target_crate));
    let file = match File::open(&yaml_path) {
        Ok(f) => f,
        Err(_) => return Vec::new(),
    };

    let cases: Vec<YamlTestCase> = match serde_yaml::from_reader(file) {
        Ok(v) => v,
        Err(_) => return Vec::new(),
    };

    let mut out = Vec::new();
    let mut seen = HashSet::new();
    for c in cases {
        let key = c.function.trim().to_string();
        if key.is_empty() {
            continue;
        }
        if seen.insert(key.clone()) {
            out.push(key);
        }
    }
    out
}

pub fn generate_runner(
    report: &ApiReport,
    output_path: &str,
    config: &InspectorConfig,
    target_crate: &str,
) -> Result<()> {
    let mut code = String::new();
    let crate_ident = crate::to_rust_ident(target_crate);
    let selected_keys = load_yaml_function_keys(target_crate);
    let has_matrix_return = report
        .impl_blocks
        .iter()
        .flat_map(|block| &block.functions)
        .any(|func| is_matrix_return_type(&func.return_type));
    let dto_types: HashSet<String> = report
        .structs
        .iter()
        .filter(|item| item.dto_candidate && item.dto_enabled)
        .map(|item| item.name.clone())
        .collect();

    code.push_str("// --- Auto-generated Test Runner ---\n");

    // ★修正: test_runner が Some の場合のみ処理する
    if let Some(runner_config) = &config.test_runner {
        // Attributes
        for attr in &runner_config.extra_attributes {
            code.push_str(&format!("{}\n", attr));
        }
    }
    code.push('\n');

    // クレートのインポート
    let prelude_exists = {
        let base = Path::new("crates").join(target_crate).join("src");
        let has_file =
            base.join("prelude.rs").exists() || base.join("prelude").join("mod.rs").exists();
        let has_inline = base
            .join("lib.rs")
            .to_str()
            .and_then(|p| std::fs::read_to_string(p).ok())
            .is_some_and(|s| s.contains("mod prelude") || s.contains("pub mod prelude"));
        has_file || has_inline
    };
    if prelude_exists {
        code.push_str(&format!("use {}::prelude::*;\n", crate_ident));
    }
    code.push_str(&format!("use {}::*;\n", crate_ident));
    // Composite DTO signatures may spell standard map types directly.  The
    // generated integration runner must not rely on the target crate having
    // re-exported those imports.
    code.push_str("use std::collections::{BTreeMap, HashMap};\n");

    // ★修正: Imports
    if let Some(runner_config) = &config.test_runner {
        for imp in &runner_config.imports {
            code.push_str(&format!("use {};\n", imp));
        }
    }

    code.push_str(
        r#"

fn vec_to_csv<T: ToString>(v: &[T]) -> String {
    v.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(",")
}
"#,
    );

    if has_matrix_return {
        code.push_str(
            r#"

fn matrix_to_compact<T: ToString + Scalar>(m: &Matrix<T>) -> String {
    let mut rows = Vec::with_capacity(m.rows);
    for r in 0..m.rows {
        let mut cols = Vec::with_capacity(m.cols);
        for c in 0..m.cols {
            cols.push(m[(r, c)].to_string());
        }
        rows.push(cols.join(","));
    }
    rows.join(";")
}
"#,
        );
    }

    code.push_str(
        r#"
pub fn run_dynamic_test(func_key: &str, inputs: &[String]) -> std::result::Result<String, String> {
    match func_key {
"#,
    );

    let mut key_to_func: HashMap<String, (usize, usize)> = HashMap::new();
    for (block_idx, block) in report.impl_blocks.iter().enumerate() {
        if should_skip_struct(&block.target_struct) {
            continue;
        }

        for (func_idx, func) in block.functions.iter().enumerate() {
            if !should_generate_function(func) {
                continue;
            }

            let func_key = format!("{}::{}", block.target_struct, func.name);
            key_to_func.insert(func_key, (block_idx, func_idx));
        }
    }

    for func_key in &selected_keys {
        let Some((block_idx, func_idx)) = key_to_func.get(func_key).copied() else {
            code.push_str(&format!(
                "        \"{}\" => Err(format!(\"Unsupported function: {}\")),\n",
                func_key, func_key
            ));
            continue;
        };

        let block = &report.impl_blocks[block_idx];
        let func = &block.functions[func_idx];

        let mut args_setup = String::new();
        let mut args_call = String::new();
        let mut input_index = 0;

        let is_mut_method = func
            .args
            .iter()
            .any(|a| a.contains("mut") && a.contains("self"));
        let receiver_mut = if is_mut_method { "mut " } else { "" };

        for arg_def in &func.args {
            if arg_def.contains("self") {
                let self_type = &block.target_struct;
                args_setup.push_str(&format!(
                    "            let {}receiver = inputs[{}].parse::<{}>().map_err(|e| format!(\"Parse receiver error: {{}}\", e))?;\n",
                    receiver_mut, input_index, self_type
                ));
                input_index += 1;
                continue;
            }

            let type_info = extract_type_info(arg_def);
            let is_ref = type_info.is_ref;
            let mut type_name = type_info.name;

            if type_name == "Self" {
                type_name = block.target_struct.clone();
            }

            let type_name_compact = type_name.replace(' ', "");

            if is_dto_json_type(&type_name, &dto_types) {
                args_setup.push_str(&format!(
                    "            let arg{}: {} = serde_json::from_str(&inputs[{}]).map_err(|e| format!(\"Parse DTO arg{} error: {{}}\", e))?;\n",
                    input_index, type_name, input_index, input_index
                ));
                if is_ref {
                    args_call.push_str(&format!("&arg{}, ", input_index));
                } else {
                    args_call.push_str(&format!("arg{}, ", input_index));
                }
                input_index += 1;
                continue;
            }

            if type_name_compact.starts_with("Vec<") && type_name_compact.ends_with('>') {
                args_setup.push_str(&format!(
                    "            let raw = inputs[{}].trim();
            let raw = raw.trim_start_matches('[').trim_end_matches(']');
            let arg{} = if raw.is_empty() {{
                Vec::new()
            }} else {{
                raw.split(',')
                    .map(|s| s.trim().parse())
                    .collect::<std::result::Result<Vec<_>, _>>()
                    .map_err(|e| format!(\"Parse arg{} Vec error: {{}}\", e))?
            }};\n",
                    input_index, input_index, input_index
                ));
                if is_ref {
                    args_call.push_str(&format!("&arg{}, ", input_index));
                } else {
                    args_call.push_str(&format!("arg{}, ", input_index));
                }
            } else if type_name == "str" || type_name == "String" {
                args_setup.push_str(&format!(
                    "            let arg{} = inputs[{}].to_string();\n",
                    input_index, input_index
                ));
                if is_ref || type_name == "str" {
                    args_call.push_str(&format!("&arg{}, ", input_index));
                } else {
                    args_call.push_str(&format!("arg{}, ", input_index));
                }
            } else {
                args_setup.push_str(&format!(
                    "            let arg{} = inputs[{}].parse::<{}>().map_err(|e| format!(\"Parse arg{} error: {{}}\", e))?;\n",
                    input_index, input_index, type_name, input_index
                ));

                if is_ref {
                    args_call.push_str(&format!("&arg{}, ", input_index));
                } else {
                    args_call.push_str(&format!("arg{}, ", input_index));
                }
            }

            input_index += 1;
        }

        let raw_call = if func.args.first().is_some_and(|a| a.contains("self")) {
            format!(
                "receiver.{}({})",
                func.name,
                args_call.trim_end_matches(", ")
            )
        } else {
            format!(
                "{}::{}({})",
                block.target_struct,
                func.name,
                args_call.trim_end_matches(", ")
            )
        };

        let result_handling = if func.return_type == "()" {
            format!("{};\n            let result = receiver", raw_call)
        } else if func.return_type.contains("Result") {
            format!(
                "let result = {}.map_err(|e| format!(\"{{:?}}\", e))?",
                raw_call
            )
        } else {
            format!("let result = {}", raw_call)
        };

        let ok_value = if func.return_type == "()" {
            "result.to_string()".to_string()
        } else if is_dto_json_type(&func.return_type, &dto_types) {
            "serde_json::to_string(&result).map_err(|e| e.to_string())?".to_string()
        } else if is_matrix_return_type(&func.return_type) {
            "matrix_to_compact(&result)".to_string()
        } else if is_vec_return_type(&func.return_type) {
            "vec_to_csv(&result)".to_string()
        } else {
            "result.to_string()".to_string()
        };

        code.push_str(&format!(
            r#"        "{key}" => {{
{args_setup}
            {result_handling};
            Ok({ok_value})
        }},
"#,
            key = func_key,
            args_setup = args_setup,
            result_handling = result_handling,
            ok_value = ok_value
        ));
    }

    code.push_str(
        r#"        _ => Err(format!("Unknown function: {}", func_key)),
    }
}
"#,
    );

    let mut file = File::create(output_path)?;
    file.write_all(code.as_bytes())?;
    println!("Generated runner at: {}", output_path);
    Ok(())
}

pub fn generate_dispatcher(output_dir: &str, target_crates: &[String]) -> Result<()> {
    // `dev -n <crate>` refreshes one runner at a time. Only include runner
    // modules that exist on disk so a partially bootstrapped configuration
    // cannot make the integration-test crate fail to compile. Callers pass the
    // complete configured target set, preserving runners for other crates.
    let dispatcher_crates: Vec<&String> = target_crates
        .iter()
        .filter(|krate| {
            *krate != "test-cases"
                && Path::new(output_dir)
                    .join(format!("runner_{}.rs", crate::to_rust_ident(krate)))
                    .exists()
        })
        .collect();

    let mut code = String::new();

    code.push_str("// --- Auto-generated Dispatcher ---\n");
    code.push_str("// Do not edit this file manually.\n\n");

    for krate in &dispatcher_crates {
        let ident = crate::to_rust_ident(krate);
        code.push_str(&format!("pub mod runner_{};\n", ident));
    }
    code.push('\n');

    code.push_str("pub fn dispatch_test(crate_name: &str, func_key: &str, inputs: &[String]) -> std::result::Result<String, String> {\n");
    code.push_str("    match crate_name {\n");

    for krate in &dispatcher_crates {
        let ident = crate::to_rust_ident(krate);
        code.push_str(&format!(
            "        \"{}\" => runner_{}::run_dynamic_test(func_key, inputs),\n",
            krate, ident
        ));
    }

    // Special pseudo crate: allows a single YAML to call into multiple crates.
    code.push_str("        \"test-cases\" => {\n");
    code.push_str("            if let Some((target, func)) = func_key.split_once(\"::\") {\n");
    code.push_str("                dispatch_test(target, func, inputs)\n");
    code.push_str("            } else {\n");
    code.push_str(
        "                Err(format!(\"Invalid combined function key: {}\", func_key))\n",
    );
    code.push_str("            }\n");
    code.push_str("        },\n");

    code.push_str("        _ => Err(format!(\"Unknown crate: {}\", crate_name)),\n");
    code.push_str("    }\n");
    code.push_str("}\n");

    let path = Path::new(output_dir).join("mod.rs");
    let mut file = File::create(path)?;
    file.write_all(code.as_bytes())?;

    Ok(())
}

fn should_skip_struct(struct_name: &str) -> bool {
    if struct_name.ends_with("Error") {
        return true;
    }
    if struct_name.ends_with("Dto")
        || struct_name.ends_with("Request")
        || struct_name.ends_with("Response")
    {
        return true;
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn dispatcher_keeps_existing_runners_during_partial_generation() {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock should be after Unix epoch")
            .as_nanos();
        let dir = std::env::temp_dir().join(format!("grath-dispatcher-{unique}"));
        fs::create_dir_all(&dir).expect("temporary runner directory should be created");

        fs::write(dir.join("runner_algebraic.rs"), "").expect("algebraic runner should exist");
        fs::write(dir.join("runner_linalg.rs"), "").expect("linalg runner should exist");

        let targets = vec!["algebraic".to_string(), "linalg".to_string()];
        generate_dispatcher(
            dir.to_str().expect("temporary path should be UTF-8"),
            &targets,
        )
        .expect("dispatcher generation should succeed");

        let dispatcher = fs::read_to_string(dir.join("mod.rs"))
            .expect("generated dispatcher should be readable");
        assert!(dispatcher.contains("pub mod runner_algebraic;"));
        assert!(dispatcher.contains("pub mod runner_linalg;"));
        assert!(dispatcher.contains("\"algebraic\" => runner_algebraic::run_dynamic_test"));
        assert!(dispatcher.contains("\"linalg\" => runner_linalg::run_dynamic_test"));

        fs::remove_dir_all(dir).expect("temporary runner directory should be removed");
    }
}

fn should_generate_function(func: &FunctionInfo) -> bool {
    if func.visibility != "pub" {
        return false;
    }
    true
}

struct TypeInfo {
    name: String,
    is_ref: bool,
}

fn extract_type_info(arg_def: &str) -> TypeInfo {
    let raw = if let Some(pos) = arg_def.find(':') {
        arg_def[pos + 1..].trim()
    } else {
        arg_def.trim()
    };
    let is_ref = raw.starts_with('&');
    let mut name = raw.trim_start_matches('&').trim().to_string();

    if name.starts_with("mut ") {
        name = name[4..].trim().to_string();
    }

    TypeInfo { name, is_ref }
}
