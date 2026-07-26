import fs from "node:fs";
import path from "node:path";
import { resolveExistingPathWithin, resolveOutputFileWithin } from "./safe-path.mjs";

const COUNT_SOURCES = Object.freeze({
  "stable-components": {
    catalog: "components/catalog.json",
    collection: "components",
    predicate: (entry) => entry.status === "stable",
  },
  "stable-pages": {
    catalog: "pages/catalog.json",
    collection: "pages",
    predicate: (entry) => entry.status === "stable",
  },
  "showcased-scenarios": {
    catalog: "scenarios/catalog.json",
    collection: "scenarios",
    predicate: (entry) => entry.presentation_status === "showcased",
  },
  "planned-scenarios": {
    catalog: "scenarios/catalog.json",
    collection: "scenarios",
    predicate: (entry) => entry.presentation_status === "planned",
  },
});

const HOME_SCENARIO_IDS = Object.freeze(["INT-02", "INF-01", "COM-02", "ENG-01"]);
const HOME_COMPONENT_IDS = Object.freeze([
  "evidence-list",
  "suggested-change-review",
  "execution-preview",
  "background-task-queue",
]);

const STATUS_COPY = Object.freeze({
  en: Object.freeze({
    stable: "Stable",
    candidate: "Candidate",
    draft: "Draft",
    deprecated: "Deprecated",
    showcased: "Showcased",
    linked: "Linked",
    planned: "Planned",
    source_suffix: "source",
    component_suffix: "contract",
  }),
  "zh-CN": Object.freeze({
    stable: "稳定",
    candidate: "候选",
    draft: "草稿",
    deprecated: "已弃用",
    showcased: "已展示",
    linked: "已链接",
    planned: "计划中",
    source_suffix: "来源",
    component_suffix: "合同",
  }),
});

const FEATURE_LOCALIZED_COPY = Object.freeze({
  "zh-CN": Object.freeze({
    "INT-02": Object.freeze({
      source_name: "Investigation and Evidence Review",
      name: "调查与证据复核",
      source_job: "Compare chronology, sources, conflicts, and uncertainty before recording a finding.",
      job: "在记录结论前比较时间顺序、来源、冲突与不确定性。",
    }),
  }),
});

