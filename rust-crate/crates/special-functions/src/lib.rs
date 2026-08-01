pub mod beta;
pub mod erf;
pub mod gamma;

pub mod prelude {
    pub use crate::beta::{beta, log_beta, regularized_beta};
    pub use crate::erf::{calc_quantile_acklam, erf, erf_inv, erfc};
    pub use crate::gamma::{gamma, log_gamma, regularized_gamma};
}
