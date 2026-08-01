/* eslint-disable */
/* tslint:disable */
// --- Auto-generated TypeScript Wrapper (wasm class bindings) ---

export type SourceCodingModule = typeof import("wasm-lib");

let wasm: SourceCodingModule | null = null;

export function setWasm(module: SourceCodingModule) {
    wasm = module;
}

export function setWasmFromWasmLib(wasmLib: unknown) {
    setWasm(wasmLib as SourceCodingModule);
}

function getWasm(): SourceCodingModule {
    if (!wasm) {
        throw new Error("wasm module is not set for SourceCoding. Call setWasmFromWasmLib() after wasm initialization.");
    }
    return wasm;
}

export function huffmanRoundtrip(input: string): boolean {
    return getWasm().WasmSourceCodingApi.huffman_roundtrip(input);
}

export function lz78Roundtrip(input: string): boolean {
    return getWasm().WasmSourceCodingApi.lz78_roundtrip(input);
}

export function arithmeticRoundtrip(input: string): boolean {
    return getWasm().WasmSourceCodingApi.arithmetic_roundtrip(input);
}

export function huffmanEncodeHex(input: string): string {
    return getWasm().WasmSourceCodingApi.huffman_encode_hex(input);
}

export function huffmanDecodeHex(hex: string): string {
    return getWasm().WasmSourceCodingApi.huffman_decode_hex(hex);
}

export function lz78EncodeHex(input: string): string {
    return getWasm().WasmSourceCodingApi.lz78_encode_hex(input);
}

export function lz78DecodeHex(hex: string): string {
    return getWasm().WasmSourceCodingApi.lz78_decode_hex(hex);
}

export function arithmeticEncodeHex(input: string): string {
    return getWasm().WasmSourceCodingApi.arithmetic_encode_hex(input);
}

export function arithmeticDecodeHex(hex: string): string {
    return getWasm().WasmSourceCodingApi.arithmetic_decode_hex(hex);
}

