# Page coverage research and gap audit

Date: 2026-07-13
Scope: cross-product page and flow coverage for KIN
Status: informative; external projects are observations, not KIN rules

## Outcome

KIN already had strong component contracts and four working product references, but it did not have a page-level maturity model. Authentication, onboarding, settings, system recovery, search, transfer, notification, organization, and billing work could therefore be mistaken as complete when only their underlying controls existed.

This audit adds a separate page catalog and starts with the entry and account lifecycle: authentication and access, resumable onboarding, settings and administration, and system recovery.

## Reviewed public projects

| Project | Observed strength | KIN use | Excluded use |
|---|---|---|---|
| [Logto](https://github.com/logto-io/logto) | Sign-in, sign-up, social and enterprise methods, MFA, organizations, roles, and invitations are treated as one identity lifecycle | Flow and state inventory for access and organization contracts | Protocol implementation, brand, default UI, or provider claims |
| [Ory Elements](https://github.com/ory/elements) | Login, registration, recovery, verification, and settings are separate but related flows | Authentication page-family boundaries and recovery coverage | Source, theme, framework API, or security claims inferred from UI alone |
| [Better Auth UI](https://github.com/better-auth-ui/better-auth-ui) | Reusable sign-in, sign-up, forgot-password, account settings, and organization controls | Component composition and account/settings coverage | Drop-in adoption or default shadcn/HeroUI appearance |
| [Cal.com](https://github.com/calcom/cal.diy) | Tested onboarding moves from plan/context through personal settings and connection before marking completion | Stable step identity, committed progress, and meaningful completion | Scheduling-specific fields or route structure |
| [Formbricks](https://github.com/formbricks/formbricks) | Organization collaboration, invitations, onboarding, integrations, localization, and exports appear in a maintained production product | Invitation, collaboration, and settings failure inventory | Survey-specific UI or licensed enterprise implementation |
| [Chatwoot](https://github.com/chatwoot/chatwoot) | Durable inboxes, teams, filters, notifications, reports, exports, and multilingual operations | Notification Inbox, operational queue, and settings coverage | Support-desk information architecture copied into unrelated products |
| [Twenty](https://github.com/twentyhq/twenty) | Workspace creation and customizable object/view workflows in a large data product | Workspace-home and object workflow checks | CRM object model or visual imitation |
| [Saleor Dashboard](https://github.com/saleor/saleor-dashboard) | Mature single-page ecommerce operations across catalog, orders, channels, inventory, and failures | Product-detail, order, inventory, and channel page depth | GraphQL implementation or Saleor visual language |
| [Ant Design Pro](https://github.com/ant-design/ant-design-pro) | Explicit taxonomy for forms, lists, profiles, results, 403/404/500, account settings, login, and registration | Coverage checklist only | Dashboard templates, Card walls, visual styling, mock metrics, or boilerplate architecture |
| [Refine](https://github.com/refinedev/refine) | Headless CRUD lifecycle, auth/access control, routing, i18n, URL synchronization, unsaved-change handling, and audit-log use cases | Route/state/permission checks for data-heavy pages | Runtime framework adoption or generated CRUD UI |
| [Shadcn Fintech Template](https://github.com/Weebapp003/shadcn-fintech-template) | A broad template route set covering accounts, transactions, money movement, dashboard customization, notifications, settings, authentication, and support | Supplemental state inventory for financial operations and a prompt to model Help and Support separately | shadcn styling, mock balances and sessions, simulated market data or transfers, fake chat/status behavior, decorative 3D authentication, and a claim of production completeness |

Star counts, release counts, licenses, APIs, and maintenance status can change and must be rechecked at adoption time. The Shadcn Fintech Template is a supplemental implementation sample, not maturity evidence comparable to a maintained production product. KIN does not copy source, screenshots, fonts, icons, or brand assets from these projects.

## Supplemental fintech-template findings

Useful observations:

- Transaction search, filters, multi-selection, expandable detail, and a scoped export bar belong to one recoverable list task rather than unrelated dashboard Cards.
- Workspace personalization benefits from an explicit edit mode, stable module identity, persisted order, reset, and a clear distinction between personal and shared layout.
- Notification read state, dismissal, and the underlying business action are separate results.
- Help search, support requests, ticket history, contact channels, and service status form a recurring page family that KIN had not cataloged separately.

Rejected as KIN evidence or behavior:

- Pointer-only drag sensors do not establish keyboard drag-and-drop support.
- Rotation, scale, spring emphasis, large shadows, and Card-wall composition do not match KIN's interaction or surface discipline.
- `setTimeout` success, simulated transfers, generated prices, mock sessions, and local-only notification actions do not prove a backend operation.
- A decorative globe, security badge, provider button, online label, response-time claim, typing animation, or invoice list MUST NOT imply a real authentication, support, status, or billing service.

## Page coverage before this change

- Stable product references: information record, ecommerce operations, engineering canvas, intelligence workspace.
- Stable components: form controls, navigation, overlays, feedback, tables, activity, AI review, and durable background work.
- Missing boundary: no machine-readable distinction between a component fixture and a complete page flow.
- Missing cross-product references: initial access, first-run setup, settings, route/system recovery, complete search, import/export, notification inbox, audit log, and organization permissions.

## Priorities

### P0 — entry and recovery lifecycle

1. Authentication and access, including full-page and contextual Dialog variants.
2. Resumable onboarding with required/optional steps and real completion context.
3. Settings and administration with explicit scope and save models.
4. System and recovery pages covering permission, not-found, offline, rate-limit, conflict, session, and server failure.

These four receive contracts, runnable references, and automated checks in the first implementation batch.

### P1 — daily discovery and durable work

1. Search and results.
2. Operational Workspace Home.
3. Transfer and import/export.
4. Notification Inbox and Audit Log.
5. Organization members, invitations, roles, and ownership.

These receive normative contracts and explicit candidate gaps first. Reference work follows as a separate batch.

### P2 — conditional commercial administration

Billing and plan management remains draft and conditional. It should be promoted only with evidence from a product that has real plans, invoices, tax, currency, payment recovery, cancellation, and authorization behavior.

## Decisions

- Keep `patterns/` for product-family structures and add `pages/` for recurring complete-page jobs.
- Keep component and page maturity separate.
- Require stable pages to have page-level tests; component tests are insufficient.
- Make real backend, security, persistence, permission, and screen-reader review explicit manual adoption checks.
- Do not create a universal marketing landing-page contract, generic SaaS Dashboard, customer-logo wall, or decorative empty-state template.
- Do not claim OTP complete merely because a visual code field exists; it remains a conditional integration tied to a real verification flow.

## Remaining work

- Build and test the remaining P1 references for Workspace Home, transfer/import, notifications/audit, and organization permissions.
- Gather evidence from at least two consuming products before promoting organization, transfer, notifications/audit, or Workspace Home.
- Exercise authentication, persistence, server authorization, conflict, retry, and recovery against real product backends before a consuming project claims production verification.

The supplemental fintech-template review subsequently identified Help and Support as a separate recurring page family. KIN now supplies its contract, deterministic bilingual reference, and automated interaction coverage while retaining real support, status, privacy, and retention systems as manual product evidence.

The first P1 implementation completes Search and Results with a deterministic bilingual reference for URL restoration, query and filter retention, result-detail history, keyboard traversal, partial and stale sources, empty results, service failure, responsive filtering, and truthful backend boundaries. Ranking quality, authorization, source recovery, index freshness, query privacy, and screen-reader review remain consuming-product evidence.
