import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { parseMotionTokens } from "./motion-tokens.mjs";

const root = process.cwd();
const base = process.argv.slice(2).find((argument) => !argument.startsWith("--")) ?? "HEAD";
const asJson = process.argv.includes("--json");
const packageVersion = "0.3.0";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32" && command.endsWith(".cmd"),
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `${command} exited with ${result.status}`);
  return result.stdout;
}

const before = run("git", ["show", `${base}:DESIGN.md`]);
const after = fs.readFileSync(path.join(root, "DESIGN.md"), "utf8");
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "kin-design-diff-"));
const beforeFile = path.join(temporaryDirectory, "before.md");

try {
  fs.writeFileSync(beforeFile, before, "utf8");
  const raw = run(npx, [
    "-y", "-p", `@google/design.md@${packageVersion}`, "designmd", "diff", beforeFile, "DESIGN.md",
  ]);
  const report = JSON.parse(raw);
  const beforeMotion = parseMotionTokens(before);
  const afterMotion = parseMotionTokens(after);
  const motion = {
    added: Object.keys(afterMotion).filter((name) => !(name in beforeMotion)),
    removed: Object.keys(beforeMotion).filter((name) => !(name in afterMotion)),
    modified: Object.keys(afterMotion).filter((name) => name in beforeMotion && afterMotion[name] !== beforeMotion[name]),
  };

  if (asJson) {
    console.log(JSON.stringify({ base, ...report, motion }, null, 2));
    process.exit(0);
  }

  console.log(`# KIN Token changes against ${base}\n`);
  let changed = 0;
  for (const [group, changes] of Object.entries(report.tokens)) {
    const count = changes.added.length + changes.removed.length + changes.modified.length;
    changed += count;
    if (count === 0) continue;
    console.log(`## ${group}`);
    for (const token of changes.added) console.log(`- Added: ${typeof token === "string" ? token : token.path}`);
    for (const token of changes.removed) console.log(`- Removed: ${typeof token === "string" ? token : token.path}`);
    for (const token of changes.modified) {
      const name = typeof token === "string" ? token : token.path;
      console.log(`- Modified: ${name}`);
    }
    console.log("");
  }

  const motionCount = motion.added.length + motion.removed.length + motion.modified.length;
  changed += motionCount;
  if (motionCount > 0) {
    console.log("## motion");
    for (const token of motion.added) console.log(`- Added: ${token}`);
    for (const token of motion.removed) console.log(`- Removed: ${token}`);
    for (const token of motion.modified) console.log(`- Modified: ${token}`);
    console.log("");
  }

  if (changed === 0) console.log("No machine-readable Token changes.\n");
  console.log(`Lint delta: ${report.findings.delta.errors} errors, ${report.findings.delta.warnings} warnings`);
  console.log(`Regression: ${report.regression ? "yes" : "no"}`);
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
