use libtest_mimic::{Arguments, Trial};
use serde::Deserialize;
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

mod common;

#[derive(Deserialize)]
struct TestCase {
    function: String,
    inputs: Vec<String>,
    #[serde(default)]
    expected: String,
    #[serde(default)]
    expected_error: Option<ExpectedError>,
}

#[derive(Deserialize)]
struct ExpectedError {
    code: String,
    message: String,
}

// ★修正1: フィールドがない場合でもパニックしないようにデフォルト値を許可
#[derive(Deserialize)]
struct Config {
    #[serde(default)]
    target_crates: Vec<String>,
    #[serde(default)]
    ignored_crates: Vec<String>,
}

fn main() {
    let args = Arguments::from_args();
    // CARGO_MANIFEST_DIR は "path/to/rust-crate/integration-tests" を指します
    let manifest_dir =
        PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR not set"));

    // プロジェクトルート (rust-crate/)
    let project_root = manifest_dir
        .parent()
        .expect("Failed to get project root")
        .to_path_buf();

    // 設定ファイルの読み込み
    let config_path = project_root.join("inspector_config.json");
    let config_file = fs::File::open(&config_path)
        .unwrap_or_else(|_| panic!("config not found at {:?}", config_path));
    let mut config: Config = serde_json::from_reader(config_file).expect("invalid config json");

    // test_cases/*.yml から YAML を持つクレートを検知（ハイフン含む名前もそのまま扱う）
    let mut yaml_crates: Vec<String> = Vec::new();
    let test_cases_dir = manifest_dir.join("test_cases");
    if let Ok(entries) = fs::read_dir(&test_cases_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) != Some("yml") {
                continue;
            }
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                let name = stem.to_string();
                if !config.ignored_crates.contains(&name) {
                    yaml_crates.push(name);
                }
            }
        }
    }
    yaml_crates.sort();
    yaml_crates.dedup();

    // 既存の target_crates に、YAML が存在するクレートを追加（union）。
    // これにより "YAML を置けばテストが走る" 挙動に揃える。
    if config.target_crates.is_empty() {
        config.target_crates = yaml_crates;
        if config.target_crates.is_empty() {
            println!("Info: No YAML test cases found; no integration tests will run.");
        }
    } else {
        for name in yaml_crates {
            if !config.target_crates.contains(&name) {
                config.target_crates.push(name);
            }
        }
        config.target_crates.sort();
        config.target_crates.dedup();
    }

    let mut tests = Vec::new();

    // ログディレクトリの作成 (integration-tests/tests/logs)
    let log_dir = manifest_dir.join("logs");
    fs::create_dir_all(&log_dir).expect("failed to create log dir");

    for crate_name in config.target_crates {
        if crate_name == "test-cases" {
            println!("Skipping {} (spec-only pseudo target)", crate_name);
            continue;
        }
        // テストケースYAMLのパス (integration-tests/tests/test_cases/{crate}.yml)
        let yaml_path = manifest_dir.join(format!("test_cases/{}.yml", crate_name));

        if !yaml_path.exists() {
            println!("Skipping {} (no yaml found at {:?})", crate_name, yaml_path);
            continue;
        }

        let file = fs::File::open(&yaml_path).expect("YAML open failed");
        let cases: Vec<TestCase> = serde_yaml::from_reader(file).expect("Invalid YAML");

        let log_path = log_dir.join(format!("{}.log", crate_name));
        let log_file = File::create(&log_path).expect("failed to create log file");
        let logger = Arc::new(Mutex::new(log_file));

        for case in cases {
            let test_name = format!("{}::{} {:?}", crate_name, case.function, case.inputs);
            let target_crate = crate_name.clone();
            let logger_clone = logger.clone();

            tests.push(Trial::test(test_name, move || {
                // ディスパッチャ経由で実行
                let result = common::dispatch_test(&target_crate, &case.function, &case.inputs);

                let (status, detail) = match result {
                    Ok(actual) => {
                        if let Some(expected_error) = &case.expected_error {
                            (
                                "FAIL",
                                format!(
                                    "Expected error {}: {}, but succeeded with: {}",
                                    expected_error.code, expected_error.message, actual
                                ),
                            )
                        } else if actual == case.expected {
                            ("PASS", "".to_string())
                        } else {
                            (
                                "FAIL",
                                format!("Expected: {}, Actual: {}", case.expected, actual),
                            )
                        }
                    }
                    Err(e) => {
                        if let Some(expected_error) = &case.expected_error {
                            if e.contains(&expected_error.code)
                                && e.contains(&expected_error.message)
                            {
                                ("PASS", String::new())
                            } else {
                                (
                                    "FAIL",
                                    format!(
                                        "Expected error {}: {}, actual: {}",
                                        expected_error.code, expected_error.message, e
                                    ),
                                )
                            }
                        } else {
                            ("ERROR", format!("Runtime Error: {}", e))
                        }
                    }
                };

                {
                    let mut f = logger_clone.lock().unwrap();
                    writeln!(
                        f,
                        "[{}] {} {:?} -> {}",
                        status, case.function, case.inputs, detail
                    )
                    .unwrap();
                }

                if status == "PASS" {
                    Ok(())
                } else {
                    Err(detail.into())
                }
            }));
        }
    }

    libtest_mimic::run(&args, tests).exit();
}
