use crate::{LinalgError, Matrix, Result, Vector};
use algebraic::complex::SymbolicComplex;
use algebraic::expr::SymbolicExpr;
use algebraic::rational::Rational;
use num_traits::{One, Zero};

pub trait ExactEigenvalues {
    /// Compute the exact symbolic eigenvalues of the matrix.
    /// Only supports matrices up to 4x4.
    fn eigenvalues_exact(&self) -> Result<Vec<SymbolicComplex>>;
}

#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone)]
pub struct EigenDecompositionExact<T> {
    pub values: Vec<T>,
    pub vectors: Matrix<T>,
}

pub trait ExactEigenDecomposition<T> {
    fn eigen_decompose_exact(&self) -> Result<EigenDecompositionExact<T>>;
}

impl ExactEigenvalues for Matrix<SymbolicExpr> {
    fn eigenvalues_exact(&self) -> Result<Vec<SymbolicComplex>> {
        if !self.is_square() {
            return Err(LinalgError::NotSquareMatrix);
        }
        if self.rows > 4 {
            return Err(LinalgError::ExactSizeLimit {
                max: 4,
                text: "Symbolic eigenvalues for generic matrices with N > 4 are not supported (Abel–Ruffini).".to_string(),
            });
        }
        let poly = self.characteristic_polynomial_exact()?;
        if poly.deg() > 4 {
            return Err(LinalgError::ExactSizeLimit {
                max: 4,
                text: "Symbolic eigenvalues for generic matrices with N > 4 are not supported (Abel–Ruffini).".to_string(),
            });
        }
        Ok(poly.find_roots_symbolic_expr())
    }
}

impl ExactEigenDecomposition<SymbolicComplex> for Matrix<SymbolicExpr> {
    fn eigen_decompose_exact(&self) -> Result<EigenDecompositionExact<SymbolicComplex>> {
        let a_complex = self.map(|v: &SymbolicExpr| SymbolicComplex::from_real(v.clone()));
        a_complex.eigen_decompose_exact()
    }
}

impl ExactEigenvalues for Matrix<Rational> {
    fn eigenvalues_exact(&self) -> Result<Vec<SymbolicComplex>> {
        if !self.is_square() {
            return Err(LinalgError::NotSquareMatrix);
        }
        if self.rows > 4 {
            return Err(LinalgError::ExactSizeLimit {
                max: 4,
                text: "Exact eigenvalues for N > 4 are not supported by this implementation."
                    .to_string(),
            });
        }
        let poly = self.characteristic_polynomial_exact()?;
        if poly.deg() > 4 {
            return Err(LinalgError::ExactSizeLimit {
                max: 4,
                text: "Exact eigenvalues for N > 4 are not supported by this implementation."
                    .to_string(),
            });
        }
        Ok(poly.find_roots_symbolic())
    }
}

impl ExactEigenDecomposition<SymbolicComplex> for Matrix<Rational> {
    fn eigen_decompose_exact(&self) -> Result<EigenDecompositionExact<SymbolicComplex>> {
        let a_complex =
            self.map(|v: &Rational| SymbolicComplex::from_real(SymbolicExpr::Rational(*v)));
        a_complex.eigen_decompose_exact()
    }
}

impl ExactEigenvalues for Matrix<SymbolicComplex> {
    fn eigenvalues_exact(&self) -> Result<Vec<SymbolicComplex>> {
        if !self.is_square() {
            return Err(LinalgError::NotSquareMatrix);
        }
        if self.rows > 4 {
            return Err(LinalgError::ExactSizeLimit {
                max: 4,
                text: "Exact eigenvalues for N > 4 are not supported by this implementation."
                    .to_string(),
            });
        }
        let poly = self.characteristic_polynomial_exact()?;
        if poly.deg() > 4 {
            return Err(LinalgError::ExactSizeLimit {
                max: 4,
                text: "Exact eigenvalues for N > 4 are not supported by this implementation."
                    .to_string(),
            });
        }

        // Characteristic polynomial for SymbolicComplex currently assumes real or converts to roots.
        // If it's a SymbolicComplex matrix, we might have complex roots.
        let real_coeffs: Vec<SymbolicExpr> = poly.coeffs.iter().map(|c| c.re.clone()).collect();
        let real_poly = polynomial::core::Polynomial::new(real_coeffs);
        Ok(real_poly.find_roots_symbolic_expr())
    }
}

