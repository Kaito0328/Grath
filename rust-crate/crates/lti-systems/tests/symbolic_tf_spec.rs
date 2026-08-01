use algebraic::complex::SymbolicComplex as C;
use algebraic::expr::SymbolicExpr as E;
use algebraic::rational::Rational as Q;
use lti_systems::{Polynomial, SymbolicContinuousTF, SymbolicDiscreteTF};

fn q(n: i64) -> Q {
    Q::from_int(n)
}

#[test]
fn continuous_poles_zeros_symbolic() {
    // G(s) = (s + 1) / (s^2 + 5s + 6) → zeros={-1}, poles={-2,-3}
    let b = Polynomial::new(vec![q(1), q(1)]);
    let a = Polynomial::new(vec![q(6), q(5), q(1)]);
    let tf = SymbolicContinuousTF::new(b, a);
    let z = tf.zeros_symbolic();
    let p = tf.poles_symbolic();
    assert_eq!(z.len(), 1);
    assert!(format!("{}", z[0].re).contains("-1"));
    assert_eq!(p.len(), 2);
    let ps: Vec<String> = p.iter().map(|c| format!("{}", c.re)).collect();
    assert!(ps.iter().any(|s| s.contains("-2")));
    assert!(ps.iter().any(|s| s.contains("-3")));
}

#[test]
fn continuous_quadratic_symbolic() {
    // G(s) = 1 / (s^2 - 2s + 2) → poles = 1 ± i
    let b = Polynomial::new(vec![q(1)]);
    let a = Polynomial::new(vec![q(2), q(-2), q(1)]);
    let tf = SymbolicContinuousTF::new(b, a);
    let p = tf.poles_symbolic();
    assert_eq!(p.len(), 2);
    // re == 1, |im| == 1
    for r in p {
        assert!(format!("{}", r.re).contains("1"));
        let im_s = format!("{}", r.im);
        assert!(im_s.contains("1") || im_s.contains("-1"));
    }
}

#[test]
fn discrete_zeros_poles_symbolic() {
    // H(z) = (z + 1) / (z^2 + z + 1) → zeros={-1}, poles = exp(±j 2π/3)
    let b = Polynomial::new(vec![q(1), q(1)]);
    let a = Polynomial::new(vec![q(1), q(1), q(1)]);
    let tf = SymbolicDiscreteTF::new(b, a);
    let z = tf.zeros_symbolic();
    assert_eq!(z.len(), 1);
    assert!(format!("{}", z[0].re).contains("-1"));
    let p = tf.poles_symbolic();
    assert_eq!(p.len(), 2);
}
