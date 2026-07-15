const durationPattern = /^(-?\d+(?:\.\d+)?)(ms|s)$/;
const cubicBezierPattern = /^cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)$/;

function unquote(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseMotionTokens(source) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const block = frontmatter.match(/^motion:\s*\r?\n((?: {2}[^\r\n]+(?:\r?\n|$))+)/m)?.[1] ?? "";
  const tokens = {};

  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^ {2}([a-z][\w-]*):\s*(.+)$/);
    if (match) tokens[match[1]] = unquote(match[2]);
  }

  return tokens;
}

export function parseDuration(value) {
  const match = value?.match(durationPattern);
  if (!match) return null;
  return { value: Number(match[1]), unit: match[2] };
}

export function parseCubicBezier(value) {
  const match = value?.match(cubicBezierPattern);
  if (!match) return null;
  return match.slice(1).map(Number);
}

export function motionToCss(tokens) {
  const lines = Object.entries(tokens).map(([name, value]) => `  --${name}: ${value};`);
  return lines.length > 0 ? `:root {\n${lines.join("\n")}\n}\n` : "";
}

export function motionToDtcg(tokens) {
  const group = {};
  for (const [name, value] of Object.entries(tokens)) {
    if (name.startsWith("duration-")) {
      const duration = parseDuration(value);
      if (!duration) throw new Error(`Invalid motion duration token ${name}: ${value}`);
      group[name] = { $type: "duration", $value: duration };
      continue;
    }

    if (name.startsWith("ease-")) {
      const easing = parseCubicBezier(value);
      if (!easing) throw new Error(`Invalid motion easing token ${name}: ${value}`);
      group[name] = { $type: "cubicBezier", $value: easing };
      continue;
    }

    throw new Error(`Unsupported motion token ${name}`);
  }
  return group;
}
