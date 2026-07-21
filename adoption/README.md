# Adopting KIN in another project

KIN is a design contract, not a package that should silently rewrite a product. Adoption starts by pinning a reviewed contract version, choosing the closest product profile, and recording local paths, delivery boundaries, evidence, owners, and exceptions. The core delivery decision is defined in [`DELIVERY.md`](../DELIVERY.md).

Adoption is not complete when a project only maps Tokens, creates wrapper components, or builds a design lab. Page and workflow work MUST also follow the [`KIN visual signature`](../principles/visual-signature.md).

## Start

From a KIN checkout:

```bash
node scripts/init-adoption.mjs ../your-project --profile intelligence-workspace
```

`--profile` is required. There is no universal default. Choose `information-site`, `intelligence-workspace`, `ecommerce-operations`, or `engineering-canvas` from the product's real primary task.

The command creates four files only when they do not already exist:

- `kin.config.json` — machine-readable version, primary profile, route/profile scope, paths, exceptions, and verification commands.
- `docs/kin-adoption.md` — the decisions a team must complete before implementation.
- `docs/kin-implementation-brief.md` — the project-specific task, composition, state, responsive, and visual-evidence contract.
- `docs/kin-evidence.json` — machine-readable mapping, automated/manual verification, ownership, exception, and production-observation evidence.

It does not copy UI, install dependencies, change routes, or edit source code. Every generated evidence check begins as `not-run`; the implementation brief begins as `draft`; the initializer never fabricates a decision or pass result. Use `--force` only after reviewing the existing files.

The implementation brief follows [`implementation-brief.md`](./implementation-brief.md). A consuming Agent MUST complete its product truth, route/profile map, representative workflow, composition contract, required states and interactions, prohibited substitutions, evidence, and rollback before changing the representative workflow.

Copy the exact reviewed KIN release of `DESIGN.md` to the configured local contract path. Pinning a release avoids a consuming project changing behavior merely because KIN's `main` branch moved.

New adoption records SHOULD also add `contract.revision` and the lowercase SHA-256 `contract.checksum`. A full Git commit is an acceptable revision and is more precise than a moving branch. The checksum is calculated from UTF-8 contract text after removing an optional BOM and normalizing CRLF or CR line endings to LF; the final newline and all other content remain significant. The initializer computes the expected value from the KIN source checkout before the target contract is copied, so line-ending conversion across platforms does not change identity and a truncated target copy cannot establish its own trust. The fields remain optional so earlier 2.0 records stay valid, but the checker warns when either is absent and rejects a checksum that does not match the canonical local contract.

## Check the contract

```bash
node path/to/kin-design-system/scripts/check-adoption.mjs .
```

The checker validates the core fields and requires the pinned local contract, configured Token integration file, and configured evidence record to exist. It checks that evidence does not overstate `verified` or `production-observed` stages. It does not run the consuming project's commands or perform manual checks.

## Delivery boundary

The generated configuration records:

```json
{
  "delivery": {
    "mode": "contract-first",
    "figma": "variables-only",
    "runtime": "project-owned",
    "evidence": "docs/kin-evidence.json"
  }
}
```

The field remains optional in the configuration Schema so an existing 2.0 record does not become invalid without review. The checker emits a warning when it is absent; new initializer output includes it.

This means:

- KIN supplies contracts, Tokens, references, tools, and evidence formats;
- Figma support currently means Variables interoperability, not a published component library;
- production components remain owned by the consuming project;
- framework-free references are behavioral fixtures, not a runtime package.

The private pre-release [`@kin-design/react`](../packages/react/) laboratory does not change `runtime: project-owned`. It is an optional migration target for reviewed React products, not a supported universal package. A project evaluating it MUST pin the KIN revision and package version, import only required subpaths, map each adapter to a real workflow, keep backend and recovery ownership local, compare bundle and interaction evidence, and prove rollback to the prior project-owned component. Until a package release is approved, external projects SHOULD evaluate a locally packed artifact or an equivalent pinned workspace checkout rather than treating `main` as a floating dependency.

A consuming project MUST NOT change these values merely because it uses React, Figma, or a documented third-party adapter. A separate approved artifact contract is required before claiming a KIN Figma Library or runtime package.

## Evidence stages

