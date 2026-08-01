export type ErrorMessageLevel = "debug" | "user";

// A single switch you can use across UI/API error rendering.
// - debug: show details (dev-friendly)
// - user: hide internal details (production-friendly)
export const errorMessageLevel: ErrorMessageLevel =
	(process.env.NEXT_PUBLIC_ERROR_MESSAGE_LEVEL as ErrorMessageLevel | undefined) ??
	(process.env.NODE_ENV === "development" ? "debug" : "user");
