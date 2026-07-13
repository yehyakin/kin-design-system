# Adopting KIN in another project

KIN is a design contract, not a package that should silently rewrite a product. Adoption starts by pinning a reviewed contract version, choosing the closest product profile, and recording local paths, delivery boundaries, evidence, owners, and exceptions. The core delivery decision is defined in [`DELIVERY.md`](../DELIVERY.md).

## Start

From a KIN checkout:

```bash
node scripts/init-adoption.mjs ../your-project
```

The command creates three files only when they do not already exist:

- `kin.config.json` — machine-readable version, profile, paths, exceptions, and verification commands.
- `docs/kin-adoption.md` — the decisions a team must complete before implementation.
- `docs/kin-evidence.json` — machine-readable mapping, automated/manual verification, ownership, exception, and production-observation evidence.

It does not copy UI, install dependencies, change routes, or edit source code. Every generated evidence check begins as `not-run`; the initializer never fabricates a pass result. Use `--force` only after reviewing the existing files.

Copy the exact reviewed KIN release of `DESIGN.md` to the configured local contract path. Pinning a release avoids a consuming project changing behavior merely because KIN's `main` branch moved.

New adoption records SHOULD also add `contract.revision` and the lowercase SHA-256 `contract.checksum`. A full Git commit is an acceptable revision and is more precise than a moving branch. The initializer computes the expected checksum from the KIN source checkout before the target contract is copied; do not establish trust by hashing only a potentially incomplete target copy. The fields remain optional so earlier 2.0 records stay valid, but the checker warns when either is absent and rejects a checksum that does not match the local contract.

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

A consuming project MUST NOT change these values merely because it uses React, Figma, or a documented third-party adapter. A separate approved artifact contract is required before claiming a KIN Figma Library or runtime package.

## Evidence stages

The evidence record follows the Schema in [`kin.evidence.schema.json`](./kin.evidence.schema.json). The example is [`kin.evidence.example.json`](./kin.evidence.example.json).

| Stage | Required evidence |
|---|---|
| `initialized` | Version, profile, product revision placeholder, delivery mode, pending mappings, and named checks |
| `mapped` | Reviewed local Token, component, and route relationships, named owners, scoped exceptions, and a review date |
| `verified` | Reviewed mappings, passing automated commands, completed or justified manual checks, review date, and owners |
| `production-observed` | Verified evidence plus dated production observation, evidence location, owner, and rollback |

Checks that were not performed MUST remain `not-run`, `blocked`, or `not-applicable` with a reason. A successful build alone is not `verified`. Manual evidence follows [`principles/verification.md`](../principles/verification.md).

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
