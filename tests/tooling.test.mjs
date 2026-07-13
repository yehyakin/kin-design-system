import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const kinVersion = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;

test("Figma export is a create-only Variables REST payload", () => {
  const payload = JSON.parse(fs.readFileSync(path.join(root, "tokens", "kin.figma.variables.json"), "utf8"));
  assert.equal(payload.variableCollections.length, 3);
  assert.ok(payload.variables.length > 40);
  assert.ok(payload.variableModeValues.length > payload.variables.length);
  assert.ok(payload.variableCollections.every((item) => item.action === "CREATE"));
  assert.ok(payload.variables.every((item) => item.action === "CREATE"));
  assert.ok(payload.variableModeValues.some((item) => item.modeId.includes("high_contrast")));

  const collectionIds = new Set(payload.variableCollections.map((item) => item.id));
  const modeIds = new Set(payload.variableModes.map((item) => item.id));
  const variableIds = new Set(payload.variables.map((item) => item.id));
  assert.equal(collectionIds.size, payload.variableCollections.length);
  assert.equal(modeIds.size, payload.variableModes.length);
  assert.equal(variableIds.size, payload.variables.length);

  for (const mode of payload.variableModes) assert.ok(collectionIds.has(mode.variableCollectionId));
  for (const variable of payload.variables) assert.ok(collectionIds.has(variable.variableCollectionId));
  for (const item of payload.variableModeValues) {
    assert.ok(variableIds.has(item.variableId));
    assert.ok(modeIds.has(item.modeId));
    const variable = payload.variables.find((candidate) => candidate.id === item.variableId);
    if (variable.resolvedType === "COLOR") {
      assert.deepEqual(Object.keys(item.value).sort(), ["a", "b", "g", "r"]);
      assert.ok(Object.values(item.value).every((value) => typeof value === "number" && value >= 0 && value <= 1));
    } else if (variable.resolvedType === "FLOAT") assert.equal(typeof item.value, "number");
    else if (variable.resolvedType === "STRING") assert.equal(typeof item.value, "string");
  }
});

test("adoption initializer is non-destructive and checker accepts a completed record", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-adoption-"));
  execFileSync(process.execPath, [path.join(root, "scripts", "init-adoption.mjs"), project], { stdio: "pipe" });
  const configPath = path.join(project, "kin.config.json");
  const evidencePath = path.join(project, "docs", "kin-evidence.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  assert.equal(config.delivery.mode, "contract-first");
  assert.equal(config.delivery.figma, "variables-only");
  assert.equal(config.delivery.runtime, "project-owned");
  assert.equal(config.contract.revision, `v${kinVersion}`);
  assert.match(config.contract.checksum, /^[a-f0-9]{64}$/);
  assert.equal(evidence.status, "initialized");
  const incomplete = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(incomplete.status, 1);
  assert.ok(JSON.parse(incomplete.stdout).errors.some((message) => message.includes("Pinned contract is missing")));
  fs.mkdirSync(path.join(project, "src", "styles"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "styles", "tokens.css"), ":root {}\n");
  const pinnedContract = "# pinned contract\n";
  fs.writeFileSync(path.join(project, "docs", "KIN-DESIGN.md"), pinnedContract);
  config.contract.checksum = createHash("sha256").update(pinnedContract).digest("hex");
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  execFileSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project], { stdio: "pipe" });
  const before = fs.readFileSync(configPath, "utf8");
  const evidenceBefore = fs.readFileSync(evidencePath, "utf8");
  execFileSync(process.execPath, [path.join(root, "scripts", "init-adoption.mjs"), project], { stdio: "pipe" });
  assert.equal(fs.readFileSync(configPath, "utf8"), before);
  assert.equal(fs.readFileSync(evidencePath, "utf8"), evidenceBefore);
});

test("adoption JSON Schema and example are valid JSON", () => {
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(root, "adoption", "kin.config.schema.json"), "utf8")));
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(root, "adoption", "kin.config.example.json"), "utf8")));
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(root, "adoption", "kin.evidence.schema.json"), "utf8")));
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(root, "adoption", "kin.evidence.example.json"), "utf8")));
});

