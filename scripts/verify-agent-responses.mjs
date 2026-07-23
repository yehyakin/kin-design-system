import process from "node:process";
import { inspectAgentResponses } from "./lib/agent-response-verification.mjs";

function parseArguments(args) {
  let baseUrl = null;
  let attempts = 6;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--base-url" && args[index + 1]) baseUrl = args[++index];
    else if (args[index] === "--attempts" && args[index + 1]) attempts = Number(args[++index]);
    else throw new Error("Usage: node scripts/verify-agent-responses.mjs --base-url <url> [--attempts N]");
  }
  if (!baseUrl) throw new Error("--base-url is required");
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10) throw new Error("--attempts must be an integer from 1 to 10");
  return { baseUrl: baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`, attempts };
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

let result = null;
for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
  try {
    result = await inspectAgentResponses({ root: process.cwd(), baseUrl: options.baseUrl });
  } catch (error) {
    result = { failures: [`request failed: ${error.message}`], limitations: [], checked: 0 };
  }
  if (result.failures.length === 0) break;
  if (attempt < options.attempts) {
    const delay = Math.min(10_000, 1_000 * (2 ** (attempt - 1)));
    console.error(`Agent response verification attempt ${attempt} failed; retrying in ${delay}ms.`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

for (const limitation of result.limitations) console.warn(`MIME limitation: ${limitation}`);
if (result.failures.length > 0) {
  console.error(`Agent response verification failed (${result.failures.length}):`);
  for (const failure of result.failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Agent response verification passed: ${result.checked} exact public responses; ${result.limitations.length} measured host MIME limitation(s).`);
