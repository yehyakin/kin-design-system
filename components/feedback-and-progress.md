# Feedback and progress

Status: normative

This contract defines contextual notices, temporary feedback, loading, progress, and recovery. It supplements [`DESIGN.md`](../DESIGN.md), [`micro-interactions.md`](./micro-interactions.md), and [`integrations/sonner.md`](../integrations/sonner.md).

## Feedback ownership

Feedback MUST appear at the narrowest scope that still explains the result:

1. field validation beside the field;
2. object or section result inside that object or section;
3. page-level condition in an Inline Alert or Banner;
4. transient cross-context result in a Toast;
5. long-running work in a persistent task or progress surface.

Toast MUST NOT replace required inline error, progress, or audit history.

## Inline Alert

Use Inline Alert for a condition that affects the surrounding section or task.

- It MUST state what happened, which scope is affected, and the next available action.
- Severity MUST be expressed in text or icon plus color.
- It SHOULD remain visible until the condition resolves or the user dismisses a genuinely dismissible notice.
- Critical validation or recovery guidance MUST NOT be dismissible before resolution.
- Multiple alerts SHOULD be consolidated by scope rather than stacked repeatedly.

## Banner

Use Banner for a page-wide, workspace-wide, account-wide, or service-wide condition.

- The scope MUST be explicit.
- It MUST not push critical controls off screen without an equivalent compact state.
- Persistent banners SHOULD remember dismissal only when the underlying condition permits dismissal.
- A banner MUST not be used as promotional chrome inside a task surface.

## Toast

Use Toast for a concise result of a user-initiated action when the relevant context may no longer be visible.

- Allowed examples include saved, copied, exported, queued, failed, retry, and undo.
- Page loaded, navigation succeeded, theme changed, and search completed MUST NOT create Toasts.
- A reversible action SHOULD provide Undo in the same Toast.
- A failed action SHOULD offer Retry only when repeating is safe.
- Updating tasks SHOULD update one Toast rather than create a sequence of duplicates.
- No more than three Toasts SHOULD be visible at once.
- Toast content MUST be announced without moving keyboard focus.

## Progress Indicator

Use Progress Indicator when work has started and progress can be measured or meaningfully staged.

- Determinate progress MUST expose the current value, range, and task label.
- Indeterminate progress MUST not display a fabricated percentage.
- A progress bar SHOULD appear only after a short delay when flashing it would be more distracting than the wait.
- Work lasting beyond a brief interaction MUST state the current stage or completed count.
- Long-running work MUST provide cancellation, background execution, or safe navigation when the product supports it.
- Completion MUST be confirmed by the actual system result, not by animation duration.

## Meter

Use Meter for a known scalar measurement such as quota, capacity, or completeness, not for task progress.

- Minimum, maximum, current value, unit, and interpretation MUST be available.
- Threshold colors MUST be defined by business meaning.
- A Meter MUST not animate like an active task unless the underlying value is changing live.

## Spinner

Use Spinner only for compact, indeterminate waits where preserving the current layout matters.

- It MUST have a nearby accessible status label when the wait is not obvious.
- It MUST not replace page structure or the user's current data.
- Multiple independent Spinners SHOULD be avoided; prefer section-level ownership.
- Reduced motion MUST replace rotation with a static indicator and status text.

## Empty, error, stale, offline, and permission states

- Empty MUST explain why no content exists and what action is possible.
- Error MUST identify the failed object or scope, preserve safe existing data, and offer a valid recovery action.
- Stale MUST show the last successful update and MUST NOT masquerade as current data.
- Offline MUST distinguish local connectivity from remote service failure when known.
- Permission denied MUST not be presented as empty or missing data.
- Rate limited MUST preserve context and state when retry becomes possible.

## Announcement behavior

- Validation errors MUST be associated with fields and summarized for complex forms.
- Non-urgent status updates SHOULD use polite live announcements.
- Critical failures MAY use assertive announcement only when immediate attention is required.
- Repeated progress updates MUST be throttled to avoid overwhelming assistive technology.
- Visual loading indicators MUST have an equivalent text status.

## Themes, contrast, and motion

- Severity and progress MUST remain legible in light, dark, and higher-contrast themes.
- Reduced transparency MUST replace translucent Toast or Banner surfaces with solid surfaces.
- Reduced motion MUST stop shimmer, rotation, looping path animation, and celebratory motion.
- Progress may update instantly under reduced motion; status text and numeric values MUST remain.

## Acceptance

- Every message has one clear scope and owner.
- Required recovery never exists only in a Toast.
- Progress never fabricates percentage, stage, or completion.
- Screen readers receive important results without focus theft or repetitive announcements.
- Error, empty, stale, offline, permission, and rate-limit states are distinguishable.
- Long tasks preserve user context and expose a safe next step.

## Migration

Before replacing existing feedback, map each message to field, object, section, page, global, or background-task scope. Existing audit records and durable task status MUST NOT be reduced to temporary Toasts.
