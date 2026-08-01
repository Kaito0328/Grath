use crate::continuous_stats::Stats as ContStats;
use crate::distribution::continuous::core::Distribution as ContDist;
use crate::distribution::discrete::core::Distribution as DiscDist;
use crate::error::{Result, StatisticsError};
use crate::hypothesis::{
    chisq_gof, chisq_independence, correlation_t_test, f_test_variance_ratio, kruskal_wallis,
    mann_whitney_u, one_sample_t, one_way_anova, two_sample_t_pooled, two_sample_t_welch,
    wilcoxon_signed_rank, z_test_proportion, z_test_two_proportions, Tail, TestResult,
};
use crate::modeling::{
    bayesian_estimation, bayesian_estimation_with_precision, lasso_regression, logistic_predict,
    logistic_predict_proba, logistic_regression, ridge_regression,
    run_bayesian_em as run_bayesian_em_model, run_gmm_fit as run_gmm_fit_model,
    run_gmm_log_pdf as run_gmm_log_pdf_model, run_gmm_pdf as run_gmm_pdf_model,
    run_gmm_predict as run_gmm_predict_model, run_gmm_predict_proba as run_gmm_predict_proba_model,
    run_kalman_filter as run_kalman_filter_model, simple_linear_regression,
    solve_linear_system_ols, BayesianEmResult, BayesianPosteriorResult, GaussianMixtureFitResult,
    KalmanFilterRunResult, LogisticRegressionResult, RegressionResult, RegularizedRegressionResult,
};
use crate::plot;
use common::prelude::GrathCrateApi;
use linalg::{Matrix, Vector};
use rand::Rng;
use serde::Serialize;

// ------------------------------------------------------------------
// DTO types (flat, serializable, no lifetimes or tuples)
// ------------------------------------------------------------------

#[derive(Debug, Serialize)]
struct DescriptiveStatsDto {
    mean: f64,
    median: f64,
    variance: f64,
    std_dev: f64,
    skewness: f64,
    kurtosis: f64,
    range: f64,
    q1: f64,
    q3: f64,
    iqr: f64,
    n: usize,
}

#[derive(Debug, Serialize)]
struct TestResultDto {
    stat: f64,
    p_value: f64,
    df1: f64,
    df2: f64,
    ci_lower: f64,
    ci_upper: f64,
    effect: f64,
    n1: usize,
    n2: usize,
    method: String,
    tail: String,
}

#[derive(Debug, Serialize)]
struct RegressionResultDto {
    intercept: f64,
    slope: f64,
    r_squared: f64,
    coefficients: Vec<f64>,
    residuals: Vec<f64>,
}

#[derive(Debug, Serialize)]
struct LogisticRegressionDto {
    coefficients: Vec<f64>,
    probabilities: Vec<f64>,
    predictions: Vec<f64>,
}

#[derive(Debug, Serialize)]
struct KalmanFilterRunDto {
    states: Vec<Vec<f64>>,
    covariance_diagonals: Vec<Vec<f64>>,
}

#[derive(Debug, Serialize)]
struct GaussianMixtureFitDto {
    weights: Vec<f64>,
    means: Vec<Vec<f64>>,
    covariance_diagonals: Vec<Vec<f64>>,
    assignments: Vec<usize>,
    log_likelihood: f64,
}

#[derive(Debug, Serialize)]
struct RegularizedRegressionDto {
    coefficients: Vec<f64>,
    residuals: Vec<f64>,
}

#[derive(Debug, Serialize)]
struct BayesianPosteriorDto {
    posterior_mean: Vec<f64>,
    posterior_covariance: Vec<Vec<f64>>,
}

#[derive(Debug, Serialize)]
struct BayesianEmDto {
    prior_mean: Vec<f64>,
    prior_covariance: Vec<Vec<f64>>,
    noise_covariance: Vec<Vec<f64>>,
}

impl From<TestResult> for TestResultDto {
    fn from(r: TestResult) -> Self {
        let tail_str = match r.tail {
            Tail::TwoSided => "two-sided",
            Tail::Less => "less",
            Tail::Greater => "greater",
        };
        let (ci_lower, ci_upper) = r.ci.unwrap_or((f64::NAN, f64::NAN));
        TestResultDto {
            stat: r.stat,
            p_value: r.p_value,
            df1: r.df1.unwrap_or(f64::NAN),
            df2: r.df2.unwrap_or(f64::NAN),
            ci_lower,
            ci_upper,
            effect: r.effect.unwrap_or(f64::NAN),
            n1: r.n1,
            n2: r.n2.unwrap_or(0),
            method: r.method.to_string(),
            tail: tail_str.to_string(),
        }
    }
}

