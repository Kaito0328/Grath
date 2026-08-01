use algebraic::{complex::SymbolicComplex, expr::SymbolicExpr, rational::Rational};

#[test]
fn test_add_flatten() {
    let e = SymbolicExpr::add(vec![
        SymbolicExpr::int(1),
        SymbolicExpr::add(vec![SymbolicExpr::int(2), SymbolicExpr::int(3)]),
        SymbolicExpr::int(4),
    ])
    .simplify();
    assert_eq!(format!("{}", e), "10");
}

#[test]
fn test_mul_flatten_and_zero() {
    let e = SymbolicExpr::mul(vec![
        SymbolicExpr::int(5),
        SymbolicExpr::mul(vec![SymbolicExpr::int(2), SymbolicExpr::int(0)]),
    ])
    .simplify();
    assert_eq!(format!("{}", e), "0");
}

#[test]
fn test_pow_simplify() {
    let base = SymbolicExpr::int(3);
    let e = SymbolicExpr::pow(base, SymbolicExpr::int(1));
    assert_eq!(format!("{}", e), "3");
}

#[test]
fn test_complex_display_real_only() {
    let c = SymbolicComplex::from_real(SymbolicExpr::int(7));
    assert_eq!(format!("{}", c), "7");
}

#[test]
fn test_complex_display_imag_only() {
    let c = SymbolicComplex::new(SymbolicExpr::int(0), SymbolicExpr::int(1));
    assert_eq!(format!("{}", c), "i");
    let c2 = SymbolicComplex::new(SymbolicExpr::int(0), SymbolicExpr::int(-1));
    assert_eq!(format!("{}", c2), "-i");
    let c3 = SymbolicComplex::new(SymbolicExpr::int(0), SymbolicExpr::int(5));
    assert_eq!(format!("{}", c3), "5i");
}

#[test]
fn test_complex_display_general() {
    let c = SymbolicComplex::new(SymbolicExpr::int(2), SymbolicExpr::int(3));
    assert_eq!(format!("{}", c), "2 + 3i");
    let c2 = SymbolicComplex::new(SymbolicExpr::int(2), SymbolicExpr::int(-3));
    assert_eq!(format!("{}", c2), "2 - 3i");
    let c3 = SymbolicComplex::new(SymbolicExpr::int(2), SymbolicExpr::rational(1, 2));
    assert_eq!(format!("{}", c3), "2 + 1/2i");
}

#[test]
fn test_rational_add_partial_reduction() {
    let r1 = Rational::new(1, 6); // 1/6
    let r2 = Rational::new(1, 15); // 1/15
    let s = r1 + r2; // should be 7/30 (dirty then display simplified)
    assert_eq!(format!("{}", s), "7/30");
}
