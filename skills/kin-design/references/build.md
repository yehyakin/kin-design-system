# Build workflow

Use this workflow for a new page, feature, component, or application shell.

## 1. Establish the model

- Name the primary entity, user task, critical status, evidence or source, and main action.
- Identify real data sources. Use explicit unknown, empty, stale, partial, and error states instead of invented data.
- Map the information hierarchy before choosing components.

## 2. Plan the interface

Produce a compact plan containing:

- the page's single primary job;
- an ASCII layout or short structural description;
- the semantic tokens and existing primitives to reuse;
- required states and responsive changes;
- one restrained product-specific signature, if it helps recognition or comprehension.

Reject the plan if it could be reused unchanged for an unrelated product.

## 3. Implement

- Read `components/core-states.md` from the KIN repository when implementing Sidebar, Data Row, Inspector, Command Menu, Button, Form, Activity, or Metric primitives.
- Read `components/micro-interactions.md` before adding paired-state icons, async progress, success confirmation, disclosure motion, or temporary feedback.
- Resolve ambiguous names through `components/terminology.md` and check `components/catalog.md` before treating a component as stable.
- Read the matching contract before implementation: `actions-and-selection.md`, `forms-and-entry.md`, `navigation-and-disclosure.md`, `data-display.md`, `feedback-and-progress.md`, or `overlays.md`.
- For AI instructions, evidence, generated changes, approvals, media review, durable jobs, or charts, also read `ai-assistance.md`, `review-and-approval.md`, `background-work.md`, or `charts-and-analysis.md` as applicable.
- Preserve server rendering and existing client boundaries.
- Prefer continuous surfaces, typography, spacing, alignment, and hairlines over card walls and shadows.
- Use one primary action accent; reserve other colors for stable semantic meaning.
- Keep AI contextual, evidence-based, uncertain when appropriate, and subordinate to human control.
- Avoid dependencies that only reproduce existing behavior.

## 4. Verify

Check realistic long and short content, loading, empty, error, partial, stale, disabled, selected, hover, focus, and destructive states as applicable.

Capture at least one desktop and one mobile rendering. For themed interfaces, also inspect light and dark. Exercise the keyboard path and reduced-motion behavior.

When claiming browser, motion, zoom, localization, RTL, Forced Colors, touch, or screen-reader completion, follow `principles/verification.md`. Label automated checks, screenshots, and manual evidence separately.

## 5. Deliver

Report decisions, files, dependencies, actual tests, visual evidence, exceptions, remaining issues, and rollback.
