use quote::ToTokens;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum RustPrimitive {
    Bool,
    F32,
    F64,
    I8,
    I16,
    I32,
    I64,
    ISize,
    U8,
    U16,
    U32,
    U64,
    USize,
}

impl RustPrimitive {
    pub fn from_ident(ident: &str) -> Option<Self> {
        match ident {
            "bool" => Some(Self::Bool),
            "f32" => Some(Self::F32),
            "f64" => Some(Self::F64),
            "i8" => Some(Self::I8),
            "i16" => Some(Self::I16),
            "i32" => Some(Self::I32),
            "i64" => Some(Self::I64),
            "isize" => Some(Self::ISize),
            "u8" => Some(Self::U8),
            "u16" => Some(Self::U16),
            "u32" => Some(Self::U32),
            "u64" => Some(Self::U64),
            "usize" => Some(Self::USize),
            _ => None,
        }
    }

    pub fn as_rust(&self) -> &'static str {
        match self {
            Self::Bool => "bool",
            Self::F32 => "f32",
            Self::F64 => "f64",
            Self::I8 => "i8",
            Self::I16 => "i16",
            Self::I32 => "i32",
            Self::I64 => "i64",
            Self::ISize => "isize",
            Self::U8 => "u8",
            Self::U16 => "u16",
            Self::U32 => "u32",
            Self::U64 => "u64",
            Self::USize => "usize",
        }
    }

    pub fn is_bigint_boundary(&self) -> bool {
        matches!(self, Self::I64 | Self::U64)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct RustPathType {
    pub segments: Vec<String>,
    pub args: Vec<RustType>,
}

impl RustPathType {
    pub fn last_segment(&self) -> Option<&str> {
        self.segments.last().map(String::as_str)
    }

    pub fn canonical_name(&self) -> String {
        self.segments.join("::")
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum RustType {
    Unit,
    Primitive(RustPrimitive),
    String,
    Str,
    Reference {
        mutable: bool,
        inner: Box<RustType>,
    },
    Vec(Box<RustType>),
    Result {
        ok: Box<RustType>,
        err: Option<Box<RustType>>,
    },
    Option(Box<RustType>),
    Path(RustPathType),
    Tuple(Vec<RustType>),
    Slice(Box<RustType>),
    Array {
        inner: Box<RustType>,
        len: String,
    },
    Unknown(String),
}

impl RustType {
    pub fn parse_str(input: &str) -> Self {
        let normalized = normalize_type_string(input);
        match syn::parse_str::<syn::Type>(&normalized) {
            Ok(ty) => Self::from_syn_type(&ty),
            Err(_) => Self::Unknown(normalized),
        }
    }

    pub fn from_syn_type(ty: &syn::Type) -> Self {
        match ty {
            syn::Type::Path(path) => Self::from_type_path(path),
            syn::Type::Reference(reference) => Self::Reference {
                mutable: reference.mutability.is_some(),
                inner: Box::new(Self::from_syn_type(&reference.elem)),
            },
            syn::Type::Tuple(tuple) if tuple.elems.is_empty() => Self::Unit,
            syn::Type::Tuple(tuple) => {
                Self::Tuple(tuple.elems.iter().map(Self::from_syn_type).collect())
            }
            syn::Type::Slice(slice) => Self::Slice(Box::new(Self::from_syn_type(&slice.elem))),
            syn::Type::Array(array) => Self::Array {
                inner: Box::new(Self::from_syn_type(&array.elem)),
                len: array.len.to_token_stream().to_string(),
            },
            _ => Self::Unknown(ty.to_token_stream().to_string()),
        }
    }

    pub fn without_reference(&self) -> &RustType {
        match self {
            Self::Reference { inner, .. } => inner.without_reference(),
            _ => self,
        }
    }

    pub fn is_mut_reference(&self) -> bool {
        matches!(self, Self::Reference { mutable: true, .. })
    }

    pub fn base_ident(&self) -> Option<&str> {
        match self.without_reference() {
            Self::Primitive(p) => Some(p.as_rust()),
            Self::String => Some("String"),
            Self::Str => Some("str"),
            Self::Vec(_) => Some("Vec"),
            Self::Result { .. } => Some("Result"),
            Self::Option(_) => Some("Option"),
            Self::Path(path) => path.last_segment(),
            _ => None,
        }
    }

    pub fn canonical(&self) -> String {
        match self {
            Self::Unit => "()".to_string(),
            Self::Primitive(p) => p.as_rust().to_string(),
            Self::String => "String".to_string(),
            Self::Str => "str".to_string(),
            Self::Reference { mutable, inner } => {
                if *mutable {
                    format!("&mut {}", inner.canonical())
                } else {
                    format!("&{}", inner.canonical())
                }
            }
            Self::Vec(inner) => format!("Vec<{}>", inner.canonical()),
            Self::Result { ok, err } => {
                if let Some(err) = err {
                    format!("Result<{}, {}>", ok.canonical(), err.canonical())
                } else {
                    format!("Result<{}>", ok.canonical())
                }
            }
            Self::Option(inner) => format!("Option<{}>", inner.canonical()),
            Self::Path(path) => {
                let name = path.canonical_name();
                if path.args.is_empty() {
                    name
                } else {
                    format!(
                        "{}<{}>",
                        name,
                        path.args
                            .iter()
                            .map(RustType::canonical)
                            .collect::<Vec<_>>()
                            .join(", ")
                    )
                }
            }
            Self::Tuple(items) => format!(
                "({})",
                items
                    .iter()
                    .map(RustType::canonical)
                    .collect::<Vec<_>>()
                    .join(", ")
            ),
            Self::Slice(inner) => format!("[{}]", inner.canonical()),
            Self::Array { inner, len } => format!("[{}; {}]", inner.canonical(), len),
            Self::Unknown(raw) => raw.clone(),
        }
    }

    fn from_type_path(path: &syn::TypePath) -> Self {
        let Some(last) = path.path.segments.last() else {
            return Self::Unknown(path.to_token_stream().to_string());
        };

        let ident = last.ident.to_string();
        if let Some(primitive) = RustPrimitive::from_ident(&ident) {
            return Self::Primitive(primitive);
        }
        if ident == "String" {
            return Self::String;
        }
        if ident == "str" {
            return Self::Str;
        }

        let args = match &last.arguments {
            syn::PathArguments::AngleBracketed(args) => args
                .args
                .iter()
                .filter_map(|arg| match arg {
                    syn::GenericArgument::Type(ty) => Some(Self::from_syn_type(ty)),
                    _ => None,
                })
                .collect::<Vec<_>>(),
            _ => Vec::new(),
        };

        match ident.as_str() {
            "Vec" if args.len() == 1 => Self::Vec(Box::new(args[0].clone())),
            "Result" if args.len() == 1 => Self::Result {
                ok: Box::new(args[0].clone()),
                err: None,
            },
            "Result" if args.len() >= 2 => Self::Result {
                ok: Box::new(args[0].clone()),
                err: Some(Box::new(args[1].clone())),
            },
            "Option" if args.len() == 1 => Self::Option(Box::new(args[0].clone())),
            _ => Self::Path(RustPathType {
                segments: path
                    .path
                    .segments
                    .iter()
                    .map(|segment| segment.ident.to_string())
                    .collect(),
                args,
            }),
        }
    }
}

pub fn normalize_type_string(input: &str) -> String {
    input
        .trim()
        .trim_start_matches("mut ")
        .replace("& str", "&str")
        .replace("& mut", "&mut")
}

pub fn parse_arg_type(arg: &str) -> Option<(String, RustType)> {
    let mut parts = arg.splitn(2, ':');
    let name = parts.next()?.trim().trim_start_matches("mut ").to_string();
    let ty = parts.next()?.trim();
    Some((name, RustType::parse_str(ty)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_reference_to_generic_path() {
        let ty = RustType::parse_str("& Matrix < Rational >");
        assert_eq!(ty.canonical(), "&Matrix<Rational>");
        assert_eq!(ty.without_reference().base_ident(), Some("Matrix"));
    }

    #[test]
    fn parses_result_vec_with_error() {
        let ty = RustType::parse_str("std::result::Result < Vec < f64 >, LinalgError >");
        assert_eq!(ty.canonical(), "Result<Vec<f64>, LinalgError>");
        match ty {
            RustType::Result { ok, err } => {
                assert_eq!(ok.canonical(), "Vec<f64>");
                assert_eq!(err.expect("err").canonical(), "LinalgError");
            }
            _ => panic!("expected result"),
        }
    }

    #[test]
    fn parses_arg_definition() {
        let (name, ty) = parse_arg_type("mut a: &mut Matrix<Rational>").expect("arg");
        assert_eq!(name, "a");
        assert!(ty.is_mut_reference());
        assert_eq!(ty.without_reference().canonical(), "Matrix<Rational>");
    }
}
