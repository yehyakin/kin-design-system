import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  AGENT_SCHEMAS,
  AGENT_SITE_BASE,
  buildAgentDistribution,
} from "./lib/agent-distribution.mjs";
import { validateAgentHistory, validateAgentVersionRegistry } from "./lib/agent-release.mjs";
import { compareArtifactTree, listArtifactFiles } from "./lib/generated-tree.mjs";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { checksumInputEntries } from "./lib/input-registry.mjs";
import { validateSchemaValue } from "./lib/schema-validator.mjs";
import { compareCodePoints, sha256ExactBytes } from "./lib/canonical-content.mjs";
import { normalizeRepositoryPath, resolveExistingPathWithin } from "./lib/safe-path.mjs";
import { scanGeneratedArtifact } from "./lib/safe-generated-content.mjs";
import { THEME_KEYS, THEME_MODES } from "./lib/theme-tokens.mjs";

function relativePath(root, target) {
  return path.relative(root, target).replaceAll("\\", "/") || ".";
}

function schemaKey(name) {
  return name.replace(".schema.json", "").replaceAll("-", "_");
}

function projectedPublicPath(bundlePath) {
  const normalized = normalizeRepositoryPath(bundlePath);
  if (normalized.startsWith("en/")) return normalized.slice(3);
  if (normalized.startsWith("zh-CN/")) return `zh/${normalized.slice(6)}`;
  return normalized;
}

