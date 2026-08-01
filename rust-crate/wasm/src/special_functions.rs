use ::common::prelude::{AppError, ToAppError};
use special_functions::prelude::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sf_gamma(z: f64) -> f64 {
    gamma(z)
}

#[wasm_bindgen]
pub fn sf_log_gamma(z: f64) -> f64 {
    log_gamma(z)
}

#[wasm_bindgen]
pub fn sf_beta(x: f64, y: f64) -> f64 {
    beta(x, y)
}

#[wasm_bindgen]
pub fn sf_erf(z: f64) -> f64 {
    erf(z)
}

#[wasm_bindgen]
pub fn sf_regularized_gamma(s: f64, x: f64) -> f64 {
    regularized_gamma(s, x)
}
