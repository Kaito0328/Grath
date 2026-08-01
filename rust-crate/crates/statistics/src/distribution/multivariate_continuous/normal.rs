use crate::distribution::{
    continuous::{core::Distribution, normal::Normal},
    multivariate_continuous::core::MultivariateDistribution,
};
use crate::error::{Result, StatisticsError};
use linalg::{matrix::numerical::CholeskyDecomposition, Matrix, Vector};
use rand::Rng;
use std::f64::consts::PI;
use std::panic::{catch_unwind, AssertUnwindSafe};

pub struct MultivariateNormal {
    mean: Vector<f64>,
    cholesky_l: Matrix<f64>,
    log_det_cov: f64,
}

impl MultivariateNormal {
    pub fn new(mean: Vector<f64>, covariance: Matrix<f64>) -> Result<Self> {
        let dim = mean.len();
        if covariance.rows != dim || covariance.cols != dim {
            return Err(StatisticsError::InvalidParameter {
                what: "MultivariateNormal::covariance",
                value: format!("{}x{}", covariance.rows, covariance.cols),
            });
        }

        let chol_attempt = catch_unwind(AssertUnwindSafe(|| covariance.cholesky()));
        match chol_attempt {
            Ok(Ok(l)) => {
                let log_det_cov = 2.0 * (0..dim).map(|i| l[(i, i)].ln()).sum::<f64>();
                Ok(Self {
                    mean,
                    cholesky_l: l,
                    log_det_cov,
                })
            }
            _ => Err(StatisticsError::DomainError {
                what: "MultivariateNormal::covariance",
                details: "matrix must be positive-definite",
            }),
        }
    }
}

impl MultivariateDistribution for MultivariateNormal {
    type Item = Vector<f64>;

    fn mean(&self) -> Vector<f64> {
        self.mean.clone()
    }

    fn covariance(&self) -> Matrix<f64> {
        &self.cholesky_l * &self.cholesky_l.transpose()
    }

    fn mode(&self) -> Option<Self::Item> {
        Some(self.mean.clone())
    }

    fn pdf(&self, x: &Self::Item) -> f64 {
        self.log_pdf(x).exp()
    }

    fn log_pdf(&self, x: &Self::Item) -> f64 {
        let diff = x - &self.mean;
        let d = self.mean.len() as f64;

        let z = self
            .cholesky_l
            .forward_substitution(&diff)
            .expect("substitution failed");
        let y = self
            .cholesky_l
            .transpose()
            .backward_substitution(&z)
            .expect("substitution failed");

        let quad_form = diff.dot(&y);
        -0.5 * (d * (2.0 * PI).ln() + self.log_det_cov + quad_form)
    }

    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Self::Item {
        let mut normal = Normal::new(0.0, 1.0).unwrap();
        let zs = Vector::new((0..self.mean.len()).map(|_| normal.sample(rng)).collect());
        &self.mean + &(&self.cholesky_l * &zs)
    }
}
