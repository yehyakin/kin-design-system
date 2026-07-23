import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { AGENT_SCHEMA_VERSION, AGENT_SITE_BASE } from "./agent-distribution.mjs";
import { compareCodePoints, prettyJson, sha256ExactBytes } from "./canonical-content.mjs";
import { parseDesignContract } from "./design-contract.mjs";
import { listArtifactFiles, writeArtifactTree } from "./generated-tree.mjs";
import { exactTagState, readRevisionFile, runGit } from "./git-state.mjs";
import { normalizeRepositoryPath, resolveExistingPathWithin, writeFileSafelyWithin } from "./safe-path.mjs";
import { scanGeneratedArtifact } from "./safe-generated-content.mjs";
import { validateSchemaValue } from "./schema-validator.mjs";

export const AGENT_REGISTRY_PATH = "generated/agent/versions.json";
export const AGENT_VERSIONS_SCHEMA_URL = `${AGENT_SITE_BASE}/next/schemas/versions.schema.json`;
const semverPattern = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

export function assertAgentVersion(version) {
  if (typeof version !== "string" || !semverPattern.test(version)) throw new Error(`Agent version must be SemVer without a v prefix: ${version}`);
  return version;
}

function advisoryUrlFinding(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return "Agent advisory URL must be an absolute HTTPS URL";
  }
  if (parsed.protocol !== "https:") return "Agent advisory URL must be an absolute HTTPS URL";
  if (parsed.username || parsed.password) return "Agent advisory URL must not contain credentials";
  if (parsed.search !== "") return "Agent advisory URL must not contain query parameters";
  return null;
}

function assertAdvisoryUrl(value) {
  if (value === null) return;
  const finding = advisoryUrlFinding(value);
  if (finding) throw new Error(finding);
}

function inside(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function ensureRealDirectoryWithin(root, repositoryPath) {
  const normalized = normalizeRepositoryPath(repositoryPath);
  const realRoot = fs.realpathSync(root);
  let current = realRoot;
  for (const segment of normalized.split("/")) {
    const candidate = path.join(current, segment);
    if (!fs.existsSync(candidate)) fs.mkdirSync(candidate);
    const stat = fs.lstatSync(candidate);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`${repositoryPath} must contain only real directories`);
    current = fs.realpathSync(candidate);
    if (!inside(realRoot, current)) throw new Error(`${repositoryPath} resolves outside the repository`);
  }
  return current;
}

function parseGitHubRepository(value) {
  if (typeof value !== "string" || value.length === 0) return null;
  const scp = value.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/iu);
  if (scp) return `${scp[1]}/${scp[2]}`;
  try {
    const parsed = new URL(value.replace(/^git\+/u, ""));
    if (parsed.hostname.toLowerCase() !== "github.com") return null;
    const segments = parsed.pathname.replace(/^\/|\/$/gu, "").split("/");
    if (segments.length !== 2) return null;
    return `${segments[0]}/${segments[1].replace(/\.git$/iu, "")}`;
  } catch {
    return null;
  }
}

export function declaredGitHubRepository(root) {
  const packageJson = JSON.parse(fs.readFileSync(resolveExistingPathWithin(root, "package.json"), "utf8"));
  const declared = parseGitHubRepository(
    typeof packageJson.repository === "string" ? packageJson.repository : packageJson.repository?.url,
  );
  const origin = parseGitHubRepository(runGit(root, ["remote", "get-url", "origin"]));
  if (!declared || !origin || declared.toLowerCase() !== origin.toLowerCase()) {
    throw new Error("origin must match the GitHub repository declared in package.json");
  }
  return declared;
}

export function remoteExactTagState(root, tagName, remote = "origin") {
  const reference = `refs/tags/${tagName}`;
  let output;
  try {
    output = execFileSync("git", ["ls-remote", "--tags", remote, reference, `${reference}^{}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return { object: null, commit: null };
  }
  let object = null;
  let commit = null;
  for (const line of output.split(/\r?\n/u).filter(Boolean)) {
    const [sha, ref] = line.trim().split(/\s+/u);
    if (ref === reference) object = sha;
    else if (ref === `${reference}^{}`) commit = sha;
  }
  return { object, commit };
}

export function remoteBranchCommit(root, branch = "main", remote = "origin") {
  try {
    const output = execFileSync("git", ["ls-remote", "--heads", remote, `refs/heads/${branch}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    return output.split(/\s+/u)[0] || null;
  } catch {
    return null;
  }
}

export function assertAgentRegistryMutationFresh({
  root,
  headCommit,
  registryBytes,
}) {
  if (runGit(root, ["rev-parse", "HEAD"]) !== headCommit) {
    throw new Error("Agent Registry mutation stopped because local HEAD changed during validation");
  }
  if (remoteBranchCommit(root) !== headCommit) {
    throw new Error("Agent Registry mutation stopped because remote main changed during validation");
  }
  if (runGit(root, ["status", "--porcelain"]) !== "") {
    throw new Error("Agent Registry mutation stopped because the working tree changed during validation");
  }
  const current = fs.readFileSync(resolveExistingPathWithin(root, AGENT_REGISTRY_PATH));
  if (!current.equals(registryBytes)) {
    throw new Error("Agent Registry mutation stopped because versions.json changed during validation");
  }
}

export function createEmptyAgentRegistry() {
  return {
    $schema: AGENT_VERSIONS_SCHEMA_URL,
    schema_version: AGENT_SCHEMA_VERSION,
    kind: "kin-agent-distribution-versions",
    artifact_status: "generated-derivative",
    generated: true,
    normative: false,
    editable: false,
    latest_agent_distribution: null,
    versions: [],
  };
}

export function readAgentVersionRegistryBytes(root) {
  return fs.readFileSync(resolveExistingPathWithin(root, AGENT_REGISTRY_PATH));
}

export function readAgentVersionRegistry(root, { allowMissing = false } = {}) {
  const target = path.join(root, ...AGENT_REGISTRY_PATH.split("/"));
  if (!fs.existsSync(target)) {
    if (allowMissing) return createEmptyAgentRegistry();
    throw new Error(`${AGENT_REGISTRY_PATH} is missing`);
  }
  const bytes = readAgentVersionRegistryBytes(root);
  const unsafe = scanGeneratedArtifact(AGENT_REGISTRY_PATH, bytes);
  if (unsafe.length > 0) throw new Error(unsafe.join("; "));
  let value;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw new Error(`${AGENT_REGISTRY_PATH} is invalid JSON: ${error.message}`);
  }
  if (!bytes.equals(Buffer.from(prettyJson(value), "utf8"))) {
    throw new Error(`${AGENT_REGISTRY_PATH}: Registry must use canonical generated JSON bytes`);
  }
  return value;
}

export function writeAgentVersionRegistry(root, registry) {
  return writeFileSafelyWithin(root, AGENT_REGISTRY_PATH, prettyJson(registry));
}

export function agentVersionEntry({ version, manifest }) {
  assertAgentVersion(version);
  return {
    version,
    publication_state: "staged",
    support_status: null,
    repository_directory: `generated/agent/versions/v${version}`,
    manifest_url: null,
    manifest_sha256: sha256ExactBytes(Buffer.from(prettyJson(manifest), "utf8")),
    kin_tag: `v${version}`,
    design_checksum: manifest.source.checksum,
    input_set_checksum: manifest.source.input_set_checksum,
    replacement: null,
    advisory_url: null,
  };
}

export function compareAgentVersions(left, right) {
  const a = left.split(".").map(BigInt);
  const b = right.split(".").map(BigInt);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] < b[index]) return -1;
    if (a[index] > b[index]) return 1;
  }
  return 0;
}

