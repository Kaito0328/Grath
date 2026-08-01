use statistics::distribution::continuous::core::Distribution as ContDist;
use statistics::distribution::continuous::normal::Normal;
use statistics::distribution::discrete::binomial::Binomial;
use statistics::distribution::discrete::core::Distribution as DiscDist;
use statistics::distribution::discrete::poisson::Poisson;

#[test]
fn test_normal_dist() {
    let n = Normal::new(0.0, 1.0).unwrap();
    assert_eq!(n.pdf(0.0), 1.0 / (2.0 * std::f64::consts::PI).sqrt());
    assert!((n.cdf(0.0) - 0.5).abs() < 1e-9);
    assert!((n.quantile(0.5) - 0.0).abs() < 1e-9);
}

#[test]
fn test_binomial_dist() {
    let b = Binomial::new(10, 0.5).unwrap();
    assert!((b.pmf(5) - 0.24609375).abs() < 1e-9);
}

#[test]
fn test_poisson_dist() {
    let p = Poisson::new(1.0).unwrap();
    assert!((p.pmf(0) - (-1.0_f64).exp()).abs() < 1e-9);
}
