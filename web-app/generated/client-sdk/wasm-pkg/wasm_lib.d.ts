/* tslint:disable */
/* eslint-disable */

export class WasmAdaptiveFilterLMS {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(taps: number, step_size: number): WasmAdaptiveFilterLMS;
    toString(): string;
}

export class WasmAdaptiveFilterNLMS {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(taps: number, step_size: number, epsilon: number): WasmAdaptiveFilterNLMS;
    toString(): string;
    weights_vec(): Float64Array;
}

export class WasmArithmeticCode {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmBCHCode {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new_auto(m: number, t: number): WasmBCHCode;
    toString(): string;
}

export class WasmBernoulli {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(p: number): WasmBernoulli;
    toString(): string;
}

export class WasmBinomial {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(n: bigint, p: number): WasmBinomial;
    toString(): string;
}

export class WasmBlockHuffmanTree {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmCategorical {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(probs: Float64Array): WasmCategorical;
    toString(): string;
}

export class WasmChiSquare {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(k: number): WasmChiSquare;
    toString(): string;
}

export class WasmClosedForm {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    is_zero(): boolean;
    simplified(): WasmClosedForm;
    simplify(): void;
    toString(): string;
    static zero(): WasmClosedForm;
}

export class WasmCodingApi {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static bch_decode_bm(m: number, t: number, recv_bits: Uint8Array): Uint8Array;
    static bch_decode_bm_with_g(n: number, g_bits: Uint8Array, recv_bits: Uint8Array): Uint8Array;
    static bch_encode(n: number, g_bits: Uint8Array, msg_bits: Uint8Array): Uint8Array;
    static bch_encode_auto(m: number, t: number, msg_bits: Uint8Array): Uint8Array;
    static bch_new_auto_json(m: number, t: number): string;
    static bch_new_json(n: number, g_bits: Uint8Array): string;
    static cyclic_decode_lut(n: number, g_bits: Uint8Array, recv_bits: Uint8Array): Uint8Array;
    static cyclic_encode(n: number, g_bits: Uint8Array, msg_bits: Uint8Array): Uint8Array;
    static cyclic_new_json(n: number, g_bits: Uint8Array): string;
    static gf2_cyclic_generator_matrix(n: number, g_bits: Uint8Array): string;
    static gf2_cyclic_parity_check_matrix(n: number, g_bits: Uint8Array): string;
    static gf2_parity_check_from_generator_matrix(g_csv: string): string;
    static gf2_syndrome(h_csv: string, r_bits: string): string;
    static hamming74_encode(bits4: string): string;
    static hamming74_encode_len(bits4: string): number;
    static linear_code_gf5_third(u0: string, u1: string): string;
    static reed_solomon_decode_bm(k: number, n: number, recv: Uint8Array, primitive_px: Uint8Array): Uint8Array;
    static reed_solomon_encode(k: number, n: number, msg: Uint8Array, primitive_px: Uint8Array): Uint8Array;
    toString(): string;
}

export class WasmConcreteMathApi {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static get_bernoulli(n: number): number;
    static get_harmonic(n: number): number;
    static get_stirling1(n: number, k: number): number;
    static get_stirling2(n: number, k: number): number;
    static nt_extended_gcd(a: bigint, b: bigint): string;
    static nt_factorize(n: string): string;
    static nt_gcd(a: bigint, b: bigint): bigint;
    static nt_is_prime(n: string): boolean;
    static nt_lcm(a: bigint, b: bigint): bigint;
    static nt_mod_inverse(a: bigint, m: bigint): bigint;
    static nt_mod_pow(base: bigint, exp: bigint, m: bigint): bigint;
    static nt_phi(n: bigint): bigint;
    static sf_beta(x: number, y: number): number;
    static sf_erf(z: number): number;
    static sf_gamma(z: number): number;
    static sf_log_gamma(z: number): number;
    static sf_regularized_gamma(s: number, x: number): number;
    toString(): string;
}

export class WasmDirichlet {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmDtoFixtureApi {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmExponential {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(lambda: number): WasmExponential;
    toString(): string;
}

export class WasmF {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(m: number, n: number): WasmF;
    toString(): string;
}

export class WasmFIRFilter {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    apply(x: WasmSignal): WasmSignal;
    is_empty(): boolean;
    static new_from_coeffs(coeffs: Float64Array): WasmFIRFilter;
    static new_from_coeffs_with_fs(coeffs: Float64Array, fs: number): WasmFIRFilter;
    toString(): string;
}

export class WasmFiniteField2m {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    cyclotomic_coset(start: number): string;
    static new_auto(m: number): WasmFiniteField2m;
    toString(): string;
}

export class WasmFiniteFieldApi {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static gf256_inv_check(a: string): boolean;
    static gf256_mul(a: string, b: string): string;
    static gfp5_add(a: string, b: string): string;
    static gfp5_inv(a: string): string;
    static gfp5_mul(a: string, b: string): string;
    toString(): string;
}

export class WasmGamma {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(shape: number, rate: number): WasmGamma;
    toString(): string;
}

export class WasmHamming74 {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmHuffmanCode {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmIIRFilter {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    apply(x: WasmSignal): WasmSignal;
    toString(): string;
}

export class WasmJonesCode {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmKalmanFilter {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    predict(): void;
    toString(): string;
}

export class WasmLinalgApi {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static add_numeric(a: string, b: string): string;
    static add_rational(a: string, b: string): string;
    static add_symbolic(a: string, b: string): string;
    static conj_transpose_symbolic(a: string): string;
    static eigenvalues_numeric(a: string): string;
    static eigenvalues_rational(a: string): string;
    static eigenvalues_symbolic(_a: string): string;
    static inv_numeric(a: string): string;
    static inv_rational(a: string): string;
    static inv_symbolic(a: string): string;
    static inverse_exact_rational(a: string): string;
    static inverse_exact_symbolic(a: string): string;
    static lu_exact_rational(a: string): string;
    static lu_exact_symbolic(a: string): string;
    static lu_numeric(a: string): string;
    static lu_rational(a: string): string;
    static lu_symbolic(a: string): string;
    static mul_numeric(a: string, b: string): string;
    static mul_rational(a: string, b: string): string;
    static mul_symbolic(a: string, b: string): string;
    static mul_symbolic_complex(a: string, b: string): string;
    static mul_vector_numeric(a_csv: string, v_csv: string): string;
    static mul_vector_rational(a_csv: string, v_csv: string): string;
    static mul_vector_symbolic(a_csv: string, v_csv: string): string;
    static qr_numeric(a: string): string;
    static qr_rational(_a: string): string;
    static qr_symbolic(a: string): string;
    static solve_vector_numeric(a_csv: string, b_csv: string): string;
    static solve_vector_rational(a_csv: string, b_csv: string): string;
    static solve_vector_symbolic(a_csv: string, b_csv: string): string;
    static svd_numeric(a: string): string;
    static svd_rational(_a: string): string;
    static svd_symbolic(a: string): string;
    toString(): string;
}

export class WasmLz78Code {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmMarkov {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmMultinomial {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmMultivariateNormal {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmMultivariateT {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmNormal {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(mu: number, sigma: number): WasmNormal;
    toString(): string;
}

export class WasmPoisson {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(lambda: number): WasmPoisson;
    toString(): string;
}

export class WasmPolynomialApi {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static find_roots_symbolic_expr(coeffs: string): string;
    toString(): string;
}

export class WasmPolynomialSolver {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmRational {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    checked_add(rhs: WasmRational): WasmRational;
    checked_div(rhs: WasmRational): WasmRational;
    checked_mul(rhs: WasmRational): WasmRational;
    denom(): bigint;
    static from_int(n: bigint): WasmRational;
    static from_latex(latex: string): WasmRational;
    is_integer(): boolean;
    is_minus_one(): boolean;
    is_one(): boolean;
    is_zero(): boolean;
    static new(numer: bigint, denom: bigint): WasmRational;
    normalize(): void;
    numer(): bigint;
    simplified(): WasmRational;
    toString(): string;
    to_latex(): string;
    static try_new(numer: bigint, denom: bigint): WasmRational;
}

export class WasmRationalMatrixApi {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmRationalMatrixDtoApi {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmRecurrenceRelation {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    solve(): WasmClosedForm;
    toString(): string;
}

export class WasmReedSolomon {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    toString(): string;
}

export class WasmSignal {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    apply_fir_filter(filter: WasmFIRFilter): WasmSignal;
    apply_iir(filt: WasmIIRFilter): WasmSignal;
    convolve(h: WasmSignal): WasmSignal;
    decimate(factor: number): WasmSignal;
    dft(): WasmSpectrum;
    duration(): number;
    expand(factor: number): WasmSignal;
    static from_image_grayscale(path: string, sample_rate: number): WasmSignal;
    static from_image_rgb(path: string, sample_rate: number): WasmSignal;
    static from_wav_mono(path: string): WasmSignal;
    is_empty(): boolean;
    static new(data: Float64Array, sample_rate: number): WasmSignal;
    sample_rate(): number;
    save_image_grayscale(path: string, width: number, height: number): void;
    save_image_rgb(path: string, width: number, height: number): void;
    save_svg(path: string, width: number, height: number): void;
    save_svg_with_axes(path: string, width: number, height: number, label: string): void;
    save_wav_mono(path: string): void;
    toString(): string;
}

export class WasmSignalProcessingApi {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static conv_auto_f64(x: Float64Array, h: Float64Array): Float64Array;
    static conv_simple_f64(x: Float64Array, h: Float64Array): Float64Array;
    static decimate(signal: Float64Array, factor: number): Float64Array;
    static design_fir_bandpass_taps(num_taps: number, normalized_f1: number, normalized_f2: number, window_type: string, kaiser_beta: number): Float64Array;
    static design_fir_bandstop_taps(num_taps: number, normalized_f1: number, normalized_f2: number, window_type: string, kaiser_beta: number): Float64Array;
    static design_fir_highpass_taps(num_taps: number, normalized_cutoff: number, window_type: string, kaiser_beta: number): Float64Array;
    static design_fir_lowpass_taps(num_taps: number, normalized_cutoff: number, window_type: string, kaiser_beta: number): Float64Array;
    static dft_magnitudes(signal: Float64Array, sample_rate: number): Float64Array;
    static expand(signal: Float64Array, factor: number): Float64Array;
    static iir_butterworth_apply_f64(x: Float64Array, fs: number, order: number, spec: string, f1_hz: number, f2_hz: number): Float64Array;
    static iir_chebyshev1_apply_f64(x: Float64Array, fs: number, order: number, ripple_db: number, spec: string, f1_hz: number, f2_hz: number): Float64Array;
    static iir_chebyshev2_apply_f64(x: Float64Array, fs: number, order: number, stopband_atten_db: number, spec: string, f1_hz: number, f2_hz: number): Float64Array;
    static image_convolve2d_simple_f32(data: Float32Array, width: number, height: number, kernel: Float32Array, kernel_width: number, kernel_height: number, border_mode: string, border_constant: number): Float32Array;
    static image_gaussian_blur_f32(data: Float32Array, width: number, height: number, sigma: number, radius: number, border_mode: string, border_constant: number): Float32Array;
    toString(): string;
}

export class WasmSourceCodingApi {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static arithmetic_decode_hex(hex: string): string;
    static arithmetic_encode_hex(input: string): string;
    static arithmetic_roundtrip(input: string): boolean;
    static huffman_decode_hex(hex: string): string;
    static huffman_encode_hex(input: string): string;
    static huffman_roundtrip(input: string): boolean;
    static lz78_decode_hex(hex: string): string;
    static lz78_encode_hex(input: string): string;
    static lz78_roundtrip(input: string): boolean;
    toString(): string;
}

export class WasmSpectrum {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    bin_hz(k: number): number;
    ift(): WasmSignal;
    is_empty(): boolean;
    magnitude(k: number): number;
    magnitudes(): Float64Array;
    sample_rate(): number;
    save_svg_magnitude_db(path: string, width: number, height: number): void;
    save_svg_magnitude_db_with_axes(path: string, width: number, height: number, label: string): void;
    toString(): string;
}

export class WasmStatisticsApi {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static add_gaussian_noise(data_csv: string, std: number): string;
    static add_outliers(data_csv: string, count: number, min_val: number, max_val: number): string;
    static get_binomial_pmf_svg(n: bigint, p: number, width: number, height: number): string;
    static get_chisq_pdf_svg(df: number, width: number, height: number): string;
    static get_descriptive_stats(data_csv: string): string;
    static get_f_pdf_svg(df1: number, df2: number, width: number, height: number): string;
    static get_normal_pdf_svg(mean: number, std: number, width: number, height: number): string;
    static get_poisson_pmf_svg(lambda: number, width: number, height: number): string;
    static get_t_pdf_svg(df: number, width: number, height: number): string;
    static logistic_predict(coefficients_csv: string, x_csv: string): number;
    static logistic_predict_proba(coefficients_csv: string, x_csv: string): number;
    static run_bayesian_em(y_csv: string, h_matrix_csv: string, max_iter: number, tol: number): string;
    static run_bayesian_estimation(y_csv: string, h_matrix_csv: string, prior_mean_csv: string, prior_cov_matrix_csv: string, noise_cov_matrix_csv: string): string;
    static run_bayesian_estimation_with_precision(y_csv: string, h_matrix_csv: string, prior_mean_csv: string, prior_precision_matrix_csv: string, noise_cov_matrix_csv: string): string;
    static run_chisq_gof(obs_csv: string, exp_csv: string, tail: string): string;
    static run_chisq_independence(table_csv: string, tail: string): string;
    static run_f_test(x_csv: string, y_csv: string, tail: string, alpha: number): string;
    static run_gmm_fit(data_matrix_csv: string, k: number, max_iter: number, tol: number): string;
    static run_gmm_log_pdf(data_matrix_csv: string, x_csv: string, k: number, max_iter: number, tol: number): number;
    static run_gmm_pdf(data_matrix_csv: string, x_csv: string, k: number, max_iter: number, tol: number): number;
    static run_gmm_predict(data_matrix_csv: string, x_csv: string, k: number, max_iter: number, tol: number): number;
    static run_gmm_predict_proba(data_matrix_csv: string, x_csv: string, k: number, max_iter: number, tol: number): string;
    static run_kalman_filter(initial_x_csv: string, initial_p_matrix_csv: string, f_matrix_csv: string, h_matrix_csv: string, q_matrix_csv: string, r_matrix_csv: string, observations_matrix_csv: string): string;
    static run_kruskal_wallis(groups_csv: string, tail: string): string;
    static run_lasso_regression(x_matrix_csv: string, y_csv: string, alpha: number, max_iter: number, tol: number): string;
    static run_logistic_regression(x_matrix_csv: string, y_csv: string, alpha: number, max_iter: number): string;
    static run_mann_whitney_u(x_csv: string, y_csv: string, tail: string, continuity: boolean): string;
    static run_ols_solve_linear_system(a_matrix_csv: string, b_csv: string): string;
    static run_one_sample_t_test(data_csv: string, mu0: number, tail: string, alpha: number): string;
    static run_one_way_anova(groups_csv: string, tail: string): string;
    static run_pearson_correlation(x_csv: string, y_csv: string, tail: string, alpha: number): string;
    static run_ridge_regression(x_matrix_csv: string, y_csv: string, alpha: number): string;
    static run_simple_linear_regression(x_csv: string, y_csv: string): string;
    static run_two_sample_t_test(x_csv: string, y_csv: string, pooled: boolean, tail: string, alpha: number): string;
    static run_wilcoxon_signed_rank(x_csv: string, y_csv: string, tail: string, continuity: boolean): string;
    static run_z_test_proportion(successes: bigint, n: bigint, p0: number, tail: string, alpha: number): string;
    static run_z_test_two_proportions(x1: bigint, n1: bigint, x2: bigint, n2: bigint, tail: string): string;
    static sample_binomial(n_trials: bigint, p: number, n_samples: number): string;
    static sample_chisq(df: number, n: number): string;
    static sample_f(df1: number, df2: number, n: number): string;
    static sample_normal(mean: number, std: number, n: number): string;
    static sample_poisson(lambda: number, n: number): string;
    static sample_t(df: number, n: number): string;
    toString(): string;
}

export class WasmSvd {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    sort(): void;
    toString(): string;
}

export class WasmSymbolicComplex {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    add(other: WasmSymbolicComplex): WasmSymbolicComplex;
    conj(): WasmSymbolicComplex;
    expand(): WasmSymbolicComplex;
    static from_latex(latex: string): WasmSymbolicComplex;
    static from_real(re: WasmSymbolicExpr): WasmSymbolicComplex;
    static i(): WasmSymbolicComplex;
    is_imag_pure(): boolean;
    is_real(): boolean;
    mul(other: WasmSymbolicComplex): WasmSymbolicComplex;
    neg(): WasmSymbolicComplex;
    static new(re: WasmSymbolicExpr, im: WasmSymbolicExpr): WasmSymbolicComplex;
    simplify(): WasmSymbolicComplex;
    static sqrt_rational(n: bigint, d: bigint): WasmSymbolicComplex;
    sub(other: WasmSymbolicComplex): WasmSymbolicComplex;
    toString(): string;
    to_latex(): string;
    static zero(): WasmSymbolicComplex;
}

export class WasmSymbolicExpr {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static add(terms: string): WasmSymbolicExpr;
    expand(): WasmSymbolicExpr;
    static from_latex(latex: string): WasmSymbolicExpr;
    static int(n: bigint): WasmSymbolicExpr;
    static mul(factors: string): WasmSymbolicExpr;
    static pow(base: WasmSymbolicExpr, exp: WasmSymbolicExpr): WasmSymbolicExpr;
    static rational(n: bigint, d: bigint): WasmSymbolicExpr;
    simplify(): WasmSymbolicExpr;
    sqrt(): WasmSymbolicExpr;
    static sqrt2(): WasmSymbolicExpr;
    substitute(sym: string, val: WasmSymbolicExpr): WasmSymbolicExpr;
    toString(): string;
    to_latex(): string;
}

export class WasmT {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(nu: number): WasmT;
    toString(): string;
}

export class WasmUniform {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(min: number, max: number): WasmUniform;
    toString(): string;
}

export function arith_geom_sum(a0_value: any, d_value: any, r_value: any, n_value: any): any;

export function arithmetic_sum(a0_value: any, d_value: any, n_value: any): any;

export function cm_binom_x_plus_k_choose_k_poly(k: number): any;

export function cm_falling_factorial_poly(m: number): any;

export function cm_rising_factorial_poly(m: number): any;

export function discrete_diff(poly_coeffs: any[]): any;

export function discrete_sum(poly_coeffs: any[]): any;

export function dto_point_batch(points_value: any): any;

export function dto_point_by_name(values_value: any): any;

export function dto_point_checked(point_value: any): any;

export function dto_point_fixed(values_value: any): any;

export function dto_point_label(value_value: any): any;

export function dto_point_maybe(point_value: any): any;

export function dto_point_nested(point_value: any): any;

export function dto_point_new(x: number, y: number): any;

export function dto_point_pair(value_value: any): any;

export function dto_point_translate(point_value: any, dx: number, dy: number): any;

export function eval_closed_form(dto_value: any, n: number): any;

export function eval_recurrence_iterative(coeffs: Float64Array, initials: Float64Array, non_homogeneous_value: any, n: number): any;

export function format_closed_form(dto_value: any): string;

export function geometric_sum(r_value: any, n_value: any): any;

export function partial_sum(dto_value: any): any;

export function poly_add_numeric(a: Float64Array, b: Float64Array): Float64Array;

export function poly_add_rational(a_csv: string, b_csv: string): string;

export function poly_add_symbolic(a_csv: string, b_csv: string): string;

export function poly_div_numeric(a: Float64Array, b: Float64Array): Float64Array;

export function poly_div_rational(a_csv: string, b_csv: string): string;

export function poly_div_symbolic(a_csv: string, b_csv: string): string;

export function poly_mul_numeric(a: Float64Array, b: Float64Array): Float64Array;

export function poly_mul_rational(a_csv: string, b_csv: string): string;

export function poly_mul_symbolic(a_csv: string, b_csv: string): string;

export function poly_sub_numeric(a: Float64Array, b: Float64Array): Float64Array;

export function poly_sub_rational(a_csv: string, b_csv: string): string;

export function poly_sub_symbolic(a_csv: string, b_csv: string): string;

export function rationalCheckedAddDto(a_value: any, b_value: any): any;

export function rationalCheckedDivDto(a_value: any, b_value: any): any;

export function rationalCheckedMulDto(a_value: any, b_value: any): any;

export function rationalCreateDto(numer: bigint, denom: bigint): any;

export function rationalDenomDto(self_value: any): string;

export function rationalFormatDto(dto_value: any): string;

export function rationalFormatDtoToLatex(dto_value: any): string;

export function rationalFromIntDto(n: bigint): any;

export function rationalFromLatexDto(latex: string): any;

export function rationalIsIntegerDto(dto_value: any): boolean;

export function rationalIsMinusOneDto(dto_value: any): boolean;

export function rationalIsOneDto(dto_value: any): boolean;

export function rationalIsZeroDto(dto_value: any): boolean;

export function rationalNewDto(numer: string, denom: string): any;

export function rationalNormalizeDto(dto_value: any): any;

export function rationalNumerDto(self_value: any): string;

export function rationalParseDto(input: string): any;

export function rationalParseDtoFromLatex(latex: string): any;

export function rationalSimplifiedDto(self_value: any): any;

export function rationalSimplifyDto(dto_value: any): any;

export function rationalSimplifyDtoFromText(input: string): any;

export function rationalToLatexDto(dto_value: any): string;

export function rationalTryNewDto(numer: bigint, denom: bigint): any;

export function rational_matrix_add(a: string, b: string): string;

export function rational_matrix_dto_add(value_value: any, b_value: any): any;

export function rational_matrix_dto_inverse(value_value: any): any;

export function rational_matrix_dto_mul(value_value: any, b_value: any): any;

export function rational_matrix_dto_rows(value_value: any): number;

export function rational_matrix_dto_transpose(value_value: any): any;

export function rational_matrix_dto_zeros(rows: number, cols: number): any;

export function rational_matrix_first(a: string): string;

export function rational_matrix_inverse(a: string): string;

export function rational_matrix_mul(a: string, b: string): string;

export function rational_matrix_rows(a: string): number;

export function rational_matrix_transpose(a: string): string;

export function rational_matrix_zeros(rows: number, cols: number): string;

export function sf_beta(x: number, y: number): number;

export function sf_erf(z: number): number;

export function sf_gamma(z: number): number;

export function sf_log_gamma(z: number): number;

export function sf_regularized_gamma(s: number, x: number): number;

export function solve_polynomial_numeric(coeffs: Float64Array): any;

export function solve_polynomial_rational(coeffs_csv: string): any;

export function solve_polynomial_symbolic(coeffs_csv: string): any;

export function solve_recurrence(coeffs: Float64Array, initials: Float64Array, non_homogeneous_value: any): any;

export function solve_recurrence_symbolic(coeffs_value: any, initials_value: any, non_homogeneous_value: any): any;

export function symbolicComplexAddDto(a_value: any, b_value: any): any;

export function symbolicComplexConjDto(self_value: any): any;

export function symbolicComplexExpandDto(self_value: any): any;

export function symbolicComplexFormatDto(dto_value: any): string;

export function symbolicComplexFormatDtoToLatex(dto_value: any): string;

export function symbolicComplexFromLatexDto(latex: string): any;

export function symbolicComplexFromRealDto(re_value: any): any;

export function symbolicComplexIDto(): any;

export function symbolicComplexIsImagPureDto(dto_value: any): boolean;

export function symbolicComplexIsRealDto(dto_value: any): boolean;

export function symbolicComplexMulDto(a_value: any, b_value: any): any;

export function symbolicComplexNegDto(dto_value: any): any;

export function symbolicComplexNewDto(re_value: any, im_value: any): any;

export function symbolicComplexParseDto(input: string): any;

export function symbolicComplexParseDtoFromLatex(latex: string): any;

export function symbolicComplexSimplifyDto(dto_value: any): any;

export function symbolicComplexSqrtRationalDto(n: bigint, d: bigint): any;

export function symbolicComplexSubDto(a_value: any, b_value: any): any;

export function symbolicComplexToLatexDto(self_value: any): string;

export function symbolicComplexZeroDto(): any;

export function symbolicExprAddDto(terms_value: any): any;

export function symbolicExprExpandDto(self_value: any): any;

export function symbolicExprFormatDto(dto_value: any): string;

export function symbolicExprFormatDtoToLatex(dto_value: any): string;

export function symbolicExprFromLatexDto(latex: string): any;

export function symbolicExprIntDto(n: bigint): any;

export function symbolicExprMulDto(factors_value: any): any;

export function symbolicExprParseDto(input: string): any;

export function symbolicExprParseDtoFromLatex(latex: string): any;

export function symbolicExprPowDto(base_value: any, exp_value: any): any;

export function symbolicExprRationalDto(n: bigint, d: bigint): any;

export function symbolicExprSimplifyDto(dto_value: any): any;

export function symbolicExprSqrt2Dto(): any;

export function symbolicExprSqrtDto(self_value: any): any;

export function symbolicExprSubstituteDto(self_value: any, sym: string, val_value: any): any;

export function symbolicExprToLatexDto(self_value: any): string;
