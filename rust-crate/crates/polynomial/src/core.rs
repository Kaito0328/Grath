use algebraic::traits::{Field, Ring};
use num_traits::{One, Zero};
use std::fmt;
use std::ops::{Add, Div, Mul, Sub};

#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};

#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Polynomial<F: Ring> {
    pub coeffs: Vec<F>, // 低次→高次
}

impl<F: Ring + fmt::Display + PartialEq> fmt::Display for Polynomial<F> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.is_zero() {
            return write!(f, "0");
        }
        let mut first = true;
        for (i, c) in self.coeffs.iter().enumerate().rev() {
            if c.is_zero() {
                continue;
            }
            if !first {
                write!(f, " + ")?;
            }
            first = false;
            if i == 0 {
                write!(f, "{}", c)?;
            } else if i == 1 {
                write!(f, "{}x", c)?;
            } else {
                write!(f, "{}x^{}", c, i)?;
            }
        }
        Ok(())
    }
}

impl<F: Ring> Default for Polynomial<F> {
    fn default() -> Self {
        Self::zero()
    }
}

impl<F: Ring> Polynomial<F> {
    pub fn new(mut c: Vec<F>) -> Self {
        Self {
            coeffs: Self::trim(&mut c),
        }
    }

    fn trim(v: &mut Vec<F>) -> Vec<F> {
        while v.len() > 1 && v.last().map(|x| x.is_zero()).unwrap_or(false) {
            v.pop();
        }
        if v.is_empty() {
            v.push(F::zero());
        }
        v.clone()
    }

    pub fn zero() -> Self {
        Self {
            coeffs: vec![F::zero()],
        }
    }

    pub fn one() -> Self {
        Self {
            coeffs: vec![F::one()],
        }
    }

    pub fn is_zero(&self) -> bool {
        self.coeffs.len() == 1 && self.coeffs[0].is_zero()
    }

    pub fn deg(&self) -> isize {
        if self.coeffs.len() == 1 && self.coeffs[0].is_zero() {
            -1
        } else {
            self.coeffs.len() as isize - 1
        }
    }

    pub fn get(&self, i: usize) -> F {
        self.coeffs.get(i).cloned().unwrap_or_else(F::zero)
    }

    pub fn eval(&self, x: F) -> F {
        let mut acc = F::zero();
        for c in self.coeffs.iter().rev() {
            acc = acc * x.clone() + c.clone();
        }
        acc
    }

    pub fn differentiate(&self) -> Polynomial<F> {
        if self.deg() <= 0 {
            return Polynomial::zero();
        }
        let mut n_coeffs = Vec::new();
        for (i, c) in self.coeffs.iter().enumerate().skip(1) {
            let mut acc = F::zero();
            for _ in 0..i {
                acc = acc + c.clone();
            }
            n_coeffs.push(acc);
        }
        Polynomial::new(n_coeffs)
    }

    pub fn from_roots(roots: Vec<F>) -> Self {
        let deg = roots.len();
        if deg == 0 {
            return Polynomial::one();
        }
        if deg == 1 {
            return Polynomial::new(vec![-roots[0].clone(), F::one()]);
        }
        let mid = deg / 2;
        let left = Polynomial::from_roots(roots[..mid].to_vec());
        let right = Polynomial::from_roots(roots[mid..].to_vec());
        &left * &right
    }
}

// division and monic logic require Field
impl<F: Field> Polynomial<F> {
    pub fn div_rem(&self, divisor: &Self) -> (Self, Self) {
        let mut r = self.coeffs.clone();
        while r.len() > 1 && r.last().map(|x| x.is_zero()).unwrap_or(false) {
            r.pop();
        }
        let mut rpoly = Polynomial::new(r);
        if divisor.coeffs.is_empty() || (divisor.coeffs.len() == 1 && divisor.coeffs[0].is_zero()) {
            return (Polynomial::zero(), self.clone());
        }
        let dl = divisor.coeffs.len();
        let lead = divisor.coeffs[dl - 1].clone();
        let mut q = vec![F::zero(); self.coeffs.len().saturating_sub(dl) + 1];
        while rpoly.coeffs.len() >= dl && !(rpoly.coeffs.len() == 1 && rpoly.coeffs[0].is_zero()) {
            let shift = rpoly.coeffs.len() - dl;
            let coef = rpoly.coeffs.last().cloned().unwrap_or_else(F::zero) / lead.clone();
            q[shift] = coef.clone();
            for i in 0..dl {
                let idx = i + shift;
                let val = rpoly.coeffs[idx].clone() - coef.clone() * divisor.coeffs[i].clone();
                rpoly.coeffs[idx] = val;
            }
            while rpoly.coeffs.len() > 1
                && rpoly.coeffs.last().map(|x| x.is_zero()).unwrap_or(false)
            {
                rpoly.coeffs.pop();
            }
        }
        (Polynomial::new(q), rpoly)
    }

    pub fn monic(&self) -> Self {
        if self.deg() < 0 {
            return self.clone();
        }
        let lc = self.coeffs.last().cloned().unwrap_or_else(F::zero);
        if lc.is_zero() {
            return Polynomial::zero();
        }
        let inv = F::one() / lc;
        Polynomial::new(
            self.coeffs
                .iter()
                .map(|c| c.clone() * inv.clone())
                .collect(),
        )
    }

