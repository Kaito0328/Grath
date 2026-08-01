use crate::matrix::algebra::eigen::ExactEigenvalues;
use crate::{traits::Conjugate, traits::Sqrt, vector::Vector, Field, LinalgError, Matrix, Result};
use algebraic::complex::SymbolicComplex;
use algebraic::expr::SymbolicExpr;
use num_traits::{One, Zero};

#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone)]
pub struct SVD<T> {
    pub u: Matrix<T>,
    pub s: Matrix<T>,
    pub v: Matrix<T>, // v^H exists but we return V
}

impl Matrix<SymbolicComplex> {
    /// Compute exact SVD for a symbolic complex matrix.
    /// This uses the eigenvalue decomposition of A^H * A.
    pub fn svd_exact(&self) -> Result<SVD<SymbolicComplex>> {
        if self.rows == 2 && self.cols == 2 {
            return svd_exact_2x2(self);
        }

        let n_rows = self.rows;
        let n_cols = self.cols;

        // 1. Compute B = A^H * A (n_cols x n_cols)
        let ah = self.conjugate_transpose();
        let b = ah.checked_mul(self)?;

        // 2. Compute eigenvalues of B
        // B is Hermitian, so eigenvalues are non-negative real.
        let eigenvalues = b.eigenvalues_exact()?;

        // 3. For each eigenvalue, find eigenvectors (Null space of B - lambda*I)
        let mut v_cols = Vec::new();
        let mut singular_values = Vec::new();

        for lam in eigenvalues {
            // singular value sigma = sqrt(lambda)
            let sigma = lam.re.clone().sqrt();
            singular_values.push(SymbolicComplex::from_real(sigma));

            // Solve (B - lam*I) x = 0
            let mut b_minus_lam_i = b.clone();
            for i in 0..n_cols {
                b_minus_lam_i[(i, i)] = b_minus_lam_i[(i, i)].sub(&lam);
            }

            // Find kernel (null space)
            // For now, we assume distinct eigenvalues for simplicity or handle eigenspace dimension.
            // RREF based kernel find:
            let rref = b_minus_lam_i.rref()?;
            let kernel = rref.find_kernel_basis_from_rref()?;

            for vec in kernel {
                // Orthogonalize if needed (for multiple eigenvalues) - GS happens later
                v_cols.push(vec);
            }
        }

        // 4. Ensure V columns are orthonormal
        // (If multiple eigenvalues, GS on the basis of each eigenspace)
        let v_mat_full = gs_orthonormalize(v_cols)?;
        let v = v_mat_full;

        // 5. Compute Sigma matrix (m x n)
        let mut s_data = vec![SymbolicComplex::zero(); n_rows * n_cols];
        for i in 0..std::cmp::min(n_rows, n_cols) {
            s_data[i * n_cols + i] = singular_values[i].clone();
        }
        let s = Matrix::new(n_rows, n_cols, s_data)?;

        // 6. Compute U columns: u_i = A * v_i / sigma_i
        let mut u_cols = Vec::new();
        for i in 0..singular_values.len() {
            let sigma = &singular_values[i];
            if !sigma.re.is_zero() {
                let avi = self.checked_mul_vector(&v.col(i)?)?;
                let ui = avi.checked_mul_scalar(SymbolicComplex::from_real(
                    SymbolicComplex::one().re.clone() / sigma.re.clone(),
                ));
                u_cols.push(ui);
            }
        }

        // Fill remaining U columns to form a basis
        let u_basis = complete_to_orthonormal_basis(u_cols, n_rows)?;
        let u = u_basis;

        Ok(SVD { u, s, v })
    }
}

fn svd_exact_2x2(a: &Matrix<SymbolicComplex>) -> Result<SVD<SymbolicComplex>> {
    debug_assert_eq!(a.rows, 2);
    // 1) B = A^H A (2x2 Hermitian)
    let b = a.conjugate_transpose().checked_mul(a)?;

    // 2) Eigenvalues and eigenvectors of B = A^H A
    let eigenvalues = b.eigenvalues_exact()?;
    let eigen_decomp = crate::matrix::algebra::eigen::eigen_decompose_exact_2x2(&b, eigenvalues)?;
    let sigma1 = SymbolicComplex::from_real(eigen_decomp.values[0].re.clone().sqrt().simplify());
    let sigma2 = SymbolicComplex::from_real(eigen_decomp.values[1].re.clone().sqrt().simplify());
    let v = eigen_decomp.vectors;

    // 4) Sigma
    let _s_val = Matrix::new(
        2,
        2,
        vec![
            sigma1.clone(),
            SymbolicComplex::zero(),
            SymbolicComplex::zero(),
            sigma2.clone(),
        ],
    )?;

    // 4) Sigma
    let s = Matrix::new(
        2,
        2,
        vec![
            sigma1.clone(),
            SymbolicComplex::zero(),
            SymbolicComplex::zero(),
            sigma2.clone(),
        ],
    )?;

    // 5) Left singular vectors u_i = A v_i / σ_i (fallback if σ_i = 0)
    let mut u1 = if !sigma1.re.is_zero() {
        let av1 = a.checked_mul_vector(&v.col(0)?)?;
        av1.checked_mul_scalar(SymbolicComplex::one() / sigma1.clone())
    } else {
        Vector::new(vec![SymbolicComplex::one(), SymbolicComplex::zero()])
    };
    let u1_norm = u1.norm_sq().sqrt();
    if !u1_norm.is_zero() {
        u1 = u1.checked_mul_scalar(SymbolicComplex::one() / u1_norm);
    }

    let mut u2_raw = if !sigma2.re.is_zero() {
        let av2 = a.checked_mul_vector(&v.col(1)?)?;
        av2.checked_mul_scalar(SymbolicComplex::one() / sigma2.clone())
    } else {
        Vector::new(vec![-u1[1].clone().conj(), u1[0].clone().conj()])
    };

    // orthogonalize u2 against u1
    let proj = u1.conjugate_dot(&u2_raw);
    let u1_proj = u1.checked_mul_scalar(proj);
    u2_raw = u2_raw.checked_sub(&u1_proj)?;
    let u2_norm = u2_raw.norm_sq().sqrt();
    let u2 = if u2_norm.is_zero() {
        Vector::new(vec![-u1[1].clone().conj(), u1[0].clone().conj()])
    } else {
        u2_raw.checked_mul_scalar(SymbolicComplex::one() / u2_norm)
    };

    let u = Matrix::new(
        2,
        2,
        vec![u1[0].clone(), u2[0].clone(), u1[1].clone(), u2[1].clone()],
    )?;

    Ok(SVD { u, s, v })
}

