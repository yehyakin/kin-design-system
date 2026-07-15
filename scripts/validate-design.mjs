import fs from "node:fs";
import process from "node:process";
import { parseCubicBezier, parseDuration, parseMotionTokens } from "./motion-tokens.mjs";

const file = process.argv.slice(2).find((argument) => !argument.startsWith("--")) ?? "DESIGN.md";
const asJson = process.argv.includes("--json");
const source = fs.readFileSync(file, "utf8");
const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
const findings = [];

function add(severity, rule, message) {
  findings.push({ severity, rule, message });
}

if (!match) {
  add("error", "frontmatter", "DESIGN.md must start with YAML frontmatter");
} else {
  const frontmatter = match[1];
  const lines = frontmatter.split(/\r?\n/);
  const top = new Map();
  const groups = new Map();
  const componentProperties = new Map();
  let group = null;
  let item = null;

  for (const line of lines) {
    const topMatch = line.match(/^([a-zA-Z][\w-]*):(?:\s+(.*))?$/);
    if (topMatch) {
      group = topMatch[1];
      item = null;
      top.set(group, (topMatch[2] ?? "").trim());
      if (!groups.has(group)) groups.set(group, new Map());
      continue;
    }

    const itemMatch = line.match(/^  ([\w-]+):(?:\s+(.+))?$/);
    if (group && itemMatch) {
      item = itemMatch[1];
      groups.get(group).set(item, (itemMatch[2] ?? "<group>").trim());
      continue;
    }

    const propertyMatch = line.match(/^    ([\w-]+):\s+(.+)$/);
    if (group === "components" && item && propertyMatch) {
      if (!componentProperties.has(item)) componentProperties.set(item, new Map());
      componentProperties.get(item).set(propertyMatch[1], propertyMatch[2].trim());
    }
  }

  if (top.get("version") !== "alpha") {
    add("error", "format-version", "frontmatter version must be alpha for DESIGN.md format compatibility");
  }
  if (!/^\d+\.\d+\.\d+$/.test(top.get("kin_version") ?? "")) {
    add("error", "kin-version", "kin_version must be a semantic version");
  }
  if (!new Set(["development", "released"]).has(top.get("release_status"))) {
    add("error", "release-status", "release_status must be development or released");
  }
  if (!/^\d+\.\d+\.\d+$/.test(top.get("latest_stable") ?? "")) {
    add("error", "latest-stable", "latest_stable must be a semantic version");
  }

  const requiredGroups = ["colors", "typography", "rounded", "spacing", "motion", "components"];
  for (const required of requiredGroups) {
    if (!top.has(required)) add("error", "token-group", `missing token group: ${required}`);
  }

  const minimums = { colors: 30, typography: 9, rounded: 5, spacing: 8, motion: 10 };
  for (const [name, minimum] of Object.entries(minimums)) {
    const count = groups.get(name)?.size ?? 0;
    if (count < minimum) add("error", "token-coverage", `${name} has ${count} top-level tokens; expected at least ${minimum}`);
  }

  const supportedProducts = match[1]
    .match(/^supported_products:\s*\r?\n((?: {2}- [^\r\n]+(?:\r?\n|$))+)/m)?.[1]
    ?.split(/\r?\n/)
    .map((line) => line.match(/^ {2}- (.+)$/)?.[1])
    .filter(Boolean) ?? [];
  const canonicalProfiles = ["information-site", "intelligence-workspace", "ecommerce-operations", "engineering-canvas"];
  if (supportedProducts.join("|") !== canonicalProfiles.join("|")) {
    add("error", "product-profiles", `supported_products must use the canonical profiles in this order: ${canonicalProfiles.join(", ")}`);
  }

  const typography = groups.get("typography") ?? new Map();
  if (!typography.has("micro")) add("error", "typography-micro", "typography.micro is required by the normative type scale");
  for (const name of ["display", "page-title", "entity-title", "section-title", "body", "ui", "metadata", "micro"]) {
    const family = source.match(new RegExp(`^  ${name}:\\r?\\n(?:    [^\\r\\n]+\\r?\\n)*?    fontFamily:\\s+([^\\r\\n]+)`, "m"))?.[1] ?? "";
    for (const requiredFamily of ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei"]) {
      if (!family.includes(requiredFamily)) add("error", "typography-cjk", `typography.${name} must include ${requiredFamily}`);
    }
  }

  const motion = parseMotionTokens(source);
  const expectedDurations = ["duration-instant", "duration-press", "duration-fast", "duration-normal", "duration-panel", "duration-drawer", "duration-number"];
  const expectedEasings = ["ease-standard", "ease-enter", "ease-exit"];
  for (const name of expectedDurations) {
    if (!parseDuration(motion[name])) add("error", "motion-duration", `${name} must be a duration in ms or s`);
  }
  for (const name of expectedEasings) {
    if (!parseCubicBezier(motion[name])) add("error", "motion-easing", `${name} must be a four-point cubic-bezier()`);
  }
  for (const [name, value] of Object.entries(motion)) {
    const cssValue = source.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
    if (!cssValue || cssValue !== value) add("error", "motion-parity", `motion.${name} differs from the normative CSS --${name}`);
  }

  const knownPaths = new Set();
  for (const [groupName, values] of groups) {
    for (const tokenName of values.keys()) knownPaths.add(`${groupName}.${tokenName}`);
  }
  for (const reference of frontmatter.matchAll(/\{([\w.-]+)\}/g)) {
    if (!knownPaths.has(reference[1])) add("error", "token-reference", `unknown token reference: {${reference[1]}}`);
  }

  const colors = groups.get("colors") ?? new Map();
  const themeSelectors = {
    dark: '[data-theme="dark"]',
    light: '[data-theme="light"]',
    "contrast-dark": '[data-theme="dark"][data-contrast="more"]',
    "contrast-light": '[data-theme="light"][data-contrast="more"]',
  };
  const themeBlocks = Object.fromEntries(
    Object.entries(themeSelectors).map(([theme, selector]) => {
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const block = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, "m"))?.[1] ?? "";
      const values = new Map();
      for (const token of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) values.set(token[1], token[2].trim());
      return [theme, values];
    }),
  );

  function normalize(value) {
    return value.replace(/^['"]|['"]$/g, "").replace(/\s+/g, "").toLowerCase();
  }

  const parityNames = [
    "canvas", "sidebar", "surface-1", "surface-2", "surface-3", "surface-4",
    "surface-hover", "surface-selected", "surface-overlay",
    "text-primary", "text-secondary", "text-muted", "text-disabled", "text-inverse",
    "icon-primary", "icon-muted",
    "line-subtle", "line-default", "line-strong", "accent", "accent-hover",
    "accent-active", "accent-soft", "focus-ring", "monitor", "monitor-soft", "positive", "warning", "negative",
    "critical", "offline",
  ];

  for (const theme of ["dark", "light"]) {
    for (const name of parityNames) {
      const frontmatterName = `${theme}-${name}`;
      const cssName = name === "sidebar" ? "surface-sidebar" : name;
      const yamlValue = colors.get(frontmatterName);
      const cssValue = themeBlocks[theme].get(cssName);
      if (!yamlValue || !cssValue) {
        add("error", "theme-parity", `missing ${frontmatterName} or --${cssName}`);
      } else if (normalize(yamlValue) !== normalize(cssValue)) {
        add("error", "theme-parity", `${frontmatterName} differs from ${theme} --${cssName}`);
      }
    }
  }

  const contrastNames = ["canvas", "surface-1", "text-primary", "text-secondary", "line-default", "focus-ring"];
  for (const theme of ["contrast-dark", "contrast-light"]) {
    for (const name of contrastNames) {
      const yamlValue = colors.get(`${theme}-${name}`);
      const cssValue = themeBlocks[theme].get(name);
      if (!yamlValue || !cssValue) {
        add("error", "contrast-theme-parity", `missing ${theme}-${name} or high-contrast --${name}`);
      } else if (normalize(yamlValue) !== normalize(cssValue)) {
        add("error", "contrast-theme-parity", `${theme}-${name} differs from high-contrast --${name}`);
      }
    }
  }

  function hexToRgb(value) {
    const hex = normalize(value).replace("#", "");
    if (!/^[0-9a-f]{6}$/.test(hex)) return null;
    return [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  }

  function luminance(value) {
    const rgb = hexToRgb(value);
    if (!rgb) return null;
    const linear = rgb.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  function contrast(foreground, background) {
    const a = luminance(foreground);
    const b = luminance(background);
    if (a === null || b === null) return null;
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  function resolve(value) {
    const reference = value?.match(/^"?\{colors\.([\w-]+)\}"?$/)?.[1];
    return reference ? colors.get(reference) : value;
  }

  for (const theme of ["dark", "light"]) {
    for (const text of ["text-primary", "text-secondary", "text-muted"]) {
      for (const surface of ["canvas", "surface-1"]) {
        const ratio = contrast(colors.get(`${theme}-${text}`), colors.get(`${theme}-${surface}`));
        if (ratio !== null && ratio < 4.5) {
          add("error", "contrast", `${theme}-${text} on ${theme}-${surface} is ${ratio.toFixed(2)}:1; expected 4.5:1`);
        }
      }
    }
  }


  for (const [component, properties] of componentProperties) {
    const text = resolve(properties.get("textColor"));
    const background = resolve(properties.get("backgroundColor"));
    if (!text || !background) continue;
    const ratio = contrast(text, background);
    if (ratio !== null && ratio < 4.5) {
      add("error", "component-contrast", `${component} text/background contrast is ${ratio.toFixed(2)}:1; expected 4.5:1`);
    }
  }
}

const summary = {
  errors: findings.filter((finding) => finding.severity === "error").length,
  warnings: findings.filter((finding) => finding.severity === "warning").length,
};

if (asJson) {
  console.log(JSON.stringify({ file, findings, summary }, null, 2));
} else if (findings.length === 0) {
  console.log(`Design validation passed: ${file}`);
} else {
  console.error(`Design validation failed: ${file}`);
  for (const finding of findings) console.error(`- ${finding.severity} [${finding.rule}] ${finding.message}`);
}

process.exit(summary.errors > 0 ? 1 : 0);
