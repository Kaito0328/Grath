# GitHub ブランチ保護（個人開発向け）

個人開発でも、main を保護しておくと「うっかり壊す」「生成物更新漏れ」を大幅に減らせます。
このリポジトリでは GitHub Actions の CI が整備されているので、それを必須チェックにします。

## 前提

- default branch が `main`
- workflow は `.github/workflows/ci.yml`

## 設定手順

1. GitHub リポジトリの **Settings** → **Branches** を開く
2. **Branch protection rules** で **Add rule**
3. **Branch name pattern** に `main`
4. 以下を有効化（推奨）

- **Require a pull request before merging**
  - （任意）Require approvals: 0〜1（個人なら 0 でも OK）
- **Require status checks to pass before merging**
  - **Require branches to be up to date before merging**（任意）
  - 必須チェックに次を追加:
    - `Rust (fmt/clippy/test)`
    - `Generated files are up-to-date`
    - `web-app (test/build)`
- **Do not allow bypassing the above settings**（任意）
- **Restrict who can push to matching branches**
  - 個人開発で「main 直 push 禁止」を確実にしたい場合に有効

## なぜ効くか

- Rust 側変更で `errorCodeMessages.generated.ts` 等の生成物更新が漏れると、`Generated files are up-to-date` が落ちて PR を止めます。
- web-app は `lint/test/build` まで通してから merge できるようになります。

## 補足（Vercel 運用）

Vercel で Rust/wasm-pack が無い環境でもビルドできるようにする場合は、`web-app/generated/client-sdk/wasm-pkg` の成果物を含めて配布する必要があります。
詳細は docs/deploy-vercel.md を参照してください。
