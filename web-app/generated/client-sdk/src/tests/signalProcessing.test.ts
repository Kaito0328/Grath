/* eslint-disable */
// --- Auto-generated TS Tests (Api wrapper style) ---
import { describe, it, expect, beforeAll } from 'vitest';
import * as signalProcessing from '../wrappers/signalProcessing';

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

describe('signal-processing wasm integration', () => {
  beforeAll(async () => {
    const wasm = await import('wasm-lib');
    signalProcessing.setWasmFromWasmLib(wasm);
  });

  describe('SignalProcessingApi::expand', () => {
    it('case 1', () => {
      const arg0 = new Float64Array([1, 2, 3]);
      const arg1 = 2;
      const result = signalProcessing.expand(arg0, arg1);
      const out = Array.from(result as any).join(',');
      expect(out).toBe("1,0,2,0,3,0");
    });
  });

  describe('SignalProcessingApi::conv_simple_f64', () => {
    it('case 1', () => {
      const arg0 = new Float64Array([1, 2, 3]);
      const arg1 = new Float64Array([4, 5]);
      const result = signalProcessing.convSimpleF64(arg0, arg1);
      const out = Array.from(result as any).join(',');
      expect(out).toBe("4,13,22,15");
    });
  });

  describe('SignalProcessingApi::decimate', () => {
    it('case 1', () => {
      const arg0 = new Float64Array([1, 2, 3, 4, 5, 6]);
      const arg1 = 2;
      const result = signalProcessing.decimate(arg0, arg1);
      const out = Array.from(result as any).join(',');
      expect(out).toBe("1,3,5");
    });
  });

});
