import fs from "node:fs";
import path from "node:path";
import { compactJson, compareCodePoints, prettyJson, sha256CanonicalText, sha256ExactBytes } from "./canonical-content.mjs";
import { createMarkdownWithFrontmatter } from "./frontmatter.mjs";
import { parseDesignContract } from "./design-contract.mjs";
import { InputRegistry } from "./input-registry.mjs";
import { extractExactSection } from "./markdown-sections.mjs";
import { validateSchemaValue } from "./schema-validator.mjs";
import { scanGeneratedArtifact, validateLocaleRecord } from "./safe-generated-content.mjs";
import { resolveSharedTokens, resolveThemeColors, THEME_MODES } from "./theme-tokens.mjs";

export const AGENT_SCHEMA_VERSION = "1.0.0";
export const AGENT_PUBLIC_BASE = "https://yehyakin.github.io/kin-design-system/next/";
export const AGENT_LOCALES = Object.freeze([
  { id: "en", source: "distribution/locales/en.json", bundleDirectory: "en", publicDirectory: "" },
  { id: "zh-CN", source: "distribution/locales/zh-CN.json", bundleDirectory: "zh-CN", publicDirectory: "zh/" },
]);
export const AGENT_SCHEMAS = Object.freeze([
  "snapshot.schema.json",
  "manifest.schema.json",
  "rules.schema.json",
  "profiles.schema.json",
  "locale-source.schema.json",
]);
const SNAPSHOT_SECTIONS = Object.freeze([
  "status-and-source",
  "visual-register",
  "theme-usage",
  "typography-roles",
  "layout-and-density",
  "surface-and-elevation",
  "motion",
  "content-rules",
  "task-and-product-routing",
  "verification-and-adoption",
]);

const schemaKey = (name) => name.replace(".schema.json", "").replaceAll("-", "_");

function ensureUnique(items, key, label) {
  const values = items.map((item) => item[key]);
  if (new Set(values).size !== values.length) throw new Error(`${label} must contain unique ${key} values`);
}

function canonicalLocalizedProse(record) {
  return {
    heading: record.heading,
    summary: record.summary,
    do: record.do,
    do_not: record.do_not,
    ...(record.labels ? { labels: record.labels } : {}),
  };
}

export function computeLocaleReviewCandidates(rules, locale, sourceSections) {
  const copyById = new Map(locale.rules.map((record) => [record.id, record]));
  const records = [];
  const reviewers = new Set();

  for (const rule of [...rules].sort((left, right) => compareCodePoints(left.id, right.id))) {
    const localized = copyById.get(rule.id);
    if (!localized) throw new Error(`${locale.locale}: missing localized rule ${rule.id}`);
    const sourceSection = sourceSections.get(rule.id);
    const normativeSourceChecksum = sha256CanonicalText(compactJson({
      id: rule.id,
      level: rule.level,
      source_path: rule.source_path,
      source_heading: rule.source_heading,
      source_section: sourceSection,
    }));
    const localizedContentChecksum = sha256CanonicalText(compactJson({
      id: rule.id,
      localized_prose: canonicalLocalizedProse(localized),
    }));

    const normativeMatches = localized.review.status === "reviewed" && localized.review.normative_source_checksum === normativeSourceChecksum;
    const localizedMatches = localized.review.status === "reviewed" && localized.review.localized_content_checksum === localizedContentChecksum;
    const attestationState = localized.review.status === "unreviewed"
      ? "unreviewed"
      : normativeMatches && localizedMatches
        ? "valid-attestation"
        : "stale-attestation";
    if (localized.review.status === "reviewed") {
      for (const reviewer of localized.review.reviewers) reviewers.add(reviewer);
    }
    records.push({
      id: rule.id,
      normativeSourceChecksum,
      localizedContentChecksum,
      normativeMatches,
      localizedMatches,
      attestationState,
    });
  }

  const normativeAggregate = sha256CanonicalText(compactJson(records.map((record) => ({
    id: record.id,
    normative_source_checksum: record.normativeSourceChecksum,
  }))));
  const localizedAggregate = sha256CanonicalText(compactJson(records.map((record) => ({
    id: record.id,
    localized_content_checksum: record.localizedContentChecksum,
  }))));

  const complete = records.every((record) => record.attestationState === "valid-attestation");
  const stale = records.some((record) => record.attestationState === "stale-attestation");
  return {
    complete,
    status: complete ? "reviewed" : stale ? "stale-attestation" : "unreviewed",
    reviewers: [...reviewers].sort(compareCodePoints),
    normative_source_checksum: normativeAggregate,
    localized_content_checksum: localizedAggregate,
    records,
  };
}

