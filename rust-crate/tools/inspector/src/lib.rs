pub mod codec;
pub mod error_message_gen;
pub mod notion;
pub mod parser;
pub mod test_gen;
pub mod ts_api_gen;
pub mod ts_gen;
pub mod ts_test_gen;
pub mod types; // ★ types.rs を読み込む
pub mod wasm_dto_gen;
pub mod wasm_gen;

use crate::types::{ApiReport, InspectorConfig};
use convert_case::{Case, Casing};
use std::collections::BTreeSet;
use std::fs;
use std::path::Path;

// 定数
pub const DEFAULT_CRATES_DIR: &str = "crates";
pub const DEFAULT_SPECS_DIR: &str = "api-specs";
pub const DEFAULT_RUNNER_DIR: &str = "integration-tests/tests/common";
pub const DEFAULT_TEST_CASES_DIR: &str = "integration-tests/test_cases";

/// Convert a crate/target name (may contain '-') into a valid Rust identifier.
///
/// Examples:
/// - "finite-field" -> "finite_field"
/// - "source-coding" -> "source_coding"
pub fn to_rust_ident(name: &str) -> String {
    let mut out = String::with_capacity(name.len());
    for ch in name.chars() {
        if ch.is_ascii_alphanumeric() || ch == '_' {
            out.push(ch);
        } else {
            out.push('_');
        }
    }
    if out
        .chars()
        .next()
        .map(|c| c.is_ascii_digit())
        .unwrap_or(false)
    {
        out.insert(0, '_');
    }
    out
}

/// Convert a crate/target name (may contain '-') into a stable TypeScript identifier / file stem.
///
/// Examples:
/// - "finite-field" -> "finiteField"
/// - "signal-processing" -> "signalProcessing"
pub fn to_ts_ident(name: &str) -> String {
    let mut out = name.to_case(Case::Camel);
    // Ensure it's a valid identifier start.
    if out
        .chars()
        .next()
        .map(|c| c.is_ascii_digit())
        .unwrap_or(false)
    {
        out.insert(0, '_');
    }
    out
}

/// 設定ファイルを読み込む
pub fn load_config(path: &str) -> InspectorConfig {
    match fs::read_to_string(path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_else(|e| {
            eprintln!("Warning: Failed to parse config '{}': {}", path, e);
            InspectorConfig::default()
        }),
        Err(_) => InspectorConfig::default(),
    }
}

/// Collect public type names from the generated specs.  Generators use this
/// alongside the current crate's structs so a type API can expose a value
/// defined in one of its dependencies (for example `linalg::Matrix<Rational>`).
pub fn known_boundary_types_from_specs(specs_dir: &str) -> Vec<String> {
    let mut types = BTreeSet::new();
    let Ok(entries) = fs::read_dir(specs_dir) else {
        return Vec::new();
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
            continue;
        }
        let Ok(content) = fs::read_to_string(path) else {
            continue;
        };
        let Ok(report) = serde_json::from_str::<ApiReport>(&content) else {
            continue;
        };
        types.extend(report.structs.into_iter().map(|item| item.name));
    }
    types.into_iter().collect()
}

/// Collect only types which explicitly opted into the DTO boundary.  Serde
/// capability alone is intentionally not enough because it would change the
/// wire contract of legacy string APIs.
pub fn known_dto_types_from_specs(specs_dir: &str) -> Vec<String> {
    let mut types = BTreeSet::new();
    let Ok(entries) = fs::read_dir(specs_dir) else {
        return Vec::new();
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
            continue;
        }
        let Ok(content) = fs::read_to_string(path) else {
            continue;
        };
        let Ok(report) = serde_json::from_str::<ApiReport>(&content) else {
            continue;
        };
        types.extend(
            report
                .structs
                .into_iter()
                .filter(|item| item.dto_candidate && item.dto_enabled)
                .map(|item| item.name),
        );
    }
    types.into_iter().collect()
}

/// ディレクトリをスキャンしてターゲットを自動検出する
pub fn discover_targets(source_dir: &str, ignored: &[String]) -> Vec<String> {
    let mut targets = Vec::new();
    let path = Path::new(source_dir);

    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(file_type) = entry.file_type() {
                if file_type.is_dir() {
                    if let Ok(name) = entry.file_name().into_string() {
                        if !ignored.contains(&name) && !name.starts_with('.') {
                            targets.push(name);
                        }
                    }
                }
            }
        }
    }
    targets.sort();
    targets
}

fn discover_file_stems(dir: &Path, exts: &[&str]) -> Vec<String> {
    let mut out = Vec::new();
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            if let Ok(file_type) = entry.file_type() {
                if !file_type.is_file() {
                    continue;
                }
            }
            let path = entry.path();
            let Some(ext) = path.extension().and_then(|e| e.to_str()) else {
                continue;
            };
            if !exts.iter().any(|x| ext.eq_ignore_ascii_case(x)) {
                continue;
            }
            let Some(stem) = path.file_stem().and_then(|s| s.to_str()) else {
                continue;
            };
            if stem.starts_with('.') {
                continue;
            }
            out.push(stem.to_string());
        }
    }
    out.sort();
    out.dedup();
    out
}

/// 設定ファイルの情報と自動検出をマージ
pub fn resolve_targets(config: &mut InspectorConfig, root_dir: &Path) -> Vec<String> {
    let mut targets: BTreeSet<String> = BTreeSet::new();

    // 1) Config targets (explicit)
    for t in &config.target_crates {
        targets.insert(t.clone());
    }

    // 2) If config is empty, auto-discover crates/
    if config.target_crates.is_empty() {
        let crates_path = root_dir.join(DEFAULT_CRATES_DIR);
        let crates_dir_str = crates_path.to_str().unwrap_or(DEFAULT_CRATES_DIR);
        println!("Info: Auto-discovering crates from '{}'...", crates_dir_str);
        for t in discover_targets(crates_dir_str, &config.ignored_crates) {
            targets.insert(t);
        }
    }

    // 3) Always union with YAML stems under integration-tests/test_cases
    let cases_dir = root_dir.join(DEFAULT_TEST_CASES_DIR);
    if cases_dir.exists() {
        for t in discover_file_stems(&cases_dir, &["yml", "yaml"]) {
            targets.insert(t);
        }
    }

    // 4) Filter ignored crates
    let mut resolved: Vec<String> = targets
        .into_iter()
        .filter(|t| !config.ignored_crates.contains(t))
        .collect();

    resolved.sort();
    config.target_crates = resolved.clone();
    resolved
}
