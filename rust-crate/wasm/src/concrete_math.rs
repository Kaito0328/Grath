// --- Auto-generated Wasm Wrapper ---
#![allow(non_snake_case)]
#![allow(unused_imports)]

use std::collections::{BTreeMap, HashMap};
use wasm_bindgen::prelude::*;
extern crate common as grath_common;
use concrete_math::prelude::*;
use concrete_math::*;
use grath_common::prelude::*;

fn js_error_from_app_error(app: AppError) -> JsError {
    let json =
        serde_json::to_string(&app).unwrap_or_else(|_| format!("{}: {}", app.code, app.message));
    JsError::new(&json)
}

fn js_error_from_code_message(code: &str, message: String, details: Option<String>) -> JsError {
    js_error_from_app_error(AppError::new(code.to_string(), message, details))
}

fn js_error_from_to_app_error<E: ToAppError>(e: E, details: Option<String>) -> JsError {
    js_error_from_app_error(e.to_app_error(details))
}

use std::str::FromStr;

fn parse_csv_to_vec<T>(s: &str) -> std::result::Result<Vec<T>, JsError>
where
    T: FromStr,
    T::Err: ToString,
{
    let s = s.trim();
    if s.is_empty() {
        return Ok(Vec::new());
    }
    s.split(',')
        .map(|p| p.trim())
        .filter(|p| !p.is_empty())
        .map(|p| p.parse::<T>().map_err(|e| JsError::new(&e.to_string())))
        .collect::<std::result::Result<Vec<_>, _>>()
}

fn vec_to_csv<T>(v: Vec<T>) -> String
where
    T: ToString,
{
    v.into_iter()
        .map(|x| x.to_string())
        .collect::<Vec<_>>()
        .join(",")
}

fn parse_from_str<T>(s: &str) -> std::result::Result<T, JsError>
where
    T: FromStr,
    T::Err: ToString,
{
    s.parse::<T>().map_err(|e| JsError::new(&e.to_string()))
}

fn encode_to_string<T>(value: T) -> String
where
    T: ToString,
{
    value.to_string()
}

#[wasm_bindgen]
pub struct WasmConcreteMathApi(pub(crate) ConcreteMathApi);

impl WasmConcreteMathApi {
    pub fn inner(&self) -> &ConcreteMathApi {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmConcreteMathApi {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(ConcreteMathApi).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmClosedForm(pub(crate) ClosedForm);

impl WasmClosedForm {
    pub fn inner(&self) -> &ClosedForm {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmClosedForm {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(ClosedForm).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmRecurrenceRelation(pub(crate) RecurrenceRelation);

impl WasmRecurrenceRelation {
    pub fn inner(&self) -> &RecurrenceRelation {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmRecurrenceRelation {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(RecurrenceRelation).to_string()
    }
}

#[wasm_bindgen]
impl WasmConcreteMathApi {
    pub fn nt_gcd(a: u64, b: u64) -> u64 {
        ConcreteMathApi::nt_gcd(a, b)
    }
    pub fn nt_lcm(a: u64, b: u64) -> u64 {
        ConcreteMathApi::nt_lcm(a, b)
    }
    pub fn nt_extended_gcd(a: i64, b: i64) -> String {
        ConcreteMathApi::nt_extended_gcd(a, b)
    }
    pub fn nt_mod_pow(base: u64, exp: u64, m: u64) -> u64 {
        ConcreteMathApi::nt_mod_pow(base, exp, m)
    }
    pub fn nt_mod_inverse(a: i64, m: i64) -> std::result::Result<i64, JsError> {
        ConcreteMathApi::nt_mod_inverse(a, m).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn nt_is_prime(n: String) -> bool {
        ConcreteMathApi::nt_is_prime(n)
    }
    pub fn nt_factorize(n: String) -> std::result::Result<String, JsError> {
        ConcreteMathApi::nt_factorize(n).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn nt_phi(n: u64) -> u64 {
        ConcreteMathApi::nt_phi(n)
    }
    pub fn get_stirling1(n: usize, k: usize) -> f64 {
        ConcreteMathApi::get_stirling1(n, k)
    }
    pub fn get_stirling2(n: usize, k: usize) -> f64 {
        ConcreteMathApi::get_stirling2(n, k)
    }
    pub fn get_bernoulli(n: usize) -> f64 {
        ConcreteMathApi::get_bernoulli(n)
    }
    pub fn get_harmonic(n: usize) -> f64 {
        ConcreteMathApi::get_harmonic(n)
    }
    pub fn sf_gamma(z: f64) -> f64 {
        ConcreteMathApi::sf_gamma(z)
    }
    pub fn sf_log_gamma(z: f64) -> f64 {
        ConcreteMathApi::sf_log_gamma(z)
    }
    pub fn sf_beta(x: f64, y: f64) -> f64 {
        ConcreteMathApi::sf_beta(x, y)
    }
    pub fn sf_erf(z: f64) -> f64 {
        ConcreteMathApi::sf_erf(z)
    }
    pub fn sf_regularized_gamma(s: f64, x: f64) -> f64 {
        ConcreteMathApi::sf_regularized_gamma(s, x)
    }
}

#[wasm_bindgen]
impl WasmClosedForm {
    pub fn zero() -> WasmClosedForm {
        WasmClosedForm(ClosedForm::zero())
    }
    pub fn is_zero(&self) -> bool {
        self.0.is_zero()
    }
    pub fn simplify(&mut self) -> () {
        self.0.simplify()
    }
    pub fn simplified(self) -> WasmClosedForm {
        WasmClosedForm(self.0.simplified())
    }
}

#[wasm_bindgen]
impl WasmRecurrenceRelation {
    pub fn solve(&self) -> WasmClosedForm {
        WasmClosedForm(self.0.solve())
    }
}
