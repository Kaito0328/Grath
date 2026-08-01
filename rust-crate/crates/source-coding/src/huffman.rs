use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap};

use crate::{CodeWords, Symbol, SymbolPr, Symbols};
use strum_macros::AsRefStr;
use thiserror::Error;

#[derive(Debug, Clone)]
pub struct HuffmanCode {
    pub codes: HashMap<Symbol, Vec<u8>>, // canonical codes as bit vectors
    pub decode_table: HashMap<(usize, u64), Symbol>, // (length, prefix)->symbol for fast decode
}

#[derive(Debug, Clone, PartialEq)]
struct Node {
    prob: f64,
    // leaf
    sym: Option<Symbol>,
    // internal
    left: Option<Box<Node>>,  // 0
    right: Option<Box<Node>>, // 1
}

impl Ord for Node {
    fn cmp(&self, other: &Self) -> Ordering {
        // BinaryHeap is max-heap; we want min-heap by prob
        other
            .prob
            .partial_cmp(&self.prob)
            .unwrap_or(Ordering::Equal)
            .then_with(|| {
                // deterministic tie-breaker on leaf presence
                let a = self.sym.is_some() as i32;
                let b = other.sym.is_some() as i32;
                a.cmp(&b)
            })
    }
}
impl PartialOrd for Node {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Eq for Node {}

impl HuffmanCode {
    pub fn from_symbol_pr(pr: &SymbolPr) -> Self {
        // Build initial heap
        let mut heap = BinaryHeap::new();
        for &s in &pr.alphabet {
            let p = pr.s_to_prs.get(&s).cloned().unwrap_or(0.0);
            heap.push(Node {
                prob: p,
                sym: Some(s),
                left: None,
                right: None,
            });
        }
        if heap.len() == 1 {
            // single symbol edge case: assign code "0"
            let s = heap.pop().unwrap().sym.unwrap();
            let mut codes = HashMap::new();
            codes.insert(s, vec![0]);
            let mut decode_table = HashMap::new();
            decode_table.insert((1, 0), s);
            return Self {
                codes,
                decode_table,
            };
        }

        // Build tree
        while heap.len() > 1 {
            let a = heap.pop().unwrap();
            let b = heap.pop().unwrap();
            let parent = Node {
                prob: a.prob + b.prob,
                sym: None,
                left: Some(Box::new(a)),
                right: Some(Box::new(b)),
            };
            heap.push(parent);
        }
        let root = heap.pop().unwrap();

        // Assign code lengths first
        let mut lengths: HashMap<Symbol, usize> = HashMap::new();
        fn walk(n: &Node, depth: usize, lengths: &mut HashMap<Symbol, usize>) {
            if let Some(s) = n.sym {
                lengths.insert(s, depth.max(1));
            } else {
                if let Some(ref l) = n.left {
                    walk(l, depth + 1, lengths);
                }
                if let Some(ref r) = n.right {
                    walk(r, depth + 1, lengths);
                }
            }
        }
        walk(&root, 0, &mut lengths);

        // Canonical assignment
        // Sort by (length asc, symbol asc)
        let mut syms: Vec<(Symbol, usize)> = pr
            .alphabet
            .iter()
            .filter_map(|&s| lengths.get(&s).copied().map(|len| (s, len)))
            .collect();
        syms.sort_by(|a, b| a.1.cmp(&b.1).then(a.0.cmp(&b.0)));

        let mut code: u64 = 0;
        let mut prev_len: usize = 0;
        let mut codes: HashMap<Symbol, Vec<u8>> = HashMap::new();
        let mut decode_table: HashMap<(usize, u64), Symbol> = HashMap::new();
        for (s, len) in syms {
            if len > prev_len {
                code <<= (len - prev_len) as u32;
                prev_len = len;
            }
            // record
            let mut bits = Vec::with_capacity(len);
            for i in (0..len).rev() {
                bits.push(((code >> i) & 1) as u8);
            }
            codes.insert(s, bits);
            decode_table.insert((len, code), s);
            code += 1;
        }
        Self {
            codes,
            decode_table,
        }
    }

    pub fn encode(&self, symbols: &Symbols) -> CodeWords {
        let mut out = Vec::new();
        for &s in symbols {
            if let Some(bits) = self.codes.get(&s) {
                out.extend_from_slice(bits);
            }
        }
        out
    }

