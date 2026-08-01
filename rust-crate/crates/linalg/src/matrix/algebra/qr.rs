use crate::{traits::Conjugate, traits::Sqrt, Field, Matrix, Result};

#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone)]
pub struct QR<T> {
    pub q: Matrix<T>,
    pub r: Matrix<T>,
}

impl<T: Field + Conjugate + Sqrt + PartialEq> Matrix<T> {
    /// Compute exact QR decomposition using Gram-Schmidt process.
    /// This works for any Field that implements Conjugate and Sqrt.
    pub fn qr_exact(&self) -> Result<QR<T>> {
        let (n_rows, n_cols) = (self.rows, self.cols);
        let mut q_cols: Vec<crate::vector::Vector<T>> = Vec::with_capacity(n_cols);
        let mut r = Matrix::zeros(n_cols, n_cols); // R is typically n x n or match cols

        // We assume A is rows x cols. Q will be rows x cols (orthonormal columns).
        // R will be cols x cols (upper triangular).

        for j in 0..n_cols {
            let mut v = self.col(j)?;

            for i in 0..j {
                // r_ij = <q_i, a_j>
                let r_ij = q_cols[i].conjugate_dot(&v);
                r[(i, j)] = r_ij.clone();

                // v = v - r_ij * q_i
                let q_i_scaled = q_cols[i].checked_mul_scalar(r_ij);
                v = v.checked_sub(&q_i_scaled)?;
            }

            // r_jj = ||v||
            let norm_sq = v.norm_sq();
            let r_jj = norm_sq.sqrt();
            r[(j, j)] = r_jj.clone();

            // q_j = v / r_jj
            if r_jj.is_zero() {
                // Rank deficient case
                q_cols.push(crate::vector::Vector::zeros(n_rows));
            } else {
                let q_j = v.checked_mul_scalar(T::one() / r_jj);
                q_cols.push(q_j);
            }
        }

        // Construct Q matrix from columns
        let mut q_data = Vec::with_capacity(n_rows * n_cols);
        for r_idx in 0..n_rows {
            for c_idx in 0..n_cols {
                q_data.push(q_cols[c_idx][r_idx].clone());
            }
        }
        let q = Matrix::new(n_rows, n_cols, q_data)?;

        Ok(QR { q, r })
    }
}
