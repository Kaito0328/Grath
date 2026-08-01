//! Rust boundary type model and codec decisions shared by WASM, TS, and test generators.
//!
//! Generators should depend on this module for Rust type parsing/classification instead of
//! adding generator-local type parsers. Generator-specific rendering can stay near each
//! generator, but the meaning of a Rust type at the WASM/TS/test boundary belongs here.

pub mod registry;
pub mod type_api;
pub mod type_model;

pub use registry::{
    BoundaryCodec, BoundaryKind, BoundaryMode, CodecPlan, CodecRegistry, UnsupportedReason,
};
pub use type_api::{
    is_matrix_type, is_string_boundary_type, is_type_api_string_arg, is_type_api_target,
    rust_string_boundary_encoder, to_snake_case, type_api_export_name,
};
pub use type_model::{parse_arg_type, RustPathType, RustPrimitive, RustType};
