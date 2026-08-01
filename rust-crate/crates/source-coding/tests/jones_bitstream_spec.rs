use source_coding::{decode_jones_from_bytes, encode_jones_to_bytes};

#[test]
fn jones_roundtrip_basic() {
    let s = "HELLO_JONES_CODE";
    let bytes = encode_jones_to_bytes(s).unwrap();
    let dec = decode_jones_from_bytes(&bytes).unwrap();
    assert_eq!(s, dec);
}

#[test]
fn jones_roundtrip_repeated() {
    let s = "AAAAAAAABBBBCCCCDDDE";
    let bytes = encode_jones_to_bytes(s).unwrap();
    let dec = decode_jones_from_bytes(&bytes).unwrap();
    assert_eq!(s, dec);
}
