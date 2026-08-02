# KIN Context Thread

Status: normative

The Context Thread is KIN's positive cross-product signature. It keeps the relationship between source, comparison, decision, commitment, and recovery legible while a user works.

It is a workflow relationship, not a component, decorative line, fixed Stepper, Timeline, Sidebar, or five-card layout. A product MUST express only the phases that exist in the real task. It MUST NOT invent a decision, mutation, progress state, or recovery path to make the interface look complete.

## Why it exists

Quiet surfaces, restrained color, compact type, and careful motion establish quality but do not create a recognizable product language by themselves. KIN becomes visible when the interface preserves the consequential path through the work:

```text
Source -> Compare -> Decide -> Commit -> Recover
```

The path MAY be non-linear. A user MAY return to a source after comparison, revise a decision before commitment, or enter recovery after a failed commit. The interface MUST preserve that continuity instead of presenting each phase as an unrelated screen.

## Phases

### Source

Source answers: what object, record, document, selection, scope, or evidence is the work based on?

- Identity, scope, provenance, revision, units, and collection time MUST remain attached to the information they qualify.
- A source MAY be an article, database record, product, order, selected geometry, external citation, generated proposal, or current document state.
- AI output MUST be identified as generated or inferred and MUST NOT silently replace the product source of truth.

### Compare

Compare answers: what changed, conflicts, differs, or remains uncertain?

- Comparable values MUST align by meaning, unit, scope, and time.
- Baseline and proposed state MUST remain distinguishable.
- Missing, stale, partial, contradictory, and unavailable inputs MUST remain visible when they affect the decision.
- A workflow with no meaningful comparison MUST NOT add a decorative before/after treatment.

### Decide

Decide answers: what judgment, approval, selection, or next action is being considered, by whom, and with what uncertainty?

- Proposal, confidence, permission, approval, and execution state MUST remain separate.
- The decision owner and consequence SHOULD be visible before a high-impact action.
- An automated recommendation MUST expose its evidence and remain reviewable where human control is required.
- A read-only information task MAY have no decision phase.

### Commit

Commit answers: where does the interface cross from inspection or proposal into a durable, externally visible, protected, or difficult-to-reverse change?

- The commit boundary MUST be explicit for destructive, paid, published, permission-changing, externally visible, or structurally durable work.
- Scope, affected objects, side effects, and permission MUST be understandable before commitment.
- Press, pending, success, failure, and duplicate-submission behavior MUST be truthful.
- A navigation click, passive read, or ordinary filter change MUST NOT be styled as a consequential commit.

### Recover

Recover answers: how does the user verify the result, undo, retry, continue in the background, resolve conflict, or return safely?

- Completion MUST follow confirmed product state, not elapsed animation time.
- Reversible actions SHOULD expose undo or rollback when technically valid.
- Durable work MUST retain identity, progress, result, and recovery after navigation or refresh.
- Failed work MUST preserve the prior valid state and the context needed to continue.
- A workflow with no recoverable consequence MAY omit this phase.

## Visual carriers

The Context Thread does not prescribe one shape. A product chooses the smallest carrier that preserves the relationship.

Allowed carriers include:

- a provenance gutter beside reading content;
- aligned current/proposed values;
- a selected row connected to a Detail or Inspector;
- an evidence rail that keeps citations attached to a conclusion;
- a compact review band before a commit action;
- a canvas selection connected to properties and revision state;
- an Activity or result row that confirms a committed outcome;
- spatially continuous panel and Drawer motion;
- a narrow-screen sequence that preserves the same priority order.

The carrier MUST encode a real relationship. A line, dot, number, color, or animation used only as decoration is not a Context Thread.

## Signature punctuation

KIN uses a small set of recurring visual punctuation to make the Context Thread recognizable without imposing one shell. A product SHOULD select only the punctuation that clarifies its real task:

- `Reference index`: a compact bracketed or monospace source marker such as `[1]` when the number is a stable citation or evidence reference. Decorative section numbering is forbidden.
- `Decision edge`: a one- or two-pixel start-edge marker on the selected, conflicting, or review-relevant row. It connects an object to adjacent context; it is not a glowing Card border.
- `Commit boundary`: one continuous comparison or review band that keeps current state, proposed state, exact scope, and the consequential action in the same reading path.
- `Recovery echo`: a durable result or Activity row that repeats the affected object and scope, then places undo, retry, reopen, or inspection next to that result.

Punctuation obeys these limits:

- A dominant region SHOULD have no more than one strong accent edge or commit boundary at a time.
- Phase words such as `Source`, `Compare`, and `Commit` are documentation language, not default production labels.
- Indigo identifies focus, selection, links, and primary action. Product semantic colors retain their meanings and MUST NOT color every phase.
- A punctuation mark MUST disappear when the relationship it represents is absent.
- Products MAY use none of these exact marks when another task-native carrier communicates the relationship more clearly.

## Receding chrome

Chrome recedes so the Context Thread can remain legible.

