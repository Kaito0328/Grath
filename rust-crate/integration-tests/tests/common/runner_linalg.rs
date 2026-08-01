// --- Auto-generated Test Runner ---
#![allow(unused_imports)]
#![allow(non_snake_case)]
#![allow(unused_mut)]
#![allow(clippy::match_single_binding)]
#![allow(unused_variables)]

use linalg::*;
use std::collections::{BTreeMap, HashMap};
use std::str::FromStr;


fn vec_to_csv<T: ToString>(v: &[T]) -> String {
    v.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(",")
}


fn matrix_to_compact<T: ToString + Scalar>(m: &Matrix<T>) -> String {
    let mut rows = Vec::with_capacity(m.rows);
    for r in 0..m.rows {
        let mut cols = Vec::with_capacity(m.cols);
        for c in 0..m.cols {
            cols.push(m[(r, c)].to_string());
        }
        rows.push(cols.join(","));
    }
    rows.join(";")
}

pub fn run_dynamic_test(func_key: &str, inputs: &[String]) -> std::result::Result<String, String> {
    match func_key {
        "LinalgApi::add_rational" => {
            let arg0 = inputs[0].to_string();
            let arg1 = inputs[1].to_string();

            let result = LinalgApi::add_rational(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "LinalgApi::mul_rational" => {
            let arg0 = inputs[0].to_string();
            let arg1 = inputs[1].to_string();

            let result = LinalgApi::mul_rational(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "LinalgApi::inverse_exact_rational" => {
            let arg0 = inputs[0].to_string();

            let result = LinalgApi::inverse_exact_rational(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "LinalgApi::lu_exact_rational" => {
            let arg0 = inputs[0].to_string();

            let result = LinalgApi::lu_exact_rational(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "LinalgApi::add_symbolic" => {
            let arg0 = inputs[0].to_string();
            let arg1 = inputs[1].to_string();

            let result = LinalgApi::add_symbolic(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "LinalgApi::mul_symbolic" => {
            let arg0 = inputs[0].to_string();
            let arg1 = inputs[1].to_string();

            let result = LinalgApi::mul_symbolic(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "LinalgApi::inverse_exact_symbolic" => {
            let arg0 = inputs[0].to_string();

            let result = LinalgApi::inverse_exact_symbolic(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "LinalgApi::lu_exact_symbolic" => {
            let arg0 = inputs[0].to_string();

            let result = LinalgApi::lu_exact_symbolic(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "RationalMatrixApi::inverse" => {
            let arg0 = inputs[0].parse::<Matrix < Rational >>().map_err(|e| format!("Parse arg0 error: {}", e))?;

            let result = RationalMatrixApi::inverse(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(matrix_to_compact(&result))
        },
        "RationalMatrixApi::zeros" => {
            let arg0 = inputs[0].parse::<usize>().map_err(|e| format!("Parse arg0 error: {}", e))?;
            let arg1 = inputs[1].parse::<usize>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = RationalMatrixApi::zeros(arg0, arg1);
            Ok(matrix_to_compact(&result))
        },
        "RationalMatrixApi::rows" => {
            let arg0 = inputs[0].parse::<Matrix < Rational >>().map_err(|e| format!("Parse arg0 error: {}", e))?;

            let result = RationalMatrixApi::rows(arg0);
            Ok(result.to_string())
        },
        "RationalMatrixApi::first" => {
            let arg0 = inputs[0].parse::<Matrix < Rational >>().map_err(|e| format!("Parse arg0 error: {}", e))?;

            let result = RationalMatrixApi::first(arg0);
            Ok(result.to_string())
        },
        "RationalMatrixApi::add" => {
            let arg0 = inputs[0].parse::<Matrix < Rational >>().map_err(|e| format!("Parse arg0 error: {}", e))?;
            let arg1 = inputs[1].parse::<Matrix < Rational >>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = RationalMatrixApi::add(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(matrix_to_compact(&result))
        },
        "RationalMatrixApi::mul" => {
            let arg0 = inputs[0].parse::<Matrix < Rational >>().map_err(|e| format!("Parse arg0 error: {}", e))?;
            let arg1 = inputs[1].parse::<Matrix < Rational >>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = RationalMatrixApi::mul(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(matrix_to_compact(&result))
        },
        "RationalMatrixApi::transpose" => {
            let arg0 = inputs[0].parse::<Matrix < Rational >>().map_err(|e| format!("Parse arg0 error: {}", e))?;

            let result = RationalMatrixApi::transpose(arg0);
            Ok(matrix_to_compact(&result))
        },
        "RationalMatrixDtoApi::inverse" => {
            let arg0: RationalMatrixValue = serde_json::from_str(&inputs[0]).map_err(|e| format!("Parse DTO arg0 error: {}", e))?;

            let result = RationalMatrixDtoApi::inverse(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        },
        "RationalMatrixDtoApi::add" => {
            let arg0: RationalMatrixValue = serde_json::from_str(&inputs[0]).map_err(|e| format!("Parse DTO arg0 error: {}", e))?;
            let arg1: RationalMatrixValue = serde_json::from_str(&inputs[1]).map_err(|e| format!("Parse DTO arg1 error: {}", e))?;

            let result = RationalMatrixDtoApi::add(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        },
        "RationalMatrixDtoApi::transpose" => {
            let arg0: RationalMatrixValue = serde_json::from_str(&inputs[0]).map_err(|e| format!("Parse DTO arg0 error: {}", e))?;

            let result = RationalMatrixDtoApi::transpose(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        },
        _ => Err(format!("Unknown function: {}", func_key)),
    }
}
