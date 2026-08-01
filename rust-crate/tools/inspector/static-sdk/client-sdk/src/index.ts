// @ts-nocheck
export async function initWasm(args?: unknown) {
	const wasm = (await import("wasm-lib")) as unknown as Record<string, unknown>;
	const maybeInit = wasm["default"];
	if (typeof maybeInit === "function") {
		await (maybeInit as (a?: unknown) => Promise<unknown> | unknown)(args);
	}
	return wasm;
}

export default initWasm;

export * from "./api/concreteMath";
export * from "./api/statisticsApi";
// <inspector:wasm-bindings>
// </inspector:wasm-bindings>

export function bindWasmFromWasmLib(wasmLib: unknown) {
	// <inspector:wasm-bind-calls>
	// </inspector:wasm-bind-calls>
}

// <inspector:type-api-exports>
// </inspector:type-api-exports>

// <inspector:generated-api-exports>
// </inspector:generated-api-exports>
export { PolynomialSolverHelper } from "./api/polynomialSolver";
export { LinalgApi } from "./api/linalgApi";
export { FiniteFieldApi } from "./api/finiteFieldApi";
export { SourceCodingApi } from "./api/sourceCodingApi";
export type { SourceCodingCodec } from "./api/sourceCodingApi";
export { CodingApi } from "./api/codingApi";
export { SignalProcessingApi } from "./api/signalProcessingApi";
