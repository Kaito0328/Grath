// --- Auto-generated Wasm Wrapper ---
#![allow(non_snake_case)]
#![allow(unused_imports)]

use std::collections::{BTreeMap, HashMap};
use wasm_bindgen::prelude::*;
extern crate common as grath_common;
use grath_common::prelude::*;
use signal_processing::prelude::*;
use signal_processing::*;

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
pub struct WasmAdaptiveFilterLMS(pub(crate) AdaptiveFilterLMS);

impl WasmAdaptiveFilterLMS {
    pub fn inner(&self) -> &AdaptiveFilterLMS {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmAdaptiveFilterLMS {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(AdaptiveFilterLMS).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmAdaptiveFilterNLMS(pub(crate) AdaptiveFilterNLMS);

impl WasmAdaptiveFilterNLMS {
    pub fn inner(&self) -> &AdaptiveFilterNLMS {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmAdaptiveFilterNLMS {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(AdaptiveFilterNLMS).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmSignalProcessingApi(pub(crate) SignalProcessingApi);

impl WasmSignalProcessingApi {
    pub fn inner(&self) -> &SignalProcessingApi {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmSignalProcessingApi {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(SignalProcessingApi).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmFIRFilter(pub(crate) FIRFilter);

impl WasmFIRFilter {
    pub fn inner(&self) -> &FIRFilter {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmFIRFilter {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(FIRFilter).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmIIRFilter(pub(crate) IIRFilter);

impl WasmIIRFilter {
    pub fn inner(&self) -> &IIRFilter {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmIIRFilter {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(IIRFilter).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmSignal(pub(crate) Signal);

impl WasmSignal {
    pub fn inner(&self) -> &Signal {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmSignal {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Signal).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmSpectrum(pub(crate) Spectrum);

impl WasmSpectrum {
    pub fn inner(&self) -> &Spectrum {
        &self.0
    }
}

#[wasm_bindgen]
impl WasmSpectrum {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Spectrum).to_string()
    }
}

#[wasm_bindgen]
impl WasmAdaptiveFilterLMS {
    pub fn new(taps: usize, step_size: f64) -> WasmAdaptiveFilterLMS {
        WasmAdaptiveFilterLMS(AdaptiveFilterLMS::new(taps, step_size))
    }
}

#[wasm_bindgen]
impl WasmAdaptiveFilterNLMS {
    pub fn new(taps: usize, step_size: f64, epsilon: f64) -> WasmAdaptiveFilterNLMS {
        WasmAdaptiveFilterNLMS(AdaptiveFilterNLMS::new(taps, step_size, epsilon))
    }
    pub fn weights_vec(&self) -> Vec<f64> {
        self.0.weights_vec()
    }
}

#[wasm_bindgen]
impl WasmSignalProcessingApi {
    pub fn conv_simple_f64(x: Vec<f64>, h: Vec<f64>) -> Vec<f64> {
        SignalProcessingApi::conv_simple_f64(x, h)
    }
    pub fn conv_auto_f64(x: Vec<f64>, h: Vec<f64>) -> Vec<f64> {
        SignalProcessingApi::conv_auto_f64(x, h)
    }
    pub fn decimate(signal: Vec<f64>, factor: usize) -> Vec<f64> {
        SignalProcessingApi::decimate(signal, factor)
    }
    pub fn expand(signal: Vec<f64>, factor: usize) -> Vec<f64> {
        SignalProcessingApi::expand(signal, factor)
    }
    pub fn dft_magnitudes(
        signal: Vec<f64>,
        sample_rate: f64,
    ) -> std::result::Result<Vec<f64>, JsError> {
        SignalProcessingApi::dft_magnitudes(signal, sample_rate)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn design_fir_lowpass_taps(
        num_taps: usize,
        normalized_cutoff: f64,
        window_type: &str,
        kaiser_beta: f64,
    ) -> std::result::Result<Vec<f64>, JsError> {
        SignalProcessingApi::design_fir_lowpass_taps(
            num_taps,
            normalized_cutoff,
            window_type,
            kaiser_beta,
        )
        .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn design_fir_highpass_taps(
        num_taps: usize,
        normalized_cutoff: f64,
        window_type: &str,
        kaiser_beta: f64,
    ) -> std::result::Result<Vec<f64>, JsError> {
        SignalProcessingApi::design_fir_highpass_taps(
            num_taps,
            normalized_cutoff,
            window_type,
            kaiser_beta,
        )
        .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn design_fir_bandpass_taps(
        num_taps: usize,
        normalized_f1: f64,
        normalized_f2: f64,
        window_type: &str,
        kaiser_beta: f64,
    ) -> std::result::Result<Vec<f64>, JsError> {
        SignalProcessingApi::design_fir_bandpass_taps(
            num_taps,
            normalized_f1,
            normalized_f2,
            window_type,
            kaiser_beta,
        )
        .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn design_fir_bandstop_taps(
        num_taps: usize,
        normalized_f1: f64,
        normalized_f2: f64,
        window_type: &str,
        kaiser_beta: f64,
    ) -> std::result::Result<Vec<f64>, JsError> {
        SignalProcessingApi::design_fir_bandstop_taps(
            num_taps,
            normalized_f1,
            normalized_f2,
            window_type,
            kaiser_beta,
        )
        .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn iir_butterworth_apply_f64(
        x: Vec<f64>,
        fs: f64,
        order: usize,
        spec: &str,
        f1_hz: f64,
        f2_hz: f64,
    ) -> std::result::Result<Vec<f64>, JsError> {
        SignalProcessingApi::iir_butterworth_apply_f64(x, fs, order, spec, f1_hz, f2_hz)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn iir_chebyshev1_apply_f64(
        x: Vec<f64>,
        fs: f64,
        order: usize,
        ripple_db: f64,
        spec: &str,
        f1_hz: f64,
        f2_hz: f64,
    ) -> std::result::Result<Vec<f64>, JsError> {
        SignalProcessingApi::iir_chebyshev1_apply_f64(x, fs, order, ripple_db, spec, f1_hz, f2_hz)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn iir_chebyshev2_apply_f64(
        x: Vec<f64>,
        fs: f64,
        order: usize,
        stopband_atten_db: f64,
        spec: &str,
        f1_hz: f64,
        f2_hz: f64,
    ) -> std::result::Result<Vec<f64>, JsError> {
        SignalProcessingApi::iir_chebyshev2_apply_f64(
            x,
            fs,
            order,
            stopband_atten_db,
            spec,
            f1_hz,
            f2_hz,
        )
        .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn image_convolve2d_simple_f32(
        data: Vec<f32>,
        width: usize,
        height: usize,
        kernel: Vec<f32>,
        kernel_width: usize,
        kernel_height: usize,
        border_mode: &str,
        border_constant: f32,
    ) -> std::result::Result<Vec<f32>, JsError> {
        SignalProcessingApi::image_convolve2d_simple_f32(
            data,
            width,
            height,
            kernel,
            kernel_width,
            kernel_height,
            border_mode,
            border_constant,
        )
        .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn image_gaussian_blur_f32(
        data: Vec<f32>,
        width: usize,
        height: usize,
        sigma: f32,
        radius: usize,
        border_mode: &str,
        border_constant: f32,
    ) -> std::result::Result<Vec<f32>, JsError> {
        SignalProcessingApi::image_gaussian_blur_f32(
            data,
            width,
            height,
            sigma,
            radius,
            border_mode,
            border_constant,
        )
        .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmSignal {
    pub fn dft(&self) -> WasmSpectrum {
        WasmSpectrum(self.0.dft())
    }
    pub fn convolve(&self, h: &WasmSignal) -> WasmSignal {
        WasmSignal(self.0.convolve(h.inner()))
    }
}

#[wasm_bindgen]
impl WasmSpectrum {
    pub fn ift(&self) -> WasmSignal {
        WasmSignal(self.0.ift())
    }
}

#[wasm_bindgen]
impl WasmFIRFilter {
    pub fn new_from_coeffs(coeffs: Vec<f64>) -> WasmFIRFilter {
        WasmFIRFilter(FIRFilter::new_from_coeffs(coeffs))
    }
    pub fn new_from_coeffs_with_fs(coeffs: Vec<f64>, fs: f64) -> WasmFIRFilter {
        WasmFIRFilter(FIRFilter::new_from_coeffs_with_fs(coeffs, fs))
    }
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
    pub fn apply(&self, x: &WasmSignal) -> WasmSignal {
        WasmSignal(self.0.apply(x.inner()))
    }
}

#[wasm_bindgen]
impl WasmIIRFilter {
    pub fn apply(&self, x: &WasmSignal) -> WasmSignal {
        WasmSignal(self.0.apply(x.inner()))
    }
}

#[wasm_bindgen]
impl WasmSignal {
    pub fn apply_iir(&self, filt: &WasmIIRFilter) -> WasmSignal {
        WasmSignal(self.0.apply_iir(filt.inner()))
    }
}

#[wasm_bindgen]
impl WasmSignal {
    pub fn from_image_grayscale(
        path: &str,
        sample_rate: f64,
    ) -> std::result::Result<WasmSignal, JsError> {
        Signal::from_image_grayscale(path, sample_rate)
            .map(WasmSignal)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn from_image_rgb(
        path: &str,
        sample_rate: f64,
    ) -> std::result::Result<WasmSignal, JsError> {
        Signal::from_image_rgb(path, sample_rate)
            .map(WasmSignal)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn from_wav_mono(path: &str) -> std::result::Result<WasmSignal, JsError> {
        Signal::from_wav_mono(path)
            .map(WasmSignal)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn save_wav_mono(&self, path: &str) -> std::result::Result<(), JsError> {
        self.0
            .save_wav_mono(path)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn save_image_grayscale(
        &self,
        path: &str,
        width: u32,
        height: u32,
    ) -> std::result::Result<(), JsError> {
        self.0
            .save_image_grayscale(path, width, height)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn save_image_rgb(
        &self,
        path: &str,
        width: u32,
        height: u32,
    ) -> std::result::Result<(), JsError> {
        self.0
            .save_image_rgb(path, width, height)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmSignal {
    pub fn decimate(&self, factor: usize) -> WasmSignal {
        WasmSignal(self.0.decimate(factor))
    }
    pub fn expand(&self, factor: usize) -> WasmSignal {
        WasmSignal(self.0.expand(factor))
    }
}

#[wasm_bindgen]
impl WasmSignal {
    pub fn new(data: Vec<f64>, sample_rate: f64) -> WasmSignal {
        WasmSignal(Signal::new(data, sample_rate))
    }
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
    pub fn sample_rate(&self) -> f64 {
        self.0.sample_rate()
    }
    pub fn duration(&self) -> f64 {
        self.0.duration()
    }
    pub fn save_svg(
        &self,
        path: &str,
        width: u32,
        height: u32,
    ) -> std::result::Result<(), JsError> {
        self.0
            .save_svg(path, width, height)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn save_svg_with_axes(
        &self,
        path: &str,
        width: u32,
        height: u32,
        label: &str,
    ) -> std::result::Result<(), JsError> {
        self.0
            .save_svg_with_axes(path, width, height, label)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn apply_fir_filter(&self, filter: &WasmFIRFilter) -> WasmSignal {
        WasmSignal(self.0.apply_fir_filter(filter.inner()))
    }
}

#[wasm_bindgen]
impl WasmSpectrum {
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
    pub fn sample_rate(&self) -> f64 {
        self.0.sample_rate()
    }
    pub fn bin_hz(&self, k: usize) -> f64 {
        self.0.bin_hz(k)
    }
    pub fn magnitude(&self, k: usize) -> f64 {
        self.0.magnitude(k)
    }
    pub fn magnitudes(&self) -> Vec<f64> {
        self.0.magnitudes()
    }
    pub fn save_svg_magnitude_db(
        &self,
        path: &str,
        width: u32,
        height: u32,
    ) -> std::result::Result<(), JsError> {
        self.0
            .save_svg_magnitude_db(path, width, height)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn save_svg_magnitude_db_with_axes(
        &self,
        path: &str,
        width: u32,
        height: u32,
        label: &str,
    ) -> std::result::Result<(), JsError> {
        self.0
            .save_svg_magnitude_db_with_axes(path, width, height, label)
            .map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}
