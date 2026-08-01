# Grath WASM API Pipeline Refactor Plan

> **2026-08-01 時点の状態**: この文書の前半は設計・履歴です。codec registry、marker API、DTO export、SDK binding、YAML からの Rust/TS テスト生成、全 crate の generated SDK 検証は実装済みです。`web-app/generated/client-sdk` は唯一の SDK 正本です。残る主な作業は、LU/QR/SVD/固有値のような複数・複合結果を返す linalg API の DTO 設計と、対応 UI の段階的な移行です。

> 実装状況（2026-08）: この文書の「現状の実装」節は計画開始時の記録です。現在は
> `GrathCrateApi` / `GrathTypeApi` / `GrathDto` marker、構造化 `RustType`、共有 codec
> registry、DTO (`Vec` / `Option` / tuple / 固定長配列 / string-key map)、Rust runner、
> WASM wrapper、TypeScript wrapper/test、crate wiring の自動生成まで実装済みです。
> 既存の string facade と手書き DTO module は互換維持のため残しています。unsupported
> 境界は spec に理由と代替案を必ず記録します。

## 目的

Rust 側の実装を型付きのまま保ちつつ、クレートごとの追加実装を最小限にして WASM 対応・TypeScript SDK 生成・テストコード生成を自動化する。

特に次を満たすことを目標にする。

- Rust API では `String -> Rational` のような境界変換を人間が毎回書かない。
- 公開したい API は Rust コード上で明示する。
- 型に属する API と、クレート全体の一般 API を Rust の構造で分ける。
- TypeScript 側では `matrix.inverse()` のような型メソッドとして使える。
- 型サポート判定・WASM 変換・TS 型変換・テスト入力変換を 1 か所の codec registry に集約する。
- 独自型は原則 `FromStr` / `Display`、または既存の `from_string` / `to_string` 相当の変換を使い、必要な場合だけ数値・配列などを TS ネイティブ型として扱う。

## 現状の実装

### API 定義

現在も `*Api` facade への移行は始まっている。

- `rust-crate/crates/linalg/src/api.rs` には `LinalgApi` があり、`add_rational(a: String, b: String) -> Result<String, LinalgError>` のような文字列境界の API が多数ある。
- `rust-crate/crates/polynomial/src/api.rs` には `PolynomialApi` があり、`String` を手動 parse して `String` で返す形になっている。
- `coding`, `statistics`, `finite-field`, `concrete-math`, `signal-processing` などにも `*Api` がある。

ただし、現状の `*Api` は「正式な型API」ではなく、多くが手書きの string facade になっている。例えば `Matrix<Rational>` を受け取る関数ではなく、`String` を受け取り、API 内部で `parse_matrix::<Rational>` を呼ぶ。

### inspector parser

`rust-crate/tools/inspector/src/parser.rs` は `syn` で Rust ファイルを読み、公開 `struct` / `enum` と公開 `impl` メソッドを `ApiReport` に集めている。

現状の重要な制約は次の通り。

- top-level の `pub fn` は収集していない。
- `impl` の対象が公開 `struct` として見つかったものだけ残す。
- `FunctionInfo.args` や `return_type` は `syn::Type` の構造ではなく token string として保存している。
- `Polynomial` は `should_ignore_impl` で明示的に除外されている。
- `GrathTypeApi` / `GrathCrateApi` のような marker trait はまだ存在しない。

### generator

生成処理は複数ファイルに分散している。

- `wasm_gen.rs`: wasm-bindgen 用 Rust wrapper を生成する。
- `ts_gen.rs`: TypeScript wrapper / DTO 型を生成する。
- `ts_api_gen.rs`: safe API runtime と API facade を生成する。
- `test_gen.rs`: Rust 側 dynamic test runner を生成する。
- `ts_test_gen.rs`: TS 側テストを生成する。
- `wasm_dto_gen.rs`: DTO export を生成する。

現在の問題は、型判定と変換規則が各 generator に重複していること。

例:

- `Vec<f64>` を typed array にする判断は `wasm_gen.rs` と `ts_gen.rs` に別々にある。
- `Result<T, E>` の unwrap / error mapping も generator ごとに扱いが分かれている。
- Rust test runner は `parse::<T>()` と `to_string()` に寄っているが、WASM/TS の変換規則と完全には一元化されていない。
- unsupported な型の扱いが generator ごとに異なり、静かに skip される箇所がある。

