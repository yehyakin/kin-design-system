# Agent activity

Status: normative

This contract defines Agent Activity Trace and nested Tool Activity for inspectable AI or automation runs. It supplements [`ai-assistance.md`](./ai-assistance.md), [`background-work.md`](./background-work.md), and the adopting product's authorization and audit model.

## Boundary

Use Agent Activity Trace when a run has stable identity, ordered stages, tool calls, permissions, and recovery behavior that users need to inspect.

Do not use it as a decorative account of generated reasoning. The interface MUST NOT expose hidden chain-of-thought, private model reasoning, secrets, authentication material, internal stack traces, or unrestricted raw tool payloads.

Agent Activity Trace is not interchangeable with:

- `Activity Feed`, which records flat object history across actors and time;
- `Background Task Queue`, which owns durable task state across navigation;
- `Progress Indicator`, which communicates completion rather than inspectable work;
- `Audit Log`, which is the governed immutable record when policy requires one.

A product MAY compose a trace inside a task detail or link a completed trace from Activity Feed. It MUST preserve the owning component's distinct identity and state.

## Required identity

Every trace MUST expose:

1. stable run identifier;
2. user-facing task or request;
3. initiating actor and time;
4. affected object and scope;
5. current run state;
6. permission or authorization boundary;
7. ordered stage records;
8. result, stop, retry, or recovery path;
9. retention or audit relationship when applicable.

Stage names MUST describe observable work such as `Evidence retrieved` or `Change proposed`. They MUST NOT fabricate internal reasoning labels.

## Stage states

KIN distinguishes:

- `pending`: not started;
- `running`: work is active;
- `waiting`: blocked by an explicit dependency, permission, or human decision;
- `completed`: the stage's result is confirmed;
- `failed`: the stage stopped because of an error;
- `stopped`: cancellation is confirmed;
- `skipped`: policy or previous output made the stage unnecessary;
- `expired`: the stage result is no longer usable.

`Completed` MUST NOT mean that a request was merely accepted. A waiting approval MUST NOT be presented as successful execution.

## Tool Activity

Tool Activity is a nested event type, not a standalone component unless the adopting product proves an independent browsing or audit task.

When a tool event is disclosed, it SHOULD include:

- tool or integration name;
- start and completion time;
- permitted input summary;
- affected object or query scope;
- result summary and count;
- duration where operationally useful;
- failure or retry state;
- redaction notice when fields are withheld.

Raw input and output MUST be minimized. Secrets, personal data, authentication material, private prompts, and untrusted source markup MUST be redacted or safely summarized before rendering.

## Human control and authorization

- The trace MUST distinguish read-only work, proposed change, approved execution, and completed side effect.
- A trace MUST NOT imply that displaying a suggestion grants permission to execute it.
- Stop MUST request cancellation of the real run and MUST remain pending until confirmed.
- Retry MUST state whether it reuses or refreshes input, sources, permissions, and prior partial results.
- High-impact execution MUST continue through [`review-and-approval.md`](./review-and-approval.md).
- Links to evidence, tasks, or audit records MUST open the exact permitted record when available.

## Disclosure and layout

- The default view SHOULD show stage name, state, time, and concise observable result.
- Tool detail MAY use a Disclosure Control.
- Expanded content MUST remain in reading order directly after its owning stage.
- Long traces SHOULD virtualize or paginate only when semantic list position and keyboard navigation remain available.
- New stages MUST not force-scroll users who moved away from the latest stage.
- A `New activity available` control SHOULD restore the latest position.

## Responsive, localization, and accessibility

- The trace MUST use an ordered list or equivalent list semantics.
- State MUST not rely on color alone.
- Relative time MUST expose absolute time.
- Tool disclosure MUST be keyboard operable and retain focus when its content updates.
- Narrow layouts MAY stack time below the stage but MUST preserve order, state, and ownership.
- Long translated stage names and bidirectional tool output MUST not detach a result from its stage.
- Meaningful state changes SHOULD be announced politely and at a controlled rate.
- Reduced Motion MUST remove moving connectors, repeated pulses, and simulated processing while preserving current state.

## Reference-fixture boundary

KIN's reference MAY simulate deterministic local stages and tool summaries. It MUST identify itself as a local interaction fixture and MUST NOT imply that an Agent, model, tool, remote source, permission service, or external write was contacted.

## Acceptance

- Run identity, scope, actor, permission, stages, and result remain inspectable.
- Tool details are minimized, safe, and owned by a stage.
- Hidden reasoning and sensitive values are never exposed.
- Read, propose, approve, execute, fail, stop, and retry remain distinct.
- Keyboard, touch, screen reader, narrow screen, long content, higher contrast, and Reduced Motion preserve the task.
- The trace does not replace durable task state or governed audit history.

## Migration

Adopting products MUST map real run identity, stage events, authorization, redaction, cancellation, retry, retention, and audit ownership before showing Agent Activity Trace. A visual trace MUST NOT invent observability that the backend does not provide.
