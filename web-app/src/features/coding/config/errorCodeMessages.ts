import {
	errorToDisplayMessage,
	type ErrorCodeMessageMap,
	type ErrorToDisplayMessageOptions,
} from "../../../shared/errors/appError";

import { commonErrorCodeMessageMap } from "../../../shared/errors/commonErrorCodeMessages";

// Manual overrides live here.
// - Keys should match Rust error `code` values.
// - Values can be locale-specific.

const overrides: ErrorCodeMessageMap = {
	// Add coding-specific wording overrides here.
};

export const codingErrorCodeMessageMap: ErrorCodeMessageMap = {
	...commonErrorCodeMessageMap,
	...overrides,
};

export function codingErrorToDisplayMessage(err: unknown, options?: ErrorToDisplayMessageOptions): string {
	const merged = options?.codeMessageMap
		? { ...codingErrorCodeMessageMap, ...options.codeMessageMap }
		: codingErrorCodeMessageMap;

	return errorToDisplayMessage(err, { ...options, codeMessageMap: merged });
}