export function promotionEligibilityFindings(registry, version) {
  assertAgentVersion(version);
  const findings = [];
  const entry = registry.versions.find((candidate) => candidate.version === version);
  if (!entry) return [`Agent v${version} is not present in the Registry`];
  if (entry.publication_state !== "staged") findings.push(`Agent v${version} must be staged before promotion`);
  const maximumReleased = registry.versions
    .filter((candidate) => candidate.publication_state === "released")
    .map((candidate) => candidate.version)
    .sort(compareAgentVersions)
    .at(-1) ?? null;
  if (maximumReleased !== null && compareAgentVersions(version, maximumReleased) <= 0) {
    findings.push(`Agent promotion must advance beyond released v${maximumReleased}; use rollback or support tooling for older versions`);
  }
  return findings;
}

function registrySchemaFinding(registry) {
  const released = registry.versions.filter((entry) => entry.publication_state === "released");
  if (released.length === 0) {
    return registry.$schema === AGENT_VERSIONS_SCHEMA_URL
      ? null
      : `versions.json: $schema must equal ${AGENT_VERSIONS_SCHEMA_URL} before the first released Agent bundle`;
  }
  const match = registry.$schema.match(
    /^https:\/\/yehyakin\.github\.io\/kin-design-system\/versions\/v((?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*))\/schemas\/versions\.schema\.json$/u,
  );
  if (!match || !released.some((entry) => entry.version === match[1])) {
    return "versions.json: $schema must remain pinned to a released immutable Version Schema";
  }
  return null;
}

function registrySchemaRepositoryPath(registry) {
  const pinnedMatch = typeof registry.$schema === "string"
    ? registry.$schema.match(
      /^https:\/\/yehyakin\.github\.io\/kin-design-system\/versions\/v((?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*))\/schemas\/versions\.schema\.json$/u,
    )
    : null;
  return pinnedMatch
    ? `generated/agent/versions/v${pinnedMatch[1]}/schemas/versions.schema.json`
    : "distribution/schemas/versions.schema.json";
}

function historicalRegistryStateFindings(root, commit, registry) {
  const findings = [];
  findings.push(...scanGeneratedArtifact(AGENT_REGISTRY_PATH, prettyJson(registry)));
  const schemaPath = registrySchemaRepositoryPath(registry);
  const schemaSource = readRevisionFile(root, commit, schemaPath);
  if (schemaSource === null) {
    findings.push(`${schemaPath} is missing`);
    return findings;
  }
  try {
    const schema = JSON.parse(schemaSource);
    for (const finding of validateSchemaValue(registry, schema)) {
      findings.push(`versions.json against ${schemaPath} ${finding}`);
    }
  } catch (error) {
    findings.push(`${schemaPath} is invalid JSON: ${error.message}`);
    return findings;
  }
  if (findings.length > 0) return findings;

  const schemaFinding = registrySchemaFinding(registry);
  if (schemaFinding) findings.push(schemaFinding);
  const versions = (registry.versions ?? []).map((entry) => entry.version);
  if (new Set(versions).size !== versions.length) findings.push("versions.json: version entries must be unique");
  if (JSON.stringify(versions) !== JSON.stringify([...versions].sort(compareAgentVersions))) {
    findings.push("versions.json: versions must be sorted in ascending SemVer order");
  }
  const byVersion = new Map((registry.versions ?? []).map((entry) => [entry.version, entry]));
  for (const entry of registry.versions ?? []) {
    if (entry.kin_tag !== `v${entry.version}`) findings.push(`${entry.version}: kin_tag must match the version`);
    if (entry.publication_state === "staged") {
      if (
        entry.support_status !== null
        || entry.manifest_url !== null
        || entry.replacement !== null
        || entry.advisory_url !== null
      ) {
        findings.push(`${entry.version}: staged entries cannot claim release lifecycle metadata`);
      }
      continue;
    }
    const expectedUrl = `${AGENT_SITE_BASE}/versions/v${entry.version}/design-manifest.json`;
    if (entry.manifest_url !== expectedUrl) findings.push(`${entry.version}: released manifest_url must equal ${expectedUrl}`);
    if (entry.replacement !== null) {
      const replacement = byVersion.get(entry.replacement);
      if (!replacement || replacement.publication_state !== "released" || replacement.support_status !== "supported") {
        findings.push(`${entry.version}: replacement must identify a supported released entry`);
      }
    }
    if (entry.support_status === "superseded" && entry.replacement === null) {
      findings.push(`${entry.version}: superseded entries require a supported released replacement`);
    }
    if (entry.support_status === "supported" && entry.replacement !== null) {
      findings.push(`${entry.version}: supported entries cannot identify a replacement`);
    }
    if (entry.advisory_url !== null) {
      const advisoryFinding = advisoryUrlFinding(entry.advisory_url);
      if (advisoryFinding) findings.push(`${entry.version}: ${advisoryFinding}`);
    }
  }
  if (registry.latest_agent_distribution !== null) {
    const latest = byVersion.get(registry.latest_agent_distribution);
    if (!latest || latest.publication_state !== "released" || latest.support_status !== "supported") {
      findings.push("versions.json: latest_agent_distribution must identify a supported released entry");
    }
  }
  return findings;
}

