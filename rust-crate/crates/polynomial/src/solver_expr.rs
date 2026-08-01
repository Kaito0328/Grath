use crate::core::Polynomial;
use algebraic::complex::SymbolicComplex;
use algebraic::expr::SymbolicExpr;
use algebraic::rational::Rational;
use num_traits::Zero;

impl Polynomial<Rational> {
    pub fn eval_expr(&self, x: SymbolicExpr) -> SymbolicExpr {
        let mut acc = SymbolicExpr::int(0);
        for c in self.coeffs.iter().rev() {
            let ce = SymbolicExpr::Rational(c.clone().simplified());
            acc = (acc * x.clone() + ce).simplify();
        }
        acc
    }
}

// Helper constructors
fn rat(n: i64, d: i64) -> SymbolicExpr {
    SymbolicExpr::rational(n, d)
}
fn int(n: i64) -> SymbolicExpr {
    SymbolicExpr::int(n)
}
fn add(v: Vec<SymbolicExpr>) -> SymbolicExpr {
    SymbolicExpr::add(v)
}
fn mul(v: Vec<SymbolicExpr>) -> SymbolicExpr {
    SymbolicExpr::mul(v)
}
fn pow(base: SymbolicExpr, exp: SymbolicExpr) -> SymbolicExpr {
    SymbolicExpr::pow(base, exp)
}

fn std_sqrt(expr: SymbolicExpr) -> SymbolicExpr {
    pow(expr, rat(1, 2))
}
fn cbrt(expr: SymbolicExpr) -> SymbolicExpr {
    pow(expr, rat(1, 3))
}
fn neg(e: SymbolicExpr) -> SymbolicExpr {
    mul(vec![int(-1), e])
}
fn sub(a: SymbolicExpr, b: SymbolicExpr) -> SymbolicExpr {
    add(vec![a, neg(b)])
}
fn sdiv(a: SymbolicExpr, b: SymbolicExpr) -> SymbolicExpr {
    mul(vec![a, pow(b, rat(-1, 1))])
}
fn scale(e: SymbolicExpr, n: i64, d: i64) -> SymbolicExpr {
    mul(vec![rat(n, d), e])
}

impl Polynomial<SymbolicExpr> {
    pub fn eval_expr(&self, x: SymbolicExpr) -> SymbolicExpr {
        let mut acc = SymbolicExpr::int(0);
        for c in self.coeffs.iter().rev() {
            acc = (acc * x.clone() + c.clone()).simplify();
        }
        acc
    }

    pub fn symbolic_roots_linear_quadratic(&self) -> Vec<SymbolicComplex> {
        let deg = self.deg();
        if deg < 0 || deg == 0 {
            return vec![];
        }
        if deg == 1 {
            let c0 = self.coeffs[0].clone();
            let c1 = self.coeffs[1].clone();
            if c1.is_zero() {
                return vec![];
            }
            let root_expr = sdiv(neg(c0), c1).simplify();
            return vec![SymbolicComplex::from_real(root_expr)];
        }
        if deg == 2 {
            let a0 = self.coeffs[0].clone();
            let a1 = self.coeffs[1].clone();
            let a2 = self.coeffs[2].clone();
            if a2.is_zero() {
                return vec![];
            }
            let four = int(4);
            let two = int(2);

            let d_expr = sub(
                mul(vec![a1.clone(), a1.clone()]),
                mul(vec![four, a2.clone(), a0]),
            )
            .simplify();
            let denom_expr = mul(vec![two, a2]).simplify();
            let neg_a1_expr = neg(a1).simplify();

            let sqrt_d = std_sqrt(d_expr).simplify();
            let r1 = sdiv(
                add(vec![neg_a1_expr.clone(), sqrt_d.clone()]),
                denom_expr.clone(),
            )
            .simplify();
            let r2 = sdiv(add(vec![neg_a1_expr, neg(sqrt_d)]), denom_expr).simplify();

            return vec![
                SymbolicComplex::from_real(r1),
                SymbolicComplex::from_real(r2),
            ];
        }
        vec![]
    }

