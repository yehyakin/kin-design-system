# Core component state contract

This document makes the state requirements in [`DESIGN.md`](../DESIGN.md) testable. Product-specific components MAY add states, but MUST NOT remove a state that applies to their behavior.

## Shared rules

Every interactive component MUST distinguish these concepts when applicable:

- `hover`: pointer location only; never the sole way to reveal a required action.
- `focus-visible`: keyboard or assistive focus; independent from hover and selection.
- `active`: the control is being pressed or manipulated.
- `selected`: the related object or view is current.
- `expanded`: controlled content is visible.
- `disabled`: unavailable and not actionable; explain why when the reason is not obvious.
- `busy`: an accepted action is in progress.
- `error`: the current operation or value failed validation.
- `stale`: data is readable but no longer current.

Focus and selection MUST remain visually distinguishable. Color MUST NOT be the only status signal. Disabled content that still needs to be read MUST keep sufficient contrast.

## Button

| State | Required behavior | Visual treatment |
|---|---|---|
| Default | Name the result of the action | Semantic surface or primary accent; 5–7px radius |
| Hover | Preserve label and geometry | Increase contrast without translation or scale spectacle |
| Focus visible | Remain operable with Enter/Space | Visible focus ring outside the component boundary |
| Active | Commit only once | Darken or compress surface immediately; no bounce |
| Busy | Prevent duplicate submission after request starts | Keep label context; add concise progress text or indicator |
| Disabled | Remove action from normal interaction | No pointer action; retain readable explanation where needed |
| Error | Keep the recovery action available | Prefer adjacent error text over turning the entire button red |

Acceptance:

- Primary labels stay on one line in supported desktop layouts.
- Icon-only buttons have an accessible name and tooltip when meaning is not universal.
- Destructive irreversible actions use confirmation; reversible actions SHOULD prefer undo.

## Input and form field

| State | Required behavior | Visual treatment |
|---|---|---|
| Empty | Label remains available outside placeholder | Quiet surface and hairline |
| Filled | Preserve user text exactly | Same geometry as empty |
| Hover | No layout change | Slightly stronger line |
| Focus visible | Caret and field purpose are obvious | Accent focus ring; label remains readable |
| Invalid | Associate message with the field | Error text and icon where useful; not color alone |
| Disabled | Not editable or submitted | Muted control; readable value if it still matters |
| Read only | Selectable and copyable | Distinct from disabled; no misleading edit affordance |
| Busy | Avoid losing typed values | Progress belongs to the related action, not inside every field |

Acceptance:

- Labels, names, types, input modes, autocomplete, and error relationships are explicit.
- Paste is never blocked for passwords, OTP, codes, or identifiers.
- Submission focuses the first invalid field.

## Sidebar item

| State | Required behavior | Visual treatment |
|---|---|---|
| Default | Navigate to a stable destination | Low-contrast icon and label |
| Hover | Preview interactivity | One surface step; no floating card |
| Focus visible | Navigate with keyboard | Ring or inset focus treatment independent from selection |
| Current | Expose `aria-current` | Quiet selected surface and optional small accent marker |
| Collapsed | Preserve accessible name | Icon remains aligned; label moves to tooltip |
| Disabled | Explain unavailable destination if shown | No navigation action |

Acceptance:

- Current navigation is not represented only by accent color.
- The collapsed state does not change route identity or navigation order.
- Group labels are not interactive unless they actually expand or navigate.

## Data row

| State | Required behavior | Visual treatment |
|---|---|---|
| Default | Present identity and comparable fields | Transparent or primary surface; bottom hairline where needed |
| Hover | Reveal optional row actions without hiding data | `surface-hover`; stable row height |
| Focus visible | Support keyboard selection/opening | Visible focus independent from selected state |
| Selected | Synchronize Inspector and URL where required | `surface-selected`; identity remains highest contrast |
| Multi-selected | Expose selection count and batch actions | Selection marker plus text/checkbox state |
| Stale | Keep record readable | Timestamp or stale marker; no disabled styling |
| Error | Preserve object identity and recovery | Inline failure in the affected field or row |
| Loading | Preserve column geometry | Stable skeleton or reserved layout; no strong shimmer |

Acceptance:

- Opening the Inspector does not reset list scroll, filters, sort, or keyboard position.
- Long names truncate with an accessible full value.
- Columns use tabular numbers where comparison matters.
- Virtualization preserves stable keys and selection state.

## Inspector

| State | Required behavior | Visual treatment |
|---|---|---|
| Closed | Return space or use overlay according to breakpoint | No hidden focusable descendants |
| Opening | Preserve list state and focus origin | Enter from the side it occupies; reduced-motion crossfade |
| Open | Identify the selected entity and properties | Continuous surface with sections and hairlines, not cards |
| Loading | Preserve header and section geometry | Local placeholders; list remains usable |
| Partial | Distinguish unavailable from absent | `Unknown`, `Not collected`, or source failure language |
| Error | Keep close and retry available | Inline error in affected section |
| Mobile | Act as drawer or detail route | 44px touch targets, safe-area padding, focus containment |

Acceptance:

- `Esc` closes an overlay Inspector and returns focus to the selected row.
- Browser Back restores the previous selection or closes the deep-linked Inspector as designed.
- Inspector sections use label/value relationships and do not become mini dashboards.

## Command menu

| State | Required behavior | Visual treatment |
|---|---|---|
| Closed | Shortcut remains available outside text entry | No hidden focus trap |
| Open | Move focus to search and announce the dialog | Highest temporary surface with tight shadow |
| Searching | Keep prior context until results update | Stable groups and concise progress |
| Results | Support arrows, Home/End where appropriate, and Enter | Selected result uses surface contrast, not a bright block |
| Empty | Explain what can be searched | Actionable guidance, no decorative illustration requirement |
| Error | Preserve query and offer retry | Inline message inside the result region |

Acceptance:

- Global shortcuts do not trigger while the user is typing in an editable field.
- Server-filtered results do not receive conflicting client filtering.
- Closing restores focus to the trigger or prior active element.

## Activity row

| State | Required behavior | Visual treatment |
|---|---|---|
| Default | State event, time, actor/source, and affected object | Flat content row with restrained metadata |
| Expanded | Reveal evidence or complete payload | Same surface; indentation or detail region, not nested card |
| New | Preserve reading position | Separate “N new events” control instead of forced scroll |
| Conflicting | Expose disagreement between sources | Text and source state; no automatic final verdict |
| Failed source | Keep known event facts | Source unavailable or stale marker |

## Metric

| State | Required behavior | Visual treatment |
|---|---|---|
| Known | Show value, unit, scope, and freshness | Tabular number and quiet label |
| Changed | Explain direction according to business meaning | NumberFlow MAY animate an existing value change |
| Unknown | Do not invent a neutral value | `Unknown`, `Not collected`, or `Insufficient data` |
| Stale | Keep historical value with timestamp | Explicit stale marker |
| Error | Avoid replacing the value with zero | Error text and retry where useful |

An increase is not automatically positive. Color follows business meaning, not mathematical direction.
