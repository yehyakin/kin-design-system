import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import React from "react";
import { renderToString } from "react-dom/server";
import { build } from "esbuild";

const root = process.cwd().endsWith(path.join("packages", "react"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();
const packageRoot = path.join(root, "packages", "react");
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
const npmCli = process.env.npm_execpath
  ?? path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");

function runNpm(args, options) {
  return execFileSync(process.execPath, [npmCli, ...args], options);
}

const packageArtifacts = ["README.md", "ADOPTION.md", "RFC.md", "CHANGELOG.md", "SUPPORT.md", "LICENSE"];
for (const artifact of packageArtifacts) {
  assert.ok(packageJson.files.includes(artifact), `package files must include ${artifact}`);
}
assert.ok(packageJson.files.includes("dist"), "package files must include dist");
assert.ok(!packageJson.files.includes("src"), "package files must not publish source as a substitute for reviewed build output");
assert.equal(packageJson.type, "module", "the pre-release package is ESM-only");
assert.match(packageJson.engines?.node ?? "", /^>=20\.11/, "the package must state its Node support floor");

const optionalIntegrationPeers = [
  "@dnd-kit/core",
  "@dnd-kit/sortable",
  "@dnd-kit/utilities",
  "@number-flow/react",
  "cmdk",
  "input-otp",
  "leva",
  "liveline",
  "react-virtuoso",
  "sonner",
];
assert.equal(packageJson.dependencies, undefined, "integration engines must not be eager installation dependencies");
for (const dependency of optionalIntegrationPeers) {
  assert.equal(packageJson.peerDependenciesMeta?.[dependency]?.optional, true, `${dependency} must remain an optional peer`);
}

for (const [subpath, target] of Object.entries(packageJson.exports)) {
  if (typeof target === "string") {
    assert.ok(fs.existsSync(path.join(packageRoot, target)), `${subpath} export is missing ${target}`);
    continue;
  }
  assert.ok(fs.existsSync(path.join(packageRoot, target.import)), `${subpath} import is missing ${target.import}`);
  assert.ok(fs.existsSync(path.join(packageRoot, target.types)), `${subpath} types are missing ${target.types}`);
}

const distFiles = fs.readdirSync(path.join(packageRoot, "dist"), { recursive: true, withFileTypes: true });
assert.ok(!distFiles.some((entry) => entry.isFile() && entry.name.endsWith(".map")), "dist must not contain broken source maps");

const load = (name) => import(pathToFileURL(path.join(packageRoot, "dist", `${name}.js`)).href);
const { AnimatedMetric } = await load("number-flow");
const { KinToaster } = await load("sonner");
const { KinOTPInput } = await load("input-otp");

const metricMarkup = renderToString(React.createElement(AnimatedMetric, { label: "Availability", value: 98.7, suffix: "%" }));
assert.match(metricMarkup, /Availability/);
assert.match(metricMarkup, /number-flow-react/);

const toasterMarkup = renderToString(React.createElement(KinToaster, {
  locale: "fr-FR",
  labels: { notifications: "Avis", closeNotification: "Fermer la notification" },
  containerAriaLabel: "Product alerts",
}));
assert.match(toasterMarkup, /aria-label="Product alerts alt\+T"/);
assert.doesNotMatch(toasterMarkup, /Notifications alt\+T/);

const localizedToasterMarkup = renderToString(React.createElement(KinToaster, {
  locale: "fr-FR",
  labels: { notifications: "Avis" },
}));
assert.match(localizedToasterMarkup, /aria-label="Avis alt\+T"/);

const otpMarkup = renderToString(React.createElement(KinOTPInput, {
  id: "verification-code",
  label: "Verification code",
  description: "Six digits",
  "aria-describedby": "external-help external-help",
  "aria-invalid": "spelling",
}));
assert.match(otpMarkup, /Verification code/);
assert.match(otpMarkup, /one-time-code/);
assert.match(otpMarkup, /aria-describedby="external-help verification-code-description"/);
assert.match(otpMarkup, /aria-invalid="spelling"/);

const invalidOtpMarkup = renderToString(React.createElement(KinOTPInput, {
  id: "invalid-code",
  label: "Verification code",
  error: "Code expired",
  "aria-describedby": "attempt-help",
  "aria-invalid": false,
}));
assert.match(invalidOtpMarkup, /aria-describedby="attempt-help invalid-code-error"/);
assert.match(invalidOtpMarkup, /aria-invalid="true"/);

const styleEntries = ["base", "sonner", "number-flow", "cmdk", "virtuoso", "dnd-kit", "input-otp", "liveline"];
const cssCeilings = {
  "styles.css": { raw: 1_200, gzip: 500 },
  "styles/base.css": { raw: 500, gzip: 300 },
  "styles/sonner.css": { raw: 2_500, gzip: 900 },
  "styles/number-flow.css": { raw: 1_200, gzip: 600 },
  "styles/cmdk.css": { raw: 4_000, gzip: 1_300 },
  "styles/virtuoso.css": { raw: 1_200, gzip: 550 },
  "styles/dnd-kit.css": { raw: 2_700, gzip: 900 },
  "styles/input-otp.css": { raw: 2_700, gzip: 900 },
  "styles/liveline.css": { raw: 2_000, gzip: 750 },
};
const cssReports = {};
for (const [relativePath, ceiling] of Object.entries(cssCeilings)) {
  const contents = fs.readFileSync(path.join(packageRoot, "dist", relativePath), "utf8");
  const raw = Buffer.byteLength(contents);
  const gzip = gzipSync(contents).byteLength;
  assert.ok(raw <= ceiling.raw, `${relativePath} CSS ${raw} bytes exceeds ${ceiling.raw} byte ceiling`);
  assert.ok(gzip <= ceiling.gzip, `${relativePath} CSS gzip ${gzip} bytes exceeds ${ceiling.gzip} byte ceiling`);
  cssReports[relativePath] = { raw, gzip };
}

const aggregateCss = fs.readFileSync(path.join(packageRoot, "dist", "styles.css"), "utf8");
for (const entry of styleEntries) assert.match(aggregateCss, new RegExp(`styles/${entry}\\.css`));
const baseCss = fs.readFileSync(path.join(packageRoot, "dist", "styles", "base.css"), "utf8");
assert.doesNotMatch(baseCss, /@import\s+["'][^"']*(?:sonner|cmdk|number-flow|virtuoso|dnd-kit|input-otp|liveline|leva)/);
const sonnerCss = fs.readFileSync(path.join(packageRoot, "dist", "styles", "sonner.css"), "utf8");
assert.match(sonnerCss, /@import "sonner\/dist\/styles\.css"/);
for (const entry of styleEntries.filter((entry) => entry !== "sonner")) {
  const contents = fs.readFileSync(path.join(packageRoot, "dist", "styles", `${entry}.css`), "utf8");
  assert.doesNotMatch(contents, /@import\s+["'](?!\.\/)/, `${entry}.css must not pull another package`);
}

const bundleCeilings = {
  index: { raw: 1_000, gzip: 700 },
  sonner: { raw: 40_000, gzip: 15_000 },
  "number-flow": { raw: 24_000, gzip: 10_000 },
  cmdk: { raw: 55_000, gzip: 20_000 },
  virtuoso: { raw: 70_000, gzip: 25_000 },
  "dnd-kit": { raw: 60_000, gzip: 20_000 },
  "input-otp": { raw: 15_000, gzip: 7_000 },
  liveline: { raw: 75_000, gzip: 30_000 },
  leva: { raw: 230_000, gzip: 75_000 },
};

function packageNameFromInput(input) {
  const normalized = input.replaceAll("\\", "/");
  const marker = "node_modules/";
  const index = normalized.lastIndexOf(marker);
  if (index < 0) return undefined;
  const segments = normalized.slice(index + marker.length).split("/");
  return segments[0]?.startsWith("@") ? `${segments[0]}/${segments[1]}` : segments[0];
}

async function bundleReport(entry) {
  const result = await build({
    entryPoints: [path.join(packageRoot, "dist", `${entry}.js`)],
    bundle: true,
    write: false,
    metafile: true,
    format: "esm",
    platform: "browser",
    external: ["react", "react-dom", "react/jsx-runtime"],
    minify: true,
    logLevel: "silent",
  });
  const contents = Buffer.concat(result.outputFiles.map((file) => file.contents));
  const raw = contents.byteLength;
  const gzip = gzipSync(contents).byteLength;
  const ceiling = bundleCeilings[entry];
  assert.ok(raw <= ceiling.raw, `${entry} bundle ${raw} bytes exceeds ${ceiling.raw} byte ceiling`);
  assert.ok(gzip <= ceiling.gzip, `${entry} bundle gzip ${gzip} bytes exceeds ${ceiling.gzip} byte ceiling`);

  const dependencies = new Set();
  for (const input of Object.keys(result.metafile.inputs)) {
    const dependency = packageNameFromInput(input);
    if (dependency) dependencies.add(dependency);
  }
  return {
    inputs: Object.keys(result.metafile.inputs).join("\n"),
    raw,
    gzip,
    dependencies: [...dependencies].sort(),
  };
}

const reports = {};
for (const entry of Object.keys(bundleCeilings)) reports[entry] = await bundleReport(entry);

const rootInputs = reports.index.inputs;
assert.doesNotMatch(rootInputs, /node_modules[\\/]leva/);
assert.doesNotMatch(rootInputs, /node_modules[\\/]sonner/);

const sonnerInputs = reports.sonner.inputs;
assert.match(sonnerInputs, /node_modules[\\/]sonner/);
assert.doesNotMatch(sonnerInputs, /node_modules[\\/]leva/);
assert.doesNotMatch(sonnerInputs, /node_modules[\\/]@number-flow/);

const numberFlowInputs = reports["number-flow"].inputs;
assert.match(numberFlowInputs, /node_modules[\\/]@number-flow/);
assert.doesNotMatch(numberFlowInputs, /node_modules[\\/]sonner/);

const levaInputs = reports.leva.inputs;
assert.match(levaInputs, /node_modules[\\/]leva/);
for (const entry of ["index", "sonner", "number-flow", "cmdk", "virtuoso", "dnd-kit", "input-otp", "liveline"]) {
  assert.doesNotMatch(reports[entry].inputs, /node_modules[\\/]leva/, `${entry} must not include Leva`);
}

function verifyPackedArtifact() {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "kin-react-package-"));
  try {
    const packOutput = runNpm(
      ["pack", packageRoot, "--json", "--pack-destination", temporaryRoot],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    const [packResult] = JSON.parse(packOutput);
    const packedPaths = new Set(packResult.files.map((file) => file.path.replaceAll("\\", "/")));
    for (const artifact of packageArtifacts) assert.ok(packedPaths.has(artifact), `tarball must include ${artifact}`);
    assert.ok(packedPaths.has("dist/index.js"), "tarball must include the ESM root");
    assert.ok(packedPaths.has("dist/styles/sonner.css"), "tarball must include isolated adapter CSS");
    assert.ok(![...packedPaths].some((file) => file.startsWith("src/")), "tarball must not include source files");
    assert.ok(![...packedPaths].some((file) => file.endsWith(".map")), "tarball must not contain broken maps");

    const tarball = path.join(temporaryRoot, packResult.filename);
    const consumerRoot = path.join(temporaryRoot, "consumer");
    fs.mkdirSync(consumerRoot);
    fs.writeFileSync(path.join(consumerRoot, "package.json"), JSON.stringify({ private: true, type: "module" }, null, 2));
    runNpm(
      ["install", tarball, "--offline", "--legacy-peer-deps", "--ignore-scripts", "--no-audit", "--no-fund", "--no-package-lock"],
      { cwd: consumerRoot, stdio: "pipe" },
    );
    execFileSync(
      process.execPath,
      ["--input-type=module", "--eval", "const pkg = await import('@kin-design/react'); if (pkg.KIN_REACT_INTEGRATIONS_STATUS !== 'pre-release') process.exit(1);"],
      { cwd: consumerRoot, stdio: "pipe" },
    );
    return { filename: packResult.filename, size: packResult.size, files: packedPaths.size };
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

const packReport = verifyPackedArtifact();

console.log("KIN React package smoke, SSR, exports, isolated styles, bundle, and clean tarball checks passed.");
console.table(Object.fromEntries(Object.entries(reports).map(([entry, report]) => [entry, {
  raw: report.raw,
  gzip: report.gzip,
  upstream: report.dependencies.filter((dependency) => optionalIntegrationPeers.includes(dependency)).join(", ") || "none",
  packages: report.dependencies.length,
}])));
console.table(cssReports);
console.table({ tarball: packReport });
