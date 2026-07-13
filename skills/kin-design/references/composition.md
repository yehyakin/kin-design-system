# Page and workflow composition

Read this reference when changing a complete page, a route family, an application shell, or a representative KIN adoption workflow.

## Do not begin with components

First identify the real task, current object, source of truth, starting state, and completion condition. Then write the composition checkpoint below. Token and component choices come after it.

```text
KIN composition checkpoint
Mode: <build | redesign-preserve | redesign-overhaul>
Primary profile: <information-site | intelligence-workspace | ecommerce-operations | engineering-canvas>
Route/profile map: <route family -> profile>
Representative workflow: <user starts here, does this, finishes when...>
First meaningful view: <task/object/query/document/queue/canvas>
Dominant region: <one region>
Persistent context: <identity/selection/filter/task state>
Surface and density strategy: <flat rows/reading flow/canvas/property list and real boundaries>
Narrow-screen priority: <ordered content and actions>
Required states and interactions: <real list>
Prohibited substitutions: <specific failure patterns>
Evidence and rollback: <baseline, target views, safe rollback>
```

Reject a checkpoint that uses adjectives such as “premium,” “modern,” or “Linear-like” in place of observable decisions.

## Profile defaults

### Information site

- Lead with search, subject identity, reading content, or a record list.
- Put provenance, currency, stable location, and navigation near the information they qualify.
- Keep ordinary prose, metadata, definitions, and citations flat.
- Do not put a marketing Hero or equal CTA row before the information task.

### Intelligence workspace

- Lead with an entity list, selected entity, signal queue, evidence/history region, or monitor task.
- Preserve current identity and state while selection, history, evidence, or properties change.
- Prefer List, Split View, Detail, Activity, and Inspector relationships over Dashboard cards.
- Keep risk, evidence confidence, completeness, availability, progress, and AI confidence separate.

### Ecommerce operations

- Lead with the catalog, order, inventory, campaign, creative review, approval, or exception task.
- Align money, units, time, channel, ownership, and state for comparison.
- Give imagery space only when identity or media review is part of the decision.
- Place AI suggestions inside review and execution context, not in a generic assistant panel.

### Engineering canvas

- Let the document, canvas, model, or measured selection dominate.
- Keep tool chrome, layers, and properties available but secondary.
- Preserve mode, unit, revision, save state, and selection context.
- Do not add workspace cards or decorative grids inside the canvas.

## Hybrid products

Do not force one profile onto every route. Map each route family to the closest product job. A public information entry may use `information-site`, while its database and investigation routes use `intelligence-workspace`.

Choose one high-value representative workflow for the first implementation phase. Do not choose the easiest or most decorative page.

## Reference relationships

Use the framework-free references only to inspect hierarchy, state, and interaction relationships:

- information site: `examples/product-patterns/information.html`;
- intelligence workspace: `examples/workspace-reference/index.html`;
- ecommerce operations: `examples/product-patterns/ecommerce.html`;
- engineering canvas: `examples/product-patterns/canvas.html`.

Do not copy their fixture content, dimensions, navigation labels, or source structure into a consuming product. The local implementation brief and real product remain authoritative.

## Implementation gate

When `kin.config.json` exists:

1. Read `scope.implementationBrief`.
2. Confirm the brief status is `ready` or `approved` before implementing the representative workflow.
3. Confirm `scope.routeProfiles` contains exactly one representative route family.
4. Keep the evidence workflow and route aligned with that entry.
5. Stop if the brief is still `draft`, contains `TODO`, or substitutes a gallery for production work.

For a new adoption, run the initializer only with an explicit profile:

```bash
node path/to/kin-design-system/scripts/init-adoption.mjs . --profile intelligence-workspace
```

The generated brief is project-owned. Fill it from real repository evidence; do not copy the KIN reference fixture as the product design.

## Visual gate

Compare baseline and candidate with realistic, equivalent content and named viewports. Review every required visual criterion:

- task first;
- one dominant region;
- continuous structure;
- density without repeated explanation;
- distinct semantics;
- resolved light/dark theme integrity;
- spatial and committed-result motion;
- preserved narrow-screen priority;
- no fabricated data or behavior.

Do not mark the visual review passed while any required criterion is `not-run`, `failed`, or unsupported by the recorded artifacts.
