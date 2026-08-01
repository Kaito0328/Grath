use crate::distribution::multivariate_continuous::{
    core::MultivariateDistribution, normal::MultivariateNormal,
};
use crate::{Result as StatisticsResult, StatisticsError};
use linalg::matrix::numerical::{Pseudoinverse, SvdDeComposition};
use linalg::{Matrix, Result as LinalgResult, Vector};

pub struct RegressionResult {
    pub coefficients: Vec<f64>,
    pub r_squared: f64,
    pub residuals: Vec<f64>,
}

pub struct LogisticRegressionResult {
    pub coefficients: Vec<f64>,
    pub probabilities: Vec<f64>,
    pub predictions: Vec<f64>,
}

pub struct KalmanFilterRunResult {
    pub states: Vec<Vec<f64>>,
    pub covariance_diagonals: Vec<Vec<f64>>,
}

pub struct GaussianMixtureFitResult {
    pub weights: Vec<f64>,
    pub means: Vec<Vec<f64>>,
    pub covariance_diagonals: Vec<Vec<f64>>,
    pub assignments: Vec<usize>,
    pub log_likelihood: f64,
}

pub struct RegularizedRegressionResult {
    pub coefficients: Vec<f64>,
    pub residuals: Vec<f64>,
}

pub struct BayesianPosteriorResult {
    pub posterior_mean: Vec<f64>,
    pub posterior_covariance: Vec<Vec<f64>>,
}

pub struct BayesianEmResult {
    pub prior_mean: Vec<f64>,
    pub prior_covariance: Vec<Vec<f64>>,
    pub noise_covariance: Vec<Vec<f64>>,
}

struct GaussianMixtureModel {
    weights: Vec<f64>,
    distributions: Vec<MultivariateNormal>,
}

pub struct KalmanFilter {
    x: Vector<f64>,
    p: Matrix<f64>,
    f: Matrix<f64>,
    h: Matrix<f64>,
    q: Matrix<f64>,
    r: Matrix<f64>,
}

/// Perform simple linear regression y = b0 + b1*x
pub fn simple_linear_regression(x: &[f64], y: &[f64]) -> LinalgResult<RegressionResult> {
    if x.len() != y.len() || x.is_empty() {
        return Err(linalg::LinalgError::DimensionMismatch {
            expected: "X and Y must have the same non-zero length".into(),
            found: format!("len(x)={}, len(y)={}", x.len(), y.len()),
        });
    }

    let n = x.len();
    let mut a = Matrix::zeros(n, 2);
    for i in 0..n {
        a[(i, 0)] = 1.0;
        a[(i, 1)] = x[i];
    }
    let b = Vector::new(y.to_vec());

    let a_pinv = a.pinv()?;
    let coeffs = &a_pinv * &b;

    // R^2 calculation
    let y_mean = y.iter().sum::<f64>() / n as f64;
    let ss_tot: f64 = y.iter().map(|v| (v - y_mean).powi(2)).sum();

    let mut y_pred = Vec::with_capacity(n);
    for x_i in x.iter().take(n) {
        y_pred.push(coeffs[0] + coeffs[1] * *x_i);
    }

    let mut residuals = Vec::with_capacity(n);
    for i in 0..n {
        residuals.push(y[i] - y_pred[i]);
    }

    let ss_res: f64 = residuals.iter().map(|v| v.powi(2)).sum();

    let r_squared = 1.0 - (ss_res / ss_tot);

    Ok(RegressionResult {
        coefficients: coeffs.into_iter().collect(),
        r_squared,
        residuals,
    })
}

pub fn solve_linear_system_ols(
    a: &Matrix<f64>,
    b: &Vector<f64>,
) -> StatisticsResult<RegularizedRegressionResult> {
    if a.rows == 0 || a.cols == 0 || b.is_empty() {
        return Err(StatisticsError::EmptyInput);
    }
    if a.rows != b.len() {
        return Err(StatisticsError::InvalidParameter {
            what: "ols data",
            value: format!("a rows {} != b len {}", a.rows, b.len()),
        });
    }

    let a_pinv = a.pinv().map_err(|e| StatisticsError::InvalidParameter {
        what: "ols pseudoinverse",
        value: e.to_string(),
    })?;
    let x = &a_pinv * b;
    let residuals = b - &(a * &x);

    Ok(RegularizedRegressionResult {
        coefficients: x.as_slice().to_vec(),
        residuals: residuals.as_slice().to_vec(),
    })
}

pub fn ridge_regression(
    a: &Matrix<f64>,
    b: &Vector<f64>,
    alpha: f64,
) -> StatisticsResult<RegularizedRegressionResult> {
    if a.rows == 0 || a.cols == 0 || b.is_empty() {
        return Err(StatisticsError::EmptyInput);
    }
    if a.rows != b.len() {
        return Err(StatisticsError::InvalidParameter {
            what: "ridge data",
            value: format!("a rows {} != b len {}", a.rows, b.len()),
        });
    }
    if !alpha.is_finite() || alpha < 0.0 {
        return Err(StatisticsError::InvalidParameter {
            what: "ridge alpha",
            value: format!("must be non-negative finite, got {}", alpha),
        });
    }

    let svd = a.svd().map_err(|e| StatisticsError::InvalidParameter {
        what: "ridge svd",
        value: e.to_string(),
    })?;
    let ut_b = &svd.u.transpose() * b;

    let mut d_ut_b = Vector::zeros(svd.sigma.len());
    let alpha_sq = alpha * alpha;
    for i in 0..svd.sigma.len() {
        let s = svd.sigma[i];
        d_ut_b[i] = (s / (s * s + alpha_sq)) * ut_b[i];
    }

    let coeff = &svd.v * &d_ut_b;
    let residuals = b - &(a * &coeff);

    Ok(RegularizedRegressionResult {
        coefficients: coeff.as_slice().to_vec(),
        residuals: residuals.as_slice().to_vec(),
    })
}