    pub fn gcd(a: &Self, b: &Self) -> Self {
        if b.is_zero() {
            return a.monic();
        }
        let mut x = a.clone();
        let mut y = b.clone();
        while !y.is_zero() {
            let (_, r) = x.div_rem(&y);
            x = y;
            y = r;
        }
        x.monic()
    }

    pub fn lcm(a: &Self, b: &Self) -> Self {
        if a.is_zero() || b.is_zero() {
            return Polynomial::zero();
        }
        let g = Polynomial::gcd(a, b);
        // lcm(a,b) = a*b / gcd(a,b)
        // We make the result monic for determinism.
        let prod = a * b;
        (prod / g).monic()
    }
}

// Operators
impl<F: Ring> Add for &Polynomial<F> {
    type Output = Polynomial<F>;
    fn add(self, other: Self) -> Self::Output {
        let n = self.coeffs.len().max(other.coeffs.len());
        let mut v = vec![F::zero(); n];
        for (i, coeff) in v.iter_mut().enumerate() {
            *coeff = self.get(i) + other.get(i);
        }
        Polynomial::new(v)
    }
}

impl<F: Ring> Sub for &Polynomial<F> {
    type Output = Polynomial<F>;
    fn sub(self, other: Self) -> Self::Output {
        let n = self.coeffs.len().max(other.coeffs.len());
        let mut v = vec![F::zero(); n];
        for (i, coeff) in v.iter_mut().enumerate() {
            *coeff = self.get(i) - other.get(i);
        }
        Polynomial::new(v)
    }
}

impl<F: Ring> Mul for &Polynomial<F> {
    type Output = Polynomial<F>;
    fn mul(self, other: Self) -> Self::Output {
        if self.deg() < 0 || other.deg() < 0 {
            return Polynomial::zero();
        }
        let mut v = vec![F::zero(); self.coeffs.len() + other.coeffs.len() - 1];
        for i in 0..self.coeffs.len() {
            for j in 0..other.coeffs.len() {
                v[i + j] = v[i + j].clone() + self.coeffs[i].clone() * other.coeffs[j].clone();
            }
        }
        Polynomial::new(v)
    }
}

impl<F: Field> Div for &Polynomial<F> {
    type Output = Polynomial<F>;
    fn div(self, rhs: Self) -> Self::Output {
        let (q, _r) = self.div_rem(rhs);
        q
    }
}

// Provide owned versions
impl<F: Ring> Add for Polynomial<F> {
    type Output = Polynomial<F>;
    fn add(self, rhs: Self) -> Self::Output {
        &self + &rhs
    }
}
impl<F: Ring> Sub for Polynomial<F> {
    type Output = Polynomial<F>;
    fn sub(self, rhs: Self) -> Self::Output {
        &self - &rhs
    }
}
impl<F: Ring> Mul for Polynomial<F> {
    type Output = Polynomial<F>;
    fn mul(self, rhs: Self) -> Self::Output {
        &self * &rhs
    }
}
impl<F: Field> Div for Polynomial<F> {
    type Output = Polynomial<F>;
    fn div(self, rhs: Self) -> Self::Output {
        &self / &rhs
    }
}

// Scalar Operators
impl<F: Ring> Mul<F> for &Polynomial<F> {
    type Output = Polynomial<F>;
    fn mul(self, rhs: F) -> Self::Output {
        Polynomial::new(
            self.coeffs
                .iter()
                .map(|c| c.clone() * rhs.clone())
                .collect(),
        )
    }
}

impl<F: Ring> Mul<F> for Polynomial<F> {
    type Output = Polynomial<F>;
    fn mul(self, rhs: F) -> Self::Output {
        &self * rhs
    }
}

impl<F: Field> Div<F> for &Polynomial<F> {
    type Output = Polynomial<F>;
    fn div(self, rhs: F) -> Self::Output {
        let inv = F::one() / rhs;
        self * inv
    }
}

impl<F: Field> Div<F> for Polynomial<F> {
    type Output = Polynomial<F>;
    fn div(self, rhs: F) -> Self::Output {
        &self / rhs
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use algebraic::rational::Rational;

    #[test]
    fn test_display() {
        let p = Polynomial::new(vec![
            Rational::from_int(1),
            Rational::from_int(0),
            Rational::from_int(2),
        ]);
        assert_eq!(p.to_string(), "2x^2 + 1");
    }

    #[test]
    fn test_gcd() {
        // (x-1)
        let p1 = Polynomial::new(vec![Rational::from_int(-1), Rational::from_int(1)]);
        // (x-1)(x-2) = x^2 - 3x + 2
        let p2 = Polynomial::new(vec![
            Rational::from_int(2),
            Rational::from_int(-3),
            Rational::from_int(1),
        ]);
        let g = Polynomial::gcd(&p1, &p2);
        assert_eq!(g.deg(), 1);
        // GCD is monic, so it should be x-1
        assert_eq!(g.coeffs[0], Rational::from_int(-1));
        assert_eq!(g.coeffs[1], Rational::from_int(1));
    }

    #[test]
    fn test_scalar_ops() {
        let p = Polynomial::new(vec![Rational::from_int(1), Rational::from_int(2)]);
        let p2 = &p * Rational::from_int(3);
        assert_eq!(
            p2.coeffs,
            vec![Rational::from_int(3), Rational::from_int(6)]
        );

        let p3 = &p2 / Rational::from_int(3);
        assert_eq!(
            p3.coeffs,
            vec![Rational::from_int(1), Rational::from_int(2)]
        );
    }
}
