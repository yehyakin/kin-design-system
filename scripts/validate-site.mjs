import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { expectedAgentResponses, validateAgentSiteOutput } from "./lib/agent-pages.mjs";
import {
  materializePagePatternChineseSource,
  PAGE_PATTERN_IDS,
  readPagePatternChineseLocale,
} from "./lib/page-pattern-locales.mjs";
import { showcaseProofCounts } from "./lib/showcase-home.mjs";
import { SHOWCASE_COMPONENT_IDS, SHOWCASE_GENERATED_PATHS } from "./lib/showcase-pages.mjs";
import { validateSiteOutputAllowlist } from "./lib/site-artifacts.mjs";

const root = process.cwd();
const output = path.join(root, ".site-dist");
const failures = [];
const pagePatternIds = PAGE_PATTERN_IDS;
const required = [
  "index.html",
  "zh/index.html",
  "docs/index.html",
  "zh/docs/index.html",
  "lab/index.html",
  "404.html",
  "assets/showcase.css",
  "assets/showcase.js",
  "assets/posters/int-01-normal-dark.png",
  "assets/posters/int-02-normal-dark.png",
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
  "examples/workspace-reference/showcase-components.html",
  "examples/workspace-reference/showcase-components.css",
  "examples/workspace-reference/showcase-components.js",
  "examples/page-patterns/access.html",
  "examples/page-patterns/dashboard.html",
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
  ...SHOWCASE_GENERATED_PATHS,
];

function sortedKeys(value) {
  return Object.keys(value ?? {}).sort((left, right) => left.localeCompare(right, "en"));
}

function validatePagePatternLocales() {
  const controllerPath = path.join(root, "examples", "page-patterns", "reference.js");
  let locale;

  try {
    locale = readPagePatternChineseLocale(root);
  } catch (error) {
    failures.push(`examples/page-patterns/locale.zh-CN.json: ${error.message}`);
    return;
  }

  if (locale.locale !== "zh-CN") failures.push("examples/page-patterns/locale.zh-CN.json: locale must be zh-CN");
  if (!locale.common || typeof locale.common !== "object" || Array.isArray(locale.common)) {
    failures.push("examples/page-patterns/locale.zh-CN.json: common translations must be an object");
  }
  if (!locale.pages || typeof locale.pages !== "object" || Array.isArray(locale.pages)) {
    failures.push("examples/page-patterns/locale.zh-CN.json: pages must be an object");
    return;
  }

  const actualPages = sortedKeys(locale.pages);
  const expectedPages = [...pagePatternIds].sort((left, right) => left.localeCompare(right, "en"));
  if (JSON.stringify(actualPages) !== JSON.stringify(expectedPages)) {
    failures.push("examples/page-patterns/locale.zh-CN.json: page IDs must match the governed page-pattern set");
  }

  for (const id of pagePatternIds) {
    const sourcePath = path.join(root, "examples", "page-patterns", `${id}.html`);
    const source = fs.readFileSync(sourcePath, "utf8");
    const match = source.match(/<script type="application\/json" data-i18n-dictionary>\s*([\s\S]*?)\s*<\/script>/u);
    if (!match) {
      failures.push(`examples/page-patterns/${id}.html: inline English dictionary is missing`);
      continue;
    }

    let inline;
    try {
      inline = JSON.parse(match[1]);
    } catch (error) {
      failures.push(`examples/page-patterns/${id}.html: inline dictionary is invalid -> ${error.message}`);
      continue;
    }

    if (JSON.stringify(sortedKeys(inline)) !== JSON.stringify(["en"])) {
      failures.push(`examples/page-patterns/${id}.html: inline dictionary must contain English only`);
    }
    const english = inline.en ?? {};
    const chinesePage = locale.pages[id] ?? {};
    const englishPageKeys = sortedKeys(Object.fromEntries(Object.entries(english).filter(([key]) => !key.startsWith("common."))));
    const chinesePageKeys = sortedKeys(chinesePage);
    if (JSON.stringify(englishPageKeys) !== JSON.stringify(chinesePageKeys)) {
      failures.push(`examples/page-patterns/${id}.html: English and Chinese page-copy keys differ`);
    }
    for (const key of sortedKeys(english).filter((candidate) => candidate.startsWith("common."))) {
      if (!(key in (locale.common ?? {}))) {
        failures.push(`examples/page-patterns/${id}.html: Chinese common translation is missing for ${key}`);
      }
    }
    if (chinesePageKeys.some((key) => key.startsWith("common."))) {
      failures.push(`examples/page-patterns/locale.zh-CN.json: ${id} must not duplicate common translations`);
    }
    if (materializePagePatternChineseSource({ source, id, locale }) !== source) {
      failures.push(
        `examples/page-patterns/${id}.html: Chinese no-script text, title, placeholder, or accessible name is stale; run node scripts/materialize-page-pattern-locales.mjs`,
      );
    }
  }

  const controller = fs.readFileSync(controllerPath, "utf8");
  if (!controller.includes('import chineseLocale from "./locale.zh-CN.json"')) {
    failures.push("examples/page-patterns/reference.js: canonical Chinese locale import is missing");
  }
  if (controller.includes("PAGE_CHINESE_COPY") || controller.includes("SHARED_CHINESE_COPY")) {
    failures.push("examples/page-patterns/reference.js: legacy Chinese copy overlay must not return");
  }
}

