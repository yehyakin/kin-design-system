import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { contractChecksum } from "../scripts/contract-checksum.mjs";

const root = path.resolve(import.meta.dirname, "..");
const kinVersion = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
const designContract = fs.readFileSync(path.join(root, "DESIGN.md"), "utf8");
const releaseStatus = designContract.match(/^release_status:\s*(development|released)\s*$/m)?.[1];

function initAdoption(project, profile = "information-site") {
  execFileSync(process.execPath, [path.join(root, "scripts", "init-adoption.mjs"), project, "--profile", profile], { stdio: "pipe" });
}

test("Figma export is a create-only Variables REST payload", () => {
  const dtcg = JSON.parse(fs.readFileSync(path.join(root, "tokens", "kin.tokens.json"), "utf8"));
  const tailwind = fs.readFileSync(path.join(root, "tokens", "kin.tailwind.css"), "utf8");
  const payload = JSON.parse(fs.readFileSync(path.join(root, "tokens", "kin.figma.variables.json"), "utf8"));
  assert.equal(dtcg.typography.micro.$value.fontSize.value, 11);
  assert.match(dtcg.typography.body.$value.fontFamily, /PingFang SC/);
  assert.deepEqual(dtcg.motion["duration-fast"].$value, { value: 140, unit: "ms" });
  assert.deepEqual(dtcg.motion["ease-standard"].$value, [0.2, 0, 0, 1]);
  assert.match(tailwind, /--font-body: Inter, Geist, "SF Pro Text"/);
  assert.match(tailwind, /--duration-fast: 140ms/);
  assert.match(tailwind, /--ease-standard: cubic-bezier\(0\.2, 0, 0, 1\)/);
  assert.equal(payload.variableCollections.length, 4);
  assert.ok(payload.variables.length > 40);
  assert.ok(payload.variableModeValues.length > payload.variables.length);
  assert.ok(payload.variableCollections.every((item) => item.action === "CREATE"));
  assert.ok(payload.variables.every((item) => item.action === "CREATE"));
  assert.ok(payload.variableModeValues.some((item) => item.modeId.includes("high_contrast")));
  assert.ok(payload.variableCollections.some((item) => item.name === "KIN Motion"));
  assert.ok(payload.variables.some((item) => item.codeSyntax?.WEB === "--duration-fast" && item.resolvedType === "FLOAT"));
  assert.ok(payload.variables.some((item) => item.codeSyntax?.WEB === "--ease-standard" && item.resolvedType === "STRING"));

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
  initAdoption(project);
  const configPath = path.join(project, "kin.config.json");
  const evidencePath = path.join(project, "docs", "kin-evidence.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  assert.equal(config.delivery.mode, "contract-first");
  assert.equal(config.delivery.figma, "variables-only");
  assert.equal(config.delivery.runtime, "project-owned");
  if (releaseStatus === "released") {
    assert.equal(config.contract.revision, `v${kinVersion}`);
  } else {
    assert.match(config.contract.revision, /^[a-f0-9]{40}$/);
    assert.match(config.contract.source, new RegExp(`/${config.contract.revision}$`));
    assert.match(fs.readFileSync(path.join(project, "docs", "kin-adoption.md"), "utf8"), /development revision/);
  }
  assert.match(config.contract.checksum, /^[a-f0-9]{64}$/);
  assert.equal(config.scope.implementationBrief, "docs/kin-implementation-brief.md");
  assert.equal(config.scope.routeProfiles.length, 1);
  assert.equal(config.scope.routeProfiles[0].profile, "information-site");
  assert.equal(config.scope.routeProfiles[0].representative, true);
  assert.match(fs.readFileSync(path.join(project, config.scope.implementationBrief), "utf8"), /^status: draft$/m);
  assert.equal(evidence.status, "initialized");
  assert.equal(evidence.visualReview.status, "not-run");
  assert.equal(evidence.visualReview.profile, "information-site");
  assert.equal(evidence.visualReview.criteria.length, 9);
  const incomplete = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(incomplete.status, 1);
  assert.ok(JSON.parse(incomplete.stdout).errors.some((message) => message.includes("Pinned contract is missing")));
  fs.mkdirSync(path.join(project, "src", "styles"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "styles", "tokens.css"), ":root {}\n");
  const pinnedContract = "# pinned contract\n";
  fs.writeFileSync(path.join(project, "docs", "KIN-DESIGN.md"), pinnedContract);
  config.contract.checksum = contractChecksum(pinnedContract);
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  execFileSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project], { stdio: "pipe" });
  const before = fs.readFileSync(configPath, "utf8");
  const evidenceBefore = fs.readFileSync(evidencePath, "utf8");
  initAdoption(project);
  assert.equal(fs.readFileSync(configPath, "utf8"), before);
  assert.equal(fs.readFileSync(evidencePath, "utf8"), evidenceBefore);
});

