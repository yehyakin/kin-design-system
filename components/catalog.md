# Component catalog

Status: normative registry

This catalog records what KIN currently supports, how mature each component is, and where its evidence lives. It prevents a component mentioned in prose from being mistaken for a stable, tested contract.

The machine-readable registry is [`catalog.json`](./catalog.json). Canonical names and non-synonyms are defined in [`terminology.md`](./terminology.md) and [`terminology.json`](./terminology.json).

## Maturity model

| Status | Meaning |
|---|---|
| `stable` | Normative behavior, runnable reference, and applicable automated acceptance checks exist |
| `candidate` | Useful contract or reference exists, but at least one required completion dimension remains open |
| `draft` | Planned or partially described; consuming products MUST supply and document missing decisions |
| `deprecated` | Retained only for migration; new implementations MUST NOT adopt it |

## Tiers

| Tier | Meaning |
|---|---|
| `core` | Common interaction or content primitive across product families |
| `workspace` | Structure for dense applications and object-based work |
| `product-specific` | Domain component for AI, ecommerce, information, or engineering work |
| `conditional` | Adopt only when real product requirements justify it |

## Definition of complete

A component can be marked `stable` only when every applicable dimension is covered:

1. purpose and appropriate use;
2. anatomy and content ownership;
3. complete state model;
4. pointer, keyboard, touch, and assistive-technology interaction;
5. focus and announcement behavior;
6. responsive and small-screen adaptation;
7. localization, long content, and RTL implications;
8. light, dark, higher-contrast, and reduced-motion behavior;
9. runnable reference implementation;
10. automated acceptance checks plus named manual checks where automation is insufficient;
11. migration, rollback, and deprecation notes when behavior changes.

`stable` does not mean a universal runtime package exists. KIN is contract-first; consuming projects implement or adapt components in their own framework.

Verification evidence MUST follow [`principles/verification.md`](../principles/verification.md). Automated checks, screenshot review, browser smoke, real zoom, and screen-reader review are different evidence classes and MUST NOT be reported as interchangeable.

## Current stable components

The catalog currently contains 64 stable components. The machine-readable registry remains the source of truth for each component's exact paths and support fields.

| Contract group | Stable components | Primary reference |
|---|---|---|
| Workspace foundation | App Shell, Sidebar, Inspector, Location Bar, Toolbar, Split View, Data Row, Activity Feed, Metric Strip | [`workspace-structure.md`](./workspace-structure.md), workspace reference, and product-pattern references |
| Actions and selection | Button, Icon Button, Link, Checkbox, Radio Group, Switch, Segmented Control | [`actions-and-selection.md`](./actions-and-selection.md) and the core component reference |
| Forms and entry | Text Input, Textarea, Form Field, Search Field, Select, Combobox, File Upload | [`forms-and-entry.md`](./forms-and-entry.md) and the core component reference |
| Authentication and access | Authentication Shell, Sign-in Form, Account Recovery Form, Session Re-authentication Dialog | [`authentication.md`](./authentication.md) and the access reference |
| Navigation and disclosure | Tabs, Breadcrumbs, Dropdown Menu, Context Menu, Overflow Menu, Tooltip, Accordion, Pagination | [`navigation-and-disclosure.md`](./navigation-and-disclosure.md) and the core component reference |
| Data display | Data Table, Property List, Status Indicator, Empty State, Skeleton, Tree View, Avatar, Truncation | [`data-display.md`](./data-display.md) and the core component reference |
| Feedback and progress | Inline Alert, Banner, Toast, Progress Indicator, Meter, Spinner | [`feedback-and-progress.md`](./feedback-and-progress.md), Sonner reference, and core component reference |
| Overlays | Dialog, Drawer, Popover | [`overlays.md`](./overlays.md) and the core component reference |
| AI assistance | AI Composer, Streaming Response, Evidence List | [`ai-assistance.md`](./ai-assistance.md) and the advanced component reference |
| Review and approval | Suggested Change Review, Execution Preview, Media Review | [`review-and-approval.md`](./review-and-approval.md) and the advanced component reference |
| Durable work and analysis | Background Task Queue, Chart | [`background-work.md`](./background-work.md), [`charts-and-analysis.md`](./charts-and-analysis.md), and the advanced component reference |
| Global behavior | Command Menu, Theme Switch, Language Menu, Focus Indicator | State, preference, and showcase references |

## Candidate components

Current candidates have named completion or adoption gaps:

- Context Sidecar;
- Drag and Drop;
- OTP;
- Live Chart;
- Number Transition;
- Verification Challenge.

See [`catalog.json`](./catalog.json) for exact contract, reference, test, and gap fields.

Context Sidecar is a workspace candidate rather than a package integration. Its contract and deterministic scheduling reference cover wide-screen reflow, narrow-screen overlay adaptation, focus return, URL selection, and Reduced Motion. It remains candidate until one adopting product records production workflow and manual assistive-technology evidence.

## Draft gaps

Draft components are conditional patterns that still require product evidence:

- Hover Card;
- Token Field and Combo Button;
- Slider, Stepper, and Color Well.

Draft components MUST NOT be represented to consuming projects as finished KIN components.

## Conditional integrations

The following remain conditional rather than becoming universal KIN requirements:

- drag and drop;
- OTP;
- live chart;
- number transition;
- slider and stepper;
- color well;
- long-task mathematical loader;
- brand reveal.

Conditional components require an adoption decision in the consuming product.

The central File Upload reference is deliberately a deterministic local fixture. It verifies the KIN state and interaction contract without claiming network transfer. A consuming product MUST verify its real storage, cancellation, cleanup, retry, authorization, and privacy lifecycle before marking its own adoption evidence as `verified`.

## Updating the catalog

- Add or change the machine-readable entry first.
- Update this summary when status or tier changes.
- Update `CHANGELOG.md` for user-visible maturity changes.
- Run `node scripts/validate-components.mjs`.
- A move to `stable` MUST name its normative contract, runnable reference, automated tests, manual accessibility checks, product-family impact, and migration notes.
- A move to `deprecated` MUST identify the replacement and removal plan.