pub fn lasso_soft_thresholding(z: f64, gamma: f64) -> f64 {
    if z > gamma {
        z - gamma
    } else if z < -gamma {
        z + gamma
    } else {
        0.0
    }
}

pub fn lasso_regression(
    a: &Matrix<f64>,
    b: &Vector<f64>,
    alpha: f64,
    max_iter: usize,
    tol: f64,
) -> StatisticsResult<RegularizedRegressionResult> {
    if a.rows == 0 || a.cols == 0 || b.is_empty() {
        return Err(StatisticsError::EmptyInput);
    }
    if a.rows != b.len() {
        return Err(StatisticsError::InvalidParameter {
            what: "lasso data",
            value: format!("a rows {} != b len {}", a.rows, b.len()),
        });
    }
    if !alpha.is_finite() || alpha < 0.0 {
        return Err(StatisticsError::InvalidParameter {
            what: "lasso alpha",
            value: format!("must be non-negative finite, got {}", alpha),
        });
    }
    if max_iter == 0 {
        return Err(StatisticsError::InvalidParameter {
            what: "lasso max_iter",
            value: "must be > 0".to_string(),
        });
    }
    if !tol.is_finite() || tol <= 0.0 {
        return Err(StatisticsError::InvalidParameter {
            what: "lasso tol",
            value: format!("must be positive finite, got {}", tol),
        });
    }

    let d = a.cols;
    let mut a_col_norm_sq = Vec::with_capacity(d);
    for j in 0..d {
        let col = a.col(j).map_err(|e| StatisticsError::InvalidParameter {
            what: "lasso column",
            value: e.to_string(),
        })?;
        a_col_norm_sq.push(col.dot(&col));
    }

    let mut x = Vector::zeros(d);
    for _ in 0..max_iter {
        let mut max_delta = 0.0;

        for j in 0..d {
            let old_xj = x[j];

            let mut r = b.clone();
            for k in 0..d {
                if k != j {
                    let col_k = a.col(k).map_err(|e| StatisticsError::InvalidParameter {
                        what: "lasso column",
                        value: e.to_string(),
                    })?;
                    r = &r - &(&col_k * x[k]);
                }
            }

            let col_j = a.col(j).map_err(|e| StatisticsError::InvalidParameter {
                what: "lasso column",
                value: e.to_string(),
            })?;
            let rho = col_j.dot(&r);

            if a_col_norm_sq[j] > 1e-12 {
                x[j] = lasso_soft_thresholding(rho, alpha) / a_col_norm_sq[j];
            } else {
                x[j] = 0.0;
            }

            let delta = (x[j] - old_xj).abs();
            if delta > max_delta {
                max_delta = delta;
            }
        }

        if max_delta < tol {
            break;
        }
    }

    let residuals = b - &(a * &x);
    Ok(RegularizedRegressionResult {
        coefficients: x.as_slice().to_vec(),
        residuals: residuals.as_slice().to_vec(),
    })
}

fn matrix_to_rows(m: &Matrix<f64>) -> Vec<Vec<f64>> {
    (0..m.rows)
        .map(|r| (0..m.cols).map(|c| m[(r, c)]).collect::<Vec<_>>())
        .collect::<Vec<_>>()
}

fn bayesian_estimation_with_precision_core(
    y: &Vector<f64>,
    h: &Matrix<f64>,
    prior_mean: &Vector<f64>,
    prior_precision: &Matrix<f64>,
    noise_cov: &Matrix<f64>,
) -> StatisticsResult<(Vector<f64>, Matrix<f64>)> {
    let ht = h.transpose();
    let noise_cov_lu = match noise_cov.lu_decompose() {
        Ok(lu) => lu,
        Err(_) => {
            let jitter = Matrix::identity(noise_cov.rows) * 1e-8;
            let adjusted = noise_cov + &jitter;
            adjusted
                .lu_decompose()
                .map_err(|e| StatisticsError::InvalidParameter {
                    what: "bayesian noise covariance",
                    value: e.to_string(),
                })?
        }
    };

    let z =
        Matrix::solve_with_lu(&noise_cov_lu, y).map_err(|e| StatisticsError::InvalidParameter {
            what: "bayesian solve z",
            value: e.to_string(),
        })?;
    let w = Matrix::solve_matrix_with_lu(&noise_cov_lu, h).map_err(|e| {
        StatisticsError::InvalidParameter {
            what: "bayesian solve w",
            value: e.to_string(),
        }
    })?;

    let q = prior_precision * prior_mean;
    let posterior_precision = &ht * &w + prior_precision;
    let ht_z: Vector<f64> = &ht * &z;
    let rhs: Vector<f64> = &ht_z + &q;
    let posterior_mean =
        posterior_precision
            .solve(&rhs)
            .map_err(|e| StatisticsError::InvalidParameter {
                what: "bayesian posterior solve",
                value: e.to_string(),
            })?;

    Ok((posterior_mean, posterior_precision))
}

