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
- Lift with one surface step and a compact shadow; no rotation or dramatic scale.
- Settle in approximately 180–240ms.
- Use optimistic updates only with rollback; communicate failure or undo through Sonner.
- Prevent accidental drag while scrolling on touch devices.

## Source

[dnd kit](https://github.com/clauderic/dnd-kit)
