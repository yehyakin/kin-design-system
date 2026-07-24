import fs from "node:fs";
import path from "node:path";
import { compareCodePoints } from "./canonical-content.mjs";

function walkTree(directory, prefix = "") {
  if (!fs.existsSync(directory)) return { files: [], invalid: [] };
  const absolute = path.resolve(directory);
  const stat = fs.lstatSync(absolute);
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    return { files: [], invalid: [`${prefix || "."}: generated tree root must be a real directory`] };
  }
  const files = [];
  const invalid = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => compareCodePoints(left.name, right.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) invalid.push(`${relative}: symbolic links are not allowed in generated trees`);
    else if (entry.isDirectory()) {
      const nested = walkTree(absolute, relative);
      files.push(...nested.files);
      invalid.push(...nested.invalid);
    }
    else if (entry.isFile()) files.push(relative);
    else invalid.push(`${relative}: unsupported filesystem entry in generated tree`);
  }
  return { files, invalid };
}

export function writeArtifactTree(directory, artifacts) {
  fs.mkdirSync(directory, { recursive: true });
  for (const [relative, content] of [...artifacts.entries()].sort(([left], [right]) => compareCodePoints(left, right))) {
    const destination = path.join(directory, ...relative.split("/"));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content);
  }
}

function linkedPathFinding(governedRoot, directory) {
  if (!governedRoot) return null;
  const absoluteRoot = path.resolve(governedRoot);
  const absoluteDirectory = path.resolve(directory);
  const relative = path.relative(absoluteRoot, absoluteDirectory);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    return ".: generated tree must stay within its governed root";
  }
  let current = absoluteRoot;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) return null;
    if (fs.lstatSync(current).isSymbolicLink()) {
      return `${path.relative(absoluteRoot, current).replaceAll(path.sep, "/")}: generated tree path must not traverse a symbolic link`;
    }
  }
  return null;
}

export function compareArtifactTree(directory, artifacts, { governedRoot = null } = {}) {
  const expected = [...artifacts.keys()].sort();
  const linked = linkedPathFinding(governedRoot, directory);
  if (linked) return [linked];
  const { files: actual, invalid } = walkTree(directory);
  const findings = [...invalid];
  for (const file of expected.filter((item) => !actual.includes(item))) findings.push(`${file}: missing generated artifact`);
  for (const file of actual.filter((item) => !expected.includes(item))) findings.push(`${file}: unexpected generated artifact`);
  for (const file of expected.filter((item) => actual.includes(item))) {
    const actualBytes = fs.readFileSync(path.join(directory, ...file.split("/")));
    const expectedBytes = Buffer.isBuffer(artifacts.get(file)) ? artifacts.get(file) : Buffer.from(artifacts.get(file), "utf8");
    if (!actualBytes.equals(expectedBytes)) findings.push(`${file}: generated artifact differs`);
  }
  return findings;
}

export function replaceDirectorySafely(target, temporary) {
  const parent = path.dirname(target);
  const backup = path.join(parent, `${path.basename(target)}.backup-${process.pid}-${Date.now()}`);
  let movedTarget = false;
  try {
    if (fs.existsSync(target)) {
      fs.renameSync(target, backup);
      movedTarget = true;
    }
    fs.renameSync(temporary, target);
    if (movedTarget) fs.rmSync(backup, { recursive: true, force: true });
  } catch (error) {
    let recovery = "not required";
    try {
      if (!fs.existsSync(target) && movedTarget && fs.existsSync(backup)) {
        fs.renameSync(backup, target);
        recovery = "restored previous directory";
      } else if (movedTarget) recovery = "manual review required";
    } catch (restoreError) {
      recovery = `restore failed: ${restoreError.message}`;
    }
    throw new Error(`Failed to replace ${target}: ${error.message}; recovery: ${recovery}`);
  }
}

export function listArtifactFiles(directory, { governedRoot = null } = {}) {
  const linked = linkedPathFinding(governedRoot, directory);
  if (linked) throw new Error(linked);
  const result = walkTree(directory);
  if (result.invalid.length > 0) throw new Error(result.invalid.join("; "));
  return result.files;
}
