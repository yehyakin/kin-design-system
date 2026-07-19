import { canonicalizeText, sha256CanonicalText } from "./lib/canonical-content.mjs";

export function canonicalizeContract(source) {
  return canonicalizeText(source);
}

export function contractChecksum(source) {
  return sha256CanonicalText(source);
}
