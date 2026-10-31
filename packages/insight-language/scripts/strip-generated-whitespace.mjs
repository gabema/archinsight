import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const files = [
  "src/generated/InsightLexer.ts",
  "src/generated/InsightParser.ts",
  "src/generated/AiqLexer.ts",
  "src/generated/AiqParser.ts",
];

for (const file of files) {
  const path = join(root, file);
  const source = readFileSync(path, "utf8");
  writeFileSync(path, source.replace(/[ \t]+$/gm, ""));
}
