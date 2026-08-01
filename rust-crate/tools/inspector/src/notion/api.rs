use anyhow::Result;
use reqwest::Client;
use serde_json::json;
use std::collections::HashMap;

pub struct NotionApi {
    pub client: Client,
    pub api_key: String,
}

impl NotionApi {
    pub fn new(api_key: String) -> Result<Self> {
        let client = Client::builder().build()?;
        Ok(Self { client, api_key })
    }

    /// DB全体のマップ(Name->ID)を取得する
    pub async fn fetch_db_map(&self, db_id: &str) -> Result<HashMap<String, String>> {
        let url = format!("https://api.notion.com/v1/databases/{}/query", db_id);

        // fetch_db_map は全件取得なので filter は含めない
        let payload = json!({ "page_size": 100 });

        let resp = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Notion-Version", "2022-06-28")
            .json(&payload)
            .send()
            .await?;

        if !resp.status().is_success() {
            anyhow::bail!("Failed to fetch DB: {}", resp.text().await?);
        }

        let body: serde_json::Value = resp.json().await?;
        let mut map = HashMap::new();
        if let Some(results) = body["results"].as_array() {
            for page in results {
                let id = page["id"].as_str().unwrap().to_string();
                let props = &page["properties"];

                let title_opt = if let Some(t) = props.get("Name") {
                    t["title"].as_array()
                } else if let Some(t) = props.get("Title") {
                    t["title"].as_array()
                } else if let Some(t) = props.get("Function") {
                    t["title"].as_array()
                } else {
                    None
                };

                if let Some(title_arr) = title_opt {
                    if let Some(text) = title_arr
                        .first()
                        .and_then(|t| t["text"]["content"].as_str())
                    {
                        map.insert(text.to_string(), id);
                    }
                }
            }
        }
        Ok(map)
    }

    /// 任意のフィルタを指定して検索する
    pub async fn query_with_filter(
        &self,
        db_id: &str,
        filter: serde_json::Value,
    ) -> Result<Vec<serde_json::Value>> {
        let url = format!("https://api.notion.com/v1/databases/{}/query", db_id);

        // ★修正: デフォルトのペイロードを作成
        let mut payload = json!({ "page_size": 100 });

        // ★修正: filterが空オブジェクトでない場合のみ、ペイロードに追加する
        if let Some(obj) = filter.as_object() {
            if !obj.is_empty() {
                payload
                    .as_object_mut()
                    .unwrap()
                    .insert("filter".to_string(), filter);
            }
        }

        let resp = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Notion-Version", "2022-06-28")
            .json(&payload)
            .send()
            .await?;

        if !resp.status().is_success() {
            anyhow::bail!("Query failed: {}", resp.text().await?);
        }
        let body: serde_json::Value = resp.json().await?;
        Ok(body["results"].as_array().unwrap_or(&vec![]).clone())
    }

    /// 全件取得用
    pub async fn query_database(&self, db_id: &str) -> Result<Vec<serde_json::Value>> {
        // 空のJSONを送る -> query_with_filter 内で判定され無視される
        self.query_with_filter(db_id, json!({})).await
    }

    pub async fn create_page(
        &self,
        db_id: &str,
        props: serde_json::Value,
        children: Option<serde_json::Value>,
    ) -> Result<String> {
        let mut payload = json!({ "parent": { "database_id": db_id }, "properties": props });
        if let Some(c) = children {
            payload
                .as_object_mut()
                .unwrap()
                .insert("children".to_string(), c);
        }
        let resp = self
            .client
            .post("https://api.notion.com/v1/pages")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Notion-Version", "2022-06-28")
            .json(&payload)
            .send()
            .await?;

        if !resp.status().is_success() {
            anyhow::bail!("Failed to create page: {}", resp.text().await?);
        }
        let body: serde_json::Value = resp.json().await?;
        Ok(body["id"].as_str().unwrap().to_string())
    }

    pub async fn update_page(&self, page_id: &str, props: serde_json::Value) -> Result<()> {
        let resp = self
            .client
            .patch(format!("https://api.notion.com/v1/pages/{}", page_id))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Notion-Version", "2022-06-28")
            .json(&json!({ "properties": props }))
            .send()
            .await?;

        if !resp.status().is_success() {
            anyhow::bail!("Failed to update page: {}", resp.text().await?);
        }
        Ok(())
    }
}
