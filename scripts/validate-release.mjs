import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { contractChecksum } from "./contract-checksum.mjs";

const root = process.cwd();
const failures = [];
const semverPattern = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;
const fullCommitPattern = /^[a-f0-9]{40}$/i;

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function fail(message) {
  failures.push(message);
}

function frontmatterValue(source, key) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  return frontmatter.match(new RegExp(`^${key}:\\s*["']?([^"'\\s]+)["']?\\s*$`, "m"))?.[1];
}

function compareSemver(left, right) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

function git(args, { trim = true } = {}) {
  try {
    const output = execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return trim ? output.trim() : output;
  } catch {
    return null;
  }
}

function gitRevisionExists(revision) {
  return git(["cat-file", "-e", `${revision}^{commit}`]) !== null;
}

function designAt(revision) {
  return git(["show", `${revision}:DESIGN.md`], { trim: false });
}

function sourcePinsRevision(source, revision) {
  if (typeof source !== "string") return false;
  try {
    const url = new URL(source);
    if (url.origin !== "https://github.com") return false;
    return (
      url.pathname === `/yehyakin/kin-design-system/tree/${revision}` ||
      url.pathname === `/yehyakin/kin-design-system/blob/${revision}/DESIGN.md`
    );
  } catch {
    return false;
  }
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
const design = read("DESIGN.md");
const delivery = read("DELIVERY.md");
const changelog = read("CHANGELOG.md");
const designVersion = frontmatterValue(design, "kin_version");
const releaseStatus = frontmatterValue(design, "release_status");
const latestStable = frontmatterValue(design, "latest_stable");
const version = packageJson.version;
const currentChecksum = contractChecksum(design);

if (!designVersion || !semverPattern.test(designVersion)) fail("DESIGN.md does not expose a SemVer kin_version in frontmatter");
if (!semverPattern.test(version)) fail(`package.json version is not SemVer: ${version}`);
if (designVersion !== version) fail(`DESIGN.md kin_version ${designVersion ?? "missing"} differs from package version ${version}`);
if (!new Set(["development", "released"]).has(releaseStatus)) {
  fail("DESIGN.md release_status must be development or released");
}
if (!latestStable || !semverPattern.test(latestStable)) {
  fail("DESIGN.md latest_stable must be a SemVer value");
} else if (semverPattern.test(version)) {
  if (releaseStatus === "released" && latestStable !== version) {
    fail(`released KIN ${version} must set latest_stable to ${version}`);
  }
  if (releaseStatus === "development" && compareSemver(latestStable, version) > 0) {
    fail(`development latest_stable ${latestStable} cannot be newer than kin_version ${version}`);
  }
  if (!gitRevisionExists(`v${latestStable}`)) {
    fail(`latest_stable v${latestStable} does not exist as a local Git tag`);
  }
}

if (packageLock.version !== version) fail(`package-lock.json version ${packageLock.version} differs from package version ${version}`);
if (packageLock.packages?.[""]?.version !== version) fail("package-lock.json root package version is out of date");
for (const term of ["contract-first", "variables-only", "project-owned"]) {
  if (!delivery.includes(term)) fail(`DELIVERY.md does not define the ${term} boundary`);
}

for (const file of ["README.md", "READMEs/README.zh-CN.md"]) {
  const source = read(file);
  if (releaseStatus === "released") {
    if (!source.includes(`Design_Contract-v${version}-`)) fail(`${file} badge does not use released v${version}`);
    if (!source.includes(`alt="KIN Design Contract v${version}"`)) fail(`${file} badge alt text does not identify released v${version}`);
  } else if (releaseStatus === "development") {
    if (!source.includes(`Design_Contract-v${version}_development-`)) fail(`${file} badge does not identify v${version} development`);
    if (!source.includes(`alt="KIN Design Contract v${version} development"`)) fail(`${file} badge alt text does not identify v${version} development`);
    if (source.includes(`Design_Contract-v${version}-`) || source.includes(`alt="KIN Design Contract v${version}"`)) {
      fail(`${file} must not present development KIN ${version} as a released contract`);
    }
  }
}

const siteEnglish = read("site/index.html");
const siteChinese = read("site/zh/index.html");
const siteNotFound = read("site/404.html");
const socialCard = read("site/assets/og-card.svg");
for (const [file, source] of [["site/index.html", siteEnglish], ["site/zh/index.html", siteChinese], ["site/404.html", siteNotFound]]) {
  if (/Design System\s+\d+(?:\.\d+)*/i.test(source)) fail(`${file} must not carry a stale major-version brand label`);
}

const adoption = JSON.parse(read("adoption/kin.config.example.json"));
JSON.parse(read("adoption/kin.config.schema.json"));
const adoptionEvidence = JSON.parse(read("adoption/kin.evidence.example.json"));
JSON.parse(read("adoption/kin.evidence.schema.json"));
if (adoption.kinVersion !== version) fail("adoption/kin.config.example.json has a different kinVersion");
if (adoption.contract?.checksum !== currentChecksum) fail("adoption example contract checksum does not match canonical DESIGN.md");

if (releaseStatus === "released") {
  const releaseRevision = `v${version}`;
  if (adoption.contract?.revision !== releaseRevision) fail("released adoption example revision must match the release tag");
  if (!sourcePinsRevision(adoption.contract?.source, releaseRevision)) fail("released adoption example source must pin the matching release tag");
  if (!gitRevisionExists(releaseRevision)) {
    fail(`released KIN ${version} requires the Git tag ${releaseRevision}`);
  } else {
    const taggedDesign = designAt(releaseRevision);
    if (taggedDesign === null || contractChecksum(taggedDesign) !== currentChecksum) {
      fail(`${releaseRevision} DESIGN.md checksum does not match the current contract`);
    }
  }
  if (!new RegExp(`^## ${escapeRegExp(version)} —`, "m").test(changelog)) {
    fail(`CHANGELOG.md does not contain a ${version} release section`);
  }
  if (!siteEnglish.includes(`Release ${version}`) || !siteChinese.includes(`${version} 正式版`)) {
    fail(`released showcase copy must identify KIN ${version} as the current release in both locales`);
  }
  if (!siteEnglish.includes(`/releases/tag/v${version}`) || !siteChinese.includes(`/releases/tag/v${version}`)) {
    fail(`released showcase must link to v${version} release notes in both locales`);
  }
  if (!socialCard.includes(`>${version}<`)) fail(`released social card must display ${version}`);
} else if (releaseStatus === "development") {
  const revision = adoption.contract?.revision;
  if (!fullCommitPattern.test(revision ?? "")) {
    fail("development adoption example revision must be a full 40-character Git commit SHA");
  } else {
    if (!sourcePinsRevision(adoption.contract?.source, revision)) {
      fail("development adoption example source must pin the same full Git commit SHA");
    }
    if (!gitRevisionExists(revision)) {
      fail(`development adoption revision ${revision} is not a local Git commit`);
    } else {
      const committedDesign = designAt(revision);
      if (committedDesign === null || contractChecksum(committedDesign) !== currentChecksum) {
        fail(`development adoption revision ${revision} does not contain the current DESIGN.md contract`);
      }
    }
  }
  if (!/^## Unreleased\s*$/m.test(changelog)) fail("development CHANGELOG.md must retain an Unreleased section");
  if (new RegExp(`^## ${escapeRegExp(version)} —`, "m").test(changelog)) {
    fail(`development KIN ${version} must not include a released ${version} CHANGELOG section`);
  }

  if (!siteEnglish.includes(`${version} development`) || !siteChinese.includes(`${version} 开发中`)) {
    fail(`development showcase copy must identify KIN ${version} as development in both locales`);
  }
  if (!siteEnglish.includes(`/releases/tag/v${latestStable}`) || !siteChinese.includes(`/releases/tag/v${latestStable}`)) {
    fail(`development showcase must link to latest stable v${latestStable} in both locales`);
  }
  if (!socialCard.includes(`${version} development`)) fail(`development social card must display ${version} development`);

  if (!gitRevisionExists(`v${version}`)) {
    const currentTagUrl = new RegExp(
      `https://(?:github\\.com/yehyakin/kin-design-system/(?:tree|blob|releases/tag)/|raw\\.githubusercontent\\.com/yehyakin/kin-design-system/)v${escapeRegExp(version)}(?:[/"'#?]|$)`,
      "i",
    );
    for (const file of walkFiles(path.join(root, "site"))) {
      const relative = path.relative(root, file).replaceAll("\\", "/");
      if (currentTagUrl.test(fs.readFileSync(file, "utf8"))) {
        fail(`${relative} links to the nonexistent v${version} tag or release while KIN is in development`);
      }
    }
  }
}

if (adoption.delivery?.mode !== "contract-first" || adoption.delivery?.figma !== "variables-only" || adoption.delivery?.runtime !== "project-owned") {
  fail("adoption example does not preserve the KIN core delivery boundary");
}
if (!adoption.scope?.implementationBrief || adoption.scope?.routeProfiles?.filter((item) => item.representative).length !== 1) {
  fail("adoption example must include an implementation brief and exactly one representative route profile");
}
if (adoptionEvidence.kinVersion !== version) fail("adoption/kin.evidence.example.json has a different kinVersion");
if (adoptionEvidence.profile !== adoption.profile) fail("adoption evidence example profile differs from the adoption configuration example");
if (adoptionEvidence.status !== "initialized") fail("adoption evidence example must not claim unperformed verification");
if (adoptionEvidence.visualReview?.status !== "not-run") fail("adoption evidence example must include an unperformed representative workflow visual review");
if (adoptionEvidence.visualReview?.criteria?.length !== 9) fail("adoption evidence example must include the complete visual-review criteria matrix");

const staleReferencePattern = /\bKIN\s+(\d+\.\d+(?:\.\d+)?)\b/g;
for (const file of ["examples/workspace-reference/index.html", "examples/workspace-reference/states.html", "examples/product-patterns/information.html", "examples/product-patterns/ecommerce.html", "examples/product-patterns/canvas.html"]) {
  for (const match of read(file).matchAll(staleReferencePattern)) {
    if (match[1] !== version) fail(`${file} contains stale product label: ${match[0]}`);
  }
}

if (failures.length > 0) {
  console.error(`Release validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const lifecycle = releaseStatus === "released" ? `released as v${version}` : `development at ${adoption.contract.revision}; latest stable v${latestStable}`;
console.log(`Release validation passed: KIN ${version} (${lifecycle})`);
