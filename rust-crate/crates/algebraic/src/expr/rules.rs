use super::Rational;
use std::collections::HashMap;

use super::SymbolicExpr;

// --- Helper: merge Pow terms with identical rational exponents ---
pub fn merge_same_exponent_pows(factors: Vec<SymbolicExpr>) -> Vec<SymbolicExpr> {
    // Collect groups: exponent (Rational) -> Vec<base>
    let mut groups: HashMap<(i64, u64), Vec<SymbolicExpr>> = HashMap::new();
    let mut others: Vec<SymbolicExpr> = Vec::new();
    for f in factors.into_iter() {
        if let SymbolicExpr::Pow(b, e) = f {
            if let SymbolicExpr::Rational(r) = *e.clone() {
                groups
                    .entry((r.numer(), r.denom()))
                    .or_default()
                    .push((*b).clone());
                continue;
            }
            others.push(SymbolicExpr::Pow(b, e));
        } else {
            others.push(f);
        }
    }
    for ((num, den), bases) in groups.into_iter() {
        if bases.len() == 1 {
            // put back as was
            others.push(SymbolicExpr::Pow(
                Box::new(bases[0].clone()),
                Box::new(SymbolicExpr::rational(num, den as i64)),
            ));
        } else {
            // combine bases by multiplication then pow once
            let combined = SymbolicExpr::mul(bases);
            others.push(SymbolicExpr::pow(
                combined,
                SymbolicExpr::rational(num, den as i64),
            ));
        }
    }
    others
}

// Group identical factors and convert repeats to integer powers: x*x -> x^2
pub fn combine_identical_factors_to_pow(factors: Vec<SymbolicExpr>) -> Vec<SymbolicExpr> {
    use std::collections::BTreeMap;
    let mut map: BTreeMap<String, (SymbolicExpr, i64)> = BTreeMap::new();
    let mut others: Vec<SymbolicExpr> = Vec::new();
    for f in factors.into_iter() {
        // Do not combine rational scalars here; they are already merged in mul()
        match &f {
            SymbolicExpr::Rational(_) => {
                others.push(f);
            }
            _ => {
                let k = key_string(&f);
                map.entry(k)
                    .and_modify(|e| e.1 += 1)
                    .or_insert((f.clone(), 1));
            }
        }
    }
    let mut out: Vec<SymbolicExpr> = Vec::new();
    // push combined
    for (_, (base, count)) in map.into_iter() {
        if count <= 1 {
            out.push(base);
        } else {
            out.push(SymbolicExpr::pow(base, SymbolicExpr::int(count)));
        }
    }
    // append others (rationals)
    out.extend(others);
    out
}

// --- Helper: positive rational k-th root factor extraction (k=2,3,4) ---
pub fn simplify_positive_rational_kth_root(r: Rational, k: u64) -> SymbolicExpr {
    debug_assert!(r.numer() > 0);
    let numer = r.numer() as u64;
    let denom = r.denom();
    let (out_num, in_num) = extract_kth_power_parts(numer, k);
    let (out_den, in_den) = extract_kth_power_parts(denom, k);
    let mut outside = Rational::new(out_num as i64, out_den as i64);
    outside.normalize();
    if in_num == 1 && in_den == 1 {
        return SymbolicExpr::Rational(outside.simplified());
    }
    let inside_rat = Rational::new(in_num as i64, in_den as i64);
    let inside_expr = SymbolicExpr::Rational(inside_rat);
    let exp = SymbolicExpr::rational(1, k as i64);
    let root_inside = SymbolicExpr::Pow(Box::new(inside_expr), Box::new(exp));
    if outside.is_one() {
        root_inside
    } else {
        SymbolicExpr::mul(vec![
            SymbolicExpr::Rational(outside.simplified()),
            root_inside,
        ])
    }
}

pub fn extract_kth_power_parts(mut n: u64, k: u64) -> (u64, u64) {
    if n <= 1 {
        return (1, n);
    }
    let mut outside = 1u64;
    let mut inside = 1u64;
    let mut p = 2u64;
    while p * p <= n {
        if n.is_multiple_of(p) {
            let mut cnt = 0;
            while n.is_multiple_of(p) {
                n /= p;
                cnt += 1;
            }
            outside *= p.pow((cnt / k) as u32);
            let rem = cnt % k;
            if rem > 0 {
                inside *= p.pow(rem as u32);
            }
        };
        p += if p == 2 { 1 } else { 2 };
    }
    if n > 1 {
        inside *= n;
    }
    (outside, inside)
}