impl From<RegressionResult> for RegressionResultDto {
    fn from(r: RegressionResult) -> Self {
        RegressionResultDto {
            intercept: r.coefficients.first().copied().unwrap_or(f64::NAN),
            slope: r.coefficients.get(1).copied().unwrap_or(f64::NAN),
            r_squared: r.r_squared,
            coefficients: r.coefficients,
            residuals: r.residuals,
        }
    }
}

impl From<LogisticRegressionResult> for LogisticRegressionDto {
    fn from(r: LogisticRegressionResult) -> Self {
        LogisticRegressionDto {
            coefficients: r.coefficients,
            probabilities: r.probabilities,
            predictions: r.predictions,
        }
    }
}

impl From<KalmanFilterRunResult> for KalmanFilterRunDto {
    fn from(r: KalmanFilterRunResult) -> Self {
        KalmanFilterRunDto {
            states: r.states,
            covariance_diagonals: r.covariance_diagonals,
        }
    }
}

impl From<GaussianMixtureFitResult> for GaussianMixtureFitDto {
    fn from(r: GaussianMixtureFitResult) -> Self {
        GaussianMixtureFitDto {
            weights: r.weights,
            means: r.means,
            covariance_diagonals: r.covariance_diagonals,
            assignments: r.assignments,
            log_likelihood: r.log_likelihood,
        }
    }
}

impl From<RegularizedRegressionResult> for RegularizedRegressionDto {
    fn from(r: RegularizedRegressionResult) -> Self {
        RegularizedRegressionDto {
            coefficients: r.coefficients,
            residuals: r.residuals,
        }
    }
}

impl From<BayesianPosteriorResult> for BayesianPosteriorDto {
    fn from(r: BayesianPosteriorResult) -> Self {
        BayesianPosteriorDto {
            posterior_mean: r.posterior_mean,
            posterior_covariance: r.posterior_covariance,
        }
    }
}

impl From<BayesianEmResult> for BayesianEmDto {
    fn from(r: BayesianEmResult) -> Self {
        BayesianEmDto {
            prior_mean: r.prior_mean,
            prior_covariance: r.prior_covariance,
            noise_covariance: r.noise_covariance,
        }
    }
}

// ------------------------------------------------------------------
// Parse helpers
// ------------------------------------------------------------------

fn parse_csv(s: &str) -> Result<Vec<f64>> {
    let s = s.trim();
    if s.is_empty() {
        return Ok(Vec::new());
    }
    s.split(',')
        .map(|p| {
            p.trim()
                .parse::<f64>()
                .map_err(|e| StatisticsError::InvalidParameter {
                    what: "csv parse",
                    value: e.to_string(),
                })
        })
        .collect()
}

fn parse_groups(s: &str) -> Result<Vec<Vec<f64>>> {
    // Groups are semicolon-separated; each group is comma-separated values.
    s.split(';').map(|g| parse_csv(g.trim())).collect()
}

fn parse_vector(s: &str) -> Result<Vector<f64>> {
    let values = parse_csv(s)?;
    if values.is_empty() {
        return Err(StatisticsError::EmptyInput);
    }
    Ok(Vector::new(values))
}

