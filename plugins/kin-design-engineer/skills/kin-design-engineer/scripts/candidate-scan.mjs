import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_EXCLUDED = [
  ".git", "**/.git", ".site-dist", "**/.site-dist", "node_modules", "**/node_modules",
  "dist", "**/dist", "build", "**/build", "out", "**/out", "coverage", "**/coverage",
  "test-results", "**/test-results", "playwright-report", "**/playwright-report", ".next", "**/.next",
  "tests", "**/tests", "__tests__", "**/__tests__", "fixtures", "**/fixtures",
];
const EXTENSIONS = new Set([".css", ".scss", ".sass", ".less", ".html", ".htm", ".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte"]);
const MAX_FILE_BYTES = 1_048_576;

export const rules = [
  {
    id: "kin/viewport-zoom-disabled",
    severity: "P1",
    dimension: "accessibility",
    pattern: /(?:user-scalable\s*=\s*no|maximum-scale\s*=\s*1)/gi,
    message: "The viewport may prevent user zoom. Confirm this is removed for 200% zoom support.",
  },
  {
    id: "kin/interactive-nonsemantic",
    severity: "P1",
    dimension: "accessibility",
    pattern: /<(?:div|span)\b[^>]*(?:onClick|onclick)\s*=/g,
    message: "A non-semantic element appears interactive. Prefer a button/link or document full keyboard semantics.",
  },
  {
    id: "kin/image-missing-alt",
    severity: "P1",
    dimension: "accessibility",
    pattern: /<img\b(?![^>]*\balt\s*=)[^>]*>/gi,
    message: "An image appears to have no alt attribute. Confirm whether it is informative or decorative.",
  },
  {
    id: "kin/focus-suppressed",
    severity: "P1",
    dimension: "accessibility",
    pattern: /(?:outline\s*:\s*(?:none|0)|\boutline-none\b)/gi,
    message: "Focus styling is suppressed. Verify an equally visible :focus-visible replacement exists.",
  },
  {
    id: "kin/transition-all",
    severity: "P2",
    dimension: "motion",
    pattern: /transition(?:-property)?\s*:\s*all\b|\btransition-all\b/gi,
    message: "Broad transitions can animate layout and state unintentionally. Name the required properties.",
  },
  {
    id: "kin/decorative-gradient",
    severity: "P2",
    dimension: "visual-restraint",
    pattern: /(?:linear|radial|conic)-gradient\s*\(/gi,
    message: "A gradient is present. Keep it only when it communicates data or an approved brand asset.",
  },
  {
    id: "kin/backdrop-blur",
    severity: "P2",
    dimension: "visual-restraint",
    pattern: /(?:backdrop-filter\s*:\s*[^;]*blur|\bbackdrop-blur(?:-[\w-]+)?\b)/gi,
    message: "Backdrop blur is present. Restrict it to a temporary floating layer with an opaque fallback.",
  },
  {
    id: "kin/pill-overuse",
    severity: "P2",
    dimension: "visual-restraint",
    pattern: /(?:border-radius\s*:\s*(?:999|9999)px|\brounded-full\b)/gi,
    message: "A full pill radius is present. Confirm the element is a status dot, avatar, switch, or deliberate pill control.",
  },
  {
    id: "kin/hardcoded-color",
    severity: "P3",
    dimension: "token-use",
    pattern: /#[0-9a-f]{3,8}\b/gi,
    message: "A hard-coded color is present. Confirm it is a token definition, data color, or documented exception.",
  },
  {
    id: "kin/emoji-ui",
    severity: "P3",
    dimension: "content",
    pattern: /[\u{1F300}-\u{1FAFF}]/gu,
    message: "An emoji is present in source. Confirm it is user content rather than interface decoration.",
  },
];

function globPattern(pattern) {
  const normalized = pattern.replaceAll("\\", "/");
  let source = "";
  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];
    if (character === "*" && normalized[index + 1] === "*") {
      source += ".*";
      index += 1;
    } else if (character === "*") {
      source += "[^/]*";
    } else if (character === "?") {
      source += "[^/]";
    } else {
      source += character.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
    }
  }
  return new RegExp(`^${source}$`);
}

function pathMatches(relative, pattern) {
  const normalizedPattern = pattern.replaceAll("\\", "/");
  return relative === normalizedPattern
    || (!normalizedPattern.includes("*") && relative.startsWith(`${normalizedPattern}/`))
    || globPattern(normalizedPattern).test(relative);
}

function locationFor(source, index) {
  const before = source.slice(0, index);
  const line = before.split("\n").length;
  return { line, column: index - before.lastIndexOf("\n") };
}

