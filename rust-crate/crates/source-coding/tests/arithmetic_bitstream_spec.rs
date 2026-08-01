use source_coding::{arithmetic_decode_from_bytes, arithmetic_encode_to_bytes};

#[test]
fn arithmetic_roundtrip_basic() {
    let s = "BANANA_BANDANA"; // typical test string
    let bytes = arithmetic_encode_to_bytes(s).unwrap();
    let out = arithmetic_decode_from_bytes(&bytes).unwrap();
    assert_eq!(out, s);
}

#[test]
fn arithmetic_non_ascii_error() {
    let s = "あ";
    assert!(arithmetic_encode_to_bytes(s).is_err());
}

#[test]
fn arithmetic_empty_error() {
    let s = "";
    assert!(arithmetic_encode_to_bytes(s).is_err());
}
