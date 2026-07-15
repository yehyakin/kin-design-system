import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const source = path.join(root, "tokens", "kin.tokens.json");
const destination = path.join(root, "tokens", "kin.figma.variables.json");
const checkOnly = process.argv.includes("--check");

function colorFromHex(hex) {
  const normalized = hex.replace("#", "");
  if (![6, 8].includes(normalized.length)) throw new Error(`Unsupported color value: ${hex}`);
  const value = Number.parseInt(normalized, 16);
  if (normalized.length === 6) {
    return {
      r: ((value >> 16) & 255) / 255,
      g: ((value >> 8) & 255) / 255,
      b: (value & 255) / 255,
      a: 1,
    };
  }
  return {
    r: ((value >> 24) & 255) / 255,
    g: ((value >> 16) & 255) / 255,
    b: ((value >> 8) & 255) / 255,
    a: (value & 255) / 255,
  };
}

function tokenValue(token) {
  if (!token || !("$value" in token)) throw new Error("Expected a DTCG token value.");
  return token.$value;
}

function numberValue(token) {
  const value = tokenValue(token);
  return typeof value === "object" && value !== null && "value" in value ? value.value : value;
}

function tempId(...parts) {
  return `kin_${parts.join("_").replaceAll(/[^a-zA-Z0-9_]/g, "_")}`;
}

function createCollection(payload, id, name, modeNames) {
  const modeIds = modeNames.map((name) => tempId(id, "mode", name.toLowerCase().replaceAll(" ", "_")));
  payload.variableCollections.push({
    action: "CREATE",
    id,
    name,
    initialModeId: modeIds[0],
    hiddenFromPublishing: false,
  });
  payload.variableModes.push({
    action: "UPDATE",
    id: modeIds[0],
    name: modeNames[0],
    variableCollectionId: id,
  });
  for (let index = 1; index < modeNames.length; index += 1) {
    payload.variableModes.push({
      action: "CREATE",
      id: modeIds[index],
      name: modeNames[index],
      variableCollectionId: id,
    });
  }
  return modeIds;
}

function createVariable(payload, collectionId, name, resolvedType, valuesByMode, options = {}) {
  const id = tempId(collectionId, "variable", name.toLowerCase().replaceAll("/", "_"));
  payload.variables.push({
    action: "CREATE",
    id,
    name,
    resolvedType,
    variableCollectionId: collectionId,
    description: options.description ?? "",
    hiddenFromPublishing: false,
    ...(options.scopes ? { scopes: options.scopes } : {}),
    ...(options.codeSyntax ? { codeSyntax: options.codeSyntax } : {}),
  });
  for (const [modeId, value] of valuesByMode) {
    payload.variableModeValues.push({ variableId: id, modeId, value });
  }
}

