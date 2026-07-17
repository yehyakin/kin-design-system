import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const catalogPath = path.resolve(root, "scenarios/catalog.json");
const schemaPath = path.resolve(root, "scenarios/catalog.schema.json");
const pageCatalogPath = path.resolve(root, "pages/catalog.json");
const findings = [];

function add(field, message, file = "scenarios/catalog.json") {
  findings.push({ file, field, message });
}

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    add("$", "invalid JSON or unreadable file: " + error.message, label);
    return null;
  }
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim() !== "";
}

function checkStringArray(field, value, allowed, minimum = 0) {
  if (!Array.isArray(value)) {
    add(field, "must be an array");
    return;
  }
  if (value.length < minimum) add(field, "must contain at least " + minimum + " item(s)");
  if (new Set(value).size !== value.length) add(field, "must not contain duplicates");
  for (const item of value) {
    if (!nonEmpty(item)) {
      add(field, "must contain non-empty strings");
      continue;
    }
    if (allowed && !allowed.has(item)) add(field, "contains unsupported value: " + item);
  }
}

function checkInspectionDefaults(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    add("inspection_defaults", "must define viewport and theme inspection modes");
    return;
  }

  const viewports = Array.isArray(value.viewports) ? value.viewports : [];
  const themes = Array.isArray(value.themes) ? value.themes : [];
  if (viewports.length !== 2) add("inspection_defaults.viewports", "must define exactly wide and narrow modes");
  if (themes.length !== 4) add("inspection_defaults.themes", "must define exactly four theme modes");

  const expectedViewports = new Map([["wide", [1180, 760]], ["narrow", [390, 844]]]);
  const viewportIds = new Set();
  for (const [index, viewport] of viewports.entries()) {
    const field = "inspection_defaults.viewports[" + index + "]";
    if (!viewport || typeof viewport !== "object" || Array.isArray(viewport)) {
      add(field, "must be an object");
      continue;
    }
    if (!expectedViewports.has(viewport.id)) add(field + ".id", "unsupported viewport: " + viewport.id);
    else if (viewportIds.has(viewport.id)) add(field + ".id", "duplicate viewport: " + viewport.id);
    else viewportIds.add(viewport.id);
    if (!nonEmpty(viewport.label)) add(field + ".label", "must be a non-empty string");
    if (!Number.isInteger(viewport.width) || !Number.isInteger(viewport.height)) add(field, "width and height must be integers");
    const expected = expectedViewports.get(viewport.id);
    if (expected && (viewport.width !== expected[0] || viewport.height !== expected[1])) add(field, "must use the reviewed " + expected[0] + " by " + expected[1] + " fixture");
    const extra = Object.keys(viewport).filter((key) => !["id", "label", "width", "height"].includes(key));
    if (extra.length > 0) add(field, "contains unsupported fields: " + extra.join(", "));
  }

  const expectedThemes = new Map([
    ["light", ["light", "normal"]],
    ["dark", ["dark", "normal"]],
    ["light-high-contrast", ["light", "more"]],
    ["dark-high-contrast", ["dark", "more"]]
  ]);
  const themeIds = new Set();
  for (const [index, theme] of themes.entries()) {
    const field = "inspection_defaults.themes[" + index + "]";
    if (!theme || typeof theme !== "object" || Array.isArray(theme)) {
      add(field, "must be an object");
      continue;
    }
    if (!expectedThemes.has(theme.id)) add(field + ".id", "unsupported theme: " + theme.id);
    else if (themeIds.has(theme.id)) add(field + ".id", "duplicate theme: " + theme.id);
    else themeIds.add(theme.id);
    if (!nonEmpty(theme.label)) add(field + ".label", "must be a non-empty string");
    const expected = expectedThemes.get(theme.id);
    if (expected && (theme.theme !== expected[0] || theme.contrast !== expected[1])) add(field, "theme and contrast do not match " + theme.id);
    const extra = Object.keys(theme).filter((key) => !["id", "label", "theme", "contrast"].includes(key));
    if (extra.length > 0) add(field, "contains unsupported fields: " + extra.join(", "));
  }
}

