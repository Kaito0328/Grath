// --- Auto-generated Wasm Wrapper ---
#![allow(non_snake_case)]
#![allow(unused_imports)]

use std::collections::{BTreeMap, HashMap};
use wasm_bindgen::prelude::*;
extern crate common as grath_common;
use finite_field::prelude::*;
use finite_field::*;
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
pub struct WasmFiniteFieldApi(pub(crate) FiniteFieldApi);

impl WasmFiniteFieldApi {
    pub fn inner(&self) -> &FiniteFieldApi {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmFiniteFieldApi {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(FiniteFieldApi).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmFiniteField2m(pub(crate) FiniteField2m);

impl WasmFiniteField2m {
    pub fn inner(&self) -> &FiniteField2m {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmFiniteField2m {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(FiniteField2m).to_string()
    }
}

#[wasm_bindgen]
impl WasmFiniteFieldApi {
    pub fn gf256_mul(a: String, b: String) -> std::result::Result<String, JsError> {
        FiniteFieldApi::gf256_mul(a, b).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn gf256_inv_check(a: String) -> std::result::Result<bool, JsError> {
        FiniteFieldApi::gf256_inv_check(a).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn gfp5_add(a: String, b: String) -> std::result::Result<String, JsError> {
        FiniteFieldApi::gfp5_add(a, b).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn gfp5_mul(a: String, b: String) -> std::result::Result<String, JsError> {
        FiniteFieldApi::gfp5_mul(a, b).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn gfp5_inv(a: String) -> std::result::Result<String, JsError> {
        FiniteFieldApi::gfp5_inv(a).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmFiniteField2m {
    pub fn new_auto(m: usize) -> WasmFiniteField2m {
        WasmFiniteField2m(FiniteField2m::new_auto(m))
    }
    pub fn cyclotomic_coset(&self, start: usize) -> String {
        vec_to_csv(self.0.cyclotomic_coset(start))
    }
}
