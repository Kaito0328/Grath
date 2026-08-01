/* eslint-disable */
// --- Auto-generated TS Tests (Api wrapper style) ---
import { describe, it, expect, beforeAll } from 'vitest';
import * as sourceCoding from '../wrappers/sourceCoding';

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

describe('source-coding wasm integration', () => {
  beforeAll(async () => {
    const wasm = await import('wasm-lib');
    sourceCoding.setWasmFromWasmLib(wasm);
  });

  describe('SourceCodingApi::arithmetic_roundtrip', () => {
    it('case 1', () => {
      const arg0 = "BANANA_BANDANA";
      const result = sourceCoding.arithmeticRoundtrip(arg0);
      expect(String(result)).toBe("true");
    });
  });

  describe('SourceCodingApi::huffman_roundtrip', () => {
    it('case 1', () => {
      const arg0 = "hello hello hello";
      const result = sourceCoding.huffmanRoundtrip(arg0);
      expect(String(result)).toBe("true");
    });
  });

  describe('SourceCodingApi::lz78_roundtrip', () => {
    it('case 1', () => {
      const arg0 = "abracadabra abracadabra";
      const result = sourceCoding.lz78Roundtrip(arg0);
      expect(String(result)).toBe("true");
    });
  });

});
