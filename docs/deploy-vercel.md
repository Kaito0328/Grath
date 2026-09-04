# Vercel デプロイ手順（monorepo / Next.js / wasm-pkg 同梱）

このリポジトリの web-app は `web-app/generated/client-sdk/wasm-pkg`（生成済み WASM 成果物）を Git 管理して同梱し、ビルドできます。
Vercel 環境では通常 Rust / wasm-pack が無いため、**WASM を再生成しない**前提でデプロイします。

## 前提

- `web-app/generated/client-sdk/wasm-pkg` が配布対象に含まれること（特に `wasm_lib_bg.wasm`）
- `web-app` は `file:./generated/client-sdk` 依存

Inspector は `wasm-pack` が出力する `wasm-pkg/.gitignore` を生成後に削除します。
これにより WASM 成果物を通常の生成物として commit できます。

```bash
cd rust-crate
cargo run -p inspector -- dev
cd ..
git add web-app/generated/client-sdk/wasm-pkg
```

## Vercel 設定（推奨）

Vercel Project Settings で以下を設定します。

- Root Directory: `web-app`
- Install Command:
  - `npm ci`
- Build Command:
  - `npx next build`
- Output Directory:
  - (Next.js defaults)

メモ:

- `npx next build` は npm lifecycle を経由しないため、コミット済みの generated SDK/WASM をそのまま利用します。
- ローカルや CI で `npm run build` を使う場合は、`prebuild` が Inspector を実行して生成物を更新します。
- 生成済み WASM が無い場合は、`web-app` の依存解決またはビルドが失敗します。

## 環境変数（任意）

ローカル開発では web-app/.env.example をベースに web-app/.env.local を作成してください。

- `NEXT_PUBLIC_ERROR_MESSAGE_LEVEL`
  - `user`（推奨） or `debug`
- `NEXT_PUBLIC_LOCALE`
  - `ja` / `en`（未設定時は `navigator.language` → `ja`）

## GitHub 側の運用（推奨）

main ブランチ保護で以下のステータスチェックを必須にします（`.github/workflows/ci.yml`）。

- `Rust (fmt/clippy/test)`
- `Generated files are up-to-date`
- `web-app (test/build)`

これにより、Rust 側変更で generated / wasm-pkg の更新漏れがある場合に PR 時点で検出できます。
