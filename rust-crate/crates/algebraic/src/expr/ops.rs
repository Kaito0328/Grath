use core::ops::{Add as OpAdd, Div as OpDiv, Mul as OpMul, Neg as OpNeg, Sub as OpSub};
use std::iter::Sum;

use super::SymbolicExpr;

impl OpAdd for SymbolicExpr {
    type Output = SymbolicExpr;
    fn add(self, rhs: Self) -> Self::Output {
        SymbolicExpr::add(vec![self, rhs]).simplify()
    }
}
impl OpSub for SymbolicExpr {
    type Output = SymbolicExpr;
    fn sub(self, rhs: Self) -> Self::Output {
        SymbolicExpr::add(vec![
            self,
            SymbolicExpr::mul(vec![SymbolicExpr::int(-1), rhs]).simplify(),
        ])
        .simplify()
    }
}
impl OpMul for SymbolicExpr {
    type Output = SymbolicExpr;
    fn mul(self, rhs: Self) -> Self::Output {
        SymbolicExpr::mul(vec![self, rhs]).simplify()
    }
}
impl OpDiv for SymbolicExpr {
    type Output = SymbolicExpr;
    fn div(self, rhs: Self) -> Self::Output {
        SymbolicExpr::mul(vec![self, SymbolicExpr::pow(rhs, SymbolicExpr::int(-1))]).simplify()
    }
}
impl OpNeg for SymbolicExpr {
    type Output = SymbolicExpr;
    fn neg(self) -> Self::Output {
        SymbolicExpr::mul(vec![SymbolicExpr::int(-1), self]).simplify()
    }
}

impl Sum for SymbolicExpr {
    fn sum<I: Iterator<Item = SymbolicExpr>>(iter: I) -> Self {
        iter.fold(SymbolicExpr::int(0), |acc, x| acc + x)
    }
}
impl<'a> Sum<&'a SymbolicExpr> for SymbolicExpr {
    fn sum<I: Iterator<Item = &'a SymbolicExpr>>(iter: I) -> Self {
        iter.fold(SymbolicExpr::int(0), |acc, x| acc + x.clone())
    }
}

impl num_traits::Zero for SymbolicExpr {
    fn zero() -> Self {
        SymbolicExpr::int(0)
    }
    fn is_zero(&self) -> bool {
        match self {
            SymbolicExpr::Rational(r) => r.is_zero(),
            _ => matches!(self.clone().simplify(), SymbolicExpr::Rational(r) if r.is_zero()),
        }
    }
}
impl num_traits::One for SymbolicExpr {
    fn one() -> Self {
        SymbolicExpr::int(1)
    }
}
