use crate::notion::model::TestCaseYaml;
use crate::notion::NotionSyncer;
use anyhow::Result;
use serde_json::json;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

impl NotionSyncer {
    // -------------------------------------------------------------------------
    // FETCH: Notion -> YAML
    // -------------------------------------------------------------------------
    pub async fn fetch_test_cases_to_yaml(&self, output_dir: &str) -> Result<()> {
        let pages = self.api.query_database(&self.test_cases_db_id).await?;
        let mut crate_map: HashMap<String, Vec<TestCaseYaml>> = HashMap::new();

        for page in pages {
            let props = &page["properties"];

            // Target Function (Relation) から関数名とクレート名を解決
            let mut full_func_name = String::new(); // Struct::Func 形式にする
            let mut crate_name = "unknown".to_string();

            if let Some(rels) = props["Target Function"]["relation"].as_array() {
                if let Some(first) = rels.first() {
                    let func_id = first["id"].as_str().unwrap_or("");

                    // 1. 基本的な関数名 (例: "new")
                    let raw_func_name = self
                        .func_id_to_name
                        .get(func_id)
                        .cloned()
                        .unwrap_or_default();

                    // 2. 親構造体・クレートの解決
                    if let Some(parent_id) = self.func_id_to_parent_id.get(func_id) {
                        // ★修正: 親構造体名を取得して結合する
                        if let Some(struct_name) = self.type_id_to_name.get(parent_id) {
                            if !raw_func_name.is_empty() {
                                full_func_name = format!("{}::{}", struct_name, raw_func_name);
                            }
                        }

                        // クレート名の特定
                        if let Some(crate_id) = self.type_id_to_crate_id.get(parent_id) {
                            if let Some(name) = self.crate_id_to_name.get(crate_id) {
                                crate_name = name.clone();
                            }
                        }
                    }
                }
            }

            if full_func_name.is_empty() || crate_name == "unknown" {
                continue;
            }

            // Inputs parsing (JSON or Comma-separated)
            let inputs_str = props["Inputs"]["rich_text"]
                .get(0)
                .and_then(|t| t["text"]["content"].as_str())
                .unwrap_or("");

            let inputs: Vec<String> = if inputs_str.trim().starts_with('[') {
                serde_json::from_str(inputs_str).unwrap_or_default()
            } else if inputs_str.trim().is_empty() {
                vec![]
            } else {
                inputs_str
                    .split(',')
                    .map(|s| s.trim().to_string())
                    .collect()
            };

            let expected = props["Expected"]["rich_text"]
                .get(0)
                .and_then(|t| t["text"]["content"].as_str())
                .unwrap_or("")
                .to_string();

            crate_map.entry(crate_name).or_default().push(TestCaseYaml {
                function: full_func_name, // "Rational::new" の形式で保存
                inputs,
                expected,
                expected_error: None,
            });
        }

        // YAML書き出し
        fs::create_dir_all(output_dir)?;
        for (krate, cases) in crate_map {
            let mut cases = cases;
            cases.sort_by(|a, b| a.function.cmp(&b.function));

            let file_path = Path::new(output_dir).join(format!("{}.yml", krate));
            let f = fs::File::create(&file_path)?;
            serde_yaml::to_writer(f, &cases)?;
            println!(
                "Fetched {}: {} cases -> {:?}",
                krate,
                cases.len(),
                file_path
            );
        }
        Ok(())
    }

    // -------------------------------------------------------------------------
    // PUSH: YAML -> Notion
    // -------------------------------------------------------------------------
    pub async fn push_yaml_to_notion(&self, input_dir: &str) -> Result<()> {
        println!("Pushing YAML test cases to Notion...");

        // 既存チェック用セット
        let mut existing_cases = std::collections::HashSet::new();
        let existing_pages = self.api.query_database(&self.test_cases_db_id).await?;

        for page in existing_pages {
            let props = &page["properties"];
            let func_id = props["Target Function"]["relation"]
                .as_array()
                .and_then(|r| r.first())
                .and_then(|f| f["id"].as_str())
                .unwrap_or("");

            let inputs = props["Inputs"]["rich_text"]
                .get(0)
                .and_then(|t| t["text"]["content"].as_str())
                .unwrap_or("")
                .trim();

            let expected = props["Expected"]["rich_text"]
                .get(0)
                .and_then(|t| t["text"]["content"].as_str())
                .unwrap_or("")
                .trim();

            if !func_id.is_empty() {
                existing_cases.insert(format!("{}|{}|{}", func_id, inputs, expected));
            }
        }

        let dir = Path::new(input_dir);
        if !dir.exists() {
            return Ok(());
        }

        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.extension().is_some_and(|e| e == "yml") {
                let crate_name = path.file_stem().unwrap().to_str().unwrap().to_string();
                let content = fs::read_to_string(&path)?;
                let cases: Vec<TestCaseYaml> = serde_yaml::from_str(&content)?;

                for case in cases {
                    // case.function が "Rational::new" のようになっている前提
                    // FQN = "algebraic::Rational::new"
                    let fqn = format!("{}::{}", crate_name, case.function);

                    if let Some(func_id) = self.fqn_to_func_id.get(&fqn) {
                        // カンマ区切り文字列にする
                        let inputs_str = case.inputs.join(", ");

                        // 重複チェック
                        let sig = format!("{}|{}|{}", func_id, inputs_str, case.expected);
                        if existing_cases.contains(&sig) {
                            continue;
                        }

                        let props = json!({
                            "Name": { "title": [{ "text": { "content": format!("{} Test", case.function) } }] },
                            "Target Function": { "relation": [{ "id": func_id }] },
                            "Inputs": { "rich_text": [{ "text": { "content": inputs_str } }] },
                            "Expected": { "rich_text": [{ "text": { "content": case.expected } }] },
                            // Crate Relation
                            "Crate": { "relation": [{ "id": self.crate_name_to_id.get(&crate_name).unwrap() }] }
                        });

                        print!("Creating test for {} ... ", fqn);
                        self.api
                            .create_page(&self.test_cases_db_id, props, None)
                            .await?;
                        println!("OK");
                        existing_cases.insert(sig);
                    } else {
                        println!("Warning: Function ID not found for '{}'. Skipping.", fqn);
                    }
                }
            }
        }
        Ok(())
    }
}
