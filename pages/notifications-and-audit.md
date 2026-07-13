# Notifications and audit page

Status: normative

Use this page family for durable notifications, assigned updates, background-task results, security events, and immutable or append-only audit records.

## Distinctions

- Toast reports a recent action and is temporary.
- Notification Inbox stores updates the user may review later.
- Activity Feed records events around an object or workspace.
- Audit Log records accountable change with actor, time, scope, input or prior value where allowed, result, and source.

These surfaces MUST NOT be treated as interchangeable because they share a timestamped list appearance.

## Notification Inbox

- Each item identifies event, affected object, time, source, read state, and relevant action.
- Read state MUST not erase the event or imply that work completed.
- Read, unread, archived, dismissed, accepted, rejected, retried, and completed are distinct states. A notification action MUST report the result of the underlying operation rather than only removing the item.
- Filtering distinguishes assigned work, mentions, background results, security, system, and product updates where those categories exist.
- Bulk read or archive actions state scope and remain reversible when possible.
- Live arrivals do not force-scroll the reader.
- Delivery channel preferences belong in Settings, not inside every notification item.
- High-consequence actions such as approving money movement, authorizing a device, changing access, publishing, or retrying a non-idempotent job MUST open sufficient context, review, and recent authentication when product policy requires it. A compact notification row MUST NOT bypass those controls.

## Audit Log

- Records use absolute time with timezone access, stable actor and object identity, event type, outcome, source, and correlation or reference ID when available.
- Human, automation, integration, and system actors remain distinguishable.
- Filters and export preserve permission and retention policy.
- Audit records MUST NOT expose secrets or mutable display text as the only identity.
- A product MUST NOT claim audit immutability unless storage and access controls provide it.

## Candidate gap

KIN still requires a responsive Notification Inbox and Audit Log reference, read-state behavior, actor/object detail, permission filtering, export boundary, and automated live-arrival checks.
