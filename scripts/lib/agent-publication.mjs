import {
  declaredGitHubRepository,
  readAgentVersionRegistry,
  remoteExactTagState,
  validateAgentHistory,
  validateAgentVersionRegistry,
} from "./agent-release.mjs";
import { exactTagState, runGit } from "./git-state.mjs";

const fullCommitPattern = /^[a-f0-9]{40}$/iu;

function successfulTagRun(run, tagName, tagCommit) {
  return run.head_sha === tagCommit
    && run.head_branch === tagName
    && run.event === "push"
    && run.conclusion === "success";
}

function successfulEligibilityRun({
  root,
  run,
  version,
  tagCommit,
  eligibilityHeadCommit,
  publicationHeadCommit,
}) {
  if (
    run.display_title !== `Validate Agent v${version}`
    || run.event !== "workflow_dispatch"
    || run.conclusion !== "success"
    || !fullCommitPattern.test(run.head_sha ?? "")
  ) {
    return false;
  }
  if (eligibilityHeadCommit) return run.head_sha === eligibilityHeadCommit;
  if (!root || !publicationHeadCommit) return false;
  return runGit(root, ["merge-base", "--is-ancestor", tagCommit, run.head_sha]) !== null
    && runGit(root, ["merge-base", "--is-ancestor", run.head_sha, publicationHeadCommit]) !== null;
}

export async function collectAgentRemoteReleaseEvidenceFindings({
  root,
  repository,
  version,
  tagName,
  tagCommit,
  githubJson,
  eligibilityHeadCommit = null,
  publicationHeadCommit = null,
}) {
  const findings = [];
  try {
    const release = await githubJson({
      repository,
      route: `/releases/tags/${encodeURIComponent(tagName)}`,
    });
    if (release.tag_name !== tagName || release.draft || release.prerelease) {
      findings.push(`${version}: ${tagName} requires a final non-draft GitHub Release`);
    }
  } catch (error) {
    findings.push(`${version}: ${error.message}`);
  }
  try {
    const query = new URLSearchParams({
      event: "push",
      status: "completed",
      head_sha: tagCommit,
      per_page: "100",
    });
    const runs = await githubJson({
      repository,
      route: `/actions/workflows/validate-release-tag.yml/runs?${query}`,
    });
    if (!(runs.workflow_runs ?? []).some((run) => successfulTagRun(run, tagName, tagCommit))) {
      findings.push(`${version}: no successful Validate release tag run exists for ${tagName}`);
    }
  } catch (error) {
    findings.push(`${version}: ${error.message}`);
  }
  try {
    const query = new URLSearchParams({
      event: "workflow_dispatch",
      status: "completed",
      per_page: "100",
    });
    const runs = await githubJson({
      repository,
      route: `/actions/workflows/validate-agent-release.yml/runs?${query}`,
    });
    const successful = (runs.workflow_runs ?? []).some((run) => successfulEligibilityRun({
      root,
      run,
      version,
      tagCommit,
      eligibilityHeadCommit,
      publicationHeadCommit,
    }));
    if (!successful) {
      findings.push(`${version}: no successful read-only Validate Agent v${version} eligibility run exists on an eligible main revision`);
    }
  } catch (error) {
    findings.push(`${version}: ${error.message}`);
  }
  return findings;
}

export async function collectAgentPublicationFindings({
  root,
  githubJson,
  repositoryResolver = declaredGitHubRepository,
  remoteTagResolver = remoteExactTagState,
}) {
  const findings = [];
  let repository;
  let registry;
  try {
    repository = repositoryResolver(root);
    registry = readAgentVersionRegistry(root);
  } catch (error) {
    return [error.message];
  }
  findings.push(...validateAgentVersionRegistry({ root, registry }));
  findings.push(...validateAgentHistory({ root }));
  if (findings.length > 0) return findings;
  const publicationHeadCommit = runGit(root, ["rev-parse", "HEAD"]);

  for (const entry of registry.versions.filter((candidate) => candidate.publication_state === "released")) {
    const tag = exactTagState(root, entry.kin_tag);
    if (!tag.exists || tag.objectType !== "tag" || !tag.commit) {
      findings.push(`${entry.version}: ${entry.kin_tag} must be an annotated local commit Tag`);
      continue;
    }
    const localObject = runGit(root, ["rev-parse", tag.reference]);
    const remote = remoteTagResolver(root, entry.kin_tag);
    if (!localObject || remote.object !== localObject || remote.commit !== tag.commit) {
      findings.push(`${entry.version}: remote Tag object and peeled commit must exactly match the local annotated Tag`);
      continue;
    }
    findings.push(...await collectAgentRemoteReleaseEvidenceFindings({
      root,
      repository,
      version: entry.version,
      tagName: entry.kin_tag,
      tagCommit: tag.commit,
      githubJson,
      publicationHeadCommit,
    }));
  }
  return findings;
}