    pub fn symbolic_roots_cubic(&self) -> Vec<SymbolicComplex> {
        if self.deg() != 3 {
            return vec![];
        }
        let a0 = self.coeffs[0].clone();
        let b1 = self.coeffs[1].clone();
        let c2 = self.coeffs[2].clone();
        let d3 = self.coeffs[3].clone();

        let a = d3;
        let b = c2;
        let c = b1;
        let d = a0;

        let three = int(3);
        let eight = int(8);
        let nine = int(9);
        let twenty7 = int(27);
        let two = int(2);

        let a2 = mul(vec![a.clone(), a.clone()]);
        let a3 = mul(vec![a2.clone(), a.clone()]);
        let b2 = mul(vec![b.clone(), b.clone()]);
        let b3 = mul(vec![b2.clone(), b.clone()]);

        let p_num = sub(mul(vec![three.clone(), a.clone(), c.clone()]), b2);
        let p_expr = sdiv(p_num, mul(vec![three.clone(), a2.clone()])).simplify();

        let q_num = add(vec![
            mul(vec![twenty7, a2.clone(), d]),
            neg(mul(vec![nine, a.clone(), b.clone(), c])),
            mul(vec![two, b3]),
        ]);
        let q_expr = sdiv(q_num, mul(vec![int(27), a3])).simplify();

        let shift_expr = sdiv(b.clone(), mul(vec![three.clone(), a.clone()])).simplify();

        let half = rat(1, 2);
        let q_half = mul(vec![q_expr.clone(), half.clone()]);

        let p_third = mul(vec![p_expr.clone(), rat(1, 3)]);
        let discriminant = add(vec![
            pow(q_half.clone(), int(2)),
            pow(p_third.clone(), int(3)),
        ])
        .simplify();
        let sqrt_disc = std_sqrt(discriminant.clone());

        let u = cbrt(add(vec![neg(q_half.clone()), sqrt_disc.clone()]));
        let v = cbrt(add(vec![neg(q_half.clone()), neg(sqrt_disc.clone())]));
        let y1 = add(vec![u.clone(), v.clone()]).simplify();

        let re_omega = rat(-1, 2);
        let im_omega = mul(vec![rat(1, 2), std_sqrt(int(3))]).simplify();
        let omega = SymbolicComplex {
            re: re_omega.clone(),
            im: im_omega.clone(),
        };
        let omega2 = SymbolicComplex {
            re: re_omega.clone(),
            im: neg(im_omega.clone()).simplify(),
        };

        let u_c = SymbolicComplex::from_real(u.clone());
        let v_c = SymbolicComplex::from_real(v.clone());

        let y2_c = omega.clone() * u_c.clone() + omega2.clone() * v_c.clone();
        let y3_c = omega2.clone() * u_c.clone() + omega.clone() * v_c.clone();

        let root1 = sub(y1, shift_expr.clone()).simplify();
        let root2 = SymbolicComplex {
            re: sub(y2_c.re.clone(), shift_expr.clone()).simplify(),
            im: y2_c.im.clone().simplify(),
        };
        let root3 = SymbolicComplex {
            re: sub(y3_c.re.clone(), shift_expr.clone()).simplify(),
            im: y3_c.im.clone().simplify(),
        };

        vec![SymbolicComplex::from_real(root1), root2, root3]
    }

