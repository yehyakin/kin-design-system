import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { contractChecksum } from "./contract-checksum.mjs";

const args = process.argv.slice(2);
const profiles = new Set(["information-site", "intelligence-workspace", "ecommerce-operations", "engineering-canvas"]);
const semverPattern = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;
const fullCommitPattern = /^[a-f0-9]{40}$/i;
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let force = false;
let help = false;
let profile = "";
let targetArg = "";

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--force") force = true;
  else if (arg === "--help" || arg === "-h") help = true;
  else if (arg === "--profile") profile = args[++index] ?? "";
  else if (arg.startsWith("--profile=")) profile = arg.slice("--profile=".length);
  else if (arg.startsWith("--")) {
    console.error(`Unknown option: ${arg}`);
    process.exit(2);
  } else if (!targetArg) targetArg = arg;
  else {
    console.error(`Unexpected argument: ${arg}`);
    process.exit(2);
  }
}

targetArg ||= ".";
const target = path.resolve(targetArg);
const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const version = packageJson.version;
const designContract = fs.readFileSync(new URL("../DESIGN.md", import.meta.url));
const designSource = designContract.toString("utf8");
const designChecksum = contractChecksum(designContract);
const configPath = path.join(target, "kin.config.json");
const recordPath = path.join(target, "docs", "kin-adoption.md");
const evidencePath = path.join(target, "docs", "kin-evidence.json");
const briefPath = path.join(target, "docs", "kin-implementation-brief.md");

if (help) {
  console.log("Usage: node scripts/init-adoption.mjs [project-directory] --profile <profile> [--force]");
  console.log(`Profiles: ${[...profiles].join(", ")}`);
  console.log("Creates kin.config.json, docs/kin-adoption.md, docs/kin-implementation-brief.md, and docs/kin-evidence.json. Existing files are preserved unless --force is provided.");
  process.exit(0);
}

if (!profile) {
  console.error(`--profile is required. Choose one of: ${[...profiles].join(", ")}`);
  process.exit(2);
}

if (!profiles.has(profile)) {
  console.error(`Unsupported profile: ${profile}. Choose one of: ${[...profiles].join(", ")}`);
  process.exit(2);
}

if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
  console.error(`Adoption target must be an existing directory: ${target}`);
  process.exit(2);
}

function frontmatterValue(source, key) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  return frontmatter.match(new RegExp(`^${key}:\\s*["']?([^"'\\s]+)["']?\\s*$`, "m"))?.[1];
}

function compareSemver(left, right) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

function abort(message) {
  console.error(message);
  process.exit(2);
}

function git(args, { trim = true } = {}) {
  try {
    const output = execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return trim ? output.trim() : output;
  } catch {
    return null;
  }
}

const designVersion = frontmatterValue(designSource, "kin_version");
const releaseStatus = frontmatterValue(designSource, "release_status");
const latestStable = frontmatterValue(designSource, "latest_stable");

if (!semverPattern.test(version)) abort(`Cannot initialize adoption: package version ${version} is not SemVer.`);
if (designVersion !== version) abort(`Cannot initialize adoption: DESIGN.md kin_version ${designVersion ?? "missing"} differs from package version ${version}.`);
if (!new Set(["development", "released"]).has(releaseStatus)) {
  abort("Cannot initialize adoption: DESIGN.md release_status must be development or released.");
}
if (!latestStable || !semverPattern.test(latestStable)) {
  abort("Cannot initialize adoption: DESIGN.md latest_stable must be a SemVer value.");
}
if (releaseStatus === "released" && latestStable !== version) {
  abort(`Cannot initialize adoption: released KIN ${version} must set latest_stable to ${version}.`);
}
if (releaseStatus === "development" && compareSemver(latestStable, version) > 0) {
  abort(`Cannot initialize adoption: latest_stable ${latestStable} is newer than development kin_version ${version}.`);
}
if (!git(["rev-parse", "--verify", `v${latestStable}^{commit}`])) {
  abort(`Cannot initialize adoption: latest_stable v${latestStable} is not available as a local Git tag.`);
}

let contractRevision;
let contractSource;
let lifecycleSummary;
let locatorRequirement;

