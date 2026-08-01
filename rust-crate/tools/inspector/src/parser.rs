use crate::codec::{CodecPlan, CodecRegistry, RustType};
use crate::types::*;
use anyhow::Result;
use quote::ToTokens;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::Path;
// ★修正: ItemEnum を追加
use syn::{visit::Visit, Expr, ItemEnum, ItemFn, ItemImpl, ItemStruct};
use walkdir::WalkDir;

#[derive(Debug, Clone)]
struct PendingCrateApi {
    crate_name: String,
    api_struct: String,
    api_crate_name: String,
}

#[derive(Debug, Clone)]
struct PendingTypeApi {
    crate_name: String,
    api_struct: String,
    target_type: RustType,
    ts_name: String,
}

struct ApiVisitor<'a> {
    report: ApiReport,
    current_impl_struct: Option<String>,
    current_crate: String,
    target_crate: String,
    config: &'a InspectorConfig,
    pending_crate_apis: Vec<PendingCrateApi>,
    pending_type_apis: Vec<PendingTypeApi>,
    pending_dto_types: Vec<String>,
}

impl<'a> ApiVisitor<'a> {
    fn new(target_crate: &str, config: &'a InspectorConfig) -> Self {
        Self {
            report: ApiReport::default(),
            current_impl_struct: None,
            current_crate: String::new(),
            target_crate: target_crate.to_string(),
            config,
            pending_crate_apis: Vec::new(),
            pending_type_apis: Vec::new(),
            pending_dto_types: Vec::new(),
        }
    }
    fn set_current_crate(&mut self, name: String) {
        self.current_crate = name;
    }
}

impl<'a, 'ast> Visit<'ast> for ApiVisitor<'a> {
    fn visit_item_struct(&mut self, node: &'ast ItemStruct) {
        // 現在のファイルがターゲットクレートでなければスキップ
        if self.current_crate != self.target_crate {
            return;
        }
        if !matches!(node.vis, syn::Visibility::Public(_)) {
            return;
        }
        let name = node.ident.to_string();
        let doc = extract_doc_comments(&node.attrs);

        let fields = match &node.fields {
            syn::Fields::Named(f) => f
                .named
                .iter()
                .map(|field| {
                    let fname = field.ident.as_ref().unwrap().to_string();
                    let ftype = field.ty.to_token_stream().to_string();
                    format!("{}: {}", fname, ftype)
                })
                .collect(),
            syn::Fields::Unnamed(f) => f
                .unnamed
                .iter()
                .map(|field| field.ty.to_token_stream().to_string())
                .collect(),
            syn::Fields::Unit => Vec::new(),
        };

        self.report.structs.push(StructInfo {
            name,
            crate_name: self.current_crate.clone(),
            doc,
            fields,
            enum_variants: Vec::new(),
            dto_candidate: has_serde_dto_derives(&node.attrs),
            dto_enabled: false,
        });
        syn::visit::visit_item_struct(self, node);
    }

