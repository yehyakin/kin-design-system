export function parseReleaseValidationArgs(args) {
  if (args.length === 0) return "post-tag";
  if (args.length === 1 && args[0] === "--pre-tag") return "pre-tag";
  throw new Error("Usage: node scripts/validate-release.mjs [--pre-tag]");
}

export function pagesPublicationDecision({ releaseStatus, trigger }) {
  if (!new Set(["documentation", "tag", "manual"]).has(trigger)) throw new Error(`Unsupported Pages trigger: ${trigger}`);
  if (releaseStatus === "development") {
    if (trigger === "tag") throw new Error("A successful release-tag workflow cannot publish a development contract");
    return "deploy";
  }
  if (releaseStatus === "released") return trigger === "documentation" ? "defer" : "verify-tag";
  throw new Error(`Unsupported release_status: ${releaseStatus}`);
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
}) {
  const findings = [];
  if (releaseStatus === "development") {
    if (!latestStableExists) findings.push(`latest_stable v${latestStable} does not exist as a local Git tag`);
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
  if (!headCommit || currentTagCommit !== headCommit) findings.push(`${releaseRevision} must resolve to the exact current release commit`);
  if (!currentTagDesignChecksum || currentTagDesignChecksum !== currentDesignChecksum) findings.push(`${releaseRevision} DESIGN.md checksum does not match the current contract`);
  return findings;
}
