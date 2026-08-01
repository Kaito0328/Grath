/* eslint-disable */
/* tslint:disable */
// --- Auto-generated TypeScript Wrapper (DTO) ---

import { setWasmFromWasmLib as setAlgebraicWasmFromWasmLib } from "./algebraic";

export type RationalDto = {
	numer: string;
	denom: string;
	dirty: boolean;
};

export type SymbolicExprDto =
	| { kind: "Rational"; value: RationalDto }
	| { kind: "Symbol"; value: string }
	| { kind: "Add"; value: SymbolicExprDto[] }
	| { kind: "Mul"; value: SymbolicExprDto[] }
	| { kind: "Pow"; value: [SymbolicExprDto, SymbolicExprDto] };

export type SymbolicComplexDto = {
	re: SymbolicExprDto;
	im: SymbolicExprDto;
};

export type AlgebraicDtoModule = Pick<
	typeof import("wasm-lib"),
	| "rationalParseDto"
	| "rationalParseDtoFromLatex"
	| "rationalFormatDto"
	| "rationalFormatDtoToLatex"
	| "rationalSimplifyDto"
	| "rationalSimplifyDtoFromText"
	| "rationalTryNewDto"
	| "rationalCreateDto"
	| "rationalFromIntDto"
	| "rationalFromLatexDto"
	| "rationalToLatexDto"
	| "rationalIsIntegerDto"
	| "rationalIsZeroDto"
	| "rationalIsOneDto"
	| "rationalIsMinusOneDto"
	| "rationalNormalizeDto"
	| "rationalCheckedAddDto"
	| "rationalCheckedMulDto"
	| "rationalCheckedDivDto"
	| "symbolicExprParseDto"
	| "symbolicExprParseDtoFromLatex"
	| "symbolicExprFormatDto"
	| "symbolicExprFormatDtoToLatex"
	| "symbolicExprSimplifyDto"
	| "symbolicExprRationalDto"
	| "symbolicExprIntDto"
	| "symbolicExprSqrt2Dto"
	| "symbolicExprAddDto"
	| "symbolicExprMulDto"
	| "symbolicExprPowDto"
	| "symbolicComplexParseDto"
	| "symbolicComplexParseDtoFromLatex"
	| "symbolicComplexFormatDto"
	| "symbolicComplexFormatDtoToLatex"
	| "symbolicComplexSimplifyDto"
	| "symbolicComplexNewDto"
	| "symbolicComplexFromRealDto"
	| "symbolicComplexIDto"
	| "symbolicComplexZeroDto"
	| "symbolicComplexIsRealDto"
	| "symbolicComplexIsImagPureDto"
	| "symbolicComplexNegDto"
	| "symbolicComplexAddDto"
	| "symbolicComplexSubDto"
	| "symbolicComplexMulDto"
	| "symbolicComplexSqrtRationalDto"
>;

let wasm: AlgebraicDtoModule | null = null;

export function setWasm(module: AlgebraicDtoModule) {
	wasm = module;
}

export function setWasmFromWasmLib(wasmLib: unknown) {
	const module = wasmLib as Record<string, unknown>;
	const required = [
		"rationalParseDto",
		"rationalParseDtoFromLatex",
		"rationalFormatDto",
		"rationalFormatDtoToLatex",
		"rationalSimplifyDto",
		"rationalSimplifyDtoFromText",
		"rationalTryNewDto",
		"rationalCreateDto",
		"rationalFromIntDto",
		"rationalFromLatexDto",
		"rationalToLatexDto",
		"rationalIsIntegerDto",
		"rationalIsZeroDto",
		"rationalIsOneDto",
		"rationalIsMinusOneDto",
		"rationalNormalizeDto",
		"rationalCheckedAddDto",
		"rationalCheckedMulDto",
		"rationalCheckedDivDto",
		"symbolicExprParseDto",
		"symbolicExprParseDtoFromLatex",
		"symbolicExprFormatDto",
		"symbolicExprFormatDtoToLatex",
		"symbolicExprSimplifyDto",
		"symbolicExprRationalDto",
		"symbolicExprIntDto",
		"symbolicExprSqrt2Dto",
		"symbolicExprAddDto",
		"symbolicExprMulDto",
		"symbolicExprPowDto",
		"symbolicComplexParseDto",
		"symbolicComplexParseDtoFromLatex",
		"symbolicComplexFormatDto",
		"symbolicComplexFormatDtoToLatex",
		"symbolicComplexSimplifyDto",
		"symbolicComplexNewDto",
		"symbolicComplexFromRealDto",
		"symbolicComplexIDto",
		"symbolicComplexZeroDto",
		"symbolicComplexIsRealDto",
		"symbolicComplexIsImagPureDto",
		"symbolicComplexNegDto",
		"symbolicComplexAddDto",
		"symbolicComplexSubDto",
		"symbolicComplexMulDto",
		"symbolicComplexSqrtRationalDto",
	];
	for (const key of required) {
		if (!module[key]) {
			throw new Error(`wasm-lib module is missing expected export: ${key}`);
		}
	}
	setWasm(wasmLib as AlgebraicDtoModule);
	setAlgebraicWasmFromWasmLib(wasmLib);
}