### TypeScript SDK

`web-app` は `web-app/generated/client-sdk` と `web-app/generated/client-sdk/wasm-pkg` を参照する。SDK の出力先はこの 1 箇所に統一され、手書きの static scaffold は Inspector の bootstrap source としてのみ使う。

現状の TS 側は、非 algebraic crate では主に `*Api` の static facade を呼ぶ形で、Rust の型APIから自動的に `Matrix` class の instance method を作る設計にはまだなっていない。

## 問題点

### 1. API facade が境界変換を抱えすぎている

現在の `LinalgApi` は公開関数の明示場所としては有用だが、`String` parse / format を各関数に手書きしている。

これは次の問題を生む。

- API 関数が本来の型シグネチャを失う。
- TS 型生成が `Matrix`, `Rational`, `Vector` などの意味を推論しにくい。
- テスト生成も `String` ベースに引きずられる。
- 同じ変換ロジックが crate ごと・関数ごとに増える。

### 2. 型APIとクレートAPIの区別がない

`LinalgApi::inv_rational(a: String)` が `Matrix` の instance method なのか、`LinalgApi` の一般関数なのかをコード構造から判断できない。

関数名から `matrix_inverse` のように推論する方針は避けるべき。代わりに、Rust の API 構造そのものを metadata として使う。

### 3. 型サポート判定が分散している

`wasm_gen.rs`, `ts_gen.rs`, `test_gen.rs`, `ts_test_gen.rs`, `wasm_dto_gen.rs` がそれぞれ型文字列を解釈しているため、変換規則の追加や修正で不整合が起きやすい。

### 4. parser の型情報が弱い

現状は `args: Vec<String>` / `return_type: String` なので、`Matrix<Rational>`, `&Matrix<Rational>`, `Result<Vec<Rational>, E>` のような型を安全に扱いにくい。

### 5. 生成物と手書き SDK の境界が曖昧

pipeline 内で static SDK scaffold を同期しており、生成 API と手書き API の責務が混ざりやすい。将来的には「生成される層」と「手書きで保つ層」を明確に分ける必要がある。

## 目標アーキテクチャ

### API marker trait

Rust 側に API の意味を表す marker trait を導入する。

候補:

```rust
pub trait GrathCrateApi {
    const CRATE_NAME: &'static str;
}

pub trait GrathTypeApi {
    type Target;
    const TS_NAME: &'static str;
}
```

置き場所は `common` crate か、より小さい `api-core` crate を検討する。循環依存を避けられるなら `common::api` が簡単。

### 型API

型に属する関数は、その型専用の API struct に書く。

例:

```rust
pub struct MatrixApi;

impl GrathTypeApi for MatrixApi {
    type Target = Matrix<Rational>;
    const TS_NAME: &'static str = "Matrix";
}

impl MatrixApi {
    pub fn inverse(a: Matrix<Rational>) -> Result<Matrix<Rational>, LinalgError> {
        a.inverse_exact()?.ok_or(LinalgError::SingularMatrix)
    }

    pub fn add(a: Matrix<Rational>, b: Matrix<Rational>) -> Result<Matrix<Rational>, LinalgError> {
        a.checked_add(&b)
    }
}
```

生成規則:

- `impl GrathTypeApi for MatrixApi` の `Target` を見て、`MatrixApi` が `Matrix` の TS class を生成する元だと判断する。
- public 関数の第一引数が `Target` と同じなら instance method にする。
- 第一引数が `Target` ではない関数は static method にする。
- 関数名では判断しない。

TS 生成イメージ:

```ts
const a = Matrix.fromString("1,0;0,1");
const inv = await a.inverse();
const sum = await a.add(b);
```

または await を避ける設計にする場合でも、WASM 初期化だけは `ensureReady()` で吸収する。

### クレートAPI

どの型にも自然に属さない関数は crate-level API として書く。

```rust
pub struct LinalgApi;

impl GrathCrateApi for LinalgApi {
    const CRATE_NAME: &'static str = "linalg";
}

impl LinalgApi {
    pub fn solve_linear_system(
        a: Matrix<Rational>,
        b: Vector<Rational>,
    ) -> Result<Vector<Rational>, LinalgError> {
        a.solve_generic(&b)
    }
}
```

`LinalgApi` が `MatrixApi` を所有する必要はない。`MatrixApi`, `VectorApi`, `LinalgApi` は inspector が marker trait から独立に発見する。

