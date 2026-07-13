# KIN delivery model

Status: normative

KIN uses a contract-first delivery model. The core repository defines product and interaction contracts, machine-readable Tokens, framework-free references, verification tooling, and adoption records. It is not a published Figma component library and it is not a universal runtime component package.

This decision prevents documentation examples, design-tool interoperability, and production code from being mistaken for the same artifact.

## Current decision

The KIN core repository MUST remain `contract-first` until a separately reviewed proposal changes this boundary.

The machine-readable adoption values are `mode: contract-first`, `figma: variables-only`, and `runtime: project-owned`.

| Layer | Core repository delivers | Core repository does not claim |
|---|---|---|
| Product contract | `DESIGN.md`, principles, component contracts, product patterns, terminology, maturity catalog | One layout or visual treatment suitable for every product |
| Tokens | Normative source values plus generated CSS, DTCG, Tailwind-compatible, and Figma Variables interoperability files | Automatic synchronization with an existing design library |
| Reference interfaces | Framework-free deterministic examples and browser tests | Production-ready application components |
| Agent support | KIN Skill, repository instructions, audit candidates, adoption checks, and evidence templates | Autonomous product redesign without project context or review |
| Figma | A create-only Variables payload and documented interoperability boundary | Published component sets, library ownership, update/delete operations, credentials, or stable Figma node IDs |
| Runtime code | Reference HTML, CSS, JavaScript, and optional integration contracts | `@kin/react`, Vue, Web Components, native SDKs, or framework support commitments |

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
- documented adapters when the product has the corresponding need.

They MUST record the exact reviewed contract revision, local contract checksum, local mappings, verification results, exceptions, and owners. The revision and checksum remain optional for compatibility with earlier 2.0 configuration files, but new adoption records SHOULD supply them. The machine-readable adoption evidence format is defined in [`adoption/kin.evidence.schema.json`](./adoption/kin.evidence.schema.json).

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

KIN does not currently publish a runtime package.

Framework-free references exist to make behavior inspectable and testable. They intentionally avoid establishing framework APIs, styling inheritance, application state, server/client boundaries, or dependency commitments for consuming products.

Consuming projects SHOULD adapt KIN through their existing primitives. They MUST NOT introduce a second component framework only to make an interface appear KIN-like.

### Gate for a future runtime package

A runtime implementation such as `@kin/react` MUST be proposed and released separately from the contract core. Approval requires:

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

The core repository MUST NOT silently accumulate:

- framework source directories intended for publication;
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
| `mapped` | Tokens, components, routes, exceptions, and product-specific decisions are mapped to local sources |
| `verified` | Required automated and manual checks are recorded with no unresolved blocking result |
| `production-observed` | The verified mapping has dated production evidence, an owner, and a rollback path |

- A project MUST NOT move directly from `initialized` to `verified` without mapping evidence.
- `verified` MUST NOT be inferred from a successful build alone.
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

Examples and experiments MAY explore a future boundary, but they MUST be labeled experimental and MUST NOT be represented as supported KIN delivery.

## Acceptance checklist

- The project describes KIN as contract-first.
- Figma support is described as Variables interoperability, not a published component library.
- Runtime examples are not described as a package.
- Production components remain owned by the consuming project.
- Optional package or design-library work has separate ownership and release gates.
- Adoption evidence records mappings, verification, exceptions, owners, and production observation without fabricated pass results.
