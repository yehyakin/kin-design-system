# Runtime integration catalog

Status: implementation registry

This catalog answers a narrow question: which official third-party packages actually run inside KIN-owned adapters and evidence pages? It does not replace component maturity in [`../components/catalog.md`](../components/catalog.md), and it does not turn every integration into a universal product dependency.

The machine-readable source is [`catalog.json`](./catalog.json). It also enforces an upstream-preservation policy: official package as source, preserved behavior engine, visual adaptation through public Token/theme/composition interfaces, and no fork without a recorded exception. This is what KIN means by direct integration; it is not a visual imitation and it is not an undocumented source copy.

## Integration rule

KIN integrates the official package rather than copying or recreating its source. Upstream owns the mature engine and its motion. KIN owns component semantics, allowed use, semantic Tokens, themes, responsive composition, accessibility boundaries, evidence, migration, and rollback.

An item is `runtime-integrated` only when all of these exist:

1. an exact official dependency in the isolated React package;
2. a KIN subpath API;
3. a runnable example using that API;
4. automated package and browser evidence;
5. an integration contract and rollback boundary.

`runtime-integrated` is not the same as a `stable` KIN component. Number Transition, Drag and Drop, OTP, and Live Chart remain catalog candidates and therefore use `/experimental/*` package exports.

## Current integrations

| Official package | KIN entry | Integration status | KIN maturity boundary |
|---|---|---|---|
| Lucide React | direct icon imports | visual-integrated | visual adapter, not a behavior component |
| Sonner | `@kin-design/react/sonner` | runtime-integrated | stable Toast contract |
| NumberFlow | `@kin-design/react/experimental/number-flow` | runtime-integrated | candidate Number Transition |
| cmdk | `@kin-design/react/cmdk` | runtime-integrated | stable Command Menu contract |
| React Virtuoso | `@kin-design/react/virtuoso` | runtime-integrated | implementation utility for stable list contracts |
| dnd kit | `@kin-design/react/experimental/dnd-kit` | runtime-integrated | candidate Drag and Drop |
| input-otp | `@kin-design/react/experimental/input-otp` | runtime-integrated | candidate OTP |
| Liveline | `@kin-design/react/experimental/liveline` | runtime-integrated | candidate Live Chart |
| Leva | `@kin-design/react/dev/leva` | development-integrated | development-only tool |

The public Integration Lab is [`../examples/workspace-reference/integrations.html`](../examples/workspace-reference/integrations.html). Package ownership and promotion gates are recorded in [`../packages/react/RFC.md`](../packages/react/RFC.md); pinned private-package evaluation and rollback are documented in [`../packages/react/ADOPTION.md`](../packages/react/ADOPTION.md).

## Explicit exclusions

- KIN MUST NOT vendor package source merely to make an adapter look self-contained.
- KIN MUST NOT replace upstream physics or animation with a lookalike unless an accessibility or product defect is documented and tested.
- KIN MUST NOT import every package through the root entry.
- Leva MUST NOT enter a production bundle.
- Product backends, permissions, storage, OTP verification, realtime transport, and analytics remain outside the integration package.
- A showcase fixture MUST NOT be counted as consuming-product evidence.
