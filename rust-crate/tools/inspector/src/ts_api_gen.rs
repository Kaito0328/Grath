use crate::types::ApiReport;
use anyhow::Result;
use convert_case::Casing;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;

fn resolve_wasm_dts_path(output_dir: &Path) -> std::path::PathBuf {
    for ancestor in output_dir.ancestors() {
        let candidate = ancestor.join("wasm-pkg/wasm_lib.d.ts");
        if candidate.exists() {
            return candidate;
        }
    }

    output_dir
        .parent()
        .and_then(Path::parent)
        .map(|root| root.join("wasm-pkg/wasm_lib.d.ts"))
        .unwrap_or_else(|| Path::new("wasm-pkg/wasm_lib.d.ts").to_path_buf())
}

fn write_file(path: &Path, content: &str) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let mut file = File::create(path)?;
    file.write_all(content.as_bytes())?;
    Ok(())
}

pub fn generate_ts_api_runtime(output_dir: &str) -> Result<()> {
    let path = Path::new(output_dir).join("runtime.ts");
    let code = r#"/* eslint-disable */
/* tslint:disable */
// --- Auto-generated: client-sdk safe API runtime helpers ---

export type AppErrorPayload = {
  code: string;
  message: string;
  details?: string;
};

export const AppErrorCodes = {
  LinalgExactSizeLimit: "LINALG_EXACT_SIZE_LIMIT",
} as const;

/**
 * wasm-bindgen errors often end up as `Error: {"code":...,"message":...}`.
 * This helper extracts the JSON payload when present.
 */
export function tryParseAppErrorMessage(text: string): AppErrorPayload | null {
  const raw = String(text ?? "").trim();
  if (!raw) return null;

  const jsonText = raw.startsWith("Error: ") ? raw.slice("Error: ".length).trim() : raw;
  if (!jsonText.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== "object") return null;
    const code = (parsed as any).code;
    const message = (parsed as any).message;
    const details = (parsed as any).details;
    if (typeof code !== "string" || typeof message !== "string") return null;

    const out: AppErrorPayload = { code, message };
    if (typeof details === "string") out.details = details;
    return out;
  } catch {
    return null;
  }
}

export type EnsureReady = () => void | Promise<void>;

let ensureReady: EnsureReady = () => {};

/**
 * Allows apps (e.g. Next.js) to register a wasm initialization hook.
 * The generated API functions will call this before touching wasm objects.
 */
export function setEnsureReady(fn: EnsureReady) {
  ensureReady = fn;
}

export async function ensureReadyNow() {
  await ensureReady();
}

export type Freeable = { free: () => void };

export type TextLatexable = { toString: () => string; toLatex: () => string };

export type OutputTextLatex = {
  outputText: string;
  outputLatex: string;
};

export type SimplifyResult = OutputTextLatex & {
  inputLatex: string;
};

export function requireTrimmed(text: string, emptyMessage: string) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error(emptyMessage);
  return trimmed;
}

export function safeFree(obj: Freeable | null | undefined) {
  if (!obj) return;
  try {
    obj.free();
  } catch {
    // ignore (may already be consumed)
  }
}

export async function withReady<R>(fn: () => R | Promise<R>) {
  await ensureReadyNow();
  return await fn();
}

export async function withObject<T extends Freeable, R>(factory: () => T, use: (obj: T) => R | Promise<R>) {
  return await withReady(async () => {
    const obj = factory();
    try {
      return await use(obj);
    } finally {
      safeFree(obj);
    }
  });
}

export async function withObjects<T extends Freeable, R>(
  factories: Array<() => T>,
  use: (objs: T[]) => R | Promise<R>,
) {
  return await withReady(async () => {
    const objs: T[] = [];
    try {
      for (const factory of factories) objs.push(factory());
      return await use(objs);
    } finally {
      for (const obj of objs) safeFree(obj);
    }
  });
}

export function toOutputTextLatex(obj: TextLatexable): OutputTextLatex {
  return {
    outputText: obj.toString(),
    outputLatex: obj.toLatex(),
  };
}
"#;
    write_file(&path, code)
}

