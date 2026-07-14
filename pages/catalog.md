# Page pattern catalog

Status: normative

This catalog tracks complete page and flow contracts. It complements the component catalog and product-family patterns; it does not turn KIN into a route template library.

## Boundaries

- A component contract defines one reusable interaction or content unit.
- A page contract defines a user job, entry and exit conditions, location behavior, data and permission states, recovery, and responsive adaptation.
- A product pattern defines how page contracts combine for one product family.
- A reference page is deterministic evidence. It is not a production route or authentication implementation.

Agents MUST NOT infer page completeness from the presence of individual components. A login form does not complete authentication; a table does not complete search; a progress bar does not complete import.

## Maturity model

| Status | Meaning |
|---|---|
| `stable` | Normative contract, runnable reference, applicable automated acceptance checks, and named manual checks exist. |
| `candidate` | The page job and contract exist, but a reference, state family, automated check, or product evidence remains open. |
| `draft` | The page family is recognized but key behavior or adoption evidence is unresolved. |
| `deprecated` | Retained only for migration and unavailable to new implementations. |

The machine-readable source of truth is [`catalog.json`](./catalog.json).

## Definition of page complete

A stable page contract MUST define:

1. the user job and the reason a page, Dialog, Drawer, or inline region owns it;
2. entry points, safe exits, return context, URL/history behavior, and focus restoration where applicable;
3. identity, primary content, primary action, secondary actions, and action priority;
4. loading, empty, partial, stale, offline, permission, rate-limit, failure, conflict, and recovery behavior that applies to the job;
5. authentication, authorization, privacy, destructive-action, and audit boundaries where applicable;
6. narrow-screen, touch, keyboard, localization, RTL, zoom, theme, contrast, and Reduced Motion behavior;
7. a deterministic runnable reference that does not claim a real backend;
8. applicable automated checks and named manual verification according to [`principles/verification.md`](../principles/verification.md);
9. known product-owned work such as identity-provider integration, route protection, storage, billing, or server-side authorization.

A successful screenshot or build MUST NOT be treated as page completion.

## Current stable page contracts

| Page family | Primary contract | Runnable reference |
|---|---|---|
| Information record and reading | [`patterns/information-site.md`](../patterns/information-site.md) | [`information.html`](../examples/product-patterns/information.html) |
| Ecommerce operations | [`patterns/ecommerce-operations.md`](../patterns/ecommerce-operations.md) | [`ecommerce.html`](../examples/product-patterns/ecommerce.html) |
| Engineering canvas | [`patterns/engineering-canvas.md`](../patterns/engineering-canvas.md) | [`canvas.html`](../examples/product-patterns/canvas.html) |
| Intelligence workspace | [`patterns/intelligence-workspace.md`](../patterns/intelligence-workspace.md) | [`workspace-reference`](../examples/workspace-reference/index.html) |
| Authentication and access | [`authentication-and-access.md`](./authentication-and-access.md) | [`access.html`](../examples/page-patterns/access.html) |
| Onboarding and setup | [`onboarding-and-setup.md`](./onboarding-and-setup.md) | [`onboarding.html`](../examples/page-patterns/onboarding.html) |
| Settings and administration | [`settings-and-administration.md`](./settings-and-administration.md) | [`settings.html`](../examples/page-patterns/settings.html) |
| System and recovery | [`system-and-recovery.md`](./system-and-recovery.md) | [`system.html`](../examples/page-patterns/system.html) |
| Search and results | [`search-and-results.md`](./search-and-results.md) | [`search.html`](../examples/page-patterns/search.html) |
| Help and support | [`help-and-support.md`](./help-and-support.md) | [`support.html`](../examples/page-patterns/support.html) |

## Candidate page contracts

- [`workspace-home.md`](./workspace-home.md)
- [`scheduling-workspace.md`](./scheduling-workspace.md)
- [`transfer-and-import.md`](./transfer-and-import.md)
- [`notifications-and-audit.md`](./notifications-and-audit.md)
- [`organization-and-permissions.md`](./organization-and-permissions.md)

These contracts MUST NOT be described as complete KIN reference pages until their catalog gaps are closed.

## Conditional page contract

[`billing-and-plan.md`](./billing-and-plan.md) applies only to products that expose plans, metered usage, invoices, or payment recovery. It MUST NOT be introduced into a product merely to resemble a SaaS template.

## Updating the catalog

- Add or change the machine-readable entry first.
- Keep paths repository-relative.
- A status promotion MUST close every named gap and update `CHANGELOG.md`.
- A stable page MUST include a real page-level test; component tests alone are insufficient.
- Product-owned backend work MUST remain in `manual_checks` even when the KIN reference is deterministic.
- Run `node scripts/validate-pages.mjs` and the full repository verification suite after changes.
