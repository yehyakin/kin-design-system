import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { contractChecksum } from "./contract-checksum.mjs";

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const help = args.includes("--help") || args.includes("-h");
const targetArg = args.find((arg) => !arg.startsWith("--")) ?? ".";
const target = path.resolve(targetArg);
const configPath = path.join(target, "kin.config.json");
const errors = [];
const warnings = [];
const profiles = new Set(["information-site", "intelligence-workspace", "ecommerce-operations", "engineering-canvas"]);
const evidenceStages = new Set(["initialized", "mapped", "verified", "production-observed"]);
const mappingStates = new Set(["pending", "mapped", "verified", "not-applicable"]);
const automatedStates = new Set(["not-run", "passed", "failed", "blocked"]);
const manualStates = new Set(["not-run", "passed", "failed", "blocked", "not-applicable"]);
const visualCriterionStates = new Set(["not-run", "passed", "failed", "not-applicable"]);
const requiredVisualCriteria = new Set([
  "task-first",
  "dominant-region",
  "continuous-structure",
  "density-without-repetition",
  "semantic-separation",
  "theme-integrity",
  "motion-continuity",
  "responsive-priority",
  "no-fabricated-data-or-behavior",
]);
const requiredBriefHeadings = [
  "Product truth",
  "Route and profile map",
  "Representative workflow",
  "Composition contract",
  "Required interactions and states",
  "Prohibited substitutions",
  "Evidence, rollout, and approval",
];
let evidenceStatus = null;

