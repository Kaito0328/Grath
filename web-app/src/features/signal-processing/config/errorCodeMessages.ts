import {
	errorToDisplayMessage,
	type ErrorCodeMessageMap,
	type ErrorToDisplayMessageOptions,
} from "../../../shared/errors/appError";

import { commonErrorCodeMessageMap } from "../../../shared/errors/commonErrorCodeMessages";
import { generatedSignalProcessingErrorCodeMessageMap } from "./errorCodeMessages.generated";

// Manual overrides live here.
// - Keys should match Rust error `code` values.
// - Values can be locale-specific.

const overrides: ErrorCodeMessageMap = {
	// Add crate-specific overrides here.
};

export const signalProcessingErrorCodeMessageMap: ErrorCodeMessageMap = {
	...commonErrorCodeMessageMap,
	...generatedSignalProcessingErrorCodeMessageMap,
	...overrides,
};

export function signalProcessingErrorToDisplayMessage(err: unknown, options?: ErrorToDisplayMessageOptions): string {
	const merged = options?.codeMessageMap
		? { ...signalProcessingErrorCodeMessageMap, ...options.codeMessageMap }
		: signalProcessingErrorCodeMessageMap;

	return errorToDisplayMessage(err, { ...options, codeMessageMap: merged });
}
