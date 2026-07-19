import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { buildAgentDistribution } from "./lib/agent-distribution.mjs";
import { compareArtifactTree, replaceDirectorySafely, writeArtifactTree } from "./lib/generated-tree.mjs";
import { validateAgentDistribution } from "./validate-agent-distribution.mjs";

function parseArguments(args) {
  if (args.length === 0) return { check: false };
  if (args.length === 1 && args[0] === "--check") return { check: true };
  throw new Error("Usage: node scripts/export-agent-distribution.mjs [--check]");
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

const root = process.cwd();
execFileSync(process.execPath, [path.join(root, "scripts", "export-tokens.mjs"), "--check"], { cwd: root, stdio: ["ignore", "ignore", "inherit"] });
const { artifacts } = buildAgentDistribution(root);
const parent = path.join(root, "generated", "agent");
const target = path.join(parent, "next");
fs.mkdirSync(parent, { recursive: true });
const temporary = fs.mkdtempSync(path.join(parent, `next.tmp-${process.pid}-${os.hostname().replaceAll(/[^A-Za-z0-9_-]/g, "-")}-`));

try {
  writeArtifactTree(temporary, artifacts);
  const findings = validateAgentDistribution({ root, bundleDirectory: temporary });
  if (findings.length > 0) throw new Error(`temporary Agent tree failed validation:\n- ${findings.join("\n- ")}`);
  if (options.check) {
    const drift = compareArtifactTree(target, artifacts);
    if (drift.length > 0) {
      console.error(`Generated Agent distribution drift detected (${drift.length}):`);
      for (const finding of drift) console.error(`- ${finding}`);
      process.exitCode = 1;
    } else console.log("Generated Agent distribution matches reviewed inputs.");
  } else {
    replaceDirectorySafely(target, temporary);
    console.log("Generated Agent distribution written to generated/agent/next.");
  }
} finally {
  if (fs.existsSync(temporary)) fs.rmSync(temporary, { recursive: true, force: true });
}
