# Component selection routing

Status: normative

This contract tells designers and coding Agents how to choose the most appropriate KIN component for a real interface task. It prevents appearance-first selection, component omission that leaves a workflow visually incomplete, and indiscriminate use of every available component.

The component catalog, terminology, product data, and existing product behavior remain authoritative. “Automatic” means the selection should follow observable task conditions without requiring the user to name a component. It does not mean importing components automatically at runtime or replacing working product components without review.

The complete machine-readable matrix is [`selection-routing.json`](./selection-routing.json). It contains one route for every current [`catalog.json`](./catalog.json) ID: stable entries are automatic when their conditions match, candidate entries are guarded by their recorded evidence and fallback, and draft entries are manual-only. `node scripts/validate-components.mjs` MUST reject a missing, duplicate, unknown, or maturity-incompatible route.

## Required inputs

Before selecting a component, identify:

1. the user job and current object;
2. the content shape: action, choice, free entry, lookup, comparable records, hierarchy, properties, history, progress, feedback, analytical relationship, or overlay task;
3. consequence: temporary, selected, saved, published, destructive, financial, permission-changing, or externally visible;
4. duration: instantaneous, short request, durable background work, or continuous/live update;
5. source, freshness, permission, error, empty, partial, stale, and recovery states;
6. viewport, touch, keyboard, localization, theme, contrast, and Reduced Motion requirements;
7. the nearest stable catalog component and existing project implementation.

If these inputs are unknown, the Agent MUST resolve them from the repository or state the blocking product decision. It MUST NOT choose by visual resemblance.

## Selection order

Use this order:

1. preserve an existing product component when its behavior and semantics already match;
2. map it to the exact stable KIN canonical component;
3. compose the smallest set of stable components that completes the task and its states;
4. use a candidate component only when the real requirement justifies it and its known gaps are recorded;
5. create a new component contract only when no existing component can express the behavior without semantic distortion.

Do not install a runtime package merely because KIN documents an integration. Runtime selection follows [`../integrations/catalog.md`](../integrations/catalog.md) and remains product-owned.

## Task-to-component router

| User or data need | Preferred KIN component | Do not substitute |
|---|---|---|
| Execute one action | Button or Icon Button | Switch, selected Tag, clickable Card |
| Turn one setting on or off immediately | Switch | Checkbox submitted later, ordinary Button |
| Select several independent values | Checkbox group | Switch collection, removable Tags without selection semantics |
| Select exactly one visible option | Radio Group | several Toggle Buttons without group semantics |
| Change one compact view or mode | Segmented Control | Tabs for unrelated documents, several unrelated Buttons |
| Change among associated content panels | Tabs | Segmented Control used as route navigation |
| Choose from a fixed compact list | Select | Dropdown Menu, Combobox with unnecessary typing |
| Find and select from a large or filtered list | Combobox | Select with hundreds of options, generic Search Field |
| Search product records or content | Search Field | Combobox when no value is selected |
| Launch global navigation or actions by keyboard | Command Menu | page Search Field, giant Dropdown Menu |
| Show object actions | Dropdown, Context, or Overflow Menu according to trigger and scope | Popover containing an arbitrary action list |
| Explain one control briefly | Tooltip | Popover or Dialog |
| Show anchored contextual controls or information | Popover | Tooltip with interactive content, modal Dialog |
| Complete a blocking decision or bounded task | Dialog | Popover, Toast |
| Show edge-owned secondary navigation, properties, or narrow-screen context | Drawer or Sheet | permanent Sidebar, unanchored Dialog |
| Navigate global or section destinations | Sidebar, Breadcrumbs, or Pagination according to relationship | selected content row, decorative Tabs |
| Compare named records and columns | Data Table | Card grid, visual grid without table relationships |
| Show one selected object's properties | Inspector or Property List | Dashboard, nested Cards |
| Show hierarchy | Tree View | nested Sidebar or Accordion without tree semantics |
| Show chronological operational events | Activity Feed | Story Timeline, decorative timeline |
| Explain sourced milestones in one subject's story | Story Timeline, conditionally | Activity Feed, audit log, progress indicator |
| Show a semantic state | Status Indicator | colored dot alone, Tag used as state |
| Show several compact related object metrics | Metric Strip | independent stat Cards by default |
| Show cross-object dashboard metrics with separate drill-downs | Dashboard Metric Cards under the data/admin page contract | universal Card wall or decorative counters |
| Show an analytical relationship | Chart with exact-value fallback | decorative sparkline, metric-only score |
| Show continuous real-time analytical change | Live Chart, conditionally | animated Chart used to imply live data |
| Show a changed key value | Number Transition, conditionally | first-load counting or every table cell animation |
| Report a brief user-action result | Toast, normally through Sonner integration | Inline Alert for fleeting success, Toast for navigation |
| Keep contextual failure or warning visible | Inline Alert or Banner according to scope | Toast-only error |
| Show measurable completion | Progress Indicator | Spinner |
| Show unknown-duration isolated work | Spinner | fake percentage |
| Preserve predictable loading geometry | Skeleton | decorative shimmer, Empty State |
| Explain stable absence and next action | Empty State | Skeleton or generic error |
| Show accepted work that survives navigation | Background Task Queue | Toast, Spinner, Activity Feed |
| Review current versus proposed values | Suggested Change Review | generic confirmation Dialog |
| Review targets and side effects before execution | Execution Preview | Suggested Change Review or vague warning copy |
| Review media for approval and channel use | Media Review | generic Gallery |
| Collect AI instructions for real task-scoped work | AI Composer | generic chat box, Search Field |
| Map an answer or decision to sources | Evidence List | confidence score or related links |
| Show real incomplete model output | Streaming Response | typing animation or fake progress |

## Composition completeness

A visually complete interface does not mean every region receives a component container. It means every user need has the correct behavior and state treatment.

For each primary task, the Agent MUST check whether the composition includes the applicable:

- location and navigation;
- query, filter, sort, scope, or view control;
- data representation appropriate to the relationship;
- selection and current-object context;
- primary and secondary actions;
- loading, empty, partial, stale, permission, failure, and recovery feedback;
- confirmation, preview, undo, or durable task boundary when consequences require it;
- responsive replacement for any desktop-only structure;
- result feedback without duplicating the same message across Toast, Banner, and inline text.

Missing a required state is an incomplete workflow. Adding an unnecessary Card, icon, Chart, animation, or overlay does not make it more complete.

## Maturity and fallback

- Stable components SHOULD be selected automatically when their task conditions match.
- Candidate components MAY be selected only with a recorded reason, known gaps, test plan, and fallback.
- Draft components MUST NOT be selected automatically.
- If the project already has a semantically correct accessible component, adapt its Tokens and composition before replacing it.
- If no KIN component fits, preserve the product implementation and open a contract proposal rather than forcing the nearest visual shape.

## Verification

For every automatically selected component, verify:

- canonical name and governing contract;
- normal and applicable non-happy states;
- keyboard, focus, touch, and dismissal behavior;
- Light, Dark, Higher Contrast, and Reduced Motion behavior;
- narrow-screen substitution or reflow;
- localization and long-content behavior;
- result, error, recovery, and rollback ownership;
- no duplicate component solving the same job in the same region.

The Agent MUST report the selected components and why each is appropriate in the composition checkpoint or implementation report.
