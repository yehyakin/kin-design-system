import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const ignored = new Set([".git", "node_modules", "dist", "build", "coverage"]);
const required = [
  "DESIGN.md",
  "README.md",
  "REFERENCES.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "ROADMAP.md",
  "AGENTS.md",
  "LICENSE",
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
