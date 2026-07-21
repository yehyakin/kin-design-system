---
kind: kin-controlled-pilot-brief
status: planned
product: 52.mk
profile: intelligence-workspace
mutates_product_code: false
---

# 52.mk intelligence-workspace pilot

Status: non-normative handoff; product audit and human approval required

This KIN change prepares the trial only. It does not modify 52.mk, approve a redesign, or claim that its current interface is visibly KIN.

## Candidate representative workflow

The product Agent should first verify this candidate against the actual repository and running product:

> Find a real service-provider entity, preserve the current query or saved view, open the entity context, inspect its current state and most recent material change, verify the underlying evidence or source, and return without losing list position or selection context.

The workflow completes when the user can answer, from real product data:

- which entity is selected;
- what its current state is;
- what materially changed and when;
- which source or evidence supports that statement;
- what next action the existing product makes available.

If the repository does not support this end-to-end task, keep the brief `draft` and select another real high-value intelligence workflow. Do not invent a follow, review, AI, monitoring, or write action to complete the brief.

## Initial composition hypothesis to validate

- **First meaningful view:** the real database query, entity list, selected entity, signal queue, or evidence/history context—not a marketing explanation.
- **Dominant region:** the entity list plus current detail/evidence relationship, or the current entity record when the product uses a Detail route.
- **Persistent context:** query, filters, saved view, selection, scroll position, current entity identity, and shareable URL where the product supports them.
- **Chrome behavior:** global navigation and secondary actions recede after location is understood.
- **Surface strategy:** list, property rows, evidence rows, and Activity remain continuous; Surface marks selection, overlay, or a real task boundary.
- **Density strategy:** repeated entity facts align in columns or property rows rather than repeated cards.
- **Semantic separation:** risk, evidence confidence, data completeness, online health, monitor state, and AI confidence remain independent.
- **Motion model:** row selection and Inspector/Drawer continuity preserve origin, direction, interruption, focus, and the same Reduced Motion result.
- **Narrow-screen priority:** `identity -> current state -> primary existing action -> key evidence/properties -> history -> secondary actions`.

These are hypotheses until checked against the actual product task and content.

## Required product-repository audit

Before implementation, the product Agent records:

1. actual routes and rendering boundaries;
2. real entity, event, evidence, source, status, risk, and monitoring models;
3. existing list, table, Inspector, Drawer, command, toast, theme, localization, and motion implementations;
4. URL, browser-history, filter, selection, and scroll restoration behavior;
5. permission, SEO, analytics, API, stale-data, and recovery boundaries that must remain unchanged;
6. realistic content and the available error/partial/source-unavailable states;
7. a product-owned rollback.

The audit is read-only. Product code changes require a separate instruction in the 52.mk repository.

## Required interactions to prove when applicable

- search or saved-view entry;
- keyboard and pointer row selection;
- selected-entity Inspector, Drawer, Split View, or Detail route;
- source/evidence access;
- URL and Back restoration;
- Escape and focus restoration for overlays;
- preserved list scroll position;
- stale or failed-source recovery without erasing previously verified context;
- Light, Dark, system, and Reduced Motion behavior.

Do not require a package merely to fill this list. Preserve working local behavior and use KIN integrations only when the approved brief records a real gap, evidence plan, and rollback.

## Comparable evidence matrix

At minimum capture the same realistic entity, data, state, viewport, and theme for:

- wide Light primary task;
- wide Dark primary task;
- narrow selection/detail adaptation;
- one applicable partial, stale, conflicting, permission, source-unavailable, or recovery state.

The baseline must precede implementation. A polished fixture, different entity, or changed data set is not a comparable candidate.

## Explicit exclusions for this KIN phase

- no 52.mk source edits;
- no API, database, permission, analytics, SEO, deployment, or data-model changes;
- no fabricated service-provider records, events, evidence, uptime, risk, or monitoring state;
- no public adoption claim;
- no production observation claim;
- no publication of private product evidence.

Use [`pilot-report-template.md`](./pilot-report-template.md) in the product repository and keep every unperformed check truthful.
