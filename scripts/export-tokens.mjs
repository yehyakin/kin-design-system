import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { motionToCss, motionToDtcg, parseMotionTokens } from "./motion-tokens.mjs";

const root = process.cwd();
const outputDirectory = path.join(root, "tokens");
const checkOnly = process.argv.includes("--check");
const designMdCli = path.join(root, "node_modules", "@google", "design.md", "dist", "index.js");
const designSource = fs.readFileSync(path.join(root, "DESIGN.md"), "utf8");
const motionTokens = parseMotionTokens(designSource);

const targets = [
  {
    format: "css-tailwind",
    file: "kin.tailwind.css",
    header: [
      "/* Generated from DESIGN.md by scripts/export-tokens.mjs.",
      " * Do not edit directly. Regenerate from the design contract.",
      " */",
      "",
    ].join("\n"),
  },
  {
    format: "dtcg",
    file: "kin.tokens.json",
    header: "",
  },
];

function generate(format) {
  if (!fs.existsSync(designMdCli)) {
    throw new Error("@google/design.md is not installed. Run npm ci before exporting tokens.");
  }
  const result = spawnSync(
    process.execPath,
    [designMdCli, "export", "--format", format, "DESIGN.md"],
    { cwd: root, encoding: "utf8" },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr || `designmd export failed for ${format} with exit code ${result.status}`);
  }
  const generated = result.stdout.replace(/\r\n/g, "\n").trimEnd() + "\n";
  if (format === "css-tailwind") {
    const validFontStacks = generated.replace(
      /(--font-[\w-]+:\s*)"((?:\\.|[^"])*)";/g,
      (_, prefix, value) => `${prefix}${value.replaceAll('\\"', '"').replaceAll("\\\\", "\\")};`,
    );
    return `${validFontStacks.trimEnd()}\n\n${motionToCss(motionTokens)}`;
  }
  if (format === "dtcg") {
    const payload = JSON.parse(generated);
    payload.motion = motionToDtcg(motionTokens);
    return `${JSON.stringify(payload, null, 2)}\n`;
  }
  return generated;
}

fs.mkdirSync(outputDirectory, { recursive: true });
const drift = [];

for (const target of targets) {
  const output = target.header + generate(target.format);
  const destination = path.join(outputDirectory, target.file);

  if (checkOnly) {
    const existing = fs.existsSync(destination)
      ? fs.readFileSync(destination, "utf8").replace(/\r\n/g, "\n")
      : null;
    if (existing !== output) drift.push(path.relative(root, destination).replaceAll(path.sep, "/"));
  } else {
    fs.writeFileSync(destination, output, "utf8");
    console.log(`Generated ${path.relative(root, destination)}`);
  }
}

if (!checkOnly) {
  const figma = spawnSync(process.execPath, [path.join(root, "scripts", "export-figma-variables.mjs")], {
    cwd: root,
    encoding: "utf8",
  });
  if (figma.error) throw figma.error;
  if (figma.status !== 0) throw new Error(figma.stderr || "Figma Variables export failed.");
  process.stdout.write(figma.stdout);
}

if (drift.length > 0) {
  console.error("Generated token files are out of date:");
  for (const file of drift) console.error(`- ${file}`);
  console.error("Run: node scripts/export-tokens.mjs");
  process.exit(1);
}

if (checkOnly) console.log("Generated token files match DESIGN.md.");