function readBundleManifest(root, entry, findings) {
  const expectedDirectory = `generated/agent/versions/v${entry.version}`;
  if (entry.repository_directory !== expectedDirectory) {
    findings.push(`${entry.version}: repository_directory must equal ${expectedDirectory}`);
    return null;
  }
  let manifestPath;
  try {
    manifestPath = resolveExistingPathWithin(root, `${entry.repository_directory}/design-manifest.json`);
  } catch (error) {
    findings.push(`${entry.version}: ${error.message}`);
    return null;
  }
  const bytes = fs.readFileSync(manifestPath);
  if (sha256ExactBytes(bytes) !== entry.manifest_sha256) findings.push(`${entry.version}: manifest_sha256 differs from archived design-manifest.json`);
  let manifest;
  try {
    manifest = JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    findings.push(`${entry.version}: archived design-manifest.json is invalid JSON: ${error.message}`);
    return null;
  }
  if (manifest.channel !== "versioned") findings.push(`${entry.version}: archived Manifest channel must be versioned`);
  if (manifest.kin_version !== entry.version) findings.push(`${entry.version}: archived Manifest kin_version differs from the Registry`);
  if (manifest.release_status !== "released") findings.push(`${entry.version}: archived Manifest must record release_status released`);
  if (manifest.source?.ref !== `v${entry.version}` || manifest.source?.revision_status !== "immutable") {
    findings.push(`${entry.version}: archived Manifest source must pin immutable v${entry.version}`);
  }
  if (manifest.source?.checksum !== entry.design_checksum) findings.push(`${entry.version}: design_checksum differs from the archived Manifest`);
  if (manifest.source?.input_set_checksum !== entry.input_set_checksum) findings.push(`${entry.version}: input_set_checksum differs from the archived Manifest`);
  const expectedPublicBase = `${AGENT_SITE_BASE}/versions/v${entry.version}/`;
  if (manifest.links?.public_base_url !== expectedPublicBase) findings.push(`${entry.version}: archived Manifest public base is not immutable`);
  if (manifest.publication?.state !== "registry-controlled" || Object.hasOwn(manifest.publication ?? {}, "published")) {
    findings.push(`${entry.version}: archived Manifest publication must defer to the Registry without a mutable published claim`);
  }

  const expectedFiles = ["design-manifest.json", ...(manifest.artifacts ?? []).map((artifact) => artifact.bundle_path)].sort(compareCodePoints);
  const directory = path.join(root, ...entry.repository_directory.split("/"));
  let actualFiles = [];
  try {
    actualFiles = listArtifactFiles(directory, { governedRoot: root }).sort(compareCodePoints);
  } catch (error) {
    findings.push(`${entry.version}: ${error.message}`);
    return manifest;
  }
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) findings.push(`${entry.version}: archived file list differs from its Manifest allowlist`);
  for (const artifact of manifest.artifacts ?? []) {
    try {
      const artifactPath = resolveExistingPathWithin(root, `${entry.repository_directory}/${artifact.bundle_path}`);
      if (sha256ExactBytes(fs.readFileSync(artifactPath)) !== artifact.sha256) findings.push(`${entry.version}:${artifact.bundle_path}: checksum differs from the archived Manifest`);
    } catch (error) {
      findings.push(`${entry.version}:${artifact.bundle_path}: ${error.message}`);
    }
  }
  return manifest;
}

