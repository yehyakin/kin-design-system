# KIN delivery model

Status: normative

KIN uses a contract-first delivery model. The core repository defines product and interaction contracts, machine-readable Tokens, framework-free references, verification tooling, and adoption records. It is not a published Figma component library and it is not a universal runtime component package.

This decision prevents documentation examples, design-tool interoperability, and production code from being mistaken for the same artifact.

## Current decision

The KIN core repository MUST remain `contract-first` until a separately reviewed proposal changes this boundary.

The machine-readable adoption values are `mode: contract-first`, `figma: variables-only`, and `runtime: project-owned`.

| Layer | Core repository delivers | Core repository does not claim |
|---|---|---|
| Product contract | `VISION.md`, `DESIGN.md`, the visual signature, principles, component contracts, product patterns, terminology, and maturity catalogs | One copied layout or visual treatment suitable for every product |
| Tokens | Normative source values plus generated CSS, DTCG, Tailwind-compatible, and Figma Variables interoperability files | Automatic synchronization with an existing design library |
| Reference interfaces | Framework-free deterministic examples and browser tests | Production-ready application components |
| Agent support | KIN Skill, repository instructions, compact generated snapshots, audit candidates, adoption checks, and evidence templates | Autonomous product redesign without project context or review |
| Figma | A create-only Variables payload and documented interoperability boundary | Published component sets, library ownership, update/delete operations, credentials, or stable Figma node IDs |
| Runtime code | Reference HTML, CSS, JavaScript, optional integration contracts, and the isolated private `@kin-design/react` pre-release laboratory | A published universal React package, Vue/Web Components/native SDKs, or framework support commitments |

- Consuming projects MUST own their production components, dependencies, rendering boundaries, data behavior, and release process.
- Reference code MUST NOT be copied into production without reviewing semantics, accessibility, performance, security, and local architecture.
- Generated files MUST identify their source and MUST NOT be edited as if they were the normative contract.
- A third-party integration document permits a bounded use; it does not make the package a universal dependency.

## What may be consumed directly

Consuming projects MAY use:

- a pinned `DESIGN.md` contract;
- the matching component and product-pattern documents;
- generated Token output after mapping semantic names to the local architecture;
- framework-free references as behavioral evidence;
- the KIN Agent Skill;
- read-only audit, adoption, and validation tooling;
- documented adapters when the product has the corresponding need;
- a pinned private `@kin-design/react` subpath as an explicitly experimental migration target in a reviewed React product.

They MUST record the exact reviewed contract revision, local contract checksum, local mappings, verification results, exceptions, and owners. The revision and checksum remain optional for compatibility with earlier 2.0 configuration files, but new adoption records SHOULD supply them. Contract checksums MUST use KIN's canonical UTF-8 text form: remove an optional BOM and normalize CRLF or CR line endings to LF while preserving all other content. The machine-readable adoption evidence format is defined in [`adoption/kin.evidence.schema.json`](./adoption/kin.evidence.schema.json).

New adoptions MUST select the primary product profile explicitly and SHOULD record route-level profiles for hybrid products. They MUST complete the project-owned implementation brief defined in [`adoption/implementation-brief.md`](./adoption/implementation-brief.md) before moving evidence to `mapped`.

## Generated Agent distribution

The Agent Distribution Layer is a compact delivery surface compiled from the existing contract. It does not create a second design system.

