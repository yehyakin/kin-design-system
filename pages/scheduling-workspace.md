# Scheduling workspace

Status: candidate

This contract defines a workspace for placing time-bound objects into dates, time ranges, resources, or publication windows. It applies to campaign publication, monitoring windows, review sessions, maintenance work, resource allocation, and comparable product tasks. It supplements [`../DESIGN.md`](../DESIGN.md), [`../components/workspace-structure.md`](../components/workspace-structure.md), [`../components/data-display.md`](../components/data-display.md), [`../components/navigation-and-disclosure.md`](../components/navigation-and-disclosure.md), and the adopting product pattern.

The contract is candidate because KIN has a deterministic interaction reference and automated checks, but real-product evidence for time-zone changes, recurrence, assistive-technology schedule traversal, and persisted rescheduling remains open.

## User job

Help a user answer:

1. what is scheduled;
2. when it starts and ends;
3. which resource, channel, owner, or lane it affects;
4. whether it conflicts, depends on another item, or lacks approval;
5. what can be safely changed next.

A schedule is not a dashboard and not a decorative calendar. If exact time placement, collision, or capacity does not affect a decision, use List, Board, Activity, or Timeline instead.

## Object model

Every scheduled item MUST retain, when applicable:

- stable identity and object type;
- start and end time;
- time zone and locale interpretation;
- all-day, floating-time, or fixed-instant semantics;
- lane, resource, channel, owner, or target;
- current state and approval state;
- recurrence rule and exception identity;
- dependency, capacity, collision, and blackout constraints;
- source, freshness, and permission;
- audit actor and prior value for committed changes.

Draft, scheduled, published, completed, cancelled, failed, blocked, and conflict are different states. A visual position MUST NOT be the only stored representation of time or ownership.

## Entry, location, and history

Valid entry points MAY include global navigation, a saved view, a campaign or object detail, a task queue, a notification, or a direct URL.

- Location Bar MUST name the schedule scope, such as workspace, team, channel, resource, or campaign.
- The active period, view, filters, and selected item SHOULD be deep-linkable when sharing or browser history matters.
- Browser Back MUST follow the product's declared selection and period-navigation model rather than reset to an unrelated home page.
- Closing selected-item context MUST restore focus to the item or a logical surviving date/resource control.
- Unsaved edits MUST be preserved or explicitly guarded when the user changes period, route, filter, or view.

## Information architecture

A scheduling workspace normally contains:

```text
Location Bar: schedule scope, current period, global actions
View Bar: period navigation, view mode, filters, time zone, saved view
Workspace:
  schedule grid or ordered agenda
  current-time and conflict context where real
Optional Context Sidecar:
  selected item, dependencies, conflicts, evidence, review, safe actions
Command layer:
  menus, confirmation, recovery, Toast
```

The schedule or agenda MUST be the dominant region. KPI cards, generic onboarding copy, and a persistent chat surface MUST NOT precede it.

## Views

### Schedule grid

Use a grid when spatial comparison across dates, time ranges, lanes, or resources is required.

- Headers MUST identify date, day, lane, resource, and time zone as applicable.
- A scheduled item MUST expose a complete accessible name including identity, date, start/end, state, and conflict when those affect the task.
- If ARIA `grid` semantics are used, the implementation MUST provide the complete keyboard model, row/column context, selection model, and focus management. A visual CSS grid alone MUST NOT claim grid semantics.
- Overlapping items MUST remain individually reachable and understandable without precision pointer input.
- Current-time indicators MUST use a real clock and MUST NOT be shown in a deterministic fixture as though live.

### Agenda or list

Agenda is the preferred narrow-screen fallback and MAY be the primary view for linear review.

- Items MUST be grouped by date and ordered by start time according to the displayed time zone.
- The list MUST preserve the same identity, status, conflict, owner/resource, and action access as the grid.
- Switching between grid and agenda MUST preserve period, filters, selection, and unsaved state.

### Timeline or resource view

Use Timeline when duration and dependency are primary. Use resource lanes when capacity allocation is primary. These views MUST retain the same source data and state definitions; visual placement MUST NOT create a separate hidden truth.

## Selection and Context Sidecar

- Selecting an item MAY open a Context Sidecar on wide screens.
- The Sidecar MUST identify the selected item and show only task-relevant properties, conflicts, dependencies, evidence, review, and actions.
- It MUST NOT become a second calendar, unrelated dashboard, or generic AI chat.
- Wide reflow is allowed only while the schedule retains its minimum useful comparison width.
- On narrower screens, selected context MUST adapt to a Drawer, Sheet, or detail route with correct focus containment and return.
- Closing context MUST NOT clear the selected object from history unless the product's URL model defines that result.

## Creating and editing

- Creation MUST state the date, start/end, time zone, target/resource, and resulting state before commitment.
- Rescheduling MUST show the proposed change and affected conflicts before persistence when consequences are not obvious.
- Dragging MAY be offered, but keyboard and touch alternatives MUST allow the same date, time, and lane change.
- Drag intent MUST NOT commit during hover. The item remains pending until the real persistence operation succeeds.
- Optimistic updates MUST retain the prior value and roll back accurately on failure.
- Recurring edits MUST distinguish this occurrence, this and future occurrences, and the whole series before commitment.
- External publication, spending, contacting people, or resource booking MUST follow the product's approval, permission, and execution contracts.

## Conflicts and constraints

