# Adopting KIN in another project

KIN is a design contract, not a package that should silently rewrite a product. Adoption starts by pinning a reviewed contract version, choosing the closest product profile, and recording local paths and exceptions.

## Start

From a KIN checkout:

```bash
node scripts/init-adoption.mjs ../your-project
```

The command creates two files only when they do not already exist:

- `kin.config.json` — machine-readable version, profile, paths, exceptions, and verification commands.
- `docs/kin-adoption.md` — the decisions a team must complete before implementation.

It does not copy UI, install dependencies, change routes, or edit source code. Use `--force` only after reviewing the existing files.

Copy the exact reviewed KIN release of `DESIGN.md` to the configured local contract path. Pinning a release avoids a consuming project changing behavior merely because KIN's `main` branch moved.

## Check the contract

```bash
node path/to/kin-design-system/scripts/check-adoption.mjs .
```

The checker validates the core fields and requires both the pinned local contract and configured Token integration file to exist. It does not run the consuming project's build commands.

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
