# Component terminology

Status: normative

This document defines the canonical names KIN uses for common interface patterns. It improves communication between designers, engineers, reviewers, and coding Agents. A canonical name identifies a behavioral pattern; it does not prescribe a visual style or implementation package.

The machine-readable source is [`terminology.json`](./terminology.json). Component maturity and evidence are recorded separately in [`catalog.md`](./catalog.md) and [`catalog.json`](./catalog.json).

## Naming rules

- Product documentation and Agent prompts MUST use the canonical KIN name when one exists.
- An alias MAY be used in user-facing copy when it is clearer for the product audience.
- An alias MUST NOT erase a behavioral distinction. `Tooltip`, `Popover`, and `Dropdown Menu` are not interchangeable.
- Platform API names MAY be recorded as reference aliases but MUST NOT define KIN's web semantics.
- A visual resemblance MUST NOT be used as evidence that two components are equivalent.
- When a requested term is ambiguous, the implementation MUST resolve the intended trigger, content, focus, dismissal, selection, and persistence behavior before choosing a component.
- New canonical terms MUST include a plain definition, `use when`, `do not use when`, aliases, non-synonyms, and a component-catalog link.

## Overlay distinctions

| Canonical name | Definition | Not interchangeable with |
|---|---|---|
| Tooltip | A short, non-interactive label or explanation shown from hover or focus | Popover, Hover Card, Dropdown Menu |
| Popover | An anchored temporary surface containing contextual information or controls | Tooltip, Dialog, Dropdown Menu |
| Dropdown Menu | An anchored list of actions or choices opened from a trigger | Select, Combobox, Popover |
| Context Menu | A menu of actions for a specific object, opened from secondary click or an explicit equivalent | Overflow Menu, Dropdown Menu without object context |
| Hover Card | A rich, non-modal preview of a referenced object, available from hover and keyboard focus | Tooltip, Popover used for editing |
| Dialog | A modal task or decision that blocks interaction outside its scope | Popover, Drawer, non-modal panel |
| Drawer | A panel entering from a viewport or container edge for secondary navigation, properties, or a task | Dialog, Sheet, permanent Sidebar |
| Sheet | A modal surface attached to an owning window or rising from a compact-screen edge | Dialog with no spatial owner, non-modal Drawer |
| Scrim | The non-interactive layer separating a modal surface from background content | Surface, shadow, disabled content |

## Selection-control distinctions

| Canonical name | Definition | Not interchangeable with |
|---|---|---|
| Switch | Changes one setting immediately between on and off | Checkbox for batch submission, Toggle Button for a command |
| Checkbox | Selects zero or more independent values, often committed with a form or batch action | Switch, Radio Group |
| Radio Group | Selects exactly one value from a visible set | Checkbox, Select when options must remain visible |
| Toggle Button | A button whose command has a persistent pressed/unpressed state | Switch, ordinary action Button |
| Segmented Control | A compact connected set with one persistent selection, usually changing a view or mode | Tabs with separate document regions, Radio Group in a long form |

## Entry-control distinctions

| Canonical name | Definition | Not interchangeable with |
|---|---|---|
| Select | Chooses a value from a predefined list without free text | Dropdown Menu, Combobox |
| Combobox | Combines text entry with a filtered list of selectable suggestions | Select, Search Field, Command Menu |
| Search Field | Accepts a query and exposes search-specific clear, results, and recent-query behavior | General Text Input, Combobox used to select a value |
| Token Field | Converts recognized entries into removable structured tokens | Free-form Textarea, Badge collection |
| Command Menu | A keyboard-first searchable launcher for navigation and actions | Search Field, Combobox inside a form |

## Navigation and disclosure distinctions

| Canonical name | Definition | Not interchangeable with |
|---|---|---|
| Tabs | A row of labels controlling one associated content region | Segmented Control for a compact setting, Sidebar navigation |
| Accordion | Stacked headings that expand or collapse associated content | Tabs, Tree View |
| Breadcrumbs | A hierarchy trail from the current location to its ancestors | Back button, progress Stepper |
| Overflow Menu | A menu containing secondary actions that do not fit or do not deserve permanent display | Context Menu, arbitrary hiding of primary actions |
| Disclosure Control | A control revealing or hiding owned content in place | Navigation link, Checkbox |

## Feedback distinctions

| Canonical name | Definition | Not interchangeable with |
|---|---|---|
| Toast | A brief non-blocking result message that does not require immediate acknowledgement | Inline Alert, Dialog, progress region |
| Inline Alert | Persistent contextual feedback placed beside the affected content | Toast, validation message for one field |
| Spinner | An indeterminate busy indicator when completion cannot be measured | Progress Bar, Skeleton |
| Progress Bar | A determinate or stage-based representation of work completion | Spinner, Level Indicator showing a static value |
| Skeleton | A temporary layout placeholder for predictable content geometry | Spinner for an isolated action, empty state |
| Empty State | A stable absence of content with cause and next action where applicable | Loading Skeleton, error state |

## Data and display distinctions

