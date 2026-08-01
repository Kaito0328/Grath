/* eslint-disable */
/* tslint:disable */
// --- Auto-generated TypeScript Wrapper (DTO-only) ---


export type SymbolicComplexDto =
  {
    re: SymbolicExprDto;
    im: SymbolicExprDto;
  };


export type SymbolicExprDto =
  | { kind: "Rational"; value: RationalDto }
  | { kind: "Symbol"; value: string }
  | { kind: "Add"; value: SymbolicExprDto[] }
  | { kind: "Mul"; value: SymbolicExprDto[] }
  | { kind: "Pow"; value: [SymbolicExprDto, SymbolicExprDto] }
;


export type RationalDto =
  {
    numer: number | string;
    denom: number | string;
    dirty: boolean;
  };



export type AlgebraicDtoModule = Pick<
  typeof import("wasm-lib"),
  | "rationalCheckedAddDto"
  | "rationalCheckedDivDto"
  | "rationalCheckedMulDto"
  | "rationalCreateDto"
  | "rationalDenomDto"
  | "rationalFormatDto"
  | "rationalFormatDtoToLatex"
  | "rationalFromIntDto"
  | "rationalFromLatexDto"
  | "rationalIsIntegerDto"
  | "rationalIsMinusOneDto"
  | "rationalIsOneDto"
  | "rationalIsZeroDto"
  | "rationalNewDto"
  | "rationalNormalizeDto"
  | "rationalNumerDto"
  | "rationalParseDto"
  | "rationalParseDtoFromLatex"
  | "rationalSimplifiedDto"
  | "rationalSimplifyDto"
  | "rationalSimplifyDtoFromText"
  | "rationalToLatexDto"
  | "rationalTryNewDto"
  | "rational_matrix_add"
  | "rational_matrix_dto_add"
  | "rational_matrix_dto_inverse"
  | "rational_matrix_dto_mul"
  | "rational_matrix_dto_rows"
  | "rational_matrix_dto_transpose"
  | "rational_matrix_dto_zeros"
  | "rational_matrix_first"
  | "rational_matrix_inverse"
  | "rational_matrix_mul"
  | "rational_matrix_rows"
  | "rational_matrix_transpose"
  | "rational_matrix_zeros"
  | "symbolicComplexAddDto"
  | "symbolicComplexConjDto"
  | "symbolicComplexExpandDto"
  | "symbolicComplexFormatDto"
  | "symbolicComplexFormatDtoToLatex"
  | "symbolicComplexFromLatexDto"
  | "symbolicComplexFromRealDto"
  | "symbolicComplexIDto"
  | "symbolicComplexIsImagPureDto"
  | "symbolicComplexIsRealDto"
  | "symbolicComplexMulDto"
  | "symbolicComplexNegDto"
  | "symbolicComplexNewDto"
  | "symbolicComplexParseDto"
  | "symbolicComplexParseDtoFromLatex"
  | "symbolicComplexSimplifyDto"
  | "symbolicComplexSqrtRationalDto"
  | "symbolicComplexSubDto"
  | "symbolicComplexToLatexDto"
  | "symbolicComplexZeroDto"
  | "symbolicExprAddDto"
  | "symbolicExprExpandDto"
  | "symbolicExprFormatDto"
  | "symbolicExprFormatDtoToLatex"
  | "symbolicExprFromLatexDto"
  | "symbolicExprIntDto"
  | "symbolicExprMulDto"
  | "symbolicExprParseDto"
  | "symbolicExprParseDtoFromLatex"
  | "symbolicExprPowDto"
  | "symbolicExprRationalDto"
  | "symbolicExprSimplifyDto"
  | "symbolicExprSqrt2Dto"
  | "symbolicExprSqrtDto"
  | "symbolicExprSubstituteDto"
  | "symbolicExprToLatexDto"
>;

let wasm: AlgebraicDtoModule | null = null;

export function setWasm(module: AlgebraicDtoModule) {
  wasm = module;
}

