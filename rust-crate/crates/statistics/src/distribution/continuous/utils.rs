use crate::distribution::continuous::core::Distribution;
use num_traits::Float;

pub fn calc_quantile_newton<F, D>(x_guess: F, p: f64, distribution: &D) -> F
where
    F: Float,
    D: Distribution<Item = F>,
{
    const MAX_ITER: usize = 100;
    let tol = F::from(1e-12).unwrap();
    let mut x = x_guess;

    for _ in 0..MAX_ITER {
        let fx = distribution.cdf(x) - p;
        if fx.abs() < 1e-12 {
            break;
        }

        let dfx = distribution.pdf(x);
        if dfx.abs() < 1e-100 {
            break;
        }

        let step_f64 = fx / dfx;
        let step = F::from(step_f64).unwrap();
        x = x - step;

        if step.abs() < tol {
            break;
        }
    }
    x
}
