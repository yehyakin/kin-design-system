# 003 — Define first and subsequent Tooltip behavior

- **Status**: COMPLETE
- **Commit**: b300c02
- **Severity**: MEDIUM
- **Category**: Purpose, frequency, and physicality
- **Estimated scope**: 6 files, contract, fixture, and tests

## Problem

KIN defines Tooltip semantics but not the temporal relationship between adjacent Tooltips. The reference exposes one Tooltip instantly on every hover/focus and cannot demonstrate the faster toolbar-browsing behavior.

```md
<!-- components/navigation-and-disclosure.md:67 — current -->
## Tooltip

- Tooltip content MUST be non-interactive.
- It MUST appear on keyboard focus and pointer hover, and dismiss on Escape.
```

```css
/* examples/workspace-reference/core-components.css:113 — current */
.tooltip-sample [role="tooltip"] { ... opacity: 0; pointer-events: none; transform: translateX(-50%); }
.tooltip-sample:hover [role="tooltip"], .tooltip-sample:focus-within [role="tooltip"] { opacity: 1; }
```

## Target

Define a Tooltip group/provider sequence:

- first intentional pointer hover: local reference delay `500ms`, then `125ms` opacity/2px origin-aware entrance;
- subsequent Tooltips in the same group while the sequence is active: `0ms` delay and `0ms` entrance duration;
- sequence window in the reference: `600ms` after leaving the active Tooltip group;
- keyboard focus: immediate display with no pointer delay; visual transition MAY be `80ms` opacity only;
- Escape: dismiss the current Tooltip until its trigger loses hover/focus;
- Tooltip remains non-interactive and cannot be the only touch path.

The numeric delay/window values are KIN reference values, not claims about a third-party package.

## Repo conventions to follow

- Normative semantics live in `components/navigation-and-disclosure.md` and `components/overlays.md`.
- The runnable fixture lives in `examples/workspace-reference/core-components.*` or the dedicated Motion Lab.
- Visual state must not replace accessible names.
- Reduced motion keeps timing/meaning but removes travel.

## Steps

1. Add first/subsequent, keyboard, Escape, group-window, touch, and localization rules to the two Tooltip contracts.
2. Replace the single Motion Lab Tooltip example with a three-control Toolbar group that records first and subsequent behavior.
3. Implement deterministic pointer and focus timing without adding a runtime dependency.
4. Use trigger-aware origin, `125ms` first entrance, and no animation on subsequent Tooltips.
5. Add Playwright coverage for first pointer delay, subsequent instant display, keyboard immediate display, Escape, and reduced-motion travel removal.
6. Add the behavior to the Motion Lab review notes and `CHANGELOG.md`.

## Boundaries

- Do NOT put links, buttons, validation, or required instructions inside Tooltip.
- Do NOT delay keyboard focus movement.
- Do NOT require a Tooltip implementation for universally understood icon controls that already have adequate context.
- Do NOT describe the reference timing as a package API default.

## Verification

- **Mechanical**: validators and full reference tests.
- **Feel check**: wait on the first Toolbar icon, then sweep across adjacent icons. The first prevents accidental activation; the sequence becomes immediate and never feels sticky.
- **Keyboard check**: Tab across the same controls; each Tooltip appears immediately and Escape dismisses it without moving focus.
- **Slow motion**: first Tooltip originates from its trigger and uses no visible scale from zero; subsequent Tooltips do not replay entrance motion.
- **Done when**: pointer, keyboard, touch alternative, reduced motion, localization, and sequence timing are all explicit and tested.
