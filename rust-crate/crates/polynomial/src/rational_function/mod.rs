mod core;
mod solver;
mod symbolic;

// Public re-exports for external use
pub use core::RationalFunction;
pub use solver::{PartialFractionExpansion, PoleTerm};
pub use symbolic::*;