    // ★追加: Enum も StructInfo として登録する
    fn visit_item_enum(&mut self, node: &'ast ItemEnum) {
        if self.current_crate != self.target_crate {
            return;
        }
        if !matches!(node.vis, syn::Visibility::Public(_)) {
            return;
        }

        let name = node.ident.to_string();
        let doc = extract_doc_comments(&node.attrs);

        // Keep legacy display strings, plus structured fields for strict DTO
        // TypeScript enum definitions.
        let fields = node
            .variants
            .iter()
            .map(|v| {
                let v_name = v.ident.to_string();
                match &v.fields {
                    syn::Fields::Unit => v_name,
                    syn::Fields::Unnamed(f) => {
                        let types: Vec<_> = f
                            .unnamed
                            .iter()
                            .map(|field| field.ty.to_token_stream().to_string())
                            .collect();
                        format!("{}({})", v_name, types.join(", "))
                    }
                    syn::Fields::Named(_) => format!("{} {{...}}", v_name),
                }
            })
            .collect();
        let enum_variants = node
            .variants
            .iter()
            .map(|variant| {
                let fields = match &variant.fields {
                    syn::Fields::Unit => EnumVariantFields::Unit,
                    syn::Fields::Unnamed(fields) => EnumVariantFields::Unnamed(
                        fields
                            .unnamed
                            .iter()
                            .map(|field| RustType::from_syn_type(&field.ty))
                            .collect(),
                    ),
                    syn::Fields::Named(fields) => EnumVariantFields::Named(
                        fields
                            .named
                            .iter()
                            .filter_map(|field| {
                                field.ident.as_ref().map(|ident| FunctionArgInfo {
                                    name: ident.to_string(),
                                    rust_type: RustType::from_syn_type(&field.ty),
                                    is_receiver: false,
                                })
                            })
                            .collect(),
                    ),
                };
                EnumVariantInfo {
                    name: variant.ident.to_string(),
                    fields,
                }
            })
            .collect();

        self.report.structs.push(StructInfo {
            name,
            crate_name: self.current_crate.clone(),
            doc,
            fields,
            enum_variants,
            dto_candidate: has_serde_dto_derives(&node.attrs),
            dto_enabled: false,
        });

        syn::visit::visit_item_enum(self, node);
    }

    fn visit_item_impl(&mut self, node: &'ast ItemImpl) {
        // 設定ファイルの無視リストを使用
        if self.config.ignored_crates.contains(&self.current_crate) {
            return;
        }

        if self.current_crate != self.target_crate {
            return;
        }

        let target_name = node.self_ty.to_token_stream().to_string();

        if let Some(marker) = extract_marker_api(node, &self.current_crate, &target_name) {
            match marker {
                MarkerApi::Crate(api) => self.pending_crate_apis.push(api),
                MarkerApi::Type(api) => self.pending_type_apis.push(api),
                MarkerApi::Dto(type_name) => self.pending_dto_types.push(type_name),
            }
            return;
        }

        // Error型などは関数を収集せずスキップする
        if should_ignore_impl(&target_name) {
            return;
        }

        let prev_impl = self.current_impl_struct.clone();
        self.current_impl_struct = Some(target_name.clone());

        let mut block_info = ImplBlockInfo {
            crate_name: self.current_crate.clone(),
            target_struct: target_name,
            functions: Vec::new(),
        };

        for item in &node.items {
            if let syn::ImplItem::Fn(method) = item {
                if !matches!(method.vis, syn::Visibility::Public(_)) {
                    continue;
                }
                let source_code = method.to_token_stream().to_string();
                let mut fn_info = extract_fn_info(&method.sig, &method.attrs, &method.vis);
                fn_info.source_code = source_code;
                block_info.functions.push(fn_info);
            }
        }

        self.report.impl_blocks.push(block_info);
        self.current_impl_struct = prev_impl;
    }

    fn visit_item_fn(&mut self, node: &'ast ItemFn) {
        syn::visit::visit_item_fn(self, node);
    }
}

// --- ヘルパー関数 ---

fn extract_doc_comments(attrs: &[syn::Attribute]) -> String {
    let mut lines = Vec::new();
    for attr in attrs {
        if attr.path().is_ident("doc") {
            if let syn::Meta::NameValue(nv) = &attr.meta {
                if let Expr::Lit(expr_lit) = &nv.value {
                    if let syn::Lit::Str(lit) = &expr_lit.lit {
                        lines.push(lit.value().trim().to_string());
                    }
                }
            }
        }
    }
    lines.join("\n")
}