pub fn bayesian_estimation_with_precision(
    y: &Vector<f64>,
    h: &Matrix<f64>,
    prior_mean: &Vector<f64>,
    prior_precision: &Matrix<f64>,
    noise_cov: &Matrix<f64>,
) -> StatisticsResult<BayesianPosteriorResult> {
    if y.is_empty() || h.rows == 0 || h.cols == 0 {
        return Err(StatisticsError::EmptyInput);
    }
    if y.len() != h.rows {
        return Err(StatisticsError::InvalidParameter {
            what: "bayesian precision y/h shape",
            value: format!("y len {} != h rows {}", y.len(), h.rows),
        });
    }
    if prior_mean.len() != h.cols {
        return Err(StatisticsError::InvalidParameter {
            what: "bayesian precision prior mean",
            value: format!("prior_mean len {} != h cols {}", prior_mean.len(), h.cols),
        });
    }
    if prior_precision.rows != h.cols || prior_precision.cols != h.cols {
        return Err(StatisticsError::InvalidParameter {
            what: "bayesian precision matrix",
            value: format!(
                "expected {}x{}, got {}x{}",
                h.cols, h.cols, prior_precision.rows, prior_precision.cols
            ),
        });
    }
    if noise_cov.rows != h.rows || noise_cov.cols != h.rows {
        return Err(StatisticsError::InvalidParameter {
            what: "bayesian noise covariance",
            value: format!(
                "expected {}x{}, got {}x{}",
                h.rows, h.rows, noise_cov.rows, noise_cov.cols
            ),
        });
    }

    let (posterior_mean, posterior_precision) =
        bayesian_estimation_with_precision_core(y, h, prior_mean, prior_precision, noise_cov)?;

    let posterior_covariance =
        posterior_precision
            .inverse()
            .ok_or(StatisticsError::InvalidParameter {
                what: "bayesian posterior precision",
                value: "matrix is not invertible".to_string(),
            })?;

    Ok(BayesianPosteriorResult {
        posterior_mean: posterior_mean.as_slice().to_vec(),
        posterior_covariance: matrix_to_rows(&posterior_covariance),
    })
}

pub fn bayesian_estimation(
    y: &Vector<f64>,
    h: &Matrix<f64>,
    prior_mean: &Vector<f64>,
    prior_cov: &Matrix<f64>,
    noise_cov: &Matrix<f64>,
) -> StatisticsResult<BayesianPosteriorResult> {
    if y.is_empty() || h.rows == 0 || h.cols == 0 {
        return Err(StatisticsError::EmptyInput);
    }
    if y.len() != h.rows {
        return Err(StatisticsError::InvalidParameter {
            what: "bayesian y/h shape",
            value: format!("y len {} != h rows {}", y.len(), h.rows),
        });
    }
    if prior_mean.len() != h.cols {
        return Err(StatisticsError::InvalidParameter {
            what: "bayesian prior mean",
            value: format!("prior_mean len {} != h cols {}", prior_mean.len(), h.cols),
        });
    }
    if prior_cov.rows != h.cols || prior_cov.cols != h.cols {
        return Err(StatisticsError::InvalidParameter {
            what: "bayesian prior covariance",
            value: format!(
                "expected {}x{}, got {}x{}",
                h.cols, h.cols, prior_cov.rows, prior_cov.cols
            ),
        });
    }
    if noise_cov.rows != h.rows || noise_cov.cols != h.rows {
        return Err(StatisticsError::InvalidParameter {
            what: "bayesian noise covariance",
            value: format!(
                "expected {}x{}, got {}x{}",
                h.rows, h.rows, noise_cov.rows, noise_cov.cols
            ),
        });
    }

    let prior_precision = prior_cov
        .inverse()
        .ok_or(StatisticsError::InvalidParameter {
            what: "bayesian prior covariance",
            value: "matrix is not invertible".to_string(),
        })?;

    let (posterior_mean, posterior_precision) =
        bayesian_estimation_with_precision_core(y, h, prior_mean, &prior_precision, noise_cov)?;

    let posterior_covariance =
        posterior_precision
            .inverse()
            .ok_or(StatisticsError::InvalidParameter {
                what: "bayesian posterior precision",
                value: "matrix is not invertible".to_string(),
            })?;

    Ok(BayesianPosteriorResult {
        posterior_mean: posterior_mean.as_slice().to_vec(),
        posterior_covariance: matrix_to_rows(&posterior_covariance),
    })
}

fn stabilize_precision(p: &Matrix<f64>, min_diag: f64) -> Matrix<f64> {
    let mut out = p.clone();
    let n = std::cmp::min(out.rows, out.cols);
    for i in 0..n {
        if out[(i, i)] < min_diag {
            out[(i, i)] = min_diag;
        }
    }
    out
}

fn stabilize_covariance(c: &Matrix<f64>, min_diag: f64) -> Matrix<f64> {
    let sym = (c + &c.transpose()) * 0.5;
    let mut out = sym.clone();
    let n = std::cmp::min(out.rows, out.cols);
    for i in 0..n {
        if out[(i, i)] < min_diag {
            out[(i, i)] = min_diag;
        }
    }
    out
}

