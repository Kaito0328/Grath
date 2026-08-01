#[cfg(test)]
mod tests {
    use crate::expr::SymbolicExpr;
    use crate::prelude::*;

    #[test]
    fn test_expand_distributive() {
        // 2 * (a + b) -> 2a + 2b
        let expr = SymbolicExpr::mul(vec![
            SymbolicExpr::int(2),
            SymbolicExpr::add(vec![
                SymbolicExpr::Symbol("a".to_string()),
                SymbolicExpr::Symbol("b".to_string()),
            ]),
        ]);
        let expanded = expr.expand();
        // Check if it's an Add of two Muls
        if let SymbolicExpr::Add(terms) = expanded {
            assert_eq!(terms.len(), 2);
        } else {
            panic!("Expected expansion to result in an Add, got {:?}", expanded);
        }
    }

    #[test]
    fn test_cancellation_via_expand() {
        // (a + 1) * (a - 1) - (a^2 - 1) -> 0
        // (a+1)*(a-1) expands to a^2 - a + a - 1 = a^2 - 1
        let a = SymbolicExpr::Symbol("a".to_string());
        let one = SymbolicExpr::int(1);
        let minus_one = SymbolicExpr::int(-1);

        let lhs = SymbolicExpr::mul(vec![
            SymbolicExpr::add(vec![a.clone(), one.clone()]),
            SymbolicExpr::add(vec![a.clone(), minus_one.clone()]),
        ]);
        let rhs = SymbolicExpr::add(vec![
            SymbolicExpr::pow(a.clone(), SymbolicExpr::int(2)),
            minus_one.clone(),
        ]);

        let diff = SymbolicExpr::add(vec![lhs, SymbolicExpr::mul(vec![minus_one, rhs])]);
        let simplified = diff.expand().simplify();

        assert!(
            matches!(simplified, SymbolicExpr::Rational(r) if r.is_zero()),
            "Expected 0, got {:?}",
            simplified
        );
    }

    #[test]
    fn test_user_example() {
        // 2 * (a + -1 * a) -> 0
        let a = SymbolicExpr::Symbol("a".to_string());
        let expr = SymbolicExpr::mul(vec![
            SymbolicExpr::int(2),
            SymbolicExpr::add(vec![
                a.clone(),
                SymbolicExpr::mul(vec![SymbolicExpr::int(-1), a.clone()]),
            ]),
        ]);
        let simplified = expr.simplify();
        assert!(
            matches!(simplified, SymbolicExpr::Rational(r) if r.is_zero()),
            "Expected 0, got {:?}",
            simplified
        );
    }
    #[test]
    fn test_juxtaposition() {
        let x = SymbolicExpr::Symbol("x".to_string());
        let y = SymbolicExpr::Symbol("y".to_string());
        let two = SymbolicExpr::int(2);

        // 2 * x -> 2x
        let e1 = SymbolicExpr::mul(vec![two.clone(), x.clone()]).simplify();
        assert_eq!(format!("{}", e1), "2x");

        // x * y -> xy
        let e2 = SymbolicExpr::mul(vec![x.clone(), y.clone()]).simplify();
        assert_eq!(format!("{}", e2), "xy");

        // 2 * (x + y) -> 2x + 2y (because simplify() expands it via distribute rules)
        let sum = SymbolicExpr::add(vec![x.clone(), y.clone()]);
        let e3 = SymbolicExpr::mul(vec![two.clone(), sum.clone()]).simplify();
        assert_eq!(format!("{}", e3), "2x + 2y");

        // x * (x + y) -> x(x + y) (currently simplify() only expands Rational * Add)
        let e4 = SymbolicExpr::mul(vec![x.clone(), sum.clone()]).simplify();
        assert_eq!(format!("{}", e4), "x(x + y)");

        // 2 * 3 -> 2*3
        let e5 = SymbolicExpr::mul(vec![two.clone(), SymbolicExpr::int(3)]).simplify();
        assert_eq!(format!("{}", e5), "6"); // simplify makes it 6.
                                            // Let's use SymbolicExpr::Mul directly to test fmt
        let e5_mul = SymbolicExpr::Mul(vec![two.clone(), SymbolicExpr::int(3)]);
        assert_eq!(format!("{}", e5_mul), "2*3");
    }
}