fn parse_matrix(s: &str) -> Result<Matrix<f64>> {
    let rows: Vec<&str> = s
        .split(';')
        .map(|row| row.trim())
        .filter(|row| !row.is_empty())
        .collect();

    if rows.is_empty() {
        return Err(StatisticsError::EmptyInput);
    }

    let mut cols = None;
    let mut data = Vec::new();
    for (row_idx, row) in rows.iter().enumerate() {
        let cells: Vec<&str> = row
            .split(',')
            .map(|cell| cell.trim())
            .filter(|cell| !cell.is_empty())
            .collect();

        if cells.is_empty() {
            return Err(StatisticsError::InvalidParameter {
                what: "matrix row",
                value: format!("row {} is empty", row_idx),
            });
        }

        match cols {
            None => cols = Some(cells.len()),
            Some(expected) if expected != cells.len() => {
                return Err(StatisticsError::InvalidParameter {
                    what: "matrix shape",
                    value: format!(
                        "row {} has {} cols, expected {}",
                        row_idx,
                        cells.len(),
                        expected
                    ),
                });
            }
            _ => {}
        }

        for (col_idx, cell) in cells.iter().enumerate() {
            let v = cell
                .parse::<f64>()
                .map_err(|e| StatisticsError::InvalidParameter {
                    what: "matrix parse",
                    value: format!("parse error at ({}, {}): {}", row_idx, col_idx, e),
                })?;
            data.push(v);
        }
    }

    Matrix::new(rows.len(), cols.unwrap_or(0), data).map_err(|e| {
        StatisticsError::InvalidParameter {
            what: "matrix build",
            value: e.to_string(),
        }
    })
}

fn parse_u64_csv(s: &str) -> Result<Vec<u64>> {
    let s = s.trim();
    if s.is_empty() {
        return Ok(Vec::new());
    }
    s.split(',')
        .map(|p| {
            p.trim()
                .parse::<u64>()
                .map_err(|e| StatisticsError::InvalidParameter {
                    what: "u64 csv parse",
                    value: e.to_string(),
                })
        })
        .collect()
}

fn parse_table(s: &str) -> Result<Vec<Vec<u64>>> {
    // Rows are separated by ';', columns by ','.
    s.split(';').map(|row| parse_u64_csv(row.trim())).collect()
}

fn matrix_rows_as_vectors(m: &Matrix<f64>) -> Result<Vec<Vector<f64>>> {
    (0..m.rows)
        .map(|row| {
            m.row(row).map_err(|e| StatisticsError::InvalidParameter {
                what: "observations",
                value: e.to_string(),
            })
        })
        .collect()
}

fn to_json<T: Serialize>(v: &T) -> Result<String> {
    serde_json::to_string(v).map_err(|e| StatisticsError::InvalidParameter {
        what: "json serialize",
        value: e.to_string(),
    })
}

fn parse_tail(s: &str) -> Tail {
    match s.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    }
}

// ------------------------------------------------------------------
// StatisticsApi — all methods take primitive / String args,
// return Result<String, StatisticsError> (JSON) or primitive types.
// This allows the inspector to auto-generate wasm + TS wrappers.
// ------------------------------------------------------------------

pub struct StatisticsApi;

impl GrathCrateApi for StatisticsApi {
    const CRATE_NAME: &'static str = "statistics";
}

impl StatisticsApi {
    // --- Descriptive statistics ---

    pub fn get_descriptive_stats(data_csv: String) -> Result<String> {
        let data = parse_csv(&data_csv)?;
        if data.is_empty() {
            return Err(StatisticsError::EmptyInput);
        }
        let dto = DescriptiveStatsDto {
            mean: data.mean().unwrap_or(f64::NAN),
            median: data.median().unwrap_or(f64::NAN),
            variance: data.unbiased_variance().unwrap_or(f64::NAN),
            std_dev: data.unbiased_standard_deviation().unwrap_or(f64::NAN),
            skewness: data.skewness().unwrap_or(f64::NAN),
            kurtosis: data.kurtosis().unwrap_or(f64::NAN),
            range: data.range().unwrap_or(f64::NAN),
            q1: data.percentiles(25.0).unwrap_or(f64::NAN),
            q3: data.percentiles(75.0).unwrap_or(f64::NAN),
            iqr: data.iqr().unwrap_or(f64::NAN),
            n: data.len(),
        };
        to_json(&dto)
    }

    // --- Hypothesis tests ---

    pub fn run_one_sample_t_test(
        data_csv: String,
        mu0: f64,
        tail: String,
        alpha: f64,
    ) -> Result<String> {
        let data = parse_csv(&data_csv)?;
        let res = one_sample_t(&data, mu0, parse_tail(&tail), Some(alpha))?;
        to_json(&TestResultDto::from(res))
    }

