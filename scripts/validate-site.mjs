import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const output = path.join(root, ".site-dist");
const failures = [];
const required = [
  "index.html",
  "zh/index.html",
  "404.html",
  "assets/site.css",
  "assets/site.js",
  "assets/scenario-lab.js",
  "assets/sonner.css",
  "assets/kin-react.css",
  "assets/mark.svg",
  "assets/og-card.svg",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "scenarios/index.html",
  "scenarios/lab.html",
  "scenarios/catalog.json",
  "scenarios/catalog.schema.json",
  "examples/workspace-reference/index.html",
  "examples/workspace-reference/reference.js",
  "examples/workspace-reference/core-components.html",
  "examples/workspace-reference/core-components.js",
  "examples/workspace-reference/motion.html",
  "examples/workspace-reference/motion-reference.js",
  "examples/workspace-reference/integrations.html",
  "examples/workspace-reference/integration-reference.js",
  "examples/page-patterns/access.html",
  "examples/page-patterns/onboarding.html",
  "examples/page-patterns/search.html",
  "examples/page-patterns/settings.html",
  "examples/page-patterns/system.html",
  "examples/page-patterns/support.html",
  "examples/page-patterns/scheduling.html",
  "examples/product-patterns/information.html",
  "examples/product-patterns/ecommerce.html",
  "examples/product-patterns/canvas.html",
  "tokens/kin.tokens.json",
];

function findTarget(file, rawTarget) {
  const withoutFragment = rawTarget.split("#")[0].split("?")[0];
  if (!withoutFragment) return file;
  const decoded = decodeURIComponent(withoutFragment);
  const candidate = decoded.startsWith("/kin-design-system/")
    ? path.join(output, decoded.slice("/kin-design-system/".length))
    : path.resolve(path.dirname(file), decoded);
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return path.join(candidate, "index.html");
  return candidate;
}

if (!fs.existsSync(output)) failures.push(".site-dist is missing; run the site build first");
for (const file of required) {
  if (!fs.existsSync(path.join(output, file))) failures.push(`${file}: required site output is missing`);
}

if (fs.existsSync(output)) {
  const htmlFiles = [
    "index.html",
    "zh/index.html",
    "404.html",
    "scenarios/index.html",
    "scenarios/lab.html",
    "examples/workspace-reference/index.html",
    "examples/workspace-reference/core-components.html",
    "examples/workspace-reference/motion.html",
    "examples/workspace-reference/integrations.html",
    "examples/page-patterns/access.html",
    "examples/page-patterns/onboarding.html",
    "examples/page-patterns/search.html",
    "examples/page-patterns/settings.html",
    "examples/page-patterns/system.html",
    "examples/page-patterns/support.html",
    "examples/page-patterns/scheduling.html",
    "examples/product-patterns/information.html",
    "examples/product-patterns/ecommerce.html",
    "examples/product-patterns/canvas.html",
  ].map((file) => path.join(output, file));
  const attributePattern = /\b(?:href|src)=["']([^"']+)["']/g;
  for (const file of htmlFiles) {
    const source = fs.readFileSync(file, "utf8");
    const relative = path.relative(output, file).replaceAll(path.sep, "/");
    const ids = [...source.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) failures.push(`${relative}: duplicate IDs -> ${[...new Set(duplicates)].join(", ")}`);
    if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(source)) failures.push(`${relative}: html language is missing`);
    if (!/<title>[^<]+<\/title>/i.test(source)) failures.push(`${relative}: title is missing`);
    if (/target=["']_blank["']/i.test(source) && !/rel=["'][^"']*noopener/i.test(source)) failures.push(`${relative}: target=_blank requires rel=noopener`);

    for (const match of source.matchAll(attributePattern)) {
      const raw = match[1].trim();
      if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
      const target = findTarget(file, raw);
      if (!fs.existsSync(target)) {
        failures.push(`${relative}: broken local reference -> ${raw}`);
        continue;
      }
      const fragment = raw.includes("#") ? raw.slice(raw.indexOf("#") + 1) : "";
      if (fragment && path.extname(target).toLowerCase() === ".html") {
        const targetSource = fs.readFileSync(target, "utf8");
        const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (!new RegExp(`\\bid=["']${escaped}["']`).test(targetSource)) failures.push(`${relative}: missing fragment target -> ${raw}`);
      }
    }
  }
}

const workspaceAssetDirectory = path.join(output, "examples/workspace-reference");
if (fs.existsSync(workspaceAssetDirectory)) {
  const bundle = path.join(workspaceAssetDirectory, "reference.js");
  const coreBundle = path.join(workspaceAssetDirectory, "core-components.js");
  const motionBundle = path.join(workspaceAssetDirectory, "motion-reference.js");
  const integrationBundle = path.join(workspaceAssetDirectory, "integration-reference.js");
  const chunks = fs.existsSync(path.join(workspaceAssetDirectory, "chunks"))
    ? fs.readdirSync(path.join(workspaceAssetDirectory, "chunks"))
    : [];
  if (!chunks.some((file) => file.startsWith("sonner-island-") && file.endsWith(".js"))) failures.push("workspace-reference/chunks: lazy Sonner bundle is missing");
  if (fs.existsSync(bundle) && fs.statSync(bundle).size > 50_000) failures.push("workspace-reference/reference.js: initial JavaScript bundle exceeds 50 KB");
  if (fs.existsSync(coreBundle) && fs.statSync(coreBundle).size > 50_000) failures.push("workspace-reference/core-components.js: initial JavaScript bundle exceeds 50 KB");
  if (fs.existsSync(motionBundle) && fs.statSync(motionBundle).size > 50_000) failures.push("workspace-reference/motion-reference.js: initial JavaScript bundle exceeds 50 KB");
  if (fs.existsSync(integrationBundle) && fs.statSync(integrationBundle).size > 90_000) failures.push("workspace-reference/integration-reference.js: initial integration bundle exceeds 90 KB");
}

const assetDirectory = path.join(output, "assets");
if (fs.existsSync(path.join(assetDirectory, "sonner-island.js"))) failures.push("assets/sonner-island.js: unbundled source must not ship");
if (fs.existsSync(assetDirectory)) {
  const mainBundle = path.join(assetDirectory, "site.js");
  const scenarioLabBundle = path.join(assetDirectory, "scenario-lab.js");
  const chunks = fs.existsSync(path.join(assetDirectory, "chunks"))
    ? fs.readdirSync(path.join(assetDirectory, "chunks"))
    : [];
  if (!chunks.some((file) => file.startsWith("sonner-island-") && file.endsWith(".js"))) failures.push("assets/chunks: lazy Sonner bundle is missing");
  if (fs.existsSync(mainBundle) && fs.statSync(mainBundle).size > 50_000) failures.push("assets/site.js: initial JavaScript bundle exceeds 50 KB");
  if (fs.existsSync(scenarioLabBundle) && fs.statSync(scenarioLabBundle).size > 35_000) failures.push("assets/scenario-lab.js: initial JavaScript bundle exceeds 35 KB");
}

const cssPath = path.join(output, "assets/site.css");
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, "utf8");
  if (/transition(?:-property)?\s*:\s*all\b/i.test(css)) failures.push("assets/site.css: transition: all is forbidden");
  if (!/prefers-reduced-motion/.test(css)) failures.push("assets/site.css: reduced-motion response is missing");
  if (!/:focus-visible/.test(css)) failures.push("assets/site.css: visible focus behavior is missing");
}

