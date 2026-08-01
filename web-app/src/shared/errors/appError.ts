import { errorMessageLevel } from "../../config/env";

export type ErrorLocale = "ja" | "en";

export type ErrorCodeMessageValue =
	| string
	| {
			ja?: string;
			en?: string;
	  };

export type ErrorCodeMessageMap = Record<string, ErrorCodeMessageValue>;

export type ErrorToDisplayMessageOptions = {
	locale?: ErrorLocale;
	codeMessageMap?: ErrorCodeMessageMap;
};

// Default is empty; feature/crate UIs should inject their own map.
export const defaultErrorCodeMessageMap: ErrorCodeMessageMap = {};

export type AppErrorPayload = {
	code: string;
	message: string;
	details?: string | null;
};

function safeStringify(v: unknown): string {
	try {
		return JSON.stringify(v);
	} catch {
		return String(v);
	}
}

function tryPrettyJson(text: string): string | null {
	const trimmed = text.trim();
	if (!trimmed) return null;
	// Fast path: only attempt parse when it looks like JSON.
	const starts = trimmed[0];
	if (starts !== "{" && starts !== "[") return null;
	try {
		const parsed = JSON.parse(trimmed) as unknown;
		return JSON.stringify(parsed, null, 2);
	} catch {
		return null;
	}
}

function normalizeLocale(v: unknown): ErrorLocale | null {
	if (v === "ja" || v === "en") return v;
	return null;
}

function getDefaultErrorLocale(): ErrorLocale {
	// 1) Explicit public env override (build-time / runtime in Next)
	const fromEnv = normalizeLocale(process.env.NEXT_PUBLIC_LOCALE);
	if (fromEnv) return fromEnv;

	// 2) Browser language (client-side only)
	if (typeof navigator !== "undefined") {
		const lang = navigator.language?.toLowerCase() ?? "";
		if (lang.startsWith("en")) return "en";
		if (lang.startsWith("ja")) return "ja";
	}

	// 3) Fallback
	return "ja";
}

function resolveMessageByCode(args: {
	map: ErrorCodeMessageMap;
	code: string;
	locale: ErrorLocale;
}): string | null {
	const v = args.map[args.code];
	if (!v) return null;
	if (typeof v === "string") return v;
	return v[args.locale] ?? v.ja ?? v.en ?? null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null;
}

export function tryParseAppErrorMessage(message: string): AppErrorPayload | null {
	const trimmed = message.trim();
	if (!trimmed.startsWith("{")) return null;
	try {
		const parsed = JSON.parse(trimmed) as unknown;
		if (!isRecord(parsed)) return null;
		const code = parsed["code"];
		const msg = parsed["message"];
		const details = parsed["details"];
		if (typeof code !== "string" || typeof msg !== "string") return null;
		return {
			code,
			message: msg,
			details:
				typeof details === "string"
					? details
					: details == null
						? null
						: typeof details === "object"
							? safeStringify(details)
							: String(details),
		};
	} catch {
		return null;
	}
}

export function errorToDisplayMessage(err: unknown, options?: ErrorToDisplayMessageOptions): string {
	const raw = err instanceof Error ? err.message : String(err);
	const parsed = tryParseAppErrorMessage(raw);

	const locale = options?.locale ?? getDefaultErrorLocale();
	const codeMessageMap = options?.codeMessageMap ?? defaultErrorCodeMessageMap;

	if (!parsed) {
		return errorMessageLevel === "debug" ? raw : "不明なエラーが発生しました";
	}

	const mapped = resolveMessageByCode({ map: codeMessageMap, code: parsed.code, locale });

	if (errorMessageLevel === "debug") {
		// Prefer showing details when available.
		const msg = mapped ?? parsed.message;
		if (!parsed.details) return msg;
		const pretty = tryPrettyJson(parsed.details);
		return `${msg}\n${pretty ?? parsed.details}`;
	}

	// user: show safe message only
	return (mapped ?? parsed.message) || "不明なエラーが発生しました";
}
