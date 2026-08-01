use std::collections::HashMap;

use crate::huffman::{huffman_decode_from_bytes, huffman_encode_to_bytes};
use crate::{CodeWords, Symbols};
use strum_macros::AsRefStr;
use thiserror::Error;

pub type InternalCodeWord = (usize, char); // (index, next_char)
pub type InternalCodeWords = Vec<InternalCodeWord>;

#[derive(Debug, Clone)]
pub struct Lz78Code;

impl Lz78Code {
    pub fn encode_internal(input: &Symbols) -> InternalCodeWords {
        let mut dict: HashMap<String, usize> = HashMap::new();
        dict.insert(String::new(), 0);
        let mut next_index = 1usize;
        let mut w = String::new();
        let mut out: InternalCodeWords = Vec::new();
        for &c in input {
            let mut wc = w.clone();
            wc.push(c);
            if dict.contains_key(&wc) {
                w = wc;
            } else {
                let idx = *dict.get(&w).unwrap();
                out.push((idx, c));
                dict.insert(wc, next_index);
                next_index += 1;
                w.clear();
            }
        }
        if !w.is_empty() {
            out.push((*dict.get(&w).unwrap(), '\0'));
        }
        out
    }

    pub fn decode_internal(code: &InternalCodeWords) -> Symbols {
        // 元の実装は dict[idx] を直接参照し、壊れたストリームで panic し得た。
        // wasm から呼ばれた際に UI ごとクラッシュしないよう、境界外参照を検出したら
        // そこで打ち切って部分結果を返す（または空を返す）。
        let mut dict: Vec<String> = vec![String::new()];
        let mut out = String::new();
        for &(idx, c) in code {
            if idx >= dict.len() {
                break;
            }
            let mut s = dict[idx].clone();
            if c != '\0' {
                s.push(c);
            }
            out.push_str(&s);
            dict.push(s);
        }
        out.chars().collect()
    }

    /// Safe variant used by external bitstream decoders. Returns Err on invalid index
    /// instead of panicking with an out-of-bounds access. (Malformed / corrupted stream.)
    pub fn decode_internal_safe(code: &InternalCodeWords) -> Result<Symbols, ()> {
        let mut dict: Vec<String> = vec![String::new()];
        let mut out = String::new();
        for &(idx, c) in code {
            if idx >= dict.len() {
                return Err(());
            }
            let mut s = dict[idx].clone();
            if c != '\0' {
                s.push(c);
            }
            out.push_str(&s);
            dict.push(s);
        }
        Ok(out.chars().collect())
    }

    // simple bit packing: prefix each pair with fixed-width for index inferred from growth
    pub fn encode(&self, input: &Symbols) -> CodeWords {
        let internal = Self::encode_internal(input);
        if internal.is_empty() {
            return vec![];
        }
        let max_index = internal.len() + 1; // approximate
        let mut bits = 0usize;
        let mut tmp = max_index;
        while tmp > 0 {
            bits += 1;
            tmp >>= 1;
        }
        let mut out: CodeWords = Vec::new();
        for &(idx, c) in &internal {
            for i in (0..bits).rev() {
                out.push(((idx >> i) & 1) as u8);
            }
            let b = c as u32 as u8; // ASCII assumed
            for i in (0..8).rev() {
                out.push(((b >> i) & 1) as u8);
            }
        }
        out
    }

    pub fn decode(&self, _length: usize, bits: &CodeWords) -> Symbols {
        // Not robust without explicit header; provide simple heuristic assuming 8-bit chars and remaining bits for index
        let n = bits.len();
        if n == 0 {
            return vec![];
        }
        // assume index width is 8 for simplicity
        let idx_bits = 8usize;
        let pair_bits = idx_bits + 8;
        let mut code: InternalCodeWords = Vec::new();
        let mut i = 0;
        while i + pair_bits <= n {
            let mut idx = 0usize;
            for _ in 0..idx_bits {
                idx = (idx << 1) | (bits[i] as usize);
                i += 1;
            }
            let mut b = 0u8;
            for _ in 0..8 {
                b = (b << 1) | bits[i];
                i += 1;
            }
            code.push((idx, b as char));
        }
        // 壊れたストリームでも panic しないよう安全版にフォールバック
        match Self::decode_internal_safe(&code) {
            Ok(syms) => syms,
            Err(()) => Vec::new(),
        }
    }
}

// ---------------- Self-contained byte stream formats ----------------

