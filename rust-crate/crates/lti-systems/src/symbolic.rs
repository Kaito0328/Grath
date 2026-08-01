use crate::{Polynomial, RationalFunction, RfDisplay};
use algebraic::complex::SymbolicComplex as C;
use algebraic::expr::SymbolicExpr as E;
use algebraic::rational::Rational;
use num_traits::Zero;
use std::fmt;

/// 連続系の象徴伝達関数 G(s) = B(s)/A(s) （有理係数）
#[derive(Clone, Debug, PartialEq)]
pub struct SymbolicContinuousTF {
    pub ratio: RationalFunction<Rational>,
}

impl SymbolicContinuousTF {
    pub fn new(b: Polynomial<Rational>, a: Polynomial<Rational>) -> Self {
        Self {
            ratio: RationalFunction::new(b, a),
        }
    }
    pub fn from_coeffs(b: Vec<Rational>, a: Vec<Rational>) -> Self {
        Self::new(Polynomial::new(b), Polynomial::new(a))
    }
    /// 象徴的な零点（分子の根）
    pub fn zeros_symbolic(&self) -> Vec<C> {
        self.ratio.numerator.find_roots_symbolic()
    }
    /// 象徴的な極（分母の根）
    pub fn poles_symbolic(&self) -> Vec<C> {
        self.ratio.denominator.find_roots_symbolic()
    }
    /// s への代入（象徴式）。実部のみの評価を返す（虚部ゼロの場合を主用途に）
    pub fn eval_s_symbolic(&self, s: E) -> Option<E> {
        let num = self.ratio.numerator.eval_expr(s.clone());
        let den = self.ratio.denominator.eval_expr(s);
        if den.is_zero() {
            return None;
        }
        Some((num / den).simplify())
    }

    // --- 接続ユーティリティ ---
    /// 直列接続: self(s) * other(s)
    pub fn series(&self, other: &Self) -> Self {
        Self {
            ratio: &self.ratio * &other.ratio,
        }
    }
    /// 並列接続: self(s) + other(s)
    pub fn parallel(&self, other: &Self) -> Self {
        Self {
            ratio: &self.ratio + &other.ratio,
        }
    }
    /// フィードバック接続: G / (1 ± G H)
    pub fn feedback(&self, h: &Self, sign: i32) -> Self {
        let gh = &self.ratio * &h.ratio;
        let one = RationalFunction::<Rational>::one();
        let denom = if sign >= 0 { &one + &gh } else { &one - &gh };
        Self {
            ratio: &self.ratio / &denom,
        }
    }
    /// 単位フィードバック（負帰還）: G / (1 + G)
    pub fn feedback_unity(&self) -> Self {
        self.feedback(
            &Self {
                ratio: RationalFunction::one(),
            },
            1,
        )
    }

    // --- 表示ユーティリティ ---
    pub fn display(&self) -> RfDisplay<'_, Rational> {
        RfDisplay::new(&self.ratio, "s")
    }
    pub fn display_with(&self, var: &'static str) -> RfDisplay<'_, Rational> {
        RfDisplay::new(&self.ratio, var)
    }

    // --- 係数アクセサ ---
    pub fn b_coeffs(&self) -> &[Rational] {
        &self.ratio.numerator.coeffs
    }
    pub fn a_coeffs(&self) -> &[Rational] {
        &self.ratio.denominator.coeffs
    }
}

impl fmt::Display for SymbolicContinuousTF {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.display())
    }
}

/// 離散系の象徴伝達関数 H(z) = B(z)/A(z) （有理係数）
#[derive(Clone, Debug, PartialEq)]
pub struct SymbolicDiscreteTF {
    pub ratio: RationalFunction<Rational>,
}

impl SymbolicDiscreteTF {
    pub fn new(b: Polynomial<Rational>, a: Polynomial<Rational>) -> Self {
        Self {
            ratio: RationalFunction::new(b, a),
        }
    }
    pub fn from_coeffs(b: Vec<Rational>, a: Vec<Rational>) -> Self {
        Self::new(Polynomial::new(b), Polynomial::new(a))
    }
    pub fn zeros_symbolic(&self) -> Vec<C> {
        self.ratio.numerator.find_roots_symbolic()
    }
    pub fn poles_symbolic(&self) -> Vec<C> {
        self.ratio.denominator.find_roots_symbolic()
    }
    pub fn eval_z_symbolic(&self, z: E) -> Option<E> {
        let num = self.ratio.numerator.eval_expr(z.clone());
        let den = self.ratio.denominator.eval_expr(z);
        if den.is_zero() {
            return None;
        }
        Some((num / den).simplify())
    }
    // --- 接続ユーティリティ ---
    pub fn series(&self, other: &Self) -> Self {
        Self {
            ratio: &self.ratio * &other.ratio,
        }
    }
    pub fn parallel(&self, other: &Self) -> Self {
        Self {
            ratio: &self.ratio + &other.ratio,
        }
    }
    pub fn feedback(&self, h: &Self, sign: i32) -> Self {
        let gh = &self.ratio * &h.ratio;
        let one = RationalFunction::<Rational>::one();
        let denom = if sign >= 0 { &one + &gh } else { &one - &gh };
        Self {
            ratio: &self.ratio / &denom,
        }
    }
    pub fn feedback_unity(&self) -> Self {
        self.feedback(
            &Self {
                ratio: RationalFunction::one(),
            },
            1,
        )
    }
    // --- 表示ユーティリティ ---
    pub fn display(&self) -> RfDisplay<'_, Rational> {
        RfDisplay::new(&self.ratio, "z")
    }
    pub fn display_with(&self, var: &'static str) -> RfDisplay<'_, Rational> {
        RfDisplay::new(&self.ratio, var)
    }
    // --- 係数アクセサ ---
    pub fn b_coeffs(&self) -> &[Rational] {
        &self.ratio.numerator.coeffs
    }
    pub fn a_coeffs(&self) -> &[Rational] {
        &self.ratio.denominator.coeffs
    }
}

impl fmt::Display for SymbolicDiscreteTF {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.display())
    }
}