    pub fn run_two_sample_t_test(
        x_csv: String,
        y_csv: String,
        pooled: bool,
        tail: String,
        alpha: f64,
    ) -> Result<String> {
        let x = parse_csv(&x_csv)?;
        let y = parse_csv(&y_csv)?;
        let t = parse_tail(&tail);
        let res = if pooled {
            two_sample_t_pooled(&x, &y, t, Some(alpha))?
        } else {
            two_sample_t_welch(&x, &y, t, Some(alpha))?
        };
        to_json(&TestResultDto::from(res))
    }

    pub fn run_one_way_anova(groups_csv: String, tail: String) -> Result<String> {
        let groups = parse_groups(&groups_csv)?;
        let refs: Vec<&[f64]> = groups.iter().map(|g| g.as_slice()).collect();
        let res = one_way_anova(&refs, parse_tail(&tail))?;
        to_json(&TestResultDto::from(res))
    }

    pub fn run_chisq_independence(table_csv: String, tail: String) -> Result<String> {
        let table = parse_table(&table_csv)?;
        let refs: Vec<&[u64]> = table.iter().map(|r| r.as_slice()).collect();
        let res = chisq_independence(&refs, parse_tail(&tail))?;
        to_json(&TestResultDto::from(res))
    }

    pub fn run_chisq_gof(obs_csv: String, exp_csv: String, tail: String) -> Result<String> {
        let obs = parse_csv(&obs_csv)?;
        let exp = parse_csv(&exp_csv)?;
        let res = chisq_gof(&obs, &exp, parse_tail(&tail))?;
        to_json(&TestResultDto::from(res))
    }

    pub fn run_f_test(x_csv: String, y_csv: String, tail: String, alpha: f64) -> Result<String> {
        let x = parse_csv(&x_csv)?;
        let y = parse_csv(&y_csv)?;
        let res = f_test_variance_ratio(&x, &y, parse_tail(&tail), Some(alpha))?;
        to_json(&TestResultDto::from(res))
    }

    pub fn run_z_test_proportion(
        successes: u64,
        n: u64,
        p0: f64,
        tail: String,
        alpha: f64,
    ) -> Result<String> {
        let res = z_test_proportion(successes, n, p0, parse_tail(&tail), Some(alpha))?;
        to_json(&TestResultDto::from(res))
    }

    pub fn run_z_test_two_proportions(
        x1: u64,
        n1: u64,
        x2: u64,
        n2: u64,
        tail: String,
    ) -> Result<String> {
        let res = z_test_two_proportions(x1, n1, x2, n2, parse_tail(&tail), None)?;
        to_json(&TestResultDto::from(res))
    }

    pub fn run_pearson_correlation(
        x_csv: String,
        y_csv: String,
        tail: String,
        alpha: f64,
    ) -> Result<String> {
        let x = parse_csv(&x_csv)?;
        let y = parse_csv(&y_csv)?;
        let res = correlation_t_test(&x, &y, parse_tail(&tail), Some(alpha))?;
        to_json(&TestResultDto::from(res))
    }

    pub fn run_mann_whitney_u(
        x_csv: String,
        y_csv: String,
        tail: String,
        continuity: bool,
    ) -> Result<String> {
        let x = parse_csv(&x_csv)?;
        let y = parse_csv(&y_csv)?;
        let res = mann_whitney_u(&x, &y, parse_tail(&tail), continuity)?;
        to_json(&TestResultDto::from(res))
    }

    pub fn run_kruskal_wallis(groups_csv: String, tail: String) -> Result<String> {
        let groups = parse_groups(&groups_csv)?;
        let refs: Vec<&[f64]> = groups.iter().map(|g| g.as_slice()).collect();
        let res = kruskal_wallis(&refs, parse_tail(&tail))?;
        to_json(&TestResultDto::from(res))
    }

    pub fn run_wilcoxon_signed_rank(
        x_csv: String,
        y_csv: String,
        tail: String,
        continuity: bool,
    ) -> Result<String> {
        let x = parse_csv(&x_csv)?;
        let y = parse_csv(&y_csv)?;
        let res = wilcoxon_signed_rank(&x, &y, parse_tail(&tail), continuity)?;
        to_json(&TestResultDto::from(res))
    }

    // --- Regression ---

    pub fn run_simple_linear_regression(x_csv: String, y_csv: String) -> Result<String> {
        let x = parse_csv(&x_csv)?;
        let y = parse_csv(&y_csv)?;
        let res = simple_linear_regression(&x, &y)
            .map_err(|_e| StatisticsError::DomainError {
                what: "regression",
                details: "failed",
            })
            .map(RegressionResultDto::from)?;
        to_json(&res)
    }

