use std::fmt;

use common::error::{AppError, ToAppError};

#[derive(Debug, Clone)]
pub enum SignalError {
    InvalidArgument { text: String },
    NotImplemented,
}

impl fmt::Display for SignalError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SignalError::InvalidArgument { text } => write!(f, "Invalid argument: {text}"),
            SignalError::NotImplemented => write!(f, "Feature not yet implemented"),
        }
    }
}

impl std::error::Error for SignalError {}

impl ToAppError for SignalError {
    fn to_app_error(&self, details: Option<String>) -> AppError {
        match self {
            SignalError::InvalidArgument { text } => AppError::new(
                "SIGNAL_PROCESSING_INVALID_ARGUMENT".to_string(),
                text.clone(),
                details,
            ),
            SignalError::NotImplemented => AppError::new(
                "SIGNAL_PROCESSING_NOT_IMPLEMENTED".to_string(),
                self.to_string(),
                details,
            ),
        }
    }
}

pub type Result<T> = std::result::Result<T, SignalError>;
