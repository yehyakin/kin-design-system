# Data and admin dashboard page

Status: normative

Use this page when the primary job is to understand cross-object operating state at a glance, compare change over a named period, identify exceptions, and enter the exact queue, record, or source that requires attention.

This page is an operational overview. It is not a replacement for a database, object detail, approval workflow, investigation, or engineering canvas.

## Automatic selection rule

An Agent or product team SHOULD select this page family without waiting for a route to be named “dashboard” when all of the following are true:

1. the first meaningful view must summarize several objects, sources, channels, jobs, or operating domains;
2. the user must compare a current value with a period, baseline, target, or prior state;
3. exceptions, failures, or review queues are at least as important as healthy totals; and
4. every summary can lead to a defined list, source, queue, report, or object detail.

Do not select this page family when the primary job is to find one record, inspect one object, edit a form, review evidence, approve a proposal, or manipulate a canvas. Use the matching List, Split, Detail, Form, Review, Schedule, or Canvas contract instead. A page MAY embed one compact dashboard section when the local task needs a short visual summary, but the section MUST remain subordinate to that task.

## User job

Understand current operating health, identify material change or failure, narrow the scope, and open the exact operational surface that supports diagnosis or action.

## Required composition

The first meaningful view MUST contain:

- current scope and time range;
- source identity and freshness;
- a small set of comparable key metrics;
- one dominant analysis or trend region;
- an exception, review, or failure queue;
- a direct route from every summary to its underlying records.

The page MUST NOT assign equal visual weight to every module. The dominant analysis region normally spans more width or height than secondary summaries. Independent summary modules MAY use bounded Cards because their scope and drill-down differ, but ordinary filters, table regions, activity rows, and explanatory copy remain flat.

Recommended wide-screen order:

```text
Location / operating scope / time range / refresh state
Key metrics with source, range, change, and drill-down
Dominant trend or comparison | source distribution / task health
Exception queue
Recent activity or secondary operating context
```

Recommended narrow-screen order:

```text
Scope and freshness
Key metrics
Dominant trend with textual summary
Exceptions requiring action
Source or task health
Recent activity
```

## Metric and Card contract

Each metric MUST expose:

- a precise label;
- value and unit;
- current time range or comparison baseline;
- source and freshness;
- change with domain meaning, not automatic green-up/red-down treatment;
- loading, unavailable, partial, stale, and error behavior;
- a destination containing the underlying records when drill-down exists.

Metric Cards MAY be used only when the metric is independently actionable or leads to a distinct scope. They MUST use KIN semantic Surface and material roles, not a local elevation scale. A field of interchangeable Cards with equal emphasis fails this contract.

## Chart and analysis contract

Charts follow [`components/charts-and-analysis.md`](../components/charts-and-analysis.md).

- A chart MUST state title, measure, unit, period, source, freshness, missing-data behavior, and the decision it supports.
- Exact values MUST remain available through a semantic table, list, or accessible summary.
- Visual comparison MUST not hide a gap, failed source, revised value, or incompatible denominator.
- Animation MAY clarify a real data update. Initial-load chart theater, simulated live motion, particles, glow, and automatic counting are prohibited.
- A chart that cannot support a user decision SHOULD be removed.

## Exceptions and drill-down

- Failures, stale sources, review items, permission limits, and partial coverage MUST remain visible.
- Exception rows align identity, state, scope, owner, time, and next destination.
- Summary selection and filters SHOULD be URL-addressable when users share or revisit the same operating scope.
- Opening a queue or record SHOULD preserve the dashboard range and filter context where the product supports returning.
- An overview MUST NOT perform a consequential batch action without moving into the relevant review or confirmation contract.

## Context Thread mapping

- `Source`: operating scope, upstream systems, source count, and last verified time.
- `Compare`: time range, baseline, target, prior period, or distribution.
- `Decide`: exception filter and the item or queue chosen for investigation.
- `Commit`: commonly non-applicable on the overview because consequential changes occur in the target workflow.
- `Recover`: retry a failed source, preserve last verified data, or return to the same range and queue position.

The metric-to-analysis-to-exception relationship is the primary carrier. Do not render these phases as a Stepper or five equal Cards.

## States

- `normal`: current source coverage and comparison are available;
- `partial`: one or more sources are unavailable and affected values or chart gaps are identified;
- `stale`: the last verified view remains visible with its timestamp and stale boundary;
- `error`: the failed analytical region identifies scope and retry while safe last-known context remains visible;
- `empty`: the selected scope contains no records and offers a valid broader scope or setup path;
- `permission`: restricted modules explain the boundary without implying a zero value;
- `loading`: layout remains stable and does not fabricate placeholder values.

## Interaction

- Range, scope, and exception filters MUST have labels, keyboard operation, and visible focus.
- Refresh distinguishes pending, succeeded, failed, and last-verified states. A local reference MUST state that it does not contact a real service.
- A selected time range or filter MUST not be expressed only through accent color.
- Hover detail in a chart MUST have keyboard and touch equivalents.
- Reduced Motion MUST preserve the same values, order, and result without animated interpolation.

## Responsive and accessibility

- At narrow widths, summary modules reflow by task priority rather than desktop column order.
- Tables MAY become labeled record rows or a deliberately scrollable data region, provided every value and header relationship remains available.
- Touch targets are at least 44 by 44 CSS pixels.
- The page MUST support Light, Dark, Higher Contrast, Forced Colors, 200% zoom, long localized copy, and text resizing.
- Chart summaries and table fallbacks MUST remain available to assistive technology.
- Source freshness, state, and change MUST not rely on color alone.

## Product-family adaptation

- Intelligence products emphasize monitored entities, signal volume, source coverage, and exception evidence.
- Ecommerce products emphasize orders, revenue or price only when the currency and scope are real, inventory/channel health, operational failures, and approval queues.
- Engineering products emphasize builds, simulations, revisions, asset health, or measured system state while leaving editing and canvas work to the engineering workspace.
- Information sites SHOULD use this page only for a real public data overview; ordinary reading and subject pages continue to use the information pattern.

## Prohibited substitutions

- invented metrics, fake revenue, simulated live activity, or unsupported precision;
- equal stat Cards and chart Cards used to fill a grid;
- a dashboard replacing the actionable list, detail, review, or canvas route;
- unexplained sparklines, decorative donut charts, glow, gradients, or a second accent system;
- green and red assigned from numeric direction without domain meaning;
- hidden source failures or stale values made to look current;
- filters that change visuals without updating exact values and assistive text.

## Reference and product boundary

[`dashboard.html`](../examples/page-patterns/dashboard.html) is a deterministic local reference. It proves KIN composition, states, responsive ordering, theme behavior, keyboard controls, and drill-down relationships. It does not provide a real analytics backend, live monitoring, authorization, persistence, or production adoption evidence.

Consuming products own metric definitions, aggregation, permissions, source freshness, analytics, routing, caching, error recovery, and validation against real data.

## Acceptance

- A user can identify scope, period, source freshness, important change, current exceptions, and the next operational destination without reading explanatory documentation.
- One analysis region clearly owns attention; secondary Cards do not form an interchangeable wall.
- Metrics and charts agree with the exact-value fallback and expose partial or stale coverage.
- Every actionable summary leads to its underlying queue, record, report, or source.
- Wide and narrow layouts preserve the same operational priority.
- Automated page checks and named manual checks satisfy the page catalog and [`principles/verification.md`](../principles/verification.md).