/// A DTO must be serializable in both directions.  We intentionally inspect
/// derives rather than guessing from field shapes, since serde may be enabled
/// through custom attributes and the API author owns that contract.
fn has_serde_dto_derives(attrs: &[syn::Attribute]) -> bool {
    let mut serialize = false;
    let mut deserialize = false;

    for attr in attrs {
        let _ = attr.parse_nested_meta(|meta| {
            // `#[derive(Serialize, Deserialize)]`
            if attr.path().is_ident("derive") {
                record_serde_derive(&meta.path, &mut serialize, &mut deserialize);
            }
            // `#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]`
            // is common in the existing crates.  Parse the nested derive list
            // as well so the spec reports capability accurately.
            if meta.path.is_ident("derive") {
                let _ = meta.parse_nested_meta(|derive| {
                    record_serde_derive(&derive.path, &mut serialize, &mut deserialize);
                    Ok(())
                });
            }
            Ok(())
        });

        // `syn::meta::ParseNestedMeta` deliberately treats `cfg_attr`'s
        // condition as opaque, so its nested `derive(...)` is not visited on
        // all syntactic forms. The token fallback is restricted to derive or
        // cfg_attr attributes and only recognizes the two serde trait names.
        if attr.path().is_ident("cfg_attr") {
            let tokens = attr.meta.to_token_stream().to_string();
            if tokens.contains("Serialize") {
                serialize = true;
            }
            if tokens.contains("Deserialize") {
                deserialize = true;
            }
        }
    }

    serialize && deserialize
}

fn record_serde_derive(path: &syn::Path, serialize: &mut bool, deserialize: &mut bool) {
    let Some(segment) = path.segments.last() else {
        return;
    };
    match segment.ident.to_string().as_str() {
        "Serialize" => *serialize = true,
        "Deserialize" => *deserialize = true,
        _ => {}
    }
}

/// `#[grath(dto)]` is the opt-in that changes a custom type's public boundary.
/// A serde-capable type without this marker remains compatible with the
/// existing Display/FromStr string facade.
fn extract_fn_info(
    sig: &syn::Signature,
    attrs: &[syn::Attribute],
    vis: &syn::Visibility,
) -> FunctionInfo {
    let name = sig.ident.to_string();
    let doc = extract_doc_comments(attrs);

    let visibility = match vis {
        syn::Visibility::Public(_) => "pub".to_string(),
        syn::Visibility::Restricted(_) => "pub(...)".to_string(),
        syn::Visibility::Inherited => "private".to_string(),
    };

    let args: Vec<String> = sig
        .inputs
        .iter()
        .map(|arg| arg.to_token_stream().to_string())
        .collect();

    let typed_args = sig
        .inputs
        .iter()
        .map(|arg| match arg {
            syn::FnArg::Receiver(_) => FunctionArgInfo {
                name: "self".to_string(),
                rust_type: RustType::parse_str("Self"),
                is_receiver: true,
            },
            syn::FnArg::Typed(pat_type) => FunctionArgInfo {
                name: pat_type.pat.to_token_stream().to_string(),
                rust_type: RustType::from_syn_type(&pat_type.ty),
                is_receiver: false,
            },
        })
        .collect();

    let return_type = match &sig.output {
        syn::ReturnType::Default => "()".to_string(),
        syn::ReturnType::Type(_, ty) => ty.to_token_stream().to_string(),
    };
    let typed_return = match &sig.output {
        syn::ReturnType::Default => RustType::Unit,
        syn::ReturnType::Type(_, ty) => RustType::from_syn_type(ty),
    };

    FunctionInfo {
        name,
        visibility,
        args,
        return_type,
        doc,
        source_code: String::new(),
        typed_args,
        typed_return: Some(typed_return),
        codec_args: Vec::new(),
        codec_return: None,
    }
}

fn extract_crate_name(file_path: &Path, root_dir: &Path) -> String {
    let file_abs = fs::canonicalize(file_path).unwrap_or(file_path.to_path_buf());
    let root_abs = fs::canonicalize(root_dir).unwrap_or(root_dir.to_path_buf());

    if let Ok(relative) = file_abs.strip_prefix(&root_abs) {
        if let Some(first) = relative.components().next() {
            return first.as_os_str().to_string_lossy().to_string();
        }
    }
    "unknown".to_string()
}

/// 実装ブロックを解析対象から除外するか判定する
fn should_ignore_impl(struct_name: &str) -> bool {
    // "Error" で終わる構造体 (AppError, CommonErrorなど) の関数は収集しない
    if struct_name.ends_with("Error") || struct_name == "Polynomial" {
        return true;
    }
    false
}

enum MarkerApi {
    Crate(PendingCrateApi),
    Type(PendingTypeApi),
    Dto(String),
}

