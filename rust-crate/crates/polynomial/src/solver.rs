use crate::core::Polynomial;
use algebraic::complex::SymbolicComplex;
use algebraic::expr::SymbolicExpr;
use algebraic::rational::Rational;
use num_traits::Zero;

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

impl Polynomial<Rational> {
    pub fn symbolic_roots_linear_quadratic(&self) -> Vec<SymbolicComplex> {
        let deg = self.deg();
        if deg < 0 {
            return vec![];
        }
        if deg == 0 {
            return vec![];
        }
        if deg == 1 {
            let c0 = self.coeffs[0];
            let c1 = self.coeffs[1];
            if c1.is_zero() {
                return vec![];
            }
            let root_rat = -c0 / c1;
            let root_expr = SymbolicExpr::rational(root_rat.numer(), root_rat.denom() as i64);
            return vec![SymbolicComplex::from_real(root_expr)];
        }
        if deg == 2 {
            let a0 = self.coeffs[0];
            let a1 = self.coeffs[1];
            let a2 = self.coeffs[2];
            if a2.is_zero() {
                return vec![];
            }
            let four = Rational::from_int(4);
            let two = Rational::from_int(2);
            let d_rat = a1 * a1 - four * a2 * a0;

            fn is_sq(n: i64) -> Option<i64> {
                if n < 0 {
                    None
                } else {
                    let s = (n as f64).sqrt().round() as i64;
                    if s * s == n {
                        Some(s)
                    } else {
                        None
                    }
                }
            }
            fn rational_sqrt(r: &Rational) -> Option<Rational> {
                if r.numer() < 0 {
                    return None;
                }
                if let (Some(sn), Some(sd)) = (is_sq(r.numer()), is_sq(r.denom() as i64)) {
                    Some(Rational::try_new(sn, sd).unwrap())
                } else {
                    None
                }
            }
            if d_rat.numer() < 0 {
                let abs_d = -d_rat;
                let denom = two * a2;
                let re_rat = -a1 / (two * a2);
                let re_expr = SymbolicExpr::rational(re_rat.numer(), re_rat.denom() as i64);
                let sqrt_abs =
                    std_sqrt(SymbolicExpr::rational(abs_d.numer(), abs_d.denom() as i64))
                        .simplify();
                let denom_expr = SymbolicExpr::rational(denom.numer(), denom.denom() as i64);
                let im_expr = sdiv(sqrt_abs, denom_expr).simplify();
                let root_pos = SymbolicComplex {
                    re: re_expr.clone(),
                    im: im_expr.clone(),
                };
                let root_neg = SymbolicComplex {
                    re: re_expr,
                    im: neg(im_expr).simplify(),
                };
                return vec![root_pos, root_neg];
            } else {
                let denom = two * a2;
                let neg_a1 = -a1;
                if let Some(sd) = rational_sqrt(&d_rat) {
                    let r1 = (neg_a1 + sd) / denom;
                    let r2 = (neg_a1 - sd) / denom;
                    let e1 = SymbolicExpr::rational(r1.numer(), r1.denom() as i64);
                    let e2 = SymbolicExpr::rational(r2.numer(), r2.denom() as i64);
                    return vec![
                        SymbolicComplex::from_real(e1),
                        SymbolicComplex::from_real(e2),
                    ];
                }
                let sqrt_d = std_sqrt(SymbolicExpr::rational(d_rat.numer(), d_rat.denom() as i64));
                let denom_expr = SymbolicExpr::rational(denom.numer(), denom.denom() as i64);
                let neg_a1_expr = SymbolicExpr::rational(neg_a1.numer(), neg_a1.denom() as i64);
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
        }
        vec![]
    }

    pub fn symbolic_roots_cubic(&self) -> Vec<SymbolicComplex> {
        if self.deg() != 3 {
            return vec![];
        }
        let a0 = self.coeffs[0];
        let b1 = self.coeffs[1];
        let c2 = self.coeffs[2];
        let d3 = self.coeffs[3];

        let a = d3;
        let b = c2;
        let c = b1;
        let d = a0;

        let three = Rational::from_int(3);
        let eight = Rational::from_int(8);
        let nine = Rational::from_int(9);
        let twenty7 = Rational::from_int(27);
        let two = Rational::from_int(2);

        let a2 = a * a;
        let a3 = a2 * a;
        let b2 = b * b;
        let b3 = b2 * b;

        let p_rat = (three * a * c - b2) / (three * a2);
        let q_rat = (twenty7 * a2 * d - nine * a * b * c + two * b3) / (twenty7 * a3);

        let shift_rat = b / (three * a);

        let p_expr = SymbolicExpr::rational(p_rat.numer(), p_rat.denom() as i64);
        let q_expr = SymbolicExpr::rational(q_rat.numer(), q_rat.denom() as i64);
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

        let shift_expr = SymbolicExpr::rational(shift_rat.numer(), shift_rat.denom() as i64);

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
        let a0 = self.coeffs[0];
        let a1 = self.coeffs[1];
        let a2 = self.coeffs[2];
        let a3 = self.coeffs[3];
        let a4 = self.coeffs[4];

        let a = a4;
        let b = a3;
        let c = a2;
        let d = a1;
        let e = a0;

        let four = Rational::from_int(4);
        let eight = Rational::from_int(8);
        let sixteen = Rational::from_int(16);
        let two_fifty_six = Rational::from_int(256);
        let three = Rational::from_int(3);
        let sixty_four = Rational::from_int(64);

        let b2 = b * b;
        let b3 = b2 * b;
        let b4 = b2 * b2;

        let p_rat = (eight * a * c - three * b2) / (eight * a * a);
        let q_rat = (b3 - four * a * b * c + eight * a * a * d) / (eight * a * a * a);
        let r_rat = (-three * b4 + two_fifty_six * a * a * a * e - sixty_four * a * a * b * d
            + sixteen * a * b2 * c
            - sixteen * a * a * c * c)
            / (two_fifty_six * a * a * a * a);

        let p_expr = SymbolicExpr::rational(p_rat.numer(), p_rat.denom() as i64);
        let q_expr = SymbolicExpr::rational(q_rat.numer(), q_rat.denom() as i64);
        let r_expr = SymbolicExpr::rational(r_rat.numer(), r_rat.denom() as i64);

        if q_rat.numer() == 0 {
            let disc = (p_rat * p_rat) - Rational::from_int(4) * r_rat;
            let disc_expr = SymbolicExpr::rational(disc.numer(), disc.denom() as i64);
            let sqrt_disc = std_sqrt(disc_expr);
            let two = int(2);
            let p_e = p_expr.clone();
            let z1 = sdiv(add(vec![neg(p_e.clone()), sqrt_disc.clone()]), two.clone()).simplify();
            let z2 = sdiv(
                add(vec![neg(p_e.clone()), neg(sqrt_disc.clone())]),
                two.clone(),
            )
            .simplify();
            let y_candidates = vec![
                std_sqrt(z1.clone()),
                neg(std_sqrt(z1)),
                std_sqrt(z2.clone()),
                neg(std_sqrt(z2)),
            ];
            let shift_val = b / (four * a);
            let shift = SymbolicExpr::rational(shift_val.numer(), shift_val.denom() as i64);
            return y_candidates
                .into_iter()
                .map(|y| SymbolicComplex::from_real(sub(y, shift.clone()).simplify()))
                .collect();
        }

        let half_rat = Rational::try_new(1, 2).unwrap();
        let four_r_p = Rational::from_int(4) * r_rat * p_rat;
        let q2 = q_rat * q_rat;
        let const_term = (four_r_p - q2) / (Rational::from_int(8));

        let z_poly = Polynomial::new(vec![
            const_term,
            -r_rat,
            -(p_rat * half_rat),
            Rational::from_int(1),
        ]);
        let z_roots = z_poly.symbolic_roots_cubic();
        let z0 = &z_roots[0];
        let z0_expr = z0.re.clone();

        let big_r = std_sqrt(
            add(vec![
                pow(z0_expr.clone(), int(2)),
                neg(r_expr.clone()),
                mul(vec![p_expr.clone(), z0_expr.clone()]),
            ])
            .simplify(),
        );
        let two = int(2);
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

        let shift_val = b / (Rational::from_int(4) * a);
        let shift = SymbolicExpr::rational(shift_val.numer(), shift_val.denom() as i64);

        let root1 = add(vec![
            neg(shift.clone()),
            scale(
                add(vec![big_r.clone(), add(vec![big_s.clone(), big_t.clone()])]),
                1,
                2,
            ),
        ])
        .simplify();
        let root2 = add(vec![
            neg(shift.clone()),
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
            neg(shift.clone()),
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
            neg(shift.clone()),
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

    pub fn find_roots_symbolic(&self) -> Vec<SymbolicComplex> {
        let mut roots: Vec<SymbolicComplex> = Vec::new();
        let mut rem = self.clone();
        loop {
            if rem.deg() <= 0 {
                break;
            }
            if let Some(r) = find_one_rational_root(&rem) {
                let expr = SymbolicExpr::rational(r.numer(), r.denom() as i64);
                roots.push(SymbolicComplex::from_real(expr));
                let factor = Polynomial::new(vec![-r, Rational::from_int(1)]);
                let (q, _) = rem.div_rem(&factor);
                rem = q;
                continue;
            }
            break;
        }
        let rest = match rem.deg() {
            -1 => vec![],
            0 => vec![],
            1 | 2 => rem.symbolic_roots_linear_quadratic(),
            3 => rem.symbolic_roots_cubic(),
            4 => rem.symbolic_roots_quartic(),
            _ => vec![],
        };
        roots.extend(rest);
        roots
    }
}

// ---- Helper: find a rational root using integer scaling ----
fn find_one_rational_root(p: &Polynomial<Rational>) -> Option<Rational> {
    if p.deg() <= 0 {
        return None;
    }
    let mut lcm: u64 = 1;
    for c in &p.coeffs {
        lcm = lcm_lcm(lcm, c.denom());
    }
    let mut ints: Vec<i64> = Vec::with_capacity(p.coeffs.len());
    for c in &p.coeffs {
        let m = (lcm / c.denom()) as i64;
        ints.push(c.numer() * m);
    }
    let a0 = *ints.first().unwrap_or(&0);
    let an = *ints.last().unwrap_or(&0);
    if an == 0 {
        return None;
    }
    let pd = divisors_i64(a0.abs());
    let qd = divisors_i64(an.abs());
    for &pnum in &pd {
        for &qden in &qd {
            for sign in [1i64, -1i64] {
                let n = sign * pnum;
                // Avoid using try_new in loop directly if possible or unwrap simply as we know qden > 0
                let cand = Rational::try_new(n, qden as i64).unwrap();
                if p.eval(cand).is_zero() {
                    return Some(cand);
                }
            }
        }
    }
    None
}

fn lcm_lcm(a: u64, b: u64) -> u64 {
    a / gcd_u64(a, b) * b
}
fn gcd_u64(mut a: u64, mut b: u64) -> u64 {
    while b != 0 {
        let t = a % b;
        a = b;
        b = t;
    }
    a
}

fn divisors_i64(n: i64) -> Vec<i64> {
    let mut v = Vec::new();
    if n == 0 {
        return vec![0];
    }
    let nn = n as i64;
    let mut i = 1i64;
    while (i as i128) * (i as i128) <= (nn as i128) {
        if nn % i == 0 {
            v.push(i);
            let j = nn / i;
            if j != i {
                v.push(j);
            }
        }
        i += 1;
    }
    v.sort();
    v
}

#[derive(Debug, Clone)]
pub struct PolynomialSolver;

impl std::fmt::Display for PolynomialSolver {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "PolynomialSolver")
    }
}

impl std::str::FromStr for PolynomialSolver {
    type Err = String;
    fn from_str(_s: &str) -> Result<Self, Self::Err> {
        Ok(PolynomialSolver)
    }
}

impl PolynomialSolver {
    pub fn solve_rational(coeffs: Vec<Rational>) -> Vec<SymbolicComplex> {
        let poly = Polynomial::new(coeffs);
        poly.find_roots_symbolic()
    }
}
