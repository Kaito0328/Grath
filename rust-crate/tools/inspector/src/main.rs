use anyhow::Result;
use clap::{Parser, Subcommand};
use convert_case::Casing;
use dotenv::dotenv;
use inspector_lib::types::ApiReport;
use inspector_lib::{
    discover_targets, error_message_gen, known_boundary_types_from_specs,
    known_dto_types_from_specs, load_config, notion, parser, resolve_targets, test_gen,
    to_rust_ident, to_ts_ident, ts_api_gen, ts_gen, ts_test_gen, wasm_dto_gen, wasm_gen,
    DEFAULT_CRATES_DIR, DEFAULT_RUNNER_DIR, DEFAULT_SPECS_DIR, DEFAULT_TEST_CASES_DIR,
};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Parser)]
#[command(name = "inspector")]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,

    /// Target crate name. If omitted, uses config targets.
    #[arg(short = 'n', long, global = true)]
    crate_name: Option<String>,

    #[arg(
        short = 'c',
        long,
        global = true,
        default_value = "inspector_config.json"
    )]
    config: String,
}

#[derive(Subcommand)]
enum Commands {
    /// Run the standard generation pipeline (default)
    Dev,

    /// Run the standard generation pipeline + Notion sync/fetch (if env is set)
    Full,

    /// Generate JSON specs from Rust crates
    Spec {
        #[arg(long, default_value = DEFAULT_CRATES_DIR)]
        source_dir: String,
        #[arg(long, default_value = DEFAULT_SPECS_DIR)]
        output_dir: String,
    },

    Sync {
        #[arg(long, default_value = DEFAULT_SPECS_DIR)]
        specs_dir: String,
    },

    /// Generate Rust test runners from JSON specs
    Runner {
        #[arg(long, default_value = DEFAULT_SPECS_DIR)]
        specs_dir: String,
        #[arg(long, default_value = DEFAULT_RUNNER_DIR)]
        output_dir: String,
    },

    FetchTests {
        #[arg(long, default_value = DEFAULT_TEST_CASES_DIR)]
        output_dir: String,
    },

    PushTests {
        #[arg(long, default_value = DEFAULT_TEST_CASES_DIR)]
        input_dir: String,
    },

    Test {
        #[arg(long, default_value = DEFAULT_TEST_CASES_DIR)]
        output_dir: String,
    },

    /// Generate wasm crate source (rust-crate/wasm/src)
    WasmGen {
        #[arg(long, default_value = DEFAULT_SPECS_DIR)]
        specs_dir: String,
        // wasm生成自体は一時的なソースコード生成なので、デフォルトは内部のwasmクレートでOK
        #[arg(long, default_value = "wasm/src")]
        output_dir: String,
    },

    /// Build wasm package via wasm-pack
    WasmBuild {
        #[arg(long, default_value = "wasm")]
        crate_dir: String,

        // ★追加: ビルド成果物(pkg)の出力先 (Option)
        #[arg(long)]
        output_dir: Option<String>,
    },

    /// Generate TypeScript wrappers
    Ts {
        #[arg(long, default_value = DEFAULT_SPECS_DIR)]
        specs_dir: String,

        // ★変更: default_valueを削除し Option<String> に変更
        #[arg(long)]
        output_dir: Option<String>,
    },

    /// Generate high-level TypeScript safe APIs (JS-value-only)
    TsApi {
        #[arg(long, default_value = DEFAULT_SPECS_DIR)]
        specs_dir: String,

        #[arg(long)]
        output_dir: Option<String>,
    },

    /// Generate TypeScript tests from YAML cases
    TsTest {
        #[arg(long, default_value = DEFAULT_SPECS_DIR)]
        specs_dir: String,
        #[arg(long, default_value = DEFAULT_TEST_CASES_DIR)]
        cases_dir: String,

        // ★変更: default_valueを削除し Option<String> に変更
        #[arg(long)]
        output_dir: Option<String>,
    },

    /// Generate frontend error-code message maps (.generated.ts)
    ErrorMessages {
        #[arg(long, default_value = DEFAULT_SPECS_DIR)]
        specs_dir: String,

        /// Output file path (workspace-relative). Defaults to web-app algebraic config.
        #[arg(long)]
        output_file: Option<String>,
    },
}

