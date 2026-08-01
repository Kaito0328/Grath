pub trait GrathCrateApi {
    const CRATE_NAME: &'static str;
}

pub trait GrathTypeApi {
    type Target;
    const TS_NAME: &'static str;
}

/// Explicit opt-in for the serde/DTO WASM boundary.  Implement this on a
/// public type which also derives both `serde::Serialize` and
/// `serde::Deserialize`.  Keeping it as a Rust trait (rather than a custom
/// attribute) makes the marker compile on stable Rust and discoverable by the
/// inspector.
pub trait GrathDto {}
