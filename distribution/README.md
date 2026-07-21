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

## Human review packet

Run the deterministic packet exporter before requesting language review:

```powershell
npm run agent:review:export
npm run agent:review:check
```

The generated [`reviews/agent-locales.md`](../reviews/agent-locales.md) places every current localized record beside its exact normative source section and candidate checksums. The packet remains non-normative and review-pending. It MUST NOT be edited into an approval record, and generating it MUST NOT change locale `review.status`.

A human reviewer records approval or required corrections in a durable review channel. Any stored reviewer identifier MUST be a consented public handle or governed public attestation ID, never an email address or private identity. A separate reviewed change may then bind the approved copy to that identifier, the reviewed ref, and current checksums in `distribution/locales/*.json`.
