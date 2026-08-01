// --- Auto-generated Test Runner ---
#![allow(unused_imports)]
#![allow(non_snake_case)]
#![allow(unused_mut)]
#![allow(clippy::match_single_binding)]
#![allow(unused_variables)]

use signal_processing::prelude::*;
use signal_processing::*;
use std::collections::{BTreeMap, HashMap};
use std::str::FromStr;

fn vec_to_csv<T: ToString>(v: &[T]) -> String {
    v.iter()
        .map(|x| x.to_string())
        .collect::<Vec<_>>()
        .join(",")
}

pub fn run_dynamic_test(func_key: &str, inputs: &[String]) -> std::result::Result<String, String> {
    match func_key {
        "SignalProcessingApi::conv_simple_f64" => {
            let raw = inputs[0].trim();
            let raw = raw.trim_start_matches('[').trim_end_matches(']');
            let arg0 = if raw.is_empty() {
                Vec::new()
            } else {
                raw.split(',')
                    .map(|s| s.trim().parse())
                    .collect::<std::result::Result<Vec<_>, _>>()
                    .map_err(|e| format!("Parse arg0 Vec error: {}", e))?
            };
            let raw = inputs[1].trim();
            let raw = raw.trim_start_matches('[').trim_end_matches(']');
            let arg1 = if raw.is_empty() {
                Vec::new()
            } else {
                raw.split(',')
                    .map(|s| s.trim().parse())
                    .collect::<std::result::Result<Vec<_>, _>>()
                    .map_err(|e| format!("Parse arg1 Vec error: {}", e))?
            };

            let result = SignalProcessingApi::conv_simple_f64(arg0, arg1);
            Ok(vec_to_csv(&result))
        }
        "SignalProcessingApi::decimate" => {
            let raw = inputs[0].trim();
            let raw = raw.trim_start_matches('[').trim_end_matches(']');
            let arg0 = if raw.is_empty() {
                Vec::new()
            } else {
                raw.split(',')
                    .map(|s| s.trim().parse())
                    .collect::<std::result::Result<Vec<_>, _>>()
                    .map_err(|e| format!("Parse arg0 Vec error: {}", e))?
            };
            let arg1 = inputs[1]
                .parse::<usize>()
                .map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = SignalProcessingApi::decimate(arg0, arg1);
            Ok(vec_to_csv(&result))
        }
        "SignalProcessingApi::expand" => {
            let raw = inputs[0].trim();
            let raw = raw.trim_start_matches('[').trim_end_matches(']');
            let arg0 = if raw.is_empty() {
                Vec::new()
            } else {
                raw.split(',')
                    .map(|s| s.trim().parse())
                    .collect::<std::result::Result<Vec<_>, _>>()
                    .map_err(|e| format!("Parse arg0 Vec error: {}", e))?
            };
            let arg1 = inputs[1]
                .parse::<usize>()
                .map_err(|e| format!("Parse arg1 error: {}", e))?;

            let result = SignalProcessingApi::expand(arg0, arg1);
            Ok(vec_to_csv(&result))
        }
        _ => Err(format!("Unknown function: {}", func_key)),
    }
}
