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
  "assets/sonner.css",
  "assets/mark.svg",
  "assets/og-card.svg",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "examples/workspace-reference/index.html",
  "examples/workspace-reference/reference.js",
  "examples/workspace-reference/core-components.html",
  "examples/workspace-reference/core-components.js",
  "examples/workspace-reference/motion.html",
  "examples/workspace-reference/motion-reference.js",
  "examples/page-patterns/access.html",
  "examples/page-patterns/scheduling.html",
  "examples/product-patterns/information.html",
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
    "examples/workspace-reference/index.html",
    "examples/workspace-reference/core-components.html",
    "examples/workspace-reference/motion.html",
    "examples/page-patterns/access.html",
    "examples/page-patterns/scheduling.html",
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
  const chunks = fs.existsSync(path.join(workspaceAssetDirectory, "chunks"))
    ? fs.readdirSync(path.join(workspaceAssetDirectory, "chunks"))
    : [];
  if (!chunks.some((file) => file.startsWith("sonner-island-") && file.endsWith(".js"))) failures.push("workspace-reference/chunks: lazy Sonner bundle is missing");
  if (fs.existsSync(bundle) && fs.statSync(bundle).size > 50_000) failures.push("workspace-reference/reference.js: initial JavaScript bundle exceeds 50 KB");
  if (fs.existsSync(coreBundle) && fs.statSync(coreBundle).size > 50_000) failures.push("workspace-reference/core-components.js: initial JavaScript bundle exceeds 50 KB");
  if (fs.existsSync(motionBundle) && fs.statSync(motionBundle).size > 50_000) failures.push("workspace-reference/motion-reference.js: initial JavaScript bundle exceeds 50 KB");
}

const assetDirectory = path.join(output, "assets");
if (fs.existsSync(path.join(assetDirectory, "sonner-island.js"))) failures.push("assets/sonner-island.js: unbundled source must not ship");
if (fs.existsSync(assetDirectory)) {
  const mainBundle = path.join(assetDirectory, "site.js");
  const chunks = fs.existsSync(path.join(assetDirectory, "chunks"))
    ? fs.readdirSync(path.join(assetDirectory, "chunks"))
    : [];
  if (!chunks.some((file) => file.startsWith("sonner-island-") && file.endsWith(".js"))) failures.push("assets/chunks: lazy Sonner bundle is missing");
  if (fs.existsSync(mainBundle) && fs.statSync(mainBundle).size > 50_000) failures.push("assets/site.js: initial JavaScript bundle exceeds 50 KB");
}

const cssPath = path.join(output, "assets/site.css");
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, "utf8");
  if (/transition(?:-property)?\s*:\s*all\b/i.test(css)) failures.push("assets/site.css: transition: all is forbidden");
  if (!/prefers-reduced-motion/.test(css)) failures.push("assets/site.css: reduced-motion response is missing");
  if (!/:focus-visible/.test(css)) failures.push("assets/site.css: visible focus behavior is missing");
}

if (failures.length > 0) {
  console.error(`Site validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Site validation passed.");
