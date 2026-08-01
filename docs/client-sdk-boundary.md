# Client SDK Boundary

`web-app/generated/client-sdk` is the SDK consumed by the current Next.js app.

The inspector owns low-level generated files in this SDK:

- `src/wrappers/*.ts`
- `src/tests/*.test.ts`
- `wasm-pkg/*`

The static SDK scaffold under `rust-crate/tools/inspector/static-sdk/client-sdk`
owns package-level and high-level hand-written files:

- `package.json`
- `src/index.ts`
- `src/api/*.ts`
- `src/wrappers/algebraicDto.ts`

This ownership is the current compatibility mode. If existing UI compatibility
is not required, `src/api/*.ts` should be removed from the static overwrite
allowlist and the generated safe API layer should become authoritative.

For every other file, the static scaffold is only a bootstrap source for files
that are missing from the generated SDK. In particular, static sync must not
overwrite generated crate wrappers, generated tests, or `wasm-pkg`.

This keeps hand-written helpers and generated API surfaces separate:

- Generated wrappers are recreated from `rust-crate/api-specs`.
- High-level API facades in `src/api/*.ts` remain hand-written compatibility
  surfaces until the generated safe API layer reaches feature parity.
- Type API classes such as `RationalMatrix` are generated from `type_apis`.
- Legacy crate-level facades such as `LinalgApi` remain as compatibility
  surfaces while screens still call string-boundary functions.
- New APIs should prefer typed marker APIs (`GrathTypeApi` or
  `GrathCrateApi`) over adding more hand-written string parse/format methods.

`web-app/generated/client-sdk` is the only SDK output target. The repository
does not maintain a second root-level SDK workspace.
