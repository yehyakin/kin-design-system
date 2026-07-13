import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { contractChecksum } from "./contract-checksum.mjs";

const args = process.argv.slice(2);
const force = args.includes("--force");
const help = args.includes("--help") || args.includes("-h");
const targetArg = args.find((arg) => !arg.startsWith("--")) ?? ".";
const target = path.resolve(targetArg);
const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const version = packageJson.version;
const designContract = fs.readFileSync(new URL("../DESIGN.md", import.meta.url));
const designChecksum = contractChecksum(designContract);
const configPath = path.join(target, "kin.config.json");
const recordPath = path.join(target, "docs", "kin-adoption.md");
const evidencePath = path.join(target, "docs", "kin-evidence.json");

if (help) {
  console.log("Usage: node scripts/init-adoption.mjs [project-directory] [--force]");
  console.log("Creates kin.config.json, docs/kin-adoption.md, and docs/kin-evidence.json. Existing files are preserved unless --force is provided.");
  process.exit(0);
}

if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
  console.error(`Adoption target must be an existing directory: ${target}`);
  process.exit(2);
}

const config = {
  $schema: "https://raw.githubusercontent.com/yehyakin/kin-design-system/main/adoption/kin.config.schema.json",
  kinVersion: version,
  profile: "information-site",
  contract: {
    source: `https://github.com/yehyakin/kin-design-system/tree/v${version}`,
    local: "docs/KIN-DESIGN.md",
    revision: `v${version}`,
    checksum: designChecksum,
  },
  tokens: { source: "src/styles/tokens.css", format: "css", generated: false },
  components: { roots: ["src/components"] },
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

- Product profile: information-site
- Primary task and entity: TODO
- Existing components to preserve: TODO
- Token integration path: src/styles/tokens.css
- Delivery mode: contract-first
- Figma boundary: Variables interoperability only
- Runtime boundary: project-owned components
- Evidence record: docs/kin-evidence.json
- Documented exceptions: none

## Source of truth

- Contract: https://github.com/yehyakin/kin-design-system/tree/v${version}
- Contract revision: v${version}
- Expected canonical DESIGN.md SHA-256: ${designChecksum}
- Local pinned copy: docs/KIN-DESIGN.md

Copy the complete reviewed DESIGN.md release into the local path before implementation. The expected checksum is calculated from the KIN checkout after removing an optional UTF-8 BOM and normalizing CRLF or CR line endings to LF; the checker applies the same canonicalization to the target copy. Keep project-specific exceptions in kin.config.json, not in the shared contract. Record mappings, checks, owners, and production observation in docs/kin-evidence.json without changing unperformed checks to passed. The release tag must exist before another project adopts this locator.
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
writeIfAllowed(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log("Review profile, delivery boundary, mappings, evidence, commands, and the pinned local contract before implementation.");