if (releaseStatus === "released") {
  contractRevision = `v${version}`;
  const taggedCommit = git(["rev-parse", "--verify", `${contractRevision}^{commit}`]);
  const taggedDesign = taggedCommit ? git(["show", `${contractRevision}:DESIGN.md`], { trim: false }) : null;
  if (!taggedCommit || taggedDesign === null) {
    abort(`Cannot initialize released KIN ${version}: Git tag ${contractRevision} is missing or does not contain DESIGN.md.`);
  }
  if (contractChecksum(taggedDesign) !== designChecksum) {
    abort(`Cannot initialize released KIN ${version}: ${contractRevision} does not contain the current DESIGN.md contract.`);
  }
  contractSource = `https://github.com/yehyakin/kin-design-system/tree/${contractRevision}`;
  lifecycleSummary = `stable release ${contractRevision}`;
  locatorRequirement = `The ${contractRevision} tag contains this exact contract and is the stable adoption locator.`;
} else {
  contractRevision = git(["rev-parse", "HEAD"]);
  if (!fullCommitPattern.test(contractRevision ?? "")) {
    abort("Cannot initialize a development adoption: the current KIN checkout has no readable full HEAD commit SHA.");
  }
  const committedDesign = git(["show", `${contractRevision}:DESIGN.md`], { trim: false });
  if (committedDesign === null || contractChecksum(committedDesign) !== designChecksum) {
    abort("Cannot initialize a development adoption: working-tree DESIGN.md differs from the contract stored at HEAD. Commit DESIGN.md, then run the initializer again so the generated locator is immutable and truthful.");
  }
  contractSource = `https://github.com/yehyakin/kin-design-system/tree/${contractRevision}`;
  lifecycleSummary = `development revision ${contractRevision} (latest stable v${latestStable})`;
  locatorRequirement = "This development contract is pinned to the full commit above. Keep that immutable revision and checksum together; do not rewrite it as a release tag until that tag exists and contains the same contract.";
}

const config = {
  $schema: "https://raw.githubusercontent.com/yehyakin/kin-design-system/main/adoption/kin.config.schema.json",
  kinVersion: version,
  profile,
  contract: {
    source: contractSource,
    local: "docs/KIN-DESIGN.md",
    revision: contractRevision,
    checksum: designChecksum,
  },
  tokens: { source: "src/styles/tokens.css", format: "css", generated: false },
  components: { roots: ["src/components"] },
  scope: {
    mode: "partial",
    implementationBrief: "docs/kin-implementation-brief.md",
    routeProfiles: [{ route: "TODO", profile, purpose: "TODO: describe the real task performed on this route family.", representative: true }],
    exclusions: [],
  },
  delivery: {
    mode: "contract-first",
    figma: "variables-only",
    runtime: "project-owned",
    evidence: "docs/kin-evidence.json",
  },
  audit: { include: ["src"], exclude: [], exceptions: [] },
  verification: { commands: ["npm run lint", "npm run typecheck", "npm test", "npm run build"] },
};

const record = `# KIN adoption record

This project targets KIN ${version}, ${lifecycleSummary}.

## Decisions to complete

- Primary product profile: ${profile}
- Route/profile map: kin.config.json scope.routeProfiles
- Primary task and entity: TODO
- Existing components to preserve: TODO
- Token integration path: src/styles/tokens.css
- Delivery mode: contract-first
- Figma boundary: Variables interoperability only
- Runtime boundary: project-owned components
- Evidence record: docs/kin-evidence.json
- Implementation brief: docs/kin-implementation-brief.md
- Representative production workflow: TODO
- Visual review baseline/candidate artifacts: TODO
- Documented exceptions: none
- Contract lifecycle: ${releaseStatus}
- Latest stable KIN release: v${latestStable}

## Source of truth

- Contract: ${contractSource}
- Contract revision: ${contractRevision}
- Expected canonical DESIGN.md SHA-256: ${designChecksum}
- Local pinned copy: docs/KIN-DESIGN.md

Copy the complete reviewed DESIGN.md contract revision into the local path before implementation. The expected checksum is calculated from the KIN checkout after removing an optional UTF-8 BOM and normalizing CRLF or CR line endings to LF; the checker applies the same canonicalization to the target copy. Keep project-specific exceptions in kin.config.json, not in the shared contract. Record mappings, checks, owners, and production observation in docs/kin-evidence.json without changing unperformed checks to passed. ${locatorRequirement}

Before claiming verified adoption, select one representative production workflow and record comparable baseline/candidate artifacts plus a human visual-signature review. A component gallery, design lab, static fixture, or header-only migration does not qualify.
`;

const profileGuidance = {
  "information-site": "Lead with search, subject identity, reading content, or a record list. Keep source, revision, currency, and stable location close to the information they qualify.",
  "intelligence-workspace": "Lead with an entity list, selected entity, signal queue, evidence/history region, or monitor task. Preserve identity and state while selection, evidence, history, and properties change.",
  "ecommerce-operations": "Lead with the catalog, order, inventory, campaign, creative review, approval, or exception task. Align money, quantity, time, channel, owner, and state for comparison.",
  "engineering-canvas": "Let the document, canvas, model, or measured selection dominate. Keep tool chrome, layers, properties, units, revision, and save state available but secondary.",
};

