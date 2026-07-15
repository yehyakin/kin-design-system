import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const args = process.argv.slice(2);
const asJson = args.includes("--json");

function option(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const catalogFile = path.resolve(root, option("--catalog", "components/catalog.json"));
const terminologyFile = path.resolve(root, option("--terminology", "components/terminology.json"));
const catalogMarkdownFile = path.resolve(root, "components/catalog.md");
const terminologyMarkdownFile = path.resolve(root, "components/terminology.md");
const findings = [];

function add(file, field, message) {
  findings.push({ file: path.relative(root, file).split(path.sep).join("/"), field, message });
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    add(file, "$", `invalid JSON or unreadable file: ${error.message}`);
    return null;
  }
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function checkPathList(file, field, value) {
  if (!isStringArray(value)) {
    add(file, field, "must be an array of repository-relative paths");
    return;
  }
  for (const candidate of value) {
    if (path.isAbsolute(candidate) || candidate.startsWith("http://") || candidate.startsWith("https://")) {
      add(file, field, `must use a repository-relative path: ${candidate}`);
      continue;
    }
    if (!fs.existsSync(path.resolve(root, candidate))) add(file, field, `path does not exist: ${candidate}`);
  }
}

const catalog = readJson(catalogFile);
const terminology = readJson(terminologyFile);
const allowedStatuses = new Set(["stable", "candidate", "draft", "deprecated"]);
const allowedTiers = new Set(["core", "workspace", "product-specific", "conditional"]);
const supportFields = ["themes", "responsive", "keyboard", "touch", "reduced_motion"];
const ids = new Set();
const names = new Set();

if (catalog) {
  if (catalog.schema_version !== "1.0.0") add(catalogFile, "schema_version", "must equal 1.0.0");
  if (!Array.isArray(catalog.components) || catalog.components.length < 40) {
    add(catalogFile, "components", "must contain at least 40 catalog entries");
  } else {
    for (const [index, component] of catalog.components.entries()) {
      const base = `components[${index}]`;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(component.id ?? "")) add(catalogFile, `${base}.id`, "must be a kebab-case identifier");
      else if (ids.has(component.id)) add(catalogFile, `${base}.id`, `duplicate id: ${component.id}`);
      else ids.add(component.id);

      if (typeof component.canonical_name !== "string" || component.canonical_name.trim() === "") add(catalogFile, `${base}.canonical_name`, "must be a non-empty string");
      else if (names.has(component.canonical_name)) add(catalogFile, `${base}.canonical_name`, `duplicate canonical name: ${component.canonical_name}`);
      else names.add(component.canonical_name);

      if (!allowedTiers.has(component.tier)) add(catalogFile, `${base}.tier`, `unknown tier: ${component.tier}`);
      if (!allowedStatuses.has(component.status)) add(catalogFile, `${base}.status`, `unknown status: ${component.status}`);
      checkPathList(catalogFile, `${base}.contract_paths`, component.contract_paths);
      checkPathList(catalogFile, `${base}.reference_paths`, component.reference_paths);
      checkPathList(catalogFile, `${base}.test_paths`, component.test_paths);

      for (const field of ["product_families", "manual_checks", "known_gaps"]) {
        if (!isStringArray(component[field])) add(catalogFile, `${base}.${field}`, "must be an array of strings");
      }

      if (!component.support || typeof component.support !== "object") add(catalogFile, `${base}.support`, "must be an object");
      else for (const field of supportFields) {
        if (typeof component.support[field] !== "boolean") add(catalogFile, `${base}.support.${field}`, "must be a boolean");
      }

      if (component.status === "stable") {
        if (component.contract_paths?.length === 0) add(catalogFile, `${base}.contract_paths`, "stable components require a normative contract");
        if (component.reference_paths?.length === 0) add(catalogFile, `${base}.reference_paths`, "stable components require a runnable reference");
        if (component.test_paths?.length === 0) add(catalogFile, `${base}.test_paths`, "stable components require automated acceptance checks");
        if (component.manual_checks?.length === 0) add(catalogFile, `${base}.manual_checks`, "stable components require named manual checks");
      }
      if (component.status === "deprecated" && !component.replacement_id) add(catalogFile, `${base}.replacement_id`, "deprecated components require a replacement_id");
    }
  }

  if (catalogFile === path.resolve(root, "components/catalog.json") && fs.existsSync(catalogMarkdownFile)) {
    const markdown = fs.readFileSync(catalogMarkdownFile, "utf8");
    const declared = markdown.match(/contains (\d+) stable, (\d+) candidate, and (\d+) draft components/);
    const counts = catalog.components.reduce((result, component) => {
      result[component.status] = (result[component.status] ?? 0) + 1;
      return result;
    }, {});
    if (!declared) add(catalogMarkdownFile, "summary", "must declare stable, candidate, and draft totals");
    else if (Number(declared[1]) !== (counts.stable ?? 0) || Number(declared[2]) !== (counts.candidate ?? 0) || Number(declared[3]) !== (counts.draft ?? 0)) {
      add(catalogMarkdownFile, "summary", `declared totals differ from catalog.json (${counts.stable ?? 0} stable, ${counts.candidate ?? 0} candidate, ${counts.draft ?? 0} draft)`);
    }
  }
}

