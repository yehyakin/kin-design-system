import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { build } from "esbuild";

const root = process.cwd();
const output = path.join(root, ".site-dist");
const sources = [
  ["site", "."],
  ["examples", "examples"],
  ["scenarios", "scenarios"],
  ["tokens", "tokens"],
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const [source, destination] of sources) {
  const from = path.join(root, source);
  const to = path.join(output, destination);
  if (!fs.existsSync(from)) throw new Error(`Site source is missing: ${source}`);
  fs.cpSync(from, to, { recursive: true, force: true });
}

fs.copyFileSync(
  path.join(root, "node_modules", "sonner", "dist", "styles.css"),
  path.join(output, "assets", "sonner.css"),
);

await build({
  entryPoints: [
    path.join(root, "site", "assets", "site.js"),
    path.join(root, "site", "assets", "scenario-lab.js"),
  ],
  outdir: path.join(output, "assets"),
  bundle: true,
  splitting: true,
  format: "esm",
  target: ["es2022"],
  minify: true,
  entryNames: "[name]",
  chunkNames: "chunks/[name]-[hash]",
});

await build({
  entryPoints: [path.join(root, "packages", "react", "src", "styles.css")],
  outfile: path.join(output, "assets", "kin-react.css"),
  bundle: true,
  target: ["es2022"],
  minify: true,
});

fs.rmSync(path.join(output, "assets", "sonner-island.js"), { force: true });

await build({
  entryPoints: [
    path.join(root, "examples", "workspace-reference", "reference.js"),
    path.join(root, "examples", "workspace-reference", "core-components.js"),
    path.join(root, "examples", "workspace-reference", "motion-reference.js"),
    path.join(root, "examples", "workspace-reference", "integration-reference.jsx"),
  ],
  outdir: path.join(output, "examples", "workspace-reference"),
  bundle: true,
  splitting: true,
  format: "esm",
  target: ["es2022"],
  minify: true,
  entryNames: "[name]",
  chunkNames: "chunks/[name]-[hash]",
});

await build({
  entryPoints: [path.join(root, "examples", "shared", "preference-controls.js")],
  outdir: path.join(output, "examples", "shared"),
  bundle: true,
  splitting: true,
  format: "esm",
  target: ["es2022"],
  minify: true,
  entryNames: "[name]",
  chunkNames: "chunks/[name]-[hash]",
});

await build({
  entryPoints: [path.join(root, "examples", "page-patterns", "reference.js")],
  outdir: path.join(output, "examples", "page-patterns"),
  bundle: true,
  splitting: true,
  format: "esm",
  target: ["es2022"],
  minify: true,
  entryNames: "[name]",
  chunkNames: "chunks/[name]-[hash]",
});

console.log(`KIN showcase built: ${path.relative(root, output)}`);
