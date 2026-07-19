import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scanProject } from "./candidate-scan.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const KIN_REQUIRED = [
  "AGENTS.md",
  "DESIGN.md",
  "DELIVERY.md",
  "VISION.md",
  "principles/visual-signature.md",
  "principles/verification.md",
  "skills/kin-design/SKILL.md",
  "scripts/audit-project.mjs",
];

function parseArgs(args) {
  const result = { target: ".", format: "json", kinRoot: null };
  let targetSet = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--kin-root") {
      if (!args[index + 1]) throw new Error("--kin-root requires a directory path.");
      result.kinRoot = args[index + 1];
      index += 1;
    } else if (arg === "--format") {
      if (!args[index + 1] || !["json", "markdown"].includes(args[index + 1])) throw new Error("--format must be json or markdown.");
      result.format = args[index + 1];
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    } else if (!targetSet) {
      result.target = arg;
      targetSet = true;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  return result;
}

function isKinRoot(directory) {
  return KIN_REQUIRED.every((relative) => fs.existsSync(path.join(directory, relative)));
}

function ancestors(start) {
  const result = [];
  let current = path.resolve(start);
  while (true) {
    result.push(current);
    const parent = path.dirname(current);
    if (parent === current) return result;
    current = parent;
  }
}

function discoverKinRoot(target, explicitRoot) {
  if (explicitRoot) {
    const root = path.resolve(explicitRoot);
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error(`KIN root must be an existing directory: ${root}`);
    if (!isKinRoot(root)) throw new Error(`KIN root is missing required contracts or tooling: ${root}`);
    return root;
  }
  const candidates = [...ancestors(target), ...ancestors(scriptDirectory)];
  return candidates.find((candidate, index) => candidates.indexOf(candidate) === index && isKinRoot(candidate)) ?? null;
}

