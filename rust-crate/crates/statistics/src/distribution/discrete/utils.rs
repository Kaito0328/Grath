use crate::distribution::discrete::core::Distribution;
use num_traits::PrimInt;
use std::fmt::Debug;

pub fn find_quantile_bs<F, D>(p: f64, distribution: &D, lower: F, higher: F) -> F
where
    F: PrimInt + Debug,
    D: Distribution<Item = F>,
{
    let mut result = F::zero();
    let mut low = lower;
    let mut high = higher;
    let two = F::from(2u8).unwrap();

    while low <= high {
        let mid = low + (high - low) / two;
        if distribution.cdf(mid) >= p {
            result = mid;
            if mid == F::zero() {
                break;
            }
            high = mid - F::one();
        } else {
            low = mid + F::one();
        }
    }
    result
}
