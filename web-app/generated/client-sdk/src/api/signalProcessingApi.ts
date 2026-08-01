import * as W from "../wrappers/signalProcessing";
import { withReady } from "./runtime";

function toF64(data: ArrayLike<number> | Float64Array): Float64Array {
	return data instanceof Float64Array ? data : new Float64Array(data);
}

export class SignalProcessingApi {
	static async convAutoF64Array(x: ArrayLike<number> | Float64Array, h: ArrayLike<number> | Float64Array): Promise<Float64Array> {
		return await withReady(() => W.convAutoF64(toF64(x), toF64(h)));
	}

	static async convAutoF64(x: ArrayLike<number> | Float64Array, h: ArrayLike<number> | Float64Array): Promise<number[]> {
		const out = await this.convAutoF64Array(x, h);
		return Array.from(out);
	}

	static async convSimpleF64Array(x: ArrayLike<number> | Float64Array, h: ArrayLike<number> | Float64Array): Promise<Float64Array> {
		return await withReady(() => W.convSimpleF64(toF64(x), toF64(h)));
	}

	static async convSimpleF64(x: ArrayLike<number> | Float64Array, h: ArrayLike<number> | Float64Array): Promise<number[]> {
		const out = await this.convSimpleF64Array(x, h);
		return Array.from(out);
	}

	static async decimateArray(signal: ArrayLike<number> | Float64Array, factor: number): Promise<Float64Array> {
		return await withReady(() => W.decimate(toF64(signal), factor));
	}

	static async decimate(signal: ArrayLike<number> | Float64Array, factor: number): Promise<number[]> {
		const out = await this.decimateArray(signal, factor);
		return Array.from(out);
	}

	static async expandArray(signal: ArrayLike<number> | Float64Array, factor: number): Promise<Float64Array> {
		return await withReady(() => W.expand(toF64(signal), factor));
	}

	static async expand(signal: ArrayLike<number> | Float64Array, factor: number): Promise<number[]> {
		const out = await this.expandArray(signal, factor);
		return Array.from(out);
	}

	static async dftMagnitudesArray(signal: ArrayLike<number> | Float64Array, sampleRate: number): Promise<Float64Array> {
		return await withReady(() => W.dftMagnitudes(toF64(signal), sampleRate));
	}

	static async dftMagnitudes(signal: ArrayLike<number> | Float64Array, sampleRate: number): Promise<number[]> {
		const out = await this.dftMagnitudesArray(signal, sampleRate);
		return Array.from(out);
	}

	static async designFirLowpassTapsArray(numTaps: number, normalizedCutoff: number, windowType: string, kaiserBeta: number): Promise<Float64Array> {
		return await withReady(() => W.designFirLowpassTaps(numTaps, normalizedCutoff, windowType, kaiserBeta));
	}

	static async designFirLowpassTaps(numTaps: number, normalizedCutoff: number, windowType: string, kaiserBeta: number): Promise<number[]> {
		const out = await this.designFirLowpassTapsArray(numTaps, normalizedCutoff, windowType, kaiserBeta);
		return Array.from(out);
	}

	static async designFirHighpassTapsArray(numTaps: number, normalizedCutoff: number, windowType: string, kaiserBeta: number): Promise<Float64Array> {
		return await withReady(() => W.designFirHighpassTaps(numTaps, normalizedCutoff, windowType, kaiserBeta));
	}

	static async designFirHighpassTaps(numTaps: number, normalizedCutoff: number, windowType: string, kaiserBeta: number): Promise<number[]> {
		const out = await this.designFirHighpassTapsArray(numTaps, normalizedCutoff, windowType, kaiserBeta);
		return Array.from(out);
	}

	static async designFirBandpassTapsArray(numTaps: number, normalizedF1: number, normalizedF2: number, windowType: string, kaiserBeta: number): Promise<Float64Array> {
		return await withReady(() => W.designFirBandpassTaps(numTaps, normalizedF1, normalizedF2, windowType, kaiserBeta));
	}

	static async designFirBandpassTaps(numTaps: number, normalizedF1: number, normalizedF2: number, windowType: string, kaiserBeta: number): Promise<number[]> {
		const out = await this.designFirBandpassTapsArray(numTaps, normalizedF1, normalizedF2, windowType, kaiserBeta);
		return Array.from(out);
	}

	static async designFirBandstopTapsArray(numTaps: number, normalizedF1: number, normalizedF2: number, windowType: string, kaiserBeta: number): Promise<Float64Array> {
		return await withReady(() => W.designFirBandstopTaps(numTaps, normalizedF1, normalizedF2, windowType, kaiserBeta));
	}

	static async designFirBandstopTaps(numTaps: number, normalizedF1: number, normalizedF2: number, windowType: string, kaiserBeta: number): Promise<number[]> {
		const out = await this.designFirBandstopTapsArray(numTaps, normalizedF1, normalizedF2, windowType, kaiserBeta);
		return Array.from(out);
	}

	static async iirButterworthApplyArray(x: ArrayLike<number> | Float64Array, fs: number, order: number, spec: string, f1Hz: number, f2Hz: number): Promise<Float64Array> {
		return await withReady(() => W.iirButterworthApplyF64(toF64(x), fs, order, spec, f1Hz, f2Hz));
	}

	static async iirButterworthApply(x: ArrayLike<number> | Float64Array, fs: number, order: number, spec: string, f1Hz: number, f2Hz: number): Promise<number[]> {
		const out = await this.iirButterworthApplyArray(x, fs, order, spec, f1Hz, f2Hz);
		return Array.from(out);
	}

	static async iirChebyshev1ApplyArray(x: ArrayLike<number> | Float64Array, fs: number, order: number, rippleDb: number, spec: string, f1Hz: number, f2Hz: number): Promise<Float64Array> {
		return await withReady(() => W.iirChebyshev1ApplyF64(toF64(x), fs, order, rippleDb, spec, f1Hz, f2Hz));
	}

	static async iirChebyshev1Apply(x: ArrayLike<number> | Float64Array, fs: number, order: number, rippleDb: number, spec: string, f1Hz: number, f2Hz: number): Promise<number[]> {
		const out = await this.iirChebyshev1ApplyArray(x, fs, order, rippleDb, spec, f1Hz, f2Hz);
		return Array.from(out);
	}

	static async iirChebyshev2ApplyArray(x: ArrayLike<number> | Float64Array, fs: number, order: number, stopbandAttenDb: number, spec: string, f1Hz: number, f2Hz: number): Promise<Float64Array> {
		return await withReady(() => W.iirChebyshev2ApplyF64(toF64(x), fs, order, stopbandAttenDb, spec, f1Hz, f2Hz));
	}

	static async iirChebyshev2Apply(x: ArrayLike<number> | Float64Array, fs: number, order: number, stopbandAttenDb: number, spec: string, f1Hz: number, f2Hz: number): Promise<number[]> {
		const out = await this.iirChebyshev2ApplyArray(x, fs, order, stopbandAttenDb, spec, f1Hz, f2Hz);
		return Array.from(out);
	}
}
