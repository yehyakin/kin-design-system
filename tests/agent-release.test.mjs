import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildAgentDistribution } from "../scripts/lib/agent-distribution.mjs";
import {
  applyAgentRegistryRollback,
  applyAgentSupportUpdate,
  agentVersionEntry,
  assertAgentRegistryMutationFresh,
  compareAgentVersions,
  createAgentArchive,
  createEmptyAgentRegistry,
  promotionEligibilityFindings,
  promotionDiffFindings,
  readAgentVersionRegistry,
  readAgentVersionRegistryBytes,
  registryLifecycleTransitionFindings,
  validateAgentHistory,
  validateAgentVersionRegistry,
  writeAgentVersionRegistry,
} from "../scripts/lib/agent-release.mjs";
import {
  buildAgentPages,
  expectedAgentResponses,
  responsePathsThatMustBeAbsent,
  validateAgentSiteOutput,
} from "../scripts/lib/agent-pages.mjs";
import { inspectAgentResponses } from "../scripts/lib/agent-response-verification.mjs";
import {
  collectAgentPublicationFindings,
  collectAgentRemoteReleaseEvidenceFindings,
} from "../scripts/lib/agent-publication.mjs";
import {
  SITE_COPY_ARTIFACTS,
  SITE_GENERATED_ARTIFACTS,
  validateSiteOutputAllowlist,
} from "../scripts/lib/site-artifacts.mjs";
import { replaceDirectorySafely, writeArtifactTree } from "../scripts/lib/generated-tree.mjs";
import { validateSchemaValue } from "../scripts/lib/schema-validator.mjs";
import {
  validateAgentBundleSemantics,
  validateAgentManifestCoordinates,
} from "../scripts/validate-agent-distribution.mjs";

const root = path.resolve(import.meta.dirname, "..");

function git(directory, args) {
  const result = spawnSync("git", args, { cwd: directory, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

function createReleaseFixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "kin-agent-release-"));
  fs.cpSync(root, directory, {
    recursive: true,
    filter: (source) => {
      const relative = path.relative(root, source);
      return !relative.startsWith(".git") && !relative.startsWith("node_modules") && !relative.startsWith(".site-dist");
    },
  });
  const designPath = path.join(directory, "DESIGN.md");
  const design = fs.readFileSync(designPath, "utf8")
    .replace("release_status: development", "release_status: released")
    .replace("latest_stable: 2.3.0", "latest_stable: 3.0.0");
  fs.writeFileSync(designPath, design);

  const next = buildAgentDistribution(directory);
  const nextTemporary = path.join(directory, "generated", "agent", "next-test");
  writeArtifactTree(nextTemporary, next.artifacts);
  replaceDirectorySafely(path.join(directory, "generated", "agent", "next"), nextTemporary);

  const released = buildAgentDistribution(directory, { channel: "versioned", version: "3.0.0" });
  createAgentArchive({ root: directory, version: "3.0.0", artifacts: released.artifacts });
  const registry = createEmptyAgentRegistry();
  registry.versions.push(agentVersionEntry({ version: "3.0.0", manifest: released.manifest }));
  writeAgentVersionRegistry(directory, registry);
  return { directory, registry, released };
}

function registryEntry(version, {
  publicationState = "released",
  supportStatus = "supported",
  replacement = null,
} = {}) {
  return {
    version,
    publication_state: publicationState,
    support_status: publicationState === "staged" ? null : supportStatus,
    repository_directory: `generated/agent/versions/v${version}`,
    manifest_url: publicationState === "staged"
      ? null
      : `https://yehyakin.github.io/kin-design-system/versions/v${version}/design-manifest.json`,
    manifest_sha256: version.padEnd(64, "a").slice(0, 64).replaceAll(".", "a"),
    kin_tag: `v${version}`,
    design_checksum: version.padEnd(64, "b").slice(0, 64).replaceAll(".", "b"),
    input_set_checksum: version.padEnd(64, "c").slice(0, 64).replaceAll(".", "c"),
    replacement: publicationState === "staged" ? null : replacement,
    advisory_url: null,
  };
}

function lifecycleRegistry(entries, latest, schemaVersion = latest) {
  return {
    ...createEmptyAgentRegistry(),
    $schema: schemaVersion === null
      ? "https://yehyakin.github.io/kin-design-system/next/schemas/versions.schema.json"
      : `https://yehyakin.github.io/kin-design-system/versions/v${schemaVersion}/schemas/versions.schema.json`,
    versions: entries,
    latest_agent_distribution: latest,
  };
}

