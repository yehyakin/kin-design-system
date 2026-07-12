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
  "assets/mark.svg",
  "assets/og-card.svg",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "examples/workspace-reference/index.html",
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
  const htmlFiles = ["index.html", "zh/index.html", "404.html"].map((file) => path.join(output, file));
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