- Conflict MUST name the affected items, resource or rule, time range, and available resolution.
- Warnings MUST remain visible in text and not rely on overlap geometry or color.
- Unknown capacity, missing availability, stale source, and permission-limited context MUST remain distinct from “no conflict.”
- The product MUST NOT silently resolve a conflict by moving, shortening, dropping, or publishing an item.
- AI suggestions MAY propose alternatives only when evidence, uncertainty, affected scope, and human action remain explicit.

## Time, locale, and time-zone behavior

- The displayed time zone MUST be visible whenever users, sources, or targets may differ.
- Fixed instants and floating local times MUST remain distinguishable in storage and review.
- Changing time zone MUST preserve the underlying meaning and communicate whether wall-clock labels or actual instants changed.
- Daylight-saving gaps, repeated times, midnight crossings, all-day boundaries, locale week starts, 12/24-hour formats, and right-to-left reading MUST be tested where applicable.
- Relative labels such as `today` MUST have access to the exact date.

## State and recovery

The workspace MUST define applicable behavior for:

| State | Required result |
|---|---|
| Loading | Preserve known period and structure; use content-shaped placeholders without inventing events |
| Empty | Name period and filters; offer a valid creation, import, or filter-reset path when available |
| Partial | Keep returned lanes/items usable and name missing sources or scope |
| Stale | Show the last successful update and avoid claiming current availability |
| Offline | Preserve safe cached items and local drafts; identify operations that cannot commit |
| Permission denied | Keep allowed location context; do not present restricted data as empty |
| Rate limited | Preserve period, filters, selection, and edits; state retry timing when known |
| Conflict | Keep every affected item and proposed resolution visible |
| Save failure | Restore or retain the prior committed time and expose retry/manual continuation |
| Source unavailable | Keep previously verified schedule context when safe and label provenance |

A generic full-page error MUST NOT erase a safe previously loaded schedule.

## Responsive and container-aware density

- Wide layouts MAY use Sidebar + schedule + Context Sidecar only when one dominant schedule region remains.
- At intermediate widths, the Sidecar SHOULD become a Drawer and the Sidebar SHOULD collapse or move to an alternate navigation pattern.
- Narrow layouts MUST provide an agenda, stacked resource list, or detail route; they MUST NOT display a laptop-only rejection message.
- Schedule cells MUST remove redundant metadata before time, identity, state, or conflict.
- Container-aware adaptation MUST follow [`../components/data-display.md`](../components/data-display.md) and preserve accessible names and actions.
- Touch targets MUST remain at least 44 by 44 CSS pixels. Precision dragging MUST NOT be the only editing path.

## Keyboard and accessibility

- Period, view, filter, item selection, context opening, editing, and recovery MUST be keyboard operable.
- A custom calendar-grid keyboard model MUST be documented and tested; otherwise use native buttons, links, lists, headings, and tables without asserting unsupported grid semantics.
- Focus and selected item MUST remain distinct.
- Screen-reader output MUST include date, time range, item identity, state, and conflict where applicable.
- Changes to period, filters, save state, and conflict SHOULD use concise announcements without re-reading the entire schedule.
- 200% zoom, text spacing, long localization, Forced Colors, Reduced Motion, and reduced transparency MUST preserve the task.

## Motion

- Period navigation SHOULD update content without a full-page entrance animation.
- Item selection MAY use a quiet surface change; it MUST NOT lift or bounce every event.
- Context Sidecar movement follows [`../components/workspace-structure.md`](../components/workspace-structure.md).
- A committed reschedule MAY confirm locally only after persistence succeeds.
- Reduced Motion MUST remove large grid travel, Sidecar translation, and drag settling while preserving state and focus.

## Security, privacy, and audit

- Server authorization owns schedule visibility and mutation permissions.
- Private titles, attendees, prompts, and object identifiers MUST NOT leak into public URLs, analytics labels, or client logs.
- External effects and high-impact changes require the product's declared confirmation, approval, and audit path.
- Audit MUST retain actor, prior value, new value, time zone interpretation, result, and rollback when applicable.

## Deterministic reference boundary

KIN's runnable reference uses local fixtures to demonstrate period navigation, item selection, Sidebar collapse, Context Sidecar reflow, overlay adaptation, URL state, themes, localization, focus return, and Reduced Motion.

It does not claim:

- calendar or campaign backend integration;
- persisted creation or rescheduling;
- real-time clocks or availability;
- recurrence computation;
- AI generation;
- external publication;
- server authorization.

## Acceptance

- Users can identify the schedule scope, displayed period, time zone, selected item, current state, conflicts, and safe next action.
- Grid and agenda preserve equivalent task information and selection.
- Sidebar collapse and Sidecar open/close remain interruptible and do not reset the schedule.
- Wide reflow and narrow overlay preserve focus, URL state, and the dominant work region.
- Empty, partial, stale, offline, permission, conflict, save-failure, and recovery states remain distinguishable where applicable.
- Time-zone, DST, recurrence, drag alternatives, screen-reader traversal, 200% zoom, and real persistence are verified by the adopting product before it claims completion.

## Migration

Before replacing an existing calendar or schedule, inventory its event identity, time semantics, time zones, recurrence, resource model, permissions, drag behavior, keyboard paths, URLs, persisted view state, conflict rules, integrations, audit records, and rollback behavior. Visual migration MUST NOT alter stored instants, publication windows, recurrence scope, or external effects without a separately reviewed data and behavior migration.
