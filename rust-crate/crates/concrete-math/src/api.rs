use crate::error::{ConcreteMathError, Result};
use common::prelude::GrathCrateApi;
use num_bigint::BigInt;

pub struct ConcreteMathApi;

impl GrathCrateApi for ConcreteMathApi {
    const CRATE_NAME: &'static str = "concrete-math";
}

impl ConcreteMathApi {
    // --- Number theory ---

    pub fn nt_gcd(a: u64, b: u64) -> u64 {
        number_theory::core::gcd(a, b)
    }

    pub fn nt_lcm(a: u64, b: u64) -> u64 {
        number_theory::core::lcm(a, b)
    }

    pub fn nt_extended_gcd(a: i64, b: i64) -> String {
        let (g, x, y) = number_theory::core::extended_gcd(a, b);
        format!(r#"{{\"gcd\":{},\"x\":{},\"y\":{}}}"#, g, x, y)
    }

    pub fn nt_mod_pow(base: u64, exp: u64, m: u64) -> u64 {
        number_theory::core::mod_pow(base, exp, m)
    }

    pub fn nt_mod_inverse(a: i64, m: i64) -> Result<i64> {
        number_theory::core::mod_inverse(a, m).map_err(|e| ConcreteMathError::InvalidArgument {
            text: e.to_string(),
        })
    }

    pub fn nt_is_prime(n: String) -> bool {
        n.parse::<BigInt>()
            .map(|v| number_theory::prime_factorization::is_prime_big(&v))
            .unwrap_or(false)
    }

    pub fn nt_factorize(n: String) -> Result<String> {
        let v = n
            .parse::<BigInt>()
            .map_err(|e| ConcreteMathError::InvalidArgument {
                text: e.to_string(),
            })?;
        let factors = number_theory::prime_factorization::factorize_big(&v);
        let parts = factors
            .into_iter()
            .map(|(p, exp)| format!(r#"{{\"p\":\"{}\",\"exp\":{}}}"#, p, exp))
            .collect::<Vec<_>>();
        Ok(format!(r#"{{\"factors\":[{}]}}"#, parts.join(",")))
    }

    pub fn nt_phi(n: u64) -> u64 {
        number_theory::core::phi(n)
    }

    // --- Combinatorics numbers ---

    pub fn get_stirling1(n: usize, k: usize) -> f64 {
        crate::combinatorics::numbers::stirling1(n, k)
    }

    pub fn get_stirling2(n: usize, k: usize) -> f64 {
        crate::combinatorics::numbers::stirling2(n, k)
    }

    pub fn get_bernoulli(n: usize) -> f64 {
        crate::combinatorics::numbers::bernoulli(n)
    }

    pub fn get_harmonic(n: usize) -> f64 {
        crate::combinatorics::numbers::harmonic(n)
    }

    // --- Special functions ---

    pub fn sf_gamma(z: f64) -> f64 {
        special_functions::gamma::gamma(z)
    }

    pub fn sf_log_gamma(z: f64) -> f64 {
        special_functions::gamma::log_gamma(z)
    }

    pub fn sf_beta(x: f64, y: f64) -> f64 {
        special_functions::beta::beta(x, y)
    }

    pub fn sf_erf(z: f64) -> f64 {
        special_functions::erf::erf(z)
    }

    pub fn sf_regularized_gamma(s: f64, x: f64) -> f64 {
        special_functions::gamma::regularized_gamma(s, x)
    }
}
