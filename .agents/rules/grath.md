# プロジェクト規約: Grath

このドキュメントは、プロジェクト「Grath」における開発の基本ルールと現在の実装状況を定義します。

## 1. プロジェクト概要
Grathは、**「数学を直感的に、かつ厳密に扱う」**ことを目的とした数式処理プラットフォームです。
単なる数値計算（浮動小数点数）にとどまらず、有理数を用いた「誤差のない計算」や、文字式（記号）をそのまま扱う「代数計算」を中核としています。

- **バックエンド (Rust)**: 計算の正確性と速度の両立。WASM（WebAssembly）としてビルドされ、フロントエンドからシームレスに呼び出されます。
- **フロントエンド (Next.js)**: 数式を美しく表示し（LaTeX）、直感的な操作を可能にするプレミアムなUIを提供します。

## 2. ディレクトリ構成
- `rust-crate/`: Rustによる計算エンジン（バックエンド）
  - `crates/algebraic/`: 基本的な数式処理（有理数、記号式、簡約化など）
  - `crates/linalg/`: 線形代数演算（行列分解、逆行列など）
- `web-app/`: React/Next.jsによるインターフェース（フロントエンド）
  - `src/features/`: 機能ごとのモジュール（`algebraic`, `linalg` など）
  - `src/design/`: デザインシステム、基本コンポーネント（`BaseComponent`）
  - `src/shared/`: 共通ユーティリティ（変数管理、クリップボードなど）
- `web-app/generated/client-sdk/`: Inspector が生成する TypeScript SDK と WASM パッケージの正本

## 3. 固定ルール（原則変更禁止）

### 3.1 コミュニケーションと報告
- 実装計画の提示（`implementation_plan.md`）、進捗状況（`task.md`）、結果報告（`walkthrough.md`）を含む**全てのアーティファクト、およびユーザーへの報告は必ず日本語で行うこと。**

### 3.2 開発環境とコマンド実行
- `run_command` などのツールを使用してコマンド（特に `cargo test` など）を実行する際、プロセスの終了判定がフリーズする場合がある。これを防ぐため、必ず **`bash -c "コマンド"`** の形式で実行し、プロセスが確実に終了するようにすること。

### 3.3 フロントエンド実装
- 素のHTMLタグ（`div`, `span`, `input`, `button` など）を直接使用せず、必ずデザインシステムの **`BaseComponent`**（`Stack`, `Flex`, `View`, `Text`, `Input`, `Button` など）を使用すること。
- コンポーネントは可能な限り細かく分割し、単一責任の原則に従って保守性を高めること。

### 3.4 テストと検証
- バックエンド（Rust）の実装が完了した際は、必ず `test_cases.yml` を追加し、バックエンド・フロントエンド両方のテストコードが正常に実行・通過することを確認すること。

---

## 4. 自動化システム（Inspector パイプライン）

### 4.1 概要

`rust-crate/tools/inspector` は、Rust の crate から WASM・TypeScript・テストを一気通貫で自動生成するコード生成エンジンです。  
`cargo run -p inspector -- dev` を実行するだけで、以下の 7 ステップが順番に実行されます。

### 4.2 パイプライン全体像

```
Rust crates/
  └── crates/<crate>/src/api.rs  (手書き: *Api struct + impl)
            │
            ▼  Step 1: spec
  api-specs/<crate>.json          (AST 解析 → メタ情報 JSON)
            │
            ├─ Step 1.5 → web-app/src/features/<crate>/config/errorCodeMessages.generated.ts
            ├─ Step 2  → integration-tests/tests/common/runner_<crate>.rs
            ├─ Step 3  → wasm/src/<crate>.rs  +  wasm/src/lib.rs (mod 追記)
            ├─ Step 4  → web-app/generated/client-sdk/wasm-pkg/  (wasm-pack build)
            ├─ Step 5  → web-app/generated/client-sdk/src/wrappers/<crate>.ts
            ├─ Step 5.5→ web-app/generated/client-sdk/src/api/<crate>Api.ts
            └─ Step 6  → web-app/generated/client-sdk/src/tests/<crate>.test.ts
```

#### 各ステップ詳細

| Step | コマンド単体 | 入力 | 出力 | 備考 |
|------|---|---|---|---|
| 1. spec | `inspector spec` | `crates/<crate>/src/` | `api-specs/<crate>.json` | pub impl ブロックのみ対象 |
| 1.5. error messages | (devに内包) | spec JSON | `errorCodeMessages.generated.ts` | エラーコード→ メッセージマップ |
| 2. runner | `inspector runner` | spec JSON + YAML | `runner_<crate>.rs` | YAML が必須、なければ SKIP |
| 3. wasm source | `inspector wasm-gen` | spec JSON | `wasm/src/<crate>.rs` | `use <crate>::*;` 前提 |
| 4. wasm build | `inspector wasm-build` | `wasm/` crate | `wasm-pkg/` | wasm-pack bundler target |
| 5. TS wrapper | `inspector ts` | spec JSON | `wrappers/<crate>.ts` | `setWasmFromWasmLib()` パターン |
| 5.5. TS safe API | `inspector ts-api` | spec JSON | `api/<crate>Api.ts` | 型安全ラッパー + エラーハンドリング |
| 6. TS tests | `inspector ts-test` | spec JSON + YAML | `tests/<crate>.test.ts` | YAML が必須、なければ SKIP |