export function computeLocaleReview(rules, locale, sourceSections) {
  const review = computeLocaleReviewCandidates(rules, locale, sourceSections);
  for (const record of review.records) {
    if (record.attestationState !== "stale-attestation") continue;
    if (!record.normativeMatches) throw new Error(`${locale.locale}:${record.id}: stale normative source review checksum`);
    throw new Error(`${locale.locale}:${record.id}: stale localized content review checksum`);
  }
  return review;
}

function inputRole(file) {
  if (file === "DESIGN.md" || file === "DELIVERY.md" || file === "principles/visual-signature.md") return "normative-contract";
  if (file.startsWith("patterns/")) return "normative-pattern";
  if (file === "tokens/kin.tokens.json") return "generated-token-source";
  if (file === "package.json") return "lifecycle-metadata";
  if (file.endsWith("/catalog.json")) return "machine-catalog";
  if (file.startsWith("distribution/schemas/")) return "distribution-schema";
  if (file === "distribution/rules.json") return "distribution-rule-input";
  if (file === "distribution/profiles.json") return "distribution-profile-input";
  if (file.startsWith("distribution/locales/")) return "informative-translation-input";
  throw new Error(`No Agent distribution input role is registered for ${file}`);
}

function validateInputSchema(value, schema, file) {
  const findings = validateSchemaValue(value, schema);
  if (findings.length > 0) throw new Error(`${file} does not match its Schema:\n- ${findings.join("\n- ")}`);
}