    pub fn run_ols_solve_linear_system(a_matrix_csv: String, b_csv: String) -> Result<String> {
        let a = parse_matrix(&a_matrix_csv)?;
        let b = parse_vector(&b_csv)?;
        let res = solve_linear_system_ols(&a, &b)?;
        to_json(&RegularizedRegressionDto::from(res))
    }

    pub fn run_ridge_regression(x_matrix_csv: String, y_csv: String, alpha: f64) -> Result<String> {
        let a = parse_matrix(&x_matrix_csv)?;
        let b = parse_vector(&y_csv)?;
        let res = ridge_regression(&a, &b, alpha)?;
        to_json(&RegularizedRegressionDto::from(res))
    }

    pub fn run_lasso_regression(
        x_matrix_csv: String,
        y_csv: String,
        alpha: f64,
        max_iter: usize,
        tol: f64,
    ) -> Result<String> {
        let a = parse_matrix(&x_matrix_csv)?;
        let b = parse_vector(&y_csv)?;
        let res = lasso_regression(&a, &b, alpha, max_iter, tol)?;
        to_json(&RegularizedRegressionDto::from(res))
    }

    pub fn run_logistic_regression(
        x_matrix_csv: String,
        y_csv: String,
        alpha: f64,
        max_iter: usize,
    ) -> Result<String> {
        let x = parse_matrix(&x_matrix_csv)?;
        let y = parse_vector(&y_csv)?;
        let res = logistic_regression(&x, &y, alpha, max_iter)?;
        to_json(&LogisticRegressionDto::from(res))
    }

    pub fn logistic_predict_proba(coefficients_csv: String, x_csv: String) -> Result<f64> {
        let coefficients = parse_vector(&coefficients_csv)?;
        let x = parse_vector(&x_csv)?;
        logistic_predict_proba(&coefficients, &x)
    }

    pub fn logistic_predict(coefficients_csv: String, x_csv: String) -> Result<f64> {
        let coefficients = parse_vector(&coefficients_csv)?;
        let x = parse_vector(&x_csv)?;
        logistic_predict(&coefficients, &x)
    }

    pub fn run_kalman_filter(
        initial_x_csv: String,
        initial_p_matrix_csv: String,
        f_matrix_csv: String,
        h_matrix_csv: String,
        q_matrix_csv: String,
        r_matrix_csv: String,
        observations_matrix_csv: String,
    ) -> Result<String> {
        let initial_x = parse_vector(&initial_x_csv)?;
        let initial_p = parse_matrix(&initial_p_matrix_csv)?;
        let f = parse_matrix(&f_matrix_csv)?;
        let h = parse_matrix(&h_matrix_csv)?;
        let q = parse_matrix(&q_matrix_csv)?;
        let r = parse_matrix(&r_matrix_csv)?;
        let observations_mat = parse_matrix(&observations_matrix_csv)?;
        let observations = matrix_rows_as_vectors(&observations_mat)?;

        let out = run_kalman_filter_model(initial_x, initial_p, f, h, q, r, &observations)?;
        to_json(&KalmanFilterRunDto::from(out))
    }

    pub fn run_gmm_fit(
        data_matrix_csv: String,
        k: usize,
        max_iter: usize,
        tol: f64,
    ) -> Result<String> {
        let data_mat = parse_matrix(&data_matrix_csv)?;
        let data = matrix_rows_as_vectors(&data_mat)?;
        let out = run_gmm_fit_model(&data, k, max_iter, tol)?;
        to_json(&GaussianMixtureFitDto::from(out))
    }

    pub fn run_gmm_pdf(
        data_matrix_csv: String,
        x_csv: String,
        k: usize,
        max_iter: usize,
        tol: f64,
    ) -> Result<f64> {
        let data_mat = parse_matrix(&data_matrix_csv)?;
        let data = matrix_rows_as_vectors(&data_mat)?;
        let x = parse_vector(&x_csv)?;
        run_gmm_pdf_model(&data, &x, k, max_iter, tol)
    }

