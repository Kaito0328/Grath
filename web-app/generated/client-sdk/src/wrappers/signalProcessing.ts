/* eslint-disable */
/* tslint:disable */
// --- Auto-generated TypeScript Wrapper (wasm class bindings) ---

export type SignalProcessingModule = typeof import("wasm-lib");

let wasm: SignalProcessingModule | null = null;

export function setWasm(module: SignalProcessingModule) {
    wasm = module;
}

export function setWasmFromWasmLib(wasmLib: unknown) {
    setWasm(wasmLib as SignalProcessingModule);
}

function getWasm(): SignalProcessingModule {
    if (!wasm) {
        throw new Error("wasm module is not set for SignalProcessing. Call setWasmFromWasmLib() after wasm initialization.");
    }
    return wasm;
}

export function convSimpleF64(x: Float64Array, h: Float64Array): Float64Array {
    return getWasm().WasmSignalProcessingApi.conv_simple_f64(x, h);
}

export function convAutoF64(x: Float64Array, h: Float64Array): Float64Array {
    return getWasm().WasmSignalProcessingApi.conv_auto_f64(x, h);
}

export function decimate(signal: Float64Array, factor: number): Float64Array {
    return getWasm().WasmSignalProcessingApi.decimate(signal, factor);
}

export function expand(signal: Float64Array, factor: number): Float64Array {
    return getWasm().WasmSignalProcessingApi.expand(signal, factor);
}

export function dftMagnitudes(signal: Float64Array, sample_rate: number): Float64Array {
    return getWasm().WasmSignalProcessingApi.dft_magnitudes(signal, sample_rate);
}

export function designFirLowpassTaps(num_taps: number, normalized_cutoff: number, window_type: string, kaiser_beta: number): Float64Array {
    return getWasm().WasmSignalProcessingApi.design_fir_lowpass_taps(num_taps, normalized_cutoff, window_type, kaiser_beta);
}

export function designFirHighpassTaps(num_taps: number, normalized_cutoff: number, window_type: string, kaiser_beta: number): Float64Array {
    return getWasm().WasmSignalProcessingApi.design_fir_highpass_taps(num_taps, normalized_cutoff, window_type, kaiser_beta);
}

export function designFirBandpassTaps(num_taps: number, normalized_f1: number, normalized_f2: number, window_type: string, kaiser_beta: number): Float64Array {
    return getWasm().WasmSignalProcessingApi.design_fir_bandpass_taps(num_taps, normalized_f1, normalized_f2, window_type, kaiser_beta);
}

export function designFirBandstopTaps(num_taps: number, normalized_f1: number, normalized_f2: number, window_type: string, kaiser_beta: number): Float64Array {
    return getWasm().WasmSignalProcessingApi.design_fir_bandstop_taps(num_taps, normalized_f1, normalized_f2, window_type, kaiser_beta);
}

export function iirButterworthApplyF64(x: Float64Array, fs: number, order: number, spec: string, f1_hz: number, f2_hz: number): Float64Array {
    return getWasm().WasmSignalProcessingApi.iir_butterworth_apply_f64(x, fs, order, spec, f1_hz, f2_hz);
}

export function iirChebyshev1ApplyF64(x: Float64Array, fs: number, order: number, ripple_db: number, spec: string, f1_hz: number, f2_hz: number): Float64Array {
    return getWasm().WasmSignalProcessingApi.iir_chebyshev1_apply_f64(x, fs, order, ripple_db, spec, f1_hz, f2_hz);
}

export function iirChebyshev2ApplyF64(x: Float64Array, fs: number, order: number, stopband_atten_db: number, spec: string, f1_hz: number, f2_hz: number): Float64Array {
    return getWasm().WasmSignalProcessingApi.iir_chebyshev2_apply_f64(x, fs, order, stopband_atten_db, spec, f1_hz, f2_hz);
}

export function imageConvolve2DSimpleF32(data: Float32Array, width: number, height: number, kernel: Float32Array, kernel_width: number, kernel_height: number, border_mode: string, border_constant: number): Float32Array {
    return getWasm().WasmSignalProcessingApi.image_convolve2d_simple_f32(data, width, height, kernel, kernel_width, kernel_height, border_mode, border_constant);
}

export function imageGaussianBlurF32(data: Float32Array, width: number, height: number, sigma: number, radius: number, border_mode: string, border_constant: number): Float32Array {
    return getWasm().WasmSignalProcessingApi.image_gaussian_blur_f32(data, width, height, sigma, radius, border_mode, border_constant);
}

