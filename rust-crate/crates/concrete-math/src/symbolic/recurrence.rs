use algebraic::{complex::SymbolicComplex as C, expr::SymbolicExpr as E, rational::Rational as R};
use num_traits::{One, Zero};
use polynomial::core::Polynomial;

// Public API: solve homogeneous linear recurrence with rational coefficients (order 1 or 2)
// Form: a_n + c1 a_{n-1} + c2 a_{n-2} = 0
// coeffs = [c1] or [c1, c2]; initials = [a0] or [a0, a1]

fn r_to_e(x: &R) -> E {
    E::Rational(x.clone())
}

pub fn solve_homogeneous(coeffs: Vec<R>, initials: Vec<E>) -> E {
    // まず、生成関数→有理関数→PFE（単純極のみ）から閉形式を構成するルートを試みる
    if let Some(expr) = solve_homogeneous_via_rf_pfe(&coeffs, &initials) {
        return expr;
    }
    match coeffs.len() {
        0 => E::int(0),
        1 => solve_order1(&coeffs[0], initials.get(0).cloned().unwrap_or(E::int(0))),
        2 => solve_order2(&coeffs[0], &coeffs[1], &initials),
        _ => solve_order_k_distinct_real(&coeffs, &initials),
    }
}

/// Experimental: Solve homogeneous recurrence allowing complex roots (scaffold API)
/// - If all characteristic roots are real, delegates to `solve_homogeneous` and returns Ok(expr).
/// - If any complex root appears (non-zero imaginary), returns Err explaining that complex roots
///   are not yet supported in real SymbolicExpr form. Future work: convert conjugate pairs into
///   real basis r^n (A cos(nθ) + B sin(nθ)).
pub fn solve_homogeneous_complex(coeffs: Vec<R>, initials: Vec<E>) -> Result<E, String> {
    if has_complex_roots(&coeffs) {
        return Err("complex characteristic roots are not yet supported in real SymbolicExpr; consider using a real-form (cos/sin) basis in a future update".into());
    }
    Ok(solve_homogeneous(coeffs, initials))
}

fn has_complex_roots(coeffs: &[R]) -> bool {
    if coeffs.is_empty() {
        return false;
    }
    let p = characteristic_polynomial(coeffs);
    let roots = p.find_roots_symbolic();
    for z in roots {
        if z.im.to_string() != "0" {
            return true;
        }
    }
    false
}

// --- Complex-root full solution in complex-sum form ---
// Returns (roots, coeffs) such that a_n = sum_j coeffs[j] * (roots[j])^n
pub fn solve_homogeneous_complex_sum(coeffs: Vec<R>, initials: Vec<E>) -> Option<(Vec<C>, Vec<C>)> {
    let k = coeffs.len();
    if k == 0 {
        return Some((vec![], vec![]));
    }
    let p = characteristic_polynomial(&coeffs);
    let roots = p.find_roots_symbolic();
    if roots.len() != k {
        return None;
    }
    // Build Vandermonde-like matrix M[i][j] = r_j^i (complex), i=0..k-1
    let mut mtx: Vec<Vec<C>> = vec![vec![C::zero(); k]; k];
    for i in 0..k {
        for j in 0..k {
            mtx[i][j] = complex_pow_int(roots[j].clone(), i as u32);
        }
    }
    // RHS: initials as complex
    let rhs: Vec<C> = (0..k)
        .map(|i| C::from_real(initials.get(i).cloned().unwrap_or(E::int(0))))
        .collect();
    let coeffs = gauss_solve_complex(mtx, rhs)?;
    Some((roots, coeffs))
}

pub fn eval_complex_sum(roots: &Vec<C>, coeffs: &Vec<C>, n: i64) -> C {
    let mut acc = C::zero();
    let nn = if n < 0 { 0 } else { n as u32 };
    for j in 0..roots.len() {
        let term = coeffs[j].clone() * complex_pow_int(roots[j].clone(), nn);
        acc = acc + term;
    }
    acc
}