    pub fn run_gmm_log_pdf(
        data_matrix_csv: String,
        x_csv: String,
        k: usize,
        max_iter: usize,
        tol: f64,
    ) -> Result<f64> {
        let data_mat = parse_matrix(&data_matrix_csv)?;
        let data = matrix_rows_as_vectors(&data_mat)?;
        let x = parse_vector(&x_csv)?;
        run_gmm_log_pdf_model(&data, &x, k, max_iter, tol)
    }

    pub fn run_gmm_predict_proba(
        data_matrix_csv: String,
        x_csv: String,
        k: usize,
        max_iter: usize,
        tol: f64,
    ) -> Result<String> {
        let data_mat = parse_matrix(&data_matrix_csv)?;
        let data = matrix_rows_as_vectors(&data_mat)?;
        let x = parse_vector(&x_csv)?;
        let out = run_gmm_predict_proba_model(&data, &x, k, max_iter, tol)?;
        to_json(&out)
    }

    pub fn run_gmm_predict(
        data_matrix_csv: String,
        x_csv: String,
        k: usize,
        max_iter: usize,
        tol: f64,
    ) -> Result<usize> {
        let data_mat = parse_matrix(&data_matrix_csv)?;
        let data = matrix_rows_as_vectors(&data_mat)?;
        let x = parse_vector(&x_csv)?;
        run_gmm_predict_model(&data, &x, k, max_iter, tol)
    }

    pub fn run_bayesian_estimation(
        y_csv: String,
        h_matrix_csv: String,
        prior_mean_csv: String,
        prior_cov_matrix_csv: String,
        noise_cov_matrix_csv: String,
    ) -> Result<String> {
        let y = parse_vector(&y_csv)?;
        let h = parse_matrix(&h_matrix_csv)?;
        let prior_mean = parse_vector(&prior_mean_csv)?;
        let prior_cov = parse_matrix(&prior_cov_matrix_csv)?;
        let noise_cov = parse_matrix(&noise_cov_matrix_csv)?;
        let out = bayesian_estimation(&y, &h, &prior_mean, &prior_cov, &noise_cov)?;
        to_json(&BayesianPosteriorDto::from(out))
    }

    pub fn run_bayesian_estimation_with_precision(
        y_csv: String,
        h_matrix_csv: String,
        prior_mean_csv: String,
        prior_precision_matrix_csv: String,
        noise_cov_matrix_csv: String,
    ) -> Result<String> {
        let y = parse_vector(&y_csv)?;
        let h = parse_matrix(&h_matrix_csv)?;
        let prior_mean = parse_vector(&prior_mean_csv)?;
        let prior_precision = parse_matrix(&prior_precision_matrix_csv)?;
        let noise_cov = parse_matrix(&noise_cov_matrix_csv)?;
        let out =
            bayesian_estimation_with_precision(&y, &h, &prior_mean, &prior_precision, &noise_cov)?;
        to_json(&BayesianPosteriorDto::from(out))
    }

    pub fn run_bayesian_em(
        y_csv: String,
        h_matrix_csv: String,
        max_iter: usize,
        tol: f64,
    ) -> Result<String> {
        let y = parse_vector(&y_csv)?;
        let h = parse_matrix(&h_matrix_csv)?;
        let out = run_bayesian_em_model(&y, &h, max_iter, tol)?;
        to_json(&BayesianEmDto::from(out))
    }

    // --- Sampling ---

    pub fn sample_normal(mean: f64, std: f64, n: usize) -> Result<String> {
        let mut rng = rand::thread_rng();
        let mut dist = crate::Normal::new(mean, std)?;
        let samples: Vec<f64> = (0..n)
            .map(|_| ContDist::sample(&mut dist, &mut rng))
            .collect();
        to_json(&samples)
    }

    pub fn sample_t(df: f64, n: usize) -> Result<String> {
        let mut rng = rand::thread_rng();
        let mut dist = crate::T::new(df as usize)?;
        let samples: Vec<f64> = (0..n)
            .map(|_| ContDist::sample(&mut dist, &mut rng))
            .collect();
        to_json(&samples)
    }

    pub fn sample_chisq(df: f64, n: usize) -> Result<String> {
        let mut rng = rand::thread_rng();
        let mut dist = crate::ChiSquare::new(df as usize)?;
        let samples: Vec<f64> = (0..n)
            .map(|_| ContDist::sample(&mut dist, &mut rng))
            .collect();
        to_json(&samples)
    }

