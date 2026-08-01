/* eslint-disable */
// --- Auto-generated TS Tests (Api wrapper style) ---
import { describe, it, expect, beforeAll } from 'vitest';
import * as finiteField from '../wrappers/finiteField';

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

describe('finite-field wasm integration', () => {
  beforeAll(async () => {
    const wasm = await import('wasm-lib');
    finiteField.setWasmFromWasmLib(wasm);
  });

  describe('FiniteFieldApi::gfp5_inv', () => {
    it('case 1', () => {
      const arg0 = "2";
      const result = finiteField.gfp5Inv(arg0);
      expect(String(result)).toBe("3");
    });
  });

  describe('FiniteFieldApi::gf256_inv_check', () => {
    it('case 1', () => {
      const arg0 = "0x53";
      const result = finiteField.gf256InvCheck(arg0);
      expect(String(result)).toBe("true");
    });
  });

  describe('FiniteFieldApi::gfp5_mul', () => {
    it('case 1', () => {
      const arg0 = "2";
      const arg1 = "4";
      const result = finiteField.gfp5Mul(arg0, arg1);
      expect(String(result)).toBe("3");
    });
  });

  describe('FiniteFieldApi::gfp5_add', () => {
    it('case 1', () => {
      const arg0 = "3";
      const arg1 = "4";
      const result = finiteField.gfp5Add(arg0, arg1);
      expect(String(result)).toBe("2");
    });
  });

  describe('FiniteFieldApi::gf256_mul', () => {
    it('case 1', () => {
      const arg0 = "0x57";
      const arg1 = "0x83";
      const result = finiteField.gf256Mul(arg0, arg1);
      expect(String(result)).toBe("193");
    });
  });

});
