// --- Auto-generated Wasm Wrapper ---
#![allow(non_snake_case)]
#![allow(unused_imports)]

use wasm_bindgen::prelude::*;
use std::collections::{BTreeMap, HashMap};
use ::common::prelude::*;
use source_coding::*;

fn js_error_from_app_error(app: AppError) -> JsError {
let json = serde_json::to_string(&app)
.unwrap_or_else(|_| format!("{}: {}", app.code, app.message));
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
    v.into_iter().map(|x| x.to_string()).collect::<Vec<_>>().join(",")
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
pub struct WasmJonesCode(pub(crate) JonesCode);

impl WasmJonesCode {
    pub fn inner(&self) -> &JonesCode { &self.0 }
}

#[wasm_bindgen]
impl WasmJonesCode {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(JonesCode).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmArithmeticCode(pub(crate) ArithmeticCode);

impl WasmArithmeticCode {
    pub fn inner(&self) -> &ArithmeticCode { &self.0 }
}

#[wasm_bindgen]
impl WasmArithmeticCode {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(ArithmeticCode).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmMarkov(pub(crate) Markov);

impl WasmMarkov {
    pub fn inner(&self) -> &Markov { &self.0 }
}

#[wasm_bindgen]
impl WasmMarkov {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Markov).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmHuffmanCode(pub(crate) HuffmanCode);

impl WasmHuffmanCode {
    pub fn inner(&self) -> &HuffmanCode { &self.0 }
}

#[wasm_bindgen]
impl WasmHuffmanCode {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(HuffmanCode).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmLz78Code(pub(crate) Lz78Code);

impl WasmLz78Code {
    pub fn inner(&self) -> &Lz78Code { &self.0 }
}

#[wasm_bindgen]
impl WasmLz78Code {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Lz78Code).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmSourceCodingApi(pub(crate) SourceCodingApi);

impl WasmSourceCodingApi {
    pub fn inner(&self) -> &SourceCodingApi { &self.0 }
}

#[wasm_bindgen]
impl WasmSourceCodingApi {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(SourceCodingApi).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmBlockHuffmanTree(pub(crate) BlockHuffmanTree);

impl WasmBlockHuffmanTree {
    pub fn inner(&self) -> &BlockHuffmanTree { &self.0 }
}

#[wasm_bindgen]
impl WasmBlockHuffmanTree {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(BlockHuffmanTree).to_string()
    }
}

#[wasm_bindgen]
impl WasmSourceCodingApi {
    pub fn huffman_roundtrip(input: String) -> std::result::Result<bool, JsError> {
        SourceCodingApi::huffman_roundtrip(input).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn lz78_roundtrip(input: String) -> std::result::Result<bool, JsError> {
        SourceCodingApi::lz78_roundtrip(input).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn arithmetic_roundtrip(input: String) -> std::result::Result<bool, JsError> {
        SourceCodingApi::arithmetic_roundtrip(input).map_err(|e| js_error_from_to_app_error(e, None))
    }
    pub fn huffman_encode_hex(input: String) -> std::result::Result<String, JsError> {
        SourceCodingApi::huffman_encode_hex(input).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn huffman_decode_hex(hex: String) -> std::result::Result<String, JsError> {
        SourceCodingApi::huffman_decode_hex(hex).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn lz78_encode_hex(input: String) -> std::result::Result<String, JsError> {
        SourceCodingApi::lz78_encode_hex(input).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn lz78_decode_hex(hex: String) -> std::result::Result<String, JsError> {
        SourceCodingApi::lz78_decode_hex(hex).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn arithmetic_encode_hex(input: String) -> std::result::Result<String, JsError> {
        SourceCodingApi::arithmetic_encode_hex(input).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn arithmetic_decode_hex(hex: String) -> std::result::Result<String, JsError> {
        SourceCodingApi::arithmetic_decode_hex(hex).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