### 型サポート registry

`tools/inspector` に型変換を一元管理する module を追加する。

候補名:

- `type_model.rs`
- `boundary_codec.rs`
- `codec_registry.rs`

責務:

- `syn::Type` を構造化された `RustType` に変換する。
- `RustType` から境界 codec を決める。
- WASM 引数型、WASM 戻り値型、Rust decode/encode code、TS 入力型、TS 出力型、テスト入力 parse、unsupported reason を返す。

概念例:

```rust
pub struct BoundaryCodec {
    pub rust_type: RustType,
    pub ts_input_type: TsType,
    pub ts_output_type: TsType,
    pub wasm_arg_type: WasmType,
    pub wasm_return_type: WasmType,
    pub rust_decode: DecodePlan,
    pub rust_encode: EncodePlan,
    pub test_decode: TestDecodePlan,
}
```

基本方針:

- `String`, `&str` は `string`。
- `bool` は `boolean`。
- `f64`, `f32`, `i32`, `u32`, `usize` などは `number`。
- `i64`, `u64` は precision の問題があるので `number` にするか `string` / `bigint` にするか明示判断が必要。
- `Vec<f64>`, `Vec<f32>`, `Vec<u8>` は typed array 候補。
- `Vec<T>` は `T[]` または CSV/string codec。初期は primitive list と custom type list を分ける。
- `Result<T, E>` は TS 側では `T` を返し、エラー時 throw。
- `Option<T>` は `T | null`。
- 独自型は原則 string boundary。Rust 側では `FromStr` / `Display` を要求する。

独自型の例:

```rust
fn decode<T>(s: &str) -> Result<T, JsError>
where
    T: std::str::FromStr,
    T::Err: ToString,
{
    s.parse::<T>().map_err(|e| JsError::new(&e.to_string()))
}

fn encode<T>(value: T) -> String
where
    T: std::fmt::Display,
{
    value.to_string()
}
```

この trait bound を生成コードに入れることで、対応していない独自型は生成時または compile 時に明確に失敗させる。

## ApiReport の拡張

現状の `ApiReport` は `structs` と `impl_blocks` だけなので、API の意味を表現できない。

追加する情報:

```rust
pub struct ApiReport {
    pub structs: Vec<StructInfo>,
    pub impl_blocks: Vec<ImplBlockInfo>,
    pub crate_apis: Vec<CrateApiInfo>,
    pub type_apis: Vec<TypeApiInfo>,
    pub unsupported: Vec<UnsupportedItem>,
}

pub struct TypeApiInfo {
    pub crate_name: String,
    pub api_struct: String,
    pub target_type: RustType,
    pub ts_name: String,
    pub functions: Vec<ApiFunctionInfo>,
}

pub struct CrateApiInfo {
    pub crate_name: String,
    pub api_struct: String,
    pub functions: Vec<ApiFunctionInfo>,
}
```

`FunctionInfo.args` / `return_type` は最終的に string ではなく、少なくとも parser 内部では `syn::Type` 由来の structured model に変換する。

## 生成パイプライン

### 1. spec 生成

- `impl GrathTypeApi for XxxApi` を探す。
- `impl GrathCrateApi for XxxApi` を探す。
- 対応する inherent impl `impl XxxApi { pub fn ... }` を集める。
- 各関数に codec registry を適用し、supported / unsupported を判定する。
- unsupported は静かに skip せず、report に reason を残す。

### 2. WASM wrapper 生成

型API関数から、WASM 境界用関数を生成する。

例:

```rust
#[wasm_bindgen]
pub fn matrix_inverse(a: &str) -> Result<String, JsError> {
    let a: Matrix<Rational> = decode_from_string(a)?;
    let out = MatrixApi::inverse(a).map_err(to_js_error)?;
    Ok(encode_to_string(out))
}
```

ただし primitive / list は string ではなく TS native 型にできる場合は native boundary を使う。

### 3. TypeScript class 生成

型APIごとに TS class を生成する。

```ts
export class Matrix {
  private constructor(private readonly raw: string) {}

  static fromString(value: string): Matrix {
    return new Matrix(value);
  }

  toString(): string {
    return this.raw;
  }

  async inverse(): Promise<Matrix> {
    await ensureReady();
    const out = wasm.matrix_inverse(this.raw);
    return Matrix.fromString(out);
  }
}
```