fn extract_marker_api(node: &ItemImpl, crate_name: &str, target_name: &str) -> Option<MarkerApi> {
    let (_, trait_path, _) = node.trait_.as_ref()?;
    let trait_name = trait_path.segments.last()?.ident.to_string();
    let api_struct = compact_type_string(target_name);

    match trait_name.as_str() {
        "GrathCrateApi" => {
            let api_crate_name = extract_assoc_const_string(node, "CRATE_NAME")
                .unwrap_or_else(|| crate_name.to_string());
            Some(MarkerApi::Crate(PendingCrateApi {
                crate_name: crate_name.to_string(),
                api_struct,
                api_crate_name,
            }))
        }
        "GrathTypeApi" => {
            let target_type = extract_assoc_type(node, "Target")?;
            let ts_name = extract_assoc_const_string(node, "TS_NAME")
                .or_else(|| target_type.base_ident().map(str::to_string))
                .unwrap_or_else(|| api_struct.trim_end_matches("Api").to_string());
            Some(MarkerApi::Type(PendingTypeApi {
                crate_name: crate_name.to_string(),
                api_struct,
                target_type,
                ts_name,
            }))
        }
        "GrathDto" => Some(MarkerApi::Dto(api_struct)),
        _ => None,
    }
}

fn extract_assoc_type(node: &ItemImpl, name: &str) -> Option<RustType> {
    node.items.iter().find_map(|item| {
        let syn::ImplItem::Type(item_type) = item else {
            return None;
        };
        if item_type.ident == name {
            Some(RustType::from_syn_type(&item_type.ty))
        } else {
            None
        }
    })
}

fn extract_assoc_const_string(node: &ItemImpl, name: &str) -> Option<String> {
    node.items.iter().find_map(|item| {
        let syn::ImplItem::Const(item_const) = item else {
            return None;
        };
        if item_const.ident != name {
            return None;
        }
        extract_string_literal(&item_const.expr)
    })
}

fn extract_string_literal(expr: &syn::Expr) -> Option<String> {
    match expr {
        syn::Expr::Lit(expr_lit) => match &expr_lit.lit {
            syn::Lit::Str(lit) => Some(lit.value()),
            _ => None,
        },
        syn::Expr::Group(group) => extract_string_literal(&group.expr),
        syn::Expr::Paren(paren) => extract_string_literal(&paren.expr),
        _ => None,
    }
}

fn compact_type_string(value: &str) -> String {
    value.replace(' ', "")
}

