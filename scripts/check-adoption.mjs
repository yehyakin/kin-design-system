import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const help = args.includes("--help") || args.includes("-h");
const targetArg = args.find((arg) => !arg.startsWith("--")) ?? ".";
const target = path.resolve(targetArg);
const configPath = path.join(target, "kin.config.json");
const errors = [];
const warnings = [];
const profiles = new Set(["information-site", "intelligence-workspace", "ecommerce-operations", "engineering-canvas"]);

if (help) {
  console.log("Usage: node scripts/check-adoption.mjs [project-directory] [--json]");
  console.log("Checks the KIN adoption record without running project commands or changing files.");
  process.exit(0);
}

if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
  console.error(`Adoption target must be an existing directory: ${target}`);
  process.exit(2);
}

if (!fs.existsSync(configPath)) {
  errors.push("kin.config.json does not exist. Run scripts/init-adoption.mjs <project> first.");
} else {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    errors.push(`kin.config.json is invalid JSON: ${error.message}`);
  }
  if (config) {
    if (!/^\d+\.\d+\.\d+$/.test(config.kinVersion ?? "")) errors.push("kinVersion must be an exact semantic version.");
    if (!profiles.has(config.profile)) errors.push("profile is not a supported KIN product profile.");
    if (!config.contract?.source) errors.push("contract.source is required.");
    else if (config.kinVersion && !config.contract.source.includes(`@${config.kinVersion}`) && !config.contract.source.includes(`/v${config.kinVersion}`)) {
      warnings.push("contract.source does not appear to pin the configured KIN version.");
    }
    if (!config.contract?.local) errors.push("contract.local is required.");
    else if (!fs.existsSync(path.join(target, config.contract.local))) errors.push(`Pinned contract is missing: ${config.contract.local}`);
    else {
      const contract = fs.readFileSync(path.join(target, config.contract.local), "utf8");
      const contractVersion = contract.match(/^kin_version:\s*([0-9]+\.[0-9]+\.[0-9]+)\s*$/m)?.[1];
      if (!contractVersion) warnings.push("Pinned contract does not expose a machine-readable kin_version.");
      else if (contractVersion !== config.kinVersion) errors.push(`Pinned contract version ${contractVersion} does not match kinVersion ${config.kinVersion}.`);
    }
    if (!config.tokens?.source) errors.push("tokens.source is required.");
    else if (!fs.existsSync(path.join(target, config.tokens.source))) errors.push(`Token integration file is missing: ${config.tokens.source}`);
    if (!Array.isArray(config.audit?.include)) errors.push("audit.include must be an array.");
    for (const [index, exception] of (config.audit?.exceptions ?? []).entries()) {
      if (!exception.rule || !exception.path || typeof exception.reason !== "string" || exception.reason.trim().length < 12) {
        errors.push(`audit.exceptions[${index}] requires rule, path, and a specific reason of at least 12 characters.`);
      }
    }
    if (!Array.isArray(config.verification?.commands) || config.verification.commands.length === 0) {
      errors.push("verification.commands must contain at least one real project command.");
    }
  }
}

const result = { valid: errors.length === 0, target, errors, warnings };
if (jsonOutput) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
else {
  console.log(result.valid ? "KIN adoption configuration is structurally valid." : "KIN adoption configuration has errors.");
  for (const error of errors) console.log(`ERROR: ${error}`);
  for (const warning of warnings) console.log(`WARN: ${warning}`);
}
process.exitCode = errors.length > 0 ? 1 : 0;
