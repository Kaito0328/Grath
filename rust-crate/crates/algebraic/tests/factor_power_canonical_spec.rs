use algebraic::expr::SymbolicExpr as E;

fn x() -> E {
    E::Symbol("x".into())
}

#[test]
fn duplicate_symbol_becomes_pow2() {
    let e = E::mul(vec![x(), x()]).simplify();
    assert_eq!(e.to_string(), "x^{2}");
}

#[test]
fn triple_symbol_becomes_pow3() {
    let e = E::mul(vec![x(), x(), x()]).simplify();
    assert_eq!(e.to_string(), "x^{3}");
}

#[test]
fn duplicate_sum_factor_becomes_squared() {
    let a = E::add(vec![E::int(1), x()]);
    let e = E::mul(vec![a.clone(), a]).simplify();
    assert_eq!(e.to_string(), "(1 + x)^{2}");
}

#[test]
fn coefficient_times_duplicate_symbol() {
    let e = E::mul(vec![E::int(2), x(), x()]).simplify();
    assert_eq!(e.to_string(), "2x^{2}");
}

#[test]
fn different_factors_do_not_combine() {
    let e = E::mul(vec![x(), E::add(vec![E::int(1), x()])]).simplify();
    assert_eq!(e.to_string(), "x(1 + x)");
}
