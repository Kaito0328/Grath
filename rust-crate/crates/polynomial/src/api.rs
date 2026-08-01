use algebraic::expr::SymbolicExpr;
use common::prelude::GrathCrateApi;

use crate::core::Polynomial;

pub struct PolynomialApi;

impl GrathCrateApi for PolynomialApi {
    const CRATE_NAME: &'static str = "polynomial";
}

impl PolynomialApi {
    pub fn find_roots_symbolic_expr(
        coeffs: String,
    ) -> std::result::Result<String, algebraic::error::AlgebraicError> {
        let coeffs = parse_symbolic_coeffs(&coeffs)?;
        let poly = Polynomial::new(coeffs);
        let roots = poly.find_roots_symbolic_expr();
        Ok(roots
            .into_iter()
            .map(|r| r.to_string())
            .collect::<Vec<_>>()
            .join(","))
    }
}

fn parse_symbolic_coeffs(
    text: &str,
) -> std::result::Result<Vec<SymbolicExpr>, algebraic::error::AlgebraicError> {
    let raw = text.trim();
    let raw = raw.trim_start_matches('[').trim_end_matches(']');
    let raw = raw.trim();

    if raw.is_empty() {
        return Ok(Vec::new());
    }

    raw.split(',')
        .map(|s| s.trim().parse::<SymbolicExpr>())
        .collect()
}
