use crate::distribution::{
    continuous::{core::Distribution, gamma::Gamma, normal::Normal},
    multivariate_continuous::core::MultivariateDistribution,
};
use crate::error::{Result, StatisticsError};
use linalg::{matrix::numerical::CholeskyDecomposition, Matrix, Vector};
use special_functions::gamma::log_gamma;
use std::f64::consts::PI;
use std::panic::{catch_unwind, AssertUnwindSafe};

pub struct MultivariateT {
    nu: f64,
    mu: Vector<f64>,
    cholesky_l: Matrix<f64>,
    log_det_cov: f64,
}

impl MultivariateT {
    pub fn new(nu: f64, mu: Vector<f64>, sigma: Matrix<f64>) -> Result<Self> {
        let dim = mu.len();
        if sigma.rows != dim || sigma.cols != dim {
            return Err(StatisticsError::InvalidParameter {
                what: "MultivariateT::sigma",
                value: format!("{}x{}", sigma.rows, sigma.cols),
            });
        }
        if nu <= 0.0 {
            return Err(StatisticsError::InvalidParameter {
                what: "MultivariateT::nu",
                value: nu.to_string(),
            });
        }
        let chol_attempt = catch_unwind(AssertUnwindSafe(|| sigma.cholesky()));
        match chol_attempt {
            Ok(Ok(l)) => {
                let log_det_cov = 2.0 * (0..dim).map(|i| l[(i, i)].ln()).sum::<f64>();
                Ok(Self {
                    nu,
                    mu,
                    cholesky_l: l,
                    log_det_cov,
                })
            }
            _ => Err(StatisticsError::DomainError {
                what: "MultivariateT::sigma",
                details: "matrix must be positive-definite",
            }),
        }
    }
}

impl MultivariateDistribution for MultivariateT {
    type Item = Vector<f64>;

    fn mean(&self) -> Vector<f64> {
        self.mu.clone()
    }

    fn covariance(&self) -> Matrix<f64> {
        if self.nu <= 2.0 {
            return Matrix::zeros(self.mu.len(), self.mu.len());
        }
        &(&self.cholesky_l * &self.cholesky_l.transpose()) * (self.nu / (self.nu - 2.0))
    }

    fn mode(&self) -> Option<Self::Item> {
        Some(self.mu.clone())
    }

    fn pdf(&self, x: &Self::Item) -> f64 {
        self.log_pdf(x).exp()
    }

    fn log_pdf(&self, x: &Self::Item) -> f64 {
        let nu = self.nu;
        let d = self.mu.len() as f64;
        let coeff = log_gamma((nu + d) / 2.0)
            - log_gamma(nu / 2.0)
            - 0.5 * d * (nu * PI).ln()
            - 0.5 * self.log_det_cov;

        let diff = x - &self.mu;
        let z = self.cholesky_l.forward_substitution(&diff).unwrap();
        let y = self
            .cholesky_l
            .transpose()
            .backward_substitution(&z)
            .unwrap();

        coeff - (nu + d) / 2.0 * (1.0 + diff.dot(&y) / nu).ln()
    }

    fn sample<R: rand::Rng + ?Sized>(&self, rng: &mut R) -> Self::Item {
        let mut gamma_dist = Gamma::new(self.nu / 2.0, 0.5).unwrap();
        let u = gamma_dist.sample(rng);
        let mut normal = Normal::new(0.0, 1.0).unwrap();
        let zs = Vector::new((0..self.mu.len()).map(|_| normal.sample(rng)).collect());
        let y = &self.cholesky_l * &zs;
        &self.mu + &(y * (1.0 / (u / self.nu).sqrt()))
    }
}
