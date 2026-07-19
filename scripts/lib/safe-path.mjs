import fs from "node:fs";
import path from "node:path";

function inside(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

export function normalizeRepositoryPath(file) {
  if (typeof file !== "string" || file.length === 0 || file.includes("\\")) throw new Error(`Path must use repository-relative POSIX syntax: ${file}`);
  const normalized = path.posix.normalize(file);
  if (normalized !== file || path.posix.isAbsolute(normalized) || normalized === ".." || normalized.startsWith("../") || normalized.includes("/../")) {
    throw new Error(`Path must remain repository-relative: ${file}`);
  }
  return normalized;
}

export function resolveExistingPathWithin(root, repositoryPath) {
  const normalized = normalizeRepositoryPath(repositoryPath);
  const realRoot = fs.realpathSync(root);
  const segments = normalized.split("/");
  let current = realRoot;
  for (const segment of segments) {
    current = path.join(current, segment);
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error(`Symbolic links are not allowed in governed paths: ${repositoryPath}`);
  }
  const realTarget = fs.realpathSync(current);
  if (!inside(realRoot, realTarget)) throw new Error(`Path resolves outside its governed root: ${repositoryPath}`);
  return realTarget;
}
