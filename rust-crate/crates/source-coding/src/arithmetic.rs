use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use strum_macros::AsRefStr;
use thiserror::Error;

pub type Symbol = char;
pub type Alphabet = Vec<Symbol>;
pub type Symbols = Vec<Symbol>;
pub type CodeWords = Vec<u8>; // 0/1 bits

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolPr {
    pub alphabet: Alphabet,
    pub s_to_prs: HashMap<Symbol, f64>,
}

#[derive(Debug, Clone)]
pub struct SymbolRange {
    pub alphabet: Alphabet,
    pub s_to_rs: HashMap<Symbol, (f64, f64)>,
}

#[derive(thiserror::Error, Debug)]
pub enum ArithmeticError {
    #[error("invalid probability distribution")]
    InvalidDistribution,
    #[error("empty input")]
    EmptyInput,
}

pub type Result<T> = std::result::Result<T, ArithmeticError>;

#[derive(Debug, Clone)]
pub struct ArithmeticCode {
    symbol_range: SymbolRange,
}

impl ArithmeticCode {
    pub fn new(symbol_pr: SymbolPr) -> Result<Self> {
        // validate probabilities sum to ~1 and non-negative
        let mut sum = 0.0f64;
        for &s in &symbol_pr.alphabet {
            let p = *symbol_pr
                .s_to_prs
                .get(&s)
                .ok_or(ArithmeticError::InvalidDistribution)?;
            if !(p >= 0.0) {
                return Err(ArithmeticError::InvalidDistribution);
            }
            sum += p;
        }
        if (sum - 1.0).abs() > 1e-9 {
            return Err(ArithmeticError::InvalidDistribution);
        }
        Ok(Self {
            symbol_range: Self::spr_to_sr(symbol_pr),
        })
    }

    fn spr_to_sr(symbol_pr: SymbolPr) -> SymbolRange {
        let mut current_pr = 0.0f64;
        let mut s_to_rs = HashMap::new();
        for &symbol in &symbol_pr.alphabet {
            let p = symbol_pr.s_to_prs[&symbol];
            let first = current_pr;
            current_pr += p;
            let second = current_pr;
            s_to_rs.insert(symbol, (first, second));
        }
        SymbolRange {
            alphabet: symbol_pr.alphabet,
            s_to_rs,
        }
    }

    fn calc_range(&self, symbols: &Symbols) -> (f64, f64) {
        let mut current = (0.0f64, 1.0f64);
        for &sym in symbols {
            let (l, r) = self.symbol_range.s_to_rs[&sym];
            let len = current.1 - current.0;
            let min = current.0;
            current.0 = min + l * len;
            current.1 = min + r * len;
        }
        current
    }

    fn in_range(&self, p: f64) -> Symbol {
        for &sym in &self.symbol_range.alphabet {
            let (l, r) = self.symbol_range.s_to_rs[&sym];
            if l <= p && p < r {
                return sym;
            }
        }
        // fallback
        self.symbol_range.alphabet[0]
    }

    pub fn encode(&self, symbols: &Symbols) -> Result<CodeWords> {
        if symbols.is_empty() {
            return Err(ArithmeticError::EmptyInput);
        }
        let range = self.calc_range(symbols);
        let mid = (range.0 + range.1) / 2.0;
        let range_len = (range.1 - range.0).max(f64::EPSILON);
        let length = ((-range_len.log2()).ceil() as i64 + 1).max(1) as usize;
        let mut cws = vec![0u8; length];
        let mut bin = (0.0f64, 1.0f64);
        for i in 0..length {
            let border = (bin.0 + bin.1) / 2.0;
            if mid < border {
                cws[i] = 0;
                bin.1 = border;
            } else {
                cws[i] = 1;
                bin.0 = border;
            }
        }
        Ok(cws)
    }

