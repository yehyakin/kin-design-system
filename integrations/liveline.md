# Liveline Adapter

## Decision

Conditional. Appropriate for small, continuously updating React charts when real-time movement is part of the task.

## Allowed

- Network latency and availability.
- Monitoring throughput and error rate.
- Risk-signal trends.
- Commerce inventory or conversion telemetry when genuinely live.

## KIN preset

- One series by default; very few when comparison is essential.
- 1–1.5px line.
- Accent or monitor color; no glow.
- Fill disabled or below roughly 5% opacity.
- No particles, shake, pulse, `degen`, exaggerated momentum or decorative loading morph.
- Axes hidden or subdued; exact values available on hover and keyboard focus.
- Text summary or table fallback for Canvas output.

## Engineering

- Dynamically import where useful.
- Pause or reduce updates when hidden.
- Downsample long streams and cap retained points.
- Theme changes update palette without clearing data.
- Reduced motion lowers interpolation or uses discrete refresh.
- Test high-DPI, resize, empty, paused and reconnect states.

## Runtime implementation

[`@kin-design/react/experimental/liveline`](../packages/react/src/liveline.tsx) directly renders the official Liveline Canvas engine. Liveline retains plotting, interpolation and its own `prefers-reduced-motion` behavior. KIN applies a restrained single-series preset, disables decorative effects, derives theme color, exposes the active motion preference for evidence, and requires a text summary plus data-table fallback. A product MAY set `paused` for a real paused-data state; KIN MUST NOT misuse that state as a replacement for Liveline's native Reduced Motion path.

`LivelinePoint.time` follows Liveline's Unix-seconds contract. Adapters and fixtures MUST NOT pass JavaScript millisecond timestamps. The KIN table fallback uses the same `formatTime` and `formatValue` callbacks as the Canvas so visual and non-visual readings remain consistent.

The [Integration Lab](../examples/workspace-reference/integrations.html#liveline) verifies Canvas output, theme-aware styling, normal motion, native Reduced Motion handling and structured fallback. High-DPI, reconnect, keyboard data exploration and real streaming transport remain product evidence; the component remains `candidate`.

## Source

[Liveline](https://github.com/benjitaylor/liveline)