fn complex_pow_int(base: C, exp: u32) -> C {
    if exp == 0 {
        return C::one();
    }
    let mut result = C::one();
    let mut b = base.clone();
    let mut e = exp;
    while e > 0 {
        if (e & 1) == 1 {
            result = result * b.clone();
        }
        e >>= 1;
        if e > 0 {
            b = b.clone() * b;
        }
    }
    result
}

fn gauss_solve_complex(mut a: Vec<Vec<C>>, mut b: Vec<C>) -> Option<Vec<C>> {
    let n = a.len();
    for col in 0..n {
        // find pivot
        let mut pivot = col;
        while pivot < n && a[pivot][col].is_zero() {
            pivot += 1;
        }
        if pivot == n {
            return None;
        }
        if pivot != col {
            a.swap(pivot, col);
            b.swap(pivot, col);
        }
        // normalize
        let piv = a[col][col].clone();
        for j in col..n {
            a[col][j] = a[col][j].clone() / piv.clone();
        }
        b[col] = b[col].clone() / piv;
        // eliminate
        for row in 0..n {
            if row == col {
                continue;
            }
            if a[row][col].is_zero() {
                continue;
            }
            let factor = a[row][col].clone();
            for j in col..n {
                a[row][j] = a[row][j].clone() - factor.clone() * a[col][j].clone();
            }
            b[row] = b[row].clone() - factor * b[col].clone();
        }
    }
    Some(b)
}

fn solve_order1(c1: &R, a0: E) -> E {
    // a_n = (-c1)^n * a0
    let base = r_to_e(&(-c1.clone()));
    let n = E::Symbol("n".into());
    (E::pow(base, n) * a0).simplify()
}

fn solve_order2(c1: &R, c2: &R, initials: &Vec<E>) -> E {
    let a0 = initials.get(0).cloned().unwrap_or(E::int(0));
    let a1 = initials.get(1).cloned().unwrap_or(E::int(0));
    // roots: r = (-c1 ± sqrt(c1^2 - 4 c2))/2
    let c1e = r_to_e(c1);
    let c2e = r_to_e(c2);
    let four = E::int(4);
    let disc = (c1e.clone() * c1e.clone()
        + E::mul(vec![E::int(-1), four.clone(), c2e.clone()]).simplify())
    .simplify();
    let sqrt_disc = E::pow(disc, E::rational(1, 2)).simplify();
    let two = E::int(2);
    let minus_c1 = (E::int(-1) * c1e.clone()).simplify();
    let r1 = ((minus_c1.clone() + sqrt_disc.clone()) / two.clone()).simplify();
    let r2 = ((minus_c1 - sqrt_disc.clone()) / two.clone()).simplify();
    let n = E::Symbol("n".into());
    // distinct vs repeated
    if (sqrt_disc.clone().simplify()).to_string() != "0" {
        // A = (a1 - a0 r2)/(r1 - r2); B = (a0 r1 - a1)/(r1 - r2)
        let denom = (r1.clone() - r2.clone()).simplify();
        let a = ((a1.clone() - (a0.clone() * r2.clone()).simplify()) / denom.clone()).simplify();
        let b = (((a0.clone() * r1.clone()).simplify() - a1.clone()) / denom).simplify();
        (a * E::pow(r1, n.clone()) + b * E::pow(r2, n)).simplify()
    } else {
        // repeated root r; a_n = (A + B n) r^n
        let r = r1; // == r2
        let a = a0.clone();
        let b = ((a1 - a0.clone() * r.clone()) / r.clone()).simplify();
        ((a + b.clone() * n.clone()).simplify() * E::pow(r, n)).simplify()
    }
}

