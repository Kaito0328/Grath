/* eslint-disable */
/* tslint:disable */

import * as W from "../wrappers/statistics";
import { withReady } from "./runtime";

export type DescriptiveStats = Record<string, number>;

export type TestResult = {
    stat: number;
    p_value: number;
    df1?: number;
    df2?: number;
    ci_lower?: number;
    ci_upper?: number;
    effect?: number;
    n1?: number;
    n2?: number;
    method: string;
    tail?: string;
};

export type RegressionResultDTO = {
    intercept: number;
    slope: number;
    rSquared: number;
    r_squared?: number;
    coefficients: number[];
    residuals: number[];
};

export class RegressionResult {
    private readonly _dto: RegressionResultDTO;

    constructor(dto: RegressionResultDTO) {
        this._dto = dto;
    }

    toDTO(): RegressionResultDTO {
        return this._dto;
    }

    get intercept(): number {
        return Number(this._dto.intercept);
    }

    get slope(): number {
        return Number(this._dto.slope);
    }

    get rSquared(): number {
        const v = this._dto.r_squared ?? this._dto.rSquared;
        return Number(v);
    }

    get coefficients(): number[] {
        return Array.isArray(this._dto.coefficients) ? this._dto.coefficients.map(Number) : [];
    }

    get residuals(): number[] {
        return Array.isArray(this._dto.residuals) ? this._dto.residuals.map(Number) : [];
    }
}

function parseJson<T>(raw: string): T {
    return JSON.parse(raw) as T;
}

function asArray(data: Float64Array | number[]): number[] {
    return Array.isArray(data) ? data : Array.from(data);
}

function toCsv(data: Float64Array | number[]): string {
    return asArray(data).join(",");
}

function groupsToCsv(groups: number[][]): string {
    return groups.map((g) => g.join(",")).join(";");
}

function tableToCsv(table: number[][]): string {
    return table.map((row) => row.map((v) => Math.trunc(v)).join(",")).join(";");
}

function ensureFn<T extends (...args: any[]) => any>(
    fn: T | undefined,
    name: string,
): T {
    if (!fn) {
        throw new Error(`statistics wrapper function is missing: ${name}`);
    }
    return fn;
}

function normalizeTestResult(raw: any): TestResult {
    return {
        stat: Number(raw?.stat ?? NaN),
        p_value: Number(raw?.p_value ?? NaN),
        df1: Number.isFinite(Number(raw?.df1)) ? Number(raw.df1) : undefined,
        df2: Number.isFinite(Number(raw?.df2)) ? Number(raw.df2) : undefined,
        ci_lower: Number.isFinite(Number(raw?.ci_lower)) ? Number(raw.ci_lower) : undefined,
        ci_upper: Number.isFinite(Number(raw?.ci_upper)) ? Number(raw.ci_upper) : undefined,
        effect: Number.isFinite(Number(raw?.effect)) ? Number(raw.effect) : undefined,
        n1: Number.isFinite(Number(raw?.n1)) ? Number(raw.n1) : undefined,
        n2: Number.isFinite(Number(raw?.n2)) ? Number(raw.n2) : undefined,
        method: String(raw?.method ?? ""),
        tail: raw?.tail ? String(raw.tail) : undefined,
    };
}

function normalizeRegressionResult(raw: any): RegressionResultDTO {
    const r2 = Number(raw?.r_squared ?? raw?.rSquared ?? NaN);
    return {
        intercept: Number(raw?.intercept ?? NaN),
        slope: Number(raw?.slope ?? NaN),
        rSquared: r2,
        r_squared: r2,
        coefficients: Array.isArray(raw?.coefficients) ? raw.coefficients.map(Number) : [],
        residuals: Array.isArray(raw?.residuals) ? raw.residuals.map(Number) : [],
    };
}

export class StatisticsApi {
    static async getDescriptiveStats(data: Float64Array | number[]): Promise<DescriptiveStats> {
        return await withReady(() => parseJson<DescriptiveStats>(W.getDescriptiveStats(toCsv(data))));
    }

    static async runOneSampleTTest(
        data: Float64Array | number[],
        mu0: number,
        tail = "two-sided",
        alpha = 0.05,
    ): Promise<TestResult> {
        return await withReady(() =>
            normalizeTestResult(parseJson(W.runOneSampleTTest(toCsv(data), mu0, tail, alpha))),
        );
    }

    static async runTwoSampleTTest(
        x: Float64Array | number[],
        y: Float64Array | number[],
        pooled: boolean,
        tail = "two-sided",
        alpha = 0.05,
    ): Promise<TestResult> {
        return await withReady(() =>
            normalizeTestResult(parseJson(W.runTwoSampleTTest(toCsv(x), toCsv(y), pooled, tail, alpha))),
        );
    }

    static async runOneWayAnova(groups: number[][], tail = "two-sided"): Promise<TestResult> {
        return await withReady(() =>
            normalizeTestResult(parseJson(W.runOneWayAnova(groupsToCsv(groups), tail))),
        );
    }

    static async runChisqIndependence(table: number[][], tail = "two-sided"): Promise<TestResult> {
        return await withReady(() =>
            normalizeTestResult(parseJson(W.runChisqIndependence(tableToCsv(table), tail))),
        );
    }

    static async runChisqGof(
        observed: Float64Array | number[],
        expected: Float64Array | number[],
        tail = "two-sided",
    ): Promise<TestResult> {
        return await withReady(() =>
            normalizeTestResult(parseJson(W.runChisqGof(toCsv(observed), toCsv(expected), tail))),
        );
    }