#[derive(Debug, Error, AsRefStr)]
pub enum Lz78BitstreamError {
    #[error("non-ascii input")]
    NonAsciiInput,
    #[error("truncated stream")]
    Truncated,
    #[error("invalid magic")]
    InvalidMagic,
    #[error("unsupported version")]
    UnsupportedVersion,
    #[error("decode error")]
    DecodeError,
}

const LZ78_MAGIC: &[u8; 3] = b"LZ8"; // fixed-width variant
const LZ78_VERSION: u8 = 0x01;

/// Fixed-width (index:u32 BE, char:u8) pairs after header.
/// Header: MAGIC(3) VERSION(1) FLAGS(1) PAIRS(u32 BE)
pub fn lz78_encode_to_bytes(input: &str) -> Result<Vec<u8>, Lz78BitstreamError> {
    if input.is_empty() {
        return Ok(Vec::new());
    }
    for c in input.chars() {
        if (c as u32) > 0x7F {
            return Err(Lz78BitstreamError::NonAsciiInput);
        }
    }
    let symbols: Symbols = input.chars().collect();
    let code = Lz78Code::encode_internal(&symbols);
    let mut out = Vec::new();
    out.extend_from_slice(LZ78_MAGIC);
    out.push(LZ78_VERSION);
    out.push(0); // flags
    out.extend_from_slice(&(code.len() as u32).to_be_bytes());
    for &(idx, ch) in &code {
        out.extend_from_slice(&(idx as u32).to_be_bytes());
        out.push(ch as u8);
    }
    Ok(out)
}

pub fn lz78_decode_from_bytes(data: &[u8]) -> Result<String, Lz78BitstreamError> {
    if data.is_empty() {
        return Ok(String::new());
    }
    if data.len() < 3 + 1 + 1 + 4 {
        return Err(Lz78BitstreamError::Truncated);
    }
    if &data[0..3] != LZ78_MAGIC {
        return Err(Lz78BitstreamError::InvalidMagic);
    }
    if data[3] != LZ78_VERSION {
        return Err(Lz78BitstreamError::UnsupportedVersion);
    }
    let _flags = data[4];
    let pairs = u32::from_be_bytes([data[5], data[6], data[7], data[8]]) as usize;
    let need = 9 + pairs * (4 + 1);
    if data.len() < need {
        return Err(Lz78BitstreamError::Truncated);
    }
    let mut internal: InternalCodeWords = Vec::with_capacity(pairs);
    let mut off = 9;
    for _ in 0..pairs {
        let idx =
            u32::from_be_bytes([data[off], data[off + 1], data[off + 2], data[off + 3]]) as usize;
        off += 4;
        let ch = data[off] as char;
        off += 1;
        internal.push((idx, ch));
    }
    Lz78Code::decode_internal_safe(&internal)
        .map(|syms| syms.into_iter().collect())
        .map_err(|_| Lz78BitstreamError::DecodeError)
}

// -------------- Variable-length (gamma-coded index) format --------------

#[derive(Debug, Error)]
pub enum Lz78VarBitstreamError {
    #[error("non-ascii input")]
    NonAsciiInput,
    #[error("invalid magic")]
    InvalidMagic,
    #[error("unsupported version")]
    UnsupportedVersion,
    #[error("truncated stream")]
    Truncated,
    #[error("decode error")]
    DecodeError,
}

const LZ78V_MAGIC: &[u8; 3] = b"LZV"; // variable-length variant
const LZ78V_VERSION: u8 = 0x01;

// reuse Elias gamma (n>=1). We store index+1 (so that 0 index -> 1) to satisfy gamma domain, char 1B, stream ended after count pairs.
/// Header: MAGIC(3) VERSION(1) FLAGS(1) PAIRS(u32) PAYLOAD(bits...) PAD(1B)
pub fn lz78_encode_var_to_bytes(input: &str) -> Result<Vec<u8>, Lz78VarBitstreamError> {
    if input.is_empty() {
        return Ok(Vec::new());
    }
    for c in input.chars() {
        if (c as u32) > 0x7F {
            return Err(Lz78VarBitstreamError::NonAsciiInput);
        }
    }
    let symbols: Symbols = input.chars().collect();
    let code = Lz78Code::encode_internal(&symbols);
    // build bit payload
    let mut bits: Vec<u8> = Vec::new();
    for &(idx, ch) in &code {
        let val = (idx as u64) + 1; // gamma domain
        let gamma = crate::elias::elias_gamma_encode(val);
        bits.extend_from_slice(&gamma);
        let b = ch as u8;
        for i in (0..8).rev() {
            bits.push((b >> i) & 1);
        }
    }
    // pack bits
    let mut payload: Vec<u8> = Vec::new();
    let mut cur = 0u8;
    let mut filled = 0u8;
    for &b in &bits {
        cur = (cur << 1) | b;
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
    };
    // header
    let mut out = Vec::new();
    out.extend_from_slice(LZ78V_MAGIC);
    out.push(LZ78V_VERSION);
    out.push(0);
    out.extend_from_slice(&(code.len() as u32).to_be_bytes());
    out.extend_from_slice(&payload);
    out.push(pad as u8);
    Ok(out)
}