export function loadAgentDistributionContext(root, { allowStaleLocaleReview = false } = {}) {
  const registry = new InputRegistry(root);
  const designSource = registry.readText("DESIGN.md", inputRole("DESIGN.md"));
  const design = parseDesignContract(designSource);
  const packageJson = registry.readJson("package.json", inputRole("package.json"));
  if (packageJson.version !== design.kinVersion) throw new Error(`package.json ${packageJson.version} differs from DESIGN.md ${design.kinVersion}`);

  const tokens = registry.readJson("tokens/kin.tokens.json", inputRole("tokens/kin.tokens.json"));
  const catalogs = {
    components: registry.readJson("components/catalog.json", inputRole("components/catalog.json")),
    pages: registry.readJson("pages/catalog.json", inputRole("pages/catalog.json")),
    integrations: registry.readJson("integrations/catalog.json", inputRole("integrations/catalog.json")),
  };
  const schemas = Object.fromEntries(AGENT_SCHEMAS.map((name) => {
    const file = `distribution/schemas/${name}`;
    return [name, registry.readJson(file, inputRole(file))];
  }));
  const rulesSource = registry.readJson("distribution/rules.json", inputRole("distribution/rules.json"));
  const profilesSource = registry.readJson("distribution/profiles.json", inputRole("distribution/profiles.json"));
  const locales = AGENT_LOCALES.map((definition) => ({
    ...definition,
    value: registry.readJson(definition.source, inputRole(definition.source)),
  }));

  validateInputSchema(rulesSource, schemas["rules.schema.json"], "distribution/rules.json");
  validateInputSchema(profilesSource, schemas["profiles.schema.json"], "distribution/profiles.json");
  for (const locale of locales) validateInputSchema(locale.value, schemas["locale-source.schema.json"], locale.source);

  const rules = [...rulesSource.rules].sort((left, right) => left.order - right.order || compareCodePoints(left.id, right.id));
  ensureUnique(rules, "id", "distribution/rules.json");
  ensureUnique(rules, "order", "distribution/rules.json");
  const presentSections = new Set(rules.map((rule) => rule.snapshot_section));
  for (const section of SNAPSHOT_SECTIONS) {
    if (!presentSections.has(section)) throw new Error(`distribution/rules.json must define the ${section} snapshot section`);
  }
  const sourceSections = new Map();
  for (const rule of rules) {
    const source = registry.readText(rule.source_path, inputRole(rule.source_path));
    sourceSections.set(rule.id, extractExactSection(source, rule.source_heading));
  }

  const profiles = profilesSource.profiles;
  ensureUnique(profiles, "id", "distribution/profiles.json");
  const profileIds = [...profiles.map((profile) => profile.id)].sort(compareCodePoints);
  const supportedProducts = [...design.supportedProducts].sort(compareCodePoints);
  if (compactJson(profileIds) !== compactJson(supportedProducts)) throw new Error("distribution/profiles.json must match DESIGN.md supported_products exactly");
  for (const profile of profiles) registry.readText(profile.contract_path, inputRole(profile.contract_path));

  const ruleIds = [...rules.map((rule) => rule.id)].sort(compareCodePoints);
  const sectionHeadings = new Map();
  const localeReviews = new Map();
  for (const locale of locales) {
    if (locale.value.locale !== locale.id) throw new Error(`${locale.source}: locale ID does not match its path`);
    ensureUnique(locale.value.rules, "id", locale.source);
    const unsafe = locale.value.rules.flatMap((record) => validateLocaleRecord(record, locale.id));
    if (unsafe.length > 0) throw new Error(`${locale.source} contains unsafe generated prose:\n- ${unsafe.join("\n- ")}`);
    const localeRuleIds = [...locale.value.rules.map((record) => record.id)].sort(compareCodePoints);
    if (compactJson(localeRuleIds) !== compactJson(ruleIds)) throw new Error(`${locale.source}: localized rule IDs must match distribution/rules.json exactly`);
    for (const rule of rules) {
      const copy = locale.value.rules.find((record) => record.id === rule.id);
      const existing = sectionHeadings.get(`${locale.id}:${rule.snapshot_section}`);
      if (existing && existing !== copy.heading) throw new Error(`${locale.source}: rules in ${rule.snapshot_section} must use one section heading`);
      sectionHeadings.set(`${locale.id}:${rule.snapshot_section}`, copy.heading);
    }
    localeReviews.set(
      locale.id,
      allowStaleLocaleReview
        ? computeLocaleReviewCandidates(rules, locale.value, sourceSections)
        : computeLocaleReview(rules, locale.value, sourceSections),
    );
  }

  const inputSetChecksum = registry.checksum();
  const sharedTokens = resolveSharedTokens(tokens);
  return {
    root,
    registry,
    design,
    tokens,
    sharedTokens,
    catalogs,
    schemas,
    rules,
    profiles,
    locales,
    localeReviews,
    sourceSections,
    inputSetChecksum,
  };
}

function snapshotRuleMetadata(rules) {
  return rules.map(({ id, level, source_path, source_heading }) => ({ id, level, source_path, source_heading }));
}

