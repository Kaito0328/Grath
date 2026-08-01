/* eslint-disable */
/* tslint:disable */
// --- Auto-generated TypeScript Wrapper (wasm class bindings) ---

export type LinalgModule = typeof import("wasm-lib");

let wasm: LinalgModule | null = null;

export function setWasm(module: LinalgModule) {
    wasm = module;
}

export function setWasmFromWasmLib(wasmLib: unknown) {
    setWasm(wasmLib as LinalgModule);
}

function getWasm(): LinalgModule {
    if (!wasm) {
        throw new Error("wasm module is not set for Linalg. Call setWasmFromWasmLib() after wasm initialization.");
    }
    return wasm;
}

export type RationalValueDto =
  {
    numer: number | string;
    denom: number | string;
  };

export type RationalMatrixValueDto =
  {
    values: RationalValueDto[][];
  };

type TypeApiWasmBindings = {
    rational_matrix_zeros(rows: number, cols: number): string;
    rational_matrix_rows(value: string): number;
    rational_matrix_first(value: string): string;
    rational_matrix_inverse(value: string): string;
    rational_matrix_add(value: string, b: string): string;
    rational_matrix_mul(value: string, b: string): string;
    rational_matrix_transpose(value: string): string;
    rational_matrix_dto_zeros(rows: number, cols: number): unknown;
    rational_matrix_dto_rows(value: unknown): number;
    rational_matrix_dto_inverse(value: unknown): unknown;
    rational_matrix_dto_add(value: unknown, b: RationalMatrixValueDto): unknown;
    rational_matrix_dto_mul(value: unknown, b: RationalMatrixValueDto): unknown;
    rational_matrix_dto_transpose(value: unknown): unknown;
};

function getTypeApiWasm(): LinalgModule & TypeApiWasmBindings {
    return getWasm() as LinalgModule & TypeApiWasmBindings;
}

function normalizeDtoValue<T>(value: T): T {
    if (value instanceof Map) {
        return Object.fromEntries(Array.from(value.entries(), ([key, item]) => [String(key), normalizeDtoValue(item)])) as T;
    }
    if (Array.isArray(value)) {
        return value.map((item) => normalizeDtoValue(item)) as T;
    }
    if (value && typeof value === "object" && !ArrayBuffer.isView(value)) {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeDtoValue(item)])) as T;
    }
    return value;
}

export class RationalMatrix {
    private constructor(private readonly raw: string) {}

    static fromString(value: string): RationalMatrix {
        return new RationalMatrix(value);
    }

    toString(): string {
        return this.raw;
    }

    static zeros(rows: number, cols: number): RationalMatrix {
        return RationalMatrix.fromString(getTypeApiWasm().rational_matrix_zeros(rows, cols));
    }

    rows(): number {
        return getTypeApiWasm().rational_matrix_rows(this.raw);
    }

    first(): string {
        return getTypeApiWasm().rational_matrix_first(this.raw);
    }

    inverse(): RationalMatrix {
        return RationalMatrix.fromString(getTypeApiWasm().rational_matrix_inverse(this.raw));
    }

    add(b: RationalMatrix): RationalMatrix {
        return RationalMatrix.fromString(getTypeApiWasm().rational_matrix_add(this.raw, b.toString()));
    }

    mul(b: RationalMatrix): RationalMatrix {
        return RationalMatrix.fromString(getTypeApiWasm().rational_matrix_mul(this.raw, b.toString()));
    }

    transpose(): RationalMatrix {
        return RationalMatrix.fromString(getTypeApiWasm().rational_matrix_transpose(this.raw));
    }

}

export class RationalMatrixDto {
    private constructor(private readonly raw: RationalMatrixValueDto) {}

    static fromDto(value: RationalMatrixValueDto): RationalMatrixDto {
        return new RationalMatrixDto(value);
    }

    toDto(): RationalMatrixValueDto {
        return this.raw;
    }

    static zeros(rows: number, cols: number): RationalMatrixDto {
        return RationalMatrixDto.fromDto(normalizeDtoValue(getTypeApiWasm().rational_matrix_dto_zeros(rows, cols)));
    }

    rows(): number {
        return getTypeApiWasm().rational_matrix_dto_rows(this.raw);
    }

    inverse(): RationalMatrixDto {
        return RationalMatrixDto.fromDto(normalizeDtoValue(getTypeApiWasm().rational_matrix_dto_inverse(this.raw)));
    }

    add(b: RationalMatrixDto): RationalMatrixDto {
        return RationalMatrixDto.fromDto(normalizeDtoValue(getTypeApiWasm().rational_matrix_dto_add(this.raw, b.toDto())));
    }

