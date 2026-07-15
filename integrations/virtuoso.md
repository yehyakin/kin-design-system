# React Virtuoso Adapter

## Decision

Runtime-integrated implementation utility for stable list contracts, only when data volume, dynamic row height or streaming content makes virtualization materially useful. Start with semantic markup and measure before adopting.

## Allowed

- Large entity and risk lists.
- Activity and monitoring streams.
- Telegram or message history.
- AI conversations backed by a real service.

## Contract

- Use stable item keys and stable row structure.
- Preserve scroll position, filters and selection across Inspector and route changes.
- New events do not force-scroll a reader; show `N 条新事件` and let the user choose.
- Keyboard selection ensures the active row remains visible.
- Preserve `aria-selected`, row count and accessible labels.
- Tune overscan from production profiling, not guesswork.
- Avoid borders or margins that change measured row height between states.
- Confirm current licensing separately for optional Message List products.

## Do not use

- Small lists where native document flow is simpler.
- As a substitute for pagination, filtering or data-query design.
- If virtualization breaks table semantics or focus without a tested repair.

## Runtime implementation

[`@kin-design/react/virtuoso`](../packages/react/src/virtuoso.tsx) directly renders the official React Virtuoso engine. Virtuoso owns measurement, DOM windowing and scroll positioning; KIN requires stable keys, accessible naming, active-row visibility, product-owned selection, and measured overscan.

The [Integration Lab](../examples/workspace-reference/integrations.html#virtuoso) runs one thousand objects while retaining a small rendered window and keyboard-followed selection.

## Source

[React Virtuoso](https://github.com/petyosi/react-virtuoso)