function markLocalesUnreviewed(directory) {
  for (const locale of ["en", "zh-CN"]) {
    const file = path.join(directory, "distribution", "locales", `${locale}.json`);
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const record of value.rules) {
      record.review = {
        status: "unreviewed",
        reviewers: [],
        normative_source_checksum: null,
        localized_content_checksum: null,
      };
    }
    fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  }
}

function rebuildNext(directory) {
  const next = buildAgentDistribution(directory);
  const temporary = path.join(directory, "generated", "agent", `next-test-${Date.now()}`);
  writeArtifactTree(temporary, next.artifacts);
  replaceDirectorySafely(path.join(directory, "generated", "agent", "next"), temporary);
  return next;
}

test("Version Registry Schema and handwritten invariants agree", () => {
  const schema = JSON.parse(fs.readFileSync(path.join(root, "distribution", "schemas", "versions.schema.json"), "utf8"));
  const empty = createEmptyAgentRegistry();
  assert.deepEqual(validateSchemaValue(empty, schema), []);
  assert.deepEqual(validateAgentVersionRegistry({ root, registry: empty }), []);

  const stagedLatest = structuredClone(empty);
  stagedLatest.latest_agent_distribution = "3.0.0";
  stagedLatest.versions = [{
    version: "3.0.0",
    publication_state: "staged",
    support_status: "supported",
    repository_directory: "generated/agent/versions/v3.0.0",
    manifest_url: "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/design-manifest.json",
    manifest_sha256: "a".repeat(64),
    kin_tag: "v3.0.0",
    design_checksum: "b".repeat(64),
    input_set_checksum: "c".repeat(64),
    replacement: null,
    advisory_url: null,
  }];
  assert.ok(validateSchemaValue(stagedLatest, schema).some((finding) => finding.includes("oneOf")));

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "kin-agent-unregistered-"));
  fs.mkdirSync(path.join(directory, "generated", "agent", "versions", "v9.9.9"), { recursive: true });
  fs.mkdirSync(path.join(directory, "distribution", "schemas"), { recursive: true });
  fs.copyFileSync(path.join(root, "distribution", "schemas", "versions.schema.json"), path.join(directory, "distribution", "schemas", "versions.schema.json"));
  assert.ok(validateAgentVersionRegistry({ root: directory, registry: empty }).some((finding) => finding.includes("archive is not registered")));
});

test("Registry reads reject leaked secrets, duplicate-key hiding, and noncanonical bytes", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "kin-agent-registry-bytes-"));
  const target = path.join(directory, "generated", "agent", "versions.json");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const canonical = `${JSON.stringify(createEmptyAgentRegistry(), null, 2)}\n`;
  fs.writeFileSync(target, `{"$schema":"ghp_${"a".repeat(20)}",${canonical.slice(1)}`);
  assert.throws(() => readAgentVersionRegistry(directory), /secret-like content/u);
  fs.writeFileSync(target, JSON.stringify(createEmptyAgentRegistry()));
  assert.throws(() => readAgentVersionRegistry(directory), /canonical generated JSON bytes/u);
});

test("Registry mutation freshness rejects stale HEAD, bytes, worktree, and remote main", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "kin-agent-cas-"));
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), "kin-agent-cas-remote-"));
  git(directory, ["init", "--quiet"]);
  git(directory, ["config", "user.name", "KIN Test"]);
  git(directory, ["config", "user.email", "kin-test@example.invalid"]);
  git(directory, ["branch", "-M", "main"]);
  writeAgentVersionRegistry(directory, createEmptyAgentRegistry());
  git(directory, ["add", "generated/agent/versions.json"]);
  git(directory, ["commit", "--quiet", "-m", "initial Registry"]);
  git(remote, ["init", "--quiet", "--bare"]);
  git(directory, ["remote", "add", "origin", remote]);
  git(directory, ["push", "--quiet", "-u", "origin", "main"]);

  const headCommit = git(directory, ["rev-parse", "HEAD"]);
  const registryBytes = readAgentVersionRegistryBytes(directory);
  assert.doesNotThrow(() => assertAgentRegistryMutationFresh({ root: directory, headCommit, registryBytes }));
  assert.throws(
    () => assertAgentRegistryMutationFresh({ root: directory, headCommit: "0".repeat(40), registryBytes }),
    /local HEAD changed/u,
  );
  assert.throws(
    () => assertAgentRegistryMutationFresh({ root: directory, headCommit, registryBytes: Buffer.from("{}\n") }),
    /versions\.json changed/u,
  );

  const dirtyFile = path.join(directory, "dirty.txt");
  fs.writeFileSync(dirtyFile, "dirty\n");
  assert.throws(
    () => assertAgentRegistryMutationFresh({ root: directory, headCommit, registryBytes }),
    /working tree changed/u,
  );
  fs.rmSync(dirtyFile);

  const other = fs.mkdtempSync(path.join(os.tmpdir(), "kin-agent-cas-other-"));
  git(other, ["clone", "--quiet", "--branch", "main", remote, "."]);
  git(other, ["config", "user.name", "KIN Test"]);
  git(other, ["config", "user.email", "kin-test@example.invalid"]);
  fs.writeFileSync(path.join(other, "remote-change.txt"), "remote\n");
  git(other, ["add", "remote-change.txt"]);
  git(other, ["commit", "--quiet", "-m", "advance remote"]);
  git(other, ["push", "--quiet", "origin", "main"]);
  assert.throws(
    () => assertAgentRegistryMutationFresh({ root: directory, headCommit, registryBytes }),
    /remote main changed/u,
  );
});