fn frobenius_norm(m: &Matrix<f64>) -> f64 {
    let mut s = 0.0;
    for i in 0..m.rows {
        for j in 0..m.cols {
            let v = m[(i, j)];
            s += v * v;
        }
    }
    s.sqrt()
}

pub fn run_bayesian_em(
    y: &Vector<f64>,
    h: &Matrix<f64>,
    max_iter: usize,
    tol: f64,
) -> StatisticsResult<BayesianEmResult> {
    if y.is_empty() || h.rows == 0 || h.cols == 0 {
        return Err(StatisticsError::EmptyInput);
    }
    if y.len() != h.rows {
        return Err(StatisticsError::InvalidParameter {
            what: "bayesian em y/h shape",
            value: format!("y len {} != h rows {}", y.len(), h.rows),
        });
    }
    if max_iter == 0 {
        return Err(StatisticsError::InvalidParameter {
            what: "bayesian em max_iter",
            value: "must be > 0".to_string(),
        });
    }
    if !tol.is_finite() || tol <= 0.0 {
        return Err(StatisticsError::InvalidParameter {
            what: "bayesian em tol",
            value: format!("must be positive finite, got {}", tol),
        });
    }

    let mut prior_mean = Vector::zeros(h.cols);
    let mut prior_precision = Matrix::identity(h.cols) * 0.01;
    let mut noise_cov = Matrix::identity(h.rows) * 0.01;

    for _ in 0..max_iter {
        let stabilized_prior_precision = stabilize_precision(&prior_precision, 1e-8);
        let (posterior_mean, posterior_precision) = bayesian_estimation_with_precision_core(
            y,
            h,
            &prior_mean,
            &stabilized_prior_precision,
            &noise_cov,
        )?;

        let new_prior_mean = posterior_mean.clone();
        let new_prior_precision = posterior_precision.clone();

        let diff = y - &(h * &posterior_mean);
        let ht = h.transpose();
        let pn_ht = posterior_precision.solve_matrix(&ht).map_err(|e| {
            StatisticsError::InvalidParameter {
                what: "bayesian em precision solve_matrix",
                value: e.to_string(),
            }
        })?;

        let raw_noise_cov = (&diff * &diff.transpose() + h * &pn_ht) * (1.0 / y.len() as f64);
        let new_noise_cov = stabilize_covariance(&raw_noise_cov, 1e-8);

        let delta_mean = (&new_prior_mean - &prior_mean).norm();
        let delta_prec = frobenius_norm(&(&new_prior_precision - &prior_precision));
        let delta_noise = frobenius_norm(&(&new_noise_cov - &noise_cov));

        prior_mean = new_prior_mean;
        prior_precision = new_prior_precision;
        noise_cov = new_noise_cov;

        if delta_mean < tol && delta_prec < tol && delta_noise < tol {
            break;
        }
    }

    let prior_covariance = prior_precision
        .inverse()
        .ok_or(StatisticsError::InvalidParameter {
            what: "bayesian em prior precision",
            value: "matrix is not invertible".to_string(),
        })?;

    Ok(BayesianEmResult {
        prior_mean: prior_mean.as_slice().to_vec(),
        prior_covariance: matrix_to_rows(&prior_covariance),
        noise_covariance: matrix_to_rows(&noise_cov),
    })
}

fn sigmoid(z: f64) -> f64 {
    if z >= 0.0 {
        1.0 / (1.0 + (-z).exp())
    } else {
        let ez = z.exp();
        ez / (1.0 + ez)
    }
}

fn logistic_predict_proba_design_row(
    coefficients: &Vector<f64>,
    x_design_row: &Vector<f64>,
) -> StatisticsResult<f64> {
    if coefficients.len() != x_design_row.len() {
        return Err(StatisticsError::InvalidParameter {
            what: "logistic design row",
            value: format!(
                "expected {} coefficients for design row, got {}",
                x_design_row.len(),
                coefficients.len()
            ),
        });
    }

    Ok(sigmoid(coefficients.dot(x_design_row)))
}

pub fn logistic_predict_proba(
    coefficients: &Vector<f64>,
    x: &Vector<f64>,
) -> StatisticsResult<f64> {
    if coefficients.len() != x.len() + 1 {
        return Err(StatisticsError::InvalidParameter {
            what: "logistic coefficients",
            value: format!(
                "expected {} coefficients (including intercept), got {}",
                x.len() + 1,
                coefficients.len()
            ),
        });
    }

    let intercept = coefficients[0];
    let linear = (0..x.len())
        .map(|idx| coefficients[idx + 1] * x[idx])
        .sum::<f64>();
    Ok(sigmoid(intercept + linear))
}

pub fn logistic_predict(coefficients: &Vector<f64>, x: &Vector<f64>) -> StatisticsResult<f64> {
    Ok(if logistic_predict_proba(coefficients, x)? >= 0.5 {
        1.0
    } else {
        0.0
    })
}

