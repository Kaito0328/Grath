// @ts-nocheck
import * as W from "../wrappers/finiteField";
import { withReady } from "./runtime";

function parseIntResult(value: string, name: string): number {
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed)) {
		throw new Error(`${name} returned a non-numeric value: ${value}`);
	}
	return parsed;
}

export class FiniteFieldApi {
	static async gfp5Add(a: number, b: number): Promise<number> {
		return await withReady(() => parseIntResult(W.gfp5Add(String(a), String(b)), "gfp5Add"));
	}

	static async gfp5Mul(a: number, b: number): Promise<number> {
		return await withReady(() => parseIntResult(W.gfp5Mul(String(a), String(b)), "gfp5Mul"));
	}

	static async gfp5Inv(a: number): Promise<number> {
		return await withReady(() => parseIntResult(W.gfp5Inv(String(a)), "gfp5Inv"));
	}

	static async gf256Mul(a: number, b: number): Promise<number> {
		return await withReady(() => parseIntResult(W.gf256Mul(String(a), String(b)), "gf256Mul"));
	}

	static async gf256InvCheck(a: number): Promise<boolean> {
		return await withReady(() => W.gf256InvCheck(String(a)));
	}
}
