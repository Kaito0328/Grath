use crate::code_utils::{compute_syndrome_gf2, parity_check_from_generator};
use crate::error::{CodingError, Result};
use crate::{
    BCHCode, Codeword, CyclicCode, GeneratorMatrix, Hamming74, LinearCode, Message, ReedSolomon,
};

use common::prelude::{GrathCrateApi, GrathDto, GrathTypeApi};
use finite_field::field2m::FiniteField2m;
use finite_field::gfext::GFExt;
use finite_field::gfp::GFp;
use linalg::{Matrix, Vector};
use std::collections::BTreeMap;

pub struct CodingApi;

/// Regression fixture for the generated DTO boundary.  It is deliberately
/// small and uses only serde-native fields so the inspector can prove the
/// Rust → WASM → TypeScript path without a handwritten wasm DTO module.
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct DtoPoint {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(tag = "kind")]
pub enum DtoLabel {
    Origin,
    Named { name: String },
}

impl GrathDto for DtoPoint {}
impl GrathDto for DtoLabel {}

pub struct DtoFixtureApi;

impl GrathCrateApi for CodingApi {
    const CRATE_NAME: &'static str = "coding";
}

impl GrathTypeApi for DtoFixtureApi {
    type Target = DtoPoint;
    const TS_NAME: &'static str = "DtoPoint";
}

impl DtoFixtureApi {
    pub fn new(x: f64, y: f64) -> DtoPoint {
        DtoPoint { x, y }
    }

    pub fn translate(point: DtoPoint, dx: f64, dy: f64) -> DtoPoint {
        DtoPoint {
            x: point.x + dx,
            y: point.y + dy,
        }
    }

    pub fn batch(points: Vec<DtoPoint>) -> Vec<DtoPoint> {
        points
    }

    pub fn maybe(point: Option<DtoPoint>) -> Option<DtoPoint> {
        point
    }

    pub fn pair(value: (DtoPoint, i32)) -> (DtoPoint, i32) {
        value
    }

    pub fn fixed(values: [DtoPoint; 2]) -> [DtoPoint; 2] {
        values
    }

    pub fn by_name(values: BTreeMap<String, DtoPoint>) -> BTreeMap<String, DtoPoint> {
        values
    }

    pub fn label(value: DtoLabel) -> DtoLabel {
        value
    }

    pub fn nested(point: Option<DtoPoint>) -> Result<Option<Vec<DtoPoint>>> {
        Ok(point.map(|value| vec![value]))
    }

    pub fn checked(point: DtoPoint) -> Result<DtoPoint> {
        if point.x.is_finite() && point.y.is_finite() && point.x >= 0.0 && point.y >= 0.0 {
            Ok(point)
        } else {
            Err(CodingError::InvalidParameters {
                text: "point coordinates must be finite and non-negative".to_string(),
            })
        }
    }

    /// Kept unsupported on purpose: specs must expose this unregistered boundary
    /// with a remediation instead of silently omitting the API.
    pub fn unsupported_range(_range: std::ops::Range<i32>) -> DtoPoint {
        Self::new(0.0, 0.0)
    }
}

impl CodingApi {
    pub fn hamming74_encode(bits4: String) -> Result<String> {
        let parsed = parse_bits_text(&bits4, Some(4), "bits4")?;
        let msg = Message::<GFp<2>>(Vector::from(parsed));
        let code = Hamming74::default();
        let cw = code.encode(&msg)?;
        Ok(gf2_vector_to_csv(cw.as_ref().as_ref()))
    }

