// --- Auto-generated Test Runner ---
#![allow(unused_imports)]
#![allow(non_snake_case)]
#![allow(unused_mut)]
#![allow(clippy::match_single_binding)]
#![allow(unused_variables)]

use coding::prelude::*;
use coding::*;
use std::collections::{BTreeMap, HashMap};
use std::str::FromStr;


fn vec_to_csv<T: ToString>(v: &[T]) -> String {
    v.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(",")
}

pub fn run_dynamic_test(func_key: &str, inputs: &[String]) -> std::result::Result<String, String> {
    match func_key {
        "CodingApi::hamming74_encode_len" => {
            let arg0 = inputs[0].to_string();

            let result = CodingApi::hamming74_encode_len(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "CodingApi::linear_code_gf5_third" => {
            let arg0 = inputs[0].to_string();
            let arg1 = inputs[1].to_string();

            let result = CodingApi::linear_code_gf5_third(arg0, arg1).map_err(|e| format!("{:?}", e))?;
            Ok(result.to_string())
        },
        "DtoFixtureApi::batch" => {
            let arg0: Vec < DtoPoint > = serde_json::from_str(&inputs[0]).map_err(|e| format!("Parse DTO arg0 error: {}", e))?;

            let result = DtoFixtureApi::batch(arg0);
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        },
        "DtoFixtureApi::maybe" => {
            let arg0: Option < DtoPoint > = serde_json::from_str(&inputs[0]).map_err(|e| format!("Parse DTO arg0 error: {}", e))?;

            let result = DtoFixtureApi::maybe(arg0);
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        },
        "DtoFixtureApi::pair" => {
            let arg0: (DtoPoint , i32) = serde_json::from_str(&inputs[0]).map_err(|e| format!("Parse DTO arg0 error: {}", e))?;

            let result = DtoFixtureApi::pair(arg0);
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        },
        "DtoFixtureApi::fixed" => {
            let arg0: [DtoPoint ; 2] = serde_json::from_str(&inputs[0]).map_err(|e| format!("Parse DTO arg0 error: {}", e))?;

            let result = DtoFixtureApi::fixed(arg0);
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        },
        "DtoFixtureApi::by_name" => {
            let arg0: BTreeMap < String , DtoPoint > = serde_json::from_str(&inputs[0]).map_err(|e| format!("Parse DTO arg0 error: {}", e))?;

            let result = DtoFixtureApi::by_name(arg0);
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        },
        "DtoFixtureApi::label" => {
            let arg0: DtoLabel = serde_json::from_str(&inputs[0]).map_err(|e| format!("Parse DTO arg0 error: {}", e))?;

            let result = DtoFixtureApi::label(arg0);
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        },
        "DtoFixtureApi::nested" => {
            let arg0: Option < DtoPoint > = serde_json::from_str(&inputs[0]).map_err(|e| format!("Parse DTO arg0 error: {}", e))?;

            let result = DtoFixtureApi::nested(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        },
        "DtoFixtureApi::checked" => {
            let arg0: DtoPoint = serde_json::from_str(&inputs[0]).map_err(|e| format!("Parse DTO arg0 error: {}", e))?;

            let result = DtoFixtureApi::checked(arg0).map_err(|e| format!("{:?}", e))?;
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        },
        _ => Err(format!("Unknown function: {}", func_key)),
    }
}