// Inhomogeneous with constant forcing: a_n + c1 a_{n-1} (+ c2 a_{n-2}) = b
pub fn solve_inhomogeneous_constant(coeffs: Vec<R>, initials: Vec<E>, b: E) -> E {
    match coeffs.len() {
        0 => b, // a_n = b
        1 => {
            let c1e = r_to_e(&coeffs[0]);
            // particular p = b / (1 + c1) when 1+c1 != 0
            let denom = (E::int(1) + c1e.clone()).simplify();
            let p = (b.clone() / denom).simplify();
            let a0 = initials.get(0).cloned().unwrap_or(E::int(0));
            // homogeneous solution with shifted initial: a_n^h = (-c1)^n * (a0 - p)
            let hom = solve_order1(&coeffs[0], (a0 - p.clone()).simplify());
            (hom + p).simplify()
        }
        2 => {
            let c1e = r_to_e(&coeffs[0]);
            let c2e = r_to_e(&coeffs[1]);
            let denom = (E::int(1) + c1e.clone() + c2e.clone()).simplify();
            let p = (b.clone() / denom).simplify();
            let a0 = initials.get(0).cloned().unwrap_or(E::int(0));
            let a1 = initials.get(1).cloned().unwrap_or(E::int(0));
            // reduce to homogeneous by shifting: define b_n = a_n - p, then b_n + c1 b_{n-1} + c2 b_{n-2} = 0
            let hom = solve_order2(
                &coeffs[0],
                &coeffs[1],
                &vec![(a0 - p.clone()).simplify(), (a1 - p.clone()).simplify()],
            );
            (hom + p).simplify()
        }
        _ => {
            // 一般次数 k>=3: p = b / (1 + c1 + ... + ck)
            let mut denom = E::int(1);
            for c in &coeffs {
                denom = (denom + r_to_e(c)).simplify();
            }
            let p = (b.clone() / denom).simplify();
            // b_n = a_n - p で同次へ還元
            let k = coeffs.len();
            let mut shifted: Vec<E> = Vec::with_capacity(k);
            for i in 0..k {
                let ai = initials.get(i).cloned().unwrap_or(E::int(0));
                shifted.push((ai - p.clone()).simplify());
            }
            let hom = solve_homogeneous(coeffs, shifted);
            (hom + p).simplify()
        }
    }
}

// Inhomogeneous with exponential forcing: a_n + c1 a_{n-1} + ... + ck a_{n-k} = b * q^n
// coeffs: [c1, c2, ..., ck], initials: [a0, a1, ..., a_{k-1}], b: amplitude (SymbolicExpr), q: Rational base
pub fn solve_inhomogeneous_exponential(coeffs: Vec<R>, initials: Vec<E>, b: E, q: R) -> E {
    let k = coeffs.len();
    if k == 0 {
        return (b * E::pow(r_to_e(&q), E::Symbol("n".into()))).simplify();
    }
    // multiplicity s of q as a root of characteristic polynomial
    let p = characteristic_polynomial(&coeffs);
    let roots = p.find_roots_symbolic();
    let qe = r_to_e(&q);
    let mut s_mult = 0usize;
    for z in roots {
        if z.im.to_string() == "0" && z.re == qe {
            s_mult += 1;
        }
    }
    // Build particular ansatz basis: b_j(n) = n^j q^n for j=0..s_mult (non-resonant -> s_mult=0)
    let n_sym = E::Symbol("n".into());
    let qn = E::pow(qe.clone(), n_sym.clone());
    let mut pbasis: Vec<E> = Vec::with_capacity(s_mult + 1);
    for j in 0..=s_mult {
        let poly = if j == 0 {
            E::int(1)
        } else {
            E::pow(n_sym.clone(), E::int(j as i64))
        };
        pbasis.push((poly * qn.clone()).simplify());
    }
    // Linear system A * C = y, where A_{i,j} = L[b_j](i), y_i = b * q^i, for i=0..s_mult
    let mut a_mtx: Vec<Vec<E>> = vec![vec![E::int(0); s_mult + 1]; s_mult + 1];
    for i in 0..=s_mult {
        for j in 0..=s_mult {
            // L[T](i) = T(i) + c1 T(i-1) + ... + ck T(i-k)
            let mut acc = subst_n(&pbasis[j], i as i64);
            for (t, c) in coeffs.iter().enumerate() {
                // t=0..k-1 maps to c_{t+1}
                let val = subst_n(&pbasis[j], i as i64 - (t as i64 + 1));
                acc = (acc + (r_to_e(c) * val).simplify()).simplify();
            }
            a_mtx[i][j] = acc;
        }
    }
    let y_vec: Vec<E> = (0..=s_mult)
        .map(|i| (b.clone() * subst_n(&qn, i as i64)).simplify())
        .collect();
    let c_vec = gauss_solve(a_mtx, y_vec).unwrap_or_else(|| vec![E::int(0); s_mult + 1]);
    let p_of_n = E::add(
        pbasis
            .into_iter()
            .enumerate()
            .map(|(j, term)| (c_vec[j].clone() * term).simplify())
            .collect(),
    )
    .simplify();
    // Shift initials by subtracting particular, solve homogeneous, then add back particular
    let mut shifted: Vec<E> = Vec::with_capacity(k);
    for i in 0..k {
        let ai = initials.get(i).cloned().unwrap_or(E::int(0));
        shifted.push((ai - subst_n(&p_of_n, i as i64)).simplify());
    }
    let hom = solve_homogeneous(coeffs, shifted);
    (hom + p_of_n).simplify()
}