function cleanReference(candidate) {
  return candidate.split(/[?#]/)[0];
}

function checkRepositoryPath(field, candidate, allowQuery = false) {
  if (!nonEmpty(candidate)) {
    add(field, "must be a non-empty repository-relative path");
    return;
  }
  if (path.isAbsolute(candidate) || /^https?:[/][/]/.test(candidate)) {
    add(field, "must be repository-relative: " + candidate);
    return;
  }
  const clean = allowQuery ? cleanReference(candidate) : candidate;
  if (!fs.existsSync(path.resolve(root, clean))) add(field, "path does not exist: " + candidate);
}

const catalog = readJson(catalogPath, "scenarios/catalog.json");
const schema = readJson(schemaPath, "scenarios/catalog.schema.json");
const pageCatalog = readJson(pageCatalogPath, "pages/catalog.json");

const allowedGroups = new Set(["intelligence", "information", "ecommerce", "engineering", "shared"]);
const allowedProfiles = new Set(["information-site", "intelligence-workspace", "ecommerce-operations", "engineering-canvas", "all", "conditional"]);
const allowedWaves = new Set(["P0", "P1", "P2"]);
const allowedSourceMaturity = new Set(["stable", "candidate", "draft"]);
const allowedPresentation = new Set(["planned", "linked", "showcased"]);
const allowedStates = new Set(["normal", "loading", "empty", "partial", "stale", "offline", "permission", "rate-limit", "error", "conflict", "recovery", "pending", "committed", "failed", "undo", "rollback"]);
const allowedViewports = new Set(["wide", "narrow"]);
const allowedThemes = new Set(["light", "dark", "light-high-contrast", "dark-high-contrast"]);
const allowedAssertionKinds = new Set(["visible", "attribute", "text"]);
const expectedPilots = ["INT-01", "INF-01", "COM-01", "ENG-01", "CORE-01", "WORK-01"];
const expectedPhase3Shared = ["CORE-02", "CORE-03", "CORE-04", "CORE-05", "CORE-06"];
const expectedPhase3ProductFamily = ["INF-02", "INF-03", "COM-02", "ENG-02"];
const statusRank = { deprecated: 0, draft: 1, candidate: 2, stable: 3 };
const prefixGroups = {
  INT: "intelligence",
  INF: "information",
  COM: "ecommerce",
  ENG: "engineering",
  CORE: "shared",
  WORK: "shared",
  COND: "shared"
};

if (schema) {
  if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") add("$schema", "must use JSON Schema draft 2020-12", "scenarios/catalog.schema.json");
  if (!schema.$defs || !schema.$defs.scenario) add("$defs.scenario", "scenario definition is missing", "scenarios/catalog.schema.json");
  if (!schema.$defs?.stateControl || !schema.$defs?.stateAssertion) add("$defs.stateControl", "state-control definitions are missing", "scenarios/catalog.schema.json");
}

const pageMap = new Map((pageCatalog && Array.isArray(pageCatalog.pages) ? pageCatalog.pages : []).map((page) => [page.id, page]));
const ids = new Set();
const names = new Set();

if (catalog) {
  if (catalog.$schema !== "./catalog.schema.json") add("$schema", "must equal ./catalog.schema.json");
  if (catalog.schema_version !== "1.1.0") add("schema_version", "must equal 1.1.0");
  if (!/^[0-9]+[.][0-9]+[.][0-9]+$/.test(catalog.catalog_version || "")) add("catalog_version", "must be SemVer");
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(catalog.reviewed_on || "")) add("reviewed_on", "must be an ISO date");
  checkStringArray("pilot_ids", catalog.pilot_ids, null, 6);
  if (Array.isArray(catalog.pilot_ids) && [...catalog.pilot_ids].sort().join("|") !== [...expectedPilots].sort().join("|")) {
    add("pilot_ids", "must contain the approved six P0 scenario IDs");
  }
  if (!catalog.presentation_status_definitions || typeof catalog.presentation_status_definitions !== "object") {
    add("presentation_status_definitions", "must define planned, linked, and showcased");
  } else {
    for (const status of allowedPresentation) {
      if (!nonEmpty(catalog.presentation_status_definitions[status])) add("presentation_status_definitions." + status, "must be a non-empty string");
    }
  }
  checkStringArray("known_gaps", catalog.known_gaps, null, 1);
  checkInspectionDefaults(catalog.inspection_defaults);

  if (!Array.isArray(catalog.scenarios)) {
    add("scenarios", "must contain the approved 30-entry Phase 1 matrix");
  } else {
    if (catalog.scenarios.length !== 30) add("scenarios", "must contain the approved 30-entry Phase 1 matrix");
    for (const [index, scenario] of catalog.scenarios.entries()) {
      const base = "scenarios[" + index + "]";
      if (!scenario || typeof scenario !== "object" || Array.isArray(scenario)) {
        add(base, "must be an object");
        continue;
      }
      if (!/^(INT|INF|COM|ENG|CORE|WORK|COND)-[0-9]{2}$/.test(scenario.id || "")) {
        add(base + ".id", "must use the approved scenario ID form");
      } else if (ids.has(scenario.id)) {
        add(base + ".id", "duplicate ID: " + scenario.id);
      } else {
        ids.add(scenario.id);
        const prefix = scenario.id.split("-")[0];
        if (prefixGroups[prefix] !== scenario.group) add(base + ".group", "does not match ID prefix " + prefix);
      }

      if (!nonEmpty(scenario.canonical_name)) add(base + ".canonical_name", "must be a non-empty string");
      else if (names.has(scenario.canonical_name)) add(base + ".canonical_name", "duplicate canonical name: " + scenario.canonical_name);
      else names.add(scenario.canonical_name);

      if (!allowedGroups.has(scenario.group)) add(base + ".group", "unsupported group: " + scenario.group);
      checkStringArray(base + ".product_profiles", scenario.product_profiles, allowedProfiles, 1);
      if (!allowedWaves.has(scenario.wave)) add(base + ".wave", "unsupported wave: " + scenario.wave);
      for (const field of ["user_job", "entry", "completion"]) {
        if (!nonEmpty(scenario[field])) add(base + "." + field, "must be a non-empty string");
      }

      if (!scenario.composition || typeof scenario.composition !== "object" || Array.isArray(scenario.composition)) {
        add(base + ".composition", "must be an object");
      } else {
        for (const field of ["first_meaningful_view", "dominant_region", "persistent_context"]) {
          if (!nonEmpty(scenario.composition[field])) add(base + ".composition." + field, "must be a non-empty string");
        }
        const extra = Object.keys(scenario.composition).filter((field) => !["first_meaningful_view", "dominant_region", "persistent_context"].includes(field));
        if (extra.length > 0) add(base + ".composition", "contains unsupported fields: " + extra.join(", "));
      }

      checkStringArray(base + ".contract_paths", scenario.contract_paths, null, 1);
      if (Array.isArray(scenario.contract_paths)) {
        for (const [pathIndex, candidate] of scenario.contract_paths.entries()) checkRepositoryPath(base + ".contract_paths[" + pathIndex + "]", candidate);
      }

      checkStringArray(base + ".page_ids", scenario.page_ids, null, 1);
      const pages = [];
      if (Array.isArray(scenario.page_ids)) {
        for (const pageId of scenario.page_ids) {
          const page = pageMap.get(pageId);
          if (!page) add(base + ".page_ids", "unknown page catalog ID: " + pageId);
          else pages.push(page);
        }
      }

      if (!allowedSourceMaturity.has(scenario.source_maturity)) add(base + ".source_maturity", "unsupported maturity: " + scenario.source_maturity);
      if (pages.length > 0) {
        const expected = pages.reduce((worst, page) => statusRank[page.status] < statusRank[worst] ? page.status : worst, "stable");
        if (scenario.source_maturity !== expected) add(base + ".source_maturity", "must match weakest page source maturity: " + expected);
        const expectedConditional = pages.some((page) => page.tier === "conditional");
        if (scenario.conditional !== expectedConditional) add(base + ".conditional", "must match the page catalog conditional boundary");
      }
      if (typeof scenario.conditional !== "boolean") add(base + ".conditional", "must be a boolean");

      if (!allowedPresentation.has(scenario.presentation_status)) add(base + ".presentation_status", "unsupported status: " + scenario.presentation_status);
      if (scenario.reference_path !== null) checkRepositoryPath(base + ".reference_path", scenario.reference_path, true);
      if (["linked", "showcased"].includes(scenario.presentation_status) && !nonEmpty(scenario.reference_path)) {
        add(base + ".reference_path", scenario.presentation_status + " scenarios require a runnable reference");
      }
      if (scenario.inspection_path !== null) checkRepositoryPath(base + ".inspection_path", scenario.inspection_path, true);

      checkStringArray(base + ".states", scenario.states, allowedStates);
      checkStringArray(base + ".viewports", scenario.viewports, allowedViewports);
      checkStringArray(base + ".themes", scenario.themes, allowedThemes);
      checkStringArray(base + ".known_gaps", scenario.known_gaps, null);
      const states = Array.isArray(scenario.states) ? scenario.states : [];
      const viewports = Array.isArray(scenario.viewports) ? scenario.viewports : [];
      const themes = Array.isArray(scenario.themes) ? scenario.themes : [];
      const knownGaps = Array.isArray(scenario.known_gaps) ? scenario.known_gaps : [];
      const stateControls = Array.isArray(scenario.state_controls) ? scenario.state_controls : [];
      if (!Array.isArray(scenario.state_controls)) add(base + ".state_controls", "must be an array");
      const controlStates = [];
      for (const [controlIndex, control] of stateControls.entries()) {
        const field = base + ".state_controls[" + controlIndex + "]";
        if (!control || typeof control !== "object" || Array.isArray(control)) {
          add(field, "must be an object");
          continue;
        }
        if (!allowedStates.has(control.state)) add(field + ".state", "contains unsupported state: " + control.state);
        else if (controlStates.includes(control.state)) add(field + ".state", "duplicate state control: " + control.state);
        else controlStates.push(control.state);
        if (!nonEmpty(control.label)) add(field + ".label", "must be a non-empty string");
        checkRepositoryPath(field + ".reference_path", control.reference_path, true);
        const extra = Object.keys(control).filter((key) => !["state", "label", "reference_path", "assertion"].includes(key));
        if (extra.length > 0) add(field, "contains unsupported fields: " + extra.join(", "));

        const assertion = control.assertion;
        if (!assertion || typeof assertion !== "object" || Array.isArray(assertion)) {
          add(field + ".assertion", "must be an object");
          continue;
        }
        if (!allowedAssertionKinds.has(assertion.kind)) add(field + ".assertion.kind", "unsupported assertion kind: " + assertion.kind);
        if (!nonEmpty(assertion.selector)) add(field + ".assertion.selector", "must be a non-empty selector");
        if (assertion.kind === "attribute") {
          if (!nonEmpty(assertion.attribute)) add(field + ".assertion.attribute", "attribute assertions require an attribute");
          if (!nonEmpty(assertion.value)) add(field + ".assertion.value", "attribute assertions require a value");
        }
        if (assertion.kind === "text" && !nonEmpty(assertion.value)) add(field + ".assertion.value", "text assertions require a value");
        const assertionFields = assertion.kind === "visible" ? ["kind", "selector"] : assertion.kind === "attribute" ? ["kind", "selector", "attribute", "value"] : ["kind", "selector", "value"];
        const assertionExtra = Object.keys(assertion).filter((key) => !assertionFields.includes(key));
        if (assertionExtra.length > 0) add(field + ".assertion", "contains unsupported fields: " + assertionExtra.join(", "));
      }
      if (states.join("|") !== controlStates.join("|")) add(base + ".state_controls", "must map every declared state once and in the same order");

      const isPilot = expectedPilots.includes(scenario.id);
      if (isPilot) {
        if (scenario.wave !== "P0") add(base + ".wave", "approved pilot scenarios must use P0");
        if (scenario.presentation_status !== "showcased") add(base + ".presentation_status", "Phase 2 P0 scenarios must be showcased");
        if (!states.includes("normal")) add(base + ".states", "P0 scenarios must expose at least the normal deterministic state");
        for (const viewport of allowedViewports) if (!viewports.includes(viewport)) add(base + ".viewports", "P0 scenarios must name wide and narrow references");
        for (const theme of allowedThemes) if (!themes.includes(theme)) add(base + ".themes", "P0 scenarios must name all four KIN theme modes");
      } else if (scenario.wave === "P0") {
        add(base + ".wave", "only the approved six scenarios may use P0");
      }

      if (expectedPhase3Shared.includes(scenario.id)) {
        if (scenario.wave !== "P1") add(base + ".wave", "Phase 3 shared scenarios must use P1");
        if (scenario.source_maturity !== "stable") add(base + ".source_maturity", "Phase 3 shared scenarios must retain stable source maturity");
        if (scenario.presentation_status !== "showcased") add(base + ".presentation_status", "Phase 3 shared scenarios must be showcased");
        for (const viewport of allowedViewports) if (!viewports.includes(viewport)) add(base + ".viewports", "Phase 3 shared scenarios must name wide and narrow references");
        for (const theme of allowedThemes) if (!themes.includes(theme)) add(base + ".themes", "Phase 3 shared scenarios must name all four KIN theme modes");
      }

      if (expectedPhase3ProductFamily.includes(scenario.id)) {
        if (scenario.wave !== "P1") add(base + ".wave", "Phase 3 product-family scenarios must use P1");
        if (scenario.source_maturity !== "stable") add(base + ".source_maturity", "Phase 3 product-family scenarios must retain stable source maturity");
        if (scenario.presentation_status !== "showcased") add(base + ".presentation_status", "Phase 3 product-family scenarios must be showcased");
        for (const viewport of allowedViewports) if (!viewports.includes(viewport)) add(base + ".viewports", "Phase 3 product-family scenarios must name wide and narrow references");
        for (const theme of allowedThemes) if (!themes.includes(theme)) add(base + ".themes", "Phase 3 product-family scenarios must name all four KIN theme modes");
      }

      if (scenario.presentation_status === "planned" && knownGaps.length === 0) {
        add(base + ".known_gaps", "planned scenarios must name the missing presentation or source evidence");
      }
      if ((states.length > 0 || viewports.length > 0 || themes.length > 0) && !nonEmpty(scenario.reference_path)) {
        add(base + ".reference_path", "state, viewport, or theme claims require a runnable reference");
      }
      if (scenario.presentation_status === "showcased") {
        if (states.length === 0 || viewports.length === 0 || themes.length === 0 || stateControls.length === 0) add(base + ".presentation_status", "showcased scenarios require checked state, viewport, theme, and control metadata");
        const expectedInspectionPath = "site/scenarios/lab.html?scenario=" + scenario.id;
        if (scenario.inspection_path !== expectedInspectionPath) add(base + ".inspection_path", "must equal " + expectedInspectionPath);
      } else if (scenario.inspection_path !== null || stateControls.length > 0) {
        add(base + ".inspection_path", "only showcased scenarios may expose inspection routes and state controls");
      }
    }
  }
}

for (const id of expectedPhase3Shared) {
  if (!ids.has(id)) add("scenarios", "missing Phase 3 shared scenario: " + id);
}
for (const id of expectedPhase3ProductFamily) {
  if (!ids.has(id)) add("scenarios", "missing Phase 3 product-family scenario: " + id);
}

const scenarios = catalog && Array.isArray(catalog.scenarios)
  ? catalog.scenarios.filter((scenario) => scenario && typeof scenario === "object" && !Array.isArray(scenario))
  : [];
const summary = {
  scenarioEntries: scenarios.length,
  pilots: scenarios.filter((scenario) => scenario.wave === "P0").length,
  linked: scenarios.filter((scenario) => scenario.presentation_status === "linked").length,
  showcased: scenarios.filter((scenario) => scenario.presentation_status === "showcased").length,
  planned: scenarios.filter((scenario) => scenario.presentation_status === "planned").length,
  stableSources: scenarios.filter((scenario) => scenario.source_maturity === "stable").length,
  candidateSources: scenarios.filter((scenario) => scenario.source_maturity === "candidate").length,
  errors: findings.length
};

if (asJson) {
  console.log(JSON.stringify({ summary, findings }, null, 2));
} else if (findings.length === 0) {
  console.log("Scenario validation passed: " + summary.scenarioEntries + " entries (" + summary.pilots + " P0, " + summary.showcased + " showcased, " + summary.linked + " linked, " + summary.planned + " planned).");
} else {
  console.error("Scenario validation failed (" + findings.length + "):");
  for (const finding of findings) console.error("- " + finding.file + " " + finding.field + ": " + finding.message);
}

process.exit(findings.length > 0 ? 1 : 0);
