# KIN React integrations

This private pre-release package runs selected official React libraries behind KIN-owned semantic adapters. It does not copy or reimplement upstream animation, virtualization, drag, notification, input, or chart engines.

The package is an evaluation laboratory, not a complete application shell or a published universal component library. Product data, authorization, network requests, persistence, localization, analytics, recovery, and release ownership remain in the consuming product.

## Support boundary

- ESM only. CommonJS `require()` is not supported.
- Node.js 20.11 or newer for package evaluation and server rendering.
- React 18.2 or React 19 with matching `react-dom`.
- Modern browser behavior follows the named KIN verification matrix; automated smoke tests do not prove complete browser or assistive-technology parity.
- Candidate KIN contracts remain under `/experimental/*` even when the upstream library is mature.

## Install only the selected engine

Integration engines are exact optional peer dependencies. Installing the KIN tarball does not install every upstream package. Install React, React DOM, the KIN tarball, and only the engines selected by the implementation brief.

```bash
npm install react@19.2.7 react-dom@19.2.7
npm install /absolute/path/to/kin-design-react-0.1.0.tgz
npm install sonner@2.0.7
```

Other capabilities require their matching exact peer:

| KIN subpath | Required optional peer |
|---|---|
| `/cmdk` | `cmdk@1.1.1` |
| `/virtuoso` | `react-virtuoso@4.18.10` |
| `/sonner` | `sonner@2.0.7` |
| `/experimental/number-flow` | `@number-flow/react@0.6.1` |
| `/experimental/dnd-kit` | `@dnd-kit/core@6.3.1`, `@dnd-kit/sortable@10.0.0`, `@dnd-kit/utilities@3.2.2` |
| `/experimental/input-otp` | `input-otp@1.4.2` |
| `/experimental/liveline` | `liveline@0.0.7` |
| `/dev/leva` | `leva@0.10.1`; development only |

The exact versions above describe this private revision. A consuming product MUST use the versions recorded by the pinned KIN revision rather than copying this table from a moving branch.

## Imports and isolated CSS

Import the smallest JavaScript and CSS subpaths required by the workflow:

```tsx
import { KinToaster, kinToast } from "@kin-design/react/sonner";
import "@kin-design/react/styles/base.css";
import "@kin-design/react/styles/sonner.css";
```

```tsx
import { AnimatedMetric } from "@kin-design/react/experimental/number-flow";
import "@kin-design/react/styles/base.css";
import "@kin-design/react/styles/number-flow.css";
```

`@kin-design/react/styles.css` is the full Integration Lab aggregate. It imports every adapter stylesheet and therefore requires all referenced optional peers. Product code SHOULD use the isolated paths instead.

The styles consume product-owned semantic variables such as `--surface-*`, `--text-*`, `--line-*`, `--accent`, `--focus-ring`, `--radius-*`, and `--shadow-overlay`. They do not provide a second theme system.

## Product-owned labels

Adapters accept product-owned copy. For example, Sonner's built-in English and Chinese strings are fallbacks only:

```tsx
<KinToaster
  locale="fr-FR"
  containerAriaLabel="Alertes du produit"
  labels={{ closeNotification: "Fermer la notification" }}
/>
```

An explicit `containerAriaLabel` or `toastOptions.closeButtonAriaLabel` always takes precedence. OTP preserves caller-provided `aria-describedby` and `aria-invalid` while adding KIN description and error references.

## Verification

```bash
npm run runtime:check
```

React-version compatibility runs in an isolated temporary consumer and does not edit the repository lockfile:

```bash
KIN_REACT_VERSION=18.2.0 node scripts/test-react-compatibility.mjs
KIN_REACT_VERSION=19.2.7 node scripts/test-react-compatibility.mjs
```

The compatibility check installs the packed artifact, renders on the server, hydrates with `hydrateRoot` in Chromium, and rejects recoverable hydration errors, browser errors, and console errors. CI must install Chromium before running it.

See [`RFC.md`](./RFC.md) for ownership and promotion gates, and [`ADOPTION.md`](./ADOPTION.md) for immutable-revision evaluation and rollback.
