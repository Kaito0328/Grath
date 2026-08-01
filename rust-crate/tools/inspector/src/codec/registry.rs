use super::type_model::{RustPrimitive, RustType};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum BoundaryKind {
    Unit,
    Primitive,
    BigIntPrimitive,
    String,
    TypedArray,
    PrimitiveArray,
    StringBoundary,
    Dto,
    Option(Box<BoundaryKind>),
    Result(Box<BoundaryKind>),
}

/// The external representation selected by the registry.  Keeping this
/// separate from `BoundaryKind` makes the migration path explicit: existing
/// custom types retain `String`, while a future DTO codec can use `Dto`
/// without generators inferring a transport from a type spelling.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BoundaryMode {
    Native,
    String,
    Dto,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BoundaryCodec {
    pub rust_type: RustType,
    pub ts_input_type: String,
    pub ts_output_type: String,
    pub wasm_arg_type: String,
    pub wasm_return_type: String,
    pub kind: BoundaryKind,
    pub mode: BoundaryMode,
    pub uses_fallible_decode: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UnsupportedReason {
    pub rust_type: RustType,
    pub reason: String,
    pub recommendation: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CodecPlan {
    Supported(BoundaryCodec),
    Unsupported(UnsupportedReason),
}

impl CodecPlan {
    pub fn is_supported(&self) -> bool {
        matches!(self, Self::Supported(_))
    }

    pub fn unsupported_reason(&self) -> Option<&str> {
        match self {
            Self::Unsupported(reason) => Some(&reason.reason),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Default)]
pub struct CodecRegistry {
    custom_types: HashSet<String>,
    dto_types: HashSet<String>,
}

impl CodecRegistry {
    pub fn new<I, S>(custom_types: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        Self {
            custom_types: custom_types.into_iter().map(Into::into).collect(),
            dto_types: HashSet::new(),
        }
    }

    pub fn with_custom_types(custom_types: &[String]) -> Self {
        Self::new(custom_types.iter().cloned())
    }

    /// Register explicit DTO boundary types. They take precedence over the
    /// compatible string boundary for the same name.
    pub fn with_dto_types<I, S, J, T>(custom_types: I, dto_types: J) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
        J: IntoIterator<Item = T>,
        T: Into<String>,
    {
        Self {
            custom_types: custom_types.into_iter().map(Into::into).collect(),
            dto_types: dto_types.into_iter().map(Into::into).collect(),
        }
    }

    pub fn classify_arg(&self, ty: &RustType) -> CodecPlan {
        self.classify(ty, CodecPosition::Arg)
    }

    pub fn classify_return(&self, ty: &RustType) -> CodecPlan {
        self.classify(ty, CodecPosition::Return)
    }

    fn classify(&self, ty: &RustType, position: CodecPosition) -> CodecPlan {
        match ty {
            RustType::Reference { inner, .. } => self.classify(inner, position),
            RustType::Result { ok, .. } if position == CodecPosition::Arg => unsupported(
                ty,
                "Result values are return-only boundaries; accept the Ok payload or a DTO instead",
            ),
            RustType::Result { ok, .. } => match self.classify(ok, position) {
                CodecPlan::Supported(mut codec) => {
                    codec.rust_type = ty.clone();
                    codec.kind = BoundaryKind::Result(Box::new(codec.kind));
                    CodecPlan::Supported(codec)
                }
                CodecPlan::Unsupported(reason) => CodecPlan::Unsupported(UnsupportedReason {
                    rust_type: ty.clone(),
                    reason: format!("unsupported Result ok type: {}", reason.reason),
                    recommendation: reason.recommendation,
                }),
            },
            RustType::Option(inner) => match self.classify(inner, position) {
                CodecPlan::Supported(mut codec) => {
                    codec.rust_type = ty.clone();
                    codec.ts_input_type = format!("{} | null", codec.ts_input_type);
                    codec.ts_output_type = format!("{} | null", codec.ts_output_type);
                    // DTOs cross wasm-bindgen as one JsValue; serde handles
                    // null ↔ Option<T> inside that value. Wrapping it in
                    // Option<JsValue> would make the generated function
                    // return type disagree with serde_wasm_bindgen::to_value.
                    if !matches!(codec.mode, BoundaryMode::Dto) {
                        codec.wasm_arg_type = format!("Option<{}>", codec.wasm_arg_type);
                        codec.wasm_return_type = format!("Option<{}>", codec.wasm_return_type);
                    }
                    codec.kind = BoundaryKind::Option(Box::new(codec.kind));
                    CodecPlan::Supported(codec)
                }
                CodecPlan::Unsupported(reason) => CodecPlan::Unsupported(UnsupportedReason {
                    rust_type: ty.clone(),
                    reason: format!("unsupported Option inner type: {}", reason.reason),
                    recommendation: reason.recommendation,
                }),
            },
            RustType::Unit => supported(ty, "void", "void", "()", "()", BoundaryKind::Unit, false),
            RustType::String | RustType::Str => supported(
                ty,
                "string",
                "string",
                if matches!(ty, RustType::Str) && position == CodecPosition::Arg {
                    "&str"
                } else {
                    "String"
                },
                "String",
                BoundaryKind::String,
                false,
            ),
            RustType::Primitive(primitive) => self.classify_primitive(ty, primitive),
            RustType::Vec(inner) => self.classify_vec(ty, inner, position),
            RustType::Path(path) if matches!(path.last_segment(), Some("HashMap" | "BTreeMap")) => {
                self.classify_string_key_map(ty, path)
            }
            RustType::Path(_) => self.classify_custom_type(ty),
            RustType::Tuple(items) => {
                if items.is_empty() {
                    supported(ty, "void", "void", "()", "()", BoundaryKind::Unit, false)
                } else if items.iter().all(|item| self.is_serde_dto_capable(item)) {
                    dto_supported(ty, "unknown", "unknown")
                } else {
                    unsupported(ty, "tuple contains a non-DTO custom type; mark it GrathDto or expose a string facade")
                }
            }
            RustType::Slice(_) => unsupported(ty, "slice boundaries are not supported; use Vec<T>"),
            RustType::Array { inner, .. } => {
                if self.is_serde_dto_capable(inner) {
                    dto_supported(ty, "unknown[]", "unknown[]")
                } else {
                    unsupported(ty, "array contains a non-DTO custom type; use Vec<T> or mark the element GrathDto")
                }
            }
            RustType::Unknown(raw) => unsupported(ty, &format!("unknown Rust type syntax: {raw}")),
        }
    }

    fn classify_primitive(&self, ty: &RustType, primitive: &RustPrimitive) -> CodecPlan {
        if primitive.is_bigint_boundary() {
            return supported(
                ty,
                "number | bigint",
                "bigint",
                primitive.as_rust(),
                primitive.as_rust(),
                BoundaryKind::BigIntPrimitive,
                false,
            );
        }

        let ts = if matches!(primitive, RustPrimitive::Bool) {
            "boolean"
        } else {
            "number"
        };
        supported(
            ty,
            ts,
            ts,
            primitive.as_rust(),
            primitive.as_rust(),
            BoundaryKind::Primitive,
            false,
        )
    }

    fn classify_vec(&self, ty: &RustType, inner: &RustType, _position: CodecPosition) -> CodecPlan {
        match inner.without_reference() {
            RustType::Primitive(RustPrimitive::F64) => supported(
                ty,
                "Float64Array | number[]",
                "Float64Array",
                "Vec<f64>",
                "Vec<f64>",
                BoundaryKind::TypedArray,
                false,
            ),
            RustType::Primitive(RustPrimitive::F32) => supported(
                ty,
                "Float32Array | number[]",
                "Float32Array",
                "Vec<f32>",
                "Vec<f32>",
                BoundaryKind::TypedArray,
                false,
            ),
            RustType::Primitive(RustPrimitive::U8) => supported(
                ty,
                "Uint8Array | number[]",
                "Uint8Array",
                "Vec<u8>",
                "Vec<u8>",
                BoundaryKind::TypedArray,
                false,
            ),
            RustType::Primitive(p) => supported(
                ty,
                &format!("{}[]", primitive_ts_input(p)),
                &format!("{}[]", primitive_ts_output(p)),
                &format!("Vec<{}>", p.as_rust()),
                &format!("Vec<{}>", p.as_rust()),
                BoundaryKind::PrimitiveArray,
                false,
            ),
            RustType::String | RustType::Str => supported(
                ty,
                "string[]",
                "string[]",
                "Vec<String>",
                "Vec<String>",
                BoundaryKind::PrimitiveArray,
                false,
            ),
            RustType::Path(_) if self.is_dto_supported(inner) => supported(
                ty,
                "unknown[]",
                "unknown[]",
                "JsValue",
                "JsValue",
                BoundaryKind::Dto,
                true,
            ),
            RustType::Path(_) if self.is_custom_supported(inner) => unsupported(
                ty,
                "Vec<custom type> boundaries are not supported yet; expose a dedicated string or DTO API instead",
            ),
            _ => unsupported(
                ty,
                &format!("Vec inner type is not supported: {}", inner.canonical()),
            ),
        }
    }

    fn classify_custom_type(&self, ty: &RustType) -> CodecPlan {
        if self.is_dto_supported(ty) {
            return supported(
                ty,
                "unknown",
                "unknown",
                "JsValue",
                "JsValue",
                BoundaryKind::Dto,
                true,
            );
        }
        if self.is_custom_supported(ty) {
            supported(
                ty,
                "string",
                "string",
                "&str",
                "String",
                BoundaryKind::StringBoundary,
                true,
            )
        } else {
            unsupported(
                ty,
                &format!(
                    "custom type is not registered for string boundary: {}",
                    ty.canonical()
                ),
            )
        }
    }

    fn classify_string_key_map(&self, ty: &RustType, path: &super::type_model::RustPathType) -> CodecPlan {
        let Some(key) = path.args.first() else {
            return unsupported(ty, "map requires key and value type parameters");
        };
        let Some(value) = path.args.get(1) else {
            return unsupported(ty, "map requires key and value type parameters");
        };
        if !matches!(key.without_reference(), RustType::String | RustType::Str) {
            return unsupported(ty, "map DTO boundary requires String keys; use Vec<{ key, value }> for other key types");
        }
        if !self.is_serde_dto_capable(value) {
            return unsupported(ty, "map value is not DTO-capable; mark the custom value type GrathDto or use a string facade");
        }
        dto_supported(ty, "Record<string, unknown>", "Record<string, unknown>")
    }

    /// Determines whether serde can safely own a composite boundary. Native
    /// scalars and explicit DTOs qualify; legacy Display/FromStr values do not.
    fn is_serde_dto_capable(&self, ty: &RustType) -> bool {
        match ty.without_reference() {
            RustType::Unit | RustType::String | RustType::Str | RustType::Primitive(_) => true,
            RustType::Path(path) if matches!(path.last_segment(), Some("HashMap" | "BTreeMap")) => {
                matches!(self.classify_string_key_map(ty.without_reference(), path), CodecPlan::Supported(_))
            }
            RustType::Path(_) => self.is_dto_supported(ty),
            RustType::Vec(inner) | RustType::Slice(inner) | RustType::Option(inner) | RustType::Array { inner, .. } => {
                self.is_serde_dto_capable(inner)
            }
            RustType::Tuple(items) => items.iter().all(|item| self.is_serde_dto_capable(item)),
            RustType::Result { ok, .. } => self.is_serde_dto_capable(ok),
            RustType::Reference { inner, .. } => self.is_serde_dto_capable(inner),
            RustType::Unknown(_) => false,
        }
    }

    fn is_custom_supported(&self, ty: &RustType) -> bool {
        let Some(base) = ty.without_reference().base_ident() else {
            return false;
        };
        base == "Self" || self.custom_types.contains(base)
    }

    fn is_dto_supported(&self, ty: &RustType) -> bool {
        ty.without_reference()
            .base_ident()
            .is_some_and(|base| self.dto_types.contains(base))
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum CodecPosition {
    Arg,
    Return,
}

fn primitive_ts_input(primitive: &RustPrimitive) -> &'static str {
    if primitive.is_bigint_boundary() {
        "number | bigint"
    } else if matches!(primitive, RustPrimitive::Bool) {
        "boolean"
    } else {
        "number"
    }
}

fn primitive_ts_output(primitive: &RustPrimitive) -> &'static str {
    if primitive.is_bigint_boundary() {
        "bigint"
    } else if matches!(primitive, RustPrimitive::Bool) {
        "boolean"
    } else {
        "number"
    }
}

fn supported(
    ty: &RustType,
    ts_input_type: &str,
    ts_output_type: &str,
    wasm_arg_type: &str,
    wasm_return_type: &str,
    kind: BoundaryKind,
    uses_fallible_decode: bool,
) -> CodecPlan {
    let mode = match kind {
        BoundaryKind::StringBoundary => BoundaryMode::String,
        BoundaryKind::Dto => BoundaryMode::Dto,
        _ => BoundaryMode::Native,
    };
    CodecPlan::Supported(BoundaryCodec {
        rust_type: ty.clone(),
        ts_input_type: ts_input_type.to_string(),
        ts_output_type: ts_output_type.to_string(),
        wasm_arg_type: wasm_arg_type.to_string(),
        wasm_return_type: wasm_return_type.to_string(),
        kind,
        mode,
        uses_fallible_decode,
    })
}

fn dto_supported(ty: &RustType, ts_input_type: &str, ts_output_type: &str) -> CodecPlan {
    supported(
        ty,
        ts_input_type,
        ts_output_type,
        "JsValue",
        "JsValue",
        BoundaryKind::Dto,
        true,
    )
}

fn unsupported(ty: &RustType, reason: &str) -> CodecPlan {
    CodecPlan::Unsupported(UnsupportedReason {
        rust_type: ty.clone(),
        reason: reason.to_string(),
        recommendation: unsupported_recommendation(ty, reason),
    })
}

fn unsupported_recommendation(ty: &RustType, reason: &str) -> String {
    if reason.contains("custom type") || reason.contains("tuple") || reason.contains("array") {
        return "derive serde::Serialize and serde::Deserialize on a public DTO, then expose it through the DTO boundary; alternatively expose an explicit string facade".to_string();
    }
    if reason.contains("map") {
        return "model the map as a serde DTO (or a Vec of key/value DTOs) before exposing it".to_string();
    }
    if matches!(ty, RustType::Unknown(_)) {
        return "replace the boundary type with a supported primitive, Vec, string facade, or serde DTO".to_string();
    }
    "use a supported native boundary type, an explicit string facade, or a serde DTO".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn supported_codec(plan: CodecPlan) -> BoundaryCodec {
        match plan {
            CodecPlan::Supported(codec) => codec,
            CodecPlan::Unsupported(reason) => panic!("unsupported: {}", reason.reason),
        }
    }

    #[test]
    fn classifies_typed_arrays() {
        let registry = CodecRegistry::default();
        let codec = supported_codec(registry.classify_arg(&RustType::parse_str("Vec < f64 >")));
        assert_eq!(codec.ts_input_type, "Float64Array | number[]");
        assert_eq!(codec.wasm_arg_type, "Vec<f64>");
        assert_eq!(codec.kind, BoundaryKind::TypedArray);
    }

    #[test]
    fn classifies_bigint_primitives_explicitly() {
        let registry = CodecRegistry::default();
        let codec = supported_codec(registry.classify_arg(&RustType::parse_str("u64")));
        assert_eq!(codec.ts_input_type, "number | bigint");
        assert_eq!(codec.ts_output_type, "bigint");
        assert_eq!(codec.kind, BoundaryKind::BigIntPrimitive);
    }

    #[test]
    fn classifies_custom_types_as_string_boundary_when_registered() {
        let registry = CodecRegistry::new(["Matrix"]);
        let codec =
            supported_codec(registry.classify_arg(&RustType::parse_str("&Matrix<Rational>")));
        assert_eq!(codec.ts_input_type, "string");
        assert_eq!(codec.wasm_arg_type, "&str");
        assert!(codec.uses_fallible_decode);
    }

    #[test]
    fn rejects_unregistered_custom_types() {
        let registry = CodecRegistry::default();
        let plan = registry.classify_arg(&RustType::parse_str("Matrix<Rational>"));
        assert!(!plan.is_supported());
        assert!(plan
            .unsupported_reason()
            .expect("reason")
            .contains("not registered"));
    }

    #[test]
    fn self_is_supported_as_current_custom_type() {
        let registry = CodecRegistry::default();
        let codec = supported_codec(registry.classify_return(&RustType::parse_str("Self")));
        assert_eq!(codec.ts_output_type, "string");
        assert_eq!(codec.kind, BoundaryKind::StringBoundary);
    }

    #[test]
    fn peels_result_to_ok_codec() {
        let registry = CodecRegistry::default();
        let codec = supported_codec(
            registry.classify_return(&RustType::parse_str("Result<Vec<u8>, CodingError>")),
        );
        assert_eq!(codec.ts_output_type, "Uint8Array");
        assert!(matches!(codec.kind, BoundaryKind::Result(_)));
    }

    #[test]
    fn rejects_custom_type_vectors_until_their_element_codec_is_implemented() {
        let registry = CodecRegistry::new(["Matrix"]);
        let plan = registry.classify_arg(&RustType::parse_str("Vec<Matrix<Rational>>"));
        assert!(!plan.is_supported());
        assert!(plan
            .unsupported_reason()
            .expect("reason")
            .contains("Vec<custom type>"));
    }

    #[test]
    fn explicit_dto_type_uses_jsvalue_for_nested_vectors_and_options() {
        let registry = CodecRegistry::with_dto_types(["Point"], ["Point"]);
        let codec = supported_codec(
            registry.classify_arg(&RustType::parse_str("Option<Vec<Point>>")),
        );
        assert_eq!(codec.mode, BoundaryMode::Dto);
        assert_eq!(codec.wasm_arg_type, "JsValue");
        assert_eq!(codec.ts_input_type, "unknown[] | null");
    }

    #[test]
    fn classifies_dto_tuple_array_and_string_key_map() {
        let registry = CodecRegistry::with_dto_types(["Point"], ["Point"]);
        for spelling in [
            "(Point, i32)",
            "[Point; 2]",
            "BTreeMap<String, Point>",
            "HashMap<String, Option<Vec<Point>>>",
        ] {
            let codec = supported_codec(registry.classify_arg(&RustType::parse_str(spelling)));
            assert_eq!(codec.mode, BoundaryMode::Dto, "{spelling}");
            assert_eq!(codec.wasm_arg_type, "JsValue", "{spelling}");
        }
    }

    #[test]
    fn rejects_non_string_map_keys_and_result_arguments() {
        let registry = CodecRegistry::with_dto_types(["Point"], ["Point"]);
        let map = registry.classify_arg(&RustType::parse_str("BTreeMap<i32, Point>"));
        assert!(map.unsupported_reason().expect("map reason").contains("String keys"));

        let result = registry.classify_arg(&RustType::parse_str("Result<Point, AppError>"));
        assert!(result
            .unsupported_reason()
            .expect("Result reason")
            .contains("return-only"));
    }
}