pub fn lz78_decode_var_from_bytes(data: &[u8]) -> Result<String, Lz78VarBitstreamError> {
    if data.is_empty() {
        return Ok(String::new());
    }
    if data.len() < 3 + 1 + 1 + 4 + 1 {
        return Err(Lz78VarBitstreamError::Truncated);
    }
    if &data[0..3] != LZ78V_MAGIC {
        return Err(Lz78VarBitstreamError::InvalidMagic);
    }
    if data[3] != LZ78V_VERSION {
        return Err(Lz78VarBitstreamError::UnsupportedVersion);
    }
    let _flags = data[4];
    let pairs = u32::from_be_bytes([data[5], data[6], data[7], data[8]]) as usize;
    if pairs == 0 {
        return Ok(String::new());
    }
    if data.len() < 9 + 1 {
        return Err(Lz78VarBitstreamError::Truncated);
    }
    let pad = *data.last().unwrap();
    if pad > 7 {
        return Err(Lz78VarBitstreamError::Truncated);
    }
    let payload = &data[9..data.len() - 1];
    let total_bits = payload.len() * 8 - (pad as usize);
    // bit iteration
    let mut idx_bit = 0usize;
    let mut internal: InternalCodeWords = Vec::with_capacity(pairs);
    for _ in 0..pairs {
        // gamma decode (index+1)
        // collect bits into temp vector forms
        // Implement inline gamma decode
        let start = idx_bit;
        let mut zeros = 0usize;
        while start + zeros < total_bits {
            let bit = (payload[(start + zeros) / 8] >> (7 - ((start + zeros) % 8))) & 1;
            if bit == 0 {
                zeros += 1;
            } else {
                break;
            }
        }
        let mut cur_pos = start + zeros;
        if cur_pos >= total_bits {
            return Err(Lz78VarBitstreamError::Truncated);
        }
        let mut val: u64 = 0;
        for _ in 0..(zeros + 1) {
            if cur_pos >= total_bits {
                return Err(Lz78VarBitstreamError::Truncated);
            }
            let bit = (payload[cur_pos / 8] >> (7 - (cur_pos % 8))) & 1;
            cur_pos += 1;
            val = (val << 1) | bit as u64;
        }
        let index = (val - 1) as usize; // original index
                                        // next 8 bits char
        if cur_pos + 8 > total_bits {
            return Err(Lz78VarBitstreamError::Truncated);
        }
        let mut b = 0u8;
        for _ in 0..8 {
            let bit = (payload[cur_pos / 8] >> (7 - (cur_pos % 8))) & 1;
            cur_pos += 1;
            b = (b << 1) | bit;
        }
        internal.push((index, b as char));
        idx_bit = cur_pos;
    }
    Lz78Code::decode_internal_safe(&internal)
        .map(|syms| syms.into_iter().collect())
        .map_err(|_| Lz78VarBitstreamError::DecodeError)
}

// -------------- LZ78 + Huffman combo (char Huffman, index gamma) --------------

#[derive(Debug, Error)]
pub enum Lz78HuffmanError {
    #[error("non-ascii input")]
    NonAsciiInput,
    #[error("invalid magic")]
    InvalidMagic,
    #[error("unsupported version")]
    UnsupportedVersion,
    #[error("truncated stream")]
    Truncated,
    #[error("inner huffman error: {0}")]
    Huffman(String),
    #[error("decode error")]
    DecodeError,
}

const LZ78H_MAGIC: &[u8; 3] = b"LZH";
const LZ78H_VERSION: u8 = 0x01;

