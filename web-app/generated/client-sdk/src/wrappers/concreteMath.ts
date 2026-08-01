/* eslint-disable */
/* tslint:disable */
// --- Auto-generated TypeScript Wrapper (wasm class bindings) ---

export type ConcreteMathModule = typeof import("wasm-lib");

let wasm: ConcreteMathModule | null = null;

export function setWasm(module: ConcreteMathModule) {
    wasm = module;
}

export function setWasmFromWasmLib(wasmLib: unknown) {
    setWasm(wasmLib as ConcreteMathModule);
}

function getWasm(): ConcreteMathModule {
    if (!wasm) {
        throw new Error("wasm module is not set for ConcreteMath. Call setWasmFromWasmLib() after wasm initialization.");
    }
    return wasm;
}

export function ntGcd(a: number | bigint, b: number | bigint): number {
    return Number(getWasm().WasmConcreteMathApi.nt_gcd((typeof a === "bigint" ? a : BigInt(Math.trunc(Number(a)))), (typeof b === "bigint" ? b : BigInt(Math.trunc(Number(b))))));
}

export function ntLcm(a: number | bigint, b: number | bigint): number {
    return Number(getWasm().WasmConcreteMathApi.nt_lcm((typeof a === "bigint" ? a : BigInt(Math.trunc(Number(a)))), (typeof b === "bigint" ? b : BigInt(Math.trunc(Number(b))))));
}

export function ntExtendedGcd(a: number | bigint, b: number | bigint): string {
    return getWasm().WasmConcreteMathApi.nt_extended_gcd((typeof a === "bigint" ? a : BigInt(Math.trunc(Number(a)))), (typeof b === "bigint" ? b : BigInt(Math.trunc(Number(b)))));
}

export function ntModPow(base: number | bigint, exp: number | bigint, m: number | bigint): number {
    return Number(getWasm().WasmConcreteMathApi.nt_mod_pow((typeof base === "bigint" ? base : BigInt(Math.trunc(Number(base)))), (typeof exp === "bigint" ? exp : BigInt(Math.trunc(Number(exp)))), (typeof m === "bigint" ? m : BigInt(Math.trunc(Number(m))))));
}

export function ntModInverse(a: number | bigint, m: number | bigint): number {
    return Number(getWasm().WasmConcreteMathApi.nt_mod_inverse((typeof a === "bigint" ? a : BigInt(Math.trunc(Number(a)))), (typeof m === "bigint" ? m : BigInt(Math.trunc(Number(m))))));
}

export function ntIsPrime(n: string): boolean {
    return getWasm().WasmConcreteMathApi.nt_is_prime(n);
}

export function ntFactorize(n: string): string {
    return getWasm().WasmConcreteMathApi.nt_factorize(n);
}

export function ntPhi(n: number | bigint): number {
    return Number(getWasm().WasmConcreteMathApi.nt_phi((typeof n === "bigint" ? n : BigInt(Math.trunc(Number(n))))));
}

export function getStirling1(n: number, k: number): number {
    return getWasm().WasmConcreteMathApi.get_stirling1(n, k);
}

export function getStirling2(n: number, k: number): number {
    return getWasm().WasmConcreteMathApi.get_stirling2(n, k);
}

export function getBernoulli(n: number): number {
    return getWasm().WasmConcreteMathApi.get_bernoulli(n);
}

export function getHarmonic(n: number): number {
    return getWasm().WasmConcreteMathApi.get_harmonic(n);
}

export function sfGamma(z: number): number {
    return getWasm().WasmConcreteMathApi.sf_gamma(z);
}

export function sfLogGamma(z: number): number {
    return getWasm().WasmConcreteMathApi.sf_log_gamma(z);
}

export function sfBeta(x: number, y: number): number {
    return getWasm().WasmConcreteMathApi.sf_beta(x, y);
}

export function sfErf(z: number): number {
    return getWasm().WasmConcreteMathApi.sf_erf(z);
}

export function sfRegularizedGamma(s: number, x: number): number {
    return getWasm().WasmConcreteMathApi.sf_regularized_gamma(s, x);
}

