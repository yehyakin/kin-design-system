import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { readDesignContract } from "./lib/design-contract.mjs";
import { readAgentVersionRegistry } from "./lib/agent-release.mjs";
import { formatPagesPublicationOutputs, pagesPublicationDecision } from "./lib/release-policy.mjs";

function parseArguments(args) {
  if (args.length === 2 && args[0] === "--trigger") return args[1];
  throw new Error("Usage: node scripts/check-pages-publication.mjs --trigger <documentation|release|manual>");
}

try {
  const trigger = parseArguments(process.argv.slice(2));
  const { releaseStatus, kinVersion } = readDesignContract(process.cwd());
  const registry = readAgentVersionRegistry(process.cwd());
  const entry = registry.versions.find((candidate) => candidate.version === kinVersion);
  const agentPublicationState = entry?.publication_state ?? "none";
  const decision = pagesPublicationDecision({ releaseStatus, trigger, agentPublicationState });
  if (decision === "verify-tag") {
    const output = execFileSync(process.execPath, [path.join(process.cwd(), "scripts", "validate-release.mjs")], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
    });
    if (output.trim()) console.error(output.trim());
  }
  for (const line of formatPagesPublicationOutputs({ decision, releaseStatus, agentPublicationState })) {
    console.log(line);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
