import { describe, expect, it } from "vitest";
import {
    rationalCellToDto,
    rationalMatrixDtoFromCells,
    rationalMatrixDtoToCsv,
} from "../../features/linalg/model/rationalMatrixDto";

describe("rational matrix DTO adapter", () => {
    it("converts all supported editor notations to normalized exact values", () => {
        expect(rationalCellToDto(" 6/-8 ")).toEqual({ numer: -3, denom: 4 });
        expect(rationalCellToDto("-\\frac{-1}{2}")).toEqual({ numer: 1, denom: 2 });
        expect(rationalCellToDto("0.125")).toEqual({ numer: 1, denom: 8 });
        expect(rationalCellToDto("")).toEqual({ numer: 0, denom: 1 });
    });

    it("rejects invalid values and keeps the result presentation compatible", () => {
        expect(rationalCellToDto("1/0")).toBeNull();
        expect(rationalMatrixDtoFromCells([["1/2", "x"]])).toBeNull();
        expect(rationalMatrixDtoToCsv({
            values: [[{ numer: -3, denom: 4 }, { numer: 1, denom: 1 }]],
        })).toBe("-3/4,1/1");
    });
});