test("adoption initializer requires an explicit product profile", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-profile-required-"));
  const run = spawnSync(process.execPath, [path.join(root, "scripts", "init-adoption.mjs"), project], { encoding: "utf8" });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /--profile is required/);
});

test("adoption checker blocks mapped evidence while the composition brief is unresolved", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-composition-gate-"));
  initAdoption(project, "intelligence-workspace");
  fs.mkdirSync(path.join(project, "src", "styles"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "styles", "tokens.css"), ":root {}\n");
  const contract = `---\nkin_version: ${kinVersion}\n---\n`;
  fs.writeFileSync(path.join(project, "docs", "KIN-DESIGN.md"), contract);

  const configPath = path.join(project, "kin.config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  config.contract.checksum = contractChecksum(contract);
  config.scope.routeProfiles = [
    { route: "/entities/**", profile: "intelligence-workspace", purpose: "Investigate an entity and verify its evidence.", representative: true },
  ];
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

  const evidencePath = path.join(project, "docs", "kin-evidence.json");
  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  evidence.status = "mapped";
  evidence.reviewedOn = "2026-07-14";
  for (const group of Object.values(evidence.mappings)) group.status = "mapped";
  evidence.mappings.components.items = [{ kin: "Data Row", local: "src/components/entity-row.tsx", notes: "Mapped to the current entity row." }];
  evidence.mappings.routes.items = [{ kin: "Representative workflow", local: "/entities/**", notes: "Entity investigation route family." }];
  evidence.ownership = { product: "Product owner", design: "Design owner", engineering: "Engineering owner", accessibility: "Accessibility owner" };
  evidence.visualReview.workflow = "Investigate an entity and verify evidence";
  evidence.visualReview.routes = ["/entities/**"];
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

  const run = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 1);
  const result = JSON.parse(run.stdout);
  assert.ok(result.errors.some((message) => message.includes("cannot use a draft implementation brief")));
  assert.ok(result.errors.some((message) => message.includes("cannot contain unresolved TODO")));
});

test("adoption checker rejects a passed visual review with unreviewed criteria", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-visual-criteria-"));
  initAdoption(project);
  const evidencePath = path.join(project, "docs", "kin-evidence.json");
  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  evidence.visualReview.status = "passed";
  evidence.visualReview.workflow = "Find and verify a record";
  evidence.visualReview.routes = ["TODO"];
  evidence.visualReview.baseline = "artifacts/baseline.png";
  evidence.visualReview.candidate = "artifacts/candidate.png";
  evidence.visualReview.environment = "Chromium 1440x900 light";
  evidence.visualReview.reviewer = "Reviewer";
  evidence.visualReview.reviewedOn = "2026-07-14";
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

  const run = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 1);
  assert.ok(JSON.parse(run.stdout).errors.some((message) => message.includes("every visual criterion to pass")));
});

test("adoption JSON Schema and example are valid JSON", () => {
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(root, "adoption", "kin.config.schema.json"), "utf8")));
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(root, "adoption", "kin.config.example.json"), "utf8")));
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(root, "adoption", "kin.evidence.schema.json"), "utf8")));
  assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(root, "adoption", "kin.evidence.example.json"), "utf8")));
});

test("adoption checker rejects evidence that overstates verification", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-evidence-"));
  initAdoption(project);
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
  assert.ok(result.errors.some((message) => message.includes("visualReview to pass")));
});

