# KIN React integrations

This package deeply integrates selected official React libraries behind KIN-owned semantic APIs. It uses the original packages rather than copying or reimplementing their source. Upstream animation, virtualization, drag, notification, input, and chart engines remain intact unless a KIN accessibility or product contract requires a bounded configuration.

Status: pre-release and private to this repository.

## Principles

- Import the smallest subpath required by the product.
- Keep the upstream interaction engine; adapt visual Tokens and product semantics.
- Do not install a conditional integration without a real workflow need.
- Import `@kin-design/react/styles.css` once in the consuming React application.
- Keep production data, authorization, network requests, persistence, analytics, and rollback in the consuming product.

## Imports

```tsx
import { KinToaster, kinToast } from "@kin-design/react/sonner";
import { AnimatedMetric } from "@kin-design/react/experimental/number-flow";
import "@kin-design/react/styles.css";
```

Stable-contract adapters use `/cmdk`, `/virtuoso`, and `/sonner`. Candidate component adapters are deliberately namespaced under `/experimental/number-flow`, `/experimental/dnd-kit`, `/experimental/input-otp`, and `/experimental/liveline`. Leva remains isolated at `/dev/leva`.

The `experimental` namespace describes KIN component-contract maturity, not the quality of the upstream library. Each adapter still runs the official package directly.

The package is not a complete application shell and does not replace the page, workflow, adoption, or verification contracts in the KIN core repository.

See [`RFC.md`](./RFC.md) for ownership, support, dependency, evidence, migration, and promotion gates.

See [`ADOPTION.md`](./ADOPTION.md) for immutable-revision packing, Token mapping, subpath selection, migration, product evidence, and rollback.
