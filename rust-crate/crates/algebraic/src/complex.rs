use crate::error::{AlgebraicError, Result};
use crate::expr::SymbolicExpr;
use core::fmt;
use core::ops::{Add as OpAdd, Div as OpDiv, Mul as OpMul, Neg as OpNeg, Sub as OpSub};
use num_traits::{One, Zero};
#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};
use std::iter::Sum;
use std::str::FromStr;

#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SymbolicComplex {
    pub re: SymbolicExpr, // 実部
    pub im: SymbolicExpr, // 虚部
}

impl SymbolicComplex {
    pub fn from_latex(latex: &str) -> Result<Self> {
        let text = crate::latex::latex_to_infix(latex);
        text.parse::<SymbolicComplex>()
    }

    pub fn to_latex(&self) -> String {
        let re = self.re.clone().simplify();
        let im = self.im.clone().simplify();

        let re_is_zero = re.is_zero();
        let im_is_zero = im.is_zero();

        if re_is_zero && im_is_zero {
            return "0".to_string();
        }

        if im_is_zero {
            return re.to_latex();
        }

        if re_is_zero {
            return Self::format_imag_part_latex(&im);
        }

        let re_latex = re.to_latex();
        let im_latex = im.to_latex();

        if let Some(im_abs_latex) = im_latex.strip_prefix('-') {
            // 虚部が負の場合: a - bi
            let op = "-";
            if im.clone().neg() == SymbolicExpr::int(1) {
                // -im == 1, つまり im == -1
                format!("{}{}{}", re_latex, op, "i")
            } else {
                let im_part = match im.neg() {
                    // -im (絶対値)に対して括弧を判断
                    SymbolicExpr::Add(_) => format!("({})", im_abs_latex),
                    _ => im_abs_latex.to_string(),
                };
                format!("{}{}{}i", re_latex, op, im_part)
            }
        } else {
            // 虚部が正の場合: a + bi
            let op = "+";
            if im == SymbolicExpr::int(1) {
                format!("{}{}{}", re_latex, op, "i")
            } else {
                let im_part = match im {
                    SymbolicExpr::Add(_) => format!("({})", im_latex),
                    _ => im_latex,
                };
                format!("{}{}{}i", re_latex, op, im_part)
            }
        }
    }

    fn format_imag_part_latex(im: &SymbolicExpr) -> String {
        if *im == SymbolicExpr::int(1) {
            return "i".to_string();
        }
        if *im == SymbolicExpr::int(-1) {
            return "-i".to_string();
        }

        match im {
            SymbolicExpr::Add(_) => format!("({})i", im.to_latex()),
            _ => format!("{}i", im.to_latex()),
        }
    }
}

impl FromStr for SymbolicComplex {
    type Err = AlgebraicError;

    fn from_str(s: &str) -> std::result::Result<Self, Self::Err> {
        // ステップ1で改造したパーサーを使って、まず SymbolicExpr に変換する
        let expr = s.parse::<SymbolicExpr>()?;

        // パース結果の式を解析して、実部と虚部に分離する
        let (re, im) = separate_real_imag(expr);

        // 分離した結果を元に SymbolicComplex を組み立てる
        Ok(SymbolicComplex::new(re, im))
    }
}