pub fn logistic_regression(
    x_input: &Matrix<f64>,
    y: &Vector<f64>,
    alpha: f64,
    max_iter: usize,
) -> StatisticsResult<LogisticRegressionResult> {
    if x_input.rows == 0 || x_input.cols == 0 || y.is_empty() {
        return Err(StatisticsError::EmptyInput);
    }
    if x_input.rows != y.len() {
        return Err(StatisticsError::InvalidParameter {
            what: "logistic data",
            value: format!("x rows {} != y len {}", x_input.rows, y.len()),
        });
    }
    if !(alpha.is_finite() && alpha > 0.0) {
        return Err(StatisticsError::InvalidParameter {
            what: "alpha",
            value: format!("must be positive finite, got {}", alpha),
        });
    }
    if max_iter == 0 {
        return Err(StatisticsError::InvalidParameter {
            what: "max_iter",
            value: "must be > 0".to_string(),
        });
    }
    if let Some((idx, value)) = y
        .iter()
        .enumerate()
        .find(|(_, value)| (**value - 0.0).abs() > 1e-12 && (**value - 1.0).abs() > 1e-12)
    {
        return Err(StatisticsError::InvalidParameter {
            what: "y",
            value: format!("label at index {} must be 0 or 1, got {}", idx, value),
        });
    }

    let ones = Matrix::new(x_input.rows, 1, vec![1.0; x_input.rows]).map_err(|e| {
        StatisticsError::InvalidParameter {
            what: "logistic intercept",
            value: e.to_string(),
        }
    })?;
    let x = ones
        .hstack(x_input)
        .map_err(|e| StatisticsError::InvalidParameter {
            what: "logistic design matrix",
            value: e.to_string(),
        })?;

    let mut beta = Vector::zeros(x.cols);
    for _ in 0..max_iter {
        let probs: Vec<f64> = (0..x.rows)
            .map(|i| {
                let row = x.row(i).map_err(|e| StatisticsError::InvalidParameter {
                    what: "logistic row",
                    value: e.to_string(),
                })?;
                logistic_predict_proba_design_row(&beta, &row)
            })
            .collect::<StatisticsResult<Vec<_>>>()?;

        let p = Vector::new(probs);
        let error = y - &p;
        let gradient = &x.transpose() * &error;
        beta = beta + &(&gradient * alpha);
    }

    let probabilities: Vec<f64> = (0..x.rows)
        .map(|i| {
            let row = x.row(i).map_err(|e| StatisticsError::InvalidParameter {
                what: "logistic row",
                value: e.to_string(),
            })?;
            logistic_predict_proba_design_row(&beta, &row)
        })
        .collect::<StatisticsResult<Vec<_>>>()?;
    let predictions = probabilities
        .iter()
        .map(|p| if *p >= 0.5 { 1.0 } else { 0.0 })
        .collect::<Vec<_>>();

    Ok(LogisticRegressionResult {
        coefficients: beta.into_iter().collect(),
        probabilities,
        predictions,
    })
}

impl KalmanFilter {
    pub fn new(
        initial_x: Vector<f64>,
        initial_p: Matrix<f64>,
        f: Matrix<f64>,
        h: Matrix<f64>,
        q: Matrix<f64>,
        r: Matrix<f64>,
    ) -> StatisticsResult<Self> {
        let n = initial_x.len();
        if n == 0 {
            return Err(StatisticsError::EmptyInput);
        }
        if initial_p.rows != n || initial_p.cols != n {
            return Err(StatisticsError::InvalidParameter {
                what: "initial_p",
                value: format!(
                    "expected {}x{}, got {}x{}",
                    n, n, initial_p.rows, initial_p.cols
                ),
            });
        }
        if f.rows != n || f.cols != n {
            return Err(StatisticsError::InvalidParameter {
                what: "f",
                value: format!("expected {}x{}, got {}x{}", n, n, f.rows, f.cols),
            });
        }
        if q.rows != n || q.cols != n {
            return Err(StatisticsError::InvalidParameter {
                what: "q",
                value: format!("expected {}x{}, got {}x{}", n, n, q.rows, q.cols),
            });
        }
        if h.cols != n {
            return Err(StatisticsError::InvalidParameter {
                what: "h",
                value: format!("expected {} cols, got {}", n, h.cols),
            });
        }
        let m = h.rows;
        if r.rows != m || r.cols != m {
            return Err(StatisticsError::InvalidParameter {
                what: "r",
                value: format!("expected {}x{}, got {}x{}", m, m, r.rows, r.cols),
            });
        }

        Ok(Self {
            x: initial_x,
            p: initial_p,
            f,
            h,
            q,
            r,
        })
    }

    pub fn predict(&mut self) {
        self.x = &self.f * &self.x;
        self.p = &self.f * &self.p * &self.f.transpose() + &self.q;
    }

    pub fn update(&mut self, z: &Vector<f64>) -> StatisticsResult<()> {
        if z.len() != self.h.rows {
            return Err(StatisticsError::InvalidParameter {
                what: "z",
                value: format!("expected len {}, got {}", self.h.rows, z.len()),
            });
        }

        let s = &self.h * &self.p * &self.h.transpose() + &self.r;
        let pht = &self.p * &self.h.transpose();
        let y = s.transpose().solve_matrix(&pht.transpose()).map_err(|e| {
            StatisticsError::InvalidParameter {
                what: "kalman gain solve",
                value: e.to_string(),
            }
        })?;
        let k = y.transpose();

        self.x = &self.x + &k * (z - &self.h * &self.x);
        let i_kh = &Matrix::identity(self.p.rows) - &(&k * &self.h);
        self.p = &(&i_kh * &self.p) * &i_kh.transpose() + &(&k * &self.r) * &k.transpose();
        Ok(())
    }

    pub fn state(&self) -> &Vector<f64> {
        &self.x
    }