function canonicalChecksum(file) {
  const source = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  return crypto.createHash("sha256").update(source, "utf8").digest("hex");
}

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Cannot parse ${label} at ${file}: ${error.message}`);
  }
}

function readProjectContract(target) {
  const configPath = path.join(target, "kin.config.json");
  if (!fs.existsSync(configPath)) return null;
  const config = readJson(configPath, "KIN configuration");
  const local = config.contract?.local;
  if (typeof local !== "string" || local.length === 0) {
    return { status: "invalid", configPath, message: "kin.config.json does not declare contract.local." };
  }
  const contractPath = path.resolve(target, local);
  if (!fs.existsSync(contractPath) || !fs.statSync(contractPath).isFile()) {
    return { status: "invalid", configPath, contractPath, message: "The configured local KIN contract does not exist." };
  }
  const checksum = canonicalChecksum(contractPath);
  const expectedChecksum = config.contract?.checksum ?? null;
  return {
    status: "project-contract",
    configPath,
    contractPath,
    source: config.contract?.source ?? null,
    revision: config.contract?.revision ?? null,
    checksum,
    expectedChecksum,
    checksumMatches: expectedChecksum ? checksum === expectedChecksum : null,
    fullContext: false,
  };
}

function contractVersion(designPath) {
  const source = fs.readFileSync(designPath, "utf8");
  return source.match(/^kin_version:\s*["']?([^\s"']+)/m)?.[1] ?? null;
}

function runRepositoryAudit(kinRoot, target) {
  const script = path.join(kinRoot, "scripts", "audit-project.mjs");
  const run = spawnSync(process.execPath, [script, target, "--json"], {
    cwd: kinRoot,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (![0, 1].includes(run.status)) {
    const detail = (run.stderr || run.stdout || `exit ${run.status}`).trim();
    throw new Error(`KIN repository audit failed: ${detail}`);
  }
  let result;
  try {
    result = JSON.parse(run.stdout);
  } catch (error) {
    throw new Error(`KIN repository audit returned invalid JSON: ${error.message}`);
  }
  return { ...result, engine: "kin-repository" };
}

function detectPackageManager(target) {
  const candidates = [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
    ["package-lock.json", "npm"],
  ];
  return candidates.find(([file]) => fs.existsSync(path.join(target, file)))?.[1] ?? null;
}

function projectSignals(target) {
  const packagePath = path.join(target, "package.json");
  const packageManifest = fs.existsSync(packagePath) ? readJson(packagePath, "package manifest") : null;
  const dependencyNames = packageManifest
    ? [...new Set([...Object.keys(packageManifest.dependencies ?? {}), ...Object.keys(packageManifest.devDependencies ?? {})])].sort()
    : [];
  const knownFrameworks = ["@angular/core", "@sveltejs/kit", "astro", "next", "nuxt", "react", "solid-js", "svelte", "vue"];
  const instructions = ["AGENTS.md", "DESIGN.md", "PRODUCT.md", "README.md"]
    .filter((file) => fs.existsSync(path.join(target, file)));
  const sourceRoots = ["src", "app", "pages", "components", "styles"]
    .filter((directory) => fs.existsSync(path.join(target, directory)) && fs.statSync(path.join(target, directory)).isDirectory());
  return {
    packagePath: packageManifest ? packagePath : null,
    packageName: packageManifest?.name ?? null,
    packagePrivate: typeof packageManifest?.private === "boolean" ? packageManifest.private : null,
    packageManager: detectPackageManager(target),
    frameworks: knownFrameworks.filter((name) => dependencyNames.includes(name)),
    scriptNames: Object.keys(packageManifest?.scripts ?? {}).sort(),
    instructionFiles: instructions,
    sourceRoots,
  };
}

export function collectEvidence(targetDirectory, options = {}) {
  const target = path.resolve(targetDirectory);
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) throw new Error(`Target must be an existing directory: ${target}`);
  const kinRoot = discoverKinRoot(target, options.kinRoot ?? null);
  const projectContract = readProjectContract(target);
  const kin = kinRoot
    ? {
        status: "authoritative-checkout",
        root: kinRoot,
        version: contractVersion(path.join(kinRoot, "DESIGN.md")),
        designPath: path.join(kinRoot, "DESIGN.md"),
        designChecksum: canonicalChecksum(path.join(kinRoot, "DESIGN.md")),
        fullContext: true,
        projectContract,
      }
    : projectContract ?? { status: "unavailable", fullContext: false };
  const audit = kinRoot ? runRepositoryAudit(kinRoot, target) : scanProject(target);

  return {
    kind: "kin-design-engineer-evidence",
    schemaVersion: "1.0.0",
    target: { path: target, name: path.basename(target) },
    kin,
    project: projectSignals(target),
    audit,
    boundaries: [
      "Static findings are review candidates, not design facts or edit instructions.",
      "The collector did not execute target-project code, install dependencies, call a model, access the network, or edit files.",
      "Rendered behavior, accessibility, browser, touch, localization, performance, production, and adoption remain unverified.",
      ...(kinRoot ? [] : ["A complete authoritative KIN checkout was not found; do not claim KIN compliance from this packet."]),
    ],
  };
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function formatMarkdown(packet) {
  const lines = [
    "# KIN Design Engineer evidence",
    "",
    `- Target: \`${packet.target.path}\``,
    `- KIN source: \`${packet.kin.status}\`${packet.kin.version ? ` (${packet.kin.version})` : ""}`,
    `- Scanner: \`${packet.audit.engine}\``,
    `- Files scanned: ${packet.audit.scannedFiles}`,
    `- Candidate findings: ${packet.audit.findingCount}`,
    "",
    "## Project signals",
    "",
    `- Package: ${packet.project.packageName ? `\`${packet.project.packageName}\`` : "not detected"}`,
    `- Package manager: ${packet.project.packageManager ?? "not detected"}`,
    `- Frameworks: ${packet.project.frameworks.length ? packet.project.frameworks.join(", ") : "not detected"}`,
    `- Instructions: ${packet.project.instructionFiles.length ? packet.project.instructionFiles.join(", ") : "not detected"}`,
    "",
    "## Static candidates",
    "",
  ];
  if (packet.audit.findings.length === 0) lines.push("No static candidates were reported.");
  else {
    lines.push("| Priority | Location | Rule | Candidate reason |", "|---|---|---|---|");
    for (const finding of packet.audit.findings) {
      lines.push(`| ${finding.severity} | \`${escapeCell(`${finding.file}:${finding.line}:${finding.column}`)}\` | \`${escapeCell(finding.rule)}\` | ${escapeCell(finding.message)} |`);
    }
  }
  lines.push("", "## Positive signals", "");
  if (packet.audit.positiveSignals.length === 0) lines.push("- None detected by the static pass.");
  else for (const signal of packet.audit.positiveSignals) lines.push(`- ${signal}`);
  lines.push("", "## Boundaries", "");
  for (const boundary of packet.boundaries) lines.push(`- ${boundary}`);
  return `${lines.join("\n")}\n`;
}

function isDirectRun() {
  return process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
}

if (isDirectRun()) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      console.log("Usage: node collect-evidence.mjs <project-directory> [--kin-root <kin-checkout>] [--format json|markdown]");
      console.log("Collects deterministic, read-only frontend review evidence. It never executes or edits the target project.");
      process.exit(0);
    }
    const packet = collectEvidence(args.target, { kinRoot: args.kinRoot });
    process.stdout.write(args.format === "markdown" ? formatMarkdown(packet) : `${JSON.stringify(packet, null, 2)}\n`);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}
