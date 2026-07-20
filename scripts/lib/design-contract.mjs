import fs from "node:fs";
import path from "node:path";
import { contractChecksum } from "../contract-checksum.mjs";

const semverPattern = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

function topLevelScalar(source, key) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  return frontmatter.match(new RegExp(`^${key}:\\s*["']?([^"'\\s]+)["']?\\s*$`, "m"))?.[1] ?? null;
}

function topLevelList(source, key) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const lines = frontmatter.split(/\r?\n/);
  const start = lines.findIndex((line) => line === `${key}:`);
  if (start < 0) return [];
  const values = [];
  for (const line of lines.slice(start + 1)) {
    const match = line.match(/^  -\s+(.+?)\s*$/);
    if (!match) break;
    values.push(match[1].replace(/^['"]|['"]$/g, ""));
  }
  return values;
}

export function compareSemver(left, right) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

export function parseDesignContract(source) {
  const kinVersion = topLevelScalar(source, "kin_version");
  const releaseStatus = topLevelScalar(source, "release_status");
  const latestStable = topLevelScalar(source, "latest_stable");
  const supportedProducts = topLevelList(source, "supported_products");
  if (!kinVersion || !semverPattern.test(kinVersion)) throw new Error("DESIGN.md kin_version must be SemVer");
  if (!latestStable || !semverPattern.test(latestStable)) throw new Error("DESIGN.md latest_stable must be SemVer");
  if (!new Set(["development", "released"]).has(releaseStatus)) throw new Error("DESIGN.md release_status must be development or released");
  if (releaseStatus === "released" && latestStable !== kinVersion) throw new Error("Released DESIGN.md must set latest_stable to kin_version");
  if (releaseStatus === "development" && compareSemver(latestStable, kinVersion) > 0) throw new Error("DESIGN.md latest_stable cannot exceed kin_version");
  if (supportedProducts.length === 0 || new Set(supportedProducts).size !== supportedProducts.length) {
    throw new Error("DESIGN.md supported_products must contain unique product profiles");
  }
  return {
    kinVersion,
    releaseStatus,
    latestStable,
    supportedProducts,
    checksum: contractChecksum(source),
  };
}

export function readDesignContract(root = process.cwd()) {
  const source = fs.readFileSync(path.join(root, "DESIGN.md"), "utf8");
  return { source, ...parseDesignContract(source) };
}