    pub fn decode(&self, length: usize, cws: &CodeWords) -> Result<Symbols> {
        if length == 0 {
            return Ok(vec![]);
        }
        let mut p = 0.0f64;
        let mut bin = 1.0f64;
        for &b in cws {
            bin /= 2.0;
            p += (b as f64) * bin;
        }
        let mut out = Vec::with_capacity(length);
        for _ in 0..length {
            let sym = self.in_range(p);
            let (l, r) = self.symbol_range.s_to_rs[&sym];
            out.push(sym);
            p = (p - l) / (r - l);
        }
        Ok(out)
    }
}

// ---------------- Self-contained bitstream (Arithmetic) ----------------

#[derive(Debug, Error, AsRefStr)]
pub enum ArithmeticBitstreamError {
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
    #[error("probability error")]
    ProbabilityError,
}

const ARC_MAGIC: &[u8; 3] = b"ARC";
const ARC_VERSION: u8 = 0x01;

struct BitPacker;
impl BitPacker {
    fn pack(bits: &[u8]) -> (Vec<u8>, u8) {
        if bits.is_empty() {
            return (Vec::new(), 0);
        }
        let mut out = Vec::new();
        let mut cur = 0u8;
        let mut filled = 0u8;
        for &b in bits {
            cur = (cur << 1) | (b & 1);
            filled += 1;
            if filled == 8 {
                out.push(cur);
                cur = 0;
                filled = 0;
            }
        }
        let pad = if filled == 0 {
            0
        } else {
            let p = 8 - filled;
            cur <<= p;
            out.push(cur);
            p
        };
        (out, pad as u8)
    }
    fn unpack(payload: &[u8], pad: u8) -> Vec<u8> {
        if payload.is_empty() {
            return Vec::new();
        }
        let total_bits = payload.len() * 8 - (pad as usize);
        let mut bits = Vec::with_capacity(total_bits);
        for i in 0..total_bits {
            let byte = payload[i / 8];
            let bit = (byte >> (7 - (i % 8))) & 1;
            bits.push(bit);
        }
        bits
    }
}

/// Encode ASCII string into arithmetic self-contained byte stream.
/// Format:
/// MAGIC(3) VERSION(1) FLAGS(1) ORIG_LEN(u32)
///   S(u8) symbols[S] counts[S](u32 BE each)
///   BITLEN(u32)  payload(bytes) pad(1B)
pub fn arithmetic_encode_to_bytes(
    input: &str,
) -> std::result::Result<Vec<u8>, ArithmeticBitstreamError> {
    if input.is_empty() {
        return Err(ArithmeticBitstreamError::EmptyInput);
    }
    let mut counts: HashMap<Symbol, u32> = HashMap::new();
    for c in input.chars() {
        if (c as u32) > 0x7F {
            return Err(ArithmeticBitstreamError::NonAsciiInput);
        }
        *counts.entry(c).or_insert(0) += 1;
    }
    let mut alphabet: Alphabet = counts.keys().copied().collect();
    alphabet.sort();
    let total: u32 = counts.values().sum();
    if total == 0 {
        return Err(ArithmeticBitstreamError::EmptyInput);
    }
    let mut s_to_prs = HashMap::new();
    for &s in &alphabet {
        s_to_prs.insert(s, (counts[&s] as f64) / (total as f64));
    }
    // normalize (avoid rounding drift)
    let sum: f64 = s_to_prs.values().sum();
    for v in s_to_prs.values_mut() {
        *v /= sum;
    }
    let pr = SymbolPr {
        alphabet: alphabet.clone(),
        s_to_prs,
    };
    let ac = ArithmeticCode::new(pr).map_err(|_| ArithmeticBitstreamError::ProbabilityError)?;
    let symbols: Symbols = input.chars().collect();
    let bits = ac
        .encode(&symbols)
        .map_err(|_| ArithmeticBitstreamError::ProbabilityError)?;
    let (payload, pad) = BitPacker::pack(&bits);
    let mut out = Vec::new();
    out.extend_from_slice(ARC_MAGIC);
    out.push(ARC_VERSION);
    out.push(0);
    out.extend_from_slice(&(symbols.len() as u32).to_be_bytes());
    out.push(alphabet.len() as u8);
    for &s in &alphabet {
        out.push(s as u8);
    }
    for &s in &alphabet {
        out.extend_from_slice(&counts[&s].to_be_bytes());
    }
    out.extend_from_slice(&(bits.len() as u32).to_be_bytes());
    out.extend_from_slice(&payload);
    out.push(pad);
    Ok(out)
}

