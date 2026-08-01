// --- Auto-generated Wasm Wrapper ---
#![allow(non_snake_case)]
#![allow(unused_imports)]

use std::collections::{BTreeMap, HashMap};
use wasm_bindgen::prelude::*;
extern crate common as grath_common;
use coding::prelude::*;
use coding::*;
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
pub struct WasmCodingApi(pub(crate) CodingApi);

impl WasmCodingApi {
    pub fn inner(&self) -> &CodingApi {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmCodingApi {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(CodingApi).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmDtoFixtureApi(pub(crate) DtoFixtureApi);

impl WasmDtoFixtureApi {
    pub fn inner(&self) -> &DtoFixtureApi {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmDtoFixtureApi {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(DtoFixtureApi).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmReedSolomon(pub(crate) ReedSolomon);

impl WasmReedSolomon {
    pub fn inner(&self) -> &ReedSolomon {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmReedSolomon {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(ReedSolomon).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmHamming74(pub(crate) Hamming74);

impl WasmHamming74 {
    pub fn inner(&self) -> &Hamming74 {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmHamming74 {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Hamming74).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmBCHCode(pub(crate) BCHCode);

impl WasmBCHCode {
    pub fn inner(&self) -> &BCHCode {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmBCHCode {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(BCHCode).to_string()
    }
}

#[wasm_bindgen]
impl WasmCodingApi {
    pub fn hamming74_encode(bits4: String) -> std::result::Result<String, JsError> {
        CodingApi::hamming74_encode(bits4).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn hamming74_encode_len(bits4: String) -> std::result::Result<usize, JsError> {
        CodingApi::hamming74_encode_len(bits4).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn linear_code_gf5_third(u0: String, u1: String) -> std::result::Result<String, JsError> {
        CodingApi::linear_code_gf5_third(u0, u1).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn reed_solomon_encode(
        k: usize,
        n: usize,
        msg: Vec<u8>,
        primitive_px: Vec<u8>,
    ) -> std::result::Result<Vec<u8>, JsError> {
        CodingApi::reed_solomon_encode(k, n, msg, primitive_px)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn reed_solomon_decode_bm(
        k: usize,
        n: usize,
        recv: Vec<u8>,
        primitive_px: Vec<u8>,
    ) -> std::result::Result<Vec<u8>, JsError> {
        CodingApi::reed_solomon_decode_bm(k, n, recv, primitive_px)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn bch_new_auto_json(m: usize, t: usize) -> std::result::Result<String, JsError> {
        CodingApi::bch_new_auto_json(m, t).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn bch_encode_auto(
        m: usize,
        t: usize,
        msg_bits: Vec<u8>,
    ) -> std::result::Result<Vec<u8>, JsError> {
        CodingApi::bch_encode_auto(m, t, msg_bits).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn bch_decode_bm(
        m: usize,
        t: usize,
        recv_bits: Vec<u8>,
    ) -> std::result::Result<Vec<u8>, JsError> {
        CodingApi::bch_decode_bm(m, t, recv_bits).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn bch_new_json(n: usize, g_bits: Vec<u8>) -> std::result::Result<String, JsError> {
        CodingApi::bch_new_json(n, g_bits).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn bch_encode(
        n: usize,
        g_bits: Vec<u8>,
        msg_bits: Vec<u8>,
    ) -> std::result::Result<Vec<u8>, JsError> {
        CodingApi::bch_encode(n, g_bits, msg_bits).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn bch_decode_bm_with_g(
        n: usize,
        g_bits: Vec<u8>,
        recv_bits: Vec<u8>,
    ) -> std::result::Result<Vec<u8>, JsError> {
        CodingApi::bch_decode_bm_with_g(n, g_bits, recv_bits)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn cyclic_new_json(n: usize, g_bits: Vec<u8>) -> std::result::Result<String, JsError> {
        CodingApi::cyclic_new_json(n, g_bits).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn cyclic_encode(
        n: usize,
        g_bits: Vec<u8>,
        msg_bits: Vec<u8>,
    ) -> std::result::Result<Vec<u8>, JsError> {
        CodingApi::cyclic_encode(n, g_bits, msg_bits).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn cyclic_decode_lut(
        n: usize,
        g_bits: Vec<u8>,
        recv_bits: Vec<u8>,
    ) -> std::result::Result<Vec<u8>, JsError> {
        CodingApi::cyclic_decode_lut(n, g_bits, recv_bits)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn gf2_cyclic_generator_matrix(
        n: usize,
        g_bits: Vec<u8>,
    ) -> std::result::Result<String, JsError> {
        CodingApi::gf2_cyclic_generator_matrix(n, g_bits)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn gf2_cyclic_parity_check_matrix(
        n: usize,
        g_bits: Vec<u8>,
    ) -> std::result::Result<String, JsError> {
        CodingApi::gf2_cyclic_parity_check_matrix(n, g_bits)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn gf2_parity_check_from_generator_matrix(
        g_csv: String,
    ) -> std::result::Result<String, JsError> {
        CodingApi::gf2_parity_check_from_generator_matrix(g_csv)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn gf2_syndrome(h_csv: String, r_bits: String) -> std::result::Result<String, JsError> {
        CodingApi::gf2_syndrome(h_csv, r_bits).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmBCHCode {
    pub fn new_auto(m: usize, t: usize) -> WasmBCHCode {
        WasmBCHCode(BCHCode::new_auto(m, t))
    }
}

// --- Type API boundary functions ---
#[wasm_bindgen]
pub fn dto_point_new(x: f64, y: f64) -> std::result::Result<JsValue, JsError> {
    serde_wasm_bindgen::to_value(&DtoFixtureApi::new(x, y))
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn dto_point_translate(
    point_value: JsValue,
    dx: f64,
    dy: f64,
) -> std::result::Result<JsValue, JsError> {
    let point: DtoPoint =
        serde_wasm_bindgen::from_value(point_value).map_err(|e| JsError::new(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&DtoFixtureApi::translate(point, dx, dy))
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn dto_point_batch(points_value: JsValue) -> std::result::Result<JsValue, JsError> {
    let points: Vec<DtoPoint> =
        serde_wasm_bindgen::from_value(points_value).map_err(|e| JsError::new(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&DtoFixtureApi::batch(points))
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn dto_point_maybe(point_value: JsValue) -> std::result::Result<JsValue, JsError> {
    let point: Option<DtoPoint> =
        serde_wasm_bindgen::from_value(point_value).map_err(|e| JsError::new(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&DtoFixtureApi::maybe(point))
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn dto_point_pair(value_value: JsValue) -> std::result::Result<JsValue, JsError> {
    let value: (DtoPoint, i32) =
        serde_wasm_bindgen::from_value(value_value).map_err(|e| JsError::new(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&DtoFixtureApi::pair(value))
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn dto_point_fixed(values_value: JsValue) -> std::result::Result<JsValue, JsError> {
    let values: [DtoPoint; 2] =
        serde_wasm_bindgen::from_value(values_value).map_err(|e| JsError::new(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&DtoFixtureApi::fixed(values))
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn dto_point_by_name(values_value: JsValue) -> std::result::Result<JsValue, JsError> {
    let values: BTreeMap<String, DtoPoint> =
        serde_wasm_bindgen::from_value(values_value).map_err(|e| JsError::new(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&DtoFixtureApi::by_name(values))
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn dto_point_label(value_value: JsValue) -> std::result::Result<JsValue, JsError> {
    let value: DtoLabel =
        serde_wasm_bindgen::from_value(value_value).map_err(|e| JsError::new(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&DtoFixtureApi::label(value))
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn dto_point_nested(point_value: JsValue) -> std::result::Result<JsValue, JsError> {
    let point: Option<DtoPoint> =
        serde_wasm_bindgen::from_value(point_value).map_err(|e| JsError::new(&e.to_string()))?;
    let out = DtoFixtureApi::nested(point).map_err(|e| js_error_from_to_app_error(e, None))?;
    serde_wasm_bindgen::to_value(&out).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn dto_point_checked(point_value: JsValue) -> std::result::Result<JsValue, JsError> {
    let point: DtoPoint =
        serde_wasm_bindgen::from_value(point_value).map_err(|e| JsError::new(&e.to_string()))?;
    let out = DtoFixtureApi::checked(point).map_err(|e| js_error_from_to_app_error(e, None))?;
    serde_wasm_bindgen::to_value(&out).map_err(|e| JsError::new(&e.to_string()))
}
