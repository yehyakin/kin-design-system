# Roadmap

The roadmap is directional. Items enter a release only after evidence, design review and maintenance ownership are clear. [`VISION.md`](./VISION.md) defines the product direction that this roadmap serves.

## Product tracks

KIN develops along four connected tracks. None of them replaces the others.

1. **Core language and visual signature** — foundations, composition, typography, themes, motion, accessibility and the qualities that make an interface visibly KIN.
2. **Components, pages and product patterns** — reusable contracts for complete tasks across information, intelligence, ecommerce and engineering products.
3. **Delivery surfaces** — documentation, generated Tokens, framework-free references and Variables interoperability.
4. **Adoption and verification** — evidence formats, audits and optional Agent guidance that help a consuming product apply and review the system truthfully.

Agent integration is one adoption capability. It is not KIN's product direction and MUST NOT displace design quality, complete workflows or human review.

## 1.0 — Documentation foundation

- Normative `DESIGN.md`.
- Source governance and component adapters.
- Contribution workflow and automated document validation.

## 1.1 — Executable contract

- Machine-readable Tokens in `DESIGN.md` frontmatter.
- KIN Agent Skill with build, redesign, audit and review routing.
- Theme-parity, reference, contrast and contract validation.
- Evidence-based audit scoring and severity.

## 1.2 — Token exports and reference states

- Generated CSS custom properties and DTCG output.
- Normative state and acceptance matrices for core components.
- Accessible HTML/CSS App Shell, Sidebar, View Bar, Inspector, Activity and Metric reference.
- Manual visual fixture across light/dark themes and desktop/mobile viewports.

## 1.3 — Automated reference coverage

- High-contrast reference theme and parity validation.
- Token change reports against Git references.
- Command menu, data list, form, empty/error/stale and overlay fixture.
- Automated responsive, theme, focus and overlay checks.
- CI screenshot artifacts for human visual review.

Pixel-difference gating remains deferred until cross-platform font and rendering baselines are stable enough to avoid false failures.

## 1.4 — Product patterns

- Information site with search, provenance, revision and reading structure.
- Intelligence workspace for evidence, monitoring, risk and investigation.
- Ecommerce operations workspace.
- Engineering/CAD canvas shell.
- AI-assisted review and approval embedded in the relevant product model.
- Distinct framework-free reference pages and automated checks.

## 2.0 — Design tooling

- Figma Variables create payload and DTCG/Tokens Studio interoperability guidance.
- Design audit CLI with source locations, severity, exceptions and human-review output.
- Versioned adoption configuration, initialization, structural checks and migration records for consuming products.

The Figma exporter deliberately does not manage credentials or update existing library IDs. The audit deliberately does not auto-fix heuristic findings. These boundaries prevent tooling convenience from becoming destructive product behavior.

## 3.0 development — Agent distribution staging

- Accepted RFC 001 while preserving `DESIGN.md` as the only normative design source.
- Added deterministic compact Snapshots for Light, Dark, Light High Contrast, and Dark High Contrast in English and Simplified Chinese.
- Added a machine Manifest, source-input checksums, locale-review gates, Schema validation, and byte-for-byte drift checks.
- Added separate release-candidate and post-Tag validation paths so protected-branch validation does not require a Tag that cannot yet exist.
- Kept the Phase 1 `next` tree repository-only. Pages publication, immutable archives, a Version Registry, stable aliases, component Recipes, Skill-routing changes, and consuming-product trials remain separate reviewed phases.

## Next

1. Test the implementation brief, route/profile map, composition checkpoint, and visual-signature criteria against representative production workflows in real consuming products. Use comparable baseline and candidate screenshots to refine the contracts before expanding optional variants.
2. Test the 65 stable components, while tracking the 6 candidates and 6 drafts separately, inside representative production workflows rather than only in component references. Coverage includes authentication and access, workspace structure, file transfer states, full-value access, AI review, durable work, and accessible analysis contracts.
3. Test the stable access, onboarding, settings, recovery, Search and Results, and Help and Support page contracts in consuming products. Build remaining P1 references only after product evidence confirms their shared boundaries.
4. Gather adoption evidence from real consuming products before expanding scanner rules or claiming that a mapping is visibly KIN.
5. Add ID-aware Figma library synchronization only if an eligible team can test update and rollback behavior.
6. Evaluate cross-platform screenshot baselines after font and renderer variance is measured.
7. Validate the private `@kin-design/react` integration laboratory in two materially different production workflows before deciding whether it should be published, retained internally, or removed.
8. Review the exact English and Simplified Chinese Agent Snapshot copy, then implement RFC 001 Phase 2 publication and immutable-version gates without exposing an unreviewed locale or mutable `next` as stable.

## Verification baseline

- Chromium runs the full deterministic suite under reduced motion.
- A separate Chromium project verifies intended normal-motion behavior.
- Firefox and WebKit run named smoke coverage rather than the complete Chromium suite.
- Automated checks cover a 200% reflow proxy, long-content stress, RTL stress and Forced Colors.
- Real browser zoom and screen-reader checks remain recorded manual evidence; automation MUST NOT be reported as a substitute.
- A consuming product MUST review at least one representative production workflow before it may claim verified KIN adoption. A design lab, component gallery, isolated control or Token comparison does not satisfy this requirement.

## Delivery decision

- KIN core remains contract-first.
- Figma delivery remains Variables interoperability; no published component library or remote ID synchronization is claimed.
- Runtime components remain project-owned. The private `@kin-design/react` laboratory is an optional pre-release migration surface, not a universal package or a completed adoption claim.
- Any future Figma Library or runtime package requires the ownership, versioning, adoption evidence, migration and rollback gates in `DELIVERY.md` and SHOULD be released separately.
- Adoption tooling records `initialized`, `mapped`, `verified` and `production-observed` evidence without running project commands or fabricating pass results.
- A `verified` claim requires a passed representative-workflow visual review in addition to structural, automated and manual evidence.

## Non-goals

- A universal React component framework.
- A clone of Linear or another proprietary product.
- An Agent product whose primary value is prompt delivery or code generation.
- Mandatory installation of every documented third-party library.
- A gallery of decorative themes or generated templates.
