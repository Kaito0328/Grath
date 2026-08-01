import { AlgebraicDtoApi } from "@my-project/client-sdk/api/algebraicDtoApi";
import {
  Rational as RationalClass,
  SymbolicComplex as SymbolicComplexClass,
  SymbolicExpr as SymbolicExprClass,
} from "@my-project/client-sdk/api/algebraicApi";

export type Rational = { numer: number; denom: number };
export type SymbolicExpr = { text: string };
export type SymbolicComplex = { text: string };

export type OutputTextLatex = { outputText: string; outputLatex: string };
export type SimplifyResult = OutputTextLatex & { inputLatex: string };

export type RationalBinaryOp = "add" | "mul" | "div";
export type SymbolicExprBinaryOp = "add" | "mul";
export type ComplexBinaryOp = "add" | "sub" | "mul";

function requireTrimmed(text: string, emptyMessage: string) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error(emptyMessage);
  return trimmed;
}

function requireSafeInteger(n: number, name: string) {
  if (!Number.isSafeInteger(n)) throw new Error(`${name} must be a safe integer`);
  return n;
}

function dtoIntToNumberSafe(value: string | number, name: string) {
  const text = String(value);
  let b: bigint;
  try {
    b = BigInt(text);
  } catch {
    throw new Error(`${name} is not an integer: ${text}`);
  }
  const n = Number(b);
  if (!Number.isSafeInteger(n)) throw new Error(`${name} is out of JS safe integer range`);
  return n;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRational(input: unknown): input is Rational {
  if (!isRecord(input)) return false;
  return typeof input.numer === "number" && typeof input.denom === "number";
}

function isSymbolicExpr(input: unknown): input is SymbolicExpr {
  if (!isRecord(input)) return false;
  return typeof input.text === "string";
}

function isSymbolicComplex(input: unknown): input is SymbolicComplex {
  if (!isRecord(input)) return false;
  return typeof input.text === "string";
}

export function formatRational(r: Rational) {
  const numer = requireSafeInteger(r.numer, "numer");
  const denom = requireSafeInteger(r.denom, "denom");
  if (denom === 0) throw new Error("denom must not be 0");
  return `${numer}/${denom}`;
}

export function formatSymbolicExpr(expr: SymbolicExpr) {
  return requireTrimmed(expr.text, "Empty expression");
}

export function formatSymbolicComplex(z: SymbolicComplex) {
  return requireTrimmed(z.text, "Empty complex");
}

export async function parseRational(text: string): Promise<Rational> {
  const api = new AlgebraicDtoApi();
  const dto = await api.parseRationalDto(requireTrimmed(text, "Empty rational"));
  return {
    numer: dtoIntToNumberSafe(dto.numer, "numer"),
    denom: dtoIntToNumberSafe(dto.denom, "denom"),
  };
}

export async function parseRationalFromLatex(latex: string): Promise<Rational> {
  const api = new AlgebraicDtoApi();
  const dto = await api.parseRationalDtoFromLatex(requireTrimmed(latex, "Empty latex"));
  return {
    numer: dtoIntToNumberSafe(dto.numer, "numer"),
    denom: dtoIntToNumberSafe(dto.denom, "denom"),
  };
}

export async function rationalToLatex(text: string): Promise<string>;
export async function rationalToLatex(r: Rational): Promise<string>;
export async function rationalToLatex(input: string | Rational): Promise<string> {
  if (typeof input === "string") {
    const api = new AlgebraicDtoApi();
    const dto = await api.parseRationalDto(requireTrimmed(input, "Empty rational"));
    return await api.formatRationalDtoToLatex(dto);
  }

  const r = input;
  const numer = requireSafeInteger(r.numer, "numer");
  const denom = requireSafeInteger(r.denom, "denom");
  const obj = await RationalClass.tryNew(numer, denom);
  return await obj.toLatex();
}

export async function simplifyRational(text: string): Promise<OutputTextLatex>;
export async function simplifyRational(r: Rational): Promise<OutputTextLatex>;
export async function simplifyRational(input: string | Rational): Promise<OutputTextLatex> {
  if (typeof input === "string") {
    const api = new AlgebraicDtoApi();
    const dto = await api.rationalSimplifyDtoFromText(requireTrimmed(input, "Empty rational"));
    return {
      outputText: await api.formatRationalDto(dto),
      outputLatex: await api.formatRationalDtoToLatex(dto),
    };
  }

  const r = input;
  const numer = requireSafeInteger(r.numer, "numer");
  const denom = requireSafeInteger(r.denom, "denom");
  const obj = await RationalClass.tryNew(numer, denom);
  const simplified = await obj.simplify();
  return {
    outputText: simplified.toString(),
    outputLatex: await simplified.toLatex(),
  };
}

export async function rationalBinaryOp(op: RationalBinaryOp, aText: string, bText: string): Promise<OutputTextLatex>;
export async function rationalBinaryOp(op: RationalBinaryOp, a: Rational, b: Rational): Promise<OutputTextLatex>;
export async function rationalBinaryOp(
  op: RationalBinaryOp,
  aIn: string | Rational,
  bIn: string | Rational,
): Promise<OutputTextLatex> {
  const a = typeof aIn === "string" ? await parseRational(aIn) : aIn;
  const b = typeof bIn === "string" ? await parseRational(bIn) : bIn;

  const aa = await RationalClass.tryNew(requireSafeInteger(a.numer, "numer"), requireSafeInteger(a.denom, "denom"));
  const bb = await RationalClass.tryNew(requireSafeInteger(b.numer, "numer"), requireSafeInteger(b.denom, "denom"));

  const out =
    op === "add"
      ? await aa.checkedAdd(bb)
      : op === "mul"
        ? await aa.checkedMul(bb)
        : await aa.checkedDiv(bb);

  return {
    outputText: out.toString(),
    outputLatex: await out.toLatex(),
  };
}

export async function parseSymbolicExpr(text: string): Promise<SymbolicExpr> {
  const expr = await SymbolicExprClass.fromString(requireTrimmed(text, "Empty expression"));
  return { text: expr.toString() };
}

export async function parseSymbolicExprFromLatex(latex: string): Promise<SymbolicExpr> {
  const expr = await SymbolicExprClass.fromLatex(requireTrimmed(latex, "Empty latex"));
  return { text: expr.toString() };
}

export async function symbolicExprToLatex(text: string): Promise<string>;
export async function symbolicExprToLatex(expr: SymbolicExpr): Promise<string>;
export async function symbolicExprToLatex(input: string | SymbolicExpr): Promise<string> {
  const text = typeof input === "string" ? input : input.text;
  const expr = await SymbolicExprClass.fromString(requireTrimmed(text, "Empty expression"));
  return await expr.toLatex();
}

export async function simplifySymbolicExpr(exprText: string): Promise<SimplifyResult>;
export async function simplifySymbolicExpr(expr: SymbolicExpr): Promise<SimplifyResult>;
export async function simplifySymbolicExpr(input: string | SymbolicExpr): Promise<SimplifyResult> {
  const text = typeof input === "string" ? input : input.text;
  const expr = await SymbolicExprClass.fromString(requireTrimmed(text, "Empty expression"));
  const inputLatex = await expr.toLatex();
  const simplified = await expr.simplify();
  return {
    inputLatex,
    outputText: simplified.toString(),
    outputLatex: await simplified.toLatex(),
  };
}

export async function symbolicExprBinaryOp(
  op: SymbolicExprBinaryOp,
  aText: string,
  bText: string,
): Promise<OutputTextLatex>;
export async function symbolicExprBinaryOp(
  op: SymbolicExprBinaryOp,
  a: SymbolicExpr,
  b: SymbolicExpr,
): Promise<OutputTextLatex>;
export async function symbolicExprBinaryOp(
  op: SymbolicExprBinaryOp,
  aIn: string | SymbolicExpr,
  bIn: string | SymbolicExpr,
): Promise<OutputTextLatex> {
  const aText = typeof aIn === "string" ? aIn : aIn.text;
  const bText = typeof bIn === "string" ? bIn : bIn.text;

  const a = await SymbolicExprClass.fromString(requireTrimmed(aText, "Empty expression"));
  const b = await SymbolicExprClass.fromString(requireTrimmed(bText, "Empty expression"));

  const out = op === "add" ? await SymbolicExprClass.add([a, b]) : await SymbolicExprClass.mul([a, b]);
  return {
    outputText: out.toString(),
    outputLatex: await out.toLatex(),
  };
}

export async function parseSymbolicComplex(text: string): Promise<SymbolicComplex> {
  const z = await SymbolicComplexClass.fromString(requireTrimmed(text, "Empty complex"));
  return { text: z.toString() };
}

export async function parseSymbolicComplexFromLatex(latex: string): Promise<SymbolicComplex> {
  const z = await SymbolicComplexClass.fromLatex(requireTrimmed(latex, "Empty latex"));
  return { text: z.toString() };
}

export async function symbolicComplexToLatex(text: string): Promise<string>;
export async function symbolicComplexToLatex(z: SymbolicComplex): Promise<string>;
export async function symbolicComplexToLatex(input: string | SymbolicComplex): Promise<string> {
  const text = typeof input === "string" ? input : input.text;
  const z = await SymbolicComplexClass.fromString(requireTrimmed(text, "Empty complex"));
  return await z.toLatex();
}

export async function complexBinaryOp(op: ComplexBinaryOp, aText: string, bText: string): Promise<OutputTextLatex>;
export async function complexBinaryOp(op: ComplexBinaryOp, a: SymbolicComplex, b: SymbolicComplex): Promise<OutputTextLatex>;
export async function complexBinaryOp(
  op: ComplexBinaryOp,
  aIn: string | SymbolicComplex,
  bIn: string | SymbolicComplex,
): Promise<OutputTextLatex> {
  const aText = typeof aIn === "string" ? aIn : aIn.text;
  const bText = typeof bIn === "string" ? bIn : bIn.text;

  const a = await SymbolicComplexClass.fromString(requireTrimmed(aText, "Empty complex"));
  const b = await SymbolicComplexClass.fromString(requireTrimmed(bText, "Empty complex"));

  const out = op === "add" ? await a.add(b) : op === "sub" ? await a.sub(b) : await a.mul(b);
  return {
    outputText: out.toString(),
    outputLatex: await out.toLatex(),
  };
}

export function isAlgebraicValue(value: unknown): value is Rational | SymbolicExpr | SymbolicComplex {
  return isRational(value) || isSymbolicExpr(value) || isSymbolicComplex(value);
}
