export function parseReleaseValidationArgs(args) {
  if (args.length === 0) return "post-tag";
  if (args.length === 1 && args[0] === "--pre-tag") return "pre-tag";
  throw new Error("Usage: node scripts/validate-release.mjs [--pre-tag]");
}

export function pagesPublicationDecision({ releaseStatus, trigger, agentPublicationState = "none" }) {
  if (!new Set(["documentation", "release", "manual"]).has(trigger)) throw new Error(`Unsupported Pages trigger: ${trigger}`);
  if (!new Set(["none", "staged", "released"]).has(agentPublicationState)) throw new Error(`Unsupported Agent publication state: ${agentPublicationState}`);
  if (releaseStatus === "development") {
    if (trigger === "release") throw new Error("A published GitHub Release cannot publish a development contract");
    return "deploy";
  }
  if (releaseStatus === "released") {
    if (agentPublicationState === "none") {
      throw new Error("A released contract requires a staged or released Agent Registry entry");
    }
    if (trigger === "documentation" && agentPublicationState === "staged") return "defer";
    return "verify-tag";
  }
  throw new Error(`Unsupported release_status: ${releaseStatus}`);
}

export function pagesPublicationOutputs(decision) {
  if (!new Set(["deploy", "defer", "verify-tag"]).has(decision)) {
    throw new Error(`Unsupported Pages publication decision: ${decision}`);
  }
  return {
    eligible: decision !== "defer",
    verificationRequired: decision === "verify-tag",
  };
}

export function formatPagesPublicationOutputs({ decision, releaseStatus, agentPublicationState }) {
  const publication = pagesPublicationOutputs(decision);
  return [
    `eligible=${publication.eligible}`,
    `verification_required=${publication.verificationRequired}`,
    `publication_mode=${decision}`,
    `release_status=${releaseStatus}`,
    `agent_publication_state=${agentPublicationState}`,
  ];
}

export function collectAgentReleaseStateFindings({
  mode,
  releaseStatus,
  currentTagExists,
  publicationState,
}) {
  if (releaseStatus !== "released" || mode !== "pre-tag" || currentTagExists) return [];
  return publicationState === "staged"
    ? []
    : ["an untagged release candidate requires a staged Agent Registry entry"];
}

export function collectReleaseTagFindings({
  mode,
  releaseStatus,
  version,
  latestStable,
  latestStableExists,
  currentTagExists,
  currentTagType,
  currentTagCommit,
  headCommit,
  currentTagDesignChecksum,
  currentDesignChecksum,
  allowPromotionCommit = false,
}) {
  const findings = [];
  if (releaseStatus === "development") {
    if (!latestStableExists) findings.push(`latest_stable v${latestStable} does not exist as a local annotated commit tag`);
    if (mode === "post-tag") findings.push("post-tag validation requires DESIGN.md release_status: released");
    return findings;
  }
  if (releaseStatus !== "released") return findings;

  const releaseRevision = `v${version}`;
  if (!currentTagExists) {
    if (mode === "post-tag") findings.push(`released KIN ${version} requires the Git tag ${releaseRevision}`);
    return findings;
  }
  if (currentTagType !== "tag") findings.push(`${releaseRevision} must be an annotated Git tag`);
  if (!headCommit || (currentTagCommit !== headCommit && !allowPromotionCommit)) findings.push(`${releaseRevision} must resolve to the exact current release commit`);
  if (!currentTagDesignChecksum || currentTagDesignChecksum !== currentDesignChecksum) findings.push(`${releaseRevision} DESIGN.md checksum does not match the current contract`);
  return findings;
}
