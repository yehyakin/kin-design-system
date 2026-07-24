import process from "node:process";
import { readAgentVersionRegistry } from "./lib/agent-release.mjs";
import { collectAgentPublicationFindings } from "./lib/agent-publication.mjs";

async function githubJson({ repository, route }) {
  const authorization = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const response = await fetch(`https://api.github.com/repos/${repository}${route}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "kin-agent-publication-validator",
      "x-github-api-version": "2022-11-28",
      ...(authorization ? { authorization: `Bearer ${authorization}` } : {}),
    },
  });
  if (!response.ok) throw new Error(`${route}: GitHub API returned HTTP ${response.status}`);
  return response.json();
}

const root = process.cwd();
const findings = await collectAgentPublicationFindings({ root, githubJson });

if (findings.length > 0) {
  console.error(`Agent publication validation failed (${findings.length}):`);
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
const registry = readAgentVersionRegistry(root);
console.log(
  registry.versions.some((entry) => entry.publication_state === "released")
    ? "Agent publication validation passed: every released Registry entry has immutable local, remote, Release, and tag-CI evidence."
    : "Agent publication validation passed: no Registry entry claims released publication.",
);