/// Formats files fully owned by Inspector after generation.
///
/// Keeping generated Rust source rustfmt-formatted is required for two
/// reasons: `cargo fmt -- --check` must pass on a fresh checkout, and a second
/// Inspector run must not recreate a formatting-only Git diff.
fn format_generated_rust_files(paths: impl IntoIterator<Item = PathBuf>) -> Result<()> {
    let mut paths: Vec<PathBuf> = paths.into_iter().filter(|path| path.is_file()).collect();
    paths.sort();
    paths.dedup();

    if paths.is_empty() {
        return Ok(());
    }

    let status = Command::new("rustfmt").args(&paths).status()?;
    if !status.success() {
        anyhow::bail!("rustfmt failed for Inspector-generated Rust files");
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    let cli = Cli::parse();

    // Run relative to the rust-crate root regardless of current working directory.
    // This keeps auto-discovery and default relative paths stable.
    let root_dir = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .canonicalize()?;
    std::env::set_current_dir(&root_dir)?;

    // 1. 設定読み込み
    let mut config = load_config(&cli.config);
    // 2. ターゲット解決
    resolve_targets(&mut config, &root_dir);
    config.known_boundary_types = known_boundary_types_from_specs(DEFAULT_SPECS_DIR);
    config.known_dto_types = known_dto_types_from_specs(DEFAULT_SPECS_DIR);

    // ヘルパー: ターゲット取得
    let get_targets = |opt: Option<String>| -> Vec<String> {
        if let Some(c) = opt {
            vec![c]
        } else {
            config.target_crates.clone()
        }
    };

    let targets = get_targets(cli.crate_name.clone());
    // A partial generation run may update only one crate, but shared generated
    // files (most notably the integration-test dispatcher) must retain every
    // currently configured target. Include an explicitly requested crate as it
    // may not have a YAML file yet.
    let mut dispatcher_targets = config.target_crates.clone();
    dispatcher_targets.extend(targets.iter().cloned());
    dispatcher_targets.sort();
    dispatcher_targets.dedup();
    let command = cli.command.unwrap_or(Commands::Dev);

    match command {
        Commands::Dev => {
            run_pipeline(&targets, &dispatcher_targets, false, &config).await?;
        }
        Commands::Full => {
            run_pipeline(&targets, &dispatcher_targets, true, &config).await?;
        }

        Commands::Spec {
            source_dir,
            output_dir,
        } => {
            fs::create_dir_all(&output_dir)?;
            for target in targets.iter().cloned() {
                let output_path = Path::new(&output_dir).join(format!("{}.json", target));
                println!("Generating spec for crate: {} -> {:?}", target, output_path);
                parser::run(&source_dir, output_path.to_str().unwrap(), &target, &config)?;
            }
        }

        Commands::Sync { specs_dir } => {
            let crate_name = cli
                .crate_name
                .clone()
                .ok_or_else(|| anyhow::anyhow!("--crate-name (-n) is required for `sync`"))?;
            let json_path = Path::new(&specs_dir).join(format!("{}.json", crate_name));
            let content = fs::read_to_string(json_path)?;
            let report: ApiReport = serde_json::from_str(&content)?;
            let mut syncer = notion::NotionSyncer::new().await?;
            syncer.sync_code(&report).await?;
        }

        Commands::Runner {
            specs_dir,
            output_dir,
        } => {
            fs::create_dir_all(&output_dir)?;
            for target in targets.iter() {
                let json_path = Path::new(&specs_dir).join(format!("{}.json", target));
                let rs_path =
                    Path::new(&output_dir).join(format!("runner_{}.rs", to_rust_ident(target)));
                if json_path.exists() {
                    let content = fs::read_to_string(&json_path)?;
                    let report: ApiReport = serde_json::from_str(&content)?;
                    test_gen::generate_runner(&report, rs_path.to_str().unwrap(), &config, target)?;
                }
            }
            test_gen::generate_dispatcher(&output_dir, &dispatcher_targets)?;
            let runner_paths = targets
                .iter()
                .map(|target| {
                    Path::new(&output_dir).join(format!("runner_{}.rs", to_rust_ident(target)))
                })
                .chain(std::iter::once(Path::new(&output_dir).join("mod.rs")));
            format_generated_rust_files(runner_paths)?;
        }
        Commands::FetchTests { output_dir } => {
            let syncer = notion::NotionSyncer::new().await?;
            syncer.fetch_test_cases_to_yaml(&output_dir).await?;
        }
        Commands::PushTests { input_dir } => {
            let syncer = notion::NotionSyncer::new().await?;
            syncer.push_yaml_to_notion(&input_dir).await?;
        }
        Commands::Test { output_dir } => {
            println!("--- Fetching Tests ---");
            let syncer = notion::NotionSyncer::new().await?;
            syncer.fetch_test_cases_to_yaml(&output_dir).await?;
            println!("\n--- Running Integration Tests ---");
            let status = Command::new("cargo")
                .args(["test", "-p", "integration-tests"])
                .status()?;
            if !status.success() {
                anyhow::bail!("Tests failed!");
            }
        }
        Commands::WasmGen {
            specs_dir,
            output_dir,
        } => {
            fs::create_dir_all(&output_dir)?;
            for target in targets.iter().cloned() {
                let target_ident = to_rust_ident(&target);
                let json_path = Path::new(&specs_dir).join(format!("{}.json", target));
                let rs_path = Path::new(&output_dir).join(format!("{}.rs", target_ident));
                if json_path.exists() {
                    let content = fs::read_to_string(&json_path)?;
                    let report: ApiReport = serde_json::from_str(&content)?;
                    wasm_gen::generate_wasm_lib(
                        &report,
                        rs_path.to_str().unwrap(),
                        &config,
                        &target,
                    )?;
                }
            }
            let lib_rs_path = Path::new(&output_dir).join("lib.rs");

            // Merge into existing lib.rs (never delete hand-written modules).
            let mut existing = fs::read_to_string(&lib_rs_path).unwrap_or_default();
            if !existing.ends_with('\n') && !existing.is_empty() {
                existing.push('\n');
            }
            let re_mod =
                regex::Regex::new(r"^\s*pub\s+mod\s+([a-zA-Z0-9_]+)\s*;\s*$").expect("valid regex");
            let mut present: std::collections::HashSet<String> = existing
                .lines()
                .filter_map(|l| re_mod.captures(l).map(|c| c[1].to_string()))
                .collect();

            let mut to_append: Vec<String> = Vec::new();
            for target in &targets {
                let ident = to_rust_ident(target);
                if present.insert(ident.clone()) {
                    to_append.push(format!("pub mod {};\n", ident));
                }
            }
            if present.insert("solver_manual".to_string()) {
                to_append.push("pub mod solver_manual;\n".to_string());
            }

            existing.push_str(&to_append.concat());
            fs::write(lib_rs_path, existing)?;
            let wasm_paths = targets
                .iter()
                .map(|target| Path::new(&output_dir).join(format!("{}.rs", to_rust_ident(target))))
                .chain(std::iter::once(Path::new(&output_dir).join("lib.rs")));
            format_generated_rust_files(wasm_paths)?;
        }

        // --- 修正コマンド ---
        Commands::WasmBuild {
            crate_dir,
            output_dir,
        } => {
            println!("Building Wasm package...");

            // Resolve relative output paths from the Rust workspace root, not
            // from `wasm/`. wasm-pack interprets a relative --out-dir relative
            // to the crate it builds, which previously put the package under
            // `rust-crate/web-app/...` instead of the configured web app.
            let final_out_dir = output_dir
                .or_else(|| {
                    config
                        .paths
                        .as_ref()
                        .and_then(|p| p.wasm_output_dir.clone())
                })
                .unwrap_or_else(|| "../web-app/generated/client-sdk/wasm-pkg".to_string());
            let rust_crate_root =
                std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
            let final_out_dir = {
                let path = std::path::PathBuf::from(final_out_dir);
                if path.is_absolute() {
                    path
                } else {
                    rust_crate_root.join(path)
                }
            };
            let final_out_dir = final_out_dir.to_string_lossy().to_string();

            let status = Command::new("wasm-pack")
                .args([
                    "build",
                    &crate_dir,
                    "--target",
                    "bundler",
                    "--out-dir",
                    &final_out_dir,
                ])
                .status()?;

            if !status.success() {
                anyhow::bail!("wasm-pack build failed");
            }
            println!("Wasm build complete! Output: {}", final_out_dir);
        }

        Commands::Ts {
            specs_dir,
            output_dir,
        } => {
            // ★ 優先順位: CLI > Config > Hardcoded Default
            let final_output_dir = output_dir
                .or_else(|| config.paths.as_ref().and_then(|p| p.ts_wrapper_dir.clone()))
                .unwrap_or_else(|| "../web-app/generated/client-sdk/src/wrappers".to_string());

            if let Some(sdk_root) = sdk_root_from_generated_dir(Path::new(&final_output_dir)) {
                sync_static_sdk(&sdk_root)?;
            }

            fs::create_dir_all(&final_output_dir)?;

            for target in targets.iter().cloned() {
                if !is_real_crate(&target) {
                    println!("Skipping TS wrapper for {}: not a crates/ member", target);
                    continue;
                }
                let json_path = Path::new(&specs_dir).join(format!("{}.json", target));
                let ts_path =
                    Path::new(&final_output_dir).join(format!("{}.ts", to_ts_ident(&target)));

                if json_path.exists() {
                    let content = fs::read_to_string(&json_path)?;
                    let report: ApiReport = serde_json::from_str(&content)?;
                    println!("Generating TS wrapper for: {} -> {:?}", target, ts_path);
                    ts_gen::generate_ts_wrapper(
                        &report,
                        ts_path.to_str().unwrap(),
                        &target,
                        &config.known_boundary_types,
                    )?;
                }
            }

            if let Some(sdk_root) = sdk_root_from_generated_dir(Path::new(&final_output_dir)) {
                sync_sdk_wasm_bindings(&sdk_root)?;
                sync_sdk_type_api_exports(&sdk_root)?;
            }
        }

        Commands::TsApi {
            specs_dir,
            output_dir,
        } => {
            // ★ 優先順位: CLI > Config > Hardcoded Default
            let final_output_dir = output_dir
                .or_else(|| config.paths.as_ref().and_then(|p| p.ts_api_dir.clone()))
                .unwrap_or_else(|| "../web-app/generated/client-sdk/src/api".to_string());

            if let Some(sdk_root) = sdk_root_from_generated_dir(Path::new(&final_output_dir)) {
                sync_static_sdk(&sdk_root)?;
                sync_sdk_wasm_bindings(&sdk_root)?;
                sync_sdk_type_api_exports(&sdk_root)?;
            }

            fs::create_dir_all(&final_output_dir)?;

            // runtime is shared
            ts_api_gen::generate_ts_api_runtime(&final_output_dir)?;

            for target in targets.iter().cloned() {
                if !is_real_crate(&target) {
                    println!("Skipping TS safe API for {}: not a crates/ member", target);
                    continue;
                }
                let json_path = Path::new(&specs_dir).join(format!("{}.json", target));
                if json_path.exists() {
                    let content = fs::read_to_string(&json_path)?;
                    let report: ApiReport = serde_json::from_str(&content)?;
                    println!(
                        "Generating TS safe API for: {} -> {}",
                        target, final_output_dir
                    );
                    ts_api_gen::generate_ts_api(&report, &final_output_dir, &target)?;
                }
            }

            if let Some(sdk_root) = sdk_root_from_generated_dir(Path::new(&final_output_dir)) {
                sync_static_sdk(&sdk_root)?;
                sync_sdk_wasm_bindings(&sdk_root)?;
                sync_sdk_type_api_exports(&sdk_root)?;
            }
        }

        Commands::TsTest {
            specs_dir,
            cases_dir,
            output_dir,
        } => {
            // ★ 優先順位: CLI > Config > Hardcoded Default
            let final_output_dir = output_dir
                .or_else(|| config.paths.as_ref().and_then(|p| p.ts_test_dir.clone()))
                .unwrap_or_else(|| "../web-app/generated/client-sdk/src/tests".to_string());

            fs::create_dir_all(&final_output_dir)?;

            for target in targets.iter().cloned() {
                let json_path = Path::new(&specs_dir).join(format!("{}.json", target));
                let yaml_path = Path::new(&cases_dir).join(format!("{}.yml", target));
                let ts_path =
                    Path::new(&final_output_dir).join(format!("{}.test.ts", to_ts_ident(&target)));

                if json_path.exists() && yaml_path.exists() {
                    let content = fs::read_to_string(&json_path)?;
                    let report: ApiReport = serde_json::from_str(&content)?;
                    println!("Generating TS tests for: {} -> {:?}", target, ts_path);
                    ts_test_gen::generate_ts_test_with_boundary_types(
                        &report,
                        yaml_path.to_str().unwrap(),
                        ts_path.to_str().unwrap(),
                        &target,
                        &config.known_boundary_types,
                    )?;
                } else {
                    println!("Skipping {}: Missing json or yaml.", target);
                }
            }
        }

        Commands::ErrorMessages {
            specs_dir,
            output_file,
        } => {
            for target in targets.iter().cloned() {
                let default_out = if target == "common" {
                    "../web-app/src/shared/errors/commonErrorCodeMessages.generated.ts".to_string()
                } else {
                    format!(
                        "../web-app/src/features/{}/config/errorCodeMessages.generated.ts",
                        target
                    )
                };
                let out_path = output_file.clone().unwrap_or(default_out);
                error_message_gen::generate_error_code_messages_for_crate(
                    error_message_gen::GenerateArgs {
                        crate_name: target.clone(),
                        specs_dir: specs_dir.clone(),
                        output_file: out_path.clone(),
                    },
                )?;

                // Scaffold the corresponding (non-generated) config file if missing.
                let generated_path = Path::new(&out_path);
                error_message_gen::ensure_error_code_messages_config_for_crate(
                    &target,
                    generated_path,
                )?;
            }
        } // Dev/Full pipeline is implemented by `run_pipeline()`.
    }

    Ok(())
}

fn static_sdk_should_overwrite(rel_path: &Path) -> bool {
    let rel = rel_path.to_string_lossy().replace('\\', "/");
    rel == "package.json"
        || rel == "src/index.ts"
        || (rel.starts_with("src/api/") && rel.ends_with(".ts"))
}

const STATIC_SDK_NO_CHECK: &str = "// @ts-nocheck\n";

/// Static SDK files are intentionally incomplete: they reference generated
/// wrappers and `wasm-lib`. Keep editor support for their `.ts` source files
/// while removing this static-only diagnostic directive from generated output.
fn static_sdk_content_for_output(content: &str) -> &str {
    content.strip_prefix(STATIC_SDK_NO_CHECK).unwrap_or(content)
}

fn copy_static_sdk_recursive(src: &Path, dst: &Path, rel: &Path) -> Result<()> {
    if !src.exists() {
        return Ok(());
    }
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let child_rel = rel.join(entry.file_name());
        if entry.file_type()?.is_dir() {
            copy_static_sdk_recursive(&src_path, &dst.join(entry.file_name()), &child_rel)?;
        } else {
            let dst_path = dst.join(entry.file_name());
            if dst_path.exists() && !static_sdk_should_overwrite(&child_rel) {
                continue;
            }
            if let Some(parent) = dst_path.parent() {
                fs::create_dir_all(parent)?;
            }
            if src_path
                .extension()
                .and_then(|extension| extension.to_str())
                == Some("ts")
            {
                let content = fs::read_to_string(&src_path)?;
                fs::write(&dst_path, static_sdk_content_for_output(&content))?;
            } else {
                fs::copy(&src_path, &dst_path)?;
            }
        }
    }
    Ok(())
}

