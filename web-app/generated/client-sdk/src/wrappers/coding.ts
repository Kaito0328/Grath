/* eslint-disable */
/* tslint:disable */
// --- Auto-generated TypeScript Wrapper (wasm class bindings) ---

export type CodingModule = typeof import("wasm-lib");

let wasm: CodingModule | null = null;

export function setWasm(module: CodingModule) {
    wasm = module;
}

export function setWasmFromWasmLib(wasmLib: unknown) {
    setWasm(wasmLib as CodingModule);
}

function getWasm(): CodingModule {
    if (!wasm) {
        throw new Error("wasm module is not set for Coding. Call setWasmFromWasmLib() after wasm initialization.");
    }
    return wasm;
}

export type DtoPointDto =
  {
    x: number;
    y: number;
  };

export type DtoLabelDto =
  | { kind: "Origin" }
  | { kind: "Named"; name: string; }
;

type TypeApiWasmBindings = {
    dto_point_new(x: number, y: number): unknown;
    dto_point_translate(value: unknown, dx: number, dy: number): unknown;
    dto_point_batch(points: DtoPointDto[]): DtoPointDto[];
    dto_point_maybe(point: DtoPointDto | null): DtoPointDto | null;
    dto_point_pair(value: [DtoPointDto, number]): [DtoPointDto, number];
    dto_point_fixed(values: DtoPointDto[]): DtoPointDto[];
    dto_point_by_name(values: Record<string, DtoPointDto>): Record<string, DtoPointDto>;
    dto_point_label(value: DtoLabelDto): DtoLabelDto;
    dto_point_nested(point: DtoPointDto | null): DtoPointDto[] | null;
    dto_point_checked(value: unknown): unknown;
};

function getTypeApiWasm(): CodingModule & TypeApiWasmBindings {
    return getWasm() as CodingModule & TypeApiWasmBindings;
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

export class DtoPoint {
    private constructor(private readonly raw: DtoPointDto) {}

    static fromDto(value: DtoPointDto): DtoPoint {
        return new DtoPoint(value);
    }

    toDto(): DtoPointDto {
        return this.raw;
    }

    static new(x: number, y: number): DtoPoint {
        return DtoPoint.fromDto(normalizeDtoValue(getTypeApiWasm().dto_point_new(x, y)));
    }

    translate(dx: number, dy: number): DtoPoint {
        return DtoPoint.fromDto(normalizeDtoValue(getTypeApiWasm().dto_point_translate(this.raw, dx, dy)));
    }

    static batch(points: DtoPointDto[]): DtoPointDto[] {
        return normalizeDtoValue(getTypeApiWasm().dto_point_batch(points));
    }

    static maybe(point: DtoPointDto | null): DtoPointDto | null {
        return (normalizeDtoValue(getTypeApiWasm().dto_point_maybe(point)) ?? null) as DtoPointDto | null;
    }

    static pair(value: [DtoPointDto, number]): [DtoPointDto, number] {
        return normalizeDtoValue(getTypeApiWasm().dto_point_pair(value));
    }

    static fixed(values: DtoPointDto[]): DtoPointDto[] {
        return normalizeDtoValue(getTypeApiWasm().dto_point_fixed(values));
    }

    static byName(values: Record<string, DtoPointDto>): Record<string, DtoPointDto> {
        return normalizeDtoValue(getTypeApiWasm().dto_point_by_name(values));
    }

    static label(value: DtoLabelDto): DtoLabelDto {
        return normalizeDtoValue(getTypeApiWasm().dto_point_label(value));
    }

    static nested(point: DtoPointDto | null): DtoPointDto[] | null {
        return (normalizeDtoValue(getTypeApiWasm().dto_point_nested(point)) ?? null) as DtoPointDto[] | null;
    }

    checked(): DtoPoint {
        return DtoPoint.fromDto(normalizeDtoValue(getTypeApiWasm().dto_point_checked(this.raw)));
    }

}

export function hamming74Encode(bits4: string): string {
    return getWasm().WasmCodingApi.hamming74_encode(bits4);
}

export function hamming74EncodeLen(bits4: string): number {
    return getWasm().WasmCodingApi.hamming74_encode_len(bits4);
}

export function linearCodeGf5Third(u0: string, u1: string): string {
    return getWasm().WasmCodingApi.linear_code_gf5_third(u0, u1);
}

export function reedSolomonEncode(k: number, n: number, msg: Uint8Array, primitive_px: Uint8Array): Uint8Array {
    return getWasm().WasmCodingApi.reed_solomon_encode(k, n, msg, primitive_px);
}

export function reedSolomonDecodeBm(k: number, n: number, recv: Uint8Array, primitive_px: Uint8Array): Uint8Array {
    return getWasm().WasmCodingApi.reed_solomon_decode_bm(k, n, recv, primitive_px);
}

export function bchNewAutoJson(m: number, t: number): string {
    return getWasm().WasmCodingApi.bch_new_auto_json(m, t);
}

export function bchEncodeAuto(m: number, t: number, msg_bits: Uint8Array): Uint8Array {
    return getWasm().WasmCodingApi.bch_encode_auto(m, t, msg_bits);
}

export function bchDecodeBm(m: number, t: number, recv_bits: Uint8Array): Uint8Array {
    return getWasm().WasmCodingApi.bch_decode_bm(m, t, recv_bits);
}

export function bchNewJson(n: number, g_bits: Uint8Array): string {
    return getWasm().WasmCodingApi.bch_new_json(n, g_bits);
}

export function bchEncode(n: number, g_bits: Uint8Array, msg_bits: Uint8Array): Uint8Array {
    return getWasm().WasmCodingApi.bch_encode(n, g_bits, msg_bits);
}

export function bchDecodeBmWithG(n: number, g_bits: Uint8Array, recv_bits: Uint8Array): Uint8Array {
    return getWasm().WasmCodingApi.bch_decode_bm_with_g(n, g_bits, recv_bits);
}

export function cyclicNewJson(n: number, g_bits: Uint8Array): string {
    return getWasm().WasmCodingApi.cyclic_new_json(n, g_bits);
}

export function cyclicEncode(n: number, g_bits: Uint8Array, msg_bits: Uint8Array): Uint8Array {
    return getWasm().WasmCodingApi.cyclic_encode(n, g_bits, msg_bits);
}

export function cyclicDecodeLut(n: number, g_bits: Uint8Array, recv_bits: Uint8Array): Uint8Array {
    return getWasm().WasmCodingApi.cyclic_decode_lut(n, g_bits, recv_bits);
}

export function gf2CyclicGeneratorMatrix(n: number, g_bits: Uint8Array): string {
    return getWasm().WasmCodingApi.gf2_cyclic_generator_matrix(n, g_bits);
}

export function gf2CyclicParityCheckMatrix(n: number, g_bits: Uint8Array): string {
    return getWasm().WasmCodingApi.gf2_cyclic_parity_check_matrix(n, g_bits);
}

export function gf2ParityCheckFromGeneratorMatrix(g_csv: string): string {
    return getWasm().WasmCodingApi.gf2_parity_check_from_generator_matrix(g_csv);
}

export function gf2Syndrome(h_csv: string, r_bits: string): string {
    return getWasm().WasmCodingApi.gf2_syndrome(h_csv, r_bits);
}

