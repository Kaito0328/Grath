pub mod arithmetic;
pub mod craft;
pub mod elias;
pub mod huffman;
pub mod huffman_block;
pub mod jones;
pub mod lz78;
pub mod markov;

pub use arithmetic::{
    arithmetic_decode_from_bytes, arithmetic_encode_to_bytes, ArithmeticBitstreamError,
};
pub use arithmetic::{Alphabet, ArithmeticCode, CodeWords, Symbol, SymbolPr, Symbols};
pub use craft::{craft_code, CodeBook as CraftCodeBook};
pub use elias::{
    decode_elias_list_from_bytes, elias_gamma_decode, elias_gamma_encode,
    encode_elias_list_to_bytes, EliasListBitstreamError,
};
pub use huffman::HuffmanCode;
pub use huffman::{huffman_decode_from_bytes, huffman_encode_to_bytes, HuffmanBitstreamError};
pub use huffman_block::{BlockHuffmanTree, SymbolsPr as BlockSymbolsPr, SymbolsToCodeWord};
pub use jones::{decode_jones_from_bytes, encode_jones_to_bytes, JonesBitstreamError, JonesCode};
pub use lz78::{
    lz78_decode_from_bytes, lz78_decode_var_from_bytes, lz78_encode_to_bytes,
    lz78_encode_var_to_bytes, Lz78BitstreamError, Lz78VarBitstreamError,
};
pub use lz78::{lz78_huffman_decode_from_bytes, lz78_huffman_encode_to_bytes, Lz78HuffmanError};
pub use lz78::{InternalCodeWord, InternalCodeWords, Lz78Code};
pub use markov::Markov;

use common::prelude::GrathCrateApi;

pub struct SourceCodingApi;

impl GrathCrateApi for SourceCodingApi {
    const CRATE_NAME: &'static str = "source-coding";
}

impl SourceCodingApi {
    pub fn huffman_roundtrip(input: String) -> std::result::Result<bool, HuffmanBitstreamError> {
        let encoded = huffman_encode_to_bytes(&input)?;
        let decoded = huffman_decode_from_bytes(&encoded)?;
        Ok(decoded == input)
    }

    pub fn lz78_roundtrip(input: String) -> std::result::Result<bool, Lz78BitstreamError> {
        let encoded = lz78_encode_to_bytes(&input)?;
        let decoded = lz78_decode_from_bytes(&encoded)?;
        Ok(decoded == input)
    }

    pub fn arithmetic_roundtrip(
        input: String,
    ) -> std::result::Result<bool, ArithmeticBitstreamError> {
        let encoded = arithmetic_encode_to_bytes(&input)?;
        let decoded = arithmetic_decode_from_bytes(&encoded)?;
        Ok(decoded == input)
    }

    pub fn huffman_encode_hex(input: String) -> std::result::Result<String, String> {
        huffman_encode_to_bytes(&input)
            .map(|bytes| encode_hex(&bytes))
            .map_err(|e| e.to_string())
    }

    pub fn huffman_decode_hex(hex: String) -> std::result::Result<String, String> {
        let bytes = decode_hex(&hex)?;
        huffman_decode_from_bytes(&bytes).map_err(|e| e.to_string())
    }

    pub fn lz78_encode_hex(input: String) -> std::result::Result<String, String> {
        lz78_encode_to_bytes(&input)
            .map(|bytes| encode_hex(&bytes))
            .map_err(|e| e.to_string())
    }

    pub fn lz78_decode_hex(hex: String) -> std::result::Result<String, String> {
        let bytes = decode_hex(&hex)?;
        lz78_decode_from_bytes(&bytes).map_err(|e| e.to_string())
    }

    pub fn arithmetic_encode_hex(input: String) -> std::result::Result<String, String> {
        arithmetic_encode_to_bytes(&input)
            .map(|bytes| encode_hex(&bytes))
            .map_err(|e| e.to_string())
    }

    pub fn arithmetic_decode_hex(hex: String) -> std::result::Result<String, String> {
        let bytes = decode_hex(&hex)?;
        arithmetic_decode_from_bytes(&bytes).map_err(|e| e.to_string())
    }
}

fn encode_hex(bytes: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut out = String::with_capacity(bytes.len() * 2);
    for &byte in bytes {
        out.push(HEX[(byte >> 4) as usize] as char);
        out.push(HEX[(byte & 0x0f) as usize] as char);
    }
    out
}

fn decode_hex(hex: &str) -> std::result::Result<Vec<u8>, String> {
    let trimmed = hex.trim();
    if trimmed.is_empty() {
        return Ok(Vec::new());
    }
    if trimmed.len() % 2 != 0 {
        return Err("hex length must be even".to_string());
    }
    let mut out = Vec::with_capacity(trimmed.len() / 2);
    let bytes = trimmed.as_bytes();
    for chunk in bytes.chunks_exact(2) {
        let hi = hex_nibble(chunk[0])?;
        let lo = hex_nibble(chunk[1])?;
        out.push((hi << 4) | lo);
    }
    Ok(out)
}

fn hex_nibble(byte: u8) -> std::result::Result<u8, String> {
    match byte {
        b'0'..=b'9' => Ok(byte - b'0'),
        b'a'..=b'f' => Ok(byte - b'a' + 10),
        b'A'..=b'F' => Ok(byte - b'A' + 10),
        _ => Err(format!("invalid hex digit: {}", byte as char)),
    }
}
