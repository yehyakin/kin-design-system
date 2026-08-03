const hexPattern = /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i;

export const MATERIAL_ROLES = Object.freeze([
  "edge-highlight",
  "edge-highlight-strong",
  "edge-contact",
  "shadow-contact",
  "shadow-raised",
  "shadow-floating",
]);

export const MATERIAL_TOKEN_NAMES = Object.freeze([
  ...["dark", "light"].flatMap((theme) => MATERIAL_ROLES.map((role) => `${theme}-${role}`)),
  ...MATERIAL_ROLES.map((role) => `contrast-${role}`),
]);

function unquote(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function tokenValue(token, name) {
  if (!token || !("$value" in token)) throw new Error(`Missing material token: ${name}`);
  return token.$value;
}

function colorValue(value, name) {
  if (!hexPattern.test(value)) throw new Error(`Material edge token ${name} must be a 6- or 8-digit hex color: ${value}`);
  const hex = value.toLowerCase();
  const body = hex.slice(1);
  const components = [0, 2, 4].map((index) => Number((Number.parseInt(body.slice(index, index + 2), 16) / 255).toFixed(3)));
  return { colorSpace: "srgb", components, hex };
}

export function parseMaterialTokens(source) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const block = frontmatter.match(/^material:\s*\r?\n((?: {2}[^\r\n]+(?:\r?\n|$))+)/m)?.[1] ?? "";
  const tokens = {};

  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^ {2}([a-z][\w-]*):\s*(.+)$/);
    if (match) tokens[match[1]] = unquote(match[2]);
  }

  return tokens;
}

export function validateMaterialTokens(tokens) {
  const findings = [];
  const actual = Object.keys(tokens).sort();
  const expected = [...MATERIAL_TOKEN_NAMES].sort();
  for (const name of expected) {
    if (!(name in tokens)) findings.push(`missing ${name}`);
  }
  for (const name of actual) {
    if (!MATERIAL_TOKEN_NAMES.includes(name)) findings.push(`unsupported ${name}`);
  }
  for (const [name, value] of Object.entries(tokens)) {
    const role = name.replace(/^(?:dark|light|contrast)-/, "");
    if (role.startsWith("edge-") && !hexPattern.test(value)) findings.push(`${name} must be a 6- or 8-digit hex color`);
    if (role.startsWith("shadow-") && value !== "none" && !/\brgba?\(/i.test(value)) {
      findings.push(`${name} must be none or a CSS shadow using rgb()/rgba()`);
    }
  }
  return findings;
}

export function materialToCss(tokens) {
  const findings = validateMaterialTokens(tokens);
  if (findings.length > 0) throw new Error(`Invalid material Tokens:\n- ${findings.join("\n- ")}`);

  const root = MATERIAL_TOKEN_NAMES.map((name) => `  --material-${name}: ${tokens[name]};`);
  const themeBlock = (selector, prefix) => [
    `${selector} {`,
    ...MATERIAL_ROLES.map((role) => `  --${role}: var(--material-${prefix}-${role});`),
    "}",
  ].join("\n");

  return `${[
    `:root {\n${root.join("\n")}\n}`,
    themeBlock('[data-theme="dark"]', "dark"),
    themeBlock('[data-theme="light"]', "light"),
    themeBlock('[data-contrast="more"]', "contrast"),
    "@media (forced-colors: active) {",
    "  :root {",
    "    --edge-highlight: transparent;",
    "    --edge-highlight-strong: transparent;",
    "    --edge-contact: transparent;",
    "    --shadow-contact: none;",
    "    --shadow-raised: none;",
    "    --shadow-floating: none;",
    "  }",
    "}",
  ].join("\n\n").trimEnd()}\n`;
}

export function materialToDtcg(tokens) {
  const findings = validateMaterialTokens(tokens);
  if (findings.length > 0) throw new Error(`Invalid material Tokens:\n- ${findings.join("\n- ")}`);
  return Object.fromEntries(MATERIAL_TOKEN_NAMES.map((name) => {
    const value = tokens[name];
    const role = name.replace(/^(?:dark|light|contrast)-/, "");
    return [name, role.startsWith("edge-")
      ? { $type: "color", $value: colorValue(value, name) }
      : { $type: "string", $value: value }];
  }));
}

export function resolveThemeMaterial(tokens, theme, contrast) {
  if (!new Set(["light", "dark"]).has(theme)) throw new Error(`Unsupported theme: ${theme}`);
  if (!new Set(["normal", "more"]).has(contrast)) throw new Error(`Unsupported contrast: ${contrast}`);
  const group = tokens.material ?? {};
  return Object.fromEntries(MATERIAL_ROLES.map((role) => {
    const name = contrast === "more" ? `contrast-${role}` : `${theme}-${role}`;
    const value = tokenValue(group[name], `material.${name}`);
    return [role, typeof value === "object" && value !== null && typeof value.hex === "string" ? value.hex.toLowerCase() : value];
  }));
}
