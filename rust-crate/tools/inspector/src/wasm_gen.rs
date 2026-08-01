use crate::codec::{
    is_matrix_type, rust_string_boundary_encoder, type_api_export_name, BoundaryMode, CodecPlan,
    CodecRegistry, RustType,
};
use crate::to_rust_ident;
use crate::types::{ApiReport, FunctionInfo, InspectorConfig, TypeApiInfo};
use anyhow::Result;
use std::collections::HashSet;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;

// ★追加: 生成対象から除外する判定ロジック
fn should_skip(name: &str) -> bool {
    name.ends_with("Error") || name == "Token" || name == "Polynomial"
}

pub fn generate_wasm_lib(
    report: &ApiReport,
    output_path: &str,
    config: &InspectorConfig,
    target_crate: &str,
) -> Result<()> {
    let mut code = String::new();
    let target_crate_ident = to_rust_ident(target_crate);

    // ヘッダー
    code.push_str("// --- Auto-generated Wasm Wrapper ---\n");
    code.push_str("#![allow(non_snake_case)]\n");
    code.push_str("#![allow(unused_imports)]\n\n");
    code.push_str("use wasm_bindgen::prelude::*;\n");
    // DTO map boundaries are deserialized in the generated wrapper.  Import
    // both standard map types here so generated signatures do not depend on
    // a crate re-exporting its own collection imports.
    code.push_str("use std::collections::{BTreeMap, HashMap};\n");
    // For structured errors (code/message/details).  A target crate can also
    // export a module named `common` (for example, statistics), so bind the
    // external crate under a collision-free name before importing its prelude.
    code.push_str("extern crate common as grath_common;\n");
    code.push_str("use grath_common::prelude::*;\n");
    // Prelude が存在する場合だけ import する（全クレートに存在するとは限らない）
    let prelude_exists = {
        let base = Path::new("crates").join(target_crate).join("src");
        let has_file =
            base.join("prelude.rs").exists() || base.join("prelude").join("mod.rs").exists();
        let has_inline = base
            .join("lib.rs")
            .to_str()
            .and_then(|p| fs::read_to_string(p).ok())
            .is_some_and(|s| s.contains("mod prelude") || s.contains("pub mod prelude"));
        has_file || has_inline
    };
    if prelude_exists {
        code.push_str(&format!("use {}::prelude::*;\n", target_crate_ident));
    }

    // Crate root を use しておくことでパス解決しやすくする
    code.push_str(&format!("use {}::*;\n\n", target_crate_ident));

    code.push_str(
        "fn js_error_from_app_error(app: AppError) -> JsError {\n\
    let json = serde_json::to_string(&app)\n\
        .unwrap_or_else(|_| format!(\"{}: {}\", app.code, app.message));\n\
    JsError::new(&json)\n\
}\n\n",
    );

    code.push_str(
        "fn js_error_from_code_message(code: &str, message: String, details: Option<String>) -> JsError {\n\
    js_error_from_app_error(AppError::new(code.to_string(), message, details))\n\
}\n\n",
    );

    code.push_str(
        "fn js_error_from_to_app_error<E: ToAppError>(e: E, details: Option<String>) -> JsError {\n\
    js_error_from_app_error(e.to_app_error(details))\n\
}\n\n",
    );

    // Vec<T> support (comma-separated string encoding)
    code.push_str("use std::str::FromStr;\n\n");
    code.push_str("fn parse_csv_to_vec<T>(s: &str) -> std::result::Result<Vec<T>, JsError>\n");
    code.push_str("where\n    T: FromStr,\n    T::Err: ToString,\n{\n");
    code.push_str("    let s = s.trim();\n");
    code.push_str("    if s.is_empty() {\n        return Ok(Vec::new());\n    }\n");
    code.push_str(
        "    s.split(',')\n        .map(|p| p.trim())\n        .filter(|p| !p.is_empty())\n        .map(|p| p.parse::<T>().map_err(|e| JsError::new(&e.to_string())))\n        .collect::<std::result::Result<Vec<_>, _>>()\n}\n\n",
    );
    code.push_str(
        "fn vec_to_csv<T>(v: Vec<T>) -> String\nwhere\n    T: ToString,\n{\n    v.into_iter().map(|x| x.to_string()).collect::<Vec<_>>().join(\",\")\n}\n\n",
    );
    code.push_str(
        "fn parse_from_str<T>(s: &str) -> std::result::Result<T, JsError>\nwhere\n    T: FromStr,\n    T::Err: ToString,\n{\n    s.parse::<T>().map_err(|e| JsError::new(&e.to_string()))\n}\n\n",
    );
    code.push_str(
        "fn encode_to_string<T>(value: T) -> String\nwhere\n    T: ToString,\n{\n    value.to_string()\n}\n\n",
    );

    // 生成する構造体のセット（存在確認用）
    // - `struct` があっても Display/FromStr が無いケースが多いので、
    //   wasm 側に露出する可能性が高い「pub な impl を持つ型」のみに絞る。
    let all_structs: HashSet<String> = report.structs.iter().map(|s| s.name.clone()).collect();
    let valid_structs: HashSet<String> = report
        .impl_blocks
        .iter()
        .filter(|b| all_structs.contains(&b.target_struct))
        .filter(|b| b.functions.iter().any(|f| f.visibility == "pub"))
        .map(|b| b.target_struct.clone())
        .filter(|name| !should_skip(name))
        .collect();

    // 1. 構造体のラッパー定義
    for strukt in &report.structs {
        if !valid_structs.contains(&strukt.name) {
            continue;
        }

        let wasm_struct_name = format!("Wasm{}", strukt.name);

        // --- 構造体定義 ---
        code.push_str("#[wasm_bindgen]\n");
        code.push_str(&format!(
            "pub struct {}(pub(crate) {});\n\n",
            wasm_struct_name, strukt.name
        ));

        // --- ブロック1: 内部用 (Rust間で使用、Wasmには公開しない) ---
        // ※ ここには #[wasm_bindgen] をつけない
        code.push_str(&format!("impl {} {{\n", wasm_struct_name));
        code.push_str(&format!(
            "    pub fn inner(&self) -> &{} {{ &self.0 }}\n",
            strukt.name
        ));
        code.push_str("}\n\n");

        // --- ブロック2: 公開用 (JSから呼ぶメソッド) ---
        // ※ ここに #[wasm_bindgen] をつける
        code.push_str("#[wasm_bindgen]\n");
        code.push_str(&format!("impl {} {{\n", wasm_struct_name));

        // toString メソッド
        code.push_str("    #[wasm_bindgen(js_name = toString)]\n");
        code.push_str("    pub fn to_string(&self) -> String {\n");
        // Avoid requiring Display/Debug/Serialize on every wrapped struct.
        code.push_str(&format!(
            "        stringify!({}).to_string()\n",
            strukt.name
        ));
        code.push_str("    }\n");
        code.push_str("}\n\n");
    }

    // 2. 実装ブロック
    for block in &report.impl_blocks {
        if !valid_structs.contains(&block.target_struct) {
            continue;
        }

        let wasm_struct_name = format!("Wasm{}", block.target_struct);

        // 一時バッファにメソッド定義を溜める
        let mut block_code = String::new();
        let mut has_methods = false;

        for func in &block.functions {
            if func.visibility != "pub" {
                continue;
            }

            // --- 引数解析 ---
            let mut args_def = Vec::new();
            let mut args_call = Vec::new();
            let mut prelude_lines: Vec<String> = Vec::new();
            let mut needs_fallible = false;
            let mut skip_func = false;

            for arg in &func.args {
                // ... (既存の引数解析ロジック) ...
                // 変更なし
                if !arg.contains(':') {
                    if arg.contains("self") {
                        if arg.contains('&') {
                            if arg.contains("mut") {
                                args_def.push("&mut self".to_string());
                            } else {
                                args_def.push("&self".to_string());
                            }
                        } else {
                            args_def.push("self".to_string());
                        }
                        continue;
                    }
                }

                let parts: Vec<&str> = arg.splitn(2, ':').collect();
                if parts.len() != 2 {
                    continue;
                }
                let arg_name_raw = parts[0].trim();
                let arg_name = arg_name_raw.trim_start_matches("mut ").trim();
                let raw_type = parts[1].trim();

                // Vec<T> is encoded as comma-separated string across the JS boundary.
                let raw_no_space = raw_type.replace(' ', "");
                if raw_no_space.starts_with("Vec<") && raw_no_space.ends_with('>') {
                    let inner = raw_no_space[4..raw_no_space.len() - 1].to_string();

                    // Prefer typed-array boundary for primitive numeric vectors.
                    // wasm-bindgen maps `Vec<f64>` <-> `Float64Array`, `Vec<f32>` <-> `Float32Array`, `Vec<u8>` <-> `Uint8Array`.
                    if inner == "f64" || inner == "f32" || inner == "u8" {
                        args_def.push(format!("{}: Vec<{}>", arg_name, inner));
                        args_call.push(arg_name.to_string());
                        continue;
                    }

                    // Only support Vec of primitives or known structs.
                    let inner_ok = match inner.as_str() {
                        "i64" | "u64" | "i32" | "u32" | "f64" | "f32" | "bool" | "usize"
                        | "isize" => true,
                        "String" | "str" => true,
                        "Self" => true,
                        _ => valid_structs.contains(&inner),
                    };
                    if !inner_ok {
                        skip_func = true;
                        break;
                    }

                    // wasm signature takes &str; we parse into Vec<Inner> before calling the real API.
                    args_def.push(format!("{}: &str", arg_name));
                    let vec_var = format!("{}_vec", arg_name);
                    let parse_target = if inner == "Self" {
                        block.target_struct.clone()
                    } else {
                        inner.clone()
                    };
                    prelude_lines.push(format!(
                        "        let {}: Vec<{}> = parse_csv_to_vec::<{}>({})?;",
                        vec_var, parse_target, parse_target, arg_name
                    ));
                    args_call.push(vec_var);
                    needs_fallible = true;
                    continue;
                }

                if arg_name_raw == "self" || arg_name_raw == "mut self" {
                    if raw_type.contains('&') {
                        if raw_type.contains("mut") {
                            args_def.push("&mut self".to_string());
                        } else {
                            args_def.push("&self".to_string());
                        }
                    } else {
                        args_def.push("self".to_string());
                    }
                    continue;
                }

                let (wasm_type, conversion) =
                    convert_arg_type(raw_type, &wasm_struct_name, &valid_structs);

                if wasm_type.is_empty() {
                    skip_func = true;
                    break;
                }
                args_def.push(format!("{}: {}", arg_name, wasm_type));
                args_call.push(match conversion {
                    ArgConversion::None => arg_name.to_string(),
                    ArgConversion::InnerRef => format!("{}.inner()", arg_name),
                    ArgConversion::InnerMove => format!("{}.0", arg_name),
                    ArgConversion::InnerClone => format!("{}.inner().clone()", arg_name),
                });
            }

            if skip_func {
                continue;
            }

            // --- 戻り値解析 ---
            let (ret_type, ret_conv) =
                convert_return_type(&func.return_type, &wasm_struct_name, &valid_structs);

            if ret_type.is_empty() {
                continue;
            }

            // --- 生成 ---
            has_methods = true;
            let is_result_ret =
                ret_type.starts_with("std::result::Result") || ret_type.starts_with("Result<");
            let sig_ret_type = if needs_fallible && !is_result_ret {
                if ret_type == "()" {
                    "std::result::Result<(), JsError>".to_string()
                } else {
                    format!("std::result::Result<{}, JsError>", ret_type)
                }
            } else {
                ret_type.clone()
            };

            block_code.push_str(&format!(
                "    pub fn {}({}) -> {} {{\n",
                func.name,
                args_def.join(", "),
                sig_ret_type
            ));

            for line in &prelude_lines {
                block_code.push_str(line);
                block_code.push('\n');
            }

            let self_call = if func.args.first().is_some_and(|a| a.contains("self")) {
                format!("self.0.{}({})", func.name, args_call.join(", "))
            } else {
                format!(
                    "{}::{}({})",
                    block.target_struct,
                    func.name,
                    args_call.join(", ")
                )
            };

            let body_expr = match ret_conv {
                RetConversion::None => self_call,
                RetConversion::Wrap(wrapper) => format!("{}({})", wrapper, self_call),
                RetConversion::ResultWrap(wrapper, err_conv) => {
                    let err_map = match err_conv {
                        ErrConversion::ToAppError => {
                            "js_error_from_to_app_error(e, None)".to_string()
                        }
                        ErrConversion::DebugString => {
                            "JsError::new(&format!(\"{:?}\", e))".to_string()
                        }
                    };
                    format!("{}.map({}).map_err(|e| {})", self_call, wrapper, err_map)
                }
                RetConversion::ResultSimple(err_conv) => {
                    let err_map = match err_conv {
                        ErrConversion::ToAppError => {
                            "js_error_from_to_app_error(e, None)".to_string()
                        }
                        ErrConversion::DebugString => {
                            "JsError::new(&format!(\"{:?}\", e))".to_string()
                        }
                    };
                    format!("{}.map_err(|e| {})", self_call, err_map)
                }
                RetConversion::VecToCsv => format!("vec_to_csv({})", self_call),
            };

            if needs_fallible && !is_result_ret {
                if ret_type == "()" {
                    block_code.push_str(&format!("        {};\n", body_expr));
                    block_code.push_str("        Ok(())\n");
                } else {
                    block_code.push_str(&format!("        Ok({})\n", body_expr));
                }
            } else {
                block_code.push_str(&format!("        {}\n", body_expr));
            }
            block_code.push_str("    }\n");
        }

        // メソッドが1つ以上ある場合のみ、implブロックを出力
        if has_methods {
            code.push_str("#[wasm_bindgen]\n");
            code.push_str(&format!("impl {} {{\n", wasm_struct_name));
            code.push_str(&block_code);
            code.push_str("}\n\n");
        }
    }

    append_type_api_wasm_exports(
        &mut code,
        report,
        &config.known_boundary_types,
        &config.known_dto_types,
    );

    let mut file = File::create(output_path)?;
    file.write_all(code.as_bytes())?;
    println!("Generated Wasm lib at: {}", output_path);
    Ok(())
}

