use crate::error::{Result, SignalError};
use crate::window::WindowType;
use crate::{dft, sampling};
use common::prelude::GrathCrateApi;

#[derive(Clone, Debug, Default)]
pub struct SignalProcessingApi;

impl GrathCrateApi for SignalProcessingApi {
    const CRATE_NAME: &'static str = "signal-processing";
}

fn invalid_arg(text: impl Into<String>) -> SignalError {
    SignalError::InvalidArgument { text: text.into() }
}

fn parse_window_type(window_type: &str, kaiser_beta: f64) -> Result<WindowType> {
    let t = window_type.trim().to_ascii_lowercase();
    match t.as_str() {
        "hann" => Ok(WindowType::Hann),
        "hamming" => Ok(WindowType::Hamming),
        "blackman" => Ok(WindowType::Blackman),
        "rect" | "rectangular" => Ok(WindowType::Rectangular),
        "kaiser" => {
            if !kaiser_beta.is_finite() || kaiser_beta < 0.0 {
                return Err(invalid_arg("kaiser_beta must be a finite number >= 0"));
            }
            Ok(WindowType::Kaiser { beta: kaiser_beta })
        }
        _ => Err(invalid_arg(
            "window_type must be one of: hann | hamming | blackman | rectangular | kaiser",
        )),
    }
}

fn parse_digital_filter_spec(
    spec: &str,
    f1_hz: f64,
    f2_hz: f64,
) -> Result<crate::iir::DigitalFilterSpec> {
    use crate::iir::DigitalFilterSpec as S;
    let s = spec.trim().to_ascii_lowercase();
    match s.as_str() {
        "lowpass" => Ok(S::Lowpass { fc_hz: f1_hz }),
        "highpass" => Ok(S::Highpass { fc_hz: f1_hz }),
        "bandpass" => Ok(S::Bandpass { f1_hz, f2_hz }),
        "bandstop" | "notch" => Ok(S::Bandstop { f1_hz, f2_hz }),
        _ => Err(invalid_arg(
            "spec must be one of: lowpass | highpass | bandpass | bandstop",
        )),
    }
}

fn validate_iir_inputs(fs: f64, order: usize, spec: &crate::iir::DigitalFilterSpec) -> Result<()> {
    if !fs.is_finite() || fs <= 0.0 {
        return Err(invalid_arg("fs must be a finite number > 0"));
    }
    if order < 1 {
        return Err(invalid_arg("order must be >= 1"));
    }

    use crate::iir::DigitalFilterSpec as S;
    let nyq = fs * 0.5;
    match *spec {
        S::Lowpass { fc_hz } | S::Highpass { fc_hz } => {
            if !fc_hz.is_finite() || fc_hz <= 0.0 || fc_hz >= nyq {
                return Err(invalid_arg("cutoff must satisfy 0 < fc_hz < fs/2"));
            }
        }
        S::Bandpass { f1_hz, f2_hz } | S::Bandstop { f1_hz, f2_hz } => {
            if !f1_hz.is_finite() || !f2_hz.is_finite() {
                return Err(invalid_arg("band edges must be finite"));
            }
            if !(0.0 < f1_hz && f1_hz < f2_hz && f2_hz < nyq) {
                return Err(invalid_arg(
                    "band edges must satisfy 0 < f1_hz < f2_hz < fs/2",
                ));
            }
        }
    }
    Ok(())
}

fn validate_fir_inputs(num_taps: usize, f1: f64, f2: Option<f64>) -> Result<()> {
    if num_taps == 0 {
        return Err(invalid_arg("num_taps must be > 0"));
    }
    if num_taps % 2 == 0 {
        return Err(invalid_arg("num_taps must be odd (Type I FIR)"));
    }
    if !f1.is_finite() {
        return Err(invalid_arg("frequency must be finite"));
    }
    if !(0.0 < f1 && f1 < 0.5) {
        return Err(invalid_arg("require 0 < f < 0.5 (normalized)"));
    }
    if let Some(f2) = f2 {
        if !f2.is_finite() {
            return Err(invalid_arg("frequency must be finite"));
        }
        if !(0.0 < f2 && f2 < 0.5) {
            return Err(invalid_arg("require 0 < f < 0.5 (normalized)"));
        }
        if !(f1 < f2) {
            return Err(invalid_arg("require f1 < f2"));
        }
    }
    Ok(())
}

