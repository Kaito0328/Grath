use anyhow::{anyhow, Result};
use convert_case::{Case, Casing};
use regex::Regex;
use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::{Path, PathBuf};

use crate::types::ApiReport;

fn ensure_parent_dir(path: &Path) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    Ok(())
}

fn write_file_if_missing(path: &Path, content: &str) -> Result<bool> {
    if path.exists() {
        return Ok(false);
    }
    ensure_parent_dir(path)?;
    fs::write(path, content)?;
    Ok(true)
}

fn escape_ts_string(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
}

fn base_message_from_thiserror_template(template: &str) -> String {
    let mut s = template.trim().to_string();
    if let Some(before_colon) = s.split(':').next() {
        // If the template contains parameters, the prefix before ':' is usually stable.
        if s.contains('{') || s.contains('}') || s.contains("'{") {
            s = before_colon.trim().to_string();
        }
    }
    while s.ends_with('.') {
        s.pop();
    }
    s
}

fn find_rs_files(dir: &Path) -> Result<Vec<PathBuf>> {
    let mut out = Vec::new();
    if !dir.exists() {
        return Ok(out);
    }
    for entry in walkdir::WalkDir::new(dir).into_iter().flatten() {
        let p = entry.path();
        if entry.file_type().is_file() {
            if p.extension().and_then(|x| x.to_str()) == Some("rs") {
                out.push(p.to_path_buf());
            }
        }
    }
    Ok(out)
}

fn extract_variant_messages_from_source(source: &str) -> BTreeMap<String, String> {
    // Matches:
    // #[error("...")]
    // VariantName
    // VariantName(...)
    // VariantName { ... }
    let re = Regex::new(
        r#"#\[error\(\"(?P<msg>(?:\\\\.|[^\"\\\\])*)\"\)\]\s*\n\s*(?P<variant>[A-Za-z0-9_]+)"#,
    )
    .expect("regex");

    let mut map = BTreeMap::new();
    for caps in re.captures_iter(source) {
        let msg_raw = caps.name("msg").map(|m| m.as_str()).unwrap_or_default();
        let variant = caps
            .name("variant")
            .map(|m| m.as_str())
            .unwrap_or_default()
            .to_string();
        let msg = base_message_from_thiserror_template(msg_raw);
        map.insert(variant, msg);
    }
    map
}

fn collect_error_variants_from_spec(report: &ApiReport) -> BTreeSet<String> {
    let mut out = BTreeSet::new();
    for s in &report.structs {
        if !s.name.ends_with("Error") {
            continue;
        }
        // In our spec format, enums are represented as "structs" with fields that look like variants.
        for f in &s.fields {
            let trimmed = f.trim();
            if trimmed.is_empty() {
                continue;
            }
            let name = trimmed
                .split(['(', ' ', '{'].as_ref())
                .next()
                .unwrap_or(trimmed)
                .trim();
            // Filter out struct fields like `code: String` (which would otherwise become `code:`).
            // We treat only PascalCase identifiers as enum-like variants.
            if name.is_empty() || name.contains(':') {
                continue;
            }
            let first = name.chars().next().unwrap_or('_');
            if !first.is_ascii_uppercase() {
                continue;
            }
            if name.chars().all(|c| c.is_ascii_alphanumeric() || c == '_') {
                out.insert(name.to_string());
            }
        }
    }
    out
}

fn load_report(specs_dir: &Path, crate_name: &str) -> Result<ApiReport> {
    let json_path = specs_dir.join(format!("{}.json", crate_name));
    let content = fs::read_to_string(&json_path)
        .map_err(|e| anyhow!("Failed to read spec {:?}: {}", json_path, e))?;
    let report: ApiReport = serde_json::from_str(&content)
        .map_err(|e| anyhow!("Failed to parse spec {:?}: {}", json_path, e))?;
    Ok(report)
}

