import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  AGENT_REGISTRY_PATH,
  assertAgentRegistryMutationFresh,
  assertAgentVersion,
  declaredGitHubRepository,
  promotionEligibilityFindings,
  readAgentVersionRegistryBytes,
  readAgentVersionRegistry,
  remoteBranchCommit,
  remoteExactTagState,
  validateAgentHistory,
  validateAgentVersionRegistry,
  writeAgentVersionRegistry,
} from "./lib/agent-release.mjs";
import { AGENT_SITE_BASE } from "./lib/agent-distribution.mjs";
import { collectAgentRemoteReleaseEvidenceFindings } from "./lib/agent-publication.mjs";
import { exactTagState, runGit } from "./lib/git-state.mjs";
import { validateAgentBundleSemantics } from "./validate-agent-distribution.mjs";

function parseArguments(args) {
  if (args.length === 2 && args[0] === "--version") return assertAgentVersion(args[1]);
  throw new Error("Usage: node scripts/promote-agent-distribution.mjs --version X.Y.Z");
}

async function githubJson({ repository, route }) {
  const authorization = process.env.GH_TOKEN ? { authorization: `Bearer ${process.env.GH_TOKEN}` } : {};
  const response = await fetch(`https://api.github.com/repos/${repository}${route}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "kin-agent-promotion",
      "x-github-api-version": "2022-11-28",
      ...authorization,
    },
  });
  if (!response.ok) throw new Error(`${route}: GitHub API returned HTTP ${response.status}`);
  return response.json();
}

let version;
try {
  version = parseArguments(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

const root = process.cwd();
const status = runGit(root, ["status", "--porcelain"]);
if (status === null || status !== "") throw new Error("Agent promotion requires a clean Git working tree");
const repository = declaredGitHubRepository(root);

const registryBytes = readAgentVersionRegistryBytes(root);
const registry = readAgentVersionRegistry(root);
const initialFindings = validateAgentVersionRegistry({ root, registry });
if (initialFindings.length > 0) throw new Error(`Agent promotion requires a valid Registry:\n- ${initialFindings.join("\n- ")}`);
const entry = registry.versions.find((candidate) => candidate.version === version);
const eligibilityFindings = promotionEligibilityFindings(registry, version);
if (eligibilityFindings.length > 0) throw new Error(`Agent v${version} is not eligible for promotion:\n- ${eligibilityFindings.join("\n- ")}`);
const archiveDirectory = path.join(root, "generated", "agent", "versions", `v${version}`);
const archiveFindings = validateAgentBundleSemantics({
  root,
  bundleDirectory: archiveDirectory,
  channel: "versioned",
  version,
});
if (archiveFindings.length > 0) {
  throw new Error(`Agent v${version} archive validation failed:\n- ${archiveFindings.join("\n- ")}`);
}
const targetManifest = JSON.parse(fs.readFileSync(path.join(archiveDirectory, "design-manifest.json"), "utf8"));

const tag = exactTagState(root, `v${version}`);
if (!tag.exists || tag.objectType !== "tag" || !tag.commit) throw new Error(`v${version} must be an annotated local commit Tag`);
const headCommit = runGit(root, ["rev-parse", "HEAD"]);
if (!headCommit || runGit(root, ["merge-base", "--is-ancestor", tag.commit, headCommit]) === null) {
  throw new Error(`v${version} must be an ancestor of the current promotion checkout`);
}
if (remoteBranchCommit(root) !== headCommit) {
  throw new Error("Agent promotion requires HEAD to equal the current remote main commit");
}
const historyFindings = validateAgentHistory({ root, version });
if (historyFindings.length > 0) throw new Error(`Agent v${version} history validation failed:\n- ${historyFindings.join("\n- ")}`);

const remoteTag = remoteExactTagState(root, `v${version}`);
const localTagObject = runGit(root, ["rev-parse", tag.reference]);
if (remoteTag.object !== localTagObject || remoteTag.commit !== tag.commit) {
  throw new Error(`Remote v${version} does not match the archived local annotated Tag object and commit`);
}
const remoteEvidenceFindings = await collectAgentRemoteReleaseEvidenceFindings({
  root,
  repository,
  version,
  tagName: `v${version}`,
  tagCommit: tag.commit,
  githubJson,
  eligibilityHeadCommit: headCommit,
});
if (remoteEvidenceFindings.length > 0) {
  throw new Error(`Agent v${version} remote release evidence failed:\n- ${remoteEvidenceFindings.join("\n- ")}`);
}

assertAgentRegistryMutationFresh({ root, headCommit, registryBytes });
const previousRegistry = registryBytes.toString("utf8");
entry.publication_state = "released";
entry.support_status = "supported";
entry.manifest_url = `${AGENT_SITE_BASE}/versions/v${version}/design-manifest.json`;
registry.latest_agent_distribution = version;
registry.$schema = `${AGENT_SITE_BASE}/versions/v${version}/schemas/versions.schema.json`;
registry.schema_version = targetManifest.schema_version;

try {
  writeAgentVersionRegistry(root, registry);
  const findings = validateAgentVersionRegistry({ root, registry });
  if (findings.length > 0) throw new Error(`promoted Registry failed validation:\n- ${findings.join("\n- ")}`);
} catch (error) {
  let recovery = "restored staged Registry";
  try {
    writeAgentVersionRegistry(root, JSON.parse(previousRegistry));
  } catch (recoveryError) {
    recovery = `manual review required: ${recoveryError.message}`;
  }
  throw new Error(`Failed to promote Agent v${version}: ${error.message}; recovery: ${recovery}`);
}

console.log(`Agent v${version} is eligible and promoted to the stable alias.`);
console.log(`Only ${AGENT_REGISTRY_PATH} was changed; commit this as the focused post-release promotion.`);