fn append_type_api_wasm_exports(
    code: &mut String,
    report: &ApiReport,
    known_boundary_types: &[String],
    known_dto_types: &[String],
) {
    if report.type_apis.is_empty() {
        return;
    }

    code.push_str("// --- Type API boundary functions ---\n");
    if report
        .type_apis
        .iter()
        .any(|api| is_matrix_type(&api.target_type))
    {
        code.push_str(
            "fn encode_matrix_to_string<T>(matrix: Matrix<T>) -> String\nwhere\n    T: ToString + Scalar,\n{\n    let mut rows = Vec::with_capacity(matrix.rows);\n    for r in 0..matrix.rows {\n        let mut cols = Vec::with_capacity(matrix.cols);\n        for c in 0..matrix.cols {\n            cols.push(matrix[(r, c)].to_string());\n        }\n        rows.push(cols.join(\",\"));\n    }\n    rows.join(\";\")\n}\n\n",
        );
    }
    // The registry is the single source of truth for the values that may cross
    // the wasm boundary.  A type API target is included explicitly because it
    // can be generic (e.g. `Matrix<Rational>`) and is therefore not always
    // discoverable from a struct declaration in this crate alone.
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
        .chain(known_dto_types.iter().cloned())
        .collect::<Vec<_>>();
    let registry = CodecRegistry::with_dto_types(boundary_types, dto_types);

    for api in &report.type_apis {
        for func in &api.functions {
            if func.visibility != "pub" {
                continue;
            }
            match render_type_api_wasm_function(api, func, &registry) {
                Ok(rendered) => {
                    code.push_str(&rendered);
                    code.push('\n');
                }
                Err(reason) => eprintln!(
                    "[inspector] skipped Type API WASM export {}::{}: {}",
                    api.api_struct, func.name, reason
                ),
            }
        }
    }
}

