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

describe("lint: no raw html tags in ui layers", () => {
    it("disallows direct lowercase HTML tags in app/shared/features .tsx files", async () => {
        const repoRoot = path.resolve(__dirname, "../../..");
        const targetDirs = [
            path.join(repoRoot, "src", "app"),
            path.join(repoRoot, "src", "shared"),
            path.join(repoRoot, "src", "features"),
        ];

        const files = (
            await Promise.all(targetDirs.map((dir) => listFilesRecursive(dir)))
        )
            .flat()
            .filter((p) => p.endsWith(".tsx"));

        const rawTagPattern = /<(div|span|input|select|option|textarea|header|main|label|h[1-6]|p)(\s|>)/;
        const offenders: string[] = [];

        for (const filePath of files) {
            const rel = path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
            const content = await readFile(filePath, "utf8");
            const lines = content.split(/\r?\n/);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (rawTagPattern.test(line)) {
                    offenders.push(`${rel}:${i + 1}: ${line.trim()}`);
                }
            }
        }

        expect(offenders).toEqual([]);
    });
});