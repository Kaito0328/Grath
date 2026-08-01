import * as W from "../wrappers/coding";
import { requireTrimmed, withReady } from "./runtime";

type BinaryCodeParams = {
	n: number;
	k: number;
	t?: number;
};

function parseParams<T extends BinaryCodeParams>(raw: string, name: string): T {
	try {
		return JSON.parse(raw) as T;
	} catch (error) {
		throw new Error(`${name} returned invalid JSON: ${String(error)}`);
	}
}

function normalizePrimitivePx(primitivePx?: Uint8Array): Uint8Array {
	return primitivePx && primitivePx.length > 0 ? primitivePx : new Uint8Array();
}

export class CodingApi {
	static async hamming74Encode(bits4: string): Promise<string> {
		return await withReady(() => W.hamming74Encode(requireTrimmed(bits4, "bits4 is empty")));
	}

	static async reedSolomonEncode(k: number, n: number, msg: Uint8Array, primitivePx?: Uint8Array): Promise<Uint8Array> {
		return await withReady(() => W.reedSolomonEncode(k, n, msg, normalizePrimitivePx(primitivePx)));
	}

	static async reedSolomonDecodeBM(k: number, n: number, recv: Uint8Array, primitivePx?: Uint8Array): Promise<Uint8Array> {
		return await withReady(() => W.reedSolomonDecodeBm(k, n, recv, normalizePrimitivePx(primitivePx)));
	}

	static async bchNewAuto(m: number, t: number): Promise<{ n: number; k: number; t: number }> {
		return await withReady(() => parseParams<{ n: number; k: number; t: number }>(W.bchNewAutoJson(m, t), "bchNewAuto"));
	}

	static async bchEncodeAuto(m: number, t: number, msgBits: Uint8Array): Promise<Uint8Array> {
		return await withReady(() => W.bchEncodeAuto(m, t, msgBits));
	}

	static async bchDecodeBM(m: number, t: number, recvBits: Uint8Array): Promise<Uint8Array> {
		return await withReady(() => W.bchDecodeBm(m, t, recvBits));
	}

	static async bchNew(n: number, g: Uint8Array): Promise<{ n: number; k: number; t: number }> {
		return await withReady(() => parseParams<{ n: number; k: number; t: number }>(W.bchNewJson(n, g), "bchNew"));
	}

	static async bchEncode(n: number, g: Uint8Array, msgBits: Uint8Array): Promise<Uint8Array> {
		return await withReady(() => W.bchEncode(n, g, msgBits));
	}

	static async bchDecodeBMWithG(n: number, g: Uint8Array, recvBits: Uint8Array): Promise<Uint8Array> {
		return await withReady(() => W.bchDecodeBmWithG(n, g, recvBits));
	}

	static async cyclicNew(n: number, g: Uint8Array): Promise<{ n: number; k: number }> {
		return await withReady(() => parseParams<{ n: number; k: number }>(W.cyclicNewJson(n, g), "cyclicNew"));
	}

	static async cyclicEncode(n: number, g: Uint8Array, msgBits: Uint8Array): Promise<Uint8Array> {
		return await withReady(() => W.cyclicEncode(n, g, msgBits));
	}

	static async cyclicDecodeLUT(n: number, g: Uint8Array, recvBits: Uint8Array): Promise<Uint8Array> {
		return await withReady(() => W.cyclicDecodeLut(n, g, recvBits));
	}

	static async gf2CyclicGeneratorMatrix(n: number, g: Uint8Array): Promise<string> {
		return await withReady(() => W.gf2CyclicGeneratorMatrix(n, g));
	}

	static async gf2CyclicParityCheckMatrix(n: number, g: Uint8Array): Promise<string> {
		return await withReady(() => W.gf2CyclicParityCheckMatrix(n, g));
	}

	static async gf2ParityCheckFromGeneratorMatrix(gCsv: string): Promise<string> {
		return await withReady(() => W.gf2ParityCheckFromGeneratorMatrix(gCsv));
	}

	static async gf2Syndrome(hCsv: string, rBits: string): Promise<string> {
		return await withReady(() => W.gf2Syndrome(hCsv, rBits));
	}
}