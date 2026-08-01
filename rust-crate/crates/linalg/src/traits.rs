use num_traits::{One, Signed, Zero};
use std::fmt::Debug;
use std::iter::Sum;
use std::ops::{Add, Div, Mul, Neg, Sub}; // Negを追加

pub trait Scalar: Clone + Debug {}

pub trait Conjugate {
    fn conj(&self) -> Self;
}

pub trait Sqrt {
    fn sqrt(&self) -> Self;
}

impl Sqrt for f64 {
    fn sqrt(&self) -> Self {
        f64::sqrt(*self)
    }
}

impl Sqrt for algebraic::expr::SymbolicExpr {
    fn sqrt(&self) -> Self {
        self.clone().sqrt()
    }
}

impl Sqrt for algebraic::complex::SymbolicComplex {
    fn sqrt(&self) -> Self {
        // For Gram-Schmidt, we expect the argument to be real (norm squared)
        // If it's complex, we'd need a general complex sqrt, but here we assume norm logic.
        // Let's use SymbolicExpr's sqrt for the real part if imag is zero.
        if self.im.is_zero() {
            Self::from_real(self.re.clone().sqrt())
        } else {
            // General complex sqrt: sqrt(z) = z^(1/2)
            // But SymbolicComplex doesn't have pow yet.
            // For now, we only need it for norms.
            Self::from_real(self.re.clone().sqrt()) // Placeholder/Assume real for QR
        }
    }
}

impl Conjugate for f64 {
    fn conj(&self) -> Self {
        *self
    }
}
impl Conjugate for f32 {
    fn conj(&self) -> Self {
        *self
    }
}
impl Conjugate for i64 {
    fn conj(&self) -> Self {
        *self
    }
}

impl Conjugate for algebraic::rational::Rational {
    fn conj(&self) -> Self {
        *self
    }
}

impl Conjugate for algebraic::expr::SymbolicExpr {
    fn conj(&self) -> Self {
        self.clone()
    }
}

impl Conjugate for algebraic::complex::SymbolicComplex {
    fn conj(&self) -> Self {
        self.conj()
    }
}

pub trait Ring:
    Scalar
    + Zero
    + One
    + Add<Output = Self>
    + Sub<Output = Self>
    + Mul<Output = Self>
    + Neg<Output = Self>
    + Sum<Self>
{
}

pub trait Field: Ring + Div<Output = Self> {}

impl<T> Scalar for T where T: Clone + Debug {}

impl<T> Ring for T where
    T: Scalar
        + Zero
        + One
        + Add<Output = T>
        + Sub<Output = T>
        + Mul<Output = T>
        + Neg<Output = T>
        + Sum<T>
{
}

// Ringであり、かつDiv<Output=T>を持つ型は、自動的にFieldトレイトを実装する
impl<T: Ring + Div<Output = T>> Field for T {}

pub trait LinalgField: Field + Signed + PartialOrd {
    // 必要に応じて、epsilon()のような小さな値を返すメソッドを定義
    fn epsilon() -> Self;
}

impl LinalgField for f64 {
    fn epsilon() -> Self {
        1e-12
    }
}

impl LinalgField for f32 {
    fn epsilon() -> Self {
        1e-6
    }
}
