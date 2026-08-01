use crate::core::Polynomial;
use crate::rational_function::core::RationalFunction;
use algebraic::{complex::SymbolicComplex as C, expr::SymbolicExpr as E, rational::Rational as R};
use num_traits::Zero;

impl RationalFunction<R> {
    /// 象徴式での評価（x に SymbolicExpr を代入）
    pub fn eval_expr(&self, x: E) -> E {
        let num = self.numerator.eval_expr(x.clone());
        let den = self.denominator.eval_expr(x);
        (num / den).simplify()
    }
}

impl RationalFunction<E> {
    pub fn eval_expr(&self, x: E) -> E {
        let num = self.numerator.eval_expr(x.clone());
        let den = self.denominator.eval_expr(x);
        (num / den).simplify()
    }
}

// ---- Public: symbolic zeros/poles (complex) ----
impl RationalFunction<R> {
    pub fn zeros_symbolic(&self) -> Vec<C> {
        self.numerator.find_roots_symbolic()
    }
    pub fn poles_symbolic(&self) -> Vec<C> {
        self.denominator.find_roots_symbolic()
    }
}

// ---- Partial fraction expansion in SymbolicExpr (only when all poles are rational and linear) ----
impl RationalFunction<R> {
    /// 部分分数の SymbolicExpr 形式を返す（変数は "x"）。
    /// サポート範囲:
    /// - 一次因子 (x - r)^m（r は有理数）
    /// - 実係数の二次既約因子 Q(x) の冪 Q(x)^m が高々1種類だけ含まれる場合
    ///   （例: (x^2 + x + 1)^2 や (x^2+1) など。一次因子との混在可）。
    /// 上記以外（異なる二次因子が複数存在など）は None を返す。
    pub fn partial_fraction_symbolic_expr(&self) -> Option<E> {
        // 1) 多項式部分と真分数部に分解
        let mut num = self.numerator.clone();
        let mut poly_part = Polynomial::zero();
        if self.denominator.deg() < self.numerator.deg() {
            (num, poly_part) = num.div_rem(&self.denominator);
        }

        // 2) 一次因子と（あれば）複数の二次因子 Q_i^m_i を抽出（線形方程式アプローチを優先）
        let (linear_factors, mut leftover) = factor_over_rationals(self.denominator.clone());
        let mut quads: Vec<(Polynomial<R>, usize)> = Vec::new();
        // 2a) 特に (x^4 + a x^2 + b) 形を優先検出（x^2 + c1)(x^2 + c2)）
        if let Some(mut qs) = detect_quadratics_even_quartic(&leftover) {
            // 検証: これらの積で leftover を割り切れるか
            let mut prod = Polynomial::one();
            for (q, _) in qs.iter() {
                prod = &prod * q;
            }
            let (qdiv, rmd) = leftover.div_rem(&prod);
            if rmd.is_zero() {
                quads.append(&mut qs);
                leftover = qdiv; // 通常は定数1
            }
        }
        // 繰り返し gcd で二次因子を取り出す（異なる二次因子を順次検出）
        if leftover.deg() >= 2 {
            loop {
                match detect_single_quadratic_chain(&leftover)? {
                    Some((q, m)) => {
                        let q_pow = pow_poly(&q, m);
                        let (qdiv, rmd) = leftover.div_rem(&q_pow);
                        if !rmd.is_zero() {
                            return None;
                        }
                        quads.push((q, m));
                        leftover = qdiv;
                        if leftover.deg() <= 0 {
                            break;
                        }
                    }
                    None => break,
                }
            }
        }
        if quads.len() > 0 {
            if leftover.deg() >= 1 {
                return None;
            }
            // 単一の二次因子鎖のみなら、根ベース（繰り返し二次対応）でまず試す
            if quads.len() == 1 {
                if let Some(expr) = pfe_via_repeated_quadratic_root_based(
                    &num,
                    &self.denominator,
                    &poly_part,
                    &linear_factors,
                    &quads[0],
                ) {
                    return Some(expr);
                }
            }
            // フォールバック: 一般の線形方程式アプローチ
            let expr = pfe_via_linear_system(
                &num,
                &self.denominator,
                &poly_part,
                &linear_factors,
                &quads,
            )?;
            return Some(expr);
        }

        // 3) 二次因子が見つからなかった場合のみ、4次以下の単純根で残差法を適用
        if self.denominator.deg() >= 1 && self.denominator.deg() <= 4 {
            let deriv = differentiate_poly(&self.denominator);
            let g = Polynomial::gcd(&self.denominator, &deriv);
            if g.deg() == 0 {
                if let Some(expr) = pfe_via_simple_residues(&num, &self.denominator, &poly_part) {
                    return Some(expr);
                }
            } else {
                // 重根だが二次因子が無い（=全て有理一次因子の重複）ケースは、高次残差で処理
                let (linear_factors, leftover) = factor_over_rationals(self.denominator.clone());
                if leftover.deg() <= 0 {
                    if let Some(expr) = pfe_via_linear_residues_with_repeats(
                        &num,
                        &self.denominator,
                        &poly_part,
                        &linear_factors,
                    ) {
                        return Some(expr);
                    }
                }
            }
        }

        None
    }
}