function bodyForSnapshot(context, localeDefinition, mode) {
  const locale = localeDefinition.value;
  const copyById = new Map(locale.rules.map((record) => [record.id, record]));
  const foundation = copyById.get("snapshot-source-boundary");
  const grouped = new Map();
  for (const rule of context.rules) {
    if (!grouped.has(rule.snapshot_section)) grouped.set(rule.snapshot_section, []);
    grouped.get(rule.snapshot_section).push(copyById.get(rule.id));
  }
  const lines = [`# ${foundation.labels.title}`, "", `> ${foundation.labels.generated_warning}`, ""];

  function section(id, extra = []) {
    const records = grouped.get(id) ?? [];
    if (records.length === 0) return;
    lines.push(`## ${records[0].heading}`, "");
    for (const record of records) lines.push(`- ${record.summary}`);
    if (extra.length > 0) lines.push(...extra);
    lines.push("");
  }

  section("status-and-source", [
    `- ${foundation.labels.source_checksum}: \`${context.design.checksum}\``,
    `- ${foundation.labels.mode}: \`${mode.theme}\` / \`${mode.contrast}\``,
    `- ${foundation.labels.locale_review}: \`${context.localeReviews.get(localeDefinition.id).status}\``,
    `- ${foundation.labels.publication_state}: \`repository-only\`; ${foundation.labels.publication_notice}`,
  ]);
  section("visual-register");
  section("theme-usage", [`- ${foundation.labels.color_scheme_guidance}`]);

  const typographyRows = Object.entries(context.sharedTokens.typography).map(([name, value]) =>
    `| \`${name}\` | ${value.font_size} / ${value.font_weight} / ${value.line_height} |`,
  );
  section("typography-roles", [
    "",
    `| ${foundation.labels.token_role} | ${foundation.labels.token_value} |`,
    "|---|---|",
    ...typographyRows,
  ]);
  section("layout-and-density");
  section("surface-and-elevation");
  section("motion");
  section("content-rules");

  lines.push(`## ${foundation.labels.do_heading}`, "");
  for (const rule of context.rules) for (const item of copyById.get(rule.id).do) lines.push(`- ${item}`);
  lines.push("", `## ${foundation.labels.do_not_heading}`, "");
  for (const rule of context.rules) for (const item of copyById.get(rule.id).do_not) lines.push(`- ${item}`);
  lines.push("");

  const routing = grouped.get("task-and-product-routing")[0];
  lines.push(`## ${routing.heading}`, "", `- ${routing.summary}`, "", `| ${foundation.labels.profile} | ${foundation.labels.task_intents} | ${foundation.labels.contract} |`, "|---|---|---|");
  for (const profile of context.profiles) lines.push(`| \`${profile.id}\` | ${profile.task_intents.map((item) => `\`${item}\``).join(", ")} | \`${profile.contract_path}\` |`);
  lines.push("");

  section("verification-and-adoption");
  return lines.join("\n");
}

function createSnapshot(context, locale, mode) {
  const review = context.localeReviews.get(locale.id);
  const colors = resolveThemeColors(context.tokens, mode.theme, mode.contrast);
  const metadata = {
    kind: "kin-agent-design",
    schema_version: AGENT_SCHEMA_VERSION,
    schema_locator: "schemas/snapshot.schema.json",
    generated: true,
    normative: false,
    artifact_status: "generated-derivative",
    editable: false,
    publication: { state: "repository-only", published: false, public_locators: "reserved-for-phase-2" },
    kin_version: context.design.kinVersion,
    release_status: context.design.releaseStatus,
    latest_stable_contract: context.design.latestStable,
    channel: "next",
    locale: locale.id,
    direction: locale.value.direction,
    theme: mode.theme,
    contrast: mode.contrast,
    coverage: "compact-foundations-and-routing",
    features: { component_recipes: "unavailable" },
    locale_review: {
      status: review.status,
      reviewers: review.reviewers,
      normative_source_checksum: review.normative_source_checksum,
      localized_content_checksum: review.localized_content_checksum,
    },
    source: {
      contract_path: "DESIGN.md",
      checksum_algorithm: "sha256",
      checksum: context.design.checksum,
      input_set_checksum: context.inputSetChecksum,
      ref: "main",
      revision_status: "mutable",
    },
    manifest_locator: "design-manifest.json",
    full_contract_path: "DESIGN.md",
    visual_signature_path: "principles/visual-signature.md",
    delivery_contract_path: "DELIVERY.md",
    product_profiles: context.profiles.map((profile) => profile.id),
    rules: snapshotRuleMetadata(context.rules),
    colors,
    typography: context.sharedTokens.typography,
    spacing: context.sharedTokens.spacing,
    rounded: context.sharedTokens.rounded,
    motion: context.sharedTokens.motion,
    component_recipes: null,
  };
  return createMarkdownWithFrontmatter(metadata, bodyForSnapshot(context, locale, mode));
}