fn sdk_root_from_generated_dir(dir: &Path) -> Option<PathBuf> {
    let parent = dir.parent()?;
    if parent.file_name().and_then(|name| name.to_str()) == Some("src") {
        return parent.parent().map(Path::to_path_buf);
    }
    if dir.file_name().and_then(|name| name.to_str()) == Some("wasm-pkg") {
        return dir.parent().map(Path::to_path_buf);
    }
    Some(dir.to_path_buf())
}

fn sync_static_sdk(root: &Path) -> Result<()> {
    let static_root = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("static-sdk/client-sdk")
        .canonicalize()?;
    copy_static_sdk_recursive(&static_root, root, Path::new(""))?;
    sync_sdk_generated_api_exports(root)?;
    Ok(())
}

const GENERATED_DEPS_BEGIN: &str = "# <inspector:crate-dependencies>";
const GENERATED_DEPS_END: &str = "# </inspector:crate-dependencies>";
const GENERATED_BINDINGS_BEGIN: &str = "// <inspector:wasm-bindings>";
const GENERATED_BINDINGS_END: &str = "// </inspector:wasm-bindings>";
const GENERATED_BIND_CALLS_BEGIN: &str = "\t// <inspector:wasm-bind-calls>";
const GENERATED_BIND_CALLS_END: &str = "\t// </inspector:wasm-bind-calls>";
const GENERATED_TYPE_API_EXPORTS_BEGIN: &str = "// <inspector:type-api-exports>";
const GENERATED_TYPE_API_EXPORTS_END: &str = "// </inspector:type-api-exports>";
const GENERATED_SAFE_API_EXPORTS_BEGIN: &str = "// <inspector:generated-api-exports>";
const GENERATED_SAFE_API_EXPORTS_END: &str = "// </inspector:generated-api-exports>";

