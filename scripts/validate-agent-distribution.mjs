import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { buildAgentDistribution } from "./lib/agent-distribution.mjs";
import { compareArtifactTree } from "./lib/generated-tree.mjs";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { checksumInputEntries } from "./lib/input-registry.mjs";
import { validateSchemaValue } from "./lib/schema-validator.mjs";
import { sha256ExactBytes } from "./lib/canonical-content.mjs";
import { resolveExistingPathWithin } from "./lib/safe-path.mjs";
import { scanGeneratedArtifact } from "./lib/safe-generated-content.mjs";
import { THEME_KEYS, THEME_MODES } from "./lib/theme-tokens.mjs";

function relativePath(root, target) {
  return path.relative(root, target).replaceAll("\\", "/") || ".";
}

export function validateAgentDistribution({ root = process.cwd(), bundleDirectory = path.join(root, "generated", "agent", "next") } = {}) {
  const findings = [];
  let expected;
  try {
    expected = buildAgentDistribution(root);
  } catch (error) {
    return [`inputs: ${error.message}`];
  }

  findings.push(...compareArtifactTree(bundleDirectory, expected.artifacts));
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
    try {
      absolute = resolveExistingPathWithin(bundleDirectory, artifact.bundle_path);
    } catch (error) {
      findings.push(`${artifact.bundle_path}: ${error.message}`);
      continue;
    }
    const checksum = sha256ExactBytes(fs.readFileSync(absolute));
    if (checksum !== artifact.sha256) findings.push(`${artifact.bundle_path}: checksum differs from manifest`);
    findings.push(...scanGeneratedArtifact(artifact.bundle_path, fs.readFileSync(absolute)));
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

  return findings;
}

function parseArguments(args) {
  let bundle = null;
  let json = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--json") json = true;
    else if (argument === "--bundle" && args[index + 1]) bundle = args[++index];
    else throw new Error("Usage: node scripts/validate-agent-distribution.mjs [--bundle <path>] [--json]");
  }
  return { bundle, json };
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
  const bundleDirectory = options.bundle ? path.resolve(root, options.bundle) : path.join(root, "generated", "agent", "next");
  const findings = validateAgentDistribution({ root, bundleDirectory });
  if (options.json) console.log(JSON.stringify({ ok: findings.length === 0, bundle: relativePath(root, bundleDirectory), findings }, null, 2));
  else if (findings.length > 0) {
    console.error(`Agent distribution validation failed (${findings.length}):`);
    for (const finding of findings) console.error(`- ${finding}`);
  } else console.log(`Agent distribution validation passed: ${relativePath(root, bundleDirectory)}`);
  if (findings.length > 0) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
