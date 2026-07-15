# Sonner Adapter

## Decision

Runtime-integrated adapter for the stable Toast contract. Use for compact feedback from user-initiated actions.

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
- Placement MUST be chosen for the product shell and known collision zones; it MUST NOT cover persistent navigation, task controls, virtual keyboards or mobile safe areas.
- Reading direction and placement MUST be verified independently. RTL MUST NOT be inferred from a left or right placement alone.

## Runtime implementation

[`@kin-design/react/sonner`](../packages/react/src/sonner.tsx) directly runs the official Sonner package. Sonner retains stacking, promise updates, dismissal, swipe, and transition behavior. KIN supplies the semantic `kinToast` operations, localized labels, a three-toast limit, Token styling, theme and direction mapping, four-edge mobile safe-area offsets, and recovery rules.

The [Integration Lab](../examples/workspace-reference/integrations.html#sonner) demonstrates success, undo, one Promise-backed loading toast updated in place, recoverable error with Retry, LTR and RTL, and all six Sonner placements: top-left, top-center, top-right, bottom-left, bottom-center, and bottom-right. The position selector is verification evidence, not a requirement that every product expose notification placement to users. The broader [workspace references](../examples/workspace-reference/) exercise compact feedback ownership, bilingual labels, and Reduced Motion.

Consuming React products SHOULD mount one `KinToaster` near the application root and call `kinToast` only from user-initiated operations. Non-React products SHOULD not add React only to copy this adapter; use a native-stack notification component that satisfies the same behavior contract instead.

## Source

[Sonner](https://github.com/emilkowalski/sonner)