function readAuditConfig(target) {
  const configPath = path.join(target, "kin.config.json");
  if (!fs.existsSync(configPath)) return { configPath: null, audit: {} };
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot parse ${configPath}: ${error.message}`);
  }
  const audit = config.audit ?? {};
  for (const key of ["include", "exclude", "exceptions"]) {
    if (audit[key] !== undefined && !Array.isArray(audit[key])) {
      throw new Error(`kin.config.json audit.${key} must be an array.`);
    }
  }
  return { configPath, audit };
}

function walk(target, directory, excluded, files, skipped) {
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    skipped.push({ path: path.relative(target, directory).replaceAll(path.sep, "/") || ".", reason: `unreadable directory: ${error.code ?? error.message}` });
    return;
  }

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(target, absolute).replaceAll(path.sep, "/");
    if (excluded.some((pattern) => pathMatches(relative, pattern))) continue;
    if (entry.isSymbolicLink()) {
      skipped.push({ path: relative, reason: "symbolic link not followed" });
      continue;
    }
    if (entry.isDirectory()) {
      walk(target, absolute, excluded, files, skipped);
      continue;
    }
    if (!entry.isFile() || !EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
    const size = fs.statSync(absolute).size;
    if (size > MAX_FILE_BYTES) {
      skipped.push({ path: relative, reason: `file exceeds ${MAX_FILE_BYTES} bytes` });
      continue;
    }
    files.push(absolute);
  }
}

export function scanProject(targetDirectory) {
  const target = path.resolve(targetDirectory);
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    throw new Error(`Audit target must be an existing directory: ${target}`);
  }

  const { configPath, audit } = readAuditConfig(target);
  const excluded = [...DEFAULT_EXCLUDED, ...(audit.exclude ?? [])];
  const exceptions = audit.exceptions ?? [];
  const skipped = [];
  const files = [];
  walk(target, target, excluded, files, skipped);
  const scannedFiles = files.filter((file) => {
    const relative = path.relative(target, file).replaceAll(path.sep, "/");
    return !audit.include?.length || audit.include.some((pattern) => pathMatches(relative, pattern));
  });
  const findings = [];
  const positiveSignals = new Set();
  const reportedLocations = new Set();

  for (const file of scannedFiles) {
    const relative = path.relative(target, file).replaceAll(path.sep, "/");
    let source;
    try {
      source = fs.readFileSync(file, "utf8");
    } catch (error) {
      skipped.push({ path: relative, reason: `unreadable file: ${error.code ?? error.message}` });
      continue;
    }
    const sourceLines = source.split("\n");
    if (/var\(\s*--[\w-]+/.test(source)) positiveSignals.add("Uses CSS custom properties in scanned source.");
    if (/prefers-reduced-motion/.test(source)) positiveSignals.add("Defines a reduced-motion response.");
    if (/:focus-visible|\bfocus-visible:/.test(source)) positiveSignals.add("Defines visible keyboard-focus behavior.");
    if (/<(?:main|nav)\b/i.test(source)) positiveSignals.add("Uses semantic navigation or main landmarks.");
    if (/data-theme|prefers-color-scheme/.test(source)) positiveSignals.add("Contains explicit theme behavior.");

    for (const rule of rules) {
      if (rule.id === "kin/hardcoded-color" && (/(?:token|theme|palette|variable)/i.test(relative) || /:root\s*\{/.test(source))) continue;
      rule.pattern.lastIndex = 0;
      for (const match of source.matchAll(rule.pattern)) {
        const exception = exceptions.find((item) => item.rule === rule.id
          && typeof item.reason === "string"
          && item.reason.trim().length >= 12
          && typeof item.path === "string"
          && pathMatches(relative, item.path));
        if (exception) continue;
        const location = locationFor(source, match.index ?? 0);
        const lineSource = sourceLines[location.line - 1] ?? "";
        if (rule.id === "kin/hardcoded-color" && /(?:theme-color|themeColor|meta\[name=["']theme-color)/.test(lineSource)) continue;
        const locationKey = `${relative}:${rule.id}:${location.line}`;
        if (reportedLocations.has(locationKey)) continue;
        reportedLocations.add(locationKey);
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          dimension: rule.dimension,
          file: relative,
          ...location,
          message: rule.message,
          excerpt: match[0].replaceAll(/\s+/g, " ").slice(0, 100),
        });
      }
    }
  }

  findings.sort((left, right) => left.file.localeCompare(right.file)
    || left.line - right.line
    || left.column - right.column
    || left.rule.localeCompare(right.rule));
  skipped.sort((left, right) => left.path.localeCompare(right.path) || left.reason.localeCompare(right.reason));
  const severityWeight = { P1: 4, P2: 2, P3: 1 };
  const dimensions = ["accessibility", "motion", "visual-restraint", "token-use", "content"];
  const scores = Object.fromEntries(dimensions.map((dimension) => {
    const deductions = findings.filter((finding) => finding.dimension === dimension)
      .reduce((sum, finding) => sum + severityWeight[finding.severity], 0);
    return [dimension, Math.max(0, 4 - Math.min(4, deductions))];
  }));

  return {
    kind: "candidate-static-audit",
    engine: "bundled-candidate-scan",
    target,
    configPath,
    scannedFiles: scannedFiles.length,
    skipped,
    findingCount: findings.length,
    severity: Object.fromEntries(["P1", "P2", "P3"].map((severity) => [severity, findings.filter((finding) => finding.severity === severity).length])),
    scores,
    score: Object.values(scores).reduce((sum, value) => sum + value, 0),
    scoreMaximum: dimensions.length * 4,
    findings,
    positiveSignals: [...positiveSignals].sort(),
    notice: "Regex findings are review candidates, not design facts. Confirm rendered behavior, context, and documented exceptions before changing code.",
  };
}

function isDirectRun() {
  return process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
}

if (isDirectRun()) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node candidate-scan.mjs <project-directory> [--json]");
    console.log("Reports static review candidates. It never edits or executes the target project.");
    process.exit(0);
  }
  const targetArg = args.find((arg) => !arg.startsWith("--")) ?? ".";
  try {
    const result = scanProject(targetArg);
    if (args.includes("--json")) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else console.log(`KIN bundled candidate scan: ${result.findingCount} findings across ${result.scannedFiles} files`);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}

export const candidateScanPath = fileURLToPath(import.meta.url);
