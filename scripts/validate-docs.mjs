import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const ignored = new Set([".git", ".site-dist", "node_modules", "dist", "build", "coverage"]);
const required = [
  "DESIGN.md",
  "README.md",
  "REFERENCES.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "ROADMAP.md",
  "RELEASING.md",
  "AGENTS.md",
  "LICENSE",
  "components/core-states.md",
  "skills/kin-design/SKILL.md",
  "tokens/kin.tailwind.css",
  "tokens/kin.tokens.json",
  "tokens/kin.figma.variables.json",
  "adoption/README.md",
  "adoption/kin.config.example.json",
  "adoption/kin.config.schema.json",
  "examples/workspace-reference/index.html",
  "examples/workspace-reference/states.html",
  "package.json",
  "package-lock.json",
  "playwright.config.js",
  "tests/visual/workspace.spec.js",
  "tests/tooling.test.mjs",
  "tests/visual/site.spec.js",
  "scripts/audit-project.mjs",
  "scripts/build-site.mjs",
  "scripts/serve-site.mjs",
  "scripts/validate-site.mjs",
  "scripts/check-adoption.mjs",
  "scripts/export-figma-variables.mjs",
  "scripts/init-adoption.mjs",
  "scripts/validate-release.mjs",
  "patterns/information-site.md",
  "patterns/intelligence-workspace.md",
  "patterns/ecommerce-operations.md",
  "patterns/engineering-canvas.md",
  "examples/product-patterns/information.html",
  "examples/product-patterns/ecommerce.html",
  "examples/product-patterns/canvas.html",
  "site/index.html",
  "site/zh/index.html",
  "site/assets/site.css",
  "site/assets/site.js",
  ".github/workflows/deploy-pages.yml",
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return entry.isFile() && entry.name.endsWith(".md") ? [absolute] : [];
  });
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

const failures = [];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`${file}: required file is missing`);
}

const markdownFiles = walk(root);
const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, "utf8");
  const name = relative(file);
  const fenceCount = content.match(/```/g)?.length ?? 0;

  if (fenceCount % 2 !== 0) failures.push(`${name}: unpaired fenced code block`);
  if (/^(<<<<<<<|=======|>>>>>>>) /m.test(content)) failures.push(`${name}: unresolved merge marker`);
  if (/<!--\s*(TODO|TBD|PLACEHOLDER)\b/i.test(content)) failures.push(`${name}: unresolved placeholder comment`);

  for (const match of content.matchAll(linkPattern)) {
    const rawTarget = match[1].trim();
    if (
      rawTarget.startsWith("http://") ||
      rawTarget.startsWith("https://") ||
      rawTarget.startsWith("mailto:") ||
      rawTarget.startsWith("#")
    ) continue;

    const withoutTitle = rawTarget.replace(/\s+["'][^"']*["']$/, "");
    const fileTarget = decodeURIComponent(withoutTitle.split("#")[0]);
    if (!fileTarget) continue;

    const resolved = path.resolve(path.dirname(file), fileTarget);
    if (!fs.existsSync(resolved)) failures.push(`${name}: broken local link -> ${rawTarget}`);
  }
}

if (failures.length > 0) {
  console.error(`Documentation validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Documentation validation passed: ${markdownFiles.length} Markdown files checked.`);