`add(a: Matrix, b: Matrix)` のように第一引数が receiver になる場合、TS instance method では第一引数を `this.raw` に置き換え、残りの引数だけ公開する。

### 4. crate-level API 生成

`GrathCrateApi` は class method ではなく crate API として生成する。

```ts
export const LinalgApi = {
  async solveLinearSystem(a: Matrix, b: Vector): Promise<Vector> {
    await ensureReady();
    return Vector.fromString(wasm.linalg_solve_linear_system(a.toString(), b.toString()));
  },
};
```

### 5. テスト生成

同じ codec registry を使って Rust test runner と TS test を生成する。

- YAML の input は原則 string で持てる。
- codec registry が Rust 側 decode と TS 側 decode を決める。
- 型APIの instance method は TS 側では `Matrix.fromString(input).inverse()` の形でもテストする。
- crate-level API は `LinalgApi.solveLinearSystem(...)` の形でテストする。

## 実装計画

### Phase 0: 現状の仕様固定

目的: 既存生成物を壊さず、現在の挙動を基準化する。

作業:

- 現在の `api-specs/*.json` と生成物の責務を整理する。
- `web-app/generated/client-sdk` を唯一の SDK 正本として文書化する。
- `wasm_gen`, `ts_gen`, `test_gen`, `ts_test_gen` の unsupported / skipped を一覧化する。
- CI / local で確認すべき command を決める。

完了条件:

- 既存 pipeline の入力・出力・skip 理由が説明できる。
- リファクタ後の差分を比較する基準ができる。

### Phase 1: Type model と codec registry を追加

目的: 型サポート判定を 1 か所に集める。

作業:

- `tools/inspector/src/type_model.rs` を追加する。
- `syn::Type` または現在の type string から `RustType` を作る。
- `tools/inspector/src/codec_registry.rs` を追加する。
- primitive, string, result, option, vec, custom type の codec を定義する。
- まずは既存 generator から呼べる read-only な判定 API として導入する。

完了条件:

- `wasm_gen.rs` と `ts_gen.rs` の型判定を registry 経由に置き換え始められる。
- unsupported reason が同じ形式で出せる。

### Phase 2: marker trait を導入

目的: Rust コード上で type API / crate API を明示できるようにする。

作業:

- `GrathTypeApi` と `GrathCrateApi` を追加する。
- inspector parser が trait impl を検出できるようにする。
- `TypeApiInfo` / `CrateApiInfo` を `ApiReport` に追加する。
- 従来の `impl_blocks` は互換用として残す。

完了条件:

- `impl GrathTypeApi for MatrixApi` から `Target = Matrix<Rational>` と `TS_NAME = "Matrix"` を読める。
- `impl GrathCrateApi for LinalgApi` から crate-level API と判断できる。

### Phase 3: linalg の Matrix API を試験移行

目的: ユーザーが重視している `a: Matrix; a.inverse()` の形を最小範囲で実現する。

作業:

- `LinalgApi` の既存 string facade は残す。
- 新しく `MatrixApi` を追加し、少数の関数だけ型付きで定義する。
- 候補: `inverse`, `add`, `mul`, `transpose`。
- `Matrix<Rational>` を最初の target type として扱う。
- 数値行列・記号行列を同じ `Matrix` class にするか、`RationalMatrix` / `NumericMatrix` / `SymbolicMatrix` に分けるかを決める。

完了条件:

- Rust API は `String` ではなく `Matrix<Rational>` を受け取る。
- 生成された TS で `Matrix.fromString(...).inverse()` が動く。
- 既存の `LinalgApi.inv_rational(...)` は互換維持される。

### Phase 4: WASM wrapper 生成を新 API spec に対応

目的: 型APIと crate API から正式な WASM boundary を生成する。

作業:

- `TypeApiInfo` から wasm function を生成する。
- `CrateApiInfo` から wasm function を生成する。
- custom type は `FromStr` / `Display` string boundary にする。
- primitive/list は codec registry に従って native boundary にする。
- error mapping を `ToAppError` 優先、fallback `Display` / debug に整理する。

完了条件:

- 新 API spec から生成された wrapper が compile できる。
- unsupported は report に出て、理由が分かる。

### Phase 5: TypeScript SDK 生成を class-first にする

目的: TS 側の利用形を API 構造から自動生成する。

作業:

- `TypeApiInfo` ごとに TS class を生成する。
- 第一引数が target type の関数は instance method にする。
- 第一引数が target type ではない関数は static method にする。
- `CrateApiInfo` は crate-level API object として生成する。
- 既存 hand-written SDK と衝突しない出力先を決める。

