# Workspace structure

Status: normative

This contract defines Sidebar collapse, Location Bar, Toolbar, Split View, and Context Sidecar behavior for dense applications. It supplements [`DESIGN.md`](../DESIGN.md), [`navigation-and-disclosure.md`](./navigation-and-disclosure.md), [`overlays.md`](./overlays.md), and [`terminology.md`](./terminology.md).

These components organize a working surface. They MUST preserve location, action meaning, permissions, and task state when their presentation changes.

## Sidebar collapse

Collapsing a Sidebar changes the amount of chrome, not the information architecture. It MUST NOT change destination identity, active location, permissions, saved-view order, badges with operational meaning, or the user's current task.

### State and content continuity

- Expanded and collapsed states MUST use the same navigation model and command handlers.
- The active destination MUST remain visible and programmatically current in both states.
- Icon position SHOULD remain optically stable while labels leave or enter a clipped label region.
- Labels MUST remain available as accessible names. Unfamiliar icon-only items MUST expose a Tooltip on hover and keyboard focus.
- Collapsing MUST NOT remount destination content, reset scroll, close an unrelated Inspector, discard unsaved input, or change the browser URL.
- Badges or counts MAY collapse into a compact indicator only when their full meaning remains available through focus, detail, or the destination itself.

### Motion and interruption

- Collapse and expansion SHOULD use the panel duration Token and the standard or enter easing defined in [`DESIGN.md`](../DESIGN.md).
- Layout tracks MAY animate when the implementation has bounded affected regions and measurements show no unusable jank. Labels SHOULD use opacity or clipping rather than translating every navigation row.
- A rapid `collapse -> expand -> collapse` sequence MUST end in the last requested state. Delayed cleanup MUST NOT hide labels, restore stale width, or move focus after a reversal.
- Focus MUST remain on the collapse control or a logical surviving navigation item.
- Reduced Motion MUST use an immediate width change or short crossfade without label travel.

### Responsive and persistence rules

- A collapsed desktop rail is not a mobile navigation solution. Narrow touch layouts MUST provide an explicit Drawer, bottom navigation, or route-level alternative.
- A collapsed rail MUST NOT reduce touch targets below 44 by 44 CSS pixels on touch layouts where it remains visible.
- Persisted state MUST be namespaced to the product and layout version. Invalid or inapplicable values MUST fall back safely.
- The collapse control MUST describe the next action and expose the controlled Sidebar relationship.

### Acceptance

- Destination, active location, accessible name, focus, and shortcuts remain unchanged across collapse.
- Pointer, keyboard, touch, 200% zoom, long localization, and RTL do not make collapsed navigation ambiguous.
- Motion is reversible and does not reset Workspace or Inspector state.
- The mobile fallback does not depend on hover labels.

## Location Bar

Use Location Bar to identify the current location or object and expose a small set of global or location-level actions. It answers “Where am I?”; it is not a general Toolbar and it does not replace a View Bar.

### Anatomy

A Location Bar contains, when applicable:

1. an optional navigation or Sidebar trigger;
2. current location or current object identity;
3. optional ancestors or parent context;
4. one primary location-level action;
5. global search or Command Menu entry;
6. compact preference controls;
7. an Overflow Menu for lower-priority actions.

The current location MUST remain visible or programmatically named. An icon, breadcrumb separator, or browser title alone is insufficient.

### Action priority and overflow

Action placement MUST follow a documented priority order:

1. the only navigation, close, cancel, or recovery action required to leave the current state safely;
2. the primary action for the current location or object;
3. search, Command Menu, and frequently repeated actions;
4. preferences and lower-frequency actions;
5. destructive, administrative, or rarely used actions in an Overflow Menu unless immediate visibility is required for safety.

- The primary action and only recovery action MUST NOT move into overflow merely to preserve visual symmetry.
- Overflow order MUST remain stable across objects that share the same action model.
- Moving an action into overflow MUST preserve its name, permissions, shortcut, enabled state, confirmation, and result.
- An action MUST have one active implementation. Responsive layouts MUST NOT create two independently stateful copies of the same control.
- If an action is duplicated for layout reasons, both entry points MUST use the same state and command handler, and only one copy may be exposed at a breakpoint.
- The Overflow Menu trigger MUST have an accessible name such as `More actions`.