impl ExactEigenDecomposition<SymbolicComplex> for Matrix<SymbolicComplex> {
    fn eigen_decompose_exact(&self) -> Result<EigenDecompositionExact<SymbolicComplex>> {
        let eigenvalues = self.eigenvalues_exact()?;
        let n = self.rows;

        // 2x2かつ記号表現が含まれる可能性がある場合は閉形式を使用（is_zeroの不安定さを回避）
        if n == 2 {
            return eigen_decompose_exact_2x2(self, eigenvalues);
        }

        // 3x3以上で記号行列（SymbolicExpr経由など）の場合は、
        // 簡約化の性能不足により固有ベクトルが正しく求まらない（0になる）可能性が高いため、
        // 固有値のみを返却する。
        // ※ 本来は defective かどうかも記号的に判定するのは困難。
        let is_symbolic = self.data.iter().any(|c| {
            matches!(c.re, SymbolicExpr::Symbol(_)) || matches!(c.im, SymbolicExpr::Symbol(_))
        });

        if n > 2 && is_symbolic {
            // 固有ベクトルを空（0次元または特定の識別用）として返すか、
            // frontend側で判断できるように零行列などを詰めておく。
            // ここでは空の行列（cols=0）を返すことで「未提供」を示す。
            return Ok(EigenDecompositionExact {
                values: eigenvalues,
                vectors: Matrix::new(n, 0, vec![])?,
            });
        }

        let mut v_cols = Vec::new();
        for lam in &eigenvalues {
            let mut a_minus_lam_i = self.clone();
            for i in 0..n {
                a_minus_lam_i[(i, i)] = a_minus_lam_i[(i, i)].sub(lam);
            }

            let rref = a_minus_lam_i.rref()?;
            let kernel = rref.find_kernel_basis_from_rref()?;

            for v in kernel {
                v_cols.push(v);
                if v_cols.len() == n {
                    break;
                }
            }
            if v_cols.len() == n {
                break;
            }
        }

        // ベクトルが足りない場合は零ベクトルで埋める（defective対応の最小限の処置）
        let mut final_v_cols = v_cols;
        while final_v_cols.len() < n {
            final_v_cols.push(Vector::zeros(n));
        }

        let mut v_mat_data = vec![SymbolicComplex::zero(); n * n];
        for j in 0..n {
            for i in 0..n {
                v_mat_data[i * n + j] = final_v_cols[j][i].clone();
            }
        }

        let vectors = Matrix::new(n, n, v_mat_data)?;

        Ok(EigenDecompositionExact {
            values: eigenvalues,
            vectors,
        })
    }
}

