use std::collections::HashMap;

use crate::{Alphabet, CodeWords, Symbol, SymbolPr, Symbols};
use thiserror::Error;

#[derive(Debug, Clone)]
pub struct JonesCode {
    pub alphabet: Alphabet,
    pub cum: HashMap<Symbol, (u64, u64)>, // cumulative integer range [l, r)
    pub total: u64,
}

impl JonesCode {
    // Build integerized cumulative ranges using denominator `total` (power of two suggested); ensure non-zero widths and total coverage.
    pub fn from_symbol_pr(pr: &SymbolPr, total: u64) -> Self {
        let mut raw: Vec<(Symbol, u64)> = Vec::new();
        let mut sum_w = 0u64;
        for &s in &pr.alphabet {
            let p = pr.s_to_prs.get(&s).cloned().unwrap_or(0.0).max(0.0);
            let mut w = (p * total as f64).round() as u64;
            if w == 0 {
                w = 1;
            }
            raw.push((s, w));
            sum_w += w;
        }
        // Adjust if overflow or deficit
        if sum_w > total {
            // reduce largest weights (cyclic)
            let mut i = 0;
            while sum_w > total {
                if raw[i].1 > 1 {
                    raw[i].1 -= 1;
                    sum_w -= 1;
                }
                i = (i + 1) % raw.len();
            }
        } else if sum_w < total {
            let mut i = 0;
            while sum_w < total {
                raw[i].1 += 1;
                sum_w += 1;
                i = (i + 1) % raw.len();
            }
        }
        let mut cum = HashMap::new();
        let mut acc = 0u64;
        for (s, w) in &raw {
            let l = acc;
            let r = l + *w;
            cum.insert(*s, (l, r));
            acc = r;
        }
        Self {
            alphabet: pr.alphabet.clone(),
            cum,
            total,
        }
    }

    /// High-precision (64-bit) arithmetic-style integer interval coding.
    /// Always returns exactly 64 bits as codeword.
    pub fn encode(&self, symbols: &Symbols) -> CodeWords {
        const PREC_BITS: u32 = 64;
        let full_high: u128 = (1u128 << PREC_BITS) - 1;
        let mut low: u128 = 0;
        let mut high: u128 = full_high;
        let total_u128 = self.total as u128;
        for &s in symbols {
            let (ls, rs) = self.cum.get(&s).copied().unwrap_or((0, 1));
            let range = high - low + 1; // inclusive range
            let ls_u = ls as u128;
            let rs_u = rs as u128;
            let new_low = low + (range * ls_u) / total_u128;
            let new_high = low + (range * rs_u) / total_u128 - 1;
            low = new_low;
            high = new_high;
        }
        let mid = (low + high) / 2; // representative code value
                                    // output 64 bits MSB-first
        let mut bits = Vec::with_capacity(PREC_BITS as usize);
        for i in (0..PREC_BITS).rev() {
            bits.push(((mid >> i) & 1) as u8);
        }
        bits
    }

    pub fn decode(&self, length: usize, bits: &CodeWords) -> Symbols {
        if length == 0 {
            return Vec::new();
        }
        const PREC_BITS: u32 = 64;
        let mut code: u128 = 0;
        for &b in bits {
            code = (code << 1) | (b as u128);
        }
        // If fewer than 64 bits provided, left shift into 64-bit space
        if bits.len() < PREC_BITS as usize {
            code <<= (PREC_BITS as usize - bits.len()) as u32;
        }
        let mut low: u128 = 0;
        let mut high: u128 = (1u128 << PREC_BITS) - 1;
        let total_u128 = self.total as u128;
        let mut out = Vec::with_capacity(length);
        for _ in 0..length {
            let range = high - low + 1;
            let offset = code - low;
            // scaled = floor(((offset+1)*total -1)/range)
            let scaled = (((offset + 1) * total_u128) - 1) / range;
            // find symbol
            let mut found = self.alphabet[0];
            for &s in &self.alphabet {
                let (ls, rs) = self.cum[&s];
                if (ls as u128) <= scaled && scaled < (rs as u128) {
                    found = s;
                    break;
                }
            }
            out.push(found);
            let (ls, rs) = self.cum[&found];
            let ls_u = ls as u128;
            let rs_u = rs as u128;
            let new_low = low + (range * ls_u) / total_u128;
            let new_high = low + (range * rs_u) / total_u128 - 1;
            low = new_low;
            high = new_high;
        }
        out
    }
}

// ---------------- Self-contained bitstream (Jones integer range coding) ----------------

#[derive(Debug, Error)]
pub enum JonesBitstreamError {
    #[error("non-ascii input")]
    NonAsciiInput,
    #[error("empty input")]
    EmptyInput,
    #[error("invalid magic")]
    InvalidMagic,
    #[error("unsupported version")]
    UnsupportedVersion,
    #[error("truncated stream")]
    Truncated,
    #[error("decode error")]
    DecodeError,
    #[error("range error")]
    RangeError,
}

const JON_MAGIC: &[u8; 3] = b"JON";
const JON_VERSION: u8 = 0x01;