### Location and hierarchy

- Ancestors MUST be links when they are navigable.
- The current location MUST use current-location semantics and SHOULD not be a redundant link.
- Long hierarchies MAY collapse middle ancestors, but the parent and current location SHOULD remain available.
- Truncation MUST follow [`data-display.md`](./data-display.md) and preserve access to the full value.
- Browser Back and Forward MUST continue to represent the product's declared location model.

### Responsive behavior

- The current location MUST remain visible on narrow screens. Removing the full hierarchy MUST NOT remove the current title.
- Ancestors MAY collapse before the current location.
- Text labels MAY be removed from familiar, named icon controls only when the accessible name and touch target remain.
- Lower-priority actions SHOULD move into one Overflow Menu rather than a row of unexplained icons.
- Touch targets MUST be at least 44 by 44 CSS pixels when the Location Bar is used on a touch layout.
- The Location Bar MAY wrap only when the product explicitly supports a two-line header; otherwise action priority and overflow MUST prevent accidental wrapping.

### Interaction and accessibility

- Location identity MUST precede trailing actions in reading and focus order unless the product has a documented bidirectional layout exception.
- Temporary menus MUST restore focus to their trigger when dismissed with Escape.
- Focus, current location, pressed state, and expanded state MUST remain distinct.
- A sticky Location Bar MUST not obscure focused content, browser anchors, or the first heading.
- Live task progress MUST not be announced repeatedly from the Location Bar; durable progress belongs to the affected task or Background Task Queue.

### Acceptance

- At every supported width, users can identify the current location.
- The primary and only recovery actions remain directly available.
- Overflow preserves command identity, permissions, state, shortcut, and result.
- Long localized locations do not overlap actions or cause page-level horizontal overflow.
- Keyboard and touch users can open and close temporary controls and recover focus.

## Toolbar

Use Toolbar for a stable row or column of related actions that operate on the current view, selection, or object. Do not use Toolbar for primary navigation, unrelated preferences, or arbitrary buttons placed on one line.

### Anatomy and grouping

A Toolbar contains:

1. a programmatic name;
2. one or more ordered action groups;
3. optional separators between meaningful groups;
4. optional current mode or pressed state;
5. an optional Overflow Menu for lower-priority actions.

- Actions MUST be grouped by task, not by visual balance.
- Reversible edit actions, object actions, and view controls SHOULD use separate groups.
- A separator MUST communicate a real grouping boundary and MUST NOT be added only for decoration.
- A Toolbar MUST NOT absorb page navigation or form fields unless the product defines a specialized editing Toolbar and preserves their native semantics.

### Keyboard model

- A Toolbar SHOULD use one Tab stop with roving focus when it contains a persistent set of closely related controls.
- Arrow keys MUST move among enabled controls according to orientation and reading direction.
- Home and End SHOULD move to the first and last enabled controls.
- Enter or Space MUST activate the focused control according to its native semantics.
- Disabled controls MUST be skipped by roving focus while remaining understandable when shown.
- Opening an Overflow Menu transfers focus into the menu; closing it with Escape restores focus to the trigger.
- If controls are added, removed, or moved into overflow, focus MUST move to a logical surviving control rather than the document body.

### Action priority and responsive behavior

- The most frequent, primary, and only recovery actions MUST remain visible.
- Secondary actions MAY move into overflow in a stable order.
- Moving an action MUST preserve its label, shortcut, permission, destructive treatment, and command handler.
- A compact Toolbar MAY use named icons, but an unfamiliar or high-risk action MUST keep visible text.
- On touch layouts, exposed controls and the Overflow Menu trigger MUST provide at least 44 by 44 CSS pixel targets.
- A Toolbar MAY scroll only when action order is spatially meaningful and overflow would obscure that meaning. Scrolling MUST not hide the current mode or only recovery action.

### State, themes, and motion

