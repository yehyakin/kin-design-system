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

## Source

[NumberFlow](https://github.com/barvian/number-flow)
