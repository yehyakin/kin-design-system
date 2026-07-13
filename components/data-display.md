# Data display

Status: normative

This contract defines comparable records, hierarchical data, properties, status, identity, and loading placeholders. It supplements [`DESIGN.md`](../DESIGN.md), [`core-states.md`](./core-states.md), and the applicable product pattern.

## Shared rules

- Display structure MUST follow the task: reading, comparison, scanning, hierarchy, or inspection.
- Values MUST retain unit, scope, source, freshness, and uncertainty where those affect interpretation.
- Demo, fixture, estimated, delayed, cached, and simulated values MUST be labeled when a user could otherwise interpret them as current product data. `Live` and `real-time` MUST be reserved for a real updating source with observable freshness and failure behavior.
- Empty, unknown, zero, unavailable, stale, and error MUST remain distinct.
- Truncation MUST preserve access to the full value.
- Color MUST NOT be the only carrier of status or comparison.
- Density MUST come from alignment and reduced repetition, not unreadably small type.

## Data Table

Use Data Table when users compare multiple records across shared columns.

### Anatomy

1. caption or accessible name;
2. header row;
3. data rows and cells;
4. optional sort and filter controls;
5. optional selection column;
6. optional row actions;
7. result count, pagination, or loading boundary.

### Behavior

- Column headers MUST identify the data meaning and unit where applicable.
- Sortable headers MUST expose current direction and remain keyboard operable.
- Row selection MUST not be confused with row focus or link navigation.
- Row actions MUST be reachable without relying on hover.
- Numeric comparison SHOULD use tabular numbers and consistent alignment.
- Sticky headers MUST not obscure focused content or browser anchors.
- Virtualization MUST preserve stable keys, row identity, selected state, focus recovery, and accessible context.

### Responsive behavior

- Columns MUST be prioritized explicitly.
- Narrow layouts MAY hide secondary columns, allow controlled horizontal scrolling, or transform each record into a compact labeled list.
- A transformed record MUST preserve label-value relationships and all required actions.
- A desktop table MUST NOT become an unlabeled stack of values on mobile.

## List and Data Row

Use List when records share a reading pattern but column comparison is secondary. Use Data Row inside a List, Table-like view, or selection surface.

- Identity MUST remain the highest-contrast content.
- Metadata order MUST remain consistent across rows.
- Optional actions MAY appear on hover but MUST remain keyboard and touch accessible.
- Selection, stale state, and source failure MUST preserve object identity.
- Opening an Inspector MUST not reset sort, filter, scroll, or selection.

## Tree View

Use Tree View only when parent-child hierarchy and branch traversal are central to the task.

- Each item MUST expose level, expanded state when applicable, and selection independently.
- Arrow keys MUST support parent, child, previous, and next traversal according to the tree model.
- Collapsed descendants MUST leave the focus order.
- Loading a branch MUST preserve the expanded parent and announce progress or result.
- Dragging tree items MUST have a keyboard alternative when reordering is allowed.
- Deep indentation MUST not consume the usable label area; provide alternate navigation for very deep structures.

## Property List

Use Property List for label-value attributes of one object, usually in an Inspector or detail view.

- Labels and values MUST have explicit relationships.
- Unknown, not collected, inherited, computed, and unavailable values MUST use clear language.
- Editable values MUST expose an edit action or edit mode without making every row look like an input.
- Long values MUST wrap, copy, or open in detail without forcing horizontal overflow.
- Sections SHOULD use spacing and occasional hairlines rather than nested cards.

## Status Indicator, Badge, Tag, and Chip

- Status Indicator communicates system or object state and MUST include text or an accessible name.
- Badge is a compact label or count; it MUST not become the default treatment for every value.
- Tag classifies content. Removable tags MUST expose a named removal action.
- Chip represents an interactive value such as a filter or token and MUST expose selected or removable behavior.
- Risk, evidence quality, completeness, health, and AI confidence MUST use separate labels and definitions.
- Full-background semantic color SHOULD be reserved for exceptional urgency.

## Avatar and identity

- Avatar MAY support recognition but MUST NOT replace the person's or object's accessible name.
- Missing images MUST fall back to stable initials or a neutral placeholder.
- Generated colors MUST preserve contrast and MUST NOT imply status.
- Presence MUST be a separate state from identity.
- Images MUST have meaningful alternative text or be hidden from assistive technology when the adjacent name is sufficient.

## Skeleton

