# RFC 001 — Agent Distribution Layer

Status: accepted
Decision scope: generated artifacts and Agent delivery
Normative effect: none; accepted decisions become normative only when incorporated into the governing contracts
Implementation status: Phases 1-2 implemented; Phases 3-5 remain pending
Accountable owner: [@yehyakin](https://github.com/yehyakin)
First eligible stable bundle: the earliest KIN release whose tagged commit contains the accepted generator and artifacts; expected v3.0.0 and never retroactive

Normative terms describe the required implementation if accepted. Acceptance authorizes phased work but does not override current contracts; only merged governing-contract changes do so.

## 1. Summary

This RFC proposes a generated Agent Distribution Layer that compiles the existing contract into short, theme-resolved, locale-aware, directly fetchable artifacts.

The layer would provide:

- one compact Markdown snapshot for each supported theme and reviewed locale;
- one machine-readable manifest for discovery, version, checksum, routing, and immutable-source information;
- one machine-readable component-recipe index linked to the existing component maturity catalog;
- separate GitHub Pages channels for latest stable, mutable current `main`, and immutable versioned artifacts;
- immutable release URLs for production adoption;
- deterministic generation and drift checks in the existing validation pipeline.

`DESIGN.md` remains the only normative design source. The generated layer is a delivery surface, not a new design system, a runtime component package, an Agent product, or evidence that a consuming product has adopted KIN.

## 2. Problem

KIN has a stronger product, component, page, verification, migration, and rollback contract than a short theme file can carry. That strength currently creates four delivery problems.

### 2.1 First-read context is large

A page-level KIN task can require the Agent Skill, `DESIGN.md`, `VISION.md`, `DELIVERY.md`, and `principles/visual-signature.md` before task-specific contracts. Together they form a substantial first-read payload before task-specific contracts are considered.

The information is valuable, but the first read mixes:

- non-negotiable design rules;
- theme values;
- product direction;
- delivery governance;
- implementation workflow;
- detailed component behavior;
- verification and adoption claims.

An Agent can obey the broad process while still failing to produce a recognizably KIN composition because the immediately usable visual and component decisions are distributed across the contract.

### 2.2 Themes are normalized for tools, not for first-read use

KIN already validates Light, Dark, Light High Contrast, and Dark High Contrast parity and exports DTCG, Tailwind-compatible, and Figma Variables output. In `DESIGN.md`, however, theme values are exposed with names such as `dark-surface-1`, `light-surface-1`, `button-dark`, and `button-light`.

A consuming Agent must select and remap theme-prefixed keys before it can use one stable interface. A resolved Snapshot instead exposes the same names for every mode:

~~~text
canvas
surface-1
surface-2
text-primary
line-default
accent
focus-ring
~~~

Only the values change.

### 2.3 Visual recipes and maturity are not joined

The `components` block in `DESIGN.md` contains theme and state recipes. `components/catalog.json` contains the actual component identity, maturity, support, evidence, and known gaps. These datasets serve different purposes and are not currently joined into one Agent-readable index.

An Agent can therefore:

- mistake a visual recipe for a stable component;
- find a stable contract without finding its default geometry or Token mapping;
- choose an integration without seeing the component maturity boundary;
- load several long documents to answer a small component-selection question.

### 2.4 Public Agent access is indirect

KIN publishes the showcase and Token files, but it does not publish a short canonical Markdown endpoint comparable to `/design.md`. Agents must know the repository layout, fetch the complete contract, or rely on copied local files.

The absence of one discoverable manifest also makes it harder to answer:

- Which KIN version is this?
- Is it development or released?
- Which theme and locale files exist?
- What is their source checksum?
- Which URL is immutable?
- Which component, page, pattern, or integration contract should be read next?

## 3. Evidence and source boundary

This proposal is informed by Vercel's public Light and Dark Geist design documents:

- [Vercel Geist Light design document](https://vercel.com/design.md)
- [Vercel Geist Dark design document](https://vercel.com/design.dark.md)

The transferable observation is their compact, theme-resolved, same-key delivery format. KIN MUST NOT copy Geist colors, typography, component source, brand language, layout defaults, motion curves, or prose.

Both referenced documents currently identify their format as `alpha`. KIN MUST treat their structure as an observation, not as a stable external Schema or licensing grant.

## 4. Goals

1. Make the first KIN read short enough for an Agent to retain the highest-priority rules.
2. Resolve one theme and contrast mode before the Agent consumes Token values.
3. Keep Token and recipe key names identical across themes.
4. Preserve KIN's contract-first, project-owned implementation model.
5. Provide English and Simplified Chinese discovery without unreviewed machine translation.
6. Join component recipes to canonical catalog identity and maturity.
7. Publish current artifacts at predictable URLs and released artifacts at immutable URLs.
8. Keep generation deterministic, local, dependency-light, and verifiable.
9. Preserve full product, behavior, accessibility, verification, migration, and rollback contracts through routed links.
10. Improve Skill portability when a complete KIN checkout is not adjacent to the installed Skill.

## 5. Non-goals

This RFC does not propose:

- replacing or shortening the normative `DESIGN.md`;
- changing any current color, typography, spacing, radius, motion, or component value;
- adopting Geist or Vercel visual language;
- creating a universal React, Vue, Web Component, native, or CSS component package;
- publishing a Figma Component Library;
- copying third-party documentation, source, fonts, icons, screenshots, or assets;
- making Agent integration the direction of KIN;
- declaring a consuming product visibly KIN or verified;
- auto-modifying consuming-product code;
- fetching mutable remote design rules during generation;
- making high-contrast, localization, accessibility, or Reduced Motion optional;
- adding P3 color output before a separate proposal and evidence review.

## 6. Decision principles

### 6.1 One normative source

`DESIGN.md`, the governing KIN contracts, and their machine catalogs remain authoritative. Generated Agent artifacts MUST identify their source and MUST NOT be edited as normative files.

### 6.2 Compile, do not duplicate

Theme snapshots MUST be generated from reviewed sources. Light, Dark, contrast, and locale variants MUST NOT be maintained as independent handwritten design systems.

### 6.3 Resolve before delivery

An Agent snapshot MUST expose one resolved color scheme, contrast mode, and locale. It MUST NOT require the Agent to choose between Light and Dark values inside the same Token namespace.

### 6.4 Progressive disclosure

The compact snapshot provides material, high-frequency rules, and routing. Detailed page, component, product, integration, adoption, and verification behavior remains in the matching contract.

### 6.5 Behavior outranks recipes

A component recipe defines default geometry and visual Token bindings. It MUST NOT override component semantics, interaction behavior, accessibility, permissions, data, recovery, maturity, or upstream-package ownership.

### 6.6 Delivery is not adoption

Reading or importing a generated snapshot does not establish Token compatibility, component mapping, visible KIN adoption, verification, or production observation.

## 7. Proposed architecture

~~~text
Normative sources
|- DESIGN.md
|- VISION.md
|- DELIVERY.md
`- principles/visual-signature.md

Machine catalogs
|- components/catalog.json
|- pages/catalog.json
`- integrations/catalog.json

Non-normative distribution inputs
`- distribution/
   |- rules.json
   |- profiles.json
   |- component-recipes.source.json
   |- locales/en.json
   |- locales/zh-CN.json
   `- schemas/*.schema.json

All validated inputs
`- scripts/export-agent-distribution.mjs
   |- generated/agent/next/*
   |- generated/agent/versions/vX.Y.Z/*
   `- generated/agent/versions.json
      |- scripts/validate-agent-distribution.mjs
      |- tests/tooling.test.mjs
      `- scripts/build-site.mjs
         `- GitHub Pages raw Markdown and JSON endpoints
~~~

The generator MUST use local repository sources only. Network access MUST NOT be required to export or validate the distribution.

## 8. Repository artifacts

### 8.1 Declared inputs and Schemas

The accepted implementation MUST create the following non-normative, declared inputs and interoperability Schemas. Locale records carry their own checksum-bound review state and MUST NOT be described as reviewed until that state is valid:

~~~text
distribution/
|- README.md
|- rules.json
|- profiles.json
|- component-recipes.source.json
|- locales/
|  |- en.json
|  `- zh-CN.json
`- schemas/
   |- snapshot.schema.json
   |- manifest.schema.json
   |- alias-manifest.schema.json
   |- rules.schema.json
   |- recipe-source.schema.json
   |- recipes.schema.json
   |- profiles.schema.json
   |- locale-source.schema.json
   `- versions.schema.json
~~~

These files are generation inputs or interface definitions, not a second design contract. Every machine JSON input and output MUST declare its matching committed Schema. Published output uses the same-channel or immutable versioned Schema URL; repository inputs use repository-relative Schema locators. `component-recipes.source.json` is introduced only in Phase 3 and MAY be absent while the feature state is `unavailable`. Missing geometry or semantics MUST first be added to `DESIGN.md` or the applicable normative component contract through a separate reviewed change.

### 8.2 Generated output

The accepted implementation MUST create:

~~~text
generated/agent/
|- README.md
|- versions.json
|- next/
|  |- design-manifest.json
|  |- schemas/
|  |- en/
|  |  |- design.md
|  |  |- design.dark.md
|  |  |- design.high-contrast.md
|  |  `- design.dark.high-contrast.md
|  `- zh-CN/
|     |- design.md
|     |- design.dark.md
|     |- design.high-contrast.md
|     `- design.dark.high-contrast.md
`- versions/
   `- vX.Y.Z/
      |- design-manifest.json
      |- schemas/
      |- en/
      `- zh-CN/
~~~

`component-recipes.json` is absent until the manifest feature state is `partial` or `available`. It MUST NOT be emitted as an empty or invented Phase 1 artifact.

The directory name avoids the case-insensitive filesystem conflict between root `DESIGN.md` and a root `design.md` on Windows.

`generated/agent/next/*` MUST be committed and regenerated from current governed sources. Released `generated/agent/versions/vX.Y.Z/*` directories MUST be created in the release commit and MUST never be regenerated from later sources. Generated files MUST be available offline, reviewable in diffs, include a generated-file warning, and pass a byte-for-byte `--check` mode.

### 8.3 Proposed scripts

~~~text
scripts/export-agent-distribution.mjs
scripts/validate-agent-distribution.mjs
scripts/promote-agent-distribution.mjs
~~~

Proposed package scripts:

~~~json
{
  "agent:export": "npm run tokens:export && node scripts/export-agent-distribution.mjs",
  "agent:release": "node scripts/export-agent-distribution.mjs --release",
  "agent:promote": "node scripts/promote-agent-distribution.mjs",
  "agent:check:generated": "node scripts/export-agent-distribution.mjs --check && node scripts/validate-agent-distribution.mjs",
  "agent:check": "npm run tokens:check && npm run agent:check:generated",
  "agent:check:history": "node scripts/validate-agent-distribution.mjs --history"
}
~~~

Normal `agent:export` MUST write only `next`. `agent:release --version X.Y.Z` MUST fail if the target version directory already exists and MUST require all of the following:

- `DESIGN.md` has `release_status: released`;
- `DESIGN.md` `kin_version` and `latest_stable` both equal `X.Y.Z`;
- `package.json` has the same version;
- current contract, Token, locale, Schema, and distribution checks pass;
- the release directory does not exist.

Release export runs pre-tag validation only: contract lifecycle, Tokens, locale attestations, Schemas, generated output, and working-tree checks. It MUST NOT require the release tag or GitHub Release. It creates the archive and a `publication_state: staged` registry entry without advancing `latest_agent_distribution`. After the archive and lifecycle fields are committed, the local annotated tag is created on that exact commit and full release/history validation runs. Remote tag and GitHub Release validation occurs before promotion.

`agent:promote --version X.Y.Z` belongs to a focused post-release promotion commit and MUST run only after the local tag, remote immutable tag, successful Tag workflow, final GitHub Release, and version-specific read-only `Validate Agent release` run all resolve to an eligible main revision containing the archived release commit. The local command MUST independently query and verify that remote evidence immediately before mutation; the workflow is an auditable eligibility gate, not a substitute for command-side enforcement. Normal `agent:check` MUST NOT regenerate historical bundles from the current contract.

The accepted implementation MUST add an explicit `validate-release.mjs --pre-tag` route. Pull-request and `main` validation of a release commit MUST use that route; it checks version parity, release Changelog, adoption locators, generated outputs, the staged Archive, and all non-Tag release conditions, and skips only the requirements that the Tag already exists and that Tag contents match. After the annotated Tag is created on the exact release commit, the dedicated release workflow MUST run the existing full `validate-release.mjs` path plus history validation. This split MUST be reflected in package scripts, `RELEASING.md`, `AGENTS.md`, and workflow commands without weakening the full post-Tag gate.

The implementation MUST NOT add a runtime dependency. It SHOULD reuse the canonical UTF-8 checksum, checked Token output, catalog readers, and site-build conventions. It MUST factor the repository's constrained Frontmatter handling into a tested local parser/serializer, or use a separately reviewed development dependency. It MUST NOT rely on undocumented internals of `@google/design.md` or claim that a shared parser already exists.

## 9. Snapshot contract

Each generated Markdown snapshot begins with machine-readable YAML Frontmatter and continues with concise human-readable guidance.

### 9.1 Required Frontmatter

~~~yaml
---
kind: kin-agent-design
schema_version: "2.0.0"
schema_locator: schemas/snapshot.schema.json
generated: true
normative: false
artifact_status: generated-derivative
editable: false
publication:
  state: repository-only
  published: false
  public_locators: unavailable
kin_version: "<resolved KIN lifecycle version>"
release_status: "<resolved from DESIGN.md>"
latest_stable_contract: "<resolved from DESIGN.md.latest_stable>"
channel: next
locale: en
direction: ltr
theme: light
contrast: normal
coverage: compact-foundations-and-routing
features:
  component_recipes: unavailable
locale_review:
  status: reviewed
  reviewers:
    - "<consented public handle or public attestation ID>"
  normative_source_checksum: "<reviewed normative-source-set checksum>"
  localized_content_checksum: "<reviewed localized-content checksum>"
source:
  contract_path: DESIGN.md
  checksum_algorithm: sha256
  checksum: "<canonical-design-checksum>"
  input_set_checksum: "<canonical-input-set-checksum>"
  ref: main
  revision_status: mutable
manifest_locator: design-manifest.json
full_contract_path: DESIGN.md
visual_signature_path: principles/visual-signature.md
delivery_contract_path: DELIVERY.md
product_profiles:
  - information-site
  - intelligence-workspace
  - ecommerce-operations
  - engineering-canvas
rules:
  - id: task-before-explanation
    level: must
    source_path: principles/visual-signature.md
    source_heading: "1. The task appears before the explanation"
colors:
  canvas: "<resolved value>"
  sidebar: "<resolved value>"
  surface-1: "<resolved value>"
  surface-2: "<resolved value>"
  surface-3: "<resolved value>"
  surface-4: "<resolved value>"
  surface-hover: "<resolved value>"
  surface-selected: "<resolved value>"
  surface-overlay: "<resolved value>"
  text-primary: "<resolved value>"
  text-secondary: "<resolved value>"
  text-muted: "<resolved value>"
  text-disabled: "<resolved value>"
  text-inverse: "<resolved value>"
  icon-primary: "<resolved value>"
  icon-muted: "<resolved value>"
  line-subtle: "<resolved value>"
  line-default: "<resolved value>"
  line-strong: "<resolved value>"
  accent: "<resolved value>"
  accent-hover: "<resolved value>"
  accent-active: "<resolved value>"
  accent-soft: "<resolved value>"
  focus-ring: "<resolved value>"
  monitor: "<resolved value>"
  monitor-soft: "<resolved value>"
  positive: "<resolved value>"
  warning: "<resolved value>"
  negative: "<resolved value>"
  critical: "<resolved value>"
  offline: "<resolved value>"
typography: {}
spacing: {}
rounded: {}
motion: {}
component_recipes: null
---
~~~

The final Schema MAY add fields, but it MUST retain:

- generated and normative status;
- editable status and declared coverage;
- KIN lifecycle;
- locale, theme, and contrast;
- canonical source checksum;
- checksum coverage for every reviewed input used to generate the artifact;
- logical contract paths resolved by the channel manifest;
- theme-resolved Token values;
- stable rule IDs, requirement levels, source paths, and source headings;
- an explicit component-recipe feature state, including `unavailable`.

`manifest_locator` is resolved from the bundle root, not relative to the Markdown file's directory. Repository paths remain repository-relative. Public and canonical URLs are supplied by the matching Manifest so the same Snapshot shape can be used in `next` and versioned bundles without mutable URL placeholders.

### 9.2 Revision handling

Embedding the commit that contains a committed generated file creates a circular build problem. The initial Phase 1 Schema therefore does not inject a deployment SHA into committed or published artifacts:

- `next` MUST use `source.ref: main` with `revision_status: mutable`;
- a versioned bundle MUST use its exact release tag with `revision_status: immutable`;
- for each `next` or versioned Snapshot and Manifest, the Pages-published bytes MUST equal that Artifact's committed counterpart;
- artifact checksums MUST cover those unchanged committed bytes;
- an exact source identity consists of the declared ref, canonical contract checksum, auditable input list, and input-set checksum;
- a dirty working tree MUST NOT be represented as a clean released source;
- the build-generated root alias Manifest is a small resolver derived from `versions.json`; it is not a rewritten versioned Manifest and contains no Snapshot bytes;
- a later Schema MAY add a separate publication record, but it MUST NOT mutate Snapshot bytes or create a checksum cycle.

For every declared input, the exporter removes a UTF-8 BOM, normalizes CRLF or CR to LF, and computes SHA-256 over the resulting UTF-8 bytes using `scripts/contract-checksum.mjs`. It then:

1. records `{path, role, sha256}` using repository-relative POSIX paths;
2. sorts entries lexicographically by `path`;
3. serializes `{"files":[...]}` as compact JSON with keys in the fixed order `path`, `role`, `sha256`;
4. hashes that LF-free UTF-8 JSON serialization with SHA-256.

`input_set_checksum` identifies the Bundle-wide union of every file actually read to produce any Bundle artifact. Every Snapshot copies the same Bundle checksum, and the Manifest exposes the complete ordered input list. This checksum is artifact-input identity, not language-review evidence. The Manifest does not contain its own checksum; it records checksums for every other published artifact to avoid self-reference.

Artifact checksums use exact publishable bytes after deterministic generation. Markdown is UTF-8 without BOM, LF line endings, and a final newline. JSON uses stable key order, two-space indentation, UTF-8 without BOM, LF line endings, and a final newline. The site copy MUST preserve those bytes. `versions.json.manifest_sha256` uses the same exact-byte algorithm.

### 9.3 Prose sections

Each Snapshot MUST remain concise and include:

1. Status and source warning
2. Visual register
3. Theme usage
4. Typography roles
5. Layout and density
6. Surface and elevation
7. Motion
8. Component Recipe availability and routing when the feature is not `unavailable`
9. Content rules
10. Do / Do not
11. Task and product-profile routing
12. Verification and adoption boundary

The target is a first-read artifact, not another copy of the full contract. File size MUST be measured and reported during implementation. A hard size gate MUST be added only after real Agent trials establish a useful threshold.

## 10. Theme and contrast parity

The following modes are part of the proposed public distribution:

| Theme | Contrast | English path | Simplified Chinese path |
|---|---|---|---|
| Light | Normal | `en/design.md` | `zh-CN/design.md` |
| Dark | Normal | `en/design.dark.md` | `zh-CN/design.dark.md` |
| Light | More | `en/design.high-contrast.md` | `zh-CN/design.high-contrast.md` |
| Dark | More | `en/design.dark.high-contrast.md` | `zh-CN/design.dark.high-contrast.md` |

Machine values are fixed to `theme: light|dark` and `contrast: normal|more`. File names retain `high-contrast` for readability; `high` is not a third machine spelling.

Every Snapshot MUST expose exactly this resolved color key allowlist, matching the current KIN parity validator:

~~~text
canvas, sidebar,
surface-1, surface-2, surface-3, surface-4,
surface-hover, surface-selected, surface-overlay,
text-primary, text-secondary, text-muted, text-disabled, text-inverse,
icon-primary, icon-muted,
line-subtle, line-default, line-strong,
accent, accent-hover, accent-active, accent-soft,
focus-ring,
monitor, monitor-soft,
positive, warning, negative, critical, offline
~~~

A `contrast: more` Snapshot is resolved by applying the matching KIN High Contrast override set on top of the complete Light or Dark base. Inherited keys remain present. Only keys with a normative High Contrast override are required to differ from the base value. Forced Colors remains a separate verification mode and is not a fifth Snapshot.

All theme snapshots MUST expose the same machine key set and compatible value types. Validation MUST reject:

- a missing or additional theme key;
- a type change across modes;
- an unresolved `dark-`, `light-`, or `contrast-` prefix in the resolved public namespace;
- a broken Token or component reference;
- missing `color-scheme` guidance;
- a contrast mode presented as a different component API.

High contrast is a theme mode, not evidence that every consuming product has passed Forced Colors or manual contrast review.

## 11. Locale contract

English and Simplified Chinese snapshots MUST carry the same:

- Schema fields;
- rule identifiers;
- theme and Token keys;
- product-profile identifiers;
- component identifiers;
- source paths;
- maturity and delivery boundaries.

Locale prose may differ to remain natural. English casing rules MUST NOT be applied to Chinese. Reviewed, versioned, or published Chinese text MUST NOT come from an unreviewed machine translation. Repository-only `next` MAY contain explicitly unreviewed draft copy only while its Manifest reports `complete: false` and `publication.published: false`; that draft MUST remain blocked from versioned bundles and public aliases.

### 11.1 Locale source contract

`distribution/rules.json` exclusively owns each rule's stable ID, requirement level, normative source path, and exact source heading. Locale inputs MUST NOT duplicate those authority fields.

Locale copy inputs live at `distribution/locales/en.json` and `distribution/locales/zh-CN.json`. They are `informative-translation-input`, never normative, and each record declares its own review state. Each localized rule or Recipe-copy record contains:

- the stable ID that resolves through `rules.json` or `component-recipes.source.json`;
- localized summary or instructional copy;
- `review.status: reviewed|unreviewed`;
- a consented public reviewer handle or stable public attestation ID, never an email address;
- `review.normative_source_checksum`;
- `review.localized_content_checksum`;
- an optional `review.reviewed_ref` for audit context, which is not required to be the commit containing the locale file.

The normative checksum is computed over canonical JSON containing the ID, level, source path, source heading, and exact referenced source section. Section extraction starts at the complete matching Heading line, includes its body, and ends immediately before the next Heading of equal or higher level or at end of file. The extracted text receives the same BOM and line-ending normalization before fixed-key-order compact JSON hashing. The localized checksum is computed over canonical JSON containing the ID and localized prose, excluding the review or attestation block. Changing either computed checksum invalidates the review. Changes to unrelated catalogs or the Bundle-wide input checksum do not invalidate language review.

Snapshot and Manifest locale summaries use deterministic aggregate checksums. The generator sorts required locale records by stable ID, serializes compact fixed-key-order JSON arrays of `{id,normative_source_checksum}` and `{id,localized_content_checksum}`, and hashes each UTF-8 byte sequence with SHA-256. Reviewer or attestation IDs are deduplicated and emitted in lexicographic order.

For `reviewed`, reviewer identifiers MUST be non-empty and both attested checksums MUST equal current computed values. For `unreviewed`, reviewer identifiers MUST be empty and attested checksums MUST be `null`. An unreviewed locale is allowed only in `next`, where the Manifest marks it `complete: false`; it MUST NOT enter a versioned bundle or stable alias. A Snapshot summarizes the per-record state and MUST NOT claim `reviewed` unless all required records pass.

A public GitHub handle MAY be emitted only with the reviewer's consent. Otherwise the locale input uses a stable public attestation role ID whose accountable owner is recorded through repository governance without exposing private identity or contact details.

Compact rules MUST use stable IDs, source paths, and source headings:

~~~yaml
rules:
  - id: task-before-explanation
    level: must
    source_path: principles/visual-signature.md
    source_heading: "1. The task appears before the explanation"
  - id: one-dominant-region
    level: must
    source_path: principles/visual-signature.md
    source_heading: "2. One region owns attention"
~~~

Rule ID is the stable identity. The generator MAY derive a display anchor from the heading, but an anchor MUST NOT be used as a parity key or permanent API. Validation checks rule-ID, requirement-level, source-path, and source-heading parity; it also verifies that the heading exists. Human language review remains required for the prose.

Machine requirement levels are fixed to `must`, `must-not`, `should`, and `may`; prose casing does not create another value.

### 11.2 Product-profile routing source

Because KIN has no Pattern machine catalog, `distribution/profiles.json` provides explicit, non-normative routing and conforms to `distribution/schemas/profiles.schema.json`:

~~~json
{
  "profiles": [
    {
      "id": "information-site",
      "contract_path": "patterns/information-site.md",
      "task_intents": ["find", "read", "verify", "cite"]
    }
  ]
}
~~~

Profile IDs MUST match `DESIGN.md` and paths MUST resolve to reviewed Pattern documents. Task intents assist routing; they do not override the user request, route-level implementation brief, or product truth.

## 12. Manifest contract

`design-manifest.json` is the discovery and lifecycle entry point. It MUST conform to a committed JSON Schema in the accepted implementation.

Minimum structure:

~~~json
{
  "$schema": "https://yehyakin.github.io/kin-design-system/next/schemas/manifest.schema.json",
  "schema_version": "2.0.0",
  "kind": "kin-agent-distribution",
  "artifact_status": "generated-derivative",
  "generated": true,
  "normative": false,
  "publication": {
    "state": "repository-only",
    "published": false,
    "public_locators": "unavailable"
  },
  "kin_version": "<resolved KIN lifecycle version>",
  "release_status": "<resolved from DESIGN.md>",
  "latest_stable_contract": "<resolved from DESIGN.md.latest_stable>",
  "channel": "next",
  "source": {
    "contract_path": "DESIGN.md",
    "checksum_algorithm": "sha256",
    "checksum": "<canonical-design-checksum>",
    "input_set_checksum": "<canonical-input-set-checksum>",
    "ref": "main",
    "revision_status": "mutable",
    "inputs": [
      {
        "path": "DESIGN.md",
        "role": "normative-contract",
        "sha256": "<input-checksum>"
      },
      {
        "path": "distribution/locales/en.json",
        "role": "informative-translation-input",
        "sha256": "<input-checksum>"
      }
    ]
  },
  "coverage": {
    "level": "compact",
    "complete_contract": false
  },
  "features": {
    "component_recipes": "unavailable"
  },
  "links": {
    "source_raw_base_url": "https://raw.githubusercontent.com/yehyakin/kin-design-system/main/",
    "source_human_base_url": "https://github.com/yehyakin/kin-design-system/blob/main/",
    "public_base_url": "https://yehyakin.github.io/kin-design-system/next/",
    "versions_registry_url": "https://yehyakin.github.io/kin-design-system/versions.json"
  },
  "schemas": {
    "snapshot": {
      "repository_source_path": "distribution/schemas/snapshot.schema.json",
      "bundle_path": "schemas/snapshot.schema.json",
      "public_url": "https://yehyakin.github.io/kin-design-system/next/schemas/snapshot.schema.json"
    },
    "manifest": {
      "repository_source_path": "distribution/schemas/manifest.schema.json",
      "bundle_path": "schemas/manifest.schema.json",
      "public_url": "https://yehyakin.github.io/kin-design-system/next/schemas/manifest.schema.json"
    }
  },
  "locales": [
    {
      "id": "en",
      "complete": true,
      "review": {
        "status": "reviewed",
        "reviewers": ["<consented public handle or public attestation ID>"],
        "normative_source_checksum": "<normative-source-set-checksum>",
        "localized_content_checksum": "<localized-content-checksum>"
      }
    },
    {
      "id": "zh-CN",
      "complete": true,
      "review": {
        "status": "reviewed",
        "reviewers": ["<consented public handle or public attestation ID>"],
        "normative_source_checksum": "<normative-source-set-checksum>",
        "localized_content_checksum": "<localized-content-checksum>"
      }
    }
  ],
  "modes": [
    {
      "theme": "light",
      "contrast": "normal",
      "locale": "en",
      "artifact_id": "design-en-light"
    },
    {
      "theme": "dark",
      "contrast": "normal",
      "locale": "en",
      "artifact_id": "design-en-dark"
    }
  ],
  "catalogs": {
    "components": {
      "repository_path": "components/catalog.json",
      "raw_url": "https://raw.githubusercontent.com/yehyakin/kin-design-system/main/components/catalog.json",
      "human_url": "https://github.com/yehyakin/kin-design-system/blob/main/components/catalog.json"
    },
    "pages": {
      "repository_path": "pages/catalog.json",
      "raw_url": "https://raw.githubusercontent.com/yehyakin/kin-design-system/main/pages/catalog.json",
      "human_url": "https://github.com/yehyakin/kin-design-system/blob/main/pages/catalog.json"
    },
    "integrations": {
      "repository_path": "integrations/catalog.json",
      "raw_url": "https://raw.githubusercontent.com/yehyakin/kin-design-system/main/integrations/catalog.json",
      "human_url": "https://github.com/yehyakin/kin-design-system/blob/main/integrations/catalog.json"
    },
    "recipes": null
  },
  "delivery": {
    "mode": "contract-first",
    "figma": "variables-only",
    "runtime": "project-owned"
  },
  "artifacts": [
    {
      "id": "design-en-light",
      "kind": "agent-markdown",
      "locale": "en",
      "theme": "light",
      "contrast": "normal",
      "repository_path": "generated/agent/next/en/design.md",
      "bundle_path": "en/design.md",
      "public_url": "https://yehyakin.github.io/kin-design-system/next/design.md",
      "media_type": "text/markdown; charset=utf-8",
      "normative": false,
      "sha256": "<artifact-checksum>"
    }
  ]
}
~~~

The implementation MUST include all four modes and both locale entries, not only the abbreviated example above. Versioned and stable publication require both locales to be complete and reviewed. `next` MAY expose an explicitly incomplete locale under Section 11.1. A Manifest MUST NOT advertise a locale as reviewed unless every required locale record is reviewed against the current normative and localized-content checksums. The Manifest records checksums for every other artifact but MUST NOT contain a self-referential checksum for itself.

Phase 1 output is repository-only. Every Phase 1 Snapshot and Manifest MUST expose the machine-readable `publication` object shown above. `published: false` is authoritative: URLs carried in `links`, `schemas`, catalogs, or artifacts are reserved Phase 2 locators and MUST NOT be fetched or presented as live endpoints. Phase 2 MAY introduce published channels only with a new reviewed Schema contract and the publication gates defined later in this RFC.

The Schema contract uses semantic-version strings. Additive optional fields MAY evolve within one Schema major. Required-field removal or incompatible meaning requires a Schema-major change. The implementation MUST use committed JSON Schemas plus a handwritten structural validator consistent with existing repository tooling. Tests MUST prove representative valid and invalid fixtures agree with the Schemas; adding a runtime validator dependency is out of scope.

### 12.1 Stable, development, and immutable URLs

The manifest MUST distinguish three channels:

| Channel | Purpose | Mutability |
|---|---|---|
| `stable-alias` | Discover the latest released KIN Agent bundle | Mutable alias that advances only on a KIN release |
| `next` | Evaluate the mutable, validated current `main` contract outside the bounded staged release freeze | Mutable and not suitable for production pinning |
| `versioned` | Adopt one released KIN Agent bundle | Immutable |

The public policy is:

- root aliases such as `/design.md` point to the latest stable bundle only;
- development artifacts live under `/next/`;
- immutable release artifacts live under `/versions/vX.Y.Z/`;
- `/versions.json` records available Agent bundles, support status, replacement, deprecation, and security guidance;
- root discovery aliases MUST NOT be treated as production pins;
- `next` MUST NOT satisfy stable adoption evidence.

Root stable Markdown and Recipe aliases MUST be byte-identical build copies of the latest immutable version bundle. The build MUST also copy the target Bundle's referenced Schema bytes to the root `/schemas/` alias so Snapshot locators resolve. These files retain the versioned bundle's canonical URLs. The root alias Manifest alone records `channel: stable-alias`, `resolves_to`, and the target versioned Manifest. It MUST preserve the versioned bundle's artifact checksums and MUST NOT rewrite Snapshot bytes merely to label the alias.

The root resolver conforms to `distribution/schemas/alias-manifest.schema.json`, not the ordinary Bundle Manifest Schema:

~~~json
{
  "$schema": "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/schemas/alias-manifest.schema.json",
  "schema_version": "2.0.0",
  "kind": "kin-agent-distribution-alias",
  "generated": true,
  "normative": false,
  "channel": "stable-alias",
  "resolves_to_version": "3.0.0",
  "target_manifest_url": "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/design-manifest.json",
  "target_manifest_sha256": "<manifest-checksum>",
  "registry_url": "https://yehyakin.github.io/kin-design-system/versions.json"
}
~~~

It is a resolver only and MUST NOT duplicate the target Manifest's modes, inputs, locales, or Artifact list.

KIN 2.3.0 predates this distribution layer. The repository MUST NOT generate files later and claim they were part of the original v2.3.0 release. Until the first release containing Agent artifacts, the stable root aliases remain unavailable; only the clearly labeled `next` channel may be published.

The Pages build currently replaces `.site-dist` from `main`. Immutable bundles therefore use one storage mechanism: committed `generated/agent/versions/vX.Y.Z/` directories. A release export MUST create the directory once in the release commit and fail on overwrite. Normal export MUST update only `next`. Pages MUST copy only registry entries with `publication_state: released`, ignore staged directories, and create root stable aliases from `versions.json.latest_agent_distribution`. It MUST NOT reconstruct an old bundle from the current contract.

### 12.2 Version registry

`generated/agent/versions.json` MUST conform to the Version Schema named by its `$schema`: before the first release this is the reviewed `/next/` copy of `distribution/schemas/versions.schema.json`; after release it is the pinned immutable copy from a released bundle. It MUST NOT claim that an Agent bundle is released before its archive, tag, and GitHub Release pass validation. Before the first stable Agent bundle, `latest_agent_distribution` is `null`; the list MAY contain a staged entry that is not publicly copied. After the expected first eligible release and promotion commit, an illustrative registry is:

~~~json
{
  "$schema": "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/schemas/versions.schema.json",
  "schema_version": "2.0.0",
  "kind": "kin-agent-distribution-versions",
  "artifact_status": "generated-derivative",
  "generated": true,
  "normative": false,
  "editable": false,
  "latest_agent_distribution": "3.0.0",
  "versions": [
    {
      "version": "3.0.0",
      "publication_state": "released",
      "support_status": "supported",
      "repository_directory": "generated/agent/versions/v3.0.0",
      "manifest_url": "https://yehyakin.github.io/kin-design-system/versions/v3.0.0/design-manifest.json",
      "manifest_sha256": "<manifest-checksum>",
      "kin_tag": "v3.0.0",
      "design_checksum": "<canonical-design-checksum>",
      "input_set_checksum": "<canonical-input-set-checksum>",
      "replacement": null,
      "advisory_url": null
    }
  ]
}
~~~

`publication_state` is one of `staged` or `released`. A staged entry has no public Manifest URL or active support status and cannot be selected by `latest_agent_distribution`. Promotion changes only reviewed lifecycle metadata: it sets `released`, adds the immutable URL and support status, advances the latest pointer, and atomically adopts the target bundle's Registry Schema version when required. `support_status` is one of `supported`, `superseded`, or `unsupported` for released entries. A superseded entry MUST identify a supported released replacement. Optional release dates MUST come from reviewed release metadata, never generation time. Current-tree checks verify the Registry and recorded hashes against the Schema named by `$schema`; before the first release that is the reviewed `/next/` Schema, and afterwards it is an immutable released Schema. A full-history release workflow MUST compare every released directory and file list against the matching Git tag; later source generation MUST NOT participate in that comparison.

`latest_agent_distribution` MUST be `null` or reference an entry whose `publication_state` is `released` and `support_status` is `supported`. Changing the pointed entry to `superseded` or `unsupported` MUST atomically move the pointer to a supported replacement or set it to `null` before Pages rebuilds root stable aliases. The Version Schema and site validation MUST enforce this invariant.

Before the first released Agent bundle, the Registry MAY reference the `/next/` Version Schema and is public only while that reviewed `next` Schema is addressable. Once any Agent bundle is released, `$schema` MUST remain pinned to a Version Schema contained in a released immutable bundle even when rollback temporarily sets `latest_agent_distribution` to `null`. A distribution-Schema upgrade validates the pre-promotion Registry under the old pinned Schema and the post-promotion Registry under the target bundle's Schema, then advances `$schema` and `schema_version` atomically. The staged entry MUST remain representable under the previously pinned Schema until that promotion.

Before the first release only, the mutable `/next/` Version Schema and `schema_version` MAY refresh in place without a promotion. Such a refresh MUST leave every staged entry byte-for-byte unchanged, keep `latest_agent_distribution` null, remain on the `/next/` Schema locator, and validate every staged entry under the refreshed Schema. It MAY be committed with the reviewed Schema and regenerated artifacts because there is no immutable public Registry contract yet. After the first release, this exception no longer applies.

## 13. Component recipe index

`component-recipes.json` joins source-backed visual defaults to canonical component identity without creating runtime code. It is emitted only when `features.component_recipes` is `partial` or `available`. The index MUST declare `coverage: partial` until every in-scope stable component has a source-backed Recipe.

`component-recipes.source.json` MUST declare its reviewed scope explicitly rather than inferring scope from the Recipes that happen to exist:

~~~json
{
  "$schema": "./schemas/recipe-source.schema.json",
  "scope": {
    "component_ids": ["button", "icon-button", "text-input"]
  },
  "recipes": []
}
~~~

`coverage` can become `available` only when every declared `scope.component_ids` entry has a source-backed Recipe that passes validation. Adding or removing a scoped component requires review; the exporter MUST NOT redefine scope from its own output.

Each Recipe MUST include:

~~~json
{
  "id": "button",
  "canonical_name": "Button",
  "catalog_tier": "core",
  "catalog_status": "stable",
  "recipe_status": "partial",
  "contract_paths": [
    "DESIGN.md",
    "components/core-states.md",
    "components/micro-interactions.md",
    "components/actions-and-selection.md"
  ],
  "reference_paths": [
    "site/index.html",
    "examples/workspace-reference/index.html",
    "examples/workspace-reference/core-components.html",
    "examples/workspace-reference/motion.html"
  ],
  "test_paths": [
    "tests/visual/site.spec.js",
    "tests/visual/workspace.spec.js",
    "tests/visual/normal-motion.spec.js",
    "tests/visual/accessibility-verification.spec.js"
  ],
  "integration_ids": [],
  "catalog_product_families": ["all"],
  "catalog_support": {
    "themes": true,
    "responsive": true,
    "keyboard": true,
    "touch": true,
    "reduced_motion": true
  },
  "catalog_manual_checks": ["accessible-name review"],
  "catalog_known_gaps": ["visual regression coverage for the complete variant and state matrix"],
  "anatomy": ["container", "leading-icon-slot", "label", "trailing-status-slot"],
  "dimensions": null,
  "token_refs": {
    "radius": "rounded.sm",
    "typography": "typography.ui",
    "surface": null,
    "foreground": null
  },
  "required_states": ["rest", "hover", "focus-visible", "pressed", "busy", "success", "error", "disabled"],
  "recipe_known_gaps": ["dark foreground binding crosses the Light theme namespace"]
}
~~~

Any missing Recipe value requires a later normative Token or component decision. This RFC defines the distribution shape and may expose only values already backed by reviewed sources.

Rules:

- Catalog identity, tier, status, contract paths, reference paths, test paths, product families, support, manual checks, and known gaps MUST be copied exactly from `components/catalog.json` into the corresponding `catalog_*` fields.
- `catalog_status` and `recipe_status` are independent.
- `recipe_status` is one of:
  - `available`: every exported binding is backed by a reviewed normative source and passes theme validation;
  - `partial`: some source-backed bindings exist and gaps remain explicit;
  - `routing-only`: only catalog identity and contract routing are safe to expose;
  - `unavailable`: no trustworthy Recipe exists and it MUST NOT enter quick suggestions.
- A runtime-integrated package MUST NOT promote a candidate component to stable.
- Missing visual geometry MUST remain `null` and appear in `recipe_known_gaps`; it MUST NOT be invented during export. A component with no trustworthy source-backed Recipe fields remains `recipe_status: unavailable`.
- Recipe IDs MUST map to canonical catalog IDs.
- Repository paths remain repository-relative; the channel Manifest supplies separate version-aware canonical URLs for contracts, references, integrations, and tests.
- Candidate, draft, conditional, and deprecated status MUST remain visible.
- Recipes MUST NOT contain product data, backend behavior, permission logic, or copied third-party source.
- Canonical names and IDs MAY remain English. Human instructional prose such as `use_when` and `avoid_when` lives only in the locale inputs, MUST exist in each published locale or be omitted, and MUST NOT silently fall back to English in a reviewed Chinese artifact.

### 13.1 Current source gaps

The initial exporter MUST report, not silently repair, current Frontmatter gaps:

- the Dark Button foreground references `colors.light-surface-1` rather than a theme-neutral `on-accent` semantic Token;
- `popover-dark` has no Light counterpart;
- `dialog-light` has no Dark counterpart;
- several Frontmatter entries are state or theme fragments rather than canonical components.

Correcting these values requires a separate normative Token or Recipe change with migration and visual review. The distribution generator MUST NOT invent the missing aliases or counterparts.

## 14. Agent read flow

An Agent using the distribution SHOULD follow:

1. Read the user request, repository `AGENTS.md` or local instructions, security and permission boundaries, product truth, and implementation brief.
2. Read the pinned KIN `design-manifest.json`.
3. Select a reviewed locale, resolved theme, contrast mode, the route's declared product profile, and task.
4. Read one compact theme Snapshot.
5. Route to the matching detailed KIN contract or catalog entry.
6. Inspect the consuming project's local Tokens, primitives, implementation, and preserved behavior.
7. Implement and verify the real workflow.

Generated KIN guidance never expands user authorization, weakens repository instructions, or changes consuming-product sources of truth.

The complete `DESIGN.md`, `DELIVERY.md`, and governance set remain required when the task:

- changes KIN itself;
- changes a normative Token or interaction contract;
- changes the delivery boundary;
- changes adoption evidence or claims;
- adds a component, page family, product profile, or runtime integration;
- cannot be resolved by the compact contract and routed document.

The KIN Skill SHOULD eventually use this Manifest as its portable entry point while retaining a pinned offline Snapshot. Skill changes belong to a later implementation phase and MUST preserve existing source precedence and stop conditions.

Inside the KIN repository, the current `AGENTS.md` full-reading requirements remain in force. A compact bundle may satisfy the initial read only in a consuming project whose reviewed local instructions explicitly adopt that route. Full pinned contracts remain mandatory for KIN-core changes, normative or delivery changes, missing distribution coverage, and any verification or adoption claim.

## 15. Public URL contract

The canonical Pages base is `https://yehyakin.github.io/kin-design-system`. Repository-relative paths, bundle-relative paths, and public URLs MUST remain separate fields. After the Phase 2 publication gates are implemented, the Pages build MUST publish only endpoints eligible for the current Registry state: `next` when its Manifest explicitly permits publication; versioned endpoints only for `publication_state: released`; and root stable aliases only when `latest_agent_distribution` is non-null. Phase 1 MUST publish none of these generated Agent paths. The reserved path families are:

~~~text
https://yehyakin.github.io/kin-design-system/design-manifest.json
https://yehyakin.github.io/kin-design-system/design.md
https://yehyakin.github.io/kin-design-system/design.dark.md
https://yehyakin.github.io/kin-design-system/design.high-contrast.md
https://yehyakin.github.io/kin-design-system/design.dark.high-contrast.md
https://yehyakin.github.io/kin-design-system/zh/design.md

https://yehyakin.github.io/kin-design-system/next/design-manifest.json
https://yehyakin.github.io/kin-design-system/next/design.md
https://yehyakin.github.io/kin-design-system/next/design.dark.md
https://yehyakin.github.io/kin-design-system/next/design.high-contrast.md
https://yehyakin.github.io/kin-design-system/next/design.dark.high-contrast.md
https://yehyakin.github.io/kin-design-system/next/zh/design.md

https://yehyakin.github.io/kin-design-system/versions/vX.Y.Z/...
https://yehyakin.github.io/kin-design-system/versions.json
~~~

Each channel also publishes the Schemas it references. `component-recipes.json` is published only when the channel feature state is `partial` or `available`. The abbreviated list implies the corresponding Dark, contrast, and Chinese files defined by the Manifest; it is not a second source of the file matrix.

Rules:

- English is the default locale within every channel; Simplified Chinese uses `/zh/` to match the current showcase.
- Root aliases advance only when a stable release containing the artifacts is published.
- `next` normally follows validated current `main`, mirrors its exact lifecycle, and carries no compatibility promise. When `main` is an untagged release candidate with a staged Agent archive, the complete Pages deployment MUST be deferred because the same artifact contains root showcase release copy and links that are not yet externally true. During that bounded interval, public `next` remains at the preceding verified deployment; the final `release.published` trigger refreshes it. It MAY also temporarily equal the latest stable contract immediately after a release.
- Mutable `next` source URLs are convenience locators. A consumer MUST verify fetched source bytes against the declared checksum and stop or use a stable versioned Bundle when they do not match.
- Versioned bundles are immutable and MUST NOT be moved, reused, or rewritten.
- The response body MUST be raw Markdown or JSON, not an HTML rendering.
- Hosting SHOULD return `text/markdown; charset=utf-8` for Markdown. If GitHub Pages cannot guarantee that MIME type, the limitation MUST be measured and recorded rather than hidden.
- Every public Snapshot resolves logical locators through the Manifest at its publication Bundle root. Root aliases use the `stable-alias` resolver, which forwards to the immutable versioned Manifest.
- A `next` artifact MUST NOT link to stable/root recipes or manifests.
- A versioned artifact MUST NOT link to `main`, `next`, or mutable-root contracts and catalogs; its canonical URLs MUST pin the exact tag.
- The root alias Manifest identifies `stable-alias`, target version, and immutable canonical Manifest; byte-identical Snapshot aliases do not rewrite their embedded channel.
- Production adoption MUST pin an immutable versioned Pages URL, exact release-tag raw URL, or immutable release asset together with the declared checksums.
- The build MUST NOT expose repository internals, secrets, local paths, test artifacts, or draft product data.
- `scripts/build-site.mjs` MUST copy an explicit artifact allowlist rather than publish the complete source directory.
- The local reference server MUST map `.md` to an appropriate Markdown media type so local and deployed checks exercise comparable content.

## 16. Generation behavior

The exporter MUST:

1. read and validate the KIN lifecycle from `DESIGN.md`;
2. compute the canonical UTF-8 SHA-256 used by adoption tooling;
3. read generated Token output only after confirming it matches `DESIGN.md`;
4. resolve each supported mode to one stable key namespace;
5. join component, page, and integration catalog metadata without changing maturity;
6. route product profiles to reviewed pattern documents through explicit distribution configuration because KIN has no machine Pattern catalog;
7. apply reviewed locale inputs by stable rule or Recipe ID and reject stale review metadata;
8. produce deterministic UTF-8 with LF line endings and a final newline;
9. sort machine keys deterministically;
10. generate and validate the complete output set in a sibling `next.tmp-*` directory before modifying tracked output;
11. rename existing `next` to `next.backup-*`, rename the validated temporary directory to `next`, restore the backup on failure, and remove the backup only after success;
12. support `--check` without rewriting files.

Release export creates a new version directory and never overwrites an existing one. The exporter MUST NOT claim cross-platform transactional replacement: Windows file locks can still interrupt a directory exchange. A failed exchange MUST attempt to restore the backup and report the exact failed operation plus recovery state.

The exporter MUST NOT:

- access the network;
- invoke an LLM or other generative service;
- install dependencies;
- execute consuming-product code;
- infer missing component recipes;
- translate prose automatically;
- rewrite normative documents;
- include timestamps that make deterministic files drift;
- claim manual or production verification.

The exporter MUST NOT transclude external documentation or follow prompt-like instructions from references. External sources remain attribution links in `REFERENCES.md`.

## 17. Validation and CI

The accepted implementation MUST add `agent:check:generated` to `npm run validate` after the existing Token checks, and the complete `agent:check` to `npm run site:check` and the minimum Node.js compatibility job. A manually dispatched Pages build MUST NOT bypass current-tree Agent-artifact drift checks.

`agent:check:history` is separate. It runs in the release and promotion workflows with `fetch-depth: 0` and compares released archives with Git tags. Ordinary Pages and site checks MAY retain shallow checkout and validate the current registry hashes only; they MUST NOT fail merely because full Git history is unavailable.

Validation MUST cover:

### Structure

- required files and Schema versions exist;
- JSON and YAML parse and match their committed Schemas;
- handwritten structural validators and Schema fixtures agree;
- generated flags and normative status are correct;
- source checksum matches canonical `DESIGN.md`;
- the exposed ordered input list reproduces `input_set_checksum`;
- release lifecycle matches `DESIGN.md`, package files, README badges, and release rules.

### Theme parity

- every mode exposes the same key set and types;
- every resolved key maps to an existing KIN Token;
- no theme prefix leaks into the public resolved namespace;
- every `contrast: more` output equals its complete base theme plus the reviewed High Contrast overrides;
- only keys with normative High Contrast overrides are required to differ from the base mode.

### Locale parity

- required locales exist;
- rule IDs, requirement levels, source paths, and source headings match;
- product, component, page, and integration IDs are not translated;
- local links resolve;
- referenced headings exist;
- stale locale review metadata resets to `unreviewed`;
- no locale claims review that has not occurred.

### Catalog integrity

- recipe IDs resolve to component catalog entries;
- Recipe artifacts are absent when the feature state is `unavailable`;
- all `catalog_*` fields, maturity, paths, support, manual checks, and catalog known gaps match the component catalog exactly;
- Recipe-specific gaps remain separate from catalog gaps;
- contract, reference, test, and integration path arrays resolve;
- candidate and draft entries remain labeled.

### Site output

- all public endpoints required for the current channel exist in `.site-dist`;
- Markdown and JSON bodies are not converted into HTML;
- URLs contain no local absolute paths;
- stable-alias, mutable `next`, and immutable release URLs are not confused;
- the stable root exists only when `latest_agent_distribution` is non-null and resolves to that released version rather than `next`;
- `next` resolves to the current validated `main` lifecycle and checksum except during the documented untagged staged-release freeze, when the complete Pages deployment remains at the preceding verified revision;
- current published version files match `versions.json` checksums and staged directories are absent from `.site-dist`;
- Pages-published `next` and versioned Snapshot and Manifest bytes match committed output under their declared Schema version; the root alias Manifest validates as a registry-derived resolver;
- cross-channel links satisfy the immutable and mutable rules in Section 15;
- required headers or MIME limitations are recorded.

### Full-history release validation

- checkout has complete tag history;
- every released archive's file list and bytes match the matching immutable Git tag;
- a promotion target's local and remote tags resolve to the archived release commit;
- a promotion target has a matching GitHub Release before the focused promotion commit may advance `latest_agent_distribution`;
- a promotion target has successful Tag CI and a successful version-specific read-only eligibility run on the exact pre-promotion `main` revision;
- staged entries cannot be selected by a stable alias or support claim.

### Determinism and security

- two exports from identical inputs are byte-identical;
- `--check` reports drift;
- no environment variables, credentials, user data, or remote content appear;
- generated Markdown cannot inject unreviewed executable HTML or scripts.

Automated validation does not prove that an Agent produces a good interface. Real Agent trials and consuming-product screenshot reviews remain separate evidence.

## 18. Ownership and review

| Responsibility | Owner |
|---|---|
| Product direction and contract boundary | [@yehyakin](https://github.com/yehyakin) until explicitly delegated |
| Artifact Schema and generator | [@yehyakin](https://github.com/yehyakin) as accountable owner; implementation MAY be delegated |
| Theme and component mapping | [@yehyakin](https://github.com/yehyakin) as accountable owner; review MAY be delegated |
| English and Chinese copy review | Accountable owner: [@yehyakin](https://github.com/yehyakin); each locale record MUST carry a consented reviewer handle or governed public attestation ID |
| Security and release review | [@yehyakin](https://github.com/yehyakin) until explicitly delegated |
| Public Pages deployment | [@yehyakin](https://github.com/yehyakin) |
| Pages recovery and stable-alias rollback | [@yehyakin](https://github.com/yehyakin) |
| Consuming-product implementation and verification | Consuming-product owners |

Generated files MUST NOT be accepted without a reviewer who understands both the source contract and the affected locale or theme.

This table assigns accountability, not evidence that a language review occurred. Stable publication remains blocked until locale records carry valid review attestations and pass the checksum invalidation rules in Section 11.1.

### 18.1 Security, privacy, and authority

The distribution contains static Markdown and JSON only. It MUST NOT include:

- telemetry, cookies, executable remote includes, or active scripts;
- credentials, owner email addresses, private or unrelated personal data, unpublished contact details, reviewer identifiers without consent, private repository context, or local absolute paths;
- consuming-product source, data, routes, permissions, analytics, or environment values;
- commands that install dependencies, mutate a repository, authenticate, deploy, synchronize remote design assets, or run migrations;
- language that overrides repository instructions, user authorization, product security rules, or consuming-product sources of truth.

Checksums establish content integrity, not authorship or cryptographic signing. The distribution MUST NOT claim signed provenance unless a separately reviewed signing system exists.

## 19. Compatibility

- Existing `DESIGN.md`, Token exports, adoption configurations, evidence files, references, and React adapters remain valid.
- No consuming project is required to adopt the distribution layer.
- Existing Agents may continue reading the full contract.
- The manifest Schema follows its own version and can evolve independently from the KIN contract version.
- Additive fields are backward-compatible; removing or changing a required field requires a manifest Schema migration.
- Generated component recipes do not change the component catalog maturity.
- A future stable Agent snapshot MUST be tied to a KIN release; it MUST NOT silently update under an immutable version.

### 19.1 Distribution Schema lifecycle

- KIN SemVer continues to identify design-contract semantics.
- The Agent distribution uses an independent Schema version for parser compatibility.
- Additive optional fields MAY remain compatible within one Schema major.
- Removing or renaming a required field requires a distribution-Schema major and migration guidance.
- A rule or Recipe semantic change still follows KIN SemVer; the distribution Schema MUST NOT hide a normative change.
- Generator-only corrections change artifact hashes and belong in `CHANGELOG.md`, but MUST NOT pretend the KIN contract changed.

### 19.2 Support and deprecation

- Immutable version directories remain addressable.
- Support status and replacements live in `versions.json` and security advisories rather than by editing old bundles.
- Root stable aliases advance only after the matching release is validated.
- `next` has no compatibility guarantee.
- Stable rule and Recipe IDs MUST be marked deprecated with a replacement for at least one stable KIN release before removal. Semantic removal follows KIN SemVer; required Schema-field removal requires a distribution-Schema major. A documented security exception MAY remove an unsafe entry earlier.
- Only current `main` and the latest stable release receive fixes under the existing security policy.

For rollback and migration language, the supported deprecation period is the interval from the first stable release that marks an ID deprecated through at least the next stable release. Addressability of an immutable bundle is not the same as active support.

## 20. Rollout

### Phase 0 — Approve the RFC

- Review the artifact boundary, paths, Schema, ownership, and stable/`next`/versioned URL policy.
- Resolve the locale and release questions below.
- Do not implement until the proposal is accepted.

### Phase 1 — Governing contracts, Manifest, and complete four-mode Snapshot matrix

- Incorporate the accepted boundaries into `DELIVERY.md`, `DESIGN.md` Section 23, `ROADMAP.md`, `RELEASING.md`, `CONTRIBUTING.md`, root `AGENTS.md`, Agent routing, public documentation, and `CHANGELOG.md` where applicable.
- Add the mandatory pre-Tag release-validation path, package-script split, and required-file validation before a release commit can use the new Archive flow.
- Implement deterministic manifest generation.
- Generate Light and Dark, Normal and More Contrast Snapshots for English and Chinese.
- Add drift, lifecycle, Token-key, and locale-ID validation.
- Prepare and validate the `/next/` Artifact tree without publishing it to Pages.
- Do not change KIN Token values or Skill routing.

### Phase 2 — Pages, Version Registry, and Stable Alias

- Publish raw Markdown and JSON through the existing validated Pages build under the correct channel.
- Defer the complete Pages deployment for an untagged staged release candidate so neither the root showcase nor `/next/` advances before the formal Release trigger.
- Add site-output and response verification.
- Add retained staged/released version-bundle and `versions.json` support.
- Add post-tag promotion and stable-alias publication gates.
- Add `.github/workflows/validate-agent-release.yml` with `workflow_dispatch`, an explicit version input, `fetch-depth: 0`, `agent:check:history`, local and remote Tag verification, GitHub Release verification, read-only `contents` permission, and a clear promotion eligibility result.
- Document stable-alias, mutable `next`, and immutable versioned use.

### Phase 3 — Component recipe index

- Define the source-backed, non-normative Recipe mapping.
- Start with a small set of high-frequency stable components.
- Keep unavailable geometry explicit.
- Add reference and maturity validation.
- Propose any missing geometry, semantic Token, or component behavior as a separate normative contract change before exporting it.

### Phase 4 — Skill and adoption routing

- Package a pinned compact offline snapshot with the Skill.
- Route ordinary product tasks through manifest, theme, intent, and one detailed contract.
- Retain complete-contract reading for normative and delivery changes.
- Prove that a standalone installed Skill does not depend on an adjacent full repository.

### Phase 5 — Consuming-product evidence

- Run a controlled entry-path comparison on one real representative 52.mk product workflow in its available test environment and one materially different ecommerce-operations workflow.
- Use the same task brief, content, state, viewport, and verification criteria.
- Record instruction adherence, visual-signature findings, context size, missing-contract lookups, corrections, and rollback.
- Make compact-manifest routing the default Skill entry path only if it improves implementation quality without weakening product or verification boundaries.

Each phase requires its own focused change, validation report, and review stop.

## 21. Rollback

Before Skill or adoption routing changes, rollback is:

1. remove the generated Agent directory and exporter;
2. remove Pages copy and validation entries;
3. restore the previous package scripts;
4. continue using `DESIGN.md`, existing catalogs, and current Skill routing.

After consuming products begin pinning a released Agent artifact:

- published immutable files MUST NOT be rewritten;
- a faulty artifact is corrected in a patch release;
- an incorrect stable alias is reverted to the previous known-good bundle without modifying the faulty immutable version;
- a faulty immutable version is marked unsupported or superseded in `versions.json` and corrected in a patch release;
- `next` MAY be reverted with the repository commit;
- manifest deprecation MUST name the replacement and supported period;
- consuming projects retain their pinned local contract and rollback path.

This rollout MUST NOT be coupled to a database, backend, route, permission, Figma ID, or public runtime API change.

## 22. Risks

### A second source of truth

Mitigation: generated-only files, source checksum, warning headers, byte-drift checks, and links to the normative contract.

### Recipe-first implementation

Mitigation: every recipe links to behavior and maturity; the snapshot states that behavior outranks geometry.

### Agent support becoming the product direction

Mitigation: the layer remains under the delivery/adoption track defined in `VISION.md`; complete workflows and human review remain the outcome.

### Locale drift

Mitigation: stable rule IDs, exact source paths and headings, checksum invalidation, parity checks, auditable human-review attestations, and no unreviewed machine translation.

### Theme drift

Mitigation: one generator, identical keys, existing Token parity checks, and no handwritten variants.

### Unstable public URLs

Mitigation: stable, `next`, and versioned channels are separate; production use requires immutable versioned artifacts.

### Alpha-format dependency

Mitigation: KIN owns its manifest Schema and treats third-party `design.md` structure as an observation. The current `@google/design.md` export remains pinned and is not made the authority for this layer.

### Windows path and filename collisions

Mitigation: generated source files live below `generated/agent/`; root lowercase public paths are created only in the site build output.

## 23. Decisions required for acceptance

The recommended decisions are:

1. Keep `DESIGN.md` as the only normative source.
2. Commit generated Agent artifacts for offline use and diff review.
3. Publish English at root and Simplified Chinese under `/zh/`.
4. Reserve root aliases for latest stable, use `/next/` for mutable current `main`, and retain immutable `/versions/vX.Y.Z/` bundles.
5. Do not backfill KIN 2.3.0 as though the distribution shipped with that release.
6. Keep each declared Schema version's committed and published bytes identical; identify `next` by `main` plus checksums and released bundles by exact tag plus checksums.
7. Generate all four existing KIN theme/contrast modes.
8. Keep component Recipe work separate from the first manifest implementation.
9. Store released bundles only as immutable committed version directories and build root aliases from the registry.
10. Use reviewed, checksum-bound locale inputs rather than generated translations.
11. Require controlled consuming-product comparison evidence before changing the default Skill read path.

## 24. Acceptance criteria

This RFC may move from `proposed` to `accepted` when:

- the artifact boundary does not change KIN's contract-first model;
- repository and public paths avoid Windows case collisions;
- generated and normative ownership is unambiguous;
- development and immutable release URLs cannot be confused;
- stable aliases cannot resolve to development or retroactively fabricated bundles;
- locale and theme parity rules are approved;
- the revision/checksum circularity is resolved without false metadata;
- component recipes cannot overstate maturity or runtime support;
- implementation phases are independently reversible;
- support, deprecation, and immutable-version retention are owned;
- named accountable owners exist for generation, design mapping, release, and rollback, and stable publication blocks until every locale record carries a valid human-review attestation;
- the comparison sources are recorded in `REFERENCES.md`;
- no current Token or component behavior is silently changed by acceptance.

Implementation may begin only after the RFC status is changed to `accepted` through review.