test("adoption checker rejects evidence that overstates verification", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-evidence-"));
  execFileSync(process.execPath, [path.join(root, "scripts", "init-adoption.mjs"), project], { stdio: "pipe" });
  fs.mkdirSync(path.join(project, "src", "styles"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "styles", "tokens.css"), ":root {}\n");
  fs.writeFileSync(path.join(project, "docs", "KIN-DESIGN.md"), `---\nkin_version: ${kinVersion}\n---\n`);
  const evidencePath = path.join(project, "docs", "kin-evidence.json");
  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  evidence.status = "verified";
  evidence.reviewedOn = "2026-07-13";
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

  const run = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 1);
  const result = JSON.parse(run.stdout);
  assert.equal(result.evidenceStatus, "verified");
  assert.ok(result.errors.some((message) => message.includes("every tracked automated check")));
  assert.ok(result.errors.some((message) => message.includes("mappings.tokens")));
});

test("adoption checker validates a full commit revision and local contract checksum", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-pinned-adoption-"));
  execFileSync(process.execPath, [path.join(root, "scripts", "init-adoption.mjs"), project], { stdio: "pipe" });
  fs.mkdirSync(path.join(project, "src", "styles"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "styles", "tokens.css"), ":root {}\n");
  const contract = `---\nkin_version: ${kinVersion}\n---\n`;
  fs.writeFileSync(path.join(project, "docs", "KIN-DESIGN.md"), contract);
  const configPath = path.join(project, "kin.config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  config.contract.revision = "410c61a664d10963b26f48ddfd6a2ee067fa6c95";
  config.contract.source = `https://github.com/yehyakin/kin-design-system/blob/${config.contract.revision}/DESIGN.md`;
  config.contract.checksum = createHash("sha256").update(contract).digest("hex");
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

  const valid = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(valid.status, 0, valid.stdout || valid.stderr);
  assert.doesNotMatch(valid.stdout, /does not appear to pin/);

  config.contract.checksum = "0".repeat(64);
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  const invalid = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(invalid.status, 1);
  assert.ok(JSON.parse(invalid.stdout).errors.some((message) => message.includes("does not match contract.checksum")));
});

test("adoption checker rejects a mapped stage with pending mappings or missing ownership", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-mapped-adoption-"));
  execFileSync(process.execPath, [path.join(root, "scripts", "init-adoption.mjs"), project], { stdio: "pipe" });
  fs.mkdirSync(path.join(project, "src", "styles"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "styles", "tokens.css"), ":root {}\n");
  fs.writeFileSync(path.join(project, "docs", "KIN-DESIGN.md"), `---\nkin_version: ${kinVersion}\n---\n`);
  const evidencePath = path.join(project, "docs", "kin-evidence.json");
  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  evidence.status = "mapped";
  evidence.reviewedOn = "2026-07-13";
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

  const run = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 1);
  const result = JSON.parse(run.stdout);
  assert.ok(result.errors.some((message) => message.includes("cannot leave mappings.tokens pending")));
  assert.ok(result.errors.some((message) => message.includes("requires named product, design, engineering, and accessibility ownership")));
});

test("adoption checker requires timestamps for completed automated checks", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-check-time-"));
  execFileSync(process.execPath, [path.join(root, "scripts", "init-adoption.mjs"), project], { stdio: "pipe" });
  fs.mkdirSync(path.join(project, "src", "styles"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "styles", "tokens.css"), ":root {}\n");
  fs.writeFileSync(path.join(project, "docs", "KIN-DESIGN.md"), `---\nkin_version: ${kinVersion}\n---\n`);
  const evidencePath = path.join(project, "docs", "kin-evidence.json");
  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  evidence.verification.automated[0].status = "passed";
  evidence.verification.automated[0].notes = "Command completed in the local test environment.";
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

  const run = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 1);
  assert.ok(JSON.parse(run.stdout).errors.some((message) => message.includes("requires runAt")));
});

