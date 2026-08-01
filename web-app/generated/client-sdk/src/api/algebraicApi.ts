/* eslint-disable */
/* tslint:disable */
// --- Auto-generated: client-sdk API classes (algebraic) ---

import * as W from "../wrappers/algebraic";
import { requireTrimmed, withReady } from "./runtime";

// DTOs (serializable shapes). The classes below store these DTOs internally.

export type SymbolicComplexDTO = W.SymbolicComplexDto;

export type SymbolicExprDTO = W.SymbolicExprDto;

export type RationalDTO = W.RationalDto;


// Shared helpers
function requireSafeInteger(n: number, name: string) {
  if (!Number.isSafeInteger(n)) throw new Error(`${name} must be a safe integer`);
  return String(Math.floor(n));
}


export class SymbolicComplex {
  private readonly _dto: SymbolicComplexDTO;

  private constructor(dto: SymbolicComplexDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: SymbolicComplexDTO) {
    return new SymbolicComplex(dto);
  }

  toDTO(): SymbolicComplexDTO {
    return this._dto;
  }

  toString(): string {

    return W.symbolicComplexFormatDto(this._dto);

  }


  static async fromLatex(latex: string): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexFromLatexDto(latex);
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  static async fromReal(re_value: SymbolicComplex): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexFromRealDto(re_value.toDTO());
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  static async i(): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexIDto();
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  static async new(re_value: SymbolicComplex, im_value: SymbolicComplex): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexNewDto(re_value.toDTO(), im_value.toDTO());
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  static async fromString(input: string): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexParseDto(input);
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  static async parseFromLatex(latex: string): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexParseDtoFromLatex(latex);
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  static async sqrtRational(n: number, d: number): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexSqrtRationalDto(requireSafeInteger(n, "n"), requireSafeInteger(d, "d"));
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  static async zero(): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexZeroDto();
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }



  async add(b_value: SymbolicComplex): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexAddDto(this._dto, b_value.toDTO());
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  async conj(): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexConjDto(this._dto);
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  async expand(): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexExpandDto(this._dto);
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  async formatToLatex(): Promise<string> {
    return await withReady(() => {
      const out = W.symbolicComplexFormatDtoToLatex(this._dto);
    return out;
    });
  }

  async isImagPure(): Promise<boolean> {
    return await withReady(() => {
      const out = W.symbolicComplexIsImagPureDto(this._dto);
    return out;
    });
  }

  async isReal(): Promise<boolean> {
    return await withReady(() => {
      const out = W.symbolicComplexIsRealDto(this._dto);
    return out;
    });
  }

  async mul(b_value: SymbolicComplex): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexMulDto(this._dto, b_value.toDTO());
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  async neg(): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexNegDto(this._dto);
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  async simplify(): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexSimplifyDto(this._dto);
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  async sub(b_value: SymbolicComplex): Promise<SymbolicComplex> {
    return await withReady(() => {
      const out = W.symbolicComplexSubDto(this._dto, b_value.toDTO());
    return new SymbolicComplex(out as SymbolicComplexDTO);
    });
  }

  async toLatex(): Promise<string> {
    return await withReady(() => {
      const out = W.symbolicComplexToLatexDto(this._dto);
    return out;
    });
  }

}

export class SymbolicExpr {
  private readonly _dto: SymbolicExprDTO;

  private constructor(dto: SymbolicExprDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: SymbolicExprDTO) {
    return new SymbolicExpr(dto);
  }

  toDTO(): SymbolicExprDTO {
    return this._dto;
  }

  toString(): string {

    return W.symbolicExprFormatDto(this._dto);

  }


  static async add(terms_value: SymbolicExpr[]): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprAddDto(terms_value.map((x) => x.toDTO()));
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  static async fromLatex(latex: string): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprFromLatexDto(latex);
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  static async int(n: number): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprIntDto(requireSafeInteger(n, "n"));
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  static async mul(factors_value: SymbolicExpr[]): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprMulDto(factors_value.map((x) => x.toDTO()));
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  static async fromString(input: string): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprParseDto(input);
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  static async parseFromLatex(latex: string): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprParseDtoFromLatex(latex);
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  static async rational(n: number, d: number): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprRationalDto(requireSafeInteger(n, "n"), requireSafeInteger(d, "d"));
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  static async sqrt2(): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprSqrt2Dto();
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }



  async expand(): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprExpandDto(this._dto);
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  async formatToLatex(): Promise<string> {
    return await withReady(() => {
      const out = W.symbolicExprFormatDtoToLatex(this._dto);
    return out;
    });
  }

  async pow(exp_value: SymbolicExpr): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprPowDto(this._dto, exp_value.toDTO());
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  async simplify(): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprSimplifyDto(this._dto);
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  async sqrt(): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprSqrtDto(this._dto);
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  async substitute(sym: string, val_value: SymbolicExpr): Promise<SymbolicExpr> {
    return await withReady(() => {
      const out = W.symbolicExprSubstituteDto(this._dto, sym, val_value.toDTO());
    return new SymbolicExpr(out as SymbolicExprDTO);
    });
  }

  async toLatex(): Promise<string> {
    return await withReady(() => {
      const out = W.symbolicExprToLatexDto(this._dto);
    return out;
    });
  }

}

