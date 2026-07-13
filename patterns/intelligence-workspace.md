# Intelligence workspace pattern

Use this pattern for monitoring, risk review, evidence systems, investigations, observability, public-source intelligence, and continuously updated entity databases.

## Product job

Help an analyst identify an entity, understand its current state, inspect what changed, verify evidence, and make a reversible decision.

## Core entities

- Entity, signal, event, evidence, source, monitor run, relationship, finding, review, and decision.
- Risk, evidence confidence, data completeness, online health, and AI confidence MUST remain separate concepts and components.
- Every event records occurrence time, observation time, source, and verification state when those values differ.

## Structure

- Database: saved views + entity list + Inspector.
- Investigation: entity identity + chronology/evidence + properties and relationships.
- Risk queue: severity + signal + evidence state + owner/review state.
- Monitor center: task state + current measurement + history + failure/retry context.

The first meaningful view MUST expose an entity list, current entity, signal queue, evidence/history region, or monitor task. A marketing Hero, design-method explanation, or component showcase MUST NOT precede the analyst's real task inside the workspace.

### Default entity-database composition

When users repeatedly select entities and inspect evidence or properties, use this relationship as the starting point:

```text
Optional global Sidebar
└── Workspace
    ├── Location Bar: database / current entity / stable global actions
    ├── View Bar: query, filters, sort, saved view, display controls
    └── Primary region
        ├── Dense entity list or table
        └── Inspector or selected-entity detail
Command layer: command menu, menus, dialogs, toast
```

- The list or selected entity MUST occupy the dominant region; the Sidebar and global navigation recede.
- Selecting a row SHOULD preserve filters and scroll position, update a shareable URL when sharing matters, and reveal properties without rebuilding the page.
- Inspector sections use property rows, evidence rows, and Activity rather than independent cards.
- Desktop MAY use List, Split View, or Detail depending on width and task frequency. Narrow screens MUST preserve the order `identity -> state -> primary action -> key properties/evidence -> history` through a Drawer or detail route.
- Search, filters, selection, Inspector state, Escape behavior, focus restoration, and Back navigation are part of the workflow—not optional polish.
- If live data is unavailable, keep the last verified context when safe, label its time and scope, and provide recovery. A full-page generic error MUST NOT erase useful cached evidence without a product reason.

A public homepage in the same product MAY use the `information-site` profile. That does not permit the database route to retain a marketing-page composition.

## Visual register

- Dense, calm, and source-forward.
- Current identity and state remain visible while list, evidence, or history changes.
- Activity is a flat chronological record, not a decorative timeline.
- Charts support a decision and never replace exact values or source context.

## States

- Unknown, observed, pending verification, partially verified, confirmed, conflicting, stale, source unavailable, resolved, and archived.
- A source failure does not erase previously verified evidence.
- A risk escalation is recorded as an event with actor/rule and reason.

## Interaction

- Selection, filters, sorting, time range, and Inspector state SHOULD be deep-linkable when sharing matters.
- New live events do not force-scroll a reader away from the current position.
- AI summaries cite events/evidence, label inference, expose uncertainty, and never silently change a human-reviewed state.

## Anti-patterns

- NOC-style wall of glowing charts for ordinary analysis.
- A single “trust score” combining risk, evidence, uptime, and completeness.
- Red/green-only severity without language.
- Simulated live activity, fake source counts, or invented monitoring coverage.
- Adding a Sidebar and Inspector around an unchanged landing-page interior.
- Treating a component laboratory or a small set of low-priority routes as whole-workspace adoption.

## Visual-signature requirement

Apply the common and intelligence-workspace requirements in [`principles/visual-signature.md`](../principles/visual-signature.md). A representative production workflow MUST demonstrate persistent identity, one dominant work region, flat activity or property structure, and distinct risk/evidence/completeness semantics before the adoption can be described as visibly KIN.

## Acceptance

- An analyst can answer: what object, what state, what changed, when, according to which source, how certain, and what action follows.
- Conflicting evidence remains visible and attributable.
- Keyboard navigation, preserved scroll, and direct URLs support repeated review work.
- Comparable baseline and candidate screenshots show that the analyst's task, not an explanatory panel or dashboard card wall, owns attention.
- The representative workflow visibly demonstrates list/selection/detail continuity; a themed header, isolated Inspector, or component example cannot satisfy this requirement.
