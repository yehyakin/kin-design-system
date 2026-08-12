import fs from "node:fs";
import path from "node:path";

import { compareCodePoints, finalizeText } from "./canonical-content.mjs";
import { normalizeRepositoryPath, resolveExistingPathWithin, writeFileSafelyWithin } from "./safe-path.mjs";

const SITE_ORIGIN = "https://yehyakin.github.io/kin-design-system/";
const REPOSITORY_BLOB_ORIGIN = "https://github.com/yehyakin/kin-design-system/blob/main/";
const REPOSITORY_ORIGIN = "https://github.com/yehyakin/kin-design-system";
const LOCALES = Object.freeze(["en", "zh-CN"]);
const TIERS = Object.freeze(["core", "workspace", "product-specific", "conditional"]);
const MATURITY_STATUSES = Object.freeze(["stable", "candidate", "draft", "deprecated"]);
const PRESENTATION_STATUSES = Object.freeze(["planned", "linked", "showcased"]);
const DISCOVERY_UI_COPY = Object.freeze({
  en: Object.freeze({
    featured_components: "Components you can feel before you read.",
    featured_components_intro: "Start with behavior in context. Contracts, states, and source boundaries follow after the interaction is understood.",
    open_explorer: "Open",
    full_catalog: "View full catalog",
    full_catalog_hint: "All catalog records and maturity",
    featured_rail: "Featured",
    theme: "Theme",
    viewport: "Viewport",
    light: "Light",
    dark: "Dark",
    wide: "Wide",
    narrow: "Narrow",
    preparing: "Preparing reference",
    local_navigation: "Featured component navigation",
    usage: "Usage",
    states: "States",
    accessibility: "Accessibility",
    contract: "Contract",
    inspected_reference: "Inspected reference",
    present_reference: "Present reference",
    pattern_reference: "Live product reference",
    pattern_details: "Composition and evidence",
    context: "Reference view",
    workflow: "In workflow",
    isolated: "Isolated",
    reset_reference: "Reset reference",
    open_reference: "Open reference",
    open_explorer_action: "Open Explorer",
  }),
  "zh-CN": Object.freeze({
    featured_components: "先感受组件，再阅读规范。",
    featured_components_intro: "先在具体行为中理解组件；需要实现时，再查看状态、规范与来源说明。",
    open_explorer: "打开",
    full_catalog: "查看完整目录",
    full_catalog_hint: "全部组件及成熟度",
    featured_rail: "精选组件",
    theme: "主题",
    viewport: "视口",
    light: "日间",
    dark: "夜间",
    wide: "宽屏",
    narrow: "窄屏",
    preparing: "正在准备交互预览",
    local_navigation: "精选组件导航",
    usage: "用途",
    states: "状态",
    accessibility: "无障碍",
    contract: "规范",
    inspected_reference: "交互预览",
    present_reference: "当前预览",
    pattern_reference: "产品布局预览",
    pattern_details: "布局与说明",
    context: "预览方式",
    workflow: "工作流中",
    isolated: "单独查看",
    reset_reference: "重置预览",
    open_reference: "打开预览",
    open_explorer_action: "打开演示",
  }),
});

export const SHOWCASE_COMPONENT_IDS = Object.freeze([
  "app-shell",
  "evidence-list",
  "suggested-change-review",
  "execution-preview",
  "agent-activity-trace",
  "background-task-queue",
  "story-timeline",
  "data-table",
  "command-menu",
  "authentication-dialog",
  "code-block",
  "button",
]);

const FEATURED_COMPONENT_IDS = Object.freeze([
  "command-menu",
  "evidence-list",
  "suggested-change-review",
  "execution-preview",
  "background-task-queue",
  "data-table",
  "authentication-dialog",
  "app-shell",
]);

// Explorer stages use an explicit specimen-aware height so compact fixtures do
// not inherit the dense evidence viewport. This is a content contract rather
// than a DOM measurement: the live reference remains free to scroll inside the
// bounded stage when a fixture needs more room.
const COMPONENT_STAGE_HEIGHTS = Object.freeze({
  "app-shell": "640px",
  "evidence-list": "640px",
  "suggested-change-review": "560px",
  "execution-preview": "560px",
  "agent-activity-trace": "540px",
  "background-task-queue": "520px",
  "story-timeline": "560px",
  "data-table": "600px",
  "command-menu": "min(720px, 70vh)",
  "authentication-dialog": "min(720px, 70vh)",
  "code-block": "460px",
  button: "380px",
});

export const SHOWCASE_PATTERN_IDS = Object.freeze([
  "information-site",
  "intelligence-workspace",
  "ecommerce-operations",
  "engineering-canvas",
]);

const REQUIRED_PATTERN_JOINS = Object.freeze({
  "information-site": Object.freeze({
    document_path: "patterns/information-site.md",
    page_id: "information-record",
    scenario_id: "INF-01",
  }),
  "intelligence-workspace": Object.freeze({
    document_path: "patterns/intelligence-workspace.md",
    page_id: "intelligence-workspace",
    scenario_id: "INT-02",
  }),
  "ecommerce-operations": Object.freeze({
    document_path: "patterns/ecommerce-operations.md",
    page_id: "ecommerce-operations",
    scenario_id: "COM-01",
  }),
  "engineering-canvas": Object.freeze({
    document_path: "patterns/engineering-canvas.md",
    page_id: "engineering-canvas",
    scenario_id: "ENG-01",
  }),
});

const COMPONENT_PATHS = Object.freeze([
  "components/index.html",
  ...SHOWCASE_COMPONENT_IDS.map((id) => `components/${id}/index.html`),
  "patterns/index.html",
]);

const ZH_COMPONENT_PATHS = Object.freeze([
  "zh/components/index.html",
  ...SHOWCASE_COMPONENT_IDS.map((id) => `zh/components/${id}/index.html`),
  "zh/patterns/index.html",
]);

export const SHOWCASE_GENERATED_PATHS = Object.freeze([...COMPONENT_PATHS, ...ZH_COMPONENT_PATHS]);

const SHARED_COPY_KEYS = Object.freeze([
  "site_name",
  "skip_link",
  "search_trigger",
  "open_navigation",
  "choose_language",
  "switch_to_light",
  "increase_contrast",
  "github_label",
  "nav_label",
  "nav_start",
  "nav_sources",
  "nav_showcase",
  "nav_components",
  "nav_patterns",
  "nav_scenarios",
  "nav_lab",
  "nav_documentation",
  "command_label",
  "command_placeholder",
  "command_pages",
  "command_sources",
  "command_empty",
  "command_system_theme",
  "appearance",
  "source_boundary_title",
  "source_boundary_body",
  "catalog_record",
  "open",
  "status",
  "tier",
  "stable",
  "candidate",
  "draft",
  "deprecated",
  "core",
  "workspace",
  "product_specific",
  "conditional",
  "showcased",
  "linked",
  "planned",
  "footer_line",
]);

const COMPONENT_PAGE_COPY_KEYS = Object.freeze([
  "eyebrow",
  "title",
  "lead",
  "stable_heading",
  "stable_intro",
  "other_heading",
  "other_intro",
  "explorer_available",
  "catalog_only",
  "empty_group",
  "catalog_link",
]);

const COMPONENT_EXPLORER_COPY_KEYS = Object.freeze([
  "eyebrow",
  "back",
  "user_job",
  "reference_heading",
  "reference_intro",
  "reference_language",
  "reference_language_mismatch",
  "inspected_state",
  "state_coverage",
  "states_boundary",
  "states_contract",
  "open_reference",
  "evidence_heading",
  "contracts",
  "tests",
  "manual_checks",
  "support",
  "known_gaps",
  "no_known_gaps",
  "reference_boundary",
  "accessibility_boundary",
  "accessibility_boundary_body",
  "themes",
  "responsive",
  "keyboard",
  "touch",
  "reduced_motion",
  "supported",
  "not_recorded",
]);

const PATTERN_PAGE_COPY_KEYS = Object.freeze([
  "eyebrow",
  "title",
  "lead",
  "page_record",
  "scenario_record",
  "page_status",
  "scenario_presentation",
  "primary_job",
  "first_view",
  "dominant_region",
  "persistent_context",
  "prohibited",
  "governing_contract",
  "open_reference",
  "open_chinese_reference",
  "reference_language",
  "reference_language_mismatch",
  "open_lab",
  "maturity_note",
  "catalog_link",
]);

function fail(message) {
  throw new Error(`Showcase discovery: ${message}`);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertObject(value, label) {
  if (!isObject(value)) fail(`${label} must be an object.`);
  return value;
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") fail(`${label} must be a non-empty string.`);
  return value;
}

function assertBoolean(value, label) {
  if (typeof value !== "boolean") fail(`${label} must be a boolean.`);
}

function assertExactKeys(value, expected, label) {
  assertObject(value, label);
  const actual = Object.keys(value).sort(compareCodePoints);
  const wanted = [...expected].sort(compareCodePoints);
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    fail(`${label} has unexpected keys. Expected ${wanted.join(", ")}; received ${actual.join(", ")}.`);
  }
}

function assertExactArray(value, expected, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array.`);
  if (value.length !== expected.length || value.some((item, index) => item !== expected[index])) {
    fail(`${label} must be exactly: ${expected.join(", ")}.`);
  }
}

function assertStringArray(value, label, { allowEmpty = true } = {}) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    fail(`${label} must be ${allowEmpty ? "an" : "a non-empty"} array.`);
  }
  value.forEach((item, index) => assertNonEmptyString(item, `${label}[${index}]`));
}

function assertLocaleParity(left, right, label = "copy") {
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
      fail(`${label} must have matching locale array shapes.`);
    }
    left.forEach((item, index) => assertLocaleParity(item, right[index], `${label}[${index}]`));
    return;
  }

  if (isObject(left) || isObject(right)) {
    if (!isObject(left) || !isObject(right)) fail(`${label} must have matching locale object shapes.`);
    const leftKeys = Object.keys(left).sort(compareCodePoints);
    const rightKeys = Object.keys(right).sort(compareCodePoints);
    if (leftKeys.length !== rightKeys.length || leftKeys.some((key, index) => key !== rightKeys[index])) {
      fail(`${label} must have matching locale keys.`);
    }
    for (const key of leftKeys) assertLocaleParity(left[key], right[key], `${label}.${key}`);
    return;
  }

  assertNonEmptyString(left, `${label}.en`);
  assertNonEmptyString(right, `${label}.zh-CN`);
}

function readJson(root, repositoryPath) {
  const file = resolveExistingPathWithin(root, repositoryPath);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${repositoryPath} is not valid JSON: ${error.message}`);
  }
}

