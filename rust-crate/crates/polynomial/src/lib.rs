#[macro_use]
pub mod macros;
pub mod api;
pub mod core;
pub mod format;
pub mod rational_function;
pub mod solver;
pub mod solver_expr;
pub mod solver_numeric;

pub mod prelude {
    pub use crate::core::*;
    pub use crate::solver::*;
    pub use crate::solver_numeric::*;
}

pub use api::PolynomialApi;