fn replace_generated_block(content: &str, begin: &str, end: &str, body: &str) -> Result<String> {
    let start = content
        .find(begin)
        .ok_or_else(|| anyhow::anyhow!("generated ownership marker is missing: {begin}"))?;
    let after_begin = start + begin.len();
    let end_offset = content[after_begin..]
        .find(end)
        .ok_or_else(|| anyhow::anyhow!("generated ownership marker is missing: {end}"))?;
    let finish = after_begin + end_offset;
    Ok(format!(
        "{}{}{}",
        &content[..after_begin],
        body,
        &content[finish..]
    ))
}

/// Re-export generated safe APIs from the package root without making the
/// static SDK template depend on files that only exist after generation.
fn sync_sdk_generated_api_exports(sdk_root: &Path) -> Result<()> {
    let path = sdk_root.join("src/index.ts");
    let content = fs::read_to_string(&path)?;
    let api_dir = sdk_root.join("src/api");
    let generated_exports = [
        (
            "algebraicApi.ts",
            "export * as algebraicClasses from \"./api/algebraicApi\";",
        ),
        (
            "runtime.ts",
            "export * as apiRuntime from \"./api/runtime\";",
        ),
    ];
    let exports = generated_exports
        .iter()
        .filter_map(|(file_name, export)| api_dir.join(file_name).exists().then_some(*export))
        .collect::<Vec<_>>();
    let body = if exports.is_empty() {
        "\n".to_string()
    } else {
        format!("\n{}\n", exports.join("\n"))
    };
    let updated = replace_generated_block(
        &content,
        GENERATED_SAFE_API_EXPORTS_BEGIN,
        GENERATED_SAFE_API_EXPORTS_END,
        &body,
    )?;
    fs::write(&path, updated)?;
    println!("Synchronized generated SDK API exports at {:?}", path);
    Ok(())
}

