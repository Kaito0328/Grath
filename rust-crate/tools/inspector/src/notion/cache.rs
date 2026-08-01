use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::collections::HashMap;
use std::fs;
use std::hash::{Hash, Hasher};

const CACHE_FILE: &str = "inspector_cache.json";

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct SyncCache {
    // "struct::Name" -> Hash, "fn::Type::Name" -> Hash
    pub hashes: HashMap<String, u64>,
}

impl SyncCache {
    /// キャッシュファイルを読み込む。存在しない場合は空のキャッシュを返す。
    pub fn load() -> Self {
        if let Ok(content) = fs::read_to_string(CACHE_FILE) {
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            Self::default()
        }
    }

    /// キャッシュをファイルに保存する。
    pub fn save(&self) {
        if let Ok(json) = serde_json::to_string_pretty(self) {
            let _ = fs::write(CACHE_FILE, json);
        }
    }

    /// 任意のハッシュ可能なオブジェクトから u64 ハッシュ値を計算する。
    pub fn calculate_hash<T: Hash>(t: &T) -> u64 {
        let mut s = DefaultHasher::new();
        t.hash(&mut s);
        s.finish()
    }
}