const integrationCssPath = path.join(output, "assets/kin-react.css");
if (fs.existsSync(integrationCssPath)) {
  const css = fs.readFileSync(integrationCssPath, "utf8");
  if (/transition(?:-property)?\s*:\s*all\b/i.test(css)) failures.push("assets/kin-react.css: transition: all is forbidden");
  if (!/prefers-reduced-motion/.test(css)) failures.push("assets/kin-react.css: reduced-motion response is missing");
}

const scenarioCatalogPath = path.join(output, "scenarios/catalog.json");
const scenarioHtmlPath = path.join(output, "scenarios/index.html");
if (fs.existsSync(scenarioCatalogPath) && fs.existsSync(scenarioHtmlPath)) {
  let scenarioCatalog;
  try {
    scenarioCatalog = JSON.parse(fs.readFileSync(scenarioCatalogPath, "utf8"));
  } catch (error) {
    failures.push("scenarios/catalog.json: invalid JSON -> " + error.message);
  }

  if (scenarioCatalog && scenarioCatalog.schema_version !== "1.1.0") failures.push("scenarios/catalog.json: scenario inspection requires schema_version 1.1.0");
  if (scenarioCatalog && !Array.isArray(scenarioCatalog.scenarios)) {
    failures.push("scenarios/catalog.json: scenarios must be an array");
  } else if (scenarioCatalog) {
    const scenarioHtml = fs.readFileSync(scenarioHtmlPath, "utf8");
    const catalogScenarios = scenarioCatalog.scenarios.filter((scenario) => scenario && typeof scenario === "object" && !Array.isArray(scenario));
    if (catalogScenarios.length !== scenarioCatalog.scenarios.length) failures.push("scenarios/catalog.json: every scenario must be an object");
    const scenarioEntries = [...scenarioHtml.matchAll(/<article\b([^>]*\bdata-scenario-id=["']([^"']+)["'][^>]*)>([\s\S]*?)<\/article>/g)]
      .map((match) => ({ attributes: match[1], id: match[2], body: match[3] }));
    const htmlIds = scenarioEntries.map((entry) => entry.id);
    const duplicateScenarioIds = htmlIds.filter((id, index) => htmlIds.indexOf(id) !== index);
    if (duplicateScenarioIds.length > 0) failures.push("scenarios/index.html: duplicate scenario IDs -> " + [...new Set(duplicateScenarioIds)].join(", "));

    const catalogIds = catalogScenarios.map((scenario) => scenario.id);
    const missingIds = catalogIds.filter((id) => !htmlIds.includes(id));
    const extraIds = htmlIds.filter((id) => !catalogIds.includes(id));
    if (scenarioEntries.length !== scenarioCatalog.scenarios.length) failures.push("scenarios/index.html: expected " + scenarioCatalog.scenarios.length + " scenario rows, found " + scenarioEntries.length);
    if (missingIds.length > 0) failures.push("scenarios/index.html: catalog entries missing from page -> " + missingIds.join(", "));
    if (extraIds.length > 0) failures.push("scenarios/index.html: page entries missing from catalog -> " + extraIds.join(", "));

    for (const scenario of catalogScenarios) {
      const entry = scenarioEntries.find((candidate) => candidate.id === scenario.id);
      if (!entry) continue;
      const statusMatch = entry.attributes.match(/\bdata-presentation-status=["']([^"']+)["']/);
      if (statusMatch?.[1] !== scenario.presentation_status) failures.push("scenarios/index.html: " + scenario.id + " presentation status does not match the catalog");
      if (!entry.body.includes("source-status " + scenario.source_maturity)) failures.push("scenarios/index.html: " + scenario.id + " source maturity is not visibly synchronized");
      if (!entry.body.includes(">" + scenario.canonical_name + "<")) failures.push("scenarios/index.html: " + scenario.id + " canonical name does not match the catalog");
      if (!entry.body.includes("<p>" + scenario.user_job + "</p>")) failures.push("scenarios/index.html: " + scenario.id + " user job does not match the catalog");

      if (scenario.presentation_status === "linked") {
        const expectedHref = "../" + scenario.reference_path;
        if (!entry.body.includes('href="' + expectedHref + '"')) failures.push("scenarios/index.html: " + scenario.id + " linked reference is missing or incorrect");
        if (!entry.body.includes("Open reference")) failures.push("scenarios/index.html: " + scenario.id + " linked action is missing");
      } else if (scenario.presentation_status === "showcased") {
        if (typeof scenario.inspection_path !== "string") {
          failures.push("scenarios/catalog.json: " + scenario.id + " showcased entry requires an inspection path");
        } else {
          const expectedHref = scenario.inspection_path.replace(/^site[/]scenarios[/]/, "");
          if (!entry.body.includes('href="' + expectedHref + '"')) failures.push("scenarios/index.html: " + scenario.id + " inspection route is missing or incorrect");
        }
        if (!entry.body.includes("Inspect scenario")) failures.push("scenarios/index.html: " + scenario.id + " inspection action is missing");
      } else if (entry.body.includes("Open reference") || entry.body.includes("Inspect scenario")) {
        failures.push("scenarios/index.html: " + scenario.id + " planned entry must not expose a runnable action");
      }
    }

    const linkedRows = scenarioEntries.filter((entry) => entry.attributes.includes('data-presentation-status="linked"')).length;
    const showcasedRows = scenarioEntries.filter((entry) => entry.attributes.includes('data-presentation-status="showcased"')).length;
    const plannedRows = scenarioEntries.filter((entry) => entry.attributes.includes('data-presentation-status="planned"')).length;
    if (linkedRows !== 0) failures.push("scenarios/index.html: Phase 3 expects no linked-only rows");
    if (showcasedRows !== 17) failures.push("scenarios/index.html: expected 17 showcased scenario rows");
    if (plannedRows !== 13) failures.push("scenarios/index.html: expected 13 planned rows");
  }
}

const scenarioLabHtmlPath = path.join(output, "scenarios/lab.html");
if (fs.existsSync(scenarioLabHtmlPath)) {
  const scenarioLabHtml = fs.readFileSync(scenarioLabHtmlPath, "utf8");
  for (const marker of ["data-lab-scenario", "data-lab-state", "data-lab-viewport-group", "data-lab-theme-group", "data-lab-verification", "data-lab-frame"]) {
    if (!scenarioLabHtml.includes(marker)) failures.push("scenarios/lab.html: missing inspection marker " + marker);
  }
  if (!scenarioLabHtml.includes('src="../assets/scenario-lab.js"')) failures.push("scenarios/lab.html: bundled lab controller is missing");
}

const homePath = path.join(output, "index.html");
if (fs.existsSync(homePath) && !fs.readFileSync(homePath, "utf8").includes('href="scenarios/"')) {
  failures.push("index.html: Scenario Atlas entry point is missing");
}

if (failures.length > 0) {
  console.error(`Site validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Site validation passed.");
