import { createHash } from "node:crypto";

export function canonicalizeText(source) {
  const text = Buffer.isBuffer(source) ? source.toString("utf8") : String(source);
  return text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

export function finalizeText(source) {
  const text = canonicalizeText(source);
  return text.endsWith("\n") ? text : `${text}\n`;
}

export function sha256ExactBytes(source) {
  return createHash("sha256").update(source).digest("hex");
}

export function sha256CanonicalText(source) {
  return sha256ExactBytes(Buffer.from(canonicalizeText(source), "utf8"));
}

export function compactJson(value) {
  return JSON.stringify(value);
}

export function prettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function compareCodePoints(left, right) {
  return left === right ? 0 : left < right ? -1 : 1;
}
