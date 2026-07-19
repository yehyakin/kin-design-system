import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { scanProject } from "../skills/kin-design-engineer/scripts/candidate-scan.mjs";
import { collectEvidence, formatMarkdown } from "../skills/kin-design-engineer/scripts/collect-evidence.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const kinRoot = path.resolve(pluginRoot, "..", "..");
const collectorPath = path.join(pluginRoot, "skills", "kin-design-engineer", "scripts", "collect-evidence.mjs");

function fixture(prefix = "kin-design-engineer-") {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.mkdirSync(path.join(project, "src"), { recursive: true });
  return project;
}

test("bundled scan matches repository candidates for the shared rule set", () => {
  const project = fixture();
  fs.writeFileSync(path.join(project, "src", "app.css"), [
    ".panel { transition: all 180ms; background: linear-gradient(#111, #222); }",
    ".button { outline: none; color: #123456; }",
  ].join("\n"));
  fs.writeFileSync(path.join(project, "src", "app.tsx"), `<div onClick={save}><img src="/cover.png" />${String.fromCodePoint(0x1f680)}</div>\n`);

  const bundled = scanProject(project);
  const run = spawnSync(process.execPath, [path.join(kinRoot, "scripts", "audit-project.mjs"), project, "--json"], { encoding: "utf8" });
  assert.ok([0, 1].includes(run.status), run.stderr);
  const repository = JSON.parse(run.stdout);
  const identity = (finding) => `${finding.rule}|${finding.file}|${finding.line}`;
  assert.deepEqual(bundled.findings.map(identity).sort(), repository.findings.map(identity).sort());
  assert.match(bundled.notice, /review candidates/);
});

test("bundled scan honors nested exclusions and reviewed exceptions", () => {
  const project = fixture();
  fs.mkdirSync(path.join(project, "packages", "sample", "dist"), { recursive: true });
  fs.writeFileSync(path.join(project, "packages", "sample", "dist", "generated.css"), ".bad { outline: 0; }\n");
  fs.writeFileSync(path.join(project, "src", "app.css"), ".panel { transition: all 180ms; color: var(--text); }\n");
  fs.writeFileSync(path.join(project, "kin.config.json"), `${JSON.stringify({
    audit: {
      include: ["src"],
      exclude: [],
      exceptions: [{ rule: "kin/transition-all", path: "src/**", reason: "Third-party transition is retained here." }],
    },
  }, null, 2)}\n`);

  const report = scanProject(project);
  assert.equal(report.findingCount, 0);
  assert.equal(report.scannedFiles, 1);
  assert.ok(report.positiveSignals.includes("Uses CSS custom properties in scanned source."));
});

test("collector identifies the authoritative checkout without executing target code", () => {
  const project = fixture();
  fs.writeFileSync(path.join(project, "package.json"), `${JSON.stringify({
    name: "sample-ui",
    private: true,
    scripts: { build: "exit 99", dev: "exit 98" },
    dependencies: { react: "19.0.0" },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(project, "package-lock.json"), "{}\n");
  fs.writeFileSync(path.join(project, "src", "app.css"), ".panel { transition: all 180ms; }\n");

  const packet = collectEvidence(project, { kinRoot });
  assert.equal(packet.kin.status, "authoritative-checkout");
  assert.equal(packet.audit.engine, "kin-repository");
  assert.equal(packet.project.packageName, "sample-ui");
  assert.equal(packet.project.packageManager, "npm");
  assert.deepEqual(packet.project.frameworks, ["react"]);
  assert.deepEqual(packet.project.scriptNames, ["build", "dev"]);
  assert.ok(packet.boundaries.some((boundary) => boundary.includes("did not execute target-project code")));
  assert.match(formatMarkdown(packet), /\| P2 \| `src\/app\.css:1:/);
});

test("collector CLI rejects a missing target without a stack trace", () => {
  const missing = path.join(os.tmpdir(), `kin-design-engineer-missing-${Date.now()}`);
  const run = spawnSync(process.execPath, [collectorPath, missing], { encoding: "utf8" });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /Target must be an existing directory/);
  assert.doesNotMatch(run.stderr, /at file:\/\//);
});

test("plugin manifest and skill metadata contain no scaffold placeholders", () => {
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const skillPath = path.join(pluginRoot, "skills", "kin-design-engineer", "SKILL.md");
  const skill = fs.readFileSync(skillPath, "utf8");
  assert.equal(manifest.name, "kin-design-engineer");
  assert.equal(manifest.version, "0.1.0");
  assert.equal(manifest.skills, "./skills/");
  assert.ok(fs.existsSync(path.join(pluginRoot, manifest.interface.logo)));
  assert.doesNotMatch(JSON.stringify(manifest), /TODO|Local developer|plugin scaffold/i);
  assert.doesNotMatch(skill, /\[TODO:/);
});

test("repository marketplace exposes the plugin with install metadata", () => {
  const marketplacePath = path.join(kinRoot, ".agents", "plugins", "marketplace.json");
  assert.ok(fs.existsSync(marketplacePath), "Repository marketplace is missing.");
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));
  assert.equal(marketplace.name, "kin-local");
  const entry = marketplace.plugins.find((plugin) => plugin.name === "kin-design-engineer");
  assert.ok(entry, "KIN Design Engineer marketplace entry is missing.");
  assert.equal(entry.source.source, "local");
  assert.equal(entry.source.path, "./plugins/kin-design-engineer");
  assert.equal(entry.policy.installation, "AVAILABLE");
  assert.equal(entry.policy.authentication, "ON_INSTALL");
  assert.equal(entry.category, "Productivity");
});
