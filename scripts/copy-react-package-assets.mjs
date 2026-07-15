import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd().endsWith(path.join("packages", "react"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();
const packageRoot = path.join(root, "packages", "react");
const sourceRoot = path.join(packageRoot, "src");
const destinationRoot = path.join(packageRoot, "dist");
const assets = ["styles.css", "styles"];

for (const asset of assets) {
  const source = path.join(sourceRoot, asset);
  const destination = path.join(destinationRoot, asset);
  fs.cpSync(source, destination, { recursive: true });
  console.log(`Copied ${path.relative(root, source)} to ${path.relative(root, destination)}.`);
}
