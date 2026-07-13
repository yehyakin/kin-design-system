import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { contractChecksum } from "./contract-checksum.mjs";

const args = process.argv.slice(2);
const profiles = new Set(["information-site", "intelligence-workspace", "ecommerce-operations", "engineering-canvas"]);
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

const config = {
  $schema: "https://raw.githubusercontent.com/yehyakin/kin-design-system/main/adoption/kin.config.schema.json",
  kinVersion: version,
  profile,
  contract: {
    source: `https://github.com/yehyakin/kin-design-system/tree/v${version}`,
    local: "docs/KIN-DESIGN.md",
    revision: `v${version}`,
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

This project targets KIN ${version}.

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

## Source of truth

- Contract: https://github.com/yehyakin/kin-design-system/tree/v${version}
- Contract revision: v${version}
- Expected canonical DESIGN.md SHA-256: ${designChecksum}
- Local pinned copy: docs/KIN-DESIGN.md

Copy the complete reviewed DESIGN.md release into the local path before implementation. The expected checksum is calculated from the KIN checkout after removing an optional UTF-8 BOM and normalizing CRLF or CR line endings to LF; the checker applies the same canonicalization to the target copy. Keep project-specific exceptions in kin.config.json, not in the shared contract. Record mappings, checks, owners, and production observation in docs/kin-evidence.json without changing unperformed checks to passed. The release tag must exist before another project adopts this locator.

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
console.log("Resolve the implementation brief, route/profile map, delivery boundary, mappings, evidence, commands, and pinned local contract before implementation.");