完了条件:

- `Matrix.fromString(...).inverse()` のような API が生成される。
- crate-level 関数は `LinalgApi.solveLinearSystem(...)` のように生成される。
- 既存 web-app が参照する import path を大きく壊さない。

### Phase 6: テスト生成を codec registry に接続

目的: Rust/WASM/TS のテスト生成を同じ型変換規則で動かす。

作業:

- Rust dynamic test runner の parse/format を codec registry 由来にする。
- TS test generator も同じ API spec と codec metadata を使う。
- 型APIについて instance method と static method の両方を生成できるようにする。
- YAML schema に必要なら `api_kind` や `receiver` を追加する。ただし Rust API 構造から判断できるものは YAML に書かない。

完了条件:

- `MatrixApi::inverse` の Rust test と TS test が同じ test case から生成される。
- 変換規則の不一致で片方だけ通る状態を減らせる。

### Phase 7: 既存 string facade の整理

目的: 互換 API と新 API の責務を分ける。

作業:

- `LinalgApi` 内の string facade を deprecated 互換層にするか、徐々に新 API へ移す。
- 手書き parse helper を codec registry に寄せる。
- static SDK copy が生成物を上書きしないようにする。
- root-level の旧 SDK を削除し、`web-app/generated/client-sdk` を唯一の出力先として維持する。

完了条件:

- 新規 API は型付き Rust 関数を書くのが標準になる。
- string facade は必要な互換用途だけに残る。

## 最初に実装するべき最小セット

最初の PR / 作業単位は大きくしすぎない方がよい。

推奨する最小セット:

1. `type_model.rs` と `codec_registry.rs` を追加する。
2. 既存 generator の型判定をすぐ全置換せず、まず report / unit test で registry の結果を確認する。
3. `GrathTypeApi` / `GrathCrateApi` を追加する。
4. parser が marker trait を検出し、`api-specs` に `type_apis` / `crate_apis` を出す。
5. `MatrixApi` の小さな例を 1 つ追加する。
6. 新 generator は既存出力を壊さない別ファイルに出す。
7. 生成された TS class で `Matrix.fromString(...).inverse()` だけ通す。

この順番なら、既存の web-app を壊さずに、新しい設計が本当に成り立つか検証できる。

## 未決定事項

### Matrix の型パラメータを TS でどう表すか

Rust では `Matrix<Rational>`, `Matrix<f64>`, `Matrix<SymbolicExpr>` が別の具体型として現れる。

選択肢:

- `Matrix` 1 class にまとめ、内部に kind を持つ。
- `RationalMatrix`, `NumericMatrix`, `SymbolicMatrix` に分ける。
- `Matrix<T>` 風の TS generic を見せるが、runtime では concrete wrapper を持つ。

現実的には、最初は `RationalMatrix` のような concrete class で始め、UI で必要なら facade として `Matrix` を重ねるのが安全。

### 第一引数 receiver ルールの限界

「第一引数が target type なら instance method」は明快だが、複数 receiver 候補がある関数では曖昧になる。

初期ルール:

- 第一引数だけを見る。
- 曖昧な関数は crate-level API に置く。
- 将来必要になったら Rust attribute で `receiver = "arg_name"` を足す。ただし最初から別 metadata file は作らない。

### FromStr / Display の保証

独自型が本当にすべて `FromStr` / `Display` を持つかは compile で確認できるようにする。

- generator が trait bound を含む decode/encode helper を生成する。
- compile error を「この型は WASM boundary に出せない」という feedback として扱う。
- 可能なら inspector 側でも既知型の `FromStr` / `Display` 実装を軽く検出し、事前 report に出す。

## 2026-06-29 実装状況メモ（履歴）

devcontainer rebuild 後に会話履歴が失われる可能性があるため、ここに現在の実装状況を残す。

### 完了済み

Phase 1 から Phase 5 の最小縦断ラインは実装済み。

- `tools/inspector/src/type_model.rs` を追加した。
  - `syn::Type` / type string から `RustType` を作る。
  - `Result`, `Option`, `Vec`, reference, tuple, slice, array, path, primitive を扱う。
- `tools/inspector/src/codec_registry.rs` を追加した。
  - primitive, bigint, typed array, custom string boundary, `Result`, `Option` を分類する。
  - `Self` は現在の custom type として扱える。
