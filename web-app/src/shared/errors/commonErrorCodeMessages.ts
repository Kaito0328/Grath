import type { ErrorCodeMessageMap } from "./appError";

import { generatedCommonErrorCodeMessageMap } from "./commonErrorCodeMessages.generated";

// Manual overrides live here.
// - Keys should match Rust error `code` values.
// - Values can be locale-specific.
// - Prefer keeping overrides small and specific.

const overrides: ErrorCodeMessageMap = {
	InvalidInput: {
		ja: "入力が不正です",
		en: "Invalid input",
	},
	NotFound: {
		ja: "見つかりませんでした",
		en: "Not found",
	},
	InternalServerError: {
		ja: "内部エラーが発生しました",
		en: "Internal server error",
	},
};

export const commonErrorCodeMessageMap: ErrorCodeMessageMap = {
	...generatedCommonErrorCodeMessageMap,
	...overrides,
};