// Inhomogeneous with polynomial forcing: a_n + c1 a_{n-1} + ... + ck a_{n-k} = f(n),
// where f(n) = \sum_{j=0}^d p_j n^j
// coeffs: [c1, ..., ck], initials: [a0, ..., a_{k-1}], p: polynomial coefficients lowest degree first
pub fn solve_inhomogeneous_polynomial(coeffs: Vec<R>, initials: Vec<E>, p: Vec<E>) -> E {
    let k = coeffs.len();
    // f(n) expression builder
    let n_sym = E::Symbol("n".into());
    let build_poly = |p: &Vec<E>| -> E {
        let mut terms: Vec<E> = Vec::new();
        for (j, cj) in p.iter().enumerate() {
            let term = if j == 0 {
                cj.clone()
            } else {
                (cj.clone() * E::pow(n_sym.clone(), E::int(j as i64))).simplify()
            };
            terms.push(term);
        }
        E::add(terms).simplify()
    };
    let f_expr = build_poly(&p);
    if k == 0 {
        return f_expr;
    }
    // multiplicity of root 1
    let pchar = characteristic_polynomial(&coeffs);
    let roots = pchar.find_roots_symbolic();
    let one = E::int(1);
    let mut s_mult = 0usize;
    for z in roots {
        if z.im.to_string() == "0" && z.re == one {
            s_mult += 1;
        }
    }
    // degree of forcing
    let deg = if p.is_empty() { 0 } else { p.len() - 1 };
    let ans_deg = deg + s_mult; // raise degree by multiplicity when resonant at r=1
                                // particular ansatz: P(n) = \sum_{j=0}^{ans_deg} A_j n^j
    let mut pbasis: Vec<E> = Vec::with_capacity(ans_deg + 1);
    for j in 0..=ans_deg {
        pbasis.push(if j == 0 {
            E::int(1)
        } else {
            E::pow(n_sym.clone(), E::int(j as i64))
        });
    }
    // Build system A*C = y, where A_{i,j} = L[n^j](i), y_i = f(i), i=0..ans_deg
    let mut a_mtx: Vec<Vec<E>> = vec![vec![E::int(0); ans_deg + 1]; ans_deg + 1];
    for i in 0..=ans_deg {
        for j in 0..=ans_deg {
            let mut acc = subst_n(&pbasis[j], i as i64);
            for (t, c) in coeffs.iter().enumerate() {
                let val = subst_n(&pbasis[j], i as i64 - (t as i64 + 1));
                acc = (acc + (r_to_e(c) * val).simplify()).simplify();
            }
            a_mtx[i][j] = acc;
        }
    }
    let y_vec: Vec<E> = (0..=ans_deg).map(|i| subst_n(&f_expr, i as i64)).collect();
    let c_vec = gauss_solve(a_mtx, y_vec).unwrap_or_else(|| vec![E::int(0); ans_deg + 1]);
    let p_of_n = E::add(
        (0..=ans_deg)
            .map(|j| (c_vec[j].clone() * pbasis[j].clone()).simplify())
            .collect(),
    )
    .simplify();
    // shift initials and combine with homogeneous
    let mut shifted: Vec<E> = Vec::with_capacity(k);
    for i in 0..k {
        let ai = initials.get(i).cloned().unwrap_or(E::int(0));
        shifted.push((ai - subst_n(&p_of_n, i as i64)).simplify());
    }
    let hom = solve_homogeneous(coeffs, shifted);
    (hom + p_of_n).simplify()
}