pub fn run(
    source_dir: &str,
    output_path: &str,
    target_crate: &str,
    config: &InspectorConfig,
) -> Result<()> {
    let target_dir = Path::new(source_dir);
    let mut visitor = ApiVisitor::new(target_crate, config);

    // 再帰的にディレクトリを探索
    for entry in WalkDir::new(target_dir).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.extension().is_some_and(|ext| ext == "rs") {
            let crate_name = extract_crate_name(path, target_dir);

            // ここで対象クレートのファイルのみをパースする
            if crate_name == target_crate {
                visitor.set_current_crate(crate_name);
                let content = fs::read_to_string(path)?;
                if let Ok(ast) = syn::parse_file(&content) {
                    visitor.visit_file(&ast);
                }
            }
        }
    }

    // Dedupe structs/enums by name.
    // Multiple modules can legally define public items with the same ident, but our
    // downstream generators (TS, tests) assume unique exported names.
    let before_structs = visitor.report.structs.len();
    let mut seen_struct_names: HashSet<String> = HashSet::new();
    visitor
        .report
        .structs
        .retain(|s| seen_struct_names.insert(s.name.clone()));
    let after_structs = visitor.report.structs.len();
    if after_structs != before_structs {
        println!(
            "Deduped structs/enums by name for {}: {} -> {}",
            target_crate, before_structs, after_structs
        );
    }

    // 非公開構造体のフィルタリング
    let public_structs: HashSet<String> = visitor
        .report
        .structs
        .iter()
        .map(|s| s.name.clone())
        .collect();

    let before_count = visitor.report.impl_blocks.len();

    // ターゲット構造体が公開リストにあるものだけを残す
    visitor
        .report
        .impl_blocks
        .retain(|block| public_structs.contains(&block.target_struct));

    let after_count = visitor.report.impl_blocks.len();

    println!(
        "Filtered internal/ignored impl blocks: {} -> {}",
        before_count, after_count
    );

    visitor.report.crate_apis =
        build_crate_apis(&visitor.pending_crate_apis, &visitor.report.impl_blocks);
    visitor.report.type_apis =
        build_type_apis(&visitor.pending_type_apis, &visitor.report.impl_blocks);
    let dto_types: HashSet<String> = visitor.pending_dto_types.iter().cloned().collect();
    for item in &mut visitor.report.structs {
        item.dto_enabled = dto_types.contains(&item.name);
    }
    if !visitor.report.crate_apis.is_empty() || !visitor.report.type_apis.is_empty() {
        println!(
            "Detected marker APIs for {}: crate_apis={}, type_apis={}",
            target_crate,
            visitor.report.crate_apis.len(),
            visitor.report.type_apis.len()
        );
    }

    visitor.report.unsupported = collect_unsupported_items(
        &visitor.report,
        &public_structs,
        &config.known_boundary_types,
        &config.known_dto_types,
    );
    annotate_codec_decisions(
        &mut visitor.report,
        &public_structs,
        &config.known_boundary_types,
        &config.known_dto_types,
    );
    if !visitor.report.unsupported.is_empty() {
        println!(
            "Detected unsupported API boundary items for {}: {}",
            target_crate,
            visitor.report.unsupported.len()
        );
    }

    let json = serde_json::to_string_pretty(&visitor.report)?;
    fs::write(output_path, json)?;
    println!("Generated JSON at: {}", output_path);

    Ok(())
}

fn annotate_codec_decisions(
    report: &mut ApiReport,
    public_structs: &HashSet<String>,
    known_boundary_types: &[String],
    known_dto_types: &[String],
) {
    let mut boundary_types: Vec<String> = public_structs.iter().cloned().collect();
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

    for block in &mut report.impl_blocks {
        for function in &mut block.functions {
            function.codec_args = function
                .boundary_args()
                .into_iter()
                .filter(|arg| !arg.is_receiver)
                .map(|arg| codec_decision(registry.classify_arg(&arg.rust_type)))
                .collect();
            function.codec_return = Some(codec_decision(
                registry.classify_return(&function.boundary_return()),
            ));
        }
    }
    // marker API structs own cloned FunctionInfo values; copy the annotated
    // version back by struct/name so every generated consumer sees one plan.
    let functions = functions_by_struct(&report.impl_blocks);
    for api in &mut report.crate_apis {
        api.functions = functions.get(&api.api_struct).cloned().unwrap_or_default();
    }
    for api in &mut report.type_apis {
        api.functions = functions.get(&api.api_struct).cloned().unwrap_or_default();
    }
}

fn codec_decision(plan: CodecPlan) -> CodecDecision {
    match plan {
        CodecPlan::Supported(codec) => CodecDecision {
            rust_type: codec.rust_type,
            supported: true,
            mode: Some(codec.mode),
            reason: None,
            recommendation: None,
        },
        CodecPlan::Unsupported(reason) => CodecDecision {
            rust_type: reason.rust_type,
            supported: false,
            mode: None,
            reason: Some(reason.reason),
            recommendation: Some(reason.recommendation),
        },
    }
}

fn build_crate_apis(
    pending: &[PendingCrateApi],
    impl_blocks: &[ImplBlockInfo],
) -> Vec<CrateApiInfo> {
    let functions_by_struct = functions_by_struct(impl_blocks);
    pending
        .iter()
        .map(|api| CrateApiInfo {
            crate_name: api.crate_name.clone(),
            api_struct: api.api_struct.clone(),
            api_crate_name: api.api_crate_name.clone(),
            functions: functions_by_struct
                .get(&api.api_struct)
                .cloned()
                .unwrap_or_default(),
        })
        .collect()
}

