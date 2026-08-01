use crate::matrix::algebra::eigen::ExactEigenvalues;
use crate::matrix::numerical::{EigenDecomposition, QrDecomposition, SvdDeComposition};
use crate::{LinalgError, Matrix, Vector};

use algebraic::complex::SymbolicComplex;
use algebraic::expr::SymbolicExpr;
use algebraic::prelude::Rational;
use common::prelude::{GrathCrateApi, GrathDto, GrathTypeApi};

/// Compatibility crate-level API for the current string-boundary Web UI.
///
/// New WASM-facing APIs should prefer typed marker APIs such as
/// [`RationalMatrixApi`] so the inspector can generate type-aware wrappers and
/// tests. Keep this facade available while existing screens and generated SDK
/// callers still depend on string inputs/outputs.
pub struct LinalgApi;
pub struct RationalMatrixApi;
pub struct RationalMatrixDtoApi;

/// Stable, structured representation of a rational number at the SDK
/// boundary.  It deliberately does not expose `Rational`'s implementation
/// details such as its lazy-normalization flag.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct RationalValue {
    pub numer: i64,
    pub denom: u64,
}

/// A matrix DTO keeps its row shape for forms, tables, and charts.  The Rust
/// matrix continues to use its compact flat storage internally.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct RationalMatrixValue {
    pub values: Vec<Vec<RationalValue>>,
}

impl GrathDto for RationalValue {}
impl GrathDto for RationalMatrixValue {}

impl GrathCrateApi for LinalgApi {
    const CRATE_NAME: &'static str = "linalg";
}

impl GrathTypeApi for RationalMatrixApi {
    type Target = Matrix<Rational>;
    const TS_NAME: &'static str = "RationalMatrix";
}

impl GrathTypeApi for RationalMatrixDtoApi {
    type Target = RationalMatrixValue;
    const TS_NAME: &'static str = "RationalMatrixDto";
}

impl RationalValue {
    fn into_rational(self) -> std::result::Result<Rational, LinalgError> {
        let denom = i64::try_from(self.denom).map_err(|_| LinalgError::InvalidArgument {
            text: "rational denominator exceeds the supported i64 range".to_string(),
        })?;
        Rational::try_new(self.numer, denom).map_err(|error| LinalgError::InvalidArgument {
            text: format!("invalid rational DTO: {error}"),
        })
    }

    fn from_rational(value: Rational) -> Self {
        Self {
            numer: value.numer(),
            denom: value.denom(),
        }
    }
}

impl RationalMatrixValue {
    fn into_matrix(self) -> std::result::Result<Matrix<Rational>, LinalgError> {
        let rows = self.values.len();
        let cols = self.values.first().map_or(0, Vec::len);
        if self.values.iter().any(|row| row.len() != cols) {
            return Err(LinalgError::InvalidArgument {
                text: "matrix DTO rows must all have the same length".to_string(),
            });
        }
        let data = self
            .values
            .into_iter()
            .flatten()
            .map(RationalValue::into_rational)
            .collect::<std::result::Result<Vec<_>, _>>()?;
        Matrix::new(rows, cols, data)
    }

    fn from_matrix(value: Matrix<Rational>) -> Self {
        let values = (0..value.rows)
            .map(|row| {
                (0..value.cols)
                    .map(|col| RationalValue::from_rational(value[(row, col)].clone()))
                    .collect()
            })
            .collect();
        Self { values }
    }
}

/// DTO-first matrix API for new UI.  The existing `RationalMatrixApi` and
/// `LinalgApi::*_rational(String)` functions remain compatible text APIs.
impl RationalMatrixDtoApi {
    pub fn zeros(rows: usize, cols: usize) -> RationalMatrixValue {
        RationalMatrixValue::from_matrix(Matrix::zeros(rows, cols))
    }

    pub fn rows(value: RationalMatrixValue) -> usize {
        value.values.len()
    }

    pub fn inverse(
        value: RationalMatrixValue,
    ) -> std::result::Result<RationalMatrixValue, LinalgError> {
        let matrix = value.into_matrix()?;
        let result = matrix.inverse_exact()?.ok_or(LinalgError::SingularMatrix)?;
        Ok(RationalMatrixValue::from_matrix(result))
    }

    pub fn add(
        value: RationalMatrixValue,
        b: RationalMatrixValue,
    ) -> std::result::Result<RationalMatrixValue, LinalgError> {
        let result = value.into_matrix()?.checked_add(&b.into_matrix()?)?;
        Ok(RationalMatrixValue::from_matrix(result))
    }