function getWasm(): AlgebraicDtoModule {
	if (!wasm) {
		throw new Error("wasm module is not set. Call setWasmFromWasmLib() after wasm initialization.");
	}
	return wasm;
}

export function rationalParseDto(text: string): RationalDto {
	return getWasm().rationalParseDto(text) as unknown as RationalDto;
}

export function rationalParseDtoFromLatex(latex: string): RationalDto {
	return getWasm().rationalParseDtoFromLatex(latex) as unknown as RationalDto;
}

export function rationalFormatDto(dto: RationalDto): string {
	return getWasm().rationalFormatDto(dto as unknown);
}

export function rationalFormatDtoToLatex(dto: RationalDto): string {
	return getWasm().rationalFormatDtoToLatex(dto as unknown);
}

export function rationalSimplifyDto(dto: RationalDto): RationalDto {
	return getWasm().rationalSimplifyDto(dto as unknown) as unknown as RationalDto;
}

export function rationalSimplifyDtoFromText(text: string): RationalDto {
	return getWasm().rationalSimplifyDtoFromText(text) as unknown as RationalDto;
}

export function rationalTryNewDto(numer: number, denom: number): RationalDto {
	return getWasm().rationalTryNewDto(BigInt(numer), BigInt(denom)) as unknown as RationalDto;
}

export function rationalCreateDto(numer: number, denom: number): RationalDto {
	return getWasm().rationalCreateDto(BigInt(numer), BigInt(denom)) as unknown as RationalDto;
}

export function rationalFromIntDto(n: number): RationalDto {
	return getWasm().rationalFromIntDto(BigInt(n)) as unknown as RationalDto;
}

export function rationalFromLatexDto(latex: string): RationalDto {
	return getWasm().rationalFromLatexDto(latex) as unknown as RationalDto;
}

export function rationalToLatexDto(dto: RationalDto): string {
	return getWasm().rationalToLatexDto(dto as unknown);
}

export function rationalIsIntegerDto(dto: RationalDto): boolean {
	return getWasm().rationalIsIntegerDto(dto as unknown);
}

export function rationalIsZeroDto(dto: RationalDto): boolean {
	return getWasm().rationalIsZeroDto(dto as unknown);
}

export function rationalIsOneDto(dto: RationalDto): boolean {
	return getWasm().rationalIsOneDto(dto as unknown);
}

export function rationalIsMinusOneDto(dto: RationalDto): boolean {
	return getWasm().rationalIsMinusOneDto(dto as unknown);
}

export function rationalNormalizeDto(dto: RationalDto): RationalDto {
	return getWasm().rationalNormalizeDto(dto as unknown) as unknown as RationalDto;
}

export function rationalCheckedAddDto(a: RationalDto, b: RationalDto): RationalDto {
	return getWasm().rationalCheckedAddDto(a as unknown, b as unknown) as unknown as RationalDto;
}

export function rationalCheckedMulDto(a: RationalDto, b: RationalDto): RationalDto {
	return getWasm().rationalCheckedMulDto(a as unknown, b as unknown) as unknown as RationalDto;
}

export function rationalCheckedDivDto(a: RationalDto, b: RationalDto): RationalDto {
	return getWasm().rationalCheckedDivDto(a as unknown, b as unknown) as unknown as RationalDto;
}

export function symbolicExprParseDto(text: string): SymbolicExprDto {
	return getWasm().symbolicExprParseDto(text) as unknown as SymbolicExprDto;
}

export function symbolicExprParseDtoFromLatex(latex: string): SymbolicExprDto {
	return getWasm().symbolicExprParseDtoFromLatex(latex) as unknown as SymbolicExprDto;
}

export function symbolicExprFormatDto(dto: SymbolicExprDto): string {
	return getWasm().symbolicExprFormatDto(dto as unknown);
}

export function symbolicExprFormatDtoToLatex(dto: SymbolicExprDto): string {
	return getWasm().symbolicExprFormatDtoToLatex(dto as unknown);
}

export function symbolicExprSimplifyDto(dto: SymbolicExprDto): SymbolicExprDto {
	return getWasm().symbolicExprSimplifyDto(dto as unknown) as unknown as SymbolicExprDto;
}

