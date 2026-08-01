/* eslint-disable */
/* tslint:disable */
// --- Auto-generated TypeScript Wrapper (wasm class bindings) ---

export type PolynomialModule = typeof import("wasm-lib");

let wasm: PolynomialModule | null = null;

export function setWasm(module: PolynomialModule) {
    wasm = module;
}

export function setWasmFromWasmLib(wasmLib: unknown) {
    setWasm(wasmLib as PolynomialModule);
}

function getWasm(): PolynomialModule {
    if (!wasm) {
        throw new Error("wasm module is not set for Polynomial. Call setWasmFromWasmLib() after wasm initialization.");
    }
    return wasm;
}

export function findRootsSymbolicExpr(coeffs: string): string {
    return getWasm().WasmPolynomialApi.find_roots_symbolic_expr(coeffs);
}

