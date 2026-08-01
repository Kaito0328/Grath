// --- Auto-generated Wasm Wrapper ---
#![allow(non_snake_case)]
#![allow(unused_imports)]

use std::collections::{BTreeMap, HashMap};
use wasm_bindgen::prelude::*;
extern crate common as grath_common;
use grath_common::prelude::*;
use polynomial::prelude::*;
use polynomial::*;

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
pub struct WasmPolynomialSolver(pub(crate) PolynomialSolver);

impl WasmPolynomialSolver {
    pub fn inner(&self) -> &PolynomialSolver {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmPolynomialSolver {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(PolynomialSolver).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmPolynomialApi(pub(crate) PolynomialApi);

impl WasmPolynomialApi {
    pub fn inner(&self) -> &PolynomialApi {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmPolynomialApi {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(PolynomialApi).to_string()
    }
}

#[wasm_bindgen]
impl WasmPolynomialApi {
    pub fn find_roots_symbolic_expr(coeffs: String) -> std::result::Result<String, JsError> {
        PolynomialApi::find_roots_symbolic_expr(coeffs)
            .map_err(|e| js_error_from_to_app_error(e, None))
    }
}
