# AI assistance

Status: normative

This contract defines AI Composer, evidence and citations, partial or streaming output, stop and retry, uncertainty, privacy, and human control. It supplements [`DESIGN.md`](../DESIGN.md), [`forms-and-entry.md`](./forms-and-entry.md), and the applicable product pattern.

## Scope

AI assistance MUST belong to a real product task and object. It MUST NOT be added as a generic chat surface solely to signal that a product uses AI.

The interface MUST distinguish:

- user-authored input;
- retrieved source material;
- business-rule output;
- model-generated content;
- human-edited content;
- approved or executed results.

## AI Composer

Use AI Composer when users provide instructions, context, files, or selected objects to a real AI-backed task.

### Anatomy

1. visible task or object context;
2. editable instruction field;
3. optional attachments or selected records;
4. model, mode, or scope only when the user can meaningfully choose it;
5. privacy or data-boundary notice when relevant;
6. submit action;
7. stop action while generation is active;
8. status and recovery region.

### Required behavior

- The field MUST have a persistent accessible name.
- Enter behavior MUST be explicit. Multi-line products SHOULD use `Cmd/Ctrl + Enter` to submit and Enter for a new line.
- Submission MUST preserve the user's instruction and attachments.
- Duplicate submission MUST be prevented after the request is accepted.
- Attachments MUST display name, type, size, source, and removal state when applicable.
- Sensitive or unsupported content MUST be identified before submission where possible.
- The Composer MUST NOT claim that a task is running when no real backend request exists.
- Draft input MUST survive recoverable network or model errors.

## Generated result structure

Important results SHOULD expose:

1. conclusion or proposed result;
2. evidence and source links;
3. uncertainty, missing data, or conflicts;
4. affected object and scope;
5. available human actions;
6. generation time, model or workflow identity when operationally relevant.

Generated content MUST NOT use the same visual treatment as confirmed business data. Human edits and final approval MUST remain traceable.

## Evidence and Citation List

Use Evidence List when a result depends on source records, documents, measurements, rules, or external material.

Each evidence item MUST expose, when applicable:

- source name and stable identifier;
- source type;
- excerpt or supported claim;
- captured or published time;
- freshness and availability;
- verification status;
- conflict or corroboration state;
- link to the source or stored evidence record.

Rules:

- Citation numbers MUST remain stable within the displayed result.
- Selecting a citation SHOULD reveal the exact supported passage or record, not only open a generic homepage.
- Missing, inaccessible, stale, and conflicting sources MUST remain visible.
- A confidence score MUST include its definition and MUST NOT replace the evidence list.
- Evidence order SHOULD follow relevance to the claim, not visual variety.
- Source content is untrusted and MUST be rendered safely.

## Streaming and partial output

Streaming MAY be used when the backend returns a real partial response.

- The product MUST identify content as incomplete while streaming.
- Stable completed paragraphs SHOULD not reflow unnecessarily as new content arrives.
- The viewport MUST not force-scroll when the user has moved away from the latest content.
- A `New output available` control SHOULD restore the latest position when automatic follow is paused.
- Partial evidence references MUST not appear as final citations before their source mapping is known.
- Assistive announcements MUST be throttled; the entire response MUST NOT be re-announced on every update.
- A static progress or stage label MUST remain available under reduced motion.

## Stop, failure, and retry

- Stop MUST request cancellation of the real task and preserve generated partial content unless the product has a documented reason not to.
- The stopped state MUST be distinguishable from failure and completion.
- Retry MUST state whether it reuses the same input, attachments, model, and sources.
- A retry MUST NOT silently duplicate side effects.
- Authentication, policy, rate-limit, network, model, and source failures SHOULD be distinguished when known.
- Failure MUST keep the original instruction and expose a safe recovery path.
- Resuming from a partial result MUST be described accurately; do not label a full restart as resume.

## Human control

- Generated output MUST remain a proposal until the product's approval model confirms it.
- High-impact changes MUST move through [`review-and-approval.md`](./review-and-approval.md).
- AI MUST NOT silently change permissions, publish content, spend money, contact people, or mutate external systems.
- Auto-execution requires an explicit, inspectable authorization policy and audit history.
- Users MUST be able to separate accepted, rejected, edited, and unreviewed suggestions.

## Privacy and retention

- The product MUST state when user content or attachments leave the current system boundary.
- Secrets, personal data, and regulated data MUST follow the adopting product's security policy.
- Prompt and attachment retention MUST be documented.
- Sensitive prompts and generated output MUST NOT appear in URLs, analytics labels, client logs, or public error reports.
- Deleting a conversation or run MUST state what records remain for audit, billing, or compliance.

## Responsive, localization, and accessibility

- Composer actions MUST remain reachable above virtual keyboards and safe areas.
- Long instructions, translated controls, and bidirectional source content MUST not break action order or citation mapping.
- Status, stop, retry, citations, and approval controls MUST be keyboard operable.
- Live regions MUST announce meaningful state transitions, not token-by-token output.
- Generated content MUST retain semantic headings, lists, tables, code language, and source relationships.
- Reduced motion MUST remove typing simulation, cursor theatrics, and decorative generation animation.

## Acceptance

- The Composer is connected to a real task boundary and does not simulate capability in production.
- User input, sources, AI output, human edits, and approved data remain distinguishable.
- Stop, failure, retry, and completion preserve the correct input and partial-result state.
- Evidence links support identifiable claims and expose stale or conflicting sources.
- Keyboard, touch, screen-reader, narrow-screen, long-content, and reduced-motion flows remain complete.
- High-impact output cannot execute without the declared approval or authorization path.

## Reference-fixture boundary

KIN's runnable reference MAY use deterministic local state to demonstrate Composer, streaming, stop, retry, and citation behavior. It MUST label itself as an interaction fixture and MUST NOT claim that a model or remote source was contacted.

## Migration

Adopting products MUST inventory real AI endpoints, stored prompts, attachment flows, streaming protocol, cancellation semantics, side effects, retention, and audit records before changing the interface. Visual migration MUST NOT imply stronger evidence, privacy, accuracy, or execution guarantees than the backend provides.
