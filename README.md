<h1 align="center">KIN Design System</h1>

<p align="center">
  Shared interface rules for data-heavy products.
</p>

<p align="center">
  <a href="READMEs/README.zh-CN.md">中文</a> &nbsp;|&nbsp; <strong>[English]</strong>
</p>

<p align="center">
  <a href="./DESIGN.md"><img src="https://img.shields.io/badge/Design_Contract-v1.0.0-5E6AD2" alt="KIN Design Contract v1.0.0" /></a>
  <a href="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml"><img src="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml/badge.svg" alt="Documentation validation" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-232326" alt="MIT License" /></a>
</p>

KIN is the design reference used across information websites, ecommerce operations tools, and other desktop-style web products. It records decisions about color, type, layout, interaction, accessibility, and third-party UI packages so each project does not have to make those decisions again.

The repository is written for product designers, frontend engineers, and coding tools. [`DESIGN.md`](./DESIGN.md) is the main specification. The shorter files cover individual principles and library integrations.

KIN borrows useful ideas from products such as Linear, but it is not a Linear theme and does not copy Linear's assets, source code, or business model.

## Why this repository exists

Product interfaces usually become inconsistent one small change at a time. A new page uses a different spacing scale. A new panel introduces another shade of gray. A library ships with its default styling. An AI-generated screen adds cards, gradients, and badges that do not match the rest of the product.

KIN gives the team one place to settle those questions:

- Which information should stand out?
- How should a workspace, sidebar, and inspector fit together?
- What belongs in light and dark themes?
- How should AI suggestions differ from confirmed data?
- When is animation useful?
- Which third-party packages are appropriate, and where should they not be used?

## What is included

| Area | Document | Contents |
|---|---|---|
| Main specification | [`DESIGN.md`](./DESIGN.md) | Tokens, layout, components, themes, motion, accessibility, AI behavior, and review rules |
| Sources | [`REFERENCES.md`](./REFERENCES.md) | Source priority, attribution, and third-party adoption rules |
| Agent instructions | [`AGENTS.md`](./AGENTS.md) | Repository-wide instructions for coding tools |
| Interaction | [`principles/apple-interaction.md`](./principles/apple-interaction.md) | Feedback, continuity, interruption, and reduced motion |
| UI review | [`principles/anti-slop.md`](./principles/anti-slop.md) | Review process for generic generated UI patterns |
| Layout review | [`principles/visual-taste.md`](./principles/visual-taste.md) | Hierarchy, density, rhythm, and composition |
| Integrations | [`integrations/`](./integrations/) | Rules for selected UI libraries |
| Project plan | [`ROADMAP.md`](./ROADMAP.md) | Tokens, examples, product patterns, and tooling planned for later releases |

## Quick start

### Read locally

```bash
git clone https://github.com/yehyakin/kin-design-system.git
cd kin-design-system
node scripts/validate-docs.mjs
```

The validation script has no package dependencies. It checks required files, local Markdown links, code fences, placeholder comments, and unresolved merge markers.

### Use with a coding tool

Start with a short instruction:

```md
Read DESIGN.md before changing the interface.

Use the existing product, data model, components, and routes as the starting
point. Read only the principle and integration files needed for this task.
Before coding, list the proposed changes, risks, and checks you will run.
```

Then add the documents relevant to the task:

```text
Navigation or panels
  DESIGN.md
  principles/apple-interaction.md

Command menu
  DESIGN.md
  integrations/cmdk.md

Reviewing a generated redesign
  DESIGN.md
  principles/anti-slop.md
  principles/visual-taste.md

Live monitoring
  DESIGN.md
  integrations/liveline.md
  integrations/number-flow.md
```

Reading every integration file for every task is unnecessary. Load the main contract first, then the smallest relevant set of supporting documents.

## Working rules

The full rules live in [`DESIGN.md`](./DESIGN.md). These are the short version:

1. Start with the user's task and the current object.
2. Use spacing, alignment, type, and surface contrast before adding decoration.
3. Keep navigation quieter than the work area.
4. Use one main interaction color. Reserve other colors for status.
5. Show the source and update time for important data.
6. Keep AI suggestions separate from confirmed facts and human decisions.
7. Support keyboard use, touch, light and dark themes, and reduced motion.
8. Do not invent metrics, live states, customer claims, or AI results.
9. Reuse existing components before adding a package or building a new one.
10. Check the actual screen, not only the code or a lint report.

