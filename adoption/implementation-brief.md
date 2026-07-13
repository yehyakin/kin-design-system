# KIN implementation brief contract

Status: normative adoption contract

The implementation brief turns KIN from a general design reference into a project-specific composition decision. It is written before page styling or component migration begins and remains local to the consuming product.

The initializer creates `docs/kin-implementation-brief.md` and records its path in `kin.config.json`. The generated file starts as `draft`; it is not evidence that the design has been approved or implemented.

## Why the brief exists

Token mapping, a themed header, a component gallery, or the presence of KIN-named components cannot establish page-level adoption. A coding Agent needs an explicit answer to these questions before it can choose layout and components:

- What real task owns the first meaningful view?
- Which route uses which KIN product profile?
- Which region owns attention?
- What context remains visible while the task changes?
- Which surfaces are real boundaries, and which content stays flat?
- What is the priority order on a narrow screen?
- Which states and interactions must be shown with real behavior?
- Which familiar but incorrect substitutions are forbidden?

## Required machine header

Every project-local brief MUST begin with:

```yaml
---
kin_brief_version: 1
status: draft
primary_profile: intelligence-workspace
representative_route: TODO
---
```

Allowed status values are:

| Status | Meaning |
|---|---|
| `draft` | Product truth, route scope, or composition decisions are unresolved |
| `ready` | The implementation decisions are complete enough for an Agent to start the representative workflow |
| `approved` | A named product or design owner has reviewed the brief |

An Agent MAY move a brief from `draft` to `ready` after resolving every placeholder from repository evidence or explicit user direction. It MUST NOT mark the brief `approved` on behalf of a human reviewer.

## Required content

The brief MUST contain the following sections.

### Product truth

- Product and audience.
- Primary entity and primary task.
- Real data, route, permission, analytics, and brand sources of truth.
- Existing behavior and components that must be preserved.
- Authorized redesign mode: `redesign-preserve` or `redesign-overhaul`.

### Route and profile map

Every in-scope route or route family MUST name the KIN profile that governs its composition. Hybrid products MAY use more than one profile. For example, a public search page can use `information-site` while its entity database uses `intelligence-workspace`.

Exactly one route family MUST be marked as the representative workflow during the first adoption phase. Remaining routes MAY stay explicitly out of scope.

### Representative workflow

- User and trigger.
- Entry route and starting state.
- Current entity, document, selection, or operating context.
- Completion condition.
- Persistent state: filters, selection, scroll, draft, URL, or task identity.
- Applicable loading, empty, error, partial, stale, permission, offline, and recovery states.

### Composition contract

The project MUST write observable decisions, not adjectives:

- `First meaningful view`: the first task, object, query, document, or queue shown before explanation.
- `Dominant region`: the single region that owns attention.
- `Persistent context`: identity or state that remains visible while the user works.
- `Chrome behavior`: how navigation, toolbars, properties, and global actions recede.
- `Surface strategy`: which boundaries deserve a Surface and which groups remain flat.
- `Density strategy`: what aligns into rows, columns, property lists, or shared controls.
- `Semantic separation`: domain concepts that must not collapse into one score, Badge, or color.
- `Motion model`: origin, direction, commitment, interruption, and Reduced Motion behavior.
- `Narrow-screen priority`: the exact information and action order after layout adaptation.

The composition MUST reject any plan that could be copied unchanged into an unrelated product without changing its objects, relationships, and task sequence.

### Required interactions and states

List the interactions that prove the workflow, such as search, row selection, Inspector opening, URL restoration, command launch, save, undo, retry, or protected confirmation. Do not list a package merely because it appears in KIN references.

List the realistic states that will be rendered. A state is not covered because a component documentation page contains an example of it.

### Prohibited substitutions

Record the page-level shortcuts that would make the implementation fail even if its Tokens are correct. At minimum, reject:

- a marketing Hero before a working task;
- a Card wall replacing a list, document, queue, canvas, or reading hierarchy;
- a Sidebar and Inspector wrapped around an unchanged landing-page interior;
- a component gallery used as production evidence;
- invented metrics, sources, activity, AI output, or monitoring state;
- a desktop layout merely scaled down for mobile;
- a theme attribute that does not resolve the rendered theme and `color-scheme` together.

### Evidence and approval

Name baseline routes, states, viewports, and artifact locations before implementation. Name the person or role that can approve the brief and the person or role that performs the visual-signature review.

## Readiness gate

The consuming project MUST remain at `initialized` while the brief is `draft` or contains `TODO` placeholders.

Before evidence can move to `mapped`:

- the brief status is `ready` or `approved`;
- every required section contains project-specific decisions;
- `kin.config.json` contains a route/profile map;
- exactly one route family is marked representative;
- the evidence record names the same workflow and route;
- no component gallery, fixture, or isolated control is used as that workflow.

Before evidence can move to `verified`, the brief MUST be `approved`, the representative workflow MUST be implemented, and the visual review MUST pass each required criterion with comparable artifacts.

## Agent checkpoint

Before coding a page-level KIN adoption, an Agent MUST report this compact checkpoint:

```text
KIN composition checkpoint
Mode:
Primary profile:
Route/profile map:
Representative workflow:
First meaningful view:
Dominant region:
Persistent context:
Surface and density strategy:
Narrow-screen priority:
Required states and interactions:
Prohibited substitutions:
Evidence and rollback:
```

If repository evidence cannot complete the checkpoint, the Agent must keep the brief in `draft` and request only the decision that materially blocks composition.
