use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TestCaseYaml {
    pub function: String, // 例: "Rational::new"
    pub inputs: Vec<String>,
    #[serde(default)]
    pub expected: String,
    #[serde(default)]
    pub expected_error: Option<ExpectedErrorYaml>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExpectedErrorYaml {
    pub code: String,
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct SyncCache {
    pub hashes: std::collections::HashMap<String, u64>,
}