/// SymbolicExpr を実部と虚部に分離するヘルパー関数 (ここが"大工さん"の頭脳！)
fn separate_real_imag(expr: SymbolicExpr) -> (SymbolicExpr, SymbolicExpr) {
    let i = SymbolicExpr::Symbol("i".to_string());

    match expr {
        // 足し算の場合: 各項を再帰的に分離し、結果を合算する
        SymbolicExpr::Add(terms) => {
            let mut re_terms = vec![];
            let mut im_terms = vec![];
            for term in terms {
                let (re_part, im_part) = separate_real_imag(term);
                if !re_part.is_zero() {
                    re_terms.push(re_part);
                }
                if !im_part.is_zero() {
                    im_terms.push(im_part);
                }
            }
            (SymbolicExpr::add(re_terms), SymbolicExpr::add(im_terms))
        }
        // 掛け算の場合: 'i' が含まれているかチェック
        SymbolicExpr::Mul(mut factors) => {
            if let Some(pos) = factors.iter().position(|f| *f == i) {
                // 'i' が見つかったら、それを取り除く
                factors.remove(pos);
                // 残りの積が虚部の係数になる (実部はこの項からは生まれない)
                let im_coeff = SymbolicExpr::mul(factors);
                (SymbolicExpr::int(0), im_coeff)
            } else {
                // 'i' がなければ、この項全体が実部
                (SymbolicExpr::Mul(factors), SymbolicExpr::int(0))
            }
        }
        // 式が 'i' そのものだった場合
        e if e == i => (SymbolicExpr::int(0), SymbolicExpr::int(1)),

        // それ以外の全ての式 (数値、べき乗、'i'以外のシンボルなど) は実部とみなす
        e => (e, SymbolicExpr::int(0)),
    }
}

impl SymbolicComplex {
    pub fn new(re: SymbolicExpr, im: SymbolicExpr) -> Self {
        Self { re, im }
    }
    pub fn from_real(re: SymbolicExpr) -> Self {
        Self {
            re,
            im: SymbolicExpr::int(0),
        }
    }
    pub fn i() -> Self {
        Self {
            re: SymbolicExpr::int(0),
            im: SymbolicExpr::int(1),
        }
    }
    pub fn zero() -> Self {
        Self::from_real(SymbolicExpr::int(0))
    }
    pub fn is_real(&self) -> bool {
        matches!(self.im, SymbolicExpr::Rational(ref r) if r.is_zero())
    }
    pub fn is_imag_pure(&self) -> bool {
        matches!(self.re, SymbolicExpr::Rational(ref r) if r.is_zero())
    }
    pub fn neg(&self) -> Self {
        SymbolicComplex {
            re: SymbolicExpr::mul(vec![SymbolicExpr::int(-1), self.re.clone()]).simplify(),
            im: SymbolicExpr::mul(vec![SymbolicExpr::int(-1), self.im.clone()]).simplify(),
        }
    }
    pub fn add(&self, other: &Self) -> Self {
        SymbolicComplex {
            re: SymbolicExpr::add(vec![self.re.clone(), other.re.clone()]).simplify(),
            im: SymbolicExpr::add(vec![self.im.clone(), other.im.clone()]).simplify(),
        }
    }
    pub fn sub(&self, other: &Self) -> Self {
        self.add(&other.neg())
    }
    pub fn mul(&self, other: &Self) -> Self {
        // (a+bi)(c+di) = (ac - bd) + (ad+bc)i
        let a = self.re.clone();
        let b = self.im.clone();
        let c = other.re.clone();
        let d = other.im.clone();
        let ac = SymbolicExpr::mul(vec![a.clone(), c.clone()]);
        let bd = SymbolicExpr::mul(vec![b.clone(), d.clone()]);
        let ad = SymbolicExpr::mul(vec![a.clone(), d.clone()]);
        let bc = SymbolicExpr::mul(vec![b.clone(), c.clone()]);
        let re = SymbolicExpr::add(vec![ac, SymbolicExpr::mul(vec![SymbolicExpr::int(-1), bd])])
            .simplify();
        let im = SymbolicExpr::add(vec![ad, bc]).simplify();
        SymbolicComplex { re, im }
    }

    pub fn conj(&self) -> Self {
        SymbolicComplex {
            re: self.re.clone(),
            im: self.im.clone().neg().simplify(),
        }
    }

    // sqrt of a rational number (possibly negative) returning complex
    // Uses structure-level extraction already implemented in SymbolicExpr pow logic for positive part.
    pub fn sqrt_rational(n: i64, d: i64) -> Self {
        use SymbolicExpr as E;
        if n == 0 {
            return SymbolicComplex::from_real(E::int(0));
        }
        if n > 0 {
            return SymbolicComplex::from_real(
                E::pow(E::rational(n, d), E::rational(1, 2)).simplify(),
            );
        }
        // negative: sqrt(-n/d) = i * sqrt(n/d)
        let abs_expr = E::pow(E::rational(-n, d), E::rational(1, 2)).simplify();
        // i * abs_expr
        SymbolicComplex {
            re: E::int(0),
            im: abs_expr,
        }
    }

