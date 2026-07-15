import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd().endsWith(path.join("packages", "react"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();
const output = path.join(root, "packages", "react", "dist");

fs.rmSync(output, { recursive: true, force: true });
console.log(`Removed ${path.relative(root, output)}.`);
