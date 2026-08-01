// --- Auto-generated Wasm Wrapper ---
#![allow(non_snake_case)]
#![allow(unused_imports)]

use wasm_bindgen::prelude::*;
use std::collections::{BTreeMap, HashMap};
use ::common::prelude::*;
use statistics::*;

fn js_error_from_app_error(app: AppError) -> JsError {
let json = serde_json::to_string(&app)
.unwrap_or_else(|_| format!("{}: {}", app.code, app.message));
JsError::new(&json)
}

fn js_error_from_code_message(code: &str, message: String, details: Option<String>) -> JsError {
js_error_from_app_error(AppError::new(code.to_string(), message, details))
}

fn js_error_from_to_app_error<E: ToAppError>(e: E, details: Option<String>) -> JsError {
js_error_from_app_error(e.to_app_error(details))
}

use std::str::FromStr;

fn parse_csv_to_vec<T>(s: &str) -> std::result::Result<Vec<T>, JsError>
where
    T: FromStr,
    T::Err: ToString,
{
    let s = s.trim();
    if s.is_empty() {
        return Ok(Vec::new());
    }
    s.split(',')
        .map(|p| p.trim())
        .filter(|p| !p.is_empty())
        .map(|p| p.parse::<T>().map_err(|e| JsError::new(&e.to_string())))
        .collect::<std::result::Result<Vec<_>, _>>()
}

fn vec_to_csv<T>(v: Vec<T>) -> String
where
    T: ToString,
{
    v.into_iter().map(|x| x.to_string()).collect::<Vec<_>>().join(",")
}

fn parse_from_str<T>(s: &str) -> std::result::Result<T, JsError>
where
    T: FromStr,
    T::Err: ToString,
{
    s.parse::<T>().map_err(|e| JsError::new(&e.to_string()))
}

fn encode_to_string<T>(value: T) -> String
where
    T: ToString,
{
    value.to_string()
}

#[wasm_bindgen]
pub struct WasmDirichlet(pub(crate) Dirichlet);

impl WasmDirichlet {
    pub fn inner(&self) -> &Dirichlet { &self.0 }
}

#[wasm_bindgen]
impl WasmDirichlet {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Dirichlet).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmMultivariateNormal(pub(crate) MultivariateNormal);

impl WasmMultivariateNormal {
    pub fn inner(&self) -> &MultivariateNormal { &self.0 }
}

