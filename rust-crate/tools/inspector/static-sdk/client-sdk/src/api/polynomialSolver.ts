// @ts-nocheck
import { SymbolicComplex } from "./algebraicApi";
import { withReady } from "./runtime";

const getWasm = async () => {
	return (await import("wasm-lib")) as Record<string, any>;
};

export class PolynomialSolverHelper {
	static async solveRationalCsv(coeffsCsv: string): Promise<SymbolicComplex[]> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.solve_polynomial_rational !== "function") {
				throw new Error("solve_polynomial_rational is not exported by wasm_lib");
			}
			const resultVals = wasm.solve_polynomial_rational(coeffsCsv) as any[];
			return resultVals.map((val) => SymbolicComplex.fromDTO(val as any));
		});
	}

	static async solveNumeric(coeffs: Float64Array | number[]): Promise<any[]> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.solve_polynomial_numeric(new Float64Array(coeffs));
		});
	}

	static async addNumeric(a: Float64Array | number[], b: Float64Array | number[]): Promise<Float64Array> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_add_numeric(new Float64Array(a), new Float64Array(b));
		});
	}

	static async subNumeric(a: Float64Array | number[], b: Float64Array | number[]): Promise<Float64Array> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_sub_numeric(new Float64Array(a), new Float64Array(b));
		});
	}

	static async mulNumeric(a: Float64Array | number[], b: Float64Array | number[]): Promise<Float64Array> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_mul_numeric(new Float64Array(a), new Float64Array(b));
		});
	}

	static async divNumeric(a: Float64Array | number[], b: Float64Array | number[]): Promise<Float64Array> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_div_numeric(new Float64Array(a), new Float64Array(b));
		});
	}

	static async addRational(aCsv: string, bCsv: string): Promise<string> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_add_rational(aCsv, bCsv);
		});
	}

	static async subRational(aCsv: string, bCsv: string): Promise<string> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_sub_rational(aCsv, bCsv);
		});
	}

	static async mulRational(aCsv: string, bCsv: string): Promise<string> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_mul_rational(aCsv, bCsv);
		});
	}

	static async divRational(aCsv: string, bCsv: string): Promise<string> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_div_rational(aCsv, bCsv);
		});
	}

	static async addSymbolic(aCsv: string, bCsv: string): Promise<string> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_add_symbolic(aCsv, bCsv);
		});
	}

	static async subSymbolic(aCsv: string, bCsv: string): Promise<string> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_sub_symbolic(aCsv, bCsv);
		});
	}

	static async mulSymbolic(aCsv: string, bCsv: string): Promise<string> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_mul_symbolic(aCsv, bCsv);
		});
	}

	static async divSymbolic(aCsv: string, bCsv: string): Promise<string> {
		return await withReady(async () => {
			const wasm = await getWasm();
			return wasm.poly_div_symbolic(aCsv, bCsv);
		});
	}

	static async solveSymbolic(coeffsCsv: string): Promise<SymbolicComplex[]> {
		return await withReady(async () => {
			const wasm = await getWasm();
			if (typeof wasm.solve_polynomial_symbolic !== "function") {
				throw new Error("solve_polynomial_symbolic is not exported by wasm_lib");
			}
			const resultVals = wasm.solve_polynomial_symbolic(coeffsCsv) as any[];
			return resultVals.map((val) => SymbolicComplex.fromDTO(val as any));
		});
	}
}