fn build_type_apis(pending: &[PendingTypeApi], impl_blocks: &[ImplBlockInfo]) -> Vec<TypeApiInfo> {
    let functions_by_struct = functions_by_struct(impl_blocks);
    pending
        .iter()
        .map(|api| TypeApiInfo {
            crate_name: api.crate_name.clone(),
            api_struct: api.api_struct.clone(),
            target_type: api.target_type.clone(),
            ts_name: api.ts_name.clone(),
            functions: functions_by_struct
                .get(&api.api_struct)
                .cloned()
                .unwrap_or_default(),
        })
        .collect()
}

fn functions_by_struct(impl_blocks: &[ImplBlockInfo]) -> HashMap<String, Vec<FunctionInfo>> {
    let mut out: HashMap<String, Vec<FunctionInfo>> = HashMap::new();
    for block in impl_blocks {
        out.entry(block.target_struct.clone())
            .or_default()
            .extend(block.functions.clone());
    }
    out
}

fn collect_unsupported_items(
    report: &ApiReport,
    public_structs: &HashSet<String>,
    known_boundary_types: &[String],
    known_dto_types: &[String],
) -> Vec<UnsupportedItem> {
    let mut boundary_types: Vec<String> = public_structs.iter().cloned().collect();
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
    let type_api_structs: HashSet<&str> = report
        .type_apis
        .iter()
        .map(|api| api.api_struct.as_str())
        .collect();
    let mut unsupported = Vec::new();

    for block in &report.impl_blocks {
        for func in &block.functions {
            if func.visibility != "pub" {
                continue;
            }

            let args = func.boundary_args();
            if args.len() != func.args.len() {
                unsupported.push(UnsupportedItem {
                    crate_name: block.crate_name.clone(),
                    target_struct: block.target_struct.clone(),
                    function: func.name.clone(),
                    position: "signature".to_string(),
                    rust_type: RustType::Unknown(func.args.join(", ")),
                    reason: "could not recover structured argument metadata".to_string(),
                    recommendation: "regenerate the API spec from the current Rust source".to_string(),
                });
            }
            if type_api_structs.contains(block.target_struct.as_str())
                && args.iter().any(|arg| arg.is_receiver)
            {
                unsupported.push(UnsupportedItem {
                    crate_name: block.crate_name.clone(),
                    target_struct: block.target_struct.clone(),
                    function: func.name.clone(),
                    position: "receiver".to_string(),
                    rust_type: RustType::parse_str("Self"),
                    reason: "Type API methods must be static; use the marker target type as the first argument instead".to_string(),
                    recommendation: "make the method static and pass the marker target type as its first argument".to_string(),
                });
            }

            for arg in args {
                if arg.is_receiver {
                    continue;
                }
                if let CodecPlan::Unsupported(reason) = registry.classify_arg(&arg.rust_type) {
                    unsupported.push(UnsupportedItem {
                        crate_name: block.crate_name.clone(),
                        target_struct: block.target_struct.clone(),
                        function: func.name.clone(),
                        position: format!("arg:{}", arg.name),
                        rust_type: reason.rust_type,
                        reason: reason.reason,
                        recommendation: reason.recommendation,
                    });
                }
            }

            let ret_ty = func.boundary_return();
            if let CodecPlan::Unsupported(reason) = registry.classify_return(&ret_ty) {
                unsupported.push(UnsupportedItem {
                    crate_name: block.crate_name.clone(),
                    target_struct: block.target_struct.clone(),
                    function: func.name.clone(),
                    position: "return".to_string(),
                    rust_type: reason.rust_type,
                    reason: reason.reason,
                    recommendation: reason.recommendation,
                });
            }
        }
    }

    unsupported
}

#[cfg(test)]
mod tests {
    use super::*;
    use syn::parse_quote;

