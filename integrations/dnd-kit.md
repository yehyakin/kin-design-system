# dnd kit Adapter

## Decision

Conditional. Dragging exists only when users intentionally organize an order or spatial relationship.

## Allowed

- Favorites and comparison order.
- Workspace modules.
- Risk-rule priority and evidence order.
- Commerce workflow stages where order is meaningful.

## Forbidden

- Making every row draggable.
- Arbitrary public database ordering.
- Turning structured workspaces into freeform Notion boards.
- Dragging without a keyboard alternative.

## Contract

- Use a dedicated drag handle.
- Support pointer, touch and keyboard sensors.
- Announce pickup, position and drop to assistive technology.
- Preserve an origin placeholder.
- Lift with one surface step, `--edge-highlight`, and `--shadow-contact`; use `--shadow-floating` only when the drag overlay must travel across or overlap separate regions.
- Higher Contrast and Forced Colors MUST remove these optical shadows and retain the drag boundary, handle, origin placeholder, and current drop target through explicit structure.
- Settle in approximately 180–240ms.
- Use optimistic updates only with rollback; communicate failure or undo through Sonner.
- Prevent accidental drag while scrolling on touch devices.

## Runtime implementation

[`@kin-design/react/experimental/dnd-kit`](../packages/react/src/dnd-kit.tsx) directly uses the official dnd-kit pointer, touch and keyboard sensors, sortable coordinates, collision detection, transforms, Drag Overlay and drop motion. KIN adds a dedicated handle, localized instructions and announcements, controlled ordering, Token styling, and product-owned persistence or rollback.

The [Integration Lab](../examples/workspace-reference/integrations.html#dnd-kit) verifies keyboard pickup, movement, drop, focus restoration, transform-based motion, and Reduced Motion. Pointer/touch feel, screen-reader quality and real optimistic rollback remain manual or consuming-product evidence; the component therefore remains `candidate`.

Material ownership follows [`principles/material-hierarchy.md`](../principles/material-hierarchy.md). dnd kit keeps its upstream sensor, overlay, transform, and drop-motion behavior; KIN configures only the semantic material role and product-owned feedback.

## Source

[dnd kit](https://github.com/clauderic/dnd-kit)
