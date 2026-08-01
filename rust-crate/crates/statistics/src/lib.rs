pub mod api;
pub mod common;
pub mod continuous_stats;
pub mod discrete_stats;
pub mod distribution;
pub mod error;
pub mod hypothesis;
pub mod modeling;
pub mod plot;

pub use error::{Result, StatisticsError};

// Re-exports for easier access in Wasm/External crates
pub use distribution::continuous::chi_square::ChiSquare;
pub use distribution::continuous::exponential::Exponential;
pub use distribution::continuous::f::F;
pub use distribution::continuous::gamma::Gamma;
pub use distribution::continuous::normal::Normal;
pub use distribution::continuous::t::T;
pub use distribution::continuous::uniform::Uniform;

pub use distribution::discrete::bernoulli::Bernoulli;
pub use distribution::discrete::binomial::Binomial;
pub use distribution::discrete::categorical::Categorical;
pub use distribution::discrete::poisson::Poisson;

pub use distribution::multivariate_continuous::dirichlet::Dirichlet;
pub use distribution::multivariate_continuous::normal::MultivariateNormal;
pub use distribution::multivariate_continuous::t::MultivariateT;

pub use distribution::multivariate_discrete::multinomial::Multinomial;

pub use api::StatisticsApi; // Re-exporting StatisticsApi for easier access
pub use hypothesis::*;
pub use modeling::KalmanFilter;
