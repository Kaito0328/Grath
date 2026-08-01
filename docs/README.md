# Grath ドキュメント

| 文書 | 用途 |
| --- | --- |
| [新クレート追加手順](adding-a-crate-e2e.md) | Rust API から WASM、SDK、テストまでを生成する手順 |
| [SDK の責務境界](client-sdk-boundary.md) | generated SDK と static scaffold の所有範囲 |
| [WASM API パイプライン計画](wasm-api-pipeline-refactor-plan.md) | アーキテクチャ、実装済み事項、残る DTO 移行 |
| [Vercel デプロイ](deploy-vercel.md) | 生成済み WASM を利用するデプロイ設定 |
| [GitHub ブランチ保護](github-branch-protection.md) | GitHub を使う場合の任意の CI/保護設定 |

日常の開発では、root の [README](../README.md) を入口にし、crate 追加時だけ「新クレート追加手順」を参照してください。
