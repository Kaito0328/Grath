pub mod adaptive_filter;
pub mod api;
pub mod dft;
pub mod error;
pub mod fir;
pub mod iir;
pub mod image;
pub mod media;
pub mod plot;
pub mod sampling;
pub mod signal;
pub mod window;
pub mod prelude {
    pub use crate::error::{Result as SignalResult, SignalError};
}

pub use adaptive_filter::{AdaptiveFilterLMS, AdaptiveFilterNLMS};
pub use api::SignalProcessingApi;
pub use fir::FIRFilter;
pub use iir::IIRFilter;
pub use signal::{Signal, Spectrum};