export function validateAgentManifestCoordinates({
  manifest,
  repositoryDirectory,
  channel,
  version = null,
}) {
  const findings = [];
  const expectedRepositoryDirectory = channel === "next"
    ? "generated/agent/next"
    : `generated/agent/versions/v${version}`;
  const publicBase = channel === "next"
    ? `${AGENT_SITE_BASE}/next/`
    : `${AGENT_SITE_BASE}/versions/v${version}/`;
  const sourceRef = channel === "next" ? "main" : `v${version}`;
  const sourceRawBase = `https://raw.githubusercontent.com/yehyakin/kin-design-system/${sourceRef}/`;
  const sourceHumanBase = `https://github.com/yehyakin/kin-design-system/blob/${sourceRef}/`;
  if (repositoryDirectory !== expectedRepositoryDirectory) {
    findings.push(`repository directory must equal ${expectedRepositoryDirectory}`);
  }
  if (manifest.$schema !== `${publicBase}schemas/manifest.schema.json`) {
    findings.push("Manifest $schema does not match its channel coordinates");
  }
  const expectedLinks = {
    source_raw_base_url: sourceRawBase,
    source_human_base_url: sourceHumanBase,
    public_base_url: publicBase,
    versions_registry_url: `${AGENT_SITE_BASE}/versions.json`,
  };
  if (JSON.stringify(manifest.links) !== JSON.stringify(expectedLinks)) {
    findings.push("Manifest links do not match their channel coordinates");
  }

  const expectedSchemaKeys = AGENT_SCHEMAS.map(schemaKey);
  if (JSON.stringify(Object.keys(manifest.schemas ?? {})) !== JSON.stringify(expectedSchemaKeys)) {
    findings.push("Manifest schemas must contain the canonical ordered Schema set");
  }
  for (const name of AGENT_SCHEMAS) {
    const key = schemaKey(name);
    const expected = {
      repository_source_path: `distribution/schemas/${name}`,
      bundle_path: `schemas/${name}`,
      public_url: `${publicBase}schemas/${name}`,
    };
    if (JSON.stringify(manifest.schemas?.[key]) !== JSON.stringify(expected)) {
      findings.push(`Manifest schemas.${key} does not match its channel coordinates`);
    }
  }

  for (const name of ["components", "pages", "integrations"]) {
    const repositoryPath = `${name}/catalog.json`;
    const expected = {
      repository_path: repositoryPath,
      raw_url: `${sourceRawBase}${repositoryPath}`,
      human_url: `${sourceHumanBase}${repositoryPath}`,
    };
    for (const [field, value] of Object.entries(expected)) {
      if (manifest.catalogs?.[name]?.[field] !== value) {
        findings.push(`Manifest catalogs.${name}.${field} does not match its channel coordinates`);
      }
    }
  }

  const ids = new Set();
  const bundlePaths = new Set();
  const repositoryPaths = new Set();
  const publicUrls = new Set();
  const artifactsById = new Map();
  for (const artifact of manifest.artifacts ?? []) {
    let bundlePath;
    try {
      bundlePath = normalizeRepositoryPath(artifact.bundle_path);
    } catch (error) {
      findings.push(`artifact ${artifact.id ?? "unknown"}: ${error.message}`);
      continue;
    }
    if (ids.has(artifact.id)) findings.push(`artifact id must be unique: ${artifact.id}`);
    if (bundlePaths.has(bundlePath)) findings.push(`artifact bundle_path must be unique: ${bundlePath}`);
    if (repositoryPaths.has(artifact.repository_path)) findings.push(`artifact repository_path must be unique: ${artifact.repository_path}`);
    if (publicUrls.has(artifact.public_url)) findings.push(`artifact public_url must be unique: ${artifact.public_url}`);
    ids.add(artifact.id);
    bundlePaths.add(bundlePath);
    repositoryPaths.add(artifact.repository_path);
    publicUrls.add(artifact.public_url);
    artifactsById.set(artifact.id, artifact);

    if (artifact.repository_path !== `${expectedRepositoryDirectory}/${bundlePath}`) {
      findings.push(`${bundlePath}: repository_path does not match its bundle coordinates`);
    }
    if (artifact.public_url !== `${publicBase}${projectedPublicPath(bundlePath)}`) {
      findings.push(`${bundlePath}: public_url does not match its channel coordinates`);
    }
    const expectedMediaType = artifact.kind === "json-schema"
      ? "application/schema+json; charset=utf-8"
      : artifact.kind === "agent-markdown"
        ? "text/markdown; charset=utf-8"
        : null;
    if (expectedMediaType !== null && artifact.media_type !== expectedMediaType) {
      findings.push(`${bundlePath}: media_type does not match artifact kind ${artifact.kind}`);
    }
  }

  for (const name of AGENT_SCHEMAS) {
    const key = schemaKey(name);
    const artifact = artifactsById.get(`schema-${key}`);
    const schema = manifest.schemas?.[key];
    if (
      !artifact
      || artifact.kind !== "json-schema"
      || artifact.bundle_path !== schema?.bundle_path
      || artifact.public_url !== schema?.public_url
    ) {
      findings.push(`Manifest schemas.${key} must resolve to its matching json-schema artifact`);
    }
  }

  const modeKeys = new Set();
  for (const mode of manifest.modes ?? []) {
    const modeKey = `${mode.locale}|${mode.theme}|${mode.contrast}`;
    if (modeKeys.has(modeKey)) findings.push(`Manifest mode must be unique: ${modeKey}`);
    modeKeys.add(modeKey);
    const artifact = artifactsById.get(mode.artifact_id);
    if (!artifact) {
      findings.push(`Manifest mode ${modeKey} references unknown artifact ${mode.artifact_id}`);
      continue;
    }
    if (
      artifact.kind !== "agent-markdown"
      || artifact.locale !== mode.locale
      || artifact.theme !== mode.theme
      || artifact.contrast !== mode.contrast
    ) {
      findings.push(`Manifest mode ${modeKey} does not match artifact ${mode.artifact_id}`);
    }
  }
  const expectedArtifactIds = new Set([
    ...AGENT_SCHEMAS.map((name) => `schema-${schemaKey(name)}`),
    ...(manifest.modes ?? []).map((mode) => mode.artifact_id),
  ]);
  for (const id of artifactsById.keys()) {
    if (!expectedArtifactIds.has(id)) findings.push(`Manifest artifact ${id} is not referenced by the canonical Schema or mode set`);
  }
  return findings;
}