validatePagePatternLocales();

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
    "docs/index.html",
    "zh/docs/index.html",
    "lab/index.html",
    "404.html",
    "scenarios/index.html",
    "scenarios/lab.html",
    "examples/workspace-reference/index.html",
    "examples/workspace-reference/core-components.html",
    "examples/workspace-reference/motion.html",
    "examples/workspace-reference/integrations.html",
    "examples/workspace-reference/showcase-components.html",
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
    ...SHOWCASE_GENERATED_PATHS,
  ].map((file) => path.join(output, file));
  const attributePattern = /\b(?:href|src)=["']([^"']+)["']/g;
  for (const file of htmlFiles) {
    const source = fs.readFileSync(file, "utf8");
    const relative = path.relative(output, file).replaceAll(path.sep, "/");
    const ids = [...source.matchAll(/(?:^|[\s<])id=["']([^"']+)["']/g)].map((match) => match[1]);
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
        if (!new RegExp(`(?:^|[\\s<])id=["']${escaped}["']`).test(targetSource)) failures.push(`${relative}: missing fragment target -> ${raw}`);
      }
    }
  }
}

const showcaseRoutePairs = [
  ["index.html", "zh/index.html"],
  ["docs/index.html", "zh/docs/index.html"],
  ["components/index.html", "zh/components/index.html"],
  ["patterns/index.html", "zh/patterns/index.html"],
  ...SHOWCASE_COMPONENT_IDS.map((id) => [
    `components/${id}/index.html`,
    `zh/components/${id}/index.html`,
  ]),
];
const siteOrigin = "https://yehyakin.github.io/kin-design-system/";
const absoluteShowcaseRoute = (publicPath) => new URL(publicPath.replace(/index\.html$/u, ""), siteOrigin).href;
for (const [englishPath, chinesePath] of showcaseRoutePairs) {
  for (const [publicPath, locale] of [[englishPath, "en"], [chinesePath, "zh-CN"]]) {
    const file = path.join(output, publicPath);
    if (!fs.existsSync(file)) continue;
    const source = fs.readFileSync(file, "utf8");
    const canonical = absoluteShowcaseRoute(publicPath);
    if (!source.includes(`<link rel="canonical" href="${canonical}">`)) {
      failures.push(`${publicPath}: canonical URL must be ${canonical}`);
    }
    if (!source.includes(`<link rel="alternate" hreflang="en" href="${absoluteShowcaseRoute(englishPath)}">`)) {
      failures.push(`${publicPath}: English alternate is missing or incorrect`);
    }
    if (!source.includes(`<link rel="alternate" hreflang="zh-CN" href="${absoluteShowcaseRoute(chinesePath)}">`)) {
      failures.push(`${publicPath}: Chinese alternate is missing or incorrect`);
    }
    if (!new RegExp(`<html\\b[^>]*\\blang=["']${locale}["']`, "iu").test(source)) {
      failures.push(`${publicPath}: expected locale ${locale}`);
    }
  }
}

