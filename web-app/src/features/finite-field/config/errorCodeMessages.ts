import {
	errorToDisplayMessage,
	type ErrorCodeMessageMap,
	type ErrorToDisplayMessageOptions,
} from "../../../shared/errors/appError";

import { commonErrorCodeMessageMap } from "../../../shared/errors/commonErrorCodeMessages";
import { generatedFiniteFieldErrorCodeMessageMap } from "./errorCodeMessages.generated";

// Manual overrides live here.
// - Keys should match Rust error `code` values.
// - Values can be locale-specific.

const overrides: ErrorCodeMessageMap = {
	// Add crate-specific overrides here.
};

export const finiteFieldErrorCodeMessageMap: ErrorCodeMessageMap = {
	...commonErrorCodeMessageMap,
	...generatedFiniteFieldErrorCodeMessageMap,
	...overrides,
};

export function finiteFieldErrorToDisplayMessage(err: unknown, options?: ErrorToDisplayMessageOptions): string {
	const merged = options?.codeMessageMap
		? { ...finiteFieldErrorCodeMessageMap, ...options.codeMessageMap }
		: finiteFieldErrorCodeMessageMap;

	return errorToDisplayMessage(err, { ...options, codeMessageMap: merged });
}
