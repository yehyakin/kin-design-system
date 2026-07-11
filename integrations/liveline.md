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

## Source

[Liveline](https://github.com/benjitaylor/liveline)