const globalNavigationPaths = new Set([
  ...showcaseRoutePairs.flat(),
  "scenarios/index.html",
  "scenarios/lab.html",
]);
for (const publicPath of globalNavigationPaths) {
  const file = path.join(output, publicPath);
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, "utf8");
  const hasPersistentGlobalHeader = source.includes('class="site-header global-header"')
    || source.includes('class="showcase-header"');
  if (!hasPersistentGlobalHeader) {
    failures.push(`${publicPath}: persistent global header is missing`);
  }
  if (!source.includes("data-mobile-nav")) failures.push(`${publicPath}: global navigation drawer is missing`);
  for (const key of ["showcase", "components", "patterns", "scenarios", "lab", "docs"]) {
    if (!source.includes(`data-global-nav-key="${key}"`)) {
      failures.push(`${publicPath}: global navigation key ${key} is missing`);
    }
  }
  const currentGlobalItems = [
    ...source.matchAll(/<a(?=[^>]*\bdata-global-nav-key=["'][^"']+["'])(?=[^>]*\baria-current=["']page["'])[^>]*>/giu),
  ];
  if (currentGlobalItems.length !== 1) {
    failures.push(`${publicPath}: expected exactly one current global navigation item`);
  }
}

for (const publicPath of ["index.html", "zh/index.html"]) {
  const file = path.join(output, publicPath);
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, "utf8");
  for (const id of ["overview", "principles", "foundations", "components", "patterns", "ai-contract", "agents", "resources", "flows"]) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`\\bid=["']${escaped}["']`, "u").test(source)) {
      failures.push(`${publicPath}: legacy fragment #${id} must remain addressable`);
    }
  }
  for (const [key, value] of Object.entries(showcaseProofCounts(root))) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`<span(?=[^>]*\\bdata-showcase-count=["']${escaped}["'])[^>]*>\\s*${value}\\s*<\\/span>`, "u").test(source)) {
      failures.push(`${publicPath}: proof count ${key} must resolve to ${value}`);
    }
  }
  if (!source.includes('data-showcase-route="home"')) failures.push(`${publicPath}: home route marker is missing`);
}

const labAliasPath = path.join(output, "lab/index.html");
if (fs.existsSync(labAliasPath)) {
  const source = fs.readFileSync(labAliasPath, "utf8");
  const canonical = `${siteOrigin}scenarios/lab.html`;
  if (!source.includes(`<link rel="canonical" href="${canonical}">`)) {
    failures.push(`lab/index.html: canonical URL must remain ${canonical}`);
  }
  if (!source.includes('location.replace(target)')) failures.push("lab/index.html: query-preserving canonical handoff is missing");
}

for (const [publicPath, marker] of [
  ["components/index.html", "components"],
  ["zh/components/index.html", "components"],
  ["patterns/index.html", "patterns"],
  ["zh/patterns/index.html", "patterns"],
]) {
  const file = path.join(output, publicPath);
  if (fs.existsSync(file) && !fs.readFileSync(file, "utf8").includes(`data-showcase-route="${marker}"`)) {
    failures.push(`${publicPath}: ${marker} route marker is missing`);
  }
}