pub fn generate_error_code_messages_for_crate(args: GenerateArgs) -> Result<()> {
    let specs_dir = Path::new(&args.specs_dir);
    let report = load_report(specs_dir, &args.crate_name)?;
    let expected_variants = collect_error_variants_from_spec(&report);

    let src_dir = Path::new("crates").join(&args.crate_name).join("src");
    let mut variant_to_message: BTreeMap<String, String> = BTreeMap::new();
    for rs in find_rs_files(&src_dir)? {
        let content = fs::read_to_string(&rs)?;
        for (k, v) in extract_variant_messages_from_source(&content) {
            variant_to_message.entry(k).or_insert(v);
        }
    }

    let mut entries: Vec<(String, String)> = Vec::new();
    for v in expected_variants {
        let msg = variant_to_message
            .get(&v)
            .cloned()
            .unwrap_or_else(|| v.clone());
        entries.push((v, msg));
    }

    let out_path = Path::new(&args.output_file);
    ensure_parent_dir(out_path)?;

    let app_error_import_path = {
        let out_str = out_path.to_string_lossy();
        // Feature configs live at: web-app/src/features/<crate>/config/...
        // Common (shared) config lives at: web-app/src/shared/errors/...
        if out_str.contains("/web-app/src/shared/errors/") {
            "./appError"
        } else {
            "../../../shared/errors/appError"
        }
    };

    let mut lines = Vec::new();
    lines.push(format!(
        "import type {{ ErrorCodeMessageMap }} from \"{}\";",
        app_error_import_path
    ));
    lines.push("".to_string());
    lines.push("// =============================================".to_string());
    lines.push("// THIS FILE IS AUTO-GENERATED.".to_string());
    lines.push("// DO NOT EDIT THIS FILE BY HAND.".to_string());
    lines.push("//".to_string());
    let overrides_file = if out_path
        .to_string_lossy()
        .contains("/web-app/src/shared/errors/")
    {
        "commonErrorCodeMessages.ts"
    } else {
        "errorCodeMessages.ts"
    };
    lines.push(format!("// Edit overrides in: {}", overrides_file));
    lines.push("// Regenerate via: cargo run -p inspector -- error-messages".to_string());
    lines.push("// =============================================".to_string());
    lines.push("".to_string());
    lines.push("// Auto-generated by inspector (error-messages).".to_string());
    lines.push("// Source: Rust error enums (thiserror + AsRefStr).".to_string());
    lines.push("// - Keys are error `code` values.".to_string());
    lines.push("// - Values are generic messages (no dynamic placeholders).".to_string());
    lines.push("".to_string());
    let const_name = format!(
        "generated{}ErrorCodeMessageMap",
        args.crate_name.to_case(Case::Pascal)
    );
    lines.push(format!(
        "export const {}: ErrorCodeMessageMap = {{",
        const_name
    ));
    for (code, msg) in entries {
        let msg_ts = escape_ts_string(&msg);
        lines.push(format!(
            "\t{}: {{ ja: \"{}\", en: \"{}\" }},",
            code, msg_ts, msg_ts
        ));
    }
    lines.push("};".to_string());
    lines.push("".to_string());

    fs::write(out_path, lines.join("\n"))?;
    println!(
        "[inspector] generated error code messages -> {:?}",
        out_path
    );
    Ok(())
}

pub fn ensure_error_code_messages_config_for_crate(
    crate_name: &str,
    generated_out_path: &Path,
) -> Result<()> {
    // For feature crates:
    // - generated: web-app/src/features/<crate>/config/errorCodeMessages.generated.ts
    // - config   : web-app/src/features/<crate>/config/errorCodeMessages.ts
    // For common:
    // - generated: web-app/src/shared/errors/commonErrorCodeMessages.generated.ts
    // - config   : web-app/src/shared/errors/commonErrorCodeMessages.ts

    let is_common = crate_name == "common";
    let config_path = if is_common {
        generated_out_path
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .join("commonErrorCodeMessages.ts")
    } else {
        generated_out_path
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .join("errorCodeMessages.ts")
    };

    let crate_pascal = crate_name.to_case(Case::Pascal);
    let crate_camel = crate_name.to_case(Case::Camel);

    let content = if is_common {
        format!(
			"import type {{ ErrorCodeMessageMap }} from \"./appError\";\n\nimport {{ generatedCommonErrorCodeMessageMap }} from \"./commonErrorCodeMessages.generated\";\n\n// Manual overrides live here.\n// - Keys should match Rust error `code` values.\n// - Values can be locale-specific.\n\nconst overrides: ErrorCodeMessageMap = {{\n\t// Add overrides here.\n}};\n\nexport const commonErrorCodeMessageMap: ErrorCodeMessageMap = {{\n\t...generatedCommonErrorCodeMessageMap,\n\t...overrides,\n}};\n"
		)
    } else {
        format!(
			"import {{\n\terrorToDisplayMessage,\n\ttype ErrorCodeMessageMap,\n\ttype ErrorToDisplayMessageOptions,\n}} from \"../../../shared/errors/appError\";\n\nimport {{ commonErrorCodeMessageMap }} from \"../../../shared/errors/commonErrorCodeMessages\";\nimport {{ generated{crate_pascal}ErrorCodeMessageMap }} from \"./errorCodeMessages.generated\";\n\n// Manual overrides live here.\n// - Keys should match Rust error `code` values.\n// - Values can be locale-specific.\n\nconst overrides: ErrorCodeMessageMap = {{\n\t// Add crate-specific overrides here.\n}};\n\nexport const {crate_camel}ErrorCodeMessageMap: ErrorCodeMessageMap = {{\n\t...commonErrorCodeMessageMap,\n\t...generated{crate_pascal}ErrorCodeMessageMap,\n\t...overrides,\n}};\n\nexport function {crate_camel}ErrorToDisplayMessage(err: unknown, options?: ErrorToDisplayMessageOptions): string {{\n\tconst merged = options?.codeMessageMap\n\t\t? {{ ...{crate_camel}ErrorCodeMessageMap, ...options.codeMessageMap }}\n\t\t: {crate_camel}ErrorCodeMessageMap;\n\n\treturn errorToDisplayMessage(err, {{ ...options, codeMessageMap: merged }});\n}}\n"
		)
    };

    if write_file_if_missing(&config_path, &content)? {
        println!("[inspector] scaffolded config -> {:?}", config_path);
    }
    Ok(())
}

pub struct GenerateArgs {
    pub crate_name: String,
    pub specs_dir: String,
    pub output_file: String,
}
