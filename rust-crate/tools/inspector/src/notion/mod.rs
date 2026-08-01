pub mod api;
pub mod cache;
pub mod model;
pub mod sync_code;
pub mod sync_tests;

use crate::notion::api::NotionApi;
use anyhow::Result;
use std::collections::HashMap;
use std::env;

pub struct NotionSyncer {
    pub api: NotionApi,
    pub types_db_id: String,
    pub functions_db_id: String,
    pub test_cases_db_id: String,
    pub crates_db_id: String,

    // --- ID Maps ---
    // Crate Name -> Crate Page ID
    pub crate_name_to_id: HashMap<String, String>,
    pub crate_id_to_name: HashMap<String, String>,

    // Type ID -> Crate ID
    pub type_id_to_crate_id: HashMap<String, String>,
    // Type ID -> Type Name
    pub type_id_to_name: HashMap<String, String>,

    // Function ID -> Parent Type ID
    pub func_id_to_parent_id: HashMap<String, String>,
    // Function ID -> Function Name
    pub func_id_to_name: HashMap<String, String>,

    // "Crate::Type::Function" -> Function ID (Push時の検索用)
    pub fqn_to_func_id: HashMap<String, String>,
}

impl NotionSyncer {
    pub async fn new() -> Result<Self> {
        dotenv::dotenv().ok();
        let api_key = env::var("NOTION_API_KEY").expect("NOTION_API_KEY must be set");
        let api = NotionApi::new(api_key)?;

        let mut syncer = Self {
            api,
            types_db_id: env::var("NOTION_TYPES_DB_ID").expect("NOTION_TYPES_DB_ID not set"),
            functions_db_id: env::var("NOTION_FUNCTIONS_DB_ID")
                .expect("NOTION_FUNCTIONS_DB_ID not set"),
            test_cases_db_id: env::var("NOTION_TEST_CASES_DB_ID")
                .expect("NOTION_TEST_CASES_DB_ID not set"),
            crates_db_id: env::var("NOTION_CRATES_DB_ID").expect("NOTION_CRATES_DB_ID not set"),

            crate_name_to_id: HashMap::new(),
            crate_id_to_name: HashMap::new(),
            type_id_to_crate_id: HashMap::new(),
            type_id_to_name: HashMap::new(),
            func_id_to_parent_id: HashMap::new(),
            func_id_to_name: HashMap::new(),
            fqn_to_func_id: HashMap::new(),
        };

        syncer.load_maps().await?;
        Ok(syncer)
    }

    async fn load_maps(&mut self) -> Result<()> {
        println!("Loading Notion ID maps...");

        // 1. Crates
        let crates = self.api.fetch_db_map(&self.crates_db_id).await?;
        for (name, id) in crates {
            self.crate_name_to_id.insert(name.clone(), id.clone());
            self.crate_id_to_name.insert(id, name);
        }

        // 2. Types
        let types_pages = self.api.query_database(&self.types_db_id).await?;
        for page in types_pages {
            let id = page["id"].as_str().unwrap().to_string();
            let name = page["properties"]["Name"]["title"][0]["text"]["content"]
                .as_str()
                .unwrap_or("")
                .to_string();
            self.type_id_to_name.insert(id.clone(), name);

            if let Some(rels) = page["properties"]["Crate"]["relation"].as_array() {
                if let Some(first) = rels.first() {
                    if let Some(crate_id) = first["id"].as_str() {
                        self.type_id_to_crate_id.insert(id, crate_id.to_string());
                    }
                }
            }
        }

        // 3. Functions
        let func_pages = self.api.query_database(&self.functions_db_id).await?;
        for page in func_pages {
            let func_id = page["id"].as_str().unwrap().to_string();
            let func_name = page["properties"]["Name"]["title"][0]["text"]["content"]
                .as_str()
                .unwrap_or("")
                .to_string();
            self.func_id_to_name
                .insert(func_id.clone(), func_name.clone());

            if let Some(rels) = page["properties"]["Parent Type"]["relation"].as_array() {
                if let Some(first) = rels.first() {
                    if let Some(parent_id) = first["id"].as_str() {
                        self.func_id_to_parent_id
                            .insert(func_id.clone(), parent_id.to_string());

                        // FQN (Fully Qualified Name) マップ作成: "crate::Type::Func" -> func_id
                        if let Some(crate_id) = self.type_id_to_crate_id.get(parent_id) {
                            if let Some(crate_name) = self.crate_id_to_name.get(crate_id) {
                                if let Some(type_name) = self.type_id_to_name.get(parent_id) {
                                    let fqn =
                                        format!("{}::{}::{}", crate_name, type_name, func_name);
                                    self.fqn_to_func_id.insert(fqn, func_id);
                                }
                            }
                        }
                    }
                }
            }
        }

        println!(
            "Loaded maps: {} crates, {} types, {} functions.",
            self.crate_name_to_id.len(),
            self.type_id_to_name.len(),
            self.func_id_to_name.len()
        );
        Ok(())
    }
}