    pub fn hamming74_encode_len(bits4: String) -> Result<usize> {
        let bits4 = bits4.trim();
        if bits4.is_empty() {
            return Err(CodingError::InvalidArgument {
                text: "expected 4 bits (e.g. '1010' or '1,0,1,0')".to_string(),
            });
        }

        let bits_str = if bits4.contains(',') { bits4 } else { bits4 };

        let parsed: Vec<GFp<2>> = if bits_str.contains(',') {
            let parts: Vec<&str> = bits_str
                .split(',')
                .map(|x| x.trim())
                .filter(|x| !x.is_empty())
                .collect();
            if parts.len() != 4 {
                return Err(CodingError::InvalidArgument {
                    text: "expected 4 comma-separated bits (e.g. '1,0,1,0')".to_string(),
                });
            }
            parts
                .into_iter()
                .map(|p| match p {
                    "0" => Ok(GFp::<2>(0)),
                    "1" => Ok(GFp::<2>(1)),
                    _ => Err(CodingError::InvalidArgument {
                        text: "bits must be only 0 or 1".to_string(),
                    }),
                })
                .collect::<Result<Vec<_>>>()?
        } else {
            if bits_str.chars().count() != 4 {
                return Err(CodingError::InvalidArgument {
                    text: "expected 4 bits (e.g. '1010')".to_string(),
                });
            }

            let mut bits: Vec<GFp<2>> = Vec::with_capacity(4);
            for c in bits_str.chars() {
                match c {
                    '0' => bits.push(GFp::<2>(0)),
                    '1' => bits.push(GFp::<2>(1)),
                    _ => {
                        return Err(CodingError::InvalidArgument {
                            text: "bits must be only '0' or '1'".to_string(),
                        });
                    }
                }
            }
            bits
        };

        if parsed.len() != 4 {
            return Err(CodingError::InvalidArgument {
                text: "expected 4 bits".to_string(),
            });
        }

        let msg = Message::<GFp<2>>(Vector::from(parsed));
        let code = Hamming74::default();
        let cw = code.encode(&msg)?;
        Ok(cw.len())
    }

    /// A tiny reference example over GF(5):
    /// - Generator matrix (k=2, n=3):
    ///   [1 0 2]
    ///   [0 1 3]
    /// - Input message: "u0,u1" (two integers, mod 5)
    /// - Returns the 3rd symbol (index 2) of the resulting codeword (as decimal string).
    pub fn linear_code_gf5_third(u0: String, u1: String) -> Result<String> {
        let msg = Vector::from(vec![parse_gfp::<5>(&u0)?, parse_gfp::<5>(&u1)?]);

        let g: Matrix<GFp<5>> = Matrix::new(
            2,
            3,
            vec![
                GFp::<5>(1),
                GFp::<5>(0),
                GFp::<5>(2),
                GFp::<5>(0),
                GFp::<5>(1),
                GFp::<5>(3),
            ],
        )?;

        let code = LinearCode::<GFp<5>>::new(g);
        let cw = code.encode(&Message::<GFp<5>>(msg))?;
        Ok(cw[2].0.to_string())
    }

    pub fn reed_solomon_encode(
        k: usize,
        n: usize,
        msg: Vec<u8>,
        primitive_px: Vec<u8>,
    ) -> Result<Vec<u8>> {
        let rs = build_reed_solomon(k, n, &primitive_px)?;
        if msg.len() != k {
            return Err(CodingError::InvalidParameters {
                text: format!("message length {} must equal k {}", msg.len(), k),
            });
        }
        let payload = msg
            .into_iter()
            .map(|byte| GFExt::<GFp<2>>::from_u8(rs.field.px_arc(), byte))
            .collect::<Vec<_>>();
        let codeword = rs.encode(&Message::from(Vector::from(payload)))?;
        Ok(codeword
            .as_ref()
            .as_ref()
            .iter()
            .map(GFExt::<GFp<2>>::to_u8)
            .collect())
    }

    pub fn reed_solomon_decode_bm(
        k: usize,
        n: usize,
        recv: Vec<u8>,
        primitive_px: Vec<u8>,
    ) -> Result<Vec<u8>> {
        let rs = build_reed_solomon(k, n, &primitive_px)?;
        if recv.len() != n {
            return Err(CodingError::InvalidParameters {
                text: format!("received length {} must equal n {}", recv.len(), n),
            });
        }
        let received = recv
            .into_iter()
            .map(|byte| GFExt::<GFp<2>>::from_u8(rs.field.px_arc(), byte))
            .collect::<Vec<_>>();
        let decoded = rs.decode_bm(&Codeword::from(Vector::from(received)))?;
        Ok(decoded
            .decoded
            .as_ref()
            .as_ref()
            .iter()
            .map(GFExt::<GFp<2>>::to_u8)
            .collect())
    }