    pub fn decode(&self, length: usize, bits: &CodeWords) -> Symbols {
        let mut out = Vec::with_capacity(length);
        let mut idx = 0usize;
        let mut acc: u64 = 0;
        let mut acc_len: usize = 0;
        while out.len() < length && idx < bits.len() {
            acc = (acc << 1) | (bits[idx] as u64);
            acc_len += 1;
            idx += 1;
            if let Some(&sym) = self.decode_table.get(&(acc_len, acc)) {
                out.push(sym);
                acc = 0;
                acc_len = 0;
            }
        }
        out
    }
}

// ---------------- Self-contained bitstream (header + canonical lengths + data) ----------------

#[derive(Debug, Error, AsRefStr)]
pub enum HuffmanBitstreamError {
    #[error("non-ascii input")]
    NonAsciiInput,
    #[error("invalid magic")]
    InvalidMagic,
    #[error("unsupported version")]
    UnsupportedVersion,
    #[error("truncated bitstream")]
    Truncated,
    #[error("invalid symbol count")]
    InvalidSymbolCount,
    #[error("decode mismatch")]
    DecodeMismatch,
}

const HUF_MAGIC: &[u8; 3] = b"HUF"; // 0x48 0x55 0x46
const HUF_VERSION: u8 = 0x01;

struct BitWriter {
    buf: Vec<u8>,
    cur: u8,
    filled: u8,
}
impl BitWriter {
    fn new() -> Self {
        Self {
            buf: Vec::new(),
            cur: 0,
            filled: 0,
        }
    }
    fn write_bit(&mut self, b: u8) {
        self.cur = (self.cur << 1) | (b & 1);
        self.filled += 1;
        if self.filled == 8 {
            self.buf.push(self.cur);
            self.cur = 0;
            self.filled = 0;
        }
    }
    fn write_bits(&mut self, bits: &[u8]) {
        for &b in bits {
            self.write_bit(b);
        }
    }
    fn finalize(mut self) -> (Vec<u8>, u8) {
        // returns (bytes, padding_count)
        if self.filled == 0 {
            return (self.buf, 0);
        }
        let padding = 8 - self.filled;
        self.cur <<= padding; // shift remaining to MSB側 (上位詰め)
        self.buf.push(self.cur);
        (self.buf, padding as u8)
    }
}

/// Encode str (ASCII) into self-contained Huffman byte stream.
pub fn huffman_encode_to_bytes(input: &str) -> Result<Vec<u8>, HuffmanBitstreamError> {
    if input.is_empty() {
        return Ok(Vec::new());
    }
    // ASCII validate & frequency count
    let mut freq: HashMap<Symbol, usize> = HashMap::new();
    for c in input.chars() {
        if (c as u32) > 0x7F {
            return Err(HuffmanBitstreamError::NonAsciiInput);
        }
        *freq.entry(c).or_insert(0) += 1;
    }
    let total: usize = input.len();
    // Build SymbolPr
    let mut alphabet: Vec<Symbol> = freq.keys().copied().collect();
    alphabet.sort();
    let mut s_to_prs: HashMap<Symbol, f64> = HashMap::new();
    for &s in &alphabet {
        s_to_prs.insert(s, (freq[&s] as f64) / (total as f64));
    }
    let pr = SymbolPr {
        alphabet: alphabet.clone(),
        s_to_prs,
    };
    let hc = HuffmanCode::from_symbol_pr(&pr);
    // Collect code lengths (canonical already)
    let mut lengths: Vec<(Symbol, usize)> = alphabet
        .iter()
        .map(|&s| (s, hc.codes.get(&s).map(|v| v.len()).unwrap_or(0)))
        .collect();
    // Single-symbol edge (length forced to 1)
    for (_, l) in &mut lengths {
        if *l == 0 {
            *l = 1;
        }
    }
    // Serialize header
    if lengths.len() > 128 {
        return Err(HuffmanBitstreamError::InvalidSymbolCount);
    }
    let mut out: Vec<u8> = Vec::new();
    out.extend_from_slice(HUF_MAGIC); // magic
    out.push(HUF_VERSION); // version
    out.push(0); // flags
                 // uncompressed length (u32 BE)
    let ulen = total as u32;
    out.extend_from_slice(&ulen.to_be_bytes());
    out.push(lengths.len() as u8); // S
                                   // symbols
    for (s, _) in &lengths {
        out.push(*s as u8);
    }
    // lengths (each 1..=255)
    for (_, l) in &lengths {
        out.push(*l as u8);
    }
    // Encode payload bits
    let mut bw = BitWriter::new();
    for c in input.chars() {
        let bits = hc.codes.get(&c).unwrap();
        bw.write_bits(bits);
    }
    let (payload, pad) = bw.finalize();
    out.extend_from_slice(&payload);
    out.push(pad); // padding count at end
    Ok(out)
}

/// Decode self-contained Huffman byte stream back to String.
pub fn huffman_decode_from_bytes(data: &[u8]) -> Result<String, HuffmanBitstreamError> {
    if data.is_empty() {
        return Ok(String::new());
    }
    if data.len() < 3 + 1 + 1 + 4 + 1 {
        return Err(HuffmanBitstreamError::Truncated);
    }
    if &data[0..3] != HUF_MAGIC {
        return Err(HuffmanBitstreamError::InvalidMagic);
    }
    if data[3] != HUF_VERSION {
        return Err(HuffmanBitstreamError::UnsupportedVersion);
    }
    let flags = data[4];
    let _ = flags; // reserved
    let ulen = u32::from_be_bytes([data[5], data[6], data[7], data[8]]) as usize;
    let s_count = data[9] as usize;
    if s_count == 0 || s_count > 128 {
        return Err(HuffmanBitstreamError::InvalidSymbolCount);
    }
    let need = 10 + s_count + s_count;
    if data.len() < need {
        return Err(HuffmanBitstreamError::Truncated);
    }
    let symbols = &data[10..10 + s_count];
    let lengths = &data[10 + s_count..10 + 2 * s_count];
    // Remaining: payload + 1 (pad)
    if data.len() < 10 + 2 * s_count + 1 {
        return Err(HuffmanBitstreamError::Truncated);
    }
    if data.len() == 10 + 2 * s_count + 1 {
        return Err(HuffmanBitstreamError::Truncated);
    } // need at least one payload byte unless ulen=0
    let pad = *data.last().unwrap();
    if pad > 7 {
        return Err(HuffmanBitstreamError::DecodeMismatch);
    }
    let payload = &data[10 + 2 * s_count..data.len() - 1];
    // Reconstruct canonical code mapping
    let mut lens_syms: Vec<(u8, u8)> = symbols
        .iter()
        .cloned()
        .zip(lengths.iter().cloned())
        .collect();
    // sort by (len, sym)
    lens_syms.sort_by(|a, b| a.1.cmp(&b.1).then(a.0.cmp(&b.0)));
    // assign codes
    let mut map: HashMap<(usize, u64), char> = HashMap::new();
    let mut code: u64 = 0;
    let mut prev_len: usize = 0;
    for (sym, len_u8) in &lens_syms {
        let len = *len_u8 as usize;
        if len == 0 {
            return Err(HuffmanBitstreamError::DecodeMismatch);
        }
        if len > prev_len {
            code <<= (len - prev_len) as u32;
            prev_len = len;
        }
        map.insert((len, code), *sym as char);
        code += 1;
    }
    // Single symbol quick path
    if lens_syms.len() == 1 {
        return Ok(std::iter::repeat(lens_syms[0].0 as char)
            .take(ulen)
            .collect());
    }
    // Bit traversal
    let total_bits = payload.len() * 8 - (pad as usize);
    let mut produced = 0usize;
    let mut acc: u64 = 0;
    let mut acc_len: usize = 0;
    let mut out = String::with_capacity(ulen);
    for i in 0..total_bits {
        let byte = payload[i / 8];
        let bit = (byte >> (7 - (i % 8))) & 1; // MSB-first
        acc = (acc << 1) | (bit as u64);
        acc_len += 1;
        if let Some(&ch) = map.get(&(acc_len, acc)) {
            out.push(ch);
            acc = 0;
            acc_len = 0;
            produced += 1;
            if produced == ulen {
                break;
            }
        }
    }
    if produced != ulen {
        return Err(HuffmanBitstreamError::DecodeMismatch);
    }
    Ok(out)
}
