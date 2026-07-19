import fs from "node:fs";
import { compactJson, compareCodePoints, sha256CanonicalText } from "./canonical-content.mjs";
import { normalizeRepositoryPath, resolveExistingPathWithin } from "./safe-path.mjs";

export class InputRegistry {
  #root;
  #entries = new Map();
  #sources = new Map();

  constructor(root) {
    this.#root = root;
  }

  readText(file, role) {
    const repositoryPath = normalizeRepositoryPath(file);
    const existing = this.#entries.get(repositoryPath);
    if (existing && existing.role !== role) throw new Error(`Input ${repositoryPath} was read with conflicting roles`);
    if (this.#sources.has(repositoryPath)) return this.#sources.get(repositoryPath);
    const absolute = resolveExistingPathWithin(this.#root, repositoryPath);
    const source = fs.readFileSync(absolute, "utf8");
    this.#entries.set(repositoryPath, { path: repositoryPath, role, sha256: sha256CanonicalText(source) });
    this.#sources.set(repositoryPath, source);
    return source;
  }

  readJson(file, role) {
    return JSON.parse(this.readText(file, role));
  }

  entries() {
    return [...this.#entries.values()].sort((left, right) => compareCodePoints(left.path, right.path));
  }

  checksum() {
    const files = this.entries().map(({ path: file, role, sha256 }) => ({ path: file, role, sha256 }));
    return sha256CanonicalText(compactJson({ files }));
  }
}

export function checksumInputEntries(entries) {
  const files = [...entries]
    .map(({ path: file, role, sha256 }) => ({ path: normalizeRepositoryPath(file), role, sha256 }))
    .sort((left, right) => compareCodePoints(left.path, right.path));
  return sha256CanonicalText(compactJson({ files }));
}
