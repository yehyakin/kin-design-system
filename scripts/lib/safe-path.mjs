import fs from "node:fs";
import path from "node:path";

function inside(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function lstatIfPresent(target) {
  try {
    return fs.lstatSync(target);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
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
  if (!fs.statSync(realTarget).isFile()) throw new Error(`Governed path must resolve to a regular file: ${repositoryPath}`);
  return realTarget;
}

export function resolveOutputFileWithin(root, repositoryPath, { createParents = false } = {}) {
  const normalized = normalizeRepositoryPath(repositoryPath);
  const realRoot = fs.realpathSync(root);
  const segments = normalized.split("/");
  const fileName = segments.pop();
  let current = realRoot;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const candidate = path.join(current, segment);
    let stat = lstatIfPresent(candidate);
    if (!stat) {
      if (!createParents) return path.join(current, ...segments.slice(index), fileName);
      fs.mkdirSync(candidate);
      stat = fs.lstatSync(candidate);
    }
    if (stat.isSymbolicLink()) throw new Error(`Symbolic links are not allowed in governed output paths: ${repositoryPath}`);
    if (!stat.isDirectory()) throw new Error(`Governed output parent must be a directory: ${repositoryPath}`);
    current = fs.realpathSync(candidate);
    if (!inside(realRoot, current)) throw new Error(`Output path resolves outside its governed root: ${repositoryPath}`);
  }

  const target = path.join(current, fileName);
  const targetStat = lstatIfPresent(target);
  if (targetStat) {
    if (targetStat.isSymbolicLink()) throw new Error(`Symbolic links are not allowed in governed output paths: ${repositoryPath}`);
    if (!targetStat.isFile()) throw new Error(`Governed output path must be a regular file: ${repositoryPath}`);
  }
  if (!inside(realRoot, target)) throw new Error(`Output path resolves outside its governed root: ${repositoryPath}`);
  return target;
}

export function writeFileSafelyWithin(root, repositoryPath, content) {
  const target = resolveOutputFileWithin(root, repositoryPath, { createParents: true });
  const parent = path.dirname(target);
  const temporaryDirectory = fs.mkdtempSync(path.join(parent, `.${path.basename(target)}.tmp-${process.pid}-`));
  const temporary = path.join(temporaryDirectory, "candidate");
  const backup = path.join(temporaryDirectory, "previous");
  let movedTarget = false;
  let preserveTemporaryDirectory = false;

  try {
    fs.writeFileSync(temporary, content, { encoding: "utf8", flag: "wx" });
    const targetStat = lstatIfPresent(target);
    if (targetStat) {
      if (targetStat.isSymbolicLink()) throw new Error(`Symbolic links are not allowed in governed output paths: ${repositoryPath}`);
      if (!targetStat.isFile()) throw new Error(`Governed output path must be a regular file: ${repositoryPath}`);
      fs.renameSync(target, backup);
      movedTarget = true;
    }
    fs.renameSync(temporary, target);
    if (movedTarget) fs.rmSync(backup, { force: true });
  } catch (error) {
    let recovery = "not required";
    try {
      if (!fs.existsSync(target) && movedTarget && fs.existsSync(backup)) {
        fs.renameSync(backup, target);
        recovery = "restored previous file";
      } else if (movedTarget && fs.existsSync(backup)) {
        preserveTemporaryDirectory = true;
        recovery = `manual review required; previous file preserved at ${backup}`;
      } else if (movedTarget) recovery = "manual review required";
    } catch (restoreError) {
      recovery = `restore failed: ${restoreError.message}`;
    }
    throw new Error(`Failed to replace ${repositoryPath}: ${error.message}; recovery: ${recovery}`);
  } finally {
    if (!preserveTemporaryDirectory && fs.existsSync(temporaryDirectory)) fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }

  return target;
}