// --- Helper: combine like terms in a sum: a*x + b*x -> (a+b)*x ---
pub fn combine_like_terms(terms: Vec<SymbolicExpr>) -> Vec<SymbolicExpr> {
    let mut map: HashMap<String, (SymbolicExpr, Rational)> = HashMap::new();
    let mut constants = Rational::from_int(0);

    for t in terms {
        match t {
            SymbolicExpr::Rational(r) => {
                constants = constants + r;
            }
            SymbolicExpr::Mul(mut facs) => {
                // Check if one factor is rational (coefficient)
                let mut coeff = Rational::from_int(1);
                let mut base_facs = Vec::new();
                for f in facs.drain(..) {
                    if let SymbolicExpr::Rational(r) = f {
                        coeff = coeff * r;
                    } else {
                        base_facs.push(f);
                    }
                }
                let base = if base_facs.is_empty() {
                    SymbolicExpr::int(1)
                } else if base_facs.len() == 1 {
                    base_facs.pop().unwrap()
                } else {
                    SymbolicExpr::mul(base_facs)
                };

                if let SymbolicExpr::Rational(r) = base {
                    constants = constants + (coeff * r);
                } else {
                    let key = key_string(&base);
                    map.entry(key)
                        .and_modify(|(_, c)| *c = *c + coeff)
                        .or_insert((base, coeff));
                }
            }
            other => {
                let key = key_string(&other);
                map.entry(key)
                    .and_modify(|(_, c)| *c = *c + Rational::from_int(1))
                    .or_insert((other, Rational::from_int(1)));
            }
        }
    }

    let mut out = Vec::new();
    if !constants.is_zero() {
        out.push(SymbolicExpr::Rational(constants.simplified()));
    }

    for (_, (base, coeff)) in map {
        if coeff.is_zero() {
            continue;
        }
        if coeff.is_one() {
            out.push(base);
        } else {
            out.push(SymbolicExpr::mul(vec![
                SymbolicExpr::Rational(coeff.simplified()),
                base,
            ]));
        }
    }

    out
}

// --- Helper: merge factors with same base: x^a * x^b -> x^(a+b) ---
pub fn merge_same_base_pows(factors: Vec<SymbolicExpr>) -> Vec<SymbolicExpr> {
    let mut map: HashMap<String, (SymbolicExpr, SymbolicExpr)> = HashMap::new();
    let mut others = Vec::new();

    for f in factors {
        match f {
            SymbolicExpr::Pow(b, e) => {
                let key = key_string(&b);
                map.entry(key)
                    .and_modify(|(_, acc_e)| {
                        *acc_e = SymbolicExpr::add(vec![acc_e.clone(), *e.clone()]);
                    })
                    .or_insert((*b, *e));
            }
            SymbolicExpr::Rational(_) => others.push(f),
            other => {
                let key = key_string(&other);
                map.entry(key)
                    .and_modify(|(_, acc_e)| {
                        *acc_e = SymbolicExpr::add(vec![acc_e.clone(), SymbolicExpr::int(1)]);
                    })
                    .or_insert((other, SymbolicExpr::int(1)));
            }
        }
    }

    for (_, (base, exp)) in map {
        let simplified_exp = exp.simplify();
        if let SymbolicExpr::Rational(r) = &simplified_exp {
            if r.is_one() {
                others.push(base);
                continue;
            }
            if r.is_zero() {
                // base^0 = 1, will be cleaned up in mul()
                others.push(SymbolicExpr::int(1));
                continue;
            }
        }
        others.push(SymbolicExpr::pow(base, simplified_exp));
    }

    others
}

// Canonical ordering of terms/factors for stable output
pub fn sort_canonical(v: &mut [SymbolicExpr]) {
    v.sort_by_cached_key(key_of);
}

pub fn key_of(e: &SymbolicExpr) -> (u8, String) {
    let rank = match e {
        SymbolicExpr::Rational(_) => 0u8,
        SymbolicExpr::Symbol(_) => 1u8,
        SymbolicExpr::Pow(_, _) => 2u8,
        SymbolicExpr::Mul(_) => 3u8,
        SymbolicExpr::Add(_) => 4u8,
    };
    let s = key_string(e);
    (rank, s)
}