Use Skeleton only when content geometry is known and a brief loading placeholder reduces layout shift.

- Skeleton MUST approximate the real layout rather than generic rectangles.
- It MUST not imply data values, status, or line counts that are unknown.
- Strong shimmer MUST NOT be used.
- Long or uncertain waits MUST transition to explicit progress or explanatory loading state.
- Reduced motion MUST use a static placeholder.

## Truncation and overflow

- Truncation MUST occur only when surrounding layout cannot safely wrap.
- The full value MUST remain available through accessible text, a Tooltip for short values, expansion, copy, or detail view.
- Critical identifiers SHOULD preserve distinguishable prefixes and suffixes.
- Overflow MUST not hide units, negative signs, status, or the only action.

### Modes

Use one declared mode according to the content:

- **End truncation** for names or paths whose beginning carries identity.
- **Middle truncation** for identifiers, hashes, domains, and file names where both prefix and suffix distinguish values.
- **Line clamp** for prose when a preview is useful and an explicit expansion path exists.
- **Wrap** instead of truncation when the complete value is required for the task or comparison.

Truncation MUST NOT be applied merely to make unrelated rows share an artificial height.

### Full-value access

- The full value MUST be available to pointer, keyboard, touch, and assistive-technology users.
- A native `title` attribute alone is insufficient because it is unreliable for touch and keyboard users.
- Tooltip MAY expose a short full value when the Tooltip contract is satisfied. Long or interactive content MUST use expansion, copy, Popover, or detail view instead.
- A shortened visual rendering MUST expose the unshortened accessible value when assistive technology would otherwise receive only the shortened text.
- Copy MUST use the source value, not the visible ellipsis string.
- Expansion MUST state its target with `aria-controls` and current state with `aria-expanded` when applicable.
- Collapsing an expanded value MUST preserve focus and MUST NOT lose selection or edits elsewhere.

### Content rules

- Ellipsis MUST be a rendering decision, not destructive modification of stored or submitted content.
- Middle truncation MUST preserve meaningful prefix and suffix lengths for the content type; fixed character counts are not universally safe.
- Units, signs, status words, extensions, and version suffixes MUST remain interpretable.
- Similar values shown together SHOULD retain enough distinguishing text to avoid false matches.
- Security-sensitive values MUST follow the product's redaction policy. Truncation is not redaction.

### Responsive, localization, and RTL

- Truncation MUST be recalculated or released when the available width changes.
- Localized text expansion MUST be tested before choosing truncation over wrapping or alternate layout.
- In RTL content, visual ellipsis placement MUST follow reading direction while preserving the declared semantic prefix and suffix.
- Mixed-direction identifiers SHOULD isolate their direction so punctuation and suffixes remain stable.
- At 200% zoom, users MUST retain a direct path to the full value without horizontal page overflow.

### Themes, contrast, and motion

- Full-value controls MUST retain visible focus in every theme and Forced Colors.
- Expanding or collapsing a clamped region MAY use a short opacity or size transition only when it remains interruptible and content does not jump unexpectedly.
- Reduced motion MUST use immediate expansion or a short crossfade.

### Acceptance

- End, middle, and line-clamp examples expose their complete source values.
- Keyboard and touch users can reveal or copy the same value available on pointer hover.
- Copied and submitted values never contain visual ellipsis characters unless those characters are part of the source.
- Long localization, mixed-direction identifiers, RTL, and 200% zoom preserve identity and required actions.
- Truncation does not hide a changed value, validation error, unit, status, or only recovery action.

## Themes, contrast, and localization

- Row boundaries, header hierarchy, focus, and selection MUST survive all themes and higher contrast.
- Translated headers and values MUST be tested with expansion and different reading directions.
- Dates, numbers, currencies, names, and units MUST follow locale conventions while preserving source meaning.
- Semantic color MUST retain the same business meaning across themes.

## Acceptance

- Users can identify structure, current object, selection, status, and freshness without color alone.
- Tables retain header-cell relationships and meaningful mobile presentation.
- Keyboard navigation does not lose context through sorting, filtering, virtualization, or Inspector changes.
- Long, missing, stale, error, and extreme numeric values remain understandable.
- 200% zoom does not remove required columns or actions without an equivalent path.

## Migration

Adopting products MUST preserve column meaning, sorting semantics, filters, selection scope, public identifiers, and URLs. Converting a table to cards is not a valid migration unless comparison is no longer a user task.
