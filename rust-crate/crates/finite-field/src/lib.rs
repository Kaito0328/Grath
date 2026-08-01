pub mod api;
pub mod field2m;
pub mod gf256;
pub mod gfext;
pub mod gfp;
pub mod primitive;
pub mod prelude {
    pub use crate::error::{FieldError, Result as FieldResult};
}
pub mod error;

pub use field2m::FiniteField2m;
pub use gf256::{PolyGF256, GF256};
pub use gfext::GFExt;
pub use gfp::GFp;

pub use api::FiniteFieldApi;
