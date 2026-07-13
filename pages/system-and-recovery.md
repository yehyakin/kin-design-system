# System and recovery page

Status: normative

Use this page family when a route, permission, session, dependency, network, or server state prevents the current task from continuing normally.

## User job

Understand what is unavailable, whether work is preserved, what can be retried, and which safe destination or recovery action is available.

## Choose the smallest correct scope

- Use an inline error when one field, section, row, or request failed.
- Use a Banner when a page-wide condition affects otherwise usable content.
- Use a Dialog when a blocking decision or renewed authentication is required without leaving the task.
- Use a full recovery page when the route, entire task, permission boundary, session, deployment, or network state owns the failure.

Do not route every API error to a full-page illustration.

## State map

| State | Required meaning | Primary recovery |
|---|---|---|
| Unauthenticated or session expired | Identity is missing or no longer current; state whether work is preserved | Sign in or re-authenticate, then return safely |
| Forbidden | The user is known but lacks permission | Request access, switch context, or return |
| Not found | The route or object is unavailable without exposing protected existence | Search, return to parent, or open a known location |
| Gone or archived | The object existed but is intentionally unavailable when disclosure is allowed | Open history, replacement, or parent |
| Conflict | Local intent and current server state differ | Review values, reload, merge, or save a copy |
| Rate limited | The service is protecting capacity or policy | Show retry timing or background continuation when known |
| Offline | Network is unavailable | Preserve local work, retry, or continue with an available offline copy |
| Maintenance | The product or dependency is intentionally unavailable | Show scope, last update, status source, and safe retry |
| Server failure | An unexpected failure prevented completion | Keep a reference ID, retry when safe, and offer support |
| Partial dependency failure | Part of the page remains usable | Keep unaffected content and isolate the failed region |

## Content anatomy

1. plain-language title;
2. affected object or task when safe to disclose;
3. work-preservation status;
4. concise explanation without internal stack or secret details;
5. one primary recovery action;
6. one safe alternative such as Back, parent, search, save copy, or support;
7. optional incident time, retry time, status link, or reference ID.

Error codes MAY support support staff but MUST NOT be the title or only explanation.

## Retry and idempotency

- Retry MUST repeat only idempotent work or use a product-owned idempotency strategy.
- The interface MUST NOT invite retry when the original outcome is unknown and duplicate execution could cause harm.
- Pending retry keeps the original task identity and entered data.
- Repeated failure SHOULD expose an alternate path rather than creating an infinite loop.
- Automatic retry MAY occur for safe background reads, but visible user actions require clear state and cancellation where relevant.

## Work preservation

- Draft, selection, filters, scroll, file choice, and form inputs SHOULD remain when recovery can safely continue.
- The page MUST distinguish saved remotely, saved locally, pending synchronization, unsaved, and unavailable.
- Browser Back MUST not silently resubmit a mutation.
- Session renewal or permission change MUST revalidate the current server state before committing preserved input.

## Accessibility and localization

- On navigation to a full recovery page, focus moves to the error heading.
- Dynamic inline or Banner failures use appropriate announcements without repeating on every retry tick.
- Status and recovery do not rely on color or illustration.
- Long translated explanations, reference IDs, URLs, and support instructions wrap safely.
- Reduced Motion removes decorative error animation; an error page never requires animation to explain state.

## Anti-patterns

- Humorous or vague copy that hides the actual recovery path.
- Full-page 500 screen for one failed widget.
- Giant illustration above the only useful action.
- Retry button for a possibly completed payment, publish, delete, or batch action without idempotency.
- Claiming “your work is safe” without a real persistence source.
- Exposing stack traces, provider secrets, raw queries, or protected object existence.
- Sending every error through Toast.

## Acceptance

- A user can identify the affected task, preservation state, likely scope, primary recovery, safe alternative, and support reference.
- Permission, not-found, offline, rate-limit, conflict, session-expiry, and server-failure states remain semantically distinct.
- Retry cannot silently duplicate a protected action.
- Mobile, keyboard, screen reader, zoom, localization, themes, contrast, and Reduced Motion have named evidence.
- Production adoption maps real status codes, route guards, persistence, retries, idempotency, logging, support, and incident links.
