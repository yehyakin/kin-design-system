# 001 — Make exit motion responsive

- **Status**: COMPLETE
- **Commit**: b300c02
- **Severity**: HIGH
- **Category**: Easing and duration
- **Estimated scope**: 4 files, small semantic Token migration

## Problem

KIN defines exit as a slow-starting curve. The affected surfaces use a shorter duration, but their first frames still hesitate when the user has already requested closure.

```css
/* DESIGN.md:1127 — current */
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
--ease-exit: cubic-bezier(0.4, 0, 1, 1);
```

```css
/* examples/workspace-reference/styles.css:500 — current */
.inspector {
  transition: transform 240ms var(--ease-enter), opacity 180ms var(--ease), visibility 0s linear;
}
.app-shell.inspector-closed .inspector {
  transition: transform 180ms var(--ease-exit), opacity 140ms var(--ease-exit), visibility 0s linear 180ms;
}
```

```css
/* examples/workspace-reference/core-components.css:228 — current */
.core-drawer { transition: transform 220ms var(--ease-exit), opacity 160ms var(--ease-exit); }
```

## Target

Retain the semantic name and KIN's calm, non-overshooting personality, but change the exit curve to the strong responsive ease-out from the motion audit:

```css
--ease-exit: cubic-bezier(0.23, 1, 0.32, 1);
```

Opening may retain `--ease-enter: cubic-bezier(0.16, 1, 0.3, 1)`. Closing MUST remain faster than opening and MUST start visibly on the first rendered frames. Reduced-motion crossfades remain unchanged.

## Repo conventions to follow

- Normative motion Tokens live in `DESIGN.md`.
- The workspace reference mirrors those values in `examples/workspace-reference/styles.css`.
- `examples/workspace-reference/core-components.css` consumes the shared variable rather than duplicating the cubic-bezier.
- User-visible normative changes are recorded in `CHANGELOG.md`.

## Steps

1. Change `--ease-exit` in `DESIGN.md` and `examples/workspace-reference/styles.css` to `cubic-bezier(0.23, 1, 0.32, 1)`.
2. Add one sentence to the Motion System stating that both entrances and exits need immediate visible response; exit uses the shorter budget and the exit Token rather than an ease-in curve.
3. Keep existing Inspector and Drawer durations, visibility cleanup, and reduced-motion behavior unchanged.
4. Update `CHANGELOG.md` with the semantic Token migration and affected product families.
5. Run `node scripts/report-token-changes.mjs HEAD` and record whether generated Token artifacts are affected.

## Boundaries

- Do NOT replace KIN's enter curve.
- Do NOT add bounce or overshoot.
- Do NOT change Drawer, Inspector, focus, inert, or cleanup state machines.
- Do NOT adopt the external project's disputed framework-performance claims as KIN requirements.

## Verification

- **Mechanical**: run all repository validators, `npm run test:tooling`, and `npm run test:reference`.
- **Feel check**: open and close Inspector and Drawer at normal speed and at 10% playback. Closure begins immediately, follows the owning edge, and finishes before the corresponding opening motion.
- **Interruption check**: trigger `open → close → open`; stale cleanup never hides the reopened surface.
- **Reduced motion**: closure remains a short crossfade with no spatial travel.
- **Done when**: the Token, reference CSS, documentation, tests, and changelog agree and no exit surface pauses before moving.
