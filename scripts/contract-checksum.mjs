import { createHash } from "node:crypto";

export function canonicalizeContract(source) {
  const text = Buffer.isBuffer(source) ? source.toString("utf8") : String(source);
  return text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

export function contractChecksum(source) {
  return createHash("sha256").update(canonicalizeContract(source), "utf8").digest("hex");
}