fn parse_border(mode: &str, constant: f32) -> Result<crate::image::convolution::Border> {
    use crate::image::convolution::Border;
    let m = mode.trim().to_ascii_lowercase();
    match m.as_str() {
        "constant" => Ok(Border::Constant(constant)),
        "replicate" => Ok(Border::Replicate),
        "reflect" => Ok(Border::Reflect),
        _ => Err(invalid_arg(
            "border_mode must be one of: constant | replicate | reflect",
        )),
    }
}

impl SignalProcessingApi {
    pub fn conv_simple_f64(x: Vec<f64>, h: Vec<f64>) -> Vec<f64> {
        dft::conv_simple_f64(&x, &h)
    }

    pub fn conv_auto_f64(x: Vec<f64>, h: Vec<f64>) -> Vec<f64> {
        dft::conv_auto_f64(&x, &h)
    }

    pub fn decimate(signal: Vec<f64>, factor: usize) -> Vec<f64> {
        sampling::decimate(&signal, factor)
    }

    pub fn expand(signal: Vec<f64>, factor: usize) -> Vec<f64> {
        sampling::expand(&signal, factor)
    }

    pub fn dft_magnitudes(signal: Vec<f64>, sample_rate: f64) -> Result<Vec<f64>> {
        if !sample_rate.is_finite() || sample_rate <= 0.0 {
            return Err(invalid_arg("sample_rate must be a finite number > 0"));
        }
        let sig = crate::signal::Signal::new(signal, sample_rate);
        Ok(sig.dft().magnitudes())
    }

    // --- FIR design helpers (window method, normalized frequency) ---
    pub fn design_fir_lowpass_taps(
        num_taps: usize,
        normalized_cutoff: f64,
        window_type: &str,
        kaiser_beta: f64,
    ) -> Result<Vec<f64>> {
        validate_fir_inputs(num_taps, normalized_cutoff, None)?;
        let wt = parse_window_type(window_type, kaiser_beta)?;
        Ok(crate::fir::design_fir_lowpass(
            num_taps,
            normalized_cutoff,
            wt,
        ))
    }

    pub fn design_fir_highpass_taps(
        num_taps: usize,
        normalized_cutoff: f64,
        window_type: &str,
        kaiser_beta: f64,
    ) -> Result<Vec<f64>> {
        validate_fir_inputs(num_taps, normalized_cutoff, None)?;
        let wt = parse_window_type(window_type, kaiser_beta)?;
        Ok(crate::fir::design_fir_highpass(
            num_taps,
            normalized_cutoff,
            wt,
        ))
    }

    pub fn design_fir_bandpass_taps(
        num_taps: usize,
        normalized_f1: f64,
        normalized_f2: f64,
        window_type: &str,
        kaiser_beta: f64,
    ) -> Result<Vec<f64>> {
        validate_fir_inputs(num_taps, normalized_f1, Some(normalized_f2))?;
        let wt = parse_window_type(window_type, kaiser_beta)?;
        Ok(crate::fir::design_fir_bandpass(
            num_taps,
            normalized_f1,
            normalized_f2,
            wt,
        ))
    }

    pub fn design_fir_bandstop_taps(
        num_taps: usize,
        normalized_f1: f64,
        normalized_f2: f64,
        window_type: &str,
        kaiser_beta: f64,
    ) -> Result<Vec<f64>> {
        validate_fir_inputs(num_taps, normalized_f1, Some(normalized_f2))?;
        let wt = parse_window_type(window_type, kaiser_beta)?;
        Ok(crate::fir::design_fir_bandstop(
            num_taps,
            normalized_f1,
            normalized_f2,
            wt,
        ))
    }

