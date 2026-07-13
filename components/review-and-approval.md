# Review and approval

Status: normative

This contract defines Suggested Change Review, Diff Review, Execution Scope Preview, approval, Media Review, and rollback. It supplements [`DESIGN.md`](../DESIGN.md), [`ai-assistance.md`](./ai-assistance.md), and the applicable product pattern.

## Shared review model

Every review surface MUST identify:

1. the affected object and version;
2. the actor or generator;
3. the proposed change;
4. evidence or reason;
5. uncertainty and missing information;
6. expected impact;
7. available decisions;
8. audit and rollback behavior.

Review MUST not collapse proposal, approval, execution, and completion into one visual state.

## Suggested Change Review

Use Suggested Change Review when a person must inspect one or more proposed changes before they modify the source of truth.

- Before and after values MUST use the same labels, units, locale, and precision.
- Additions, removals, and modifications MUST be distinguishable without color alone.
- Unchanged context SHOULD remain available when needed to interpret the change.
- Each suggestion MUST support accept, reject, and edit when the business process allows them.
- Batch approval MUST expose the number and scope of selected changes.
- Dependencies between changes MUST be visible before partial acceptance.
- Rejection MAY capture a reason when it improves future work or audit quality, but MUST not add unnecessary friction.
- Accepted changes MUST not appear executed until persistence succeeds.

## Text and structured Diff

- Text Diff SHOULD support line, word, or field granularity appropriate to the task.
- Structured data MUST use labeled field comparison rather than raw serialized objects by default.
- Large Diffs MUST provide a change summary and navigation between changed regions.
- Whitespace-only or formatting-only changes SHOULD be identified when meaningful.
- Truncation MUST not hide the changed portion.
- Screen-reader output MUST describe old value, new value, and change type in a stable reading order.

## Execution Scope Preview

Use Execution Preview before an AI, automation, or batch command produces meaningful side effects.

The preview MUST show, when applicable:

- action name and initiating actor;
- target objects and count;
- systems, channels, accounts, or environments affected;
- data read, written, published, deleted, or transmitted;
- money, inventory, quota, or permission impact;
- notifications or external messages;
- expected duration;
- reversible and irreversible effects;
- confirmation requirement;
- rollback or compensation path.

Rules:

- Scope MUST be derived from the actual pending request, not generic help text.
- High-impact effects MUST be prominent without using alarm styling for ordinary operations.
- If scope changes after preview, confirmation MUST be invalidated and requested again.
- Irreversible operations MUST require an explicit confirmation that names the result.
- A preview MUST not imply guaranteed success; it describes intended effects.

## Approval states

Required states include draft, awaiting review, changes requested, approved, rejected, executing, partially completed, completed, failed, rolled back, and rollback failed where applicable.

- Approval authority MUST be enforced by the backend, not only hidden in the interface.
- The interface MUST show who approved, when, under which role or policy, and which exact version was approved.
- Editing an approved proposal MUST invalidate approval unless the policy explicitly allows limited changes.
- Partial completion MUST identify succeeded, failed, skipped, and pending targets.
- Approval and execution MAY be separate actions and MUST remain visually distinct when they are separate permissions.

## Media and Generated Asset Review

Use Media Review for images, video, audio, documents, renders, or generated creative assets that require selection or approval.

### Required information

- asset name and type;
- source or generation record;
- version and creation time;
- dimensions, duration, file size, or format as applicable;
- crop, safe area, or channel constraints;
- license, rights, consent, and provenance where required;
- generation parameters or model identity when operationally relevant;
- approval and publication status.

### Behavior

- Selection MUST be distinct from approval.
- Zoom, fit, actual size, playback, scrub, and comparison MUST be keyboard operable where applicable.
- Missing, failed, unsupported, processing, and expired media states MUST preserve metadata and recovery.
- Before/after or candidate comparison MUST keep scale, crop, playback position, and labels aligned where possible.
- Generated assets MUST be labeled as generated; labels MUST survive download or export metadata when the product requires it.
- Alternative text and captions MUST be reviewable before publication.
- The interface MUST not infer license or consent from visual content alone.

## Audit and rollback

- Every committed decision MUST record actor, time, proposal version, decision, affected targets, result, and rollback state.
- Undo MAY be used for immediate reversible changes, but durable audit history MUST remain.
- Rollback MUST preview what will be restored and what cannot be restored.
- Rollback failure MUST identify partial state and next recovery action.
- Audit records MUST not expose secrets or private source content beyond the viewer's permissions.

## Responsive, localization, and accessibility

- Narrow layouts SHOULD stack before and after values while preserving old/new labels.
- Media controls MUST remain reachable without covering the asset.
- Long labels, large values, different scripts, and RTL MUST preserve comparison mapping.
- Change types and approval states MUST not rely on red and green alone.
- Focus order MUST follow context, change, evidence, and decision.
- Reduced motion MUST remove animated Diff insertion and large media transitions without hiding changed state.

## Acceptance

- Users can identify the exact object, version, actor, evidence, impact, and available decision.
- Old and new values remain comparable without color alone.
- Scope changes invalidate stale confirmation.
- Approval permissions are backed by real authorization.
- Selection, approval, execution, completion, and rollback remain separate.
- Media provenance, rights, metadata, failure, and accessibility content remain reviewable.
- Keyboard, touch, narrow-screen, zoom, localization, and reduced-motion paths remain complete.

## Migration

Adopting products MUST preserve existing approval authority, version identity, audit records, side-effect boundaries, and rollback semantics. A redesign MUST NOT merge approval and execution merely to reduce the number of buttons.
