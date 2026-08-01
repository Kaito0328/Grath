use super::Matrix;
use crate::matrix::algebra::lu::LU;
use crate::{Field, LinalgError, Result};
use num_traits::{One, Zero};
use polynomial::prelude::Polynomial;

impl<T: Field> Matrix<T> {
    /// Evaluates the characteristic polynomial of the matrix and its inverse exactly
    /// using the Faddeev-LeVerrier algorithm.
    /// This is valid for generic `Field`s, including `f64`, `Rational`, and `SymbolicExpr`.
    ///
    /// Returns:
    /// - `Polynomial<T>`: The characteristic polynomial $P(\lambda) = \det(\lambda I - A)$.
    ///   Note: Faddeev-LeVerrier yields $P(\lambda) = \lambda^n - c_1 \lambda^{n-1} - ... - c_n$.
    ///   For consistency with standard det, the coefficients will be formatted appropriately.
    /// - `Option<Matrix<T>>`: The exact inverse of the matrix, if $c_n \neq 0$.
    pub fn faddeev_leverrier(&self) -> Result<(Polynomial<T>, Option<Matrix<T>>)> {
        if !self.is_square() {
            return Err(LinalgError::NotSquareMatrix);
        }

        let n = self.rows;
        if n == 0 {
            return Ok((Polynomial::new(vec![T::one()]), None));
        }

        let mut coeffs = vec![T::zero(); n + 1];
        // \lambda^n term is 1
        coeffs[n] = T::one();

        let mut m_k = self.clone(); // A_1 = A
        let mut b_k = Matrix::identity(n);
        let mut b_prev = Matrix::identity(n); // For storing B_{n-1}

        let mut c_n = T::zero();

        for k in 1..=n {
            // A_k = A * B_{k-1}
            if k > 1 {
                m_k = self.checked_mul(&b_k)?;
            }

            // c_k = (1/k) * Tr(A_k)
            let mut tr = T::zero();
            for i in 0..n {
                tr = tr + m_k[(i, i)].clone();
            }

            let mut k_val_t = T::zero();
            for _ in 0..k {
                k_val_t = k_val_t + T::one();
            }

            let c_k = tr / k_val_t;

            // coeffs[n - k]
            // Note: Faddeev-LeVerrier polynomial is \lambda^n - c_1 \lambda^{n-1} - c_2 \lambda^{n-2} ...
            // So coefficient is -c_k
            coeffs[n - k] = T::zero() - c_k.clone();

            c_n = c_k.clone();

            if k == n {
                break;
            }

            // B_k = A_k - c_k I
            b_prev = b_k;
            b_k = m_k.clone();
            for i in 0..n {
                b_k[(i, i)] = b_k[(i, i)].clone() - c_k.clone();
            }
        }

        // inverse is B_{n-1} / c_n
        let inv = if !c_n.clone().is_zero() {
            let mut inv_mat = b_k.clone(); // In the last step, b_k is actually the B_{n-1} from the step before, wait.
                                           // Actually, in the loop, b_k is updated at the end. So when k=n, we break BEFORE updating b_k.
                                           // This means b_k STILL holds B_{n-1}!
            for r in 0..n {
                for c in 0..n {
                    inv_mat[(r, c)] = inv_mat[(r, c)].clone() / c_n.clone();
                }
            }
            Some(inv_mat)
        } else {
            None
        };

        // If n is odd, det(lambda I - A) is lambda^n - c_1 \lambda^{n-1} ...
        // Wait, det(\lambda I - A) is ALWAYS \lambda^n - Tr(A)\lambda^{n-1} + ... + (-1)^n det(A)
        // Faddeev-LeVerrier gives perfectly that.

        Ok((Polynomial::new(coeffs), inv))
    }

    /// Compute exactly the characteristic polynomial via Faddeev-LeVerrier.
    pub fn characteristic_polynomial_exact(&self) -> Result<Polynomial<T>> {
        let (poly, _) = self.faddeev_leverrier()?;
        Ok(poly)
    }

    /// Compute the exact inverse using Faddeev-LeVerrier (Cramer's rule equivalent for polynomials).
    pub fn inverse_exact(&self) -> Result<Option<Matrix<T>>> {
        let (_, inv) = self.faddeev_leverrier()?;
        Ok(inv)
    }

    /// Compute exact LU decomposition without numerical partial pivoting.
    /// It searches for the first non-zero element in the column to use as a pivot.
    pub fn lu_exact(&self) -> Result<LU<T>> {
        if !self.is_square() {
            return Err(LinalgError::NotSquareMatrix);
        }
        let n = self.rows;
        let mut l: Matrix<T> = Matrix::zeros(n, n);
        let mut u: Matrix<T> = self.clone();
        let mut p: Matrix<T> = Matrix::identity(n);

        for k in 0..n {
            // Find first non-zero pivot
            let mut pivot_row = k;
            let mut found = false;
            for i in k..n {
                if !u[(i, k)].is_zero() {
                    pivot_row = i;
                    found = true;
                    break;
                }
            }
            if !found {
                return Err(LinalgError::SingularMatrix);
            }

            if pivot_row != k {
                p.swap_rows(k, pivot_row)?;
                u.swap_rows(k, pivot_row)?;
                for j in 0..k {
                    let tmp = l[(k, j)].clone();
                    l[(k, j)] = l[(pivot_row, j)].clone();
                    l[(pivot_row, j)] = tmp;
                }
            }

            l[(k, k)] = T::one();
            for i in k + 1..n {
                l[(i, k)] = u[(i, k)].clone() / u[(k, k)].clone();
            }
            for i in k + 1..n {
                for j in k..n {
                    let val = u[(i, j)].clone() - l[(i, k)].clone() * u[(k, j)].clone();
                    u[(i, j)] = val;
                }
            }
        }
        Ok(LU { p, l, u })
    }
}
