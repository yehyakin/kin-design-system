---
kind: kin-controlled-pilot-report
status: planned
kin_revision: unassigned
product_revision: unassigned
profile: unassigned
representative_route: unassigned
implementation_brief_status: unassigned
---

# KIN controlled pilot report

Status: non-normative product-owned evidence template

Replace every `unassigned` value in the consuming product. This template MUST NOT be treated as a completed record, and the Agent MUST NOT mark human or production checks as passed without matching evidence.

## Scope and authority

- Product:
- Repository and branch:
- Product revision:
- Pinned KIN revision and contract checksum:
- Authorized mode: `audit`, `redesign-preserve`, or `redesign-overhaul`
- In-scope route family:
- Explicit exclusions:
- Product owner:
- Design reviewer:
- Engineering owner:
- Accessibility reviewer:
- Implementation brief path:
- Implementation brief status: `draft`, `ready`, or `approved`
- Human approval record, approver, and date:
- Evidence review date:

## Representative task

- User and trigger:
- Entry route and starting state:
- Current object or operating context:
- Completion condition:
- Persistent filters, selection, scroll, draft, URL, or task identity:
- Applicable loading, empty, partial, stale, error, permission, offline, pending, committed, and recovery states:

## Composition checkpoint

- First meaningful view:
- Dominant region:
- Persistent context:
- Chrome behavior:
- Surface strategy:
- Density strategy:
- Semantic separation:
- Motion model:
- Narrow-screen priority:
- Prohibited substitutions:

## Runtime integration decisions

For every integration used in the workflow, record:

| User problem | Existing implementation | Decision | Upstream behavior preserved | KIN owns | Product owns | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |

Do not list a package merely because KIN documents it.

## Comparable visual evidence

Use the same task, realistic content, state, viewport, and theme for each baseline/candidate pair.

Each artifact cell records its locator, source revision, and capture date. `Data / state identity` records the shared fixture, query, object, task, or governed private-evidence checksum that proves the pair used comparable content without publishing private data.

| State | Viewport | Theme / contrast | Data / state identity | Baseline artifact, revision, date | Candidate artifact, revision, date | Comparable | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primary task |  | Light / normal |  |  |  | not-run |  |
| Primary task |  | Dark / normal |  |  |  | not-run |  |
| Narrow-screen priority |  | Light or Dark / normal |  |  |  | not-run |  |
| Applicable failure or recovery state |  |  |  |  |  | not-run |  |

## Visual-signature review

- Review environment:
- Visual reviewer:
- Visual review date:

| Criterion | Status | Evidence and findings |
| --- | --- | --- |
| Task appears before explanation | not-run |  |
| One region owns attention | not-run |  |
| Structure is continuous | not-run |  |
| Density removes repetition | not-run |  |
| Semantics remain separate | not-run |  |
| Light and Dark retain hierarchy | not-run |  |
| Motion explains change and Reduced Motion preserves the result | not-run |  |
| Narrow screens preserve task priority | not-run |  |
| No fabricated data or behavior | not-run |  |

Allowed criterion states are `not-run`, `passed`, `failed`, or `not-applicable` with a specific reason. A general “looks like KIN” comment is not a result.

## Product-profile acceptance

Review the selected profile against its pinned KIN pattern in addition to the common visual signature. Mark the other profile `not-applicable` with a specific reason; do not delete its rows or infer a pass from the common criteria.

| Profile | Acceptance criterion | Status | Evidence and findings |
| --- | --- | --- | --- |
| intelligence-workspace | The analyst can identify the object, state, material change, time, source, certainty, and next action. | not-run |  |
| intelligence-workspace | Conflicting evidence remains visible and attributable. | not-run |  |
| intelligence-workspace | Keyboard navigation, preserved scroll, direct URL, and list/selection/detail continuity support repeated review. | not-run |  |
| intelligence-workspace | Comparable evidence shows the task—not explanation, a card wall, or an isolated themed component—owns attention. | not-run |  |
| ecommerce-operations | The operator can identify the affected product, channel, quantity or money, owner, and safe next action. | not-run |  |
| ecommerce-operations | Batch or scoped actions cannot silently expand beyond the visible selection or filter. | not-run |  |
| ecommerce-operations | Empty, partial, stale, permission-denied, and upstream-failure states preserve operating context. | not-run |  |
| ecommerce-operations | The workflow demonstrates a real operating decision and committed result, not a dashboard overview or component gallery. | not-run |  |

