# Onboarding and setup page

Status: normative

Use this page family when a new user, workspace, or product context requires a small set of real setup decisions before useful work can begin.

## User job

Reach the first meaningful product outcome while understanding what is required, what is optional, what has already been saved, and how to continue later.

## Flow model

- Onboarding MUST be derived from actual prerequisites, not from a tour of every feature.
- Required and optional steps MUST be distinguished in language and behavior.
- Each step MUST have a stable identity so saved progress can resume after refresh, sign-in, provider return, or device change when the product supports it.
- Progress MUST describe completed prerequisites, not gamified achievement.
- The product MUST define whether Back changes previously committed data or only moves between views.
- Skip MUST be available for optional work and MUST state where the skipped task can be completed later.
- Exit MUST not silently discard completed steps or partially entered data.

## Common steps

Adopt only those required by the product:

- account or display identity;
- workspace creation or invitation acceptance;
- locale, timezone, currency, units, or regional defaults;
- data-source, calendar, channel, repository, or storage connection;
- first entity, saved view, catalog, project, or monitor;
- team invitation and role context;
- notification and privacy choices;
- review and confirmation.

Do not ask for information that can be inferred safely or deferred until it becomes relevant.

## Layout

- Keep one primary task per step.
- The step title, purpose, saved state, and primary action remain visible before supporting explanation.
- A compact progress list MAY remain alongside the task on wide screens; on narrow screens it becomes a concise current-step summary.
- Supporting screenshots or illustrations MUST explain the specific decision and MUST not be decorative filler.
- The product shell MAY be reduced during first-run setup, but the user still needs a safe exit, help, theme, and language access where relevant.

## State model

- Not started, current, valid, invalid, saving, saved, optional skipped, blocked, provider unavailable, permission denied, offline, stale resume data, complete, and abandoned.
- Saving MUST prevent duplicate commitment while retaining entered values.
- A failed external connection MUST keep the step context and expose retry, choose another method, or continue later when allowed.
- Completion MUST show the resulting workspace or entity and the next product action; it MUST NOT end at a generic celebration screen.
- If requirements change between sessions, the flow MUST explain the new or invalidated step rather than resetting all progress.

## Invitation and permission boundary

- An invite step MUST state who can invite, which role is proposed, whether seats or quotas apply, and what happens to pending or failed invitations.
- Onboarding MUST NOT grant access solely because a client-side step appears complete.
- Organization creation, role assignment, provider connection, and resource access require server-side authorization owned by the product.

## Accessibility and localization

- Step changes update the document title or main heading and move focus to the new task heading.
- A Stepper, when used, exposes current and completed states without acting as navigation unless earlier steps are actually revisitable.
- Errors remain associated with fields and a step-level summary where useful.
- Virtual keyboards MUST not cover the focused field or primary action.
- Long organization names, translated guidance, RTL, timezone names, currencies, and units MUST not truncate required meaning.

## Anti-patterns

- Carousel tour before the user can perform real work.
- Confetti, badges, streaks, or progress animation replacing saved-state clarity.
- Mandatory invitation or personalization with no product requirement.
- Fake integration success.
- Step count that changes without explanation.
- Restarting from step one after sign-in or provider return.
- Hiding required setup behind a dismissible tooltip sequence.

## Acceptance

- The user can identify the current prerequisite, total known scope, saved progress, optional work, next action, and exit.
- Refresh and resume restore the last valid step without repeating committed work.
- Failure and provider return preserve inputs and explain the next safe action.
- Completion leads to a real object or working location.
- Production adoption records persistence, server authorization, connection callbacks, invitation behavior, analytics boundaries, and rollback.