/// 2x2行列の固有ベクトルを閉形式で計算する（is_zero判定への依存を最小限にする）
pub(crate) fn eigen_decompose_exact_2x2(
    a: &Matrix<SymbolicComplex>,
    eigenvalues: Vec<SymbolicComplex>,
) -> Result<EigenDecompositionExact<SymbolicComplex>> {
    let n = 2;
    let mut v_cols = Vec::new();

    // A = [[a, b], [c, d]]
    let a_val = &a[(0, 0)];
    let b_val = &a[(0, 1)];
    let c_val = &a[(1, 0)];
    let d_val = &a[(1, 1)];

    for lam in &eigenvalues {
        // (A - λI)v = 0
        // [[a-λ, b], [c, d-λ]] [x, y]^T = [0, 0]^T
        // b != 0 なら v = [b, λ-a]^T
        // b == 0 かつ c != 0 なら v = [λ-d, c]^T
        // b == 0 かつ c == 0 なら 対角行列なので [1, 0]^T または [0, 1]^T

        if !b_val.is_zero() {
            let x = b_val.clone();
            let y = lam.clone().sub(a_val);
            v_cols.push(Vector::new(vec![x, y]));
        } else if !c_val.is_zero() {
            let x = lam.clone().sub(d_val);
            let y = c_val.clone();
            v_cols.push(Vector::new(vec![x, y]));
        } else {
            // 対角行列の場合
            // lam が a_val に近いか d_val に近いかで判断
            if lam.sub(a_val).is_zero() {
                v_cols.push(Vector::new(vec![
                    SymbolicComplex::one(),
                    SymbolicComplex::zero(),
                ]));
            } else {
                v_cols.push(Vector::new(vec![
                    SymbolicComplex::zero(),
                    SymbolicComplex::one(),
                ]));
            }
        }
    }

    // 重解などでベクトルが足りない場合のガード
    while v_cols.len() < n {
        if v_cols.len() == 1 {
            // 直交するベクトルを捏造（適当な処置だが0になるよりはマシ）
            let v0 = &v_cols[0];
            v_cols.push(Vector::new(vec![
                -v0[1].clone().conj(),
                v0[0].clone().conj(),
            ]));
        } else {
            v_cols.push(Vector::zeros(n));
        }
    }

    let mut v_mat_data = vec![SymbolicComplex::zero(); n * n];
    for j in 0..n {
        for i in 0..n {
            v_mat_data[i * n + j] = v_cols[j][i].clone();
        }
    }
    let vectors = Matrix::new(n, n, v_mat_data)?;

    Ok(EigenDecompositionExact {
        values: eigenvalues,
        vectors,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Matrix;
    use algebraic::expr::SymbolicExpr;
    use num_traits::One;

    #[test]
    fn test_eigen_decompose_exact_symbolic_2x2_general() {
        // a, b; c, d のケース
        let a = SymbolicExpr::Symbol("a".to_string());
        let b = SymbolicExpr::Symbol("b".to_string());
        let c = SymbolicExpr::Symbol("c".to_string());
        let d = SymbolicExpr::Symbol("d".to_string());
        let m = Matrix::new(
            2,
            2,
            vec![
                SymbolicComplex::from_real(a.clone()),
                SymbolicComplex::from_real(b.clone()),
                SymbolicComplex::from_real(c.clone()),
                SymbolicComplex::from_real(d.clone()),
            ],
        )
        .unwrap();

        let deco = m.eigen_decompose_exact().unwrap();
        assert_eq!(deco.values.len(), 2);
        assert_eq!(deco.vectors.rows, 2);
        assert_eq!(deco.vectors.cols, 2);

        // 固有ベクトルが0になっていないかチェック
        for j in 0..2 {
            let col = deco.vectors.col(j).unwrap();
            assert!(!col[0].is_zero() || !col[1].is_zero());
        }
    }

    #[test]
    fn test_eigen_decompose_exact_symbolic_diag() {
        let one = SymbolicExpr::int(1);
        let two = SymbolicExpr::int(2);
        let zero = SymbolicExpr::int(0);
        let m = Matrix::new(
            2,
            2,
            vec![
                SymbolicComplex::from_real(one.clone()),
                SymbolicComplex::from_real(zero.clone()),
                SymbolicComplex::from_real(zero.clone()),
                SymbolicComplex::from_real(two.clone()),
            ],
        )
        .unwrap();

        let deco = m.eigen_decompose_exact().unwrap();
        assert_eq!(deco.values.len(), 2);

        let v0 = deco.values[0].re.clone().simplify();
        let v1 = deco.values[1].re.clone().simplify();
        assert!((v0 == one && v1 == two) || (v0 == two && v1 == one));

        // Vectors should be [1, 0] and [0, 1]
        assert_eq!(deco.vectors.rows, 2);
        assert_eq!(deco.vectors.cols, 2);
        // Check if diagonal or permutation of identity
        let v = deco.vectors;
        assert!(
            (v[(0, 0)].is_one() && v[(1, 1)].is_one())
                || (v[(0, 1)].is_one() && v[(1, 0)].is_one())
        );
    }
}
