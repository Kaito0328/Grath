use crate::CodeWords;
use thiserror::Error;

pub fn elias_gamma_encode(n: u64) -> CodeWords {
    assert!(n >= 1, "gamma code defined for n>=1");
    let mut bits = Vec::new();
    let mut val = n;
    let mut bin = Vec::new();
    while val > 0 {
        bin.push((val & 1) as u8);
        val >>= 1;
    }
    bin.reverse();
    let len = bin.len();
    // unary for length-1 zeros, then the binary
    bits.extend(std::iter::repeat(0u8).take(len - 1));
    bits.extend_from_slice(&bin);
    bits
}

pub fn elias_gamma_decode(bits: &CodeWords, start: usize) -> Option<(u64, usize)> {
    let mut idx = start;
    let mut zeros = 0usize;
    while idx < bits.len() && bits[idx] == 0 {
        zeros += 1;
        idx += 1;
    }
    if idx >= bits.len() {
        return None;
    }
    // read zeros+1 bits including leading 1
    let mut val: u64 = 0;
    for _ in 0..(zeros + 1) {
        if idx >= bits.len() {
            return None;
        }
        val = (val << 1) | bits[idx] as u64;
        idx += 1;
    }
    Some((val, idx))
}

// ---------------- Self-contained Elias Gamma list container ----------------

#[derive(Debug, Error)]
pub enum EliasListBitstreamError {
    #[error("invalid magic")]
    InvalidMagic,
    #[error("unsupported version")]
    UnsupportedVersion,
    #[error("truncated bitstream")]
    Truncated,
    #[error("length mismatch")]
    LengthMismatch,
    #[error("decode error at element {0}")]
    ElementDecodeError(usize),
}

const ELS_MAGIC: &[u8; 3] = b"ELS"; // 0x45 0x4C 0x53
const ELS_VERSION: u8 = 0x01;

/// 整数列 (u64) を self-contained Elias gamma list 形式でシリアライズ。
/// 空ベクタは空バイト列を返す。
/// 形式:
/// [ 'E' 'L' 'S' version flags count:u32_be payload_bytes pad_bits:u8 ]
/// payload は各要素 (>=1) の gamma code を MSB-first で連結し 8bit チャンク化。末尾に未使用ビット数(0..7)。
pub fn encode_elias_list_to_bytes(vals: &[u64]) -> Result<Vec<u8>, EliasListBitstreamError> {
    if vals.is_empty() {
        return Ok(Vec::new());
    }
    let mut bits: CodeWords = Vec::new();
    for &v in vals {
        if v == 0 {
            return Err(EliasListBitstreamError::ElementDecodeError(bits.len()));
        }
        bits.extend(elias_gamma_encode(v));
    }
    // pack bits MSB-first
    let mut out: Vec<u8> = Vec::new();
    out.extend_from_slice(ELS_MAGIC);
    out.push(ELS_VERSION);
    out.push(0); // flags
    let count = vals.len() as u32;
    out.extend_from_slice(&count.to_be_bytes());
    let mut cur: u8 = 0;
    let mut filled: u8 = 0;
    let mut payload: Vec<u8> = Vec::new();
    for b in bits {
        cur = (cur << 1) | (b & 1);
        filled += 1;
        if filled == 8 {
            payload.push(cur);
            cur = 0;
            filled = 0;
        }
    }
    let pad = if filled == 0 {
        0
    } else {
        let p = 8 - filled;
        cur <<= p;
        payload.push(cur);
        p
    } as u8;
    out.extend_from_slice(&payload);
    out.push(pad);
    Ok(out)
}

/// Self-contained Elias gamma list 形式から u64 列を復元。
pub fn decode_elias_list_from_bytes(data: &[u8]) -> Result<Vec<u64>, EliasListBitstreamError> {
    if data.is_empty() {
        return Ok(Vec::new());
    }
    if data.len() < 3 + 1 + 1 + 4 + 1 {
        return Err(EliasListBitstreamError::Truncated);
    }
    if &data[0..3] != ELS_MAGIC {
        return Err(EliasListBitstreamError::InvalidMagic);
    }
    if data[3] != ELS_VERSION {
        return Err(EliasListBitstreamError::UnsupportedVersion);
    }
    let _flags = data[4];
    let count = u32::from_be_bytes([data[5], data[6], data[7], data[8]]) as usize;
    if data.len() < 3 + 1 + 1 + 4 + 1 {
        return Err(EliasListBitstreamError::Truncated);
    }
    if data.len() == 3 + 1 + 1 + 4 + 1 {
        return Err(EliasListBitstreamError::Truncated);
    }
    let pad = *data.last().unwrap();
    if pad > 7 {
        return Err(EliasListBitstreamError::LengthMismatch);
    }
    let payload = &data[3 + 1 + 1 + 4..data.len() - 1]; // from after header to before pad
                                                        // reconstruct bit vector
    let total_bits = payload.len() * 8 - (pad as usize);
    let mut bits: CodeWords = Vec::with_capacity(total_bits);
    for i in 0..total_bits {
        let byte = payload[i / 8];
        let bit = (byte >> (7 - (i % 8))) & 1;
        bits.push(bit);
    }
    // decode elements
    let mut out = Vec::with_capacity(count);
    let mut idx = 0usize;
    for i in 0..count {
        match elias_gamma_decode(&bits, idx) {
            Some((v, ni)) => {
                out.push(v);
                idx = ni;
            }
            None => return Err(EliasListBitstreamError::ElementDecodeError(i)),
        }
    }
    Ok(out)
}
