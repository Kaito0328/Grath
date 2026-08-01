/* eslint-disable */
// --- Auto-generated TS Tests (DTO style) ---
import { describe, it, expect, beforeAll } from 'vitest';
import * as algebraic from '../wrappers/algebraic';

function normalizeJsonNumbers(value: unknown): unknown {
  if (typeof value === 'number') {
    return Number(value.toPrecision(12));
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonNumbers(item));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeJsonNumbers(item)])
    );
  }
  return value;
}

describe('algebraic wasm integration', () => {
  beforeAll(async () => {
    const wasm = await import('wasm-lib');
    algebraic.setWasmFromWasmLib(wasm);
  });

  describe('Rational::checked_add', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("1/2");
      const arg1 = algebraic.rationalParseDto("1/4");
      const result = algebraic.rationalCheckedAddDto(arg0, arg1);
      const formatted = algebraic.rationalFormatDto(result);
      expect(formatted).toBe("3/4");
    });
  });

  describe('Rational::checked_div', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("1/2");
      const arg1 = algebraic.rationalParseDto("1/4");
      const result = algebraic.rationalCheckedDivDto(arg0, arg1);
      const formatted = algebraic.rationalFormatDto(result);
      expect(formatted).toBe("2");
    });
  });

  describe('Rational::checked_mul', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("1/2");
      const arg1 = algebraic.rationalParseDto("2/3");
      const result = algebraic.rationalCheckedMulDto(arg0, arg1);
      const formatted = algebraic.rationalFormatDto(result);
      expect(formatted).toBe("1/3");
    });
  });

  describe('Rational::denom', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("3/4");
      const result = algebraic.rationalDenomDto(arg0);
      expect(String(result)).toBe("4");
    });
  });

  describe('Rational::from_int', () => {
    it('case 1', () => {
      const arg0 = 5n;
      const result = algebraic.rationalFromIntDto(arg0);
      const formatted = algebraic.rationalFormatDto(result);
      expect(formatted).toBe("5");
    });
  });

  describe('Rational::from_latex', () => {
    it('case 1', () => {
      const arg0 = "\\frac{1}{2}";
      const result = algebraic.rationalFromLatexDto(arg0);
      const formatted = algebraic.rationalFormatDto(result);
      expect(formatted).toBe("1/2");
    });
    it('case 2', () => {
      const arg0 = "$\\frac{-2}{4}$";
      const result = algebraic.rationalFromLatexDto(arg0);
      const formatted = algebraic.rationalFormatDto(result);
      expect(formatted).toBe("-1/2");
    });
  });

  describe('Rational::is_integer', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("4/2");
      const result = algebraic.rationalIsIntegerDto(arg0);
      expect(String(result)).toBe("true");
    });
  });

  describe('Rational::is_minus_one', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("-2/2");
      const result = algebraic.rationalIsMinusOneDto(arg0);
      expect(String(result)).toBe("true");
    });
  });

  describe('Rational::is_one', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("2/2");
      const result = algebraic.rationalIsOneDto(arg0);
      expect(String(result)).toBe("true");
    });
  });

  describe('Rational::is_zero', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("0");
      const result = algebraic.rationalIsZeroDto(arg0);
      expect(String(result)).toBe("true");
    });
  });

  describe('Rational::normalize', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("2/4");
      const result = algebraic.rationalNormalizeDto(arg0);
      // Void return type
    });
  });

  describe('Rational::numer', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("3/4");
      const result = algebraic.rationalNumerDto(arg0);
      expect(String(result)).toBe("3");
    });
  });

  describe('Rational::simplified', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("3/9");
      const result = algebraic.rationalSimplifiedDto(arg0);
      const formatted = algebraic.rationalFormatDto(result);
      expect(formatted).toBe("1/3");
    });
  });

  describe('Rational::to_latex', () => {
    it('case 1', () => {
      const arg0 = algebraic.rationalParseDto("-1/2");
      const result = algebraic.rationalToLatexDto(arg0);
      expect(String(result)).toBe("-\\frac{1}{2}");
    });
  });

  describe('SymbolicComplex::add', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicComplexParseDto("1 + i");
      const arg1 = algebraic.symbolicComplexParseDto("1 - i");
      const result = algebraic.symbolicComplexAddDto(arg0, arg1);
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("2");
    });
  });

  describe('SymbolicComplex::from_latex', () => {
    it('case 1', () => {
      const arg0 = "1 + i";
      const result = algebraic.symbolicComplexFromLatexDto(arg0);
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("1 + i");
    });
  });

  describe('SymbolicComplex::from_real', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicExprParseDto("5");
      const result = algebraic.symbolicComplexFromRealDto(arg0);
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("5");
    });
  });

  describe('SymbolicComplex::i', () => {
    it('case 1', () => {
      const result = algebraic.symbolicComplexIDto();
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("i");
    });
  });

  describe('SymbolicComplex::is_imag_pure', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicComplexParseDto("2*i");
      const result = algebraic.symbolicComplexIsImagPureDto(arg0);
      expect(String(result)).toBe("true");
    });
    it('case 2', () => {
      const arg0 = algebraic.symbolicComplexParseDto("2i");
      const result = algebraic.symbolicComplexIsImagPureDto(arg0);
      expect(String(result)).toBe("true");
    });
  });

  describe('SymbolicComplex::is_real', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicComplexParseDto("1+i");
      const result = algebraic.symbolicComplexIsRealDto(arg0);
      expect(String(result)).toBe("false");
    });
  });

  describe('SymbolicComplex::mul', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicComplexParseDto("i");
      const arg1 = algebraic.symbolicComplexParseDto("i");
      const result = algebraic.symbolicComplexMulDto(arg0, arg1);
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("-1");
    });
    it('case 2', () => {
      const arg0 = algebraic.symbolicComplexParseDto("1 + i");
      const arg1 = algebraic.symbolicComplexParseDto("1 - i");
      const result = algebraic.symbolicComplexMulDto(arg0, arg1);
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("2");
    });
  });

  describe('SymbolicComplex::neg', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicComplexParseDto("1 + i");
      const result = algebraic.symbolicComplexNegDto(arg0);
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("-1 - i");
    });
  });

  describe('SymbolicComplex::new', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicExprParseDto("1");
      const arg1 = algebraic.symbolicExprParseDto("2");
      const result = algebraic.symbolicComplexNewDto(arg0, arg1);
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("1 + 2i");
    });
  });

  describe('SymbolicComplex::sqrt_rational', () => {
    it('case 1', () => {
      const arg0 = -4n;
      const arg1 = 1n;
      const result = algebraic.symbolicComplexSqrtRationalDto(arg0, arg1);
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("2i");
    });
    it('case 2', () => {
      const arg0 = 4n;
      const arg1 = 1n;
      const result = algebraic.symbolicComplexSqrtRationalDto(arg0, arg1);
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("2");
    });
    it('case 3', () => {
      const arg0 = -1n;
      const arg1 = 1n;
      const result = algebraic.symbolicComplexSqrtRationalDto(arg0, arg1);
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("i");
    });
  });

  describe('SymbolicComplex::sub', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicComplexParseDto("1 + i");
      const arg1 = algebraic.symbolicComplexParseDto("1 - i");
      const result = algebraic.symbolicComplexSubDto(arg0, arg1);
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("2i");
    });
  });

  describe('SymbolicComplex::to_latex', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicComplexParseDto("1/2");
      const result = algebraic.symbolicComplexToLatexDto(arg0);
      expect(String(result)).toBe("\\frac{1}{2}");
    });
  });

  describe('SymbolicComplex::zero', () => {
    it('case 1', () => {
      const result = algebraic.symbolicComplexZeroDto();
      const formatted = algebraic.symbolicComplexFormatDto(result);
      expect(formatted).toBe("0");
    });
  });

  describe('SymbolicExpr::add', () => {
    it('case 1', () => {
      const arg0 = [algebraic.symbolicExprParseDto("1"), algebraic.symbolicExprParseDto("1/2")];
      const result = algebraic.symbolicExprAddDto(arg0);
      const formatted = algebraic.symbolicExprFormatDto(result);
      expect(formatted).toBe("3/2");
    });
  });

  describe('SymbolicExpr::from_latex', () => {
    it('case 1', () => {
      const arg0 = "2x";
      const result = algebraic.symbolicExprFromLatexDto(arg0);
      const formatted = algebraic.symbolicExprFormatDto(result);
      expect(formatted).toBe("2x");
    });
    it('case 2', () => {
      const arg0 = "\\frac{1}{2} + 1";
      const result = algebraic.symbolicExprFromLatexDto(arg0);
      const formatted = algebraic.symbolicExprFormatDto(result);
      expect(formatted).toBe("3/2");
    });
  });

  describe('SymbolicExpr::mul', () => {
    it('case 1', () => {
      const arg0 = [algebraic.symbolicExprParseDto("2"), algebraic.symbolicExprParseDto("3")];
      const result = algebraic.symbolicExprMulDto(arg0);
      const formatted = algebraic.symbolicExprFormatDto(result);
      expect(formatted).toBe("6");
    });
  });

  describe('SymbolicExpr::pow', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicExprParseDto("2");
      const arg1 = algebraic.symbolicExprParseDto("3");
      const result = algebraic.symbolicExprPowDto(arg0, arg1);
      const formatted = algebraic.symbolicExprFormatDto(result);
      expect(formatted).toBe("8");
    });
    it('case 2', () => {
      const arg0 = algebraic.symbolicExprParseDto("2");
      const arg1 = algebraic.symbolicExprParseDto("-1");
      const result = algebraic.symbolicExprPowDto(arg0, arg1);
      const formatted = algebraic.symbolicExprFormatDto(result);
      expect(formatted).toBe("1/2");
    });
  });

  describe('SymbolicExpr::simplify', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicExprParseDto("1 + 1");
      const result = algebraic.symbolicExprSimplifyDto(arg0);
      const formatted = algebraic.symbolicExprFormatDto(result);
      expect(formatted).toBe("2");
    });
  });

  describe('SymbolicExpr::to_latex', () => {
    it('case 1', () => {
      const arg0 = algebraic.symbolicExprParseDto("-1*b*(1+b)");
      const result = algebraic.symbolicExprToLatexDto(arg0);
      expect(String(result)).toBe("b(-1-b)");
    });
  });

});
