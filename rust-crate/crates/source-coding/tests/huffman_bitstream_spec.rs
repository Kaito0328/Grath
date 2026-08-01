use source_coding::{huffman_decode_from_bytes, huffman_encode_to_bytes};

#[test]
fn roundtrip_simple() {
    let s = "ABAAB"; // small example
    let bytes = huffman_encode_to_bytes(s).unwrap();
    let out = huffman_decode_from_bytes(&bytes).unwrap();
    assert_eq!(out, s);
}

#[test]
fn roundtrip_single_symbol() {
    let s = "AAAAAA";
    let bytes = huffman_encode_to_bytes(s).unwrap();
    let out = huffman_decode_from_bytes(&bytes).unwrap();
    assert_eq!(out, s);
}

#[test]
fn roundtrip_longer() {
    let s = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG"; // includes spaces
    let bytes = huffman_encode_to_bytes(s).unwrap();
    let out = huffman_decode_from_bytes(&bytes).unwrap();
    assert_eq!(out, s);
}

#[test]
fn empty_string() {
    let s = "";
    let bytes = huffman_encode_to_bytes(s).unwrap();
    assert!(bytes.is_empty());
    let out = huffman_decode_from_bytes(&bytes).unwrap();
    assert_eq!(out, s);
}

#[test]
fn non_ascii_error() {
    let s = "こんにちわ"; // non ASCII
    let err = huffman_encode_to_bytes(s).unwrap_err();
    let msg = format!("{err}");
    assert!(msg.contains("non-ascii"));
}
