# Agent distribution inputs

Status: non-normative generation input

This directory contains declared routing data, locale copy, and JSON Schemas for KIN's generated Agent snapshots. It does not replace `DESIGN.md`, the component contracts, product patterns, or delivery rules.

The generator produces the mutable, repository-committed `generated/agent/next/` tree. Reviewed Phase 2 Schemas also govern a create-once version archive, `generated/agent/versions.json`, Pages publication, and the stable-alias resolver. None of these artifacts claims that a consuming product has adopted KIN.

## Source ownership

- `rules.json` owns stable compact-rule IDs, requirement levels, source paths, source headings, and snapshot ordering.
- `profiles.json` routes the four existing KIN product profiles to their normative pattern documents.
- `locales/*.json` supplies informative copy. Locale files MUST NOT redefine a rule's authority fields.
- `schemas/` defines Snapshot, Bundle Manifest, stable-alias Manifest, Version Registry, rule, profile, and locale-source interfaces. Recipe Schemas remain absent until the Recipe phase.

Locale copy begins as `unreviewed`. Exact English and Chinese copy requires a separate checksum-bound human review before `next` may be published or a versioned/stable Agent bundle may be released.

## Channel contract

- `next` normally follows validated `main`, is mutable, and is suitable only for evaluation. An untagged staged release candidate defers the complete Pages deployment, so public `next` temporarily remains at the preceding verified deployment until the final GitHub Release is published.
- `versions/vX.Y.Z` is immutable, created once in the matching release commit, and becomes public only after Registry promotion.
- the root stable alias is mutable discovery metadata; its Snapshot and Schema bytes come unchanged from the Registry-selected immutable version.
- `versions.json` is the only authority for release, support, replacement, and stable-selection state. Before the first released bundle it is public only while reviewed `next` also publishes its referenced Version Schema; after the first release it remains public through an immutable released Schema even if `next` is withheld.

Normal `agent:export` writes only `next`. `agent:release` creates a staged archive and fails if that version directory or Registry entry already exists. `agent:promote` requires the complete local and remote release evidence and changes only the Registry. `agent:rollback` prepares a reviewed Registry-only backwards pointer move or withdrawal. `agent:support` changes a non-current released version's support, replacement, or advisory metadata. None of these lifecycle commands edits an archive.

## Human review packet

Run the deterministic packet exporter before requesting language review:

```powershell
npm run agent:review:export
npm run agent:review:check
```

The generated [`reviews/agent-locales.md`](../reviews/agent-locales.md) places every current localized record beside its exact normative source section and candidate checksums. The packet remains non-normative review material and is not itself an attestation. It MUST NOT be edited into an approval record, and generating it MUST NOT change locale `review.status`.

A human reviewer records approval or required corrections in a durable review channel. Any stored reviewer identifier MUST be a consented public handle or governed public attestation ID, never an email address or private identity. A separate reviewed change may then bind the approved copy to that identifier, the reviewed ref, and current checksums in `distribution/locales/*.json`.