// Inhomogeneous with arith-geom forcing: a_n + c1 a_{n-1} + ... + ck a_{n-k} = (\sum p_j n^j) q^n
// coeffs: [c1, ..., ck], initials: [a0..a_{k-1}], p: poly coeffs lowest degree first (E), q: Rational
pub fn solve_inhomogeneous_arith_geom(coeffs: Vec<R>, initials: Vec<E>, p: Vec<E>, q: R) -> E {
    solve_inhomogeneous_arith_geom_multiple(coeffs, initials, vec![(p, q)])
}

pub fn solve_inhomogeneous_arith_geom_multiple(
    coeffs: Vec<R>,
    initials: Vec<E>,
    terms: Vec<(Vec<E>, R)>,
) -> E {
    let k = coeffs.len();
    if k == 0 {
        let mut total_forcing = E::int(0);
        let n_sym = E::Symbol("n".into());
        for (p, q) in terms {
            let mut poly_terms = Vec::new();
            for (j, cj) in p.iter().enumerate() {
                let term = if j == 0 {
                    cj.clone()
                } else {
                    (cj.clone() * E::pow(n_sym.clone(), E::int(j as i64))).simplify()
                };
                poly_terms.push(term);
            }
            let p_expr = E::add(poly_terms).simplify();
            total_forcing =
                (total_forcing + p_expr * E::pow(E::Rational(q), n_sym.clone())).simplify();
        }
        return total_forcing;
    }

    // Solve for total particular solution using superposition
    let mut total_particular = E::int(0);
    let n_sym = E::Symbol("n".into());

    for (p, q) in terms {
        // multiplicity s when q is a root of characteristic polynomial
        let pchar = characteristic_polynomial(&coeffs);
        let roots = pchar.find_roots_symbolic();
        let qe = E::Rational(q.clone());
        let mut s_mult = 0usize;
        for z in roots {
            if z.im.to_string() == "0" && z.re == qe {
                s_mult += 1;
            }
        }

        let deg = if p.is_empty() { 0 } else { p.len() - 1 };
        let ans_deg = deg + s_mult;
        let qn = E::pow(qe.clone(), n_sym.clone());
        let mut pbasis: Vec<E> = Vec::with_capacity(ans_deg + 1);
        for j in 0..=ans_deg {
            let poly = if j == 0 {
                E::int(1)
            } else {
                E::pow(n_sym.clone(), E::int(j as i64))
            };
            pbasis.push((poly * qn.clone()).simplify());
        }

        let mut a_mtx: Vec<Vec<E>> = vec![vec![E::int(0); ans_deg + 1]; ans_deg + 1];
        for i in 0..=ans_deg {
            for j in 0..=ans_deg {
                let mut acc = subst_n(&pbasis[j], i as i64);
                for (t, c) in coeffs.iter().enumerate() {
                    let val = subst_n(&pbasis[j], i as i64 - (t as i64 + 1));
                    acc = (acc + (r_to_e(c) * val).simplify()).simplify();
                }
                a_mtx[i][j] = acc;
            }
        }

        let mut poly_terms = Vec::new();
        for (j, cj) in p.iter().enumerate() {
            let term = if j == 0 {
                cj.clone()
            } else {
                (cj.clone() * E::pow(n_sym.clone(), E::int(j as i64))).simplify()
            };
            poly_terms.push(term);
        }
        let p_expr = E::add(poly_terms).simplify();
        let f_i = |i: i64| -> E { (subst_n(&p_expr, i) * subst_n(&qn, i)).simplify() };
        let y_vec: Vec<E> = (0..=ans_deg).map(|i| f_i(i as i64)).collect();
        let c_vec = gauss_solve(a_mtx, y_vec).unwrap_or_else(|| vec![E::int(0); ans_deg + 1]);
        let particular = E::add(
            (0..=ans_deg)
                .map(|j| (c_vec[j].clone() * pbasis[j].clone()).simplify())
                .collect(),
        )
        .simplify();
        total_particular = (total_particular + particular).simplify();
    }

    // shift initials: b_i = a_i - total_particular(i)
    let mut shifted: Vec<E> = Vec::with_capacity(k);
    for i in 0..k {
        let ai = initials.get(i).cloned().unwrap_or(E::int(0));
        shifted.push((ai - subst_n(&total_particular, i as i64)).simplify());
    }
    let hom = solve_homogeneous(coeffs, shifted);
    (hom + total_particular).simplify()
}

