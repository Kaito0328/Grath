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

import { setWasmFromWasmLib as setAlgebraicDtoWasmFromWasmLib } from "./wrappers/algebraicDto";

export function bindWasmFromWasmLib(wasmLib: unknown) {
	setAlgebraicDtoWasmFromWasmLib(wasmLib);
	// <inspector:wasm-bind-calls>
	// </inspector:wasm-bind-calls>
}

// <inspector:type-api-exports>
// </inspector:type-api-exports>

export * as algebraicClasses from "./api/algebraicApi";
export * as apiRuntime from "./api/runtime";
export { PolynomialSolverHelper } from "./api/polynomialSolver";
export { LinalgApi } from "./api/linalgApi";
export { FiniteFieldApi } from "./api/finiteFieldApi";
export { SourceCodingApi } from "./api/sourceCodingApi";
export type { SourceCodingCodec } from "./api/sourceCodingApi";
export { CodingApi } from "./api/codingApi";
export { SignalProcessingApi } from "./api/signalProcessingApi";