## Instruction and context evidence

- Trial arm: `product-pilot`, `full-contract-control`, or `compact-route-candidate`
- Shared trial ID and paired-report locator, when comparing Agent entry paths:
- Exact shared task-brief locator and checksum:
- Agent environment and active model, when the environment exposes it:
- Initial files and artifact read path:
- Full-contract fallbacks opened:
- Tool set, repository permissions, external-access boundary, and product-write authority:
- Context measurement method, unit, and tokenizer/runtime:
- Measured context size, if available:
- Session isolation, order, and carry-over controls:
- Instruction-adherence rubric and result:
- Missing-contract lookups:
- Conflicting or ambiguous instructions:
- Corrections requested by the human reviewer:
- Correction rounds before acceptance:
- Product-specific decisions that could not be derived from KIN:

Do not overload the product UI `baseline` and `candidate` screenshots to mean the two Agent trial arms. Each arm needs its own comparable product baseline/candidate artifacts.

Use `product-pilot` while validating the product workflow against the full KIN contract without making an Agent entry-path comparison. Use the other two values only after the reviewed compact route exists and the same task can run in isolated control and candidate sessions with one shared trial ID, task-brief checksum, tool set, permission envelope, content, state, viewport, and verification contract.

## Verification

### Static and deterministic commands

| Command | Status | Run time | Artifact | Notes |
| --- | --- | --- | --- | --- |
|  | not-run |  |  |  |

### Automated browser evidence

Automated browser checks are implementation evidence, not substitutes for the manual checks below.

| Check | Environment | Status | Run time | Artifact | Findings |
| --- | --- | --- | --- | --- | --- |
| Chromium smoke and primary workflow |  | not-run |  |  |  |
| Firefox smoke |  | not-run |  |  |  |
| WebKit smoke |  | not-run |  |  |  |
| Automated keyboard and focus assertions |  | not-run |  |  |  |
| Automated 200% reflow proxy |  | not-run |  |  |  |
| Screenshot matrix and diff review |  | not-run |  |  |  |

### Manual browser, device, and assistive-technology evidence

| Check | Environment | Status | Reviewer | Review date | Findings |
| --- | --- | --- | --- | --- | --- |
| Light / Dark / system |  | not-run |  |  |  |
| Keyboard and focus restoration |  | not-run |  |  |  |
| Hover and touch paths |  | not-run |  |  |  |
| Normal and Reduced Motion |  | not-run |  |  |  |
| Long-content localization |  | not-run |  |  |  |
| RTL behavior, or declared non-RTL product boundary |  | not-run |  |  |  |
| 200% real browser zoom |  | not-run |  |  |  |
| Forced Colors |  | not-run |  |  |  |
| Screen reader |  | not-run |  |  |  |
| Physical touch device, if gesture quality is claimed |  | not-run |  |  |  |

## Outcome

- Pilot result: `not-run`, `passed`, `failed`, or `blocked`
- Adoption stage reached, exactly matching the checked `docs/kin-evidence.json`:
- Evidence record locator and review date supporting that stage:
- Routes actually covered:
- Unresolved findings and owners:
- Accepted limitations:
- Product rollback:
- KIN contract corrections proposed:
- Next decision:

The pilot may remain useful when it fails. Record the observed limitation instead of weakening the task, changing content between screenshots, or relabeling unperformed checks. Do not advance an adoption stage unless the implementation-brief status, human approval where required, profile-specific review, dated evidence, and stage requirements in [`../README.md`](../README.md) agree.
