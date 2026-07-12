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
  <a href="./DESIGN.md"><img src="https://img.shields.io/badge/Design_Contract-v2.0.0-5E6AD2" alt="KIN Design Contract v2.0.0" /></a>
  <a href="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml"><img src="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml/badge.svg" alt="Documentation validation" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-232326" alt="MIT License" /></a>
</p>

KIN is an open design system for interfaces where people need to read, compare, decide, or act. It can be used for a public information site, a content or knowledge product, a SaaS application, an internal tool, an ecommerce operation, a monitoring view, an AI-assisted workflow, or a specialized creative and engineering workspace.

The system covers visual foundations, layout, interaction, themes, accessibility, data presentation, AI behavior, component decisions, and delivery checks. It is written as a design contract that can be read by people and coding tools.

KIN is not tied to one company, industry, framework, or product architecture. A project can adopt the whole contract, use a few relevant rules, or treat it as a review reference.

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
- Application shells, sidebars, view controls, work areas, and inspectors
- List, split, detail, board, timeline, canvas, and fullscreen views
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

## Ways to use KIN

### Use it as a reference

Read [`DESIGN.md`](./DESIGN.md) when planning or reviewing an interface. You can adopt individual rules without copying the repository into your project.

### Use it as a project contract

Add the design contract and relevant supporting files to a project's documentation. Record project-specific exceptions next to the contract instead of silently changing the rules.

KIN 2.0 includes a non-destructive adoption record and a candidate audit:

```bash
node scripts/init-adoption.mjs ../your-project
node scripts/check-adoption.mjs ../your-project
node scripts/audit-project.mjs ../your-project
```

The audit reports code patterns for review; it does not prove a visual defect or rewrite source. See [`adoption/README.md`](./adoption/README.md) for the contract, exception format, and product profiles.

### Use it with a coding tool

Use the repository Skill when the coding tool supports Agent Skills:

```text
skills/kin-design/SKILL.md
```

The Skill classifies build, redesign, audit, and review tasks; loads only the relevant workflow; and requires visual and engineering evidence before claiming compliance.

For tools without Skill support, give the tool the main contract before it edits the interface:

```md
Read DESIGN.md before changing the interface.

Start from the existing product, users, content, data, routes, and components.
Read only the principle and integration files needed for this task.
Before coding, list the proposed changes, risks, and checks you will run.
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
```

[`AGENTS.md`](./AGENTS.md) contains repository-wide instructions for tools that support project instruction files.

### Contribute to KIN

```bash
git clone https://github.com/yehyakin/kin-design-system.git
cd kin-design-system
npm ci
npx playwright install chromium
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

The integration notes explain when a library may help and when it should be skipped. These packages are not dependencies of KIN.

| Library | Intended use | Skip when |
|---|---|---|
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
| [`DESIGN.md`](./DESIGN.md) | Normative design contract |
| [`skills/kin-design/`](./skills/kin-design/) | Agent workflow, task routing, and audit protocol |
| [`tokens/`](./tokens/) | Generated Tailwind CSS, DTCG, and Figma Variables interoperability output |
| [`adoption/`](./adoption/) | Consuming-project configuration schema, example, and adoption guide |
| [`scripts/audit-project.mjs`](./scripts/audit-project.mjs) | Read-only static candidate audit with human-review boundaries |
| [`scripts/export-figma-variables.mjs`](./scripts/export-figma-variables.mjs) | Create-only Figma Variables REST payload generator |
| [`components/core-states.md`](./components/core-states.md) | Normative component state and acceptance matrices |
| [`examples/workspace-reference/`](./examples/workspace-reference/) | Framework-free light/dark responsive visual fixture |
| [`patterns/`](./patterns/) | Product contracts for information, intelligence, ecommerce, and engineering interfaces |
| [`examples/product-patterns/`](./examples/product-patterns/) | Distinct reference pages for information, ecommerce, and engineering products |
| [`AGENTS.md`](./AGENTS.md) | Instructions for coding tools working in this repository |
| [`REFERENCES.md`](./REFERENCES.md) | Source hierarchy, attribution, and third-party adoption |
| [`principles/`](./principles/) | Interaction, visual review, hierarchy, density, and composition |
| [`integrations/`](./integrations/) | Rules for optional UI libraries |
| [`tools/`](./tools/) | Boundaries for brand motion and long-task loaders |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Contribution and versioning rules |
| [`scripts/validate-design.mjs`](./scripts/validate-design.mjs) | Token, reference, theme-parity, and contrast checks |
| [`scripts/report-token-changes.mjs`](./scripts/report-token-changes.mjs) | Machine-readable Token changes against a Git reference |
| [`tests/visual/`](./tests/visual/) | Automated responsive, theme, focus, and overlay checks |
| [`ROADMAP.md`](./ROADMAP.md) | Planned examples, patterns, exports, and tooling |
| [`RELEASING.md`](./RELEASING.md) | Release checks, tag order, repository settings, and rollback |
| [`CHANGELOG.md`](./CHANGELOG.md) | User-visible changes |

## Languages

- [English](./README.md)
- [简体中文](./READMEs/README.zh-CN.md)

Translations are maintained as complete documents. A language should not be added only by publishing an unreviewed machine translation.

## Status and roadmap

Version 2.0 adds design-tool interoperability, a review-first static audit, and a versioned adoption contract. It keeps the 1.4 product profiles and reference interfaces while making project integration more explicit and testable.

Planned work now depends on evidence from real adoptions rather than adding more universal rules. See [`ROADMAP.md`](./ROADMAP.md) for the current plan and non-goals.

## Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before proposing a change. A design-system change should explain the problem, evidence, affected areas, migration path, and rollback plan.

Before opening a pull request:

```bash
node scripts/validate-docs.mjs
node scripts/validate-design.mjs
node scripts/export-tokens.mjs --check
node scripts/export-figma-variables.mjs --check
npm run test:tooling
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
