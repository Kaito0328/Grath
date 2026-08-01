use crate::algebraic_dto::{symbolic_complex_to_dto, NumericComplexDto};
use algebraic::rational::Rational;
use common::prelude::{AppError, ToAppError};
use polynomial::prelude::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn solve_polynomial_rational(coeffs_csv: &str) -> Result<JsValue, JsError> {
    let mut rust_coeffs = Vec::new();
    let s = coeffs_csv.trim();
    if !s.is_empty() {
        for p in s.split(',') {
            let p = p.trim();
            if p.is_empty() {
                continue;
            }
            let rat = p
                .parse::<Rational>()
                .map_err(|e| JsError::new(&e.to_string()))?;
            rust_coeffs.push(rat);
        }
    }
    let poly = Polynomial::new(rust_coeffs);
    let roots = poly.find_roots_symbolic();

    let dtos: Vec<_> = roots.iter().map(|c| symbolic_complex_to_dto(c)).collect();
    serde_wasm_bindgen::to_value(&dtos).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn solve_polynomial_numeric(coeffs: Vec<f64>) -> Result<JsValue, JsError> {
    let poly = Polynomial::new(coeffs);
    let roots = poly.find_roots();

    let dtos: Vec<_> = roots
        .iter()
        .map(|c| NumericComplexDto { re: c.re, im: c.im })
        .collect();
    serde_wasm_bindgen::to_value(&dtos).map_err(|e| JsError::new(&e.to_string()))
}

// Numeric arithmetic
#[wasm_bindgen]
pub fn poly_add_numeric(a: Vec<f64>, b: Vec<f64>) -> Vec<f64> {
    (Polynomial::new(a) + Polynomial::new(b)).coeffs
}

#[wasm_bindgen]
pub fn poly_sub_numeric(a: Vec<f64>, b: Vec<f64>) -> Vec<f64> {
    (Polynomial::new(a) - Polynomial::new(b)).coeffs
}

#[wasm_bindgen]
pub fn poly_mul_numeric(a: Vec<f64>, b: Vec<f64>) -> Vec<f64> {
    (Polynomial::new(a) * Polynomial::new(b)).coeffs
}

#[wasm_bindgen]
pub fn poly_div_numeric(a: Vec<f64>, b: Vec<f64>) -> Vec<f64> {
    (Polynomial::new(a) / Polynomial::new(b)).coeffs
}

// Rational arithmetic
fn parse_rational_csv(s: &str) -> Result<Polynomial<Rational>, JsError> {
    let mut vec = Vec::new();
    let s = s.trim();
    if !s.is_empty() {
        for p in s.split(',') {
            let p = p.trim();
            if p.is_empty() {
                continue;
            }
            vec.push(
                p.parse::<Rational>()
                    .map_err(|e| JsError::new(&e.to_string()))?,
            );
        }
    }
    Ok(Polynomial::new(vec))
}

fn rational_csv_stringify(p: Polynomial<Rational>) -> String {
    p.coeffs
        .iter()
        .map(|r| r.to_string())
        .collect::<Vec<_>>()
        .join(",")
}

#[wasm_bindgen]
pub fn poly_add_rational(a_csv: &str, b_csv: &str) -> Result<String, JsError> {
    let a = parse_rational_csv(a_csv)?;
    let b = parse_rational_csv(b_csv)?;
    Ok(rational_csv_stringify(a + b))
}

#[wasm_bindgen]
pub fn poly_sub_rational(a_csv: &str, b_csv: &str) -> Result<String, JsError> {
    let a = parse_rational_csv(a_csv)?;
    let b = parse_rational_csv(b_csv)?;
    Ok(rational_csv_stringify(a - b))
}

#[wasm_bindgen]
pub fn poly_mul_rational(a_csv: &str, b_csv: &str) -> Result<String, JsError> {
    let a = parse_rational_csv(a_csv)?;
    let b = parse_rational_csv(b_csv)?;
    Ok(rational_csv_stringify(a * b))
}

#[wasm_bindgen]
pub fn poly_div_rational(a_csv: &str, b_csv: &str) -> Result<String, JsError> {
    let a = parse_rational_csv(a_csv)?;
    let b = parse_rational_csv(b_csv)?;
    Ok(rational_csv_stringify(a / b))
}

// SymbolicExpr arithmetic and solving
use algebraic::expr::SymbolicExpr;

fn parse_symbolic_csv(s: &str) -> Result<Polynomial<SymbolicExpr>, JsError> {
    let mut vec = Vec::new();
    let s = s.trim();
    if !s.is_empty() {
        for p in s.split(',') {
            let p = p.trim();
            if p.is_empty() {
                continue;
            }
            vec.push(
                p.parse::<SymbolicExpr>()
                    .map_err(|e| JsError::new(&e.to_string()))?,
            );
        }
    }
    Ok(Polynomial::new(vec))
}

fn symbolic_csv_stringify(p: Polynomial<SymbolicExpr>) -> String {
    p.coeffs
        .iter()
        .map(|s| s.to_string())
        .collect::<Vec<_>>()
        .join(",")
}

#[wasm_bindgen]
pub fn poly_add_symbolic(a_csv: &str, b_csv: &str) -> Result<String, JsError> {
    let a = parse_symbolic_csv(a_csv)?;
    let b = parse_symbolic_csv(b_csv)?;
    Ok(symbolic_csv_stringify(a + b))
}

#[wasm_bindgen]
pub fn poly_sub_symbolic(a_csv: &str, b_csv: &str) -> Result<String, JsError> {
    let a = parse_symbolic_csv(a_csv)?;
    let b = parse_symbolic_csv(b_csv)?;
    Ok(symbolic_csv_stringify(a - b))
}

#[wasm_bindgen]
pub fn poly_mul_symbolic(a_csv: &str, b_csv: &str) -> Result<String, JsError> {
    let a = parse_symbolic_csv(a_csv)?;
    let b = parse_symbolic_csv(b_csv)?;
    Ok(symbolic_csv_stringify(a * b))
}

#[wasm_bindgen]
pub fn poly_div_symbolic(a_csv: &str, b_csv: &str) -> Result<String, JsError> {
    let a = parse_symbolic_csv(a_csv)?;
    let b = parse_symbolic_csv(b_csv)?;
    Ok(symbolic_csv_stringify(a / b))
}

#[wasm_bindgen]
pub fn solve_polynomial_symbolic(coeffs_csv: &str) -> Result<JsValue, JsError> {
    let poly = parse_symbolic_csv(coeffs_csv)?;
    let roots = poly.find_roots_symbolic_expr();
    let dtos: Vec<_> = roots.iter().map(|c| symbolic_complex_to_dto(c)).collect();
    serde_wasm_bindgen::to_value(&dtos).map_err(|e| JsError::new(&e.to_string()))
}