fn characteristic_polynomial(coeffs: &[R]) -> Polynomial<R> {
    // P(x) = x^k + c1 x^{k-1} + ... + ck
    let k = coeffs.len();
    let mut v: Vec<R> = Vec::with_capacity(k + 1);
    // low→high: degree 0..k
    for j in 0..k {
        v.push(coeffs[k - 1 - j].clone());
    }
    v.push(R::from_int(1));
    Polynomial::new(v)
}

fn solve_order_k_distinct_real(coeffs: &[R], initials: &Vec<E>) -> E {
    let k = coeffs.len();
    if k == 0 {
        return E::int(0);
    }
    let p = characteristic_polynomial(coeffs);
    let roots = p.find_roots_symbolic();
    if roots.len() != k {
        return E::Symbol("/* TODO: root count mismatch */".into());
    }
    // group real roots by value to multiplicities
    let mut groups: Vec<(E, usize)> = Vec::new();
    'outer: for z in roots {
        if z.im.to_string() != "0" {
            return E::Symbol("/* TODO: complex roots */".into());
        }
        let re = z.re;
        for (rr, m) in groups.iter_mut() {
            if *rr == re {
                *m += 1;
                continue 'outer;
            }
        }
        groups.push((re, 1));
    }
    // build basis functions b_t(n): for each group (r, mult), terms n^m r^n (m=0..mult-1)
    let mut basis: Vec<E> = Vec::with_capacity(k);
    for (r, mult) in &groups {
        for m in 0..*mult {
            let n_sym = E::Symbol("n".into());
            let poly_n = if m == 0 {
                E::int(1)
            } else {
                E::pow(n_sym.clone(), E::int(m as i64))
            };
            basis.push((poly_n * E::pow(r.clone(), n_sym.clone())).simplify());
        }
    }
    // Build linear system M * A = y from first k initial values: y_i = a_i
    let mut mtx: Vec<Vec<E>> = vec![vec![E::int(0); k]; k];
    for i in 0..k {
        for j in 0..k {
            mtx[i][j] = subst_n(&basis[j], i as i64);
        }
    }
    let rhs: Vec<E> = (0..k)
        .map(|i| initials.get(i).cloned().unwrap_or(E::int(0)))
        .collect();
    let coeffs = gauss_solve(mtx, rhs).unwrap_or_else(|| vec![E::Symbol("C?".into()); k]);
    // construct closed form sum_j C_j * basis_j(n)
    let terms: Vec<E> = basis
        .into_iter()
        .enumerate()
        .map(|(j, b)| (coeffs[j].clone() * b).simplify())
        .collect();
    E::add(terms).simplify()
}

