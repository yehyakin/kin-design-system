# Actions and selection

Status: normative

This contract defines controls that execute actions or change a bounded selection. It supplements [`DESIGN.md`](../DESIGN.md), [`core-states.md`](./core-states.md), [`micro-interactions.md`](./micro-interactions.md), and [`terminology.md`](./terminology.md).

## Shared rules

- A control MUST communicate whether it executes an action, changes a persistent setting, or changes the current selection.
- Hover, focus, press, selected, checked, and disabled MUST remain distinct states.
- A label MUST name the result or state in product language. Generic labels such as `Continue` SHOULD be replaced when the result is known.
- Icon-only controls MUST have an accessible name. They MUST also have a Tooltip when the icon is not universally understood in the current context.
- Keyboard and pointer activation MUST produce the same committed result.
- A busy action MUST prevent duplicate commitment without hiding the action context.
- Destructive appearance MUST be reserved for the point where a destructive action is actually committed.
- Touch targets MUST be at least 44 by 44 CSS pixels on touch layouts; the visible control MAY remain smaller inside that target.

## Button and Icon Button

Use a Button for a discrete action. Use an Icon Button only when space is constrained and the icon is established in context.

### Anatomy

1. accessible name;
2. optional leading or trailing icon;
3. visible label for text buttons;
4. optional progress indicator;
5. focus indicator outside the control boundary.

### Variants

- `primary`: one principal action in the current action group;
- `secondary`: common action without primary emphasis;
- `ghost`: low-emphasis contextual action;
- `destructive`: final destructive commitment or confirmation;
- `icon`: compact action with an accessible name.

### Required states

Default, hover, focus-visible, active, busy, disabled, success-after-commit, and error-with-recovery MUST be designed where applicable.

- Enter and Space MUST activate a Button once.
- Busy state MUST retain stable width and an understandable label.
- When a Button changes between idle, busy, success, error, or paired states, its icon slot MUST retain stable geometry. Implementations SHOULD keep the participating icons mounted in one optical box and change explicit state rather than remove and insert a single icon during the transition.
- Success state MUST occur only after the real action succeeds.
- A reversible action SHOULD offer Undo through contextual or temporary feedback.
- A disabled action SHOULD explain why when the reason is not already visible.

## Checkbox

Use a Checkbox for independent zero-or-more selection or a boolean value that is submitted with a form.

Required states are unchecked, checked, mixed, focus-visible, disabled, invalid, and read-only where supported.

- Space MUST toggle the focused Checkbox.
- A mixed state MUST use `aria-checked="mixed"` or equivalent semantics.
- Clicking the visible label MUST toggle the control.
- A group MUST have a visible group label or programmatic name.
- Checking one item MUST NOT silently uncheck unrelated items.

## Radio Group

Use a Radio Group when exactly one choice from a small, visible set is required.

- One option SHOULD be selected when the product has a safe default; otherwise the required empty state MUST be explicit.
- Arrow keys MUST move selection within the group according to reading direction.
- Tab MUST enter and leave the group without visiting every radio as an independent stop.
- Options MUST remain visible together. If choices require search or exceed a compact visible set, use Select or Combobox.

## Switch

Use a Switch for an immediately applied binary setting such as enabled or disabled.

- The accessible name MUST describe the setting, not the current state alone.
- `aria-checked` or equivalent switch semantics MUST expose the current state.
- Space MUST toggle the Switch.
- The adjacent label MUST remain stable while the state changes.
- If changing the setting requires Save or Submit, use a Checkbox rather than implying immediate effect.
- Failure to persist MUST restore the prior state or clearly mark the uncommitted state.

## Toggle and Toggle Group

Use a Toggle for a pressed mode or tool that can be independently active. Use a Toggle Group when related modes share a control group.

- A Toggle MUST expose `aria-pressed` or equivalent state.
- A single-select Toggle Group MUST enforce one selected item when the mode cannot be empty.
- A multi-select Toggle Group MUST not be styled as mutually exclusive Segmented Control.
- Tool Toggles MUST preserve the selected object unless changing tools necessarily changes selection.

## Segmented Control

Use a Segmented Control for two to five peer views or modes when the whole set can remain visible.

- Exactly one segment MUST be current unless the product explicitly supports no selection.
- The current segment MUST be identifiable without color alone.
- Arrow keys SHOULD move between segments; activation MAY follow focus only when changing views is inexpensive and reversible.
- Labels MUST remain short after localization. If they wrap or truncate ambiguously, use Tabs, Radio Group, or Select.

## Selection ownership

- Selection MUST belong to a named object set or mode group.
- Focus MUST NOT be treated as selection.
- A selected Data Row, current Tab, checked Checkbox, and pressed Toggle MUST use their correct semantic states rather than one generic `active` class.
- Batch selection MUST expose the number selected and the scope of batch actions.
- Selection persistence across route, filter, or pagination changes MUST be an explicit product decision.

## Responsive and localization

- Primary actions SHOULD remain visible on small screens; secondary actions MAY move into an Overflow Menu.
- Icon-only replacement MUST NOT remove a necessary visible label unless the icon is established and named.
- Controls MUST tolerate text expansion without clipping, overlap, or changing meaning.
- RTL layouts MUST mirror directional icons and group order when direction carries meaning; universal symbols MUST not be mirrored automatically.

## Themes, contrast, and motion

- Light, dark, and higher-contrast themes MUST preserve hierarchy and state distinctions.
- Checked or selected state MUST not rely only on accent color.
- Press feedback SHOULD use short surface or sub-pixel transform changes without bounce.
- Icon transition travel MUST remain inside the icon optical box and MUST NOT move the label or surrounding controls.
- Reduced motion MUST remove nonessential icon replacement, spin, or scale while preserving the committed state.

## Acceptance

- Every control can be named, reached, operated, and understood with keyboard only.
- Pointer, touch, keyboard, and assistive technology produce the same result.
- Focus, hover, selected, checked, pressed, busy, disabled, and error are not conflated.
- Busy actions cannot be committed twice.
- Destructive controls expose scope and confirmation or undo according to reversibility.
- Long translated labels and 200% zoom retain all actions.

## Migration

When adopting this contract, map existing `active` and `selected` classes to their actual semantics before changing visuals. Products MUST NOT replace native behavior with custom div-based controls solely to match the reference styling.