    static async runFTest(
        x: Float64Array | number[],
        y: Float64Array | number[],
        tail = "two-sided",
        alpha = 0.05,
    ): Promise<TestResult> {
        return await withReady(() =>
            normalizeTestResult(parseJson(W.runFTest(toCsv(x), toCsv(y), tail, alpha))),
        );
    }

    static async runPearsonCorrelation(
        x: Float64Array | number[],
        y: Float64Array | number[],
        tail = "two-sided",
        alpha = 0.05,
    ): Promise<TestResult> {
        return await withReady(() =>
            normalizeTestResult(parseJson(W.runPearsonCorrelation(toCsv(x), toCsv(y), tail, alpha))),
        );
    }

    static async runMannWhitneyU(
        x: Float64Array | number[],
        y: Float64Array | number[],
        tail = "two-sided",
        continuity = true,
    ): Promise<TestResult> {
        return await withReady(() =>
            normalizeTestResult(parseJson(W.runMannWhitneyU(toCsv(x), toCsv(y), tail, continuity))),
        );
    }

    static async runKruskalWallis(groups: number[][], tail = "two-sided"): Promise<TestResult> {
        return await withReady(() =>
            normalizeTestResult(parseJson(W.runKruskalWallis(groupsToCsv(groups), tail))),
        );
    }

    static async runWilcoxonSignedRank(
        x: Float64Array | number[],
        y: Float64Array | number[],
        tail = "two-sided",
        continuity = true,
    ): Promise<TestResult> {
        return await withReady(() =>
            normalizeTestResult(parseJson(W.runWilcoxonSignedRank(toCsv(x), toCsv(y), tail, continuity))),
        );
    }

    static async runSimpleLinearRegression(
        x: Float64Array | number[],
        y: Float64Array | number[],
    ): Promise<RegressionResult> {
        return await withReady(() =>
            new RegressionResult(
                normalizeRegressionResult(parseJson(W.runSimpleLinearRegression(toCsv(x), toCsv(y)))),
            ),
        );
    }

    static async runZTestProportion(
        successes: number,
        n: number,
        p0: number,
        tail = "two-sided",
        alpha = 0.05,
    ): Promise<TestResult> {
        return await withReady(() => {
            const fn = ensureFn((W as any).runZTestProportion, "runZTestProportion");
            return normalizeTestResult(parseJson(fn(successes, n, p0, tail, alpha)));
        });
    }

    static async runZTestTwoProportions(
        x1: number,
        n1: number,
        x2: number,
        n2: number,
        tail = "two-sided",
    ): Promise<TestResult> {
        return await withReady(() => {
            const fn = ensureFn((W as any).runZTestTwoProportions, "runZTestTwoProportions");
            return normalizeTestResult(parseJson(fn(x1, n1, x2, n2, tail)));
        });
    }

    static async sampleNormal(mean: number, std: number, n: number): Promise<number[]> {
        return await withReady(() => parseJson<number[]>(W.sampleNormal(mean, std, n)));
    }

    static async sampleT(df: number, n: number): Promise<number[]> {
        return await withReady(() => parseJson<number[]>(W.sampleT(df, n)));
    }

    static async sampleChisq(df: number, n: number): Promise<number[]> {
        return await withReady(() => parseJson<number[]>(W.sampleChisq(df, n)));
    }

    static async sampleF(df1: number, df2: number, n: number): Promise<number[]> {
        return await withReady(() => parseJson<number[]>(W.sampleF(df1, df2, n)));
    }

    static async sampleBinomial(nTrials: number, p: number, nSamples: number): Promise<number[]> {
        return await withReady(() => {
            const fn = ensureFn((W as any).sampleBinomial, "sampleBinomial");
            return parseJson<number[]>(fn(nTrials, p, nSamples));
        });
    }

    static async samplePoisson(lambda: number, n: number): Promise<number[]> {
        return await withReady(() => parseJson<number[]>(W.samplePoisson(lambda, n)));
    }

    static async addGaussianNoise(data: Float64Array | number[], std: number): Promise<number[]> {
        return await withReady(() => parseJson<number[]>(W.addGaussianNoise(toCsv(data), std)));
    }

    static async addOutliers(
        data: Float64Array | number[],
        count: number,
        minVal: number,
        maxVal: number,
    ): Promise<number[]> {
        return await withReady(() =>
            parseJson<number[]>(W.addOutliers(toCsv(data), count, minVal, maxVal)),
        );
    }

    static async getNormalPdfSvg(mean: number, std: number, width = 640, height = 320): Promise<string> {
        return await withReady(() => W.getNormalPdfSvg(mean, std, width, height));
    }

    static async getTPdfSvg(df: number, width = 640, height = 320): Promise<string> {
        return await withReady(() => W.getTPdfSvg(df, width, height));
    }

    static async getChisqPdfSvg(df: number, width = 640, height = 320): Promise<string> {
        return await withReady(() => W.getChisqPdfSvg(df, width, height));
    }

    static async getFPdfSvg(df1: number, df2: number, width = 640, height = 320): Promise<string> {
        return await withReady(() => W.getFPdfSvg(df1, df2, width, height));
    }

    static async getBinomialPmfSvg(n: number, p: number, width = 640, height = 320): Promise<string> {
        return await withReady(() => {
            const fn = ensureFn((W as any).getBinomialPmfSvg, "getBinomialPmfSvg");
            return fn(n, p, width, height);
        });
    }

    static async getPoissonPmfSvg(lambda: number, width = 640, height = 320): Promise<string> {
        return await withReady(() => W.getPoissonPmfSvg(lambda, width, height));
    }
}
