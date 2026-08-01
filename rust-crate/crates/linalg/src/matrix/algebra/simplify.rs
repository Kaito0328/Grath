use crate::matrix::Matrix;
use algebraic::expr::SymbolicExpr;
use algebraic::rational::Rational;
use num_traits::{One, Zero};
use std::collections::HashMap;

/// 行列の全要素から共通の因子を抽出し、(スカラー, 簡略化された行列) を返します。
pub fn extract_common_factor(
    matrix: &Matrix<SymbolicExpr>,
) -> (SymbolicExpr, Matrix<SymbolicExpr>) {
    if matrix.rows == 0 || matrix.cols == 0 {
        return (SymbolicExpr::int(1), matrix.clone());
    }

    // 1. 各要素を構成する「因子」を収集する
    // ここでは単純化のため、各要素が持つ有理数係数と、Mul の各項（または単一の Symbol/Pow/Add）を対象とする。

    let mut common_factors: Option<HashMap<String, (SymbolicExpr, i64)>> = None;
    let mut common_rat = Rational::from_int(0);
    let mut first = true;

    for r in 0..matrix.rows {
        for c in 0..matrix.cols {
            let val = matrix[(r, c)].clone().simplify();
            if val.is_zero() {
                continue;
            }

            let (val_rat, val_factors) = get_factors(&val);

            // 有理数部分の処理 (GCD 的なもの)
            if first {
                common_rat = val_rat;
            } else {
                common_rat = gcd_rational(common_rat, val_rat);
            }

            // 記号因子の処理
            if common_factors.is_none() && first {
                common_factors = Some(val_factors);
            } else if let Some(ref mut mapping) = common_factors {
                // 積集合をとる
                mapping.retain(|key, (_expr, count)| {
                    if let Some((_, other_count)) = val_factors.get(key) {
                        *count = (*count).min(*other_count);
                        *count > 0
                    } else {
                        false
                    }
                });
            }
            first = false;
        }
    }

    let scalar_rat = if common_rat.is_zero() {
        Rational::from_int(1)
    } else {
        common_rat
    };
    let mut scalar_parts = vec![SymbolicExpr::Rational(scalar_rat)];

    if let Some(mapping) = common_factors {
        for (_, (expr, count)) in mapping {
            if count == 1 {
                scalar_parts.push(expr);
            } else if count > 1 {
                scalar_parts.push(SymbolicExpr::pow(expr, SymbolicExpr::int(count)));
            }
        }
    }

    let scalar = SymbolicExpr::mul(scalar_parts).simplify();

    if scalar.is_one() {
        return (SymbolicExpr::int(1), matrix.clone());
    }

    // 各要素を scalar で割った行列を作成
    let inv_scalar = SymbolicExpr::pow(scalar.clone(), SymbolicExpr::int(-1));
    let mut new_data = Vec::with_capacity(matrix.rows * matrix.cols);
    for r in 0..matrix.rows {
        for c in 0..matrix.cols {
            let val = &matrix[(r, c)];
            if val.is_zero() {
                new_data.push(SymbolicExpr::int(0));
            } else {
                new_data.push(SymbolicExpr::mul(vec![val.clone(), inv_scalar.clone()]).simplify());
            }
        }
    }

    (
        scalar,
        Matrix::new(matrix.rows, matrix.cols, new_data).unwrap(),
    )
}

fn get_factors(e: &SymbolicExpr) -> (Rational, HashMap<String, (SymbolicExpr, i64)>) {
    let mut rat = Rational::from_int(1);
    let mut factors = HashMap::new();

    fn process_expr(
        expr: &SymbolicExpr,
        rat: &mut Rational,
        factors: &mut HashMap<String, (SymbolicExpr, i64)>,
        multiplier: i64,
    ) {
        match expr {
            SymbolicExpr::Rational(r) => {
                if multiplier == 1 {
                    *rat = *rat * *r;
                } else if multiplier > 1 {
                    // This case is rare but for completeness: (2*x)^2 should give 4*x^2
                    // However get_factors is called on simplified expressions,
                    // so (2*x)^2 would already be 4*x^2.
                    for _ in 0..multiplier {
                        *rat = *rat * *r;
                    }
                }
            }
            SymbolicExpr::Mul(fs) => {
                for f in fs {
                    process_expr(f, rat, factors, multiplier);
                }
            }
            SymbolicExpr::Pow(base, exp) => {
                if let SymbolicExpr::Rational(r_exp) = &**exp {
                    if r_exp.denom() == 1 && r_exp.numer() > 0 {
                        process_expr(base, rat, factors, multiplier * r_exp.numer());
                    } else {
                        insert_factor(factors, expr.clone(), multiplier);
                    }
                } else {
                    insert_factor(factors, expr.clone(), multiplier);
                }
            }
            _ => {
                insert_factor(factors, expr.clone(), multiplier);
            }
        }
    }

    process_expr(e, &mut rat, &mut factors, 1);
    (rat, factors)
}

fn insert_factor(map: &mut HashMap<String, (SymbolicExpr, i64)>, e: SymbolicExpr, count: i64) {
    let key = format!("{:?}", e); // Simple key for now
    map.entry(key)
        .and_modify(|(_, c)| *c += count)
        .or_insert((e, count));
}

