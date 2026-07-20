import { execFileSync } from "node:child_process";

export function runGit(root, args, { trim = true } = {}) {
  try {
    const output = execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return trim ? output.trim() : output;
  } catch {
    return null;
  }
}

export function gitCommitExists(root, revision) {
  return runGit(root, ["cat-file", "-e", `${revision}^{commit}`]) !== null;
}

export function readRevisionFile(root, revision, file) {
  return runGit(root, ["show", `${revision}:${file}`], { trim: false });
}

export function exactTagState(root, tagName) {
  const reference = `refs/tags/${tagName}`;
  const exists = runGit(root, ["show-ref", "--verify", "--quiet", reference]) !== null;
  return {
    name: tagName,
    reference,
    exists,
    objectType: exists ? runGit(root, ["cat-file", "-t", reference]) : null,
    commit: exists ? runGit(root, ["rev-parse", "--verify", `${reference}^{commit}`]) : null,
  };
}
