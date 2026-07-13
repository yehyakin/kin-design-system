# Forms and entry

Status: normative

This contract defines text entry, bounded choice, search, file selection, validation, submission, and recovery. It supplements [`DESIGN.md`](../DESIGN.md), [`core-states.md`](./core-states.md), and [`terminology.md`](./terminology.md).

## Field anatomy

A Form Field contains, when applicable:

1. visible label;
2. optional requirement or format note;
3. input control;
4. optional prefix, suffix, or unit;
5. persistent help text;
6. validation message;
7. character, file, or selection limit.

The label MUST remain available when a value is present. Placeholder text MUST NOT replace the label. Required status, unit, currency, timezone, and format MUST be clear before submission.

## Shared states

Empty, filled, hover, focus-visible, invalid, disabled, read-only, busy, and externally updated states MUST be covered where applicable.

- Disabled means unavailable and not submitted where native form semantics apply.
- Read-only means visible, focusable when useful, selectable, and copyable.
- Validation MUST preserve user input.
- Errors MUST be associated with the affected field and described in text.
- Server errors MUST not be rewritten as client validation failures.
- Autofill, paste, password managers, and input-method editors MUST NOT be blocked.

## Text Input and Textarea

Use Text Input for a single line and Textarea for multi-line content.

- The input type and input mode MUST match the expected value.
- Textarea SHOULD resize vertically or provide sufficient product-controlled space.
- Character limits MUST state the limit before it is exceeded and MUST not silently discard input.
- Prefixes and suffixes MUST not be included in copied values unless they are part of the data.
- Values updated externally while a user is editing MUST not silently overwrite local input.

## Search Field

Use Search Field when the text changes a result set or navigates to matching content.

- The accessible name MUST identify the search scope.
- The query MUST remain visible while results load or fail.
- A clear action MUST be keyboard reachable when text is present.
- Empty query, no results, loading, partial results, error, and offline states MUST be distinct.
- Debouncing MUST NOT make typing feel unresponsive or reorder results after an item is chosen.
- Search suggestions are not a Combobox unless the input and list together form a value-selection control.

## Select

Use Select for choosing one value from a bounded list where free text is not accepted.

- The trigger MUST expose the selected value and expanded state.
- The list MUST expose the current option and support keyboard traversal.
- Typeahead SHOULD be supported for longer lists.
- Placeholder text MUST not be submitted as a real value.
- A disabled option MUST remain understandable when shown.
- If users need to filter a large list or create a value, use Combobox.

## Combobox

Use Combobox when users type to find or create a value from a changing or large set.

- Input text and committed value MUST remain distinct.
- The popup MUST expose its relationship to the input and the active option.
- Arrow keys MUST move through options without losing the typed query.
- Enter MUST commit the active option; Escape MUST close the popup without silently committing it.
- No-results, loading, partial, error, and create-new states MUST be explicit.
- Remote results MUST not be filtered again by an incompatible client filter.

## Token Field

Use Token Field for multiple discrete values such as recipients, labels, or filters.

- Each token MUST be individually named and removable.
- Backspace MUST not remove a token without a predictable focused or empty-input state.
- Invalid or duplicate tokens MUST remain visible with a recovery path.
- Pasted lists MUST show how values were split and which values failed.
- Tokens MUST wrap without causing horizontal page overflow.

## File Upload

Use File Upload only when the product accepts a real file and can state supported constraints.

- Browse and drag-drop paths MUST lead to the same validation and upload pipeline.
- The control MUST state accepted type, size, count, and privacy implications before selection.
- Selected, validating, uploading, failed, cancelled, and complete states MUST be distinct. Paused MUST remain distinct when the transfer supports pausing.
- Progress MUST identify the file and preserve retry or removal actions.
- Drag-drop MUST have a keyboard-accessible browse alternative.
- A file MUST NOT be described as uploaded before the server confirms completion.

### Anatomy

A File Upload contains, when applicable:

1. a visible label;
2. accepted type, maximum size, count, and privacy guidance;
3. a native file input or named browse control backed by one;
4. an optional Drop Zone that uses the same processing path;
5. selected-file identity and validation result;
6. per-file or aggregate progress;
7. cancel, retry, remove, and replace actions according to state;
8. a persistent result or link to the committed file after completion.

The native file input MUST remain available to keyboard and assistive-technology users. A visually hidden input MUST use a technique that keeps it operable; `display: none` MUST NOT be the only implementation when the input itself owns the accessible interaction.

### State model