### 4.3 テストケース YAML 仕様

テストケースは `rust-crate/integration-tests/test_cases/<crate>.yml` に置く。  
形式は以下のとおり。`function` は `StructName::method_name` 形式で指定する。

```yaml
- function: ConcreteMathApi::nt_gcd
  inputs: ["48", "18"]
  expected: "6"

- function: StatisticsApi::get_descriptive_stats
  inputs: ["1,2,3"]
  expected: '{"mean":2.0,"median":2.0,...}'
```

- `inputs`: 全引数を文字列で列挙（型変換は runner 側が行う）
- `expected`: 文字列比較。JSON を返す関数は JSON 文字列をそのまま書く
- **YAML 追加後は必ず `cargo run -p inspector -- runner` を実行**して runner_*.rs を更新すること

### 4.4 新規 crate 追加チェックリスト

新しい crate を追加する際、手動で行う作業は以下だけ：

| # | 作業 | ファイル |
|---|------|---------|
| 1 | API 実装（必須） | `crates/<crate>/src/api.rs` に `pub struct *Api` + `impl *Api` |
| 2 | inspector 対象に追加 | `rust-crate/inspector_config.json` の `target_crates` に追記 |
| 3 | integration-tests 依存追加 | `integration-tests/Cargo.toml` に `<crate> = { path = "../crates/<crate>" }` |
| 4 | テストケース YAML 作成 | `integration-tests/test_cases/<crate>.yml` |
| 5 | `pub use` 再エクスポート | `crates/<crate>/src/lib.rs` で、wasm から使う型を crate root に出す |

その後 `cargo run -p inspector -- dev` を実行すると上記 7 ステップが全自動で走る。

### 4.5 注意事項・既知の制約

- **対象は `pub impl` のみ**: フリー関数（`pub fn`）は自動生成の対象外。フロントから使いたい API は必ず `*Api` struct の impl にラップすること。
- **手動ファイルは上書きされない**: `wasm/src/<crate>_manual.rs` など `_manual` サフィックスのファイルは自動生成の対象外。`lib.rs` への mod 追記は inspector が行う。
- **i64/u64 の TS 型**: wasm-bindgen は i64/u64 を `bigint` として生成するが、`ts_gen` が `Number(...)` で正規化して `number` として公開する。
- **TS テスト実行**: 生成された `tests/<crate>.test.ts` は vitest の include 対象に入っている必要がある（下記参照）。

### 4.6 フロントエンド TS テストの実行

生成された `web-app/generated/client-sdk/src/tests/*.test.ts` を vitest で実行するには、`web-app/vitest.config.ts` の `include` に以下を追加する：

```ts
include: [
  'src/__tests__/**/*.test.ts',
  'src/__tests__/**/*.test.tsx',
  'generated/client-sdk/src/tests/**/*.test.ts',  // ← 追加
],
```

wasm の bundler target は Vite が `.wasm` ファイルを処理するため、`optimizeDeps.exclude: ['wasm-lib']` で事前バンドルを除外しておく。

### 4.7 現在の自動化カバレッジ

| crate | api.rs | YAML | Rust test | TS test 生成 | TS test 実行 |
|---|---|---|---|---|---|
| algebraic | ✅ | ✅ | ✅ | ✅ | ✅（vitest include 済み） |
| polynomial | ✅ | ✅ | ✅ | ✅ | ✅ |
| linalg | ✅ | ✅ | ✅ | ✅ | ✅ |
| finite-field | ✅ | ✅ | ✅ | ✅ | ✅ |
| source-coding | ✅ | ✅ | ✅ | ✅ | ✅ |
| signal-processing | ✅ | ✅ | ✅ | ✅ | ✅ |
| coding | ✅ | ✅ | ✅ | ✅ | ✅ |
| concrete-math | ✅ | ✅ | ✅ | ❌ 未生成 | ❌ |
| statistics | ✅ | ✅ | ✅ | ❌ 未生成 | ❌ |

concrete-math / statistics は `inspector dev` の再実行で TS test を生成済みにできる。

---

## 5. 現在の実装状況と個別ルール（随時更新）

### 現在のフェーズ
- 線形代数（linalg）機能の独立したフィーチャー化とUIリファクタリングの完了。
- 記号計算（algebraic）における同類項の結合ロジックの強化済み。
- 行列演算への「コピー」「変数保存」「変数代入」機能の実装済み。
- inspector パイプライン整備完了（statistics・concrete-math crate 追加済み）。

### 個別留意事項
- `features/linalg` は `features/algebraic` に内包せず、トップレベルの機能として扱う。
- 変数管理には `variableManager` ストアを使用し、`linalg.matrix` などの正しい `kind` を指定すること。
- 記号式の簡約化が必要な場合は、`SymbolicExpr::simplify()` を適切に呼び出すこと。
