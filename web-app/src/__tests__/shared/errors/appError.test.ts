import { describe, expect, it, vi } from "vitest";

async function loadAppErrorModule(level: "debug" | "user", locale?: "ja" | "en") {
	process.env.NEXT_PUBLIC_ERROR_MESSAGE_LEVEL = level;
	if (locale) {
		process.env.NEXT_PUBLIC_LOCALE = locale;
	} else {
		delete process.env.NEXT_PUBLIC_LOCALE;
	}
	vi.resetModules();
	return await import("../../../shared/errors/appError");
}

describe("tryParseAppErrorMessage", () => {
	it("returns null for non-JSON strings", async () => {
		const { tryParseAppErrorMessage } = await loadAppErrorModule("debug");
		expect(tryParseAppErrorMessage("boom")).toBeNull();
	});

	it("parses {code,message,details}", async () => {
		const { tryParseAppErrorMessage } = await loadAppErrorModule("debug");
		const parsed = tryParseAppErrorMessage(
			JSON.stringify({ code: "InvalidInput", message: "bad", details: "x" }),
		);
		expect(parsed).toEqual({ code: "InvalidInput", message: "bad", details: "x" });
	});

	it("stringifies non-string details", async () => {
		const { tryParseAppErrorMessage } = await loadAppErrorModule("debug");
		const parsed = tryParseAppErrorMessage(
			JSON.stringify({ code: "InvalidInput", message: "bad", details: { a: 1 } }),
		);
		expect(parsed).toEqual({
			code: "InvalidInput",
			message: "bad",
			details: "{\"a\":1}",
		});
	});
});

describe("errorToDisplayMessage", () => {
	it("debug: returns raw string for unknown error shape", async () => {
		const { errorToDisplayMessage } = await loadAppErrorModule("debug");
		expect(errorToDisplayMessage(new Error("plain"))).toBe("plain");
		expect(errorToDisplayMessage("plain2")).toBe("plain2");
	});

	it("user: hides details for unknown error shape", async () => {
		const { errorToDisplayMessage } = await loadAppErrorModule("user");
		expect(errorToDisplayMessage(new Error("plain"))).toBe("不明なエラーが発生しました");
	});

	it("debug: prefers mapped message and appends details", async () => {
		const { errorToDisplayMessage } = await loadAppErrorModule("debug");
		const err = new Error(
			JSON.stringify({ code: "DivisionByZero", message: "Division by zero", details: "stack" }),
		);
		const msg = errorToDisplayMessage(err, {
			locale: "ja",
			codeMessageMap: {
				DivisionByZero: { ja: "0で割れません", en: "Division by zero" },
			},
		});
		expect(msg).toBe("0で割れません\nstack");
	});

	it("user: shows mapped or rust message without details", async () => {
		const { errorToDisplayMessage } = await loadAppErrorModule("user");
		const err = new Error(
			JSON.stringify({ code: "DivisionByZero", message: "Division by zero", details: "stack" }),
		);
		const msg = errorToDisplayMessage(err, {
			locale: "ja",
			codeMessageMap: {
				DivisionByZero: { ja: "0で割れません" },
			},
		});
		expect(msg).toBe("0で割れません");
	});

	it("locale fallback: uses en when ja missing", async () => {
		const { errorToDisplayMessage } = await loadAppErrorModule("user");
		const err = new Error(JSON.stringify({ code: "X", message: "fallback" }));
		const msg = errorToDisplayMessage(err, {
			locale: "ja",
			codeMessageMap: {
				X: { en: "EN only" },
			},
		});
		expect(msg).toBe("EN only");
	});

	it("default locale: uses NEXT_PUBLIC_LOCALE when provided", async () => {
		const { errorToDisplayMessage } = await loadAppErrorModule("user", "en");
		const err = new Error(JSON.stringify({ code: "X", message: "fallback" }));
		const msg = errorToDisplayMessage(err, {
			codeMessageMap: {
				X: { ja: "JP", en: "EN" },
			},
		});
		expect(msg).toBe("EN");
	});
});
