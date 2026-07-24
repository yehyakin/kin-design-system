import fs from "node:fs";
import path from "node:path";
import { AGENT_SITE_BASE } from "./agent-distribution.mjs";
import { readAgentVersionRegistry, validateAgentVersionRegistry } from "./agent-release.mjs";
import { compareCodePoints, prettyJson, sha256ExactBytes } from "./canonical-content.mjs";
import {
  normalizeRepositoryPath,
  resolveExistingPathWithin,
  resolveOutputFileWithin,
} from "./safe-path.mjs";
import { validateSchemaValue } from "./schema-validator.mjs";
import {
  validateAgentDistribution,
  validateAgentBundleSemantics,
  validateAgentManifestCoordinates,
} from "../validate-agent-distribution.mjs";

function bundlePublicPath(bundlePath) {
  const normalized = normalizeRepositoryPath(bundlePath);
  const projected = normalized.startsWith("en/")
    ? normalized.slice(3)
    : normalized.startsWith("zh-CN/")
      ? `zh/${normalized.slice(6)}`
      : normalized;
  return normalizeRepositoryPath(projected);
}

function readManifest(root, repositoryDirectory) {
  const relative = `${repositoryDirectory}/design-manifest.json`;
  const file = resolveExistingPathWithin(root, relative);
  return { bytes: fs.readFileSync(file), value: JSON.parse(fs.readFileSync(file, "utf8")) };
}

function addResponse(responses, publicPath, response) {
  const normalized = normalizeRepositoryPath(publicPath);
  if (responses.has(normalized)) throw new Error(`${normalized}: duplicate public Agent path`);
  responses.set(normalized, response);
}

function bundleResponses(root, repositoryDirectory, publicPrefix, { channel, version = null }) {
  const semanticFindings = validateAgentBundleSemantics({
    root,
    bundleDirectory: path.join(root, ...repositoryDirectory.split("/")),
    channel,
    version,
  });
  if (semanticFindings.length > 0) {
    throw new Error(`${repositoryDirectory} is not a valid Agent bundle:\n- ${semanticFindings.join("\n- ")}`);
  }
  const manifest = readManifest(root, repositoryDirectory);
  const manifestSchema = JSON.parse(fs.readFileSync(
    resolveExistingPathWithin(root, `${repositoryDirectory}/schemas/manifest.schema.json`),
    "utf8",
  ));
  const schemaFindings = validateSchemaValue(manifest.value, manifestSchema);
  if (schemaFindings.length > 0) {
    throw new Error(`${repositoryDirectory}/design-manifest.json is invalid:\n- ${schemaFindings.join("\n- ")}`);
  }
  if (manifest.value.channel !== channel) throw new Error(`${repositoryDirectory}: expected ${channel} channel`);
  if (channel === "versioned" && manifest.value.kin_version !== version) {
    throw new Error(`${repositoryDirectory}: expected Agent version ${version}`);
  }
  const coordinateFindings = validateAgentManifestCoordinates({
    manifest: manifest.value,
    repositoryDirectory,
    channel,
    version,
  });
  if (coordinateFindings.length > 0) {
    throw new Error(`${repositoryDirectory}/design-manifest.json has invalid coordinates:\n- ${coordinateFindings.join("\n- ")}`);
  }
  const responses = new Map();
  addResponse(responses, `${publicPrefix}design-manifest.json`, {
    bytes: manifest.bytes,
    mediaType: "application/json; charset=utf-8",
    source: `${repositoryDirectory}/design-manifest.json`,
  });
  for (const artifact of manifest.value.artifacts) {
    const source = `${repositoryDirectory}/${artifact.bundle_path}`;
    const bytes = fs.readFileSync(resolveExistingPathWithin(root, source));
    if (sha256ExactBytes(bytes) !== artifact.sha256) throw new Error(`${source}: checksum differs from the Manifest`);
    addResponse(responses, `${publicPrefix}${bundlePublicPath(artifact.bundle_path)}`, {
      bytes,
      mediaType: artifact.media_type,
      source,
    });
  }
  return { manifest, responses };
}