- Default, hover, focus-visible, active, pressed, disabled, busy, and error states MUST remain distinct where applicable.
- Pressed state indicates a persistent mode or choice; active state indicates the current pointer or key press.
- Toolbar movement between visible and overflow locations SHOULD be immediate at a breakpoint and MUST NOT animate controls across the screen.
- User-driven rearrangement MAY follow pointer movement directly; reduced motion MUST remove decorative settling or bounce.
- Borders and group separators MUST remain visible in light, dark, and higher-contrast themes.

### Acceptance

- The Toolbar has a programmatic name and coherent groups.
- Keyboard users can traverse every enabled exposed action without repeated Tab presses.
- Responsive overflow keeps primary and recovery actions visible.
- The same action produces the same command when exposed directly or through overflow.
- Localization, 200% zoom, and RTL do not reorder actions by accident or hide the active mode.

## Split View

Use Split View for adjacent panes whose relative size users need to control while comparing, editing, or inspecting content. Fixed grid columns without user resizing are not a Split View.

### Anatomy

A Split View contains:

1. two adjacent panes with stable identities;
2. a visual divider;
3. one interactive separator aligned with the divider;
4. declared minimum and maximum sizes;
5. a small-screen fallback;
6. optional persisted size scoped to the product and layout version.

The separator MUST use separator semantics, expose orientation, and report current, minimum, and maximum values when the value is meaningful.

### Pointer, touch, and keyboard resizing

- Pointer or touch dragging MUST update the pane continuously and remain clamped to declared bounds.
- The interactive hit area SHOULD be larger than the visible hairline. Touch layouts require at least a 44 CSS pixel target unless the product replaces Split View with another layout.
- Arrow keys MUST resize by a predictable step.
- Home and End SHOULD move to the declared minimum and maximum.
- A larger step MAY be available with a modifier, but the default step MUST remain useful without one.
- The separator MUST retain focus after keyboard resizing.
- Resizing MUST not select underlying text, trigger canvas tools, or activate pane content.

### Bounds and content protection

- Minimum sizes MUST protect the pane's identity, required controls, and only recovery action.
- Maximum sizes MUST preserve a usable adjacent pane.
- Content that no longer fits MUST wrap, scroll inside its declared Scroll Region, or move to the documented fallback. It MUST NOT become unreachable under the divider.
- Resizing MUST not reset selection, unsaved input, scroll position, task identity, or generated results.

### Persistence

- Persisted size MUST be namespaced to the product and layout version.
- Restored values MUST be clamped against current viewport and component bounds.
- A stale, invalid, or unsupported value MUST fall back safely.
- Products SHOULD provide a reset path when users can create an unusable arrangement across changing content.
- Private object identity or sensitive values MUST NOT be encoded in a shared preference key.

### Responsive fallback

- When both panes cannot remain usable, the product MUST choose a documented fallback: primary-pane switcher, Drawer, Inspector overlay, detail route, or stacked regions.
- The fallback MUST preserve access to both pane identities and required actions.
- Hiding a secondary pane without an accessible trigger is not a fallback.
- A hidden separator MUST leave the focus order.
- Returning to a wide layout MAY restore the last valid wide-layout size.

### Themes, contrast, and motion

- The visible divider and focus treatment MUST remain perceivable in all themes and Forced Colors.
- Direct user resizing SHOULD track input without easing.
- Programmatic restore MAY be immediate. It MUST not animate large layout changes under reduced motion.
- Cursor changes are supplemental and MUST NOT be the only resize affordance.

### Acceptance

- Pointer and keyboard users can resize within declared bounds.
- Separator semantics expose orientation and current value.
- Persisted values restore safely and are clamped after viewport changes.
- Mobile or narrow layouts provide a complete alternate path to both panes.
- Resizing preserves selection, input, scroll, and task state.
- At 200% zoom, neither pane loses its identity or only recovery action.

## Context Sidecar

Use Context Sidecar for persistent, task-scoped context that users repeatedly consult while continuing the primary task. Examples include evidence for an investigation, conflict details for a schedule, a review queue, document references, or a real AI tool attached to the current object.

