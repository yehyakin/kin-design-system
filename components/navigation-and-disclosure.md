# Navigation and disclosure

Status: normative

This contract defines movement between locations, switching peer views, opening command collections, and revealing secondary content. It supplements [`DESIGN.md`](../DESIGN.md), [`terminology.md`](./terminology.md), and [`overlays.md`](./overlays.md).

## Navigation ownership

- Navigation MUST answer where the user is going or which view becomes current.
- Disclosure MUST reveal content without pretending that a new location was opened.
- Current location, selected view, expanded content, and keyboard focus MUST use different semantics.
- Stable destinations SHOULD use links and stable URLs. Buttons MUST NOT replace links solely for styling.
- Browser Back and Forward MUST preserve the product's declared location and view model.

## Tabs

Use Tabs for peer panels within one location or object.

- A Tab List MUST have a programmatic name when its purpose is not obvious.
- Exactly one Tab MUST be selected when a panel is required.
- Arrow keys MUST move focus within the Tab List; Home and End SHOULD move to boundaries.
- Automatic activation MAY be used only when panel changes are immediate and do not trigger destructive work.
- The selected Tab MUST identify its Tab Panel.
- Tabs MUST remain in a predictable order across objects.
- On narrow screens, Tabs MAY scroll horizontally, collapse into a menu, or move to a secondary page; current state MUST remain visible.

## Breadcrumbs

Use Breadcrumbs for a meaningful location hierarchy, not for recent history.

- Breadcrumbs MUST use links for navigable ancestors.
- The current item MUST be marked as current and SHOULD not be a redundant link.
- The visible order MUST follow hierarchy from broad to specific.
- On narrow screens, middle items MAY collapse into an Overflow Menu, but the parent and current location SHOULD remain available.
- Breadcrumbs MUST NOT duplicate a flat Sidebar merely to fill the header.

## Dropdown Menu

Use Dropdown Menu for a compact collection of actions opened from a trigger.

- Menu items MUST be actions, commands, or navigation choices—not arbitrary form layouts.
- Arrow keys MUST traverse enabled items; Enter or Space MUST activate; Escape MUST close and restore focus.
- Disabled items MUST remain understandable when shown.
- Checkable or radio menu items MUST expose their states correctly.
- A menu MUST close after a committed action unless the action explicitly supports repeated operation.
- When a Menu uses enter or exit motion, closing MUST disable interaction immediately but MUST keep the surface rendered until its exit finishes. Reopening during that interval MUST cancel pending hiding and continue from the current rendered state.
- Menu icons MAY reinforce familiar actions, but they MUST use the product's established icon family, stable optical boxes, and the same meaning wherever repeated. A menu MUST NOT add icons merely to make every row look decorated.

## Context Menu

Use Context Menu for actions scoped to the object or selection under the invocation point.

- A keyboard alternative MUST exist, such as Shift+F10, a Menu key, or a visible More button.
- The menu MUST not contain actions unavailable elsewhere to touch or keyboard users.
- The target object MUST remain identifiable while the menu is open.
- Right-click MUST not disable the browser context menu across unrelated content.

## Overflow Menu

Use Overflow Menu to contain lower-priority actions that do not fit in the current action bar.

- It MUST not hide the primary action or the only recovery action.
- Item order MUST remain stable across views.
- Moving an action into overflow at a breakpoint MUST preserve its label, permissions, shortcut, and result.
- The trigger MUST have an accessible name such as `More actions` rather than relying on an ellipsis alone.

## Tooltip

Use Tooltip for a short label or concise explanation of an existing control.

- Tooltip content MUST be non-interactive.
- It MUST appear on keyboard focus and pointer hover, and dismiss on Escape.
- It MUST not contain required instructions, validation, links, or actions.
- It MUST not be the only visible name for an unfamiliar control on touch-first layouts.
- It SHOULD remain concise after localization and reposition to stay within the viewport.

## Accordion and Disclosure

Use Accordion for multiple related sections that can be expanded independently or according to an explicit single-open rule. Use a simple Disclosure for one trigger and one region.

- The trigger MUST expose expanded state and control the related region.
- Enter and Space MUST toggle the focused trigger.
- Hidden content MUST not remain focusable.
- Collapsing a section containing focus MUST move focus to its trigger.
- The product MUST state whether multiple Accordion sections may remain open.
- Critical errors, required fields, and the only recovery action MUST not be hidden by default.

## Pagination

Use Pagination when a dataset is divided into stable pages and users need location, direct navigation, or shareable results.

- Current page, total pages or result range, previous, and next MUST be understandable.
- Current page MUST not be represented only by color.
- Disabled boundary actions MUST use correct semantics.
- Changing page MUST preserve relevant filters and sort, update the URL when appropriate, and move focus to a useful heading or result summary.
- Infinite loading MUST not replace Pagination when users need stable position, footer access, or repeatable URLs.

## Responsive and localization

- Navigation hierarchy MUST survive narrow layouts even when its presentation changes.
- Labels MUST not be replaced with unexplained icons solely to save space.
- Directional keys and icons MUST follow reading direction where appropriate.
- Long labels MUST wrap, truncate with an accessible full value, or move into an alternate layout without changing destinations.

## Themes, contrast, and motion

- Current, selected, expanded, hover, and focus-visible MUST remain distinguishable in all themes.
- Disclosure motion MUST originate from the controlled region and remain interruptible.
- Anchored Menu motion SHOULD use a short opacity change with no more than a few pixels of travel from the trigger origin; it MUST NOT bounce, overshoot, or delay focus.
- Reduced motion MUST use immediate state change or short opacity change without sliding large regions.
- Menu and Tooltip shadows MUST remain secondary to surface and border structure.

## Acceptance

- Every location or view can be reached and identified with keyboard only.
- Link, button, tab, menu item, and disclosure semantics match their actual results.
- Closing a temporary menu or Tooltip restores or preserves focus correctly.
- Touch users can access every Context Menu action through another path.
- Browser history, deep links, and responsive presentation preserve the declared navigation model.
- Hidden disclosure content is absent from the focus order.

## Migration

Before restyling navigation, map every trigger to `navigate`, `select view`, `execute`, or `disclose`. Existing URLs, browser history, permissions, and analytics MUST remain unchanged unless separately approved.
