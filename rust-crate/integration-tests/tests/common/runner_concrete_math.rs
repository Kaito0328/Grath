// --- Auto-generated Test Runner ---
#![allow(unused_imports)]
#![allow(non_snake_case)]
#![allow(unused_mut)]
#![allow(clippy::match_single_binding)]
#![allow(unused_variables)]

use concrete_math::prelude::*;
use concrete_math::*;
use std::collections::{BTreeMap, HashMap};
use std::str::FromStr;

fn vec_to_csv<T: ToString>(v: &[T]) -> String {
    v.iter()
        .map(|x| x.to_string())
        .collect::<Vec<_>>()
        .join(",")
}

pub fn run_dynamic_test(func_key: &str, inputs: &[String]) -> std::result::Result<String, String> {
    match func_key {
        "ConcreteMathApi::nt_gcd" => {
            let arg0 = inputs[0]
                .parse::<u64>()
                .map_err(|e| format!("Parse arg0 error: {}", e))?;
            let arg1 = inputs[1]
                .parse::<u64>()
                .map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = ConcreteMathApi::nt_gcd(arg0, arg1);
            Ok(result.to_string())
        }
        "ConcreteMathApi::nt_lcm" => {
            let arg0 = inputs[0]
                .parse::<u64>()
                .map_err(|e| format!("Parse arg0 error: {}", e))?;
            let arg1 = inputs[1]
                .parse::<u64>()
                .map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = ConcreteMathApi::nt_lcm(arg0, arg1);
            Ok(result.to_string())
        }
        "ConcreteMathApi::nt_mod_pow" => {
            let arg0 = inputs[0]
                .parse::<u64>()
                .map_err(|e| format!("Parse arg0 error: {}", e))?;
            let arg1 = inputs[1]
                .parse::<u64>()
                .map_err(|e| format!("Parse arg1 error: {}", e))?;
            let arg2 = inputs[2]
                .parse::<u64>()
                .map_err(|e| format!("Parse arg2 error: {}", e))?;

            let result = ConcreteMathApi::nt_mod_pow(arg0, arg1, arg2);
            Ok(result.to_string())
        }
        "ConcreteMathApi::nt_mod_inverse" => {
            let arg0 = inputs[0]
                .parse::<i64>()
                .map_err(|e| format!("Parse arg0 error: {}", e))?;
            let arg1 = inputs[1]
                .parse::<i64>()
                .map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result =
                ConcreteMathApi::nt_mod_inverse(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        }
        "ConcreteMathApi::nt_is_prime" => {
            let arg0 = inputs[0].to_string();

            let result = ConcreteMathApi::nt_is_prime(arg0);
            Ok(result.to_string())
        }
        "ConcreteMathApi::nt_factorize" => {
            let arg0 = inputs[0].to_string();

            let result = ConcreteMathApi::nt_factorize(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        }
        "ConcreteMathApi::nt_phi" => {
            let arg0 = inputs[0]
                .parse::<u64>()
                .map_err(|e| format!("Parse arg0 error: {}", e))?;

            let result = ConcreteMathApi::nt_phi(arg0);
            Ok(result.to_string())
        }
        _ => Err(format!("Unknown function: {}", func_key)),
    }
}
