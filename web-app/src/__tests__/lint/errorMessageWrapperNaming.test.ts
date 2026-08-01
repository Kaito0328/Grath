import { describe, expect, it } from "vitest";

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

function toCamelCase(name: string): string {
	return name
		.split(/[-_]/g)
		.filter(Boolean)
		.map((part, idx) => {
			const lower = part.toLowerCase();
			if (idx === 0) return lower;
			return lower.charAt(0).toUpperCase() + lower.slice(1);
		})
		.join("");
}

async function isDirectory(p: string): Promise<boolean> {
	try {
		return (await stat(p)).isDirectory();
	} catch {
		return false;
	}
}

describe("lint: error message wrapper naming", () => {
	it("requires each feature with config/errorCodeMessages.ts to export standard identifiers", async () => {
		const repoRoot = path.resolve(__dirname, "../../..");
		const featuresDir = path.join(repoRoot, "src", "features");

		const featureEntries = await readdir(featuresDir);
		const offenders: string[] = [];

		for (const featureName of featureEntries) {
			const featurePath = path.join(featuresDir, featureName);
			if (!(await isDirectory(featurePath))) continue;

			const configPath = path.join(featurePath, "config", "errorCodeMessages.ts");
			try {
				const content = await readFile(configPath, "utf8");
				const camel = toCamelCase(featureName);

				const expectedMap = `export const ${camel}ErrorCodeMessageMap`;
				const expectedFn = `export function ${camel}ErrorToDisplayMessage`;

				if (!content.includes(expectedMap) || !content.includes(expectedFn)) {
					offenders.push(
						`${path
							.relative(repoRoot, configPath)
							.replaceAll(path.sep, "/")}: missing ${camel}ErrorCodeMessageMap and/or ${camel}ErrorToDisplayMessage`,
					);
				}

				// Enforce common-map composition for crate features.
				if (!content.includes("commonErrorCodeMessageMap") || !content.includes("...commonErrorCodeMessageMap")) {
					offenders.push(
						`${path
							.relative(repoRoot, configPath)
							.replaceAll(path.sep, "/")}: missing commonErrorCodeMessageMap composition`,
					);
				}
			} catch {
				// Feature has no errorCodeMessages.ts yet; that's fine.
			}
		}

		expect(offenders).toEqual([]);
	});
});
