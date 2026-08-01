use serde::Serialize;
use std::fmt::Display;
use strum_macros::AsRefStr;
use thiserror::Error;

#[derive(Serialize, Debug)]
pub struct AppError {
    pub code: String,
    pub message: String,
    pub details: Option<String>,
}

impl AppError {
    pub fn new(code: String, message: String, details: Option<String>) -> Self {
        Self {
            code,
            message,
            details,
        }
    }
}

pub trait ToAppError {
    fn to_app_error(&self, details: Option<String>) -> AppError;
}

impl<T> ToAppError for T
where
    T: Display + AsRef<str>,
{
    fn to_app_error(&self, details: Option<String>) -> AppError {
        AppError::new(self.as_ref().to_string(), self.to_string(), details)
    }
}

#[derive(Debug, Error, AsRefStr)]
pub enum CommonError {
    #[error("Invalid input provided.")]
    InvalidInput,
    #[error("Resource not found.")]
    NotFound,
    #[error("Internal server error occurred.")]
    InternalServerError,
}