fn gs_orthonormalize<T: Field + Conjugate + Sqrt + PartialEq>(
    cols: Vec<Vector<T>>,
) -> Result<Matrix<T>> {
    if cols.is_empty() {
        return Err(LinalgError::SingularMatrix);
    }
    let n_rows = cols[0].dim();
    let n_cols = cols.len();
    // We can reuse qr_exact logic by forming a matrix and calling it
    let mut a_data = vec![T::zero(); n_rows * n_cols];
    for c in 0..n_cols {
        for r in 0..n_rows {
            a_data[r * n_cols + c] = cols[c][r].clone();
        }
    }
    let a = Matrix::new(n_rows, n_cols, a_data)?;
    let qr = a.qr_exact()?;
    Ok(qr.q)
}

fn complete_to_orthonormal_basis<T: Field + Conjugate + Sqrt + PartialEq>(
    existing_cols: Vec<Vector<T>>,
    target_dim: usize,
) -> Result<Matrix<T>> {
    let mut all_cols = existing_cols;
    if all_cols.len() < target_dim {
        // Add standard basis vectors and orthonormalize
        for i in 0..target_dim {
            let mut e = vec![T::zero(); target_dim];
            e[i] = T::one();
            all_cols.push(Vector::new(e));
        }
    }
    // Form matrix and QR to get orthonormal basis (rank will limit columns)
    let n_rows = target_dim;
    let mut a_data = vec![T::zero(); n_rows * all_cols.len()];
    for c in 0..all_cols.len() {
        for r in 0..n_rows {
            a_data[r * all_cols.len() + c] = all_cols[c][r].clone();
        }
    }
    let a = Matrix::new(n_rows, all_cols.len(), a_data)?;

    // Modification: GS needs to handle linear dependency
    let mut q_cols: Vec<Vector<T>> = Vec::new();
    for j in 0..a.cols {
        let mut v = a.col(j)?;
        for i in 0..q_cols.len() {
            let r_ij = q_cols[i].conjugate_dot(&v);
            let q_i_scaled = q_cols[i].checked_mul_scalar(r_ij);
            v = v.checked_sub(&q_i_scaled)?;
        }
        let norm_sq = v.norm_sq();
        let norm = norm_sq.sqrt();
        if !norm.is_zero() && q_cols.len() < target_dim {
            let q_j = v.checked_mul_scalar(T::one() / norm);
            q_cols.push(q_j);
        }
    }

    let mut q_data = vec![T::zero(); target_dim * target_dim];
    for r in 0..target_dim {
        for c in 0..target_dim {
            q_data[r * target_dim + c] = q_cols[c][r].clone();
        }
    }
    Matrix::new(target_dim, target_dim, q_data)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn svd_exact_symbolic_2x2_does_not_error() {
        let a = SymbolicComplex::from_real(SymbolicExpr::Symbol("a".to_string()));
        let b = SymbolicComplex::from_real(SymbolicExpr::Symbol("b".to_string()));
        let c = SymbolicComplex::from_real(SymbolicExpr::Symbol("c".to_string()));
        let d = SymbolicComplex::from_real(SymbolicExpr::Symbol("d".to_string()));
        let m = Matrix::new(2, 2, vec![a, b, c, d]).unwrap();

        let svd = m.svd_exact();
        assert!(svd.is_ok());
        let svd = svd.unwrap();
        assert_eq!(svd.u.rows, 2);
        assert_eq!(svd.u.cols, 2);
        assert_eq!(svd.s.rows, 2);
        assert_eq!(svd.s.cols, 2);
        assert_eq!(svd.v.rows, 2);
        assert_eq!(svd.v.cols, 2);
    }
}
