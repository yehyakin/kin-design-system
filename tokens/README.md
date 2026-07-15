# Generated tokens

This directory contains machine-consumable output generated from the Frontmatter in [`DESIGN.md`](../DESIGN.md).

| File | Use |
|---|---|
| [`kin.tailwind.css`](./kin.tailwind.css) | Tailwind CSS v4 `@theme` variables plus normative motion custom properties |
| [`kin.tokens.json`](./kin.tokens.json) | Design Tokens Community Group-compatible JSON |
| [`kin.figma.variables.json`](./kin.figma.variables.json) | Create-only request body for Figma's Variables REST API |

Regenerate all generated files after changing normative Tokens:

```bash
node scripts/export-tokens.mjs
```

Check committed output without rewriting it:

```bash
node scripts/export-tokens.mjs --check
```

The DTCG file is the preferred shared source for tools such as Tokens Studio. Tokens Studio can map Token Sets to Figma collections and Themes to collections with modes; teams should review that mapping in the plugin before exporting.

The Figma payload creates `KIN Color`, `KIN Scale`, `KIN Typography`, and `KIN Motion`. Color includes Light, Dark, Light High Contrast, and Dark High Contrast modes. Typography composites are flattened into the primitive STRING and FLOAT types supported by Figma Variables. Motion durations are exported as millisecond FLOAT values and easing curves as CSS-compatible STRING values because Figma Variables do not expose composite duration or cubic-bezier types.

The payload targets `POST /v1/files/:file_key/variables`. It never contains authentication or a file key and is never sent by this repository. The Variables REST API currently requires an eligible Enterprise account, a full seat, edit access, and the `file_variables:write` scope. It is create-only: re-posting it creates duplicates, so established libraries need a separate ID-aware synchronization process.

The exporter pins `@google/design.md` to a reviewed version in `package-lock.json`; run `npm ci` before exporting. Generated files are interoperability output, not a replacement for KIN's theme and component behavior in the prose contract.