test("release archives are create-once and staged content stays outside Pages", () => {
  const { directory, registry } = createReleaseFixture();
  assert.deepEqual(validateAgentVersionRegistry({ root: directory, registry }), []);
  const archive = path.join(directory, "generated", "agent", "versions", "v3.0.0");
  const before = fs.readFileSync(path.join(archive, "design-manifest.json"));
  assert.throws(
    () => createAgentArchive({ root: directory, version: "3.0.0", artifacts: new Map([["sentinel.txt", "changed\n"]]) }),
    /already exists/,
  );
  assert.ok(fs.readFileSync(path.join(archive, "design-manifest.json")).equals(before));

  const output = path.join(directory, ".agent-site");
  fs.mkdirSync(output);
  buildAgentPages({ root: directory, output });
  assert.equal(fs.existsSync(path.join(output, "next", "design.md")), true);
  assert.equal(fs.existsSync(path.join(output, "versions.json")), true);
  assert.equal(fs.existsSync(path.join(output, "versions", "v3.0.0")), false);
  assert.equal(fs.existsSync(path.join(output, "design.md")), false);
  assert.deepEqual(validateAgentSiteOutput({ root: directory, output }), []);
});

test("promotion publishes immutable bytes and a small stable resolver", () => {
  const { directory, registry } = createReleaseFixture();
  const entry = registry.versions[0];
  entry.publication_state = "released";
  entry.support_status = "supported";
  entry.manifest_url = "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/design-manifest.json";
  registry.latest_agent_distribution = "3.0.0";
  registry.$schema = "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/schemas/versions.schema.json";
  writeAgentVersionRegistry(directory, registry);
  assert.deepEqual(validateAgentVersionRegistry({ root: directory, registry }), []);

  const output = path.join(directory, ".agent-site");
  fs.mkdirSync(output);
  const responses = buildAgentPages({ root: directory, output });
  const archiveSnapshot = fs.readFileSync(path.join(directory, "generated", "agent", "versions", "v3.0.0", "en", "design.md"));
  assert.ok(fs.readFileSync(path.join(output, "design.md")).equals(archiveSnapshot));
  assert.ok(fs.readFileSync(path.join(output, "versions", "v3.0.0", "design.md")).equals(archiveSnapshot));
  const resolver = JSON.parse(fs.readFileSync(path.join(output, "design-manifest.json"), "utf8"));
  assert.deepEqual(Object.keys(resolver), [
    "$schema",
    "schema_version",
    "kind",
    "generated",
    "normative",
    "channel",
    "resolves_to_version",
    "target_manifest_url",
    "target_manifest_sha256",
    "registry_url",
  ]);
  assert.equal(resolver.channel, "stable-alias");
  assert.equal(resolver.resolves_to_version, "3.0.0");
  assert.equal(responses.has("en/design.md"), false);
  assert.deepEqual(validateAgentSiteOutput({ root: directory, output }), []);
  assert.deepEqual([...expectedAgentResponses(directory).responses.keys()], [...responses.keys()]);
});

