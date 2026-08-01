// --- Auto-generated Wasm Wrapper ---
#![allow(non_snake_case)]
#![allow(unused_imports)]

use std::collections::{BTreeMap, HashMap};
use wasm_bindgen::prelude::*;
extern crate common as grath_common;
use algebraic::prelude::*;
use algebraic::*;
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
pub struct WasmSymbolicComplex(pub(crate) SymbolicComplex);

impl WasmSymbolicComplex {
    pub fn inner(&self) -> &SymbolicComplex {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmSymbolicComplex {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(SymbolicComplex).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmSymbolicExpr(pub(crate) SymbolicExpr);

impl WasmSymbolicExpr {
    pub fn inner(&self) -> &SymbolicExpr {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmSymbolicExpr {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(SymbolicExpr).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmRational(pub(crate) Rational);

impl WasmRational {
    pub fn inner(&self) -> &Rational {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmRational {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Rational).to_string()
    }
}

#[wasm_bindgen]
impl WasmSymbolicComplex {
    pub fn from_latex(latex: &str) -> std::result::Result<WasmSymbolicComplex, JsError> {
        SymbolicComplex::from_latex(latex)
            .map(WasmSymbolicComplex)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn to_latex(&self) -> String {
        self.0.to_latex()
    }
}

#[wasm_bindgen]
impl WasmSymbolicComplex {
    pub fn new(re: WasmSymbolicExpr, im: WasmSymbolicExpr) -> WasmSymbolicComplex {
        WasmSymbolicComplex(SymbolicComplex::new(re.inner().clone(), im.inner().clone()))
    }
    pub fn from_real(re: WasmSymbolicExpr) -> WasmSymbolicComplex {
        WasmSymbolicComplex(SymbolicComplex::from_real(re.inner().clone()))
    }
    pub fn i() -> WasmSymbolicComplex {
        WasmSymbolicComplex(SymbolicComplex::i())
    }
    pub fn zero() -> WasmSymbolicComplex {
        WasmSymbolicComplex(SymbolicComplex::zero())
    }
    pub fn is_real(&self) -> bool {
        self.0.is_real()
    }
    pub fn is_imag_pure(&self) -> bool {
        self.0.is_imag_pure()
    }
    pub fn neg(&self) -> WasmSymbolicComplex {
        WasmSymbolicComplex(self.0.neg())
    }
    pub fn add(&self, other: &WasmSymbolicComplex) -> WasmSymbolicComplex {
        WasmSymbolicComplex(self.0.add(other.inner()))
    }
    pub fn sub(&self, other: &WasmSymbolicComplex) -> WasmSymbolicComplex {
        WasmSymbolicComplex(self.0.sub(other.inner()))
    }
    pub fn mul(&self, other: &WasmSymbolicComplex) -> WasmSymbolicComplex {
        WasmSymbolicComplex(self.0.mul(other.inner()))
    }
    pub fn conj(&self) -> WasmSymbolicComplex {
        WasmSymbolicComplex(self.0.conj())
    }
    pub fn sqrt_rational(n: i64, d: i64) -> WasmSymbolicComplex {
        WasmSymbolicComplex(SymbolicComplex::sqrt_rational(n, d))
    }
    pub fn simplify(&self) -> WasmSymbolicComplex {
        WasmSymbolicComplex(self.0.simplify())
    }
    pub fn expand(&self) -> WasmSymbolicComplex {
        WasmSymbolicComplex(self.0.expand())
    }
}

#[wasm_bindgen]
impl WasmSymbolicExpr {
    pub fn to_latex(&self) -> String {
        self.0.to_latex()
    }
}

#[wasm_bindgen]
impl WasmSymbolicExpr {
    pub fn from_latex(latex: &str) -> std::result::Result<WasmSymbolicExpr, JsError> {
        SymbolicExpr::from_latex(latex)
            .map(WasmSymbolicExpr)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn rational(n: i64, d: i64) -> WasmSymbolicExpr {
        WasmSymbolicExpr(SymbolicExpr::rational(n, d))
    }
    pub fn int(n: i64) -> WasmSymbolicExpr {
        WasmSymbolicExpr(SymbolicExpr::int(n))
    }
    pub fn add(terms: &str) -> std::result::Result<WasmSymbolicExpr, JsError> {
        let terms_vec: Vec<SymbolicExpr> = parse_csv_to_vec::<SymbolicExpr>(terms)?;
        Ok(WasmSymbolicExpr(SymbolicExpr::add(terms_vec)))
    }
    pub fn mul(factors: &str) -> std::result::Result<WasmSymbolicExpr, JsError> {
        let factors_vec: Vec<SymbolicExpr> = parse_csv_to_vec::<SymbolicExpr>(factors)?;
        Ok(WasmSymbolicExpr(SymbolicExpr::mul(factors_vec)))
    }
    pub fn pow(base: WasmSymbolicExpr, exp: WasmSymbolicExpr) -> WasmSymbolicExpr {
        WasmSymbolicExpr(SymbolicExpr::pow(base.inner().clone(), exp.inner().clone()))
    }
    pub fn sqrt(self) -> WasmSymbolicExpr {
        WasmSymbolicExpr(self.0.sqrt())
    }
    pub fn sqrt2() -> WasmSymbolicExpr {
        WasmSymbolicExpr(SymbolicExpr::sqrt2())
    }
    pub fn expand(self) -> WasmSymbolicExpr {
        WasmSymbolicExpr(self.0.expand())
    }
    pub fn simplify(self) -> WasmSymbolicExpr {
        WasmSymbolicExpr(self.0.simplify())
    }
    pub fn substitute(self, sym: &str, val: &WasmSymbolicExpr) -> WasmSymbolicExpr {
        WasmSymbolicExpr(self.0.substitute(sym, val.inner()))
    }
}

#[wasm_bindgen]
impl WasmRational {
    pub fn try_new(numer: i64, denom: i64) -> std::result::Result<WasmRational, JsError> {
        Rational::try_new(numer, denom)
            .map(WasmRational)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn new(numer: i64, denom: i64) -> WasmRational {
        WasmRational(Rational::new(numer, denom))
    }
    pub fn to_latex(&self) -> String {
        self.0.to_latex()
    }
    pub fn from_latex(latex: &str) -> std::result::Result<WasmRational, JsError> {
        Rational::from_latex(latex)
            .map(WasmRational)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn from_int(n: i64) -> WasmRational {
        WasmRational(Rational::from_int(n))
    }
    pub fn is_integer(&self) -> bool {
        self.0.is_integer()
    }
    pub fn numer(&self) -> i64 {
        self.0.numer()
    }
    pub fn denom(&self) -> u64 {
        self.0.denom()
    }
    pub fn is_zero(&self) -> bool {
        self.0.is_zero()
    }
    pub fn is_one(&self) -> bool {
        self.0.is_one()
    }
    pub fn is_minus_one(&self) -> bool {
        self.0.is_minus_one()
    }
    pub fn normalize(&mut self) -> () {
        self.0.normalize()
    }
    pub fn simplified(self) -> WasmRational {
        WasmRational(self.0.simplified())
    }
    pub fn checked_add(self, rhs: WasmRational) -> std::result::Result<WasmRational, JsError> {
        self.0
            .checked_add(rhs.0)
            .map(WasmRational)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn checked_mul(self, rhs: WasmRational) -> std::result::Result<WasmRational, JsError> {
        self.0
            .checked_mul(rhs.0)
            .map(WasmRational)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn checked_div(self, rhs: WasmRational) -> std::result::Result<WasmRational, JsError> {
        self.0
            .checked_div(rhs.0)
            .map(WasmRational)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}
