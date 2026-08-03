# Agent Instructions

These instructions apply to the entire repository.

## Default orchestration

- Use the `sol-luna` Skill by default for complex, multi-stage, parallelizable, or high-consequence work in this repository.
- Sol is the single controller: it defines the concrete goal, observable `done_when` criteria, dependency stages, file ownership, verification, and the final `PASS`, `FIX`, or `BLOCKED` decision.
- Use the minimum useful number of Luna Max workers. Planning-only or review-only work MAY use Sol without a Luna worker; ordinary small, single-file, or single-fact work SHOULD remain direct.
- Every Luna assignment MUST include a stable task ID, one bounded task, exact write scope, explicit exclusions, an observable expected result, and an exact verification procedure.
- One writable file MUST have one owner for the entire run. Tasks with overlapping or uncertain write scopes MUST run sequentially or be merged under one owner.
- Luna workers MUST NOT broaden scope, create subagents, approve the overall task, or modify files outside their assignment. Sol MUST inspect the real files, complete diff, verification output, and preserved unrelated user changes before accepting the result.
- If the runtime cannot prove the requested Sol or Luna role, model, reasoning effort, and effective permission boundary, fail closed instead of silently substituting another agent.
- Deletion, deployment, production changes, accounts, payment, credentials, and other external side effects still require explicit user authorization; `sol-luna` does not widen project or user permissions.

## Required reading

1. Read `DESIGN.md` completely.
2. Read `VISION.md`, `principles/visual-signature.md`, `principles/context-thread.md` and `principles/material-hierarchy.md` before changing product direction, page composition, a complete workflow, showcase structure, Surface hierarchy, edge treatment, elevation, shadow or visible KIN adoption requirements.
3. Read `DELIVERY.md` and `adoption/implementation-brief.md` before changing adoption, Figma, runtime-package, generated-artifact or repository boundaries.
4. Read `REFERENCES.md` before using external design claims or packages.
5. Read `components/catalog.md` and `components/terminology.md` before adding, renaming or claiming completion of a component.
6. Read only the relevant files in `principles/`, `patterns/`, `components/`, `integrations/` and `tools/`.
7. Read `CONTRIBUTING.md` before changing normative rules.
8. Read `principles/verification.md` before claiming accessibility, cross-browser, motion, zoom or RTL completion.
9. Read `integrations/catalog.md` and `packages/react/RFC.md` before changing official runtime integrations, adapter APIs, package exports, dependency boundaries or upstream motion behavior.
10. Read `rfcs/001-agent-distribution-layer.md` and `distribution/README.md` before changing Agent snapshots, Manifests, locale review, generated distribution artifacts, or their release lifecycle.

## Editing rules

- Preserve KIN as an independent system; do not turn it into a Linear clone.
- Separate normative requirements from examples and third-party observations.
- Use `MUST`, `MUST NOT`, `SHOULD` and `MAY` consistently.
- Do not add package versions, licenses or API claims without verifying current primary sources.
- Do not copy external documentation, source code, screenshots, fonts, icons or brand assets.
- Keep local links relative and use stable source URLs.
- Do not add runtime dependencies for documentation checks.
- Preserve reviewed upstream interaction and animation engines. KIN adapters MAY configure and style them, but MUST NOT replace mature behavior with a lookalike without a documented defect, test, owner and removal condition.
- Do not turn framework-free references into a runtime package or claim a Figma Library without satisfying `DELIVERY.md`.
- Update `CHANGELOG.md` for user-visible normative changes.
- Do not edit `generated/agent/next/` directly. Change its governed inputs and run the deterministic exporter.
- Do not edit `generated/agent/versions/vX.Y.Z/` directly or regenerate it from later sources. Release export creates each archive once; promotion changes only `generated/agent/versions.json`.
- Stable-alias rollback MUST use `npm run agent:rollback -- ...`; it changes only `generated/agent/versions.json`, preserves immutable Schema pinning, and requires a focused reviewed commit.
- Non-current release support changes MUST use `npm run agent:support -- ...`; changing the current stable target to unsupported or superseded requires `agent:rollback`.
- Pages MUST publish Agent files only through the Registry-aware allowlist. Staged versions and root aliases without a supported released target MUST remain absent.
- Component Recipes, Skill-routing changes, and consuming-product trials remain outside Phase 2 until their RFC phases are separately approved.

## Verification

Run:

```powershell
node scripts/validate-docs.mjs
node scripts/validate-design.mjs
node scripts/validate-components.mjs
node scripts/validate-pages.mjs
node scripts/validate-scenarios.mjs
node scripts/validate-integrations.mjs
npm run release:check:pre-tag
node scripts/export-tokens.mjs --check
node scripts/export-figma-variables.mjs --check
npm run agent:check:generated
npm run agent:review:check
npm run test:tooling
npm run runtime:check
npm run site:check
```

Ordinary pull-request and `main` checks use the pre-Tag release gate. Only a release Tag checkout uses `npm run release:check:post-tag`; that command MUST NOT be replaced by the pre-Tag route after a Tag exists.

Release, promotion, pull-request, `main`, and Pages publication gates use a complete checkout and `npm run agent:check:history`. The targeted release gate adds `--version X.Y.Z`.

When a change affects tokens, run `node scripts/report-token-changes.mjs HEAD`. When it affects component states or reference interfaces, also run `npm run test:reference` and inspect the generated screenshots.

Check the complete diff, local links, Markdown fences and unresolved merge markers before committing.

## Scope discipline

Make focused changes. Do not reformat unrelated documents. When a proposal changes a semantic Token, interaction contract or accessibility requirement, explain affected product families and migration impact in the pull request.
