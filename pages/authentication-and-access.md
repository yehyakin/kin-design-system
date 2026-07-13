# Authentication and access page

Status: normative

Use this page family for sign-in, registration, account recovery, address verification, invitation acceptance, provider return, session renewal, and step-up authentication.

## User job

Enter or safely resume the correct product context using a real configured identity method, while retaining a clear recovery path and without losing unrelated work.

## Page or overlay decision

- Use a full page for initial access, registration, recovery, invitation acceptance, complex provider choice, or any flow requiring stable URLs and multiple steps.
- Use Authentication Dialog only to resume a bounded task whose context is already visible and preserved.
- Use Session Re-authentication Dialog for recent-authentication or expired-session checks during a protected action.
- Do not place a full registration or recovery journey inside a Popover.

The component anatomy is defined in [`components/authentication.md`](../components/authentication.md).

## Entry and return context

- The page MUST identify the destination when access was requested from a known workspace, invitation, document, or action.
- A return target MUST be validated and owned by the consuming product; visual code MUST NOT trust arbitrary redirect parameters.
- Cancel or browser Back MUST lead to a safe public or prior location when one exists.
- Provider return, refresh, and retry MUST not submit the same protected action twice.
- A timed-out task MUST state whether its draft remains local, saved remotely, or unavailable.

## Flow families

### Sign in

Show only methods the backend actually supports. Keep credential, passwordless, enterprise SSO, passkey, and social methods distinguishable. The page MUST not present all possible methods as a component gallery.

### Registration and invitation

Registration MUST state whether it creates a personal account, joins an organization, or both. Invitation acceptance MUST identify the inviting organization, proposed role or access scope, inviter when available, expiration, and the effect of signing in with a different account.

### Recovery and verification

Recovery requests use non-enumerating result language. Verification states expose method, recipient or device context, expiration, resend state, alternatives, and support. Recovery does not erase the original return target.

### Session renewal

Session renewal states preserve the underlying task, name the blocked action, and resume only after real server confirmation. A visual success state alone MUST NOT execute the protected action.

## Layout

- The task column SHOULD remain between roughly 320 and 440 CSS pixels where the viewport allows.
- A context column MAY explain the destination, privacy boundary, or saved-work state; it MUST NOT become marketing content.
- Preference controls remain compact and outside the primary Tab sequence when native semantics allow, but they MUST remain keyboard accessible.
- On narrow screens the context column collapses, the form uses the available width, and actions remain at least 44px high.

## State and error ownership

- Field errors sit with fields.
- Authentication failure sits above the submit action or at the form summary.
- Provider outages sit with the affected provider method.
- Session, permission, or invitation failures identify the affected destination.
- System-wide incidents use [`system-and-recovery.md`](./system-and-recovery.md) when the whole task is unavailable.
- Toast MUST NOT be the only authentication error, verification result, or recovery instruction.

## Security, privacy, and accessibility boundary

- Credentials, OTP values, recovery tokens, and provider assertions MUST NOT be logged by reference UI or ordinary analytics.
- The product owns throttling, enumeration resistance, session cookies, CSRF protection, callback validation, factor enrollment, recovery, and server-side authorization.
- Password managers, autofill, paste, and accessible alternatives MUST remain available.
- The reference does not establish authentication security or WCAG conformance; verification follows [`principles/verification.md`](../principles/verification.md).

## Anti-patterns

- Decorative split-screen illustration replacing destination context.
- Six provider buttons displayed when only one method is configured.
- Error Toast with no persistent explanation.
- Disabled submit with no reason.
- Fake countdown, fake email delivery, fake provider success, or fake biometric state.
- Authentication Dialog that discards a draft when closed.
- Using CAPTCHA or transcription without an accessible path.

## Acceptance

- A user can identify where they are signing in, what method is active, what failed, how to recover, and where success returns.
- The full-page, recovery, and session-renewal paths preserve entered identifiers and surrounding task context where safe.
- Keyboard, touch, long localization, password managers, paste, 200% zoom, Reduced Motion, light, dark, and higher contrast have named verification evidence.
- Production adoption names the identity and session backend and keeps route and permission enforcement outside the visual contract.