function publicSnapshotPath(locale, filename) {
  return `${AGENT_PUBLIC_BASE}${locale.publicDirectory}${filename}`;
}

function artifactId(locale, mode) {
  return `design-${locale.id.toLowerCase()}-${mode.theme}${mode.contrast === "more" ? "-high-contrast" : ""}`;
}

function publishedSchema(source, name) {
  const { $schema, ...rest } = source;
  return {
    $schema,
    $id: `${AGENT_PUBLIC_BASE}schemas/${name}`,
    $comment: `Generated non-normative copy. Edit distribution/schemas/${name}, not this file.`,
    ...rest,
  };
}

function catalogLink(context, name, collectionKey) {
  const repositoryPath = `${name}/catalog.json`;
  const catalog = context.catalogs[name];
  const entries = catalog[collectionKey];
  if (!Array.isArray(entries)) throw new Error(`${repositoryPath}: expected ${collectionKey} array`);
  const statusCounts = {};
  for (const entry of entries) {
    if (typeof entry.status !== "string" || entry.status.length === 0) throw new Error(`${repositoryPath}: every ${collectionKey} entry must expose status`);
    statusCounts[entry.status] = (statusCounts[entry.status] ?? 0) + 1;
  }
  const source = context.registry.entries().find((entry) => entry.path === repositoryPath);
  if (!source) throw new Error(`${repositoryPath}: missing input registry record`);
  return {
    repository_path: repositoryPath,
    raw_url: `https://raw.githubusercontent.com/yehyakin/kin-design-system/main/${repositoryPath}`,
    human_url: `https://github.com/yehyakin/kin-design-system/blob/main/${repositoryPath}`,
    schema_version: catalog.schema_version,
    ...(catalog.catalog_version ? { catalog_version: catalog.catalog_version } : {}),
    reviewed_on: catalog.reviewed_on,
    entry_count: entries.length,
    status_counts: Object.fromEntries(Object.entries(statusCounts).sort(([left], [right]) => compareCodePoints(left, right))),
    source_sha256: source.sha256,
  };
}