    #[test]
    fn extracts_type_api_marker() {
        let item: ItemImpl = parse_quote! {
            impl GrathTypeApi for MatrixApi {
                type Target = Matrix<Rational>;
                const TS_NAME: &'static str = "RationalMatrix";
            }
        };

        let marker = extract_marker_api(&item, "linalg", "MatrixApi").expect("marker");
        let MarkerApi::Type(api) = marker else {
            panic!("expected type api");
        };

        assert_eq!(api.crate_name, "linalg");
        assert_eq!(api.api_struct, "MatrixApi");
        assert_eq!(api.target_type.canonical(), "Matrix<Rational>");
        assert_eq!(api.ts_name, "RationalMatrix");
    }

    #[test]
    fn recognizes_serde_derives_inside_cfg_attr() {
        let item: ItemStruct = parse_quote! {
            #[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
            pub struct Point { pub x: f64 }
        };
        assert!(has_serde_dto_derives(&item.attrs));
    }

    #[test]
    fn extracts_crate_api_marker() {
        let item: ItemImpl = parse_quote! {
            impl common::prelude::GrathCrateApi for LinalgApi {
                const CRATE_NAME: &'static str = "linalg";
            }
        };

        let marker = extract_marker_api(&item, "linalg", "LinalgApi").expect("marker");
        let MarkerApi::Crate(api) = marker else {
            panic!("expected crate api");
        };

        assert_eq!(api.crate_name, "linalg");
        assert_eq!(api.api_struct, "LinalgApi");
        assert_eq!(api.api_crate_name, "linalg");
    }

    #[test]
    fn links_marker_api_to_inherent_impl_functions() {
        let pending = vec![PendingTypeApi {
            crate_name: "linalg".to_string(),
            api_struct: "MatrixApi".to_string(),
            target_type: RustType::parse_str("Matrix<Rational>"),
            ts_name: "RationalMatrix".to_string(),
        }];
        let impl_blocks = vec![ImplBlockInfo {
            crate_name: "linalg".to_string(),
            target_struct: "MatrixApi".to_string(),
            functions: vec![FunctionInfo {
                name: "inverse".to_string(),
                visibility: "pub".to_string(),
                args: vec!["a: Matrix < Rational >".to_string()],
                return_type: "Result < Matrix < Rational >, LinalgError >".to_string(),
                doc: String::new(),
                source_code: String::new(),
                typed_args: vec![],
                typed_return: None,
                codec_args: vec![],
                codec_return: None,
            }],
        }];

        let type_apis = build_type_apis(&pending, &impl_blocks);
        assert_eq!(type_apis.len(), 1);
        assert_eq!(type_apis[0].functions.len(), 1);
        assert_eq!(type_apis[0].functions[0].name, "inverse");
    }

    #[test]
    fn records_unsupported_custom_vector_boundary_in_spec() {
        let report = ApiReport {
            structs: vec![],
            impl_blocks: vec![ImplBlockInfo {
                crate_name: "linalg".to_string(),
                target_struct: "MatrixApi".to_string(),
                functions: vec![FunctionInfo {
                    name: "combine".to_string(),
                    visibility: "pub".to_string(),
                    args: vec!["items: Vec<Matrix<Rational>>".to_string()],
                    return_type: "()".to_string(),
                    doc: String::new(),
                    source_code: String::new(),
                    typed_args: vec![FunctionArgInfo {
                        name: "items".to_string(),
                        rust_type: RustType::parse_str("Vec<Matrix<Rational>>"),
                        is_receiver: false,
                    }],
                    typed_return: Some(RustType::Unit),
                    codec_args: vec![],
                    codec_return: None,
                }],
            }],
            crate_apis: vec![],
            type_apis: vec![TypeApiInfo {
                crate_name: "linalg".to_string(),
                api_struct: "MatrixApi".to_string(),
                target_type: RustType::parse_str("Matrix<Rational>"),
                ts_name: "RationalMatrix".to_string(),
                functions: vec![],
            }],
            unsupported: vec![],
        };
        let public_structs = HashSet::from(["Matrix".to_string()]);

        let unsupported = collect_unsupported_items(&report, &public_structs, &[], &[]);
        assert_eq!(unsupported.len(), 1);
        assert_eq!(unsupported[0].position, "arg:items");
        assert!(unsupported[0].reason.contains("Vec<custom type>"));
    }
}
