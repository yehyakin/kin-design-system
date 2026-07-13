# AMicro review for KIN

Date: 2026-07-13

Status: informative review; no KIN normative rule is changed by this document

Sources:

- [Live AMicro reference](https://amicro.vercel.app/)
- [AMicro repository](https://github.com/Subhan-code/Amicro--Micro-transitions-)
- [Button configuration](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/main/src/data/buttons.tsx)
- [Animated button implementation](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/main/src/components/AnimatedButton.tsx)
- [Generated examples](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/main/src/utils/codeGenerator.ts)

Evidence:

- The live reference and the linked primary-source files above were reviewed on the stated date.
- A local review screenshot was inspected but is intentionally not committed; KIN does not vendor external screenshots or brand assets.

## Audit scope

The review asks whether AMicro reveals a missing KIN contract. It does not evaluate AMicro as a production dependency or attempt to copy its visual style.

The live page presents a gallery of button and icon transitions. The repository groups examples into slide-arrow, sparkle, morph, pulse, rotate, shake, ring, and color-morph behaviors. It uses React, Motion, Tailwind, and Lucide in its examples.

## What AMicro demonstrates well

1. A micro-interaction can be isolated as one trigger, one visible transition, and one named behavior.
2. Paired icons make reversible state changes easy to compare: play/pause, mute/unmute, lock/unlock, show/hide, expand/minimise, and light/dark.
3. The gallery provides an immediate preview and a copy action, which makes motion review more concrete than prose alone.
4. The examples expose a small motion vocabulary instead of one generic animation applied everywhere.

## What KIN should not inherit

1. The gallery is intentionally a card wall. KIN product interfaces MUST NOT adopt that layout as a workspace pattern.
2. Several examples treat hover as if an operation completed. A copied, saved, uploaded, submitted, or successful state MUST follow the real action result, not pointer hover.
3. Generated examples apply hover scale and press scale broadly. KIN MUST keep scale changes exceptional and subtle; ordinary buttons use immediate surface or opacity feedback.
4. Sparkle, shake, pulse, ring, rotation, and saturated icon colours are too expressive as defaults. They require a real state meaning and a reduced-motion fallback.
5. Icon morphing can remove a stable label or change meaning before an action is committed. Required actions and states MUST remain named and understandable without motion.
6. The theme control's accessible name combines theme switching with copying code. KIN controls MUST expose one clear user intention per control.
7. The repository is a small demonstration project rather than a released component system. KIN should not add it as a runtime dependency.

## Confirmed KIN coverage

KIN already defines:

- immediate, interruptible, reversible, spatial, purposeful, and calm motion;
- no bounce or overshoot by default;
- reduced-motion alternatives;
- stable button geometry and busy/error states;
- state not communicated only through colour;
- Lucide-compatible icon rules;
- theme and language preference controls;
- Sonner for the result of a real user action.

## Missing KIN layer

AMicro exposes one useful gap: KIN has general motion principles and component states, but no small, reviewable catalogue that maps common state transitions to permitted micro-interaction patterns.

The useful addition is not an AMicro integration. It is a KIN micro-interaction contract with:

- trigger: hover, focus, press, committed action, async result, or external update;
- source and target state;
- whether the change is reversible;
- pointer, keyboard, and touch parity;
- stable label and geometry requirements;
- duration and easing Token;
- reduced-motion replacement;
- assistive-technology announcement responsibility;
- failure and rollback behavior;
- acceptance examples for icon replacement, progress, completion, disclosure, selection, and destructive warning.

## Recommended KIN addition

Create `components/micro-interactions.md` as a normative contract, then add a small state-transition section to the workspace reference. The first approved patterns should be:

1. **Paired-state replacement** — play/pause, mute/unmute, show/hide, lock/unlock, expand/collapse.
2. **Committed-result confirmation** — copy/check, save/check, upload/check, only after real success and only briefly.
3. **Progress-to-result** — idle → busy → success/error without changing button width or stacking duplicate feedback.
4. **Disclosure and spatial continuity** — chevron, panel, Drawer, or Inspector movement that explains where content came from.
5. **Selection and preference change** — thumb position, icon contrast, text semantics, and `aria-*` state change together.

Do not approve sparkle, decorative pulse, shake, ring, full rotation, or generic icon morph as core patterns. They MAY appear only when a product documents the specific state meaning, input parity, reduced-motion fallback, and why a quieter pattern is insufficient.

## Evidence limits

- One stable desktop screenshot was accepted.
- The live DOM and primary repository files were inspected.
- Hover motion was not frame-by-frame recorded, and mobile rendering could not be captured reliably in this browser run.
- Screenshot review cannot prove keyboard parity, screen-reader announcements, motion sickness safety, performance, or production robustness.