    pub fn sample_f(df1: f64, df2: f64, n: usize) -> Result<String> {
        let mut rng = rand::thread_rng();
        let mut dist = crate::F::new(df1 as usize, df2 as usize)?;
        let samples: Vec<f64> = (0..n)
            .map(|_| ContDist::sample(&mut dist, &mut rng))
            .collect();
        to_json(&samples)
    }

    pub fn sample_binomial(n_trials: u64, p: f64, n_samples: usize) -> Result<String> {
        let mut rng = rand::thread_rng();
        let dist = crate::Binomial::new(n_trials, p)?;
        let samples: Vec<f64> = (0..n_samples)
            .map(|_| DiscDist::sample(&dist, &mut rng) as f64)
            .collect();
        to_json(&samples)
    }

    pub fn sample_poisson(lambda: f64, n: usize) -> Result<String> {
        let mut rng = rand::thread_rng();
        let dist = crate::Poisson::new(lambda)?;
        let samples: Vec<f64> = (0..n)
            .map(|_| DiscDist::sample(&dist, &mut rng) as f64)
            .collect();
        to_json(&samples)
    }

    // --- Noise utilities ---

    pub fn add_gaussian_noise(data_csv: String, std: f64) -> Result<String> {
        let mut data = parse_csv(&data_csv)?;
        let mut rng = rand::thread_rng();
        let mut dist = crate::Normal::new(0.0, std)?;
        for v in data.iter_mut() {
            *v += ContDist::sample(&mut dist, &mut rng);
        }
        to_json(&data)
    }

    pub fn add_outliers(
        data_csv: String,
        count: usize,
        min_val: f64,
        max_val: f64,
    ) -> Result<String> {
        let mut data = parse_csv(&data_csv)?;
        let mut rng = rand::thread_rng();
        for _ in 0..count {
            let val = rng.gen_range(min_val..=max_val);
            let idx = rng.gen_range(0..data.len().max(1));
            if idx < data.len() {
                data[idx] = val;
            }
        }
        to_json(&data)
    }

    // --- SVG plots ---

    pub fn get_normal_pdf_svg(mean: f64, std: f64, width: u32, height: u32) -> Result<String> {
        let dist = crate::Normal::new(mean, std)?;
        let opts = plot::SvgOptions {
            x_range: Some((-4.0 * std + mean, 4.0 * std + mean)),
            ..Default::default()
        };
        Ok(plot::svg_continuous_pdf_with(&dist, width, height, &opts))
    }

    pub fn get_t_pdf_svg(df: f64, width: u32, height: u32) -> Result<String> {
        let dist = crate::T::new(df as usize)?;
        let opts = plot::SvgOptions {
            x_range: Some((-4.0, 4.0)),
            ..Default::default()
        };
        Ok(plot::svg_continuous_pdf_with(&dist, width, height, &opts))
    }

    pub fn get_chisq_pdf_svg(df: f64, width: u32, height: u32) -> Result<String> {
        let dist = crate::ChiSquare::new(df as usize)?;
        let opts = plot::SvgOptions {
            x_range: Some((0.0, df + 4.0 * df.sqrt())),
            ..Default::default()
        };
        Ok(plot::svg_continuous_pdf_with(&dist, width, height, &opts))
    }

    pub fn get_f_pdf_svg(df1: f64, df2: f64, width: u32, height: u32) -> Result<String> {
        let dist = crate::F::new(df1 as usize, df2 as usize)?;
        let opts = plot::SvgOptions {
            x_range: Some((0.0, 5.0)),
            ..Default::default()
        };
        Ok(plot::svg_continuous_pdf_with(&dist, width, height, &opts))
    }

    pub fn get_binomial_pmf_svg(n: u64, p: f64, width: u32, height: u32) -> Result<String> {
        let dist = crate::Binomial::new(n, p)?;
        Ok(plot::svg_discrete_pmf(&dist, width, height))
    }

    pub fn get_poisson_pmf_svg(lambda: f64, width: u32, height: u32) -> Result<String> {
        let dist = crate::Poisson::new(lambda)?;
        Ok(plot::svg_discrete_pmf(&dist, width, height))
    }
}
