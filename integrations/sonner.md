# Sonner Adapter

## Decision

Core candidate for compact feedback from user-initiated actions.

## Allowed

- Saved, copied, exported or submitted.
- Undo for reversible mutations.
- Retry for recoverable failures.
- A single loading toast updated to success or error for a real long request.

## Forbidden

- Welcome messages.
- Page-load, navigation, search or theme-switch success.
- Repeating an inline error without adding useful recovery.

## Contract

- Show no more than three concurrent toasts.
- Prefer inline errors for the object that failed.
- Use KIN `surface-3`, hairline, compact shadow and 13px UI text.
- Keep actions keyboard accessible and return focus appropriately.
- Error messages state what failed and the available next step.
- Verify stacking with Dialogs, Drawers and mobile safe areas.

## Source

[Sonner](https://github.com/emilkowalski/sonner)
