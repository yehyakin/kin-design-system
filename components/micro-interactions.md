# Micro-interaction contract

Status: normative

This contract defines small state transitions inside controls, rows, menus, and temporary feedback. It applies across KIN product families. A micro-interaction MUST clarify a real change in state, progress, location, or result; it MUST NOT exist only to make an otherwise static control look animated.

## Required interaction model

Before adding motion, a component specification MUST identify:

1. the user or system event that starts the transition;
2. the source and target states;
3. whether the change is reversible;
4. whether the result is local, asynchronous, or externally confirmed;
5. equivalent pointer, keyboard, and touch behavior;
6. the accessible name and announcement after the change;
7. the reduced-motion treatment;
8. failure, cancellation, and rollback behavior where applicable;
9. expected frequency and whether the interaction is keyboard-priority, pointer-triggered or gesture-driven.

If these facts cannot be stated, the component MUST change state without decorative motion.

Hover and focus are previews of interactivity. They MUST NOT represent a completed mutation, successful request, copied value, saved record, uploaded file, or other committed result.

## Shared visual rules

- Labels and control geometry SHOULD remain stable while a state changes.
- A state change MUST NOT rely on motion or color alone.
- Motion MUST use the duration and easing Tokens in [`DESIGN.md`](../DESIGN.md).
- Repeated controls MUST NOT all scale, bounce, pulse, shake, or rotate as a default response.
- Press feedback MAY use a surface change, opacity change, or movement no greater than 0.5px. A scale near `0.99` MAY be used only when it remains visually quiet and does not disturb adjacent layout.
- Icon replacement SHOULD preserve the same optical box and stroke language.
- Temporary success treatment SHOULD return to a stable resting state after the user has had enough time to perceive it, unless success becomes the new persistent state.
- A component MUST remain interruptible when the user reverses or cancels its action.
- Animation MUST NOT delay the underlying operation, focus movement, or availability of the next valid action.
- Keyboard-priority and very high-frequency surfaces MUST default to instant availability. This rule does not remove Focus, Selection, Pressed, Busy or Committed Result feedback.

## Approved patterns

### Paired-state replacement

Use for one control whose meaning changes between two persistent states, such as:

- play / pause;
- mute / unmute;
- show / hide;
- lock / unlock;
- expand / collapse;
- follow / unfollow;
- enable / disable.

Requirements:

- The control MUST expose the current state programmatically with `aria-pressed`, `aria-expanded`, `role="switch"`, or another correct native/ARIA state.
- The accessible name MUST describe the action that will occur next when that is clearer than naming the current state.
- The source icon MAY fade or move a few pixels while the target icon enters from the corresponding direction.
- Participating icons SHOULD remain mounted in one stable optical slot so rapid reversal can continue from the rendered state without geometry change.
- Replacing an icon by deleting and recreating the only visual node during normal motion SHOULD be avoided because it removes continuity and can restart unrelated animation.
- Icon replacement MUST complete within the fast or normal duration Token.
- Keyboard and pointer activation MUST produce the same final state.
- Reduced motion MUST replace directional movement with an immediate swap or short opacity change.

Do not morph unrelated shapes merely because an animation tool makes it possible.

### Committed-result confirmation

Use after a real local or remote operation succeeds, such as copy, save, upload, export creation, or submission.

Requirements:

- Success MUST begin only after the operation reports success.
- Pointer hover, focus, pointer down, optimistic intent, or elapsed time alone MUST NOT trigger the success state.
- The original action label SHOULD remain visible when replacing it would make the control width change or remove context.
- A success icon MAY replace the action icon for a short confirmation period.
- The confirmation MUST NOT block another valid action.
- Failure MUST preserve context and expose retry or recovery where useful.
- A Toast MAY supplement the control when the result is not otherwise visible, affects another part of the product, or includes undo. It MUST follow [`../integrations/sonner.md`](../integrations/sonner.md).
- A result already clear next to the control SHOULD NOT be repeated in a Toast.

Example state model:

```text
idle -> pending -> success -> idle
                  \-> persistent success
       \-> error -> retry
       \-> cancelled -> idle
```

### Progress to result

Use when an accepted action has a measurable waiting state.

Requirements:

- The control MUST enter `busy` only after the action has been accepted.
- Duplicate submission MUST be prevented without erasing the action context.
- The control SHOULD preserve width across idle, busy, success, and error states.
- Indeterminate motion MAY be used only when progress cannot be measured.
- Measurable work SHOULD expose a value, stage, or completed/total count instead of an indefinite spinner.
- Long work that continues outside the current control SHOULD update one existing Toast or progress region rather than stacking new notifications.
- Cancellation MUST be offered when the underlying task supports it and cancellation is meaningful.
- Reduced motion MUST keep progress text or values while removing continuous rotation or sweeping animation.

### Disclosure and spatial continuity

Use for menus, Inspectors, Drawers, Popovers, expandable sections, and inline details.

Requirements:

- Content MUST enter from and return toward its owning edge or trigger when movement helps orientation.
- Temporary surfaces that show exit motion MUST remain rendered during their closing phase and MUST become unavailable to pointer and keyboard input immediately. `hidden` or unmounting MUST occur only after the exit finishes, unless reduced motion uses an immediate change.
- `aria-expanded` and `aria-controls` MUST reflect the rendered state where applicable.
- Focus MUST move only when required by the disclosure pattern and MUST return on keyboard close.
- Reversing the action while motion is running MUST continue from the current visual state.
- A rapid `open -> close -> open` or `close -> open -> close` sequence MUST end in the last requested state without a delayed timer hiding, disabling, or refocusing the reopened surface.
- A closed disclosure MUST NOT retain focusable descendants.
- Reduced motion MUST use an immediate state change or short opacity transition without spatial travel.

