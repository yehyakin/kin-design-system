# 004 — Specify gesture-driven Drawer and Sheet physics

- **Status**: IMPLEMENTED — DEVICE REVIEW PENDING
- **Commit**: b300c02
- **Severity**: MEDIUM
- **Category**: Physicality and interruptibility
- **Estimated scope**: 6 files, normative gesture contract plus deterministic fixture

## Problem

KIN permits drag-to-dismiss but does not define what makes the gesture direct, predictable, interruptible, or safe.

```md
<!-- components/overlays.md:43 — current -->
- Drawer MUST enter from the edge that matches its spatial role and exit toward that edge.
- Drawer opening and closing MUST be reversible from the current rendered position.
...
- Drag-to-dismiss MAY be added only with an equivalent close control and safe unsaved-change handling.
```

```md
<!-- principles/apple-interaction.md:23 — current -->
Menus, tabs, rows and ordinary panels use critically damped or non-overshooting curves. A small amount of momentum is reserved for gestures that contain real physical momentum, such as dragging or dismissing a sheet.
```

This leaves grab offset, intent threshold, pointer capture, velocity handoff, landing projection, boundary resistance, multi-touch handling, and scroll ownership undefined.

## Target

For any KIN component that opts into drag/swipe:

- track the controlled surface 1:1 after an approximately `10px` intent threshold;
- preserve the grab offset;
- call `setPointerCapture(pointerId)` after the gesture commits;
- keep a short position/time history and pass release velocity into the settle behavior;
- project momentum with `current + (velocity / 1000) * d / (1 - d)`, using local reference `d = 0.998`, before selecting a snap point;
- allow dismissal on either a documented distance threshold or velocity above approximately `0.11px/ms`;
- use progressive boundary resistance with local reference constant `0.55`, not a hard stop;
- ignore additional pointers after the gesture begins;
- reserve visible bounce for a real momentum gesture; normal programmatic open/close remains non-overshooting;
- keep a visible Close control and safe unsaved-change handling;
- reduced motion keeps direct 1:1 manipulation but removes bounce and uses a short settle/crossfade.

## Repo conventions to follow

- `principles/apple-interaction.md` owns direct-manipulation foundations.
- `components/overlays.md` owns Drawer/Sheet behavior.
- `components/micro-interactions.md` owns state interruption and rollback.
- `principles/verification.md` owns real-device evidence.
- The reference remains framework-free and MUST NOT claim to be a runtime package.

## Steps

1. Add a dedicated gesture-driven interaction section to `principles/apple-interaction.md` with input, velocity, projection, resistance, interruption, and reduced-motion requirements.
2. Add a concise Drawer/Sheet adoption contract to `components/overlays.md` and parity/rollback requirements to `components/micro-interactions.md`.
3. Add a narrow-screen Sheet gesture fixture to Motion Lab using Pointer Events, a dedicated handle, pointer capture, direct transform updates, velocity history, projected target selection, and progressive resistance.
4. Preserve the existing click/Escape Close paths and focus rules.
5. Add deterministic tests for pointer capture, latest-state behavior, Close fallback, reduced-motion settle, and background inertness. Record real-device gesture review as manual evidence rather than an automated claim.

## Boundaries

- Do NOT make every Drawer draggable.
- Do NOT add a spring or gesture dependency to the framework-free reference.
- Do NOT apply translucency, blur, or Apple platform chrome to KIN surfaces.
- Do NOT enable swipe dismissal for unsaved destructive work without a recovery decision.
- Do NOT claim physical-device quality from Playwright alone.

## Verification

- **Mechanical**: validators and reference tests.
- **Feel check**: on a real touch device, grab the handle off-center, drag slowly, flick, reverse before settle, and over-drag the boundary. The surface stays attached, carries velocity, resists progressively, and never jumps to a new finger.
- **Keyboard check**: Escape and Close remain complete alternatives.
- **Reduced motion**: dragging remains direct; release has no elastic overshoot.
- **Done when**: the normative contract, deterministic fixture, automated state evidence, and recorded real-device limitation agree.