    pub fn mul(
        value: RationalMatrixValue,
        b: RationalMatrixValue,
    ) -> std::result::Result<RationalMatrixValue, LinalgError> {
        let result = value.into_matrix()?.checked_mul(&b.into_matrix()?)?;
        Ok(RationalMatrixValue::from_matrix(result))
    }

    pub fn transpose(
        value: RationalMatrixValue,
    ) -> std::result::Result<RationalMatrixValue, LinalgError> {
        Ok(RationalMatrixValue::from_matrix(
            value.into_matrix()?.transpose(),
        ))
    }
}

impl RationalMatrixApi {
    /// Construct a zero-filled rational matrix.  `usize` values intentionally
    /// cross the generated WASM boundary as native JavaScript numbers.
    pub fn zeros(rows: usize, cols: usize) -> Matrix<Rational> {
        Matrix::zeros(rows, cols)
    }

    /// Return the matrix row count as a native JavaScript number.
    pub fn rows(a: Matrix<Rational>) -> usize {
        a.rows
    }

    /// Return a dependency-crate value through the generated string boundary.
    pub fn first(a: Matrix<Rational>) -> Rational {
        a[(0, 0)].clone()
    }

    pub fn inverse(a: Matrix<Rational>) -> std::result::Result<Matrix<Rational>, LinalgError> {
        a.inverse_exact()?.ok_or(LinalgError::SingularMatrix)
    }

    pub fn add(
        a: Matrix<Rational>,
        b: Matrix<Rational>,
    ) -> std::result::Result<Matrix<Rational>, LinalgError> {
        a.checked_add(&b)
    }

    pub fn mul(
        a: Matrix<Rational>,
        b: Matrix<Rational>,
    ) -> std::result::Result<Matrix<Rational>, LinalgError> {
        a.checked_mul(&b)
    }

    pub fn transpose(a: Matrix<Rational>) -> Matrix<Rational> {
        a.transpose()
    }
}

impl LinalgApi {
    pub fn add_numeric(a: String, b: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<f64>(&a)?;
        let b = parse_matrix::<f64>(&b)?;
        let c = a.checked_add(&b)?;
        Ok(format_matrix(&c))
    }

    pub fn add_rational(a: String, b: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<Rational>(&a)?;
        let b = parse_matrix::<Rational>(&b)?;
        let c = a.checked_add(&b)?;
        Ok(format_matrix(&c))
    }

    pub fn add_symbolic(a: String, b: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<SymbolicExpr>(&a)?;
        let b = parse_matrix::<SymbolicExpr>(&b)?;
        let c = a.checked_add(&b)?;
        Ok(format_matrix(&c))
    }

    pub fn mul_numeric(a: String, b: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<f64>(&a)?;
        let b = parse_matrix::<f64>(&b)?;
        let c = a.checked_mul(&b)?;
        Ok(format_matrix(&c))
    }

    pub fn mul_rational(a: String, b: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<Rational>(&a)?;
        let b = parse_matrix::<Rational>(&b)?;
        let c = a.checked_mul(&b)?;
        Ok(format_matrix(&c))
    }

    pub fn mul_symbolic(a: String, b: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<SymbolicExpr>(&a)?;
        let b = parse_matrix::<SymbolicExpr>(&b)?;
        let c = a.checked_mul(&b)?;
        Ok(format_matrix(&c))
    }

    pub fn inv_numeric(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<f64>(&a)?;
        let inv = a.inverse().ok_or(LinalgError::SingularMatrix)?;
        Ok(format_matrix(&inv))
    }

    pub fn inverse_exact_rational(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<Rational>(&a)?;
        let inv = a.inverse_exact()?.ok_or(LinalgError::SingularMatrix)?;
        Ok(format_matrix(&inv))
    }

    pub fn inverse_exact_symbolic(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<SymbolicExpr>(&a)?;
        let inv = a.inverse_exact()?.ok_or(LinalgError::SingularMatrix)?;
        Ok(format_matrix(&inv))
    }

    // UI-friendly aliases
    pub fn inv_rational(a: String) -> std::result::Result<String, LinalgError> {
        Self::inverse_exact_rational(a)
    }

    pub fn inv_symbolic(a: String) -> std::result::Result<String, LinalgError> {
        Self::inverse_exact_symbolic(a)
    }

    pub fn lu_numeric(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<f64>(&a)?;
        let lu = a.lu_decompose_basic()?;
        Ok(format!("{}|{}", format_matrix(&lu.l), format_matrix(&lu.u)))
    }

