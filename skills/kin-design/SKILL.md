---
name: kin-design
description: Apply the KIN Design System when designing, building, redesigning, reviewing, or auditing information websites, ecommerce operations tools, professional workspaces, data-heavy product UI, AI-assisted interfaces, and engineering or canvas applications. Use when a request mentions KIN, DESIGN.md, a product redesign, interface consistency, design tokens, dark/light themes, accessibility, UI quality, anti-slop review, or adapting an existing frontend to KIN.
---

# KIN Design

Use KIN as a product contract, not as a visual theme preset.

## Required context

1. Locate the KIN repository root from this skill directory and read `DESIGN.md` and `DELIVERY.md` completely.
2. Read `components/catalog.md` and `components/terminology.md` when the task adds, selects, renames, audits, or claims completion of a component.
3. Read `components/ai-assistance.md`, `review-and-approval.md`, `background-work.md`, or `charts-and-analysis.md` when AI output, evidence, approval, side effects, durable jobs, media review, or analytical charts are in scope.
4. Read `principles/verification.md` before claiming accessibility, browser, motion, zoom, RTL, or component-completion evidence.
5. Read the consuming project's `AGENTS.md`, `DESIGN.md`, `PRODUCT.md`, package manifest, global styles, token source, component primitives, and relevant route files when present.
6. Preserve the user's explicit request, real product behavior, data model, accessibility, routes, analytics, and established brand assets.
7. Read only the routed reference below. Do not load every reference.

If the KIN contract is unavailable, say so and do not claim KIN compliance.

## Design read

Before changing code, state internally or in a concise progress update:

```text
Mode: <build | redesign-preserve | redesign-overhaul | audit | review>
Surface: <information-site | product-workspace | ecommerce | canvas | other>
Primary user task: <one sentence>
Register: <calm/dense/editorial/operational/etc.>
Constraints: <brand, data, platform, accessibility, performance>
```

Ask one focused question only when two plausible answers would materially change the product, brand, information architecture, or data behavior. Otherwise proceed with the safest evidence-based interpretation.

## Route the task

- New page, application, component, or feature: read `references/build.md`.
- Existing interface redesign: read `references/redesign.md`.
- KIN adoption, migration, or evidence recording: read `references/adoption.md` before the applicable build or redesign workflow.
- Compliance, accessibility, performance, or anti-slop audit: read `references/audit.md`.
- Design critique without implementation: read `references/review.md`.
- Product-family and visual-register selection: also read `references/registers.md`.

## Source precedence

Resolve conflicts in this order:

1. User's explicit current request.
2. Safety, accessibility, privacy, and legal requirements.
3. Existing product behavior, real data, routes, and documented brand decisions.
4. Project-local `AGENTS.md`, `DESIGN.md`, tokens, and component contracts.
5. KIN normative `MUST` and `MUST NOT` rules.
6. KIN defaults and examples.
7. Third-party component defaults and aesthetic references.

Do not silently change routes, navigation labels, data meaning, form fields, analytics identifiers, permissions, brand assets, or public API behavior.

## Core execution loop

1. Inspect the real project and identify the source of truth.
2. Separate facts, assumptions, user choices, and generated suggestions.
3. Reuse existing tokens and primitives before creating new ones.
4. Plan information hierarchy and states before styling.
5. Implement the smallest coherent change.
6. Verify realistic content, empty/error/loading/stale states, light/dark themes, target viewports, keyboard use, touch where relevant, and both normal and reduced motion. Label automated and manual evidence separately.
7. Inspect rendered screenshots whenever a runnable UI exists.
8. Report evidence, deviations, unresolved issues, and rollback.

For consuming projects with `kin.config.json`, run the structural adoption check before implementation. During an audit, the optional KIN CLI may locate candidates, but every match must be confirmed in source context and rendered UI before it becomes a finding.

## Stop conditions

Stop and request direction when the task requires an undocumented brand replacement, destructive data or route migration, fabricated metrics or AI behavior, a new external dependency with material product impact, or a choice that changes the product's information architecture beyond the requested scope.

## Completion contract

Do not say a design is compliant only because the code builds. A completed response identifies:

- design and product decisions;
- files and dependencies changed;
- commands and tests actually run;
- screenshots or visual checks performed;
- accessibility and responsive checks;
- known issues and intentional exceptions;
- rollback path when the change is material.