function readCatalog(root, source) {
  const file = resolveExistingPathWithin(root, source.catalog);
  const catalog = JSON.parse(fs.readFileSync(file, "utf8"));
  const entries = catalog[source.collection];
  if (!Array.isArray(entries)) {
    throw new Error(`${source.catalog}: expected ${source.collection} to be an array`);
  }
  return entries;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replaceMarkedText(source, marker, id, value, publicPath) {
  const pattern = new RegExp(
    `(<[^>]+\\b${escapeRegExp(marker)}=["']${escapeRegExp(id)}["'][^>]*>)[\\s\\S]*?(<\\/[^>]+>)`,
    "gu",
  );
  const matches = source.match(pattern) ?? [];
  if (matches.length !== 1) {
    throw new Error(`${publicPath}: expected exactly one ${marker}="${id}" text target, found ${matches.length}`);
  }
  return source.replace(pattern, `$1${escapeAttribute(value)}$2`);
}

function replaceMarkedAttribute(source, marker, id, attribute, value, publicPath) {
  const elementPattern = new RegExp(
    `<[^>]+\\b${escapeRegExp(marker)}=["']${escapeRegExp(id)}["'][^>]*>`,
    "gu",
  );
  const matches = source.match(elementPattern) ?? [];
  if (matches.length !== 1) {
    throw new Error(`${publicPath}: expected exactly one ${marker}="${id}" element, found ${matches.length}`);
  }
  return source.replace(elementPattern, (element) => {
    const attributePattern = new RegExp(`\\b${escapeRegExp(attribute)}=["'][^"']*["']`, "u");
    if (!attributePattern.test(element)) {
      throw new Error(`${publicPath}: ${marker}="${id}" must declare ${attribute}`);
    }
    return element.replace(attributePattern, `${attribute}="${escapeAttribute(value)}"`);
  });
}

function indexRecords(entries, label) {
  const indexed = new Map();
  for (const entry of entries) {
    if (!entry || typeof entry.id !== "string" || entry.id === "") {
      throw new Error(`${label}: every entry must have an id`);
    }
    if (indexed.has(entry.id)) throw new Error(`${label}: duplicate id ${entry.id}`);
    indexed.set(entry.id, entry);
  }
  return indexed;
}

function scenarioStateControl(scenario) {
  const control = scenario.state_controls.find((entry) => entry.state === "normal") ?? scenario.state_controls[0];
  if (!control?.reference_path) throw new Error(`scenarios/catalog.json: ${scenario.id} has no inspectable state control`);
  return control;
}

function scenarioLabPath(scenario, locale) {
  const [inspectionPath, inspectionQuery = ""] = scenario.inspection_path.replace(/^site\//u, "").split("?", 2);
  const params = new URLSearchParams(inspectionQuery);
  const state = scenarioStateControl(scenario).state;
  params.set("scenario", scenario.id);
  params.set("state", state);
  params.set("viewport", scenario.viewports.includes("wide") ? "wide" : scenario.viewports[0]);
  params.set("theme", scenario.themes.includes("dark") ? "dark" : scenario.themes[0]);
  params.set("mode", "present");
  return `${locale === "en" ? "" : "../"}${inspectionPath}?${params.toString()}`;
}

function scenarioReferencePath(scenario, locale) {
  const control = scenarioStateControl(scenario);
  const url = new URL(control.reference_path, "https://kin.invalid/");
  if (url.searchParams.has("lang")) url.searchParams.set("lang", locale);
  return `${locale === "en" ? "" : "../"}${url.pathname.replace(/^\//u, "")}${url.search}${url.hash}`;
}

function injectCatalogBackedHomeFacts({ source, publicPath, locale, scenarios, components }) {
  const copy = STATUS_COPY[locale];

  for (const id of HOME_SCENARIO_IDS) {
    const scenario = scenarios.get(id);
    if (!scenario) throw new Error(`${publicPath}: showcased Scenario ${id} is missing from scenarios/catalog.json`);
    const sourceStatus = copy[scenario.source_maturity] ?? scenario.source_maturity;
    const presentation = copy[scenario.presentation_status] ?? scenario.presentation_status;
    source = replaceMarkedAttribute(
      source,
      "data-showcase-scenario-link",
      id,
      "href",
      scenarioLabPath(scenario, locale),
      publicPath,
    );
    source = replaceMarkedText(
      source,
      "data-showcase-scenario-meta",
      id,
      `${id} · ${sourceStatus} ${copy.source_suffix} · ${presentation}`,
      publicPath,
    );
  }

  const featured = scenarios.get("INT-02");
  let featuredName = featured.canonical_name;
  let featuredJob = featured.user_job;
  if (locale !== "en") {
    const localized = FEATURE_LOCALIZED_COPY[locale]?.[featured.id];
    if (!localized) throw new Error(`${publicPath}: no localized featured copy is registered for ${featured.id}`);
    if (localized.source_name !== featured.canonical_name || localized.source_job !== featured.user_job) {
      throw new Error(`${publicPath}: localized featured copy for ${featured.id} must be reviewed after a catalog copy change`);
    }
    featuredName = localized.name;
    featuredJob = localized.job;
  }
  source = replaceMarkedText(
    source,
    "data-showcase-feature-name",
    featured.id,
    featuredName,
    publicPath,
  );
  source = replaceMarkedText(
    source,
    "data-showcase-feature-job",
    featured.id,
    featuredJob,
    publicPath,
  );
  source = replaceMarkedText(
    source,
    "data-showcase-feature-source",
    featured.id,
    copy[featured.source_maturity] ?? featured.source_maturity,
    publicPath,
  );
  source = replaceMarkedText(
    source,
    "data-showcase-feature-presentation",
    featured.id,
    copy[featured.presentation_status] ?? featured.presentation_status,
    publicPath,
  );
  source = replaceMarkedAttribute(
    source,
    "data-showcase-feature-reference",
    featured.id,
    "src",
    scenarioReferencePath(featured, locale),
    publicPath,
  );
  source = replaceMarkedAttribute(
    source,
    "data-showcase-feature-lab",
    featured.id,
    "href",
    scenarioLabPath(featured, locale),
    publicPath,
  );
  source = replaceMarkedAttribute(
    source,
    "data-showcase-stage-reference",
    featured.id,
    "data-reference",
    scenarioReferencePath(featured, locale),
    publicPath,
  );
  source = replaceMarkedAttribute(
    source,
    "data-showcase-stage-lab",
    featured.id,
    "data-lab",
    scenarioLabPath(featured, locale),
    publicPath,
  );

  for (const id of HOME_COMPONENT_IDS) {
    const component = components.get(id);
    if (!component) throw new Error(`${publicPath}: signature Component ${id} is missing from components/catalog.json`);
    const status = copy[component.status] ?? component.status;
    source = replaceMarkedText(
      source,
      "data-showcase-component-name",
      id,
      component.canonical_name,
      publicPath,
    );
    source = replaceMarkedText(
      source,
      "data-showcase-component-status",
      id,
      `${status} ${copy.component_suffix}`,
      publicPath,
    );
  }

  return source;
}

export function showcaseProofCounts(root) {
  return Object.fromEntries(
    Object.entries(COUNT_SOURCES).map(([key, source]) => [
      key,
      readCatalog(root, source).filter(source.predicate).length,
    ]),
  );
}

export function injectShowcaseProofCounts({ root, output }) {
  const counts = showcaseProofCounts(root);
  const scenarios = indexRecords(
    readCatalog(root, { catalog: "scenarios/catalog.json", collection: "scenarios" }),
    "scenarios/catalog.json",
  );
  const components = indexRecords(
    readCatalog(root, { catalog: "components/catalog.json", collection: "components" }),
    "components/catalog.json",
  );

  for (const [publicPath, locale] of [["index.html", "en"], ["zh/index.html", "zh-CN"]]) {
    const target = resolveOutputFileWithin(output, publicPath);
    let source = fs.readFileSync(target, "utf8");
    for (const [key, value] of Object.entries(counts)) {
      const pattern = new RegExp(
        `<span(?=[^>]*\\bdata-showcase-count=["']${key}["'])[^>]*>[\\s\\S]*?<\\/span>`,
        "gu",
      );
      const matches = source.match(pattern) ?? [];
      if (matches.length !== 1) {
        throw new Error(`${publicPath}: expected exactly one ${key} proof-count placeholder, found ${matches.length}`);
      }
      source = source.replace(pattern, (tag) => tag.replace(/>[\s\S]*<\/span>$/u, `>${value}</span>`));
    }
    if (/data-showcase-count=["'][^"']+["'][^>]*>\s*(?:—|-)?\s*</u.test(source)) {
      throw new Error(`${publicPath}: unresolved showcase proof count remains`);
    }
    source = injectCatalogBackedHomeFacts({ source, publicPath, locale, scenarios, components });
    fs.writeFileSync(target, source, "utf8");
  }
  return counts;
}