test("SemVer, promotion, rollback, and support transitions reject command bypasses", () => {
  assert.equal(compareAgentVersions("999999999999999999999.0.0", "2.0.0"), 1);
  assert.equal(compareAgentVersions("1.100000000000000000001.0", "1.2.0"), 1);

  const preReleasePrevious = {
    ...lifecycleRegistry([registryEntry("1.0.0", { publicationState: "staged" })], null, null),
    schema_version: "1.0.0",
  };
  const preReleaseRefresh = { ...structuredClone(preReleasePrevious), schema_version: "2.0.0" };
  assert.deepEqual(registryLifecycleTransitionFindings(preReleasePrevious, preReleaseRefresh), []);
  const refreshWithStaging = structuredClone(preReleaseRefresh);
  refreshWithStaging.versions.push(registryEntry("2.0.0", { publicationState: "staged" }));
  assert.ok(registryLifecycleTransitionFindings(preReleasePrevious, refreshWithStaging).some((finding) => finding.includes("Schema coordinates")));

  const previous = lifecycleRegistry([
    registryEntry("2.0.0"),
    registryEntry("3.0.0", { publicationState: "staged" }),
  ], "2.0.0", "2.0.0");
  assert.deepEqual(promotionEligibilityFindings(previous, "3.0.0"), []);

  const promoted = structuredClone(previous);
  promoted.versions[1].publication_state = "released";
  promoted.versions[1].support_status = "supported";
  promoted.versions[1].manifest_url = "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/design-manifest.json";
  promoted.latest_agent_distribution = "3.0.0";
  promoted.$schema = "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/schemas/versions.schema.json";
  assert.deepEqual(registryLifecycleTransitionFindings(previous, promoted), []);
  const promotedWithStaging = structuredClone(promoted);
  promotedWithStaging.versions.push(registryEntry("4.0.0", { publicationState: "staged" }));
  assert.ok(registryLifecycleTransitionFindings(previous, promotedWithStaging).some((finding) => finding.includes("must not add staged")));

  const stalePromotion = lifecycleRegistry([
    registryEntry("2.0.0"),
    registryEntry("1.9.0", { publicationState: "staged" }),
  ], "2.0.0", "2.0.0");
  assert.ok(promotionEligibilityFindings(stalePromotion, "1.9.0").some((finding) => finding.includes("advance beyond")));
  const forced = structuredClone(stalePromotion);
  forced.versions[1].publication_state = "released";
  forced.versions[1].support_status = "supported";
  forced.versions[1].manifest_url = "https://yehyakin.github.io/kin-design-system/versions/v1.9.0/design-manifest.json";
  forced.latest_agent_distribution = "1.9.0";
  forced.$schema = "https://yehyakin.github.io/kin-design-system/versions/v1.9.0/schemas/versions.schema.json";
  assert.ok(registryLifecycleTransitionFindings(stalePromotion, forced).some((finding) => finding.includes("advance beyond")));

  const rollback = applyAgentRegistryRollback(promoted, {
    fromVersion: "3.0.0",
    toVersion: "2.0.0",
    supportStatus: "superseded",
    advisoryUrl: "https://github.com/yehyakin/kin-design-system/security/advisories/example",
  });
  assert.equal(rollback.latest_agent_distribution, "2.0.0");
  assert.equal(rollback.versions[1].replacement, "2.0.0");
  assert.deepEqual(registryLifecycleTransitionFindings(promoted, rollback), []);

  const bypass = structuredClone(promoted);
  bypass.latest_agent_distribution = "2.0.0";
  assert.ok(registryLifecycleTransitionFindings(promoted, bypass).some((finding) => finding.includes("retire")));
  assert.throws(
    () => applyAgentRegistryRollback(promoted, {
      fromVersion: "3.0.0",
      toVersion: null,
      supportStatus: "superseded",
    }),
    /requires a supported replacement/u,
  );
  assert.throws(
    () => applyAgentRegistryRollback(promoted, {
      fromVersion: "3.0.0",
      toVersion: null,
      supportStatus: "unsupported",
      advisoryUrl: "https://user:secret@example.com/advisory",
    }),
    /must not contain credentials/u,
  );

  const support = applyAgentSupportUpdate(rollback, {
    version: "3.0.0",
    supportStatus: "unsupported",
    advisoryUrl: "https://github.com/yehyakin/kin-design-system/security/advisories/example",
  });
  assert.equal(support.versions[1].replacement, null);
  assert.deepEqual(registryLifecycleTransitionFindings(rollback, support), []);
  assert.throws(
    () => applyAgentSupportUpdate(rollback, {
      version: "2.0.0",
      supportStatus: "unsupported",
    }),
    /current stable/u,
  );
  assert.throws(
    () => applyAgentSupportUpdate(rollback, {
      version: "3.0.0",
      supportStatus: "unsupported",
      advisoryUrl: "https://example.com/advisory?access_token=secret",
    }),
    /must not contain query parameters/u,
  );
  assert.throws(
    () => applyAgentSupportUpdate(rollback, {
      version: "3.0.0",
      supportStatus: "supported",
      replacement: "2.0.0",
    }),
    /cannot identify a replacement/u,
  );
});

