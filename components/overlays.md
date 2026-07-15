# Overlays

Status: normative

This contract defines Dialog, Drawer, Popover, Menu, Tooltip, Hover Card, scrim, focus containment, stacking, and mobile adaptation. It supplements [`DESIGN.md`](../DESIGN.md), [`navigation-and-disclosure.md`](./navigation-and-disclosure.md), and [`micro-interactions.md`](./micro-interactions.md).

## Choosing an overlay

- Use Dialog for a focused decision or bounded task that interrupts the underlying workflow.
- Use Drawer for contextual detail or a task that enters from a screen edge and may need more vertical space.
- Use Popover for compact interactive content anchored to a trigger.
- Use Dropdown Menu or Context Menu for command collections.
- Use Tooltip for non-interactive short text.
- Use Hover Card only for optional preview information that also has a keyboard and touch path.
- Use a full page when the task needs stable URL, deep navigation, long editing, or extensive content.

Content that can be understood and completed inline SHOULD remain inline.

## Shared overlay anatomy

1. trigger or invocation target;
2. accessible name;
3. overlay surface;
4. content and actions;
5. optional close control;
6. optional scrim for modal overlays;
7. return-focus target.

Every overlay MUST define opening, initial focus, keyboard traversal, dismissal, return focus, scroll ownership, collision behavior, and responsive adaptation.

## Dialog

- Dialog MUST have a visible or programmatic title.
- Modal Dialog MUST contain keyboard focus and make the background unavailable to interaction.
- Initial focus MUST go to the first meaningful task control, a safe action, or the dialog container when content must be read first.
- Escape SHOULD close unless closure would lose critical state without warning.
- A destructive confirmation MUST name the object, scope, and irreversible result.
- The primary and cancel actions MUST remain reachable at 200% zoom and on small screens.
- Closing MUST restore focus to the trigger or a logical surviving target.

## Drawer and Sheet

- Drawer MUST enter from the edge that matches its spatial role and exit toward that edge.
- Drawer opening and closing MUST be reversible from the current rendered position. Delayed cleanup from an earlier close MUST NOT hide, disable, unlock, or restore focus after a later reopen.
- On mobile, it MUST respect safe areas and provide 44px touch targets.
- A modal Drawer MUST follow the same focus containment and background rules as Dialog.
- A persistent desktop side panel is not automatically a modal Drawer; it may remain part of the page focus order.
- Long Drawer content MUST own its scroll without trapping the page in an unusable position.
- Drag-to-dismiss MAY be added only with an equivalent close control and safe unsaved-change handling.

When drag-to-dismiss or snap points are implemented:

- gesture commitment SHOULD wait for an approximately `10px` intent threshold so page or Drawer scrolling is not taken accidentally;
- the active surface MUST track the committed pointer 1:1, preserve the grab offset and use pointer capture;
- release MUST consider both distance and velocity; a quick flick MAY commit at approximately `0.11px/ms` in the KIN reference;
- snap selection SHOULD use projected momentum and boundary over-drag MUST use progressive resistance rather than a hard stop;
- the implementation MUST ignore additional pointers, preserve the visible close path, and start reversal from the live rendered position;
- normal programmatic open/close MUST remain non-overshooting; bounce is conditional on real momentum and product personality;
- reduced motion MUST preserve direct manipulation and final state while removing elastic settle or large travel.

## Popover

- Popover MUST remain associated with its trigger and reposition to stay within the viewport.
- Interactive content MUST be reachable by keyboard.
- Escape and outside interaction SHOULD dismiss when safe.
- Focus MAY remain on the trigger for simple non-modal controls or move inside for form-like content; the choice MUST be consistent and tested.
- Popover MUST NOT be used for long-form editing, complex navigation, or content requiring a stable URL.

## Menu overlays

- Menu positioning MUST preserve the relationship to the trigger or context target.
- Focus MUST move through menu items according to the menu interaction model.
- Activating an item MUST close the menu unless repeated selection is the explicit task.
- Nested submenus SHOULD be avoided on touch and MUST remain navigable without precision pointer movement.
- The same command MUST not execute from both pointer-down and click.
- A Menu that animates closed MUST reject interaction during the closing phase and MUST not remain in the accessibility tree after that phase completes.

## Tooltip and Hover Card overlays

- Tooltip MUST remain non-interactive and short.
- Hover Card MAY contain richer preview content but MUST not contain the only path to an action or fact.
- Both MUST open from keyboard focus as well as pointer behavior.
- Touch layouts MUST provide a stable alternate path; hover alone is insufficient.
- Escape MUST dismiss without changing the underlying selection.
- Keyboard Tooltip display MUST be immediate. Pointer Tooltip groups SHOULD delay the first intentional hover and MUST make subsequent adjacent Tooltips instant while the group sequence remains active.
- Tooltip entrance MUST be origin-aware when motion is visible. Subsequent sequence Tooltips MUST NOT replay scale or travel.

## Scrim and background

- Modal overlays MUST use a scrim or equivalent background treatment that communicates modality.
- The scrim MUST not create a decorative blur or glow.
- Clicking the scrim MAY dismiss only when loss of work is not possible.
- Reduced transparency MUST use an opaque or near-opaque solid treatment.
- Background content MUST not remain pointer or keyboard interactive while modal content is active.

## Stacking and nesting

- Products SHOULD keep one modal decision layer at a time.
- Toast MAY appear above a modal when it reports an action from that modal, but MUST not cover required controls.
- Tooltip MAY appear above another overlay for an unfamiliar icon control.
- Dialog opened from Dialog, Drawer opened from Dialog, and Popover containing Dialog SHOULD be redesigned unless the nested task is unavoidable and documented.
- Overlay z-index MUST come from a shared layer scale rather than arbitrary component values.

## Scroll and viewport behavior

- Opening a modal overlay MUST prevent background scroll without shifting page geometry.
- Closing MUST restore the prior page scroll position.
- Content MUST fit at 200% zoom; the overlay body MAY scroll while title and critical actions remain reachable.
- Virtual keyboards MUST not cover the focused field or primary action.
- Collision handling MUST preserve the trigger relationship and readable content rather than forcing a preferred side.

## Themes, contrast, and motion

- Overlay boundaries and focus MUST remain clear in light, dark, and higher-contrast themes.
- Surface and border establish depth; shadow is secondary and MUST not glow.
- Motion MUST be interruptible and spatially consistent.
- Reduced motion MUST replace large translation or scale with immediate state change or short crossfade.
- Opening motion MUST NOT delay focus or block input.

## Acceptance

- Each overlay has the correct role, name, focus entry, focus containment where modal, Escape behavior, and return focus.
- Modal background is unavailable to keyboard, pointer, and assistive technology.
- Scroll position is stable before and after the overlay.
- Small screens, virtual keyboard, 200% zoom, long content, and long localization remain usable.
- Touch users can reach Tooltip, Hover Card, Context Menu, and close actions through stable alternatives.
- Gesture-enabled Drawers and Sheets preserve capture, scroll ownership, velocity continuity, progressive resistance, cancellation and a non-gesture close path.
- Reduced motion and reduced transparency preserve the full task.

## Migration

Adopting products MUST inventory current portals, z-index values, scroll locks, focus traps, and dismissal behavior before visual changes. Overlay modernization MUST NOT silently change whether outside click, Escape, or browser Back discards work.
