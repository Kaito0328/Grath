# 新クレート追加手順（Rust → Wasm → client-sdk → web-app）

このドキュメントは、新しい Rust クレートを追加して、WASM 経由で TypeScript（client-sdk）と web-app（Next.js）から呼べる状態にするまでの **エンドツーエンド手順**です。

手作業は「Rust API・marker・DTO opt-in・YAML テストケース」に限定します。WASM dependency、module 登録、SDK binding、safe API、生成テストは Inspector が更新します。

---

## 0. 前提

- Rust workspace は `rust-crate/`（`rust-crate/Cargo.toml` の `members = ["crates/*", ...]` により、新規クレートは `crates/<crate>` を作るだけで workspace に入ります）
- `wasm-pack` が利用可能
- Node.js/npm が利用可能

---

## 0.5. WASM/DTO 境界ポリシー

このリポジトリでは「Rust が正」で、フロントは wasm 特有（`free` や `BigInt` など）を意識しないことを最優先にします。
既存 API の互換性を守るため、custom type は当面 **文字列境界** を維持します。新規の複合型は明示的に opt-in した場合のみ **DTO 境界** を使います。primitive / primitive array は native WASM 型です。

### 0.5.1 ポリシーの適用範囲

- `GrathCrateApi` / `GrathTypeApi` marker が付いた API だけを生成対象とする
- 生成物は以下の 3 層を想定
  - **WASM DTO export（純関数）**: DTO/プリミティブ入出力のみ（WASM オブジェクトや `free` を出さない）
  - **TS DTO wrapper**: wasm export を型付けして呼ぶだけ
  - **TS 同名クラス（フロント向け）**: DTO を保持し Rust と同名のメソッドで呼べる（B-1: 破壊的操作は新 DTO を返す）

### 0.5.2 型変換ポリシー

#### プリミティブ

- `bool` → `boolean`
- `String`/`&str` → `string`
- `f32`/`f64` → `number`
- `i8/i16/i32`/`u8/u16/u32` → `number`（`Number.isSafeInteger` を満たすこと）

#### 64-bit 整数（最重要）

- `i64/u64` は wasm-bindgen の `bigint` 境界を維持する。SDK の public API で文字列へ統一する作業は DTO API の拡張と合わせて行う。

#### 構造

- `struct Foo { a: T, ... }` → `{ a: <T-dto>, ... }`
- `enum E { A, B(T), C { y: U } }`
  - `kind` を discriminant とする union
  - `{ kind: "A" } | { kind: "B", value: <T-dto> } | { kind: "C", y: <U-dto> }`
- `Vec<T>` → `<T-dto>[]`
- `Option<T>` → `<T-dto> | null`
- `Box<T>` → `<T-dto>` と同一
- `(A, B)` → `[A-dto, B-dto]`
- `[T; N]` → `<T-dto>[]`（長さは Rust 側で保証）
- `BTreeMap<String, T>` / `HashMap<String, T>` → `Record<string, <T-dto>>`

### 0.5.3 Result の扱い

- `Result<T, E>` は **Err を throw** に統一
  - wasm 側は `JsError` を投げる（中身は `AppError { code, message, details }` を JSON 化した文字列）
  - TS 側は通常の例外として扱う

### 0.5.4 生成できない場合

- 何らかの理由で生成できない API/型が存在する場合、生成器は **理由付きでレポートを出す**
  - 例: `HashMap<K,V> is not supported`, `generic type parameter is not supported` 等
- 「生成できないものは黙って落とす」は禁止

---

---

## 1. Rust クレートを作る（`rust-crate/crates/<crate>`）

1. ディレクトリを作成

- `rust-crate/crates/<crate>/`
- `rust-crate/crates/<crate>/src/lib.rs`

2. `Cargo.toml` を作成

- 依存は基本的に `rust-crate/Cargo.toml` の `[workspace.dependencies]` を参照する形にする（`thiserror`, `strum_macros`, `serde` など）

3. 公開 API と marker を定義

- crate API: `impl GrathCrateApi for <Crate>Api`、type API: `impl GrathTypeApi for <Type>Api` を追加する
- DTO にする public struct/enum は `Serialize + Deserialize` を derive し、`impl GrathDto for Type {}` を追加する。derive だけでは既存の文字列境界を変えない。
- YAML テストを `rust-crate/integration-tests/test_cases/<crate>.yml` に追加する。

### Wasm 境界の設計メモ

- 既存 custom type は `Display + FromStr` の文字列境界を維持する
- 新規 DTO は `Serialize + Deserialize + GrathDto` で opt-in する
- 既存の文字列境界 API は互換目的で維持できます
  - 新規の複合型は DTO Type API class を優先し、フロントからは `@my-project/client-sdk` を通じて利用します

---

## 2. エラー設計（code を安定化し、フロント主導で表示文言を管理）

推奨パターン:

- `<Crate>Error` を `thiserror::Error` + `strum_macros::AsRefStr` で定義
- `AsRefStr` の **variant 名**が `code` になる（= フロントで map キーとして使える）
- `crates/common` の `ToAppError` を利用すると `AppError { code, message, details }` へ統一できる

