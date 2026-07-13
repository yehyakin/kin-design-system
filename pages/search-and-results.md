# Search and results page

Status: normative

Use this page family when the primary job is finding, narrowing, comparing, and opening records across a meaningful result set. It supplements [`components/forms-and-entry.md`](../components/forms-and-entry.md), [`components/navigation-and-disclosure.md`](../components/navigation-and-disclosure.md), [`components/data-display.md`](../components/data-display.md), and [`components/feedback-and-progress.md`](../components/feedback-and-progress.md).

## User job

Express a query, understand its scope and result quality, refine it without losing context, and open a stable result or recover when a source is unavailable.

## Boundaries

- Search Field, Combobox, Command Menu, and Search Results Page MUST remain distinct. A Command Menu finds a small set of commands or destinations; a Results Page owns complete filtering, comparison, recovery, and shareable state.
- Suggestions MAY help users formulate a query, but they MUST NOT silently replace the submitted query or pretend to be committed results.
- Ranking MUST NOT be implied by decorative prominence when the product cannot explain or justify it.
- A result detail preview MUST NOT be presented as the authoritative record when it is stale, incomplete, permission-limited, or sourced from an index rather than the record system.

## URL and restoration contract

- Query, scope, filters, sort, stable page or cursor, and selected result MUST be represented in the URL when sharing, browser history, or return matters.
- URL values MUST be treated as untrusted input and normalized against allowed scopes, filters, sorts, and states.
- Browser Back and Forward MUST restore the declared query, filters, sort, selected result, and page or cursor without resetting unrelated user work.
- Opening and returning SHOULD preserve scroll position. A virtualized result list MUST additionally preserve stable keys and a recoverable position anchor.
- A selected result that is no longer available under the restored filters MUST be cleared with an explicit explanation rather than silently selecting another record.

## Query and submission

- The Search Field MUST have a visible or programmatic name that identifies its scope.
- The submitted query MUST remain visible during loading, partial results, rate limiting, service failure, and offline recovery.
- A clear action MUST be keyboard reachable when the query is non-empty.
- Explicit submission MUST move focus to the result summary or a contextual error summary. Every keystroke MUST NOT force focus or scroll away from the input.
- Debouncing MAY update lightweight suggestions or local filtering, but it MUST NOT reorder results after a user has chosen one.
- Spelling correction or query rewriting MUST show both the submitted and effective query and provide a path back to the original.

## Result identity and quality

Each result MUST expose, when applicable:

1. stable primary identity;
2. object or content type;
3. relevant match context;
4. freshness or last-updated time;
5. source or scope;
6. permission, availability, or stale state;
7. a stable navigation target.

- Match highlighting MUST preserve readable text and MUST NOT be the only explanation of relevance.
- Search summaries MUST distinguish exact, approximate, partial, and unknown counts.
- Permission-filtered results MUST state whether records were omitted, redacted, or shown without an available action when the product is allowed to disclose that fact.
- `Live`, `real-time`, and `current` MUST be reserved for a source with observable freshness and failure behavior.

## Filters and sort

- Active filters MUST remain visible or reachable, individually removable, and represented in the URL when restoration matters.
- Filter labels and option counts MUST name their scope and MUST NOT imply totals the backend did not return.
- Applying filters MUST retain the submitted query and reset only the pagination or cursor dimension that is invalidated.
- Reset MUST name the scope it clears and MUST NOT silently clear the query unless the control explicitly says so.
- Sort MUST expose the current value. `Relevance` MUST NOT be offered when the product has no ranking model or deterministic relevance rule.
- Narrow layouts MAY move filters into a Disclosure or Drawer, but the number and identity of active filters MUST remain available outside the closed surface.

## Result states

The page MUST distinguish:

- idle guidance;
- suggestions;
- searching;
- results;
- no results;
- corrected query;
- partial results;
- stale index;
- rate limited;
- service failure;
- permission-filtered results;
- offline cache.

### No results

- No results MUST preserve the query and active filters.
- Recovery SHOULD offer relevant adjustments such as removing one filter, changing scope, correcting the query, or starting a supported creation flow.
- A service error, permission failure, or source timeout MUST NOT be reported as zero results.

### Partial or stale results

