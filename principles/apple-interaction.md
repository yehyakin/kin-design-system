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

## Timing

| Interaction | Target |
|---|---:|
| Press feedback | 80–110ms |
| Hover / selection | 120–160ms |
| Command menu | 140–180ms |
| Tab content | 140–200ms |
| Inspector | 180–240ms |
| Dialog | 180–240ms |
| Mobile drawer | 220–320ms |
| Drag settle | 180–240ms |
| Number update | 350–450ms |

If an animation calls attention to itself during repeated use, shorten or remove it.

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

## Source

Adapted from the public [Apple Design Skill](https://github.com/emilkowalski/skills/tree/main/skills/apple-design) and KIN's own professional-workspace requirements.
