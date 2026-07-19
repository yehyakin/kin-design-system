import { canonicalizeText, finalizeText } from "./canonical-content.mjs";

const safeKeyPattern = /^[A-Za-z0-9_][A-Za-z0-9_-]*$/;

function scalar(value) {
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return JSON.stringify(value);
  if (typeof value === "string") return JSON.stringify(value);
  throw new TypeError(`Unsupported frontmatter scalar: ${typeof value}`);
}

function emitValue(value, indent, lines) {
  const padding = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) {
      lines.push(`${padding}[]`);
      return;
    }
    for (const item of value) {
      if (item === null || typeof item !== "object") lines.push(`${padding}- ${scalar(item)}`);
      else {
        lines.push(`${padding}-`);
        emitValue(item, indent + 2, lines);
      }
    }
    return;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      lines.push(`${padding}{}`);
      return;
    }
    for (const [key, child] of entries) {
      if (!safeKeyPattern.test(key)) throw new Error(`Unsupported frontmatter key: ${key}`);
      if (child === null || typeof child !== "object") lines.push(`${padding}${key}: ${scalar(child)}`);
      else if (Array.isArray(child) && child.length === 0) lines.push(`${padding}${key}: []`);
      else if (!Array.isArray(child) && Object.keys(child).length === 0) lines.push(`${padding}${key}: {}`);
      else {
        lines.push(`${padding}${key}:`);
        emitValue(child, indent + 2, lines);
      }
    }
    return;
  }

  lines.push(`${padding}${scalar(value)}`);
}

function parseScalar(source, lineNumber) {
  if (source === "null") return null;
  if (source === "true") return true;
  if (source === "false") return false;
  if (source === "[]") return [];
  if (source === "{}") return {};
  if (/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/.test(source)) return Number(source);
  if (source.startsWith('"')) {
    try {
      const value = JSON.parse(source);
      if (typeof value !== "string") throw new Error("not a string");
      return value;
    } catch {
      throw new Error(`Invalid quoted frontmatter scalar at line ${lineNumber}`);
    }
  }
  throw new Error(`Unsupported frontmatter scalar at line ${lineNumber}: ${source}`);
}

function tokenize(source) {
  return source.split("\n").map((line, index) => {
    if (line.includes("\t")) throw new Error(`Tabs are not allowed in frontmatter at line ${index + 1}`);
    if (line.trim() === "") return null;
    const indent = line.length - line.trimStart().length;
    if (indent % 2 !== 0) throw new Error(`Frontmatter indentation must use two-space steps at line ${index + 1}`);
    return { indent, content: line.slice(indent), lineNumber: index + 1 };
  }).filter(Boolean);
}

function parseBlock(tokens, state, indent) {
  const current = tokens[state.index];
  if (!current || current.indent !== indent) throw new Error(`Expected frontmatter content at indentation ${indent}`);
  const isArray = current.content === "-" || current.content.startsWith("- ");
  const result = isArray ? [] : {};

  while (state.index < tokens.length) {
    const token = tokens[state.index];
    if (token.indent < indent) break;
    if (token.indent > indent) throw new Error(`Unexpected frontmatter indentation at line ${token.lineNumber}`);

    if (isArray) {
      if (!(token.content === "-" || token.content.startsWith("- "))) {
        throw new Error(`Mixed frontmatter collection types at line ${token.lineNumber}`);
      }
      if (token.content === "-") {
        state.index += 1;
        const next = tokens[state.index];
        if (!next || next.indent !== indent + 2) throw new Error(`Array item is missing a nested value at line ${token.lineNumber}`);
        result.push(parseBlock(tokens, state, indent + 2));
      } else {
        result.push(parseScalar(token.content.slice(2), token.lineNumber));
        state.index += 1;
      }
      continue;
    }

    if (token.content === "-" || token.content.startsWith("- ")) {
      throw new Error(`Mixed frontmatter collection types at line ${token.lineNumber}`);
    }
    const match = token.content.match(/^([A-Za-z0-9_][A-Za-z0-9_-]*):(.*)$/);
    if (!match) throw new Error(`Invalid frontmatter property at line ${token.lineNumber}`);
    const [, key, remainder] = match;
    if (Object.hasOwn(result, key)) throw new Error(`Duplicate frontmatter key '${key}' at line ${token.lineNumber}`);
    const rest = remainder.trimStart();
    state.index += 1;
    if (rest !== "") result[key] = parseScalar(rest, token.lineNumber);
    else {
      const next = tokens[state.index];
      if (!next || next.indent !== indent + 2) throw new Error(`Frontmatter property '${key}' is missing a nested value`);
      result[key] = parseBlock(tokens, state, indent + 2);
    }
  }

  return result;
}

export function serializeFrontmatter(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new TypeError("Frontmatter root must be an object");
  const lines = [];
  emitValue(data, 0, lines);
  return lines.join("\n");
}

export function extractFrontmatter(source) {
  const text = canonicalizeText(source);
  const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) throw new Error("Markdown does not contain leading YAML frontmatter");
  return { raw: match[1], body: text.slice(match[0].length) };
}

export function parseFrontmatter(source) {
  const { raw } = extractFrontmatter(source);
  const tokens = tokenize(raw);
  if (tokens.length === 0) return {};
  const state = { index: 0 };
  const result = parseBlock(tokens, state, 0);
  if (state.index !== tokens.length) throw new Error(`Unexpected frontmatter content at line ${tokens[state.index].lineNumber}`);
  if (Array.isArray(result)) throw new Error("Frontmatter root must be an object");
  return result;
}

export function createMarkdownWithFrontmatter(data, body) {
  return finalizeText(`---\n${serializeFrontmatter(data)}\n---\n\n${canonicalizeText(body).replace(/^\n+/, "")}`);
}