/// Synchronize only inspector-owned dependency entries. Existing hand-written
/// entries remain untouched, which prevents an incremental `dev -n` run from
/// overwriting historical wasm configuration.
fn sync_wasm_crate_dependencies(targets: &[String]) -> Result<()> {
    let path = Path::new("wasm/Cargo.toml");
    let content = fs::read_to_string(path)?;
    let mut missing = Vec::new();
    for target in targets {
        // YAML-only aggregation target; it is not a Cargo crate.
        if target == "test-cases" {
            continue;
        }
        let manifest = Path::new(DEFAULT_CRATES_DIR)
            .join(target)
            .join("Cargo.toml");
        if !manifest.exists() {
            anyhow::bail!("crate '{}' is not present at {:?}", target, manifest);
        }
        let key = format!("{} =", target);
        let generated_key = format!("{} =", to_rust_ident(target));
        if !content.lines().any(|line| {
            let trimmed = line.trim_start();
            trimmed.starts_with(&key) || trimmed.starts_with(&generated_key)
        }) {
            missing.push(target.clone());
        }
    }
    if missing.is_empty() {
        return Ok(());
    }
    let updated = if content.contains(GENERATED_DEPS_BEGIN) {
        let start = content.find(GENERATED_DEPS_BEGIN).expect("marker checked")
            + GENERATED_DEPS_BEGIN.len();
        let end = start
            + content[start..]
                .find(GENERATED_DEPS_END)
                .expect("marker checked");
        let existing_entries = content[start..end].trim();
        let additions = missing
            .iter()
            .map(|name| format!("{} = {{ path = \"../crates/{}\" }}", name, name))
            .collect::<Vec<_>>()
            .join("\n");
        let entries = if existing_entries.is_empty() {
            additions
        } else {
            format!("{}\n{}", existing_entries, additions)
        };
        replace_generated_block(
            &content,
            GENERATED_DEPS_BEGIN,
            GENERATED_DEPS_END,
            &format!("\n{}\n", entries),
        )?
    } else {
        let entries = missing
            .iter()
            .map(|name| format!("{} = {{ path = \"../crates/{}\" }}", name, name))
            .collect::<Vec<_>>()
            .join("\n");
        format!(
            "{}\n{}\n{}\n{}\n",
            content.trim_end(),
            GENERATED_DEPS_BEGIN,
            entries,
            GENERATED_DEPS_END
        )
    };
    fs::write(path, updated)?;
    println!("Synchronized WASM dependencies: {}", missing.join(", "));
    Ok(())
}

fn sync_sdk_wasm_bindings(sdk_root: &Path) -> Result<()> {
    let path = sdk_root.join("src/index.ts");
    let content = fs::read_to_string(&path)?;
    let wrappers_dir = sdk_root.join("src/wrappers");
    let mut targets = discover_targets(DEFAULT_CRATES_DIR, &[]);
    targets.retain(|target| {
        wrappers_dir
            .join(format!("{}.ts", to_ts_ident(target)))
            .exists()
    });

    let exports = targets
        .iter()
        .map(|target| {
            let ts = to_ts_ident(target);
            let name = ts.to_case(convert_case::Case::Pascal);
            format!(
                "export {{ setWasmFromWasmLib as set{}Wasm }} from \"./wrappers/{}\";",
                name, ts
            )
        })
        .collect::<Vec<_>>()
        .join("\n");
    let imports = targets
        .iter()
        .map(|target| {
            let ts = to_ts_ident(target);
            let name = ts.to_case(convert_case::Case::Pascal);
            format!(
                "import {{ setWasmFromWasmLib as set{}WasmFromWasmLib }} from \"./wrappers/{}\";",
                name, ts
            )
        })
        .collect::<Vec<_>>()
        .join("\n");
    let binding_body = format!("\n{}\n\n{}\n", exports, imports);
    let updated = replace_generated_block(
        &content,
        GENERATED_BINDINGS_BEGIN,
        GENERATED_BINDINGS_END,
        &binding_body,
    )?;
    let calls = targets
        .iter()
        .map(|target| {
            let name = to_ts_ident(target).to_case(convert_case::Case::Pascal);
            format!("\tset{}WasmFromWasmLib(wasmLib);", name)
        })
        .collect::<Vec<_>>()
        .join("\n");
    let updated = replace_generated_block(
        &updated,
        GENERATED_BIND_CALLS_BEGIN,
        GENERATED_BIND_CALLS_END,
        &format!("\n{}\n", calls),
    )?;
    fs::write(&path, updated)?;
    println!("Synchronized SDK WASM bindings at {:?}", path);
    Ok(())
}