fn gauss_solve(mut a: Vec<Vec<E>>, mut b: Vec<E>) -> Option<Vec<E>> {
    let n = a.len();
    for col in 0..n {
        // find pivot row
        let mut pivot = col;
        while pivot < n && a[pivot][col].is_zero() {
            pivot += 1;
        }
        if pivot == n {
            return None;
        }
        if pivot != col {
            a.swap(pivot, col);
            b.swap(pivot, col);
        }
        // normalize row
        let piv = a[col][col].clone();
        for j in col..n {
            a[col][j] = (a[col][j].clone() / piv.clone()).simplify();
        }
        b[col] = (b[col].clone() / piv).simplify();
        // eliminate
        for row in 0..n {
            if row == col {
                continue;
            }
            if a[row][col].is_zero() {
                continue;
            }
            let factor = a[row][col].clone();
            for j in col..n {
                a[row][j] = (a[row][j].clone() - (factor.clone() * a[col][j].clone()).simplify())
                    .simplify();
            }
            b[row] = (b[row].clone() - (factor * b[col].clone()).simplify()).simplify();
        }
    }
    Some(b)
}

// Substitute n -> value in a SymbolicExpr and simplify
pub fn subst_n(e: &E, n: i64) -> E {
    match e {
        E::Rational(_) => e.clone(),
        E::Symbol(s) => {
            if s == "n" {
                E::int(n)
            } else {
                e.clone()
            }
        }
        E::Add(v) => E::add(v.iter().map(|x| subst_n(x, n)).collect()).simplify(),
        E::Mul(v) => E::mul(v.iter().map(|x| subst_n(x, n)).collect()).simplify(),
        E::Pow(b, ex) => E::pow(subst_n(b, n), subst_n(ex, n)).simplify(),
    }
}

// ---- New: RF + PFE（単純極）で閉形式に変換 ----
// 生成関数 G(x) = P(x)/Q(x) を構成し、Q の全根が実数かつ単純であれば、
// 残差 A_k = P(p_k) / Q'(p_k) から a_n = Σ (-A_k/p_k) * (1/p_k)^n を構成する。
// 初期値は有理数（E::Rational）のみサポート。複素極・重極・根が求まらない場合は None。
fn solve_homogeneous_via_rf_pfe(coeffs: &Vec<R>, initials: &Vec<E>) -> Option<E> {
    let k = coeffs.len();
    if k == 0 {
        return Some(E::int(0));
    }
    // 初期値を有理数に限定
    let mut a0: Vec<R> = Vec::with_capacity(k);
    for i in 0..k {
        a0.push(e_to_r(initials.get(i)?)?);
    }
    // 分母 Q(x) = 1 + c1 x + c2 x^2 + ... + ck x^k  （a_n + c1 a_{n-1} + ... + ck a_{n-k} = 0）
    let mut d: Vec<R> = Vec::with_capacity(k + 1);
    d.push(R::from_int(1));
    for i in 0..k {
        d.push(coeffs[i].clone());
    }
    let den = Polynomial::new(d);
    // 分子 P(x)：numeric 実装と同等。p[0]=a0, p[j] = a_j - Σ_{i=1..j} c_i a_{j-i}
    let mut p: Vec<R> = vec![R::from_int(0); k];
    if k >= 1 {
        p[0] = a0[0].clone();
        for j in 1..k {
            let mut v = a0[j].clone();
            for i in 1..=j {
                v = (v + (coeffs[i - 1].clone() * a0[j - i].clone())).simplified();
            }
            p[j] = v;
        }
    }
    let num = Polynomial::new(p);
    // Q の根（複素・象徴）を取得
    let roots = den.find_roots_symbolic();
    if roots.len() != k {
        return None;
    }
    // 単純根チェック: Q'(p) != 0
    let dprime = differentiate_poly_r(&den);
    // E 構築開始
    let n_sym = E::Symbol("n".into());
    let mut terms: Vec<E> = Vec::new();
    for r in roots.iter() {
        // 実根のみ（im=0）対応
        if !r.im.clone().simplify().is_zero() {
            return None;
        }
        // 残差 A = P(r) / Q'(r)
        let pr = eval_poly_at_complex(&num, r);
        let dpr = eval_poly_at_complex(&dprime, r);
        if dpr.re.clone().simplify().is_zero() && dpr.im.clone().simplify().is_zero() {
            return None;
        }
        let a_res = pr / dpr; // Complex
                              // C = -A / p, base = 1/p
        let p_e = r.re.clone().simplify();
        if p_e.clone().is_zero() {
            return None;
        }
        // a_res は実になるはず（実係数、多項式、実根）
        let c_coeff =
            (E::mul(vec![E::int(-1), a_res.re.clone().simplify()]) / p_e.clone()).simplify();
        let base = (E::int(1) / p_e).simplify();
        let term = (c_coeff * E::pow(base, n_sym.clone())).simplify();
        terms.push(term);
    }
    if terms.is_empty() {
        return None;
    }
    Some(E::add(terms).simplify())
}