- `DESIGN.md` remains the normative design source.
- `generated/agent/next/` is a committed, deterministic, non-normative derivative of current `main` inputs.
- A fully reviewed `next` Manifest MAY expose `publication.state: published-development` and publish raw Markdown and JSON to `/next/`. It remains mutable, normally follows validated `main`, and MUST NOT serve as a production pin. When `main` is an untagged release candidate with a staged Agent archive, the complete Pages deployment MUST be deferred so the root showcase cannot claim a nonexistent Release; public `/next/` therefore remains at the preceding verified deployment until the formal `release.published` trigger.
- If any required locale review is incomplete or stale, `next` MUST remain `repository-only` with `publication.published: false` and Pages MUST omit the channel.
- `generated/agent/versions/vX.Y.Z/` is a create-once archive. Release export MUST fail on overwrite and stage the matching entry in `generated/agent/versions.json` without advancing the stable alias.
- A staged archive MAY become `released` only after its local and remote annotated Tag, complete history, successful Tag CI, final GitHub Release, and version-specific read-only eligibility run resolve to an eligible pre-promotion `main` revision containing the archive commit. The promotion command MUST independently verify this evidence immediately before mutation. Promotion MUST be a focused Registry-only commit and MUST NOT rewrite archived bytes.
- Pages MUST publish only Registry entries marked `released`. Root stable Snapshot and Schema aliases MUST be byte-identical copies of the supported version selected by `latest_agent_distribution`; the root Manifest is a small Registry-derived resolver.
- Before the first eligible Agent release, `latest_agent_distribution` MUST remain `null` and root stable aliases MUST remain absent. KIN 2.3.0 predates this layer and MUST NOT be backfilled.
- The distribution MUST expose all four KIN theme and contrast modes in English and Simplified Chinese while preserving explicit locale-review state.
- A locale marked `unreviewed` MAY appear only in `next`; it MUST block any later versioned bundle or stable alias until checksum-bound human review is recorded.
- `component_recipes` MUST remain `unavailable` and `component-recipes.json` MUST remain absent until the separate Recipe phase defines reviewed source mappings.
- Generated Snapshots MUST identify themselves as generated, non-normative, non-editable, and compact. `next` MUST identify mutable `main`; versioned bundles MUST identify the exact immutable Tag and delegate live publication state to the Registry.
- Export and validation MUST use local repository inputs only, produce deterministic UTF-8/LF output, and fail on drift without rewriting files in check mode.
- Production use MUST pin an immutable versioned URL and verify declared checksums. The mutable root alias and `/next/` are discovery and evaluation surfaces, not stable-adoption evidence.

Reading or generating a Snapshot does not establish Token compatibility, component mapping, visible KIN quality, verified adoption, or production observation. Those claims continue to require the evidence stages below.

## Figma boundary

The current Figma output is interoperability data, not a library publication workflow.

The core repository MAY:

- generate a reviewed Variables create payload;
- describe collection, mode, alias, and naming intent already represented by repository output;
- validate generated data against the normative Token source;
- document a manual import or mapping boundary.

The core repository MUST NOT:

- store or request personal access credentials;
- guess an existing team's file, collection, variable, component, or node IDs;
- update or delete remote design assets;
- claim a Figma component exists because an HTML reference exists;
- claim Code Connect coverage when no maintained mapping exists;
- publish a library from an unattended documentation workflow.

### Gate for a future Figma library

A Figma component library MUST be a separately owned deliverable. Before it is approved, the proposal MUST include:

1. an eligible team and test file;
2. library owner, publisher, reviewers, and recovery owner;
3. component inventory mapped to the KIN catalog;
4. variant and property model;
5. variable collection and mode mapping;
6. accessibility and responsive annotation model;
7. publish, update, deprecate, restore, and rollback procedures;
8. immutable release mapping between KIN and the library revision;
9. consuming-product evidence from at least one real workflow;
10. a plan for drift between documentation, design assets, and production code.

Until those conditions are met, KIN MUST describe Figma support as Variables interoperability only.

## Runtime boundary

KIN does not currently publish a supported runtime package. The repository contains an isolated, private pre-release React integration laboratory at [`packages/react/`](./packages/react/). It runs selected official packages through KIN-owned semantic adapters, but it is not a universal dependency, a stable release, or evidence that a consuming product has completed KIN adoption.

Framework-free references exist to make behavior inspectable and testable. They intentionally avoid establishing framework APIs, styling inheritance, application state, server/client boundaries, or dependency commitments for consuming products.

Consuming projects SHOULD adapt KIN through their existing primitives. They MUST NOT introduce a second component framework only to make an interface appear KIN-like.

A React product MAY evaluate a pinned private adapter when it already uses the matching upstream package or the adapter materially lowers implementation risk. It MUST retain project ownership of data, authorization, routing, recovery, analytics, release, and rollback. Candidate component contracts remain under `/experimental/*`; development-only tooling remains under `/dev/*`.

Runtime adapters MUST prefer a thin composition boundary around the official package. They MUST preserve upstream behavior and motion unless a documented accessibility, security, compatibility, or product-semantic conflict requires an override. Visual adaptation SHOULD use supported public styling and theme interfaces. Copying or forking upstream source is not the meaning of direct integration and remains outside the default repository boundary.

