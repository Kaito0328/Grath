# Inspector CLI コマンドリファレンス

Inspector は、Rust コードの解析、テストケース生成、Notion 同期を行う CLI ツールです。

## 基本的な使い方

プロジェクトルート（`rust-crate`）で以下の形式で実行します。

```bash
cargo run -p inspector -- <サブコマンド> [オプション]
```

最頻出の開発フローは「サブコマンド省略（= dev パイプライン）」です。

```bash
# dev パイプライン（生成系を一気に更新）
cargo run -p inspector --

# 特定クレートだけ
cargo run -p inspector -- -n algebraic

# Notion も含めてフル同期
cargo run -p inspector -- full
```

頻繁に使う場合はバイナリ化も推奨です。

```bash
cd rust-crate
cargo build -p inspector --release
./target/release/inspector --help
```

## サブコマンド一覧

### 0. `dev` (default)

生成系をまとめて更新します（`inspector` 単体と同じ動作）。

実行内容:

1. `spec`
2. `runner`
3. `wasm-gen`
4. `wasm-build`
5. `ts`
6. `ts-test`

```bash
cargo run -p inspector --
cargo run -p inspector -- dev
cargo run -p inspector -- dev -n algebraic
```

### 0.5. `full`

`dev` + Notion 同期/取得（`NOTION_API_KEY` がある場合）まで実行します。

```bash
cargo run -p inspector -- full
cargo run -p inspector -- full -n algebraic
```

### 1. `spec`

Rust コードを解析し、API 仕様書（JSON）を生成します。

- **概要**: `crates/` 以下のコードを解析し、構造体や関数の情報を抽出して JSON ファイルに保存します。
- **オプション**:
- `-n, --crate-name <NAME>`: 特定のクレートのみ対象にする（省略時は設定ファイルの全ターゲット）。
- `--source-dir <PATH>`: ソースディレクトリ（デフォルト: `crates`）。
- `--output-dir <PATH>`: 出力先ディレクトリ（デフォルト: `api-specs`）。

```bash
# 全対象クレートのJSONを生成
cargo run -p inspector -- spec

# 'algebraic' クレートのみ生成
cargo run -p inspector -- spec -n algebraic

```

### 2. `runner`

生成された API 仕様書（JSON）を元に、テストランナーコードを生成します。

- **概要**: JSON を読み込み、各関数を動的に呼び出すための Rust コード (`runner_xxx.rs` と `mod.rs`) を生成します。
- **オプション**:
- `-n, --crate-name <NAME>`: 特定のクレートのみ対象にする。
- `--specs-dir <PATH>`: JSON ファイルの場所（デフォルト: `api-specs`）。
- `--output-dir <PATH>`: 生成コードの出力先（デフォルト: `integration-tests/tests/common`）。

```bash
cargo run -p inspector -- runner

```

### 3. `fetch-tests`

Notion からテストケースを取得し、YAML ファイルとして保存します。

- **概要**: Notion の `TestCases` データベースからデータを取得し、`integration-tests/test_cases/` に YAML ファイル (`algebraic.yml` 等) として保存します。
- **オプション**:
- `--output-dir <PATH>`: 出力先ディレクトリ（デフォルト: `integration-tests/test_cases`）。

```bash
cargo run -p inspector -- fetch-tests

```

### 4. `push-tests`

ローカルの YAML ファイルを Notion にアップロードします。

- **概要**: `integration-tests/test_cases/` 以下の YAML ファイルを読み込み、Notion の `TestCases` データベースに新規登録します（重複チェックあり）。AI に生成させたテストケースを Notion に反映させる際に使用します。
- **オプション**:
- `--input-dir <PATH>`: 入力元ディレクトリ（デフォルト: `integration-tests/test_cases`）。

```bash
cargo run -p inspector -- push-tests

```

### 5. `sync`

API 仕様書（JSON）の内容を Notion に同期します。

- **概要**: 構造体や関数の定義情報を Notion の `Types` / `Functions` データベースに反映します。
- **オプション**:
- `-n, --crate-name <NAME>`: **(必須)** 同期するクレート名。
- `--specs-dir <PATH>`: JSON ファイルの場所（デフォルト: `api-specs`）。

