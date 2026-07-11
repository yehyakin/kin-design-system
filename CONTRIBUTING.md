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
```

The validator checks local Markdown links, paired fences, unresolved merge markers, placeholders and required repository files. Visual and product judgment still require human review.

## Versioning

- Patch: wording, corrections and examples without behavioral change.
- Minor: backward-compatible components, patterns or product extensions.
- Major: changes to philosophy, semantic Tokens, theme model or interaction contracts.

Update `CHANGELOG.md` under `Unreleased` for user-visible changes.
