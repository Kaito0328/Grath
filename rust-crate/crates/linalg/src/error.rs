use std::fmt;

use common::error::{AppError, ToAppError};

#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum LinalgError {
    DimensionMismatch { expected: String, found: String },
    NotSquareMatrix,
    SingularMatrix,
    IndexOutOfBounds { index: usize, size: usize },
    InvalidDimension { dim: usize, text: String },
    NotImplemented,
    InvalidArgument { text: String },
    ExactSizeLimit { max: usize, text: String },
}

impl fmt::Display for LinalgError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            LinalgError::DimensionMismatch { expected, found } => {
                write!(f, "Dimension mismatch: expected {expected}, found {found}",)
            }
            LinalgError::NotSquareMatrix => write!(f, "Operation requires a square matrix"),
            LinalgError::SingularMatrix => write!(f, "Matrix is singular (not invertible)"),
            LinalgError::IndexOutOfBounds { index, size } => {
                write!(f, "Index {index} is out of bounds for size {size}")
            }
            LinalgError::InvalidDimension { dim, text } => {
                write!(f, "Invalid dimension ({dim}): {text}")
            }
            LinalgError::NotImplemented => write!(f, "Feature not yet implemented"),
            LinalgError::InvalidArgument { text } => write!(f, "Invalid argument: {text}"),
            LinalgError::ExactSizeLimit { max, text } => {
                write!(
                    f,
                    "Exact computation is supported only up to {max} (got larger). {text}"
                )
            }
        }
    }
}

impl std::error::Error for LinalgError {}

impl ToAppError for LinalgError {
    fn to_app_error(&self, details: Option<String>) -> AppError {
        match self {
            LinalgError::DimensionMismatch { expected, found } => AppError::new(
                "LINALG_DIMENSION_MISMATCH".to_string(),
                format!("Dimension mismatch: expected {expected}, found {found}"),
                details,
            ),
            LinalgError::NotSquareMatrix => AppError::new(
                "LINALG_NOT_SQUARE_MATRIX".to_string(),
                self.to_string(),
                details,
            ),
            LinalgError::SingularMatrix => AppError::new(
                "LINALG_SINGULAR_MATRIX".to_string(),
                self.to_string(),
                details,
            ),
            LinalgError::IndexOutOfBounds { index, size } => AppError::new(
                "LINALG_INDEX_OUT_OF_BOUNDS".to_string(),
                format!("Index {index} is out of bounds for size {size}"),
                details,
            ),
            LinalgError::InvalidDimension { dim, text } => AppError::new(
                "LINALG_INVALID_DIMENSION".to_string(),
                format!("Invalid dimension ({dim}): {text}"),
                details,
            ),
            LinalgError::NotImplemented => AppError::new(
                "LINALG_NOT_IMPLEMENTED".to_string(),
                self.to_string(),
                details,
            ),
            LinalgError::InvalidArgument { text } => AppError::new(
                "LINALG_INVALID_ARGUMENT".to_string(),
                format!("Invalid argument: {text}"),
                details,
            ),
            LinalgError::ExactSizeLimit { max, text } => AppError::new(
                "LINALG_EXACT_SIZE_LIMIT".to_string(),
                format!("Exact computation is supported only up to {max}. {text}"),
                details,
            ),
        }
    }
}

pub type Result<T> = std::result::Result<T, LinalgError>;