fn render_type_api_wasm_function(
    api: &TypeApiInfo,
    func: &FunctionInfo,
    registry: &CodecRegistry,
) -> std::result::Result<String, String> {
    let export_name = type_api_export_name(api, &func.name);
    let mut sig_args = Vec::new();
    let mut setup = Vec::new();
    let mut call_args = Vec::new();

    let args = func.boundary_args();
    if args.len() != func.args.len() {
        return Err("incomplete structured argument metadata".to_string());
    }
    for arg in args {
        if arg.is_receiver {
            return Err("Type API methods must be static".to_string());
        }
        let arg_ident = arg.name.trim_start_matches("mut ").to_string();
        let CodecPlan::Supported(codec) = registry.classify_arg(&arg.rust_type) else {
            let CodecPlan::Unsupported(reason) = registry.classify_arg(&arg.rust_type) else {
                unreachable!("codec plan changed between matches")
            };
            return Err(format!("argument '{}': {}", arg.name, reason.reason));
        };

        if matches!(codec.mode, BoundaryMode::String) {
            // Custom values retain the stable text boundary.  Their parser is
            // deliberately kept inside Rust, while primitives use wasm-bindgen
            // native values below.
            if matches!(arg.rust_type.without_reference(), RustType::Vec(_)) {
                return Err(format!(
                    "argument '{}': Vec<custom type> string boundaries are not implemented",
                    arg.name
                ));
            }
            sig_args.push(format!("{}: &str", arg_ident));
            setup.push(format!(
                "    let {0}_value: {1} = parse_from_str({0})?;",
                arg_ident,
                arg.rust_type.without_reference().canonical()
            ));
            call_args.push(format!("{}_value", arg_ident));
        } else if matches!(codec.mode, BoundaryMode::Dto) {
            sig_args.push(format!("{}_value: JsValue", arg_ident));
            setup.push(format!(
                "    let {0}: {1} = serde_wasm_bindgen::from_value({0}_value).map_err(|e| JsError::new(&e.to_string()))?;",
                arg_ident,
                arg.rust_type.without_reference().canonical()
            ));
            let call_arg = if arg.rust_type.is_mut_reference() {
                format!("&mut {}", arg_ident)
            } else if matches!(arg.rust_type, RustType::Reference { .. }) {
                format!("&{}", arg_ident)
            } else {
                arg_ident
            };
            call_args.push(call_arg);
        } else {
            sig_args.push(format!("{}: {}", arg_ident, codec.wasm_arg_type));
            let call_arg = if arg.rust_type.is_mut_reference() {
                sig_args.pop();
                sig_args.push(format!("mut {}: {}", arg_ident, codec.wasm_arg_type));
                format!("&mut {}", arg_ident)
            } else if matches!(arg.rust_type, RustType::Reference { .. }) {
                format!("&{}", arg_ident)
            } else {
                arg_ident
            };
            call_args.push(call_arg);
        }
    }

    let ret_ty = func.boundary_return();
    let (value_ty, is_result) = match &ret_ty {
        RustType::Result { ok, .. } => (ok.as_ref(), true),
        _ => (&ret_ty, false),
    };
    let CodecPlan::Supported(return_codec) = registry.classify_return(value_ty) else {
        let CodecPlan::Unsupported(reason) = registry.classify_return(value_ty) else {
            unreachable!("codec plan changed between matches")
        };
        return Err(format!("return value: {}", reason.reason));
    };
    let call = format!(
        "{}::{}({})",
        api.api_struct,
        func.name,
        call_args.join(", ")
    );
    let body = match value_ty {
        _ if matches!(return_codec.mode, BoundaryMode::Dto) => {
            if is_result {
                format!(
                    "    let out = {call}.map_err(|e| js_error_from_to_app_error(e, None))?;\n    serde_wasm_bindgen::to_value(&out).map_err(|e| JsError::new(&e.to_string()))"
                )
            } else {
                format!(
                    "    serde_wasm_bindgen::to_value(&{call}).map_err(|e| JsError::new(&e.to_string()))"
                )
            }
        }
        ty if matches!(return_codec.mode, BoundaryMode::String) => {
            let encoder = rust_string_boundary_encoder("out", ty);
            if is_result {
                format!(
                    "    let out = {call}.map_err(|e| js_error_from_to_app_error(e, None))?;\n    Ok({encoder})"
                )
            } else {
                let encoder = rust_string_boundary_encoder(&call, ty);
                format!("    Ok({encoder})")
            }
        }
        RustType::Unit => {
            if is_result {
                format!("    {call}.map_err(|e| js_error_from_to_app_error(e, None))")
            } else {
                format!("    {call};\n    Ok(())")
            }
        }
        _ if is_result => {
            format!(
                "    let out = {call}.map_err(|e| js_error_from_to_app_error(e, None))?;\n    Ok(out)"
            )
        }
        _ => format!("    Ok({call})"),
    };

    let ret_sig = format!(
        "std::result::Result<{}, JsError>",
        return_codec.wasm_return_type
    );

    let mut out = String::new();
    out.push_str("#[wasm_bindgen]\n");
    out.push_str(&format!(
        "pub fn {}({}) -> {} {{\n",
        export_name,
        sig_args.join(", "),
        ret_sig
    ));
    for line in setup {
        out.push_str(&line);
        out.push('\n');
    }
    out.push_str(&body);
    out.push_str("\n}\n");
    Ok(out)
}