export class Rational {
  private readonly _dto: RationalDTO;

  private constructor(dto: RationalDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: RationalDTO) {
    return new Rational(dto);
  }

  toDTO(): RationalDTO {
    return this._dto;
  }

  toString(): string {

    return W.rationalFormatDto(this._dto);

  }


  static async create(numer: number, denom: number): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalCreateDto(requireSafeInteger(numer, "numer"), requireSafeInteger(denom, "denom"));
    return new Rational(out as RationalDTO);
    });
  }

  static async fromInt(n: number): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalFromIntDto(requireSafeInteger(n, "n"));
    return new Rational(out as RationalDTO);
    });
  }

  static async fromLatex(latex: string): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalFromLatexDto(latex);
    return new Rational(out as RationalDTO);
    });
  }

  static async new(numer: string, denom: string): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalNewDto(numer, denom);
    return new Rational(out as RationalDTO);
    });
  }

  static async fromString(input: string): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalParseDto(input);
    return new Rational(out as RationalDTO);
    });
  }

  static async parseFromLatex(latex: string): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalParseDtoFromLatex(latex);
    return new Rational(out as RationalDTO);
    });
  }

  static async simplifyFromText(input: string): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalSimplifyDtoFromText(input);
    return new Rational(out as RationalDTO);
    });
  }

  static async tryNew(numer: number, denom: number): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalTryNewDto(requireSafeInteger(numer, "numer"), requireSafeInteger(denom, "denom"));
    return new Rational(out as RationalDTO);
    });
  }



  async checkedAdd(b_value: Rational): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalCheckedAddDto(this._dto, b_value.toDTO());
    return new Rational(out as RationalDTO);
    });
  }

  async checkedDiv(b_value: Rational): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalCheckedDivDto(this._dto, b_value.toDTO());
    return new Rational(out as RationalDTO);
    });
  }

  async checkedMul(b_value: Rational): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalCheckedMulDto(this._dto, b_value.toDTO());
    return new Rational(out as RationalDTO);
    });
  }

  async denom(): Promise<string> {
    return await withReady(() => {
      const out = W.rationalDenomDto(this._dto);
    return out;
    });
  }

  async formatToLatex(): Promise<string> {
    return await withReady(() => {
      const out = W.rationalFormatDtoToLatex(this._dto);
    return out;
    });
  }

  async isInteger(): Promise<boolean> {
    return await withReady(() => {
      const out = W.rationalIsIntegerDto(this._dto);
    return out;
    });
  }

  async isMinusOne(): Promise<boolean> {
    return await withReady(() => {
      const out = W.rationalIsMinusOneDto(this._dto);
    return out;
    });
  }

  async isOne(): Promise<boolean> {
    return await withReady(() => {
      const out = W.rationalIsOneDto(this._dto);
    return out;
    });
  }

  async isZero(): Promise<boolean> {
    return await withReady(() => {
      const out = W.rationalIsZeroDto(this._dto);
    return out;
    });
  }

  async normalize(): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalNormalizeDto(this._dto);
    return new Rational(out as RationalDTO);
    });
  }

  async numer(): Promise<string> {
    return await withReady(() => {
      const out = W.rationalNumerDto(this._dto);
    return out;
    });
  }

  async simplified(): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalSimplifiedDto(this._dto);
    return new Rational(out as RationalDTO);
    });
  }

  async simplify(): Promise<Rational> {
    return await withReady(() => {
      const out = W.rationalSimplifyDto(this._dto);
    return new Rational(out as RationalDTO);
    });
  }

  async toLatex(): Promise<string> {
    return await withReady(() => {
      const out = W.rationalToLatexDto(this._dto);
    return out;
    });
  }

}

