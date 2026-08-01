use super::rational::Rational;
#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};
use std::str::FromStr;

use crate::error::Result;

pub mod fmt;
pub mod ops;
pub(crate) mod parser;
mod rules;
mod tests;

use parser::Parser;

#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SymbolicExpr {
    Rational(Rational),

    // π や e のようなシンボル (今回は不要かもしれませんが、拡張性のため)
    Symbol(String),

    // 和: a + b + c ...
    // Add(vec![expr1, expr2]) のように複数の項をVecで持つと、
    // a + b と b + a の区別をなくせるなど、正規化しやすくなります。
    Add(Vec<SymbolicExpr>),

    // 積: a * b * c ...
    // こちらもVecで持ちます。
    Mul(Vec<SymbolicExpr>),

    // べき乗: base^exponent
    // これで平方根 (x^(1/2)) や逆数 (x^(-1)) も統一的に表現できます。
    Pow(Box<SymbolicExpr>, Box<SymbolicExpr>),
}

impl Default for SymbolicExpr {
    fn default() -> Self {
        SymbolicExpr::Rational(Rational::default())
    }
}

impl FromStr for SymbolicExpr {
    type Err = crate::error::AlgebraicError;
    fn from_str(s: &str) -> std::result::Result<Self, Self::Err> {
        Parser::new(s)?.parse()
    }
}

impl SymbolicExpr {
    pub fn from_latex(latex: &str) -> Result<Self> {
        let text = crate::latex::latex_to_infix(latex);
        text.parse::<SymbolicExpr>()
    }

    pub fn rational(n: i64, d: i64) -> Self {
        SymbolicExpr::Rational(Rational::new(n, d))
    }
    pub fn int(n: i64) -> Self {
        SymbolicExpr::Rational(Rational::from(n))
    }

    pub fn add(terms: Vec<SymbolicExpr>) -> SymbolicExpr {
        // flatten & collect rationals
        let mut flat: Vec<SymbolicExpr> = Vec::with_capacity(terms.len());
        let mut acc_r: Option<Rational> = None;
        for t in terms.into_iter() {
            match t {
                SymbolicExpr::Add(inner) => {
                    for x in inner {
                        match x {
                            SymbolicExpr::Rational(r) => {
                                acc_r = Some(match acc_r {
                                    Some(a) => a + r,
                                    None => r,
                                });
                            }
                            other => flat.push(other),
                        }
                    }
                }
                SymbolicExpr::Rational(r) => {
                    acc_r = Some(match acc_r {
                        Some(a) => a + r,
                        None => r,
                    });
                }
                other => flat.push(other),
            }
        }
        if let Some(r) = acc_r {
            if !r.is_zero() {
                flat.push(SymbolicExpr::Rational(r.simplified()));
            }
        }
        // remove zeros
        flat.retain(|e| !matches!(e, SymbolicExpr::Rational(r) if r.is_zero()));

        // combine like terms: a*x + b*x => (a+b)*x
        flat = rules::combine_like_terms(flat);

        // canonical order for deterministic formatting
        rules::sort_canonical(&mut flat);
        match flat.len() {
            0 => SymbolicExpr::int(0),
            1 => flat.into_iter().next().unwrap(),
            _ => SymbolicExpr::Add(flat),
        }
    }

