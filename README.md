# Grath

Grath は、数学・情報通信分野の計算を Rust で実装し、WebAssembly を通じて Next.js の Web アプリから利用するモノレポです。数値計算だけでなく、有理数や記号式を扱う厳密計算も対象にします。

## アーキテクチャ

```text
rust-crate/crates/<crate>
  └─ API marker / DTO / YAML test cases
       ↓ inspector dev
api-specs / Rust runner / WASM export
       ↓
web-app/generated/client-sdk
       ↓
web-app (Next.js)
```

`web-app/generated/client-sdk` が TypeScript SDK と WASM パッケージの唯一の正本です。画面コードは SDK の safe API または DTO Type API class を利用し、WASM の初期化・bind を直接扱いません。

## 主なディレクトリ

| ディレクトリ | 役割 |
| --- | --- |
| `rust-crate/` | Rust workspace、Inspector、WASM crate、統合テスト |
| `rust-crate/crates/` | 数学・符号理論・統計・信号処理などの計算 crate |
| `rust-crate/tools/inspector/` | Rust API から spec / WASM / SDK / テストを生成するツール |
| `web-app/` | Next.js アプリケーション |
| `web-app/generated/client-sdk/` | 生成済み SDK と WASM の正本 |
| `docs/` | 開発・SDK・デプロイのドキュメント |

## 開発を始める

必要なものは Rust、Node.js/npm、`wasm32-unknown-unknown` target、`wasm-pack` です。

```bash
# Rust → WASM → SDK を生成
cd rust-crate
cargo run -p inspector -- dev

# Web アプリを起動
cd ../web-app
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。`npm run dev` / `npm run build` は事前に Inspector を実行するため、Rust API の変更を SDK/WASM に反映します。

## API を追加する

新規 crate では、原則として次だけを手書きします。

1. Rust API と `GrathCrateApi` または `GrathTypeApi` marker
2. DTO にする型の `Serialize` / `Deserialize` / `GrathDto`
3. YAML テストケース

その後、次を実行します。

```bash
cd rust-crate
cargo run -p inspector -- dev -n <crate>
```

詳しい手順は [新クレート追加手順](docs/adding-a-crate-e2e.md) を参照してください。

## 検証

```bash
# Rust
cd rust-crate
cargo test --workspace

# Web / 生成済み SDK の Vitest を含む
cd ../web-app
npm test
npm run build
```

## ドキュメント

- [ドキュメント一覧](docs/README.md)
- [新クレート追加手順](docs/adding-a-crate-e2e.md)
- [SDK の責務境界](docs/client-sdk-boundary.md)
- [WASM API パイプライン計画と実装状況](docs/wasm-api-pipeline-refactor-plan.md)
- [Vercel デプロイ](docs/deploy-vercel.md)

