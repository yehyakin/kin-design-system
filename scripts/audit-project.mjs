import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const help = args.includes("--help") || args.includes("-h");
const targetArg = args.find((arg) => !arg.startsWith("--")) ?? ".";
const target = path.resolve(targetArg);
const configPath = path.join(target, "kin.config.json");
const defaultExcluded = [
  ".git", "**/.git", ".site-dist", "**/.site-dist", "node_modules", "**/node_modules", "dist", "**/dist", "build", "**/build",
  "out", "**/out", "coverage", "**/coverage", "test-results", "**/test-results", "playwright-report", "**/playwright-report",
  ".next", "**/.next", "tests", "**/tests", "__tests__", "**/__tests__", "fixtures", "**/fixtures",
];
const extensions = new Set([".css", ".scss", ".sass", ".less", ".html", ".htm", ".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte"]);

if (help) {
  console.log("Usage: node scripts/audit-project.mjs [project-directory] [--json]");
  console.log("Reports static review candidates. It never edits the target project.");
  process.exit(0);
}

if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
  console.error(`Audit target must be an existing directory: ${target}`);
  process.exit(2);
}

const rules = [
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

function readConfig() {
  if (!fs.existsSync(configPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    console.error(`Cannot parse ${configPath}: ${error.message}`);
    process.exit(2);
  }
}

function wildcardMatch(value, pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replaceAll("**", "§§").replaceAll("*", "[^/]*").replaceAll("§§", ".*");
  return new RegExp(`^${escaped}$`).test(value);
}

function walk(directory, excluded, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(target, absolute).replaceAll(path.sep, "/");
    if (excluded.some((pattern) => wildcardMatch(relative, pattern) || relative === pattern || relative.startsWith(`${pattern}/`))) continue;
    if (entry.isDirectory()) walk(absolute, excluded, files);
    else if (extensions.has(path.extname(entry.name).toLowerCase())) files.push(absolute);
  }
  return files;
}

function isIncluded(relative, include) {
  if (!include || include.length === 0) return true;
  return include.some((pattern) => wildcardMatch(relative, pattern) || relative === pattern || relative.startsWith(`${pattern}/`));
}

function locationFor(source, index) {
  const before = source.slice(0, index);
  const line = before.split("\n").length;
  const lastBreak = before.lastIndexOf("\n");
  return { line, column: index - lastBreak };
}

const config = readConfig();
const auditConfig = config.audit ?? {};
if (auditConfig.include !== undefined && !Array.isArray(auditConfig.include)) {
  console.error("kin.config.json audit.include must be an array.");
  process.exit(2);
}
if (auditConfig.exclude !== undefined && !Array.isArray(auditConfig.exclude)) {
  console.error("kin.config.json audit.exclude must be an array.");
  process.exit(2);
}
if (auditConfig.exceptions !== undefined && !Array.isArray(auditConfig.exceptions)) {
  console.error("kin.config.json audit.exceptions must be an array.");
  process.exit(2);
}
const excluded = [...defaultExcluded, ...(auditConfig.exclude ?? [])];
const exceptions = auditConfig.exceptions ?? [];
const findings = [];
const scannedFiles = walk(target, excluded).filter((file) => isIncluded(path.relative(target, file).replaceAll(path.sep, "/"), auditConfig.include));
const positiveSignals = new Set();
const reportedLocations = new Set();

for (const file of scannedFiles) {
  const relative = path.relative(target, file).replaceAll(path.sep, "/");
  const source = fs.readFileSync(file, "utf8");
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
      const exception = exceptions.find((item) => item.rule === rule.id && typeof item.reason === "string" && item.reason.trim().length >= 12 && wildcardMatch(relative, item.path));
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

const severityWeight = { P1: 4, P2: 2, P3: 1 };
const dimensions = ["accessibility", "motion", "visual-restraint", "token-use", "content"];
const scores = Object.fromEntries(dimensions.map((dimension) => {
  const deductions = findings.filter((finding) => finding.dimension === dimension).reduce((sum, finding) => sum + severityWeight[finding.severity], 0);
  return [dimension, Math.max(0, 4 - Math.min(4, deductions))];
}));
const result = {
  kind: "candidate-static-audit",
  target,
  scannedFiles: scannedFiles.length,
  findingCount: findings.length,
  severity: Object.fromEntries(["P1", "P2", "P3"].map((severity) => [severity, findings.filter((finding) => finding.severity === severity).length])),
  scores,
  score: Object.values(scores).reduce((sum, value) => sum + value, 0),
  scoreMaximum: dimensions.length * 4,
  findings,
  positiveSignals: [...positiveSignals],
  notice: "Regex findings are review candidates, not design facts. Confirm rendered behavior, context, and documented exceptions before changing code.",
};

if (jsonOutput) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  console.log(`KIN candidate audit: ${result.findingCount} findings across ${result.scannedFiles} files`);
  console.log(`P1 ${result.severity.P1} · P2 ${result.severity.P2} · P3 ${result.severity.P3} · preliminary score ${result.score}/${result.scoreMaximum}`);
  for (const finding of findings) {
    console.log(`${finding.severity} ${finding.file}:${finding.line}:${finding.column} ${finding.rule}`);
    console.log(`   ${finding.message}`);
  }
  if (result.positiveSignals.length > 0) {
    console.log("\nPositive signals");
    for (const signal of result.positiveSignals) console.log(`- ${signal}`);
  }
  console.log(`\n${result.notice}`);
}

process.exitCode = findings.some((finding) => finding.severity === "P1") ? 1 : 0;