- Available results MUST remain usable when a source fails, unless their interpretation would be unsafe.
- The page MUST name the unavailable source or scope, explain whether the count is partial or unknown, and provide retry or source-status context when available.
- Stale results MUST show the freshness boundary and MUST NOT silently replace newer local user state.

### Service failure and retry

- Failure MUST preserve the query, filters, and sort.
- Retry MUST target the failed request or source without duplicating navigation or resetting the form.
- Repeated failure MUST remain an error state; it MUST NOT degrade into a false empty state.

## Results, detail, and pagination

- Dense comparable results SHOULD use rows; heterogeneous editorial results MAY use a structured list.
- Result navigation MUST use links when it opens a stable destination. Buttons MAY select a local preview but MUST NOT masquerade as navigation.
- Selection, focus, hover, and current location MUST remain visually and semantically distinct.
- Keyboard shortcuts such as `J` and `K` MAY move through results only when focus is not inside an editable control, menu, or dialog. The shortcuts MUST be documented in context.
- New results MUST NOT force-scroll a user who is reviewing an existing position.
- Infinite loading MUST NOT replace stable Pagination when users need repeatable URLs, result counts, footer access, or position recovery.
- Pagination MUST preserve query, filters, and sort, update the URL, and move focus to the result summary or first result according to the product task.

## Responsive behavior

- Wide layouts MAY use a filter rail, result list, and selected-result Inspector when the Inspector materially reduces navigation cost.
- Intermediate layouts SHOULD keep results primary and move preview details below the list or into an optional panel.
- Narrow layouts MUST keep the query, active-filter summary, result identity, match context, and primary navigation reachable without page-level horizontal scrolling.
- A mobile filter surface MUST retain unsaved choices until Apply or explicit cancellation and MUST restore focus to its trigger when dismissed.
- Result rows MAY become compact labeled lists, but type, identity, freshness, availability, and navigation MUST remain understandable.
- Touch targets MUST meet the product's declared minimum and MUST NOT rely on hover-only row actions.

## Accessibility and localization

- The result region MUST have a programmatic name and a summary that announces committed result changes without flooding assistive technology on every keystroke.
- Loading, partial, empty, and error states MUST use text and structure rather than color alone.
- Result links MUST have understandable accessible names without repeating every metadata value.
- Focus MUST remain visible in light, dark, higher-contrast, and Forced Colors modes.
- Dates, numbers, counts, sorting labels, reading direction, and token order MUST follow the selected locale without changing stored query semantics.
- Long translated filters, bidirectional record names, and 200% zoom MUST not hide the query, recovery action, or result navigation.

## Security and privacy

- Sensitive queries MUST NOT be written to analytics, URLs, logs, or screenshots unless the product has an explicit safe-query policy. If a product cannot safely place a query in the URL, it MUST document the resulting sharing and restoration limitation.
- Search results MUST enforce authorization at the data source; hiding a result in the interface is not an authorization boundary.
- Result excerpts and highlights MUST treat indexed content as untrusted text.
- Permission disclosures MUST not reveal the existence or identity of records the user is not allowed to know about.

## Reference and product verification

KIN provides a deterministic local reference at [`examples/page-patterns/search.html`](../examples/page-patterns/search.html). It demonstrates URL restoration, explicit submission, filters and sort, keyboard result traversal, selected-result history, no results, partial results, stale data, service failure, themes, localization, and responsive behavior.

The reference uses local fixtures, performs no network search, and does not prove ranking quality, authorization, index freshness, analytics safety, or backend recovery. An adopting product MUST verify those behaviors against its real search service before describing the mapping as complete.

## Acceptance

- Query, filters, sort, and selected result restore from a shareable URL where the product permits query sharing.
- Submission preserves input and moves focus only after a committed action.
- No results, partial results, stale results, service failure, permission filtering, and exact or unknown counts remain distinct.
- Keyboard users can submit, clear, filter, sort, traverse, select, return, and recover.
- Browser history restores selection without losing the result set.
- Narrow layouts preserve result identity and filter access without page-level horizontal overflow.
- Automated evidence covers deterministic behavior; real ranking, authorization, source recovery, screen-reader reading order, and privacy review remain product-owned manual evidence.

## Migration

Adopting products MUST preserve existing query syntax, URL compatibility, ranking meaning, permission behavior, analytics, and backend error semantics unless a separate migration is approved. A visual redesign MUST NOT silently change which records are returned or how their order is interpreted.