// Factor denominator over rational linear factors: returns Vec<(r, mult)> and leftover polynomial
fn factor_over_rationals(mut den: Polynomial<R>) -> (Vec<(R, usize)>, Polynomial<R>) {
    let mut factors: Vec<(R, usize)> = Vec::new();
    loop {
        if den.deg() <= 0 {
            break;
        }
        if let Some(r) = find_one_rational_root(&den) {
            // count multiplicity by repeated division
            let mut mult = 0usize;
            let lin = Polynomial::new(vec![-r.clone(), R::from_int(1)]);
            let mut cur = den.clone();
            loop {
                let (q, rmd) = cur.div_rem(&lin);
                if rmd.is_zero() {
                    mult += 1;
                    cur = q;
                } else {
                    break;
                }
                if cur.deg() <= 0 {
                    break;
                }
            }
            den = cur;
            // merge if same root already in list
            let mut merged = false;
            for (rr, mm) in factors.iter_mut() {
                if rr == &r {
                    *mm += mult;
                    merged = true;
                    break;
                }
            }
            if !merged {
                factors.push((r, mult));
            }
            continue;
        }
        break;
    }
    (factors, den)
}

// Local helper: rational root search (copy from symbolic_solver.rs with minimal deps)
fn find_one_rational_root(p: &Polynomial<R>) -> Option<R> {
    if p.deg() <= 0 {
        return None;
    }
    // Scale to integer polynomial by LCM of denominators
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
                let cand = R::new(n, qden as i64).simplified();
                if p.eval(cand.clone()).is_zero() {
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

fn differentiate_poly(p: &Polynomial<R>) -> Polynomial<R> {
    let deg = p.deg();
    if deg <= 0 {
        return Polynomial::zero();
    }
    let mut new_coeffs: Vec<R> = Vec::with_capacity(deg as usize);
    for (i, coeff) in p.coeffs.iter().enumerate().skip(1) {
        let k = R::from_int(i as i64);
        new_coeffs.push(coeff.clone() * k);
    }
    Polynomial::new(new_coeffs)
}

// ---- Complex evaluation helpers (for 4次以下・単純根の残差法) ----
fn eval_poly_at_complex(p: &Polynomial<R>, z: &C) -> C {
    // Horner 法: acc = 0; for k from deg..0: acc = acc*z + c_k
    let mut acc = C::zero();
    for coeff in p.coeffs.iter().rev() {
        acc = acc.mul(z);
        let c = E::rational(coeff.numer(), coeff.denom() as i64);
        acc = acc.add(&C::from_real(c));
    }
    acc
}

fn conj(c: &C) -> C {
    C {
        re: c.re.clone(),
        im: (-c.im.clone()).simplify(),
    }
}

fn pfe_via_simple_residues(
    num: &Polynomial<R>,
    den: &Polynomial<R>,
    poly_part: &Polynomial<R>,
) -> Option<E> {
    if den.deg() <= 0 {
        return Some(poly_part.eval_expr(E::Symbol("x".into())));
    }
    // 全根（単純）を求め、A_k = N(r_k)/D'(r_k) を計算
    let roots = den.find_roots_symbolic();
    if roots.is_empty() {
        return None;
    }
    let dprime = differentiate_poly(den);
    let x = E::Symbol("x".into());
    let mut terms: Vec<E> = vec![poly_part.eval_expr(x.clone())];
    let mut used = vec![false; roots.len()];

    for i in 0..roots.len() {
        if used[i] {
            continue;
        }
        let r = &roots[i];
        let r_is_real = r.im.clone().simplify().is_zero();
        // residue A = N(r)/D'(r)
        let n_r = eval_poly_at_complex(num, r);
        let d_r = eval_poly_at_complex(&dprime, r);
        // guard: simple root => d_r != 0（ゼロなら単純根でない）
        if d_r.re.clone().simplify().is_zero() && d_r.im.clone().simplify().is_zero() {
            return None;
        }
        let a = n_r / d_r; // SymbolicComplex の除算（実装済）

        if r_is_real {
            // 実根: A は実になるはず。安全側で実部のみ使用。
            let a_re = a.re.clone().simplify();
            let base = (x.clone() + E::mul(vec![E::int(-1), r.re.clone()]).simplify()).simplify();
            let term = (a_re * E::pow(base, E::int(-1))).simplify();
            terms.push(term);
            used[i] = true;
        } else {
            // 共役ペアを探してまとめて実数形 (β x + γ)/Q(x) にする
            let mut paired = None;
            for j in (i + 1)..roots.len() {
                if used[j] {
                    continue;
                }
                let r2 = &roots[j];
                // re 同一かつ im が符号反転ならペア
                if r.re == r2.re && r.im == (-r2.im.clone()).simplify() {
                    paired = Some(j);
                    break;
                }
            }
            let j = paired?; // 見つからなければ失敗
            used[i] = true;
            used[j] = true;
            let a_re = a.re.clone().simplify();
            let two = E::int(2);
            let beta = (two.clone() * a_re).simplify(); // β = 2 Re(A)
            let ar_conj = a.mul(&conj(r));
            let gamma = (E::mul(vec![E::int(-2), ar_conj.re.clone().simplify()])).simplify(); // γ = -2 Re(A r̄)
                                                                                              // Q(x) = (x - a)^2 + b^2
            let a_rex = r.re.clone().simplify();
            let b_imx = r.im.clone().simplify();
            let base = (x.clone() + E::mul(vec![E::int(-1), a_rex.clone()]).simplify()).simplify();
            let q_expr =
                (E::pow(base, E::int(2)) + (b_imx.clone() * b_imx.clone()).simplify()).simplify();
            let nume = (beta * x.clone() + gamma).simplify();
            let term = (nume * E::pow(q_expr, E::int(-1))).simplify();
            terms.push(term);
        }
    }
    Some(E::add(terms).simplify())
}

// ---- Root-based PFE for a single repeated irreducible quadratic factor Q^m (stub; falls back) ----
fn pfe_via_repeated_quadratic_root_based(
    num: &Polynomial<R>,
    den: &Polynomial<R>,
    poly_part: &Polynomial<R>,
    linear_factors: &Vec<(R, usize)>,
    quad: &(Polynomial<R>, usize),
) -> Option<E> {
    // Preconditions
    let (q, m) = quad;
    if q.deg() != 2 {
        return None;
    }
    // roots of q (complex conjugate)
    let mut roots = q.find_roots_symbolic();
    if roots.len() != 2 {
        return None;
    }
    let z = roots.remove(0);
    let zc = roots.remove(0);
    // ensure conjugate pairing
    let conj_z = conj(&z);
    if !(zc.re == conj_z.re && zc.im == conj_z.im) {
        // try swap
        let z2 = zc.clone();
        let zc2 = z.clone();
        let conj_z2 = conj(&z2);
        if !(zc2.re == conj_z2.re && zc2.im == conj_z2.im) {
            return None;
        }
    }

    // Helper: factorial as E rational scalar complex
    fn inv_fact_c(n: usize) -> C {
        let f = factorial(n as u32);
        let r = R::from_int(1) / R::from_int(f as i64);
        C::from_real(E::Rational(r.simplified()))
    }
    // series coeffs at complex point: p^{(k)}(z)/k!
    fn series_at(p: &Polynomial<R>, z: &C, kmax: usize) -> Vec<C> {
        let mut cur = p.clone();
        let mut out: Vec<C> = Vec::with_capacity(kmax + 1);
        for k in 0..=kmax {
            let v = eval_poly_at_complex(&cur, z);
            let scaled = v.mul(&inv_fact_c(k));
            out.push(scaled);
            cur = differentiate_poly(&cur);
        }
        out
    }
    // compute A_j via series division of N/G where G = D/(x-z)^m
    let m_us = *m as usize;
    let n_series = series_at(num, &z, m_us - 1);
    // D series up to 2m-1
    let d_series = series_at(den, &z, 2 * m_us - 1);
    // build G_series: shift by m
    let mut g_series: Vec<C> = Vec::with_capacity(m_us);
    for t in 0..m_us {
        g_series.push(d_series.get(t + m_us)?.clone());
    }
    // if G_series[0] == 0 -> not a root of exact multiplicity m
    if g_series[0].re.clone().simplify().is_zero() && g_series[0].im.clone().simplify().is_zero() {
        return None;
    }
    // H = N/G series via division
    let mut h_series: Vec<C> = vec![C::zero(); m_us];
    // H0
    h_series[0] = n_series[0].clone() / g_series[0].clone();
    for n in 1..m_us {
        let mut acc = C::zero();
        for i in 1..=n {
            let gi = g_series.get(i).cloned().unwrap_or_else(C::zero);
            if !(gi.re.clone().simplify().is_zero() && gi.im.clone().simplify().is_zero()) {
                acc = acc.add(&gi.mul(&h_series[n - i]));
            }
        }
        let nume = n_series[n].clone() - acc;
        h_series[n] = nume / g_series[0].clone();
    }
    // A_j = H[m - j]
    let mut a_coeffs: Vec<C> = vec![C::zero(); m_us + 1]; // 1..=m
    for j in 1..=m_us {
        a_coeffs[j] = h_series[m_us - j].clone();
    }

    // Build numerator polynomials for each power p=j as coefficients in y = x - a
    let x = E::Symbol("x".into());
    let a = z.re.clone().simplify();
    let b = z.im.clone().simplify();
    let y = (x.clone() + E::mul(vec![E::int(-1), a.clone()]).simplify()).simplify();

    // binomial helper
    fn comb(n: usize, k: usize) -> R {
        if k > n {
            return R::from_int(0);
        }
        let mut num: u128 = 1;
        let mut den: u128 = 1;
        let kk = k.min(n - k);
        for i in 1..=kk {
            num *= (n - (kk - i)) as u128;
            den *= i as u128;
        }
        // reduce to Rational
        let mut nn = num as i128;
        let mut dd = den as i128;
        // gcd
        let mut a = nn.abs() as i64;
        let mut b_g = dd.abs() as i64;
        while b_g != 0 {
            let t = a % b_g;
            a = b_g;
            b_g = t;
        }
        let g = a as i128;
        nn /= g;
        dd /= g;
        R::new(nn as i64, dd as i64).simplified()
    }
    fn pow_e(mut base: E, exp: usize) -> E {
        if exp == 0 {
            return E::int(1);
        }
        let mut acc = base.clone();
        for _ in 1..exp {
            acc = (acc * base.clone()).simplify();
        }
        acc
    }
    fn add_coeff(vec: &mut Vec<E>, deg: usize, val: E) {
        while vec.len() <= deg {
            vec.push(E::int(0));
        }
        vec[deg] = (vec[deg].clone() + val).simplify();
    }
    fn re_i_pow_times_a(a: &C, t: usize) -> E {
        // Re( a * i^t )
        match t % 4 {
            0 => a.re.clone().simplify(),
            1 => (-a.im.clone()).simplify(),
            2 => (-a.re.clone()).simplify(),
            _ => a.im.clone().simplify(),
        }
    }

    // poly_numer[p]: coefficients for y^k
    let mut poly_numer: Vec<Vec<E>> = vec![vec![]; m_us + 1];
    for j in 1..=m_us {
        let aj = a_coeffs[j].clone();
        for k in 0..=j {
            let cbin = E::Rational(comb(j, k));
            let t = j - k; // power of i*b
            let re_part = re_i_pow_times_a(&aj, t);
            let b_pow = if t == 0 {
                E::int(1)
            } else {
                pow_e(b.clone(), t)
            };
            let coeff = (E::int(2) * cbin * re_part * b_pow).simplify();
            add_coeff(&mut poly_numer[j], k, coeff);
        }
    }

    // reduction using y^2 = Q - b^2; accumulate polynomial overflow when p goes to 0
    let b2 = (b.clone() * b.clone()).simplify();
    let mut poly_overflow: Vec<E> = vec![]; // coefficients for y^k (polynomial part)
    for p in (1..=m_us).rev() {
        loop {
            let deg = if poly_numer[p].is_empty() {
                0
            } else {
                poly_numer[p].len() - 1
            };
            if deg <= 1 {
                break;
            }
            let c = poly_numer[p][deg].clone();
            // remove highest term
            poly_numer[p].pop();
            let new_deg = deg - 2;
            // distribute: c*y^{deg}/Q^p = c*y^{new_deg}/Q^{p-1} - c*b^2*y^{new_deg}/Q^p
            if p > 1 {
                add_coeff(&mut poly_numer[p - 1], new_deg, c.clone());
            } else {
                // goes to polynomial part
                add_coeff(&mut poly_overflow, new_deg, c.clone());
            }
            let minus = (-(c.clone() * b2.clone())).simplify();
            add_coeff(&mut poly_numer[p], new_deg, minus);
        }
    }

    // Build final expression terms
    let mut terms: Vec<E> = Vec::new();
    // polynomial base
    let poly_expr = poly_part.eval_expr(x.clone());
    let mut poly_total = poly_expr;
    // add polynomial overflow (in y powers)
    for (k, coeff) in poly_overflow.into_iter().enumerate() {
        if k == 0 {
            poly_total = (poly_total + coeff).simplify();
        } else if k == 1 {
            poly_total = (poly_total + coeff * y.clone()).simplify();
        } else {
            poly_total = (poly_total + coeff * pow_e(y.clone(), k)).simplify();
        }
    }
    terms.push(poly_total);
    // Linear (rational) repeated roots terms
    if !linear_factors.is_empty() {
        let xsym = E::Symbol("x".into());
        for (r, mlin) in linear_factors.iter() {
            let lin = Polynomial::new(vec![(-r.clone()).simplified(), R::from_int(1)]);
            let linp = pow_poly(&lin, *mlin);
            let g = poly_div_exact(den, &linp)?;
            let h_num = num.clone();
            let h_den = g.clone();
            for j in 1..=*mlin {
                let korder = (*mlin - j) as usize;
                let mut cur_num = h_num.clone();
                let mut cur_den = h_den.clone();
                for _ in 0..korder {
                    let n_prime = differentiate_poly(&cur_num);
                    let d_prime = differentiate_poly(&cur_den);
                    let top = &(&n_prime * &cur_den) - &(&cur_num * &d_prime);
                    let bot = &cur_den * &cur_den;
                    cur_num = top;
                    cur_den = bot;
                }
                let nr = cur_num.eval(r.clone());
                let dr = cur_den.eval(r.clone());
                if dr.is_zero() {
                    return None;
                }
                let mut a_j = nr / dr;
                let fact = factorial((mlin - j) as u32);
                a_j = a_j / R::from_int(fact as i64);
                if !a_j.is_zero() {
                    let base = (xsym.clone() + E::Rational((-r.clone()).simplified())).simplify();
                    let term = (E::Rational(a_j.simplified()) * E::pow(base, E::int(-(j as i64))))
                        .simplify();
                    terms.push(term);
                }
            }
        }
    }
    // Quadratic chain terms (now degree <=1 per power)
    let q_expr = {
        let base = y.clone();
        (E::pow(base, E::int(2)) + b2).simplify()
    };
    for p in 1..=m_us {
        if poly_numer[p].is_empty() {
            continue;
        }
        let c0 = poly_numer[p].get(0).cloned().unwrap_or(E::int(0));
        let c1 = poly_numer[p].get(1).cloned().unwrap_or(E::int(0));
        // β y + γ → β x + (γ - β a)
        let beta = c1;
        let gamma = c0;
        let gamma_x =
            (gamma.clone() + (beta.clone() * (E::int(-1) * a.clone()).simplify())).simplify();
        let numer = (beta * x.clone() + gamma_x).simplify();
        let term = (numer * E::pow(q_expr.clone(), E::int(-(p as i64)))).simplify();
        terms.push(term);
    }
    Some(E::add(terms).simplify())
}

// ---- Residue-based PFE for repeated rational linear roots (no quadratic factors) ----
fn pfe_via_linear_residues_with_repeats(
    num: &Polynomial<R>,
    den: &Polynomial<R>,
    poly_part: &Polynomial<R>,
    linear_factors: &Vec<(R, usize)>,
) -> Option<E> {
    if den.deg() <= 0 {
        return Some(poly_part.eval_expr(E::Symbol("x".into())));
    }
    // verify no non-linear leftover: enforced by caller
    let x = E::Symbol("x".into());
    let mut terms: Vec<E> = vec![poly_part.eval_expr(x.clone())];
    for (r, m) in linear_factors.iter() {
        // G(x) = D(x)/(x-r)^m
        let lin = Polynomial::new(vec![-r.clone(), R::from_int(1)]);
        let linp = pow_poly(&lin, *m);
        let g = poly_div_exact(den, &linp)?;
        // h(x) = N(x)/G(x)
        let h_num = num.clone();
        let h_den = g.clone();
        // Prepare factorials as rationals
        for j in 1..=*m {
            // order k = m-j derivative of h evaluated at r
            let k = (*m - j) as usize;
            let mut cur_num = h_num.clone();
            let mut cur_den = h_den.clone();
            // take k derivatives of cur_num/cur_den
            for _ in 0..k {
                let n_prime = differentiate_poly(&cur_num);
                let d_prime = differentiate_poly(&cur_den);
                // (N' D - N D') / D^2
                let top = &(&n_prime * &cur_den) - &(&cur_num * &d_prime);
                let bot = &cur_den * &cur_den;
                cur_num = top;
                cur_den = bot;
            }
            // evaluate at r
            let nr = cur_num.eval(r.clone());
            let dr = cur_den.eval(r.clone());
            if dr.is_zero() {
                return None;
            } // should not happen (analytic at r)
            let mut a_j = nr / dr; // Rational
                                   // divide by (m-j)! factor
            let fact = factorial((m - j) as u32);
            a_j = a_j / R::from_int(fact as i64);
            // term A_j / (x - r)^j
            if !a_j.is_zero() {
                let base = (x.clone() + E::Rational((-r.clone()).simplified())).simplify();
                let term =
                    (E::Rational(a_j.simplified()) * E::pow(base, E::int(-(j as i64)))).simplify();
                terms.push(term);
            }
        }
    }
    Some(E::add(terms).simplify())
}

fn factorial(n: u32) -> u64 {
    (1..=n as u64).product::<u64>()
}

// ---- Quadratic chain detection ----
// Returns Some((Q, mult)) if leftover is either degree 0 or a single quadratic factor to some power.
// If leftover has multiple distinct quadratic factors or higher irreducible factors, returns Some(None)
// represented by returning Some((Q,m)) from caller’s perspective via Option<Option<...>> pattern above.
fn detect_single_quadratic_chain(
    leftover: &Polynomial<R>,
) -> Option<Option<(Polynomial<R>, usize)>> {
    if leftover.deg() <= 0 {
        return Some(None);
    }
    if leftover.deg() == 2 {
        return Some(Some((leftover.clone(), 1)));
    }
    // Try to detect Q^m via gcd(f, f')
    let mut mult = 0usize;
    let deriv = differentiate_poly(leftover);
    let mut g = Polynomial::gcd(leftover, &deriv);
    if g.deg() < 2 {
        return None;
    } // cannot identify a quadratic factor reliably
      // Normalize g to quadratic if higher degree (rare here)
    if g.deg() > 2 {
        // Try to peel until quadratic by repeated gcd steps
        let mut gg = g.clone();
        loop {
            let dgg = differentiate_poly(&gg);
            let gg2 = Polynomial::gcd(&gg, &dgg);
            if gg2.deg() == 2 {
                g = gg2;
                break;
            }
            if gg2.deg() < 2 {
                return None;
            }
            gg = gg2;
        }
    }
    // Count multiplicity of g in f
    let mut cur = leftover.clone();
    loop {
        let (q, r) = cur.div_rem(&g);
        if r.is_zero() {
            mult += 1;
            cur = q;
        } else {
            break;
        }
        if cur.deg() < 2 {
            break;
        }
    }
    // After removing g^mult, ensure nothing else with degree >= 2 remains
    if cur.deg() >= 2 {
        return None;
    }
    Some(Some((g, mult)))
}

// 特化検出: f(x) が 4次で x^4 + a x^2 + b の形なら、(x^2 + c1)(x^2 + c2) に因数分解
// c1, c2 は t^2 - a t + b = 0 の解（有理数）である必要がある。
fn detect_quadratics_even_quartic(leftover: &Polynomial<R>) -> Option<Vec<(Polynomial<R>, usize)>> {
    if leftover.deg() != 4 {
        return None;
    }
    let a4 = leftover.get(4);
    let a3 = leftover.get(3);
    let a2 = leftover.get(2);
    let a1 = leftover.get(1);
    let a0 = leftover.get(0);
    if !a3.is_zero() || !a1.is_zero() {
        return None;
    }
    // 先頭係数が 1 でない場合は対象外（簡易実装）
    if !(a4 - R::from_int(1)).is_zero() {
        return None;
    }
    // t^2 - a2 t + a0 = 0 を R 上で解く（判別式が平方数なら解は有理）
    // 判別式 Δ = a2^2 - 4 a0
    let delta = a2.clone() * a2.clone() - R::from_int(4) * a0.clone();
    // delta が完全平方の有理数か判定
    if let Some(s) = rational_sqrt(delta.clone()) {
        let two = R::from_int(2);
        let c1 = (a2.clone() + s.clone()) / two.clone();
        let c2 = (a2 - s) / two;
        // Q1 = x^2 + c1, Q2 = x^2 + c2
        let q1 = Polynomial::new(vec![c1, R::from_int(0), R::from_int(1)]);
        let q2 = Polynomial::new(vec![c2, R::from_int(0), R::from_int(1)]);
        return Some(vec![(q1, 1usize), (q2, 1usize)]);
    }
    None
}

// 有理数の平方根が再び有理数であるかを判定し、あれば返す
fn rational_sqrt(r: R) -> Option<R> {
    // r = n/d; |n| と d がともに平方数なら sqrt(r) は有理
    let n = r.numer();
    let d = r.denom() as i64;
    if n == 0 {
        return Some(R::from_int(0));
    }
    let an = n.abs() as u128;
    let ad = (d.abs()) as u128;
    let sn = (integer_sqrt(an))? as i64; // 完全平方でない場合 None
    let sd = (integer_sqrt(ad))? as i64;
    let sign = if n.signum() * d.signum() >= 0 { 1 } else { -1 };
    Some(R::new(sign * sn, sd).simplified())
}

fn integer_sqrt(x: u128) -> Option<u128> {
    // 整数平方根（完全平方のみ Some）
    let s = (x as f64).sqrt() as u128;
    if s * s == x {
        Some(s)
    } else {
        None
    }
}

// ---- Linear system construction and solve for PFE ----
fn pow_poly(p: &Polynomial<R>, n: usize) -> Polynomial<R> {
    if n == 0 {
        return Polynomial::one();
    }
    let mut acc = Polynomial::one();
    for _ in 0..n {
        acc = &acc * p;
    }
    acc
}

fn poly_div_exact(p: &Polynomial<R>, d: &Polynomial<R>) -> Option<Polynomial<R>> {
    let (q, r) = p.div_rem(d);
    if r.is_zero() {
        Some(q)
    } else {
        None
    }
}

#[derive(Clone, Debug)]
enum UnknownDesc {
    Lin { r: R, j: usize },            // A_{j}/(x - r)^j (r は有理根のみ)
    QuadBeta { qi: usize, j: usize },  // β_{qi,j} for (β x + γ)/Q_qi^j
    QuadGamma { qi: usize, j: usize }, // γ_{qi,j} for (β x + γ)/Q_qi^j
}

fn pfe_via_linear_system(
    num: &Polynomial<R>,
    den: &Polynomial<R>,
    poly_part: &Polynomial<R>,
    linear_factors: &Vec<(R, usize)>,
    quads: &Vec<(Polynomial<R>, usize)>,
) -> Option<E> {
    let rows = (den.deg() as usize).max(0);
    if rows == 0 {
        return Some(poly_part.eval_expr(E::Symbol("x".into())));
    }

    // Build unknown list
    let mut unknowns: Vec<UnknownDesc> = Vec::new();
    for (r, m) in linear_factors.iter() {
        for j in 1..=*m {
            unknowns.push(UnknownDesc::Lin { r: r.clone(), j });
        }
    }
    for (qi, (_q, m)) in quads.iter().enumerate() {
        for j in 1..=*m {
            unknowns.push(UnknownDesc::QuadBeta { qi, j });
            unknowns.push(UnknownDesc::QuadGamma { qi, j });
        }
    }
    let mcols = unknowns.len();
    if mcols == 0 {
        // no proper part
        return Some(poly_part.eval_expr(E::Symbol("x".into())));
    }
    // Build matrix A (rows x mcols) and vector b (rows)
    let mut a: Vec<Vec<R>> = vec![vec![R::from_int(0); mcols]; rows];
    let mut b: Vec<R> = vec![R::from_int(0); rows];

    // Compute target polynomial: remainder R(x) = num(x)
    let rem = num.clone();
    for k in 0..rows {
        b[k] = rem.get(k);
    }

    // Precompute columns
    for (col, desc) in unknowns.iter().enumerate() {
        match desc {
            UnknownDesc::Lin { r, j } => {
                let lin = Polynomial::new(vec![-r.clone(), R::from_int(1)]);
                let linp = pow_poly(&lin, *j);
                let base = poly_div_exact(den, &linp)?; // D/(x-r)^j
                                                        // Column = coefficients of base
                for k in 0..rows {
                    a[k][col] = base.get(k);
                }
            }
            UnknownDesc::QuadBeta { qi, j } => {
                let (q, _qm) = &quads[*qi];
                let qp = pow_poly(q, *j);
                let base = poly_div_exact(den, &qp)?; // D/Q^j
                                                      // multiply by x: shift coefficients up by 1
                for k in 0..rows {
                    a[k][col] = if k == 0 {
                        R::from_int(0)
                    } else {
                        base.get(k - 1)
                    };
                }
            }
            UnknownDesc::QuadGamma { qi, j } => {
                let (q, _m) = &quads[*qi];
                let qp = pow_poly(q, *j);
                let base = poly_div_exact(den, &qp)?;
                for k in 0..rows {
                    a[k][col] = base.get(k);
                }
            }
        }
    }

    // Solve A x = b over R
    let sol = solve_linear_rational(a, b)?;

    // Assemble expression: poly_part + sum terms
    let x = E::Symbol("x".into());
    let mut terms: Vec<E> = Vec::new();
    // polynomial part first
    terms.push(poly_part.eval_expr(x.clone()));

    let mut idx = 0;
    for desc in unknowns.into_iter() {
        let coeff = sol[idx].clone();
        idx += 1;
        match desc {
            UnknownDesc::Lin { r, j } => {
                if coeff.is_zero() {
                    continue;
                }
                let c_e = E::Rational(coeff.simplified());
                let base = (x.clone() + E::Rational((-r).simplified())).simplify();
                let term = (c_e * E::pow(base, E::int(-(j as i64)))).simplify();
                terms.push(term);
            }
            UnknownDesc::QuadBeta { qi, j } => {
                if coeff.is_zero() {
                    continue;
                }
                let (q, _m) = &quads[qi];
                let q_expr = q.eval_expr(x.clone());
                let beta = E::Rational(coeff.simplified());
                let pow_q = E::pow(q_expr, E::int(-(j as i64)));
                terms.push((beta * x.clone() * pow_q.clone()).simplify());
            }
            UnknownDesc::QuadGamma { qi, j } => {
                if coeff.is_zero() {
                    continue;
                }
                let (q, _m) = &quads[qi];
                let q_expr = q.eval_expr(x.clone());
                let gamma = E::Rational(coeff.simplified());
                let pow_q = E::pow(q_expr, E::int(-(j as i64)));
                terms.push((gamma * pow_q).simplify());
            }
        }
    }
    Some(E::add(terms).simplify())
}

fn solve_linear_rational(mut a: Vec<Vec<R>>, mut b: Vec<R>) -> Option<Vec<R>> {
    let n = a.len();
    if n == 0 {
        return Some(vec![]);
    }
    let m = a[0].len();
    let mut row = 0usize;
    for col in 0..m {
        // find pivot
        let mut piv = None;
        for r in row..n {
            if !a[r][col].is_zero() {
                piv = Some(r);
                break;
            }
        }
        if let Some(piv_row) = piv {
            if piv_row != row {
                a.swap(piv_row, row);
                b.swap(piv_row, row);
            }
            // normalize
            let piv_val = a[row][col].clone();
            let inv = R::from_int(1) / piv_val;
            for c in col..m {
                a[row][c] = a[row][c].clone() * inv.clone();
            }
            b[row] = b[row].clone() * inv.clone();
            // eliminate other rows
            for r in 0..n {
                if r == row {
                    continue;
                }
                let factor = a[r][col].clone();
                if factor.is_zero() {
                    continue;
                }
                for c in col..m {
                    a[r][c] = a[r][c].clone() - factor.clone() * a[row][c].clone();
                }
                b[r] = b[r].clone() - factor * b[row].clone();
            }
            row += 1;
            if row == n {
                break;
            }
        }
    }
    // read solution from the (reduced) matrix without relying on exact equality
    // For each row, take the first non-zero column as pivot and assign its solution from b[r]
    let mut x = vec![R::from_int(0); m];
    for r in 0..n {
        let mut pc: Option<usize> = None;
        for c in 0..m {
            if !a[r][c].is_zero() {
                pc = Some(c);
                break;
            }
        }
        if let Some(c) = pc {
            x[c] = b[r].clone();
        }
    }
    Some(x)
}
