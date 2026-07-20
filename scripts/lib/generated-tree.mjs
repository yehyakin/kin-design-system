import fs from "node:fs";
import path from "node:path";
import { compareCodePoints } from "./canonical-content.mjs";

function walkTree(directory, prefix = "") {
  if (!fs.existsSync(directory)) return { files: [], invalid: [] };
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

export function compareArtifactTree(directory, artifacts) {
  const expected = [...artifacts.keys()].sort();
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

export function listArtifactFiles(directory) {
  return walkTree(directory).files;
}
