# NumberFlow Adapter

## Decision

Conditional. Use only when motion helps a user perceive a real value change.

## Allowed

- Risk count updates.
- Availability, latency, inventory and conversion changes.
- Online nodes, evidence count or task progress.

## Forbidden

- Counting from zero on first load.
- Dates, IDs and every table cell.
- Replaying on theme changes, tab changes or virtual-row remounts.

## Wrapper contract

Create an `AnimatedMetric` adapter that:

- Animates only when a previous value exists and differs.
- Uses tabular numbers and preserves units.
- Exposes an accessible final text value.
- Updates immediately under reduced motion.
- Avoids animation while the document is hidden where appropriate.
- Uses approximately 350–450ms and does not infer positive/negative color from numeric direction.

## Runtime implementation

[`@kin-design/react/experimental/number-flow`](../packages/react/src/number-flow.tsx) directly renders the official NumberFlow React component. KIN suppresses manufactured first-render counting, pauses under Reduced Motion or a hidden document, exposes the final accessible value, and leaves glyph interpolation and lifecycle motion upstream-owned.

The [Integration Lab](../examples/workspace-reference/integrations.html#number-flow) verifies a real prior-value change, theme stability, Reduced Motion, and lifecycle completion. The KIN component remains `candidate` until consuming-product and manual assistive-technology evidence closes the catalog gaps.

## Source

[NumberFlow](https://github.com/barvian/number-flow)
