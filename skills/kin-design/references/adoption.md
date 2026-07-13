# Adoption workflow

Use this workflow when a project is adopting KIN, migrating from an older KIN or Linear-derived contract, or recording KIN compliance evidence.

## 1. Preserve product truth

- Read the consuming project's instructions, product documentation, routes, data model, permissions, Token source, primitives, tests, and current screenshots.
- Read KIN `DESIGN.md`, `DELIVERY.md`, `adoption/README.md`, `principles/verification.md`, the selected product pattern, and only the component contracts in scope.
- Use `redesign-preserve` unless the user explicitly authorizes an information-architecture or behavior overhaul.
- Do not replace working product components merely to resemble a reference fixture.

## 2. Initialize without overwriting

Run the KIN initializer only when the user has authorized project-local adoption files:

```bash
node path/to/kin-design-system/scripts/init-adoption.mjs .
```

Review every generated path and command. Existing files remain authoritative unless an approved migration says otherwise. Do not use `--force` without reviewing the exact files that would be replaced.

## 3. Pin and map

- Pin an exact reviewed KIN release and retain a local offline contract copy. Record the full revision and SHA-256 checksum when the consuming project's configuration supports them.
- Keep `delivery.mode` as `contract-first`, `delivery.figma` as `variables-only`, and `delivery.runtime` as `project-owned`.
- Map KIN semantic Tokens to the local Token source; do not bypass the product's brand or semantic layers.
- Map stable KIN components to existing local primitives before proposing new ones.
- Map only routes included in the approved migration scope.
- Record candidate, draft, conditional, and unsupported components as decisions, not as completed KIN coverage.
- Record specific exceptions with an owner and follow-up.

## 4. Implement in phases

Recommended order:

1. baseline and screenshots;
2. semantic Token mapping;
3. shell and navigation;
4. one representative workflow;
5. repeated component migration;
6. remaining scoped routes;
7. cleanup only after behavior is equivalent.

Keep old behavior available through a branch, feature flag, parallel route, or reversible commit sequence appropriate to the project.

## 5. Record evidence honestly

Update the configured `kin-evidence.json` as work progresses:

- `initialized`: paths and scope are identified;
- `mapped`: Tokens, components, routes, owners, and exceptions are recorded;
- `verified`: mappings are reviewed and every required automated/manual result is recorded;
- `production-observed`: the verified revision has dated production evidence and rollback ownership.

Unperformed work remains `not-run`. A blocked check remains `blocked`. `not-applicable` requires a specific product reason. Do not convert build success, screenshots, smoke tests, or Agent review into evidence they cannot establish.

## 6. Check structure

Run:

```bash
node path/to/kin-design-system/scripts/check-adoption.mjs . --json
```

The checker validates structure and detects overstated evidence. It does not run project commands, inspect Figma, perform a screen-reader review, or prove visual quality.

## 7. Deliver

Report:

- pinned KIN version and product revision;
- selected profile and scoped routes;
- Token, component, and route mappings;
- delivery boundary;
- automated commands and actual results;
- manual environments and findings;
- screenshots and artifacts;
- exceptions, owners, and unresolved work;
- rollout and rollback;
- current evidence stage without exaggeration.