test("withheld next responses stay private while released archives remain addressable", () => {
  const { directory, registry } = createReleaseFixture();
  markLocalesUnreviewed(directory);
  rebuildNext(directory);

  const withheld = expectedAgentResponses(directory);
  assert.equal(withheld.responses.size, 0);
  const absent = responsePathsThatMustBeAbsent(directory);
  assert.ok(absent.includes("versions.json"));
  assert.ok(absent.includes("next/design-manifest.json"));
  assert.ok(absent.includes("versions/v3.0.0/design-manifest.json"));
  assert.ok(absent.includes("component-recipes.json"));

  const entry = registry.versions[0];
  entry.publication_state = "released";
  entry.support_status = "supported";
  entry.manifest_url = "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/design-manifest.json";
  registry.latest_agent_distribution = "3.0.0";
  registry.$schema = "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/schemas/versions.schema.json";
  registry.schema_version = "2.0.0";
  writeAgentVersionRegistry(directory, registry);

  const mixed = expectedAgentResponses(directory);
  assert.equal(mixed.responses.has("versions.json"), true);
  assert.equal(mixed.responses.has("next/design-manifest.json"), false);
  assert.equal(mixed.responses.has("versions/v3.0.0/design-manifest.json"), true);
  assert.equal(mixed.responses.has("design-manifest.json"), true);
  const mixedAbsent = responsePathsThatMustBeAbsent(directory);
  assert.equal(mixedAbsent.includes("versions.json"), false);
  assert.ok(mixedAbsent.includes("next/design-manifest.json"));

  const output = path.join(directory, ".agent-site");
  fs.mkdirSync(output);
  buildAgentPages({ root: directory, output });
  fs.writeFileSync(path.join(output, "component-recipes.json"), "{}\n");
  assert.ok(validateAgentSiteOutput({ root: directory, output }).some((finding) => finding.includes("component-recipes.json")));
});

test("portable Agent Schemas reject false review state and broken archive coordinates", () => {
  const { directory, released } = createReleaseFixture();
  const manifest = structuredClone(released.manifest);
  manifest.catalogs.components.raw_url = "https://raw.githubusercontent.com/yehyakin/kin-design-system/v9.9.9/components/catalog.json";
  assert.ok(validateAgentManifestCoordinates({
    manifest,
    repositoryDirectory: "generated/agent/versions/v3.0.0",
    channel: "versioned",
    version: "3.0.0",
  }).some((finding) => finding.includes("catalogs.components.raw_url")));

  const omittedSchema = structuredClone(released.manifest);
  omittedSchema.artifacts = omittedSchema.artifacts.filter((artifact) => artifact.id !== "schema-versions");
  assert.ok(validateAgentManifestCoordinates({
    manifest: omittedSchema,
    repositoryDirectory: "generated/agent/versions/v3.0.0",
    channel: "versioned",
    version: "3.0.0",
  }).some((finding) => finding.includes("schemas.versions")));

  const extraArtifact = structuredClone(released.manifest);
  extraArtifact.artifacts.push({
    ...extraArtifact.artifacts.find((artifact) => artifact.kind === "json-schema"),
    id: "schema-unreviewed-extra",
    repository_path: "generated/agent/versions/v3.0.0/schemas/unreviewed-extra.schema.json",
    bundle_path: "schemas/unreviewed-extra.schema.json",
    public_url: "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/schemas/unreviewed-extra.schema.json",
  });
  assert.ok(validateAgentManifestCoordinates({
    manifest: extraArtifact,
    repositoryDirectory: "generated/agent/versions/v3.0.0",
    channel: "versioned",
    version: "3.0.0",
  }).some((finding) => finding.includes("is not referenced")));

  const manifestSchema = JSON.parse(fs.readFileSync(
    path.join(directory, "generated", "agent", "versions", "v3.0.0", "schemas", "manifest.schema.json"),
    "utf8",
  ));
  const falseReview = structuredClone(released.manifest);
  falseReview.locales[0].review.reviewers = [];
  assert.ok(validateSchemaValue(falseReview, manifestSchema).some((finding) => finding.includes("oneOf")));

  const wrongLifecycle = structuredClone(released.manifest);
  wrongLifecycle.channel = "next";
  assert.ok(validateSchemaValue(wrongLifecycle, manifestSchema).some((finding) => finding.includes("oneOf")));
  assert.deepEqual(validateAgentBundleSemantics({
    root: directory,
    bundleDirectory: path.join(directory, "generated", "agent", "versions", "v3.0.0"),
    channel: "versioned",
    version: "3.0.0",
  }), []);
});

