# RFC 002 - Scenario Atlas and Showcase Coverage

Status: accepted
Decision scope: public showcase information architecture, scenario discovery, and reference coverage
Normative effect: none; accepted decisions become normative only when incorporated into the governing contracts
Implementation status: Phases 1 and 2 complete; Phase 3 in progress
Accountable owner: [@yehyakin](https://github.com/yehyakin)

Normative terms describe the required implementation if accepted. Acceptance authorizes phased work but does not change page maturity, adoption evidence, Figma delivery, runtime support, or the authority of existing contracts.

## 1. Summary

This RFC establishes a KIN Scenario Atlas: a task-led discovery layer that makes the breadth of KIN product patterns, page contracts, states, and runnable references visible in one coherent showcase.

The Atlas would:

- organize scenarios by KIN product family and shared workflow rather than by visual template;
- expose the user job, dominant region, persistent context, applicable states, source contracts, maturity, and known gaps for each scenario;
- link to runnable references instead of replacing them with screenshots;
- distinguish source maturity from showcase presentation status;
- begin with six representative scenarios before expanding across the full coverage matrix;
- preserve different compositions for information, intelligence, ecommerce, and engineering products inside one consistent discovery shell.

The Atlas is not a new normative catalog, route-template library, component package, Figma library, adoption claim, or collection of copied third-party pages.

## 2. Problem

KIN already has substantial scenario coverage:

- four stable product-family patterns;
- ten stable page families;
- five candidate page contracts;
- one conditional draft page contract;
- deterministic references for every stable page family and for the candidate scheduling workspace.

That coverage is currently distributed across product-pattern tabs, page-flow links, component references, catalog documents, and separate runnable pages. A reader can discover each artifact, but cannot yet answer these questions from one place:

- Which real product tasks can KIN currently demonstrate?
- Which scenarios are stable, candidate, conditional, or only planned for the showcase?
- Which scenarios belong to one product family and which are shared?
- Which loading, empty, partial, stale, offline, permission, conflict, and recovery states are actually available to inspect?
- Which reference proves the scenario, and which contract governs it?
- Where does KIN have a coverage gap rather than a hidden or implied example?

The result is a discoverability gap, not primarily a component gap. The current showcase can appear narrower than the underlying contracts, while a list of component examples can appear broader than the complete tasks they actually support.

## 3. Evidence and source boundary

### 3.1 KIN sources

This proposal is grounded in:

- [VISION.md](../VISION.md), which requires recognizable but non-uniform product-family composition;
- [principles/visual-signature.md](../principles/visual-signature.md), which defines task-first composition, one dominant region, continuous structure, and family-specific signatures;
- [pages/catalog.md](../pages/catalog.md) and [pages/catalog.json](../pages/catalog.json), which define current page maturity and evidence;
- the four contracts in [patterns](../patterns/);
- [DELIVERY.md](../DELIVERY.md), which separates reference interfaces, adoption evidence, Figma interoperability, and project-owned runtime code;
- [adoption/implementation-brief.md](../adoption/implementation-brief.md), which rejects component galleries and Card walls as page-level adoption evidence;
- the current public showcase and deterministic references under [site](../site/) and [examples](../examples/).

### 3.2 External observation

The public [shadcn UI Kit showcase](https://shadcnuikit.com/) was reviewed across its [default dashboard](https://shadcnuikit.com/dashboard/default), [component collection](https://shadcnuikit.com/components), and [block collection](https://shadcnuikit.com/blocks).

The transferable observation is structural: scenario breadth becomes easier to understand when complete dashboard, app, and page examples are discoverable beside lower-level components, blocks, and examples. The useful lesson is the visible coverage model, not the visual style of any individual page.

KIN MUST NOT copy its source code, screenshots, assets, sample data, route names, dashboard shell, component defaults, typography, colors, or page compositions. KIN MUST also avoid the scaling failure in which route quantity outruns link, content, state, and narrow-screen verification.

The source is recorded in [REFERENCES.md](../REFERENCES.md). It is third-party evidence, not KIN product truth.

## 4. Goals

1. Make KIN's current scenario breadth legible without requiring readers to reconstruct it from several catalogs.
2. Let readers browse by product family, user job, maturity, and applicable state.
3. Connect every showcased scenario to its governing contract and runnable reference.
4. Keep source maturity, presentation completion, and consuming-product adoption as three separate concepts.
5. Demonstrate that KIN can remain recognizable across materially different product compositions.
6. Expose gaps explicitly so a candidate or draft is not mistaken for stable support.
7. Make desktop, narrow-screen, theme, contrast, and state behavior inspectable where evidence exists.
8. Scale the showcase through one validated catalog rather than handwritten navigation fragments.

## 5. Non-goals

This RFC does not propose:

- changing any current Token, component, page, product-pattern, interaction, motion, or accessibility contract;
- promoting any page or component maturity;
- implementing the Atlas before this RFC is accepted;
- replacing the page or component catalog;
- creating production application routes or backend behavior;
- presenting deterministic sample data as real, live, monitored, financial, identity, or AI data;
- making every KIN product use a Sidebar dashboard or three-column workspace;
- copying the inventory size, taxonomy, layout, source, or visual treatment of the external reference;
- publishing a Figma component library or changing Variables interoperability;
- publishing or broadening a runtime package;
- treating a showcase, component gallery, fixture, or screenshot as verified KIN adoption.

## 6. Definitions

| Term | Meaning in this RFC |
|---|---|
| Product pattern | The existing KIN contract for how pages and components combine for one product family. |
| Page family | A complete user-job contract tracked by pages/catalog.json. |
| Scenario | A named task sequence that applies one or more product and page contracts to a representative context. |
| Runnable reference | Deterministic HTML, CSS, and JavaScript evidence already governed by KIN; it is not a production route. |
| Scenario Atlas | The non-normative discovery layer that joins scenario metadata to existing contracts and references. |
| Source maturity | The authoritative stable, candidate, draft, or conditional status from the governing KIN catalog. |
| Presentation status | Whether the Atlas entry is planned, linked, or showcased; it does not change source maturity. |

A scenario is not complete because its component parts exist. It MUST expose a user job, entry state, completion condition, persistent context, required interactions, applicable states, and a truthful evidence boundary.

## 7. Decision principles

### 7.1 Scenario before component

The primary Atlas entry point MUST be a product task or shared workflow. Components and blocks MAY be cross-linked after the scenario is understandable, but MUST NOT replace it.

### 7.2 One discovery shell, different product compositions

The outer Atlas navigation MAY be consistent. The inner reference MUST retain its product-family composition:

- information scenarios lead with search, subject, reading, provenance, or records;
- intelligence scenarios lead with entities, evidence, signals, monitoring, or review;
- ecommerce scenarios lead with actionable queues, affected products, money, quantity, channels, or approvals;
- engineering scenarios keep the canvas, selection, units, tools, and document state dominant;
- shared workflows use the page contract appropriate to their job rather than inheriting an arbitrary dashboard shell.

### 7.3 Maturity remains visible

Every Atlas entry MUST show source maturity and presentation status separately. A candidate MAY be shown to make its contract and gaps inspectable, but it MUST be labeled candidate and MUST NOT be counted as stable support.

### 7.4 States are part of the scenario

An Atlas state control MUST expose only deterministic states implemented by the linked reference. A disabled or absent state MUST be described as a gap; the Atlas MUST NOT fabricate coverage to fill a selector.

### 7.5 Join sources; do not duplicate them

Scenario metadata MUST point to canonical contracts and catalog IDs. It MUST NOT restate page maturity, component maturity, manual checks, or known gaps as an independent source of truth.

### 7.6 Discovery is not adoption

The Atlas MAY prove that a deterministic KIN reference exists and that named checks ran. It MUST NOT claim that a consuming product is mapped, verified, or production-observed.

## 8. Proposed information architecture

The public showcase would gain a first-class Scenarios destination:

~~~text
Scenarios
|- Product families
|  |- Intelligence
|  |- Information
|  |- Ecommerce
|  `- Engineering
|- Shared workflows
|  |- Access and setup
|  |- Search, settings, and administration
|  |- Scheduling and transfer
|  `- Recovery, audit, and support
|- Browse by state
|  |- Loading and empty
|  |- Partial, stale, and offline
|  |- Permission, error, and conflict
|  `- Committed result and recovery
`- Browse by maturity
   |- Stable
   |- Candidate
   `- Conditional or draft
~~~

The index SHOULD use grouped, aligned rows or compact lists so readers can compare maturity, job, reference availability, and state coverage. It SHOULD NOT become a wall of equal dashboard cards.

Each scenario detail SHOULD contain, in this order:

1. name, one-sentence user job, product family, source maturity, and presentation status;
2. runnable reference or direct link to it;
3. available theme, contrast, viewport, and state controls;
4. first meaningful view, dominant region, persistent context, and completion condition;
5. governing product, page, component, and verification sources;
6. known gaps and evidence limits.

The component directory remains available as a separate lower-level route. A scenario MAY list the components it demonstrates, but the component list MUST follow the task description.

## 9. Proposed scenario catalog boundary

After acceptance, implementation SHOULD add one reviewed, non-normative catalog such as scenarios/catalog.json, plus a local Schema and validator. Exact paths remain subject to implementation review, but the catalog boundary MUST preserve these rules:

- product and page maturity resolve from existing canonical catalogs;
- contract and reference paths are repository-relative;
- a scenario identifies one primary product profile and MAY identify shared page contracts;
- presentation status is independent from source maturity;
- every state names the deterministic route or control that exposes it;
- missing evidence remains a named gap;
- no generated site file becomes a normative source;
- validation requires no new runtime dependency.

The minimum scenario fields are:

| Field | Purpose |
|---|---|
| id and canonical_name | Stable discovery identity. |
| group and product_profiles | Product-family or shared-workflow placement. |
| user_job | The concrete task, not a visual category. |
| entry, completion, and persistent_context | Workflow boundaries. |
| first_meaningful_view and dominant_region | Observable composition contract. |
| contract_paths and page_ids | Canonical KIN sources. |
| reference_path | Runnable evidence, when present. |
| source_maturity | Validated catalog status, never hand-promoted. |
| presentation_status | planned, linked, or showcased. |
| states | Implemented deterministic state names. |
| inspection_path and state_controls | Dedicated inspection route, direct reference route, visible label, and machine-checkable assertion for each showcased state. |
| viewports and themes | Explicitly available presentation modes. |
| known_gaps | Missing references, states, checks, or product evidence. |

Showcased means only that a dedicated Atlas presentation exists. It MUST NOT be used as a synonym for stable, verified, accessible, production-ready, or adopted.

## 10. Initial coverage matrix

Atlas waves are sequencing decisions, not maturity. P0 is the six-scenario pilot, P1 expands stable source coverage, and P2 exposes candidate, draft, or conditional work only with explicit gaps.

### 10.1 Intelligence scenarios

| ID | Scenario and primary task | Governing source | Source maturity | Atlas wave |
|---|---|---|---|---|
| INT-01 | Entity database review - select an entity, inspect evidence and properties, and make a reversible decision | [Intelligence workspace](../patterns/intelligence-workspace.md) | stable | P0 |
| INT-02 | Investigation and evidence review - compare chronology, sources, conflicts, and uncertainty | [Intelligence workspace](../patterns/intelligence-workspace.md) | stable | P1 |
| INT-03 | Risk queue - triage a signal, preserve semantic separation, assign or resolve review | [Intelligence workspace](../patterns/intelligence-workspace.md) | stable | P1 |
| INT-04 | Monitor center - inspect current measurement, history, failure scope, and retry context | [Intelligence workspace](../patterns/intelligence-workspace.md) | stable | P1 |
| INT-05 | Workspace home - resume ranked work without inventing a generic KPI dashboard | [Workspace home](../pages/workspace-home.md) | candidate | P2 |

### 10.2 Information scenarios

| ID | Scenario and primary task | Governing source | Source maturity | Atlas wave |
|---|---|---|---|---|
| INF-01 | Find and verify a record - search, filter, open, identify source and currency | [Information site](../patterns/information-site.md), [Search and results](../pages/search-and-results.md) | stable | P0 |
| INF-02 | Read with provenance - follow headings, citations, source context, and related records | [Information site](../patterns/information-site.md) | stable | P1 |
| INF-03 | Revision and correction history - understand what changed, when, and why | [Information site](../patterns/information-site.md) | stable | P1 |
| INF-04 | Collection and archive - navigate stable records, saved views, and archived material | [Information site](../patterns/information-site.md) | stable | P1 |

### 10.3 Ecommerce scenarios

| ID | Scenario and primary task | Governing source | Source maturity | Atlas wave |
|---|---|---|---|---|
| COM-01 | Product or inventory exception - identify the blocking state, affected quantity or channel, and safe action | [Ecommerce operations](../patterns/ecommerce-operations.md) | stable | P0 |
| COM-02 | Product detail and edit - preserve identity, sellable state, price, inventory, channel status, and activity | [Ecommerce operations](../patterns/ecommerce-operations.md) | stable | P1 |
| COM-03 | Order operations - keep payment, fulfillment, refund, ownership, and timeline distinct | [Ecommerce operations](../patterns/ecommerce-operations.md) | stable | P1 |
| COM-04 | Campaign or creative approval - review media, offer, channel, approver, and publication scope | [Ecommerce operations](../patterns/ecommerce-operations.md) | stable | P1 |
| COM-05 | Scoped batch change - confirm visible selection, affected count, execution result, and rollback | [Ecommerce operations](../patterns/ecommerce-operations.md) | stable | P1 |

### 10.4 Engineering scenarios

| ID | Scenario and primary task | Governing source | Source maturity | Atlas wave |
|---|---|---|---|---|
| ENG-01 | Select, modify, commit, and undo - manipulate a structured object while mode, units, save state, and revision stay visible | [Engineering canvas](../patterns/engineering-canvas.md) | stable | P0 |
| ENG-02 | Layer and object structure - navigate document hierarchy and inspect the current selection | [Engineering canvas](../patterns/engineering-canvas.md) | stable | P1 |
| ENG-03 | Generated change review - preview a diff, accept or reject it, and preserve attribution and undo | [Engineering canvas](../patterns/engineering-canvas.md) | stable | P1 |
| ENG-04 | Revision compare and conflict recovery - compare states without permanently crowding the canvas | [Engineering canvas](../patterns/engineering-canvas.md) | stable | P1 |
| ENG-05 | Export or background operation - expose phase, progress, cancellation, continuation, and result access | [Engineering canvas](../patterns/engineering-canvas.md) | stable | P1 |

### 10.5 Shared and conditional scenarios

| ID | Scenario and primary task | Governing source | Source maturity | Atlas wave |
|---|---|---|---|---|
| CORE-01 | Sign in, recover access, and return to intended context | [Authentication and access](../pages/authentication-and-access.md) | stable | P0 |
| CORE-02 | Onboard, configure, invite, resume, and complete setup | [Onboarding and setup](../pages/onboarding-and-setup.md) | stable | P1 |
| CORE-03 | Search, refine, inspect a result, and restore URL state | [Search and results](../pages/search-and-results.md) | stable | P1 |
| CORE-04 | Change settings or administration state with authorization and unsaved-change protection | [Settings and administration](../pages/settings-and-administration.md) | stable | P1 |
| CORE-05 | Recover from unavailable, permission, offline, or retryable system state without losing useful context | [System and recovery](../pages/system-and-recovery.md) | stable | P1 |
| CORE-06 | Find help, inspect status, escalate, and preserve support context | [Help and support](../pages/help-and-support.md) | stable | P1 |
| WORK-01 | Inspect a period, select an item, and reschedule with time and selection context intact | [Scheduling workspace](../pages/scheduling-workspace.md) | candidate | P0 |
| WORK-02 | Transfer or import data through mapping, partial failure, retry, and rollback | [Transfer and import](../pages/transfer-and-import.md) | candidate | P2 |
| WORK-03 | Review notifications and audit records through read state, filters, detail, and retention boundaries | [Notifications and audit](../pages/notifications-and-audit.md) | candidate | P2 |
| WORK-04 | Invite members, inspect roles, change permission scope, and confirm impact | [Organization and permissions](../pages/organization-and-permissions.md) | candidate | P2 |
| COND-01 | Inspect plan, usage, invoice, cancellation, or payment recovery only when the product requires billing | [Billing and plan](../pages/billing-and-plan.md) | draft and conditional | P2 |

## 11. P0 pilot contract

The first implementation phase MUST stop at six scenarios until their discovery, composition, state, and responsive behavior have been reviewed together.

| Pilot | First meaningful view and dominant region | Persistent context | Narrow-screen decision | Minimum state proof |
|---|---|---|---|---|
| INT-01 Entity review | Entity list or current entity with evidence; list or selected detail owns attention | Entity identity, filters, source time, review state | identity -> state -> action -> evidence -> history through detail route or Drawer | loading, partial, stale, conflicting evidence, source failure, committed decision and undo |
| INF-01 Find and verify | Search/results or record content; result list or article owns attention | Query, subject, source, revision, stable URL | search and subject precede content, then sources and related records | suggestions, no results, partial results, stale/offline copy, source unavailable |
| COM-01 Exception resolution | Actionable queue and selected product; blocking exception owns attention | Selection, batch scope, currency, quantity, channel, owner | identity -> blocking state -> affected value -> safe action -> activity | low stock or blocked, permission, stale upstream data, failed action, committed result and rollback |
| ENG-01 Canvas edit | Canvas with a real selection; canvas remains dominant | Tool mode, selection, units, zoom, save state, revision | explicit edit, inspect, or review mode instead of compressed rails | no selection, invalid or constrained edit, unsaved, conflict, offline, commit and undo |
| CORE-01 Access and recovery | Current access step and form; authentication task owns attention | Intended destination, identity/session boundary, recovery path | one focused column with no decorative side content displacing the task | invalid input, unavailable account state, rate limit, recovery, success and return context |
| WORK-01 Scheduling | Period view or agenda with selected item; schedule remains dominant | Period, time zone, filters, selection, pending change | agenda/list plus item detail route or overlay | loading, empty period, permission, scheduling conflict, failed save, committed reschedule and recovery |

WORK-01 remains candidate during the pilot. Its known real-product time-zone, recurrence, persistence, and assistive-technology gaps MUST remain visible.

## 12. State and mode model

The Atlas SHOULD offer a consistent control vocabulary while allowing each scenario to expose only applicable states:

| Dimension | Values |
|---|---|
| Theme | Light, Dark, Light High Contrast, Dark High Contrast |
| Viewport | Named wide reference and named narrow reference; additional widths only when checked |
| Data state | Normal, loading, empty, partial, stale, offline |
| Authority and failure | Permission, rate limit where applicable, error, conflict, recovery |
| Commitment | Pending, committed, failed, undo or rollback where the task supports it |
| Motion | Normal and Reduced Motion where the reference contains motion |

The visible control MUST distinguish available from planned. Selecting a mode MUST change the actual rendered reference or named route state; a decorative control that does not alter the reference is not coverage.

## 13. Showcase composition requirements

- The Atlas index MUST foreground scenario name, task, family, maturity, and reference availability.
- It MUST NOT lead with aggregate vanity counts or equal KPI cards.
- The detail view MUST keep the runnable scenario ahead of explanatory prose.
- Source, maturity, and known-gap information SHOULD remain available without covering the primary task.
- Theme, viewport, and state controls MUST preserve keyboard operation and current focus.
- Narrow-screen layouts MUST adapt information priority rather than scale desktop previews down.
- Scenario previews MUST use KIN-owned deterministic content and assets.
- External screenshots and brand assets MUST NOT be committed as Atlas content.
- A scenario MUST NOT claim live, real-time, monitored, financial, identity, or generated behavior unless the deterministic boundary is explicit.

## 14. Rollout

### Phase 0 - RFC accepted

- The discovery boundary, initial matrix, six pilots, maturity language, and ownership are approved.
- Do not change the current site or page catalog before acceptance.

### Phase 1 - Catalog and six linked pilots (complete)

- Add the scenario catalog, Schema, validator, and public Scenarios entry point.
- Join the six pilots to existing contracts and runnable references.
- Add source maturity, presentation status, and known-gap labels.
- Reuse existing KIN references before creating new scenario-specific pages.

Implementation record (2026-07-17): the repository contains the reviewed catalog, local Schema, validator, public Scenarios entry point, six linked P0 references, and 24 visibly planned entries. The complete automated suite and desktop/mobile screenshot review passed; no manual screen-reader, browser-zoom, touch-device, or consuming-product claim is implied.

### Phase 2 - Inspectable modes and state coverage (complete)

- Add only those theme, viewport, state, and motion controls that manipulate deterministic reference behavior.
- Add link, catalog, narrow-screen, focus, and state checks.
- Review all six pilots together for visual-signature and product-family distinction.

Implementation record (2026-07-17): catalog and Schema version 1.1.0 promote the six P0 presentations to showcased without changing source maturity. The public inspection lab exposes 14 deterministic state routes across the six pilots, exact 1180 by 760 and 390 by 844 viewport fixtures, and light, dark, light high-contrast, and dark high-contrast modes. URL state is shareable, parent controls retain focus, embedded appearance semantics stay synchronized, and independent Playwright assertions verify each enabled fixture. Motion remains reference-owned with no separate Phase 2 selector. Focused Chromium state and responsive checks plus Firefox and WebKit smoke checks passed; manual screen-reader, browser-zoom, physical touch-device, and consuming-product evidence remain outside this record.

Final verification (2026-07-17): all required documentation, design, component, page, scenario, integration, release, Token, and Figma Variables checks passed; `npm run test:tooling` passed 22 of 22 tests; `npm run runtime:check` and `npm run site:check` passed; and `npm run test:reference` passed 115 of 115 tests across Chromium Reduced Motion, Chromium normal motion, Firefox, and WebKit.

### Phase 3 - Stable coverage expansion (in progress)

- Add P1 scenarios in product-family groups.
- Prefer extending an existing complete reference over multiplying near-duplicate routes.
- Keep the index compact as the inventory grows.

Implementation record (2026-07-17): catalog version 1.4.0 promotes CORE-02 through CORE-06 plus INF-02, INF-03, COM-02, and ENG-02 without changing their stable source maturity. The Atlas now contains 15 showcased scenarios, 15 planned entries, and 38 deterministic state routes. Search and System Recovery expose independently distinguishable partial, stale, empty, permission, conflict, offline, rate-limit, recovery, and error fixtures. Product Detail and Edit adds loaded, unsaved, validation-error, saving, locally committed, permission, and failed-save fixtures while keeping product identity, prior money and inventory values, channel status, approval, and activity visible; its results are explicitly local and do not claim backend persistence or channel publication. Onboarding, Settings, Help, Information Reading, Revision History, and Layer and Object Structure expose only their honest baseline state. Unsupported queues, monitor recovery, order and campaign operations, scoped batch changes, generated-change review, conflict handling, and durable background operations remain planned rather than being inferred from adjacent static controls.

Verification record (2026-07-17): all required documentation, design, component, page, scenario, integration, release, Token, and Figma Variables checks passed; `npm run test:tooling` passed 22 of 22 tests; `npm run runtime:check` and `npm run site:check` passed; and `npm run test:reference` passed 115 of 115 tests across Chromium Reduced Motion, Chromium normal motion, Firefox, and WebKit. Automated Commerce checks cover invalid-field focus, unsaved edits, asynchronous local commit, discard, failed-save recovery, preserved prior values, and synchronized price, inventory-location, approval, and activity context. Focused visual review covered desktop and mobile Atlas density across the shared and product-family rows, the COM-02 desktop committed result and narrow high-contrast failed-save fixture, the CORE-05 narrow high-contrast conflict fixture, and the ENG-02 narrow high-contrast layer hierarchy with its selected object visible. Manual screen-reader, browser-zoom, physical touch-device, and consuming-product evidence remain outside this record.

### Phase 4 - Candidate and conditional visibility

- Add P2 entries only with explicit candidate, draft, or conditional labels and current gaps.
- Promote source maturity only through the existing page or component catalog process.
- Do not add billing unless a real product capability provides evidence for it.

Each phase MUST remain separately reviewable and reversible.

## 15. Verification requirements for implementation

Implementation acceptance MUST record the exact checks performed. At minimum:

- every scenario path, contract path, page ID, and reference path resolves;
- source maturity matches pages/catalog.json and cannot be promoted by the Atlas catalog;
- the six P0 entries expose the named task, dominant region, persistent context, and narrow-screen decision;
- every enabled state control reaches a deterministic state;
- theme and contrast labels match the actual rendered mode and color-scheme;
- wide and narrow references are checked for clipping, unreachable controls, and inappropriate horizontal scrolling;
- keyboard operation, focus visibility, Escape behavior, and focus restoration are checked where applicable;
- normal and Reduced Motion checks remain separate where motion exists;
- screenshots support visual review but are not reported as accessibility, screen-reader, browser-zoom, or production evidence;
- candidate and conditional entries remain visibly distinct from stable entries;
- no external source, screenshot, font, icon, logo, or sample content is copied into KIN;
- npm run site:check, applicable reference tests, and the complete repository validation suite pass.

Manual screen-reader, browser-zoom, touch-device, and consuming-product checks MUST follow [principles/verification.md](../principles/verification.md) and MUST NOT be inferred from automated Atlas checks.

## 16. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Template-gallery drift | Every scenario declares a user job, dominant region, persistent context, product profile, and prohibited substitutions. |
| Card-wall composition | Use grouped comparison rows for discovery and task-first runnable references for detail. |
| Maturity inflation | Validate source maturity from the canonical catalog and display presentation status separately. |
| Duplicate source of truth | Store IDs, short discovery text, and links; keep behavior, maturity, checks, and gaps authoritative in existing contracts. |
| Route and state sprawl | Require catalog validation, deterministic state locators, scoped rollout waves, and route checks before showcased status. |
| Uniform shell overriding product families | Share only the discovery shell; preserve family-specific inner composition and narrow-screen priorities. |
| Showcase mistaken for adoption evidence | Repeat the DELIVERY.md boundary in the Atlas and link to the implementation brief and evidence stages. |

## 17. Compatibility and rollback

- Existing contracts, catalogs, references, URLs, Tokens, adoption records, Figma output, and runtime boundaries remain unchanged by acceptance.
- The Atlas is additive. Existing direct links continue to work.
- Rollback removes the Atlas navigation, catalog, generated discovery pages, and their checks while leaving every governing contract and reference intact.
- No database, authentication provider, payment provider, package API, Figma ID, or consuming-product migration is involved.

## 18. Accepted decisions

The accepted decisions are:

1. Add Scenario Atlas as a non-normative discovery layer.
2. Organize by KIN product family and shared workflow, with state and maturity as secondary browse dimensions.
3. Approve the six P0 pilots: INT-01, INF-01, COM-01, ENG-01, CORE-01, and candidate WORK-01.
4. Keep source maturity and presentation status separate and machine-validated.
5. Reuse and link existing runnable references before building additional routes.
6. Preserve family-specific composition inside one consistent discovery shell.
7. Keep Figma, runtime packaging, adoption evidence, and production behavior outside this RFC.

## 19. Acceptance criteria

This RFC MAY move from proposed to accepted when:

- the Scenario Atlas is confirmed as a discovery layer rather than a new normative catalog;
- the coverage matrix matches current product and page contracts;
- the six-scenario pilot is approved as the first implementation stop;
- candidate and conditional labeling cannot be confused with stable support;
- catalog ownership, source paths, validation, and rollback are clear;
- external evidence and explicit exclusions remain recorded in REFERENCES.md;
- implementation phases can be reviewed without changing page maturity or adoption claims;
- the proposal does not change Tokens, components, Figma delivery, runtime package boundaries, or consuming-product authority.

Implementation MAY begin only after the RFC status is changed to accepted through review.