function repositoryFilePart(repositoryPath, label) {
  assertNonEmptyString(repositoryPath, label);
  return normalizeRepositoryPath(repositoryPath.split(/[?#]/u, 1)[0]);
}

function assertRepositoryFile(root, repositoryPath, label) {
  const normalized = repositoryFilePart(repositoryPath, label);
  try {
    resolveExistingPathWithin(root, normalized);
  } catch (error) {
    fail(`${label} is not a valid repository file (${repositoryPath}): ${error.message}`);
  }
  return normalized;
}

function indexUnique(records, label) {
  if (!Array.isArray(records)) fail(`${label} must be an array.`);
  const indexed = new Map();
  for (const [index, record] of records.entries()) {
    assertObject(record, `${label}[${index}]`);
    const id = assertNonEmptyString(record.id, `${label}[${index}].id`);
    if (indexed.has(id)) fail(`${label} contains duplicate id "${id}".`);
    indexed.set(id, record);
  }
  return indexed;
}

function validateRecordCatalog(root, catalog, kind) {
  const plural = kind === "component" ? "components" : "pages";
  const supportKeys =
    kind === "component"
      ? ["themes", "responsive", "keyboard", "touch", "reduced_motion"]
      : ["themes", "responsive", "keyboard", "touch", "reduced_motion", "localization"];

  assertObject(catalog, `${plural}/catalog.json`);
  assertExactKeys(catalog.status_definitions, MATURITY_STATUSES, `${plural}.status_definitions`);
  assertExactKeys(catalog.tier_definitions, TIERS, `${plural}.tier_definitions`);
  const indexed = indexUnique(catalog[plural], plural);

  for (const record of indexed.values()) {
    const label = `${kind} "${record.id}"`;
    assertNonEmptyString(record.canonical_name, `${label}.canonical_name`);
    if (!TIERS.includes(record.tier)) fail(`${label}.tier is not recognized: ${record.tier}`);
    if (!MATURITY_STATUSES.includes(record.status)) fail(`${label}.status is not recognized: ${record.status}`);
    assertStringArray(record.contract_paths, `${label}.contract_paths`, { allowEmpty: record.status !== "stable" });
    assertStringArray(record.reference_paths, `${label}.reference_paths`, { allowEmpty: record.status !== "stable" });
    assertStringArray(record.test_paths, `${label}.test_paths`, { allowEmpty: record.status !== "stable" });
    assertStringArray(record.product_families, `${label}.product_families`);
    assertExactKeys(record.support, supportKeys, `${label}.support`);
    supportKeys.forEach((key) => assertBoolean(record.support[key], `${label}.support.${key}`));
    assertStringArray(record.manual_checks, `${label}.manual_checks`);
    assertStringArray(record.known_gaps, `${label}.known_gaps`);

    for (const field of ["contract_paths", "reference_paths", "test_paths"]) {
      for (const [index, repositoryPath] of record[field].entries()) {
        assertRepositoryFile(root, repositoryPath, `${label}.${field}[${index}]`);
      }
    }
  }

  return indexed;
}

function validateScenarios(root, catalog, pages) {
  assertObject(catalog, "scenarios/catalog.json");
  assertExactKeys(catalog.presentation_status_definitions, PRESENTATION_STATUSES, "scenarios.presentation_status_definitions");
  const indexed = indexUnique(catalog.scenarios, "scenarios");

  for (const scenario of indexed.values()) {
    const label = `scenario "${scenario.id}"`;
    assertNonEmptyString(scenario.canonical_name, `${label}.canonical_name`);
    assertNonEmptyString(scenario.user_job, `${label}.user_job`);
    assertStringArray(scenario.product_profiles, `${label}.product_profiles`, { allowEmpty: false });
    assertStringArray(scenario.contract_paths, `${label}.contract_paths`, { allowEmpty: false });
    assertStringArray(scenario.page_ids, `${label}.page_ids`, { allowEmpty: false });
    if (!MATURITY_STATUSES.includes(scenario.source_maturity)) {
      fail(`${label}.source_maturity is not recognized: ${scenario.source_maturity}`);
    }
    if (!PRESENTATION_STATUSES.includes(scenario.presentation_status)) {
      fail(`${label}.presentation_status is not recognized: ${scenario.presentation_status}`);
    }
    assertObject(scenario.composition, `${label}.composition`);
    for (const key of ["first_meaningful_view", "dominant_region", "persistent_context"]) {
      assertNonEmptyString(scenario.composition[key], `${label}.composition.${key}`);
    }
    const inspectable = scenario.presentation_status !== "planned";
    assertStringArray(scenario.states, `${label}.states`, { allowEmpty: !inspectable });
    assertStringArray(scenario.viewports, `${label}.viewports`, { allowEmpty: !inspectable });
    assertStringArray(scenario.themes, `${label}.themes`, { allowEmpty: !inspectable });
    assertStringArray(scenario.known_gaps, `${label}.known_gaps`);
    if (!Array.isArray(scenario.state_controls)) fail(`${label}.state_controls must be an array.`);

    for (const pageId of scenario.page_ids) {
      if (!pages.has(pageId)) fail(`${label} points to missing Page record "${pageId}".`);
    }
    scenario.contract_paths.forEach((entry, index) =>
      assertRepositoryFile(root, entry, `${label}.contract_paths[${index}]`),
    );
    if (scenario.reference_path !== null) {
      assertRepositoryFile(root, scenario.reference_path, `${label}.reference_path`);
    }
    if (scenario.inspection_path !== null) {
      assertRepositoryFile(root, scenario.inspection_path, `${label}.inspection_path`);
    }
    scenario.state_controls.forEach((control, index) => {
      assertObject(control, `${label}.state_controls[${index}]`);
      assertNonEmptyString(control.state, `${label}.state_controls[${index}].state`);
      assertNonEmptyString(control.label, `${label}.state_controls[${index}].label`);
      assertRepositoryFile(root, control.reference_path, `${label}.state_controls[${index}].reference_path`);
      assertObject(control.assertion, `${label}.state_controls[${index}].assertion`);
    });
  }

  return indexed;
}

function validateScenarioLocale(localeCatalog, scenarios) {
  assertExactKeys(
    localeCatalog,
    ["schema_version", "locale", "groups", "maturity", "viewports", "themes", "assertion_values", "scenarios"],
    "site/scenarios/locale.zh-CN.json",
  );
  if (localeCatalog.schema_version !== "1.0.0") fail('scenario locale schema_version must be "1.0.0".');
  if (localeCatalog.locale !== "zh-CN") fail('scenario locale must be "zh-CN".');
  assertExactKeys(
    localeCatalog.groups,
    ["intelligence", "information", "commerce", "engineering", "shared"],
    "scenario locale groups",
  );
  assertExactKeys(localeCatalog.maturity, ["stable", "candidate", "draft"], "scenario locale maturity");
  assertExactKeys(localeCatalog.viewports, ["wide", "narrow"], "scenario locale viewports");
  assertExactKeys(
    localeCatalog.themes,
    ["light", "dark", "light-high-contrast", "dark-high-contrast"],
    "scenario locale themes",
  );
  for (const [group, value] of Object.entries(localeCatalog.groups)) {
    assertNonEmptyString(value, `scenario locale groups.${group}`);
  }
  for (const [status, value] of Object.entries(localeCatalog.maturity)) {
    assertNonEmptyString(value, `scenario locale maturity.${status}`);
  }
  for (const [viewport, value] of Object.entries(localeCatalog.viewports)) {
    assertNonEmptyString(value, `scenario locale viewports.${viewport}`);
  }
  for (const [theme, value] of Object.entries(localeCatalog.themes)) {
    assertNonEmptyString(value, `scenario locale themes.${theme}`);
  }
  assertObject(localeCatalog.assertion_values, "scenario locale assertion_values");
  for (const [source, value] of Object.entries(localeCatalog.assertion_values)) {
    assertNonEmptyString(source, "scenario locale assertion source");
    assertNonEmptyString(value, `scenario locale assertion_values.${source}`);
  }

  assertExactKeys(localeCatalog.scenarios, [...scenarios.keys()], "scenario locale scenarios");
  for (const scenario of scenarios.values()) {
    const translation = localeCatalog.scenarios[scenario.id];
    const showcased = scenario.presentation_status === "showcased";
    assertExactKeys(
      translation,
      showcased
        ? ["name", "job", "entry", "completion", "context", "gaps", "states"]
        : ["name", "job"],
      `scenario locale scenarios.${scenario.id}`,
    );
    assertNonEmptyString(translation.name, `scenario locale scenarios.${scenario.id}.name`);
    assertNonEmptyString(translation.job, `scenario locale scenarios.${scenario.id}.job`);
    if (!showcased) continue;
    assertNonEmptyString(translation.entry, `scenario locale scenarios.${scenario.id}.entry`);
    assertNonEmptyString(translation.completion, `scenario locale scenarios.${scenario.id}.completion`);
    assertNonEmptyString(translation.context, `scenario locale scenarios.${scenario.id}.context`);
    assertStringArray(translation.gaps, `scenario locale scenarios.${scenario.id}.gaps`);
    assertExactKeys(
      translation.states,
      scenario.state_controls.map((control) => control.state),
      `scenario locale scenarios.${scenario.id}.states`,
    );
    for (const [state, value] of Object.entries(translation.states)) {
      assertNonEmptyString(value, `scenario locale scenarios.${scenario.id}.states.${state}`);
    }
    for (const control of scenario.state_controls) {
      if (
        control.assertion.kind === "text"
        && /[A-Za-z]{3}/u.test(control.assertion.value)
        && !/^(OFFLINE|5XX)$/u.test(control.assertion.value)
        && !localeCatalog.assertion_values[control.assertion.value]
      ) {
        fail(`scenario locale assertion_values must translate "${control.assertion.value}" for ${scenario.id}/${control.state}.`);
      }
    }
  }
}

function validateCopy(copy) {
  assertExactKeys(copy, LOCALES, "showcase.config.json.copy");
  assertLocaleParity(copy.en, copy["zh-CN"]);

  for (const locale of LOCALES) {
    const localized = copy[locale];
    assertExactKeys(localized, ["shared", "components", "patterns"], `copy.${locale}`);
    assertExactKeys(localized.shared, SHARED_COPY_KEYS, `copy.${locale}.shared`);
    assertExactKeys(localized.components, ["page", "explorer", "items"], `copy.${locale}.components`);
    assertExactKeys(localized.components.page, COMPONENT_PAGE_COPY_KEYS, `copy.${locale}.components.page`);
    assertExactKeys(localized.components.explorer, COMPONENT_EXPLORER_COPY_KEYS, `copy.${locale}.components.explorer`);
    assertExactKeys(localized.components.items, SHOWCASE_COMPONENT_IDS, `copy.${locale}.components.items`);
    for (const id of SHOWCASE_COMPONENT_IDS) {
      assertExactKeys(
        localized.components.items[id],
        ["display_name", "job", "boundary", "state_label"],
        `copy.${locale}.components.items.${id}`,
      );
    }

    assertExactKeys(localized.patterns, ["page", "items"], `copy.${locale}.patterns`);
    assertExactKeys(localized.patterns.page, PATTERN_PAGE_COPY_KEYS, `copy.${locale}.patterns.page`);
    assertExactKeys(localized.patterns.items, SHOWCASE_PATTERN_IDS, `copy.${locale}.patterns.items`);
    for (const id of SHOWCASE_PATTERN_IDS) {
      const item = localized.patterns.items[id];
      assertExactKeys(item, ["label", "summary", "blueprint", "prohibited_substitutions"], `copy.${locale}.patterns.items.${id}`);
      assertStringArray(item.blueprint, `copy.${locale}.patterns.items.${id}.blueprint`, { allowEmpty: false });
      assertStringArray(item.prohibited_substitutions, `copy.${locale}.patterns.items.${id}.prohibited_substitutions`, {
        allowEmpty: false,
      });
      if (item.blueprint.length !== 4) fail(`copy.${locale}.patterns.items.${id}.blueprint must contain exactly four regions.`);
    }
  }
}

function validateConfiguration(root, configuration, components, pages, scenarios) {
  assertExactKeys(
    configuration,
    ["schema_version", "status", "copy", "catalog_translations", "display_order", "locators"],
    "showcase.config.json",
  );
  if (configuration.schema_version !== "1.0.0") fail(`showcase.config.json.schema_version must be "1.0.0".`);
  if (configuration.status !== "non-normative") fail(`showcase.config.json.status must be "non-normative".`);
  validateCopy(configuration.copy);
  assertExactKeys(configuration.catalog_translations, ["zh-CN"], "showcase.config.json.catalog_translations");
  assertObject(configuration.catalog_translations["zh-CN"], "showcase.config.json.catalog_translations.zh-CN");
  for (const [source, translation] of Object.entries(configuration.catalog_translations["zh-CN"])) {
    assertNonEmptyString(source, "showcase.config.json.catalog_translations.zh-CN key");
    assertNonEmptyString(translation, `showcase.config.json.catalog_translations.zh-CN.${source}`);
  }
  for (const component of components.values()) {
    const translation = configuration.catalog_translations["zh-CN"][component.canonical_name];
    assertNonEmptyString(
      translation,
      `showcase.config.json.catalog_translations.zh-CN.${component.canonical_name}`,
    );
  }

  assertExactKeys(
    configuration.display_order,
    ["component_explorers", "component_tiers", "component_secondary_statuses", "patterns"],
    "showcase.config.json.display_order",
  );
  assertExactArray(
    configuration.display_order.component_explorers,
    SHOWCASE_COMPONENT_IDS,
    "display_order.component_explorers",
  );
  assertExactArray(configuration.display_order.component_tiers, TIERS, "display_order.component_tiers");
  assertExactArray(
    configuration.display_order.component_secondary_statuses,
    ["candidate", "draft", "deprecated"],
    "display_order.component_secondary_statuses",
  );
  assertExactArray(configuration.display_order.patterns, SHOWCASE_PATTERN_IDS, "display_order.patterns");

  assertExactKeys(configuration.locators, ["components", "patterns"], "showcase.config.json.locators");
  assertExactKeys(configuration.locators.components, SHOWCASE_COMPONENT_IDS, "locators.components");
  assertExactKeys(configuration.locators.patterns, SHOWCASE_PATTERN_IDS, "locators.patterns");

  for (const id of SHOWCASE_COMPONENT_IDS) {
    const component = components.get(id);
    if (!component) fail(`Explorer component "${id}" is missing from components/catalog.json.`);
    if (!["stable", "candidate"].includes(component.status)) {
      fail(`Explorer component "${id}" must be stable or candidate in components/catalog.json.`);
    }
    if (component.status === "candidate") {
      if (component.contract_paths.length === 0 || component.reference_paths.length === 0 || component.test_paths.length === 0) {
        fail(`Candidate Explorer component "${id}" requires a contract, runnable reference, and automated test path.`);
      }
      for (const [capability, supported] of Object.entries(component.support)) {
        if (!supported) fail(`Candidate Explorer component "${id}" must record ${capability} support before receiving a deep route.`);
      }
    }

    const locator = configuration.locators.components[id];
    assertExactKeys(locator, ["path", "query", "fragment", "state_id"], `locators.components.${id}`);
    const locatorPath = assertRepositoryFile(root, locator.path, `locators.components.${id}.path`);
    if (!component.reference_paths.includes(locatorPath)) {
      fail(`Explorer component "${id}" locator must use one of its canonical reference_paths.`);
    }
    assertExactKeys(locator.query, LOCALES, `locators.components.${id}.query`);
    for (const locale of LOCALES) {
      assertObject(locator.query[locale], `locators.components.${id}.query.${locale}`);
      for (const [key, value] of Object.entries(locator.query[locale])) {
        assertNonEmptyString(key, `locators.components.${id}.query.${locale} key`);
        assertNonEmptyString(value, `locators.components.${id}.query.${locale}.${key}`);
      }
    }
    const fragment = assertNonEmptyString(locator.fragment, `locators.components.${id}.fragment`);
    assertNonEmptyString(locator.state_id, `locators.components.${id}.state_id`);
    const source = fs.readFileSync(resolveExistingPathWithin(root, locatorPath), "utf8");
    const escapedFragment = fragment.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const fragmentPattern = new RegExp(`(?:^|[\\s<])id\\s*=\\s*(["'])${escapedFragment}\\1`, "u");
    if (!fragmentPattern.test(source)) fail(`Explorer component "${id}" fragment "#${fragment}" was not found in ${locatorPath}.`);
  }

  for (const id of SHOWCASE_PATTERN_IDS) {
    const locator = configuration.locators.patterns[id];
    const required = REQUIRED_PATTERN_JOINS[id];
    assertExactKeys(
      locator,
      ["document_path", "page_id", "scenario_id", "reference_language"],
      `locators.patterns.${id}`,
    );
    for (const key of Object.keys(required)) {
      if (locator[key] !== required[key]) fail(`locators.patterns.${id}.${key} must be "${required[key]}".`);
    }

    const documentPath = assertRepositoryFile(root, locator.document_path, `locators.patterns.${id}.document_path`);
    const document = fs.readFileSync(resolveExistingPathWithin(root, documentPath), "utf8");
    for (const heading of ["# ", "## Product job", "## Anti-patterns", "## Acceptance"]) {
      if (!document.split(/\r?\n/u).some((line) => (heading === "# " ? line.startsWith(heading) : line.trim() === heading))) {
        fail(`${documentPath} must contain ${heading === "# " ? "an H1" : `"${heading}"`}.`);
      }
    }

    const page = pages.get(locator.page_id);
    const scenario = scenarios.get(locator.scenario_id);
    if (!page) fail(`Pattern "${id}" points to missing Page record "${locator.page_id}".`);
    if (!scenario) fail(`Pattern "${id}" points to missing Scenario "${locator.scenario_id}".`);
    if (scenario.presentation_status !== "showcased") fail(`Scenario "${locator.scenario_id}" must be showcased.`);
    if (!scenario.product_profiles.includes(id)) fail(`Scenario "${locator.scenario_id}" must name product profile "${id}".`);
    if (!scenario.page_ids.includes(locator.page_id)) {
      fail(`Scenario "${locator.scenario_id}" must join Page record "${locator.page_id}".`);
    }
    if (!page.contract_paths.includes(documentPath) || !scenario.contract_paths.includes(documentPath)) {
      fail(`Pattern "${id}" document must govern both its Page record and showcased Scenario.`);
    }
    if (scenario.source_maturity !== page.status) {
      fail(`Scenario "${locator.scenario_id}" source maturity must match Page record "${locator.page_id}" status.`);
    }
    if (scenario.reference_path === null || scenario.inspection_path === null || scenario.state_controls.length === 0) {
      fail(`Scenario "${locator.scenario_id}" must expose a reference, Lab inspection path, and state control.`);
    }
    if (!["localized", "zh-CN"].includes(locator.reference_language)) {
      fail(`locators.patterns.${id}.reference_language must be "localized" or "zh-CN".`);
    }
    if (!page.reference_paths.includes(repositoryFilePart(scenario.reference_path, `${locator.scenario_id}.reference_path`))) {
      fail(`Scenario "${locator.scenario_id}" reference must be listed by Page record "${locator.page_id}".`);
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function repositoryHref(repositoryPath) {
  return `${REPOSITORY_BLOB_ORIGIN}${repositoryFilePart(repositoryPath, "repository link")}`;
}

function routeDirectory(publicPath) {
  return path.posix.dirname(publicPath);
}

function directoryHref(fromPublicPath, toPublicPath) {
  const relative = path.posix.relative(routeDirectory(fromPublicPath), routeDirectory(toPublicPath));
  return relative === "" ? "./" : `${relative}/`;
}

function rootPrefix(publicPath) {
  const relative = path.posix.relative(routeDirectory(publicPath), ".");
  return relative === "" ? "./" : `${relative}/`;
}

function siteFileHref(publicPath, repositoryPath) {
  return `${rootPrefix(publicPath)}${repositoryPath}`;
}

function prettyRoute(publicPath) {
  return publicPath.replace(/index\.html$/u, "");
}

function absoluteRoute(publicPath) {
  return new URL(prettyRoute(publicPath), SITE_ORIGIN).href;
}

function localizedPaths(kind, id = null) {
  const suffix = id === null ? `${kind}/index.html` : `${kind}/${id}/index.html`;
  return { en: suffix, "zh-CN": `zh/${suffix}` };
}

function localeLabel(locale) {
  return locale === "en" ? "English" : "中文";
}

function copyStatus(copy, status) {
  return copy[status.replace("-", "_")] ?? status;
}

function localizedCatalogMarkup(value, locale, configuration) {
  if (locale === "en") return escapeHtml(value);
  const translation = configuration.catalog_translations[locale]?.[value];
  return translation
    ? escapeHtml(translation)
    : `<span lang="en">${escapeHtml(value)}</span>`;
}

function queryString(query) {
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => search.set(key, value));
  const value = search.toString();
  return value === "" ? "" : `?${value}`;
}

function componentReferenceHref(publicPath, locator, locale, { includeFragment = true } = {}) {
  const fragment = includeFragment ? `#${encodeURIComponent(locator.fragment)}` : "";
  return `${siteFileHref(publicPath, locator.path)}${queryString(locator.query[locale])}${fragment}`;
}

function scenarioReferenceControl(scenario) {
  return scenario.state_controls.find((entry) => entry.state === "normal") ?? scenario.state_controls[0];
}

function scenarioReferenceHref(publicPath, scenario, locale, referenceLanguage) {
  const control = scenarioReferenceControl(scenario);
  const referencePath = control?.reference_path ?? scenario.reference_path;
  const url = new URL(referencePath, "https://kin.invalid/");
  if (referenceLanguage === "localized") url.searchParams.set("lang", locale);
  return `${siteFileHref(publicPath, url.pathname.replace(/^\//u, ""))}${url.search}${url.hash}`;
}

function localizedScenarioHref(publicPath, locale, file = "", query = {}) {
  const search = new URLSearchParams(query);
  if (locale === "zh-CN") search.set("lang", "zh-CN");
  const suffix = search.size === 0 ? "" : `?${search.toString()}`;
  return `${rootPrefix(publicPath)}scenarios/${file}${suffix}`;
}

function scenarioLabHref(publicPath, scenario, locale) {
  const publicInspectionPath = scenario.inspection_path.replace(/^site\//u, "");
  const url = new URL(publicInspectionPath, "https://kin.invalid/");
  url.searchParams.set("mode", "present");
  if (locale === "zh-CN") url.searchParams.set("lang", "zh-CN");
  return siteFileHref(publicPath, `${url.pathname.replace(/^\//u, "")}${url.search}${url.hash}`);
}

function list(items, render, empty = "") {
  if (items.length === 0) return empty;
  return items.map(render).join("\n");
}

function sourceLink(repositoryPath, label = repositoryPath) {
  return `<a href="${escapeHtml(repositoryHref(repositoryPath))}">${escapeHtml(label)} <i data-lucide="external-link"></i></a>`;
}

function statusBadge(status, copy) {
  return `<span class="status-badge status-badge--${escapeHtml(status)}">${escapeHtml(copyStatus(copy, status))}</span>`;
}

function commandDialog({ copy, locale, publicPath, routePairs }) {
  const pageItems = [
    [copy.nav_showcase, locale === "en" ? rootPrefix(publicPath) : `${rootPrefix(publicPath)}zh/`],
    [copy.nav_components, directoryHref(publicPath, routePairs.components[locale])],
    [copy.nav_patterns, directoryHref(publicPath, routePairs.patterns[locale])],
    [copy.nav_scenarios, localizedScenarioHref(publicPath, locale)],
    [copy.nav_lab, localizedScenarioHref(publicPath, locale, "lab.html")],
    [copy.nav_documentation, `${rootPrefix(publicPath)}${locale === "en" ? "" : "zh/"}docs/`],
  ];
  const sourceItems = [
    [copy.catalog_record, "components/catalog.json"],
    [copy.nav_patterns, "pages/catalog.json"],
    [copy.nav_scenarios, "scenarios/catalog.json"],
  ];

  return `<dialog class="command-dialog" data-command-dialog data-state="closed" aria-label="${escapeHtml(copy.command_label)}">
    <div class="command-shell">
      <div class="command-input"><i data-lucide="search"></i><input type="search" data-command-search aria-label="${escapeHtml(
        copy.command_label,
      )}" placeholder="${escapeHtml(copy.command_placeholder)}"></div>
      <div class="command-results">
        <section><h2>${escapeHtml(copy.command_pages)}</h2>
          ${pageItems
            .map(
              ([label, href]) =>
                `<a href="${escapeHtml(href)}" data-command-item><i data-lucide="circle-play"></i><span>${escapeHtml(label)}</span></a>`,
            )
            .join("\n")}
        </section>
        <section><h2>${escapeHtml(copy.command_sources)}</h2>
          ${sourceItems
            .map(
              ([label, repositoryPath]) =>
                `<a href="${escapeHtml(repositoryHref(repositoryPath))}" data-command-item><i data-lucide="book-open"></i><span>${escapeHtml(
                  label,
                )}</span><small>${escapeHtml(repositoryPath)}</small></a>`,
            )
            .join("\n")}
        </section>
        <p class="command-empty" data-command-empty hidden>${escapeHtml(copy.command_empty)}</p>
      </div>
      <button class="command-system-theme" type="button" data-theme-system><i data-lucide="monitor-cog"></i>${escapeHtml(
        copy.command_system_theme,
      )}</button>
    </div>
  </dialog>`;
}

function renderShell({
  locale,
  publicPath,
  alternatePaths,
  title,
  description,
  route,
  activeNav,
  content,
  commandPairs,
}) {
  const localized = commandPairs.copy[locale];
  const copy = localized.shared;
  const assets = `${rootPrefix(publicPath)}assets/`;
  const currentRoot = locale === "en" ? rootPrefix(publicPath) : `${rootPrefix(publicPath)}zh/`;
  const languageLinks = LOCALES.map((language) => {
    const current = language === locale ? ' aria-current="page"' : "";
    return `<a href="${escapeHtml(directoryHref(publicPath, alternatePaths[language]))}" role="menuitem" lang="${escapeHtml(
      language,
    )}" hreflang="${escapeHtml(language)}"${current}><span>${escapeHtml(localeLabel(language))}</span>${
      language === locale ? '<i data-lucide="check"></i>' : ""
    }</a>`;
  }).join("");

  const navEntries = [
    ["showcase", copy.nav_showcase, currentRoot, "layout-dashboard"],
    ["components", copy.nav_components, directoryHref(publicPath, commandPairs.routes.components[locale]), "blocks"],
    ["patterns", copy.nav_patterns, directoryHref(publicPath, commandPairs.routes.patterns[locale]), "panels-top-left"],
    ["scenarios", copy.nav_scenarios, localizedScenarioHref(publicPath, locale), "list-checks"],
    ["lab", copy.nav_lab, localizedScenarioHref(publicPath, locale, "lab.html"), "search"],
    ["docs", copy.nav_documentation, `${rootPrefix(publicPath)}${locale === "en" ? "" : "zh/"}docs/`, "book-open"],
  ];
  const globalNavigation = navEntries
    .map(
      ([key, label, href]) =>
        `<a href="${escapeHtml(href)}" data-global-nav-key="${escapeHtml(key)}"${
          key === activeNav ? ' aria-current="page"' : ""
        }>${escapeHtml(label)}</a>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="${escapeHtml(locale)}" data-theme="dark" data-theme-preference="system" data-contrast="normal">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#08090a">
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(absoluteRoute(publicPath))}">
  <meta property="og:image" content="${escapeHtml(new URL("assets/og-card.svg", SITE_ORIGIN).href)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${escapeHtml(absoluteRoute(publicPath))}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(absoluteRoute(alternatePaths.en))}">
  <link rel="alternate" hreflang="zh-CN" href="${escapeHtml(absoluteRoute(alternatePaths["zh-CN"]))}">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteRoute(alternatePaths.en))}">
  <link rel="icon" href="${escapeHtml(`${assets}mark.svg`)}" type="image/svg+xml">
  <link rel="manifest" href="${escapeHtml(`${rootPrefix(publicPath)}manifest.webmanifest`)}">
  <link rel="stylesheet" href="${escapeHtml(`${assets}site.css`)}">
  <link rel="stylesheet" href="${escapeHtml(`${assets}showcase.css?v=3.0.4`)}">
  <script>
    (() => {
      let storedTheme;
      let storedContrast;
      try {
        storedTheme = localStorage.getItem("kin-site-theme");
        storedContrast = localStorage.getItem("kin-site-contrast");
      } catch {}
      const preference = ["light", "dark", "system"].includes(storedTheme) ? storedTheme : "system";
      const theme = preference === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : preference;
      document.documentElement.dataset.themePreference = preference;
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.contrast = storedContrast === "more" ? "more" : "normal";
      document.documentElement.style.colorScheme = theme;
      document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#08090a" : "#f6f7f8";
    })();
  </script>
  <title>${escapeHtml(title)}</title>
</head>
<body class="showcase-shell-page" data-showcase-route="${escapeHtml(route)}">
  <a class="skip-link" href="#main">${escapeHtml(copy.skip_link)}</a>
  <header class="site-header global-header">
    <a class="brand" href="${escapeHtml(currentRoot)}" aria-label="${escapeHtml(copy.site_name)}">
      <span class="brand-mark" aria-hidden="true">KIN</span>
      <span class="brand-copy"><strong>KIN</strong><small>${locale === "zh-CN" ? "设计系统" : "Design System"}</small></span>
    </a>
    <nav class="showcase-nav" id="showcase-nav" data-mobile-nav aria-label="${escapeHtml(copy.nav_label)}">
      ${globalNavigation}
      <a href="${REPOSITORY_ORIGIN}">GitHub</a>
    </nav>
    <div class="header-actions">
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="showcase-nav" aria-label="${escapeHtml(
        copy.open_navigation,
      )}"><i data-lucide="menu"></i></button>
      <button class="command-trigger showcase-command-trigger" type="button" data-command-trigger aria-haspopup="dialog" aria-label="${escapeHtml(
        copy.search_trigger,
      )}"><i data-lucide="search"></i><span class="visually-hidden">${escapeHtml(copy.search_trigger)}</span></button>
      <div class="language-control" data-language-control><button class="language-trigger" type="button" data-language-trigger aria-haspopup="menu" aria-expanded="false" aria-label="${escapeHtml(
        copy.choose_language,
      )}"><i data-lucide="languages"></i></button><div class="language-menu" data-language-menu role="menu" data-state="closed" hidden>${languageLinks}</div></div>
      <button class="theme-switch" type="button" role="switch" data-theme-switch aria-checked="true" aria-label="${escapeHtml(
        copy.switch_to_light,
      )}"><i class="theme-sun" data-lucide="sun"></i><i class="theme-moon" data-lucide="moon"></i></button>
      <button class="contrast-toggle" type="button" data-contrast-toggle aria-pressed="false" aria-label="${escapeHtml(
        copy.increase_contrast,
      )}"><i data-lucide="contrast"></i></button>
    </div>
  </header>
  <div class="docs-shell docs-shell--discovery">
    <main class="docs-main showcase-main" id="main" data-showcase-route="${escapeHtml(route)}">
      <div class="content discovery-page">
${content}
        <footer class="showcase-footer"><p>${escapeHtml(copy.footer_line)}</p></footer>
      </div>
    </main>
  </div>
  ${commandDialog({
    copy,
    locale,
    publicPath,
    routePairs: commandPairs.routes,
  })}
  <script type="module" src="${escapeHtml(`${assets}site.js`)}"></script>
  <script type="module" src="${escapeHtml(`${assets}showcase.js?v=3.0.4`)}"></script>
</body>
</html>`;
}

function componentRow({ component, locale, publicPath, configuration, copy }) {
  const isExplorer = SHOWCASE_COMPONENT_IDS.includes(component.id);
  const itemCopy = isExplorer ? configuration.copy[locale].components.items[component.id] : null;
  const catalogName = configuration.catalog_translations[locale]?.[component.canonical_name];
  const localizedName = itemCopy?.display_name ?? catalogName;
  const name = escapeHtml(localizedName ?? component.canonical_name);
  const language = locale === "zh-CN" && localizedName ? "zh-CN" : "en";
  const nameMarkup = isExplorer
    ? `<a class="discovery-row__name" href="${escapeHtml(
        directoryHref(publicPath, localizedPaths("components", component.id)[locale]),
      )}" lang="${language}">${name}</a>`
    : `<span class="discovery-row__name" lang="${language}">${name}</span>`;
  const action = isExplorer ? copy.explorer_available : copy.catalog_only;

  return `<li class="discovery-row" data-component-id="${escapeHtml(component.id)}">
    <div class="discovery-row__identity">${nameMarkup}<code>${escapeHtml(component.id)}</code></div>
    <div class="discovery-row__facts">${statusBadge(component.status, configuration.copy[locale].shared)}<span>${escapeHtml(
      copyStatus(configuration.copy[locale].shared, component.tier),
    )}</span></div>
    <span class="discovery-row__action">${escapeHtml(action)}${isExplorer ? ' <i data-lucide="panel-right-open"></i>' : ""}</span>
  </li>`;
}

const COMPONENT_ICONS = Object.freeze({
  "app-shell": "panels-top-left",
  "evidence-list": "list-tree",
  "suggested-change-review": "git-compare-arrows",
  "execution-preview": "scan-eye",
  "agent-activity-trace": "bot",
  "background-task-queue": "list-restart",
  "story-timeline": "list-tree",
  "data-table": "table-2",
  "command-menu": "command",
  "authentication-dialog": "log-in",
  "code-block": "code-2",
  "button": "mouse-pointer-click",
});

// Every showcase-components reference renders exactly one specimen, so the
// iframe itself is already the isolation boundary. A second DOM focus crop
// would hide portalled overlays such as cmdk and Sonner.
const COMPONENT_STAGE_FOCUS_SELECTORS = Object.freeze({});

const PATTERN_ICONS = Object.freeze({
  "information-site": "book-open-text",
  "intelligence-workspace": "scan-search",
  "ecommerce-operations": "package-check",
  "engineering-canvas": "box-select",
});

function componentGalleryItem({ component, locale, publicPath, configuration }) {
  const itemCopy = configuration.copy[locale].components.items[component.id];
  const ui = DISCOVERY_UI_COPY[locale];
  const locator = configuration.locators.components[component.id];
  const explorerHref = directoryHref(publicPath, localizedPaths("components", component.id)[locale]);
  const referenceHref = componentReferenceHref(publicPath, locator, locale, { includeFragment: false });
  const referenceLocale = locator.query[locale].lang === "en" ? "en" : "zh-CN";
  const referenceLocaleMismatch = referenceLocale !== locale;
  const referenceLocaleNotice = referenceLocaleMismatch
    ? locale === "zh-CN"
      ? referenceLocale === "en"
        ? "英文参考"
        : "中文参考"
      : referenceLocale === "zh-CN"
        ? "Chinese reference"
        : "English reference"
    : "";

  return `<article class="component-gallery-card" data-component-card data-component-id="${escapeHtml(
    component.id,
  )}" data-component-name="${escapeHtml(
    itemCopy.display_name,
  )}" data-component-job="${escapeHtml(itemCopy.job)}" data-component-state="${escapeHtml(
    itemCopy.state_label,
  )}" data-component-reference="${escapeHtml(referenceHref)}" data-component-ready-fragment="${escapeHtml(
    locator.fragment,
  )}" data-component-focus-selector="${escapeHtml(
    COMPONENT_STAGE_FOCUS_SELECTORS[component.id] ?? "",
  )}" data-component-reference-language="${escapeHtml(
    referenceLocaleNotice,
  )}" data-component-reference-locale="${escapeHtml(referenceLocale)}" data-component-explorer="${escapeHtml(
    explorerHref,
  )}">
    <header class="component-gallery-card__header">
      <button class="component-gallery-card__choice" type="button" role="tab" id="component-choice-${escapeHtml(
        component.id,
      )}" aria-controls="component-workbench-stage" aria-selected="${component.id === FEATURED_COMPONENT_IDS[0] ? "true" : "false"}" tabindex="${
        component.id === FEATURED_COMPONENT_IDS[0] ? "0" : "-1"
      }" data-component-choice="${escapeHtml(component.id)}" data-component-name="${escapeHtml(
        itemCopy.display_name,
      )}" data-component-job="${escapeHtml(itemCopy.job)}" data-component-state="${escapeHtml(
        itemCopy.state_label,
      )}" data-component-reference="${escapeHtml(referenceHref)}" data-component-ready-fragment="${escapeHtml(
        locator.fragment,
      )}" data-component-reference-language="${escapeHtml(
        referenceLocaleNotice,
      )}" data-component-reference-locale="${escapeHtml(
        referenceLocale,
      )}" data-component-explorer="${escapeHtml(explorerHref)}" data-component-stage-height="${escapeHtml(
        COMPONENT_STAGE_HEIGHTS[component.id] ?? "clamp(520px, 62vh, 640px)",
      )}"><i data-lucide="${escapeHtml(COMPONENT_ICONS[component.id] ?? "component")}" aria-hidden="true"></i><span><strong lang="${escapeHtml(
        locale,
      )}">${escapeHtml(itemCopy.display_name)}</strong><small>${escapeHtml(itemCopy.state_label)}</small></span></button>
      <a href="${escapeHtml(explorerHref)}" aria-label="${escapeHtml(`${ui.open_explorer}: ${itemCopy.display_name}`)}">${escapeHtml(
        ui.open_explorer,
      )} <i data-lucide="arrow-right"></i></a>
    </header>
  </article>`;
}

function renderComponentIndex({ locale, publicPath, configuration, components, commandPairs }) {
  const localized = configuration.copy[locale];
  const copy = localized.components.page;
  const explorerCopy = localized.components.explorer;
  const ui = DISCOVERY_UI_COPY[locale];
  const alternatePaths = localizedPaths("components");
  const stable = [...components.values()].filter((component) => component.status === "stable");
  const secondary = [...components.values()].filter((component) => component.status !== "stable");
  const sortRecords = (records) =>
    [...records].sort(
      (left, right) => compareCodePoints(left.canonical_name, right.canonical_name) || compareCodePoints(left.id, right.id),
    );

  const stableGroups = configuration.display_order.component_tiers
    .map((tier) => {
      const records = sortRecords(stable.filter((component) => component.tier === tier));
      return `<section class="component-directory__group" aria-labelledby="tier-${escapeHtml(tier)}">
        <div class="section-heading section-heading--compact"><h2 id="tier-${escapeHtml(tier)}">${escapeHtml(
          copyStatus(localized.shared, tier),
        )}</h2><p>${localizedCatalogMarkup(components.catalog.tier_definitions[tier], locale, configuration)}</p></div>
        <ul class="discovery-list">${
          records.length === 0
            ? `<li class="discovery-list__empty">${escapeHtml(copy.empty_group)}</li>`
            : records
                .map((component) => componentRow({ component, locale, publicPath, configuration, copy }))
                .join("\n")
        }</ul>
      </section>`;
    })
    .join("\n");

  const secondaryGroups = configuration.display_order.component_secondary_statuses
    .map((status) => {
      const records = sortRecords(secondary.filter((component) => component.status === status));
      if (records.length === 0) return "";
      return `<section class="component-directory__group component-directory__group--secondary" aria-labelledby="status-${escapeHtml(
        status,
      )}">
        <div class="section-heading section-heading--compact"><h3 id="status-${escapeHtml(status)}">${escapeHtml(
          copyStatus(localized.shared, status),
        )}</h3><p>${localizedCatalogMarkup(components.catalog.status_definitions[status], locale, configuration)}</p></div>
        <ul class="discovery-list">${records
          .map((component) => componentRow({ component, locale, publicPath, configuration, copy }))
          .join("\n")}</ul>
      </section>`;
    })
    .join("\n");

  const featured = FEATURED_COMPONENT_IDS.map((id) => components.get(id));
  const workbenchComponentIds = [
    ...FEATURED_COMPONENT_IDS,
    ...SHOWCASE_COMPONENT_IDS.filter((id) => !FEATURED_COMPONENT_IDS.includes(id)),
  ];
  const workbenchComponents = workbenchComponentIds.map((id) => components.get(id));

  const content = `        <header class="discovery-hero discovery-hero--compact discovery-hero--components">
          <h1>${escapeHtml(ui.featured_components)}</h1>
          <p class="lead">${escapeHtml(ui.featured_components_intro)}</p>
        </header>
        <section class="component-browser" data-component-gallery data-component-workbench aria-label="${escapeHtml(
          ui.local_navigation,
        )}">
          <div class="component-gallery" role="tablist" aria-label="${escapeHtml(ui.local_navigation)}">
            ${workbenchComponents
              .map((component) =>
                componentGalleryItem({
                  component,
                  locale,
                  publicPath,
                  configuration,
                }),
              )
              .join("\n")}
          </div>
          ${(() => {
            const first = featured[0];
            const firstCopy = configuration.copy[locale].components.items[first.id];
            const firstLocator = configuration.locators.components[first.id];
            const firstReference = componentReferenceHref(publicPath, firstLocator, locale, { includeFragment: false });
            const firstReferenceLocale = firstLocator.query[locale].lang === "en" ? "en" : "zh-CN";
            const firstExplorer = directoryHref(publicPath, localizedPaths("components", first.id)[locale]);
            const referenceLocaleMismatch = firstReferenceLocale !== locale;
            return `<section class="reference-stage reference-stage--component-workbench" id="component-workbench-stage" data-reference-stage data-component-workbench-stage data-stage-ready="false" data-stage-viewport="wide" data-stage-context="isolated" data-ready-fragment="${escapeHtml(
              firstLocator.fragment,
            )}" data-component-id="${escapeHtml(first.id)}" data-stage-height="${escapeHtml(
              COMPONENT_STAGE_HEIGHTS[first.id] ?? "clamp(520px, 62vh, 640px)",
            )}" role="tabpanel" tabindex="0" aria-labelledby="component-choice-${escapeHtml(first.id)}">
              <header class="reference-stage__toolbar reference-stage__toolbar--component-workbench">
                <div class="reference-stage__identity"><span>${escapeHtml(ui.present_reference)}</span><strong data-stage-title>${escapeHtml(
                  firstCopy.display_name,
                )}</strong><small data-stage-job>${escapeHtml(firstCopy.job)}</small>${
                  referenceLocaleMismatch
                    ? `<small data-stage-language-note><i data-lucide="languages" aria-hidden="true"></i>${escapeHtml(
                        localeLabel(firstReferenceLocale),
                      )}</small>`
                    : ""
                }</div>
                <div class="reference-stage__controls">
                  <div class="stage-state-readout" aria-label="${escapeHtml(ui.states)}"><i data-lucide="circle-dot" aria-hidden="true"></i><span data-stage-state>${escapeHtml(
                    firstCopy.state_label,
                  )}</span></div>
                  <div class="stage-segmented" role="group" aria-label="${escapeHtml(ui.context)}">
                    <button type="button" data-stage-context="workflow" aria-pressed="false"><i data-lucide="panels-top-left" aria-hidden="true"></i><span>${escapeHtml(
                      ui.workflow,
                    )}</span></button>
                    <button type="button" data-stage-context="isolated" aria-pressed="true"><i data-lucide="focus" aria-hidden="true"></i><span>${escapeHtml(
                      ui.isolated,
                    )}</span></button>
                  </div>
                  <div class="stage-segmented" role="group" aria-label="${escapeHtml(ui.theme)}">
                    <button type="button" data-stage-theme="light" aria-pressed="false"><i data-lucide="sun" aria-hidden="true"></i><span>${escapeHtml(
                      ui.light,
                    )}</span></button>
                    <button type="button" data-stage-theme="dark" aria-pressed="true"><i data-lucide="moon" aria-hidden="true"></i><span>${escapeHtml(
                      ui.dark,
                    )}</span></button>
                  </div>
                  <div class="stage-segmented" role="group" aria-label="${escapeHtml(ui.viewport)}">
                    <button type="button" data-stage-viewport="wide" aria-pressed="true"><i data-lucide="monitor" aria-hidden="true"></i><span>${escapeHtml(
                      ui.wide,
                    )}</span></button>
                    <button type="button" data-stage-viewport="narrow" aria-pressed="false"><i data-lucide="smartphone" aria-hidden="true"></i><span>${escapeHtml(
                      ui.narrow,
                    )}</span></button>
                  </div>
                  <button class="reference-stage__reset" type="button" data-stage-reset aria-label="${escapeHtml(
                    ui.reset_reference,
                  )}" title="${escapeHtml(ui.reset_reference)}"><i data-lucide="rotate-ccw" aria-hidden="true"></i><span>${escapeHtml(
                    ui.reset_reference,
                  )}</span></button>
                </div>
              </header>
              <div class="reference-stage__viewport">
                <div class="reference-stage__loading" role="status" aria-live="polite" data-stage-loading><span></span>${escapeHtml(ui.preparing)}</div>
                <iframe src="${escapeHtml(firstReference)}" title="${escapeHtml(
                  `${firstCopy.display_name}: ${firstCopy.state_label}`,
                  )}" loading="lazy" data-stage-frame></iframe>
              </div>
              <footer class="reference-stage__footer">
                <div><span>${escapeHtml(explorerCopy.reference_language)}</span><strong data-stage-language-text lang="${escapeHtml(
                  firstReferenceLocale,
                )}">${escapeHtml(localeLabel(firstReferenceLocale))}</strong><small data-stage-language-note>${
                  referenceLocaleMismatch ? escapeHtml(explorerCopy.reference_language_mismatch) : ""
                }</small></div>
                <div class="reference-stage__footer-links"><a class="stage-text-link" data-stage-reference-link href="${escapeHtml(
                  componentReferenceHref(publicPath, firstLocator, locale),
                )}">${escapeHtml(ui.open_reference)} <i data-lucide="external-link" aria-hidden="true"></i></a><a class="stage-text-link" data-stage-explorer-link href="${escapeHtml(
                  firstExplorer,
                )}">${escapeHtml(ui.open_explorer_action)} <i data-lucide="arrow-right" aria-hidden="true"></i></a></div>
              </footer>
            </section>`;
          })()}
        </section>
        <details class="catalog-disclosure">
          <summary><span><strong>${escapeHtml(ui.full_catalog)}</strong><small>${escapeHtml(
            ui.full_catalog_hint,
          )}</small></span><i data-lucide="chevron-down"></i></summary>
          <div class="catalog-disclosure__body">
            <aside class="discovery-source-note" aria-labelledby="source-boundary-title">
              <i data-lucide="shield-check"></i><div><h2 id="source-boundary-title">${escapeHtml(
                localized.shared.source_boundary_title,
              )}</h2><p>${escapeHtml(localized.shared.source_boundary_body)}</p></div>
            </aside>
            <section class="component-directory" aria-labelledby="stable-components">
              <div class="section-heading"><h2 id="stable-components">${escapeHtml(copy.stable_heading)}</h2><p>${escapeHtml(
                copy.stable_intro,
              )}</p></div>
              ${stableGroups}
            </section>
            <hr class="section-rule">
            <section class="component-directory component-directory--secondary" aria-labelledby="secondary-components">
              <div class="section-heading"><h2 id="secondary-components">${escapeHtml(copy.other_heading)}</h2><p>${escapeHtml(
                copy.other_intro,
              )}</p></div>
              ${secondaryGroups}
            </section>
            <p class="showcase-source-link">${sourceLink("components/catalog.json", copy.catalog_link)}</p>
          </div>
        </details>`;

  return renderShell({
    locale,
    publicPath,
    alternatePaths,
    title: `${copy.title} · ${localized.shared.site_name}`,
    description: copy.lead,
    route: "components",
    activeNav: "components",
    content,
    commandPairs,
  });
}

