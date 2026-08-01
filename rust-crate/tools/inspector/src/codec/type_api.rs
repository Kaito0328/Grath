use super::RustType;
use crate::types::TypeApiInfo;

pub fn type_api_export_name(api: &TypeApiInfo, function_name: &str) -> String {
    format!("{}_{}", to_snake_case(&api.ts_name), function_name)
}

pub fn is_type_api_target(api: &TypeApiInfo, ty: &RustType) -> bool {
    ty.without_reference().canonical() == api.target_type.canonical()
}

pub fn is_string_boundary_type(ty: &RustType) -> bool {
    matches!(
        ty.without_reference(),
        RustType::Path(_) | RustType::String | RustType::Str
    )
}

pub fn is_type_api_string_arg(api: &TypeApiInfo, ty: &RustType) -> bool {
    is_type_api_target(api, ty) || is_string_boundary_type(ty)
}

pub fn is_matrix_type(ty: &RustType) -> bool {
    ty.without_reference().base_ident() == Some("Matrix")
}

pub fn rust_string_boundary_encoder(expr: &str, ty: &RustType) -> String {
    if is_matrix_type(ty) {
        format!("encode_matrix_to_string({expr})")
    } else {
        format!("encode_to_string({expr})")
    }
}

pub fn to_snake_case(value: &str) -> String {
    let mut out = String::new();
    for (idx, ch) in value.chars().enumerate() {
        if ch.is_ascii_uppercase() {
            if idx > 0 {
                out.push('_');
            }
            out.push(ch.to_ascii_lowercase());
        } else if ch.is_ascii_alphanumeric() {
            out.push(ch);
        } else {
            out.push('_');
        }
    }
    out
}
