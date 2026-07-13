import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const catalogFile = path.resolve(root, "pages/catalog.json");
const findings = [];

function add(field, message) {
  findings.push({ file: "pages/catalog.json", field, message });
}

function readCatalog() {
  try {
    return JSON.parse(fs.readFileSync(catalogFile, "utf8"));
  } catch (error) {
    add("$", `invalid JSON or unreadable file: ${error.message}`);
    return null;
  }
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim() !== "");
}

function checkPathList(field, value) {
  if (!Array.isArray(value)) {
    add(field, "must be an array of repository-relative paths");
    return;
  }
  for (const candidate of value) {
    if (typeof candidate !== "string" || candidate.trim() === "") {
      add(field, "must contain non-empty path strings");
      continue;
    }
    if (path.isAbsolute(candidate) || /^https?:\/\//.test(candidate)) {
      add(field, `must use a repository-relative path: ${candidate}`);
      continue;
    }
    if (!fs.existsSync(path.resolve(root, candidate))) add(field, `path does not exist: ${candidate}`);
  }
}

const catalog = readCatalog();
const allowedStatuses = new Set(["stable", "candidate", "draft", "deprecated"]);
const allowedTiers = new Set(["core", "workspace", "product-specific", "conditional"]);
const supportFields = ["themes", "responsive", "keyboard", "touch", "reduced_motion", "localization"];
const ids = new Set();
const names = new Set();

if (catalog) {
  if (catalog.schema_version !== "1.0.0") add("schema_version", "must equal 1.0.0");
  if (!Array.isArray(catalog.pages) || catalog.pages.length < 10) {
    add("pages", "must contain at least 10 page-family entries");
  } else {
    for (const [index, page] of catalog.pages.entries()) {
      const base = `pages[${index}]`;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.id ?? "")) add(`${base}.id`, "must be a kebab-case identifier");
      else if (ids.has(page.id)) add(`${base}.id`, `duplicate id: ${page.id}`);
      else ids.add(page.id);

      if (typeof page.canonical_name !== "string" || page.canonical_name.trim() === "") add(`${base}.canonical_name`, "must be a non-empty string");
      else if (names.has(page.canonical_name)) add(`${base}.canonical_name`, `duplicate canonical name: ${page.canonical_name}`);
      else names.add(page.canonical_name);

      if (!allowedTiers.has(page.tier)) add(`${base}.tier`, `unknown tier: ${page.tier}`);
      if (!allowedStatuses.has(page.status)) add(`${base}.status`, `unknown status: ${page.status}`);
      checkPathList(`${base}.contract_paths`, page.contract_paths);
      checkPathList(`${base}.reference_paths`, page.reference_paths);
      checkPathList(`${base}.test_paths`, page.test_paths);

      for (const field of ["product_families", "manual_checks", "known_gaps"]) {
        if (!isStringArray(page[field]) && !(field === "known_gaps" && Array.isArray(page[field]) && page[field].length === 0)) {
          add(`${base}.${field}`, "must be an array of non-empty strings");
        }
      }

      if (!page.support || typeof page.support !== "object" || Array.isArray(page.support)) add(`${base}.support`, "must be an object");
      else for (const field of supportFields) {
        if (typeof page.support[field] !== "boolean") add(`${base}.support.${field}`, "must be a boolean");
      }

      if (page.status === "stable") {
        if (page.contract_paths?.length === 0) add(`${base}.contract_paths`, "stable pages require a normative contract");
        if (page.reference_paths?.length === 0) add(`${base}.reference_paths`, "stable pages require a runnable reference");
        if (page.test_paths?.length === 0) add(`${base}.test_paths`, "stable pages require automated acceptance checks");
        if (page.manual_checks?.length === 0) add(`${base}.manual_checks`, "stable pages require named manual checks");
        if (page.known_gaps?.length > 0) add(`${base}.known_gaps`, "stable pages must not retain catalog completion gaps");
        for (const field of supportFields) if (page.support?.[field] !== true) add(`${base}.support.${field}`, "stable pages require support coverage");
      }

      if (["candidate", "draft"].includes(page.status) && page.known_gaps?.length === 0) {
        add(`${base}.known_gaps`, `${page.status} pages must name unresolved completion gaps`);
      }
      if (page.status === "deprecated" && !page.replacement_id) add(`${base}.replacement_id`, "deprecated pages require a replacement_id");
    }
  }
}

const summary = {
  pageEntries: catalog?.pages?.length ?? 0,
  stable: catalog?.pages?.filter(({ status }) => status === "stable").length ?? 0,
  candidate: catalog?.pages?.filter(({ status }) => status === "candidate").length ?? 0,
  errors: findings.length,
};

if (asJson) console.log(JSON.stringify({ summary, findings }, null, 2));
else if (findings.length === 0) console.log(`Page validation passed: ${summary.pageEntries} entries (${summary.stable} stable, ${summary.candidate} candidate).`);
else {
  console.error(`Page validation failed (${findings.length}):`);
  for (const finding of findings) console.error(`- ${finding.file} ${finding.field}: ${finding.message}`);
}

process.exit(findings.length > 0 ? 1 : 0);
