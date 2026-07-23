import process from "node:process";
import {
  AGENT_REGISTRY_PATH,
  applyAgentRegistryRollback,
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

function parseArguments(args) {
  const options = { fromVersion: null, toVersion: null, supportStatus: null, advisoryUrl: null };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (argument === "--from" && value) {
      options.fromVersion = assertAgentVersion(value);
      index += 1;
    } else if (argument === "--to" && value) {
      options.toVersion = value === "none" ? null : assertAgentVersion(value);
      index += 1;
    } else if (argument === "--status" && value) {
      options.supportStatus = value;
      index += 1;
    } else if (argument === "--advisory-url" && value) {
      options.advisoryUrl = value;
      index += 1;
    } else {
      throw new Error(
        "Usage: node scripts/rollback-agent-distribution.mjs --from X.Y.Z --to <X.Y.Z|none> --status <superseded|unsupported> [--advisory-url https://...]",
      );
    }
  }
  if (!options.fromVersion || !options.supportStatus || !args.includes("--to")) {
    throw new Error(
      "Usage: node scripts/rollback-agent-distribution.mjs --from X.Y.Z --to <X.Y.Z|none> --status <superseded|unsupported> [--advisory-url https://...]",
    );
  }
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
if (status === null || status !== "") throw new Error("Agent rollback requires a clean Git working tree");
declaredGitHubRepository(root);
const headCommit = runGit(root, ["rev-parse", "HEAD"]);
if (!headCommit || remoteBranchCommit(root) !== headCommit) {
  throw new Error("Agent rollback requires HEAD to equal the current remote main commit");
}

const registryBytes = readAgentVersionRegistryBytes(root);
const registry = readAgentVersionRegistry(root);
const initialFindings = validateAgentVersionRegistry({ root, registry });
if (initialFindings.length > 0) throw new Error(`Agent rollback requires a valid Registry:\n- ${initialFindings.join("\n- ")}`);
const historyFindings = validateAgentHistory({ root });
if (historyFindings.length > 0) throw new Error(`Agent rollback requires valid immutable history:\n- ${historyFindings.join("\n- ")}`);

const next = applyAgentRegistryRollback(registry, options);
assertAgentRegistryMutationFresh({ root, headCommit, registryBytes });
const previousRegistry = registryBytes.toString("utf8");
try {
  writeAgentVersionRegistry(root, next);
  const findings = validateAgentVersionRegistry({ root, registry: next });
  if (findings.length > 0) throw new Error(`rollback Registry failed validation:\n- ${findings.join("\n- ")}`);
} catch (error) {
  let recovery = "restored previous Registry";
  try {
    writeAgentVersionRegistry(root, JSON.parse(previousRegistry));
  } catch (recoveryError) {
    recovery = `manual review required: ${recoveryError.message}`;
  }
  throw new Error(`Failed to prepare Agent rollback: ${error.message}; recovery: ${recovery}`);
}

console.log(
  options.toVersion === null
    ? `Agent stable alias will be withdrawn; v${options.fromVersion} is marked ${options.supportStatus}.`
    : `Agent stable alias will return to v${options.toVersion}; v${options.fromVersion} is marked ${options.supportStatus}.`,
);
console.log(`Only ${AGENT_REGISTRY_PATH} was changed; commit this as the focused rollback.`);