test("adoption checker preserves older configuration with a delivery warning", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-legacy-adoption-"));
  fs.mkdirSync(path.join(project, "src", "styles"), { recursive: true });
  fs.mkdirSync(path.join(project, "docs"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "styles", "tokens.css"), ":root {}\n");
  fs.writeFileSync(path.join(project, "docs", "KIN-DESIGN.md"), `---\nkin_version: ${kinVersion}\n---\n`);
  const config = JSON.parse(fs.readFileSync(path.join(root, "adoption", "kin.config.example.json"), "utf8"));
  delete config.delivery;
  delete config.contract.revision;
  delete config.contract.checksum;
  fs.writeFileSync(path.join(project, "kin.config.json"), `${JSON.stringify(config, null, 2)}\n`);

  const run = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.equal(result.valid, true);
  assert.ok(result.warnings.some((message) => message.includes("delivery is not recorded")));
});

test("component catalog and terminology pass structural validation", () => {
  const run = spawnSync(process.execPath, [path.join(root, "scripts", "validate-components.mjs"), "--json"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.ok(result.summary.catalogEntries >= 40);
  assert.ok(result.summary.terminologyEntries >= 20);
  assert.equal(result.summary.errors, 0);
});

test("candidate audit reports context and does not fail on P2 alone", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-audit-"));
  fs.mkdirSync(path.join(project, "src"));
  fs.writeFileSync(path.join(project, "src", "app.css"), ".panel { transition: all 180ms; }\n");
  const run = spawnSync(process.execPath, [path.join(root, "scripts", "audit-project.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 0);
  const report = JSON.parse(run.stdout);
  assert.equal(report.findingCount, 1);
  assert.equal(report.findings[0].rule, "kin/transition-all");
  assert.match(report.notice, /review candidates/);
});

test("candidate audit does not penalize required browser theme-color plumbing", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-theme-audit-"));
  fs.mkdirSync(path.join(project, "src"));
  fs.writeFileSync(path.join(project, "src", "index.html"), '<meta name="theme-color" content="#08090a" />\n');
  const run = spawnSync(process.execPath, [path.join(root, "scripts", "audit-project.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 0);
  assert.equal(JSON.parse(run.stdout).findingCount, 0);
});

test("adoption checker detects a pinned contract version mismatch", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-version-"));
  execFileSync(process.execPath, [path.join(root, "scripts", "init-adoption.mjs"), project], { stdio: "pipe" });
  fs.mkdirSync(path.join(project, "src", "styles"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "styles", "tokens.css"), ":root {}\n");
  fs.writeFileSync(path.join(project, "docs", "KIN-DESIGN.md"), "---\nkin_version: 1.4.0\n---\n");
  const run = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 1);
  const result = JSON.parse(run.stdout);
  assert.ok(result.errors.some((message) => message.includes("does not match")));
});

test("CLI entry points reject missing directories without stack traces", () => {
  const missing = path.join(os.tmpdir(), `kin-missing-${Date.now()}`);
  for (const script of ["audit-project.mjs", "check-adoption.mjs", "init-adoption.mjs"]) {
    const run = spawnSync(process.execPath, [path.join(root, "scripts", script), missing], { encoding: "utf8" });
    assert.equal(run.status, 2);
    assert.doesNotMatch(run.stderr, /at file:\/\//);
  }
});

test("reference server exposes examples but not repository internals", async () => {
  const port = 4300 + Math.floor(Math.random() * 500);
  const child = spawn(process.execPath, [path.join(root, "scripts", "serve-reference.mjs")], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/examples/workspace-reference/`);
        if (response.status === 200) { ready = true; break; }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assert.equal(ready, true);
    assert.equal((await fetch(`http://127.0.0.1:${port}/package.json`)).status, 404);
    assert.equal((await fetch(`http://127.0.0.1:${port}/examples/../package.json`)).status, 404);
  } finally {
    child.kill();
  }
});
