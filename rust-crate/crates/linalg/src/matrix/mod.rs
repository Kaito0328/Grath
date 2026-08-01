use crate::{LinalgError, Result, Scalar};
use std::fmt;
use std::str::FromStr;

#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct Matrix<T> {
    pub rows: usize,
    pub cols: usize,
    pub data: Vec<T>,
}

#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum Direction {
    Left,
    Right,
}

// サブモジュールを宣言
pub mod algebra;
mod core;
pub mod numerical;
mod ops;

// パブリックな再エクスポート
pub use ops::DisplayElement;

impl<T> FromStr for Matrix<T>
where
    T: Scalar + FromStr,
    <T as FromStr>::Err: fmt::Display,
{
    type Err = LinalgError;

    fn from_str(s: &str) -> Result<Self> {
        let s = s.trim();
        if s.is_empty() {
            return Err(LinalgError::InvalidArgument {
                text: "matrix string is empty".to_string(),
            });
        }

        let rows: Vec<&str> = s
            .split(';')
            .map(|row| row.trim())
            .filter(|row| !row.is_empty())
            .collect();
        if rows.is_empty() {
            return Err(LinalgError::InvalidArgument {
                text: "matrix has no rows".to_string(),
            });
        }

        let mut data = Vec::new();
        let mut cols: Option<usize> = None;

        for (row_idx, row) in rows.iter().enumerate() {
            let cells: Vec<&str> = row
                .split(',')
                .map(|cell| cell.trim())
                .filter(|cell| !cell.is_empty())
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
                let value = cell
                    .parse::<T>()
                    .map_err(|e| LinalgError::InvalidArgument {
                        text: format!("parse error at ({}, {}): {}", row_idx, col_idx, e),
                    })?;
                data.push(value);
            }
        }

        Matrix::new(rows.len(), cols.unwrap_or(0), data)
    }
}