### Gate for a future runtime package

A published runtime implementation such as `@kin-design/react` MUST be proposed and released separately from the contract core. Approval requires:

1. a named maintainer and support policy;
2. package scope, framework, rendering, styling, and browser commitments;
3. a public API mapped to stable catalog components only;
4. semantic-version and deprecation policy;
5. SSR, hydration, accessibility, localization, RTL, motion, and performance tests;
6. dependency and bundle-cost records;
7. security and supply-chain ownership;
8. migration and rollback documentation;
9. evidence from at least two materially different consuming products;
10. proof that project-owned adapters are no longer the lower-cost option.

Candidate, draft, conditional, and product-specific components MUST NOT be presented as universally supported package APIs.

## Repository placement

The core repository MAY contain:

- normative Markdown;
- machine-readable design and adoption Schemas;
- generated Token artifacts;
- deterministic reference interfaces;
- development-only test dependencies;
- validation, audit, and adoption scripts;
- screenshots produced as uncommitted or CI review artifacts.
- a clearly isolated private pre-release package with its own RFC, ownership, version, changelog, tests, bundle checks, and rollback record.

The core repository MUST NOT silently accumulate:

- framework source directories presented as approved publication artifacts without passing the runtime gates;
- compiled packages or distribution archives;
- remote design-tool credentials or mutable IDs;
- copied third-party component source;
- product-specific backend, authentication, billing, or data code;
- permanent screenshots presented as proof of interaction or accessibility.

If an optional implementation begins, it SHOULD use a separate repository or clearly isolated package with its own ownership, version, changelog, tests, release workflow, and adoption record.

## Adoption evidence stages

An adoption record uses four stages:

| Stage | Meaning |
|---|---|
| `initialized` | A KIN version, profile, delivery mode, local paths, and owners are being identified |
| `mapped` | Tokens, components, route profiles, exceptions, a ready implementation brief, product-specific decisions, and one representative production workflow are mapped to local sources |
| `verified` | The brief is human-approved and required automated/manual checks plus every visual-signature criterion for that workflow are recorded with no unresolved blocking result |
| `production-observed` | The verified mapping has dated production evidence, an owner, and a rollback path |

- A project MUST NOT move directly from `initialized` to `verified` without mapping evidence.
- `verified` MUST NOT be inferred from a successful build alone.
- `verified` MUST NOT be inferred from Token parity, a component gallery, a design lab, or screenshots of isolated controls. It requires a representative production workflow and comparable baseline/candidate visual evidence as defined in [`principles/visual-signature.md`](./principles/visual-signature.md).
- A hybrid product MUST NOT apply one profile to unrelated route families merely to simplify implementation. The route/profile map records where each product pattern governs composition.
- `production-observed` MUST name a product revision, observation date, evidence location, and owner.
- Evidence MUST follow [`principles/verification.md`](./principles/verification.md).
- A project MAY adopt only part of KIN, but the scope and exclusions MUST be explicit.

## Change control

Changing the core delivery mode is a major architectural decision even when no visual Token changes.

A proposal that adds remote synchronization, a published design library, or a runtime package MUST:

- identify the new artifact and owner;
- explain why current project-owned adaptation is insufficient;
- separate core contract changes from implementation-package changes;
- document migration, version compatibility, and rollback;
- update this file, `DESIGN.md`, `ROADMAP.md`, adoption Schemas, release checks, and Agent instructions;
- receive explicit approval before implementation begins.

Examples and experiments MAY explore a future boundary, but they MUST be labeled experimental and MUST NOT be represented as supported KIN delivery. The current React laboratory records this approved experimental boundary in [`packages/react/RFC.md`](./packages/react/RFC.md); publication still requires all runtime gates above.

## Acceptance checklist

- The project describes KIN as contract-first.
- Figma support is described as Variables interoperability, not a published component library.
- The private React integration laboratory is distinguished from a published or universally supported package.
- Production components remain owned by the consuming project.
- Optional package or design-library work has separate ownership and release gates.
- Adoption evidence records mappings, verification, exceptions, owners, and production observation without fabricated pass results.
- New adoption records select a profile explicitly, map route families, and complete a project-owned implementation brief before `mapped`.
- Verified adoption records a passed visual review for one named production workflow; partial route coverage remains explicit.