    pub fn mul(factors: Vec<SymbolicExpr>) -> SymbolicExpr {
        let mut flat: Vec<SymbolicExpr> = Vec::with_capacity(factors.len());
        let mut acc_r: Option<Rational> = None;
        for f in factors.into_iter() {
            match f {
                SymbolicExpr::Mul(inner) => {
                    for x in inner {
                        match x {
                            SymbolicExpr::Rational(r) => {
                                acc_r = Some(match acc_r {
                                    Some(a) => a * r,
                                    None => r,
                                });
                            }
                            other => flat.push(other),
                        }
                    }
                }
                SymbolicExpr::Rational(r) => {
                    if r.is_zero() {
                        return SymbolicExpr::int(0);
                    }
                    acc_r = Some(match acc_r {
                        Some(a) => a * r,
                        None => r,
                    });
                }
                other => flat.push(other),
            }
        }
        if let Some(r) = acc_r {
            if r.is_zero() {
                return SymbolicExpr::int(0);
            }
            if !r.is_one() {
                flat.push(SymbolicExpr::Rational(r.simplified()));
            }
        }
        flat.retain(|e| !matches!(e, SymbolicExpr::Rational(r) if r.is_one()));
        // canonical order
        rules::sort_canonical(&mut flat);
        match flat.len() {
            0 => SymbolicExpr::int(1),
            1 => flat.into_iter().next().unwrap(),
            _ => SymbolicExpr::Mul(flat),
        }
    }

    pub fn pow(base: SymbolicExpr, exp: SymbolicExpr) -> SymbolicExpr {
        // simplifications: x^1 = x, x^0 = 1, 0^n=0 (n>0), 1^n=1
        if let SymbolicExpr::Rational(r) = &exp {
            if r.is_one() {
                return base;
            }
            if r.is_zero() {
                return SymbolicExpr::int(1);
            }
        }
        if let SymbolicExpr::Rational(r) = &base {
            if r.is_zero() {
                return SymbolicExpr::int(0);
            }
            if r.is_one() {
                return SymbolicExpr::int(1);
            }
        }
        match (&base, &exp) {
            // Evaluate rational^integer exactly (including negative exponents)
            (SymbolicExpr::Rational(b), SymbolicExpr::Rational(e)) if e.denom() == 1 => {
                let k = e.numer();
                // fast paths
                if k == 1 {
                    return SymbolicExpr::Rational(*b);
                }
                if k == 0 {
                    return SymbolicExpr::int(1);
                }
                // exponentiation by squaring
                fn rat_pow(
                    base: crate::rational::Rational,
                    mut exp: i64,
                ) -> crate::rational::Rational {
                    let mut result = crate::rational::Rational::from_int(1);
                    let mut b = base;
                    while exp > 0 {
                        if (exp & 1) == 1 {
                            result = result * b;
                        }
                        exp >>= 1;
                        if exp > 0 {
                            b = b * b;
                        }
                    }
                    result
                }
                if k > 0 {
                    let rp = rat_pow(*b, k);
                    SymbolicExpr::Rational(rp.simplified())
                } else {
                    let rp = rat_pow(*b, -k);
                    SymbolicExpr::Rational(
                        (crate::rational::Rational::from_int(1) / rp).simplified(),
                    )
                }
            }
            (SymbolicExpr::Pow(inner_b, inner_e), SymbolicExpr::Rational(er))
                if matches!(**inner_e, SymbolicExpr::Rational(_)) =>
            {
                // (b^a)^c => b^(a*c)
                if let SymbolicExpr::Rational(a_r) = &**inner_e {
                    let mut prod = *a_r * *er;
                    prod.normalize();
                    return SymbolicExpr::pow((**inner_b).clone(), SymbolicExpr::Rational(prod));
                }
                SymbolicExpr::Pow(Box::new(base), Box::new(exp))
            }
            (SymbolicExpr::Rational(r), SymbolicExpr::Rational(e)) => {
                // k-th root simplification for positive rational base r^ (1/k), k in {2,3,4}
                if e.numer() == 1 && r.numer() > 0 {
                    let k = e.denom();
                    if k == 2 || k == 3 || k == 4 {
                        // supported
                        return rules::simplify_positive_rational_kth_root(*r, k);
                    }
                }
                SymbolicExpr::Pow(Box::new(base), Box::new(exp))
            }
            _ => SymbolicExpr::Pow(Box::new(base), Box::new(exp)),
        }
    }

    pub fn sqrt(self) -> SymbolicExpr {
        SymbolicExpr::pow(self, SymbolicExpr::rational(1, 2))
    }

