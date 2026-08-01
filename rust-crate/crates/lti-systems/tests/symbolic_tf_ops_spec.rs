use algebraic::rational::Rational as R;
use lti_systems::{SymbolicContinuousTF, SymbolicDiscreteTF};

fn r(n: i64) -> R {
    R::from_int(n)
}

#[test]
fn series_parallel_feedback_continuous() {
    // G1(s) = (s+1)/(s+2), G2(s) = (s+3)/(s+4)
    let g1 = SymbolicContinuousTF::from_coeffs(vec![r(1), r(1)], vec![r(2), r(1)]);
    let g2 = SymbolicContinuousTF::from_coeffs(vec![r(3), r(1)], vec![r(4), r(1)]);

    // series: zeros = {-1, -3}, poles = {-2, -4}
    let gs = g1.series(&g2);
    let mut zs = gs
        .zeros_symbolic()
        .into_iter()
        .map(|z| z.to_string())
        .collect::<Vec<_>>();
    zs.sort();
    assert_eq!(zs, vec!["-1", "-3"]);
    let mut ps = gs
        .poles_symbolic()
        .into_iter()
        .map(|z| z.to_string())
        .collect::<Vec<_>>();
    ps.sort();
    assert_eq!(ps, vec!["-2", "-4"]);

    // feedback unity on G1: H = G1/(1+G1) = (s+1)/(2s+3)
    let h = g1.feedback_unity();
    let zs_h = h
        .zeros_symbolic()
        .into_iter()
        .map(|z| z.to_string())
        .collect::<Vec<_>>();
    assert_eq!(zs_h, vec!["-1"]);
    let ps_h = h
        .poles_symbolic()
        .into_iter()
        .map(|z| z.to_string())
        .collect::<Vec<_>>();
    assert_eq!(ps_h, vec!["-3/2"]);

    // parallel: basic sanity on denominator coefficients: (s+2)(s+4) = s^2+6s+8
    let gp = g1.parallel(&g2);
    let a = gp.a_coeffs();
    assert_eq!(a.len(), 3);
    assert_eq!(a[0].to_string(), "8");
    assert_eq!(a[1].to_string(), "6");
    assert_eq!(a[2].to_string(), "1");
}

#[test]
fn series_discrete() {
    // H1(z) = (z+1)/(z+2), H2(z) = (z+3)/(z+4)
    let h1 = SymbolicDiscreteTF::from_coeffs(vec![r(1), r(1)], vec![r(2), r(1)]);
    let h2 = SymbolicDiscreteTF::from_coeffs(vec![r(3), r(1)], vec![r(4), r(1)]);
    let hs = h1.series(&h2);
    let mut zs = hs
        .zeros_symbolic()
        .into_iter()
        .map(|z| z.to_string())
        .collect::<Vec<_>>();
    zs.sort();
    assert_eq!(zs, vec!["-1", "-3"]);
    let mut ps = hs
        .poles_symbolic()
        .into_iter()
        .map(|z| z.to_string())
        .collect::<Vec<_>>();
    ps.sort();
    assert_eq!(ps, vec!["-2", "-4"]);
}