/// Re-export generated Type API classes and their DTO types from the package
/// root.  UI code can therefore use a stable SDK import rather than reaching
/// into generated wrapper paths or handling WASM binding itself.
fn sync_sdk_type_api_exports(sdk_root: &Path) -> Result<()> {
    let path = sdk_root.join("src/index.ts");
    let content = fs::read_to_string(&path)?;
    let wrappers_dir = sdk_root.join("src/wrappers");
    let mut targets = discover_targets(DEFAULT_CRATES_DIR, &[]);
    targets.retain(|target| {
        wrappers_dir
            .join(format!("{}.ts", to_ts_ident(target)))
            .exists()
    });

    let mut exports = Vec::new();
    let mut seen_classes = std::collections::HashSet::new();
    for target in targets {
        let spec_path = Path::new(DEFAULT_SPECS_DIR).join(format!("{}.json", target));
        let Ok(spec) = fs::read_to_string(&spec_path) else {
            continue;
        };
        let report: ApiReport = serde_json::from_str(&spec)?;
        if report.type_apis.is_empty() {
            continue;
        }
        let wrapper = to_ts_ident(&target);
        let classes = report
            .type_apis
            .iter()
            .map(|api| api.ts_name.clone())
            .filter(|name| seen_classes.insert(name.clone()))
            .collect::<Vec<_>>();
        if !classes.is_empty() {
            exports.push(format!(
                "export {{ {} }} from \"./wrappers/{}\";",
                classes.join(", "),
                wrapper
            ));
        }

        let dto_types = report
            .structs
            .iter()
            .filter(|item| item.dto_candidate && item.dto_enabled)
            .map(|item| {
                if item.name.ends_with("Dto") {
                    item.name.clone()
                } else {
                    format!("{}Dto", item.name)
                }
            })
            .collect::<Vec<_>>();
        if !dto_types.is_empty() {
            exports.push(format!(
                "export type {{ {} }} from \"./wrappers/{}\";",
                dto_types.join(", "),
                wrapper
            ));
        }
    }

    let body = if exports.is_empty() {
        "\n".to_string()
    } else {
        format!("\n{}\n", exports.join("\n"))
    };
    let updated = replace_generated_block(
        &content,
        GENERATED_TYPE_API_EXPORTS_BEGIN,
        GENERATED_TYPE_API_EXPORTS_END,
        &body,
    )?;
    fs::write(&path, updated)?;
    println!("Synchronized SDK Type API exports at {:?}", path);
    Ok(())
}

fn is_real_crate(target: &str) -> bool {
    Path::new(DEFAULT_CRATES_DIR)
        .join(target)
        .join("Cargo.toml")
        .exists()
}