    pub fn covariance(&self) -> &Matrix<f64> {
        &self.p
    }
}

fn matrix_diag(m: &Matrix<f64>) -> Vec<f64> {
    let n = std::cmp::min(m.rows, m.cols);
    (0..n).map(|i| m[(i, i)]).collect()
}

pub fn run_kalman_filter(
    initial_x: Vector<f64>,
    initial_p: Matrix<f64>,
    f: Matrix<f64>,
    h: Matrix<f64>,
    q: Matrix<f64>,
    r: Matrix<f64>,
    observations: &[Vector<f64>],
) -> StatisticsResult<KalmanFilterRunResult> {
    if observations.is_empty() {
        return Err(StatisticsError::EmptyInput);
    }

    let mut filter = KalmanFilter::new(initial_x, initial_p, f, h, q, r)?;
    let mut states = Vec::with_capacity(observations.len());
    let mut covariance_diagonals = Vec::with_capacity(observations.len());

    for z in observations {
        filter.predict();
        filter.update(z)?;
        states.push(filter.state().as_slice().to_vec());
        covariance_diagonals.push(matrix_diag(filter.covariance()));
    }

    Ok(KalmanFilterRunResult {
        states,
        covariance_diagonals,
    })
}

impl GaussianMixtureModel {
    fn new(
        weights: Vec<f64>,
        means: Vec<Vector<f64>>,
        covariances: Vec<Matrix<f64>>,
    ) -> StatisticsResult<Self> {
        if weights.is_empty() || means.is_empty() || covariances.is_empty() {
            return Err(StatisticsError::EmptyInput);
        }
        if means.len() != covariances.len() || means.len() != weights.len() {
            return Err(StatisticsError::InvalidParameter {
                what: "gmm dimensions",
                value: format!(
                    "weights={}, means={}, covariances={}",
                    weights.len(),
                    means.len(),
                    covariances.len()
                ),
            });
        }

        let sum_w = weights.iter().sum::<f64>();
        if !sum_w.is_finite() || sum_w <= 0.0 {
            return Err(StatisticsError::InvalidParameter {
                what: "gmm weights",
                value: "sum must be positive".to_string(),
            });
        }

        let normalized_weights = weights.into_iter().map(|w| w / sum_w).collect::<Vec<_>>();
        let distributions = means
            .into_iter()
            .zip(covariances.into_iter())
            .map(|(mean, cov)| {
                Self::new_gaussian_with_jitter(mean, cov).map_err(|e| {
                    StatisticsError::InvalidParameter {
                        what: "gmm covariance",
                        value: format!("{e}"),
                    }
                })
            })
            .collect::<StatisticsResult<Vec<_>>>()?;

        Ok(Self {
            weights: normalized_weights,
            distributions,
        })
    }

    fn new_gaussian_with_jitter(
        mean: Vector<f64>,
        cov: Matrix<f64>,
    ) -> StatisticsResult<MultivariateNormal> {
        let dim = cov.rows;
        let jitters = [0.0_f64, 1e-9, 1e-7, 1e-5, 1e-3];
        for jitter in jitters {
            let cov_try = if jitter == 0.0 {
                cov.clone()
            } else {
                &cov + &(&Matrix::identity(dim) * jitter)
            };
            if let Ok(dist) = MultivariateNormal::new(mean.clone(), cov_try) {
                return Ok(dist);
            }
        }
        Err(StatisticsError::DomainError {
            what: "gmm covariance",
            details: "matrix must be positive-definite",
        })
    }

    fn fit(data: &[Vector<f64>], k: usize, max_iter: usize, tol: f64) -> StatisticsResult<Self> {
        let mut gmm = Self::init_params(data, k)?;
        let mut last_log_likelihood = f64::NEG_INFINITY;

        for _ in 0..max_iter {
            let responsibilities = gmm.expectation(data);
            gmm.maximization(&responsibilities, data)?;

            let log_likelihood = gmm.log_likelihood(data);
            if (log_likelihood - last_log_likelihood).abs() < tol {
                break;
            }
            last_log_likelihood = log_likelihood;
        }
        Ok(gmm)
    }

    fn init_params(data: &[Vector<f64>], k: usize) -> StatisticsResult<Self> {
        let n = data.len();
        if k == 0 || n < k {
            return Err(StatisticsError::InvalidParameter {
                what: "gmm k",
                value: format!("k must be in 1..=n, got k={}, n={}", k, n),
            });
        }

        let weights = vec![1.0 / k as f64; k];
        let mut means: Vec<Vector<f64>> = Vec::with_capacity(k);
        means.push(data[0].clone());
        while means.len() < k {
            let mut best_idx = 0usize;
            let mut best_score = f64::NEG_INFINITY;
            for (i, x) in data.iter().enumerate() {
                let mut min_d = f64::INFINITY;
                for m in &means {
                    let diff = x - m;
                    let d = diff.norm();
                    if d < min_d {
                        min_d = d;
                    }
                }
                if min_d > best_score {
                    best_score = min_d;
                    best_idx = i;
                }
            }
            means.push(data[best_idx].clone());
        }

        let dim = data[0].len();
        let covariances = vec![Matrix::identity(dim); k];
        Self::new(weights, means, covariances)
    }

