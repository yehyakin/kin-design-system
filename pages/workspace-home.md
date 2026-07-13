# Workspace home page

Status: normative

Use this page as the return point for ongoing work in dense applications. It is an operational home, not a generic Dashboard.

## User job

Resume important work, see what changed, identify blocked or assigned tasks, and open a relevant entity or saved view.

## Contract

- The page SHOULD prioritize pending work, recent changes, assigned or followed objects, saved views, and recoverable failures.
- Metrics MAY summarize a queue only when each metric links to a defined scope and action.
- Personalization MUST state whether ordering comes from user configuration, recency, role, or system ranking.
- Reordering or hiding modules MUST enter an explicit edit mode. Normal reading mode MUST NOT expose drag handles or make every module appear movable.
- Personalized modules MUST have stable identity, a defined persistence owner, a keyboard and touch alternative, and a recoverable reset. The interface MUST state whether changes affect only the current user, a role, or the shared workspace.
- A failed save MUST preserve the attempted layout and offer retry or rollback; a local preview MUST NOT be described as a committed shared configuration.
- Empty first-use state leads into [`onboarding-and-setup.md`](./onboarding-and-setup.md) or creation of the first meaningful object.
- The home MUST NOT become a wall of unrelated KPI Cards, decorative charts, product announcements, and AI suggestions.
- Permissions, stale data, background tasks, and failed sources remain visible rather than being filtered out to make the page look healthy.

## Candidate gap

KIN still requires a runnable reference proving task ranking, empty first-use behavior, personalization boundaries, responsive structure, and keyboard order across at least two product families.
