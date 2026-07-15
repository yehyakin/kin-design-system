import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import React from "react";
import { renderToString } from "react-dom/server";
import { build } from "esbuild";

const root = process.cwd().endsWith(path.join("packages", "react"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();
const packageRoot = path.join(root, "packages", "react");
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));

for (const artifact of ["README.md", "ADOPTION.md", "RFC.md", "CHANGELOG.md", "SUPPORT.md"]) {
  assert.ok(packageJson.files.includes(artifact), `package files must include ${artifact}`);
}
assert.ok(packageJson.files.includes("dist"), "package files must include dist");
assert.ok(!packageJson.files.includes("src"), "package files must not publish source as a substitute for reviewed build output");

for (const [subpath, target] of Object.entries(packageJson.exports)) {
  if (typeof target === "string") {
    assert.ok(fs.existsSync(path.join(packageRoot, target)), `${subpath} export is missing ${target}`);
    continue;
  }
  assert.ok(fs.existsSync(path.join(packageRoot, target.import)), `${subpath} import is missing ${target.import}`);
  assert.ok(fs.existsSync(path.join(packageRoot, target.types)), `${subpath} types are missing ${target.types}`);
}

const load = (name) => import(pathToFileURL(path.join(packageRoot, "dist", `${name}.js`)).href);
const { AnimatedMetric } = await load("number-flow");
const { KinToaster } = await load("sonner");
const { KinOTPInput } = await load("input-otp");

const metricMarkup = renderToString(React.createElement(AnimatedMetric, { label: "Availability", value: 98.7, suffix: "%" }));
assert.match(metricMarkup, /Availability/);
assert.match(metricMarkup, /number-flow-react/);

const toasterMarkup = renderToString(React.createElement(KinToaster, { theme: "dark" }));
assert.equal(typeof toasterMarkup, "string");

const otpMarkup = renderToString(React.createElement(KinOTPInput, { label: "Verification code", maxLength: undefined }));
assert.match(otpMarkup, /Verification code/);
assert.match(otpMarkup, /one-time-code/);

const css = fs.readFileSync(path.join(packageRoot, "dist", "styles.css"), "utf8");
assert.match(css, /@import "sonner\/dist\/styles.css"/);
assert.match(css, /kin-animated-metric/);

const bundleCeilings = {
  index: 1_000,
  sonner: 40_000,
  "number-flow": 24_000,
  cmdk: 55_000,
  virtuoso: 70_000,
  "dnd-kit": 60_000,
  "input-otp": 15_000,
  liveline: 75_000,
  leva: 230_000,
};

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
  const bytes = result.outputFiles.reduce((total, file) => total + file.contents.length, 0);
  assert.ok(bytes <= bundleCeilings[entry], `${entry} bundle ${bytes} bytes exceeds ${bundleCeilings[entry]} byte ceiling`);
  return { inputs: Object.keys(result.metafile.inputs).join("\n"), bytes };
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

console.log("KIN React package smoke, SSR, exports, styles, and bundle boundaries passed.");
console.table(Object.fromEntries(Object.entries(reports).map(([entry, report]) => [entry, { bytes: report.bytes }])));
