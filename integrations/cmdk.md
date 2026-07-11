# cmdk Adapter

## Decision

Core candidate for React products that need global search and keyboard commands. Do not install when the product has only a small, ordinary search field.

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
- Apply KIN surface, hairline, focus and motion tokens. Do not retain default visual styling.
- Support screen readers, complete keyboard operation, Esc and focus restoration.

## Verification

- Empty, loading, error and no-permission states.
- Chinese, English and alias matching.
- Slow network and out-of-order responses.
- Light, dark, reduced motion and mobile.
- No blurry text caused by transformed dialog positioning.

## Source

[cmdk](https://github.com/dip/cmdk)
