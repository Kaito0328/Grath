// --- Auto-generated Wasm Wrapper ---
#![allow(non_snake_case)]
#![allow(unused_imports)]

use std::collections::{BTreeMap, HashMap};
use wasm_bindgen::prelude::*;
extern crate common as grath_common;
use grath_common::prelude::*;
use linalg::*;

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
pub struct WasmSvd(pub(crate) Svd);

impl WasmSvd {
    pub fn inner(&self) -> &Svd {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmSvd {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Svd).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmLinalgApi(pub(crate) LinalgApi);

impl WasmLinalgApi {
    pub fn inner(&self) -> &LinalgApi {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmLinalgApi {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(LinalgApi).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmRationalMatrixApi(pub(crate) RationalMatrixApi);

impl WasmRationalMatrixApi {
    pub fn inner(&self) -> &RationalMatrixApi {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmRationalMatrixApi {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(RationalMatrixApi).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmRationalMatrixDtoApi(pub(crate) RationalMatrixDtoApi);

impl WasmRationalMatrixDtoApi {
    pub fn inner(&self) -> &RationalMatrixDtoApi {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmRationalMatrixDtoApi {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(RationalMatrixDtoApi).to_string()
    }
}

#[wasm_bindgen]
impl WasmSvd {
    pub fn sort(&mut self) -> std::result::Result<(), JsError> {
        self.0.sort().map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmLinalgApi {
    pub fn add_numeric(a: String, b: String) -> std::result::Result<String, JsError> {
        LinalgApi::add_numeric(a, b).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn add_rational(a: String, b: String) -> std::result::Result<String, JsError> {
        LinalgApi::add_rational(a, b).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn add_symbolic(a: String, b: String) -> std::result::Result<String, JsError> {
        LinalgApi::add_symbolic(a, b).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn mul_numeric(a: String, b: String) -> std::result::Result<String, JsError> {
        LinalgApi::mul_numeric(a, b).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn mul_rational(a: String, b: String) -> std::result::Result<String, JsError> {
        LinalgApi::mul_rational(a, b).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn mul_symbolic(a: String, b: String) -> std::result::Result<String, JsError> {
        LinalgApi::mul_symbolic(a, b).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn inv_numeric(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::inv_numeric(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn inverse_exact_rational(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::inverse_exact_rational(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn inverse_exact_symbolic(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::inverse_exact_symbolic(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn inv_rational(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::inv_rational(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn inv_symbolic(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::inv_symbolic(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn lu_numeric(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::lu_numeric(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn lu_exact_rational(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::lu_exact_rational(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn lu_exact_symbolic(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::lu_exact_symbolic(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn lu_rational(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::lu_rational(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn lu_symbolic(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::lu_symbolic(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn qr_numeric(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::qr_numeric(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn qr_rational(_a: String) -> std::result::Result<String, JsError> {
        LinalgApi::qr_rational(_a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn qr_symbolic(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::qr_symbolic(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn svd_numeric(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::svd_numeric(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn svd_rational(_a: String) -> std::result::Result<String, JsError> {
        LinalgApi::svd_rational(_a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn svd_symbolic(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::svd_symbolic(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn eigenvalues_numeric(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::eigenvalues_numeric(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn eigenvalues_rational(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::eigenvalues_rational(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn eigenvalues_symbolic(_a: String) -> std::result::Result<String, JsError> {
        LinalgApi::eigenvalues_symbolic(_a).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn mul_vector_numeric(
        a_csv: String,
        v_csv: String,
    ) -> std::result::Result<String, JsError> {
        LinalgApi::mul_vector_numeric(a_csv, v_csv).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn mul_vector_rational(
        a_csv: String,
        v_csv: String,
    ) -> std::result::Result<String, JsError> {
        LinalgApi::mul_vector_rational(a_csv, v_csv)
            .map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn mul_vector_symbolic(
        a_csv: String,
        v_csv: String,
    ) -> std::result::Result<String, JsError> {
        LinalgApi::mul_vector_symbolic(a_csv, v_csv)
            .map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn solve_vector_numeric(
        a_csv: String,
        b_csv: String,
    ) -> std::result::Result<String, JsError> {
        LinalgApi::solve_vector_numeric(a_csv, b_csv)
            .map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn solve_vector_rational(
        a_csv: String,
        b_csv: String,
    ) -> std::result::Result<String, JsError> {
        LinalgApi::solve_vector_rational(a_csv, b_csv)
            .map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn solve_vector_symbolic(
        a_csv: String,
        b_csv: String,
    ) -> std::result::Result<String, JsError> {
        LinalgApi::solve_vector_symbolic(a_csv, b_csv)
            .map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn mul_symbolic_complex(a: String, b: String) -> std::result::Result<String, JsError> {
        LinalgApi::mul_symbolic_complex(a, b).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn conj_transpose_symbolic(a: String) -> std::result::Result<String, JsError> {
        LinalgApi::conj_transpose_symbolic(a).map_err(|e| js_error_from_to_app_error(e, None))
    }
}

// --- Type API boundary functions ---
fn encode_matrix_to_string<T>(matrix: Matrix<T>) -> String
where
    T: ToString + Scalar,
{
    let mut rows = Vec::with_capacity(matrix.rows);
    for r in 0..matrix.rows {
        let mut cols = Vec::with_capacity(matrix.cols);
        for c in 0..matrix.cols {
            cols.push(matrix[(r, c)].to_string());
        }
        rows.push(cols.join(","));
    }
    rows.join(";")
}

#[wasm_bindgen]
pub fn rational_matrix_zeros(rows: usize, cols: usize) -> std::result::Result<String, JsError> {
    Ok(encode_matrix_to_string(RationalMatrixApi::zeros(
        rows, cols,
    )))
}

#[wasm_bindgen]
pub fn rational_matrix_rows(a: &str) -> std::result::Result<usize, JsError> {
    let a_value: Matrix<Rational> = parse_from_str(a)?;
    Ok(RationalMatrixApi::rows(a_value))
}

#[wasm_bindgen]
pub fn rational_matrix_first(a: &str) -> std::result::Result<String, JsError> {
    let a_value: Matrix<Rational> = parse_from_str(a)?;
    Ok(encode_to_string(RationalMatrixApi::first(a_value)))
}

#[wasm_bindgen]
pub fn rational_matrix_inverse(a: &str) -> std::result::Result<String, JsError> {
    let a_value: Matrix<Rational> = parse_from_str(a)?;
    let out =
        RationalMatrixApi::inverse(a_value).map_err(|e| js_error_from_to_app_error(e, None))?;
    Ok(encode_matrix_to_string(out))
}

#[wasm_bindgen]
pub fn rational_matrix_add(a: &str, b: &str) -> std::result::Result<String, JsError> {
    let a_value: Matrix<Rational> = parse_from_str(a)?;
    let b_value: Matrix<Rational> = parse_from_str(b)?;
    let out = RationalMatrixApi::add(a_value, b_value)
        .map_err(|e| js_error_from_to_app_error(e, None))?;
    Ok(encode_matrix_to_string(out))
}

#[wasm_bindgen]
pub fn rational_matrix_mul(a: &str, b: &str) -> std::result::Result<String, JsError> {
    let a_value: Matrix<Rational> = parse_from_str(a)?;
    let b_value: Matrix<Rational> = parse_from_str(b)?;
    let out = RationalMatrixApi::mul(a_value, b_value)
        .map_err(|e| js_error_from_to_app_error(e, None))?;
    Ok(encode_matrix_to_string(out))
}

#[wasm_bindgen]
pub fn rational_matrix_transpose(a: &str) -> std::result::Result<String, JsError> {
    let a_value: Matrix<Rational> = parse_from_str(a)?;
    Ok(encode_matrix_to_string(RationalMatrixApi::transpose(
        a_value,
    )))
}

#[wasm_bindgen]
pub fn rational_matrix_dto_zeros(
    rows: usize,
    cols: usize,
) -> std::result::Result<JsValue, JsError> {
    serde_wasm_bindgen::to_value(&RationalMatrixDtoApi::zeros(rows, cols))
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn rational_matrix_dto_rows(value_value: JsValue) -> std::result::Result<usize, JsError> {
    let value: RationalMatrixValue =
        serde_wasm_bindgen::from_value(value_value).map_err(|e| JsError::new(&e.to_string()))?;
    Ok(RationalMatrixDtoApi::rows(value))
}

#[wasm_bindgen]
pub fn rational_matrix_dto_inverse(value_value: JsValue) -> std::result::Result<JsValue, JsError> {
    let value: RationalMatrixValue =
        serde_wasm_bindgen::from_value(value_value).map_err(|e| JsError::new(&e.to_string()))?;
    let out =
        RationalMatrixDtoApi::inverse(value).map_err(|e| js_error_from_to_app_error(e, None))?;
    serde_wasm_bindgen::to_value(&out).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn rational_matrix_dto_add(
    value_value: JsValue,
    b_value: JsValue,
) -> std::result::Result<JsValue, JsError> {
    let value: RationalMatrixValue =
        serde_wasm_bindgen::from_value(value_value).map_err(|e| JsError::new(&e.to_string()))?;
    let b: RationalMatrixValue =
        serde_wasm_bindgen::from_value(b_value).map_err(|e| JsError::new(&e.to_string()))?;
    let out =
        RationalMatrixDtoApi::add(value, b).map_err(|e| js_error_from_to_app_error(e, None))?;
    serde_wasm_bindgen::to_value(&out).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn rational_matrix_dto_mul(
    value_value: JsValue,
    b_value: JsValue,
) -> std::result::Result<JsValue, JsError> {
    let value: RationalMatrixValue =
        serde_wasm_bindgen::from_value(value_value).map_err(|e| JsError::new(&e.to_string()))?;
    let b: RationalMatrixValue =
        serde_wasm_bindgen::from_value(b_value).map_err(|e| JsError::new(&e.to_string()))?;
    let out =
        RationalMatrixDtoApi::mul(value, b).map_err(|e| js_error_from_to_app_error(e, None))?;
    serde_wasm_bindgen::to_value(&out).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn rational_matrix_dto_transpose(
    value_value: JsValue,
) -> std::result::Result<JsValue, JsError> {
    let value: RationalMatrixValue =
        serde_wasm_bindgen::from_value(value_value).map_err(|e| JsError::new(&e.to_string()))?;
    let out =
        RationalMatrixDtoApi::transpose(value).map_err(|e| js_error_from_to_app_error(e, None))?;
    serde_wasm_bindgen::to_value(&out).map_err(|e| JsError::new(&e.to_string()))
}
