use crate::notion::cache::SyncCache;
use crate::notion::NotionSyncer;
use crate::types::{ApiReport, FunctionInfo, StructInfo};
use anyhow::Result;
use regex::Regex;
use serde_json::json;
use std::collections::{HashMap, HashSet};

impl NotionSyncer {
    pub async fn sync_code(&mut self, report: &ApiReport) -> Result<()> {
        let cache = SyncCache::load();
        let mut new_cache = SyncCache::default();

        // 1. Structs
        for info in &report.structs {
            let hash = SyncCache::calculate_hash(info);
            let key = format!("struct::{}", info.name);

            if cache.hashes.get(&key) != Some(&hash) {
                self.sync_struct(info).await?;
            } else {
                println!("Skipping unchanged struct: {}", info.name);
            }
            new_cache.hashes.insert(key, hash);
        }

        // 2. Functions
        println!("Refreshing Type Map for linking functions...");
        // 関数同期のために最新のType IDマップを取得
        let type_name_to_id = self.api.fetch_db_map(&self.types_db_id).await?;

        for block in &report.impl_blocks {
            for func in &block.functions {
                let hash = SyncCache::calculate_hash(func);
                let key = format!("fn::{}::{}", block.target_struct, func.name);

                if cache.hashes.get(&key) != Some(&hash) {
                    self.sync_function(
                        func,
                        &block.target_struct,
                        &block.crate_name,
                        &type_name_to_id,
                    )
                    .await?;
                } else {
                    println!(
                        "Skipping unchanged function: {}::{}",
                        block.target_struct, func.name
                    );
                }
                new_cache.hashes.insert(key, hash);
            }
        }

        new_cache.save();
        Ok(())
    }

    async fn sync_struct(&mut self, info: &StructInfo) -> Result<()> {
        print!("Struct: {} ... ", info.name);
        let mut properties = json!({
            "Name": { "title": [{ "text": { "content": info.name } }] },
            "Description": { "rich_text": [{ "text": { "content": info.doc } }] },
        });

        if !info.crate_name.is_empty() && info.crate_name != "unknown" {
            let crate_id = self.get_or_create_crate_id(&info.crate_name).await?;
            properties.as_object_mut().unwrap().insert(
                "Crate".to_string(),
                json!({ "relation": [{ "id": crate_id }] }),
            );
        }

        let children = json!([
            { "object": "block", "type": "heading_2", "heading_2": { "rich_text": [{ "text": { "content": "Fields" } }] } },
            { "object": "block", "type": "code", "code": { "language": "rust", "rich_text": [{ "text": { "content": info.fields.join("\n") } }] } }
        ]);

        // Structは名前で検索 (重複しない前提)
        let existing_id = self
            .find_page_id_by_name(&info.name, &self.types_db_id)
            .await?;

        if let Some(page_id) = existing_id {
            self.api.update_page(&page_id, properties).await?;
            println!("Updated.");
        } else {
            self.api
                .create_page(&self.types_db_id, properties, Some(children))
                .await?;
            println!("Created.");
        }
        Ok(())
    }

    async fn sync_function(
        &mut self,
        info: &FunctionInfo,
        parent_type: &str,
        _crate_name: &str,
        type_name_to_id: &HashMap<String, String>,
    ) -> Result<()> {
        let key = format!("{}::{}", parent_type, info.name);
        print!("Fn: {} ... ", key);

        let signature = format!(
            "fn {}({}) -> {}",
            info.name,
            info.args.join(", "),
            info.return_type
        );

        let parent_id_opt = type_name_to_id.get(parent_type);
        let parent_relation = if let Some(id) = parent_id_opt {
            json!([{ "id": id }])
        } else {
            json!([])
        };

        let related_ids = self.extract_related_ids(&signature, type_name_to_id, parent_type);

        let properties = json!({
            "Name": { "title": [{ "text": { "content": info.name } }] },
            "Parent Type": { "relation": parent_relation },
            "Signature": { "rich_text": [{ "text": { "content": signature }, "annotations": { "code": true } }] },
            "Related Type": { "relation": related_ids },
            "Kind": { "select": { "name": self.guess_kind(info) } },
        });

        let children = json!([
            { "object": "block", "type": "heading_2", "heading_2": { "rich_text": [{ "text": { "content": "Implementation" } }] } },
            { "object": "block", "type": "code", "code": { "language": "rust", "rich_text": [{ "text": { "content": info.source_code } }] } }
        ]);

        // ★修正: 名前だけでなく、Parent Type も条件に含めて検索する
        let existing_id = self
            .find_function_page(&info.name, parent_id_opt.map(|s| s.as_str()))
            .await?;

        if let Some(page_id) = existing_id {
            self.api.update_page(&page_id, properties).await?;
            println!("Updated.");
        } else {
            self.api
                .create_page(&self.functions_db_id, properties, Some(children))
                .await?;
            println!("Created.");
        }
        Ok(())
    }

    // --- Helpers ---

    /// 名前と親タイプで関数ページを検索する (AND検索)
    async fn find_function_page(
        &self,
        name: &str,
        parent_id: Option<&str>,
    ) -> Result<Option<String>> {
        let mut filters = vec![json!({
            "property": "Name",
            "title": { "equals": name }
        })];

        if let Some(pid) = parent_id {
            filters.push(json!({
                "property": "Parent Type",
                "relation": { "contains": pid }
            }));
        }

        // 複合フィルタの作成
        let filter = json!({ "and": filters });

        let results = self
            .api
            .query_with_filter(&self.functions_db_id, filter)
            .await?;
        if let Some(first) = results.first() {
            return Ok(Some(first["id"].as_str().unwrap().to_string()));
        }
        Ok(None)
    }

    async fn get_or_create_crate_id(&mut self, crate_name: &str) -> Result<String> {
        if let Some(id) = self.crate_name_to_id.get(crate_name) {
            return Ok(id.clone());
        }
        println!("Crate '{}' not found in Notion. Creating...", crate_name);
        let properties = json!({ "Name": { "title": [{ "text": { "content": crate_name } }] } });
        let new_id = self
            .api
            .create_page(&self.crates_db_id, properties, None)
            .await?;

        self.crate_name_to_id
            .insert(crate_name.to_string(), new_id.clone());
        self.crate_id_to_name
            .insert(new_id.clone(), crate_name.to_string());
        Ok(new_id)
    }

    async fn find_page_id_by_name(&self, name: &str, db_id: &str) -> Result<Option<String>> {
        let filter = json!({
            "property": "Name",
            "title": { "equals": name }
        });
        let results = self.api.query_with_filter(db_id, filter).await?;
        if let Some(first) = results.first() {
            return Ok(Some(first["id"].as_str().unwrap().to_string()));
        }
        Ok(None)
    }

    fn guess_kind(&self, info: &FunctionInfo) -> String {
        if info.name == "new" || info.name == "rational" {
            "Constructor".to_string()
        } else if info.args.first().is_some_and(|a| a.contains("self")) {
            "Method".to_string()
        } else {
            "Static".to_string()
        }
    }

    fn extract_related_ids(
        &self,
        text: &str,
        type_map: &HashMap<String, String>,
        exclude: &str,
    ) -> serde_json::Value {
        let re = Regex::new(r"\b([A-Z][a-zA-Z0-9_]*)\b").unwrap();
        let mut ids = HashSet::new();
        for cap in re.captures_iter(text) {
            let type_name = &cap[1];
            if type_name != exclude {
                if let Some(id) = type_map.get(type_name) {
                    ids.insert(json!({ "id": id }));
                }
            }
        }
        json!(ids.into_iter().collect::<Vec<_>>())
    }
}
