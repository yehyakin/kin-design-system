import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const failures = [];
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = (file) => fs.existsSync(path.join(root, file));

const catalog = readJson("integrations/catalog.json");
const rootPackage = readJson("package.json");
const runtimePackage = readJson("packages/react/package.json");
const ids = new Set();
const packages = new Set();
const allowedStatuses = new Set(["runtime-integrated", "development-integrated", "visual-integrated"]);

const expectedPolicy = {
  source_mode: "official-package",
  behavior_strategy: "preserve-upstream",
  visual_strategy: "public-token-theme-or-composition-adapter",
  forking: "prohibited-without-recorded-exception",
};

for (const [field, expected] of Object.entries(expectedPolicy)) {
  if (catalog.integration_policy?.[field] !== expected) failures.push(`integration policy ${field} must be ${expected}`);
}

if (catalog.runtime_package.name !== runtimePackage.name) failures.push("runtime package name does not match integrations/catalog.json");
if (catalog.runtime_package.version !== runtimePackage.version) failures.push("runtime package version does not match integrations/catalog.json");
if (!runtimePackage.private) failures.push("pre-release runtime package must remain private");
for (const field of ["rfc", "adoption", "support", "changelog"]) {
  if (!exists(catalog.runtime_package[field])) failures.push(`runtime ${field} is missing: ${catalog.runtime_package[field]}`);
}

for (const item of catalog.integrations) {
  if (ids.has(item.id)) failures.push(`${item.id}: duplicate integration id`);
  ids.add(item.id);
  if (packages.has(item.package)) failures.push(`${item.id}: duplicate primary package ${item.package}`);
  packages.add(item.package);
  if (!allowedStatuses.has(item.status)) failures.push(`${item.id}: unknown integration status ${item.status}`);
  if (!Array.isArray(item.preserved_upstream) || item.preserved_upstream.length === 0) failures.push(`${item.id}: preserved_upstream must name the official behavior retained`);
  if (!Array.isArray(item.kin_owns) || item.kin_owns.length === 0) failures.push(`${item.id}: kin_owns must name the adapter boundary`);
  if (!Array.isArray(item.test_paths) || item.test_paths.length === 0) failures.push(`${item.id}: integration must name test evidence`);

  for (const key of ["source_path", "contract_path", "reference_path"]) {
    if (!exists(item[key])) failures.push(`${item.id}: missing ${key} -> ${item[key]}`);
  }
  for (const testPath of item.test_paths ?? []) {
    if (!exists(testPath)) failures.push(`${item.id}: missing test evidence -> ${testPath}`);
  }

  const rootVersion = rootPackage.devDependencies?.[item.package];
  if (rootVersion !== item.version) failures.push(`${item.id}: root devDependency must pin ${item.package}@${item.version}`);

  if (item.status === "runtime-integrated") {
    const runtimeVersion = runtimePackage.dependencies?.[item.package];
    if (runtimeVersion !== item.version) failures.push(`${item.id}: runtime dependency must pin ${item.package}@${item.version}`);
    if (!item.export_path || !runtimePackage.exports?.[item.export_path]) failures.push(`${item.id}: package export is missing ${item.export_path}`);
  }

  if (item.status === "development-integrated") {
    if (!item.export_path?.startsWith("./dev/")) failures.push(`${item.id}: development integration must use a ./dev/ export`);
    if (!runtimePackage.exports?.[item.export_path]) failures.push(`${item.id}: package export is missing ${item.export_path}`);
    const peerVersion = runtimePackage.peerDependencies?.[item.package];
    if (!peerVersion) failures.push(`${item.id}: development integration must remain an optional peer dependency`);
    if (!runtimePackage.peerDependenciesMeta?.[item.package]?.optional) failures.push(`${item.id}: development peer must be optional`);
  }

  if (item.export_path?.startsWith("./experimental/") && !["Number Transition", "Drag and Drop", "OTP", "Live Chart"].includes(item.catalog_component)) {
    failures.push(`${item.id}: experimental export has no candidate catalog mapping`);
  }

  for (const [relatedPackage, version] of Object.entries(item.related_packages ?? {})) {
    if (runtimePackage.dependencies?.[relatedPackage] !== version) failures.push(`${item.id}: runtime dependency must pin ${relatedPackage}@${version}`);
    if (rootPackage.devDependencies?.[relatedPackage] !== version) failures.push(`${item.id}: root devDependency must pin ${relatedPackage}@${version}`);
  }

  if (exists(item.source_path)) {
    const source = fs.readFileSync(path.join(root, item.source_path), "utf8");
    if (!source.includes(`"${item.package}"`) && !source.includes(`'${item.package}'`)) failures.push(`${item.id}: source does not directly import ${item.package}`);
  }
}

const rootEntry = fs.readFileSync(path.join(root, "packages/react/src/index.ts"), "utf8");
for (const integration of catalog.integrations.filter((item) => item.status !== "visual-integrated")) {
  if (rootEntry.includes(integration.package)) failures.push(`${integration.id}: package root must not import optional runtime engines`);
}

if (failures.length > 0) {
  console.error(`Integration validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Integration validation passed (${catalog.integrations.length} official packages registered).`);