test("Pages uses an explicit artifact allowlist and rejects source-only files", () => {
  assert.equal(SITE_COPY_ARTIFACTS.some(([source]) => /(?:README\.md|\.jsx)$/u.test(source)), false);
  assert.equal(SITE_GENERATED_ARTIFACTS.some((file) => /(?:README\.md|\.jsx)$/u.test(file)), false);
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "kin-site-allowlist-"));
  fs.writeFileSync(path.join(output, "README.md"), "must not publish\n");
  const findings = validateSiteOutputAllowlist({ output, agentPaths: [] });
  assert.ok(findings.some((finding) => finding.includes("README.md: file is not in the explicit Pages artifact allowlist")));
});

test("deployed-response verification rejects redirects, byte drift, unsafe MIME, and published reserved paths", async () => {
  const { directory } = createReleaseFixture();
  const responses = expectedAgentResponses(directory).responses;
  const absentPaths = responsePathsThatMustBeAbsent(directory);
  const baseUrl = "https://example.test/kin-design-system/";
  const exactFetch = async (url, options) => {
    assert.equal(options.redirect, "manual");
    const publicPath = new URL(url).pathname.slice("/kin-design-system/".length);
    const expected = responses.get(publicPath);
    if (!expected) return new Response(null, { status: 404 });
    return new Response(expected.bytes, {
      status: 200,
      headers: { "content-type": expected.mediaType },
    });
  };
  assert.deepEqual(
    await inspectAgentResponses({ root: directory, baseUrl, fetchImpl: exactFetch }),
    { failures: [], limitations: [], checked: responses.size },
  );

  const markdownPaths = [...responses].filter(([, response]) => response.mediaType.startsWith("text/markdown")).map(([publicPath]) => publicPath);
  const jsonPaths = [...responses].filter(([, response]) => response.mediaType.startsWith("application/json")).map(([publicPath]) => publicPath);
  assert.ok(markdownPaths.length >= 2);
  assert.ok(jsonPaths.length >= 1);
  assert.ok(absentPaths.length >= 1);
  const redirectPath = markdownPaths[0];
  const badMimePath = markdownPaths[1];
  const wrongBytesPath = jsonPaths[0];
  const exposedReservedPath = absentPaths[0];
  const failingFetch = async (url, options) => {
    assert.equal(options.redirect, "manual");
    const publicPath = new URL(url).pathname.slice("/kin-design-system/".length);
    if (publicPath === redirectPath) {
      return new Response(null, { status: 302, headers: { location: `/kin-design-system/${wrongBytesPath}` } });
    }
    if (publicPath === exposedReservedPath) {
      return new Response("{}\n", { status: 200, headers: { "content-type": "application/json; charset=utf-8" } });
    }
    const expected = responses.get(publicPath);
    if (!expected) return new Response(null, { status: 404 });
    if (publicPath === wrongBytesPath) {
      return new Response("{\"tampered\":true}\n", { status: 200, headers: { "content-type": expected.mediaType } });
    }
    if (publicPath === badMimePath) {
      return new Response(expected.bytes, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response(expected.bytes, { status: 200, headers: { "content-type": expected.mediaType } });
  };
  const failing = await inspectAgentResponses({ root: directory, baseUrl, fetchImpl: failingFetch });
  assert.ok(failing.failures.some((finding) => finding.includes(`${redirectPath}: expected HTTP 200, received 302`)));
  assert.ok(failing.failures.some((finding) => finding.includes(`${wrongBytesPath}: response bytes differ`)));
  assert.ok(failing.failures.some((finding) => finding.includes(`${badMimePath}: expected text/markdown, received text/html`)));
  assert.ok(failing.failures.some((finding) => finding.includes(`${exposedReservedPath}: unpublished Agent path must return 404`)));

  const schemaPath = [...responses].find(([, response]) => response.mediaType.startsWith("application/schema+json"))?.[0];
  assert.ok(schemaPath);
  const genericSchemaFetch = async (url, options) => {
    assert.equal(options.redirect, "manual");
    const publicPath = new URL(url).pathname.slice("/kin-design-system/".length);
    const expected = responses.get(publicPath);
    if (!expected) return new Response(null, { status: 404 });
    return new Response(expected.bytes, {
      status: 200,
      headers: {
        "content-type": publicPath === schemaPath
          ? "application/json; charset=utf-8"
          : expected.mediaType,
      },
    });
  };
  const schemaLimitation = await inspectAgentResponses({ root: directory, baseUrl, fetchImpl: genericSchemaFetch });
  assert.deepEqual(schemaLimitation.failures, []);
  assert.ok(schemaLimitation.limitations.some((finding) => finding.includes(`${schemaPath}: host returned application/json`)));
});

test("full-history validation binds the archive to its annotated Tag and publication evidence", async () => {
  const { directory, registry } = createReleaseFixture();
  git(directory, ["init", "--quiet"]);
  git(directory, ["config", "user.name", "KIN Test"]);
  git(directory, ["config", "user.email", "kin-test@example.invalid"]);
  git(directory, ["branch", "-M", "main"]);
  git(directory, ["add", "."]);
  git(directory, ["commit", "--quiet", "-m", "stage Agent archive"]);
  const taggedCommit = git(directory, ["rev-parse", "HEAD"]);
  git(directory, ["tag", "-a", "v3.0.0", "-m", "KIN 3.0.0"]);
  const remoteTagResolver = () => ({
    object: git(directory, ["rev-parse", "refs/tags/v3.0.0"]),
    commit: taggedCommit,
  });
  assert.deepEqual(validateAgentHistory({ root: directory, version: "3.0.0" }), []);

  registry.versions[0].publication_state = "released";
  registry.versions[0].support_status = "supported";
  registry.versions[0].manifest_url = "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/design-manifest.json";
  registry.latest_agent_distribution = "3.0.0";
  registry.$schema = "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/schemas/versions.schema.json";
  writeAgentVersionRegistry(directory, registry);
  git(directory, ["add", "generated/agent/versions.json"]);
  git(directory, ["commit", "--quiet", "-m", "promote Agent archive"]);
  const promotionCommit = git(directory, ["rev-parse", "HEAD"]);
  assert.deepEqual(promotionDiffFindings({ root: directory, version: "3.0.0", tagCommit: taggedCommit, headCommit: promotionCommit }), []);
  assert.deepEqual(validateAgentHistory({ root: directory, version: "3.0.0" }), []);
  const publication = await collectAgentPublicationFindings({
    root: directory,
    repositoryResolver: () => "yehyakin/kin-design-system",
    remoteTagResolver,
    githubJson: async ({ route }) => {
      if (route.startsWith("/releases/tags/")) {
        return { tag_name: "v3.0.0", draft: false, prerelease: false };
      }
      if (route.startsWith("/actions/workflows/validate-release-tag.yml/")) {
        return {
          workflow_runs: [{
            head_sha: taggedCommit,
            head_branch: "v3.0.0",
            event: "push",
            conclusion: "success",
          }],
        };
      }
      if (route.startsWith("/actions/workflows/validate-agent-release.yml/")) {
        return {
          workflow_runs: [{
            display_title: "Validate Agent v3.0.0",
            head_sha: taggedCommit,
            event: "workflow_dispatch",
            conclusion: "success",
          }],
        };
      }
      throw new Error(`unexpected route ${route}`);
    },
  });
  assert.deepEqual(publication, []);
  const draftPublication = await collectAgentPublicationFindings({
    root: directory,
    repositoryResolver: () => "yehyakin/kin-design-system",
    remoteTagResolver,
    githubJson: async ({ route }) => route.startsWith("/releases/tags/")
      ? { tag_name: "v3.0.0", draft: true, prerelease: false }
      : { workflow_runs: [] },
  });
  assert.ok(draftPublication.some((finding) => finding.includes("final non-draft")));
  assert.ok(draftPublication.some((finding) => finding.includes("no successful")));
  assert.ok(draftPublication.some((finding) => finding.includes("read-only Validate Agent")));

  const remoteMismatch = await collectAgentPublicationFindings({
    root: directory,
    repositoryResolver: () => "yehyakin/kin-design-system",
    remoteTagResolver: () => ({ object: "0".repeat(40), commit: taggedCommit }),
    githubJson: async () => {
      throw new Error("remote evidence must not be queried after a Tag identity mismatch");
    },
  });
  assert.ok(remoteMismatch.some((finding) => finding.includes("remote Tag object and peeled commit")));

  const wrongEligibilityVersion = await collectAgentRemoteReleaseEvidenceFindings({
    root: directory,
    repository: "yehyakin/kin-design-system",
    version: "3.0.0",
    tagName: "v3.0.0",
    tagCommit: taggedCommit,
    githubJson: async ({ route }) => {
      if (route.startsWith("/releases/tags/")) return { tag_name: "v3.0.0", draft: false, prerelease: false };
      if (route.startsWith("/actions/workflows/validate-release-tag.yml/")) {
        return { workflow_runs: [{ head_sha: taggedCommit, head_branch: "v3.0.0", event: "push", conclusion: "success" }] };
      }
      return {
        workflow_runs: [{
          display_title: "Validate Agent v9.9.9",
          head_sha: taggedCommit,
          event: "workflow_dispatch",
          conclusion: "success",
        }],
      };
    },
    eligibilityHeadCommit: taggedCommit,
  });
  assert.ok(wrongEligibilityVersion.some((finding) => finding.includes("read-only Validate Agent v3.0.0")));

  registry.latest_agent_distribution = null;
  writeAgentVersionRegistry(directory, registry);
  git(directory, ["add", "generated/agent/versions.json"]);
  git(directory, ["commit", "--quiet", "-m", "bypass stable retirement"]);
  assert.ok(validateAgentHistory({ root: directory }).some((finding) => finding.includes("retire")));
  fs.writeFileSync(path.join(directory, "history-followup.txt"), "follow-up\n");
  git(directory, ["add", "history-followup.txt"]);
  git(directory, ["commit", "--quiet", "-m", "unrelated follow-up"]);
  assert.ok(validateAgentHistory({ root: directory }).some((finding) => finding.includes("retire")));

  fs.appendFileSync(path.join(directory, "generated", "agent", "versions", "v3.0.0", "en", "design.md"), "tampered\n");
  assert.ok(validateAgentHistory({ root: directory, version: "3.0.0" }).some((finding) => finding.includes("differs")));
});

test("full-history validation rejects a release Tag outside current main ancestry", () => {
  const { directory } = createReleaseFixture();
  git(directory, ["init", "--quiet"]);
  git(directory, ["config", "user.name", "KIN Test"]);
  git(directory, ["config", "user.email", "kin-test@example.invalid"]);
  git(directory, ["branch", "-M", "main"]);
  git(directory, ["add", "."]);
  git(directory, ["commit", "--quiet", "-m", "release candidate"]);
  git(directory, ["tag", "-a", "v3.0.0", "-m", "KIN 3.0.0"]);
  const tree = git(directory, ["write-tree"]);
  const disconnected = git(directory, ["commit-tree", tree, "-m", "disconnected main"]);
  git(directory, ["update-ref", "refs/heads/main", disconnected]);
  assert.ok(
    validateAgentHistory({ root: directory, version: "3.0.0" })
      .some((finding) => finding.includes("must be an ancestor of current HEAD")),
  );
});

test("release eligibility and Pages workflows preserve read-only verification boundaries", () => {
  const eligibility = fs.readFileSync(path.join(root, ".github", "workflows", "validate-agent-release.yml"), "utf8");
  assert.match(eligibility, /workflow_dispatch:/u);
  assert.match(eligibility, /version:\s+description:/u);
  assert.match(eligibility, /permissions:\s+actions: read\s+contents: read/u);
  assert.match(eligibility, /fetch-depth: 0/u);
  assert.match(eligibility, /agent:check:history/u);
  assert.match(eligibility, /--detached/u);
  assert.match(eligibility, /git ls-remote --tags origin/u);
  assert.match(eligibility, /gh release view/u);
  assert.match(eligibility, /successful_tag_runs/u);
  assert.match(eligibility, /promotion_eligible=true/u);
  assert.match(eligibility, /run-name: Validate Agent v\$\{\{ inputs\.version \}\}/u);
  assert.doesNotMatch(eligibility, /contents: write/u);

  const pages = fs.readFileSync(path.join(root, ".github", "workflows", "deploy-pages.yml"), "utf8");
  assert.match(pages, /cancel-in-progress: true/u);
  assert.match(pages, /Require the authoritative main revision/u);
  assert.match(pages, /Refusing to replace Pages from a stale main revision or an older Release/u);
  assert.match(pages, /agent:check:published/u);
  assert.match(pages, /Refuse stale success after deployment/u);
  assert.match(pages, /verify-agent-responses\.mjs --base-url/u);

  const validation = fs.readFileSync(path.join(root, ".github", "workflows", "validate-docs.yml"), "utf8");
  assert.match(validation, /fetch-depth: 0/u);
  assert.match(validation, /agent:check:published/u);

  const releaseTag = fs.readFileSync(path.join(root, ".github", "workflows", "validate-release-tag.yml"), "utf8");
  assert.match(releaseTag, /fetch-depth: 0/u);
  assert.match(releaseTag, /agent:check:history/u);
  const ancestryGate = releaseTag.indexOf("Require the tagged commit on main before executing repository code");
  assert.ok(ancestryGate >= 0);
  assert.ok(ancestryGate < releaseTag.indexOf("Set up Node.js"));
  assert.ok(ancestryGate < releaseTag.indexOf("Install dependencies"));

  const promotion = fs.readFileSync(path.join(root, "scripts", "promote-agent-distribution.mjs"), "utf8");
  assert.match(promotion, /collectAgentRemoteReleaseEvidenceFindings/u);
  assert.match(promotion, /eligibilityHeadCommit: headCommit/u);
});