function validateEvidence(evidence, config, evidenceFile) {
  if (evidence.kinVersion !== config.kinVersion) errors.push(`${evidenceFile}: kinVersion must match kin.config.json.`);
  if (evidence.profile !== config.profile) errors.push(`${evidenceFile}: profile must match kin.config.json.`);
  if (!evidence.productRevision || typeof evidence.productRevision !== "string") errors.push(`${evidenceFile}: productRevision is required.`);
  if (!evidenceStages.has(evidence.status)) errors.push(`${evidenceFile}: status is not a supported adoption stage.`);
  evidenceStatus = evidence.status ?? null;

  const mappingGroups = ["tokens", "components", "routes"];
  for (const group of mappingGroups) {
    const mapping = evidence.mappings?.[group];
    if (!mapping || !mappingStates.has(mapping.status) || !Array.isArray(mapping.items)) {
      errors.push(`${evidenceFile}: mappings.${group} requires a supported status and items array.`);
      continue;
    }
    for (const [index, item] of mapping.items.entries()) {
      if (!item.kin || !item.local || typeof item.notes !== "string") {
        errors.push(`${evidenceFile}: mappings.${group}.items[${index}] requires kin, local, and notes.`);
      }
    }
  }

  if (["mapped", "verified", "production-observed"].includes(evidence.status)) {
    if (!evidence.reviewedOn) errors.push(`${evidenceFile}: ${evidence.status} status requires reviewedOn.`);
    for (const group of mappingGroups) {
      if (!["mapped", "verified", "not-applicable"].includes(evidence.mappings?.[group]?.status)) {
        errors.push(`${evidenceFile}: ${evidence.status} status cannot leave mappings.${group} pending.`);
      }
    }
    if (["product", "design", "engineering", "accessibility"].some((field) => !evidence.ownership?.[field]?.trim())) {
      errors.push(`${evidenceFile}: ${evidence.status} status requires named product, design, engineering, and accessibility ownership.`);
    }
  }

  const automated = evidence.verification?.automated;
  if (!Array.isArray(automated)) errors.push(`${evidenceFile}: verification.automated must be an array.`);
  else {
    for (const [index, check] of automated.entries()) {
      if (!check.name || !check.command || !automatedStates.has(check.status) || typeof check.artifact !== "string" || typeof check.notes !== "string") {
        errors.push(`${evidenceFile}: verification.automated[${index}] requires name, command, and a supported status.`);
        continue;
      }
      if (["passed", "failed"].includes(check.status) && !check.runAt) {
        errors.push(`${evidenceFile}: completed automated check ${check.name} requires runAt.`);
      }
      if (["passed", "failed"].includes(check.status) && !check.artifact.trim() && !check.notes.trim()) {
        errors.push(`${evidenceFile}: completed automated check ${check.name} requires an artifact or explanatory notes.`);
      }
      if (check.status === "blocked" && check.notes.trim().length < 12) {
        errors.push(`${evidenceFile}: blocked automated check ${check.name} requires a specific reason.`);
      }
    }
    for (const command of config.verification?.commands ?? []) {
      if (!automated.some((check) => check.command === command)) warnings.push(`${evidenceFile}: configured command is not tracked in evidence: ${command}`);
    }
  }

  const manual = evidence.verification?.manual;
  if (!Array.isArray(manual)) errors.push(`${evidenceFile}: verification.manual must be an array.`);
  else {
    const ids = new Set();
    for (const [index, check] of manual.entries()) {
      if (!check.id || ids.has(check.id) || !manualStates.has(check.status) || !Array.isArray(check.findings) || typeof check.environment !== "string" || typeof check.reviewer !== "string" || typeof check.notes !== "string") {
        errors.push(`${evidenceFile}: verification.manual[${index}] requires a unique id, supported status, and findings array.`);
        continue;
      }
      ids.add(check.id);
      if (["passed", "failed"].includes(check.status) && (!check.environment || !check.reviewer || !check.reviewedOn)) {
        errors.push(`${evidenceFile}: completed manual check ${check.id} requires environment, reviewer, and reviewedOn.`);
      }
      if (check.status === "blocked" && check.notes.trim().length < 12) {
        errors.push(`${evidenceFile}: blocked manual check ${check.id} requires a specific reason.`);
      }
      if (check.status === "not-applicable" && (!check.notes || check.notes.trim().length < 12)) {
        errors.push(`${evidenceFile}: not-applicable manual check ${check.id} requires a specific reason.`);
      }
    }
  }

  const visualReview = evidence.visualReview;
  if (visualReview === undefined) {
    if (["verified", "production-observed"].includes(evidence.status)) {
      errors.push(`${evidenceFile}: ${evidence.status} status requires a representative production workflow visualReview.`);
    } else {
      warnings.push(`${evidenceFile}: visualReview is not recorded; new adoption records should name a representative production workflow.`);
    }
  } else if (!visualReview || typeof visualReview !== "object" || Array.isArray(visualReview)) {
    errors.push(`${evidenceFile}: visualReview must be an object.`);
  } else {
    const fields = ["workflow", "baseline", "candidate", "environment", "reviewer", "notes"];
    if (!automatedStates.has(visualReview.status)) {
      errors.push(`${evidenceFile}: visualReview.status is not supported.`);
    }
    if (!Array.isArray(visualReview.routes) || !Array.isArray(visualReview.findings) || fields.some((field) => typeof visualReview[field] !== "string")) {
      errors.push(`${evidenceFile}: visualReview requires string fields plus routes and findings arrays.`);
    } else {
      if (visualReview.routes.some((route) => typeof route !== "string" || !route.trim())) {
        errors.push(`${evidenceFile}: visualReview.routes must contain non-empty route strings.`);
      }
      if (visualReview.findings.some((finding) => typeof finding !== "string" || !finding.trim())) {
        errors.push(`${evidenceFile}: visualReview.findings must contain non-empty finding strings.`);
      }
      if (["passed", "failed"].includes(visualReview.status)) {
        const missingContext = ["workflow", "baseline", "candidate", "environment", "reviewer"].filter((field) => !visualReview[field].trim());
        if (missingContext.length > 0 || visualReview.routes.length === 0 || !visualReview.reviewedOn) {
          errors.push(`${evidenceFile}: completed visualReview requires a workflow, routes, baseline, candidate, environment, reviewer, and reviewedOn.`);
        }
      }
      if (visualReview.status === "blocked" && visualReview.notes.trim().length < 12) {
        errors.push(`${evidenceFile}: blocked visualReview requires a specific reason.`);
      }
    }

    if (visualReview.profile !== undefined && !profiles.has(visualReview.profile)) {
      errors.push(`${evidenceFile}: visualReview.profile is not a supported KIN product profile.`);
    }

    if (!Array.isArray(visualReview.criteria)) {
      if (["mapped", "verified", "production-observed"].includes(evidence.status)) {
        errors.push(`${evidenceFile}: ${evidence.status} status requires the visualReview criteria matrix.`);
      } else {
        warnings.push(`${evidenceFile}: visualReview criteria are not recorded.`);
      }
    } else {
      const criterionIds = new Set();
      for (const [index, criterion] of visualReview.criteria.entries()) {
        if (!criterion?.id || criterionIds.has(criterion.id) || !visualCriterionStates.has(criterion.status) || typeof criterion.notes !== "string") {
          errors.push(`${evidenceFile}: visualReview.criteria[${index}] requires a unique id, supported status, and notes.`);
          continue;
        }
        criterionIds.add(criterion.id);
        if (criterion.status === "not-applicable" && criterion.notes.trim().length < 12) {
          errors.push(`${evidenceFile}: visualReview criterion ${criterion.id} marked not-applicable requires a specific reason.`);
        }
      }
      for (const id of requiredVisualCriteria) {
        if (!criterionIds.has(id)) errors.push(`${evidenceFile}: visualReview criteria are missing ${id}.`);
      }
      if (visualReview.status === "passed" && visualReview.criteria.some((criterion) => !["passed", "not-applicable"].includes(criterion.status))) {
        errors.push(`${evidenceFile}: a passed visualReview requires every visual criterion to pass or be documented as not-applicable.`);
      }
    }

    if (["mapped", "verified", "production-observed"].includes(evidence.status)) {
      if (!visualReview.profile) errors.push(`${evidenceFile}: ${evidence.status} status requires visualReview.profile.`);
      if (!visualReview.workflow?.trim() || !visualReview.routes?.length) {
        errors.push(`${evidenceFile}: ${evidence.status} status requires a named representative workflow and routes before implementation evidence can be mapped.`);
      }

      const representativeRoutes = config.scope?.routeProfiles?.filter((item) => item.representative) ?? [];
      if (representativeRoutes.length === 1) {
        const representative = representativeRoutes[0];
        if (visualReview.profile && representative.profile !== visualReview.profile) {
          errors.push(`${evidenceFile}: visualReview.profile must match the representative route profile ${representative.profile}.`);
        }
        if (Array.isArray(visualReview.routes) && !visualReview.routes.includes(representative.route)) {
          errors.push(`${evidenceFile}: visualReview.routes must include the configured representative route ${representative.route}.`);
        }
      }
    }
  }

  if (!evidence.production || !["not-observed", "observed"].includes(evidence.production.status)) {
    errors.push(`${evidenceFile}: production requires not-observed or observed status.`);
  } else if (["evidence", "owner", "rollback"].some((field) => typeof evidence.production[field] !== "string")) {
    errors.push(`${evidenceFile}: production evidence, owner, and rollback must be strings.`);
  }

  if (!evidence.ownership || ["product", "design", "engineering", "accessibility"].some((field) => typeof evidence.ownership[field] !== "string")) {
    errors.push(`${evidenceFile}: ownership requires product, design, engineering, and accessibility strings.`);
  }

  if (!Array.isArray(evidence.exceptions)) errors.push(`${evidenceFile}: exceptions must be an array.`);
  else {
    for (const [index, exception] of evidence.exceptions.entries()) {
      if (!exception.scope || !exception.owner || !["active", "resolved"].includes(exception.status) || typeof exception.reason !== "string" || exception.reason.trim().length < 12) {
        errors.push(`${evidenceFile}: exceptions[${index}] requires scope, specific reason, owner, and status.`);
      }
    }
  }

  if (["verified", "production-observed"].includes(evidence.status)) {
    for (const group of mappingGroups) {
      if (!["verified", "not-applicable"].includes(evidence.mappings?.[group]?.status)) {
        errors.push(`${evidenceFile}: ${evidence.status} status requires mappings.${group} to be verified or not-applicable.`);
      }
    }
    if (!automated?.length || automated.some((check) => check.status !== "passed")) {
      errors.push(`${evidenceFile}: ${evidence.status} status requires every tracked automated check to pass.`);
    }
    if (!manual?.length || manual.some((check) => !["passed", "not-applicable"].includes(check.status))) {
      errors.push(`${evidenceFile}: ${evidence.status} status requires every manual check to pass or be documented as not-applicable.`);
    }
    if (visualReview?.status !== "passed") {
      errors.push(`${evidenceFile}: ${evidence.status} status requires the representative production workflow visualReview to pass.`);
    }
  }

  if (evidence.status === "production-observed") {
    const production = evidence.production ?? {};
    if (production.status !== "observed" || !production.observedOn || !production.evidence || !production.owner || !production.rollback) {
      errors.push(`${evidenceFile}: production-observed status requires dated evidence, owner, and rollback.`);
    }
  } else if (evidence.production?.status === "observed") {
    errors.push(`${evidenceFile}: production.status cannot be observed before the production-observed stage.`);
  }
}

