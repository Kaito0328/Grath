import { describe, expect, it } from "vitest";

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

async function listFilesRecursive(dir: string): Promise<string[]> {
	const entries = await readdir(dir);
	const out: string[] = [];
	for (const entry of entries) {
		const full = path.join(dir, entry);
		const s = await stat(full);
		if (s.isDirectory()) {
			out.push(...(await listFilesRecursive(full)));
		} else {
			out.push(full);
		}
	}
	return out;
}

describe("lint: no direct errorToDisplayMessage calls in features", () => {
	it("requires feature code to use crate-specific wrappers", async () => {
		const repoRoot = path.resolve(__dirname, "../../..");
		const featuresDir = path.join(repoRoot, "src", "features");

		const files = (await listFilesRecursive(featuresDir)).filter((p) =>
			p.endsWith(".ts") || p.endsWith(".tsx"),
		);

		const offenders: string[] = [];

		for (const filePath of files) {
			const rel = path.relative(repoRoot, filePath).replaceAll(path.sep, "/");

			// Allow wrappers to delegate to the shared implementation.
			if (rel.endsWith("/config/errorCodeMessages.ts")) continue;
			if (rel.endsWith(".generated.ts")) continue;

			const content = await readFile(filePath, "utf8");
			if (content.includes("errorToDisplayMessage(")) {
				offenders.push(rel);
			}
		}

		expect(offenders).toEqual([]);
	});
});
