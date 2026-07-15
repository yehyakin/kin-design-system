# cmdk Adapter

## Decision

Runtime-integrated adapter for the stable Command Menu contract. Use in React products that need global search and keyboard commands; do not install when the product has only a small, ordinary search field.

## Allowed

- Search entities, domains, channels, products, campaigns and commands.
- Navigate between workspace views.
- Execute contextual actions such as copy link, favorite, compare and theme selection.

## Contract

- Open with `Cmd/Ctrl + K`; `/` may focus search when it does not conflict with editing.
- Group results into Search, Go to, Current object and Settings.
- For server search, disable incorrect client filtering and debounce approximately 100–180ms.
- Limit each group to the best results; full result sets belong on a search page.
- Pause global shortcuts inside inputs, editors and IME composition.
- Keyboard invocation MUST expose the surface and focus search without entrance travel, scale, or a wait for animation. Filtering debounce is data behavior and MUST NOT delay surface availability.
- Pointer invocation MAY use an opacity transition no longer than `100ms` when it preserves the same focus and state model. It MUST NOT create a second visual identity for the component.
- Closing MUST immediately stop interaction and restore focus. A visual exit MUST NOT prevent an immediate reopen or allow stale cleanup to hide the reopened surface.
- Apply KIN surface, hairline, focus and frequency-aware motion tokens. Do not retain default visual styling.
- Support screen readers, complete keyboard operation, Esc and focus restoration.

## Verification

- Empty, loading, error and no-permission states.
- Chinese, English and alias matching.
- Slow network and out-of-order responses.
- Repeated `open → close → open` by shortcut and pointer; the latest request wins.
- Search accepts input in the same task as a keyboard invocation.
- Light, dark, reduced motion and mobile.
- No blurry text caused by transformed dialog positioning.

## Runtime implementation

[`@kin-design/react/cmdk`](../packages/react/src/cmdk.tsx) directly composes the official cmdk Dialog, Input, List, Group and Item primitives. cmdk retains filtering, active-item, selection and focus mechanics. KIN supplies product groups, invocation rules, editable-target guards, Token styling, and an explicit return-focus reference for controlled Dialogs.

The [Integration Lab](../examples/workspace-reference/integrations.html#cmdk) verifies shortcut opening, immediate input focus, filtering, dismissal, and focus return.

## Source

[cmdk](https://github.com/dip/cmdk)