// ... (Helper Enums/Functions は以前のまま) ...
enum ArgConversion {
    None,
    InnerRef,
    InnerMove,
    InnerClone,
}

#[derive(Clone, Copy, Debug)]
enum ErrConversion {
    ToAppError,
    DebugString,
}

enum RetConversion {
    None,
    Wrap(String),
    ResultWrap(String, ErrConversion),
    ResultSimple(ErrConversion),
    VecToCsv,
}

fn convert_arg_type(
    raw_type: &str,
    self_wrapper: &str,
    valid_structs: &HashSet<String>,
) -> (String, ArgConversion) {
    let t = raw_type.trim();
    // syn token streams often emit borrowed strings as "& str" (with a space).
    // Normalize common cases so we don't incorrectly treat them as unsupported.
    let t_no_space = t.replace(' ', "");

    match t_no_space.as_str() {
        "i64" | "u64" | "i32" | "u32" | "f64" | "f32" | "bool" | "usize" | "isize" => {
            return (t_no_space.to_string(), ArgConversion::None);
        }
        "String" => return ("String".to_string(), ArgConversion::None),
        "&str" => return ("&str".to_string(), ArgConversion::None),
        "Self" => return (self_wrapper.to_string(), ArgConversion::InnerMove),
        _ => {}
    }

    if t_no_space.starts_with('&') {
        // Use the original string to preserve things like "& mut T", but normalize spaces.
        let inner = t.trim_start_matches('&').trim();
        let inner_no_space = inner.replace(' ', "");
        if inner == "Self" {
            return (format!("&{}", self_wrapper), ArgConversion::InnerRef);
        }
        if inner_no_space == "str" {
            return ("&str".to_string(), ArgConversion::None);
        }
        if valid_structs.contains(&inner_no_space) {
            return (format!("&Wasm{}", inner_no_space), ArgConversion::InnerRef);
        }
        return (String::new(), ArgConversion::None);
    }
    if valid_structs.contains(&t_no_space) {
        // ★変更: 安全のため常に Clone して渡す
        // (パフォーマンスは落ちるが、null pointer エラーは防げる)
        return (format!("Wasm{}", t_no_space), ArgConversion::InnerClone);
    }
    (String::new(), ArgConversion::None)
}