fn e_to_r(e: &E) -> Option<R> {
    if let E::Rational(r) = e {
        Some(r.clone())
    } else {
        None
    }
}

// 多項式を象徴複素数点で評価
fn eval_poly_at_complex(p: &Polynomial<R>, z: &C) -> C {
    let mut acc = C::zero();
    for coeff in p.coeffs.iter().rev() {
        acc = acc.mul(z);
        let c = E::rational(coeff.numer(), coeff.denom() as i64);
        acc = acc.add(&C::from_real(c));
    }
    acc
}

fn differentiate_poly_r(p: &Polynomial<R>) -> Polynomial<R> {
    let deg = p.deg();
    if deg <= 0 {
        return Polynomial::zero();
    }
    let mut new_coeffs: Vec<R> = Vec::with_capacity(deg as usize);
    for (i, coeff) in p.coeffs.iter().enumerate().skip(1) {
        let k = R::from_int(i as i64);
        new_coeffs.push((coeff.clone() * k).simplified());
    }
    Polynomial::new(new_coeffs)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_solve_homogeneous_simple() {
        // a_n = 3 a_{n-1} - 2 a_{n-2} => a_n - 3a_{n-1} + 2a_{n-2} = 0
        // coeffs = [-3, 2]
        // initials = [1, 3]  => a_0=1, a_1=3
        // sol: a_n = 2^{n+1} - 1
        let coeffs = vec![R::from_int(-3), R::from_int(2)];
        let initials = vec![E::int(1), E::int(3)];
        let sol = solve_homogeneous(coeffs, initials);
        println!("Simple homogeneous sol: {}", sol);
        // a_2 = 2*3 - 1 = 7
        assert_eq!(
            sol.clone()
                .substitute("n", &E::int(2))
                .simplify()
                .to_string(),
            "7"
        );
        assert_eq!(sol.substitute("n", &E::int(3)).simplify().to_string(), "15");
    }

    #[test]
    fn test_solve_non_homogeneous() {
        // a_n = 2 a_{n-1} + n
        // a_n - 2 a_{n-1} = n
        // coeffs = [-2]
        // initials = [0] => a_0 = 0
        // a_1 = 2*0 + 1 = 1
        // a_2 = 2*1 + 2 = 4
        // p = [0, 1] (P(n) = n), q = 1
        let coeffs = vec![R::from_int(-2)];
        let initials = vec![E::int(0)];
        let p = vec![E::int(0), E::int(1)];
        let q = R::from_int(1);
        let sol = solve_inhomogeneous_arith_geom(coeffs, initials, p, q);
        println!("Non-homogeneous sol: {}", sol);
        assert_eq!(
            sol.clone()
                .substitute("n", &E::int(1))
                .simplify()
                .to_string(),
            "1"
        );
        assert_eq!(sol.substitute("n", &E::int(2)).simplify().to_string(), "4");
    }
}
