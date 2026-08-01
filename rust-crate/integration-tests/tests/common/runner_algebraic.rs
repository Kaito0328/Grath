// --- Auto-generated Test Runner ---
#![allow(unused_imports)]
#![allow(non_snake_case)]
#![allow(unused_mut)]
#![allow(clippy::match_single_binding)]
#![allow(unused_variables)]

use algebraic::prelude::*;
use algebraic::*;
use std::collections::{BTreeMap, HashMap};
use std::str::FromStr;


fn vec_to_csv<T: ToString>(v: &[T]) -> String {
    v.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(",")
}

pub fn run_dynamic_test(func_key: &str, inputs: &[String]) -> std::result::Result<String, String> {
    match func_key {
        "Rational::checked_add" => {
            let receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;
            let arg1 = inputs[1].parse::<Rational>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = receiver.checked_add(arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "Rational::checked_div" => {
            let receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;
            let arg1 = inputs[1].parse::<Rational>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = receiver.checked_div(arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "Rational::checked_mul" => {
            let receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;
            let arg1 = inputs[1].parse::<Rational>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = receiver.checked_mul(arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "Rational::denom" => {
            let receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.denom();
            Ok(result.to_string())
        },
        "Rational::from_int" => {
            let arg0 = inputs[0].parse::<i64>().map_err(|e| format!("Parse arg0 error: {}", e))?;

            let result = Rational::from_int(arg0);
            Ok(result.to_string())
        },
        "Rational::is_integer" => {
            let receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.is_integer();
            Ok(result.to_string())
        },
        "Rational::is_zero" => {
            let receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.is_zero();
            Ok(result.to_string())
        },
        "Rational::normalize" => {
            let mut receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;

            receiver.normalize();
            let result = receiver;
            Ok(result.to_string())
        },
        "Rational::numer" => {
            let receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.numer();
            Ok(result.to_string())
        },
        "Rational::simplified" => {
            let mut receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.simplified();
            Ok(result.to_string())
        },
        "SymbolicComplex::add" => {
            let receiver = inputs[0].parse::<SymbolicComplex>().map_err(|e| format!("Parse receiver error: {}", e))?;
            let arg1 = inputs[1].parse::<SymbolicComplex>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = receiver.add(&arg1);
            Ok(result.to_string())
        },
        "SymbolicComplex::from_real" => {
            let arg0 = inputs[0].parse::<SymbolicExpr>().map_err(|e| format!("Parse arg0 error: {}", e))?;

            let result = SymbolicComplex::from_real(arg0);
            Ok(result.to_string())
        },
        "SymbolicComplex::i" => {

            let result = SymbolicComplex::i();
            Ok(result.to_string())
        },
        "SymbolicComplex::is_imag_pure" => {
            let receiver = inputs[0].parse::<SymbolicComplex>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.is_imag_pure();
            Ok(result.to_string())
        },
        "SymbolicComplex::is_real" => {
            let receiver = inputs[0].parse::<SymbolicComplex>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.is_real();
            Ok(result.to_string())
        },
        "SymbolicComplex::mul" => {
            let receiver = inputs[0].parse::<SymbolicComplex>().map_err(|e| format!("Parse receiver error: {}", e))?;
            let arg1 = inputs[1].parse::<SymbolicComplex>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = receiver.mul(&arg1);
            Ok(result.to_string())
        },
        "SymbolicComplex::neg" => {
            let receiver = inputs[0].parse::<SymbolicComplex>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.neg();
            Ok(result.to_string())
        },
        "SymbolicComplex::new" => {
            let arg0 = inputs[0].parse::<SymbolicExpr>().map_err(|e| format!("Parse arg0 error: {}", e))?;
            let arg1 = inputs[1].parse::<SymbolicExpr>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = SymbolicComplex::new(arg0, arg1);
            Ok(result.to_string())
        },
        "SymbolicComplex::sqrt_rational" => {
            let arg0 = inputs[0].parse::<i64>().map_err(|e| format!("Parse arg0 error: {}", e))?;
            let arg1 = inputs[1].parse::<i64>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = SymbolicComplex::sqrt_rational(arg0, arg1);
            Ok(result.to_string())
        },
        "SymbolicComplex::to_latex" => {
            let receiver = inputs[0].parse::<SymbolicComplex>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.to_latex();
            Ok(result.to_string())
        },
        "Rational::to_latex" => {
            let receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.to_latex();
            Ok(result.to_string())
        },
        "SymbolicExpr::add" => {
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

            let result = SymbolicExpr::add(arg0);
            Ok(result.to_string())
        },
        "SymbolicExpr::mul" => {
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

            let result = SymbolicExpr::mul(arg0);
            Ok(result.to_string())
        },
        "SymbolicExpr::to_latex" => {
            let receiver = inputs[0].parse::<SymbolicExpr>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.to_latex();
            Ok(result.to_string())
        },
        "Rational::from_latex" => {
            let arg0 = inputs[0].to_string();

            let result = Rational::from_latex(&arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "SymbolicExpr::from_latex" => {
            let arg0 = inputs[0].to_string();

            let result = SymbolicExpr::from_latex(&arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "SymbolicComplex::from_latex" => {
            let arg0 = inputs[0].to_string();

            let result = SymbolicComplex::from_latex(&arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "Rational::is_one" => {
            let receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.is_one();
            Ok(result.to_string())
        },
        "Rational::is_minus_one" => {
            let receiver = inputs[0].parse::<Rational>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.is_minus_one();
            Ok(result.to_string())
        },
        "SymbolicExpr::pow" => {
            let arg0 = inputs[0].parse::<SymbolicExpr>().map_err(|e| format!("Parse arg0 error: {}", e))?;
            let arg1 = inputs[1].parse::<SymbolicExpr>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = SymbolicExpr::pow(arg0, arg1);
            Ok(result.to_string())
        },
        "SymbolicExpr::simplify" => {
            let receiver = inputs[0].parse::<SymbolicExpr>().map_err(|e| format!("Parse receiver error: {}", e))?;

            let result = receiver.simplify();
            Ok(result.to_string())
        },
        "SymbolicComplex::zero" => {

            let result = SymbolicComplex::zero();
            Ok(result.to_string())
        },
        "SymbolicComplex::sub" => {
            let receiver = inputs[0].parse::<SymbolicComplex>().map_err(|e| format!("Parse receiver error: {}", e))?;
            let arg1 = inputs[1].parse::<SymbolicComplex>().map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = receiver.sub(&arg1);
            Ok(result.to_string())
        },
        _ => Err(format!("Unknown function: {}", func_key)),
    }
}