export function validateAgentBundleSemantics({
  root = process.cwd(),
  bundleDirectory,
  channel,
  version = null,
}) {
  const findings = [];
  const repositoryDirectory = relativePath(root, bundleDirectory);
  let manifest;
  let manifestBytes;
  let manifestSchema;
  let snapshotSchema;
  try {
    manifestBytes = fs.readFileSync(resolveExistingPathWithin(bundleDirectory, "design-manifest.json"));
    manifest = JSON.parse(manifestBytes.toString("utf8"));
    manifestSchema = JSON.parse(fs.readFileSync(resolveExistingPathWithin(bundleDirectory, "schemas/manifest.schema.json"), "utf8"));
    snapshotSchema = JSON.parse(fs.readFileSync(resolveExistingPathWithin(bundleDirectory, "schemas/snapshot.schema.json"), "utf8"));
  } catch (error) {
    return [`${repositoryDirectory}: ${error.message}`];
  }
  for (const finding of validateSchemaValue(manifest, manifestSchema)) {
    findings.push(`design-manifest.json ${finding}`);
  }
  if (findings.length > 0) return findings;
  if (manifest.channel !== channel) findings.push(`design-manifest.json: channel must equal ${channel}`);
  if (channel === "versioned" && manifest.kin_version !== version) {
    findings.push(`design-manifest.json: kin_version must equal ${version}`);
  }
  for (const finding of validateAgentManifestCoordinates({
    manifest,
    repositoryDirectory,
    channel,
    version,
  })) findings.push(`design-manifest.json: ${finding}`);
  if (manifest.source?.input_set_checksum !== checksumInputEntries(manifest.source?.inputs ?? [])) {
    findings.push("design-manifest.json: source input_set_checksum does not match its ordered input list");
  }
  if (manifest.features?.component_recipes === "unavailable" && fs.existsSync(path.join(bundleDirectory, "component-recipes.json"))) {
    findings.push("component-recipes.json must be absent while the feature is unavailable");
  }
  const localeIds = (manifest.locales ?? []).map((locale) => locale.id);
  if (new Set(localeIds).size !== localeIds.length) findings.push("design-manifest.json: locale IDs must be unique");
  const allLocalesReviewed = (manifest.locales ?? []).every(
    (locale) => locale.complete === true && locale.review?.status === "reviewed",
  );
  if (
    (manifest.publication?.state === "published-development" || channel === "versioned")
    && !allLocalesReviewed
  ) {
    findings.push("design-manifest.json: public or versioned distribution requires complete reviewed locales");
  }
  if (manifest.publication?.state === "repository-only" && allLocalesReviewed) {
    findings.push("design-manifest.json: repository-only state must reflect an incomplete or stale locale review");
  }

  const expectedFiles = ["design-manifest.json", ...(manifest.artifacts ?? []).map((artifact) => artifact.bundle_path)]
    .sort(compareCodePoints);
  let actualFiles = [];
  try {
    actualFiles = listArtifactFiles(bundleDirectory, { governedRoot: root }).sort(compareCodePoints);
  } catch (error) {
    findings.push(`${repositoryDirectory}: ${error.message}`);
  }
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    findings.push("design-manifest.json: bundle file list differs from the Manifest allowlist");
  }

  for (const artifact of manifest.artifacts ?? []) {
    let bytes;
    try {
      bytes = fs.readFileSync(resolveExistingPathWithin(bundleDirectory, artifact.bundle_path));
    } catch (error) {
      findings.push(`${artifact.bundle_path}: ${error.message}`);
      continue;
    }
    if (sha256ExactBytes(bytes) !== artifact.sha256) findings.push(`${artifact.bundle_path}: checksum differs from the Manifest`);
    findings.push(...scanGeneratedArtifact(artifact.bundle_path, bytes));
    if (artifact.kind === "json-schema") {
      try {
        const schema = JSON.parse(bytes.toString("utf8"));
        if (schema.$id !== artifact.public_url) findings.push(`${artifact.bundle_path}: Schema $id differs from its public_url`);
      } catch (error) {
        findings.push(`${artifact.bundle_path}: invalid JSON Schema: ${error.message}`);
      }
      continue;
    }
    if (artifact.kind !== "agent-markdown") continue;
    try {
      const metadata = parseFrontmatter(bytes.toString("utf8"));
      for (const finding of validateSchemaValue(metadata, snapshotSchema)) {
        findings.push(`${artifact.bundle_path} ${finding}`);
      }
      if (
        metadata.channel !== manifest.channel
        || metadata.kin_version !== manifest.kin_version
        || metadata.release_status !== manifest.release_status
        || metadata.latest_stable_contract !== manifest.latest_stable_contract
        || JSON.stringify(metadata.publication) !== JSON.stringify(manifest.publication)
      ) {
        findings.push(`${artifact.bundle_path}: lifecycle metadata differs from the Manifest`);
      }
      if (
        metadata.source?.checksum !== manifest.source?.checksum
        || metadata.source?.input_set_checksum !== manifest.source?.input_set_checksum
        || metadata.source?.ref !== manifest.source?.ref
        || metadata.source?.revision_status !== manifest.source?.revision_status
      ) {
        findings.push(`${artifact.bundle_path}: source identity differs from the Manifest`);
      }
      if (
        metadata.locale !== artifact.locale
        || metadata.theme !== artifact.theme
        || metadata.contrast !== artifact.contrast
      ) {
        findings.push(`${artifact.bundle_path}: mode metadata differs from the Manifest artifact`);
      }
      const manifestLocale = (manifest.locales ?? []).find((locale) => locale.id === metadata.locale);
      if (!manifestLocale || JSON.stringify(metadata.locale_review) !== JSON.stringify(manifestLocale.review)) {
        findings.push(`${artifact.bundle_path}: locale review metadata differs from the Manifest`);
      }
      if (metadata.schema_locator !== "schemas/snapshot.schema.json") {
        findings.push(`${artifact.bundle_path}: schema_locator must resolve within its bundle`);
      }
      if (metadata.manifest_locator !== "design-manifest.json") {
        findings.push(`${artifact.bundle_path}: manifest_locator must resolve within its bundle`);
      }
    } catch (error) {
      findings.push(`${artifact.bundle_path}: invalid frontmatter: ${error.message}`);
    }
  }
  return findings;
}

