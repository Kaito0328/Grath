/* eslint-disable */
// --- Auto-generated TS Tests (Api wrapper style) ---
import { describe, it, expect, beforeAll } from 'vitest';
import * as coding from '../wrappers/coding';

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

describe('coding wasm integration', () => {
  beforeAll(async () => {
    const wasm = await import('wasm-lib');
    coding.setWasmFromWasmLib(wasm);
  });

  describe('CodingApi::hamming74_encode_len', () => {
    it('case 1', () => {
      const arg0 = "1,0,1,1";
      const result = coding.hamming74EncodeLen(arg0);
      expect(String(result)).toBe("7");
    });
  });

  describe('CodingApi::linear_code_gf5_third', () => {
    it('case 1', () => {
      const arg0 = "0";
      const arg1 = "1";
      const result = coding.linearCodeGf5Third(arg0, arg1);
      expect(String(result)).toBe("3");
    });
  });

  describe('DtoFixtureApi::batch', () => {
    it('case 1', () => {
      const arg0 = [{"x":1.0,"y":2.0},{"x":-3.0,"y":4.5}];
      const result = coding.DtoPoint.batch(arg0);
      expect(normalizeJsonNumbers(result)).toEqual(normalizeJsonNumbers(JSON.parse("[{\"x\":1.0,\"y\":2.0},{\"x\":-3.0,\"y\":4.5}]")));
    });
  });

  describe('DtoFixtureApi::by_name', () => {
    it('case 1', () => {
      const arg0 = {"origin":{"x":0.0,"y":0.0}};
      const result = coding.DtoPoint.byName(arg0);
      expect(normalizeJsonNumbers(result)).toEqual(normalizeJsonNumbers(JSON.parse("{\"origin\":{\"x\":0.0,\"y\":0.0}}")));
    });
  });

  describe('DtoFixtureApi::checked', () => {
    it('case 1', () => {
      const receiver = coding.DtoPoint.fromDto({"x":-1.0,"y":2.0});
      let caught: unknown;
      try {
        receiver.checked();
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeDefined();
      expect(String(caught)).toContain("InvalidParameters");
      expect(String(caught)).toContain("point coordinates must be finite and non-negative");
    });
  });

  describe('DtoFixtureApi::fixed', () => {
    it('case 1', () => {
      const arg0 = [{"x":1.0,"y":2.0},{"x":3.0,"y":4.0}];
      const result = coding.DtoPoint.fixed(arg0);
      expect(normalizeJsonNumbers(result)).toEqual(normalizeJsonNumbers(JSON.parse("[{\"x\":1.0,\"y\":2.0},{\"x\":3.0,\"y\":4.0}]")));
    });
  });

  describe('DtoFixtureApi::label', () => {
    it('case 1', () => {
      const arg0 = {"kind":"Named","name":"fixture"};
      const result = coding.DtoPoint.label(arg0);
      expect(normalizeJsonNumbers(result)).toEqual(normalizeJsonNumbers(JSON.parse("{\"kind\":\"Named\",\"name\":\"fixture\"}")));
    });
  });

  describe('DtoFixtureApi::maybe', () => {
    it('case 1', () => {
      const arg0 = null;
      const result = coding.DtoPoint.maybe(arg0);
      expect(normalizeJsonNumbers(result)).toEqual(normalizeJsonNumbers(JSON.parse("null")));
    });
  });

  describe('DtoFixtureApi::nested', () => {
    it('case 1', () => {
      const arg0 = {"x":5.0,"y":8.0};
      const result = coding.DtoPoint.nested(arg0);
      expect(normalizeJsonNumbers(result)).toEqual(normalizeJsonNumbers(JSON.parse("[{\"x\":5.0,\"y\":8.0}]")));
    });
  });

  describe('DtoFixtureApi::pair', () => {
    it('case 1', () => {
      const arg0 = [{"x":1.0,"y":2.0},7];
      const result = coding.DtoPoint.pair(arg0);
      expect(normalizeJsonNumbers(result)).toEqual(normalizeJsonNumbers(JSON.parse("[{\"x\":1.0,\"y\":2.0},7]")));
    });
  });

});
