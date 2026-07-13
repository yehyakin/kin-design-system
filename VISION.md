# KIN product direction

Status: directional

KIN is an independent design system for information-rich websites and professional software. Its purpose is to help teams design complete interfaces that remain clear under real content, repeated use, complex state, multiple input methods, and product growth.

KIN is not an Agent product. Agent support is one way to deliver and apply the system, alongside human-readable documentation, design-tool interoperability, reference interfaces, verification tooling, and project-owned implementations.

## Mission

KIN should make a finished product visibly more coherent, useful, and deliberate. A consuming product should gain:

- a recognizable hierarchy and visual register without losing its own brand;
- complete page and workflow behavior rather than isolated component styling;
- consistent light, dark, responsive, keyboard, touch, and Reduced Motion behavior;
- clear treatment of source, state, uncertainty, permissions, failure, and recovery;
- shared language for designers, engineers, product teams, reviewers, and coding tools.

The system succeeds when people can see the design decisions in the product and complete the primary task more confidently. Token compatibility, a component gallery, or a passing build is useful infrastructure, but none of them is the final outcome.

## Product layers

KIN develops as one system across four connected layers.

### 1. Foundations and visual language

Color, typography, spacing, density, iconography, surfaces, motion, themes, accessibility, and the KIN visual signature.

### 2. Components, pages, and product patterns

Reusable interaction contracts, complete page families, and product-specific compositions for information sites, intelligence workspaces, ecommerce operations, and engineering canvases.

### 3. Delivery surfaces

Normative documentation, the showcase website, framework-free references, generated Tokens, Figma Variables interoperability, and implementation guidance for project-owned components.

### 4. Adoption and verification

Migration guidance, evidence records, review tools, Agent Skills, visual comparison, production observation, and rollback. These capabilities help apply KIN; they do not define KIN's product direction by themselves.

## Recognizable without becoming uniform

KIN products do not need identical navigation, colors, routes, or component implementations. They MUST share observable design decisions: content owns attention, one work area dominates, chrome recedes, surfaces remain continuous, density comes from removing repetition, semantic states stay distinct, and motion explains spatial or committed change.

The normative definition is in [`principles/visual-signature.md`](./principles/visual-signature.md).

## What KIN is not becoming

- a Linear clone or a collection of proprietary visual imitations;
- a prompt library whose primary product is Agent onboarding;
- a universal React package imposed on every project;
- a Figma library claim without owners, release mapping, migration, and rollback;
- a component gallery that leaves complete workflows unresolved;
- a theme preset that changes colors while preserving weak hierarchy;
- a large catalog that treats component count as product quality.

## Release priorities

KIN SHOULD prioritize work in this order:

1. close gaps that prevent complete, recognizable production workflows;
2. improve the visual and behavioral evidence for stable components and pages;
3. validate the system in materially different consuming products;
4. improve delivery and adoption tools when they remove a demonstrated obstacle;
5. expand optional components only after product evidence identifies a repeated need.

The roadmap in [`ROADMAP.md`](./ROADMAP.md) translates this direction into releases. Delivery boundaries remain governed by [`DELIVERY.md`](./DELIVERY.md).