fn gcd(a: i64, b: i64) -> i64 {
    let mut a = a.abs();
    let mut b = b.abs();
    while b != 0 {
        a %= b;
        std::mem::swap(&mut a, &mut b);
    }
    a
}

fn lcm(a: i64, b: i64) -> i64 {
    if a == 0 || b == 0 {
        return 0;
    }
    (a * b).abs() / gcd(a, b)
}

fn gcd_rational(a: Rational, b: Rational) -> Rational {
    if a.is_zero() {
        return b;
    }
    if b.is_zero() {
        return a;
    }

    // gcd(n1/d1, n2/d2) = gcd(n1, n2) / lcm(d1, d2)
    let n = gcd(a.numer(), b.numer());
    let d = lcm(a.denom() as i64, b.denom() as i64);
    Rational::new(n, d).simplified()
}

#[cfg(test)]
mod tests {
    use super::*;
    use algebraic::expr::SymbolicExpr as E;

    #[test]
    fn test_extract_common_factor_rational() {
        let data = vec![E::int(2), E::int(4), E::int(6), E::int(8)];
        let m = Matrix::new(2, 2, data).unwrap();
        let (s, m_new) = extract_common_factor(&m);

        assert_eq!(s, E::int(2));
        assert_eq!(m_new[(0, 0)], E::int(1));
        assert_eq!(m_new[(0, 1)], E::int(2));
        assert_eq!(m_new[(1, 0)], E::int(3));
        assert_eq!(m_new[(1, 1)], E::int(4));
    }

    #[test]
    fn test_extract_common_factor_symbolic() {
        let x = E::Symbol("x".to_string());
        let y = E::Symbol("y".to_string());

        // m = [[2x, 2y], [4x, 0]]
        let data = vec![
            E::mul(vec![E::int(2), x.clone()]),
            E::mul(vec![E::int(2), y.clone()]),
            E::mul(vec![E::int(4), x.clone()]),
            E::int(0),
        ];
        let m = Matrix::new(2, 2, data).unwrap();
        let (s, _m_new) = extract_common_factor(&m);

        // Common factor should be 2. (x and y are not common to all non-zero elements)
        assert_eq!(s, E::int(2));
    }

    #[test]
    fn test_extract_common_factor_all_symbols() {
        let x = E::Symbol("x".to_string());
        let a = E::Symbol("a".to_string());
        let b = E::Symbol("b".to_string());

        // m = [[ax, bx], [x^2, x]]
        let data = vec![
            E::mul(vec![a.clone(), x.clone()]),
            E::mul(vec![b.clone(), x.clone()]),
            E::pow(x.clone(), E::int(2)),
            x.clone(),
        ];
        let m = Matrix::new(2, 2, data).unwrap();
        let (s, m_new) = extract_common_factor(&m);

        // Common factor should be x.
        assert_eq!(s, x);
        assert_eq!(m_new[(0, 0)], a);
        assert_eq!(m_new[(1, 0)], x);
        assert_eq!(m_new[(1, 1)], E::int(1));
    }

    #[test]
    fn test_extract_common_factor_complex() {
        let det = E::Symbol("D".to_string());
        let inv_det = E::pow(det.clone(), E::int(-1));
        let a = E::Symbol("a".to_string());
        let b = E::Symbol("b".to_string());

        // m = [[a/D, b/D], [0, 1/D]]
        let data = vec![
            E::mul(vec![a.clone(), inv_det.clone()]),
            E::mul(vec![b.clone(), inv_det.clone()]),
            E::int(0),
            inv_det.clone(),
        ];
        let m = Matrix::new(2, 2, data).unwrap();
        let (s, m_new) = extract_common_factor(&m);

        // Common factor should be 1/D.
        assert_eq!(s, inv_det);
        assert_eq!(m_new[(0, 0)], a);
        assert_eq!(m_new[(0, 1)], b);
        assert_eq!(m_new[(1, 1)], E::int(1));
    }

    #[test]
    fn test_extract_from_actual_inverse() {
        let a = E::Symbol("a".to_string());
        let b = E::Symbol("b".to_string());
        let c = E::Symbol("c".to_string());
        let d = E::Symbol("d".to_string());

        let m = Matrix::new(2, 2, vec![a.clone(), b.clone(), c.clone(), d.clone()]).unwrap();
        let inv = m.inverse_exact().unwrap().unwrap();

        let (s, m_factored) = extract_common_factor(&inv);

        // s should be 1 / (ad - bc) or similar
        println!("Factor: {}", s);
        println!("Matrix:\n{}", m_factored);

        // Verify that s * m_factored is the same as inv (each element)
        for r in 0..2 {
            for c in 0..2 {
                let original = &inv[(r, c)];
                let reconstructed = E::mul(vec![s.clone(), m_factored[(r, c)].clone()]).simplify();
                assert_eq!(
                    original.clone().simplify(),
                    reconstructed.simplify(),
                    "Mismatch at ({}, {})",
                    r,
                    c
                );
            }
        }
    }
}
