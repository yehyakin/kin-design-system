import path from "node:path";
import process from "node:process";
import { materializePagePatternChineseFiles } from "./lib/page-pattern-locales.mjs";

const root = process.cwd();
const check = process.argv.includes("--check");
const directory = path.join(root, "examples", "page-patterns");
const changes = materializePagePatternChineseFiles({ root, directory, write: !check });

if (check && changes.length > 0) {
  console.error(`Page-pattern Chinese fallback is stale: ${changes.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(
    changes.length === 0
      ? "Page-pattern Chinese fallback is current."
      : `Updated page-pattern Chinese fallback: ${changes.join(", ")}`,
  );
}