    // --- IIR design+apply helpers (digital, Hz spec) ---
    pub fn iir_butterworth_apply_f64(
        x: Vec<f64>,
        fs: f64,
        order: usize,
        spec: &str,
        f1_hz: f64,
        f2_hz: f64,
    ) -> Result<Vec<f64>> {
        let spec = parse_digital_filter_spec(spec, f1_hz, f2_hz)?;
        validate_iir_inputs(fs, order, &spec)?;
        let filt = crate::iir::IIRFilter::design_digital_butterworth(order, fs, spec);
        let sig = crate::signal::Signal::new(x, fs);
        Ok(filt.apply(&sig).data().to_vec())
    }

    pub fn iir_chebyshev1_apply_f64(
        x: Vec<f64>,
        fs: f64,
        order: usize,
        ripple_db: f64,
        spec: &str,
        f1_hz: f64,
        f2_hz: f64,
    ) -> Result<Vec<f64>> {
        if !ripple_db.is_finite() || ripple_db < 0.0 {
            return Err(invalid_arg("ripple_db must be a finite number >= 0"));
        }
        let spec = parse_digital_filter_spec(spec, f1_hz, f2_hz)?;
        validate_iir_inputs(fs, order, &spec)?;
        let filt = crate::iir::IIRFilter::design_digital_chebyshev1(order, ripple_db, fs, spec);
        let sig = crate::signal::Signal::new(x, fs);
        Ok(filt.apply(&sig).data().to_vec())
    }

    pub fn iir_chebyshev2_apply_f64(
        x: Vec<f64>,
        fs: f64,
        order: usize,
        stopband_atten_db: f64,
        spec: &str,
        f1_hz: f64,
        f2_hz: f64,
    ) -> Result<Vec<f64>> {
        if !stopband_atten_db.is_finite() || stopband_atten_db <= 0.0 {
            return Err(invalid_arg("stopband_atten_db must be a finite number > 0"));
        }
        let spec = parse_digital_filter_spec(spec, f1_hz, f2_hz)?;
        validate_iir_inputs(fs, order, &spec)?;
        let filt =
            crate::iir::IIRFilter::design_digital_chebyshev2(order, stopband_atten_db, fs, spec);
        let sig = crate::signal::Signal::new(x, fs);
        Ok(filt.apply(&sig).data().to_vec())
    }

    // --- 2D image helpers (flattened grayscale) ---
    pub fn image_convolve2d_simple_f32(
        data: Vec<f32>,
        width: usize,
        height: usize,
        kernel: Vec<f32>,
        kernel_width: usize,
        kernel_height: usize,
        border_mode: &str,
        border_constant: f32,
    ) -> Result<Vec<f32>> {
        if width == 0 || height == 0 {
            return Err(invalid_arg("width and height must be > 0"));
        }
        if data.len() != width * height {
            return Err(invalid_arg("data length must equal width*height"));
        }
        if kernel_width == 0 || kernel_height == 0 {
            return Err(invalid_arg("kernel_width and kernel_height must be > 0"));
        }
        if kernel.len() != kernel_width * kernel_height {
            return Err(invalid_arg(
                "kernel length must equal kernel_width*kernel_height",
            ));
        }

        let border = parse_border(border_mode, border_constant)?;
        let src = crate::image::core::Image::<f32>::from_vec(data, width, height);
        let ker =
            crate::image::convolution::Kernel::<f32>::from_vec(kernel, kernel_width, kernel_height);
        let out = crate::image::convolution::convolve2d_simple_f32(&src, &ker, border);
        Ok(out.as_slice().to_vec())
    }

    pub fn image_gaussian_blur_f32(
        data: Vec<f32>,
        width: usize,
        height: usize,
        sigma: f32,
        radius: usize,
        border_mode: &str,
        border_constant: f32,
    ) -> Result<Vec<f32>> {
        if width == 0 || height == 0 {
            return Err(invalid_arg("width and height must be > 0"));
        }
        if data.len() != width * height {
            return Err(invalid_arg("data length must equal width*height"));
        }
        if !sigma.is_finite() || sigma <= 0.0 {
            return Err(invalid_arg("sigma must be a finite number > 0"));
        }

        let border = parse_border(border_mode, border_constant)?;
        let src = crate::image::core::Image::<f32>::from_vec(data, width, height);
        let out = crate::image::filter::gaussian_blur_f32(&src, sigma, radius, border);
        Ok(out.as_slice().to_vec())
    }
}