fn convert_return_type(
    raw_type: &str,
    self_wrapper: &str,
    valid_structs: &HashSet<String>,
) -> (String, RetConversion) {
    let t = raw_type.trim();

    let t_no_space = t.replace(' ', "");
    if t_no_space.starts_with("Vec<") && t_no_space.ends_with('>') {
        let inner = &t_no_space[4..t_no_space.len() - 1];

        // Prefer typed arrays for primitive numeric vectors.
        if inner == "f64" || inner == "f32" || inner == "u8" {
            return (format!("Vec<{}>", inner), RetConversion::None);
        }

        // Only support Vec<T> where T can be stringified.
        // For custom types in this repo, Display is expected; primitives also work.
        if inner == "Self" || valid_structs.contains(inner) {
            return ("String".to_string(), RetConversion::VecToCsv);
        }
        match inner {
            "i64" | "u64" | "i32" | "u32" | "f64" | "f32" | "bool" | "usize" | "isize"
            | "String" | "str" => return ("String".to_string(), RetConversion::VecToCsv),
            _ => {
                return (String::new(), RetConversion::None);
            }
        }
    }

    if t == "()" {
        return ("()".to_string(), RetConversion::None);
    }
    match t {
        "i64" | "u64" | "i32" | "u32" | "f64" | "f32" | "bool" | "String" => {
            return (t.to_string(), RetConversion::None);
        }
        "Self" => {
            return (
                self_wrapper.to_string(),
                RetConversion::Wrap(self_wrapper.to_string()),
            );
        }
        _ => {}
    }

    // Result-like return types (fully-qualified or aliased).
    // NOTE: Do NOT try to take the last path segment of the whole type string,
    // because generic arguments can contain `::` paths (e.g. `Result<T, foo::BarError>`).
    if t_no_space.starts_with("Result<") || t_no_space.contains("::Result<") {
        if let Some((ok_ty_raw, err_ty_raw)) = extract_result_ok_err(t) {
            let inner = ok_ty_raw;
            let err_norm = normalize_type_ident(&err_ty_raw);
            let err_path = err_ty_raw.trim().replace(' ', "");
            let is_external_std = err_path.starts_with("std::")
                || err_path.starts_with("core::")
                || err_path.starts_with("alloc::");
            let is_known_internal = !err_path.contains("::")
                || err_path.starts_with("crate::")
                || err_path.starts_with("algebraic::")
                || err_path.starts_with("common::");
            let err_conv = if err_norm.ends_with("Error") && !is_external_std && is_known_internal {
                ErrConversion::ToAppError
            } else {
                ErrConversion::DebugString
            };

            // Result<Vec<T>, E>
            let inner_no_space = inner.replace(' ', "");
            if inner_no_space.starts_with("Vec<") && inner_no_space.ends_with('>') {
                let v_inner = &inner_no_space[4..inner_no_space.len() - 1];
                // Prefer typed arrays for common primitives.
                if v_inner == "f64" || v_inner == "f32" || v_inner == "u8" {
                    return (
                        format!("std::result::Result<Vec<{}>, JsError>", v_inner),
                        RetConversion::ResultSimple(err_conv),
                    );
                }
                // Fallback: CSV string for other Vec<T>.
                match v_inner {
                    "i64" | "u64" | "i32" | "u32" | "f64" | "f32" | "bool" | "usize" | "isize"
                    | "String" | "str" => {
                        return (
                            "std::result::Result<String, JsError>".to_string(),
                            RetConversion::ResultWrap("vec_to_csv".to_string(), err_conv),
                        );
                    }
                    _ => {
                        if v_inner == "Self" || valid_structs.contains(v_inner) {
                            return (
                                "std::result::Result<String, JsError>".to_string(),
                                RetConversion::ResultWrap("vec_to_csv".to_string(), err_conv),
                            );
                        }
                    }
                }
                return (String::new(), RetConversion::None);
            }

            if inner == "Self" {
                return (
                    format!("std::result::Result<{}, JsError>", self_wrapper),
                    RetConversion::ResultWrap(self_wrapper.to_string(), err_conv),
                );
            }
            if inner == "()" {
                return (
                    "std::result::Result<(), JsError>".to_string(),
                    RetConversion::ResultSimple(err_conv),
                );
            }
            match inner.as_str() {
                "String" | "i64" | "u64" | "i32" | "u32" | "f64" | "f32" | "bool" | "usize"
                | "isize" => {
                    return (
                        format!("std::result::Result<{}, JsError>", inner),
                        RetConversion::ResultSimple(err_conv),
                    )
                }
                _ => {
                    if valid_structs.contains(&inner) {
                        let wrapper = format!("Wasm{}", inner);
                        return (
                            format!("std::result::Result<{}, JsError>", wrapper),
                            RetConversion::ResultWrap(wrapper, err_conv),
                        );
                    }
                    return (String::new(), RetConversion::None);
                }
            }
        }

        // Support `Result<T>` aliases (error type is implicit/unknown here).
        if let Some(ok_ty_raw) = extract_generic_inner(t, "Result") {
            let inner = ok_ty_raw;
            let err_conv = ErrConversion::DebugString;

            let inner_no_space = inner.replace(' ', "");
            if inner_no_space.starts_with("Vec<") && inner_no_space.ends_with('>') {
                let v_inner = &inner_no_space[4..inner_no_space.len() - 1];
                if v_inner == "f64" || v_inner == "f32" || v_inner == "u8" {
                    return (
                        format!("std::result::Result<Vec<{}>, JsError>", v_inner),
                        RetConversion::ResultSimple(err_conv),
                    );
                }
                match v_inner {
                    "i64" | "u64" | "i32" | "u32" | "f64" | "f32" | "bool" | "usize" | "isize"
                    | "String" | "str" => {
                        return (
                            "std::result::Result<String, JsError>".to_string(),
                            RetConversion::ResultWrap("vec_to_csv".to_string(), err_conv),
                        );
                    }
                    _ => {
                        if v_inner == "Self" || valid_structs.contains(v_inner) {
                            return (
                                "std::result::Result<String, JsError>".to_string(),
                                RetConversion::ResultWrap("vec_to_csv".to_string(), err_conv),
                            );
                        }
                    }
                }
                return (String::new(), RetConversion::None);
            }

            if inner == "Self" {
                return (
                    format!("std::result::Result<{}, JsError>", self_wrapper),
                    RetConversion::ResultWrap(self_wrapper.to_string(), err_conv),
                );
            }
            if inner == "()" {
                return (
                    "std::result::Result<(), JsError>".to_string(),
                    RetConversion::ResultSimple(err_conv),
                );
            }
            match inner.as_str() {
                "String" | "i64" | "u64" | "i32" | "u32" | "f64" | "f32" | "bool" | "usize"
                | "isize" => {
                    return (
                        format!("std::result::Result<{}, JsError>", inner),
                        RetConversion::ResultSimple(err_conv),
                    )
                }
                _ => {
                    let inner_norm = normalize_type_ident(&inner);
                    if valid_structs.contains(&inner_norm) {
                        let wrapper = format!("Wasm{}", inner_norm);
                        return (
                            format!("std::result::Result<{}, JsError>", wrapper),
                            RetConversion::ResultWrap(wrapper, err_conv),
                        );
                    }
                    return (String::new(), RetConversion::None);
                }
            }
        }

        return (
            "std::result::Result<JsValue, JsError>".to_string(),
            RetConversion::ResultSimple(ErrConversion::DebugString),
        );
    }

    if valid_structs.contains(t) {
        let wrapper = format!("Wasm{}", t);
        return (wrapper.clone(), RetConversion::Wrap(wrapper));
    }

    (String::new(), RetConversion::None)
}