補足:

- `#[error("...")]` にプレースホルダ（`{0}` 等）がある場合、フロント用の generated メッセージは「安定な prefix」に丸められることがあります。
  - 表示を整えたい場合はフロントの overrides 側で上書きする運用に寄せます。

---

## 3. inspector で生成物を更新する（Rust → Wasm → TS の自動生成）

新規クレート追加後の基本コマンド:

```bash
cd rust-crate

# 新クレートだけ更新（dev パイプライン）
cargo run -p inspector -- dev -n <crate>
```

dev パイプラインが更新する代表的な生成物:

- spec: `rust-crate/api-specs/<crate>.json`
- error-messages（フロント用 code→ 文言 map）
  - 通常クレート: `web-app/src/features/<crate>/config/errorCodeMessages.generated.ts`
  - common: `web-app/src/shared/errors/commonErrorCodeMessages.generated.ts`
- wasm-gen: `rust-crate/wasm/src/<crate>.rs`
- wasm-build: `web-app/generated/client-sdk/wasm-pkg`（WASM パッケージを更新）
- ts / ts-api / ts-test: `web-app/generated/client-sdk/src/*`

補足（ts-api の生成方針）:

- `web-app/generated/client-sdk/src/api/<crate>Api.ts` は api-spec（`rust-crate/api-specs/<crate>.json`）を元に自動生成されます。
- safe API は SDK 初期化と WASM 呼び出しを隠蔽します。文字列境界 API は互換目的で維持し、新規の複合型は DTO Type API class を優先します。
- より高レベルなオーバーロードや演算グルーピングが必要になった場合のみ、別途の設計（ルールファイル等）を検討します。

エラーメッセージだけ更新したい場合:

```bash
cd rust-crate
cargo run -p inspector -- error-messages -n <crate>
```

---

## 4. client-sdk の生成所有範囲

正本は `web-app/generated/client-sdk` です。root-level の SDK は存在せず、新規 API はこの生成先だけに配線されます。

`inspector dev -n <crate>` が SDK の generated region を更新し、新 wrapper の import と `bindWasmFromWasmLib` 登録を自動追加します。手書きの SDK 実装は ownership marker の外に置かれ、同期で上書きされません。

`web-app/generated/client-sdk` が唯一の正本です。

> 注: 通常は `api/*` の safe API を利用します。DTO の Type API class は SDK root から公開されるため、必要な場合は `RationalMatrixDto` のような class を直接 import できます。

---

## 5. web-app 側で呼ぶ（Next.js）

### 5.1 Wasm 初期化

web-app は `@my-project/client-sdk` の初期化フックを登録済みです。

- `web-app/src/shared/wasm/ensureClientSdkReady.ts`

bind 登録は生成されるため、通常は追加作業不要です。初期化エラー時は `inspector dev -n <crate>` を実行し、marker・WASM build・生成物を確認してください。

### 5.2 API を呼ぶ

crate-level safe API の基本 import:

- `import { SomeCrateApi } from "@my-project/client-sdk";`

DTO Type API class の例:

```ts
import { RationalMatrixDto, type RationalMatrixValueDto } from "@my-project/client-sdk";

const value: RationalMatrixValueDto = {
  values: [[{ numer: 1, denom: 1 }]],
};
const matrix = RationalMatrixDto.fromDto(value);
const inverse = matrix.inverse().toDto();
```

UI 構成は状況に応じて:

- 既存 `web-app/src/features/*` に追加
- もしくは `web-app/src/features/<crate>/` を新設

---

## 6. フロントのエラーメッセージ運用（generated + overrides + ラッパ）

フロントのエラー表示は `error code` をキーにした map で運用します。

- 生成物（手編集禁止）
  - 通常クレート: `web-app/src/features/<crate>/config/errorCodeMessages.generated.ts`
  - common: `web-app/src/shared/errors/commonErrorCodeMessages.generated.ts`
- 手編集（上書き・合成）
  - 通常クレート: `web-app/src/features/<crate>/config/errorCodeMessages.ts`
    - `commonErrorCodeMessageMap` + generated + overrides を合成
    - `export function <crate>CamelErrorToDisplayMessage(err, options?)` を提供
  - common: `web-app/src/shared/errors/commonErrorCodeMessages.ts`

重要ルール:

- UI 側では直接 `errorToDisplayMessage(...)` を呼ばず、必ずクレート側ラッパ（例: `algebraicErrorToDisplayMessage`）を使う
- 直呼び禁止/命名規約/common 合成は web-app のテストでガードされています

関連する env:

- `NEXT_PUBLIC_ERROR_MESSAGE_LEVEL=debug|user`
- `NEXT_PUBLIC_LOCALE=ja|en`

---

## 7. 最終確認（Rust → Frontend）

```bash
# Rust 側
cd rust-crate
cargo test -p <crate>

# web-app 側（生成 SDK の Vitest も含む）
cd ../web-app
npm test
npm run build
```
