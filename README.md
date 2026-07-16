<h1 align="center">KIN Design System</h1>

<p align="center">
  <strong>A contract-first design system for information-rich websites and professional software.</strong>
</p>

<p align="center">
  Design contracts · Tokens · Runnable references · Verification tools
</p>

<p align="center" aria-label="Language">
  <a href="READMEs/README.zh-CN.md">中文</a> &nbsp;|&nbsp; <strong>[English]</strong>
</p>

<p align="center">
  <a href="https://yehyakin.github.io/kin-design-system/">Live showcase</a> &nbsp;·&nbsp;
  <a href="./DESIGN.md">Design contract</a> &nbsp;·&nbsp;
  <a href="./adoption/README.md">Adoption guide</a>
</p>

<p align="center">
  <a href="./DESIGN.md"><img src="https://img.shields.io/badge/Design_Contract-v3.0.0_development-5E6AD2" alt="KIN Design Contract v3.0.0 development" /></a>
  <a href="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml"><img src="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml/badge.svg" alt="Documentation validation" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-232326" alt="MIT License" /></a>
</p>

> **Version status:** use [v2.3.0](https://github.com/yehyakin/kin-design-system/releases/tag/v2.3.0) for production adoption. The `main` branch contains KIN 3.0.0 in development.

KIN helps teams make consistent decisions about hierarchy, layout, themes, motion, accessibility, data presentation, AI-assisted work, components, and release review. It is written for designers, engineers, product teams, reviewers, and coding tools.

The repository delivers contracts and evidence, not a universal application template. Products keep ownership of their brand, components, data, routes, permissions, and release process.

## Explore the system

The live references are deterministic examples. They demonstrate KIN behavior and composition; they are not production services or proof that a consuming product is verified.

| Reference | What you can inspect |
|---|---|
| [Showcase](https://yehyakin.github.io/kin-design-system/) | Principles, themes, product profiles, components, and repository entry points |
| [Workspace reference](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/?lang=en) | Sidebar, workspace, Inspector, responsive behavior, themes, and language controls |
| [Core components](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/core-components.html?lang=en) | Actions, forms, data, feedback, overlays, authentication, and component states |
| [Sign-in and recovery](https://yehyakin.github.io/kin-design-system/examples/page-patterns/access.html?lang=en) | Full-page sign-in, account recovery, session state, and return context |
| [Authentication Dialog](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/core-components.html?lang=en&dialog=authentication#authentication) | In-context sign-in without discarding the current task |
| [Session re-authentication](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/core-components.html?lang=en&dialog=reauthentication#authentication) | Identity confirmation before a sensitive action |
| [Motion Lab](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/motion.html?lang=en) | Buttons, menus, Tooltips, Sonner tasks, Drawers, interruption, gestures, and Reduced Motion |
| [Integration Lab](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/integrations.html?lang=en) | Official runtime packages operating through KIN adapters |

## Start here

### Read and review

Start with:

1. [Product direction](./VISION.md)
2. [Design contract](./DESIGN.md)
3. [Visual signature](./principles/visual-signature.md)
4. [Delivery model](./DELIVERY.md)

You can use KIN as a review reference without installing a framework or copying the repository into a product.

### Adopt the stable contract

Run the adoption tools from a pinned KIN checkout, not from the consuming product:

~~~bash
git clone --branch v2.3.0 --depth 1 https://github.com/yehyakin/kin-design-system.git
cd kin-design-system
node scripts/init-adoption.mjs ../your-project --profile information-site
node scripts/check-adoption.mjs ../your-project
node scripts/audit-project.mjs ../your-project
~~~

Choose the profile that matches the route being changed:

| Profile | Primary work |
|---|---|
| [`information-site`](./patterns/information-site.md) | Find, read, verify, cite, and revisit information |
| [`intelligence-workspace`](./patterns/intelligence-workspace.md) | Inspect entities, evidence, changes, risk, and monitoring state |
| [`ecommerce-operations`](./patterns/ecommerce-operations.md) | Operate catalogs, orders, inventory, campaigns, approvals, and creative work |
| [`engineering-canvas`](./patterns/engineering-canvas.md) | Edit files, models, geometry, revisions, constraints, and simulations |

Hybrid products can map different route families to different profiles. The initializer creates a project-owned implementation brief and evidence record; it does not rewrite product code or declare the project complete. Read the [adoption guide](./adoption/README.md) before migration.

### Use KIN with a coding tool

Tools that support Agent Skills can load:

~~~text
skills/kin-design/SKILL.md
~~~

For other tools, start with this short instruction:

~~~md
Read DESIGN.md, DELIVERY.md, and principles/visual-signature.md before changing
the interface. Start from the real user task, existing product, content, data,
routes, permissions, and components. If kin.config.json exists, read its
implementation brief and route/profile map.

Before coding, report the KIN composition checkpoint, proposed changes, risks,
verification plan, and rollback. Do not replace a real workflow with a component
gallery, invent data, or claim KIN adoption from Tokens or a passing build.
~~~

The Skill is one way to apply KIN, not the direction of the system.

### Contribute to KIN 3.0

Repository tooling requires Node.js 20.11 or newer:

~~~bash
git clone https://github.com/yehyakin/kin-design-system.git
cd kin-design-system
npm ci
npx playwright install chromium firefox webkit
npm run validate
npm run test:reference
~~~

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before changing normative rules.

## What changes in a KIN interface

KIN is not identified by one color, a dark theme, or a three-column shell. A finished interface should make these decisions visible:

- The user's task, subject, document, or current object appears before explanation or decoration.
- One work or reading region owns attention; navigation and supporting properties recede.
- Alignment, rhythm, rows, dividers, and small surface steps create structure before cards do.
- Density comes from removing repetition, not from shrinking text and controls.
- Most of the interface remains neutral; emphasis marks selection, action, or business meaning.
- Status, risk, confidence, completeness, availability, permission, and progress remain separate.
- Motion explains origin, direction, state, or a committed result and remains useful under Reduced Motion.

The acceptance criteria are defined in [KIN visual signature](./principles/visual-signature.md).

## What KIN covers

| Area | Included guidance |
|---|---|
| Foundations | Light, dark, and system themes; typography; spacing; density; surfaces; borders; icons; focus; contrast |
| Structure | Information pages, application shells, lists, Split Views, Inspectors, Sidecars, schedules, boards, and canvases |
| Components | Actions, forms, navigation, data display, feedback, overlays, authentication, state contracts, and maturity tracking |
| Product states | Loading, empty, error, partial, stale, offline, permission, recovery, and long-running work |
| Data and AI | Source, time, units, uncertainty, evidence, human approval, scope, history, and rollback |
| Interaction | Keyboard, mouse, touch, responsive priority, interruption, Reduced Motion, and localization stress |
| Delivery | Adoption briefs, versioned Tokens, runnable references, verification records, rollout, and rollback |

Page and component maturity is tracked in the [page catalog](./pages/catalog.md) and [component catalog](./components/catalog.md).

## Delivery model

KIN is **contract-first**:

- The core repository provides normative documentation, generated Tokens, framework-free references, verification tooling, an Agent Skill, and adoption evidence formats.
- Figma support currently means Variables interoperability, not a published Figma Component Library.
- Production components remain owned by each consuming product.
- The private pre-release `@kin-design/react` package is an integration laboratory, not a published universal dependency.
- A design lab, component gallery, screenshot, or passing build does not prove production adoption. Verification requires a named production workflow and recorded evidence.

The exact boundaries and future release gates are in [DELIVERY.md](./DELIVERY.md).

## Runtime integrations

[Open the Integration Lab](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/integrations.html?lang=en) to operate the reviewed upstream packages. KIN preserves their mature behavior and motion while adding project semantics, Tokens, themes, and verification boundaries.

| Tier | Integrations | KIN boundary |
|---|---|---|
| Core visual adapter | [Lucide](./integrations/lucide.md) | One coherent monochrome icon family |
| Stable runtime contracts | [cmdk](./integrations/cmdk.md), [React Virtuoso](./integrations/virtuoso.md), [Sonner](./integrations/sonner.md) | Command/search, large-list rendering, and temporary action feedback |
| Candidate runtime contracts | [NumberFlow](./integrations/number-flow.md), [Liveline](./integrations/liveline.md), [dnd kit](./integrations/dnd-kit.md), [input-otp](./integrations/input-otp.md) | Conditional use that still requires product-specific evidence |
| Development only | [Leva](./integrations/leva.md) | Internal design tuning; excluded from production entry points |

No project needs every integration. Before adoption, verify the current package, license, maintenance status, bundle cost, rendering behavior, accessibility, and rollback path.

## Adoption and verification

KIN adoption is staged so infrastructure cannot be mistaken for a finished design:

1. **Initialized** — select a pinned contract, product profile, local paths, and owners.
2. **Mapped** — complete the implementation brief, route/profile map, component mapping, exceptions, and representative workflow.
3. **Verified** — implement that workflow and record automated checks, manual checks, and a human visual review against comparable baseline and candidate artifacts.
4. **Production-observed** — record the released product revision, observation date, owner, and rollback path.

Automated checks, screenshots, browser smoke tests, real zoom, touch, and screen-reader review are different evidence classes. Unperformed work must remain unperformed in the record. See [verification requirements](./principles/verification.md).

## Repository map

| Path | Purpose |
|---|---|
| [`VISION.md`](./VISION.md) | Product direction and priorities |
| [`DESIGN.md`](./DESIGN.md) | Main normative design contract |
| [`principles/`](./principles/) | Visual hierarchy, motion, accessibility, and review rules |
| [`components/`](./components/) | Component contracts, terminology, maturity, and states |
| [`pages/`](./pages/) | Complete page-family contracts and maturity |
| [`patterns/`](./patterns/) | Product-profile composition rules |
| [`examples/`](./examples/) | Runnable, deterministic reference interfaces |
| [`integrations/`](./integrations/) | Optional upstream-package decisions and boundaries |
| [`tokens/`](./tokens/) | Generated CSS, DTCG, Tailwind-compatible, and Figma Variables output |
| [`adoption/`](./adoption/) | Project configuration, implementation brief, evidence, and migration guide |
| [`skills/kin-design/`](./skills/kin-design/) | Agent task routing and review workflow |
| [`DELIVERY.md`](./DELIVERY.md) | Figma, runtime, ownership, and release boundaries |
| [`rfcs/`](./rfcs/) | RFC proposals, decisions, and status; an accepted RFC remains non-normative until its outcomes are incorporated into the governing contracts |

## Project status

- **Stable:** [v2.3.0](https://github.com/yehyakin/kin-design-system/releases/tag/v2.3.0)
- **In development:** KIN 3.0.0 on `main`
- **Roadmap:** [ROADMAP.md](./ROADMAP.md)
- **Changes:** [CHANGELOG.md](./CHANGELOG.md)

Catalog maturity is recorded in machine-readable files rather than summarized by a hand-maintained component count in this README.

## Contributing

A proposal should identify the product problem, supporting evidence, affected product families, migration impact, validation, and rollback. Start with [CONTRIBUTING.md](./CONTRIBUTING.md); the complete required command matrix is maintained there.

## Sources and independence

KIN is an independent design system. External work informs techniques and review questions but does not become a KIN rule automatically. KIN does not copy third-party brand assets, proprietary interfaces, fonts, icons, or source code.

See [REFERENCES.md](./REFERENCES.md) for the source hierarchy, attribution, and integration policy.

## License

KIN Design System is available under the [MIT License](./LICENSE).

<p align="center">
  Maintained by KiN3.
</p>