```bash
# 'algebraic' クレートの情報をNotionに同期
cargo run -p inspector -- sync -n algebraic

```

### 6. `wasm-gen`

JSON spec から wasm クレート（`rust-crate/wasm/src`）のソースを生成します。

```bash
cargo run -p inspector -- wasm-gen
cargo run -p inspector -- wasm-gen -n algebraic
```

### 7. `wasm-build`

wasm-pack で wasm パッケージをビルドします。

```bash
cargo run -p inspector -- wasm-build
```

### 8. `ts`

JSON spec から TypeScript wrapper を生成します。

```bash
cargo run -p inspector -- ts
cargo run -p inspector -- ts -n algebraic
```

### 9. `ts-test`

YAML test_cases から TypeScript テスト（vitest）を生成します。

```bash
cargo run -p inspector -- ts-test
cargo run -p inspector -- ts-test -n algebraic
```

### 9.5. `error-messages`

Rust のエラー enum（thiserror + AsRefStr）から、フロントエンド用の
「error code → 表示メッセージ」マップ（`.generated.ts`）を生成します。

出力先はデフォルトで以下です。

- 通常クレート: `../web-app/src/features/<crate>/config/errorCodeMessages.generated.ts`
- common クレート: `../web-app/src/shared/errors/commonErrorCodeMessages.generated.ts`

また、対応する「手編集用」設定ファイルが存在しない場合は、テンプレを自動生成します（既存ファイルは上書きしません）。

- 通常クレート: `../web-app/src/features/<crate>/config/errorCodeMessages.ts`（common との合成 + overrides + `<crate>ErrorToDisplayMessage` ラッパ）
- common クレート: `../web-app/src/shared/errors/commonErrorCodeMessages.ts`（generated + overrides の合成）

```bash
cargo run -p inspector -- error-messages -n algebraic

# common だけ更新
cargo run -p inspector -- error-messages -n common
```

### 10. `test`

Notion からテストケースを取得してから integration-tests を実行します。

```bash
cargo run -p inspector -- test
```

---

## 設定ファイル (`inspector_config.json`)

ルートディレクトリに配置します。

```json
{
  "target_crates": [], // 空配列にしておくと自動検知される
  "ignored_crates": ["common", "core", "wasm", "integration-tests"], // 除外リスト
  "test_runner": {
    "imports": [ ... ],
    "extra_attributes": [ ... ]
  }
}

```

## 典型的なワークフロー

1. **コード変更時**:
   `cargo run -p inspector --`（= dev）
2. **AI にテストを書かせた後**:
   `cargo run -p inspector -- push-tests` (YAML -> Notion)
3. **Notion でテストを修正した後**:
   `cargo run -p inspector -- fetch-tests` (Notion -> YAML)
4. **テスト実行**:
   `cargo test -p integration-tests`

---

## 公開ルール（Wasm/TS 自動化を壊さないための前提）

このプロジェクトの自動化は「Rust の公開 API(pub)」を出発点にしますが、現状の Wasm 境界には制約があります。

### 1) Wasm に出せる引数/返り値（現状）

- プリミティブ: `i64/u64/...`（TS では `bigint`/`number` などへ）
- `bool`
- `String` / `&str`
- 生成された Wasm wrapper 型（例: `WasmRational`）

未対応（= そのままでは自動生成されない/されても動かない）:

- `Vec<T>` などのコレクション
- enum 的な型（例: `Token`）や、複雑なエラー型をそのまま JS へ公開

### 2) TS テストケース運用（yml）

- `integration-tests/test_cases/<crate>.yml` を正として、Rust 側/TS 側のテストを自動生成します。
- `fromString` / `toString` による入出力が前提です。
- wasm-bindgen が move 消費する値（`self` by-value / 引数 by-value）は、生成テストで `free()` しない設計にしています。

### 3) 新しいクレート追加時の最小作業

基本は以下だけで進められる状態を目標にしています。

- 公開したい型/関数を `pub` にする
- その型が `FromStr` / `Display`（少なくとも `fromString` / `toString` に相当）で扱えるようにする
- `Vec<T>` を API 境界に出さない（必要なら、固定個引数の API に分ける等）

この条件を満たす限り、`pipeline --preset dev` で生成物をまとめて更新できます。