export function validateAgentVersionRegistry({ root, registry = null } = {}) {
  const findings = [];
  let value = registry;
  try {
    value ??= readAgentVersionRegistry(root);
  } catch (error) {
    return [error.message];
  }
  findings.push(...scanGeneratedArtifact(AGENT_REGISTRY_PATH, prettyJson(value)));
  if (findings.length > 0) return findings;
  const schemaPath = registrySchemaRepositoryPath(value);
  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(resolveExistingPathWithin(root, schemaPath), "utf8"));
  } catch (error) {
    return [`${schemaPath}: ${error.message}`];
  }
  for (const finding of validateSchemaValue(value, schema)) findings.push(`versions.json against ${schemaPath} ${finding}`);
  if (findings.length > 0) return findings;

  const schemaFinding = registrySchemaFinding(value);
  if (schemaFinding) findings.push(schemaFinding);
  const versions = value.versions.map((entry) => entry.version);
  if (new Set(versions).size !== versions.length) findings.push("versions.json: version entries must be unique");
  const sorted = [...versions].sort(compareAgentVersions);
  if (JSON.stringify(versions) !== JSON.stringify(sorted)) findings.push("versions.json: versions must be sorted in ascending SemVer order");

  const byVersion = new Map(value.versions.map((entry) => [entry.version, entry]));
  const versionsDirectory = path.join(root, "generated", "agent", "versions");
  const expectedDirectories = new Set(value.versions.map((entry) => `v${entry.version}`));
  if (fs.existsSync(versionsDirectory)) {
    const versionsStat = fs.lstatSync(versionsDirectory);
    if (versionsStat.isSymbolicLink() || !versionsStat.isDirectory()) findings.push("generated/agent/versions must be a real directory");
    else {
      for (const directoryEntry of fs.readdirSync(versionsDirectory, { withFileTypes: true })) {
        if (directoryEntry.isSymbolicLink() || !directoryEntry.isDirectory()) findings.push(`generated/agent/versions/${directoryEntry.name}: only real version directories are allowed`);
        else if (!expectedDirectories.has(directoryEntry.name)) findings.push(`generated/agent/versions/${directoryEntry.name}: archive is not registered`);
      }
    }
  } else if (value.versions.length > 0) findings.push("generated/agent/versions is missing while the Registry contains entries");
  for (const entry of value.versions) {
    readBundleManifest(root, entry, findings);
    if (entry.kin_tag !== `v${entry.version}`) findings.push(`${entry.version}: kin_tag must match the version`);
    if (entry.publication_state === "staged") {
      if (entry.support_status !== null || entry.manifest_url !== null) findings.push(`${entry.version}: staged entries cannot claim support or a public Manifest`);
    } else {
      const expectedUrl = `${AGENT_SITE_BASE}/versions/v${entry.version}/design-manifest.json`;
      if (entry.manifest_url !== expectedUrl) findings.push(`${entry.version}: released manifest_url must equal ${expectedUrl}`);
    }
    if (entry.replacement !== null) {
      const replacement = byVersion.get(entry.replacement);
      if (!replacement || replacement.publication_state !== "released" || replacement.support_status !== "supported") {
        findings.push(`${entry.version}: replacement must identify a supported released entry`);
      }
    }
    if (entry.publication_state === "released" && entry.support_status === "superseded" && entry.replacement === null) {
      findings.push(`${entry.version}: superseded entries require a supported released replacement`);
    }
    if (entry.publication_state === "released" && entry.support_status === "supported" && entry.replacement !== null) {
      findings.push(`${entry.version}: supported entries cannot identify a replacement`);
    }
    if (entry.advisory_url !== null) {
      const advisoryFinding = advisoryUrlFinding(entry.advisory_url);
      if (advisoryFinding) findings.push(`${entry.version}: ${advisoryFinding}`);
    }
  }

  if (value.latest_agent_distribution !== null) {
    const latest = byVersion.get(value.latest_agent_distribution);
    if (!latest || latest.publication_state !== "released" || latest.support_status !== "supported") {
      findings.push("versions.json: latest_agent_distribution must identify a supported released entry");
    }
  }
  return findings;
}

