import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "../../..");
const allowedExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
]);
const ignoredDirectories = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "out",
  "coverage",
]);

function collectFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(entryPath);
    }
    if (!allowedExtensions.has(path.extname(entry.name))) return [];
    return [entryPath];
  });
}

describe("error messages", () => {
  it("should not contain bare Error constructors", () => {
    const files = collectFiles(repoRoot);
    const violations = files.flatMap((filePath) => {
      const contents = readFileSync(filePath, "utf8");
      const matches = [...contents.matchAll(/new Error\(\s*\)/g)].map(
        (match) => ({
          filePath,
          index: match.index ?? 0,
        }),
      );
      return matches;
    });

    const formatted = violations
      .map(
        ({ filePath, index }) =>
          `${path.relative(repoRoot, filePath)}@${index}`,
      )
      .join("\n");

    expect(violations, formatted).toEqual([]);
  });
});