function evidencePathList(paths, empty = "") {
  return list(
    paths,
    (repositoryPath) => `<li>${sourceLink(repositoryPath)}</li>`,
    empty === "" ? "" : `<li>${escapeHtml(empty)}</li>`,
  );
}

function textList(items, empty = "", renderItem = escapeHtml) {
  return list(items, (item) => `<li>${renderItem(item)}</li>`, empty === "" ? "" : `<li>${escapeHtml(empty)}</li>`);
}

function renderComponentExplorer({ id, locale, publicPath, configuration, components, commandPairs }) {
  const localized = configuration.copy[locale];
  const copy = localized.components.explorer;
  const ui = DISCOVERY_UI_COPY[locale];
  const component = components.get(id);
  const itemCopy = localized.components.items[id];
  const locator = configuration.locators.components[id];
  const alternatePaths = localizedPaths("components", id);
  const referenceHref = componentReferenceHref(publicPath, locator, locale);
  const referenceFrameHref = componentReferenceHref(publicPath, locator, locale, { includeFragment: false });
  const referenceLocale = locator.query[locale].lang === "en" ? "en" : "zh-CN";
  const referenceLocaleMismatch = referenceLocale !== locale;
  const supportRows = [
    ["themes", copy.themes],
    ["responsive", copy.responsive],
    ["keyboard", copy.keyboard],
    ["touch", copy.touch],
    ["reduced_motion", copy.reduced_motion],
  ];
  const railComponentIds = FEATURED_COMPONENT_IDS.includes(id)
    ? FEATURED_COMPONENT_IDS
    : [...FEATURED_COMPONENT_IDS, id];
  const featuredNavigation = railComponentIds.map((componentId) => {
    const active = componentId === id ? ' aria-current="page"' : "";
    const displayName = localized.components.items[componentId].display_name;
    return `<a href="${escapeHtml(
      directoryHref(publicPath, localizedPaths("components", componentId)[locale]),
    )}"${active}${componentId === id && !FEATURED_COMPONENT_IDS.includes(id) ? ' class="component-studio__navigation-current"' : ""}><i data-lucide="${escapeHtml(COMPONENT_ICONS[componentId] ?? "component")}"></i><span lang="${escapeHtml(
      locale,
    )}">${escapeHtml(displayName)}</span></a>`;
  }).join("\n");

  const content = `        <div class="component-studio">
          <aside class="component-studio__navigation" aria-label="${escapeHtml(ui.local_navigation)}">
            <a class="back-link" href="${escapeHtml(directoryHref(publicPath, localizedPaths("components")[locale]))}"><i data-lucide="arrow-left"></i>${escapeHtml(
              copy.back,
            )}</a>
            <p class="component-studio__navigation-label">${escapeHtml(ui.featured_rail)}</p>
            <nav aria-label="${escapeHtml(ui.local_navigation)}">${featuredNavigation}</nav>
          </aside>
          <div class="component-studio__main">
            <header class="component-studio__header" data-component-id="${escapeHtml(component.id)}">
              <div><h1 lang="${escapeHtml(locale)}">${escapeHtml(
                itemCopy.display_name,
              )}</h1><p>${escapeHtml(itemCopy.job)}</p></div>
              <div class="component-explorer__identity"><code>${escapeHtml(component.id)}</code>${statusBadge(
                component.status,
                localized.shared,
              )}<span>${escapeHtml(copyStatus(localized.shared, component.tier))}</span></div>
            </header>
            <section class="reference-stage reference-stage--explorer" data-reference-stage data-stage-ready="false" data-stage-viewport="wide" data-stage-context="isolated" data-ready-fragment="${escapeHtml(
              locator.fragment,
            )}"${
              COMPONENT_STAGE_FOCUS_SELECTORS[id]
                ? ` data-focus-selector="${escapeHtml(COMPONENT_STAGE_FOCUS_SELECTORS[id])}"`
                : ""
            } data-component-id="${escapeHtml(id)}" data-stage-height="${escapeHtml(
              COMPONENT_STAGE_HEIGHTS[id] ?? "clamp(520px, 62vh, 640px)",
            )}" aria-labelledby="reference-title">
            <header class="reference-stage__toolbar reference-stage__toolbar--explorer">
              <div class="reference-stage__identity"><span id="reference-title">${escapeHtml(
                  ui.present_reference,
                )}</span><strong>${escapeHtml(itemCopy.display_name)}</strong>${
                  referenceLocaleMismatch
                    ? `<small><i data-lucide="languages"></i>${escapeHtml(localeLabel(referenceLocale))}</small>`
                    : ""
                }</div>
              <div class="reference-stage__controls">
                  <div class="stage-state-readout" aria-label="${escapeHtml(ui.states)}"><i data-lucide="circle-dot"></i><span>${escapeHtml(
                    itemCopy.state_label,
                  )}</span></div>
                  <div class="stage-segmented" role="group" aria-label="${escapeHtml(ui.context)}">
                    <button type="button" data-stage-context="workflow" aria-pressed="false"><i data-lucide="panels-top-left"></i><span>${escapeHtml(
                      ui.workflow,
                    )}</span></button>
                    <button type="button" data-stage-context="isolated" aria-pressed="true"><i data-lucide="focus"></i><span>${escapeHtml(
                      ui.isolated,
                    )}</span></button>
                  </div>
                  <div class="stage-segmented" role="group" aria-label="${escapeHtml(ui.theme)}">
                    <button type="button" data-stage-theme="light" aria-pressed="false"><i data-lucide="sun"></i><span>${escapeHtml(
                      ui.light,
                    )}</span></button>
                    <button type="button" data-stage-theme="dark" aria-pressed="true"><i data-lucide="moon"></i><span>${escapeHtml(
                      ui.dark,
                    )}</span></button>
                  </div>
                  <div class="stage-segmented" role="group" aria-label="${escapeHtml(ui.viewport)}">
                    <button type="button" data-stage-viewport="wide" aria-pressed="true"><i data-lucide="monitor"></i><span>${escapeHtml(
                      ui.wide,
                    )}</span></button>
                    <button type="button" data-stage-viewport="narrow" aria-pressed="false"><i data-lucide="smartphone"></i><span>${escapeHtml(
                      ui.narrow,
                    )}</span></button>
                  </div>
                </div>
              </header>
              <div class="reference-stage__viewport">
                <div class="reference-stage__loading" data-stage-loading><span></span>${escapeHtml(ui.preparing)}</div>
                <iframe src="${escapeHtml(referenceFrameHref)}" title="${escapeHtml(
                  `${copy.reference_heading}: ${itemCopy.state_label}`,
                )}" loading="eager" data-stage-frame></iframe>
              </div>
              <footer class="reference-stage__footer">
                <div><span>${escapeHtml(copy.reference_language)}</span><strong lang="${escapeHtml(
                  referenceLocale,
                )}">${escapeHtml(localeLabel(referenceLocale))}</strong>${
                  referenceLocaleMismatch
                    ? `<small class="reference-language-note">${escapeHtml(copy.reference_language_mismatch)}</small>`
                    : ""
                }</div>
                <a class="stage-text-link" href="${escapeHtml(referenceHref)}">${escapeHtml(
                  copy.open_reference,
                )} <i data-lucide="external-link"></i></a>
              </footer>
            </section>
            <section class="component-detail-tabs" data-component-tabs>
              <div class="component-detail-tabs__list" role="tablist">
                <button type="button" role="tab" id="usage-tab" aria-controls="usage-panel" aria-selected="true" tabindex="0">${escapeHtml(
                  ui.usage,
                )}</button>
                <button type="button" role="tab" id="states-tab" aria-controls="states-panel" aria-selected="false" tabindex="-1">${escapeHtml(
                  ui.states,
                )}</button>
                <button type="button" role="tab" id="accessibility-tab" aria-controls="accessibility-panel" aria-selected="false" tabindex="-1">${escapeHtml(
                  ui.accessibility,
                )}</button>
                <button type="button" role="tab" id="contract-tab" aria-controls="contract-panel" aria-selected="false" tabindex="-1">${escapeHtml(
                  ui.contract,
                )}</button>
              </div>
              <div class="component-detail-tabs__panel" role="tabpanel" id="usage-panel" aria-labelledby="usage-tab">
                <h2>${escapeHtml(copy.user_job)}</h2><p>${escapeHtml(itemCopy.job)}</p>
              </div>
              <div class="component-detail-tabs__panel" role="tabpanel" id="states-panel" aria-labelledby="states-tab" hidden>
                <h2>${escapeHtml(copy.state_coverage)}</h2><p>${escapeHtml(copy.states_boundary)}</p>
                <dl><div><dt>${escapeHtml(copy.inspected_state)}</dt><dd>${escapeHtml(
                  itemCopy.state_label,
                )} <code>${escapeHtml(locator.state_id)}</code></dd></div></dl>
                <p>${sourceLink("components/core-states.md", copy.states_contract)}</p>
              </div>
              <div class="component-detail-tabs__panel" role="tabpanel" id="accessibility-panel" aria-labelledby="accessibility-tab" hidden>
                <h2>${escapeHtml(copy.support)}</h2><dl class="component-support-grid">
                  ${supportRows
                    .map(
                      ([key, label]) =>
                        `<div><dt>${escapeHtml(label)}</dt><dd data-supported="${component.support[key]}">${escapeHtml(
                          component.support[key] ? copy.supported : copy.not_recorded,
                        )}</dd></div>`,
                    )
                    .join("\n")}
                </dl><p>${escapeHtml(copy.accessibility_boundary_body)}</p>
              </div>
              <div class="component-detail-tabs__panel" role="tabpanel" id="contract-panel" aria-labelledby="contract-tab" hidden>
                <aside class="contract-boundary"><i data-lucide="info"></i><p>${escapeHtml(itemCopy.boundary)}</p></aside>
                <div class="evidence-columns">
                  <section><h3>${escapeHtml(copy.contracts)}</h3><ul>${evidencePathList(
                    component.contract_paths,
                  )}</ul></section>
                  <section><h3>${escapeHtml(copy.tests)}</h3><ul>${evidencePathList(
                    component.test_paths,
                  )}</ul></section>
                  <section><h3>${escapeHtml(copy.manual_checks)}</h3><ul>${textList(
                    component.manual_checks,
                    "",
                    (item) => localizedCatalogMarkup(item, locale, configuration),
                  )}</ul></section>
                </div>
                <section class="known-gaps"><h3>${escapeHtml(copy.known_gaps)}</h3><ul>${textList(
                  component.known_gaps,
                  copy.no_known_gaps,
                  (item) => localizedCatalogMarkup(item, locale, configuration),
                )}</ul></section>
                <p>${sourceLink("components/catalog.json", localized.shared.catalog_record)}</p>
              </div>
            </section>
          </div>
        </div>`;

  return renderShell({
    locale,
    publicPath,
    alternatePaths,
    title: `${itemCopy.display_name} · ${localized.shared.site_name}`,
    description: itemCopy.job,
    route: "component-explorer",
    activeNav: "components",
    content,
    commandPairs,
  });
}