export function symbolicExprRationalDto(n: number, d: number): SymbolicExprDto {
	return getWasm().symbolicExprRationalDto(BigInt(n), BigInt(d)) as unknown as SymbolicExprDto;
}

export function symbolicExprIntDto(n: number): SymbolicExprDto {
	return getWasm().symbolicExprIntDto(BigInt(n)) as unknown as SymbolicExprDto;
}

export function symbolicExprSqrt2Dto(): SymbolicExprDto {
	return getWasm().symbolicExprSqrt2Dto() as unknown as SymbolicExprDto;
}

export function symbolicExprAddDto(terms: SymbolicExprDto[]): SymbolicExprDto {
	return getWasm().symbolicExprAddDto(terms as unknown) as unknown as SymbolicExprDto;
}

export function symbolicExprMulDto(factors: SymbolicExprDto[]): SymbolicExprDto {
	return getWasm().symbolicExprMulDto(factors as unknown) as unknown as SymbolicExprDto;
}

export function symbolicExprPowDto(base: SymbolicExprDto, exp: SymbolicExprDto): SymbolicExprDto {
	return getWasm().symbolicExprPowDto(base as unknown, exp as unknown) as unknown as SymbolicExprDto;
}

export function symbolicComplexParseDto(text: string): SymbolicComplexDto {
	return getWasm().symbolicComplexParseDto(text) as unknown as SymbolicComplexDto;
}

export function symbolicComplexParseDtoFromLatex(latex: string): SymbolicComplexDto {
	return getWasm().symbolicComplexParseDtoFromLatex(latex) as unknown as SymbolicComplexDto;
}

export function symbolicComplexFormatDto(dto: SymbolicComplexDto): string {
	return getWasm().symbolicComplexFormatDto(dto as unknown);
}

export function symbolicComplexFormatDtoToLatex(dto: SymbolicComplexDto): string {
	return getWasm().symbolicComplexFormatDtoToLatex(dto as unknown);
}

export function symbolicComplexSimplifyDto(dto: SymbolicComplexDto): SymbolicComplexDto {
	return getWasm().symbolicComplexSimplifyDto(dto as unknown) as unknown as SymbolicComplexDto;
}

export function symbolicComplexNewDto(re: SymbolicExprDto, im: SymbolicExprDto): SymbolicComplexDto {
	return getWasm().symbolicComplexNewDto(re as unknown, im as unknown) as unknown as SymbolicComplexDto;
}

export function symbolicComplexFromRealDto(re: SymbolicExprDto): SymbolicComplexDto {
	return getWasm().symbolicComplexFromRealDto(re as unknown) as unknown as SymbolicComplexDto;
}

export function symbolicComplexIDto(): SymbolicComplexDto {
	return getWasm().symbolicComplexIDto() as unknown as SymbolicComplexDto;
}

export function symbolicComplexZeroDto(): SymbolicComplexDto {
	return getWasm().symbolicComplexZeroDto() as unknown as SymbolicComplexDto;
}

export function symbolicComplexIsRealDto(dto: SymbolicComplexDto): boolean {
	return getWasm().symbolicComplexIsRealDto(dto as unknown);
}

export function symbolicComplexIsImagPureDto(dto: SymbolicComplexDto): boolean {
	return getWasm().symbolicComplexIsImagPureDto(dto as unknown);
}

export function symbolicComplexNegDto(dto: SymbolicComplexDto): SymbolicComplexDto {
	return getWasm().symbolicComplexNegDto(dto as unknown) as unknown as SymbolicComplexDto;
}

export function symbolicComplexAddDto(a: SymbolicComplexDto, b: SymbolicComplexDto): SymbolicComplexDto {
	return getWasm().symbolicComplexAddDto(a as unknown, b as unknown) as unknown as SymbolicComplexDto;
}

export function symbolicComplexSubDto(a: SymbolicComplexDto, b: SymbolicComplexDto): SymbolicComplexDto {
	return getWasm().symbolicComplexSubDto(a as unknown, b as unknown) as unknown as SymbolicComplexDto;
}

export function symbolicComplexMulDto(a: SymbolicComplexDto, b: SymbolicComplexDto): SymbolicComplexDto {
	return getWasm().symbolicComplexMulDto(a as unknown, b as unknown) as unknown as SymbolicComplexDto;
}

export function symbolicComplexSqrtRationalDto(n: number, d: number): SymbolicComplexDto {
	return getWasm().symbolicComplexSqrtRationalDto(BigInt(n), BigInt(d)) as unknown as SymbolicComplexDto;
}
