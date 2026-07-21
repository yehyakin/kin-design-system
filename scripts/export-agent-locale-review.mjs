import fs from "node:fs";
import process from "node:process";
import { buildAgentLocaleReviewPacket } from "./lib/agent-locale-review.mjs";
import { resolveOutputFileWithin, writeFileSafelyWithin } from "./lib/safe-path.mjs";

function parseArguments(args) {
  if (args.length === 0) return { check: false };
  if (args.length === 1 && args[0] === "--check") return { check: true };
  throw new Error("Usage: node scripts/export-agent-locale-review.mjs [--check]");
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

const root = process.cwd();
const targetPath = "reviews/agent-locales.md";
const target = resolveOutputFileWithin(root, targetPath);
const expected = buildAgentLocaleReviewPacket(root);

if (options.check) {
  if (!fs.existsSync(target)) {
    console.error("Agent locale review packet is missing. Run npm run agent:review:export.");
    process.exit(1);
  }
  const actual = fs.readFileSync(target, "utf8");
  if (actual !== expected) {
    console.error("Agent locale review packet drift detected. Run npm run agent:review:export and review the diff.");
    process.exit(1);
  }
  console.log("Agent locale review packet matches the current source and locale inputs.");
} else {
  writeFileSafelyWithin(root, targetPath, expected);
  console.log("Agent locale review packet written to reviews/agent-locales.md.");
}
