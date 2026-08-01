use source_coding::{
    lz78_decode_from_bytes, lz78_decode_var_from_bytes, lz78_encode_to_bytes,
    lz78_encode_var_to_bytes,
};

#[test]
fn lz78_fixed_roundtrip() {
    let s = "TOBEORNOTTOBEORTOBEORNOT"; // 典型的なLZ78例
    let bytes = lz78_encode_to_bytes(s).unwrap();
    let out = lz78_decode_from_bytes(&bytes).unwrap();
    assert_eq!(out, s);
}

#[test]
fn lz78_var_roundtrip() {
    let s = "ABRACADABRA";
    let bytes = lz78_encode_var_to_bytes(s).unwrap();
    let out = lz78_decode_var_from_bytes(&bytes).unwrap();
    assert_eq!(out, s);
}

#[test]
fn lz78_empty() {
    let s = "";
    assert!(lz78_encode_to_bytes(s).unwrap().is_empty());
    assert!(lz78_encode_var_to_bytes(s).unwrap().is_empty());
}