- `tools/inspector/src/types.rs` の `ApiReport` を拡張した。
  - `crate_apis: Vec<CrateApiInfo>`
  - `type_apis: Vec<TypeApiInfo>`
  - `unsupported: Vec<UnsupportedItem>`
- `tools/inspector/src/parser.rs` が marker trait を検出するようになった。
  - `impl GrathCrateApi for XxxApi`
  - `impl GrathTypeApi for XxxApi`
  - marker impl と inherent impl を結合し、`crate_apis` / `type_apis` を出す。
  - codec registry による unsupported 収集も入っている。
- `crates/common/src/api.rs` に marker trait を追加した。
  - `GrathCrateApi`
  - `GrathTypeApi`
  - `common::prelude` から re-export 済み。
- 既存 facade API に `GrathCrateApi` を付けた。
  - `LinalgApi`
  - `CodingApi`
  - `ConcreteMathApi`
  - `FiniteFieldApi`
  - `PolynomialApi`
  - `SignalProcessingApi`
  - `SourceCodingApi`
  - `StatisticsApi`
- `linalg` に `RationalMatrixApi` を追加した。
  - `impl GrathTypeApi for RationalMatrixApi`
  - `type Target = Matrix<Rational>`
  - `TS_NAME = "RationalMatrix"`
  - public functions: `inverse`, `add`, `mul`, `transpose`
- `Matrix<T>` に compact string boundary 用の `FromStr` を追加した。
  - 入力形式は `1,2;3,4`。
  - `Display` は既存実装と衝突するため追加していない。
  - WASM encode 側では generator が `encode_matrix_to_string` を出して compact format に戻す。
- `tools/inspector/src/wasm_gen.rs` が `TypeApiInfo` から WASM free function を生成するようになった。
  - 例: `rational_matrix_inverse(a: &str) -> Result<String, JsError>`
  - custom type は `FromStr` で decode する。
  - `Matrix<...>` の return は compact matrix string に encode する。
- `tools/inspector/src/ts_gen.rs` が `TypeApiInfo` から TS class を生成するようになった。
  - 例: `export class RationalMatrix`
  - 第一引数が target type の関数は instance method になる。
  - `getTypeApiWasm()` を生成し、`wasm-pkg/wasm_lib.d.ts` が古くても spec 由来の Type API binding 型を持てるようにした。
- 生成済みファイル:
  - `rust-crate/api-specs/linalg.json`
  - `rust-crate/wasm/src/linalg.rs`
  - `web-app/generated/client-sdk/src/wrappers/linalg.ts`

### 現在できること

`RationalMatrix` については、Rust の型付き API から次の生成ラインが通っている。

```text
RationalMatrixApi
  -> inspector spec type_apis
  -> wasm/src/linalg.rs の rational_matrix_* functions
  -> generated/client-sdk/src/wrappers/linalg.ts の RationalMatrix class
```

TS 生成イメージ:

```ts
const a = RationalMatrix.fromString("1,0;0,1");
const inv = a.inverse();
const sum = a.add(b);
```

### 検証済み

以下は通過済み。

```bash
cd /workspaces/Grath/rust-crate
cargo fmt
cargo test -p inspector
cargo check -p wasm-lib
cargo check --workspace
```

```bash
cd /workspaces/Grath/web-app
npx tsc --noEmit
```

### 未完了 / 次にやること

実 WASM package の再生成は未完了。

`cargo run -p inspector -- dev -n linalg` は spec / error messages / runner / wasm source 生成までは進むが、`wasm-pack` 段階で止まった。

原因はコードではなく devcontainer 環境。

- `wasm-pack 0.13.1` は入っている。
- しかし `wasm32-unknown-unknown` target が入っていない。
- `rustup target add wasm32-unknown-unknown` は `/usr/local/rustup` が read-only / ownership mismatch のため失敗した。
- 現在の実行ユーザーは `node`。
- `/usr/local/rustup` は `nobody:nogroup` 所有で、コンテナ内から書き込めなかった。

devcontainer rebuild 前に `.devcontainer/Dockerfile` を次のように直す必要がある。

```Dockerfile
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable \
    && /usr/local/cargo/bin/rustup component add rust-src rustfmt clippy \
    && /usr/local/cargo/bin/rustup target add wasm32-unknown-unknown
```

さらに chown は `cargo` だけでなく `rustup` も対象にする。