function generate() {
  const tokens = JSON.parse(fs.readFileSync(source, "utf8"));
  const payload = {
    variableCollections: [],
    variableModes: [],
    variables: [],
    variableModeValues: [],
  };

  const colorCollection = tempId("color", "collection");
  const colorModeNames = ["Light", "Dark", "Light High Contrast", "Dark High Contrast"];
  const colorModeIds = createCollection(payload, colorCollection, "KIN Color", colorModeNames);
  const themedNames = new Set();
  for (const name of Object.keys(tokens.color)) {
    const match = name.match(/^(?:contrast-)?(?:light|dark)-(.+)$/);
    if (match) themedNames.add(match[1]);
  }

  for (const name of [...themedNames].sort()) {
    const light = tokens.color[`light-${name}`];
    const dark = tokens.color[`dark-${name}`];
    if (!light || !dark) continue;
    const lightContrast = tokens.color[`contrast-light-${name}`] ?? light;
    const darkContrast = tokens.color[`contrast-dark-${name}`] ?? dark;
    createVariable(
      payload,
      colorCollection,
      `Color/${name.replaceAll("-", " ")}`,
      "COLOR",
      [
        [colorModeIds[0], colorFromHex(tokenValue(light).hex)],
        [colorModeIds[1], colorFromHex(tokenValue(dark).hex)],
        [colorModeIds[2], colorFromHex(tokenValue(lightContrast).hex)],
        [colorModeIds[3], colorFromHex(tokenValue(darkContrast).hex)],
      ],
      {
        scopes: ["ALL_SCOPES"],
        codeSyntax: { WEB: `--${name}` },
        description: "Semantic KIN color. Values change by theme and contrast mode.",
      },
    );
  }

  const scaleCollection = tempId("scale", "collection");
  const [scaleModeId] = createCollection(payload, scaleCollection, "KIN Scale", ["Default"]);
  for (const [name, token] of Object.entries(tokens.spacing)) {
    if (name.startsWith("$")) continue;
    createVariable(payload, scaleCollection, `Spacing/${name}`, "FLOAT", [[scaleModeId, numberValue(token)]], {
      scopes: ["GAP", "WIDTH_HEIGHT"],
      codeSyntax: { WEB: `--space-${name}` },
    });
  }
  for (const [name, token] of Object.entries(tokens.rounded)) {
    if (name.startsWith("$")) continue;
    createVariable(payload, scaleCollection, `Radius/${name}`, "FLOAT", [[scaleModeId, numberValue(token)]], {
      scopes: ["CORNER_RADIUS"],
      codeSyntax: { WEB: `--radius-${name}` },
    });
  }

  const typeCollection = tempId("typography", "collection");
  const [typeModeId] = createCollection(payload, typeCollection, "KIN Typography", ["Default"]);
  for (const [styleName, token] of Object.entries(tokens.typography)) {
    const value = tokenValue(token);
    const prefix = `Typography/${styleName.replaceAll("-", " ")}`;
    createVariable(payload, typeCollection, `${prefix}/font family`, "STRING", [[typeModeId, value.fontFamily]]);
    createVariable(payload, typeCollection, `${prefix}/font size`, "FLOAT", [[typeModeId, numberValue({ $value: value.fontSize })]], {
      scopes: ["FONT_SIZE"],
    });
    createVariable(payload, typeCollection, `${prefix}/font weight`, "FLOAT", [[typeModeId, value.fontWeight]], {
      scopes: ["FONT_WEIGHT"],
    });
    createVariable(payload, typeCollection, `${prefix}/line height`, "FLOAT", [[typeModeId, value.lineHeight]], {
      scopes: ["LINE_HEIGHT"],
    });
    createVariable(payload, typeCollection, `${prefix}/letter spacing`, "FLOAT", [[typeModeId, numberValue({ $value: value.letterSpacing })]], {
      scopes: ["LETTER_SPACING"],
    });
  }

  const motionCollection = tempId("motion", "collection");
  const [motionModeId] = createCollection(payload, motionCollection, "KIN Motion", ["Default"]);
  for (const [name, token] of Object.entries(tokens.motion ?? {})) {
    const value = tokenValue(token);
    if (name.startsWith("duration-")) {
      const milliseconds = value.unit === "s" ? value.value * 1000 : value.value;
      createVariable(payload, motionCollection, `Motion/${name.replaceAll("-", " ")}`, "FLOAT", [[motionModeId, milliseconds]], {
        codeSyntax: { WEB: `--${name}` },
        description: "KIN motion duration in milliseconds.",
      });
      continue;
    }
    if (name.startsWith("ease-")) {
      createVariable(
        payload,
        motionCollection,
        `Motion/${name.replaceAll("-", " ")}`,
        "STRING",
        [[motionModeId, `cubic-bezier(${value.join(", ")})`]],
        {
          codeSyntax: { WEB: `--${name}` },
          description: "KIN motion easing curve.",
        },
      );
    }
  }

  return `${JSON.stringify(payload, null, 2)}\n`;
}

const output = generate();
if (checkOnly) {
  const existing = fs.existsSync(destination) ? fs.readFileSync(destination, "utf8").replace(/\r\n/g, "\n") : null;
  if (existing !== output) {
    console.error("tokens/kin.figma.variables.json is out of date. Run: npm run tokens:export");
    process.exit(1);
  }
  console.log("Figma Variables payload matches generated tokens.");
} else {
  fs.writeFileSync(destination, output, "utf8");
  console.log(`Generated ${path.relative(root, destination)}`);
}
