/* eslint-disable */
// --- Auto-generated TS Tests (Api wrapper style) ---
import { describe, it, expect, beforeAll } from 'vitest';
import * as linalg from '../wrappers/linalg';

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

describe('linalg wasm integration', () => {
  beforeAll(async () => {
    const wasm = await import('wasm-lib');
    linalg.setWasmFromWasmLib(wasm);
  });

  describe('RationalMatrixApi::add', () => {
    it('case 1', () => {
      const receiver = linalg.RationalMatrix.fromString("1/2,1/2;1/2,1/2");
      const arg1 = linalg.RationalMatrix.fromString("1/2,1/2;1/2,1/2");
      const result = receiver.add(arg1);
      expect(String(result)).toBe("1,1;1,1");
    });
  });

  describe('RationalMatrixApi::mul', () => {
    it('case 1', () => {
      const receiver = linalg.RationalMatrix.fromString("1,2;3,4");
      const arg1 = linalg.RationalMatrix.fromString("1,0;0,1");
      const result = receiver.mul(arg1);
      expect(String(result)).toBe("1,2;3,4");
    });
  });

  describe('RationalMatrixDtoApi::add', () => {
    it('case 1', () => {
      const receiver = linalg.RationalMatrixDto.fromDto({"values":[[{"numer":1,"denom":2},{"numer":1,"denom":2}],[{"numer":1,"denom":2},{"numer":1,"denom":2}]]});
      const arg1 = linalg.RationalMatrixDto.fromDto({"values":[[{"numer":1,"denom":2},{"numer":1,"denom":2}],[{"numer":1,"denom":2},{"numer":1,"denom":2}]]});
      const result = receiver.add(arg1);
      expect(normalizeJsonNumbers(result.toDto())).toEqual(normalizeJsonNumbers(JSON.parse("{\"values\":[[{\"numer\":1,\"denom\":1},{\"numer\":1,\"denom\":1}],[{\"numer\":1,\"denom\":1},{\"numer\":1,\"denom\":1}]]}")));
    });
  });

  describe('RationalMatrixApi::first', () => {
    it('case 1', () => {
      const receiver = linalg.RationalMatrix.fromString("1/2,2;3,4");
      const result = receiver.first();
      expect(String(result)).toBe("1/2");
    });
  });

  describe('LinalgApi::mul_symbolic', () => {
    it('case 1', () => {
      const arg0 = "a,b;c,d";
      const arg1 = "x,y;z,w";
      const result = linalg.mulSymbolic(arg0, arg1);
      expect(String(result)).toBe("ax + bz,ay + bw;cx + dz,cy + dw");
    });
  });

  describe('RationalMatrixApi::zeros', () => {
    it('case 1', () => {
      const arg0 = 2;
      const arg1 = 3;
      const result = linalg.RationalMatrix.zeros(arg0, arg1);
      expect(String(result)).toBe("0,0,0;0,0,0");
    });
  });

  describe('LinalgApi::inverse_exact_symbolic', () => {
    it('case 1', () => {
      const arg0 = "a,b;c,d";
      const result = linalg.inverseExactSymbolic(arg0);
      expect(String(result)).toBe("-d(-ad + bc)^{-1},b(-ad + bc)^{-1};c(-ad + bc)^{-1},-a(-ad + bc)^{-1}");
    });
  });

  describe('RationalMatrixApi::rows', () => {
    it('case 1', () => {
      const receiver = linalg.RationalMatrix.fromString("1,2,3;4,5,6");
      const result = receiver.rows();
      expect(String(result)).toBe("2");
    });
  });

  describe('LinalgApi::add_rational', () => {
    it('case 1', () => {
      const arg0 = "1/2,1/2;1/2,1/2";
      const arg1 = "1/2,1/2;1/2,1/2";
      const result = linalg.addRational(arg0, arg1);
      expect(String(result)).toBe("1,1;1,1");
    });
  });

  describe('LinalgApi::lu_exact_symbolic', () => {
    it('case 1', () => {
      const arg0 = "a,b;c,d";
      const result = linalg.luExactSymbolic(arg0);
      expect(String(result)).toBe("1,0;ca^{-1},1|a,b;0,d + -bca^{-1}");
    });
  });

  describe('RationalMatrixApi::inverse', () => {
    it('case 1', () => {
      const receiver = linalg.RationalMatrix.fromString("1,2;3,4");
      const result = receiver.inverse();
      expect(String(result)).toBe("-2,1;3/2,-1/2");
    });
  });

  describe('LinalgApi::lu_exact_rational', () => {
    it('case 1', () => {
      const arg0 = "1,2;3,4";
      const result = linalg.luExactRational(arg0);
      expect(String(result)).toBe("1,0;3,1|1,2;0,-2");
    });
  });

  describe('RationalMatrixApi::transpose', () => {
    it('case 1', () => {
      const receiver = linalg.RationalMatrix.fromString("1,2;3,4");
      const result = receiver.transpose();
      expect(String(result)).toBe("1,3;2,4");
    });
  });

  describe('LinalgApi::mul_rational', () => {
    it('case 1', () => {
      const arg0 = "1,2;3,4";
      const arg1 = "1,0;0,1";
      const result = linalg.mulRational(arg0, arg1);
      expect(String(result)).toBe("1,2;3,4");
    });
  });

  describe('LinalgApi::add_symbolic', () => {
    it('case 1', () => {
      const arg0 = "a,b;c,d";
      const arg1 = "x,y;z,w";
      const result = linalg.addSymbolic(arg0, arg1);
      expect(String(result)).toBe("a + x,b + y;c + z,d + w");
    });
  });

  describe('LinalgApi::inverse_exact_rational', () => {
    it('case 1', () => {
      const arg0 = "1,2;3,4";
      const result = linalg.inverseExactRational(arg0);
      expect(String(result)).toBe("-2,1;3/2,-1/2");
    });
  });

  describe('RationalMatrixDtoApi::inverse', () => {
    it('case 1', () => {
      const receiver = linalg.RationalMatrixDto.fromDto({"values":[[{"numer":1,"denom":1},{"numer":2,"denom":1}],[{"numer":3,"denom":1},{"numer":4,"denom":1}]]});
      const result = receiver.inverse();
      expect(normalizeJsonNumbers(result.toDto())).toEqual(normalizeJsonNumbers(JSON.parse("{\"values\":[[{\"numer\":-2,\"denom\":1},{\"numer\":1,\"denom\":1}],[{\"numer\":3,\"denom\":2},{\"numer\":-1,\"denom\":2}]]}")));
    });
  });

  describe('RationalMatrixDtoApi::transpose', () => {
    it('case 1', () => {
      const receiver = linalg.RationalMatrixDto.fromDto({"values":[[{"numer":1,"denom":1},{"numer":2,"denom":1}],[{"numer":3,"denom":1},{"numer":4,"denom":1}]]});
      const result = receiver.transpose();
      expect(normalizeJsonNumbers(result.toDto())).toEqual(normalizeJsonNumbers(JSON.parse("{\"values\":[[{\"numer\":1,\"denom\":1},{\"numer\":3,\"denom\":1}],[{\"numer\":2,\"denom\":1},{\"numer\":4,\"denom\":1}]]}")));
    });
  });

});
