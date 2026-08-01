pub mod complex;
pub mod error;
pub mod expr;
mod latex;
pub mod rational;
pub mod traits;
pub mod prelude {
    pub use crate::complex::SymbolicComplex;
    pub use crate::expr::parser::Token;
    pub use crate::expr::SymbolicExpr;
    pub use crate::rational::Rational;
    pub use crate::traits::{Field, Ring, Scalar};
}
