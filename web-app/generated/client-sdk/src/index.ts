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
export { setWasmFromWasmLib as setAlgebraicWasm } from "./wrappers/algebraic";
export { setWasmFromWasmLib as setCodingWasm } from "./wrappers/coding";
export { setWasmFromWasmLib as setCommonWasm } from "./wrappers/common";
export { setWasmFromWasmLib as setConcreteMathWasm } from "./wrappers/concreteMath";
export { setWasmFromWasmLib as setFiniteFieldWasm } from "./wrappers/finiteField";
export { setWasmFromWasmLib as setLinalgWasm } from "./wrappers/linalg";
export { setWasmFromWasmLib as setPolynomialWasm } from "./wrappers/polynomial";
export { setWasmFromWasmLib as setSignalProcessingWasm } from "./wrappers/signalProcessing";
export { setWasmFromWasmLib as setSourceCodingWasm } from "./wrappers/sourceCoding";
export { setWasmFromWasmLib as setStatisticsWasm } from "./wrappers/statistics";

import { setWasmFromWasmLib as setAlgebraicWasmFromWasmLib } from "./wrappers/algebraic";
import { setWasmFromWasmLib as setCodingWasmFromWasmLib } from "./wrappers/coding";
import { setWasmFromWasmLib as setCommonWasmFromWasmLib } from "./wrappers/common";
import { setWasmFromWasmLib as setConcreteMathWasmFromWasmLib } from "./wrappers/concreteMath";
import { setWasmFromWasmLib as setFiniteFieldWasmFromWasmLib } from "./wrappers/finiteField";
import { setWasmFromWasmLib as setLinalgWasmFromWasmLib } from "./wrappers/linalg";
import { setWasmFromWasmLib as setPolynomialWasmFromWasmLib } from "./wrappers/polynomial";
import { setWasmFromWasmLib as setSignalProcessingWasmFromWasmLib } from "./wrappers/signalProcessing";
import { setWasmFromWasmLib as setSourceCodingWasmFromWasmLib } from "./wrappers/sourceCoding";
import { setWasmFromWasmLib as setStatisticsWasmFromWasmLib } from "./wrappers/statistics";
// </inspector:wasm-bindings>

import { setWasmFromWasmLib as setAlgebraicDtoWasmFromWasmLib } from "./wrappers/algebraicDto";

export function bindWasmFromWasmLib(wasmLib: unknown) {
	setAlgebraicDtoWasmFromWasmLib(wasmLib);
	// <inspector:wasm-bind-calls>
	setAlgebraicWasmFromWasmLib(wasmLib);
	setCodingWasmFromWasmLib(wasmLib);
	setCommonWasmFromWasmLib(wasmLib);
	setConcreteMathWasmFromWasmLib(wasmLib);
	setFiniteFieldWasmFromWasmLib(wasmLib);
	setLinalgWasmFromWasmLib(wasmLib);
	setPolynomialWasmFromWasmLib(wasmLib);
	setSignalProcessingWasmFromWasmLib(wasmLib);
	setSourceCodingWasmFromWasmLib(wasmLib);
	setStatisticsWasmFromWasmLib(wasmLib);
	// </inspector:wasm-bind-calls>
}

// <inspector:type-api-exports>
export { DtoPoint } from "./wrappers/coding";
export type { DtoPointDto, DtoLabelDto } from "./wrappers/coding";
export { RationalMatrix, RationalMatrixDto } from "./wrappers/linalg";
export type { RationalValueDto, RationalMatrixValueDto } from "./wrappers/linalg";
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