export function setWasmFromWasmLib(wasmLib: unknown) {
  const m = wasmLib as Record<string, unknown>;
  const required = [
    "rationalCheckedAddDto",
    "rationalCheckedDivDto",
    "rationalCheckedMulDto",
    "rationalCreateDto",
    "rationalDenomDto",
    "rationalFormatDto",
    "rationalFormatDtoToLatex",
    "rationalFromIntDto",
    "rationalFromLatexDto",
    "rationalIsIntegerDto",
    "rationalIsMinusOneDto",
    "rationalIsOneDto",
    "rationalIsZeroDto",
    "rationalNewDto",
    "rationalNormalizeDto",
    "rationalNumerDto",
    "rationalParseDto",
    "rationalParseDtoFromLatex",
    "rationalSimplifiedDto",
    "rationalSimplifyDto",
    "rationalSimplifyDtoFromText",
    "rationalToLatexDto",
    "rationalTryNewDto",
    "rational_matrix_add",
    "rational_matrix_dto_add",
    "rational_matrix_dto_inverse",
    "rational_matrix_dto_mul",
    "rational_matrix_dto_rows",
    "rational_matrix_dto_transpose",
    "rational_matrix_dto_zeros",
    "rational_matrix_first",
    "rational_matrix_inverse",
    "rational_matrix_mul",
    "rational_matrix_rows",
    "rational_matrix_transpose",
    "rational_matrix_zeros",
    "symbolicComplexAddDto",
    "symbolicComplexConjDto",
    "symbolicComplexExpandDto",
    "symbolicComplexFormatDto",
    "symbolicComplexFormatDtoToLatex",
    "symbolicComplexFromLatexDto",
    "symbolicComplexFromRealDto",
    "symbolicComplexIDto",
    "symbolicComplexIsImagPureDto",
    "symbolicComplexIsRealDto",
    "symbolicComplexMulDto",
    "symbolicComplexNegDto",
    "symbolicComplexNewDto",
    "symbolicComplexParseDto",
    "symbolicComplexParseDtoFromLatex",
    "symbolicComplexSimplifyDto",
    "symbolicComplexSqrtRationalDto",
    "symbolicComplexSubDto",
    "symbolicComplexToLatexDto",
    "symbolicComplexZeroDto",
    "symbolicExprAddDto",
    "symbolicExprExpandDto",
    "symbolicExprFormatDto",
    "symbolicExprFormatDtoToLatex",
    "symbolicExprFromLatexDto",
    "symbolicExprIntDto",
    "symbolicExprMulDto",
    "symbolicExprParseDto",
    "symbolicExprParseDtoFromLatex",
    "symbolicExprPowDto",
    "symbolicExprRationalDto",
    "symbolicExprSimplifyDto",
    "symbolicExprSqrt2Dto",
    "symbolicExprSqrtDto",
    "symbolicExprSubstituteDto",
    "symbolicExprToLatexDto",
  ];
  for (const key of required) {
    if (!m[key]) throw new Error(`wasm-lib module is missing expected export: ${key}`);
  }
  setWasm(wasmLib as AlgebraicDtoModule);
}

function getWasm(): AlgebraicDtoModule {
  if (!wasm) {
    throw new Error("wasm module is not set. Call setWasmFromWasmLib() after wasm initialization.");
  }
  return wasm;
}


export function rationalCheckedAddDto(a_value: RationalDto, b_value: RationalDto) {
  return getWasm().rationalCheckedAddDto(a_value as any, b_value as any) as unknown as RationalDto;
}

export function rationalCheckedDivDto(a_value: RationalDto, b_value: RationalDto) {
  return getWasm().rationalCheckedDivDto(a_value as any, b_value as any) as unknown as RationalDto;
}

export function rationalCheckedMulDto(a_value: RationalDto, b_value: RationalDto) {
  return getWasm().rationalCheckedMulDto(a_value as any, b_value as any) as unknown as RationalDto;
}

export function rationalCreateDto(numer: number | string, denom: number | string) {
  return getWasm().rationalCreateDto(numer as any, denom as any) as unknown as RationalDto;
}

export function rationalDenomDto(self_value: RationalDto) {
  return getWasm().rationalDenomDto(self_value as any) as unknown as string;
}

export function rationalFormatDto(dto_value: RationalDto) {
  return getWasm().rationalFormatDto(dto_value as any) as unknown as string;
}

export function rationalFormatDtoToLatex(dto_value: RationalDto) {
  return getWasm().rationalFormatDtoToLatex(dto_value as any) as unknown as string;
}

export function rationalFromIntDto(n: number | string) {
  return getWasm().rationalFromIntDto(n as any) as unknown as RationalDto;
}

export function rationalFromLatexDto(latex: string) {
  return getWasm().rationalFromLatexDto(latex as any) as unknown as RationalDto;
}

export function rationalIsIntegerDto(dto_value: RationalDto) {
  return getWasm().rationalIsIntegerDto(dto_value as any) as unknown as boolean;
}

export function rationalIsMinusOneDto(dto_value: RationalDto) {
  return getWasm().rationalIsMinusOneDto(dto_value as any) as unknown as boolean;
}