    pub fn sqrt2() -> SymbolicExpr {
        // example helper
        SymbolicExpr::pow(SymbolicExpr::int(2), SymbolicExpr::rational(1, 2))
    }

    pub fn expand(self) -> SymbolicExpr {
        match self {
            SymbolicExpr::Add(v) => {
                let inner: Vec<_> = v.into_iter().map(|e| e.expand()).collect();
                SymbolicExpr::add(inner)
            }
            SymbolicExpr::Mul(factors) => {
                let current_factors = factors.into_iter().map(|f| f.expand()).collect::<Vec<_>>();

                // Distribute: (a+b)*(c+d) -> ac+ad+bc+bd
                // We do it pairwise
                let mut result = SymbolicExpr::int(1);
                for f in current_factors {
                    result = match (result, f) {
                        (SymbolicExpr::Add(terms_a), SymbolicExpr::Add(terms_b)) => {
                            let mut new_terms = Vec::new();
                            for ta in terms_a {
                                for tb in &terms_b {
                                    new_terms.push(SymbolicExpr::mul(vec![ta.clone(), tb.clone()]));
                                }
                            }
                            SymbolicExpr::add(new_terms)
                        }
                        (SymbolicExpr::Add(terms), other) | (other, SymbolicExpr::Add(terms)) => {
                            let mut new_terms = Vec::new();
                            for t in terms {
                                new_terms.push(SymbolicExpr::mul(vec![t, other.clone()]));
                            }
                            SymbolicExpr::add(new_terms)
                        }
                        (a, b) => SymbolicExpr::mul(vec![a, b]),
                    };
                }
                result
            }
            SymbolicExpr::Pow(b, e) => {
                let bb = b.expand();
                let ee = e.expand();
                // We only expand small integer powers for now to avoid explosion
                if let SymbolicExpr::Rational(r) = &ee {
                    if r.denom() == 1 && r.numer() >= 2 && r.numer() <= 4 {
                        let mut res = bb.clone();
                        for _ in 1..r.numer() {
                            res = SymbolicExpr::mul(vec![res, bb.clone()]).expand();
                        }
                        return res;
                    }
                }
                SymbolicExpr::pow(bb, ee)
            }
            leaf => leaf,
        }
    }

    pub fn simplify(self) -> SymbolicExpr {
        match self {
            SymbolicExpr::Add(v) => {
                let inner: Vec<_> = v.into_iter().map(|e| e.simplify()).collect();
                SymbolicExpr::add(inner)
            }
            SymbolicExpr::Mul(v) => {
                let inner: Vec<_> = v.into_iter().map(|e| e.simplify()).collect();
                let flattened_pows = rules::distribute_pow_over_mul(inner);
                let merged_pows = rules::merge_same_exponent_pows(flattened_pows);
                let merged_bases = rules::merge_same_base_pows(merged_pows);
                let distributed = rules::distribute_constant_into_add(merged_bases);
                let simplified_mul = rules::absorb_coefficients_into_powers(distributed);
                let combined = rules::combine_identical_factors_to_pow(simplified_mul);
                SymbolicExpr::mul(combined)
            }
            SymbolicExpr::Pow(b, e) => {
                let bb = b.simplify();
                let ee = e.simplify();
                SymbolicExpr::pow(bb, ee)
            }
            leaf => leaf,
        }
    }

    pub fn substitute(self, sym: &str, val: &SymbolicExpr) -> SymbolicExpr {
        match self {
            SymbolicExpr::Symbol(s) if s == sym => val.clone(),
            SymbolicExpr::Add(terms) => {
                SymbolicExpr::add(terms.into_iter().map(|t| t.substitute(sym, val)).collect())
            }
            SymbolicExpr::Mul(factors) => SymbolicExpr::mul(
                factors
                    .into_iter()
                    .map(|f| f.substitute(sym, val))
                    .collect(),
            ),
            SymbolicExpr::Pow(b, e) => {
                SymbolicExpr::pow(b.substitute(sym, val), e.substitute(sym, val))
            }
            leaf => leaf,
        }
    }
}
