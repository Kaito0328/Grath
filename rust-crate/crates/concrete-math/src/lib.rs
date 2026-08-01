pub mod api;
pub mod combinatorics;
pub mod error;
pub mod number_theory;
pub mod sequence;
pub mod sum;
pub mod symbolic;

#[cfg(test)]
mod tests;

pub mod prelude {
    pub use crate::error::{ConcreteMathError, Result as ConcreteMathResult};
}

pub use api::ConcreteMathApi;
pub use sequence::core::ClosedForm;
pub use sequence::recurrence_relation::RecurrenceRelation;
