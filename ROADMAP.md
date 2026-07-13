# Roadmap

The roadmap is directional. Items enter a release only after evidence, design review and maintenance ownership are clear.

## 1.0 — Documentation foundation

- Normative `DESIGN.md`.
- Source governance and component adapters.
- Contribution workflow and automated document validation.

## 1.1 — Executable contract

- Machine-readable tokens in `DESIGN.md` frontmatter.
- KIN Agent Skill with build, redesign, audit, and review routing.
- Theme-parity, reference, contrast, and contract validation.
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

- Information site with search, provenance, revision, and reading structure.
- Intelligence workspace for evidence, monitoring, risk, and investigation.
- Ecommerce operations workspace.
- Engineering/CAD canvas shell.
- AI-assisted review and approval embedded in the relevant product model.
- Distinct framework-free reference pages and automated checks.

## 2.0 — Design tooling

- Figma Variables create payload and DTCG/Tokens Studio interoperability guidance.
- Design audit CLI with source locations, severity, exceptions, and human-review output.
- Versioned adoption configuration, initialization, structural checks, and migration records for consuming products.

The Figma exporter deliberately does not manage credentials or update existing library IDs. The audit deliberately does not auto-fix heuristic findings. These boundaries prevent tooling convenience from becoming destructive product behavior.

## Next

- Test the 64 stable components, including authentication and access, workspace structure, file transfer states, full-value access, AI review, durable work, and accessible analysis contracts, against consuming projects before expanding optional variants.
- Test the stable access, onboarding, settings, recovery, Search and Results, and Help and Support page contracts in consuming products; build the remaining P1 references for Workspace Home, transfer, notifications/audit, and organization permissions only after product evidence confirms their shared boundaries.
- Gather adoption evidence from real consuming projects before expanding scanner rules.
- Add ID-aware Figma library synchronization only if an eligible team can test update and rollback behavior.
- Evaluate cross-platform screenshot baselines after font and renderer variance is measured.

## Verification baseline

- Chromium runs the full deterministic suite under reduced motion.
- A separate Chromium project verifies intended normal-motion behavior.
- Firefox and WebKit run named smoke coverage rather than the complete Chromium suite.
- Automated checks cover a 200% reflow proxy, long-content stress, RTL stress, and Forced Colors.
- Real browser zoom and screen-reader checks remain recorded manual evidence; automation MUST NOT be reported as a substitute.

## Delivery decision

- KIN core remains contract-first.
- Figma delivery remains Variables interoperability; no published component library or remote ID synchronization is claimed.
- Runtime components remain project-owned; the reference interfaces are not a universal package.
- Any future Figma Library or runtime package requires the ownership, versioning, adoption evidence, migration, and rollback gates in `DELIVERY.md` and SHOULD be released separately.
- Adoption tooling records `initialized`, `mapped`, `verified`, and `production-observed` evidence without running project commands or fabricating pass results.

## Non-goals

- A universal React component framework.
- A clone of Linear or another proprietary product.
- Mandatory installation of every documented third-party library.
- A gallery of decorative themes or AI-generated templates.