/// ASCII 文字列を Jones 高精度整数区間符号 (64bit コード) 自己完結化。
/// Format:
/// MAGIC(3) VERSION(1) FLAGS(1) ORIG_LEN(u32) S(u8)
///   symbols[S]
///   counts[S] (u32 BE)
///   TOTAL(u64) (sum counts)
///   CODE_BITS(u16) (= 64 固定)
///   PAYLOAD (8 bytes = 64 bits)
///   PAD(u8) 常に 0 (将来拡張余地)
fn build_cum_from_counts(
    alphabet: &[Symbol],
    counts: &[u64],
) -> (HashMap<Symbol, (u64, u64)>, u64) {
    let mut cum = HashMap::new();
    let mut acc = 0u64;
    for (i, &s) in alphabet.iter().enumerate() {
        let c = counts[i].max(1);
        let l = acc;
        let r = l + c;
        cum.insert(s, (l, r));
        acc = r;
    }
    (cum, acc)
}
pub fn encode_jones_to_bytes(input: &str) -> Result<Vec<u8>, JonesBitstreamError> {
    if input.is_empty() {
        return Err(JonesBitstreamError::EmptyInput);
    }
    let mut freq: HashMap<Symbol, u64> = HashMap::new();
    for c in input.chars() {
        if (c as u32) > 0x7F {
            return Err(JonesBitstreamError::NonAsciiInput);
        }
        *freq.entry(c).or_insert(0) += 1;
    }
    let mut alphabet: Alphabet = freq.keys().copied().collect();
    alphabet.sort();
    let counts_u64: Vec<u64> = alphabet.iter().map(|s| freq[s]).collect();
    let (cum, total) = build_cum_from_counts(&alphabet, &counts_u64);
    if total == 0 {
        return Err(JonesBitstreamError::EmptyInput);
    }
    let jc = JonesCode {
        alphabet: alphabet.clone(),
        cum: cum.clone(),
        total,
    };
    let symbols: Symbols = input.chars().collect();
    let bits = jc.encode(&symbols); // 64 bits
    let k: u16 = bits.len() as u16; // should be 64
                                    // pack exactly 64 bits into 8 bytes
    let mut payload = Vec::with_capacity(8);
    let mut cur = 0u8;
    let mut filled = 0u8;
    for &b in &bits {
        cur = (cur << 1) | (b & 1);
        filled += 1;
        if filled == 8 {
            payload.push(cur);
            cur = 0;
            filled = 0;
        }
    }
    let pad: u8 = 0; // always aligned (64)
    let mut out = Vec::new();
    out.extend_from_slice(JON_MAGIC);
    out.push(JON_VERSION);
    out.push(0); // flags
    out.extend_from_slice(&(symbols.len() as u32).to_be_bytes()); // original length
    out.push(alphabet.len() as u8); // S
    for &s in &alphabet {
        out.push(s as u8);
    } // symbols
    for c in &counts_u64 {
        out.extend_from_slice(&(*c as u32).to_be_bytes());
    } // counts
    out.extend_from_slice(&total.to_be_bytes()); // TOTAL u64
    out.extend_from_slice(&k.to_be_bytes()); // K u16
    out.extend_from_slice(&payload);
    out.push(pad); // pad=0
    Ok(out)
}

pub fn decode_jones_from_bytes(data: &[u8]) -> Result<String, JonesBitstreamError> {
    if data.len() < 3 + 1 + 1 + 4 + 1 {
        return Err(JonesBitstreamError::Truncated);
    }
    if &data[0..3] != JON_MAGIC {
        return Err(JonesBitstreamError::InvalidMagic);
    }
    if data[3] != JON_VERSION {
        return Err(JonesBitstreamError::UnsupportedVersion);
    }
    let _flags = data[4];
    let orig_len = u32::from_be_bytes([data[5], data[6], data[7], data[8]]) as usize;
    let s_count = data[9] as usize;
    let mut offset = 10;
    if data.len() < offset + s_count {
        return Err(JonesBitstreamError::Truncated);
    }
    let symbols_bytes = &data[offset..offset + s_count];
    offset += s_count;
    let counts_bytes = 4 * s_count;
    if data.len() < offset + counts_bytes + 8 + 2 + 1 {
        return Err(JonesBitstreamError::Truncated);
    }
    let mut counts: Vec<u64> = Vec::with_capacity(s_count);
    for i in 0..s_count {
        let c = u32::from_be_bytes([
            data[offset + 4 * i],
            data[offset + 4 * i + 1],
            data[offset + 4 * i + 2],
            data[offset + 4 * i + 3],
        ]) as u64;
        counts.push(c);
    }
    offset += counts_bytes;
    let total = u64::from_be_bytes([
        data[offset],
        data[offset + 1],
        data[offset + 2],
        data[offset + 3],
        data[offset + 4],
        data[offset + 5],
        data[offset + 6],
        data[offset + 7],
    ]);
    offset += 8;
    let k = u16::from_be_bytes([data[offset], data[offset + 1]]) as usize;
    offset += 2;
    if k == 0 {
        return Err(JonesBitstreamError::RangeError);
    }
    if data.len() < offset + 1 {
        return Err(JonesBitstreamError::Truncated);
    }
    let pad = *data.last().ok_or(JonesBitstreamError::Truncated)?;
    if pad > 7 {
        return Err(JonesBitstreamError::DecodeError);
    }
    if offset > data.len() - 1 {
        return Err(JonesBitstreamError::Truncated);
    }
    let payload = &data[offset..data.len() - 1];
    let total_bits = payload.len() * 8 - (pad as usize);
    if total_bits != k {
        return Err(JonesBitstreamError::DecodeError);
    }
    let mut bits: CodeWords = Vec::with_capacity(k);
    for i in 0..k {
        let byte = payload[i / 8];
        let bit = (byte >> (7 - (i % 8))) & 1;
        bits.push(bit);
    }
    let alphabet: Alphabet = symbols_bytes.iter().map(|&b| b as char).collect();
    let (cum, total_check) = build_cum_from_counts(&alphabet, &counts);
    if total_check != total {
        return Err(JonesBitstreamError::RangeError);
    }
    let jc = JonesCode {
        alphabet: alphabet.clone(),
        cum,
        total,
    };
    let decoded_syms = jc.decode(orig_len, &bits);
    if decoded_syms.len() != orig_len {
        return Err(JonesBitstreamError::DecodeError);
    }
    Ok(decoded_syms.into_iter().collect())
}