    pub fn symbolic_roots_quartic(&self) -> Vec<SymbolicComplex> {
        if self.deg() != 4 {
            return vec![];
        }
        let a0 = self.coeffs[0].clone();
        let a1 = self.coeffs[1].clone();
        let a2 = self.coeffs[2].clone();
        let a3 = self.coeffs[3].clone();
        let a4 = self.coeffs[4].clone();

        let a = a4;
        let b = a3;
        let c = a2;
        let d = a1;
        let e = a0;

        let four = int(4);
        let eight = int(8);
        let sixteen = int(16);
        let two_fifty_six = int(256);
        let three = int(3);
        let sixty_four = int(64);

        let b2 = mul(vec![b.clone(), b.clone()]);
        let b3 = mul(vec![b2.clone(), b.clone()]);
        let b4 = mul(vec![b2.clone(), b2.clone()]);

        let a_sq = mul(vec![a.clone(), a.clone()]);
        let a_cub = mul(vec![a_sq.clone(), a.clone()]);
        let a_quad = mul(vec![a_sq.clone(), a_sq.clone()]);

        let p_num = sub(
            mul(vec![eight.clone(), a.clone(), c.clone()]),
            mul(vec![three.clone(), b2.clone()]),
        );
        let p_expr = sdiv(p_num, mul(vec![eight.clone(), a_sq.clone()])).simplify();

        let q_num = add(vec![
            b3,
            neg(mul(vec![four.clone(), a.clone(), b.clone(), c.clone()])),
            mul(vec![eight.clone(), a_sq.clone(), d.clone()]),
        ]);
        let q_expr = sdiv(q_num, mul(vec![eight.clone(), a_cub.clone()])).simplify();

        let r_num = add(vec![
            neg(mul(vec![three, b4])),
            mul(vec![two_fifty_six, a_cub.clone(), e]),
            neg(mul(vec![sixty_four, a_sq.clone(), b.clone(), d])),
            mul(vec![sixteen.clone(), a.clone(), b2.clone(), c.clone()]),
            neg(mul(vec![sixteen, a_sq.clone(), c.clone(), c.clone()])),
        ]);
        let r_expr = sdiv(r_num, mul(vec![int(256), a_quad])).simplify();

        let half_rat = rat(1, 2);
        let four_r_p = mul(vec![int(4), r_expr.clone(), p_expr.clone()]);
        let q2 = mul(vec![q_expr.clone(), q_expr.clone()]);
        let const_term = sdiv(sub(four_r_p, q2.clone()), int(8));

        let z_poly = Polynomial::new(vec![
            const_term,
            neg(r_expr.clone()),
            neg(mul(vec![p_expr.clone(), half_rat])),
            int(1),
        ]);
        let z_roots = z_poly.symbolic_roots_cubic();
        let z0_expr = z_roots[0].re.clone();

        let big_r = std_sqrt(
            add(vec![
                pow(z0_expr.clone(), int(2)),
                neg(r_expr.clone()),
                mul(vec![p_expr.clone(), z0_expr.clone()]),
            ])
            .simplify(),
        );
        let two = int(2);

        // Handling division by zero symmetrically if big_r is 0.
        // Practically, we use symbolic expressions, meaning sdiv(q_expr, big_r) won't instantly panic unless strictly zero natively.
        let big_s = std_sqrt(
            sdiv(
                add(vec![
                    mul(vec![int(2), z0_expr.clone()]),
                    neg(p_expr.clone()),
                    neg(sdiv(q_expr.clone(), big_r.clone())),
                ]),
                two.clone(),
            )
            .simplify(),
        );
        let big_t = std_sqrt(
            sdiv(
                add(vec![
                    mul(vec![int(2), z0_expr.clone()]),
                    neg(p_expr.clone()),
                    sdiv(q_expr.clone(), big_r.clone()),
                ]),
                two.clone(),
            )
            .simplify(),
        );

        let shift_expr = sdiv(b, mul(vec![int(4), a])).simplify();

        let root1 = add(vec![
            neg(shift_expr.clone()),
            scale(
                add(vec![big_r.clone(), add(vec![big_s.clone(), big_t.clone()])]),
                1,
                2,
            ),
        ])
        .simplify();
        let root2 = add(vec![
            neg(shift_expr.clone()),
            scale(
                add(vec![
                    big_r.clone(),
                    add(vec![big_s.clone(), neg(big_t.clone())]),
                ]),
                1,
                2,
            ),
        ])
        .simplify();
        let root3 = add(vec![
            neg(shift_expr.clone()),
            scale(
                add(vec![
                    neg(big_r.clone()),
                    add(vec![big_s.clone(), neg(big_t.clone())]),
                ]),
                1,
                2,
            ),
        ])
        .simplify();
        let root4 = add(vec![
            neg(shift_expr.clone()),
            scale(
                add(vec![
                    neg(big_r.clone()),
                    add(vec![big_s.clone(), big_t.clone()]),
                ]),
                1,
                2,
            ),
        ])
        .simplify();

        vec![root1, root2, root3, root4]
            .into_iter()
            .map(|r| SymbolicComplex::from_real(r))
            .collect()
    }

    pub fn find_roots_symbolic_expr(&self) -> Vec<SymbolicComplex> {
        let rest = match self.deg() {
            -1 => vec![],
            0 => vec![],
            1 | 2 => self.symbolic_roots_linear_quadratic(),
            3 => self.symbolic_roots_cubic(),
            4 => self.symbolic_roots_quartic(),
            // Symbolic representation of higher degree polynomials roots is impossible generally
            _ => vec![],
        };
        rest
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use algebraic::expr::SymbolicExpr;
    use algebraic::rational::Rational;

    #[test]
    fn test_eval_expr() {
        // p(x) = x^2 + 2x + 1
        let p = Polynomial::new(vec![
            Rational::from_int(1),
            Rational::from_int(2),
            Rational::from_int(1),
        ]);
        let x = SymbolicExpr::Symbol("x".to_string());
        let res = p.eval_expr(x).expand().simplify();
        let s = res.to_string();
        // The output is "1 + x^{2} + 2x"
        assert!(
            s.contains("x^{2}") || s.contains("x^2") || s.contains("x**(2)") || s.contains("x * x")
        );
        assert!(s.contains("2x") || s.contains("2 * x"));
        assert!(s.contains('1'));
    }
}