export function createAgentArchive({ root, version, artifacts }) {
  assertAgentVersion(version);
  if (!(artifacts instanceof Map) || artifacts.size === 0) throw new Error("Agent archive artifacts must be a non-empty Map");
  for (const artifactPath of artifacts.keys()) {
    if (artifactPath === "." || normalizeRepositoryPath(artifactPath) !== artifactPath) {
      throw new Error(`Invalid Agent archive artifact path: ${artifactPath}`);
    }
  }
  const versionsRoot = ensureRealDirectoryWithin(root, "generated/agent/versions");

  const target = path.join(versionsRoot, `v${version}`);
  if (fs.existsSync(target)) throw new Error(`Immutable Agent archive already exists: generated/agent/versions/v${version}`);
  try {
    fs.mkdirSync(target);
  } catch (error) {
    if (error.code === "EEXIST") throw new Error(`Immutable Agent archive already exists: generated/agent/versions/v${version}`);
    throw error;
  }
  let committed = false;
  try {
    writeArtifactTree(target, artifacts);
    committed = true;
    return target;
  } catch (error) {
    throw new Error(`Failed to create immutable Agent archive v${version}: ${error.message}; recovery: ${committed ? "manual review required" : "new archive removed"}`);
  } finally {
    if (!committed && fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
  }
}

function gitFileBytes(root, revision, file) {
  try {
    return execFileSync("git", ["show", `${revision}:${file}`], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    return null;
  }
}

function historicalRegistryEntries(root, findings) {
  const discovered = new Map();
  let registryHasAppeared = false;
  let previousRegistry = null;
  const registryCommits = (runGit(root, ["log", "--reverse", "--format=%H", "--", AGENT_REGISTRY_PATH]) ?? "")
    .split(/\r?\n/u)
    .filter(Boolean);
  for (const commit of registryCommits) {
    const source = readRevisionFile(root, commit, AGENT_REGISTRY_PATH);
    if (source === null) {
      if (registryHasAppeared) {
        findings.push(`history: ${AGENT_REGISTRY_PATH} was deleted at ${commit}`);
        for (const known of discovered.values()) known.missing = true;
      }
      continue;
    }
    registryHasAppeared = true;
    const unsafe = scanGeneratedArtifact(AGENT_REGISTRY_PATH, source);
    if (unsafe.length > 0) {
      findings.push(`history: ${commit} ${unsafe.join("; ")}`);
      continue;
    }
    let taggedRegistry;
    try {
      taggedRegistry = JSON.parse(source);
    } catch (error) {
      findings.push(`history: ${commit} ${AGENT_REGISTRY_PATH} is invalid JSON: ${error.message}`);
      continue;
    }
    if (source !== prettyJson(taggedRegistry)) {
      findings.push(`history: ${commit} ${AGENT_REGISTRY_PATH} must use canonical generated JSON bytes`);
      continue;
    }
    for (const finding of historicalRegistryStateFindings(root, commit, taggedRegistry)) {
      findings.push(`history: ${commit} ${finding}`);
    }
    if (previousRegistry) {
      for (const finding of registryLifecycleTransitionFindings(previousRegistry, taggedRegistry)) {
        findings.push(`history: ${commit} ${finding}`);
      }
    }
    if (
      previousRegistry
      && registryLifecycleChanged(previousRegistry, taggedRegistry)
      && !isPreReleaseSchemaRefresh(previousRegistry, taggedRegistry)
    ) {
      const changed = (runGit(root, ["diff-tree", "--no-commit-id", "--name-only", "-r", commit]) ?? "")
        .split(/\r?\n/u)
        .filter(Boolean);
      if (JSON.stringify(changed) !== JSON.stringify([AGENT_REGISTRY_PATH])) {
        findings.push(`history: Registry lifecycle commit ${commit} must change only ${AGENT_REGISTRY_PATH}`);
      }
    }
    previousRegistry = taggedRegistry;
    const present = new Set((taggedRegistry.versions ?? []).map((entry) => entry.version));
    for (const [knownVersion, known] of discovered) {
      if (!present.has(knownVersion) && !known.missing) {
        findings.push(`history: Agent v${knownVersion} disappeared from the Registry at ${commit}`);
        known.missing = true;
      }
    }
    for (const entry of taggedRegistry.versions ?? []) {
      if (!semverPattern.test(entry.version ?? "")) {
        findings.push(`history: ${commit} contains an invalid Agent version`);
        continue;
      }
      const identity = {
        repository_directory: entry.repository_directory,
        manifest_sha256: entry.manifest_sha256,
        kin_tag: entry.kin_tag,
        design_checksum: entry.design_checksum,
        input_set_checksum: entry.input_set_checksum,
      };
      const previous = discovered.get(entry.version);
      if (previous?.missing) findings.push(`history: Agent v${entry.version} reappeared after removal at ${commit}`);
      if (previous && JSON.stringify(previous.identity) !== JSON.stringify(identity)) {
        findings.push(`history: Agent v${entry.version} immutable identity differs between ${previous.sourceLabel} and ${commit}`);
        continue;
      }
      if (previous?.wasReleased && entry.publication_state !== "released") {
        findings.push(`history: released Agent v${entry.version} returned to staged at ${commit}`);
      }
      discovered.set(entry.version, {
        identity,
        sourceLabel: commit,
        wasReleased: Boolean(previous?.wasReleased || entry.publication_state === "released"),
        missing: false,
      });
    }
  }

  const tags = (runGit(root, ["tag", "--list", "v[0-9]*"]) ?? "").split(/\r?\n/u).filter(Boolean);
  for (const tagName of tags) {
    const source = readRevisionFile(root, tagName, AGENT_REGISTRY_PATH);
    if (source === null) continue;
    const tag = exactTagState(root, tagName);
    if (!tag.exists || tag.objectType !== "tag" || !tag.commit) {
      findings.push(`history: ${tagName} contains an Agent Registry but is not an annotated commit Tag`);
      continue;
    }
    try {
      const taggedRegistry = JSON.parse(source);
      for (const entry of taggedRegistry.versions ?? []) {
        const known = discovered.get(entry.version);
        if (!known) findings.push(`history: ${tagName} contains Agent v${entry.version} absent from Registry commit history`);
      }
    } catch (error) {
      findings.push(`history: ${tagName} ${AGENT_REGISTRY_PATH} is invalid JSON: ${error.message}`);
    }
  }
  return discovered;
}

export function validateAgentHistory({ root, version = null } = {}) {
  const findings = [];
  if (runGit(root, ["rev-parse", "--is-shallow-repository"]) === "true") {
    return ["history: a complete checkout is required; fetch-depth must be 0"];
  }
  let registry;
  try {
    registry = readAgentVersionRegistry(root);
  } catch (error) {
    return [error.message];
  }
  findings.push(...validateAgentVersionRegistry({ root, registry }));
  const historicalEntries = historicalRegistryEntries(root, findings);
  const currentByVersion = new Map(registry.versions.map((entry) => [entry.version, entry]));
  for (const [historicalVersion, historical] of historicalEntries) {
    const current = currentByVersion.get(historicalVersion);
    if (!current) {
      findings.push(`history: Agent v${historicalVersion} recorded by ${historical.sourceLabel} is missing from the current Registry`);
      continue;
    }
    const currentIdentity = {
      repository_directory: current.repository_directory,
      manifest_sha256: current.manifest_sha256,
      kin_tag: current.kin_tag,
      design_checksum: current.design_checksum,
      input_set_checksum: current.input_set_checksum,
    };
    if (JSON.stringify(currentIdentity) !== JSON.stringify(historical.identity)) {
      findings.push(`history: Agent v${historicalVersion} immutable Registry identity changed after ${historical.sourceLabel}`);
    }
    if (historical.wasReleased && current.publication_state !== "released") {
      findings.push(`history: released Agent v${historicalVersion} cannot return to staged`);
    }
  }
  const entries = version === null
    ? registry.versions.filter((entry) => entry.publication_state === "released")
    : registry.versions.filter((entry) => entry.version === assertAgentVersion(version));
  if (version !== null && entries.length !== 1) findings.push(`history: Registry entry ${version} does not exist`);

  for (const entry of entries) {
    const tag = exactTagState(root, entry.kin_tag);
    if (!tag.exists || tag.objectType !== "tag" || !tag.commit) {
      findings.push(`${entry.version}: ${entry.kin_tag} must be an annotated commit tag`);
      continue;
    }
    if (runGit(root, ["merge-base", "--is-ancestor", tag.commit, "HEAD"]) === null) {
      findings.push(`${entry.version}: ${entry.kin_tag} must be an ancestor of current HEAD`);
      continue;
    }
    const currentDirectory = path.join(root, ...entry.repository_directory.split("/"));
    let currentFiles;
    try {
      currentFiles = listArtifactFiles(currentDirectory, { governedRoot: root }).sort(compareCodePoints);
    } catch (error) {
      findings.push(`${entry.version}: ${error.message}`);
      continue;
    }
    const taggedFilesRaw = runGit(root, ["ls-tree", "-r", "--name-only", entry.kin_tag, "--", entry.repository_directory]);
    const taggedFiles = (taggedFilesRaw ?? "")
      .split(/\r?\n/u)
      .filter(Boolean)
      .map((file) => file.slice(`${entry.repository_directory}/`.length))
      .sort(compareCodePoints);
    if (JSON.stringify(currentFiles) !== JSON.stringify(taggedFiles)) {
      findings.push(`${entry.version}: current archive file list differs from ${entry.kin_tag}`);
      continue;
    }
    for (const file of currentFiles) {
      const current = fs.readFileSync(path.join(currentDirectory, ...file.split("/")));
      const tagged = gitFileBytes(root, entry.kin_tag, `${entry.repository_directory}/${file}`);
      if (!tagged || !current.equals(tagged)) findings.push(`${entry.version}:${file}: current bytes differ from ${entry.kin_tag}`);
    }
    const taggedDesignSource = readRevisionFile(root, entry.kin_tag, "DESIGN.md");
    if (taggedDesignSource === null) findings.push(`${entry.version}: ${entry.kin_tag} does not contain DESIGN.md`);
    else {
      try {
        const taggedDesign = parseDesignContract(taggedDesignSource);
        if (
          taggedDesign.releaseStatus !== "released"
          || taggedDesign.kinVersion !== entry.version
          || taggedDesign.latestStable !== entry.version
        ) {
          findings.push(`${entry.version}: ${entry.kin_tag} DESIGN.md does not describe the matching released contract`);
        }
        if (taggedDesign.checksum !== entry.design_checksum) {
          findings.push(`${entry.version}: archived design checksum differs from ${entry.kin_tag} DESIGN.md`);
        }
      } catch (error) {
        findings.push(`${entry.version}: ${entry.kin_tag} DESIGN.md is invalid: ${error.message}`);
      }
    }
    const taggedPackageSource = readRevisionFile(root, entry.kin_tag, "package.json");
    if (taggedPackageSource === null) findings.push(`${entry.version}: ${entry.kin_tag} does not contain package.json`);
    else {
      try {
        if (JSON.parse(taggedPackageSource).version !== entry.version) {
          findings.push(`${entry.version}: ${entry.kin_tag} package.json version differs from the archive`);
        }
      } catch (error) {
        findings.push(`${entry.version}: ${entry.kin_tag} package.json is invalid: ${error.message}`);
      }
    }
    const taggedRegistrySource = readRevisionFile(root, entry.kin_tag, AGENT_REGISTRY_PATH);
    if (taggedRegistrySource === null) {
      findings.push(`${entry.version}: ${entry.kin_tag} does not contain versions.json`);
      continue;
    }
    try {
      const taggedRegistry = JSON.parse(taggedRegistrySource);
      const taggedEntry = taggedRegistry.versions?.find((candidate) => candidate.version === entry.version);
      if (!taggedEntry) findings.push(`${entry.version}: ${entry.kin_tag} does not contain its Registry entry`);
      else if (taggedEntry.manifest_sha256 !== entry.manifest_sha256) findings.push(`${entry.version}: manifest checksum differs from the tagged Registry entry`);
      else if (taggedEntry.publication_state !== "staged" || taggedEntry.support_status !== null || taggedEntry.manifest_url !== null) {
        findings.push(`${entry.version}: ${entry.kin_tag} must preserve the staged pre-promotion Registry entry`);
      }
    } catch (error) {
      findings.push(`${entry.version}: ${entry.kin_tag} versions.json is invalid: ${error.message}`);
    }
  }
  return findings;
}

export function promotionDiffFindings({ root, version, tagCommit, headCommit }) {
  const findings = [];
  if (!tagCommit || !headCommit) return ["promotion: missing Tag or HEAD commit"];
  if (tagCommit === headCommit) return findings;
  if (runGit(root, ["merge-base", "--is-ancestor", tagCommit, headCommit]) === null) {
    findings.push(`promotion: v${version} must be an ancestor of the promotion commit`);
    return findings;
  }
  const parentCommit = runGit(root, ["rev-parse", `${headCommit}^`]);
  if (!parentCommit) return ["promotion: the promotion commit must have a parent"];
  const changed = (runGit(root, ["diff", "--name-only", parentCommit, headCommit]) ?? "").split(/\r?\n/u).filter(Boolean);
  if (JSON.stringify(changed) !== JSON.stringify([AGENT_REGISTRY_PATH])) {
    findings.push(`promotion: the promotion commit must change only ${AGENT_REGISTRY_PATH}`);
  }
  return findings;
}

function registryLifecycleChanged(previous, current) {
  if (previous.$schema !== current.$schema || previous.latest_agent_distribution !== current.latest_agent_distribution) return true;
  const previousByVersion = new Map((previous.versions ?? []).map((entry) => [entry.version, entry]));
  const currentByVersion = new Map((current.versions ?? []).map((entry) => [entry.version, entry]));
  for (const version of previousByVersion.keys()) {
    if (!currentByVersion.has(version)) return true;
  }
  for (const [version, entry] of currentByVersion) {
    const earlier = previousByVersion.get(version);
    if (!earlier) {
      if (entry.publication_state === "released") return true;
      continue;
    }
    for (const field of ["publication_state", "support_status", "manifest_url", "replacement", "advisory_url"]) {
      if (!Object.is(earlier[field], entry[field])) return true;
    }
  }
  return false;
}

function lifecycleFields(entry) {
  return {
    publication_state: entry.publication_state,
    support_status: entry.support_status,
    manifest_url: entry.manifest_url,
    replacement: entry.replacement,
    advisory_url: entry.advisory_url,
  };
}

function isPreReleaseSchemaRefresh(previous, current) {
  const previousReleased = (previous.versions ?? []).some((entry) => entry.publication_state === "released");
  const currentReleased = (current.versions ?? []).some((entry) => entry.publication_state === "released");
  if (
    previousReleased
    || currentReleased
    || previous.latest_agent_distribution !== null
    || current.latest_agent_distribution !== null
    || previous.$schema !== AGENT_VERSIONS_SCHEMA_URL
    || current.$schema !== AGENT_VERSIONS_SCHEMA_URL
    || previous.schema_version === current.schema_version
  ) {
    return false;
  }
  const previousEntries = new Map((previous.versions ?? []).map((entry) => [entry.version, entry]));
  const currentEntries = new Map((current.versions ?? []).map((entry) => [entry.version, entry]));
  if (previousEntries.size !== currentEntries.size) return false;
  for (const [version, entry] of currentEntries) {
    if (JSON.stringify(entry) !== JSON.stringify(previousEntries.get(version))) return false;
  }
  return true;
}

export function registryLifecycleTransitionFindings(previous, current) {
  const findings = [];
  const previousEntries = new Map((previous.versions ?? []).map((entry) => [entry.version, entry]));
  const currentEntries = new Map((current.versions ?? []).map((entry) => [entry.version, entry]));
  const changedVersions = [];
  const addedVersions = [];
  const newlyReleased = [];
  for (const [version, entry] of currentEntries) {
    const earlier = previousEntries.get(version);
    if (!earlier) {
      addedVersions.push(version);
      if (entry.publication_state === "released") {
        findings.push(`Registry transition: v${version} cannot first appear as released`);
      }
      continue;
    }
    if (JSON.stringify(lifecycleFields(earlier)) !== JSON.stringify(lifecycleFields(entry))) {
      changedVersions.push(version);
    }
    if (earlier.publication_state === "staged" && entry.publication_state === "released") {
      newlyReleased.push(version);
    } else if (earlier.publication_state !== entry.publication_state) {
      findings.push(`Registry transition: v${version} has an unsupported publication-state change`);
    }
  }
  for (const version of previousEntries.keys()) {
    if (!currentEntries.has(version)) findings.push(`Registry transition: v${version} cannot be removed`);
  }
  const aliasChanged = previous.latest_agent_distribution !== current.latest_agent_distribution;
  const schemaChanged = previous.$schema !== current.$schema || previous.schema_version !== current.schema_version;
  if (schemaChanged && isPreReleaseSchemaRefresh(previous, current)) return findings;

  if (newlyReleased.length > 0) {
    if (newlyReleased.length !== 1) findings.push("Registry transition: one focused promotion may release exactly one staged version");
    const targetVersion = newlyReleased[0];
    const previousReleased = [...previousEntries.values()]
      .filter((entry) => entry.publication_state === "released")
      .map((entry) => entry.version)
      .sort(compareAgentVersions);
    const maximumReleased = previousReleased.at(-1) ?? null;
    if (maximumReleased !== null && compareAgentVersions(targetVersion, maximumReleased) <= 0) {
      findings.push(`Registry transition: promotion v${targetVersion} must advance beyond released v${maximumReleased}`);
    }
    if (current.latest_agent_distribution !== targetVersion) {
      findings.push(`Registry transition: promotion must advance latest_agent_distribution to v${targetVersion}`);
    }
    if (changedVersions.some((version) => version !== targetVersion)) {
      findings.push("Registry transition: promotion must not combine unrelated support or release changes");
    }
    if (addedVersions.length > 0) {
      findings.push("Registry transition: promotion must not add staged versions");
    }
    const target = currentEntries.get(targetVersion);
    if (target?.support_status !== "supported") {
      findings.push(`Registry transition: promoted v${targetVersion} must become supported`);
    }
    const expectedSchemaUrl = `${AGENT_SITE_BASE}/versions/v${targetVersion}/schemas/versions.schema.json`;
    if (current.$schema !== expectedSchemaUrl) {
      findings.push(`Registry transition: promotion v${targetVersion} must atomically adopt ${expectedSchemaUrl}`);
    }
    return findings;
  }

  if (schemaChanged) findings.push("Registry transition: Schema coordinates may change only during a forward promotion");
  if (aliasChanged) {
    const fromVersion = previous.latest_agent_distribution;
    if (fromVersion === null) {
      findings.push("Registry transition: a withdrawn stable alias cannot be restored without a forward promotion");
      return findings;
    }
    const from = currentEntries.get(fromVersion);
    if (!from || !new Set(["superseded", "unsupported"]).has(from.support_status)) {
      findings.push(`Registry transition: moving stable away from v${fromVersion} must retire that release atomically`);
    }
    const targetVersion = current.latest_agent_distribution;
    const target = targetVersion === null ? null : currentEntries.get(targetVersion);
    if (
      targetVersion !== null
      && (!target || target.publication_state !== "released" || target.support_status !== "supported")
    ) {
      findings.push(`Registry transition: rollback target v${targetVersion} must be a supported released entry`);
    }
    if (from?.support_status === "superseded" && from.replacement !== current.latest_agent_distribution) {
      findings.push(`Registry transition: superseded v${fromVersion} must identify the selected supported replacement`);
    }
    if (changedVersions.some((version) => version !== fromVersion)) {
      findings.push("Registry transition: rollback must not combine unrelated support changes");
    }
    if (addedVersions.length > 0) {
      findings.push("Registry transition: rollback must not add staged versions");
    }
    return findings;
  }

  const currentStable = current.latest_agent_distribution;
  if (
    currentStable !== null
    && changedVersions.includes(currentStable)
    && currentEntries.get(currentStable)?.support_status !== "supported"
  ) {
    findings.push(`Registry transition: current stable v${currentStable} cannot be retired without moving or withdrawing the alias`);
  }
  if (changedVersions.length > 0 && addedVersions.length > 0) {
    findings.push("Registry transition: support updates must not add staged versions");
  }
  return findings;
}

export function registryLifecycleCommitFindings({ root, headCommit, registry }) {
  if (!headCommit) return ["Registry lifecycle: missing HEAD commit"];
  const parentCommit = runGit(root, ["rev-parse", `${headCommit}^`]);
  if (!parentCommit) return [];
  const previousSource = readRevisionFile(root, parentCommit, AGENT_REGISTRY_PATH);
  if (previousSource === null) return [];
  let previous;
  try {
    previous = JSON.parse(previousSource);
  } catch (error) {
    return [`Registry lifecycle: parent ${AGENT_REGISTRY_PATH} is invalid JSON: ${error.message}`];
  }
  const transitionFindings = registryLifecycleTransitionFindings(previous, registry);
  if (!registryLifecycleChanged(previous, registry) || isPreReleaseSchemaRefresh(previous, registry)) return transitionFindings;
  const changed = (runGit(root, ["diff", "--name-only", parentCommit, headCommit]) ?? "").split(/\r?\n/u).filter(Boolean);
  if (JSON.stringify(changed) !== JSON.stringify([AGENT_REGISTRY_PATH])) {
    transitionFindings.push(`Registry lifecycle: a promotion, support, or stable-alias change must be committed alone in ${AGENT_REGISTRY_PATH}`);
  }
  return transitionFindings;
}

export function applyAgentRegistryRollback(registry, {
  fromVersion,
  toVersion = null,
  supportStatus,
  advisoryUrl = null,
}) {
  assertAgentVersion(fromVersion);
  if (toVersion !== null) assertAgentVersion(toVersion);
  if (!new Set(["superseded", "unsupported"]).has(supportStatus)) {
    throw new Error("Rollback support status must be superseded or unsupported");
  }
  if (supportStatus === "superseded" && toVersion === null) {
    throw new Error("A superseded Agent version requires a supported replacement");
  }
  assertAdvisoryUrl(advisoryUrl);
  const next = structuredClone(registry);
  if (next.latest_agent_distribution !== fromVersion) {
    throw new Error(`Agent v${fromVersion} is not the current stable alias target`);
  }
  const from = next.versions.find((entry) => entry.version === fromVersion);
  if (!from || from.publication_state !== "released") throw new Error(`Agent v${fromVersion} is not a released Registry entry`);
  if (toVersion === fromVersion) throw new Error("Rollback target must differ from the faulty version");
  if (toVersion !== null) {
    const replacement = next.versions.find((entry) => entry.version === toVersion);
    if (!replacement || replacement.publication_state !== "released" || replacement.support_status !== "supported") {
      throw new Error(`Rollback target v${toVersion} must be a supported released Registry entry`);
    }
  }
  from.support_status = supportStatus;
  from.replacement = toVersion;
  from.advisory_url = advisoryUrl;
  next.latest_agent_distribution = toVersion;
  return next;
}

export function applyAgentSupportUpdate(registry, {
  version,
  supportStatus,
  replacement = null,
  advisoryUrl = null,
}) {
  assertAgentVersion(version);
  if (!new Set(["supported", "superseded", "unsupported"]).has(supportStatus)) {
    throw new Error("Agent support status must be supported, superseded, or unsupported");
  }
  if (replacement !== null) assertAgentVersion(replacement);
  if (supportStatus === "supported" && replacement !== null) {
    throw new Error("A supported Agent version cannot identify a replacement");
  }
  assertAdvisoryUrl(advisoryUrl);
  const next = structuredClone(registry);
  const entry = next.versions.find((candidate) => candidate.version === version);
  if (!entry || entry.publication_state !== "released") {
    throw new Error(`Agent v${version} is not a released Registry entry`);
  }
  if (next.latest_agent_distribution === version && supportStatus !== "supported") {
    throw new Error("Use agent:rollback to move or withdraw the current stable alias before changing its support status");
  }
  if (supportStatus === "supported") {
    entry.support_status = "supported";
    entry.replacement = null;
    entry.advisory_url = advisoryUrl;
    return next;
  }
  if (supportStatus === "superseded" && replacement === null) {
    throw new Error("A superseded Agent version requires a supported replacement");
  }
  if (replacement === version) throw new Error("An Agent version cannot replace itself");
  if (replacement !== null) {
    const target = next.versions.find((candidate) => candidate.version === replacement);
    if (!target || target.publication_state !== "released" || target.support_status !== "supported") {
      throw new Error(`Replacement v${replacement} must be a supported released Registry entry`);
    }
  }
  entry.support_status = supportStatus;
  entry.replacement = replacement;
  entry.advisory_url = advisoryUrl;
  return next;
}
