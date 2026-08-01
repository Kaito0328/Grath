//! Rational number with lazy (hybrid) normalization strategy.
//!
//! 方針 (ハイブリッド):
//! - `Rational::new` は必ず既約 & 分母>0 に正規化 (安全な入口)
//! - 四則演算内部では「局所約分」(通分前の gcd 消去 / 乗算前の交差約分) のみにより膨張抑制
//! - 完全な既約形が必要な場面 (表示 / 比較 / ハッシュ) では `normalize()` / `simplified()` を明示呼び出し
//! - `dirty` フラグで未正規を追跡 (debug_assert! で比較時検査)
//!
//! 注意: Eq/Hash を将来実装する場合、利用側で必ず normalize 済みであることを要求するか、
//! 内部でコピーして正規化する。

use core::fmt;
use core::ops::{Add, Div, Mul, Neg, Sub};
use num_traits::{One, Zero};
use std::str::FromStr;

#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};
use std::iter::Sum;

use crate::error::{AlgebraicError, Result};

#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
#[derive(Debug, Clone, Copy)]
pub struct Rational {
    numer: i64,  // 分子 (sign here)
    denom: u64,  // 分母 (>0)
    dirty: bool, // true if possibly non-reduced (局所約分後の最終 gcd 未実施)
}

impl Default for Rational {
    fn default() -> Self {
        Self {
            numer: 0,
            denom: 1,
            dirty: false,
        }
    }
}

impl PartialEq for Rational {
    fn eq(&self, other: &Self) -> bool {
        if self.numer == other.numer && self.denom == other.denom {
            return true;
        }
        // クロス積 (ad == bc) で判定。i128にキャストしてオーバーフロー回避
        let left = (self.numer as i128) * (other.denom as i128);
        let right = (other.numer as i128) * (self.denom as i128);
        left == right
    }
}
impl Eq for Rational {}

impl Rational {
    pub fn try_new(numer: i64, denom: i64) -> Result<Self> {
        if denom == 0 {
            return Err(AlgebraicError::DivisionByZero);
        }

        if numer == 0 {
            // 0 は常に 0/1, dirty: false
            return Ok(Self {
                numer: 0,
                denom: 1,
                dirty: false,
            });
        }

        let mut d = denom;
        let mut n = numer;

        // 符号を分子に寄せる
        if d < 0 {
            d = -d;
            n = -n;
        }

        // 初期化時は「常に既約化する」という仕様ならここでGCD
        let g = gcd_i64_u64(n.abs(), d as u64);

        Ok(Self {
            numer: n / g as i64,
            denom: (d as u64) / g,
            dirty: false, // ここでGCDしたので dirty は false
        })
    }

    /// 2. パニックするコンストラクタ (定数・プログラマ用)
    pub fn new(numer: i64, denom: i64) -> Self {
        Self::try_new(numer, denom).expect("Rational::new failed (division by zero)")
    }

    pub fn to_latex(&self) -> String {
        if self.numer == 0 {
            return "0".to_string();
        }
        let mut tmp = *self;
        tmp.normalize();
        if tmp.denom == 1 {
            return format!("{}", tmp.numer);
        }
        if tmp.numer < 0 {
            format!("-\\frac{{{}}}{{{}}}", -tmp.numer, tmp.denom)
        } else {
            format!("\\frac{{{}}}{{{}}}", tmp.numer, tmp.denom)
        }
    }

    pub fn from_latex(latex: &str) -> Result<Self> {
        let text = crate::latex::latex_to_infix(latex);
        text.parse::<Rational>()
    }

    pub fn from_int(n: i64) -> Self {
        Self {
            numer: n,
            denom: 1,
            dirty: false,
        }
    }

    pub fn is_integer(&self) -> bool {
        if self.numer > 0 {
            (self.numer as u64).is_multiple_of(self.denom)
        } else {
            (-(self.numer) as u64).is_multiple_of(self.denom)
        }
    }

    pub fn numer(&self) -> i64 {
        self.numer
    }
    pub fn denom(&self) -> u64 {
        self.denom
    }
    pub fn is_zero(&self) -> bool {
        self.numer == 0
    }
    pub fn is_one(&self) -> bool {
        self.numer > 0 && (self.numer as u64) == self.denom
    }
    pub fn is_minus_one(&self) -> bool {
        self.numer < 0 && (-(self.numer) as u64) == self.denom
    }

    /// 完全正規化 (in-place)
    pub fn normalize(&mut self) {
        if !self.dirty {
            return;
        }
        if self.numer == 0 {
            self.denom = 1;
            self.dirty = false;
            return;
        }
        let g = gcd_i64_u64(self.numer.abs(), self.denom);
        if g > 1 {
            self.numer /= g as i64;
            self.denom /= g;
        }
        self.dirty = false;
    }

