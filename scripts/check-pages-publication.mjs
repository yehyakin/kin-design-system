import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { readDesignContract } from "./lib/design-contract.mjs";
import { pagesPublicationDecision } from "./lib/release-policy.mjs";

function parseArguments(args) {
  if (args.length === 2 && args[0] === "--trigger") return args[1];
  throw new Error("Usage: node scripts/check-pages-publication.mjs --trigger <documentation|tag|manual>");
}

try {
  const trigger = parseArguments(process.argv.slice(2));
  const { releaseStatus } = readDesignContract(process.cwd());
  const decision = pagesPublicationDecision({ releaseStatus, trigger });
  if (decision === "verify-tag") {
    const output = execFileSync(process.execPath, [path.join(process.cwd(), "scripts", "validate-release.mjs")], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
    });
    if (output.trim()) console.error(output.trim());
  }
  console.log(`eligible=${decision === "defer" ? "false" : "true"}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