function renderPatternChoice({ id, locale, publicPath, configuration, scenarios, active }) {
  const localized = configuration.copy[locale];
  const itemCopy = localized.patterns.items[id];
  const locator = configuration.locators.patterns[id];
  const scenario = scenarios.get(locator.scenario_id);
  const referenceControl = scenarioReferenceControl(scenario);
  const referenceHref = scenarioReferenceHref(publicPath, scenario, locale, locator.reference_language);
  const referenceLocale = locator.reference_language === "localized" ? locale : locator.reference_language;
  const initialTheme = id === "information-site" ? "light" : "dark";

  return `<button type="button" role="tab" id="pattern-choice-${escapeHtml(id)}" aria-controls="pattern-${escapeHtml(
    id,
  )}" aria-selected="${active}" tabindex="${active ? "0" : "-1"}" data-pattern-choice="${escapeHtml(
    id,
  )}" data-pattern-name="${escapeHtml(itemCopy.label)}" data-pattern-summary="${escapeHtml(
    itemCopy.summary,
  )}" data-pattern-reference="${escapeHtml(referenceHref)}" data-pattern-ready-selector="${escapeHtml(
    referenceControl.assertion.selector,
  )}" data-pattern-theme="${initialTheme}" data-pattern-lab="${escapeHtml(
    scenarioLabHref(publicPath, scenario, locale),
  )}" data-pattern-language="${escapeHtml(localeLabel(referenceLocale))}">
    <i data-lucide="${escapeHtml(PATTERN_ICONS[id] ?? "panel-top")}"></i>
    <span><strong>${escapeHtml(itemCopy.label)}</strong><small>${escapeHtml(itemCopy.summary)}</small></span>
  </button>`;
}