export function rationalIsOneDto(dto_value: RationalDto) {
  return getWasm().rationalIsOneDto(dto_value as any) as unknown as boolean;
}

export function rationalIsZeroDto(dto_value: RationalDto) {
  return getWasm().rationalIsZeroDto(dto_value as any) as unknown as boolean;
}

export function rationalNewDto(numer: string, denom: string) {
  return getWasm().rationalNewDto(numer as any, denom as any) as unknown as RationalDto;
}

export function rationalNormalizeDto(dto_value: RationalDto) {
  return getWasm().rationalNormalizeDto(dto_value as any) as unknown as RationalDto;
}

export function rationalNumerDto(self_value: RationalDto) {
  return getWasm().rationalNumerDto(self_value as any) as unknown as string;
}

export function rationalParseDto(input: string) {
  return getWasm().rationalParseDto(input as any) as unknown as RationalDto;
}

export function rationalParseDtoFromLatex(latex: string) {
  return getWasm().rationalParseDtoFromLatex(latex as any) as unknown as RationalDto;
}

export function rationalSimplifiedDto(self_value: RationalDto) {
  return getWasm().rationalSimplifiedDto(self_value as any) as unknown as RationalDto;
}

export function rationalSimplifyDto(dto_value: RationalDto) {
  return getWasm().rationalSimplifyDto(dto_value as any) as unknown as RationalDto;
}

export function rationalSimplifyDtoFromText(input: string) {
  return getWasm().rationalSimplifyDtoFromText(input as any) as unknown as RationalDto;
}

export function rationalToLatexDto(dto_value: RationalDto) {
  return getWasm().rationalToLatexDto(dto_value as any) as unknown as string;
}

export function rationalTryNewDto(numer: number | string, denom: number | string) {
  return getWasm().rationalTryNewDto(numer as any, denom as any) as unknown as RationalDto;
}

export function rational_matrix_add(a: string, b: string) {
  return getWasm().rational_matrix_add(a as any, b as any) as unknown as string;
}

export function rational_matrix_dto_add(value_value: RationalDto, b_value: RationalDto) {
  return getWasm().rational_matrix_dto_add(value_value as any, b_value as any) as unknown as RationalDto;
}

export function rational_matrix_dto_inverse(value_value: RationalDto) {
  return getWasm().rational_matrix_dto_inverse(value_value as any) as unknown as RationalDto;
}

export function rational_matrix_dto_mul(value_value: RationalDto, b_value: RationalDto) {
  return getWasm().rational_matrix_dto_mul(value_value as any, b_value as any) as unknown as RationalDto;
}

export function rational_matrix_dto_rows(value_value: RationalDto) {
  return getWasm().rational_matrix_dto_rows(value_value as any) as unknown as number;
}

export function rational_matrix_dto_transpose(value_value: RationalDto) {
  return getWasm().rational_matrix_dto_transpose(value_value as any) as unknown as RationalDto;
}

export function rational_matrix_dto_zeros(rows: number, cols: number) {
  return getWasm().rational_matrix_dto_zeros(rows as any, cols as any) as unknown as RationalDto;
}

export function rational_matrix_first(a: string) {
  return getWasm().rational_matrix_first(a as any) as unknown as string;
}

export function rational_matrix_inverse(a: string) {
  return getWasm().rational_matrix_inverse(a as any) as unknown as string;
}

export function rational_matrix_mul(a: string, b: string) {
  return getWasm().rational_matrix_mul(a as any, b as any) as unknown as string;
}

export function rational_matrix_rows(a: string) {
  return getWasm().rational_matrix_rows(a as any) as unknown as number;
}

export function rational_matrix_transpose(a: string) {
  return getWasm().rational_matrix_transpose(a as any) as unknown as string;
}

export function rational_matrix_zeros(rows: number, cols: number) {
  return getWasm().rational_matrix_zeros(rows as any, cols as any) as unknown as string;
}