    fn log_pdf(&self, x: &Vector<f64>) -> f64 {
        let log_probs: Vec<f64> = self
            .weights
            .iter()
            .zip(self.distributions.iter())
            .map(|(w, dist)| w.ln() + dist.log_pdf(x))
            .collect();

        let max_log_prob = log_probs.iter().copied().fold(f64::NEG_INFINITY, f64::max);
        max_log_prob
            + log_probs
                .iter()
                .map(|lp| (lp - max_log_prob).exp())
                .sum::<f64>()
                .ln()
    }

    fn log_likelihood(&self, data: &[Vector<f64>]) -> f64 {
        data.iter().map(|x| self.log_pdf(x)).sum()
    }

    fn predict_proba(&self, x: &Vector<f64>) -> Vec<f64> {
        let likelihoods: Vec<f64> = self
            .weights
            .iter()
            .zip(self.distributions.iter())
            .map(|(w, dist)| w * dist.pdf(x))
            .collect();
        let total = likelihoods.iter().sum::<f64>();
        if !total.is_finite() || total <= 0.0 {
            let k = self.weights.len();
            return vec![1.0 / k as f64; k];
        }
        likelihoods.into_iter().map(|v| v / total).collect()
    }

    fn predict(&self, x: &Vector<f64>) -> usize {
        self.predict_proba(x)
            .into_iter()
            .enumerate()
            .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal))
            .map(|(idx, _)| idx)
            .unwrap_or(0)
    }

    fn expectation(&self, data: &[Vector<f64>]) -> Vec<Vector<f64>> {
        data.iter()
            .map(|x| {
                let log_probs: Vec<f64> = self
                    .weights
                    .iter()
                    .zip(self.distributions.iter())
                    .map(|(w, dist)| w.ln() + dist.log_pdf(x))
                    .collect();

                let max_log_prob = log_probs.iter().copied().fold(f64::NEG_INFINITY, f64::max);
                let exps: Vec<f64> = log_probs
                    .iter()
                    .map(|lp| (lp - max_log_prob).exp())
                    .collect();
                let sum_exp = exps.iter().sum::<f64>();
                if !sum_exp.is_finite() || sum_exp <= 0.0 {
                    return Vector::new(vec![1.0 / self.weights.len() as f64; self.weights.len()]);
                }
                Vector::new(exps.into_iter().map(|v| v / sum_exp).collect())
            })
            .collect()
    }

    fn maximization(
        &mut self,
        responsibilities: &[Vector<f64>],
        data: &[Vector<f64>],
    ) -> StatisticsResult<()> {
        let n = data.len();
        let k = self.weights.len();
        let dim = data[0].len();
        let eps = 1e-12;

        let mut new_weights = Vec::with_capacity(k);
        let mut new_distributions = Vec::with_capacity(k);

        for j in 0..k {
            let resp_sum_raw = responsibilities.iter().map(|r| r[j]).sum::<f64>();
            let resp_sum = resp_sum_raw.max(eps);
            new_weights.push(resp_sum / n as f64);

            let new_mean = data
                .iter()
                .zip(responsibilities.iter())
                .fold(Vector::zeros(dim), |acc, (x_i, r_i)| acc + (x_i * r_i[j]))
                * (1.0 / resp_sum);

            let mut cov = data.iter().zip(responsibilities.iter()).fold(
                Matrix::zeros(dim, dim),
                |acc, (x_i, r_i)| {
                    let diff = x_i - &new_mean;
                    acc + (&(&diff * &diff.transpose()) * r_i[j])
                },
            ) * (1.0 / resp_sum);
            cov = &cov + &(&Matrix::identity(dim) * 1e-6);

            let dist = Self::new_gaussian_with_jitter(new_mean, cov)?;
            new_distributions.push(dist);
        }

        let sum_w = new_weights.iter().sum::<f64>().max(eps);
        self.weights = new_weights.into_iter().map(|w| w / sum_w).collect();
        self.distributions = new_distributions;
        Ok(())
    }
}

pub fn run_gmm_fit(
    data: &[Vector<f64>],
    k: usize,
    max_iter: usize,
    tol: f64,
) -> StatisticsResult<GaussianMixtureFitResult> {
    if data.is_empty() {
        return Err(StatisticsError::EmptyInput);
    }
    if max_iter == 0 {
        return Err(StatisticsError::InvalidParameter {
            what: "gmm max_iter",
            value: "must be > 0".to_string(),
        });
    }
    if !tol.is_finite() || tol <= 0.0 {
        return Err(StatisticsError::InvalidParameter {
            what: "gmm tol",
            value: format!("must be positive finite, got {}", tol),
        });
    }

    let gmm = GaussianMixtureModel::fit(data, k, max_iter, tol)?;
    let means = gmm
        .distributions
        .iter()
        .map(|d| d.mean().as_slice().to_vec())
        .collect::<Vec<_>>();
    let covariance_diagonals = gmm
        .distributions
        .iter()
        .map(|d| matrix_diag(&d.covariance()))
        .collect::<Vec<_>>();
    let assignments = data.iter().map(|x| gmm.predict(x)).collect::<Vec<_>>();
    let log_likelihood = gmm.log_likelihood(data);

    Ok(GaussianMixtureFitResult {
        weights: gmm.weights.clone(),
        means,
        covariance_diagonals,
        assignments,
        log_likelihood,
    })
}