for (const id of SHOWCASE_COMPONENT_IDS) {
  for (const publicPath of [`components/${id}/index.html`, `zh/components/${id}/index.html`]) {
    const file = path.join(output, publicPath);
    if (!fs.existsSync(file)) continue;
    const source = fs.readFileSync(file, "utf8");
    if (!source.includes('data-showcase-route="component-explorer"')) {
      failures.push(`${publicPath}: component Explorer marker is missing`);
    }
    if (!source.includes(`data-component-id="${id}"`)) failures.push(`${publicPath}: canonical component ID is missing`);
  }
}

if (fs.existsSync(output)) {
  failures.push(...validateAgentSiteOutput({ root, output }));
  try {
    const agentPaths = [...expectedAgentResponses(root).responses.keys()];
    failures.push(...validateSiteOutputAllowlist({ output, agentPaths }));
  } catch (error) {
    failures.push(`Agent output allowlist: ${error.message}`);
  }
}

const workspaceAssetDirectory = path.join(output, "examples/workspace-reference");
if (fs.existsSync(workspaceAssetDirectory)) {
  const bundle = path.join(workspaceAssetDirectory, "reference.js");
  const coreBundle = path.join(workspaceAssetDirectory, "core-components.js");
  const motionBundle = path.join(workspaceAssetDirectory, "motion-reference.js");
  const integrationBundle = path.join(workspaceAssetDirectory, "integration-reference.js");
  const showcaseComponentsBundle = path.join(workspaceAssetDirectory, "showcase-components.js");
  const chunks = fs.existsSync(path.join(workspaceAssetDirectory, "chunks"))
    ? fs.readdirSync(path.join(workspaceAssetDirectory, "chunks"))
    : [];
  if (!chunks.some((file) => file.startsWith("sonner-island-") && file.endsWith(".js"))) failures.push("workspace-reference/chunks: lazy Sonner bundle is missing");
  if (fs.existsSync(bundle) && fs.statSync(bundle).size > 50_000) failures.push("workspace-reference/reference.js: initial JavaScript bundle exceeds 50 KB");
  if (fs.existsSync(coreBundle) && fs.statSync(coreBundle).size > 50_000) failures.push("workspace-reference/core-components.js: initial JavaScript bundle exceeds 50 KB");
  if (fs.existsSync(motionBundle) && fs.statSync(motionBundle).size > 50_000) failures.push("workspace-reference/motion-reference.js: initial JavaScript bundle exceeds 50 KB");
  if (fs.existsSync(integrationBundle) && fs.statSync(integrationBundle).size > 90_000) failures.push("workspace-reference/integration-reference.js: initial integration bundle exceeds 90 KB");
  if (fs.existsSync(showcaseComponentsBundle) && fs.statSync(showcaseComponentsBundle).size > 55_000) {
    failures.push("workspace-reference/showcase-components.js: initial component specimen bundle exceeds 55 KB");
  }
}

const assetDirectory = path.join(output, "assets");
if (fs.existsSync(path.join(assetDirectory, "sonner-island.js"))) failures.push("assets/sonner-island.js: unbundled source must not ship");
if (fs.existsSync(assetDirectory)) {
  const mainBundle = path.join(assetDirectory, "site.js");
  const showcaseBundle = path.join(assetDirectory, "showcase.js");
  const scenarioLabBundle = path.join(assetDirectory, "scenario-lab.js");
  const chunks = fs.existsSync(path.join(assetDirectory, "chunks"))
    ? fs.readdirSync(path.join(assetDirectory, "chunks"))
    : [];
  if (!chunks.some((file) => file.startsWith("sonner-island-") && file.endsWith(".js"))) failures.push("assets/chunks: lazy Sonner bundle is missing");
  if (fs.existsSync(mainBundle) && fs.statSync(mainBundle).size > 50_000) failures.push("assets/site.js: initial JavaScript bundle exceeds 50 KB");
  if (fs.existsSync(showcaseBundle) && fs.statSync(showcaseBundle).size > 30_000) failures.push("assets/showcase.js: initial JavaScript bundle exceeds 30 KB");
  if (fs.existsSync(scenarioLabBundle) && fs.statSync(scenarioLabBundle).size > 35_000) failures.push("assets/scenario-lab.js: initial JavaScript bundle exceeds 35 KB");
}