if (help) {
  console.log("Usage: node scripts/check-adoption.mjs [project-directory] [--json]");
  console.log("Checks the KIN adoption configuration and evidence record without running project commands or changing files.");
  process.exit(0);
}

if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
  console.error(`Adoption target must be an existing directory: ${target}`);
  process.exit(2);
}

if (!fs.existsSync(configPath)) {
  errors.push("kin.config.json does not exist. Run scripts/init-adoption.mjs <project> --profile <profile> first.");
} else {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    errors.push(`kin.config.json is invalid JSON: ${error.message}`);
  }
  if (config) {
    if (!/^\d+\.\d+\.\d+$/.test(config.kinVersion ?? "")) errors.push("kinVersion must be an exact semantic version.");
    if (!profiles.has(config.profile)) errors.push("profile is not a supported KIN product profile.");
    if (!config.contract?.source) errors.push("contract.source is required.");
    else {
      const revision = config.contract.revision;
      const fullCommitInSource = /[0-9a-f]{40}/i.test(config.contract.source);
      if (revision && !config.contract.source.includes(revision)) warnings.push("contract.source does not include contract.revision.");
      else if (!revision && config.kinVersion && !config.contract.source.includes(`@${config.kinVersion}`) && !config.contract.source.includes(`/v${config.kinVersion}`) && !fullCommitInSource) {
        warnings.push("contract.source does not appear to pin the configured KIN version or a full commit.");
      }
      if (!revision) warnings.push("contract.revision is not recorded; new adoption records should name the exact reviewed tag or commit.");
    }
    if (!config.contract?.local) errors.push("contract.local is required.");
    else if (!fs.existsSync(path.join(target, config.contract.local))) errors.push(`Pinned contract is missing: ${config.contract.local}`);
    else {
      const contract = fs.readFileSync(path.join(target, config.contract.local), "utf8");
      const contractVersion = contract.match(/^kin_version:\s*([0-9]+\.[0-9]+\.[0-9]+)\s*$/m)?.[1];
      if (!contractVersion) warnings.push("Pinned contract does not expose a machine-readable kin_version.");
      else if (contractVersion !== config.kinVersion) errors.push(`Pinned contract version ${contractVersion} does not match kinVersion ${config.kinVersion}.`);
      if (!config.contract.checksum) warnings.push("contract.checksum is not recorded; new adoption records should verify the local contract copy.");
      else {
        const checksum = contractChecksum(contract);
        if (!/^[a-f0-9]{64}$/.test(config.contract.checksum)) errors.push("contract.checksum must be a lowercase SHA-256 value.");
        else if (checksum !== config.contract.checksum) errors.push(`Pinned contract checksum ${checksum} does not match contract.checksum.`);
      }
    }
    if (!config.tokens?.source) errors.push("tokens.source is required.");
    else if (!fs.existsSync(path.join(target, config.tokens.source))) errors.push(`Token integration file is missing: ${config.tokens.source}`);
    if (!config.scope) {
      warnings.push("scope is not recorded; new adoption records should include a project-owned implementation brief and route/profile map.");
    } else {
      if (!new Set(["partial", "full"]).has(config.scope.mode)) errors.push("scope.mode must be partial or full.");
      if (!config.scope.implementationBrief) errors.push("scope.implementationBrief is required when scope is configured.");
      else if (!fs.existsSync(path.join(target, config.scope.implementationBrief))) errors.push(`Implementation brief is missing: ${config.scope.implementationBrief}`);
      if (!Array.isArray(config.scope.routeProfiles)) errors.push("scope.routeProfiles must be an array.");
      else {
        const representative = config.scope.routeProfiles.filter((item) => item?.representative === true);
        if (representative.length !== 1) errors.push("scope.routeProfiles must contain exactly one representative route family.");
        for (const [index, item] of config.scope.routeProfiles.entries()) {
          if (!item?.route || !profiles.has(item.profile) || !item.purpose || typeof item.representative !== "boolean") {
            errors.push(`scope.routeProfiles[${index}] requires route, supported profile, purpose, and representative.`);
          }
        }
      }
      if (!Array.isArray(config.scope.exclusions)) errors.push("scope.exclusions must be an array.");
      else {
        for (const [index, item] of config.scope.exclusions.entries()) {
          if (!item?.route || typeof item.reason !== "string" || item.reason.trim().length < 12) {
            errors.push(`scope.exclusions[${index}] requires route and a specific reason.`);
          }
        }
      }
    }
    if (!Array.isArray(config.audit?.include)) errors.push("audit.include must be an array.");
    for (const [index, exception] of (config.audit?.exceptions ?? []).entries()) {
      if (!exception.rule || !exception.path || typeof exception.reason !== "string" || exception.reason.trim().length < 12) {
        errors.push(`audit.exceptions[${index}] requires rule, path, and a specific reason of at least 12 characters.`);
      }
    }
    if (!Array.isArray(config.verification?.commands) || config.verification.commands.length === 0) {
      errors.push("verification.commands must contain at least one real project command.");
    }
    if (!config.delivery) {
      warnings.push("delivery is not recorded; KIN defaults to contract-first, variables-only Figma interoperability, and project-owned runtime components.");
    } else {
      if (config.delivery.mode !== "contract-first") errors.push("delivery.mode must be contract-first for the KIN core contract.");
      if (config.delivery.figma !== "variables-only") errors.push("delivery.figma must be variables-only unless a separate reviewed Figma library contract exists.");
      if (config.delivery.runtime !== "project-owned") errors.push("delivery.runtime must be project-owned unless a separate reviewed runtime package exists.");
      if (!config.delivery.evidence) errors.push("delivery.evidence is required when delivery is configured.");
      else {
        const evidenceFile = config.delivery.evidence;
        const evidencePath = path.join(target, evidenceFile);
        if (!fs.existsSync(evidencePath)) errors.push(`Adoption evidence is missing: ${evidenceFile}`);
        else {
          try {
            validateEvidence(JSON.parse(fs.readFileSync(evidencePath, "utf8")), config, evidenceFile);
          } catch (error) {
            errors.push(`${evidenceFile} is invalid JSON: ${error.message}`);
          }
        }
      }
    }

    if (config.scope?.implementationBrief && fs.existsSync(path.join(target, config.scope.implementationBrief))) {
      const briefFile = config.scope.implementationBrief;
      const brief = fs.readFileSync(path.join(target, briefFile), "utf8");
      const briefStatus = brief.match(/^status:\s*(draft|ready|approved)\s*$/m)?.[1];
      if (!briefStatus) errors.push(`${briefFile}: frontmatter must declare status as draft, ready, or approved.`);
      for (const heading of requiredBriefHeadings) {
        if (!new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").test(brief)) {
          errors.push(`${briefFile}: required section is missing: ${heading}.`);
        }
      }
      if (["mapped", "verified", "production-observed"].includes(evidenceStatus)) {
        if (briefStatus === "draft") errors.push(`${briefFile}: ${evidenceStatus} evidence cannot use a draft implementation brief.`);
        if (/\bTODO\b/.test(brief)) errors.push(`${briefFile}: ${evidenceStatus} evidence cannot contain unresolved TODO placeholders.`);
        const routeProfiles = config.scope.routeProfiles ?? [];
        if (routeProfiles.some((item) => /\bTODO\b/.test(`${item.route} ${item.purpose}`))) {
          errors.push(`kin.config.json: ${evidenceStatus} evidence cannot use TODO route/profile mappings.`);
        }
      }
      if (["verified", "production-observed"].includes(evidenceStatus) && briefStatus !== "approved") {
        errors.push(`${briefFile}: ${evidenceStatus} evidence requires an approved implementation brief.`);
      }
    }
    if (["mapped", "verified", "production-observed"].includes(evidenceStatus) && !config.scope) {
      errors.push(`kin.config.json: ${evidenceStatus} evidence requires scope, routeProfiles, and a project-owned implementation brief.`);
    }
  }
}

const result = { valid: errors.length === 0, target, evidenceStatus, errors, warnings };
if (jsonOutput) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
else {
  console.log(result.valid ? "KIN adoption configuration is structurally valid." : "KIN adoption configuration has errors.");
  for (const error of errors) console.log(`ERROR: ${error}`);
  for (const warning of warnings) console.log(`WARN: ${warning}`);
}
process.exitCode = errors.length > 0 ? 1 : 0;
