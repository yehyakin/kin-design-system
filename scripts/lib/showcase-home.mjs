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
const HOME_STAGE_SCENARIO_IDS = Object.freeze(["INT-01", "COM-02", "ENG-01"]);

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
  }),
  "zh-CN": Object.freeze({
    stable: "稳定",
    candidate: "候选",
    draft: "草稿",
    deprecated: "已弃用",
    showcased: "可预览",
    linked: "有参考",
    planned: "计划中",
    source_suffix: "规范",
  }),
});

const FEATURE_LOCALIZED_COPY = Object.freeze({
  "zh-CN": Object.freeze({
    "INT-01": Object.freeze({
      source_name: "Entity Database Review",
      name: "对象数据库复核",
      source_job: "Select an entity, inspect evidence and properties, and make a reversible decision.",
      job: "选择对象，查看证据与属性，并完成可撤销的复核决定。",
      entry: "分析人员从已保存的对象视图或深链接进入。",
      dominant_region: "对象列表与选中对象详情。",
      completion: "分析人员记录或退出复核决定，同时保留列表上下文。",
      boundary: "选择变化与复核决定可以交互，但尚未提供可直接访问的 URL 状态。",
    }),
    "INT-02": Object.freeze({
      source_name: "Investigation and Evidence Review",
      name: "调查与证据复核",
      source_job: "Compare chronology, sources, conflicts, and uncertainty before recording a finding.",
      job: "在记录结论前比较时间顺序、来源、冲突与不确定性。",
      entry: "分析人员从队列或直接链接打开对象调查。",
      dominant_region: "证据与事件顺序。",
      completion: "分析人员记录可追溯的结论，或保持调查不变。",
      boundary: "本地样例未连接实时来源、权威权限服务或持久化结论。",
    }),
    "COM-02": Object.freeze({
      source_name: "Product Detail and Edit",
      name: "商品详情与编辑",
      source_job: "Edit a product while sellable state, price, inventory, channel status, and activity stay visible.",
      job: "编辑商品时，让可售状态、价格、库存、渠道和活动保持可见。",
      entry: "运营人员从限定范围的商品目录打开一件商品。",
      dominant_region: "商品详情与可编辑的运营字段。",
      completion: "商品变更被保存、拒绝，或保留为可恢复草稿。",
      boundary: "本地样例未连接商品后端、权限服务、审批引擎或渠道发布。",
    }),
    "ENG-01": Object.freeze({
      source_name: "Canvas Edit and Undo",
      name: "画布编辑与撤销",
      source_job: "Select, modify, commit, and undo a structured object with precise context.",
      job: "在明确的工作区中选择、修改、提交并撤销结构化内容。",
      entry: "用户打开文档并选择对象或工具。",
      dominant_region: "精密画布。",
      completion: "变更写入文档历史或被安全取消。",
      boundary: "提交、取消、撤销和修订历史尚不能通过 URL 直接打开。",
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

function scenarioReferenceLocale(root, scenario, locale) {
  const control = scenarioStateControl(scenario);
  const url = new URL(control.reference_path, "https://kin.invalid/");
  if (url.searchParams.has("lang")) return locale;
  const sourcePath = resolveExistingPathWithin(root, url.pathname.replace(/^\//u, ""));
  const source = fs.readFileSync(sourcePath, "utf8");
  return source.match(/<html\b[^>]*\blang=["']([^"']+)["']/iu)?.[1] ?? "en";
}

function referenceLanguageLabel(referenceLocale, locale) {
  if (locale === "zh-CN") return referenceLocale === "zh-CN" ? "中文预览" : "英文预览";
  return referenceLocale === "zh-CN" ? "Chinese reference" : "English reference";
}

function localizedScenarioCopy(scenario, locale, publicPath) {
  if (locale === "en") {
    return {
      name: scenario.canonical_name,
      job: scenario.user_job,
      entry: scenario.entry,
      dominant_region: scenario.composition.dominant_region,
      completion: scenario.completion,
      boundary: scenario.known_gaps[0],
    };
  }
  const localized = FEATURE_LOCALIZED_COPY[locale]?.[scenario.id];
  if (!localized) throw new Error(`${publicPath}: no localized featured copy is registered for ${scenario.id}`);
  if (localized.source_name !== scenario.canonical_name || localized.source_job !== scenario.user_job) {
    throw new Error(`${publicPath}: localized featured copy for ${scenario.id} must be reviewed after a catalog copy change`);
  }
  return localized;
}

function injectCatalogBackedHomeFacts({ root, source, publicPath, locale, scenarios }) {
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
      locale === "zh-CN"
        ? `${id} · ${sourceStatus}${copy.source_suffix} · ${presentation}`
        : `${id} · ${sourceStatus} ${copy.source_suffix} · ${presentation}`,
      publicPath,
    );
  }

  for (const id of HOME_STAGE_SCENARIO_IDS) {
    const scenario = scenarios.get(id);
    if (!scenario) throw new Error(`${publicPath}: stage Scenario ${id} is missing from scenarios/catalog.json`);
    const localized = localizedScenarioCopy(scenario, locale, publicPath);
    const referenceLocale = scenarioReferenceLocale(root, scenario, locale);
    const marker = "data-scenario-stage-option";
    for (const [attribute, value] of [
      ["data-title", localized.name],
      ["data-job", localized.job],
      ["data-source", copy[scenario.source_maturity] ?? scenario.source_maturity],
      ["data-presentation", copy[scenario.presentation_status] ?? scenario.presentation_status],
      ["data-entry", localized.entry],
      ["data-dominant-region", localized.dominant_region],
      ["data-completion", localized.completion],
      ["data-boundary", localized.boundary],
      ["data-reference-language", referenceLanguageLabel(referenceLocale, locale)],
      ["data-reference", scenarioReferencePath(scenario, locale)],
      ["data-lab", scenarioLabPath(scenario, locale)],
    ]) {
      source = replaceMarkedAttribute(source, marker, id, attribute, value, publicPath);
    }
  }

  const featured = scenarios.get("INT-01");
  const featuredCopy = localizedScenarioCopy(featured, locale, publicPath);
  const featuredReferenceLocale = scenarioReferenceLocale(root, featured, locale);
  source = replaceMarkedText(source, "data-showcase-feature-name", featured.id, featuredCopy.name, publicPath);
  source = replaceMarkedText(source, "data-showcase-feature-job", featured.id, featuredCopy.job, publicPath);
  source = replaceMarkedText(
    source,
    "data-showcase-feature-language",
    featured.id,
    referenceLanguageLabel(featuredReferenceLocale, locale),
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
    source = injectCatalogBackedHomeFacts({
      root,
      source,
      publicPath,
      locale,
      scenarios,
    });
    fs.writeFileSync(target, source, "utf8");
  }
  return counts;
}