export function validateAgentDistribution({
  root = process.cwd(),
  bundleDirectory = path.join(root, "generated", "agent", "next"),
  channel = "next",
  version = null,
  validateRegistry = false,
  repositoryDirectory = channel === "next"
    ? "generated/agent/next"
    : `generated/agent/versions/v${version}`,
} = {}) {
  const findings = [];
  let expected;
  try {
    expected = buildAgentDistribution(root, { channel, version });
  } catch (error) {
    return [`inputs: ${error.message}`];
  }

  findings.push(...compareArtifactTree(bundleDirectory, expected.artifacts, { governedRoot: root }));
  if (!fs.existsSync(path.join(bundleDirectory, "design-manifest.json"))) return findings;

  let manifestPath;
  try {
    manifestPath = resolveExistingPathWithin(bundleDirectory, "design-manifest.json");
  } catch (error) {
    findings.push(`design-manifest.json: ${error.message}`);
    return findings;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    findings.push(`design-manifest.json: invalid JSON: ${error.message}`);
    return findings;
  }

  const manifestSchemaFindings = validateSchemaValue(manifest, expected.context.schemas["manifest.schema.json"]);
  for (const finding of manifestSchemaFindings) findings.push(`design-manifest.json ${finding}`);
  if (manifestSchemaFindings.length > 0) return findings;
  if (manifest.channel !== channel) findings.push(`design-manifest.json: channel must equal ${channel}`);
  for (const finding of validateAgentManifestCoordinates({
    manifest,
    repositoryDirectory,
    channel,
    version,
  })) findings.push(`design-manifest.json: ${finding}`);
  if (channel === "next") {
    const publicationIsHonest = (
      manifest.publication?.state === "published-development"
      && manifest.publication?.published === true
    ) || (
      manifest.publication?.state === "repository-only"
      && manifest.publication?.published === false
    );
    if (!publicationIsHonest || manifest.source?.ref !== "main" || manifest.source?.revision_status !== "mutable") {
      findings.push("design-manifest.json: next must report its reviewed publication state and mutable main identity");
    }
  } else if (
    manifest.publication?.state !== "registry-controlled"
    || Object.hasOwn(manifest.publication ?? {}, "published")
    || manifest.source?.ref !== `v${version}`
    || manifest.source?.revision_status !== "immutable"
  ) {
    findings.push(`design-manifest.json: versioned v${version} must use Registry-controlled immutable Tag identity`);
  }
  if (manifest.source?.input_set_checksum !== checksumInputEntries(manifest.source?.inputs ?? [])) findings.push("design-manifest.json: source input_set_checksum does not match its ordered input list");
  if ((manifest.artifacts ?? []).some((artifact) => artifact.bundle_path === "design-manifest.json")) findings.push("design-manifest.json: manifest must not contain its own checksum record");
  if (manifest.features?.component_recipes === "unavailable" && fs.existsSync(path.join(bundleDirectory, "component-recipes.json"))) findings.push("component-recipes.json must be absent while the feature is unavailable");
  for (const name of ["components", "pages", "integrations"]) {
    const catalog = manifest.catalogs?.[name];
    if (!catalog) continue;
    const count = Object.values(catalog.status_counts ?? {}).reduce((total, value) => total + value, 0);
    if (count !== catalog.entry_count) findings.push(`design-manifest.json: ${name} status counts do not equal entry_count`);
    const input = manifest.source?.inputs?.find((item) => item.path === `${name}/catalog.json`);
    if (!input || catalog.source_sha256 !== input.sha256) findings.push(`design-manifest.json: ${name} source_sha256 does not match the registered input`);
  }

  for (const artifact of manifest.artifacts ?? []) {
    const lexical = path.resolve(bundleDirectory, ...artifact.bundle_path.split("/"));
    if (!fs.existsSync(lexical)) continue;
    let absolute;
    let bytes;
    try {
      absolute = resolveExistingPathWithin(bundleDirectory, artifact.bundle_path);
      bytes = fs.readFileSync(absolute);
    } catch (error) {
      findings.push(`${artifact.bundle_path}: ${error.message}`);
      continue;
    }
    const checksum = sha256ExactBytes(bytes);
    if (checksum !== artifact.sha256) findings.push(`${artifact.bundle_path}: checksum differs from manifest`);
    findings.push(...scanGeneratedArtifact(artifact.bundle_path, bytes));
  }

  const snapshots = [];
  for (const artifact of manifest.artifacts?.filter((item) => item.kind === "agent-markdown") ?? []) {
    const lexical = path.resolve(bundleDirectory, ...artifact.bundle_path.split("/"));
    if (!fs.existsSync(lexical)) continue;
    let absolute;
    try {
      absolute = resolveExistingPathWithin(bundleDirectory, artifact.bundle_path);
    } catch {
      continue;
    }
    try {
      const metadata = parseFrontmatter(fs.readFileSync(absolute, "utf8"));
      snapshots.push({ artifact, metadata });
      for (const finding of validateSchemaValue(metadata, expected.context.schemas["snapshot.schema.json"])) findings.push(`${artifact.bundle_path} ${finding}`);
      if (metadata.locale !== artifact.locale || metadata.theme !== artifact.theme || metadata.contrast !== artifact.contrast) findings.push(`${artifact.bundle_path}: mode metadata differs from manifest`);
      if (
        metadata.channel !== manifest.channel
        || metadata.kin_version !== manifest.kin_version
        || metadata.release_status !== manifest.release_status
        || metadata.latest_stable_contract !== manifest.latest_stable_contract
        || JSON.stringify(metadata.publication) !== JSON.stringify(manifest.publication)
      ) {
        findings.push(`${artifact.bundle_path}: lifecycle metadata differs from the Manifest`);
      }
      if (
        metadata.source?.checksum !== manifest.source?.checksum
        || metadata.source?.input_set_checksum !== manifest.source?.input_set_checksum
        || metadata.source?.ref !== manifest.source?.ref
        || metadata.source?.revision_status !== manifest.source?.revision_status
      ) {
        findings.push(`${artifact.bundle_path}: source identity differs from the Manifest`);
      }
      if (JSON.stringify(Object.keys(metadata.colors)) !== JSON.stringify(THEME_KEYS)) findings.push(`${artifact.bundle_path}: resolved color keys differ from the public allowlist`);
      if (Object.keys(metadata.colors).some((key) => /^(?:dark|light|contrast)-/.test(key))) findings.push(`${artifact.bundle_path}: resolved colors leak a theme prefix`);
    } catch (error) {
      findings.push(`${artifact.bundle_path}: invalid frontmatter: ${error.message}`);
    }
  }

  const modeKeys = new Set(snapshots.map(({ metadata }) => JSON.stringify(Object.keys(metadata.colors))));
  if (snapshots.length > 0 && modeKeys.size !== 1) findings.push("snapshots: theme modes do not expose one color key set");
  const sharedTokenShapes = new Set(snapshots.map(({ metadata }) => JSON.stringify({
    typography: Object.keys(metadata.typography),
    spacing: Object.keys(metadata.spacing),
    rounded: Object.keys(metadata.rounded),
    motion: Object.keys(metadata.motion),
  })));
  if (snapshots.length > 0 && sharedTokenShapes.size !== 1) findings.push("snapshots: non-color Token key sets differ across modes or locales");

  const expectedModes = expected.context.locales.flatMap((locale) => THEME_MODES.map((mode) => `${locale.id}|${mode.theme}|${mode.contrast}`)).sort();
  const manifestModes = (manifest.modes ?? []).map((mode) => `${mode.locale}|${mode.theme}|${mode.contrast}`).sort();
  const snapshotModes = snapshots.map(({ metadata }) => `${metadata.locale}|${metadata.theme}|${metadata.contrast}`).sort();
  if (JSON.stringify(manifestModes) !== JSON.stringify(expectedModes)) findings.push("design-manifest.json: modes must be the unique locale × theme × contrast cross-product");
  if (JSON.stringify(snapshotModes) !== JSON.stringify(expectedModes)) findings.push("snapshots: files must be the unique locale × theme × contrast cross-product");
  const expectedLocales = expected.context.locales.map((locale) => locale.id).sort();
  const manifestLocales = (manifest.locales ?? []).map((locale) => locale.id).sort();
  if (JSON.stringify(manifestLocales) !== JSON.stringify(expectedLocales)) findings.push("design-manifest.json: locales must contain each required locale exactly once");
  for (const locale of expected.context.locales) {
    const review = expected.context.localeReviews.get(locale.id);
    const expectedLocale = {
      id: locale.id,
      complete: review.complete,
      review: {
        status: review.status,
        reviewers: review.reviewers,
        normative_source_checksum: review.normative_source_checksum,
        localized_content_checksum: review.localized_content_checksum,
      },
    };
    const actualLocale = (manifest.locales ?? []).find((candidate) => candidate.id === locale.id);
    if (JSON.stringify(actualLocale) !== JSON.stringify(expectedLocale)) {
      findings.push(`design-manifest.json: ${locale.id} locale review differs from the governed review state`);
    }
  }
  const allLocalesReviewed = (manifest.locales ?? []).every(
    (locale) => locale.complete === true && locale.review?.status === "reviewed",
  );
  if (
    (manifest.publication?.state === "published-development" || channel === "versioned")
    && !allLocalesReviewed
  ) {
    findings.push("design-manifest.json: public or versioned distribution requires complete reviewed locales");
  }
  if (manifest.publication?.state === "repository-only" && allLocalesReviewed) {
    findings.push("design-manifest.json: repository-only state must reflect an incomplete or stale locale review");
  }

  for (const { artifact, metadata } of snapshots) {
    const manifestLocale = (manifest.locales ?? []).find((locale) => locale.id === metadata.locale);
    if (!manifestLocale || JSON.stringify(metadata.locale_review) !== JSON.stringify(manifestLocale.review)) {
      findings.push(`${artifact.bundle_path}: locale review metadata differs from the Manifest`);
    }
    if (metadata.schema_locator !== "schemas/snapshot.schema.json") {
      findings.push(`${artifact.bundle_path}: schema_locator must resolve within its bundle`);
    }
    if (metadata.manifest_locator !== "design-manifest.json") {
      findings.push(`${artifact.bundle_path}: manifest_locator must resolve within its bundle`);
    }
  }

  const snapshotByMode = new Map(snapshots.map(({ metadata }) => [`${metadata.locale}|${metadata.theme}|${metadata.contrast}`, metadata]));
  for (const locale of expected.context.locales) {
    for (const theme of ["light", "dark"]) {
      const base = snapshotByMode.get(`${locale.id}|${theme}|normal`);
      const contrast = snapshotByMode.get(`${locale.id}|${theme}|more`);
      if (!base || !contrast) continue;
      for (const key of THEME_KEYS) {
        const baseToken = expected.context.tokens.color[`${theme}-${key}`]?.$value?.hex?.toLowerCase();
        const override = expected.context.tokens.color[`contrast-${theme}-${key}`]?.$value?.hex?.toLowerCase();
        if (base.colors[key] !== baseToken) findings.push(`${locale.id}/${theme}: ${key} does not match its base Token`);
        if (contrast.colors[key] !== (override ?? baseToken)) findings.push(`${locale.id}/${theme}/more: ${key} is not the base theme plus reviewed contrast overrides`);
      }
    }
  }

  const serialized = fs.readFileSync(manifestPath, "utf8");
  findings.push(...scanGeneratedArtifact("design-manifest.json", serialized));
  if (/[A-Za-z]:\\|file:\/\//.test(serialized)) findings.push("design-manifest.json: local absolute path leaked into generated output");

  if (validateRegistry) findings.push(...validateAgentVersionRegistry({ root }));
  return findings;
}

function parseArguments(args) {
  let bundle = null;
  let json = false;
  let history = false;
  let channel = "next";
  let version = null;
  let detached = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--json") json = true;
    else if (argument === "--history") history = true;
    else if (argument === "--bundle" && args[index + 1]) bundle = args[++index];
    else if (argument === "--channel" && args[index + 1]) channel = args[++index];
    else if (argument === "--version" && args[index + 1]) version = args[++index];
    else if (argument === "--detached") detached = true;
    else throw new Error("Usage: node scripts/validate-agent-distribution.mjs [--bundle <path>] [--channel next|versioned] [--version X.Y.Z] [--detached] [--history] [--json]");
  }
  if (history && bundle !== null) throw new Error("--history cannot be combined with --bundle");
  if (detached && (history || bundle === null)) throw new Error("--detached requires --bundle and cannot be combined with --history");
  if (channel === "versioned" && version === null) throw new Error("--channel versioned requires --version X.Y.Z");
  if (channel === "next" && version !== null && !history) throw new Error("--version requires --channel versioned or --history");
  if (!new Set(["next", "versioned"]).has(channel)) throw new Error("--channel must be next or versioned");
  return { bundle, json, history, channel, version, detached };
}

function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  const root = process.cwd();
  const bundleDirectory = options.bundle
    ? path.resolve(root, options.bundle)
    : options.channel === "versioned"
      ? path.join(root, "generated", "agent", "versions", `v${options.version}`)
      : path.join(root, "generated", "agent", "next");
  const findings = options.history
    ? validateAgentHistory({ root, version: options.version })
    : options.detached
      ? validateAgentBundleSemantics({
        root,
        bundleDirectory,
        channel: options.channel,
        version: options.version,
      })
    : validateAgentDistribution({
      root,
      bundleDirectory,
      channel: options.channel,
      version: options.version,
      validateRegistry: options.bundle === null && options.channel === "next",
    });
  const label = options.history ? `history${options.version ? ` v${options.version}` : ""}` : relativePath(root, bundleDirectory);
  if (options.json) console.log(JSON.stringify({ ok: findings.length === 0, bundle: label, findings }, null, 2));
  else if (findings.length > 0) {
    console.error(`Agent distribution validation failed (${findings.length}):`);
    for (const finding of findings) console.error(`- ${finding}`);
  } else console.log(`Agent distribution validation passed: ${label}`);
  if (findings.length > 0) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
