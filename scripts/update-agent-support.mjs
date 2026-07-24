import process from "node:process";
import {
  AGENT_REGISTRY_PATH,
  applyAgentSupportUpdate,
  assertAgentRegistryMutationFresh,
  assertAgentVersion,
  declaredGitHubRepository,
  readAgentVersionRegistryBytes,
  readAgentVersionRegistry,
  remoteBranchCommit,
  validateAgentHistory,
  validateAgentVersionRegistry,
  writeAgentVersionRegistry,
} from "./lib/agent-release.mjs";
import { runGit } from "./lib/git-state.mjs";

function usage() {
  return "Usage: node scripts/update-agent-support.mjs --version X.Y.Z --status <supported|superseded|unsupported> [--replacement <X.Y.Z|none>] [--advisory-url https://...]";
}

function parseArguments(args) {
  const options = { version: null, supportStatus: null, replacement: null, advisoryUrl: null };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (argument === "--version" && value) {
      options.version = assertAgentVersion(value);
      index += 1;
    } else if (argument === "--status" && value) {
      options.supportStatus = value;
      index += 1;
    } else if (argument === "--replacement" && value) {
      options.replacement = value === "none" ? null : assertAgentVersion(value);
      index += 1;
    } else if (argument === "--advisory-url" && value) {
      options.advisoryUrl = value;
      index += 1;
    } else throw new Error(usage());
  }
  if (!options.version || !options.supportStatus) throw new Error(usage());
  return options;
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

const root = process.cwd();
const status = runGit(root, ["status", "--porcelain"]);
if (status === null || status !== "") throw new Error("Agent support update requires a clean Git working tree");
declaredGitHubRepository(root);
const headCommit = runGit(root, ["rev-parse", "HEAD"]);
if (!headCommit || remoteBranchCommit(root) !== headCommit) {
  throw new Error("Agent support update requires HEAD to equal the current remote main commit");
}

const registryBytes = readAgentVersionRegistryBytes(root);
const registry = readAgentVersionRegistry(root);
const initialFindings = validateAgentVersionRegistry({ root, registry });
if (initialFindings.length > 0) throw new Error(`Agent support update requires a valid Registry:\n- ${initialFindings.join("\n- ")}`);
const historyFindings = validateAgentHistory({ root });
if (historyFindings.length > 0) throw new Error(`Agent support update requires valid immutable history:\n- ${historyFindings.join("\n- ")}`);

const next = applyAgentSupportUpdate(registry, options);
assertAgentRegistryMutationFresh({ root, headCommit, registryBytes });
const previousRegistry = registryBytes.toString("utf8");
try {
  writeAgentVersionRegistry(root, next);
  const findings = validateAgentVersionRegistry({ root, registry: next });
  if (findings.length > 0) throw new Error(`support Registry failed validation:\n- ${findings.join("\n- ")}`);
} catch (error) {
  let recovery = "restored previous Registry";
  try {
    writeAgentVersionRegistry(root, JSON.parse(previousRegistry));
  } catch (recoveryError) {
    recovery = `manual review required: ${recoveryError.message}`;
  }
  throw new Error(`Failed to prepare Agent support update: ${error.message}; recovery: ${recovery}`);
}

console.log(`Agent v${options.version} support status is prepared as ${options.supportStatus}.`);
console.log(`Only ${AGENT_REGISTRY_PATH} was changed; commit this as the focused support update.`);
