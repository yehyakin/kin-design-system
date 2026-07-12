import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const failures = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function fail(message) {
  failures.push(message);
}

const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
const design = read("DESIGN.md");
const designVersion = design.match(/^kin_version:\s*([0-9]+\.[0-9]+\.[0-9]+)\s*$/m)?.[1];
const version = packageJson.version;

if (!designVersion) fail("DESIGN.md does not expose kin_version in frontmatter");
if (designVersion !== version) fail(`DESIGN.md kin_version ${designVersion ?? "missing"} differs from package version ${version}`);
if (packageLock.version !== version) fail(`package-lock.json version ${packageLock.version} differs from package version ${version}`);
if (packageLock.packages?.[""]?.version !== version) fail("package-lock.json root package version is out of date");

for (const file of ["README.md", "READMEs/README.zh-CN.md"]) {
  const source = read(file);
  if (!source.includes(`Design_Contract-v${version}-`)) fail(`${file} badge does not use v${version}`);
  if (!source.includes(`KIN Design Contract v${version}`)) fail(`${file} badge alt text does not use v${version}`);
}

const adoption = JSON.parse(read("adoption/kin.config.example.json"));
JSON.parse(read("adoption/kin.config.schema.json"));
if (adoption.kinVersion !== version) fail("adoption/kin.config.example.json has a different kinVersion");
if (!adoption.contract?.source?.includes(`/v${version}`)) fail("adoption example contract source is not pinned to the matching release URL");
if (!read("CHANGELOG.md").includes(`## ${version} —`)) fail(`CHANGELOG.md does not contain a ${version} release section`);

const staleReferencePattern = /\bKIN\s+(\d+\.\d+(?:\.\d+)?)\b/g;
for (const file of ["examples/workspace-reference/index.html", "examples/workspace-reference/states.html", "examples/product-patterns/information.html", "examples/product-patterns/ecommerce.html", "examples/product-patterns/canvas.html"]) {
  for (const match of read(file).matchAll(staleReferencePattern)) {
    if (match[1] !== version) fail(`${file} contains stale product label: ${match[0]}`);
  }
}

if (failures.length > 0) {
  console.error(`Release validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Release validation passed: KIN ${version}`);