// --- Helper: distribute rational constants into Add terms: k * (a + b) -> k*a + k*b ---
pub fn distribute_constant_into_add(factors: Vec<SymbolicExpr>) -> Vec<SymbolicExpr> {
    let mut rational_coeff = Rational::from_int(1);
    let mut add_node = None;
    let mut other_factors = Vec::new();

    for f in factors {
        match f {
            SymbolicExpr::Rational(r) => {
                rational_coeff = rational_coeff * r;
            }
            SymbolicExpr::Add(v) if add_node.is_none() => {
                add_node = Some(v);
            }
            _ => other_factors.push(f),
        }
    }

    if let Some(terms) = add_node {
        if !rational_coeff.is_one() {
            // Distribute
            let distributed_terms = terms
                .into_iter()
                .map(|t| {
                    SymbolicExpr::mul(vec![SymbolicExpr::Rational(rational_coeff), t]).simplify()
                })
                .collect();
            let mut result = Vec::new();
            result.push(SymbolicExpr::Add(distributed_terms));
            result.extend(other_factors);
            result
        } else {
            // No distribution needed but need to put Add back
            let mut result = Vec::new();
            result.push(SymbolicExpr::Add(terms));
            result.extend(other_factors);
            result
        }
    } else {
        // Put back rational if it's not 1
        let mut result = other_factors;
        if !rational_coeff.is_one() {
            result.push(SymbolicExpr::Rational(rational_coeff));
        }
        result
    }
}

// --- Helper: absorb coefficients into powers: -1 * (-a)^-1 -> a^-1 ---
pub fn absorb_coefficients_into_powers(factors: Vec<SymbolicExpr>) -> Vec<SymbolicExpr> {
    let mut rational_coeff = Rational::from_int(1);
    let mut others = Vec::new();

    for f in factors {
        match f {
            SymbolicExpr::Rational(r) => {
                rational_coeff = rational_coeff * r;
            }
            _ => others.push(f),
        }
    }

    if rational_coeff.is_minus_one() {
        // Try to find a Pow(Mul([-1, x]), -1) to absorb into
        for i in 0..others.len() {
            if let SymbolicExpr::Pow(base, exp) = &others[i] {
                if let SymbolicExpr::Rational(e) = &**exp {
                    if e.is_minus_one() {
                        if let SymbolicExpr::Mul(base_factors) = &**base {
                            let mut has_minus_one = false;
                            let mut inner_others = Vec::new();
                            for bf in base_factors {
                                if let SymbolicExpr::Rational(r) = bf {
                                    if r.is_minus_one() {
                                        has_minus_one = true;
                                        continue;
                                    }
                                }
                                inner_others.push(bf.clone());
                            }

                            if has_minus_one {
                                // -1 * (-a)^-1 = a^-1
                                let new_base = if inner_others.len() == 1 {
                                    inner_others.pop().unwrap()
                                } else {
                                    SymbolicExpr::Mul(inner_others)
                                };
                                others[i] = SymbolicExpr::pow(new_base, (**exp).clone());
                                rational_coeff = Rational::from_int(1); // Absorbed!
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    let mut result = others;
    if !rational_coeff.is_one() {
        result.push(SymbolicExpr::Rational(rational_coeff));
    }
    result
}

// --- Helper: distribute power over multiplication: (a*b)^n -> a^n * b^n ---
pub fn distribute_pow_over_mul(factors: Vec<SymbolicExpr>) -> Vec<SymbolicExpr> {
    let mut result = Vec::with_capacity(factors.len());
    for f in factors {
        match f {
            SymbolicExpr::Pow(base, exp) => {
                if let SymbolicExpr::Mul(inner_factors) = *base {
                    for ifactor in inner_factors {
                        result.push(SymbolicExpr::pow(ifactor, (*exp).clone()));
                    }
                } else {
                    result.push(SymbolicExpr::Pow(base, exp));
                }
            }
            other => result.push(other),
        }
    }
    result
}

pub fn key_string(e: &SymbolicExpr) -> String {
    match e {
        SymbolicExpr::Rational(r) => format!("R:{}:{}", r.numer(), r.denom()),
        SymbolicExpr::Symbol(s) => format!("S:{}", s),
        SymbolicExpr::Pow(b, ex) => format!("P({},{})", key_string(b), key_string(ex)),
        SymbolicExpr::Mul(v) => {
            let mut ks: Vec<String> = v.iter().map(key_string).collect();
            ks.sort();
            format!("M[{}]", ks.join(","))
        }
        SymbolicExpr::Add(v) => {
            let mut ks: Vec<String> = v.iter().map(key_string).collect();
            ks.sort();
            format!("A[{}]", ks.join(","))
        }
    }
}