function aliasManifest(entry, targetManifest) {
  return {
    $schema: `${AGENT_SITE_BASE}/versions/v${entry.version}/schemas/alias-manifest.schema.json`,
    schema_version: targetManifest.schema_version,
    kind: "kin-agent-distribution-alias",
    generated: true,
    normative: false,
    channel: "stable-alias",
    resolves_to_version: entry.version,
    target_manifest_url: entry.manifest_url,
    target_manifest_sha256: entry.manifest_sha256,
    registry_url: `${AGENT_SITE_BASE}/versions.json`,
  };
}

export function expectedAgentResponses(root) {
  const nextFindings = validateAgentDistribution({ root, validateRegistry: false });
  if (nextFindings.length > 0) throw new Error(`Agent next channel is not publishable:\n- ${nextFindings.join("\n- ")}`);
  const registry = readAgentVersionRegistry(root);
  const registryFindings = validateAgentVersionRegistry({ root, registry });
  if (registryFindings.length > 0) throw new Error(`Agent Registry is not publishable:\n- ${registryFindings.join("\n- ")}`);

  const responses = new Map();
  const registryBytes = fs.readFileSync(resolveExistingPathWithin(root, "generated/agent/versions.json"));
  const next = bundleResponses(root, "generated/agent/next", "next/", { channel: "next" });
  const registryIsAddressable = (
    next.manifest.value.publication?.published === true
    || registry.versions.some((entry) => entry.publication_state === "released")
  );
  if (registryIsAddressable) {
    addResponse(responses, "versions.json", {
      bytes: registryBytes,
      mediaType: "application/json; charset=utf-8",
      source: "generated/agent/versions.json",
    });
  }
  if (next.manifest.value.publication?.published === true) {
    for (const [publicPath, response] of next.responses) addResponse(responses, publicPath, response);
  }

  for (const entry of registry.versions.filter((candidate) => candidate.publication_state === "released")) {
    const versioned = bundleResponses(root, entry.repository_directory, `versions/v${entry.version}/`, {
      channel: "versioned",
      version: entry.version,
    });
    for (const [publicPath, response] of versioned.responses) addResponse(responses, publicPath, response);
  }

  if (registry.latest_agent_distribution !== null) {
    const entry = registry.versions.find((candidate) => candidate.version === registry.latest_agent_distribution);
    const stable = bundleResponses(root, entry.repository_directory, "", {
      channel: "versioned",
      version: entry.version,
    });
    for (const [publicPath, response] of stable.responses) {
      if (publicPath === "design-manifest.json") continue;
      addResponse(responses, publicPath, response);
    }
    const resolver = aliasManifest(entry, stable.manifest.value);
    const resolverSchema = JSON.parse(fs.readFileSync(
      resolveExistingPathWithin(root, `${entry.repository_directory}/schemas/alias-manifest.schema.json`),
      "utf8",
    ));
    const findings = validateSchemaValue(resolver, resolverSchema);
    if (findings.length > 0) throw new Error(`Stable alias Manifest is invalid:\n- ${findings.join("\n- ")}`);
    addResponse(responses, "design-manifest.json", {
      bytes: Buffer.from(prettyJson(resolver), "utf8"),
      mediaType: "application/json; charset=utf-8",
      source: "registry-derived stable alias resolver",
    });
  }
  return { registry, responses };
}

function writeResponse(output, publicPath, response) {
  const target = resolveOutputFileWithin(output, publicPath, { createParents: true });
  fs.writeFileSync(target, response.bytes, { flag: "wx" });
}

export function buildAgentPages({ root, output }) {
  const { responses } = expectedAgentResponses(root);
  for (const [publicPath, response] of [...responses].sort(([left], [right]) => compareCodePoints(left, right))) {
    writeResponse(output, publicPath, response);
  }
  return responses;
}

function walkFiles(directory, prefix = "", findings = []) {
  if (!fs.existsSync(directory)) return { files: [], findings };
  const rootStat = fs.lstatSync(directory);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    findings.push(`${prefix || "."}: public Agent tree must contain only real directories`);
    return { files: [], findings };
  }
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) findings.push(`${relative}: symbolic links are not allowed in public Agent output`);
    else if (entry.isDirectory()) files.push(...walkFiles(absolute, relative, findings).files);
    else if (entry.isFile()) files.push(relative);
    else findings.push(`${relative}: unsupported public Agent output entry`);
  }
  return { files: files.sort(compareCodePoints), findings };
}