Context Sidecar is optional. It MUST NOT be added merely to make a page resemble a desktop application.

### Distinction from adjacent components

- Use Inspector for stable properties of the current selection.
- Use Drawer for a temporary edge task or narrow-screen adaptation.
- Use Popover for compact anchored content.
- Use Sidebar for global or section navigation.
- Use Dialog for a bounded decision that requires modal focus.
- Use Context Sidecar only when the auxiliary context remains useful during continued work in the Workspace.

### Anatomy

1. a named trigger or command;
2. a visible title describing the context, not the container type;
3. the current object or task relationship;
4. one dominant context region;
5. optional local actions;
6. a close control;
7. a declared narrow-screen fallback.

The Sidecar MAY contain its own local tabs or history only when they belong to the same context. It MUST NOT become an unrelated miniature application or a stack of dashboard cards.

### Layout and width ownership

- On wide screens, a Sidecar MAY occupy an adjacent layout track and reflow the Workspace.
- Reflow is allowed only when the Workspace retains its documented minimum task width and the Sidecar can present required content without destructive truncation.
- If either region becomes unusable, the Sidecar MUST adapt to Drawer, Sheet, detail route, or another documented overlay rather than continuing to compress the Workspace.
- Opening MUST preserve Workspace scroll, selection, filters, input, and resizable-pane state.
- The Sidecar and Inspector MAY coexist only when the product proves that one dominant work region remains and all three regions meet their minimum widths. Otherwise they SHOULD be mutually exclusive.
- Optional resizing MUST follow the Split View separator contract and use bounded, versioned persistence.

### Focus, dismissal, and history

- A non-modal wide Sidecar remains in normal page focus order and MUST NOT trap focus or make the Workspace inert.
- Focus MAY move to the Sidecar when the invocation explicitly requests its content; otherwise opening MAY preserve focus on the trigger.
- Closing with Escape while focus is inside MUST return focus to the trigger or selected object that opened it.
- A Drawer or Sheet adaptation MUST use modal focus containment, background unavailability, scroll ownership, and return focus from [`overlays.md`](./overlays.md).
- Open state MAY be locally persistent when safe, but object identity, private content, or sensitive prompts MUST NOT be encoded in a shared preference key.
- When selection is shareable, the selected object or context MAY be represented in the URL. Browser Back MUST follow the adopting product's declared selection and disclosure model.

### Motion and state continuity

- The Sidecar MUST enter from and leave toward its owning edge.
- Track reflow, panel translation, and opacity MUST form one coordinated transition no longer than the panel or Drawer duration Token.
- It MUST remain interruptible. Delayed unmount, inert cleanup, focus restoration, or scroll unlock from an earlier close MUST NOT affect a later reopen.
- Closed content MUST not remain focusable or pointer interactive.
- Reduced Motion MUST use immediate reflow or a short opacity change while preserving the same final state and focus behavior.

### Content and AI boundary

- Context MUST name its source, freshness, selection, or scope when those affect a decision.
- Errors, stale data, permissions, and unavailable sources MUST remain visible without erasing safe prior context.
- An AI Sidecar MUST follow [`ai-assistance.md`](./ai-assistance.md). It MUST NOT simulate a model, invent citations, display fake thinking, or imply execution without a real task boundary.
- A deterministic reference MAY demonstrate local selection and disclosure behavior, but MUST label fixture data and backend exclusions.

### Acceptance

- Users can distinguish Sidecar, Inspector, Sidebar, Drawer, and Popover by task and behavior rather than appearance alone.
- Wide reflow and narrow overlay preserve the primary task, selection, scroll, and only recovery action.
- Escape, close, rapid reversal, focus return, 200% zoom, long localization, RTL, and Reduced Motion remain coherent.
- Sidecar content does not create a second equal-priority dashboard or unsupported AI claim.

## Migration

Before adapting an existing Sidebar, header, Toolbar, Split View, or Sidecar, inventory every action, permission, shortcut, pane state, persistence key, and responsive fallback. Visual restructuring MUST NOT change command meaning, location semantics, saved layout compatibility, or destructive-action protection without a separately reviewed migration.