The evidence record follows the Schema in [`kin.evidence.schema.json`](./kin.evidence.schema.json). The example is [`kin.evidence.example.json`](./kin.evidence.example.json).

| Stage | Required evidence |
|---|---|
| `initialized` | Version, profile, product revision placeholder, delivery mode, pending mappings, and named checks |
| `mapped` | Reviewed local Token, component, and route relationships, one representative production workflow, named owners, scoped exceptions, and a review date |
| `verified` | Reviewed mappings, passing automated commands, completed or justified manual checks, a passed visual-signature review with comparable artifacts, review date, and owners |
| `production-observed` | Verified evidence plus dated production observation, evidence location, owner, and rollback |

Checks that were not performed MUST remain `not-run`, `blocked`, or `not-applicable` with a reason. A successful build alone is not `verified`. Manual evidence follows [`principles/verification.md`](../principles/verification.md).

### Representative workflow and visual review

New evidence records include `visualReview`. Before moving to `verified`, the project MUST record:

- one high-value production workflow, its routes, entry point, current object, and completion condition;
- a baseline artifact and candidate artifact with realistic, comparable content, viewport, theme, and state;
- the review environment, reviewer, date, findings, and unresolved issues;
- a `passed` result only after the common and selected product-family visual signatures have been reviewed.

The generated visual review contains explicit criteria for task priority, dominant region, continuous structure, density, semantic separation, theme integrity, motion continuity, responsive priority, and fabricated behavior. A review cannot pass while any required criterion remains `not-run` or `failed`.

A component gallery, Storybook, design lab, static fixture, or isolated migrated header MUST NOT be used as the representative production workflow. A project MAY remain partially adopted, but it MUST name covered routes and exclusions instead of claiming whole-product adoption.

Older evidence records without `visualReview` remain readable for migration. The checker warns while they are below `verified` and rejects a `verified` or `production-observed` claim until the visual review is recorded.

## Controlled product pilots

The non-normative [`adoption/pilots/`](./pilots/README.md) pack prepares comparable trials for one 52.mk intelligence workflow and one materially different DD AI OS ecommerce-operations workflow. It provides product-specific audit boundaries and one common evidence template; it does not modify either product, approve an implementation brief, or manufacture adoption evidence.

Run each pilot in the consuming product repository against its current revision. Pin the exact reviewed KIN commit, capture the baseline before implementation, keep product data and private artifacts local, and record missing-contract lookups and correction rounds as trial results rather than hiding them.

## Run the candidate audit

```bash
node path/to/kin-design-system/scripts/audit-project.mjs .
node path/to/kin-design-system/scripts/audit-project.mjs . --json
```

The audit is deliberately conservative in what it claims: regex matches are review candidates, not proof of a design defect. A gradient may encode data; a full radius may be correct for an avatar; a hard-coded color may define the token source. Confirm findings in rendered UI and product context before editing.

The process exits non-zero only when it finds a P1 candidate. P2 and P3 findings remain visible without turning aesthetic heuristics into an automatic merge veto.

### Exceptions

Document a reviewed exception in `kin.config.json`:

```json
{
  "rule": "kin/pill-overuse",
  "path": "src/components/avatar.css",
  "reason": "Circular crop is required for the user avatar component."
}
```

An exception needs a rule, path, and specific reason. The audit ignores incomplete exception records.

## Product profiles

| Profile | Use when the main task is |
|---|---|
| `information-site` | finding, reading, verifying, and citing published information |
| `intelligence-workspace` | investigating entities, signals, evidence, and monitored change |
| `ecommerce-operations` | operating catalog, inventory, orders, campaigns, and approvals |
| `engineering-canvas` | editing geometry, layers, revisions, measurements, or simulations |

Profiles supply task-specific defaults. They do not replace the consuming product's real content model or brand.

### Hybrid products

The top-level `profile` is the project's primary profile. `scope.routeProfiles` assigns the appropriate profile to each in-scope route family. This prevents a public information entry, an operational database, and an engineering editor from being forced into one layout merely because they share a product.

Exactly one route family is marked `representative: true` during the first adoption phase. The checker rejects `mapped` evidence while the route map or implementation brief contains `TODO`, and rejects `verified` evidence until the brief is human-approved and the representative visual review passes.
