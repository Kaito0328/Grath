import {
	errorToDisplayMessage,
	type ErrorCodeMessageMap,
	type ErrorToDisplayMessageOptions,
} from "../../../shared/errors/appError";

import { commonErrorCodeMessageMap } from "../../../shared/errors/commonErrorCodeMessages";

import { generatedAlgebraicErrorCodeMessageMap } from "./errorCodeMessages.generated";

// Manual overrides live here.
// - Keys should match Rust error `code` values.
// - Values can be locale-specific.

const overrides: ErrorCodeMessageMap = {
	// Keep this focused on algebraic-specific wording overrides.
	UnexpectedToken: {
		ja: "式の構文が正しくありません",
		en: "Invalid expression syntax",
	},
};

export const algebraicErrorCodeMessageMap: ErrorCodeMessageMap = {
	...commonErrorCodeMessageMap,
	...generatedAlgebraicErrorCodeMessageMap,
	...overrides,
};

export function algebraicErrorToDisplayMessage(err: unknown, options?: ErrorToDisplayMessageOptions): string {
	const merged = options?.codeMessageMap
		? { ...algebraicErrorCodeMessageMap, ...options.codeMessageMap }
		: algebraicErrorCodeMessageMap;

	return errorToDisplayMessage(err, { ...options, codeMessageMap: merged });
}