| State | Required behavior | Available actions |
|---|---|---|
| Empty | Explain constraints before selection | Browse; Drop when supported |
| Selected | Name the local file without claiming transfer | Remove or replace |
| Validating | Check type, size, count, and product rules | Cancel when validation is meaningfully asynchronous |
| Uploading | Show transferred amount or indeterminate progress and retain file identity | Cancel when supported |
| Paused | Explain why transfer paused and whether progress is retained | Resume or cancel |
| Failed | Preserve file identity and specific recoverable context | Retry, remove, or replace |
| Cancelled | Confirm that the active transfer stopped without implying server deletion | Retry, remove, or replace |
| Complete | Show the server-confirmed result in context | Open, copy link, remove, or replace according to permissions |

- Validation failure and transfer failure MUST remain distinct.
- Retrying MUST not create a duplicate committed file unless the product explicitly supports versions or copies.
- Cancellation MUST state whether a partial server object may remain and how cleanup is handled.
- Removing a completed file is a separate destructive or reversible product action; it MUST NOT be conflated with cancelling an in-progress transfer.
- Multiple-file uploads MUST preserve each file's identity and state. Aggregate progress MUST not hide an individual failure.

### Drag and drop

- Drop Zone instructions MUST not imply that drag-drop is the only path.
- Enter or Space on the named browse control MUST open the native file picker.
- Drag enter and leave feedback MUST not report a successful selection or upload.
- Unsupported files MUST be rejected through the same validation messages as browsed files.
- Dropping a directory, URL, or multiple files when unsupported MUST produce a specific recoverable result.
- Global browser drop behavior MUST be prevented only inside the declared Drop Zone.

### Progress, recovery, and announcements

- Progress updates SHOULD be throttled so assistive technology is not flooded.
- The current state, file name, and final result MUST be available without relying on animation.
- Cancel and retry MUST target the intended file and preserve already completed siblings.
- When a transfer continues in the background, use the Background Task Queue contract rather than keeping a temporary overlay open.
- A Toast MAY report completion after the committed file is visible elsewhere; it MUST NOT be the only evidence of completion.

### Reference and product verification

KIN's framework-free reference MAY simulate selection, validation, progress, cancellation, failure, retry, and completion locally. It MUST label the simulation as a fixture, MUST NOT contact a server, and MUST NOT present simulated completion as a real upload.

An adopting product MUST verify its real validation and transfer pipeline before claiming the File Upload mapping as `verified`. That evidence MUST include server-confirmed completion, cancellation behavior, retry idempotency, permission failure, cleanup behavior, and the product's real file constraints.

## Form submission

- The primary submit action MUST name the result.
- Submission MUST preserve values while pending or failing.
- Duplicate submission MUST be prevented after acceptance.
- Field errors MUST appear near fields; a form-level Error Summary MUST link or move focus to affected fields when multiple errors exist.
- On failed submission, focus SHOULD move to the summary or first invalid field according to form complexity.
- On success, the product MUST show the committed result in context; a Toast MAY supplement but MUST NOT replace it.
- Unsaved changes MUST be handled explicitly before destructive navigation.

## Responsive and localization

- Labels SHOULD remain above fields on narrow layouts.
- Two-column forms MUST collapse according to task order, not visual order alone.
- Keyboards and pickers on mobile SHOULD match input type.
- Error text, help text, long option names, and translated labels MUST wrap without overlapping controls.
- Currency, date, number, name, address, and reading direction MUST follow the selected locale without changing stored meaning.

## Themes, contrast, and motion

- Focus, invalid, disabled, and read-only states MUST remain distinct in light, dark, and higher-contrast themes.
- Errors MUST use text or icon plus color.
- Loading indicators MUST not replace the field label or current value.
- Reduced motion MUST stop decorative progress movement while retaining numeric or textual progress.

## Security and privacy

- Sensitive values MUST NOT be written to client logs, analytics labels, URLs, or screenshots by default.
- Password, OTP, and secret fields MUST use appropriate autocomplete and masking behavior without preventing paste.
- File names and user-entered values MUST be treated as untrusted content.

## Acceptance

- Every field has a persistent name and correct value semantics.
- Keyboard-only users can enter, select, clear, validate, submit, and recover.
- Screen readers receive label, description, invalid state, error, and progress relationships.
- Input survives validation and server failure.
- Select and Combobox behavior are not conflated.
- Mobile keyboards, 200% zoom, long localization, and RTL do not hide required actions.

## Migration

Adopting products MUST preserve existing field names, API payloads, validation meaning, and analytics unless a separate data migration is approved. Visual redesign MUST NOT change business validation silently.
