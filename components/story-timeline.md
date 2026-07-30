# Story timeline

Status: normative

This contract defines an ordered narrative timeline that can adapt between horizontal and vertical orientations without changing the underlying facts. It is informed by mature timeline interaction patterns while remaining an independent KIN component.

## When to use

Use Story Timeline when a small, ordered set of milestones forms a narrative whose sequence and spacing are materially easier to understand visually than in prose.

Do not use it for:

- routine object history, which uses Activity Feed;
- durable task execution, which uses Background Task Queue;
- step completion in a current flow, which uses Progress Indicator or Stepper when adopted;
- immutable compliance history, which uses the product's Audit Log;
- decorative company history with no user task.

`Lifeline` and `Narrative Timeline` MAY be used as product-facing aliases. `Story Timeline` is the canonical KIN name.

## Data model

Every milestone MUST have:

1. stable identifier;
2. ordered date, time, or sequence value;
3. concise title;
4. meaningful description or result;
5. source or provenance when the milestone supports a product claim;
6. optional media only when it adds evidence or context;
7. link or action only when the destination is specific and permitted.

The implementation MUST render the supplied milestones. It MUST NOT materialize every empty year or interval merely to fill space.

Missing periods MAY be shown as an explicit gap when the absence is meaningful. Visual spacing MUST NOT imply duration unless the scale is real and explained.

## Orientation

- Wide screens MAY use a horizontal timeline when it improves comparison and narrative pacing.
- Narrow screens SHOULD use a vertical timeline that preserves the same item order and content.
- Orientation MUST be a projection of one data model, not two separately maintained stories.
- Changing orientation MUST preserve the selected milestone and focus owner.
- A horizontal timeline MUST offer a visible cue that more content is available.
- The first meaningful milestone SHOULD be visible on initial load unless a deep link names another milestone.

## Scroll and gesture ownership

- Vertical wheel input MAY advance a focused or hovered horizontal timeline only while horizontal movement remains possible.
- At the first and last horizontal boundaries, wheel input MUST return to page scrolling.
- Native horizontal trackpad and touch scrolling SHOULD remain available.
- The component MUST NOT capture global page scroll before the user reaches it.
- Dragging media, selecting text, and operating controls MUST NOT accidentally scrub the timeline.
- Nested horizontal scroll regions SHOULD be avoided.

## Keyboard and focus

- Milestones MUST use ordered-list semantics.
- Each selectable marker MUST be a real Button or Link with an accessible name.
- Left and Right SHOULD move between milestones in horizontal orientation.
- Up and Down SHOULD move between milestones in vertical orientation.
- Home and End SHOULD move to the first and last milestone.
- Keyboard movement MUST bring the active milestone into view without moving focus to unrelated content.
- Focus MUST remain visible and MUST NOT be replaced by selection styling.

## Selection and detail

- Selection MAY reveal a larger detail or media region.
- The active milestone MUST remain identifiable without color alone.
- Detail MUST follow the owning timeline in reading order or be programmatically associated with the active marker.
- A deep-linked milestone SHOULD restore its selected state after reload.
- Closing optional media or detail MUST return focus to the marker that opened it.

## Media and overlays

- Media MUST have alternative text that communicates its contribution to the milestone.
- Decorative media MUST use empty alternative text.
- A lightbox or expanded media viewer MUST use Dialog semantics, initial focus, focus containment, Escape dismissal, and focus return.
- Draggable presentation MUST have keyboard and touch equivalents.
- Random rotation, fireworks, confetti, and decorative motion are outside the KIN core contract.

## Motion

- Initial line or milestone reveal MAY run once when it helps explain order.
- Motion MUST be interruptible and MUST NOT delay interaction.
- Selecting a milestone SHOULD use a short state transition without bounce.
- Orientation changes MUST not replay the complete narrative.
- Reduced Motion MUST show the complete line and milestones immediately, remove parallax and scrub animation, and preserve every interaction.

## Responsive, localization, and accessibility

- Long translated titles MUST wrap without detaching from their date or marker.
- Relative dates MUST expose absolute dates.
- State, selected milestone, gaps, and source status MUST not rely on color alone.
- At 200% zoom, the timeline MAY adopt the vertical layout early.
- Touch targets MUST be at least 44 by 44 CSS pixels on touch layouts.
- Screen readers MUST encounter milestones once, in source order, without duplicated desktop and mobile trees.
- Higher contrast MUST strengthen markers, line, focus, and text without introducing a second meaning system.

## Reference-fixture boundary

KIN's reference MAY use deterministic local milestones and a responsive orientation change. It MUST identify itself as a local interaction fixture and MUST NOT present example milestones as product history, live events, or adoption evidence.

## Acceptance

- One ordered data model drives both orientations.
- Sparse and long ranges do not create fabricated intervals or unbounded DOM size.
- Wheel, trackpad, touch, keyboard, focus, zoom, and page-scroll handoff remain usable.
- Selection and optional detail remain associated with the correct milestone.
- Light, dark, higher contrast, localization, and Reduced Motion preserve meaning.
- The component remains distinct from Activity Feed, Background Task Queue, progress, and audit history.

## Migration

Adopting products MUST inventory milestone identity, ordering, source, gaps, links, media, deep links, and expected range before replacing an existing timeline. A horizontal treatment MUST not be adopted when ordinary reading or Activity Feed better serves the task.
