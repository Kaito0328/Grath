/* eslint-disable */
// --- Auto-generated TS Tests (Api wrapper style) ---
import { describe, it, expect, beforeAll } from 'vitest';
import * as polynomial from '../wrappers/polynomial';

function normalizeJsonNumbers(value: unknown): unknown {
  if (typeof value === 'number') {
    return Number(value.toPrecision(15));
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

describe('polynomial wasm integration', () => {
  beforeAll(async () => {
    const wasm = await import('wasm-lib');
    polynomial.setWasmFromWasmLib(wasm);
  });

  describe('PolynomialApi::find_roots_symbolic_expr', () => {
    it('case 1', () => {
      const arg0 = "[c, b, a]";
      const result = polynomial.findRootsSymbolicExpr(arg0);
      expect(String(result)).toBe("a^{-1}(1/2(b^{2} + -4ac)^{1/2} + -1/2b),a^{-1}(-1/2(b^{2} + -4ac)^{1/2} + -1/2b)");
    });
    it('case 2', () => {
      const arg0 = "[1, 0, 1]";
      const result = polynomial.findRootsSymbolicExpr(arg0);
      expect(String(result)).toBe("1/2*-4^{1/2},-1/2*-4^{1/2}");
    });
  });

});