const cssPath = path.join(output, "assets/site.css");
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, "utf8");
  if (/transition(?:-property)?\s*:\s*all\b/i.test(css)) failures.push("assets/site.css: transition: all is forbidden");
  if (!/prefers-reduced-motion/.test(css)) failures.push("assets/site.css: reduced-motion response is missing");
  if (!/:focus-visible/.test(css)) failures.push("assets/site.css: visible focus behavior is missing");
  if (/@import\s+/i.test(css)) failures.push("assets/site.css: local CSS imports must be bundled for Pages deployment");
  for (const materialToken of [
    "--edge-highlight",
    "--edge-highlight-strong",
    "--edge-contact",
    "--shadow-contact",
    "--shadow-raised",
    "--shadow-floating",
  ]) {
    const escapedToken = materialToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`${escapedToken}\\s*:`, "u").test(css)) {
      failures.push(`assets/site.css: bundled material Token is missing -> ${materialToken}`);
    }
  }
}

const showcaseCssPath = path.join(output, "assets/showcase.css");
if (fs.existsSync(showcaseCssPath)) {
  const css = fs.readFileSync(showcaseCssPath, "utf8");
  if (/transition(?:-property)?\s*:\s*all\b/i.test(css)) failures.push("assets/showcase.css: transition: all is forbidden");
  if (/(?:linear|radial|conic)-gradient\s*\(/i.test(css)) failures.push("assets/showcase.css: decorative gradients are forbidden");
  if (!/prefers-reduced-motion/.test(css)) failures.push("assets/showcase.css: reduced-motion response is missing");
}

for (const posterName of ["int-01-normal-dark.png", "int-02-normal-dark.png"]) {
  const posterPath = path.join(output, "assets/posters", posterName);
  if (fs.existsSync(posterPath)) {
    const bytes = fs.readFileSync(posterPath);
    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    if (bytes.length < 24 || !bytes.subarray(0, 8).equals(pngSignature)) {
      failures.push(`assets/posters/${posterName}: expected a valid PNG poster`);
    } else if (bytes.readUInt32BE(16) !== 1180 || bytes.readUInt32BE(20) !== 760) {
      failures.push(`assets/posters/${posterName}: expected the governed 1180 x 760 reference viewport`);
    }
  }
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
    if (showcasedRows !== 18) failures.push("scenarios/index.html: expected 18 showcased scenario rows");
    if (plannedRows !== 13) failures.push("scenarios/index.html: expected 13 planned rows");
  }
}

const scenarioLabHtmlPath = path.join(output, "scenarios/lab.html");
if (fs.existsSync(scenarioLabHtmlPath)) {
  const scenarioLabHtml = fs.readFileSync(scenarioLabHtmlPath, "utf8");
  for (const marker of [
    'class="site-header global-header"',
    "data-mobile-nav",
    'data-global-nav-key="lab" aria-current="page"',
    "data-nav-background",
    "data-showcase-main",
    "data-lab-scenario",
    "data-lab-state",
    "data-lab-viewport-group",
    "data-lab-theme-group",
    "data-lab-verification",
    "data-lab-frame",
    "data-lab-controls",
    "data-lab-controls-trigger",
    "data-lab-sizing",
    "data-lab-fullscreen",
    "data-lab-scale-readout",
  ]) {
    if (!scenarioLabHtml.includes(marker)) failures.push("scenarios/lab.html: missing inspection marker " + marker);
  }
  if (!scenarioLabHtml.includes('src="../assets/site.js"')) failures.push("scenarios/lab.html: global site controller is missing");
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
