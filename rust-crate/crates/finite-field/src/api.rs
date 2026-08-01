use crate::error::{FieldError, Result};
use crate::gf256::gf256_from_u8;
use crate::gfp::GFp;
use common::prelude::GrathCrateApi;

pub struct FiniteFieldApi;

impl GrathCrateApi for FiniteFieldApi {
    const CRATE_NAME: &'static str = "finite-field";
}

impl FiniteFieldApi {
    pub fn gf256_mul(a: String, b: String) -> Result<String> {
        let a = parse_u8_hex_or_dec(&a)?;
        let b = parse_u8_hex_or_dec(&b)?;
        let c = gf256_from_u8(a) * gf256_from_u8(b);
        Ok(c.to_u8().to_string())
    }

    pub fn gf256_inv_check(a: String) -> Result<bool> {
        let a = parse_u8_hex_or_dec(&a)?;
        let x = gf256_from_u8(a);
        let inv = x.inv()?;
        Ok((x * inv).is_one())
    }

    pub fn gfp5_add(a: String, b: String) -> Result<String> {
        let a = parse_i64_dec(&a)?;
        let b = parse_i64_dec(&b)?;
        let c = GFp::<5>::new(a) + GFp::<5>::new(b);
        Ok(c.0.to_string())
    }

    pub fn gfp5_mul(a: String, b: String) -> Result<String> {
        let a = parse_i64_dec(&a)?;
        let b = parse_i64_dec(&b)?;
        let c = GFp::<5>::new(a) * GFp::<5>::new(b);
        Ok(c.0.to_string())
    }

    pub fn gfp5_inv(a: String) -> Result<String> {
        let a = parse_i64_dec(&a)?;
        let inv = GFp::<5>::new(a).inv()?;
        Ok(inv.0.to_string())
    }
}

fn parse_u8_hex_or_dec(s: &str) -> Result<u8> {
    let s = s.trim();
    if let Some(hex) = s.strip_prefix("0x").or_else(|| s.strip_prefix("0X")) {
        u8::from_str_radix(hex, 16).map_err(|e| FieldError::InvalidArgument {
            text: format!("invalid u8 hex '{s}': {e}"),
        })
    } else {
        s.parse::<u8>().map_err(|e| FieldError::InvalidArgument {
            text: format!("invalid u8 '{s}': {e}"),
        })
    }
}

fn parse_i64_dec(s: &str) -> Result<i64> {
    let s = s.trim();
    s.parse::<i64>().map_err(|e| FieldError::InvalidArgument {
        text: format!("invalid integer '{s}': {e}"),
    })
}
