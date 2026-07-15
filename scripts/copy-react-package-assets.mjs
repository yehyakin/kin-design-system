import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd().endsWith(path.join("packages", "react"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();
const packageRoot = path.join(root, "packages", "react");
const source = path.join(packageRoot, "src", "styles.css");
const destination = path.join(packageRoot, "dist", "styles.css");

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
console.log(`Copied ${path.relative(root, source)} to ${path.relative(root, destination)}.`);