function renderPatternContextPanel({ id, locale, publicPath, configuration, pages, scenarios, active }) {
  const localized = configuration.copy[locale];
  const copy = localized.patterns.page;
  const ui = DISCOVERY_UI_COPY[locale];
  const itemCopy = localized.patterns.items[id];
  const locator = configuration.locators.patterns[id];
  const page = pages.get(locator.page_id);
  const scenario = scenarios.get(locator.scenario_id);
  const referenceLocale = locator.reference_language === "localized" ? locale : locator.reference_language;
  const referenceLocaleMismatch = referenceLocale !== locale;
  const referenceHref = scenarioReferenceHref(publicPath, scenario, locale, locator.reference_language);

  return `<section class="pattern-browser__context" id="pattern-${escapeHtml(
    id,
  )}" role="tabpanel" aria-labelledby="pattern-choice-${escapeHtml(id)}" data-pattern-context="${escapeHtml(id)}"${
    active ? "" : " hidden"
  }>
    <dl class="pattern-context-strip">
      <div><dt>${escapeHtml(copy.first_view)}</dt><dd>${localizedCatalogMarkup(
        scenario.composition.first_meaningful_view,
        locale,
        configuration,
      )}</dd></div>
      <div><dt>${escapeHtml(copy.dominant_region)}</dt><dd>${localizedCatalogMarkup(
        scenario.composition.dominant_region,
        locale,
        configuration,
      )}</dd></div>
      <div><dt>${escapeHtml(copy.persistent_context)}</dt><dd>${localizedCatalogMarkup(
        scenario.composition.persistent_context,
        locale,
        configuration,
      )}</dd></div>
    </dl>
    <details class="pattern-details">
      <summary><span>${escapeHtml(ui.pattern_details)}</span><i data-lucide="chevron-down"></i></summary>
      <div class="pattern-details__body">
        <div class="pattern-records">
          <section><p class="record-kicker">${escapeHtml(copy.page_record)}</p><h3>${localizedCatalogMarkup(
            page.canonical_name,
            locale,
            configuration,
          )}</h3><dl><div><dt>${escapeHtml(copy.page_status)}</dt><dd>${statusBadge(
            page.status,
            localized.shared,
          )}</dd></div><div><dt>ID</dt><dd><code>${escapeHtml(page.id)}</code></dd></div></dl></section>
          <section><p class="record-kicker">${escapeHtml(copy.scenario_record)}</p><h3>${localizedCatalogMarkup(
            scenario.canonical_name,
            locale,
            configuration,
          )}</h3><dl><div><dt>${escapeHtml(copy.scenario_presentation)}</dt><dd>${statusBadge(
            scenario.presentation_status,
            localized.shared,
          )}</dd></div><div><dt>ID</dt><dd><code>${escapeHtml(scenario.id)}</code></dd></div></dl></section>
        </div>
        <section class="pattern-job"><h3>${escapeHtml(copy.primary_job)}</h3><p>${localizedCatalogMarkup(
          scenario.user_job,
          locale,
          configuration,
        )}</p></section>
        <section class="pattern-prohibitions"><h3>${escapeHtml(copy.prohibited)}</h3><ul>${textList(
          itemCopy.prohibited_substitutions,
        )}</ul></section>
        <footer class="pattern-discovery-section__sources">
          <div class="pattern-source-copy">
            <p><strong>${escapeHtml(copy.governing_contract)}</strong>${sourceLink(locator.document_path)}</p>
            <p><strong>${escapeHtml(copy.reference_language)}</strong><span lang="${escapeHtml(
              referenceLocale,
            )}">${escapeHtml(localeLabel(referenceLocale))}</span></p>
            ${referenceLocaleMismatch ? `<p class="reference-language-note">${escapeHtml(
              copy.reference_language_mismatch,
            )}</p>` : ""}
          </div>
          <a class="button" href="${escapeHtml(referenceHref)}">${escapeHtml(
            referenceLocaleMismatch ? copy.open_chinese_reference : copy.open_reference,
          )} <i data-lucide="external-link"></i></a>
        </footer>
      </div>
    </details>
  </section>`;
}

