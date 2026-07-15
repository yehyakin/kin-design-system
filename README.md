<h1 align="center">KIN Design System</h1>

<p align="center">
  A practical interface system for clear, focused websites and applications.
</p>

<p align="center">
  <a href="READMEs/README.zh-CN.md">中文</a> &nbsp;|&nbsp; <strong>[English]</strong>
</p>

<p align="center">
  <a href="https://yehyakin.github.io/kin-design-system/">Website</a> &nbsp;·&nbsp;
  <a href="https://yehyakin.github.io/kin-design-system/zh/">中文展示页</a>
</p>

<p align="center">
  <a href="./DESIGN.md"><img src="https://img.shields.io/badge/Design_Contract-v3.0.0_development-5E6AD2" alt="KIN Design Contract v3.0.0 development" /></a>
  <a href="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml"><img src="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml/badge.svg" alt="Documentation validation" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-232326" alt="MIT License" /></a>
</p>

The current contract is KIN 3.0.0 in development. For an immutable production adoption, use the [latest stable v2.3.0 release](https://github.com/yehyakin/kin-design-system/releases/tag/v2.3.0) until 3.0.0 is formally released.

KIN is an open design system for interfaces where people need to read, compare, decide, or act. It can be used for a public information site, a content or knowledge product, a SaaS application, an internal tool, an ecommerce operation, a monitoring view, an AI-assisted workflow, or a specialized creative and engineering workspace.

The system covers visual foundations, layout, interaction, themes, accessibility, data presentation, AI behavior, component decisions, and delivery checks. It is written as a design contract that can be read by people and coding tools.

KIN is not tied to one company, industry, framework, or product architecture. A project can adopt the whole contract, use a few relevant rules, or treat it as a review reference.

[`VISION.md`](./VISION.md) explains the product direction and the boundary between the design system, its delivery surfaces and optional adoption tooling.

## What makes KIN visible

KIN is not identified by a dark theme, an indigo accent or a three-column shell. Its character appears when the whole interface follows the same priorities:

- Put the user's task before explanation or decoration.
- Give one content or work region clear visual priority; navigation and properties support it.
- Prefer continuous structure, alignment and dividers to stacks of interchangeable cards.
- Create useful density by removing repetition, not by shrinking everything.
- Keep the structure neutral and reserve emphasis for selection, action and business meaning.
- Keep facts, status, confidence, provenance and AI suggestions visually distinct.
- Use motion to explain state or spatial change, never to make an idle interface feel active.

The normative acceptance criteria and product-family differences are defined in [`principles/visual-signature.md`](./principles/visual-signature.md).

## What problem it solves

Interfaces become inconsistent when each new page makes its own decisions about color, spacing, hierarchy, component behavior, and responsive layout. The problem is more noticeable when several people, libraries, or coding tools contribute to the same product.

KIN provides a shared answer to common questions:

- What should receive attention, and what should stay quiet?
- How should content, navigation, properties, and actions be arranged?
- How should light, dark, mobile, keyboard, and reduced-motion states work?
- How should data sources, stale values, uncertainty, and AI suggestions be shown?
- When does a chart, animation, card, badge, or third-party package improve the task?
- What should be checked before a redesign is released?

The purpose is consistency without forcing every product to look identical.

## Who can use KIN

| Reader | How KIN helps |
|---|---|
| Product and visual designers | Provides shared rules for hierarchy, layout, themes, motion, components, and review |
| Frontend engineers | Provides implementation targets, states, accessibility requirements, and dependency boundaries |
| Product teams | Gives design and engineering a common vocabulary for decisions and tradeoffs |
| Independent makers | Offers a complete starting point without requiring a large design team |
| Coding tools and agents | Supplies explicit instructions and constraints before interface code is generated or changed |
| Reviewers and maintainers | Provides a checklist for consistency, usability, accessibility, and unnecessary visual noise |

No specific design software or frontend framework is required.

## Where it fits

KIN is most useful when an interface must present information clearly and support repeat use.

| Type of product | Examples |
|---|---|
| Information and content | Directories, databases, documentation, research, media archives, knowledge bases |
| SaaS and account products | Settings, billing, projects, team spaces, customer portals, self-service tools |
| Administration and operations | Back offices, approval flows, inventory, support, logistics, finance, workflow tools |
| Commerce | Catalogs, merchant tools, campaign operations, orders, inventory, creative production |
| Data and monitoring | Analytics, reporting, status views, risk records, observability, live operations |
| AI-assisted products | Search, recommendations, review, generation, automation, agent activity, evidence panels |
| Creative and technical tools | Editors, design tools, CAD, modeling, simulation, asset management |

Not every product needs a dense layout, a sidebar, an inspector, or a command menu. KIN defines when those patterns are useful; it does not require them on every page.

## What the system covers

### Foundations

- Light, dark, and system themes
- Neutral surfaces and semantic color
- Typography for English and Chinese interfaces
- Spacing, density, radius, borders, icons, and elevation
- Focus, contrast, touch targets, and reduced preferences

### Page and application structure

- Information hierarchy before decoration
- Public content pages and focused reading widths
- Access, resumable setup, settings, administration, and recovery flows
- Application shells, reversible sidebars, view controls, work areas, inspectors, and task-scoped Context Sidecars
- List, split, detail, board, timeline, schedule, canvas, and fullscreen views
- Responsive behavior that changes priority instead of merely shrinking desktop UI

### Components and states

- Rows, metrics, activity, buttons, forms, menus, dialogs, drawers, and notifications
- Loading, empty, error, partial, stale, offline, and permission states
- Data visualization and number changes
- Keyboard, screen-reader, mouse, and touch behavior

### Data and AI

- Sources, timestamps, units, confidence, and data completeness
- Separation between facts, rules, human decisions, and AI suggestions
- Visible scope, progress, confirmation, history, and rollback for automated actions
- No simulated results, fake live states, or invented reasoning

### Delivery and review

- A staged redesign process
- Accessibility and performance checks
- Dependency review
- Anti-Slop review for generic generated interface patterns
- Feature flags, incremental rollout, and rollback planning

## Delivery boundary

KIN's core repository is contract-first. It ships design and interaction contracts, generated Tokens, framework-free references, verification tooling, an Agent Skill, and adoption evidence formats.

It does not currently ship a published Figma component library or a supported universal runtime package. Figma support means Variables interoperability; production components remain owned by each consuming project. The private pre-release `@kin-design/react` laboratory is an optional, pinned evaluation surface rather than a completed delivery claim. The approval gates for any future Figma Library or public runtime package are defined in [`DELIVERY.md`](./DELIVERY.md).

## Ways to use KIN

### Use it as a reference

Read [`DESIGN.md`](./DESIGN.md) and [`DELIVERY.md`](./DELIVERY.md) when planning or reviewing an interface. You can adopt individual rules without copying the repository into your project.

### Use it as a project contract

Add the design contract and relevant supporting files to a project's documentation. Record project-specific exceptions next to the contract instead of silently changing the rules.

KIN 2.3 includes a non-destructive adoption record, an implementation brief, route-level product profiles, verification evidence, and a candidate audit:

```bash
node scripts/init-adoption.mjs ../your-project --profile intelligence-workspace
node scripts/check-adoption.mjs ../your-project
node scripts/audit-project.mjs ../your-project
```

The profile is explicit because no one page model is safe for every product. The initializer creates a draft, project-owned implementation brief and a machine-readable evidence record whose checks begin as `not-run`. Hybrid products can map different route families to different profiles. A project cannot claim verified KIN adoption from Token parity, wrapper components, a design lab or a component gallery. It must implement and review at least one representative production workflow with comparable baseline and candidate evidence. See [`adoption/implementation-brief.md`](./adoption/implementation-brief.md) and [`adoption/README.md`](./adoption/README.md).

### Use it with a coding tool

Use the repository Skill when the coding tool supports Agent Skills:

```text
skills/kin-design/SKILL.md
```

The Skill classifies build, redesign, audit, and review tasks; loads only the relevant workflow; and requires visual and engineering evidence before claiming compliance.

The Skill is one way to apply KIN, not the purpose of the system. Designers and engineers can use the same contracts without an Agent or coding tool.

For tools without Skill support, give the tool the main contract before it edits the interface:

```md
Read DESIGN.md, DELIVERY.md, and principles/visual-signature.md before changing the interface.

Start from the existing product, users, content, data, routes, and components.
Read only the principle and integration files needed for this task.
If kin.config.json exists, read its implementation brief and route/profile map.
Before coding, report the KIN composition checkpoint, proposed changes, risks,
and checks you will run. Do not implement a representative workflow while its
brief is draft or contains TODO.
```

Then load the smallest relevant set of documents:

```text
Page hierarchy or navigation
  DESIGN.md
  principles/visual-taste.md
  principles/apple-interaction.md

Reviewing a generated redesign
  DESIGN.md
  principles/anti-slop.md

Command menu or large data list
  DESIGN.md
  integrations/cmdk.md
  integrations/virtuoso.md

Live metrics
  DESIGN.md
  integrations/liveline.md
  integrations/number-flow.md

Information, ecommerce, intelligence, or canvas product work
  DESIGN.md
  matching file in patterns/
  components/core-states.md

Authentication, onboarding, settings, recovery, or another complete page flow
  DESIGN.md
  pages/catalog.md
  matching contract in pages/
  matching reference in examples/page-patterns/

Adopting KIN, migrating an existing contract, or recording evidence
  DESIGN.md
  DELIVERY.md
  adoption/README.md
  principles/verification.md

Choosing or naming a component, or claiming that it is complete
  DESIGN.md
  components/terminology.md
  components/catalog.md

Implementing authentication, actions, forms, navigation, data display, feedback, or overlays
  DESIGN.md
  components/catalog.md
  matching contract in components/
  examples/workspace-reference/core-components.html

Implementing AI assistance, review, durable tasks, media, or charts
  DESIGN.md
  matching product pattern
  components/ai-assistance.md, review-and-approval.md,
  background-work.md, or charts-and-analysis.md
  examples/workspace-reference/advanced-components.html

Paired controls, async progress, completion feedback, or disclosure motion
  DESIGN.md
  components/micro-interactions.md
  integrations/sonner.md when temporary feedback adds value
  examples/workspace-reference/motion.html

Theme switch, system preference, or language menu
  DESIGN.md
  components/preference-controls.md
  integrations/lucide.md

Accessibility, browser, motion, zoom, localization, or RTL evidence
  DESIGN.md
  principles/verification.md

Evaluating or changing an official runtime integration
  DESIGN.md
  integrations/catalog.md
  matching file in integrations/
  packages/react/RFC.md
  packages/react/ADOPTION.md
```

[`AGENTS.md`](./AGENTS.md) contains repository-wide instructions for tools that support project instruction files.

### Contribute to KIN

```bash
git clone https://github.com/yehyakin/kin-design-system.git
cd kin-design-system
npm ci
npx playwright install chromium firefox webkit
npm run validate
npm run test:reference
```

Node.js 20.11 or newer is required for the repository tooling. The contract and documentation validators remain dependency-free. Playwright is a development-only dependency used for the reference interfaces.

## A practical design sequence

KIN recommends solving interface work in this order:

1. Understand the user, task, content, and data.
2. Decide what is primary, secondary, optional, and hidden.
3. Choose the page or workspace structure.
4. Define behavior and all data states.
5. Check accessibility, keyboard, touch, and responsive behavior.
6. Apply visual tokens and component rules.
7. Add motion only where it explains change or confirms an action.
8. Review the real screen with realistic content before release.

Starting with a gradient, card layout, animation, or component library reverses this sequence.

## Core rules in plain language

1. Make the current task easy to find.
2. Use order, alignment, spacing, and type before color and decoration.
3. Keep supporting navigation and metadata quieter than the main content.
4. Use one primary interaction color; use other colors only when they carry meaning.
5. Show where important data came from and when it was updated.
6. Distinguish facts, human choices, rules, estimates, and AI suggestions.
7. Design complete states, not only the ideal populated screen.
8. Support light and dark themes, mobile, keyboard use, touch, and reduced motion.
9. Reuse existing components before adding a dependency or creating another variation.
10. Check the rendered interface; passing a scanner or code review is not enough.

## What KIN does not require

- It does not require React, Tailwind, shadcn/ui, or another framework.
- It does not require a three-column workspace.
- It does not require dark mode as the default.
- It does not require high information density on every page.
- It does not require every documented UI library.
- It does not replace product research, content design, usability testing, or brand identity.
- It is not a Linear clone, a landing-page template, or a ready-made admin theme.

## Optional UI libraries

The integration notes explain when a library helps and when it should be skipped. They are not required by the design contract. For React products, KIN now includes a private pre-release integration laboratory that directly runs the official Sonner, NumberFlow, cmdk, React Virtuoso, dnd kit, input-otp, Liveline, and Leva packages. KIN adapts semantics, Tokens, themes, accessibility boundaries, and product rules without recreating the upstream animation or behavior engines.

Open the [Integration Lab](./examples/workspace-reference/integrations.html) to operate the real adapters. [`integrations/catalog.md`](./integrations/catalog.md) records integration status, while [`components/catalog.md`](./components/catalog.md) remains the source of truth for KIN component maturity. A runtime-integrated upstream package does not make a candidate KIN contract stable, and the private package is not a universal dependency or a completed adoption claim.

| Library | Intended use | Skip when |
|---|---|---|
| [Lucide](./integrations/lucide.md) | The reference monochrome UI icon library | The product already has one complete, consistent icon system |
| [cmdk](./integrations/cmdk.md) | Command menu and global search | A normal search field is enough |
| [React Virtuoso](./integrations/virtuoso.md) | Large lists and event streams | Native rendering performs well |
| [Sonner](./integrations/sonner.md) | Save, copy, undo, retry, and request feedback | The message belongs beside the affected object |
| [NumberFlow](./integrations/number-flow.md) | A small number of important value changes | Values are IDs, dates, initial counters, or ordinary table cells |
| [Liveline](./integrations/liveline.md) | Small real-time charts | Static history or a table explains the data better |
| [dnd kit](./integrations/dnd-kit.md) | User-controlled ordering | The order is fixed or there is no keyboard alternative |
| [input-otp](./integrations/input-otp.md) | A real one-time-code flow | No backend issues or verifies the code |
| [Leva](./integrations/leva.md) | Development-only design tuning | The control belongs in production settings |

Each adopting project is responsible for checking the current version, license, maintenance status, bundle cost, rendering behavior, and accessibility.

## Repository guide

| Path | Purpose |
|---|---|
| [`VISION.md`](./VISION.md) | Product direction, scope, and release priorities |
| [`DESIGN.md`](./DESIGN.md) | Normative design contract |
| [`skills/kin-design/`](./skills/kin-design/) | Agent workflow, task routing, and audit protocol |
| [`tokens/`](./tokens/) | Generated Tailwind CSS, DTCG, and Figma Variables interoperability output |
| [`adoption/`](./adoption/) | Consuming-project configuration schema, example, and adoption guide |
| [`adoption/implementation-brief.md`](./adoption/implementation-brief.md) | Project-owned composition, route-profile, state, evidence, and readiness contract |
| [`DELIVERY.md`](./DELIVERY.md) | Contract-first core boundary, Figma/runtime limits, future package gates, and adoption-evidence stages |
| [`adoption/kin.evidence.schema.json`](./adoption/kin.evidence.schema.json) | Machine-readable mapping, verification, ownership, exception, and production-observation evidence |
| [`scripts/audit-project.mjs`](./scripts/audit-project.mjs) | Read-only static candidate audit with human-review boundaries |
| [`scripts/export-figma-variables.mjs`](./scripts/export-figma-variables.mjs) | Create-only Figma Variables REST payload generator |
| [`components/core-states.md`](./components/core-states.md) | Normative component state and acceptance matrices |
| [`components/workspace-structure.md`](./components/workspace-structure.md) | Sidebar collapse, Location Bar, Toolbar, Split View, and Context Sidecar structure, input, responsive, and persistence contract |
| [`components/terminology.md`](./components/terminology.md) | Canonical component names and distinctions between similar interface patterns |
| [`components/catalog.md`](./components/catalog.md) | Component maturity, coverage, and Definition of Complete |
| [`components/catalog.json`](./components/catalog.json) | Machine-readable component maturity and support registry |
| [`components/authentication.md`](./components/authentication.md) | Authentication Shell, sign-in, recovery, verification challenge, and contextual reauthentication contract |
| [`components/actions-and-selection.md`](./components/actions-and-selection.md) | Button, Link, Checkbox, Radio, Switch, Toggle, and Segmented Control contract |
| [`components/forms-and-entry.md`](./components/forms-and-entry.md) | Input, Textarea, Search, Select, Combobox, File Upload, validation, and submission contract |
| [`components/navigation-and-disclosure.md`](./components/navigation-and-disclosure.md) | Tabs, Breadcrumbs, menus, Tooltip, Accordion, and Pagination contract |
| [`components/data-display.md`](./components/data-display.md) | Table, List, Tree, properties, status, Avatar, Skeleton, and truncation contract |
| [`components/feedback-and-progress.md`](./components/feedback-and-progress.md) | Alert, Banner, Toast, progress, Meter, Spinner, and system-state contract |
| [`components/overlays.md`](./components/overlays.md) | Dialog, Drawer, Popover, menu, focus, scroll, and stacking contract |
| [`components/ai-assistance.md`](./components/ai-assistance.md) | AI Composer, Evidence List, Streaming Response, stop, retry, privacy, and human-control contract |
| [`components/review-and-approval.md`](./components/review-and-approval.md) | Suggested Change, Diff, Execution Preview, Media Review, approval, audit, and rollback contract |
| [`components/background-work.md`](./components/background-work.md) | Durable tasks, queues, cancellation, partial completion, retry, and notification contract |
| [`components/charts-and-analysis.md`](./components/charts-and-analysis.md) | Chart context, interaction, data states, responsive behavior, and semantic Table fallback contract |
| [`components/micro-interactions.md`](./components/micro-interactions.md) | Normative paired-state, async-result, disclosure-motion, and feedback contract |
| [`components/preference-controls.md`](./components/preference-controls.md) | Normative theme-switch, system-preference, and language-menu contract |
| [`examples/workspace-reference/`](./examples/workspace-reference/) | Framework-free light/dark responsive visual fixture |
| [`examples/workspace-reference/core-components.html`](./examples/workspace-reference/core-components.html) | Runnable authentication, controls, motion, feedback, data, and overlay reference |
| [`examples/page-patterns/access.html`](https://yehyakin.github.io/kin-design-system/examples/page-patterns/access.html?lang=en) | Full-page sign-in, account recovery, session state, and contextual return reference |
| [`Authentication Dialog`](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/core-components.html?lang=en&dialog=authentication#authentication) | Directly opens the in-context sign-in dialog without discarding the current task |
| [`Session Re-authentication Dialog`](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/core-components.html?lang=en&dialog=reauthentication#authentication) | Directly opens the sensitive-action identity confirmation reference |
| [`examples/workspace-reference/motion.html`](./examples/workspace-reference/motion.html) | Motion Lab for frequency-aware invocation, Tooltip sequences, stable icon slots, Sonner tasks, responsive Drawer behavior, gesture physics, slow review, interruption, and reduced motion |
| [`examples/workspace-reference/integrations.html`](./examples/workspace-reference/integrations.html) | Operable Integration Lab for the official Sonner, NumberFlow, cmdk, React Virtuoso, dnd kit, input-otp, and Liveline runtimes plus the Leva development boundary |
| [`examples/workspace-reference/advanced-components.html`](./examples/workspace-reference/advanced-components.html) | Deterministic local reference for AI, review, durable tasks, media, and accessible charts |
| [`patterns/`](./patterns/) | Product contracts for information, intelligence, ecommerce, and engineering interfaces |
| [`examples/product-patterns/`](./examples/product-patterns/) | Distinct reference pages for information, ecommerce, and engineering products |
| [`pages/catalog.md`](./pages/catalog.md) | Page-family maturity, evidence boundaries, known gaps, and the page-level Definition of Complete |
| [`pages/catalog.json`](./pages/catalog.json) | Machine-readable page-family maturity and support registry |
| [`examples/page-patterns/`](./examples/page-patterns/) | Bilingual references for scheduling, access, onboarding, settings, system recovery, search/results, and help/support flows |
| [`examples/page-patterns/scheduling.html`](./examples/page-patterns/scheduling.html) | Candidate scheduling workspace with URL state, agenda adaptation, reversible Sidebar collapse, and responsive Context Sidecar |
| [`AGENTS.md`](./AGENTS.md) | Instructions for coding tools working in this repository |
| [`REFERENCES.md`](./REFERENCES.md) | Source hierarchy, attribution, and third-party adoption |
| [`principles/`](./principles/) | Interaction, visual review, hierarchy, density, and composition |
| [`principles/visual-signature.md`](./principles/visual-signature.md) | Observable KIN visual signature, product-family differences, and review gate |
| [`principles/motion-vocabulary.md`](./principles/motion-vocabulary.md) | Operational terms for purposeful, interruptible, origin-aware, gesture-driven, and reduced motion |
| [`principles/verification.md`](./principles/verification.md) | Automated and manual evidence boundaries for motion, browsers, zoom, localization, RTL, Forced Colors, touch, and screen readers |
| [`integrations/`](./integrations/) | Rules for optional UI libraries |
| [`integrations/catalog.md`](./integrations/catalog.md) | Runtime integration registry and the boundary between upstream engines and KIN contracts |
| [`packages/react/`](./packages/react/) | Private pre-release React adapters, RFC, support policy, tests, and rollback boundary |
| [`packages/react/ADOPTION.md`](./packages/react/ADOPTION.md) | Pinned local-package evaluation, Token mapping, subpath selection, product verification, and rollback |
| [`tools/`](./tools/) | Boundaries for brand motion and long-task loaders |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Contribution and versioning rules |
| [`scripts/validate-design.mjs`](./scripts/validate-design.mjs) | Token, reference, theme-parity, and contrast checks |
| [`scripts/validate-components.mjs`](./scripts/validate-components.mjs) | Component terminology, maturity, path, and support-coverage checks |
| [`scripts/validate-pages.mjs`](./scripts/validate-pages.mjs) | Page-family maturity, evidence-path, gap, and support-coverage checks |
| [`scripts/validate-integrations.mjs`](./scripts/validate-integrations.mjs) | Official runtime package, adapter, evidence, and upstream-preservation checks |
| [`scripts/report-token-changes.mjs`](./scripts/report-token-changes.mjs) | Machine-readable Token changes against a Git reference |
| [`tests/visual/`](./tests/visual/) | Chromium regression, normal-motion, cross-browser smoke, responsive, focus, RTL, reflow-proxy, and Forced Colors checks |
| [`ROADMAP.md`](./ROADMAP.md) | Planned examples, patterns, exports, and tooling |
| [`RELEASING.md`](./RELEASING.md) | Release checks, tag order, repository settings, and rollback |
| [`CHANGELOG.md`](./CHANGELOG.md) | User-visible changes |

## Languages

- [English](./README.md)
- [简体中文](./READMEs/README.zh-CN.md)

Translations are maintained as complete documents. A language should not be added only by publishing an unreviewed machine translation.

## Status and roadmap

The current registry contains 65 stable, 6 candidate, and 6 draft components. Ten page families are stable, five remain candidates, and one is conditional and draft. KIN remains contract-first: reference interfaces and the private React laboratory provide executable evidence, while production adoption still requires a real workflow, project-owned decisions, and recorded verification.

Planned work now depends on evidence from real adoptions rather than adding more universal rules. See [`ROADMAP.md`](./ROADMAP.md) for the current plan and non-goals.

## Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before proposing a change. A design-system change should explain the problem, evidence, affected areas, migration path, and rollback plan.

Before opening a pull request:

```bash
node scripts/validate-docs.mjs
node scripts/validate-design.mjs
node scripts/validate-components.mjs
node scripts/validate-pages.mjs
node scripts/validate-integrations.mjs
node scripts/validate-release.mjs
node scripts/export-tokens.mjs --check
node scripts/export-figma-variables.mjs --check
npm run test:tooling
npm run runtime:check
npm run site:check
npm run test:reference
```

Update [`CHANGELOG.md`](./CHANGELOG.md) when a change affects readers or adopting products.

## References

KIN was informed by public work from [Linear](https://linear.app/), [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/), [Kill AI Slop](https://github.com/yetone/kill-ai-slop), [Taste Skill](https://github.com/Leonxlnx/taste-skill), and the README structure of [Understand Anything](https://github.com/Egonex-AI/Understand-Anything).

These projects do not endorse KIN. Their brands, code, and assets remain with their respective owners. See [`REFERENCES.md`](./REFERENCES.md) for the source policy.

## License

KIN Design System is available under the [MIT License](./LICENSE).

<p align="center">
  Maintained by KiN3.
</p>
