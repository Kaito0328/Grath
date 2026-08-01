pub mod core;
pub mod prime_factorization;

pub mod prelude {
    pub use crate::core::*;
    pub use crate::prime_factorization::*;
}

#[derive(Debug, thiserror::Error)]
pub enum NumberTheoryError {
    #[error("Invalid argument: {0}")]
    InvalidArgument(String),
}

pub type Result<T> = std::result::Result<T, NumberTheoryError>;
