use source_coding::{lz78_huffman_decode_from_bytes, lz78_huffman_encode_to_bytes};

#[test]
fn lz78_huffman_roundtrip_basic() {
    let s = "TOBEORNOTTOBEORTOBEORNOT";
    let bytes = lz78_huffman_encode_to_bytes(s).unwrap();
    let out = lz78_huffman_decode_from_bytes(&bytes).unwrap();
    assert_eq!(out, s);
}

#[test]
fn lz78_huffman_empty() {
    let s = "";
    let bytes = lz78_huffman_encode_to_bytes(s).unwrap();
    assert!(bytes.is_empty());
    let out = lz78_huffman_decode_from_bytes(&bytes).unwrap();
    assert_eq!(out, s);
}