function renderPatternIndex({ locale, publicPath, configuration, pages, scenarios, commandPairs }) {
  const localized = configuration.copy[locale];
  const copy = localized.patterns.page;
  const ui = DISCOVERY_UI_COPY[locale];
  const alternatePaths = localizedPaths("patterns");
  const firstId = SHOWCASE_PATTERN_IDS[0];
  const firstLocator = configuration.locators.patterns[firstId];
  const firstScenario = scenarios.get(firstLocator.scenario_id);
  const firstControl = scenarioReferenceControl(firstScenario);
  const firstReference = scenarioReferenceHref(
    publicPath,
    firstScenario,
    locale,
    firstLocator.reference_language,
  );
  const firstReferenceLocale = firstLocator.reference_language === "localized"
    ? locale
    : firstLocator.reference_language;
  const firstCopy = localized.patterns.items[firstId];
  const content = `        <header class="discovery-hero discovery-hero--compact">
          <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
          <h1>${escapeHtml(copy.title)}</h1>
          <p class="lead">${escapeHtml(copy.lead)}</p>
        </header>
        <div class="pattern-browser" data-pattern-browser>
          <div class="pattern-browser__selector" role="tablist" aria-label="${escapeHtml(copy.title)}">
            ${SHOWCASE_PATTERN_IDS.map((id, index) =>
              renderPatternChoice({
                id,
                locale,
                publicPath,
                configuration,
                scenarios,
                active: index === 0,
              }),
            ).join("\n")}
          </div>
          <header class="pattern-browser__heading">
            <div><h2 data-pattern-title>${escapeHtml(firstCopy.label)}</h2><p data-pattern-summary>${escapeHtml(
              firstCopy.summary,
            )}</p></div>
            <a class="stage-text-link" data-pattern-lab data-showcase-lab-link href="${escapeHtml(
              scenarioLabHref(publicPath, firstScenario, locale),
            )}">${escapeHtml(copy.open_lab)} <i data-lucide="arrow-up-right"></i></a>
          </header>
          <div class="reference-stage reference-stage--pattern-browser" data-reference-stage data-stage-ready="false" data-stage-viewport="wide" data-initial-theme="light" data-ready-selector="${escapeHtml(
            firstControl.assertion.selector,
          )}">
            <header class="reference-stage__toolbar">
              <div class="reference-stage__identity"><span>${escapeHtml(ui.pattern_reference)}</span><strong data-pattern-stage-title>${escapeHtml(
                firstCopy.label,
              )}</strong><small><i data-lucide="languages"></i><span data-pattern-language>${escapeHtml(
                localeLabel(firstReferenceLocale),
              )}</span></small></div>
              <div class="reference-stage__controls">
                <div class="stage-segmented" role="group" aria-label="${escapeHtml(ui.theme)}">
                  <button type="button" data-stage-theme="light" aria-pressed="true"><i data-lucide="sun"></i><span>${escapeHtml(
                    ui.light,
                  )}</span></button>
                  <button type="button" data-stage-theme="dark" aria-pressed="false"><i data-lucide="moon"></i><span>${escapeHtml(
                    ui.dark,
                  )}</span></button>
                </div>
                <div class="stage-segmented" role="group" aria-label="${escapeHtml(ui.viewport)}">
                  <button type="button" data-stage-viewport="wide" aria-pressed="true"><i data-lucide="monitor"></i><span>${escapeHtml(
                    ui.wide,
                  )}</span></button>
                  <button type="button" data-stage-viewport="narrow" aria-pressed="false"><i data-lucide="smartphone"></i><span>${escapeHtml(
                    ui.narrow,
                  )}</span></button>
                </div>
              </div>
            </header>
            <div class="reference-stage__viewport">
              <div class="reference-stage__loading" data-stage-loading><span></span>${escapeHtml(ui.preparing)}</div>
              <iframe src="${escapeHtml(firstReference)}" title="${escapeHtml(
                `${ui.pattern_reference}: ${firstCopy.label}`,
              )}" loading="eager" data-stage-frame></iframe>
            </div>
          </div>
          <div class="pattern-browser__contexts">
            ${SHOWCASE_PATTERN_IDS.map((id, index) =>
              renderPatternContextPanel({
                id,
                locale,
                publicPath,
                configuration,
                pages,
                scenarios,
                active: index === 0,
              }),
            ).join("\n")}
          </div>
        </div>
        <details class="catalog-disclosure catalog-disclosure--compact">
          <summary><span><strong>${escapeHtml(copy.maturity_note)}</strong><small>${escapeHtml(
            copy.catalog_link,
          )}</small></span><i data-lucide="chevron-down"></i></summary>
          <div class="catalog-disclosure__body"><p class="showcase-source-link">${sourceLink(
            "pages/catalog.json",
            copy.catalog_link,
          )}</p></div>
        </details>`;

  return renderShell({
    locale,
    publicPath,
    alternatePaths,
    title: `${copy.title} · ${localized.shared.site_name}`,
    description: copy.lead,
    route: "patterns",
    activeNav: "patterns",
    content,
    commandPairs,
  });
}