```Dockerfile
RUN chown -R node:node /usr/local/cargo /usr/local/rustup
```

rebuild 後の確認:

```bash
rustup target list --installed
```

期待値:

```text
x86_64-unknown-linux-gnu
wasm32-unknown-unknown
```

その後に再開するコマンド:

```bash
cd /workspaces/Grath/rust-crate
cargo run -p inspector -- dev -n linalg
```

成功したら `web-app/generated/client-sdk/wasm-pkg` が更新され、実 wasm runtime で `RationalMatrix` の動作確認ができる。

### 次の実装候補

WASM package 更新後、次は Phase 6 に進む。

- Rust/TS の自動テスト生成を `type_apis` に対応させる。
- YAML test case から `RationalMatrixApi::inverse` の Rust test と TS test を生成する。
- TS 側は `RationalMatrix.fromString(input).inverse()` の形を生成する。
- Rust 側は compact string input を codec registry 由来の decode で `Matrix<Rational>` に変換する。
- unsupported な型は静かに skip せず、`ApiReport.unsupported` と generator log に理由を出す。

## 2026-06-29 Phase 6 / Phase 7 進捗

### Phase 6 完了済み

`RationalMatrixApi` について、同じ YAML test case から Rust dynamic runner と TS/Vitest test を生成できるようになった。

- `integration-tests/test_cases/linalg.yml` に `RationalMatrixApi::inverse/add/mul/transpose` を追加した。
- Rust runner は `Matrix<T>` 戻り値を compact matrix string (`1,2;3,4`) に正規化する。
- TS test generator は `type_apis` を見て、第一引数が target type の場合に `RationalMatrix.fromString(...).inverse()` のような instance method test を生成する。
- `web-app/generated/client-sdk/src/tests/linalg.test.ts` には `RationalMatrix` class 経由のテストが生成される。

検証済み:

```bash
cd /workspaces/Grath/rust-crate
cargo test -p inspector
cargo run -p inspector -- dev -n linalg
cargo test -p integration-tests linalg -- --nocapture

cd /workspaces/Grath/web-app
npx vitest run generated/client-sdk/src/tests/linalg.test.ts
npx tsc --noEmit
```

### Phase 7 着手済み

SDK の責務境界を整理し、static SDK scaffold が生成 wrapper/test/wasm package を上書きしないようにした。

- `docs/client-sdk-boundary.md` を追加し、`web-app/generated/client-sdk` の責務を明文化した。
- `sync_static_sdk` は static scaffold の全ファイルを無条件上書きしない。
- static scaffold が所有するものは `package.json`, `src/index.ts`, `src/api/*.ts`, `src/wrappers/algebraicDto.ts` に限定した。
- それ以外の static file は、生成先に存在しない場合だけ補完する。
- `LinalgApi` は現在の string-boundary Web UI 用 compatibility facade であり、新規 API は typed marker API を優先する旨を Rust doc に追記した。
- `tools/inspector/src/type_model.rs` と `tools/inspector/src/codec_registry.rs` を `tools/inspector/src/codec/` 配下に移し、Rust 型モデル・境界 codec・typed API 用 helper を同じディレクトリに集約した。
- `wasm_gen.rs`, `ts_gen.rs`, `ts_test_gen.rs` の `RationalMatrixApi` 向け target 判定、string boundary 判定、WASM export 名生成は `codec/type_api.rs` を使う。

この段階では `src/api/*.ts` の high-level API facade はまだ手書き/static 側が権威であり、generated safe API layer は feature parity 前の中間実装として扱う。

既存 UI 互換を不要にできる前提では、次の Phase 7 作業は `src/api/*.ts` を static scaffold の上書き対象から外し、generated safe API layer を SDK の権威に切り替えること。その場合、古い UI が呼んでいる `mulSymbolic` などの compatibility method は維持しない。

## 結論

この方針で整理するのは妥当。

特に重要なのは、`LinalgApi` が `MatrixApi` を持つ形ではなく、`MatrixApi` 自体を独立した type API として定義し、`GrathTypeApi<Target = Matrix<...>>` によって TS class 生成の根拠にすること。

これにより、関数名や外部 metadata に頼らず、Rust API の構造だけで次を判断できる。

- どの関数を外部公開するか。
- どの関数が型メソッドになるか。
- どの関数が crate-level API になるか。
- どの型変換を使うか。
- どのテストコードを生成できるか。