    /// コピーを正規化したものを返す
    pub fn simplified(mut self) -> Self {
        self.normalize();
        self
    }

    pub fn checked_add(self, rhs: Self) -> Result<Self> {
        if self.is_zero() {
            return Ok(rhs);
        }
        if rhs.is_zero() {
            return Ok(self);
        }

        let num1 = self.numer as i128;
        let den1 = self.denom as u128;
        let num2 = rhs.numer as i128;
        let den2 = rhs.denom as u128;

        let gcd = gcd_u64(den1 as u64, den2 as u64) as u128;
        let fact1 = den2 / gcd;
        let fact2 = den1 / gcd;

        let n128 = num1 * (fact1 as i128) + num2 * (fact2 as i128);
        if n128 == 0 {
            return Ok(Rational::from_int(0));
        }

        let denom_u128 = fact2 * den2;

        // オーバーフローチェック (Slow Path)
        let (mut n_final, mut d_final) = if denom_u128 <= u64::MAX as u128 {
            (n128, denom_u128 as u64)
        } else {
            let n_abs = n128.unsigned_abs();
            let mut tmp_denom = denom_u128;
            let g2 = gcd_u128(n_abs, tmp_denom);
            tmp_denom /= g2;

            if tmp_denom > u64::MAX as u128 {
                return Err(AlgebraicError::RationalOverflow(
                    "Add denominator overflow".to_string(),
                ));
            }

            let reduced_numer = n128 / (g2 as i128);
            if reduced_numer > i64::MAX as i128 || reduced_numer < i64::MIN as i128 {
                return Err(AlgebraicError::RationalOverflow(
                    "Add numerator overflow".to_string(),
                ));
            }

            return Ok(Rational {
                numer: reduced_numer as i64,
                denom: tmp_denom as u64,
                dirty: false,
            });
        };

        let g2 = gcd_i128_u128(n128.unsigned_abs(), gcd);
        if g2 > 1 {
            n_final /= g2 as i128;
            d_final /= g2 as u64;
        }

        if n_final > i64::MAX as i128 || n_final < i64::MIN as i128 {
            return Err(AlgebraicError::RationalOverflow(
                "Add numerator overflow".to_string(),
            ));
        }

        Ok(Rational {
            numer: n_final as i64,
            denom: d_final,
            dirty: true,
        })
    }
    pub fn checked_mul(self, rhs: Self) -> Result<Self> {
        if self.is_zero() || rhs.is_zero() {
            return Ok(Rational {
                numer: 0,
                denom: 1,
                dirty: false,
            });
        }
        // 交差約分: (a/b)*(c/d)
        let mut num1 = self.numer;
        let mut den1 = self.denom;
        let mut num2 = rhs.numer;
        let mut den2 = rhs.denom;
        let g1 = gcd_i64_u64(num1.abs(), den2);
        if g1 > 1 {
            num1 /= g1 as i64;
            den2 /= g1;
        }
        let g2 = gcd_i64_u64(num2.abs(), den1);
        if g2 > 1 {
            num2 /= g2 as i64;
            den1 /= g2;
        }

        let n128 = (num1 as i128) * (num2 as i128);
        let denom_u128 = (den1 as u128) * (den2 as u128);
        if denom_u128 > u64::MAX as u128 {
            return Err(AlgebraicError::RationalOverflow(
                "Mul denominator overflow".to_string(),
            ));
        }

        if n128 > i64::MAX as i128 || n128 < i64::MIN as i128 {
            return Err(AlgebraicError::RationalOverflow(
                "Mul numerator overflow".to_string(),
            ));
        }

        Ok(Rational {
            numer: n128 as i64,
            denom: denom_u128 as u64,
            dirty: self.dirty || rhs.dirty,
        })
    }

    pub fn checked_div(self, rhs: Self) -> Result<Self> {
        if rhs.is_zero() {
            return Err(AlgebraicError::DivisionByZero);
        }

        if rhs.denom > i64::MAX as u64 {
            // 分母が大きすぎて、分子(i64)に変換できない場合
            return Err(AlgebraicError::RationalOverflow(
                "Reciprocal numerator overflow".to_string(),
            ));
        }

        let flipped = Rational {
            numer: rhs.denom as i64 * rhs.numer.signum(),
            denom: rhs.numer.unsigned_abs(),
            dirty: rhs.dirty,
        };
        self.checked_mul(flipped)
    }
}

// --- num_traits Zero / One ---
impl Zero for Rational {
    fn zero() -> Self {
        Rational::from_int(0)
    }
    fn is_zero(&self) -> bool {
        self.is_zero()
    }
}

