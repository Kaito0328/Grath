/* eslint-disable */
// --- Auto-generated TS Tests (Api wrapper style) ---
import { describe, it, expect, beforeAll } from 'vitest';
import * as concreteMath from '../wrappers/concreteMath';

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

describe('concrete-math wasm integration', () => {
  beforeAll(async () => {
    const wasm = await import('wasm-lib');
    concreteMath.setWasmFromWasmLib(wasm);
  });

  describe('ConcreteMathApi::nt_mod_inverse', () => {
    it('case 1', () => {
      const arg0 = 3;
      const arg1 = 11;
      const result = concreteMath.ntModInverse(arg0, arg1);
      expect(String(result)).toBe("4");
    });
  });

  describe('ConcreteMathApi::nt_phi', () => {
    it('case 1', () => {
      const arg0 = 36;
      const result = concreteMath.ntPhi(arg0);
      expect(String(result)).toBe("12");
    });
  });

  describe('ConcreteMathApi::nt_gcd', () => {
    it('case 1', () => {
      const arg0 = 48;
      const arg1 = 18;
      const result = concreteMath.ntGcd(arg0, arg1);
      expect(String(result)).toBe("6");
    });
  });

  describe('ConcreteMathApi::nt_lcm', () => {
    it('case 1', () => {
      const arg0 = 48;
      const arg1 = 18;
      const result = concreteMath.ntLcm(arg0, arg1);
      expect(String(result)).toBe("144");
    });
  });

  describe('ConcreteMathApi::nt_factorize', () => {
    it('case 1', () => {
      const arg0 = "84";
      const result = concreteMath.ntFactorize(arg0);
      expect(String(result)).toBe("{\\\"factors\\\":[{\\\"p\\\":\\\"2\\\",\\\"exp\\\":2},{\\\"p\\\":\\\"3\\\",\\\"exp\\\":1},{\\\"p\\\":\\\"7\\\",\\\"exp\\\":1}]}");
    });
  });

  describe('ConcreteMathApi::nt_mod_pow', () => {
    it('case 1', () => {
      const arg0 = 2;
      const arg1 = 10;
      const arg2 = 1000;
      const result = concreteMath.ntModPow(arg0, arg1, arg2);
      expect(String(result)).toBe("24");
    });
  });

  describe('ConcreteMathApi::nt_is_prime', () => {
    it('case 1', () => {
      const arg0 = "97";
      const result = concreteMath.ntIsPrime(arg0);
      expect(String(result)).toBe("true");
    });
  });

});