export function symbolicComplexAddDto(a_value: SymbolicComplexDto, b_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexAddDto(a_value as any, b_value as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexConjDto(self_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexConjDto(self_value as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexExpandDto(self_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexExpandDto(self_value as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexFormatDto(dto_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexFormatDto(dto_value as any) as unknown as string;
}

export function symbolicComplexFormatDtoToLatex(dto_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexFormatDtoToLatex(dto_value as any) as unknown as string;
}

export function symbolicComplexFromLatexDto(latex: string) {
  return getWasm().symbolicComplexFromLatexDto(latex as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexFromRealDto(re_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexFromRealDto(re_value as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexIDto() {
  return getWasm().symbolicComplexIDto() as unknown as SymbolicComplexDto;
}

export function symbolicComplexIsImagPureDto(dto_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexIsImagPureDto(dto_value as any) as unknown as boolean;
}

export function symbolicComplexIsRealDto(dto_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexIsRealDto(dto_value as any) as unknown as boolean;
}

export function symbolicComplexMulDto(a_value: SymbolicComplexDto, b_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexMulDto(a_value as any, b_value as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexNegDto(dto_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexNegDto(dto_value as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexNewDto(re_value: SymbolicComplexDto, im_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexNewDto(re_value as any, im_value as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexParseDto(input: string) {
  return getWasm().symbolicComplexParseDto(input as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexParseDtoFromLatex(latex: string) {
  return getWasm().symbolicComplexParseDtoFromLatex(latex as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexSimplifyDto(dto_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexSimplifyDto(dto_value as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexSqrtRationalDto(n: number | string, d: number | string) {
  return getWasm().symbolicComplexSqrtRationalDto(n as any, d as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexSubDto(a_value: SymbolicComplexDto, b_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexSubDto(a_value as any, b_value as any) as unknown as SymbolicComplexDto;
}

export function symbolicComplexToLatexDto(self_value: SymbolicComplexDto) {
  return getWasm().symbolicComplexToLatexDto(self_value as any) as unknown as string;
}

export function symbolicComplexZeroDto() {
  return getWasm().symbolicComplexZeroDto() as unknown as SymbolicComplexDto;
}

export function symbolicExprAddDto(terms_value: SymbolicExprDto[]) {
  return getWasm().symbolicExprAddDto(terms_value as any) as unknown as SymbolicExprDto;
}

export function symbolicExprExpandDto(self_value: SymbolicExprDto) {
  return getWasm().symbolicExprExpandDto(self_value as any) as unknown as SymbolicExprDto;
}

export function symbolicExprFormatDto(dto_value: SymbolicExprDto) {
  return getWasm().symbolicExprFormatDto(dto_value as any) as unknown as string;
}

export function symbolicExprFormatDtoToLatex(dto_value: SymbolicExprDto) {
  return getWasm().symbolicExprFormatDtoToLatex(dto_value as any) as unknown as string;
}

export function symbolicExprFromLatexDto(latex: string) {
  return getWasm().symbolicExprFromLatexDto(latex as any) as unknown as SymbolicExprDto;
}

export function symbolicExprIntDto(n: number | string) {
  return getWasm().symbolicExprIntDto(n as any) as unknown as SymbolicExprDto;
}

export function symbolicExprMulDto(factors_value: SymbolicExprDto[]) {
  return getWasm().symbolicExprMulDto(factors_value as any) as unknown as SymbolicExprDto;
}

export function symbolicExprParseDto(input: string) {
  return getWasm().symbolicExprParseDto(input as any) as unknown as SymbolicExprDto;
}

export function symbolicExprParseDtoFromLatex(latex: string) {
  return getWasm().symbolicExprParseDtoFromLatex(latex as any) as unknown as SymbolicExprDto;
}

export function symbolicExprPowDto(base_value: SymbolicExprDto, exp_value: SymbolicExprDto) {
  return getWasm().symbolicExprPowDto(base_value as any, exp_value as any) as unknown as SymbolicExprDto;
}

export function symbolicExprRationalDto(n: number | string, d: number | string) {
  return getWasm().symbolicExprRationalDto(n as any, d as any) as unknown as SymbolicExprDto;
}

export function symbolicExprSimplifyDto(dto_value: SymbolicExprDto) {
  return getWasm().symbolicExprSimplifyDto(dto_value as any) as unknown as SymbolicExprDto;
}

export function symbolicExprSqrt2Dto() {
  return getWasm().symbolicExprSqrt2Dto() as unknown as SymbolicExprDto;
}

export function symbolicExprSqrtDto(self_value: SymbolicExprDto) {
  return getWasm().symbolicExprSqrtDto(self_value as any) as unknown as SymbolicExprDto;
}

export function symbolicExprSubstituteDto(self_value: SymbolicExprDto, sym: string, val_value: SymbolicExprDto) {
  return getWasm().symbolicExprSubstituteDto(self_value as any, sym as any, val_value as any) as unknown as SymbolicExprDto;
}

export function symbolicExprToLatexDto(self_value: SymbolicExprDto) {
  return getWasm().symbolicExprToLatexDto(self_value as any) as unknown as string;
}