pub fn arithmetic_decode_from_bytes(
    data: &[u8],
) -> std::result::Result<String, ArithmeticBitstreamError> {
    if data.len() < 3 + 1 + 1 + 4 + 1 {
        return Err(ArithmeticBitstreamError::Truncated);
    }
    if &data[0..3] != ARC_MAGIC {
        return Err(ArithmeticBitstreamError::InvalidMagic);
    }
    if data[3] != ARC_VERSION {
        return Err(ArithmeticBitstreamError::UnsupportedVersion);
    }
    let _flags = data[4];
    let orig_len = u32::from_be_bytes([data[5], data[6], data[7], data[8]]) as usize;
    let s_count = data[9] as usize;
    if s_count == 0 {
        return Err(ArithmeticBitstreamError::DecodeError);
    }
    let mut offset = 10;
    if data.len() < offset + s_count {
        return Err(ArithmeticBitstreamError::Truncated);
    }
    let symbols = &data[offset..offset + s_count];
    offset += s_count;
    let need_counts = 4 * s_count;
    if data.len() < offset + need_counts {
        return Err(ArithmeticBitstreamError::Truncated);
    }
    let mut counts: Vec<u32> = Vec::with_capacity(s_count);
    for i in 0..s_count {
        let c = u32::from_be_bytes([
            data[offset + 4 * i],
            data[offset + 4 * i + 1],
            data[offset + 4 * i + 2],
            data[offset + 4 * i + 3],
        ]);
        counts.push(c);
    }
    offset += need_counts;
    if data.len() < offset + 4 + 1 {
        return Err(ArithmeticBitstreamError::Truncated);
    }
    let bit_len = u32::from_be_bytes([
        data[offset],
        data[offset + 1],
        data[offset + 2],
        data[offset + 3],
    ]) as usize;
    offset += 4;
    if data.len() < offset + 1 {
        return Err(ArithmeticBitstreamError::Truncated);
    }
    if offset >= data.len() {
        return Err(ArithmeticBitstreamError::Truncated);
    }
    let pad = *data.last().unwrap();
    if pad > 7 {
        return Err(ArithmeticBitstreamError::DecodeError);
    }
    if offset > data.len() - 1 {
        return Err(ArithmeticBitstreamError::Truncated);
    }
    let payload = &data[offset..data.len() - 1];
    let bits = BitPacker::unpack(payload, pad);
    if bits.len() != bit_len {
        // allow extra due to padding removal mismatch; just cap
        if bits.len() < bit_len {
            return Err(ArithmeticBitstreamError::DecodeError);
        }
    }
    let total: u32 = counts.iter().sum();
    if total == 0 {
        return Err(ArithmeticBitstreamError::DecodeError);
    }
    let alphabet: Alphabet = symbols.iter().map(|&b| b as char).collect();
    // Build probability map from counts
    let mut s_to_prs = HashMap::new();
    for (i, &sym) in alphabet.iter().enumerate() {
        s_to_prs.insert(sym, (counts[i] as f64) / (total as f64));
    }
    // normalize
    let sum: f64 = s_to_prs.values().sum();
    for v in s_to_prs.values_mut() {
        *v /= sum;
    }
    let pr = SymbolPr {
        alphabet: alphabet.clone(),
        s_to_prs,
    };
    let ac = ArithmeticCode::new(pr).map_err(|_| ArithmeticBitstreamError::ProbabilityError)?;
    let decoded_syms = ac
        .decode(orig_len, &bits)
        .map_err(|_| ArithmeticBitstreamError::DecodeError)?;
    if decoded_syms.len() != orig_len {
        return Err(ArithmeticBitstreamError::DecodeError);
    }
    Ok(decoded_syms.into_iter().collect())
}
