# Charts and analysis

Status: normative

This contract defines standard charts, accessible data fallback, legends, axes, tooltips, comparison, selection, empty and error states, and real-time updates. It supplements [`DESIGN.md`](../DESIGN.md), [`data-display.md`](./data-display.md), and [`integrations/liveline.md`](../integrations/liveline.md) when live charts are justified.

## Choosing a chart

A chart MUST answer a comparison, distribution, relationship, trend, or composition question that would be materially harder to understand in text or a small table.

Do not use a chart when:

- one or two values answer the task;
- exact values are the primary need and a table is clearer;
- data quality or sample size cannot support the visual claim;
- the chart exists only to make a dashboard look active.

## Required chart context

Every chart MUST expose:

- clear title or accessible name;
- represented metric and unit;
- time range or category scope;
- source and freshness;
- aggregation or transformation when it affects interpretation;
- uncertainty, missing data, or estimated values;
- accessible data summary or table fallback.

## Visual structure

- Axes MUST use meaningful labels and units.
- Truncated axes MUST be disclosed when they can change interpretation.
- Grid lines SHOULD remain quiet and only support reading.
- Legends MUST map stable names to series and MUST not rely on color alone.
- Series count SHOULD remain low enough to compare reliably.
- Markers, line styles, patterns, direct labels, or table relationships MUST supplement color.
- Decorative gradients, glow, particles, shake, and pseudo-3D MUST NOT be used.
- Numeric formatting MUST remain consistent between axis, tooltip, summary, and table.

## Interaction

- Pointer hover and keyboard focus MUST reveal the same data meaning.
- Tooltips MUST identify series, category or time, value, unit, and data status.
- Keyboard users MUST be able to traverse meaningful points or series when point inspection is part of the task.
- Touch targets MUST tolerate imprecise input without requiring hover.
- Zoom, brush, range, and selection MUST expose current scope and a reset path.
- Selecting a point MUST be distinguishable from focus and MUST not hide the corresponding table value.

## Accessible data fallback

- Canvas or SVG charts MUST have a textual summary.
- Exact chart data MUST be available as a semantic Table when exact values matter or point navigation is impractical.
- The Table MUST use the same filtered data, units, labels, and freshness as the chart.
- A chart/table switch MUST preserve scope and selection.
- Hiding the visual chart MUST not hide the data table from users who need it.
- Screen readers MUST not receive duplicate, meaningless descriptions for every decorative SVG element.

## Data states

- Loading MUST preserve chart geometry without fabricated lines.
- Empty MUST explain why no series is available and which filter or source can change it.
- Partial MUST identify missing intervals, categories, or series.
- Stale MUST show the last successful update.
- Error MUST preserve available summary or prior safe data with clear timestamp.
- Estimated or interpolated regions MUST be visually and textually distinct.
- Zero MUST not be replaced with missing data or vice versa.

## Live and streaming charts

- Live charts MUST state update frequency and latest successful update.
- Updates SHOULD pause or reduce frequency when the chart is not visible.
- Users inspecting older points MUST not be forced back to the latest point.
- A `Return to live` action SHOULD be available when follow mode is paused.
- Data SHOULD be sampled or aggregated according to the task and performance budget.
- Theme changes MUST update styling without clearing data or replaying historical animation.
- Reduced motion MUST reduce interpolation or use discrete updates.

## Responsive behavior

- Narrow layouts MUST preserve the chart question, unit, time range, and fallback access.
- Labels MAY reduce density, but the product MUST not remove critical categories silently.
- Complex comparison MAY switch to a scrollable Table or small multiples when a single compressed chart becomes unreadable.
- Touch interaction MUST not block page scrolling unintentionally.

## Localization and internationalization

- Dates, numbers, decimal separators, currency, percentage, and units MUST follow the selected locale.
- RTL MUST preserve chronological meaning and product conventions; mirroring is not automatic for every axis.
- Translated series names and long units MUST be tested for clipping and legend overflow.
- Color names MUST not be the only way the legend refers to a series.

## Themes, contrast, and motion

- Series and focus indicators MUST remain distinct in light, dark, and higher-contrast themes.
- Higher contrast MAY strengthen axes, markers, and focus without changing data meaning.
- Motion MUST explain updates or transitions and MUST not delay data access.
- Reduced motion MUST remove sweeping reveals, continuous drift, and animated reordering.

## Acceptance

- The chart answers a named analytical question and is not decorative.
- Metric, unit, scope, source, freshness, aggregation, and missing data are available.
- Exact values remain available through keyboard interaction or a semantic Table.
- Color is not the only series or state distinction.
- Loading, empty, partial, stale, error, zero, and estimated states remain distinct.
- Narrow screens, touch, localization, higher contrast, and reduced motion preserve interpretation.
- Live updates do not reset theme, data, inspection position, or assistive context.

## Migration

Adopting products MUST verify data transformations, timezones, aggregation, axis domains, missing-value handling, sampling, and source freshness before restyling. A visual redesign MUST NOT change analytical meaning without a separate data decision and migration note.
