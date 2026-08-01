use thiserror::Error;

#[derive(Debug, Clone, PartialEq, Error)]
pub enum StatisticsError {
    #[error("Invalid parameter for {what}: {value}")]
    InvalidParameter { what: &'static str, value: String },
    #[error("Domain error in {what}: {details}")]
    DomainError {
        what: &'static str,
        details: &'static str,
    },
    #[error("Input data is empty")]
    EmptyInput,
}

pub type Result<T> = std::result::Result<T, StatisticsError>;
