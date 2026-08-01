/* eslint-disable */
/* tslint:disable */
// --- Auto-generated TypeScript Wrapper (wasm class bindings) ---

export type StatisticsModule = typeof import("wasm-lib");

let wasm: StatisticsModule | null = null;

export function setWasm(module: StatisticsModule) {
    wasm = module;
}

export function setWasmFromWasmLib(wasmLib: unknown) {
    setWasm(wasmLib as StatisticsModule);
}

function getWasm(): StatisticsModule {
    if (!wasm) {
        throw new Error("wasm module is not set for Statistics. Call setWasmFromWasmLib() after wasm initialization.");
    }
    return wasm;
}

export function getDescriptiveStats(data_csv: string): string {
    return getWasm().WasmStatisticsApi.get_descriptive_stats(data_csv);
}

export function runOneSampleTTest(data_csv: string, mu0: number, tail: string, alpha: number): string {
    return getWasm().WasmStatisticsApi.run_one_sample_t_test(data_csv, mu0, tail, alpha);
}

export function runTwoSampleTTest(x_csv: string, y_csv: string, pooled: boolean, tail: string, alpha: number): string {
    return getWasm().WasmStatisticsApi.run_two_sample_t_test(x_csv, y_csv, pooled, tail, alpha);
}

export function runOneWayAnova(groups_csv: string, tail: string): string {
    return getWasm().WasmStatisticsApi.run_one_way_anova(groups_csv, tail);
}

export function runChisqIndependence(table_csv: string, tail: string): string {
    return getWasm().WasmStatisticsApi.run_chisq_independence(table_csv, tail);
}

export function runChisqGof(obs_csv: string, exp_csv: string, tail: string): string {
    return getWasm().WasmStatisticsApi.run_chisq_gof(obs_csv, exp_csv, tail);
}

export function runFTest(x_csv: string, y_csv: string, tail: string, alpha: number): string {
    return getWasm().WasmStatisticsApi.run_f_test(x_csv, y_csv, tail, alpha);
}

export function runZTestProportion(successes: number | bigint, n: number | bigint, p0: number, tail: string, alpha: number): string {
    return getWasm().WasmStatisticsApi.run_z_test_proportion((typeof successes === "bigint" ? successes : BigInt(Math.trunc(Number(successes)))), (typeof n === "bigint" ? n : BigInt(Math.trunc(Number(n)))), p0, tail, alpha);
}

export function runZTestTwoProportions(x1: number | bigint, n1: number | bigint, x2: number | bigint, n2: number | bigint, tail: string): string {
    return getWasm().WasmStatisticsApi.run_z_test_two_proportions((typeof x1 === "bigint" ? x1 : BigInt(Math.trunc(Number(x1)))), (typeof n1 === "bigint" ? n1 : BigInt(Math.trunc(Number(n1)))), (typeof x2 === "bigint" ? x2 : BigInt(Math.trunc(Number(x2)))), (typeof n2 === "bigint" ? n2 : BigInt(Math.trunc(Number(n2)))), tail);
}

export function runPearsonCorrelation(x_csv: string, y_csv: string, tail: string, alpha: number): string {
    return getWasm().WasmStatisticsApi.run_pearson_correlation(x_csv, y_csv, tail, alpha);
}

export function runMannWhitneyU(x_csv: string, y_csv: string, tail: string, continuity: boolean): string {
    return getWasm().WasmStatisticsApi.run_mann_whitney_u(x_csv, y_csv, tail, continuity);
}

export function runKruskalWallis(groups_csv: string, tail: string): string {
    return getWasm().WasmStatisticsApi.run_kruskal_wallis(groups_csv, tail);
}

export function runWilcoxonSignedRank(x_csv: string, y_csv: string, tail: string, continuity: boolean): string {
    return getWasm().WasmStatisticsApi.run_wilcoxon_signed_rank(x_csv, y_csv, tail, continuity);
}

export function runSimpleLinearRegression(x_csv: string, y_csv: string): string {
    return getWasm().WasmStatisticsApi.run_simple_linear_regression(x_csv, y_csv);
}

export function runOlsSolveLinearSystem(a_matrix_csv: string, b_csv: string): string {
    return getWasm().WasmStatisticsApi.run_ols_solve_linear_system(a_matrix_csv, b_csv);
}

export function runRidgeRegression(x_matrix_csv: string, y_csv: string, alpha: number): string {
    return getWasm().WasmStatisticsApi.run_ridge_regression(x_matrix_csv, y_csv, alpha);
}

export function runLassoRegression(x_matrix_csv: string, y_csv: string, alpha: number, max_iter: number, tol: number): string {
    return getWasm().WasmStatisticsApi.run_lasso_regression(x_matrix_csv, y_csv, alpha, max_iter, tol);
}

export function runLogisticRegression(x_matrix_csv: string, y_csv: string, alpha: number, max_iter: number): string {
    return getWasm().WasmStatisticsApi.run_logistic_regression(x_matrix_csv, y_csv, alpha, max_iter);
}

export function logisticPredictProba(coefficients_csv: string, x_csv: string): number {
    return getWasm().WasmStatisticsApi.logistic_predict_proba(coefficients_csv, x_csv);
}

export function logisticPredict(coefficients_csv: string, x_csv: string): number {
    return getWasm().WasmStatisticsApi.logistic_predict(coefficients_csv, x_csv);
}

