/* eslint-disable */
/* tslint:disable */
// --- Auto-generated TypeScript Wrapper (wasm class bindings) ---

export type FiniteFieldModule = typeof import("wasm-lib");

let wasm: FiniteFieldModule | null = null;

export function setWasm(module: FiniteFieldModule) {
    wasm = module;
}

export function setWasmFromWasmLib(wasmLib: unknown) {
    setWasm(wasmLib as FiniteFieldModule);
}

function getWasm(): FiniteFieldModule {
    if (!wasm) {
        throw new Error("wasm module is not set for FiniteField. Call setWasmFromWasmLib() after wasm initialization.");
    }
    return wasm;
}

export function gf256Mul(a: string, b: string): string {
    return getWasm().WasmFiniteFieldApi.gf256_mul(a, b);
}

export function gf256InvCheck(a: string): boolean {
    return getWasm().WasmFiniteFieldApi.gf256_inv_check(a);
}

export function gfp5Add(a: string, b: string): string {
    return getWasm().WasmFiniteFieldApi.gfp5_add(a, b);
}

export function gfp5Mul(a: string, b: string): string {
    return getWasm().WasmFiniteFieldApi.gfp5_mul(a, b);
}

export function gfp5Inv(a: string): string {
    return getWasm().WasmFiniteFieldApi.gfp5_inv(a);
}