## Optional UI libraries

The libraries below are documented candidates. They are not dependencies of this repository and should not be installed only because they appear here.

| Library | Use | When to skip it |
|---|---|---|
| [cmdk](./integrations/cmdk.md) | Command menu and global search | A normal search field is enough |
| [React Virtuoso](./integrations/virtuoso.md) | Large lists and event streams | The list is small or native markup performs well |
| [Sonner](./integrations/sonner.md) | Save, copy, undo, retry, and request feedback | The message belongs next to the failed field or object |
| [NumberFlow](./integrations/number-flow.md) | Changes to a small number of important metrics | First-load counters, IDs, dates, and table cells |
| [Liveline](./integrations/liveline.md) | Small real-time charts | Static history or precise tables explain the data better |
| [dnd kit](./integrations/dnd-kit.md) | Ordering favorites, rules, or evidence | The order is fixed or dragging has no keyboard equivalent |
| [input-otp](./integrations/input-otp.md) | A real one-time-code flow | No backend issues or verifies a code |
| [Leva](./integrations/leva.md) | Development-only design tuning | Public settings or production UI |

Each product remains responsible for checking the current package version, license, maintenance status, bundle cost, server-rendering behavior, and accessibility.

## Product use cases

### Intelligence and monitoring

Entity databases, risk records, evidence, domains, channels, and monitoring runs. Typical views include dense lists, split views, object details, activity history, and an inspector.

### Ecommerce operations

Products, creative assets, campaigns, inventory, orders, approvals, and automated jobs. These products share the same shell and interaction rules but use commerce-specific states and language.

### Engineering tools

CAD files, models, layers, versions, simulations, and reviews. The canvas remains the main work area; navigation and properties should support it rather than compete with it.

## Repository structure

```text
kin-design-system/
├── DESIGN.md
├── AGENTS.md
├── REFERENCES.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── ROADMAP.md
├── READMEs/
│   └── README.zh-CN.md
├── principles/
│   ├── apple-interaction.md
│   ├── anti-slop.md
│   └── visual-taste.md
├── integrations/
│   ├── cmdk.md
│   ├── virtuoso.md
│   ├── sonner.md
│   ├── number-flow.md
│   ├── liveline.md
│   ├── dnd-kit.md
│   ├── input-otp.md
│   └── leva.md
├── tools/
│   ├── brand-motion.md
│   └── long-task-loaders.md
└── scripts/
    └── validate-docs.mjs
```

## Languages

- [English](./README.md)
- [简体中文](./READMEs/README.zh-CN.md)

Translations are maintained as complete documents, not machine-generated fragments. When the English structure changes, translations should be updated in the same pull request or marked with the source revision they cover.

## Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before proposing a change. Larger design changes should explain the product problem, evidence, affected areas, migration path, and rollback plan.

Before opening a pull request:

```bash
node scripts/validate-docs.mjs
```

Update [`CHANGELOG.md`](./CHANGELOG.md) for changes that affect readers or consuming products.

## Roadmap

- **1.0:** Documentation, source governance, integration notes, and validation.
- **1.1:** Framework-neutral JSON tokens and generated CSS variables.
- **1.2:** Reference states for the application shell and common data components.
- **1.3:** Worked examples for intelligence, ecommerce, and engineering products.
- **2.0:** Agent skill, Figma token export, audit tooling, and migration helpers.

See [`ROADMAP.md`](./ROADMAP.md) for the full plan and non-goals.

## References

KIN was informed by public work from [Linear](https://linear.app/), [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/), [Kill AI Slop](https://github.com/yetone/kill-ai-slop), [Taste Skill](https://github.com/Leonxlnx/taste-skill), and the README structure of [Understand Anything](https://github.com/Egonex-AI/Understand-Anything).

These projects do not endorse KIN. Their brands, code, and assets remain with their respective owners. See [`REFERENCES.md`](./REFERENCES.md) for the source policy.

## License

KIN Design System is available under the [MIT License](./LICENSE).

<p align="center">
  Maintained by KiN3.
</p>
