# Background work

Status: normative

This contract defines durable tasks, queues, batches, job status, cancellation, retry, partial completion, and notification ownership. It supplements [`feedback-and-progress.md`](./feedback-and-progress.md) and [`micro-interactions.md`](./micro-interactions.md).

## When to use a background task

Use a background task when work continues after the initiating view closes, survives navigation, affects multiple objects, or may take long enough that users need durable status.

A Toast or Spinner MUST NOT be the only record of background work.

## Task identity

Every task MUST have:

- stable task identifier;
- user-facing task name;
- initiating actor and time;
- affected object or scope;
- current state;
- latest meaningful stage;
- result or recovery action;
- retention or history policy.

Task names MUST describe the work, not generic states such as `Processing`.

## Task states

KIN distinguishes:

- `draft`: configured but not submitted;
- `queued`: accepted and waiting for capacity or schedule;
- `scheduled`: accepted for a known future time;
- `running`: currently executing;
- `pausing`: pause requested but not confirmed;
- `paused`: work can resume from a defined state;
- `cancelling`: cancellation requested but not confirmed;
- `cancelled`: stopped without completion;
- `partially-completed`: some targets succeeded and others did not;
- `completed`: confirmed successful result;
- `failed`: stopped by an error;
- `expired`: result or retry window is no longer available.

Products MUST NOT use `completed` when only request acceptance is confirmed.

## Queue and task row

A task row SHOULD expose:

1. identity and affected object;
2. state and stage;
3. progress or completed count when real;
4. start, update, and completion time;
5. actor or automation policy;
6. safe primary recovery or inspection action;
7. lower-priority actions in an Overflow Menu.

- Rows MUST remain comparable and MUST not become unrelated status cards.
- New tasks MUST not force-scroll a user away from older task detail.
- Filtering MUST distinguish active, completed, failed, and scheduled work.
- Relative time MUST expose absolute time.

## Progress and stage

- Determinate progress MUST come from real completed work or backend measurement.
- Indeterminate tasks MUST show a meaningful stage rather than a fabricated percentage.
- Batch tasks MUST expose total, succeeded, failed, skipped, and pending counts when available.
- Progress updates SHOULD be rate-limited to avoid excessive re-render and announcement.
- Estimated completion MUST be labeled as estimated and removed when it becomes misleading.

## Cancel, pause, and retry

- Cancel MUST state whether completed side effects remain.
- Cancellation is not complete until the backend confirms it.
- Pause MUST only be offered when the task can actually resume.
- Retry MUST state whether it retries failed targets, the whole task, or creates a new task.
- Retry MUST preserve or intentionally refresh input, version, permissions, and scope.
- Repeating non-idempotent side effects MUST require explicit review.
- Failed tasks MUST preserve error context without exposing secrets or internal stack traces.

## Partial completion

- Partial completion MUST not be reduced to generic failure.
- Users MUST be able to identify succeeded, failed, skipped, and pending targets.
- Available recovery MUST state whether it retries failed targets, rolls back successes, or accepts the partial result.
- Summary counts MUST link to the corresponding target set when practical.
- Exported reports MUST retain target state and timestamps.

## Notification ownership

- Task creation MAY use one Toast to confirm acceptance and link to durable status.
- Progress MUST live in the task surface, not a stream of Toasts.
- Completion MAY notify outside the product only when the user or policy requested it.
- Duplicate completion notifications across Toast, inbox, email, and system notification SHOULD be avoided.
- Notification links MUST open the exact task or result when permissions allow.

## Persistence, refresh, and offline behavior

- Task state MUST survive navigation and page reload when the backend supports durable work.
- Reconnecting MUST reconcile server state rather than replay optimistic local stages.
- Offline state MUST distinguish unsent local work from accepted remote work.
- Expired or pruned history MUST state retention boundaries.
- Multiple tabs SHOULD converge on the same task state without duplicating requests.

## Responsive, localization, and accessibility

- Mobile rows MAY stack metadata but MUST preserve identity, state, progress, and recovery.
- Long task names and translated stage labels MUST not hide status or actions.
- Task state changes MUST be announced politely and at meaningful intervals.
- Keyboard users MUST be able to filter, inspect, cancel, retry, and open results.
- Reduced motion MUST replace moving paths and repeated progress animation with static progress and text.

## Acceptance

- Accepted background work has durable identity and status outside transient feedback.
- Queue, running, paused, cancelled, partial, completed, failed, and expired remain distinct.
- Progress and estimated time are real and labeled.
- Cancellation, pause, retry, and rollback reflect actual backend semantics.
- Refresh, reconnect, multiple tabs, narrow screens, keyboard, and reduced motion preserve the task.
- Errors and audit records do not expose secrets.

## Reference-fixture boundary

KIN's reference MAY simulate deterministic local state transitions for queue, progress, cancellation, failure, and retry. It MUST identify itself as a fixture and MUST NOT imply that remote work persists after the page closes.

## Migration

Adopting products MUST map existing backend task states, idempotency, cancellation, retry, retention, and notification behavior before applying KIN labels. The interface MUST not invent pause, cancellation, progress, or durability that the backend does not provide.
