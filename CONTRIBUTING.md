# Contributing to KIN

KIN evolves through evidence from real products. A visual preference alone is not enough to change a normative rule.

## Types of contribution

- Clarification: improves wording without changing behavior.
- Correction: fixes an inaccurate claim, broken link or inaccessible recommendation.
- Addition: introduces a component, pattern or product extension.
- Normative change: modifies a Token, interaction contract or quality gate.

## Before proposing a change

1. Identify the product problem and affected users.
2. Search existing issues and documents.
3. Collect evidence: screenshots, usability findings, accessibility results, performance measurements or production constraints.
4. State whether the change is normative or informative.
5. Identify migration and rollback requirements.

## Pull request expectations

A proposal should explain:

- What problem is being solved.
- Why the current rule is insufficient.
- Which product families and components are affected.
- Light, dark, mobile, keyboard and reduced-motion implications.
- External references and their status as official or third-party.
- Validation performed.
- Migration path for normative changes.
- Delivery-boundary impact when a proposal changes Figma, runtime packages, generated artifacts, or adoption evidence.

## Writing conventions

- Use direct, testable language.
- Define specialist terms on first use.
- Distinguish requirements from examples.
- Do not present third-party analysis as official product truth.
- Avoid generic claims such as “more premium” without describing observable qualities.
- Keep Chinese and English terminology consistent with `DESIGN.md`.

## External projects

Do not vendor external code or assets by default. Before adding an adapter, verify the official repository, current package name, maintenance status, license, accessibility and runtime constraints. Record adoption in the consuming product, not in KIN as a universal mandate.

## Translations

`README.md` is the source README. Translations live in `READMEs/` and must remain complete, readable documents.

- Translate meaning rather than English sentence structure.
- Keep commands, paths, package names and normative keywords unchanged.
- Update navigation links in both the source and translated README.
- When a source change cannot be translated in the same pull request, record the source commit covered by the translation.
- Do not add an unreviewed machine translation only to increase the language count.

## Validation

```powershell
node scripts/validate-docs.mjs
node scripts/validate-design.mjs
node scripts/validate-components.mjs
node scripts/validate-pages.mjs
node scripts/validate-scenarios.mjs
node scripts/validate-integrations.mjs
node scripts/validate-release.mjs
node scripts/export-tokens.mjs --check
node scripts/export-figma-variables.mjs --check
npm run test:tooling
npm run runtime:check
npm run site:check
```

The validators check document structure, local links, component, page, and integration-catalog maturity, evidence paths, terminology references, required machine-readable Token groups, Token references, theme parity, baseline text contrast, the private runtime package, and the built showcase. Visual and product judgment still require human review.

For Token changes, include the output of `node scripts/report-token-changes.mjs <base-ref>`. For component-state, page-flow or reference-interface changes, run `npm run test:reference` and review the generated screenshots before opening the pull request.

Accessibility and browser claims MUST follow [`principles/verification.md`](./principles/verification.md). Automated reflow, RTL, Forced Colors and cross-browser smoke checks do not replace a recorded real browser-zoom or screen-reader review when the release claims those behaviors.

Proposals that change contract-first delivery, Figma interoperability, runtime packaging, or evidence stages MUST follow [`DELIVERY.md`](./DELIVERY.md) and identify separate ownership, versioning, migration, and rollback.

## Contract lifecycle

`DESIGN.md` frontmatter is the machine-readable source for the contract lifecycle:

- `kin_version` is the version currently being developed or released.
- `release_status` MUST be `development` or `released`.
- `latest_stable` MUST be a SemVer release that is not newer than `kin_version`.

While `release_status: development`:

- user-visible changes MUST remain under `## Unreleased` in `CHANGELOG.md`;
- the adoption example MUST pin a full 40-character commit SHA whose `DESIGN.md` checksum matches the working contract;
- the source and translated README badges MUST say `v<kin_version> development`, using `Design_Contract-v<kin_version>_development-…` in the Shields URL and the same wording in alt text;
- an Agent MUST commit `DESIGN.md` before running `scripts/init-adoption.mjs`; the initializer MUST stop when the working contract differs from `HEAD`;
- the site MUST NOT link to a `v<kin_version>` tag or release that does not exist;
- generated adoption records MUST identify the revision as development and name `latest_stable` separately.

When `release_status: released`:

- `latest_stable` MUST equal `kin_version`;
- the source and translated README badges MUST use the released `v<kin_version>` wording without a development qualifier;
- the adoption example MUST use the `v<kin_version>` tag;
- that Git tag MUST contain a `DESIGN.md` whose canonical checksum matches the working contract;
- `CHANGELOG.md` MUST contain the matching version section.

Prepare a release as one immutable commit: update lifecycle fields, move the completed notes from `Unreleased` to the version heading, update the adoption locator, create the annotated tag on that commit, and then run the full validation matrix. If validation fails, delete the unpublished local tag, correct the release commit, and repeat. Do not publish a tag or GitHub Release until the checks and human review are complete.

## Versioning

- Patch: wording, corrections and examples without behavioral change.
- Minor: backward-compatible components, patterns or product extensions.
- Major: changes to philosophy, semantic Tokens, theme model or interaction contracts.

Update `CHANGELOG.md` under `Unreleased` for user-visible changes.