- Receding means lower visual salience after orientation, not disappearance.
- Location, global navigation, permission, safe exit, and the only available action MUST remain discoverable.
- Chrome MAY become denser, quieter, collapsible, or contextual when the task is established.
- Chrome MUST NOT animate away while keyboard focus is inside it.
- A consuming product MUST NOT use a permanently bright Sidebar, Top Bar, assistant panel, and Inspector that all compete with the current phase.

## Product-family silhouettes

The same Context Thread produces different task silhouettes. Products MUST NOT copy one shell across every profile.

### Information site

Default silhouette:

```text
Quiet public navigation
Search or subject identity
Reading field | provenance / revision gutter
Related record or next reading path
```

Mapping:

- Source: subject, author, citation, revision, or collection record.
- Compare: revisions, disputed claims, related records, or source conflict when relevant.
- Decide: optional interpretation, save, cite, or follow action.
- Commit: usually absent unless the user submits, publishes, corrects, or changes protected state.
- Recover: correction history, stable URL, saved state, or restored reading position when applicable.

An information site MUST NOT add a permanent application Sidebar or fake approval flow solely to resemble a workspace.

### Intelligence workspace

Default silhouette:

```text
Queue or entity list | dominant evidence / chronology workspace | decision Inspector
```

Mapping:

- Source: entity identity, monitor state, event, evidence, and provenance.
- Compare: chronology, conflicting evidence, previous state, or linked entities.
- Decide: finding, risk treatment, review, or leave-unchanged judgment.
- Commit: record, escalate, assign, suppress, or publish a governed finding.
- Recover: audit entry, rollback, reopened review, retry, or durable task result.

The evidence workspace, not the Sidebar or a metrics wall, MUST own attention.

### Ecommerce operations

Default silhouette:

```text
Scope and channel bar
Exception / operating queue | product or order decision workspace
Approval and release boundary
```

Mapping:

- Source: product, order, inventory location, channel, campaign, asset, or price basis.
- Compare: current/proposed money, quantity, channel, creative, or fulfillment state.
- Decide: approve, reject, edit, hold, schedule, or route.
- Commit: save, publish, charge, refund, fulfill, allocate, or release.
- Recover: undo, rollback, retry, partial result, audit, or manual continuation.

Money, units, inventory, channel, permission, approval, and publication MUST remain distinct at the commit boundary.

### Engineering canvas

Default silhouette:

```text
Compact document commands
Tool / layer dock | dominant canvas | selection properties
Units, save state, revision, and commit boundary
```

Mapping:

- Source: document, revision, selection, coordinate space, unit, or imported reference.
- Compare: preview, diff, constraint conflict, simulation, or prior revision.
- Decide: accept, reject, modify, or choose a tool/mode.
- Commit: write to document history, export, run, publish, or apply generated geometry.
- Recover: undo, redo, conflict resolution, autosave recovery, or restored revision.

The canvas MUST retain the largest area. The Context Thread MUST NOT become an overlay that obscures precision work.

## Responsive behavior

- Wide and narrow layouts MUST preserve phase order and identity even when the carrier changes orientation.
- A horizontal relationship MAY become a vertical sequence or bottom sheet on a narrow screen.
- A three-column workspace MUST NOT be compressed unchanged around a tiny center column.
- The current phase, safe action, and recovery path MUST remain keyboard and touch reachable.
- Responsive changes SHOULD preserve URL, selection, draft, scroll, and task identity where the product supports them.

## Motion behavior

- Motion MAY reveal the Context Thread only when it explains origin, comparison, commitment, or recovery.
- A Detail, Inspector, Drawer, or review surface MUST enter from and return toward its spatial origin.
- Commitment feedback MUST remain calm and must not celebrate routine operations.
- Reduced Motion MUST preserve the same phase relationship through immediate state changes, short fades, or static markers.
- Theme changes MUST NOT replay commitment, number, or chart animation.

## Agent contract

Before creating a page or workflow, an Agent MUST record:

```text
Context Thread
Source:
Compare:
Decide:
Commit:
Recover:
Carrier:
Signature punctuation:
Receding chrome:
Narrow-screen transformation:
Non-applicable phases and reason:
```

The Agent MUST reject a proposal when:

- the five words are copied into a decorative Stepper;
- every phase becomes an equal Card;
- non-applicable phases are invented;
- a generic Sidebar / Main / Inspector shell is reused without matching the product job;
- source and decision are separated across unrelated pages without a stable relationship;
- commitment is visually prominent while scope, permission, or recovery is hidden;
- the narrow layout changes the task priority rather than the spatial arrangement.

## Review

A representative workflow does not satisfy the Context Thread contract until a reviewer can answer:

1. What is the current source or operating object?
2. What comparison or uncertainty matters now?
3. Is a decision actually being requested?
4. Where is the real point of consequence?
5. How is the result verified or recovered?
6. Which visual carrier connects those answers?
7. Does chrome recede without hiding location, exit, permission, or the safe action?
8. Does the product silhouette differ meaningfully from unrelated KIN product families?
9. Does the narrow layout preserve the same task order?

If a phase does not apply, the review MUST record the reason rather than mark it as visually absent by accident.
