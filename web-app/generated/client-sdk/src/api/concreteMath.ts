import { withReady } from "./runtime";
import { RationalDto, SymbolicExprDto } from "../wrappers/algebraic";
import * as CW from "../wrappers/concreteMath";

const getWasm = async () => {
	return (await import("wasm-lib")) as Record<string, any>;
};

const toIntLike = (v: number | string | bigint): number | bigint => {
	if (typeof v === "bigint") return v;
	if (typeof v === "number") return Number.isSafeInteger(v) ? v : BigInt(Math.trunc(v));
	return BigInt(v);
};

export interface NumericComplexDto {
	re: number;
	im: number;
}

export interface GeneralTermDto {
	polynomial: NumericComplexDto[];
	base: NumericComplexDto;
}

export interface ClosedFormDto {
	terms: GeneralTermDto[];
}

export interface NonHomogeneousSymbolicDto {
	poly: SymbolicExprDto[];
	base: RationalDto;
}

export class ConcreteMathHelper {
	static async solveRecurrence(coeffs: number[], initials: number[], nonHomogeneous: GeneralTermDto[] = []): Promise<ClosedFormDto> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.solve_recurrence !== "function") {
				throw new Error("solve_recurrence is not exported by wasm_lib");
			}
			return wasm.solve_recurrence(new Float64Array(coeffs), new Float64Array(initials), nonHomogeneous);
		});
	}

	static async solveRecurrenceSymbolic(
		coeffs: RationalDto[],
		initials: SymbolicExprDto[],
		nonHomogeneous: NonHomogeneousSymbolicDto[] = []
	): Promise<SymbolicExprDto> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.solve_recurrence_symbolic !== "function") {
				throw new Error("solve_recurrence_symbolic is not exported by wasm_lib");
			}
			return wasm.solve_recurrence_symbolic(coeffs, initials, nonHomogeneous);
		});
	}

	static async formatClosedForm(dto: ClosedFormDto): Promise<string> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.format_closed_form !== "function") {
				throw new Error("format_closed_form is not exported by wasm_lib");
			}
			return wasm.format_closed_form(dto);
		});
	}

	static async evalClosedForm(dto: ClosedFormDto, n: number): Promise<NumericComplexDto> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.eval_closed_form !== "function") {
				throw new Error("eval_closed_form is not exported by wasm_lib");
			}
			return wasm.eval_closed_form(dto, n);
		});
	}

	static async evalRecurrenceIterative(coeffs: number[], initials: number[], n: number, nonHomogeneous: GeneralTermDto[] = []): Promise<NumericComplexDto> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.eval_recurrence_iterative !== "function") {
				throw new Error("eval_recurrence_iterative is not exported by wasm_lib");
			}
			return wasm.eval_recurrence_iterative(new Float64Array(coeffs), new Float64Array(initials), nonHomogeneous, n);
		});
	}

	static async discreteDiff(polyCoeffs: NumericComplexDto[]): Promise<NumericComplexDto[]> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.discrete_diff !== "function") {
				throw new Error("discrete_diff is not exported by wasm_lib");
			}
			return wasm.discrete_diff(polyCoeffs);
		});
	}

	static async discreteSum(polyCoeffs: NumericComplexDto[]): Promise<NumericComplexDto[]> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.discrete_sum !== "function") {
				throw new Error("discrete_sum is not exported by wasm_lib");
			}
			return wasm.discrete_sum(polyCoeffs);
		});
	}

	static async partialSum(dto: ClosedFormDto): Promise<ClosedFormDto> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.partial_sum !== "function") {
				throw new Error("partial_sum is not exported by wasm_lib");
			}
			return wasm.partial_sum(dto);
		});
	}

	static async geometricSum(r: SymbolicExprDto, n: SymbolicExprDto): Promise<SymbolicExprDto> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.geometric_sum !== "function") {
				throw new Error("geometric_sum is not exported by wasm_lib");
			}
			return wasm.geometric_sum(r, n);
		});
	}

	static async arithmeticSum(a0: SymbolicExprDto, d: SymbolicExprDto, n: SymbolicExprDto): Promise<SymbolicExprDto> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.arithmetic_sum !== "function") {
				throw new Error("arithmetic_sum is not exported by wasm_lib");
			}
			return wasm.arithmetic_sum(a0, d, n);
		});
	}

	static async arithGeomSum(a0: SymbolicExprDto, d: SymbolicExprDto, r: SymbolicExprDto, n: SymbolicExprDto): Promise<SymbolicExprDto> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.arith_geom_sum !== "function") {
				throw new Error("arith_geom_sum is not exported by wasm_lib");
			}
			return wasm.arith_geom_sum(a0, d, r, n);
		});
	}

	static async getStirling1(n: number, k: number): Promise<number> {
		return await withReady(() => CW.getStirling1(n, k));
	}

	static async getStirling2(n: number, k: number): Promise<number> {
		return await withReady(() => CW.getStirling2(n, k));
	}

	static async getBernoulli(n: number): Promise<number> {
		return await withReady(() => CW.getBernoulli(n));
	}

	static async getHarmonic(n: number): Promise<number> {
		return await withReady(() => CW.getHarmonic(n));
	}

	static async sfGamma(z: number): Promise<number> {
		return await withReady(() => CW.sfGamma(z));
	}

	static async sfLogGamma(z: number): Promise<number> {
		return await withReady(() => CW.sfLogGamma(z));
	}

	static async sfBeta(x: number, y: number): Promise<number> {
		return await withReady(() => CW.sfBeta(x, y));
	}

	static async sfErf(z: number): Promise<number> {
		return await withReady(() => CW.sfErf(z));
	}

	static async sfRegularizedGamma(s: number, x: number): Promise<number> {
		return await withReady(() => CW.sfRegularizedGamma(s, x));
	}

	static async cmFallingFactorialPoly(m: number): Promise<NumericComplexDto[]> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.cm_falling_factorial_poly(m);
		});
	}

	static async cmRisingFactorialPoly(m: number): Promise<NumericComplexDto[]> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.cm_rising_factorial_poly(m);
		});
	}

	static async cmBinomPoly(k: number): Promise<NumericComplexDto[]> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.cm_binom_x_plus_k_choose_k_poly(k);
		});
	}

	static async ntGcd(a: number | string | bigint, b: number | string | bigint): Promise<string> {
		return await withReady(() => CW.ntGcd(toIntLike(a), toIntLike(b)).toString());
	}

	static async ntLcm(a: number | string | bigint, b: number | string | bigint): Promise<string> {
		return await withReady(() => CW.ntLcm(toIntLike(a), toIntLike(b)).toString());
	}

	static async ntExtendedGcd(a: number | string | bigint, b: number | string | bigint): Promise<{ gcd: string; x: string; y: string }> {
		return await withReady(() => {
			const res = JSON.parse(CW.ntExtendedGcd(toIntLike(a), toIntLike(b)));
			return {
				gcd: res.gcd.toString(),
				x: res.x.toString(),
				y: res.y.toString(),
			};
		});
	}

	static async ntModPow(base: number | string | bigint, exp: number | string | bigint, m: number | string | bigint): Promise<string> {
		return await withReady(() => CW.ntModPow(toIntLike(base), toIntLike(exp), toIntLike(m)).toString());
	}

	static async ntModInverse(a: number | string | bigint, m: number | string | bigint): Promise<string> {
		return await withReady(() => CW.ntModInverse(toIntLike(a), toIntLike(m)).toString());
	}

	static async ntIsPrime(n: number | string | bigint): Promise<boolean> {
		return await withReady(() => CW.ntIsPrime(n.toString()));
	}

	static async ntFactorize(n: number | string | bigint): Promise<{ factors: { p: string; exp: number }[] }> {
		return await withReady(() => {
			const res = JSON.parse(CW.ntFactorize(n.toString()));
			return {
				factors: res.factors.map((factor: any) => ({
					p: factor.p,
					exp: Number(factor.exp),
				})),
			};
		});
	}

	static async ntPhi(n: number | string | bigint): Promise<string> {
		return await withReady(() => CW.ntPhi(toIntLike(n)).toString());
	}
}