| Canonical name | Definition | Not interchangeable with |
|---|---|---|
| Badge | A compact count or status marker attached to another object | Tag, Chip, Pill used only as a shape |
| Tag | A compact label classifying content | Status Indicator, interactive Chip |
| Chip | A compact interactive value that can usually be selected, removed, or edited | static Tag, Badge |
| Status Indicator | A text-and/or-icon representation of an object's current semantic state | Tag used for classification, decorative colored dot |
| Divider | A line separating adjacent controls or regions | Rule marking a topic break, decorative line |
| Data Table | Comparable records arranged in named columns and rows | visual grid with no tabular relationship, Data List |
| Tree View | A hierarchical list whose nodes can expand, collapse, and be selected | Accordion, nested Sidebar without tree interaction |
| Inspector | A contextual property panel for the current selection | Dashboard, modal Dialog, permanent navigation Sidebar |

## Layout and desktop-workspace terms

| Canonical name | Definition | Not interchangeable with |
|---|---|---|
| Toolbar | A stable row or column of actions for the current view or object | Navigation Bar, arbitrary button collection |
| Split View | Resizable adjacent panes separated by a draggable divider | Fixed grid columns, Drawer |
| Sidebar | Persistent or collapsible global or section navigation | Inspector, Drawer used for a short task |
| Context Sidecar | Optional adjacent context that may reflow a wide Workspace and adapts to an overlay or route when narrow | permanent navigation, object-property Inspector, short-lived Popover |
| Scroll Region | A bounded viewport that scrolls its own content | clipped region with inaccessible overflow |

## Text and positioning terms

| Canonical name | Definition | Not interchangeable with |
|---|---|---|
| Truncation | A deliberate shortened rendering with access to the complete value when it matters | destructive content removal, arbitrary fixed height |
| Sticky | Positioned relative to a scrolling container until a boundary is reached | Fixed positioning relative to the viewport |
| Fixed | Positioned relative to the viewport independently of document flow | Sticky positioning, permanent layout column |
| Focus Indicator | A visible marker of the element receiving keyboard or assistive focus | selected state, hover state, accent decoration |

## AI, review, and analytical terms

| Canonical name | Definition | Not interchangeable with |
|---|---|---|
| AI Composer | A task-scoped instruction, attachment, submit, stop, and recovery surface connected to real AI work | generic chat window, Search Field, decorative Textarea |
| Evidence List | Claims or decisions mapped to identifiable supporting, missing, stale, and conflicting sources | confidence score, related links, Activity Feed |
| Streaming Response | Real incomplete backend output that supports stop, failure, and retry | typing animation, Progress Indicator, completed result |
| Suggested Change Review | Current and proposed values presented for accept, reject, or edit before persistence | Activity Feed, audit history, Execution Preview |
| Execution Preview | Targets, writes, external effects, permissions, irreversibility, and rollback shown before execution | generic confirmation copy, Diff Review, Task Queue |
| Media Review | Media selection and approval with provenance, rights, metadata, accessibility, and channel constraints | Gallery, File Upload, media viewer |
| Background Task Queue | Durable accepted work with identity, state, progress, cancellation, recovery, and result | Toast, Spinner, Activity Feed |
| Chart | A visual analytical relationship with units, scope, source, state, and accessible data | Live Chart, decorative Sparkline, Metric |

## Authentication and access terms

| Canonical name | Definition | Not interchangeable with |
|---|---|---|
| Authentication Shell | Full-page structure for one active sign-in, recovery, verification, registration, or invitation task and its destination context | App Shell, decorative split screen, Authentication Dialog |
| Sign-in Form | Configured credential or provider entry with errors and a recovery path | Registration Form, Account Recovery Form, Verification Challenge |
| Account Recovery Form | Non-enumerating request and result flow that starts product-owned account recovery | Sign-in Form, Password Change Form, Verification Challenge |
| Session Re-authentication Dialog | Modal identity check that preserves a bounded task and resumes only its protected action | Sign-in Page, Confirmation Dialog, Permission Dialog |
| Verification Challenge | Time- and method-bound proof such as a link, passkey, device approval, code, or recovery factor | One-Time Password Input, Sign-in Form, Recovery Form |

## Agent resolution checklist

Before implementing an ambiguous term, an Agent MUST answer:

1. What triggers it: hover, focus, primary click, secondary click, keyboard shortcut, or system state?
2. Does it contain information, actions, choices, or editable controls?
3. Does it move focus or trap focus?
4. How is it dismissed?
5. Is the result temporary, persistent, selected, or committed?
6. What happens on touch and small screens?
7. Which catalog entry and normative contract govern it?

If these answers point to different components, the Agent MUST NOT choose based on appearance alone.

## External-reference boundary

Visual dictionaries MAY help discover canonical names, aliases, and useful distinctions. KIN MUST independently define production behavior, accessibility, responsive adaptation, localization, motion, evidence, and acceptance criteria. External descriptions, screenshots, examples, code, platform assets, and visual styling are not part of this contract.