    pub fn simplify(&self) -> Self {
        SymbolicComplex {
            re: self.re.clone().simplify(),
            im: self.im.clone().simplify(),
        }
    }

    pub fn expand(&self) -> Self {
        SymbolicComplex {
            re: self.re.clone().expand(),
            im: self.im.clone().expand(),
        }
    }
}

impl fmt::Display for SymbolicComplex {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // both parts simplified for display
        let re = self.re.clone().simplify();
        let im = self.im.clone().simplify();
        // Cases
        // If imaginary zero -> display real only
        if let SymbolicExpr::Rational(r) = &im {
            if r.is_zero() {
                return write!(f, "{}", re);
            }
        }
        // If real zero -> just imag part
        if let SymbolicExpr::Rational(rre) = &re {
            if rre.is_zero() {
                return write_imag_part(f, &im);
            }
        }
        // General form a ± b i (imag part rational) or a + (expr)i
        write!(f, "{}", re)?;
        match &im {
            SymbolicExpr::Rational(r) => {
                let n = r.numer();
                if n < 0 {
                    let abs = crate::rational::Rational::new(-n, r.denom() as i64);
                    if abs.is_one() {
                        write!(f, " - i")
                    } else {
                        write!(f, " - {}i", abs)
                    }
                } else if r.is_one() {
                    write!(f, " + i")
                } else {
                    write!(f, " + {}i", r)
                }
            }
            other => write!(f, " + ({} )i", other),
        }
    }
}

// Helper to format pure imaginary when real part is zero
fn write_imag_part(f: &mut fmt::Formatter<'_>, im: &SymbolicExpr) -> fmt::Result {
    match im {
        SymbolicExpr::Rational(r) => {
            if r.is_one() {
                write!(f, "i")
            } else if r.is_minus_one() {
                write!(f, "-i")
            } else {
                write!(f, "{}i", r)
            }
        }
        other => write!(f, "({})i", other),
    }
}

// Temporary trait-like helper to extract Rational from SymbolicExpr when known
// (Removed temp AsRationalOpt helper after refactor)

// ---- Algebraic trait impls so SymbolicComplex behaves like a Field ----
impl OpAdd for SymbolicComplex {
    type Output = SymbolicComplex;
    fn add(self, rhs: Self) -> Self::Output {
        SymbolicComplex {
            re: (self.re + rhs.re).simplify(),
            im: (self.im + rhs.im).simplify(),
        }
    }
}
impl OpSub for SymbolicComplex {
    type Output = SymbolicComplex;
    fn sub(self, rhs: Self) -> Self::Output {
        SymbolicComplex {
            re: (self.re - rhs.re).simplify(),
            im: (self.im - rhs.im).simplify(),
        }
    }
}
impl OpMul for SymbolicComplex {
    type Output = SymbolicComplex;
    fn mul(self, rhs: Self) -> Self::Output {
        // (a+bi)(c+di) = (ac - bd) + (ad+bc)i
        let ac = (self.re.clone() * rhs.re.clone()).simplify();
        let bd = (self.im.clone() * rhs.im.clone()).simplify();
        let ad = (self.re.clone() * rhs.im.clone()).simplify();
        let bc = (self.im.clone() * rhs.re.clone()).simplify();
        let re = (ac - bd).simplify();
        let im = (ad + bc).simplify();
        SymbolicComplex { re, im }
    }
}
impl OpDiv for SymbolicComplex {
    type Output = SymbolicComplex;
    fn div(self, rhs: Self) -> Self::Output {
        // ((a+bi)*(c-di)) / (c^2 + d^2)
        let c2 = (rhs.re.clone() * rhs.re.clone()).simplify();
        let d2 = (rhs.im.clone() * rhs.im.clone()).simplify();
        let denom = (c2 + d2).simplify();
        let conj = SymbolicComplex {
            re: rhs.re.clone(),
            im: (-rhs.im).simplify(),
        };
        let num = self * conj;
        SymbolicComplex {
            re: (num.re / denom.clone()).simplify(),
            im: (num.im / denom).simplify(),
        }
    }
}
impl OpNeg for SymbolicComplex {
    type Output = SymbolicComplex;
    fn neg(self) -> Self::Output {
        SymbolicComplex {
            re: (-self.re).simplify(),
            im: (-self.im).simplify(),
        }
    }
}

