use crate::distribution::{
    discrete::{categorical::Categorical, core::Distribution},
    multivariate_discrete::core::MultivariateDistribution,
};
use crate::error::{Result, StatisticsError};
use linalg::{Matrix, Vector};
use special_functions::gamma::log_gamma;

pub struct Multinomial {
    trials: usize,
    probabilities: Vector<f64>,
}

impl Multinomial {
    pub fn new(trials: usize, probabilities: Vector<f64>) -> Result<Self> {
        if probabilities.is_empty() {
            return Err(StatisticsError::EmptyInput);
        }
        let sum: f64 = probabilities.iter().sum();
        if (sum - 1.0).abs() > 1e-9 {
            return Err(StatisticsError::DomainError {
                what: "Multinomial::probabilities",
                details: "Probabilities must sum to 1",
            });
        }
        Ok(Self {
            trials,
            probabilities,
        })
    }
}

impl MultivariateDistribution for Multinomial {
    type Item = Vec<u64>;
    fn mean(&self) -> Vector<f64> {
        &self.probabilities * self.trials as f64
    }

    fn covariance(&self) -> Matrix<f64> {
        let k = self.probabilities.len();
        let n = self.trials as f64;
        let mut cov_data = Vec::with_capacity(k * k);

        for i in 0..k {
            for j in 0..k {
                if i == j {
                    cov_data.push(n * self.probabilities[i] * (1.0 - self.probabilities[i]));
                } else {
                    cov_data.push(-n * self.probabilities[i] * self.probabilities[j]);
                }
            }
        }
        Matrix::new(k, k, cov_data).unwrap()
    }

    fn mode(&self) -> Option<Self::Item> {
        let mean = self.mean();
        let mut mean_round: Vec<u64> = mean.iter().map(|&m| m.round() as u64).collect();
        let sum_round: u64 = mean_round.iter().sum();

        if sum_round < self.trials as u64 {
            for _ in 0..(self.trials as u64 - sum_round) as usize {
                if let Some((max_idx, _)) = self.probabilities.iter().enumerate().max_by(|a, b| {
                    (a.1 / (mean_round[a.0] as f64 + 1.0))
                        .partial_cmp(&(b.1 / (mean_round[b.0] as f64 + 1.0)))
                        .unwrap()
                }) {
                    mean_round[max_idx] += 1;
                }
            }
        } else if sum_round > self.trials as u64 {
            for _ in 0..(sum_round - self.trials as u64) as usize {
                if let Some((max_idx, _)) = self.probabilities.iter().enumerate().max_by(|a, b| {
                    (mean_round[a.0] as f64 / a.1)
                        .partial_cmp(&(mean_round[b.0] as f64 / b.1))
                        .unwrap()
                }) {
                    mean_round[max_idx] -= 1;
                }
            }
        }
        Some(mean_round)
    }

    fn pmf(&self, x: &Self::Item) -> f64 {
        self.log_pmf(x).exp()
    }

    fn log_pmf(&self, x: &Self::Item) -> f64 {
        assert_eq!(x.len(), self.probabilities.len(), "Dimension mismatch");
        assert_eq!(
            x.iter().sum::<u64>(),
            self.trials as u64,
            "Trials sum mismatch"
        );
        let mut log_pmf = log_gamma(self.trials as f64 + 1.0);
        for (k, p) in self.probabilities.iter().enumerate() {
            log_pmf += x[k] as f64 * p.ln() - log_gamma(x[k] as f64 + 1.0);
        }
        log_pmf
    }

    fn sample<R: rand::Rng + ?Sized>(&self, rng: &mut R) -> Self::Item {
        let categorical = Categorical::new(self.probabilities.as_slice().to_vec()).unwrap();
        let mut counts = vec![0; self.probabilities.len()];
        for _ in 0..self.trials {
            let outcome = categorical.sample(rng) as usize;
            counts[outcome] += 1;
        }
        counts
    }
}