export function runKalmanFilter(initial_x_csv: string, initial_p_matrix_csv: string, f_matrix_csv: string, h_matrix_csv: string, q_matrix_csv: string, r_matrix_csv: string, observations_matrix_csv: string): string {
    return getWasm().WasmStatisticsApi.run_kalman_filter(initial_x_csv, initial_p_matrix_csv, f_matrix_csv, h_matrix_csv, q_matrix_csv, r_matrix_csv, observations_matrix_csv);
}

export function runGmmFit(data_matrix_csv: string, k: number, max_iter: number, tol: number): string {
    return getWasm().WasmStatisticsApi.run_gmm_fit(data_matrix_csv, k, max_iter, tol);
}

export function runGmmPdf(data_matrix_csv: string, x_csv: string, k: number, max_iter: number, tol: number): number {
    return getWasm().WasmStatisticsApi.run_gmm_pdf(data_matrix_csv, x_csv, k, max_iter, tol);
}

export function runGmmLogPdf(data_matrix_csv: string, x_csv: string, k: number, max_iter: number, tol: number): number {
    return getWasm().WasmStatisticsApi.run_gmm_log_pdf(data_matrix_csv, x_csv, k, max_iter, tol);
}

export function runGmmPredictProba(data_matrix_csv: string, x_csv: string, k: number, max_iter: number, tol: number): string {
    return getWasm().WasmStatisticsApi.run_gmm_predict_proba(data_matrix_csv, x_csv, k, max_iter, tol);
}

export function runGmmPredict(data_matrix_csv: string, x_csv: string, k: number, max_iter: number, tol: number): number {
    return getWasm().WasmStatisticsApi.run_gmm_predict(data_matrix_csv, x_csv, k, max_iter, tol);
}

export function runBayesianEstimation(y_csv: string, h_matrix_csv: string, prior_mean_csv: string, prior_cov_matrix_csv: string, noise_cov_matrix_csv: string): string {
    return getWasm().WasmStatisticsApi.run_bayesian_estimation(y_csv, h_matrix_csv, prior_mean_csv, prior_cov_matrix_csv, noise_cov_matrix_csv);
}

export function runBayesianEstimationWithPrecision(y_csv: string, h_matrix_csv: string, prior_mean_csv: string, prior_precision_matrix_csv: string, noise_cov_matrix_csv: string): string {
    return getWasm().WasmStatisticsApi.run_bayesian_estimation_with_precision(y_csv, h_matrix_csv, prior_mean_csv, prior_precision_matrix_csv, noise_cov_matrix_csv);
}

export function runBayesianEm(y_csv: string, h_matrix_csv: string, max_iter: number, tol: number): string {
    return getWasm().WasmStatisticsApi.run_bayesian_em(y_csv, h_matrix_csv, max_iter, tol);
}

export function sampleNormal(mean: number, std: number, n: number): string {
    return getWasm().WasmStatisticsApi.sample_normal(mean, std, n);
}

export function sampleT(df: number, n: number): string {
    return getWasm().WasmStatisticsApi.sample_t(df, n);
}

export function sampleChisq(df: number, n: number): string {
    return getWasm().WasmStatisticsApi.sample_chisq(df, n);
}

export function sampleF(df1: number, df2: number, n: number): string {
    return getWasm().WasmStatisticsApi.sample_f(df1, df2, n);
}

export function sampleBinomial(n_trials: number | bigint, p: number, n_samples: number): string {
    return getWasm().WasmStatisticsApi.sample_binomial((typeof n_trials === "bigint" ? n_trials : BigInt(Math.trunc(Number(n_trials)))), p, n_samples);
}

export function samplePoisson(lambda: number, n: number): string {
    return getWasm().WasmStatisticsApi.sample_poisson(lambda, n);
}

export function addGaussianNoise(data_csv: string, std: number): string {
    return getWasm().WasmStatisticsApi.add_gaussian_noise(data_csv, std);
}

export function addOutliers(data_csv: string, count: number, min_val: number, max_val: number): string {
    return getWasm().WasmStatisticsApi.add_outliers(data_csv, count, min_val, max_val);
}

export function getNormalPdfSvg(mean: number, std: number, width: number, height: number): string {
    return getWasm().WasmStatisticsApi.get_normal_pdf_svg(mean, std, width, height);
}

export function getTPdfSvg(df: number, width: number, height: number): string {
    return getWasm().WasmStatisticsApi.get_t_pdf_svg(df, width, height);
}

export function getChisqPdfSvg(df: number, width: number, height: number): string {
    return getWasm().WasmStatisticsApi.get_chisq_pdf_svg(df, width, height);
}

export function getFPdfSvg(df1: number, df2: number, width: number, height: number): string {
    return getWasm().WasmStatisticsApi.get_f_pdf_svg(df1, df2, width, height);
}

export function getBinomialPmfSvg(n: number | bigint, p: number, width: number, height: number): string {
    return getWasm().WasmStatisticsApi.get_binomial_pmf_svg((typeof n === "bigint" ? n : BigInt(Math.trunc(Number(n)))), p, width, height);
}

export function getPoissonPmfSvg(lambda: number, width: number, height: number): string {
    return getWasm().WasmStatisticsApi.get_poisson_pmf_svg(lambda, width, height);
}

