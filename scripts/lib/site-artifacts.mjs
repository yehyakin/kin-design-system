import fs from "node:fs";
import path from "node:path";
import { compareCodePoints } from "./canonical-content.mjs";
import { normalizeRepositoryPath, resolveExistingPathWithin, resolveOutputFileWithin } from "./safe-path.mjs";

export const SITE_COPY_ARTIFACTS = Object.freeze([
  ["site/404.html", "404.html"],
  ["site/index.html", "index.html"],
  ["site/manifest.webmanifest", "manifest.webmanifest"],
  ["site/robots.txt", "robots.txt"],
  ["site/sitemap.xml", "sitemap.xml"],
  ["site/zh/index.html", "zh/index.html"],
  ["site/assets/mark.svg", "assets/mark.svg"],
  ["site/assets/og-card.svg", "assets/og-card.svg"],
  ["site/assets/site.css", "assets/site.css"],
  ["site/scenarios/index.html", "scenarios/index.html"],
  ["site/scenarios/lab.html", "scenarios/lab.html"],
  ["scenarios/catalog.json", "scenarios/catalog.json"],
  ["scenarios/catalog.schema.json", "scenarios/catalog.schema.json"],
  ["tokens/kin.tokens.json", "tokens/kin.tokens.json"],
  ["tokens/kin.tailwind.css", "tokens/kin.tailwind.css"],
  ["tokens/kin.figma.variables.json", "tokens/kin.figma.variables.json"],
  ["examples/page-patterns/access.html", "examples/page-patterns/access.html"],
  ["examples/page-patterns/onboarding.html", "examples/page-patterns/onboarding.html"],
  ["examples/page-patterns/page-patterns.css", "examples/page-patterns/page-patterns.css"],
  ["examples/page-patterns/scheduling.html", "examples/page-patterns/scheduling.html"],
  ["examples/page-patterns/search.html", "examples/page-patterns/search.html"],
  ["examples/page-patterns/settings.html", "examples/page-patterns/settings.html"],
  ["examples/page-patterns/support.html", "examples/page-patterns/support.html"],
  ["examples/page-patterns/system.html", "examples/page-patterns/system.html"],
  ["examples/product-patterns/canvas.html", "examples/product-patterns/canvas.html"],
  ["examples/product-patterns/ecommerce.html", "examples/product-patterns/ecommerce.html"],
  ["examples/product-patterns/information.html", "examples/product-patterns/information.html"],
  ["examples/product-patterns/patterns.css", "examples/product-patterns/patterns.css"],
  ["examples/product-patterns/theme.js", "examples/product-patterns/theme.js"],
  ["examples/shared/modal-scroll-lock.js", "examples/shared/modal-scroll-lock.js"],
  ["examples/shared/preference-controls.css", "examples/shared/preference-controls.css"],
  ["examples/workspace-reference/advanced-components.css", "examples/workspace-reference/advanced-components.css"],
  ["examples/workspace-reference/advanced-components.html", "examples/workspace-reference/advanced-components.html"],
  ["examples/workspace-reference/advanced-components.js", "examples/workspace-reference/advanced-components.js"],
  ["examples/workspace-reference/core-components.css", "examples/workspace-reference/core-components.css"],
  ["examples/workspace-reference/core-components.html", "examples/workspace-reference/core-components.html"],
  ["examples/workspace-reference/index.html", "examples/workspace-reference/index.html"],
  ["examples/workspace-reference/integrations.css", "examples/workspace-reference/integrations.css"],
  ["examples/workspace-reference/integrations.html", "examples/workspace-reference/integrations.html"],
  ["examples/workspace-reference/investigation-reference.js", "examples/workspace-reference/investigation-reference.js"],
  ["examples/workspace-reference/motion.css", "examples/workspace-reference/motion.css"],
  ["examples/workspace-reference/motion.html", "examples/workspace-reference/motion.html"],
  ["examples/workspace-reference/states.css", "examples/workspace-reference/states.css"],
  ["examples/workspace-reference/states.html", "examples/workspace-reference/states.html"],
  ["examples/workspace-reference/states.js", "examples/workspace-reference/states.js"],
  ["examples/workspace-reference/styles.css", "examples/workspace-reference/styles.css"],
]);

export const SITE_GENERATED_ARTIFACTS = Object.freeze([
  "assets/kin-react.css",
  "assets/scenario-lab.js",
  "assets/site.js",
  "assets/sonner.css",
  "examples/page-patterns/reference.js",
  "examples/shared/preference-controls.js",
  "examples/workspace-reference/core-components.js",
  "examples/workspace-reference/integration-reference.js",
  "examples/workspace-reference/motion-reference.js",
  "examples/workspace-reference/reference.js",
]);

const SITE_GENERATED_CHUNK_PATTERNS = Object.freeze([
  /^assets\/chunks\/[a-z0-9-]+-[A-Z0-9]+\.js$/iu,
  /^examples\/page-patterns\/chunks\/[a-z0-9-]+-[A-Z0-9]+\.js$/iu,
  /^examples\/shared\/chunks\/[a-z0-9-]+-[A-Z0-9]+\.js$/iu,
  /^examples\/workspace-reference\/chunks\/[a-z0-9-]+-[A-Z0-9]+\.js$/iu,
]);

export function copySiteArtifacts({ root, output }) {
  for (const [sourcePath, publicPath] of SITE_COPY_ARTIFACTS) {
    const source = resolveExistingPathWithin(root, sourcePath);
    const sourceStat = fs.lstatSync(source);
    if (!sourceStat.isFile() || sourceStat.isSymbolicLink()) {
      throw new Error(`${sourcePath}: public showcase source must be a regular file`);
    }
    const target = resolveOutputFileWithin(output, publicPath, { createParents: true });
    fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
  }
}

export function listSiteOutputFiles(directory, prefix = "", findings = []) {
  if (!fs.existsSync(directory)) return { files: [], findings };
  const rootStat = fs.lstatSync(directory);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    findings.push(`${prefix || "."}: site output must contain only real directories`);
    return { files: [], findings };
  }
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = normalizeRepositoryPath(prefix ? `${prefix}/${entry.name}` : entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) findings.push(`${relative}: symbolic links are not allowed in site output`);
    else if (entry.isDirectory()) files.push(...listSiteOutputFiles(absolute, relative, findings).files);
    else if (entry.isFile()) files.push(relative);
    else findings.push(`${relative}: unsupported site output entry`);
  }
  return { files: files.sort(compareCodePoints), findings };
}

export function validateSiteOutputAllowlist({ output, agentPaths }) {
  const findings = [];
  const tree = listSiteOutputFiles(output);
  findings.push(...tree.findings);
  const exact = new Set([
    ...SITE_COPY_ARTIFACTS.map(([, publicPath]) => publicPath),
    ...SITE_GENERATED_ARTIFACTS,
    ...agentPaths,
  ]);
  for (const file of tree.files) {
    if (exact.has(file)) continue;
    if (SITE_GENERATED_CHUNK_PATTERNS.some((pattern) => pattern.test(file))) continue;
    findings.push(`${file}: file is not in the explicit Pages artifact allowlist`);
  }
  for (const file of exact) {
    if (!tree.files.includes(file)) findings.push(`${file}: allowlisted Pages artifact is missing`);
  }
  return findings;
}
