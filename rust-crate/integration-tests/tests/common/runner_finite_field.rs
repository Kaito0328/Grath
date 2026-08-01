// --- Auto-generated Test Runner ---
#![allow(unused_imports)]
#![allow(non_snake_case)]
#![allow(unused_mut)]
#![allow(clippy::match_single_binding)]
#![allow(unused_variables)]

use finite_field::prelude::*;
use finite_field::*;
use std::collections::{BTreeMap, HashMap};
use std::str::FromStr;


fn vec_to_csv<T: ToString>(v: &[T]) -> String {
    v.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(",")
}

pub fn run_dynamic_test(func_key: &str, inputs: &[String]) -> std::result::Result<String, String> {
    match func_key {
        "FiniteFieldApi::gf256_mul" => {
            let arg0 = inputs[0].to_string();
            let arg1 = inputs[1].to_string();

            let result = FiniteFieldApi::gf256_mul(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "FiniteFieldApi::gf256_inv_check" => {
            let arg0 = inputs[0].to_string();

            let result = FiniteFieldApi::gf256_inv_check(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "FiniteFieldApi::gfp5_add" => {
            let arg0 = inputs[0].to_string();
            let arg1 = inputs[1].to_string();

            let result = FiniteFieldApi::gfp5_add(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "FiniteFieldApi::gfp5_mul" => {
            let arg0 = inputs[0].to_string();
            let arg1 = inputs[1].to_string();

            let result = FiniteFieldApi::gfp5_mul(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "FiniteFieldApi::gfp5_inv" => {
            let arg0 = inputs[0].to_string();

            let result = FiniteFieldApi::gfp5_inv(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        _ => Err(format!("Unknown function: {}", func_key)),
    }
}