    pub fn lu_exact_rational(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<Rational>(&a)?;
        let lu = a.lu_exact()?;
        Ok(format!("{}|{}", format_matrix(&lu.l), format_matrix(&lu.u)))
    }

    pub fn lu_exact_symbolic(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<SymbolicExpr>(&a)?;
        let lu = a.lu_exact()?;
        Ok(format!("{}|{}", format_matrix(&lu.l), format_matrix(&lu.u)))
    }

    // UI-friendly aliases
    pub fn lu_rational(a: String) -> std::result::Result<String, LinalgError> {
        Self::lu_exact_rational(a)
    }

    pub fn lu_symbolic(a: String) -> std::result::Result<String, LinalgError> {
        Self::lu_exact_symbolic(a)
    }

    pub fn qr_numeric(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<f64>(&a)?;
        let qr = a.qr_decomposition()?;
        Ok(format!("{}|{}", format_matrix(&qr.q), format_matrix(&qr.r)))
    }

    pub fn qr_rational(_a: String) -> std::result::Result<String, LinalgError> {
        Err(LinalgError::NotImplemented)
    }

    pub fn qr_symbolic(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<SymbolicExpr>(&a)?;
        let qr = a.qr_exact()?;
        Ok(format!("{}|{}", format_matrix(&qr.q), format_matrix(&qr.r)))
    }

    pub fn svd_numeric(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<f64>(&a)?;
        let svd = a.svd()?;

        let mut s = Matrix::zeros(a.rows, a.cols);
        let d = a.rows.min(a.cols).min(svd.sigma.dim());
        for i in 0..d {
            s[(i, i)] = svd.sigma[i];
        }

        Ok(format!(
            "{}|{}|{}",
            format_matrix(&svd.u),
            format_matrix(&s),
            format_matrix(&svd.v)
        ))
    }

    pub fn svd_rational(_a: String) -> std::result::Result<String, LinalgError> {
        Err(LinalgError::NotImplemented)
    }

    pub fn svd_symbolic(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<SymbolicExpr>(&a)?;
        let a_c = a.map(|x| SymbolicComplex::from_real(x.clone()));
        let svd = a_c.svd_exact()?;
        Ok(format!(
            "{}|{}|{}",
            format_matrix(&svd.u),
            format_matrix(&svd.s),
            format_matrix(&svd.v)
        ))
    }

    pub fn eigenvalues_numeric(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<f64>(&a)?;
        let eig = a.eigen_decomposition()?;
        let vals = eig
            .eigen_values
            .into_iter()
            .map(|v| v.to_string())
            .collect::<Vec<_>>()
            .join(",");
        let vecs = format_matrix(&eig.eigen_vectors);
        Ok(format!("{}|{}", vals, vecs))
    }

    pub fn eigenvalues_rational(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<Rational>(&a)?;
        let values = a.eigenvalues_exact()?;
        Ok(values
            .into_iter()
            .map(|v| v.to_string())
            .collect::<Vec<_>>()
            .join(","))
    }

    pub fn eigenvalues_symbolic(_a: String) -> std::result::Result<String, LinalgError> {
        Err(LinalgError::NotImplemented)
    }

    pub fn mul_vector_numeric(
        a_csv: String,
        v_csv: String,
    ) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<f64>(&a_csv)?;
        let v = parse_vector::<f64>(&v_csv)?;
        let out = a.checked_mul_vector(&v)?;
        Ok(format_vector(&out))
    }

    pub fn mul_vector_rational(
        a_csv: String,
        v_csv: String,
    ) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<Rational>(&a_csv)?;
        let v = parse_vector::<Rational>(&v_csv)?;
        let out = a.checked_mul_vector(&v)?;
        Ok(format_vector(&out))
    }

    pub fn mul_vector_symbolic(
        a_csv: String,
        v_csv: String,
    ) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<SymbolicExpr>(&a_csv)?;
        let v = parse_vector::<SymbolicExpr>(&v_csv)?;
        let out = a.checked_mul_vector(&v)?;
        Ok(format_vector(&out))
    }

    pub fn solve_vector_numeric(
        a_csv: String,
        b_csv: String,
    ) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<f64>(&a_csv)?;
        let b = parse_vector::<f64>(&b_csv)?;
        let x = a.solve_generic(&b)?;
        Ok(format_vector(&x))
    }

    pub fn solve_vector_rational(
        a_csv: String,
        b_csv: String,
    ) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<Rational>(&a_csv)?;
        let b = parse_vector::<Rational>(&b_csv)?;
        let x = a.solve_generic(&b)?;
        Ok(format_vector(&x))
    }

    pub fn solve_vector_symbolic(
        a_csv: String,
        b_csv: String,
    ) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<SymbolicExpr>(&a_csv)?;
        let b = parse_vector::<SymbolicExpr>(&b_csv)?;
        let x = a.solve_generic(&b)?;
        Ok(format_vector(&x))
    }

    pub fn mul_symbolic_complex(a: String, b: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<SymbolicComplex>(&a)?;
        let b = parse_matrix::<SymbolicComplex>(&b)?;
        let c = a.checked_mul(&b)?;
        Ok(format_matrix(&c))
    }

    pub fn conj_transpose_symbolic(a: String) -> std::result::Result<String, LinalgError> {
        let a = parse_matrix::<SymbolicComplex>(&a)?;
        Ok(format_matrix(&a.conjugate_transpose()))
    }
}