    mul(b: RationalMatrixDto): RationalMatrixDto {
        return RationalMatrixDto.fromDto(normalizeDtoValue(getTypeApiWasm().rational_matrix_dto_mul(this.raw, b.toDto())));
    }

    transpose(): RationalMatrixDto {
        return RationalMatrixDto.fromDto(normalizeDtoValue(getTypeApiWasm().rational_matrix_dto_transpose(this.raw)));
    }

}

export function addNumeric(a: string, b: string): string {
    return getWasm().WasmLinalgApi.add_numeric(a, b);
}

export function addRational(a: string, b: string): string {
    return getWasm().WasmLinalgApi.add_rational(a, b);
}

export function addSymbolic(a: string, b: string): string {
    return getWasm().WasmLinalgApi.add_symbolic(a, b);
}

export function mulNumeric(a: string, b: string): string {
    return getWasm().WasmLinalgApi.mul_numeric(a, b);
}

export function mulRational(a: string, b: string): string {
    return getWasm().WasmLinalgApi.mul_rational(a, b);
}

export function mulSymbolic(a: string, b: string): string {
    return getWasm().WasmLinalgApi.mul_symbolic(a, b);
}

export function invNumeric(a: string): string {
    return getWasm().WasmLinalgApi.inv_numeric(a);
}

export function inverseExactRational(a: string): string {
    return getWasm().WasmLinalgApi.inverse_exact_rational(a);
}

export function inverseExactSymbolic(a: string): string {
    return getWasm().WasmLinalgApi.inverse_exact_symbolic(a);
}

export function invRational(a: string): string {
    return getWasm().WasmLinalgApi.inv_rational(a);
}

export function invSymbolic(a: string): string {
    return getWasm().WasmLinalgApi.inv_symbolic(a);
}

export function luNumeric(a: string): string {
    return getWasm().WasmLinalgApi.lu_numeric(a);
}

export function luExactRational(a: string): string {
    return getWasm().WasmLinalgApi.lu_exact_rational(a);
}

export function luExactSymbolic(a: string): string {
    return getWasm().WasmLinalgApi.lu_exact_symbolic(a);
}

export function luRational(a: string): string {
    return getWasm().WasmLinalgApi.lu_rational(a);
}

export function luSymbolic(a: string): string {
    return getWasm().WasmLinalgApi.lu_symbolic(a);
}

export function qrNumeric(a: string): string {
    return getWasm().WasmLinalgApi.qr_numeric(a);
}

export function qrRational(_a: string): string {
    return getWasm().WasmLinalgApi.qr_rational(_a);
}

export function qrSymbolic(a: string): string {
    return getWasm().WasmLinalgApi.qr_symbolic(a);
}

export function svdNumeric(a: string): string {
    return getWasm().WasmLinalgApi.svd_numeric(a);
}

export function svdRational(_a: string): string {
    return getWasm().WasmLinalgApi.svd_rational(_a);
}

export function svdSymbolic(a: string): string {
    return getWasm().WasmLinalgApi.svd_symbolic(a);
}

export function eigenvaluesNumeric(a: string): string {
    return getWasm().WasmLinalgApi.eigenvalues_numeric(a);
}

export function eigenvaluesRational(a: string): string {
    return getWasm().WasmLinalgApi.eigenvalues_rational(a);
}

export function eigenvaluesSymbolic(_a: string): string {
    return getWasm().WasmLinalgApi.eigenvalues_symbolic(_a);
}

export function mulVectorNumeric(a_csv: string, v_csv: string): string {
    return getWasm().WasmLinalgApi.mul_vector_numeric(a_csv, v_csv);
}

export function mulVectorRational(a_csv: string, v_csv: string): string {
    return getWasm().WasmLinalgApi.mul_vector_rational(a_csv, v_csv);
}

export function mulVectorSymbolic(a_csv: string, v_csv: string): string {
    return getWasm().WasmLinalgApi.mul_vector_symbolic(a_csv, v_csv);
}

export function solveVectorNumeric(a_csv: string, b_csv: string): string {
    return getWasm().WasmLinalgApi.solve_vector_numeric(a_csv, b_csv);
}

export function solveVectorRational(a_csv: string, b_csv: string): string {
    return getWasm().WasmLinalgApi.solve_vector_rational(a_csv, b_csv);
}

export function solveVectorSymbolic(a_csv: string, b_csv: string): string {
    return getWasm().WasmLinalgApi.solve_vector_symbolic(a_csv, b_csv);
}

export function mulSymbolicComplex(a: string, b: string): string {
    return getWasm().WasmLinalgApi.mul_symbolic_complex(a, b);
}

export function conjTransposeSymbolic(a: string): string {
    return getWasm().WasmLinalgApi.conj_transpose_symbolic(a);
}

