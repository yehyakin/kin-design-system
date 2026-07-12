import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const force = args.includes("--force");
const help = args.includes("--help") || args.includes("-h");
const targetArg = args.find((arg) => !arg.startsWith("--")) ?? ".";
const target = path.resolve(targetArg);
const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const version = packageJson.version;
const configPath = path.join(target, "kin.config.json");
const recordPath = path.join(target, "docs", "kin-adoption.md");

if (help) {
  console.log("Usage: node scripts/init-adoption.mjs [project-directory] [--force]");
  console.log("Creates kin.config.json and docs/kin-adoption.md. Existing files are preserved unless --force is provided.");
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
  },
  tokens: { source: "src/styles/tokens.css", format: "css", generated: false },
  components: { roots: ["src/components"] },
  audit: { include: ["src"], exclude: [], exceptions: [] },
  verification: { commands: ["npm run lint", "npm run typecheck", "npm test", "npm run build"] },
};

const record = `# KIN adoption record\n\nThis project targets KIN ${version}.\n\n## Decisions to complete\n\n- Product profile: information-site\n- Primary task and entity: TODO\n- Existing components to preserve: TODO\n- Token integration path: src/styles/tokens.css\n- Documented exceptions: none\n\n## Source of truth\n\n- Contract: https://github.com/yehyakin/kin-design-system/tree/v${version}\n- Local pinned copy: docs/KIN-DESIGN.md\n\nCopy the reviewed DESIGN.md release into the local path before implementation. Keep project-specific exceptions in kin.config.json, not in the shared contract. The release tag must exist before another project adopts this locator.\n`;

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
console.log("Review profile, paths, commands, and the pinned local contract before implementation.");