#[wasm_bindgen]
impl WasmMultivariateNormal {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(MultivariateNormal).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmMultivariateT(pub(crate) MultivariateT);

impl WasmMultivariateT {
    pub fn inner(&self) -> &MultivariateT { &self.0 }
}

#[wasm_bindgen]
impl WasmMultivariateT {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(MultivariateT).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmPoisson(pub(crate) Poisson);

impl WasmPoisson {
    pub fn inner(&self) -> &Poisson { &self.0 }
}

#[wasm_bindgen]
impl WasmPoisson {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Poisson).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmCategorical(pub(crate) Categorical);

impl WasmCategorical {
    pub fn inner(&self) -> &Categorical { &self.0 }
}

#[wasm_bindgen]
impl WasmCategorical {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Categorical).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmBernoulli(pub(crate) Bernoulli);

impl WasmBernoulli {
    pub fn inner(&self) -> &Bernoulli { &self.0 }
}

#[wasm_bindgen]
impl WasmBernoulli {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Bernoulli).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmBinomial(pub(crate) Binomial);

impl WasmBinomial {
    pub fn inner(&self) -> &Binomial { &self.0 }
}

#[wasm_bindgen]
impl WasmBinomial {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Binomial).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmExponential(pub(crate) Exponential);

impl WasmExponential {
    pub fn inner(&self) -> &Exponential { &self.0 }
}

#[wasm_bindgen]
impl WasmExponential {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Exponential).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmF(pub(crate) F);

impl WasmF {
    pub fn inner(&self) -> &F { &self.0 }
}

#[wasm_bindgen]
impl WasmF {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(F).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmUniform(pub(crate) Uniform);

impl WasmUniform {
    pub fn inner(&self) -> &Uniform { &self.0 }
}

#[wasm_bindgen]
impl WasmUniform {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Uniform).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmGamma(pub(crate) Gamma);

impl WasmGamma {
    pub fn inner(&self) -> &Gamma { &self.0 }
}

#[wasm_bindgen]
impl WasmGamma {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Gamma).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmNormal(pub(crate) Normal);

impl WasmNormal {
    pub fn inner(&self) -> &Normal { &self.0 }
}

#[wasm_bindgen]
impl WasmNormal {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Normal).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmChiSquare(pub(crate) ChiSquare);

impl WasmChiSquare {
    pub fn inner(&self) -> &ChiSquare { &self.0 }
}

#[wasm_bindgen]
impl WasmChiSquare {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(ChiSquare).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmT(pub(crate) T);

impl WasmT {
    pub fn inner(&self) -> &T { &self.0 }
}

#[wasm_bindgen]
impl WasmT {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(T).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmMultinomial(pub(crate) Multinomial);

impl WasmMultinomial {
    pub fn inner(&self) -> &Multinomial { &self.0 }
}

#[wasm_bindgen]
impl WasmMultinomial {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(Multinomial).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmStatisticsApi(pub(crate) StatisticsApi);

impl WasmStatisticsApi {
    pub fn inner(&self) -> &StatisticsApi { &self.0 }
}

#[wasm_bindgen]
impl WasmStatisticsApi {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(StatisticsApi).to_string()
    }
}

#[wasm_bindgen]
pub struct WasmKalmanFilter(pub(crate) KalmanFilter);

impl WasmKalmanFilter {
    pub fn inner(&self) -> &KalmanFilter { &self.0 }
}

#[wasm_bindgen]
impl WasmKalmanFilter {
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        stringify!(KalmanFilter).to_string()
    }
}

#[wasm_bindgen]
impl WasmPoisson {
    pub fn new(lambda: f64) -> std::result::Result<WasmPoisson, JsError> {
        Poisson::new(lambda).map(WasmPoisson).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmCategorical {
    pub fn new(probs: Vec<f64>) -> std::result::Result<WasmCategorical, JsError> {
        Categorical::new(probs).map(WasmCategorical).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmBernoulli {
    pub fn new(p: f64) -> std::result::Result<WasmBernoulli, JsError> {
        Bernoulli::new(p).map(WasmBernoulli).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmBinomial {
    pub fn new(n: u64, p: f64) -> std::result::Result<WasmBinomial, JsError> {
        Binomial::new(n, p).map(WasmBinomial).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmExponential {
    pub fn new(lambda: f64) -> std::result::Result<WasmExponential, JsError> {
        Exponential::new(lambda).map(WasmExponential).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmF {
    pub fn new(m: usize, n: usize) -> std::result::Result<WasmF, JsError> {
        F::new(m, n).map(WasmF).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmUniform {
    pub fn new(min: f64, max: f64) -> std::result::Result<WasmUniform, JsError> {
        Uniform::new(min, max).map(WasmUniform).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmGamma {
    pub fn new(shape: f64, rate: f64) -> std::result::Result<WasmGamma, JsError> {
        Gamma::new(shape, rate).map(WasmGamma).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmNormal {
    pub fn new(mu: f64, sigma: f64) -> std::result::Result<WasmNormal, JsError> {
        Normal::new(mu, sigma).map(WasmNormal).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmChiSquare {
    pub fn new(k: usize) -> std::result::Result<WasmChiSquare, JsError> {
        ChiSquare::new(k).map(WasmChiSquare).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmT {
    pub fn new(nu: usize) -> std::result::Result<WasmT, JsError> {
        T::new(nu).map(WasmT).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmStatisticsApi {
    pub fn get_descriptive_stats(data_csv: String) -> std::result::Result<String, JsError> {
        StatisticsApi::get_descriptive_stats(data_csv).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_one_sample_t_test(data_csv: String, mu0: f64, tail: String, alpha: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::run_one_sample_t_test(data_csv, mu0, tail, alpha).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_two_sample_t_test(x_csv: String, y_csv: String, pooled: bool, tail: String, alpha: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::run_two_sample_t_test(x_csv, y_csv, pooled, tail, alpha).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_one_way_anova(groups_csv: String, tail: String) -> std::result::Result<String, JsError> {
        StatisticsApi::run_one_way_anova(groups_csv, tail).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_chisq_independence(table_csv: String, tail: String) -> std::result::Result<String, JsError> {
        StatisticsApi::run_chisq_independence(table_csv, tail).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_chisq_gof(obs_csv: String, exp_csv: String, tail: String) -> std::result::Result<String, JsError> {
        StatisticsApi::run_chisq_gof(obs_csv, exp_csv, tail).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_f_test(x_csv: String, y_csv: String, tail: String, alpha: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::run_f_test(x_csv, y_csv, tail, alpha).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_z_test_proportion(successes: u64, n: u64, p0: f64, tail: String, alpha: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::run_z_test_proportion(successes, n, p0, tail, alpha).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_z_test_two_proportions(x1: u64, n1: u64, x2: u64, n2: u64, tail: String) -> std::result::Result<String, JsError> {
        StatisticsApi::run_z_test_two_proportions(x1, n1, x2, n2, tail).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_pearson_correlation(x_csv: String, y_csv: String, tail: String, alpha: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::run_pearson_correlation(x_csv, y_csv, tail, alpha).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_mann_whitney_u(x_csv: String, y_csv: String, tail: String, continuity: bool) -> std::result::Result<String, JsError> {
        StatisticsApi::run_mann_whitney_u(x_csv, y_csv, tail, continuity).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_kruskal_wallis(groups_csv: String, tail: String) -> std::result::Result<String, JsError> {
        StatisticsApi::run_kruskal_wallis(groups_csv, tail).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_wilcoxon_signed_rank(x_csv: String, y_csv: String, tail: String, continuity: bool) -> std::result::Result<String, JsError> {
        StatisticsApi::run_wilcoxon_signed_rank(x_csv, y_csv, tail, continuity).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_simple_linear_regression(x_csv: String, y_csv: String) -> std::result::Result<String, JsError> {
        StatisticsApi::run_simple_linear_regression(x_csv, y_csv).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_ols_solve_linear_system(a_matrix_csv: String, b_csv: String) -> std::result::Result<String, JsError> {
        StatisticsApi::run_ols_solve_linear_system(a_matrix_csv, b_csv).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_ridge_regression(x_matrix_csv: String, y_csv: String, alpha: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::run_ridge_regression(x_matrix_csv, y_csv, alpha).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_lasso_regression(x_matrix_csv: String, y_csv: String, alpha: f64, max_iter: usize, tol: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::run_lasso_regression(x_matrix_csv, y_csv, alpha, max_iter, tol).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_logistic_regression(x_matrix_csv: String, y_csv: String, alpha: f64, max_iter: usize) -> std::result::Result<String, JsError> {
        StatisticsApi::run_logistic_regression(x_matrix_csv, y_csv, alpha, max_iter).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn logistic_predict_proba(coefficients_csv: String, x_csv: String) -> std::result::Result<f64, JsError> {
        StatisticsApi::logistic_predict_proba(coefficients_csv, x_csv).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn logistic_predict(coefficients_csv: String, x_csv: String) -> std::result::Result<f64, JsError> {
        StatisticsApi::logistic_predict(coefficients_csv, x_csv).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_kalman_filter(initial_x_csv: String, initial_p_matrix_csv: String, f_matrix_csv: String, h_matrix_csv: String, q_matrix_csv: String, r_matrix_csv: String, observations_matrix_csv: String) -> std::result::Result<String, JsError> {
        StatisticsApi::run_kalman_filter(initial_x_csv, initial_p_matrix_csv, f_matrix_csv, h_matrix_csv, q_matrix_csv, r_matrix_csv, observations_matrix_csv).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_gmm_fit(data_matrix_csv: String, k: usize, max_iter: usize, tol: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::run_gmm_fit(data_matrix_csv, k, max_iter, tol).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_gmm_pdf(data_matrix_csv: String, x_csv: String, k: usize, max_iter: usize, tol: f64) -> std::result::Result<f64, JsError> {
        StatisticsApi::run_gmm_pdf(data_matrix_csv, x_csv, k, max_iter, tol).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_gmm_log_pdf(data_matrix_csv: String, x_csv: String, k: usize, max_iter: usize, tol: f64) -> std::result::Result<f64, JsError> {
        StatisticsApi::run_gmm_log_pdf(data_matrix_csv, x_csv, k, max_iter, tol).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_gmm_predict_proba(data_matrix_csv: String, x_csv: String, k: usize, max_iter: usize, tol: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::run_gmm_predict_proba(data_matrix_csv, x_csv, k, max_iter, tol).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_gmm_predict(data_matrix_csv: String, x_csv: String, k: usize, max_iter: usize, tol: f64) -> std::result::Result<usize, JsError> {
        StatisticsApi::run_gmm_predict(data_matrix_csv, x_csv, k, max_iter, tol).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_bayesian_estimation(y_csv: String, h_matrix_csv: String, prior_mean_csv: String, prior_cov_matrix_csv: String, noise_cov_matrix_csv: String) -> std::result::Result<String, JsError> {
        StatisticsApi::run_bayesian_estimation(y_csv, h_matrix_csv, prior_mean_csv, prior_cov_matrix_csv, noise_cov_matrix_csv).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_bayesian_estimation_with_precision(y_csv: String, h_matrix_csv: String, prior_mean_csv: String, prior_precision_matrix_csv: String, noise_cov_matrix_csv: String) -> std::result::Result<String, JsError> {
        StatisticsApi::run_bayesian_estimation_with_precision(y_csv, h_matrix_csv, prior_mean_csv, prior_precision_matrix_csv, noise_cov_matrix_csv).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn run_bayesian_em(y_csv: String, h_matrix_csv: String, max_iter: usize, tol: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::run_bayesian_em(y_csv, h_matrix_csv, max_iter, tol).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn sample_normal(mean: f64, std: f64, n: usize) -> std::result::Result<String, JsError> {
        StatisticsApi::sample_normal(mean, std, n).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn sample_t(df: f64, n: usize) -> std::result::Result<String, JsError> {
        StatisticsApi::sample_t(df, n).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn sample_chisq(df: f64, n: usize) -> std::result::Result<String, JsError> {
        StatisticsApi::sample_chisq(df, n).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn sample_f(df1: f64, df2: f64, n: usize) -> std::result::Result<String, JsError> {
        StatisticsApi::sample_f(df1, df2, n).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn sample_binomial(n_trials: u64, p: f64, n_samples: usize) -> std::result::Result<String, JsError> {
        StatisticsApi::sample_binomial(n_trials, p, n_samples).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn sample_poisson(lambda: f64, n: usize) -> std::result::Result<String, JsError> {
        StatisticsApi::sample_poisson(lambda, n).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn add_gaussian_noise(data_csv: String, std: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::add_gaussian_noise(data_csv, std).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn add_outliers(data_csv: String, count: usize, min_val: f64, max_val: f64) -> std::result::Result<String, JsError> {
        StatisticsApi::add_outliers(data_csv, count, min_val, max_val).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn get_normal_pdf_svg(mean: f64, std: f64, width: u32, height: u32) -> std::result::Result<String, JsError> {
        StatisticsApi::get_normal_pdf_svg(mean, std, width, height).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn get_t_pdf_svg(df: f64, width: u32, height: u32) -> std::result::Result<String, JsError> {
        StatisticsApi::get_t_pdf_svg(df, width, height).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn get_chisq_pdf_svg(df: f64, width: u32, height: u32) -> std::result::Result<String, JsError> {
        StatisticsApi::get_chisq_pdf_svg(df, width, height).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn get_f_pdf_svg(df1: f64, df2: f64, width: u32, height: u32) -> std::result::Result<String, JsError> {
        StatisticsApi::get_f_pdf_svg(df1, df2, width, height).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn get_binomial_pmf_svg(n: u64, p: f64, width: u32, height: u32) -> std::result::Result<String, JsError> {
        StatisticsApi::get_binomial_pmf_svg(n, p, width, height).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
    pub fn get_poisson_pmf_svg(lambda: f64, width: u32, height: u32) -> std::result::Result<String, JsError> {
        StatisticsApi::get_poisson_pmf_svg(lambda, width, height).map_err(|e| JsError::new(&format!("{:?}", e)))
    }
}

#[wasm_bindgen]
impl WasmKalmanFilter {
    pub fn predict(&mut self) -> () {
        self.0.predict()
    }
}