test("adoption checker keeps legacy pre-verification evidence readable with a visual review warning", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-legacy-evidence-"));
  initAdoption(project);
  fs.mkdirSync(path.join(project, "src", "styles"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "styles", "tokens.css"), ":root {}\n");
  const contract = `---\nkin_version: ${kinVersion}\n---\n`;
  fs.writeFileSync(path.join(project, "docs", "KIN-DESIGN.md"), contract);

  const configPath = path.join(project, "kin.config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  config.contract.checksum = contractChecksum(contract);
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

  const evidencePath = path.join(project, "docs", "kin-evidence.json");
  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  delete evidence.visualReview;
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

  const run = spawnSync(process.execPath, [path.join(root, "scripts", "check-adoption.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stdout || run.stderr);
  assert.ok(JSON.parse(run.stdout).warnings.some((message) => message.includes("visualReview is not recorded")));
});

test("adoption checker validates a full commit revision and local contract checksum", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-pinned-adoption-"));
  initAdoption(project);
  fs.mkdirSync(path.join(project, "src", "styles"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "styles", "tokens.css"), ":root {}\n");
  const contract = `---\nkin_version: ${kinVersion}\n---\n`;
  fs.writeFileSync(path.join(project, "docs", "KIN-DESIGN.md"), contract);
  const configPath = path.join(project, "kin.config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  config.contract.revision = "410c61a664d10963b26f48ddfd6a2ee067fa6c95";
  config.contract.source = `https://github.com/yehyakin/kin-design-system/blob/${config.contract.revision}/DESIGN.md`;
  config.contract.checksum = contractChecksum(contract);
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

test("contract checksum is stable across BOM and platform line endings", () => {
  const lf = `---\nkin_version: ${kinVersion}\n---\ncontract\n`;
  const crlfWithBom = `\uFEFF${lf.replace(/\n/g, "\r\n")}`;
  assert.equal(contractChecksum(crlfWithBom), contractChecksum(lf));
  assert.notEqual(contractChecksum(`${lf}\n`), contractChecksum(lf));
});

test("adoption checker rejects a mapped stage with pending mappings or missing ownership", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-mapped-adoption-"));
  initAdoption(project);
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
  initAdoption(project);
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
  delete config.scope;
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

test("page catalog passes maturity and evidence-path validation", () => {
  const run = spawnSync(process.execPath, [path.join(root, "scripts", "validate-pages.mjs"), "--json"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.ok(result.summary.pageEntries >= 10);
  assert.ok(result.summary.stable >= 8);
  assert.equal(result.summary.errors, 0);
});

test("scenario catalog passes source-maturity and presentation validation", () => {
  const run = spawnSync(process.execPath, [path.join(root, "scripts", "validate-scenarios.mjs"), "--json"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.equal(result.summary.scenarioEntries, 30);
  assert.equal(result.summary.pilots, 6);
  assert.equal(result.summary.linked, 0);
  assert.equal(result.summary.showcased, 15);
  assert.equal(result.summary.planned, 15);
  assert.equal(result.summary.errors, 0);

  const catalog = JSON.parse(fs.readFileSync(path.join(root, "scenarios", "catalog.json"), "utf8"));
  assert.equal(catalog.schema_version, "1.1.0");
  assert.equal(catalog.catalog_version, "1.4.0");
  const showcased = catalog.scenarios.filter((scenario) => scenario.presentation_status === "showcased");
  assert.ok(showcased.every((scenario) => scenario.states.length === scenario.state_controls.length));
  assert.deepEqual(showcased.find((scenario) => scenario.id === "CORE-01").states, ["normal", "rate-limit", "permission", "error", "offline", "recovery"]);
  assert.deepEqual(showcased.find((scenario) => scenario.id === "CORE-03").states, ["normal", "partial", "stale", "empty", "error"]);
  assert.deepEqual(showcased.find((scenario) => scenario.id === "CORE-05").states, ["recovery", "permission", "conflict", "offline", "rate-limit", "error"]);
  assert.deepEqual(showcased.find((scenario) => scenario.id === "WORK-01").states, ["normal", "partial", "conflict", "empty"]);
  assert.deepEqual(showcased.find((scenario) => scenario.id === "INF-02").states, ["normal"]);
  assert.deepEqual(showcased.find((scenario) => scenario.id === "INF-03").states, ["normal"]);
  assert.deepEqual(showcased.find((scenario) => scenario.id === "COM-02").states, ["normal", "pending", "error", "loading", "committed", "permission", "failed"]);
  assert.deepEqual(showcased.find((scenario) => scenario.id === "ENG-02").states, ["normal"]);
  assert.equal(showcased.reduce((total, scenario) => total + scenario.state_controls.length, 0), 38);
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

test("candidate audit excludes generated directories at any workspace depth", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-generated-audit-"));
  fs.mkdirSync(path.join(project, "packages", "sample", "dist"), { recursive: true });
  fs.mkdirSync(path.join(project, "src"));
  fs.writeFileSync(path.join(project, "packages", "sample", "dist", "generated.css"), ".generated { outline: 0; }\n");
  fs.writeFileSync(path.join(project, "src", "app.css"), ".app { color: var(--text); }\n");
  const run = spawnSync(process.execPath, [path.join(root, "scripts", "audit-project.mjs"), project, "--json"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const report = JSON.parse(run.stdout);
  assert.equal(report.findingCount, 0);
  assert.equal(report.scannedFiles, 1);
});

test("adoption checker detects a pinned contract version mismatch", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "kin-version-"));
  initAdoption(project);
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
