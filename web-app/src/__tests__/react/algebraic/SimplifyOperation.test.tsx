import { describe, expect, it, vi } from "vitest";

import React from "react";

// jest-dom matchers (toBeInTheDocument, etc.)
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

async function loadComponent() {
	process.env.NEXT_PUBLIC_LOCALE = "ja";
	process.env.NEXT_PUBLIC_ERROR_MESSAGE_LEVEL = "user";
	vi.resetModules();

	vi.doMock("@my-project/client-sdk/api/algebraicApi", () => {
		class SymbolicExpr {
			private text: string;
			constructor(text: string) {
				this.text = text;
			}
			static async fromString(text: string) {
				return new SymbolicExpr(text);
			}
			toString() {
				return this.text;
			}
			async toLatex() {
				return this.text;
			}
			async simplify() {
				throw new Error(
					JSON.stringify({
						code: "DivisionByZero",
						message: "Division by zero",
						details: "debug details",
					}),
				);
			}
		}
		return { SymbolicExpr };
	});

	const mod = await import(
		"../../../features/algebraic/ops/simplify/SimplifyOperation"
	);
	return mod.SimplifyOperation;
}

describe("SimplifyOperation", () => {
	it("shows mapped error message when wasm call fails", async () => {
		const SimplifyOperation = await loadComponent();
		render(<SimplifyOperation />);

		const user = userEvent.setup();
		await user.click(await screen.findByRole("button", { name: "簡約" }));

		expect(await screen.findByText("Division by zero")).toBeInTheDocument();
	});
});
