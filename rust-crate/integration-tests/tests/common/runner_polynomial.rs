// --- Auto-generated Test Runner ---
#![allow(unused_imports)]
#![allow(non_snake_case)]
#![allow(unused_mut)]
#![allow(clippy::match_single_binding)]
#![allow(unused_variables)]

use polynomial::prelude::*;
use polynomial::*;
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
        "PolynomialSolver::solve_rational" => {
            let raw = inputs[0].trim();
            let raw = raw.trim_start_matches('[').trim_end_matches(']');
            let arg0 = if raw.is_empty() {
                Vec::new()
            } else {
                raw.split(',')
                    .map(|s| s.trim().parse())
                    .collect::<std::result::Result<Vec<_>, _>>()
                    .map_err(|e| format!("Parse arg0 Vec error: {}", e))?
            };

            let result = PolynomialSolver::solve_rational(arg0);
            Ok(vec_to_csv(&result))
        }
        "PolynomialApi::find_roots_symbolic_expr" => {
            let arg0 = inputs[0].to_string();

            let result =
                PolynomialApi::find_roots_symbolic_expr(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        }
        _ => Err(format!("Unknown function: {}", func_key)),
    }
}
