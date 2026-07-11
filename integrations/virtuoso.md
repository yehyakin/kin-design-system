# React Virtuoso Adapter

## Decision

Core candidate only when data volume, dynamic row height or streaming content makes virtualization materially useful. Start with semantic markup and measure before adopting.

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

## Source

[React Virtuoso](https://github.com/petyosi/react-virtuoso)