### Gesture-driven continuation

Use only when the user directly manipulates a surface, selection, resize boundary or ordered object.

Requirements:

- Gesture support MUST remain optional and MUST have an equivalent stable action when it commits navigation, dismissal or mutation.
- A committed drag MUST use pointer capture, preserve grab offset and keep one active pointer identity.
- Intent detection MUST avoid taking over scroll or click before the product can distinguish the gesture.
- The settle behavior MUST start from the current rendered position and carry release velocity where momentum is part of the interaction.
- Reversal, cancellation and another pointer MUST NOT produce jumps, duplicate mutations or stale cleanup.
- Boundary over-drag SHOULD use progressive resistance. It MUST NOT imply that unavailable content exists beyond the boundary.
- Reduced motion keeps direct tracking but removes bounce, parallax and unnecessary settle travel.
- Gesture implementation and review MUST follow [`../principles/apple-interaction.md`](../principles/apple-interaction.md).

### Selection and preference change

Use for selected rows, tabs, filters, appearance, language, density, and comparable user preferences.

Requirements:

- Focus and selection MUST remain visually and programmatically distinct.
- Theme and language changes MUST NOT display success Toasts.
- Preference motion MUST NOT remount the application, reset work, replay unrelated animations, or move surrounding layout.
- System-controlled preferences MUST remain recoverable when a compact control sets an explicit value.
- Theme and language behavior MUST follow [`preference-controls.md`](./preference-controls.md).

## Restricted patterns

The following patterns are not part of KIN's default interaction language:

- sparkle or confetti for routine completion;
- decorative pulse on idle controls;
- shake used as a generic error treatment;
- rings that radiate without conveying scope or progress;
- full rotation of a static icon when a quieter state change is available;
- animated gradients, glow, particles, trails, or elastic morphing;
- large hover translation or scale;
- continuous animation that competes with the primary task.

A product MAY use one of these patterns only when it documents:

1. the state or domain meaning it communicates;
2. why a quieter treatment is insufficient;
3. pointer, keyboard, touch, and assistive-technology behavior;
4. its reduced-motion replacement;
5. frequency limits and interruption behavior.

Brand celebrations and promotional motion are governed separately by [`../tools/brand-motion.md`](../tools/brand-motion.md) and MUST NOT establish defaults for product controls.

## Feedback ownership

The component closest to the action owns immediate state. A secondary channel is used only when it adds information.

| Result | Primary owner | Optional secondary feedback |
|---|---|---|
| Toggle changed | Control state | None |
| Field validation failed | Field and error text | Toast only for a broader submission failure |
| Copy succeeded | Trigger or adjacent status | Toast when the copied result is otherwise invisible |
| Record saved | Save control and saved-state region | Toast for cross-view result or undo |
| Reversible mutation | Updated object | Toast with undo |
| Background task started | Task region or queue | One updating Toast when the queue is not visible |
| Request failed | Affected object or control | Toast with retry when failure is not visible locally |

Temporary feedback MUST NOT become the only durable record of an important result.

## Accessibility and input parity

- Every icon-only control MUST have an accessible name.
- Live announcements MUST be concise and MUST NOT repeat information already announced by the focused control.
- Busy controls SHOULD expose `aria-busy` on the affected region when that better describes the operation than disabling a button alone.
- A disabled control MUST NOT be the only place that explains why an action is unavailable.
- Hover-only motion MUST have an equivalent focus-visible treatment when it conveys useful affordance.
- Touch users MUST receive the committed state without depending on hover.
- Rapid repeated input MUST NOT create contradictory states, duplicate mutations, or unbounded Toast stacks.

## Reduced motion

Under `prefers-reduced-motion: reduce`:

- persistent state changes remain visible;
- directional icon movement becomes an immediate replacement or short crossfade;
- continuous spinners become static progress text or a non-rotating indicator where possible;
- success confirmation remains available without scale, bounce, or travel;
- disclosure state and focus behavior remain unchanged;
- request timing and application logic remain identical.

Reduced motion is not permission to remove feedback.

## Acceptance matrix

Every implemented pattern MUST be checked against the applicable rows.

| Check | Required result |
|---|---|
| Pointer | Hover previews interactivity; click or press commits once |
| Keyboard | Enter/Space and pattern-specific keys reach the same state |
| Touch | No required information or result depends on hover |
| Gesture | Capture, intent threshold, active pointer, velocity, boundaries and cancellation produce one continuous state |
| Focus | Focus remains visible and distinct from selection or success |
| Geometry | Labels, icons, and progress do not cause unintended layout shift |
| Async success | Success appears only after a real resolved operation |
| Async failure | Context remains and retry/recovery is available where useful |
| Interruption | Reverse, close, cancel, or repeated input produces one coherent state |
| Assistive technology | Name, state, busy status, and result are exposed without duplicate noise |
| Reduced motion | Meaning remains with travel, spin, bounce, and decorative motion removed |
| Theme | Contrast and state meaning remain valid in light, dark, and higher-contrast modes |
| Localization | Longer labels and direction changes do not break geometry or reading order |

Reference implementations MUST test at least one paired-state replacement, one committed asynchronous result, one failure/retry path, one animated Menu, and one disclosure or Drawer with focus restoration and rapid reversal.

## External-example boundary

Micro-interaction galleries MAY be used to discover state-transition ideas. Their default radius, scale, motion, icons, generated code, or completion semantics MUST NOT be imported as KIN requirements. External examples MUST be reviewed against this contract before adoption.