fn normalize_type_ident(type_str: &str) -> String {
    let t = type_str.trim().replace(' ', "");
    let t = t.trim_start_matches('&').trim_start_matches("mut");
    t.rsplit("::").next().unwrap_or("").to_string()
}

fn extract_result_ok_err(type_str: &str) -> Option<(String, String)> {
    let start_key = "Result<";
    let start_key_space = "Result <";
    let start = if let Some(idx) = type_str.find(start_key) {
        idx + start_key.len()
    } else if let Some(idx) = type_str.find(start_key_space) {
        idx + start_key_space.len()
    } else {
        return None;
    };

    let rest = &type_str[start..];
    let mut depth: i32 = 0;
    let mut split_at: Option<usize> = None;
    let mut end_at: Option<usize> = None;
    for (i, ch) in rest.char_indices() {
        match ch {
            '<' => depth += 1,
            '>' => {
                if depth == 0 {
                    end_at = Some(i);
                    break;
                }
                depth -= 1;
            }
            ',' if depth == 0 && split_at.is_none() => split_at = Some(i),
            _ => {}
        }
    }

    let split_at = split_at?;
    let end_at = end_at.or_else(|| rest.rfind('>'))?;

    let ok = rest[..split_at].trim().to_string();
    let err = rest[split_at + 1..end_at].trim().to_string();
    Some((ok, err))
}

fn extract_generic_inner(type_str: &str, outer: &str) -> Option<String> {
    let start_key = format!("{}<", outer);
    let start_key_space = format!("{} <", outer);

    let start = if let Some(idx) = type_str.find(&start_key) {
        idx + start_key.len()
    } else if let Some(idx) = type_str.find(&start_key_space) {
        idx + start_key_space.len()
    } else {
        return None;
    };

    let rest = &type_str[start..];
    let end = rest.find(',').or_else(|| rest.rfind('>'))?;

    Some(rest[0..end].trim().to_string())
}