const brief = `---
kin_brief_version: 1
status: draft
primary_profile: ${profile}
representative_route: TODO
---

# KIN implementation brief

This file is project-owned. Replace every TODO with repository evidence or an explicit product decision before changing the representative workflow. An Agent may set status to \`ready\` after resolving the brief, but MUST NOT set \`approved\` on behalf of a human reviewer.

## Product truth

- Product and audience: TODO
- Primary entity: TODO
- Primary task: TODO
- Real data and API sources: TODO
- Routes, permissions, analytics, SEO, and brand behavior to preserve: TODO
- Existing primitives and components to preserve: TODO
- Redesign mode: TODO (redesign-preserve or redesign-overhaul)

## Route and profile map

Keep this table aligned with \`kin.config.json#scope.routeProfiles\`. Hybrid products may use different profiles for different route families.

| Route or family | KIN profile | Product task | Representative |
|---|---|---|---|
| TODO | ${profile} | TODO | yes |

Excluded routes and reasons: TODO

## Representative workflow

- User and trigger: TODO
- Entry route and starting state: TODO
- Current object or operating context: TODO
- Completion condition: TODO
- State that must persist across navigation or reload: TODO
- Applicable loading, empty, error, partial, stale, permission, offline, and recovery states: TODO

## Composition contract

Profile starting point: ${profileGuidance[profile]}

- First meaningful view: TODO
- Dominant region: TODO
- Persistent context: TODO
- Chrome behavior: TODO
- Surface strategy: TODO
- Density and alignment strategy: TODO
- Semantic concepts that must remain separate: TODO
- Motion model and Reduced Motion alternative: TODO
- Narrow-screen priority order: TODO

## Required interactions and states

- Interactions that prove the workflow: TODO
- Realistic states that will be rendered: TODO
- Keyboard, touch, focus, URL, scroll, and recovery behavior: TODO

## Prohibited substitutions

- A marketing Hero before the working task.
- A Card wall replacing the primary list, document, queue, canvas, or reading hierarchy.
- A Sidebar and Inspector wrapped around an unchanged landing-page interior.
- A component gallery, Storybook, fixture, or isolated header used as production evidence.
- Invented metrics, sources, monitoring, AI output, or activity.
- A desktop layout merely scaled down for mobile.
- A theme attribute that does not resolve the rendered theme and color-scheme together.
- Project-specific failure patterns: TODO

## Evidence, rollout, and approval

- Baseline routes, states, viewports, and artifact locations: TODO
- Candidate routes, states, viewports, and artifact locations: TODO
- Product/design approver: TODO
- Visual-signature reviewer: TODO
- Rollout and rollback: TODO

## Agent checkpoint

Before coding, report the completed KIN composition checkpoint defined in the KIN Skill composition reference. Keep this brief at \`draft\` while any required decision remains TODO.
`;

const manualChecks = [
  ["light-dark", ""],
  ["keyboard-focus", ""],
  ["touch-small-screen", ""],
  ["normal-reduced-motion", ""],
  ["browser-zoom-200", ""],
  ["long-content-localization", ""],
  ["rtl", "Record a supported locale or explain why RTL is not applicable."],
  ["forced-colors", ""],
  ["screen-reader", ""],
];

const visualCriteria = [
  "task-first",
  "dominant-region",
  "continuous-structure",
  "density-without-repetition",
  "semantic-separation",
  "theme-integrity",
  "motion-continuity",
  "responsive-priority",
  "no-fabricated-data-or-behavior",
];

const evidence = {
  $schema: "https://raw.githubusercontent.com/yehyakin/kin-design-system/main/adoption/kin.evidence.schema.json",
  kinVersion: version,
  profile: config.profile,
  productRevision: "unassigned",
  status: "initialized",
  reviewedOn: null,
  mappings: {
    tokens: {
      status: "pending",
      items: [{ kin: "semantic Tokens", local: config.tokens.source, notes: "Review local brand and semantic mappings before implementation." }],
      notes: "No Token mapping has been verified.",
    },
    components: { status: "pending", items: [], notes: "Map existing primitives before creating replacements." },
    routes: { status: "pending", items: [], notes: "Record only routes included in the adoption scope." },
  },
  verification: {
    automated: config.verification.commands.map((command) => ({ name: command, command, status: "not-run", runAt: null, artifact: "", notes: "" })),
    manual: manualChecks.map(([id, notes]) => ({ id, status: "not-run", environment: "", reviewedOn: null, reviewer: "", findings: [], notes })),
  },
  visualReview: {
    status: "not-run",
    profile,
    workflow: "",
    routes: [],
    baseline: "",
    candidate: "",
    environment: "",
    reviewer: "",
    reviewedOn: null,
    criteria: visualCriteria.map((id) => ({ id, status: "not-run", notes: "" })),
    findings: [],
    notes: "Select one representative production workflow; a component gallery or design lab does not qualify.",
  },
  production: { status: "not-observed", observedOn: null, evidence: "", owner: "", rollback: "" },
  ownership: { product: "", design: "", engineering: "", accessibility: "" },
  exceptions: [],
};

function writeIfAllowed(file, content) {
  if (fs.existsSync(file) && !force) {
    console.log(`Skipped existing ${path.relative(target, file)}`);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log(`Created ${path.relative(target, file)}`);
}

writeIfAllowed(configPath, `${JSON.stringify(config, null, 2)}\n`);
writeIfAllowed(recordPath, record);
writeIfAllowed(briefPath, brief);
writeIfAllowed(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Pinned KIN ${version} ${lifecycleSummary}.`);
console.log("Resolve the implementation brief, route/profile map, delivery boundary, mappings, evidence, commands, and pinned local contract before implementation.");
