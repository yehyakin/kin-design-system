# Agent Instructions

These instructions apply to the entire repository.

## Required reading

1. Read `DESIGN.md` completely.
2. Read `REFERENCES.md` before using external design claims or packages.
3. Read only the relevant files in `principles/`, `integrations/` and `tools/`.
4. Read `CONTRIBUTING.md` before changing normative rules.

## Editing rules

- Preserve KIN as an independent system; do not turn it into a Linear clone.
- Separate normative requirements from examples and third-party observations.
- Use `MUST`, `MUST NOT`, `SHOULD` and `MAY` consistently.
- Do not add package versions, licenses or API claims without verifying current primary sources.
- Do not copy external documentation, source code, screenshots, fonts, icons or brand assets.
- Keep local links relative and use stable source URLs.
- Do not add runtime dependencies for documentation checks.
- Update `CHANGELOG.md` for user-visible normative changes.

## Verification

Run:

```powershell
node scripts/validate-docs.mjs
```

Check the complete diff, local links, Markdown fences and unresolved merge markers before committing.

## Scope discipline

Make focused changes. Do not reformat unrelated documents. When a proposal changes a semantic Token, interaction contract or accessibility requirement, explain affected product families and migration impact in the pull request.
