use algebraic::expr::SymbolicExpr as E;

fn r(n: i64, d: i64) -> E {
    E::rational(n, d)
}
fn sqrt(e: E) -> E {
    E::pow(e, E::rational(1, 2))
}

#[test]
fn test_sqrt_12() {
    let e = sqrt(r(12, 1));
    let s = e.clone().simplify();
    let txt = format!("{}", s);
    // Expect 2*3^1/2 or 2* (3)^(1/2)
    assert!(txt.contains("2"));
    assert!(txt.contains("3^{1/2}"));
}

#[test]
fn test_sqrt_fraction() {
    // sqrt(8/18)=sqrt(4*2 / (9*2)) -> (2/3)*2^(1/2)
    let e = sqrt(r(8, 18));
    let s = e.clone().simplify();
    let txt = format!("{}", s);
    assert!(txt.contains("2/3"));
}

#[test]
fn test_sqrt2_sqrt8() {
    let e = E::mul(vec![sqrt(r(2, 1)), sqrt(r(8, 1))]).simplify();
    let txt = format!("{}", e);
    // sqrt(2)*sqrt(8)=sqrt(16)=4
    assert_eq!(txt, "4");
}

#[test]
fn test_sqrt2_sqrt3() {
    let e = E::mul(vec![sqrt(r(2, 1)), sqrt(r(3, 1))]).simplify();
    let txt = format!("{}", e);
    assert!(txt.contains("6^{1/2}"));
}
