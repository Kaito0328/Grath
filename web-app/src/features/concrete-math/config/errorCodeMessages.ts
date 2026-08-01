import {
	errorToDisplayMessage,
	type ErrorCodeMessageMap,
	type ErrorToDisplayMessageOptions,
} from "../../../shared/errors/appError";

import { commonErrorCodeMessageMap } from "../../../shared/errors/commonErrorCodeMessages";
import { generatedConcreteMathErrorCodeMessageMap } from "./errorCodeMessages.generated";

// Manual overrides live here.
// - Keys should match Rust error `code` values.
// - Values can be locale-specific.

const overrides: ErrorCodeMessageMap = {
	// Add crate-specific overrides here.
};

export const concreteMathErrorCodeMessageMap: ErrorCodeMessageMap = {
	...commonErrorCodeMessageMap,
	...generatedConcreteMathErrorCodeMessageMap,
	...overrides,
};

export function concreteMathErrorToDisplayMessage(err: unknown, options?: ErrorToDisplayMessageOptions): string {
	const merged = options?.codeMessageMap
		? { ...concreteMathErrorCodeMessageMap, ...options.codeMessageMap }
		: concreteMathErrorCodeMessageMap;

	return errorToDisplayMessage(err, { ...options, codeMessageMap: merged });
}