fn parse_matrix<T>(s: &str) -> std::result::Result<Matrix<T>, LinalgError>
where
    T: crate::Scalar + std::str::FromStr,
    <T as std::str::FromStr>::Err: std::fmt::Display,
{
    let s = s.trim();
    if s.is_empty() {
        return Err(LinalgError::InvalidArgument {
            text: "matrix string is empty".to_string(),
        });
    }

    let rows: Vec<&str> = s
        .split(';')
        .map(|r| r.trim())
        .filter(|r| !r.is_empty())
        .collect();
    if rows.is_empty() {
        return Err(LinalgError::InvalidArgument {
            text: "matrix has no rows".to_string(),
        });
    }

    let mut data: Vec<T> = Vec::new();
    let mut cols: Option<usize> = None;

    for (row_idx, row) in rows.iter().enumerate() {
        let cells: Vec<&str> = row
            .split(',')
            .map(|c| c.trim())
            .filter(|c| !c.is_empty())
            .collect();
        if cells.is_empty() {
            return Err(LinalgError::InvalidArgument {
                text: format!("row {} is empty", row_idx),
            });
        }

        match cols {
            None => cols = Some(cells.len()),
            Some(expected) if expected != cells.len() => {
                return Err(LinalgError::InvalidArgument {
                    text: format!(
                        "row {} has {} cols, expected {}",
                        row_idx,
                        cells.len(),
                        expected
                    ),
                });
            }
            _ => {}
        }

        for (col_idx, cell) in cells.iter().enumerate() {
            let v = cell
                .parse::<T>()
                .map_err(|e| LinalgError::InvalidArgument {
                    text: format!("parse error at ({}, {}): {}", row_idx, col_idx, e),
                })?;
            data.push(v);
        }
    }

    let cols = cols.unwrap_or(0);
    Matrix::new(rows.len(), cols, data)
}

fn parse_vector<T>(s: &str) -> std::result::Result<Vector<T>, LinalgError>
where
    T: crate::Scalar + std::str::FromStr,
    <T as std::str::FromStr>::Err: std::fmt::Display,
{
    let s = s.trim();
    if s.is_empty() {
        return Err(LinalgError::InvalidArgument {
            text: "vector string is empty".to_string(),
        });
    }

    let values: std::result::Result<Vec<T>, LinalgError> = s
        .split([';', ','])
        .map(|c| c.trim())
        .filter(|c| !c.is_empty())
        .map(|cell| {
            cell.parse::<T>().map_err(|e| LinalgError::InvalidArgument {
                text: format!("vector parse error: {}", e),
            })
        })
        .collect();

    let values = values?;
    if values.is_empty() {
        return Err(LinalgError::InvalidArgument {
            text: "vector has no values".to_string(),
        });
    }

    Ok(Vector::new(values))
}

fn format_matrix<T>(m: &Matrix<T>) -> String
where
    T: crate::Scalar + std::fmt::Display,
{
    let mut rows: Vec<String> = Vec::with_capacity(m.rows);
    for r in 0..m.rows {
        let mut cols: Vec<String> = Vec::with_capacity(m.cols);
        for c in 0..m.cols {
            cols.push(m[(r, c)].to_string());
        }
        rows.push(cols.join(","));
    }
    rows.join(";")
}

fn format_vector<T>(v: &Vector<T>) -> String
where
    T: crate::Scalar + std::fmt::Display,
{
    v.data
        .iter()
        .map(|x| x.to_string())
        .collect::<Vec<_>>()
        .join(";")
}
