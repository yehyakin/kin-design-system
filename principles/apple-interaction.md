# Direct and Continuous Interaction

This document adapts direct-manipulation and motion principles for KIN workspaces. It does not reproduce Apple branding or platform chrome.

## Principles

### Immediate feedback

Controls respond on press, not after the request completes. Feedback may be a subtle surface, opacity or position change. Avoid noticeable scaling on every control.

### Interruptible motion

Panels, menus and drawers must respond to new input while moving. Reversing an action continues from the current visual state; it does not wait for the previous animation to finish.

### Spatial continuity

- An Inspector enters and exits from its owning edge.
- A popover originates near its trigger.
- A mobile drawer returns toward the bottom.
- Closing restores focus to the trigger.
- Navigation transitions do not invent unrelated motion directions.

### No bounce by default

Menus, tabs, rows and ordinary panels use critically damped or non-overshooting curves. A small amount of momentum is reserved for gestures that contain real physical momentum, such as dragging or dismissing a sheet.

### Preserve control

Motion must not lock input, hide the final destination or prevent cancellation. Long tasks expose progress and, where supported, cancellation or background execution.

## Frequency and invocation

Motion is budgeted by exposure and invocation path:

| Frequency or path | Default treatment |
|---|---|
| Keyboard-priority or 100+ exposures per day | Instant surface availability; no entrance travel or scale |
| Tens of exposures per day | Color or opacity feedback at the fast Token or faster; no repeated decorative motion |
| Occasional | Normal or panel motion when it explains state or spatial ownership |
| Rare or explanatory | A deliberate sequence MAY be used when it remains skippable and does not delay the task |

- A keyboard invocation MUST NOT wait for animation before moving focus, accepting text, or exposing results.
- A pointer invocation MAY retain short spatial feedback when the trigger relationship matters, but the same component MUST keep one semantic and state model.
- Repeated invocation MUST be pressure-tested. Rapid input ends in the latest requested state without stale cleanup or replay.
- Frequency is a product fact. An adopting product MUST classify high-traffic surfaces instead of copying the example frequency labels blindly.

## Timing

| Interaction | Target |
|---|---:|
| Press feedback | 80–110ms |
| Hover / selection | 120–160ms |
| Command menu, keyboard path | 0ms entrance; focus in the same task |
| Command menu, occasional pointer path | 0–100ms opacity only when justified |
| Tab content | 140–200ms |
| Inspector | 180–240ms |
| Dialog | 180–240ms |
| Mobile drawer | 220–320ms |
| Drag settle | 180–240ms |
| Number update | 350–450ms |

If an animation calls attention to itself during repeated use, shorten or remove it.

## Gesture-driven interaction

Drag and swipe are conditional capabilities. When a product adds them, the interaction MUST remain direct, interruptible and equivalent to a visible non-gesture action.

### Gesture commitment and tracking

- Detect intent before taking over scrolling. A local implementation SHOULD use an approximately `10px` movement threshold and document any product-specific change.
- After commitment, the controlled surface MUST track the active pointer 1:1 while preserving the grab offset.
- The implementation MUST use Pointer Events and pointer capture so tracking continues when the pointer leaves the handle.
- A gesture MUST ignore additional pointers after commitment and MUST release capture when it ends or is cancelled.
- A Sheet handle MAY own vertical drag; scrollable Sheet content MUST retain normal scrolling until the gesture boundary is deliberately handed to the Sheet.

### Velocity, projection and boundaries

- Keep a short position/time history and hand the release velocity into the settle behavior. Reversal MUST start from the live rendered position and velocity.
- A flick MAY commit without crossing the distance threshold. The KIN reference uses approximately `0.11px/ms` as its velocity threshold; consuming products MUST test their own content and input devices.
- Snap-point selection SHOULD consider a projected landing position, not only the release position. With velocity measured in `px/ms`, the KIN reference uses `current + velocity * d / (1 - d)` with `d = 0.998` as a review fixture, not a universal product constant.
- Over-drag MUST use progressive resistance rather than a hard stop. The KIN reference uses a rubber-band constant of `0.55` for comparison.
- Programmatic open and close remain critically damped or non-overshooting. Visible bounce MAY follow a real momentum gesture only when it matches product personality.

### Safety and alternatives

- A gesture MUST have an equivalent Button, keyboard path or other stable action.
- Drag-to-dismiss MUST NOT discard unsaved or destructive work without the same recovery decision as the visible close path.
- Reduced motion keeps direct pointer tracking, removes bounce and large settle travel, and preserves the final state.
- Automated tests MAY prove state, capture and cleanup. Physical feel requires a recorded real-device review.

## Reduced preferences

### Reduced motion

- Replace large movement with short crossfades.
- Disable number rolling and decorative interpolation.
- Keep DnD functional but shorten settling.
- Replace brand motion with a static asset.
- Avoid auto-scrolling unless the user initiated it.

### Reduced transparency

- Replace blur with an opaque surface.
- Strengthen the required boundary rather than adding shadow.

### Increased contrast

- Strengthen text, focus and essential separators.
- Preserve semantic color meanings.

## Review checklist

- Does input receive feedback before network completion?
- Can the interaction reverse while moving?
- Do enter and exit share a spatial origin?
- Is focus restored after closure?
- Is the motion still understandable with animation disabled?
- Does repeated use feel faster rather than more theatrical?
- Does a gesture preserve grab offset, pointer capture, velocity and a non-gesture alternative?
- Does slow-motion or frame inspection show an immediate first frame and one continuous path?

## Source

Adapted from the public [Apple Design Skill](https://github.com/emilkowalski/skills/tree/main/skills/apple-design) and KIN's own professional-workspace requirements.
