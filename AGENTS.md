# Agent Instructions

These instructions apply to the entire repository.

## Required reading

1. Read `DESIGN.md` completely.
2. Read `DELIVERY.md` before changing Figma, runtime-package, adoption, generated-artifact or repository boundaries.
3. Read `REFERENCES.md` before using external design claims or packages.
4. Read `components/catalog.md` and `components/terminology.md` before adding, renaming or claiming completion of a component.
5. Read only the relevant files in `principles/`, `patterns/`, `components/`, `integrations/` and `tools/`.
6. Read `CONTRIBUTING.md` before changing normative rules.
7. Read `principles/verification.md` before claiming accessibility, cross-browser, motion, zoom or RTL completion.

## Editing rules

- Preserve KIN as an independent system; do not turn it into a Linear clone.
- Separate normative requirements from examples and third-party observations.
- Use `MUST`, `MUST NOT`, `SHOULD` and `MAY` consistently.
- Do not add package versions, licenses or API claims without verifying current primary sources.
- Do not copy external documentation, source code, screenshots, fonts, icons or brand assets.
- Keep local links relative and use stable source URLs.
- Do not add runtime dependencies for documentation checks.
- Do not turn framework-free references into a runtime package or claim a Figma Library without satisfying `DELIVERY.md`.
- Update `CHANGELOG.md` for user-visible normative changes.

## Verification

Run:

```powershell
node scripts/validate-docs.mjs
node scripts/validate-design.mjs
node scripts/validate-components.mjs
node scripts/validate-release.mjs
node scripts/export-tokens.mjs --check
node scripts/export-figma-variables.mjs --check
npm run test:tooling
```

When a change affects tokens, run `node scripts/report-token-changes.mjs HEAD`. When it affects component states or reference interfaces, also run `npm run test:reference` and inspect the generated screenshots.

Check the complete diff, local links, Markdown fences and unresolved merge markers before committing.

## Scope discipline

Make focused changes. Do not reformat unrelated documents. When a proposal changes a semantic Token, interaction contract or accessibility requirement, explain affected product families and migration impact in the pull request.