/// Generates a high-level, JS-value-only API for a given crate.
pub fn generate_ts_api(report: &ApiReport, output_dir: &str, target_crate: &str) -> Result<()> {
    let api_class_path = Path::new(output_dir).join(format!("{}Api.ts", target_crate));
    let mut tera = tera::Tera::default();
    let template = include_str!("../templates/ts_api_class.tera");
    tera.add_raw_template("api_class", template)?;

    let mut structs = Vec::new();
    let mut known_structs = std::collections::HashSet::new();
    let mut prefixes = Vec::new();

    for s in &report.structs {
        if s.name.ends_with("Error") || s.name == "Token" {
            continue;
        }
        known_structs.insert(s.name.clone());
        prefixes.push((s.name.to_case(convert_case::Case::Camel), s.name.clone()));
    }

    // Parse wasm_lib.d.ts to find available wrapper functions
    let wasm_dts_path = resolve_wasm_dts_path(Path::new(output_dir));
    let wasm_dts_content = std::fs::read_to_string(wasm_dts_path).unwrap_or_default();
    let re = regex::Regex::new(r"export function ([a-zA-Z0-9_]+)\((.*?)\): (.*?);").unwrap();

    // Map struct name -> list of specific function bindings
    let mut struct_funcs: std::collections::HashMap<String, Vec<(String, String, String)>> =
        std::collections::HashMap::new();

    for cap in re.captures_iter(&wasm_dts_content) {
        let js_name = cap[1].to_string();
        let args_str = cap[2].to_string();
        let ret_str = cap[3].to_string();

        let mut matched_struct: Option<String> = None;
        for (prefix, sname) in &prefixes {
            if !js_name.starts_with(prefix) {
                continue;
            }
            let suffix = &js_name[prefix.len()..];
            // Guard against accidental matches like struct `F` matching `format_*`.
            let Some(ch) = suffix.chars().next() else {
                continue;
            };
            if !ch.is_ascii_uppercase() {
                continue;
            }
            // To avoid "SymbolicExpr" matching "SymbolicExprDto" by accident,
            // require exact prefix + UpperCamel suffix boundary.
            matched_struct = Some(sname.clone());
            break;
        }

        if let Some(sname) = matched_struct {
            struct_funcs
                .entry(sname)
                .or_default()
                .push((js_name, args_str, ret_str));
        }
    }

    #[derive(serde::Serialize)]
    struct Meth {
        declaration: String,
        body: String,
    }

    #[derive(serde::Serialize)]
    struct SData {
        name: String,
        camel_name: String,
        has_format: bool,
        static_methods: Vec<Meth>,
        instance_methods: Vec<Meth>,
    }

    for s in &report.structs {
        if s.name.ends_with("Error") || s.name == "Token" {
            continue;
        }

        let s_camel = s.name.to_case(convert_case::Case::Camel);
        let dto_name = format!("{}DTO", s.name);
        let ts_dto_name = format!("W.{}Dto", s.name);

        let mut static_methods = Vec::new();
        let mut instance_methods = Vec::new();
        let mut has_format = false;

        // Auto-generate methods based on available wrappers
        let funcs = struct_funcs.get(&s.name).cloned().unwrap_or_default();

        for (js_name, args_str, ret_str) in funcs {
            let func_suffix = if js_name.starts_with(&s_camel) {
                &js_name[s_camel.len()..] // e.g., "ParseDto"
            } else {
                continue;
            };

            // Heuristics to skip or handle special cases
            if func_suffix == "FormatDto" {
                has_format = true;
                continue; // Handled specially in toString()
            }

            // Determine if it's static or instance based on the first argument type
            let args_split: Vec<&str> = args_str
                .split(',')
                .map(|s| s.trim())
                .filter(|s| !s.is_empty())
                .collect();
            let first_arg_is_multi = args_split
                .first()
                .map(|a| a.contains("terms") || a.contains("factors") || a.contains("array"))
                .unwrap_or(false);
            let is_instance = !first_arg_is_multi
                && args_split
                    .first()
                    .map(|a| {
                        a.contains("JsValue") || a.contains("any") || a.ends_with(&ts_dto_name)
                    })
                    .unwrap_or(false)
                && (!func_suffix.contains("Parse")
                    && !func_suffix.contains("Create")
                    && !func_suffix.contains("TryNew")
                    && !func_suffix.contains("From")
                    && !func_suffix.contains("New"));

            let mut ts_args_decl = Vec::new();
            let mut wrapper_call_args = Vec::new();

            for (i, arg_raw) in args_split.iter().enumerate() {
                let parts: Vec<&str> = arg_raw.split(':').collect();
                if parts.len() == 2 {
                    let mut name = parts[0].trim().to_string();
                    let mut ty = parts[1].trim().to_string();

                    if i == 0 && is_instance && (ty == "any" || ty.ends_with("Dto")) {
                        // Skip `self` arg in declaration, handled by `this._dto` in call
                        wrapper_call_args.push("this._dto".to_string());
                        continue;
                    }

                    if ty == "any" || ty.ends_with("Dto") {
                        if name.contains("terms")
                            || name.contains("factors")
                            || name.contains("array")
                        {
                            // It's expecting an array of this class
                            ty = format!("{}[]", s.name);
                            wrapper_call_args.push(format!("{}.map((x) => x.toDTO())", name));
                        } else {
                            // Assume it takes another single instance of this class or related class.
                            ty = format!("{}", s.name);
                            wrapper_call_args.push(format!("{}.toDTO()", name));
                        }
                    } else if (ty == "number" || ty == "bigint")
                        && (name == "numer" || name == "denom" || name == "n" || name == "d")
                    {
                        ty = "number".to_string(); // expose strict safety to JS APIs
                        wrapper_call_args
                            .push(format!("requireSafeInteger({}, \"{}\")", name, name));
                    } else if ty == "bigint" {
                        ty = "bigint | number".to_string();
                        wrapper_call_args.push(format!("BigInt(Math.floor(Number({})))", name));
                    } else {
                        wrapper_call_args.push(name.clone());
                    }
                    if name == "self" {
                        name = "other".to_string();
                    }
                    ts_args_decl.push(format!("{}: {}", name, ty));
                }
            }

            // Determine Return Type
            let mut final_ret = ret_str.trim().to_string();
            let mut return_wrapper = "out".to_string();
            if final_ret == "any" || final_ret.ends_with("Dto") {
                if func_suffix.contains("Format") || func_suffix.contains("ToLatex") {
                    final_ret = "string".to_string();
                } else if func_suffix.contains("Is") {
                    final_ret = "boolean".to_string();
                } else {
                    final_ret = format!("{}", s.name);
                    return_wrapper = format!("new {}(out as {})", s.name, dto_name);
                }
            } else if final_ret == "void" {
                return_wrapper = "".to_string();
            }

            // Method Declaration Name
            let mut meth_name = func_suffix.to_case(convert_case::Case::Camel);
            meth_name = meth_name.replace("Dto", "");

            // Map "parse" specifically to "fromString" as per the user's legacy API preference
            if meth_name == "parse" {
                meth_name = "fromString".to_string();
            }

            let declaration = if is_instance {
                format!(
                    "async {}({}): Promise<{}>",
                    meth_name,
                    ts_args_decl.join(", "),
                    final_ret
                )
            } else {
                format!(
                    "static async {}({}): Promise<{}>",
                    meth_name,
                    ts_args_decl.join(", "),
                    final_ret
                )
            };

            let call_stmt = if final_ret != "void" && final_ret != "unknown" {
                format!(
                    "const out = W.{}({});\n    return {};",
                    js_name,
                    wrapper_call_args.join(", "),
                    return_wrapper
                )
            } else {
                format!("W.{}({});", js_name, wrapper_call_args.join(", "))
            };

            let body = format!(
                "return await withReady(() => {{\n      {}\n    }});",
                call_stmt
            );

            let meth = Meth { declaration, body };
            if is_instance {
                instance_methods.push(meth);
            } else {
                static_methods.push(meth);
            }
        }

        structs.push(SData {
            name: s.name.clone(),
            camel_name: s_camel,
            has_format,
            static_methods,
            instance_methods,
        });
    }

    let mut context = tera::Context::new();
    context.insert("crate_name", target_crate);
    context.insert("structs", &structs);

    let code = tera.render("api_class", &context)?;
    write_file(&api_class_path, &code)?;

    Ok(())
}