impl Zero for SymbolicComplex {
    fn zero() -> Self {
        SymbolicComplex::from_real(SymbolicExpr::int(0))
    }
    fn is_zero(&self) -> bool {
        self.re.clone().simplify().is_zero() && self.im.clone().simplify().is_zero()
    }
}
impl One for SymbolicComplex {
    fn one() -> Self {
        SymbolicComplex::from_real(SymbolicExpr::int(1))
    }
}

impl Sum for SymbolicComplex {
    fn sum<I: Iterator<Item = SymbolicComplex>>(iter: I) -> Self {
        iter.fold(SymbolicComplex::zero(), |acc, x| acc + x)
    }
}
impl<'a> Sum<&'a SymbolicComplex> for SymbolicComplex {
    fn sum<I: Iterator<Item = &'a SymbolicComplex>>(iter: I) -> Self {
        iter.fold(SymbolicComplex::zero(), |acc, x| acc + x.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_complex_from_str() {
        // 実数
        let c1: SymbolicComplex = "5".parse().unwrap();
        assert_eq!(
            c1,
            SymbolicComplex::new(SymbolicExpr::int(5), SymbolicExpr::int(0))
        );

        // 純虚数
        let c2: SymbolicComplex = "3*i".parse().unwrap();
        assert_eq!(
            c2,
            SymbolicComplex::new(SymbolicExpr::int(0), SymbolicExpr::int(3))
        );

        // i と -i
        let c3: SymbolicComplex = "i".parse().unwrap();
        assert_eq!(c3, SymbolicComplex::i());
        let c4: SymbolicComplex = "-i".parse().unwrap();
        assert_eq!(c4, SymbolicComplex::i().neg());

        // 一般的な複素数
        let c5: SymbolicComplex = "2 + 4/3*i".parse().unwrap();
        assert_eq!(
            c5,
            SymbolicComplex::new(SymbolicExpr::int(2), SymbolicExpr::rational(4, 3))
        );

        // 減算
        let c6: SymbolicComplex = "10 - 2*i".parse().unwrap();
        assert_eq!(
            c6,
            SymbolicComplex::new(SymbolicExpr::int(10), SymbolicExpr::int(-2))
        );

        // 複雑な式
        let c7: SymbolicComplex = "sqrt(2) + (1+1)*i".parse().unwrap();
        let expected_re = SymbolicExpr::pow(SymbolicExpr::int(2), SymbolicExpr::rational(1, 2));
        assert_eq!(c7, SymbolicComplex::new(expected_re, SymbolicExpr::int(2)));
    }

    #[test]
    fn test_complex_to_latex() {
        let c1 = SymbolicComplex::new(SymbolicExpr::int(2), SymbolicExpr::int(3));
        assert_eq!(c1.to_latex(), "2+3i");

        let c2 = SymbolicComplex::new(
            SymbolicExpr::pow(SymbolicExpr::int(5), SymbolicExpr::rational(1, 2)),
            SymbolicExpr::int(-1),
        );
        assert_eq!(c2.to_latex(), "\\sqrt{5}-i");

        let c3 = SymbolicComplex::new(
            SymbolicExpr::int(10),
            SymbolicExpr::add(vec![SymbolicExpr::int(1), SymbolicExpr::int(2)]),
        );
        assert_eq!(c3.to_latex(), "10+3i");
    }
}
