pub mod api;
pub mod error;

pub mod prelude {
    pub use crate::api::{GrathCrateApi, GrathDto, GrathTypeApi};
    pub use crate::error::{AppError, CommonError, ToAppError};
}
