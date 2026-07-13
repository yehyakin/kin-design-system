# Authentication components

Status: normative

This contract defines authentication-specific composition. It supplements [`forms-and-entry.md`](./forms-and-entry.md), [`overlays.md`](./overlays.md), [`feedback-and-progress.md`](./feedback-and-progress.md), and [`pages/authentication-and-access.md`](../pages/authentication-and-access.md).

KIN defines interaction and presentation contracts only. The consuming product owns identity providers, credentials, cookies, session rotation, rate limiting, route protection, server-side authorization, recovery delivery, security monitoring, and incident response.

## Authentication Shell

Use Authentication Shell for a full-page sign-in, registration, recovery, verification, or invitation task.

It contains:

1. product identity and the exact destination or workspace when known;
2. one active authentication task;
3. available authentication methods supported by the real backend;
4. help, privacy, and recovery links when applicable;
5. theme and language controls that do not dominate the task.

- The active task MUST remain the visual and keyboard focus.
- Decorative illustrations, testimonials, feature grids, and marketing claims MUST NOT compete with authentication.
- A split layout MAY provide destination context, but the context region MUST collapse before the form becomes too narrow.
- The Shell MUST NOT imply that a provider or method is available when it is not configured.

## Authentication Dialog

Use Authentication Dialog only when authentication is required to resume a bounded task without losing context, such as saving a draft, approving a change, or returning from a timed-out session.

- The Dialog MUST name the blocked task and the destination after success.
- Underlying input MUST be preserved but unavailable while the Dialog is modal.
- Success MUST close the Dialog, restore focus to a logical surviving control, and resume only the action the user already requested.
- Failure MUST remain inside the Dialog and MUST NOT discard the underlying task.
- Registration, long recovery, provider administration, and complex organization selection SHOULD move to a full page.
- On narrow screens the Dialog MAY become a full-screen or bottom Sheet while preserving the same task and return contract.

## Sign-in Form

The Sign-in Form contains only methods supported by the product.

- Email or username and password fields MUST expose correct labels, types, autocomplete values, and error relationships.
- Password managers, browser autofill, and paste MUST remain enabled.
- A password visibility control MUST be an explicitly named button, preserve the value and caret where possible, and remain separate from submission.
- Submit MUST become single-commit while pending; duplicate authentication requests MUST be prevented.
- Global and field errors MUST remain distinct.
- Error wording MUST help recovery without confirming whether a specific account exists when that disclosure creates an enumeration risk.
- Alternative provider methods MUST retain their provider names and must not be reduced to unexplained icons.
- A separator MAY distinguish credential and provider methods, but it MUST NOT imply an order of security strength.

## Account Recovery Form

- The request form MUST state what will happen without confirming whether an account exists.
- The submitted identifier MUST remain editable through a clear return path.
- The product MUST show delivery delay, expiration, retry, and support behavior based on the real service.
- A recovery result MUST NOT claim that a message was delivered when the backend has not confirmed request acceptance.
- Recovery MUST NOT silently sign the user in or change credentials before a valid recovery proof is accepted.

## Verification Challenge

Verification Challenge covers email links, passkeys, device approval, OTP, recovery codes, and other configured proofs.

- The challenge MUST identify the method, destination or masked recipient, expiration, resend behavior, and alternatives.
- Users MUST be able to paste codes. Auto-advance MUST NOT prevent correction or screen-reader review.
- OTP values MUST NOT be logged, persisted in ordinary analytics, or exposed in error telemetry.
- Resend MUST use a real server state and MUST NOT reset a visible timer without a new request.
- Lost-factor and inaccessible-device paths MUST remain available when the product supports them.
- The optional `input-otp` adapter remains governed by [`integrations/input-otp.md`](../integrations/input-otp.md).

## Session Re-authentication Dialog

Use Session Re-authentication Dialog for step-up verification or an expired session during a protected task.

- It MUST state why verification is required and which action will resume.
- It MUST NOT imply that the underlying change already completed.
- Cancel MUST return to a safe state with the draft or review context intact.
- A successful re-authentication MUST authorize only the intended scope and duration defined by the product.
- Changing email, password, factors, API credentials, payment details, ownership, or destructive administrative state SHOULD require a product-defined recent-authentication policy.

## Required states

- Idle, editing, invalid field, global failure, pending, throttled, locked or administratively blocked, provider unavailable, offline, expired challenge, recovery requested, verified, and session expired.
- Disabled styling MUST NOT replace a readable explanation for blocked or unavailable methods.
- Pending MUST preserve entered identifiers and MUST NOT replace the entire form with an unrelated Spinner.
- Rate limiting MUST state when or how the user can safely retry without exposing internal thresholds.

## Accessibility and localization

- Authentication MUST support password managers, browser autofill, and paste as mechanisms that reduce memory and transcription burden.
- Authentication MUST NOT require a puzzle, transcription, or memorized secret without an accessible alternative or assistance mechanism appropriate to the product.
- Focus MUST move to the first invalid field or a global error summary after a failed submission.
- Errors MUST be associated programmatically and MUST not rely on color.
- Provider names, legal text, long email addresses, bidirectional identifiers, and translated recovery instructions MUST wrap without hiding the primary action.
- At 200% zoom, the form, errors, help, and actions MUST remain reachable without two-dimensional scrolling for ordinary form content.

## Reference-fixture boundary

The KIN reference MAY simulate invalid, recovery, pending, and re-authentication states. It MUST state that no credentials are transmitted and MUST NOT be described as a secure authentication implementation.

## Acceptance

- The user can identify the product, destination, method, current state, recovery path, and result.
- Keyboard-only users can complete, cancel, recover, and return from every represented method.
- The full-page and Dialog variants preserve the same authentication semantics while serving different context needs.
- Refresh, browser Back, provider return, session expiry, and failed recovery do not silently discard unrelated user work.
- Real adoption evidence names the identity backend, route protection, server authorization, session policy, error policy, rate limits, recovery delivery, and manual security review.

## Migration

Before restyling authentication, inventory every provider, callback, return URL, recovery route, verification method, session-expiry path, lockout, rate limit, organization invitation, legal link, and analytics event. Visual migration MUST NOT change security behavior or route protection without separate approval and backend verification.
