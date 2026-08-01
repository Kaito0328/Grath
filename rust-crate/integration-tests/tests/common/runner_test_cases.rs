// --- Auto-generated Test Runner ---
#![allow(unused_imports)]
#![allow(non_snake_case)]
#![allow(unused_mut)]
#![allow(clippy::match_single_binding)]
#![allow(unused_variables)]

use test_cases::*;
use std::str::FromStr;


fn vec_to_csv<T: ToString>(v: &[T]) -> String {
    v.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(",")
}

pub fn run_dynamic_test(func_key: &str, inputs: &[String]) -> std::result::Result<String, String> {
    match func_key {
        "linalg::Matrix::add_rational" => Err(format!("Unsupported function: linalg::Matrix::add_rational")),
        "linalg::Matrix::mul_rational" => Err(format!("Unsupported function: linalg::Matrix::mul_rational")),
        "linalg::Matrix::inverse_exact_symbolic" => Err(format!("Unsupported function: linalg::Matrix::inverse_exact_symbolic")),
        "polynomial::PolynomialSolver::solve_rational" => Err(format!("Unsupported function: polynomial::PolynomialSolver::solve_rational")),
        "polynomial::Polynomial::find_roots_symbolic" => Err(format!("Unsupported function: polynomial::Polynomial::find_roots_symbolic")),
        "algebraic::Rational::checked_add" => Err(format!("Unsupported function: algebraic::Rational::checked_add")),
        _ => Err(format!("Unknown function: {}", func_key)),
    }
}
