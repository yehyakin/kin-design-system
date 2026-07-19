import { compareCodePoints } from "./canonical-content.mjs";

export const THEME_KEYS = Object.freeze([
  "canvas", "sidebar",
  "surface-1", "surface-2", "surface-3", "surface-4",
  "surface-hover", "surface-selected", "surface-overlay",
  "text-primary", "text-secondary", "text-muted", "text-disabled", "text-inverse",
  "icon-primary", "icon-muted",
  "line-subtle", "line-default", "line-strong",
  "accent", "accent-hover", "accent-active", "accent-soft",
  "focus-ring", "monitor", "monitor-soft",
  "positive", "warning", "negative", "critical", "offline",
]);

export const THEME_MODES = Object.freeze([
  { theme: "light", contrast: "normal", filename: "design.md" },
  { theme: "dark", contrast: "normal", filename: "design.dark.md" },
  { theme: "light", contrast: "more", filename: "design.high-contrast.md" },
  { theme: "dark", contrast: "more", filename: "design.dark.high-contrast.md" },
]);

function valueOf(token, name) {
  if (!token || !("$value" in token)) throw new Error(`Missing DTCG token: ${name}`);
  return token.$value;
}

function dimension(value) {
  if (typeof value === "object" && value !== null && "value" in value && "unit" in value) return `${value.value}${value.unit}`;
  return value;
}

export function resolveThemeColors(tokens, theme, contrast) {
  if (!new Set(["light", "dark"]).has(theme)) throw new Error(`Unsupported theme: ${theme}`);
  if (!new Set(["normal", "more"]).has(contrast)) throw new Error(`Unsupported contrast: ${contrast}`);
  const colors = {};
  for (const key of THEME_KEYS) {
    const baseName = `${theme}-${key}`;
    const overrideName = `contrast-${theme}-${key}`;
    const token = contrast === "more" && tokens.color[overrideName] ? tokens.color[overrideName] : tokens.color[baseName];
    const value = valueOf(token, token ? (contrast === "more" && tokens.color[overrideName] ? overrideName : baseName) : baseName);
    if (!value || typeof value !== "object" || typeof value.hex !== "string") throw new Error(`Color token ${baseName} has no hex value`);
    colors[key] = value.hex.toLowerCase();
  }
  return colors;
}

export function resolveSharedTokens(tokens) {
  const typography = {};
  for (const [name, token] of Object.entries(tokens.typography ?? {}).sort(([left], [right]) => compareCodePoints(left, right))) {
    if (name.startsWith("$")) continue;
    const value = valueOf(token, `typography.${name}`);
    typography[name] = {
      font_family: value.fontFamily,
      font_size: dimension(value.fontSize),
      font_weight: value.fontWeight,
      line_height: value.lineHeight,
      letter_spacing: dimension(value.letterSpacing),
    };
  }

  const spacing = {};
  for (const [name, token] of Object.entries(tokens.spacing ?? {}).sort(([left], [right]) => Number(left) - Number(right) || compareCodePoints(left, right))) {
    if (!name.startsWith("$")) spacing[name] = dimension(valueOf(token, `spacing.${name}`));
  }

  const rounded = {};
  for (const [name, token] of Object.entries(tokens.rounded ?? {}).sort(([left], [right]) => compareCodePoints(left, right))) {
    if (!name.startsWith("$")) rounded[name] = dimension(valueOf(token, `rounded.${name}`));
  }

  const motion = {};
  for (const [name, token] of Object.entries(tokens.motion ?? {}).sort(([left], [right]) => compareCodePoints(left, right))) {
    const value = valueOf(token, `motion.${name}`);
    if (token.$type === "duration") motion[name] = dimension(value);
    else if (token.$type === "cubicBezier") motion[name] = `cubic-bezier(${value.join(", ")})`;
    else throw new Error(`Unsupported motion token type for ${name}`);
  }

  return { typography, spacing, rounded, motion };
}
