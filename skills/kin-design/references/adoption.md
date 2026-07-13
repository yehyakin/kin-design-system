# Adoption workflow

Use this workflow when a project is adopting KIN, migrating from an older KIN or Linear-derived contract, or recording KIN compliance evidence.

## 1. Preserve product truth

- Read the consuming project's instructions, product documentation, routes, data model, permissions, Token source, primitives, tests, and current screenshots.
- Read KIN `VISION.md`, `DESIGN.md`, `DELIVERY.md`, `adoption/README.md`, `adoption/implementation-brief.md`, `principles/visual-signature.md`, `principles/verification.md`, the selected product pattern, `references/composition.md`, and only the component contracts in scope.
- Use `redesign-preserve` unless the user explicitly authorizes an information-architecture or behavior overhaul.
- Do not replace working product components merely to resemble a reference fixture.

## 2. Initialize without overwriting

Run the KIN initializer only when the user has authorized project-local adoption files. Select the profile explicitly; there is no safe universal default:

```bash
node path/to/kin-design-system/scripts/init-adoption.mjs . --profile intelligence-workspace
```

Review every generated path and command. Existing files remain authoritative unless an approved migration says otherwise. Do not use `--force` without reviewing the exact files that would be replaced. Complete the generated implementation brief and route/profile map before moving beyond `initialized`.

## 3. Pin and map

- Pin an exact reviewed KIN release and retain a local offline contract copy. Record the full revision and SHA-256 checksum when the consuming project's configuration supports them.
- Keep `delivery.mode` as `contract-first`, `delivery.figma` as `variables-only`, and `delivery.runtime` as `project-owned`.
- Map KIN semantic Tokens to the local Token source; do not bypass the product's brand or semantic layers.
- Map stable KIN components to existing local primitives before proposing new ones.
- Map only routes included in the approved migration scope. Hybrid products may assign different profiles to different route families; do not stretch the primary profile across unrelated jobs.
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

The representative workflow MUST be a real production task with realistic content, entry and completion conditions, applicable failure states, and scoped routes. A design lab, Storybook, component gallery, static fixture, or header-only migration does not satisfy step 4.

Before implementation, report the composition checkpoint from `references/composition.md`. The first meaningful view, dominant region, persistent context, Surface strategy, narrow-screen order, states, interactions, and prohibited substitutions must be observable decisions rather than style adjectives.

## 5. Record evidence honestly

Update the configured `kin-evidence.json` as work progresses:

- `initialized`: paths and scope are identified;
- `mapped`: Tokens, components, routes, owners, and exceptions are recorded;
- `verified`: mappings are reviewed and every required automated/manual result is recorded;
- `production-observed`: the verified revision has dated production evidence and rollback ownership.

Complete `visualReview` before `verified`:

- record the workflow and routes;
- use comparable baseline and candidate artifacts;
- name the environment, reviewer, date, and findings;
- keep the status `not-run`, `blocked`, or `failed` until a human review passes;
- do not treat Token parity, build success, or isolated component screenshots as a pass.

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
- representative workflow and visual-signature review;
- exceptions, owners, and unresolved work;
- rollout and rollback;
- current evidence stage without exaggeration.
