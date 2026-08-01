import type { RationalMatrixValueDto } from "@my-project/client-sdk";

type RationalValueInput = { numer: number; denom: number };

const gcdBigInt = (a: bigint, b: bigint): bigint => {
    let x = a < 0n ? -a : a;
    let y = b < 0n ? -b : b;
    while (y !== 0n) {
        const next = x % y;
        x = y;
        y = next;
    }
    return x;
};

export const numericTokenToRational = (raw: string): string | null => {
    const value = (raw ?? "").trim();
    if (!value) return "0/1";
    if (!/^-?\d+(?:\.\d+)?$/.test(value)) return null;

    const sign = value.startsWith("-") ? -1n : 1n;
    const unsigned = value.startsWith("-") ? value.slice(1) : value;
    const [integerPart = "0", decimalPart = ""] = unsigned.split(".");
    if (!decimalPart) return `${sign * BigInt(integerPart)}/1`;

    const denominator = 10n ** BigInt(decimalPart.length);
    const numerator = sign * (BigInt(integerPart) * denominator + BigInt(decimalPart));
    const divisor = gcdBigInt(numerator, denominator);
    return `${numerator / divisor}/${denominator / divisor}`;
};

/** Converts the existing cell editor's display notation into an exact DTO. */
export const rationalCellToDto = (raw: string): RationalValueInput | null => {
    const value = (raw ?? "").trim();
    const latex = value.match(/^(-?)\\frac\{(-?\d+)\}\{(-?\d+)\}$/);
    const fraction = value.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    const normalized = latex
        ? `${latex[1] === "-" ? -BigInt(latex[2]) : BigInt(latex[2])}/${latex[3]}`
        : fraction
            ? `${fraction[1]}/${fraction[2]}`
            : numericTokenToRational(value);
    if (!normalized) return null;

    const [numeratorToken, denominatorToken] = normalized.split("/");
    let numer = BigInt(numeratorToken);
    let denom = BigInt(denominatorToken);
    if (denom === 0n) return null;
    if (denom < 0n) {
        numer = -numer;
        denom = -denom;
    }

    const divisor = gcdBigInt(numer, denom);
    numer /= divisor;
    denom /= divisor;

    // JSON number is the portable input representation for the generated
    // wasm-bindgen DTO boundary. Preserve the legacy text API for larger ints.
    const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
    if (numer < -maxSafe || numer > maxSafe || denom > maxSafe) return null;
    return { numer: Number(numer), denom: Number(denom) };
};

export const rationalMatrixDtoFromCells = (data: string[][]): RationalMatrixValueDto | null => {
    const values = data.map(row => row.map(rationalCellToDto));
    if (values.some(row => row.some(value => value === null))) return null;
    return { values: values as RationalValueInput[][] };
};

/** Keeps the current result/save UI compatible while calculations use DTOs. */
export const rationalMatrixDtoToCsv = (matrix: RationalMatrixValueDto): string =>
    matrix.values
        .map(row => row.map(({ numer, denom }) => `${numer}/${denom}`).join(","))
        .join(";");
