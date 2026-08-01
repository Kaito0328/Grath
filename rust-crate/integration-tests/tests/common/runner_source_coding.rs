// --- Auto-generated Test Runner ---
#![allow(unused_imports)]
#![allow(non_snake_case)]
#![allow(unused_mut)]
#![allow(clippy::match_single_binding)]
#![allow(unused_variables)]

use source_coding::*;
use std::collections::{BTreeMap, HashMap};
use std::str::FromStr;


fn vec_to_csv<T: ToString>(v: &[T]) -> String {
    v.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(",")
}

pub fn run_dynamic_test(func_key: &str, inputs: &[String]) -> std::result::Result<String, String> {
    match func_key {
        "SourceCodingApi::huffman_roundtrip" => {
            let arg0 = inputs[0].to_string();

            let result = SourceCodingApi::huffman_roundtrip(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "SourceCodingApi::lz78_roundtrip" => {
            let arg0 = inputs[0].to_string();

            let result = SourceCodingApi::lz78_roundtrip(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "SourceCodingApi::arithmetic_roundtrip" => {
            let arg0 = inputs[0].to_string();

            let result = SourceCodingApi::arithmetic_roundtrip(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        _ => Err(format!("Unknown function: {}", func_key)),
    }
}
