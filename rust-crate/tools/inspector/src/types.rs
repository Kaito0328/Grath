use serde::{Deserialize, Serialize};

use crate::codec::{parse_arg_type, BoundaryMode, RustType};

#[derive(Debug, Deserialize, Default)]
pub struct InspectorConfig {
    #[serde(default)]
    pub ignored_crates: Vec<String>,

    #[serde(default)]
    pub target_crates: Vec<String>,

    // ★追加: パス設定 (Optional)
    pub paths: Option<PathConfig>,

    // テストランナー設定
    pub test_runner: Option<TestRunnerConfig>,

    /// Public type names discovered from all existing API specs. This is
    /// runtime-only context used to resolve boundary types from dependencies.
    #[serde(skip)]
    pub known_boundary_types: Vec<String>,

    /// Public DTO types discovered from specs. Runtime-only, like
    /// `known_boundary_types`, so generated JSON remains a portable contract.
    #[serde(skip)]
    pub known_dto_types: Vec<String>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct PathConfig {
    pub ts_wrapper_dir: Option<String>,
    pub ts_test_dir: Option<String>,
    pub ts_api_dir: Option<String>,
    pub wasm_output_dir: Option<String>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct TestRunnerConfig {
    pub imports: Vec<String>,
    pub extra_attributes: Vec<String>,
}

// ... (ApiReport, StructInfo等は変更なし) ...
#[derive(Serialize, Deserialize, Debug, Default)]
pub struct ApiReport {
    pub structs: Vec<StructInfo>,
    pub impl_blocks: Vec<ImplBlockInfo>,
    #[serde(default)]
    pub crate_apis: Vec<CrateApiInfo>,
    #[serde(default)]
    pub type_apis: Vec<TypeApiInfo>,
    #[serde(default)]
    pub unsupported: Vec<UnsupportedItem>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ImplBlockInfo {
    pub crate_name: String,
    pub target_struct: String,
    pub functions: Vec<FunctionInfo>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Hash)]
pub struct CrateApiInfo {
    pub crate_name: String,
    pub api_struct: String,
    pub api_crate_name: String,
    pub functions: Vec<FunctionInfo>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TypeApiInfo {
    pub crate_name: String,
    pub api_struct: String,
    pub target_type: RustType,
    pub ts_name: String,
    pub functions: Vec<FunctionInfo>,
}

#[derive(Serialize, Deserialize, Debug, Hash)]
pub struct StructInfo {
    pub name: String,
    pub crate_name: String,
    pub doc: String,
    pub fields: Vec<String>,
    /// Structured enum data used by the DTO TypeScript generator.  `fields`
    /// remains for backwards-compatible human-readable specs, while this
    /// preserves named variant fields instead of degrading them to `unknown`.
    #[serde(default)]
    pub enum_variants: Vec<EnumVariantInfo>,
    /// A public struct/enum can cross the DTO boundary once both serde derives
    /// are present.  This is deliberately metadata only for now: generators
    /// must opt into DTO export rather than silently changing an existing
    /// string facade.
    #[serde(default)]
    pub dto_candidate: bool,
    /// Only an explicit marker switches a custom type from the compatible
    /// string facade to the DTO boundary. `dto_candidate` alone is advisory.
    #[serde(default)]
    pub dto_enabled: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone, Hash)]
pub struct EnumVariantInfo {
    pub name: String,
    pub fields: EnumVariantFields,
}

#[derive(Serialize, Deserialize, Debug, Clone, Hash)]
pub enum EnumVariantFields {
    Unit,
    Unnamed(Vec<RustType>),
    Named(Vec<FunctionArgInfo>),
}

#[derive(Serialize, Deserialize, Debug, Clone, Hash)]
pub struct FunctionInfo {
    pub name: String,
    pub visibility: String,
    pub args: Vec<String>,
    pub return_type: String,
    pub doc: String,
    pub source_code: String,
    /// Structured boundary types. Kept alongside the legacy token strings so
    /// existing API specs remain readable while generators migrate.
    #[serde(default)]
    pub typed_args: Vec<FunctionArgInfo>,
    #[serde(default)]
    pub typed_return: Option<RustType>,
    /// The registry decision persisted in the spec. Generators still classify
    /// from `RustType`, but CI and API authors can inspect one shared answer
    /// without reverse-engineering type strings.
    #[serde(default)]
    pub codec_args: Vec<CodecDecision>,
    #[serde(default)]
    pub codec_return: Option<CodecDecision>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Hash)]
pub struct CodecDecision {
    pub rust_type: RustType,
    pub supported: bool,
    pub mode: Option<BoundaryMode>,
    pub reason: Option<String>,
    pub recommendation: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Hash, PartialEq, Eq)]
pub struct FunctionArgInfo {
    pub name: String,
    pub rust_type: RustType,
    #[serde(default)]
    pub is_receiver: bool,
}

impl FunctionInfo {
    /// Returns structured arguments, falling back to legacy spec strings for
    /// specs generated before typed metadata was introduced.
    pub fn boundary_args(&self) -> Vec<FunctionArgInfo> {
        if !self.typed_args.is_empty() || self.args.is_empty() {
            return self.typed_args.clone();
        }

        self.args
            .iter()
            .filter_map(|arg| {
                parse_arg_type(arg).map(|(name, rust_type)| FunctionArgInfo {
                    name,
                    rust_type,
                    is_receiver: false,
                })
            })
            .collect()
    }

    /// Returns the structured return type, with a compatibility fallback for
    /// existing JSON specs.
    pub fn boundary_return(&self) -> RustType {
        self.typed_return
            .clone()
            .unwrap_or_else(|| RustType::parse_str(&self.return_type))
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct UnsupportedItem {
    pub crate_name: String,
    pub target_struct: String,
    pub function: String,
    pub position: String,
    pub rust_type: RustType,
    pub reason: String,
    /// A concrete next action, emitted with the spec so unsupported APIs are
    /// visible to both CI and API authors instead of being silently skipped.
    #[serde(default)]
    pub recommendation: String,
}