export function validateAgentSiteOutput({ root, output }) {
  const findings = [];
  let expected;
  try {
    expected = expectedAgentResponses(root);
  } catch (error) {
    return [error.message];
  }
  for (const [publicPath, response] of expected.responses) {
    const target = path.join(output, ...publicPath.split("/"));
    if (!fs.existsSync(target)) {
      findings.push(`${publicPath}: required Agent response is missing`);
      continue;
    }
    const stat = fs.lstatSync(target);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      findings.push(`${publicPath}: Agent response must be a regular file`);
      continue;
    }
    if (!fs.readFileSync(target).equals(response.bytes)) findings.push(`${publicPath}: published bytes differ from ${response.source}`);
  }

  const expectedNextPaths = [...expected.responses.keys()].filter((file) => file.startsWith("next/")).sort(compareCodePoints);
  const nextTree = walkFiles(path.join(output, "next"));
  findings.push(...nextTree.findings);
  const actualNextPaths = nextTree.files.map((file) => `next/${file}`);
  if (JSON.stringify(actualNextPaths) !== JSON.stringify(expectedNextPaths)) {
    findings.push("next/: public files differ from the Manifest-authorized allowlist");
  }
  const expectedVersionPaths = [...expected.responses.keys()].filter((file) => file.startsWith("versions/")).sort(compareCodePoints);
  const versionTree = walkFiles(path.join(output, "versions"));
  findings.push(...versionTree.findings);
  const actualVersionPaths = versionTree.files.map((file) => `versions/${file}`);
  if (JSON.stringify(actualVersionPaths) !== JSON.stringify(expectedVersionPaths)) {
    findings.push("versions/: public version files differ from the released Registry allowlist");
  }
  for (const entry of expected.registry.versions.filter((candidate) => candidate.publication_state === "staged")) {
    if (fs.existsSync(path.join(output, "versions", `v${entry.version}`))) findings.push(`versions/v${entry.version}: staged archive must not be published`);
  }
  for (const publicPath of responsePathsThatMustBeAbsent(root)) {
    const target = path.join(output, ...publicPath.split("/"));
    if (fs.existsSync(target)) findings.push(`${publicPath}: unpublished Agent response must be absent`);
  }
  return findings;
}

export function responsePathsThatMustBeAbsent(root) {
  const expected = expectedAgentResponses(root);
  const registry = expected.registry;
  const paths = [];
  for (const entry of registry.versions.filter((candidate) => candidate.publication_state === "staged")) {
    const staged = bundleResponses(root, entry.repository_directory, `versions/v${entry.version}/`, {
      channel: "versioned",
      version: entry.version,
    });
    paths.push(...staged.responses.keys());
  }
  const next = bundleResponses(root, "generated/agent/next", "next/", { channel: "next" });
  if (next.manifest.value.publication?.published !== true) {
    const registryIsAddressable = registry.versions.some((entry) => entry.publication_state === "released");
    if (!registryIsAddressable) paths.push("versions.json");
    paths.push(...next.responses.keys());
  }
  const allowedRootPaths = new Set(
    [...expected.responses.keys()].filter(
      (publicPath) => publicPath !== "versions.json"
        && !publicPath.startsWith("next/")
        && !publicPath.startsWith("versions/"),
    ),
  );
  const reservedRootPaths = new Set(["design-manifest.json", "component-recipes.json"]);
  for (const publicPath of next.responses.keys()) {
    reservedRootPaths.add(publicPath.slice("next/".length));
  }
  for (const entry of registry.versions) {
    const rootProjection = bundleResponses(root, entry.repository_directory, "", {
      channel: "versioned",
      version: entry.version,
    });
    for (const publicPath of rootProjection.responses.keys()) reservedRootPaths.add(publicPath);
  }
  for (const publicPath of reservedRootPaths) {
    if (!allowedRootPaths.has(publicPath)) paths.push(publicPath);
  }
  return [...new Set(paths)].sort(compareCodePoints);
}
