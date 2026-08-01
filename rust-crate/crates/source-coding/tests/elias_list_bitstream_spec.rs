use source_coding::{decode_elias_list_from_bytes, encode_elias_list_to_bytes};

#[test]
fn elias_list_roundtrip_basic() {
    let vals = vec![1u64, 2, 3, 4, 5, 10, 100, 255, 256, 1024, 65535];
    let bytes = encode_elias_list_to_bytes(&vals).unwrap();
    let dec = decode_elias_list_from_bytes(&bytes).unwrap();
    assert_eq!(vals, dec);
}

#[test]
fn elias_list_empty() {
    let bytes = encode_elias_list_to_bytes(&[]).unwrap();
    assert!(bytes.is_empty());
    let dec = decode_elias_list_from_bytes(&bytes).unwrap();
    assert!(dec.is_empty());
}

#[test]
fn elias_list_single() {
    let vals = vec![123456u64];
    let bytes = encode_elias_list_to_bytes(&vals).unwrap();
    let dec = decode_elias_list_from_bytes(&bytes).unwrap();
    assert_eq!(vals, dec);
}