impl One for Rational {
    fn one() -> Self {
        Rational::from_int(1)
    }

    fn is_one(&self) -> bool {
        self.is_one()
    }
}

// --- Sum implementations ---
impl Sum for Rational {
    fn sum<I: Iterator<Item = Rational>>(iter: I) -> Self {
        iter.fold(Rational::from_int(0), |acc, x| acc + x)
    }
}
impl<'a> Sum<&'a Rational> for Rational {
    fn sum<I: Iterator<Item = &'a Rational>>(iter: I) -> Self {
        iter.fold(Rational::from_int(0), |acc, x| acc + *x)
    }
}

// --- Arithmetic ---
impl Add for Rational {
    type Output = Rational;
    fn add(self, rhs: Self) -> Self::Output {
        self.checked_add(rhs).expect("Rational addition overflow")
    }
}

impl Sub for Rational {
    type Output = Rational;
    fn sub(self, rhs: Self) -> Self::Output {
        self.checked_add(-rhs)
            .expect("Rational subtraction overflow")
    }
}

impl Mul for Rational {
    type Output = Rational;
    fn mul(self, rhs: Self) -> Self::Output {
        self.checked_mul(rhs)
            .expect("Rational multiplication overflow")
    }
}

impl Div for Rational {
    type Output = Rational;
    fn div(self, rhs: Self) -> Self::Output {
        self.checked_div(rhs).expect("Rational division overflow")
    }
}

impl Neg for Rational {
    type Output = Rational;
    fn neg(self) -> Self::Output {
        Rational {
            numer: -self.numer,
            denom: self.denom,
            dirty: self.dirty,
        }
    }
}

impl fmt::Display for Rational {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.numer == 0 {
            return write!(f, "0");
        }
        // 表示前にコピーして正規化 (性能重視なら optional 化可能)
        let mut tmp = *self;
        tmp.normalize();
        if tmp.denom == 1 {
            return write!(f, "{}", tmp.numer);
        }
        write!(f, "{}/{}", tmp.numer, tmp.denom)
    }
}

impl FromStr for Rational {
    type Err = AlgebraicError;
    fn from_str(s: &str) -> Result<Self> {
        fn strip_wrapping_parens(mut s: &str) -> &str {
            loop {
                let t = s.trim();
                if t.len() >= 2 && t.starts_with('(') && t.ends_with(')') {
                    s = &t[1..t.len() - 1];
                    continue;
                }
                return t;
            }
        }

        let parts: Vec<&str> = s.split('/').collect();
        if parts.len() == 1 {
            let p0 = strip_wrapping_parens(parts[0]);
            let p0_clean: String = p0.chars().filter(|c| !c.is_whitespace()).collect();
            let n: i64 = p0_clean.parse().map_err(|_| {
                AlgebraicError::ParseError(format!("Invalid integer: {}", parts[0]))
            })?;
            Ok(Rational::from_int(n))
        } else if parts.len() == 2 {
            let p0 = strip_wrapping_parens(parts[0]);
            let p1 = strip_wrapping_parens(parts[1]);
            let p0_clean: String = p0.chars().filter(|c| !c.is_whitespace()).collect();
            let p1_clean: String = p1.chars().filter(|c| !c.is_whitespace()).collect();
            let n: i64 = p0_clean.parse().map_err(|_| {
                AlgebraicError::ParseError(format!("Invalid numerator: {}", parts[0]))
            })?;
            let d: i64 = p1_clean.parse().map_err(|_| {
                AlgebraicError::ParseError(format!("Invalid denominator: {}", parts[1]))
            })?;
            Rational::try_new(n, d)
        } else {
            Err(AlgebraicError::ParseError(format!(
                "Invalid rational format: {}",
                s
            )))
        }
    }
}

// --- Helper GCD functions ---
fn gcd_i64_u64(a: i64, b: u64) -> u64 {
    gcd_u64(a.unsigned_abs(), b)
}
fn gcd_u64(mut x: u64, mut y: u64) -> u64 {
    while y != 0 {
        let r = x % y;
        x = y;
        y = r;
    }
    x
}
fn gcd_u128(mut x: u128, mut y: u128) -> u128 {
    while y != 0 {
        let r = x % y;
        x = y;
        y = r;
    }
    x
}
fn gcd_i128_u128(a: u128, b: u128) -> u128 {
    gcd_u128(a, b)
}

// Conversions
impl From<i64> for Rational {
    fn from(v: i64) -> Self {
        Rational::from_int(v)
    }
}
impl From<u64> for Rational {
    fn from(v: u64) -> Self {
        Rational::from_int(v as i64)
    }
}
