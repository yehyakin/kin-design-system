# Page-pattern references

These deterministic pages demonstrate cross-product flows that sit above individual components and below product-specific workspaces.

| Reference | Contract | Demonstrates |
|---|---|---|
| [`access.html`](./access.html) | [`../../pages/authentication-and-access.md`](../../pages/authentication-and-access.md) | Sign-in, generic recovery response, password visibility and contextual reauthentication |
| [`onboarding.html`](./onboarding.html) | [`../../pages/onboarding-and-setup.md`](../../pages/onboarding-and-setup.md) | Resumable setup, optional collaboration and explicit completion |
| [`settings.html`](./settings.html) | [`../../pages/settings-and-administration.md`](../../pages/settings-and-administration.md) | Settings routing, unsaved changes, themes, sessions and confirmation |
| [`system.html`](./system.html) | [`../../pages/system-and-recovery.md`](../../pages/system-and-recovery.md) | Session, permission, not-found, offline, rate-limit and server recovery states |
| [`search.html`](./search.html) | [`../../pages/search-and-results.md`](../../pages/search-and-results.md) | Shareable query, filters and sort; keyboard traversal; selected-result history; partial, stale, empty and service-error states |
| [`support.html`](./support.html) | [`../../pages/help-and-support.md`](../../pages/help-and-support.md) | Help search and no results, local-only request validation, ticket history and authoritative status-source boundaries |

The pages are reference interfaces, not a runtime package or authentication implementation. They use local fixtures, transmit no credentials, and MUST be adapted to the adopting product's backend, authorization model, content and failure semantics.

Run `npm run test:reference` after changing interaction states or responsive behavior.