export function buildAgentDistribution(root) {
  const context = loadAgentDistributionContext(root);
  const artifacts = new Map();

  for (const name of AGENT_SCHEMAS) artifacts.set(`schemas/${name}`, prettyJson(publishedSchema(context.schemas[name], name)));
  for (const locale of context.locales) {
    for (const mode of THEME_MODES) artifacts.set(`${locale.bundleDirectory}/${mode.filename}`, createSnapshot(context, locale, mode));
  }

  const artifactRecords = [];
  for (const [bundlePath, content] of [...artifacts.entries()].sort(([left], [right]) => compareCodePoints(left, right))) {
    const schema = bundlePath.startsWith("schemas/");
    const snapshot = schema ? null : context.locales.find((locale) => bundlePath.startsWith(`${locale.bundleDirectory}/`));
    const mode = schema ? null : THEME_MODES.find((candidate) => bundlePath.endsWith(`/${candidate.filename}`));
    artifactRecords.push({
      id: schema ? `schema-${schemaKey(path.posix.basename(bundlePath))}` : artifactId(snapshot, mode),
      kind: schema ? "json-schema" : "agent-markdown",
      ...(schema ? {} : { locale: snapshot.id, theme: mode.theme, contrast: mode.contrast }),
      repository_path: `generated/agent/next/${bundlePath}`,
      bundle_path: bundlePath,
      public_url: schema ? `${AGENT_PUBLIC_BASE}${bundlePath}` : publicSnapshotPath(snapshot, mode.filename),
      media_type: schema ? "application/schema+json; charset=utf-8" : "text/markdown; charset=utf-8",
      normative: false,
      sha256: sha256ExactBytes(Buffer.from(content, "utf8")),
    });
  }

  const schemas = Object.fromEntries(AGENT_SCHEMAS.map((name) => [schemaKey(name), {
    repository_source_path: `distribution/schemas/${name}`,
    bundle_path: `schemas/${name}`,
    public_url: `${AGENT_PUBLIC_BASE}schemas/${name}`,
  }]));
  const modes = context.locales.flatMap((locale) => THEME_MODES.map((mode) => ({
    theme: mode.theme,
    contrast: mode.contrast,
    locale: locale.id,
    artifact_id: artifactId(locale, mode),
  })));
  const manifest = {
    $schema: `${AGENT_PUBLIC_BASE}schemas/manifest.schema.json`,
    schema_version: AGENT_SCHEMA_VERSION,
    kind: "kin-agent-distribution",
    artifact_status: "generated-derivative",
    generated: true,
    normative: false,
    publication: { state: "repository-only", published: false, public_locators: "reserved-for-phase-2" },
    kin_version: context.design.kinVersion,
    release_status: context.design.releaseStatus,
    latest_stable_contract: context.design.latestStable,
    channel: "next",
    source: {
      contract_path: "DESIGN.md",
      checksum_algorithm: "sha256",
      checksum: context.design.checksum,
      input_set_checksum: context.inputSetChecksum,
      ref: "main",
      revision_status: "mutable",
      inputs: context.registry.entries(),
    },
    coverage: { level: "compact", complete_contract: false },
    features: { component_recipes: "unavailable" },
    links: {
      source_raw_base_url: "https://raw.githubusercontent.com/yehyakin/kin-design-system/main/",
      source_human_base_url: "https://github.com/yehyakin/kin-design-system/blob/main/",
      public_base_url: AGENT_PUBLIC_BASE,
      versions_registry_url: "https://yehyakin.github.io/kin-design-system/versions.json",
    },
    schemas,
    locales: context.locales.map((locale) => {
      const review = context.localeReviews.get(locale.id);
      return {
        id: locale.id,
        complete: review.complete,
        review: {
          status: review.status,
          reviewers: review.reviewers,
          normative_source_checksum: review.normative_source_checksum,
          localized_content_checksum: review.localized_content_checksum,
        },
      };
    }),
    modes,
    catalogs: {
      components: catalogLink(context, "components", "components"),
      pages: catalogLink(context, "pages", "pages"),
      integrations: catalogLink(context, "integrations", "integrations"),
      recipes: null,
    },
    delivery: { mode: "contract-first", figma: "variables-only", runtime: "project-owned" },
    artifacts: artifactRecords,
  };
  artifacts.set("design-manifest.json", prettyJson(manifest));
  const unsafeArtifacts = [...artifacts].flatMap(([name, source]) => scanGeneratedArtifact(name, source));
  if (unsafeArtifacts.length > 0) throw new Error(`Generated Agent artifacts failed security review:\n- ${unsafeArtifacts.join("\n- ")}`);
  return { context, artifacts, manifest };
}

export function artifactBytes(artifacts) {
  return new Map([...artifacts].map(([name, content]) => [name, Buffer.from(content, "utf8")]));
}

export function readGeneratedManifest(bundleDirectory) {
  return JSON.parse(fs.readFileSync(path.join(bundleDirectory, "design-manifest.json"), "utf8"));
}