/// Format:
/// MAGIC(3) VERSION(1) FLAGS(1) PAIRS(u32)
///   Huffman-char-section: <HUF stream bytes length u32> <HUF bytes>
///   Index gamma section: <payload bytes> <pad(1B)>
pub fn lz78_huffman_encode_to_bytes(input: &str) -> Result<Vec<u8>, Lz78HuffmanError> {
    if input.is_empty() {
        return Ok(Vec::new());
    }
    for c in input.chars() {
        if (c as u32) > 0x7F {
            return Err(Lz78HuffmanError::NonAsciiInput);
        }
    }
    let symbols: Symbols = input.chars().collect();
    let code = Lz78Code::encode_internal(&symbols);
    // char sequence (preserve emitted order)
    let chars: String = code.iter().map(|&(_, c)| c).collect();
    let huf_bytes =
        huffman_encode_to_bytes(&chars).map_err(|e| Lz78HuffmanError::Huffman(e.to_string()))?;
    // gamma encode indices
    let mut bits: Vec<u8> = Vec::new();
    for &(idx, _) in &code {
        let val = (idx as u64) + 1;
        let gamma = crate::elias::elias_gamma_encode(val);
        bits.extend_from_slice(&gamma);
    }
    // pack bits
    let mut payload: Vec<u8> = Vec::new();
    let mut cur = 0u8;
    let mut filled = 0u8;
    for &b in &bits {
        cur = (cur << 1) | b;
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
    };
    let mut out = Vec::new();
    out.extend_from_slice(LZ78H_MAGIC);
    out.push(LZ78H_VERSION);
    out.push(0);
    out.extend_from_slice(&(code.len() as u32).to_be_bytes());
    out.extend_from_slice(&(huf_bytes.len() as u32).to_be_bytes());
    out.extend_from_slice(&huf_bytes);
    out.extend_from_slice(&payload);
    out.push(pad as u8);
    Ok(out)
}

pub fn lz78_huffman_decode_from_bytes(data: &[u8]) -> Result<String, Lz78HuffmanError> {
    if data.is_empty() {
        return Ok(String::new());
    }
    if data.len() < 3 + 1 + 1 + 4 + 4 {
        return Err(Lz78HuffmanError::Truncated);
    }
    if &data[0..3] != LZ78H_MAGIC {
        return Err(Lz78HuffmanError::InvalidMagic);
    }
    if data[3] != LZ78H_VERSION {
        return Err(Lz78HuffmanError::UnsupportedVersion);
    }
    let _flags = data[4];
    let pairs = u32::from_be_bytes([data[5], data[6], data[7], data[8]]) as usize;
    let hlen = u32::from_be_bytes([data[9], data[10], data[11], data[12]]) as usize;
    let expect_min = 13 + hlen + 1;
    if data.len() < expect_min {
        return Err(Lz78HuffmanError::Truncated);
    }
    let huf_bytes = &data[13..13 + hlen];
    let pad = *data.last().unwrap();
    if pad > 7 {
        return Err(Lz78HuffmanError::Truncated);
    }
    let payload = &data[13 + hlen..data.len() - 1];
    // decode chars via huffman (we don't know length yet -> infer from pairs)
    let chars_str = huffman_decode_from_bytes(huf_bytes)
        .map_err(|e| Lz78HuffmanError::Huffman(e.to_string()))?;
    if chars_str.len() != pairs {
        return Err(Lz78HuffmanError::DecodeError);
    }
    // decode indices gamma
    let total_bits = payload.len() * 8 - (pad as usize);
    let mut idx_bit = 0usize;
    let mut indices: Vec<usize> = Vec::with_capacity(pairs);
    for _ in 0..pairs {
        // gamma decode val (>=1)
        let start = idx_bit;
        let mut zeros = 0usize;
        while start + zeros < total_bits {
            let bit = (payload[(start + zeros) / 8] >> (7 - ((start + zeros) % 8))) & 1;
            if bit == 0 {
                zeros += 1;
            } else {
                break;
            }
        }
        let mut cur_pos = start + zeros;
        if cur_pos >= total_bits {
            return Err(Lz78HuffmanError::Truncated);
        }
        let mut val: u64 = 0;
        for _ in 0..(zeros + 1) {
            if cur_pos >= total_bits {
                return Err(Lz78HuffmanError::Truncated);
            }
            let bit = (payload[cur_pos / 8] >> (7 - (cur_pos % 8))) & 1;
            cur_pos += 1;
            val = (val << 1) | bit as u64;
        }
        let index = (val - 1) as usize;
        idx_bit = cur_pos;
        indices.push(index);
    }
    if indices.len() != pairs {
        return Err(Lz78HuffmanError::DecodeError);
    }
    // reconstruct internal pairs
    let mut internal: InternalCodeWords = Vec::with_capacity(pairs);
    for i in 0..pairs {
        internal.push((indices[i], chars_str.as_bytes()[i] as char));
    }
    Lz78Code::decode_internal_safe(&internal)
        .map(|syms| syms.into_iter().collect())
        .map_err(|_| Lz78HuffmanError::DecodeError)
}