const terminologyNames = new Set();
if (terminology) {
  if (terminology.schema_version !== "1.0.0") add(terminologyFile, "schema_version", "must equal 1.0.0");
  if (!Array.isArray(terminology.entries) || terminology.entries.length < 20) {
    add(terminologyFile, "entries", "must contain at least 20 terminology entries");
  } else {
    for (const [index, entry] of terminology.entries.entries()) {
      const base = `entries[${index}]`;
      if (typeof entry.canonical_name !== "string" || entry.canonical_name.trim() === "") add(terminologyFile, `${base}.canonical_name`, "must be a non-empty string");
      else if (terminologyNames.has(entry.canonical_name)) add(terminologyFile, `${base}.canonical_name`, `duplicate canonical name: ${entry.canonical_name}`);
      else terminologyNames.add(entry.canonical_name);

      if (!ids.has(entry.catalog_id)) add(terminologyFile, `${base}.catalog_id`, `unknown catalog id: ${entry.catalog_id}`);
      for (const field of ["plain_definition", "use_when", "do_not_use_when"]) {
        if (typeof entry[field] !== "string" || entry[field].trim() === "") add(terminologyFile, `${base}.${field}`, "must be a non-empty string");
      }
      for (const field of ["aliases", "not_synonyms"]) {
        if (!isStringArray(entry[field])) add(terminologyFile, `${base}.${field}`, "must be an array of strings");
      }
      if (entry.not_synonyms?.includes(entry.canonical_name)) add(terminologyFile, `${base}.not_synonyms`, "must not contain its own canonical name");
    }
  }

  if (terminologyFile === path.resolve(root, "components/terminology.json") && fs.existsSync(terminologyMarkdownFile)) {
    const markdown = fs.readFileSync(terminologyMarkdownFile, "utf8");
    for (const entry of terminology.entries ?? []) {
      if (!markdown.includes(`| ${entry.canonical_name} |`)) {
        add(terminologyMarkdownFile, entry.canonical_name, "canonical machine term is missing from the human-readable table");
      }
    }
  }
}

const summary = {
  catalogEntries: catalog?.components?.length ?? 0,
  terminologyEntries: terminology?.entries?.length ?? 0,
  errors: findings.length,
};

if (asJson) console.log(JSON.stringify({ summary, findings }, null, 2));
else if (findings.length === 0) console.log(`Component validation passed: ${summary.catalogEntries} catalog entries, ${summary.terminologyEntries} terminology entries.`);
else {
  console.error(`Component validation failed (${findings.length}):`);
  for (const finding of findings) console.error(`- ${finding.file} ${finding.field}: ${finding.message}`);
}

process.exit(findings.length > 0 ? 1 : 0);
