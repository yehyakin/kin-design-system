import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { buildAgentDistribution } from "./lib/agent-distribution.mjs";
import {
  AGENT_REGISTRY_PATH,
  agentVersionEntry,
  assertAgentVersion,
  createAgentArchive,
  createEmptyAgentRegistry,
  readAgentVersionRegistry,
  validateAgentVersionRegistry,
  writeAgentVersionRegistry,
} from "./lib/agent-release.mjs";
import { compareArtifactTree, replaceDirectorySafely, writeArtifactTree } from "./lib/generated-tree.mjs";
import { validateAgentDistribution } from "./validate-agent-distribution.mjs";

function parseArguments(args) {
  if (args.length === 0) return { mode: "next", check: false, version: null };
  if (args.length === 1 && args[0] === "--check") return { mode: "next", check: true, version: null };
  if (args.length === 3 && args[0] === "--release" && args[1] === "--version") {
    return { mode: "release", check: false, version: assertAgentVersion(args[2]) };
  }
  throw new Error("Usage: node scripts/export-agent-distribution.mjs [--check] | --release --version X.Y.Z");
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
const parent = path.join(root, "generated", "agent");
fs.mkdirSync(parent, { recursive: true });

if (options.mode === "next") {
  const { artifacts } = buildAgentDistribution(root);
  const target = path.join(parent, "next");
  const temporary = fs.mkdtempSync(path.join(parent, `next.tmp-${process.pid}-${os.hostname().replaceAll(/[^A-Za-z0-9_-]/g, "-")}-`));

  try {
    writeArtifactTree(temporary, artifacts);
    const findings = validateAgentDistribution({ root, bundleDirectory: temporary });
    if (findings.length > 0) throw new Error(`temporary Agent tree failed validation:\n- ${findings.join("\n- ")}`);
    if (options.check) {
      const drift = compareArtifactTree(target, artifacts, { governedRoot: root });
      if (drift.length > 0) {
        console.error(`Generated Agent distribution drift detected (${drift.length}):`);
        for (const finding of drift) console.error(`- ${finding}`);
        process.exitCode = 1;
      } else console.log("Generated Agent distribution matches declared inputs.");
    } else {
      replaceDirectorySafely(target, temporary);
      console.log("Generated Agent distribution written to generated/agent/next.");
    }
    const registry = readAgentVersionRegistry(root, { allowMissing: true });
    if (!registry.versions.some((entry) => entry.publication_state === "released")) {
      const currentContract = createEmptyAgentRegistry();
      const refreshed = registry.versions.length === 0
        ? currentContract
        : {
          ...registry,
          $schema: currentContract.$schema,
          schema_version: currentContract.schema_version,
        };
      if (JSON.stringify(registry) !== JSON.stringify(refreshed)) {
        if (options.check) {
          console.error(`${AGENT_REGISTRY_PATH}: pre-release Registry differs from the current Schema contract.`);
          process.exitCode = 1;
        } else {
          const findings = validateAgentVersionRegistry({ root, registry: refreshed });
          if (findings.length > 0) {
            throw new Error(`pre-release Agent Registry cannot adopt the current Schema:\n- ${findings.join("\n- ")}`);
          }
          writeAgentVersionRegistry(root, refreshed);
          console.log(`Generated pre-release Agent Registry written to ${AGENT_REGISTRY_PATH}.`);
        }
      }
    }
  } finally {
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { recursive: true, force: true });
  }
} else {
  const version = options.version;
  const next = buildAgentDistribution(root);
  const nextDrift = compareArtifactTree(path.join(parent, "next"), next.artifacts, { governedRoot: root });
  if (nextDrift.length > 0) throw new Error(`Release export requires current generated/agent/next:\n- ${nextDrift.join("\n- ")}`);

  const registry = readAgentVersionRegistry(root);
  const registryFindings = validateAgentVersionRegistry({ root, registry });
  if (registryFindings.length > 0) throw new Error(`Release export requires a valid current Registry:\n- ${registryFindings.join("\n- ")}`);
  if (registry.versions.some((entry) => entry.version === version)) throw new Error(`Registry entry already exists for Agent v${version}`);

  const release = buildAgentDistribution(root, { channel: "versioned", version });
  const validationTemporary = fs.mkdtempSync(path.join(parent, `.release-validation-v${version}-${process.pid}-`));
  try {
    writeArtifactTree(validationTemporary, release.artifacts);
    const findings = validateAgentDistribution({
      root,
      bundleDirectory: validationTemporary,
      channel: "versioned",
      version,
    });
    if (findings.length > 0) throw new Error(`temporary Agent release tree failed validation:\n- ${findings.join("\n- ")}`);
  } finally {
    fs.rmSync(validationTemporary, { recursive: true, force: true });
  }

  const previousRegistry = fs.readFileSync(path.join(root, ...AGENT_REGISTRY_PATH.split("/")), "utf8");
  const archive = createAgentArchive({ root, version, artifacts: release.artifacts });
  try {
    registry.versions.push(agentVersionEntry({ version, manifest: release.manifest }));
    registry.versions.sort((left, right) => left.version.localeCompare(right.version, "en", { numeric: true }));
    writeAgentVersionRegistry(root, registry);
    const findings = validateAgentVersionRegistry({ root, registry });
    if (findings.length > 0) throw new Error(`staged Agent Registry failed validation:\n- ${findings.join("\n- ")}`);
    console.log(`Immutable Agent archive staged at generated/agent/versions/v${version}.`);
    console.log(`Registry entry staged in ${AGENT_REGISTRY_PATH}; latest_agent_distribution was not advanced.`);
  } catch (error) {
    let recovery = "restored previous Registry and removed new archive";
    try {
      writeAgentVersionRegistry(root, JSON.parse(previousRegistry));
      fs.rmSync(archive, { recursive: true, force: true });
    } catch (recoveryError) {
      recovery = `manual review required: ${recoveryError.message}`;
    }
    throw new Error(`Failed to stage Agent v${version}: ${error.message}; recovery: ${recovery}`);
  }
}
