# Evaluating the KIN React integrations

Status: private pre-release evaluation guide

This guide lets a React product test the real official-package adapters without treating the laboratory as a published or universal component framework. Production ownership remains with the consuming product.

## Choose the smallest path

1. If the product already has a correct integration of an official package, keep its engine and map the local component to the matching KIN contract. Do not churn code merely to import a KIN name.
2. If the product lacks the behavior or its local wrapper is incomplete, evaluate the matching `@kin-design/react` subpath behind the existing component boundary or a feature flag.
3. Do not install the whole catalog. Every imported subpath MUST correspond to a named workflow need in the project implementation brief.

## Pin and pack

Until publication is approved, evaluate an immutable KIN revision and a locally packed artifact:

```bash
git clone https://github.com/yehyakin/kin-design-system.git
cd kin-design-system
git checkout <reviewed-commit-or-tag>
npm ci
npm run runtime:check
npm pack --workspace @kin-design/react
```

Install the emitted tarball in the consuming React project:

```bash
npm install /absolute/path/to/kin-design-react-0.1.0.tgz
```

The consuming project MUST record the KIN revision, package version, tarball checksum, selected subpaths, owner, verification result, and rollback component. It MUST NOT depend on a moving `main` branch.

## Token and CSS boundary

Define KIN semantic Tokens through the project's existing theme system, then import the shared base and only the adapter CSS used by the workflow:

```tsx
import "@kin-design/react/styles/base.css";
import "@kin-design/react/styles/sonner.css";
```

The stylesheets consume semantic variables including `--surface-*`, `--text-*`, `--line-*`, `--accent`, `--focus-ring`, `--radius-*`, and `--shadow-overlay`. The project MUST map those names to its reviewed Token source; the package MUST NOT become a second theme provider.

`@kin-design/react/styles.css` is the full Integration Lab aggregate. It imports every integration stylesheet and requires all corresponding optional peers. Product code SHOULD NOT use it when evaluating one or two subpaths.

## Import only required capabilities

| Need | Import |
|---|---|
| action feedback | `@kin-design/react/sonner` |
| global commands | `@kin-design/react/cmdk` |
| measured long lists | `@kin-design/react/virtuoso` |
| changed numeric metrics | `@kin-design/react/experimental/number-flow` |
| controlled ordering | `@kin-design/react/experimental/dnd-kit` |
| one-time-code input | `@kin-design/react/experimental/input-otp` |
| compact live chart | `@kin-design/react/experimental/liveline` |
| development tuning | `@kin-design/react/dev/leva` |

`/experimental/*` describes KIN contract maturity, not upstream quality. `/dev/leva` MUST NOT be imported from a production entry.

Every official engine is an exact optional peer. Installing the KIN tarball does not install the complete catalog. The product MUST install only the exact peers required by its selected imports and record those dependency deltas.

## Migration sequence

1. Capture the current real workflow, theme, narrow layout, keyboard path, Reduced Motion result, bundle size, and failure/recovery behavior.
2. Keep the existing component interface or add a narrow project adapter around the KIN subpath.
3. Connect real product copy, data, permissions, network state, persistence, errors, analytics, and recovery.
4. Verify the exact states named in the implementation brief; do not use the Integration Lab as production evidence.
5. Compare the baseline and candidate with the same content, route, viewport, theme, and state.
6. Test rollback to the old component before removing it.
7. Record the outcome in project-owned KIN evidence.

## Required checks

- lint, typecheck, unit, integration, build, and the product's browser suite;
- server rendering and hydration where applicable;
- light, dark, higher contrast, mobile, keyboard, touch, and Reduced Motion;
- screen-reader and real zoom checks required by [`../../principles/verification.md`](../../principles/verification.md);
- bundle delta per imported subpath;
- raw, gzip, and CSS delta for every imported subpath;
- no Leva code in production output;
- rollback without backend, schema, or public API changes.

The repository compatibility script creates a temporary consumer, so React 18 and React 19 checks do not rewrite the project lockfile:

```bash
KIN_REACT_VERSION=18.2.0 node scripts/test-react-compatibility.mjs
KIN_REACT_VERSION=19.2.7 node scripts/test-react-compatibility.mjs
```

The package test and Integration Lab demonstrate adapter behavior. They do not prove that a consuming product's workflow, backend, content, or accessibility is complete.