async fn run_pipeline(
    targets: &[String],
    dispatcher_targets: &[String],
    include_notion: bool,
    config: &inspector_lib::types::InspectorConfig,
) -> Result<()> {
    let specs_dir = DEFAULT_SPECS_DIR;
    let runner_dir = DEFAULT_RUNNER_DIR;

    fs::create_dir_all(specs_dir)?;
    fs::create_dir_all(runner_dir)?;

    if targets.len() == 1 && targets[0] != "test-cases" && !is_real_crate(&targets[0]) {
        anyhow::bail!(
            "crate '{}' is not present under {}/; create its Cargo.toml before running inspector dev",
            targets[0],
            DEFAULT_CRATES_DIR
        );
    }

    // --- 1) spec ---
    println!("--- Step 1: Generate JSON Specs ---");
    for target in targets {
        let output_path = Path::new(specs_dir).join(format!("{}.json", target));
        parser::run(
            DEFAULT_CRATES_DIR,
            output_path.to_str().unwrap(),
            target,
            config,
        )?;
        // A focused `dev -n <crate>` is the crate-author feedback loop. Fail
        // immediately when the crate exists but did not declare either marker,
        // rather than producing an apparently successful set of empty files.
        if targets.len() == 1
            && target != "test-cases"
            && Path::new(DEFAULT_CRATES_DIR)
                .join(target)
                .join("Cargo.toml")
                .exists()
        {
            let report: ApiReport = serde_json::from_str(&fs::read_to_string(&output_path)?)?;
            if report.crate_apis.is_empty() && report.type_apis.is_empty() {
                anyhow::bail!(
                    "crate '{}' has no API marker; implement GrathCrateApi or GrathTypeApi before running inspector dev",
                    target
                );
            }
        }
    }

    // All preflight checks above have passed. Only now may the focused run
    // mutate the wasm manifest for a newly added crate.
    sync_wasm_crate_dependencies(targets)?;

    // --- 1.5) error messages ---
    println!("\n--- Step 1.5: Generate Frontend Error Code Messages ---");
    for target in targets {
        let out_path = if target == "common" {
            "../web-app/src/shared/errors/commonErrorCodeMessages.generated.ts".to_string()
        } else {
            format!(
                "../web-app/src/features/{}/config/errorCodeMessages.generated.ts",
                target
            )
        };
        error_message_gen::generate_error_code_messages_for_crate(
            error_message_gen::GenerateArgs {
                crate_name: target.clone(),
                specs_dir: specs_dir.to_string(),
                output_file: out_path.clone(),
            },
        )?;

        // Scaffold the corresponding (non-generated) config file if missing.
        let generated_path = Path::new(&out_path);
        error_message_gen::ensure_error_code_messages_config_for_crate(target, generated_path)?;
    }

    // --- 2) runner ---
    println!("\n--- Step 2: Generate Test Runners ---");
    for target in targets {
        if !is_real_crate(target) {
            println!("Skipping runner for {}: not a crates/ member", target);
            continue;
        }
        let json_path = Path::new(specs_dir).join(format!("{}.json", target));
        let rs_path = Path::new(runner_dir).join(format!("runner_{}.rs", to_rust_ident(target)));

        if json_path.exists() {
            let content = fs::read_to_string(&json_path)?;
            let report: ApiReport = serde_json::from_str(&content)?;
            test_gen::generate_runner(&report, rs_path.to_str().unwrap(), config, target)?;
        }
    }
    test_gen::generate_dispatcher(runner_dir, dispatcher_targets)?;
    let runner_paths = targets
        .iter()
        .filter(|target| is_real_crate(target))
        .map(|target| Path::new(runner_dir).join(format!("runner_{}.rs", to_rust_ident(target))))
        .chain(std::iter::once(Path::new(runner_dir).join("mod.rs")));
    format_generated_rust_files(runner_paths)?;

    // --- 3) wasm source gen ---
    println!("\n--- Step 3: Generate Wasm Source (rust-crate/wasm/src) ---");
    let mut generated_wasm_paths = Vec::new();
    {
        let output_dir = "wasm/src";
        fs::create_dir_all(output_dir)?;
        let mut dto_targets: Vec<String> = Vec::new();
        let mut wasm_targets: Vec<String> = Vec::new();
        for target in targets {
            if !is_real_crate(target) {
                println!("Skipping wasm gen for {}: not a crates/ member", target);
                continue;
            }
            let target_ident = to_rust_ident(target);
            let json_path = Path::new(specs_dir).join(format!("{}.json", target));
            let rs_path = Path::new(output_dir).join(format!("{}.rs", target_ident));
            if json_path.exists() {
                let content = fs::read_to_string(&json_path)?;
                let report: ApiReport = serde_json::from_str(&content)?;
                wasm_gen::generate_wasm_lib(&report, rs_path.to_str().unwrap(), config, target)?;
                generated_wasm_paths.push(rs_path);
                wasm_targets.push(target.clone());

                // Generate DTO-only wasm exports (pure DTO boundary) when supported.
                let dto_module_path =
                    Path::new(output_dir).join(format!("{}_dto.rs", target_ident));
                if dto_module_path.exists() {
                    let dto_exports_path = Path::new(output_dir)
                        .join(format!("{}_dto.exports.generated.rs", target_ident))
                        .to_string_lossy()
                        .to_string();
                    wasm_dto_gen::generate_wasm_dto_exports(
                        &report,
                        dto_module_path.to_str().unwrap(),
                        &dto_exports_path,
                        target,
                    )?;
                    generated_wasm_paths.push(PathBuf::from(dto_exports_path));
                    dto_targets.push(target_ident);
                }
            }
        }
        let lib_rs_path = Path::new(output_dir).join("lib.rs");

        // Merge into existing lib.rs (never delete hand-written modules).
        let mut existing = fs::read_to_string(&lib_rs_path).unwrap_or_default();
        if !existing.ends_with('\n') && !existing.is_empty() {
            existing.push('\n');
        }
        let re_mod =
            regex::Regex::new(r"^\s*pub\s+mod\s+([a-zA-Z0-9_]+)\s*;\s*$").expect("valid regex");
        let mut present: std::collections::HashSet<String> = existing
            .lines()
            .filter_map(|l| re_mod.captures(l).map(|c| c[1].to_string()))
            .collect();

        let mut to_append: Vec<String> = Vec::new();
        for target in &wasm_targets {
            let ident = to_rust_ident(target);
            if present.insert(ident.clone()) {
                to_append.push(format!("pub mod {};\n", ident));
            }
        }
        // Hand-written DTO modules (wasm/src/<crate>_dto.rs) must be included so wasm-bindgen
        // exposes their exports in the generated wasm-pkg.
        for t in dto_targets {
            let dto_mod = format!("{}_dto", t);
            if present.insert(dto_mod.clone()) {
                to_append.push(format!("pub mod {};\n", dto_mod));
            }
        }

        existing.push_str(&to_append.concat());
        fs::write(&lib_rs_path, existing)?;
        generated_wasm_paths.push(lib_rs_path);
    }
    format_generated_rust_files(generated_wasm_paths)?;

    // --- 4) wasm build ---
    println!("\n--- Step 4: Build Wasm Package (wasm-pack) ---");
    {
        let crate_dir = "wasm";
        // Use an absolute default path so the output does not depend on the process CWD.
        // (cargo may run this binary with CWD != rust-crate/)
        let default_out_dir = {
            let manifest_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
            // inspector crate: rust-crate/tools/inspector -> repo root: ../../..
            manifest_dir
                .join("../../..")
                .join("web-app/generated/client-sdk/wasm-pkg")
        };

        let final_out_dir = config
            .paths
            .as_ref()
            .and_then(|p| p.wasm_output_dir.clone())
            .unwrap_or_else(|| default_out_dir.to_string_lossy().to_string());

        // wasm-pack resolves --out-dir relative to the crate directory, so make it absolute.
        let rust_crate_root = {
            let manifest_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
            // inspector crate: rust-crate/tools/inspector -> rust-crate: ../..
            manifest_dir.join("../..")
        };
        let final_out_dir = {
            let p = std::path::PathBuf::from(final_out_dir);
            if p.is_absolute() {
                p
            } else {
                rust_crate_root.join(p)
            }
        };
        let final_out_dir = final_out_dir.to_string_lossy().to_string();

        let status = Command::new("wasm-pack")
            .args([
                "build",
                crate_dir,
                "--target",
                "bundler",
                "--out-dir",
                &final_out_dir,
            ])
            .status()?;

        if !status.success() {
            anyhow::bail!("wasm-pack build failed");
        }
        println!("Wasm build complete! Output: {}", final_out_dir);
    }

    // --- 4.5) static SDK scaffold ---
    println!("\n--- Step 4.5: Sync Static SDK Scaffold ---");
    {
        let final_output_dir = config
            .paths
            .as_ref()
            .and_then(|p| p.ts_api_dir.clone())
            .unwrap_or_else(|| "../web-app/generated/client-sdk/src/api".to_string());
        if let Some(sdk_root) = sdk_root_from_generated_dir(Path::new(&final_output_dir)) {
            sync_static_sdk(&sdk_root)?;
            println!("Static SDK scaffold synced to {:?}", sdk_root);
        }
    }

    // --- 5) TS wrapper ---
    println!("\n--- Step 5: Generate TS Wrappers ---");
    {
        let final_output_dir = config
            .paths
            .as_ref()
            .and_then(|p| p.ts_wrapper_dir.clone())
            .unwrap_or_else(|| "../web-app/generated/client-sdk/src/wrappers".to_string());
        fs::create_dir_all(&final_output_dir)?;

        for target in targets {
            if !is_real_crate(target) {
                println!("Skipping TS wrapper for {}: not a crates/ member", target);
                continue;
            }
            let json_path = Path::new(specs_dir).join(format!("{}.json", target));
            let ts_path = Path::new(&final_output_dir).join(format!("{}.ts", to_ts_ident(target)));

            if json_path.exists() {
                let content = fs::read_to_string(&json_path)?;
                let report: ApiReport = serde_json::from_str(&content)?;
                println!("Generating TS wrapper for: {} -> {:?}", target, ts_path);
                ts_gen::generate_ts_wrapper(
                    &report,
                    ts_path.to_str().unwrap(),
                    target,
                    &config.known_boundary_types,
                )?;
            }
        }
    }

    // --- 5.5) TS safe API ---
    println!("\n--- Step 5.5: Generate TS Safe APIs ---");
    {
        let final_output_dir = config
            .paths
            .as_ref()
            .and_then(|p| p.ts_api_dir.clone())
            .unwrap_or_else(|| "../web-app/generated/client-sdk/src/api".to_string());
        fs::create_dir_all(&final_output_dir)?;

        ts_api_gen::generate_ts_api_runtime(&final_output_dir)?;

        for target in targets {
            if !is_real_crate(target) {
                println!("Skipping TS safe API for {}: not a crates/ member", target);
                continue;
            }
            let json_path = Path::new(specs_dir).join(format!("{}.json", target));
            if json_path.exists() {
                let content = fs::read_to_string(&json_path)?;
                let report: ApiReport = serde_json::from_str(&content)?;
                println!(
                    "Generating TS safe API for: {} -> {}",
                    target, final_output_dir
                );
                ts_api_gen::generate_ts_api(&report, &final_output_dir, target)?;
            }
        }

        if let Some(sdk_root) = sdk_root_from_generated_dir(Path::new(&final_output_dir)) {
            sync_static_sdk(&sdk_root)?;
            sync_sdk_wasm_bindings(&sdk_root)?;
            sync_sdk_type_api_exports(&sdk_root)?;
            println!("Re-synced static SDK scaffold to {:?}", sdk_root);
        }
    }

    // --- 6) TS tests ---
    println!("\n--- Step 6: Generate TS Tests ---");
    {
        let final_output_dir = config
            .paths
            .as_ref()
            .and_then(|p| p.ts_test_dir.clone())
            .unwrap_or_else(|| "../web-app/generated/client-sdk/src/tests".to_string());
        fs::create_dir_all(&final_output_dir)?;

        for target in targets {
            if !is_real_crate(target) {
                println!("Skipping TS tests for {}: not a crates/ member", target);
                continue;
            }
            let json_path = Path::new(specs_dir).join(format!("{}.json", target));
            let yaml_path = Path::new(DEFAULT_TEST_CASES_DIR).join(format!("{}.yml", target));
            let ts_path =
                Path::new(&final_output_dir).join(format!("{}.test.ts", to_ts_ident(target)));

            if json_path.exists() && yaml_path.exists() {
                let content = fs::read_to_string(&json_path)?;
                let report: ApiReport = serde_json::from_str(&content)?;
                println!("Generating TS tests for: {} -> {:?}", target, ts_path);
                ts_test_gen::generate_ts_test_with_boundary_types(
                    &report,
                    yaml_path.to_str().unwrap(),
                    ts_path.to_str().unwrap(),
                    target,
                    &config.known_boundary_types,
                )?;
            } else {
                println!("Skipping {}: Missing json or yaml.", target);
            }
        }
    }

    // --- 7) Notion (optional) ---
    if include_notion {
        println!("\n--- Step 7: Sync/Fetch (Notion, optional) ---");

        if std::env::var("NOTION_API_KEY").is_ok() {
            let mut syncer = notion::NotionSyncer::new().await?;
            for target in targets {
                let json_path = Path::new(specs_dir).join(format!("{}.json", target));
                println!("Syncing {}...", target);

                let content = fs::read_to_string(json_path)?;
                let report: ApiReport = serde_json::from_str(&content)?;
                syncer.sync_code(&report).await?;
            }

            let syncer = notion::NotionSyncer::new().await?;
            syncer
                .fetch_test_cases_to_yaml(DEFAULT_TEST_CASES_DIR)
                .await?;
        } else {
            println!("Skipping Notion sync/fetch: NOTION_API_KEY is not set");
        }
    }

    Ok(())
}

#[cfg(test)]
mod static_sdk_tests {
    use super::*;

    #[test]
    fn strips_static_only_typecheck_directive() {
        assert_eq!(
            static_sdk_content_for_output("// @ts-nocheck\nexport const value = 1;\n"),
            "export const value = 1;\n"
        );
        assert_eq!(
            static_sdk_content_for_output("export const value = 1;\n"),
            "export const value = 1;\n"
        );
    }

    #[test]
    fn replaces_generated_api_export_block_without_touching_static_exports() {
        let content = concat!(
            "// <inspector:generated-api-exports>\n",
            "// </inspector:generated-api-exports>\n",
            "export { LinalgApi } from \"./api/linalgApi\";\n"
        );
        let updated = replace_generated_block(
            content,
            GENERATED_SAFE_API_EXPORTS_BEGIN,
            GENERATED_SAFE_API_EXPORTS_END,
            "\nexport * as algebraicClasses from \"./api/algebraicApi\";\n",
        )
        .expect("markers are present");

        assert!(updated.contains("export * as algebraicClasses"));
        assert!(updated.contains("export { LinalgApi }"));
    }
}
