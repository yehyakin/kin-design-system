# Agent distribution inputs

Status: non-normative generation input

This directory contains declared routing data, locale copy, and JSON Schemas for KIN's generated Agent snapshots. It does not replace `DESIGN.md`, the component contracts, product patterns, or delivery rules.

Phase 1 produces only the mutable, repository-committed `generated/agent/next/` tree. It does not publish those files to GitHub Pages, create version archives, advance stable aliases, or claim that a consuming product has adopted KIN.

## Source ownership

- `rules.json` owns stable compact-rule IDs, requirement levels, source paths, source headings, and snapshot ordering.
- `profiles.json` routes the four existing KIN product profiles to their normative pattern documents.
- `locales/*.json` supplies informative copy. Locale files MUST NOT redefine a rule's authority fields.
- `schemas/` defines the Phase 1 machine interfaces. Later-phase alias, registry, and Recipe Schemas are not created as empty placeholders.

Locale copy begins as `unreviewed`. Exact English and Chinese copy requires a separate human review before a versioned or stable Agent bundle can be released.
