use algebraic::complex::SymbolicComplex as C;

#[test]
fn test_sqrt_neg_one() {
    let z = C::sqrt_rational(-1, 1);
    assert_eq!(format!("{}", z), "i");
}

#[test]
fn test_sqrt_neg_four() {
    let z = C::sqrt_rational(-4, 1);
    assert_eq!(format!("{}", z), "2i");
}

#[test]
fn test_sqrt_neg_twelve() {
    let z = C::sqrt_rational(-12, 1);
    // sqrt(12)=2*sqrt(3) → pure imaginary. Factor order may vary.
    let s = format!("{}", z);
    assert!(s.starts_with("("));
    assert!(s.ends_with(")i"));
    assert!(s.contains("3^{1/2}"));
    assert!(s.contains("2"));
}