pub fn run_gmm_pdf(
    data: &[Vector<f64>],
    x: &Vector<f64>,
    k: usize,
    max_iter: usize,
    tol: f64,
) -> StatisticsResult<f64> {
    let gmm = GaussianMixtureModel::fit(data, k, max_iter, tol)?;
    Ok(gmm.log_pdf(x).exp())
}

pub fn run_gmm_log_pdf(
    data: &[Vector<f64>],
    x: &Vector<f64>,
    k: usize,
    max_iter: usize,
    tol: f64,
) -> StatisticsResult<f64> {
    let gmm = GaussianMixtureModel::fit(data, k, max_iter, tol)?;
    Ok(gmm.log_pdf(x))
}

pub fn run_gmm_predict_proba(
    data: &[Vector<f64>],
    x: &Vector<f64>,
    k: usize,
    max_iter: usize,
    tol: f64,
) -> StatisticsResult<Vec<f64>> {
    let gmm = GaussianMixtureModel::fit(data, k, max_iter, tol)?;
    Ok(gmm.predict_proba(x))
}

pub fn run_gmm_predict(
    data: &[Vector<f64>],
    x: &Vector<f64>,
    k: usize,
    max_iter: usize,
    tol: f64,
) -> StatisticsResult<usize> {
    let gmm = GaussianMixtureModel::fit(data, k, max_iter, tol)?;
    Ok(gmm.predict(x))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn logistic_regression_learns_simple_separable_data() {
        let x = Matrix::new(4, 1, vec![0.0, 1.0, 2.0, 3.0]).unwrap();
        let y = Vector::new(vec![0.0, 0.0, 1.0, 1.0]);

        let result = logistic_regression(&x, &y, 0.1, 5000).unwrap();

        assert_eq!(result.predictions, vec![0.0, 0.0, 1.0, 1.0]);
        assert!(result.probabilities[0] < 0.5);
        assert!(result.probabilities[3] > 0.5);
        assert_eq!(result.coefficients.len(), 2);
    }

    #[test]
    fn kalman_filter_tracks_1d_position() {
        let initial_x = Vector::new(vec![0.0, 1.0]);
        let initial_p = Matrix::identity(2);
        let f = Matrix::new(2, 2, vec![1.0, 1.0, 0.0, 1.0]).unwrap();
        let h = Matrix::new(1, 2, vec![1.0, 0.0]).unwrap();
        let q = Matrix::new(2, 2, vec![1e-3, 0.0, 0.0, 1e-3]).unwrap();
        let r = Matrix::new(1, 1, vec![0.1]).unwrap();
        let observations = vec![
            Vector::new(vec![1.0]),
            Vector::new(vec![2.0]),
            Vector::new(vec![3.0]),
        ];

        let out = run_kalman_filter(initial_x, initial_p, f, h, q, r, &observations).unwrap();
        assert_eq!(out.states.len(), 3);
        assert_eq!(out.covariance_diagonals.len(), 3);
        let last = out.states.last().unwrap();
        assert!((last[0] - 3.0).abs() < 0.2);
    }

    #[test]
    fn gmm_fit_separates_two_1d_clusters() {
        let data = vec![
            Vector::new(vec![-0.1]),
            Vector::new(vec![0.0]),
            Vector::new(vec![0.2]),
            Vector::new(vec![9.8]),
            Vector::new(vec![10.0]),
            Vector::new(vec![10.2]),
        ];

        let out = run_gmm_fit(&data, 2, 100, 1e-6).unwrap();
        assert_eq!(out.weights.len(), 2);
        assert_eq!(out.means.len(), 2);
        assert_eq!(out.assignments.len(), data.len());
        // Means should be separated enough for two obvious clusters.
        let mut m = out.means.iter().map(|v| v[0]).collect::<Vec<_>>();
        m.sort_by(|a, b| a.partial_cmp(b).unwrap());
        assert!(m[1] - m[0] > 5.0);
    }

    #[test]
    fn ridge_regression_fits_simple_line() {
        let a = Matrix::new(4, 2, vec![1.0, 0.0, 1.0, 1.0, 1.0, 2.0, 1.0, 3.0]).unwrap();
        let b = Vector::new(vec![1.0, 3.0, 5.0, 7.0]);

        let out = ridge_regression(&a, &b, 1e-6).unwrap();
        assert_eq!(out.coefficients.len(), 2);
        assert!(out.coefficients[1] > 1.5);
    }

    #[test]
    fn bayesian_em_runs_on_small_system() {
        let y = Vector::new(vec![1.0, 2.0, 3.0]);
        let h = Matrix::new(3, 2, vec![1.0, 0.0, 1.0, 1.0, 1.0, 2.0]).unwrap();

        let out = run_bayesian_em(&y, &h, 50, 1e-6).unwrap();
        assert_eq!(out.prior_mean.len(), 2);
        assert_eq!(out.prior_covariance.len(), 2);
        assert_eq!(out.noise_covariance.len(), 3);
    }

    #[test]
    fn ols_solver_matches_simple_system() {
        let a = Matrix::new(3, 2, vec![1.0, 0.0, 1.0, 1.0, 1.0, 2.0]).unwrap();
        let b = Vector::new(vec![1.0, 2.0, 3.0]);

        let out = solve_linear_system_ols(&a, &b).unwrap();
        assert_eq!(out.coefficients.len(), 2);
        assert!(out.coefficients[0].is_finite());
        assert!(out.coefficients[1].is_finite());
    }
}
