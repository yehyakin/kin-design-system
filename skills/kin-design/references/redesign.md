# Redesign workflow

Use this workflow for an existing interface.

## 1. Classify the redesign

- `redesign-preserve`: retain brand, information architecture, content voice, routes, analytics, and recognizable interaction patterns.
- `redesign-overhaul`: replace the visual language while preserving product behavior and content unless the user explicitly expands scope.

If the mode is ambiguous and the difference is material, ask one question before editing.

## 2. Capture the baseline

Record:

- framework, routes, rendering model, tokens, component library, and dependencies;
- current brand colors, typography, density, icon system, and motion;
- page tree, primary flows, state handling, SEO, analytics, and accessibility behavior;
- patterns to preserve, patterns to repair, and unsupported assumptions;
- baseline screenshots at representative desktop and mobile sizes.

## 3. Modernize in risk order

Prefer this order and stop when the requested outcome is met:

1. Correct information hierarchy and state meaning.
2. Consolidate semantic tokens and component primitives.
3. Repair typography, spacing, density, and alignment.
4. Recalibrate surfaces, borders, contrast, and focus.
5. Improve responsive behavior and interaction feedback.
6. Recompose major regions only when local fixes cannot solve the problem.

Do not silently change routes, navigation labels, form fields, permissions, legal copy, public API behavior, or tracking identifiers.

## 4. Compare

Inspect before and after at the same viewports and states. Confirm that the redesign improves hierarchy and task completion without removing useful density or recognizable product behavior.

## 5. Deliver

List preserved behavior, intentional changes, screenshots, tests, regressions checked, known issues, exceptions, and rollback.