    pub fn bch_new_auto_json(m: usize, t: usize) -> Result<String> {
        let code = BCHCode::new_auto(m, t);
        Ok(format!(
            r#"{{"n":{},"k":{},"t":{}}}"#,
            code.n,
            code.k(),
            code.t
        ))
    }

    pub fn bch_encode_auto(m: usize, t: usize, msg_bits: Vec<u8>) -> Result<Vec<u8>> {
        let code = BCHCode::new_auto(m, t);
        let msg = Message::from(Vector::from(parse_bit_bytes(
            &msg_bits,
            Some(code.k()),
            "msg_bits",
        )?));
        let encoded = code.encode(&msg)?;
        Ok(gf2_vector_to_bytes(encoded.as_ref().as_ref()))
    }

    pub fn bch_decode_bm(m: usize, t: usize, recv_bits: Vec<u8>) -> Result<Vec<u8>> {
        let code = BCHCode::new_auto(m, t);
        let recv = Codeword::from(Vector::from(parse_bit_bytes(
            &recv_bits,
            Some(code.n),
            "recv_bits",
        )?));
        let corrected = code.decode_bm(&recv, 1)?;
        Ok(gf2_vector_to_bytes(corrected.as_ref().as_ref()))
    }

    pub fn bch_new_json(n: usize, g_bits: Vec<u8>) -> Result<String> {
        let code = build_binary_cyclic_code(n, &g_bits)?;
        let k = code.k();
        let t = (n.saturating_sub(k)) / 2;
        Ok(format!(r#"{{"n":{},"k":{},"t":{}}}"#, n, k, t))
    }

    pub fn bch_encode(n: usize, g_bits: Vec<u8>, msg_bits: Vec<u8>) -> Result<Vec<u8>> {
        let code = build_binary_cyclic_code(n, &g_bits)?;
        let msg = Message::from(Vector::from(parse_bit_bytes(
            &msg_bits,
            Some(code.k()),
            "msg_bits",
        )?));
        let encoded = code.encode(&msg)?;
        Ok(gf2_vector_to_bytes(encoded.as_ref().as_ref()))
    }

    pub fn bch_decode_bm_with_g(n: usize, g_bits: Vec<u8>, recv_bits: Vec<u8>) -> Result<Vec<u8>> {
        let code = build_binary_cyclic_code(n, &g_bits)?;
        let recv = Codeword::from(Vector::from(parse_bit_bytes(
            &recv_bits,
            Some(n),
            "recv_bits",
        )?));
        let corrected = code.decode_lut(&recv)?;
        Ok(gf2_vector_to_bytes(corrected.as_ref().as_ref()))
    }

    pub fn cyclic_new_json(n: usize, g_bits: Vec<u8>) -> Result<String> {
        let code = build_binary_cyclic_code(n, &g_bits)?;
        Ok(format!(r#"{{"n":{},"k":{}}}"#, n, code.k()))
    }

    pub fn cyclic_encode(n: usize, g_bits: Vec<u8>, msg_bits: Vec<u8>) -> Result<Vec<u8>> {
        let code = build_binary_cyclic_code(n, &g_bits)?;
        let msg = Message::from(Vector::from(parse_bit_bytes(
            &msg_bits,
            Some(code.k()),
            "msg_bits",
        )?));
        let encoded = code.encode(&msg)?;
        Ok(gf2_vector_to_bytes(encoded.as_ref().as_ref()))
    }

    pub fn cyclic_decode_lut(n: usize, g_bits: Vec<u8>, recv_bits: Vec<u8>) -> Result<Vec<u8>> {
        let code = build_binary_cyclic_code(n, &g_bits)?;
        let recv = Codeword::from(Vector::from(parse_bit_bytes(
            &recv_bits,
            Some(n),
            "recv_bits",
        )?));
        let corrected = code.decode_lut(&recv)?;
        Ok(gf2_vector_to_bytes(corrected.as_ref().as_ref()))
    }

    pub fn gf2_cyclic_generator_matrix(n: usize, g_bits: Vec<u8>) -> Result<String> {
        let code = build_binary_cyclic_code(n, &g_bits)?;
        let generator = build_cyclic_generator_matrix(&code)?;
        Ok(matrix_to_csv(&generator.0))
    }

    pub fn gf2_cyclic_parity_check_matrix(n: usize, g_bits: Vec<u8>) -> Result<String> {
        let code = build_binary_cyclic_code(n, &g_bits)?;
        let generator = build_cyclic_generator_matrix(&code)?;
        let parity = parity_check_from_generator(&generator)?;
        Ok(matrix_to_csv(&parity.0))
    }

    pub fn gf2_parity_check_from_generator_matrix(g_csv: String) -> Result<String> {
        let generator = GeneratorMatrix(parse_matrix_csv(&g_csv)?);
        let parity = parity_check_from_generator(&generator)?;
        Ok(matrix_to_csv(&parity.0))
    }

    pub fn gf2_syndrome(h_csv: String, r_bits: String) -> Result<String> {
        let parity = crate::ParityCheckMatrix(parse_matrix_csv(&h_csv)?);
        let recv = Codeword::from(Vector::from(parse_bits_text(
            &r_bits,
            Some(parity.0.cols),
            "r_bits",
        )?));
        let syndrome = compute_syndrome_gf2(&parity, &recv);
        Ok(gf2_vector_to_csv(syndrome.as_ref().as_ref()))
    }
}

fn parse_gfp<const P: u16>(s: &str) -> Result<GFp<P>> {
    let s = s.trim();
    let v = s.parse::<i64>().map_err(|e| CodingError::InvalidArgument {
        text: format!("invalid integer '{s}': {e}"),
    })?;
    Ok(GFp::<P>::new(v))
}

fn parse_bits_text(input: &str, expected_len: Option<usize>, name: &str) -> Result<Vec<GFp<2>>> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Err(CodingError::InvalidArgument {
            text: format!("{name} must not be empty"),
        });
    }

    let raw_bits: Vec<u8> = if trimmed.contains(',') {
        trimmed
            .split(',')
            .map(|part| part.trim())
            .filter(|part| !part.is_empty())
            .map(parse_bit_token)
            .collect::<Result<Vec<_>>>()?
    } else {
        trimmed
            .chars()
            .map(|ch| parse_bit_char(ch, name))
            .collect::<Result<Vec<_>>>()?
    };

    parse_bit_bytes(&raw_bits, expected_len, name)
}

fn parse_bit_bytes(bits: &[u8], expected_len: Option<usize>, name: &str) -> Result<Vec<GFp<2>>> {
    if let Some(expected) = expected_len {
        if bits.len() != expected {
            return Err(CodingError::InvalidParameters {
                text: format!("{name} length {} must equal {}", bits.len(), expected),
            });
        }
    }

    bits.iter()
        .copied()
        .map(|bit| match bit {
            0 => Ok(GFp::<2>(0)),
            1 => Ok(GFp::<2>(1)),
            _ => Err(CodingError::InvalidArgument {
                text: format!("{name} must contain only 0 or 1"),
            }),
        })
        .collect()
}

fn parse_bit_token(token: &str) -> Result<u8> {
    match token {
        "0" => Ok(0),
        "1" => Ok(1),
        _ => Err(CodingError::InvalidArgument {
            text: format!("invalid bit token '{token}'"),
        }),
    }
}

fn parse_bit_char(ch: char, name: &str) -> Result<u8> {
    match ch {
        '0' => Ok(0),
        '1' => Ok(1),
        _ => Err(CodingError::InvalidArgument {
            text: format!("{name} must contain only 0 or 1"),
        }),
    }
}

fn parse_binary_poly(bits: &[u8], name: &str) -> Result<Vec<GFp<2>>> {
    if bits.is_empty() {
        return Err(CodingError::InvalidArgument {
            text: format!("{name} must not be empty"),
        });
    }
    let poly = parse_bit_bytes(bits, None, name)?;
    if poly.first().is_some_and(|bit| bit.0 == 0) || poly.last().is_some_and(|bit| bit.0 == 0) {
        return Err(CodingError::InvalidArgument {
            text: format!("{name} must have constant term 1 and leading coefficient 1"),
        });
    }
    Ok(poly)
}

fn build_reed_solomon(k: usize, n: usize, primitive_px: &[u8]) -> Result<ReedSolomon> {
    if primitive_px.is_empty() {
        return ReedSolomon::new_auto(k, n);
    }
    let field = FiniteField2m::new(&parse_binary_poly(primitive_px, "primitive_px")?);
    ReedSolomon::new_with_field(k, n, &field)
}

fn build_binary_cyclic_code(n: usize, g_bits: &[u8]) -> Result<CyclicCode<GFp<2>>> {
    if n == 0 {
        return Err(CodingError::InvalidParameters {
            text: "n must be > 0".to_string(),
        });
    }
    let g = parse_binary_poly(g_bits, "g_bits")?;
    if g.len() > n + 1 {
        return Err(CodingError::InvalidParameters {
            text: format!("g_bits degree {} must be < n {}", g.len() - 1, n),
        });
    }
    Ok(CyclicCode::new(n, g))
}

fn build_cyclic_generator_matrix(code: &CyclicCode<GFp<2>>) -> Result<GeneratorMatrix<GFp<2>>> {
    let k = code.k();
    let n = code.n;
    let mut matrix = Matrix::new(k, n, vec![GFp::<2>(0); k * n]).map_err(|e| {
        CodingError::InvalidParameters {
            text: format!("matrix new failed: {e}"),
        }
    })?;

    for row in 0..k {
        for (col_offset, coef) in code.g.iter().enumerate() {
            if *coef != GFp::<2>(0) {
                let col = (row + col_offset) % n;
                matrix[(row, col)] = matrix[(row, col)] + GFp::<2>(1);
            }
        }
    }

    Ok(GeneratorMatrix(matrix))
}

fn parse_matrix_csv(input: &str) -> Result<Matrix<GFp<2>>> {
    let rows = input
        .split(|ch| ch == ';' || ch == '\n' || ch == '\r')
        .map(str::trim)
        .filter(|row| !row.is_empty())
        .collect::<Vec<_>>();

    if rows.is_empty() {
        return Err(CodingError::InvalidArgument {
            text: "matrix must not be empty".to_string(),
        });
    }

    let parsed_rows = rows
        .iter()
        .map(|row| {
            row.split(|ch: char| ch == ',' || ch.is_ascii_whitespace())
                .map(str::trim)
                .filter(|entry| !entry.is_empty())
                .map(parse_bit_token)
                .collect::<Result<Vec<_>>>()
        })
        .collect::<Result<Vec<_>>>()?;

    let cols = parsed_rows[0].len();
    if cols == 0 {
        return Err(CodingError::InvalidArgument {
            text: "matrix must have at least one column".to_string(),
        });
    }
    if parsed_rows.iter().any(|row| row.len() != cols) {
        return Err(CodingError::InvalidArgument {
            text: "matrix rows must have the same number of columns".to_string(),
        });
    }

    let data = parsed_rows
        .into_iter()
        .flatten()
        .map(|bit| GFp::<2>(bit as u16))
        .collect::<Vec<_>>();
    Matrix::new(rows.len(), cols, data).map_err(|e| CodingError::InvalidArgument {
        text: format!("invalid matrix: {e}"),
    })
}

fn matrix_to_csv(matrix: &Matrix<GFp<2>>) -> String {
    let mut rows = Vec::with_capacity(matrix.rows);
    for row in 0..matrix.rows {
        let entries = (0..matrix.cols)
            .map(|col| matrix[(row, col)].0.to_string())
            .collect::<Vec<_>>();
        rows.push(entries.join(","));
    }
    rows.join(";")
}

fn gf2_vector_to_csv(bits: &[GFp<2>]) -> String {
    bits.iter()
        .map(|bit| bit.0.to_string())
        .collect::<Vec<_>>()
        .join(",")
}

fn gf2_vector_to_bytes(bits: &[GFp<2>]) -> Vec<u8> {
    bits.iter().map(|bit| bit.0 as u8).collect()
}