function prepareOutput(root, output) {
  const realRoot = fs.realpathSync(root);
  const expectedOutput = path.join(realRoot, ".site-dist");
  if (path.resolve(output) !== expectedOutput) {
    fail(`output must be exactly ${expectedOutput}.`);
  }

  if (!fs.existsSync(expectedOutput)) fs.mkdirSync(expectedOutput);
  const outputStat = fs.lstatSync(expectedOutput);
  if (outputStat.isSymbolicLink() || !outputStat.isDirectory()) {
    fail("output must be a real .site-dist directory, not a symbolic link or file.");
  }
  if (fs.realpathSync(expectedOutput) !== expectedOutput) fail("output must remain inside the repository root.");
  return { realRoot, realOutput: expectedOutput };
}

/**
 * Generate the catalog-backed, non-normative Component and Pattern discovery routes.
 *
 * @param {{ root: string, output: string }} options
 * @returns {readonly string[]} the exact generated public paths
 */
export function buildShowcasePages({ root, output } = {}) {
  assertNonEmptyString(root, "root");
  assertNonEmptyString(output, "output");
  const { realRoot, realOutput } = prepareOutput(root, output);

  const configuration = readJson(realRoot, "site/showcase.config.json");
  const componentCatalog = readJson(realRoot, "components/catalog.json");
  const pageCatalog = readJson(realRoot, "pages/catalog.json");
  const scenarioCatalog = readJson(realRoot, "scenarios/catalog.json");
  const scenarioLocaleCatalog = readJson(realRoot, "site/scenarios/locale.zh-CN.json");

  const components = validateRecordCatalog(realRoot, componentCatalog, "component");
  const pages = validateRecordCatalog(realRoot, pageCatalog, "page");
  const scenarios = validateScenarios(realRoot, scenarioCatalog, pages);
  validateScenarioLocale(scenarioLocaleCatalog, scenarios);
  components.catalog = componentCatalog;
  pages.catalog = pageCatalog;
  validateConfiguration(realRoot, configuration, components, pages, scenarios);

  const routes = {
    components: localizedPaths("components"),
    patterns: localizedPaths("patterns"),
  };
  const commandPairs = { copy: configuration.copy, routes };
  const generated = new Map();

  for (const locale of LOCALES) {
    const componentIndexPath = localizedPaths("components")[locale];
    generated.set(
      componentIndexPath,
      renderComponentIndex({
        locale,
        publicPath: componentIndexPath,
        configuration,
        components,
        commandPairs,
      }),
    );

    for (const id of SHOWCASE_COMPONENT_IDS) {
      const explorerPath = localizedPaths("components", id)[locale];
      generated.set(
        explorerPath,
        renderComponentExplorer({
          id,
          locale,
          publicPath: explorerPath,
          configuration,
          components,
          commandPairs,
        }),
      );
    }

    const patternPath = localizedPaths("patterns")[locale];
    generated.set(
      patternPath,
      renderPatternIndex({
        locale,
        publicPath: patternPath,
        configuration,
        pages,
        scenarios,
        commandPairs,
      }),
    );
  }

  const actualPaths = [...generated.keys()];
  assertExactArray(actualPaths, SHOWCASE_GENERATED_PATHS, "generated showcase paths");
  for (const publicPath of SHOWCASE_GENERATED_PATHS) {
    writeFileSafelyWithin(realOutput, publicPath, finalizeText(generated.get(publicPath)));
  }

  return SHOWCASE_GENERATED_PATHS;
}
