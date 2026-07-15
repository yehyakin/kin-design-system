import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import React from "react";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

const root = process.cwd().endsWith(path.join("packages", "react"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();
const packageRoot = path.join(root, "packages", "react");
const reactVersion = process.env.KIN_REACT_VERSION ?? React.version;
const supportedVersion = /^(?:18\.2\.0|19\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;
assert.match(
  reactVersion,
  supportedVersion,
  "KIN_REACT_VERSION must be React 18.2.0 or an exact React 19 release",
);

const npmCliCandidates = [
  process.env.npm_execpath,
  path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"),
  path.resolve(path.dirname(process.execPath), "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"),
].filter(Boolean);
const npmCli = npmCliCandidates.find((candidate) => fs.existsSync(candidate));
assert.ok(npmCli, `Unable to locate npm CLI. Checked: ${npmCliCandidates.join(", ")}`);

function runNpm(args, options) {
  return execFileSync(process.execPath, [npmCli, ...args], options);
}

assert.ok(fs.existsSync(path.join(packageRoot, "dist", "index.js")), "build @kin-design/react before running compatibility checks");

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), `kin-react-${reactVersion.replaceAll(".", "-")}-`));
let browser;
try {
  const packOutput = runNpm(
    ["pack", packageRoot, "--json", "--pack-destination", temporaryRoot],
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  const [packResult] = JSON.parse(packOutput);
  const tarball = path.join(temporaryRoot, packResult.filename);
  const consumerRoot = path.join(temporaryRoot, "consumer");
  fs.mkdirSync(consumerRoot);
  fs.writeFileSync(path.join(consumerRoot, "package.json"), JSON.stringify({
    name: `kin-react-${reactVersion}-compatibility`,
    private: true,
    type: "module",
  }, null, 2));

  runNpm(
    [
      "install",
      tarball,
      `react@${reactVersion}`,
      `react-dom@${reactVersion}`,
      "input-otp@1.4.2",
      "sonner@2.0.7",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--no-package-lock",
    ],
    { cwd: consumerRoot, stdio: "pipe" },
  );

  const appModule = `
import React from "react";
import { KinOTPInput } from "@kin-design/react/experimental/input-otp";
import { KinToaster } from "@kin-design/react/sonner";

export const app = React.createElement(
  React.Fragment,
  null,
  React.createElement("span", { id: "external-help" }, "Authenticator help"),
  React.createElement(KinOTPInput, {
    label: "Verification code",
    description: "Six digits",
    "aria-describedby": "external-help",
  }),
  React.createElement(KinToaster, {
    locale: "fr-FR",
    labels: { notifications: "Avis", closeNotification: "Fermer la notification" },
    containerAriaLabel: "Product alerts",
  }),
);
`;
  fs.writeFileSync(path.join(consumerRoot, "app.mjs"), appModule);
  fs.writeFileSync(path.join(consumerRoot, "render.mjs"), `
import { renderToString } from "react-dom/server";
import { app } from "./app.mjs";
process.stdout.write(renderToString(app));
`);
  fs.writeFileSync(path.join(consumerRoot, "hydrate.jsx"), `
import { hydrateRoot } from "react-dom/client";
import { app } from "./app.mjs";

window.__KIN_RECOVERABLE_ERRORS__ = [];
window.__KIN_HYDRATED__ = false;
hydrateRoot(document.getElementById("root"), app, {
  onRecoverableError(error) {
    window.__KIN_RECOVERABLE_ERRORS__.push(error instanceof Error ? error.message : String(error));
  },
});
requestAnimationFrame(() => requestAnimationFrame(() => {
  window.__KIN_HYDRATED__ = true;
}));
`);

  const serverMarkup = execFileSync(process.execPath, [path.join(consumerRoot, "render.mjs")], {
    cwd: consumerRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  assert.match(serverMarkup, /Verification code/);
  assert.match(serverMarkup, /external-help/);
  assert.match(serverMarkup, /Product alerts alt\+T/);

  const bundle = await build({
    entryPoints: [path.join(consumerRoot, "hydrate.jsx")],
    absWorkingDir: consumerRoot,
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    define: { "process.env.NODE_ENV": '"development"' },
    logLevel: "silent",
  });
  const hydrationScript = Buffer.concat(bundle.outputFiles.map((file) => file.contents)).toString("utf8");

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setContent(`<!doctype html><html><body><main id="root">${serverMarkup}</main></body></html>`);
  await page.addScriptTag({ content: hydrationScript });
  await page.waitForFunction(() => window.__KIN_HYDRATED__ === true);

  const result = await page.evaluate(() => {
    const input = document.querySelector('input[autocomplete="one-time-code"]');
    const toaster = document.querySelector('section[aria-live="polite"]');
    return {
      recoverableErrors: window.__KIN_RECOVERABLE_ERRORS__,
      describedBy: input?.getAttribute("aria-describedby"),
      inputCount: document.querySelectorAll('input[autocomplete="one-time-code"]').length,
      toasterLabel: toaster?.getAttribute("aria-label"),
    };
  });

  assert.deepEqual(result.recoverableErrors, [], `React ${reactVersion} reported recoverable hydration errors`);
  assert.deepEqual(pageErrors, [], `React ${reactVersion} emitted browser page errors`);
  assert.deepEqual(consoleErrors, [], `React ${reactVersion} emitted browser console errors`);
  assert.equal(result.inputCount, 1, "hydration must preserve one OTP input");
  assert.match(result.describedBy ?? "", /external-help/);
  assert.match(result.toasterLabel ?? "", /Product alerts/);
  console.log(`@kin-design/react SSR -> hydrateRoot passed with React ${reactVersion}.`);
} finally {
  await browser?.close();
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
