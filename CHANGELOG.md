# Changelog

All notable changes to KIN Design System are documented here.

The project follows semantic versioning for normative design documentation.

## Unreleased

- Added a normative preference-control contract for Lucide-compatible icons, light/dark switches, retained system preference, and icon-triggered language menus.
- Updated the workspace reference with the Lucide icon adapter, lazy Sonner feedback, a light/dark switch, and an icon-based English/Chinese language menu.
- Expanded the workspace reference with Sonner success, error, undo, and loading-to-complete patterns plus press, toggle, pending, and completion button motion.

### Added

- Added a bilingual, theme-aware KIN showcase site with live foundations, component states, product patterns, Agent guidance, and versioned resources.
- Added a dependency-free static build, local server, link validation, Playwright coverage, and GitHub Pages deployment workflow.
- Added Lucide as the reference monochrome icon adapter and applied it to the showcase navigation and controls.
- Added a lazy-loaded Sonner interaction island for user-initiated save, copy, undo, and feedback demonstrations.

### Changed

- Replaced the segmented theme selector with an accessible light/dark switch while preserving system mode through the command menu.
- Replaced text-only language links with an icon-triggered language menu.

## 2.0.0 — 2026-07-12

### Changed

- Advanced the contract to KIN 2.0 with design-tool interoperability and a versioned consuming-project contract.
- Added release-version consistency checks and corrected mobile reference touch targets to the 44px contract.
- Removed decorative navigation glyphs and misleading disclosure symbols from reference interfaces.
- Darkened the light-theme muted text Token and expanded contrast validation so informative metadata meets the 4.5:1 baseline.
- Added cross-tab synchronization for theme and contrast preferences with automated coverage.
- Replaced the mobile Inspector removal with an accessible bottom drawer and focus-restoration behavior.
- Preserved provenance and selected-product operational details in the mobile information and ecommerce references.
- Added an accessible mobile property drawer for engineering selections and generated-change review.
- Reduced static-audit noise by consolidating same-line matches and recognizing required browser theme-color plumbing.
- Made missing pinned contracts and Token integration files blocking adoption-check errors instead of advisory warnings.
- Restricted the local reference server to the `examples/` tree and hardened malformed/path-traversal requests.
- Added a release runbook covering validation, CI, immutable tags, repository settings, and rollback.
- Upgraded the design contract to KIN 1.1 with DESIGN.md alpha-format metadata and machine-readable color, typography, spacing, radius, and component tokens.
- Advanced the contract to KIN 1.2 with generated interoperability output and normative component-state coverage.
- Advanced the contract to KIN 1.3 with high-contrast references and automated interface-state coverage.
- Advanced the contract to KIN 1.4 with task-specific product patterns instead of one universal workspace template.
- Recalibrated the dark accent hover value to preserve WCAG AA contrast with its defined button text.
- Moved executable Agent routing and contract checks earlier in the roadmap.

### Added

- Added a create-only Figma Variables REST payload with light, dark, and high-contrast color modes, scale variables, and flattened typography primitives.
- Added a documented DTCG-to-Tokens Studio path without making the plugin a project dependency.
- Added a read-only candidate audit CLI with severity, source locations, JSON output, reviewed exceptions, and explicit human-verification limits.
- Added adoption initialization, configuration schema, structural checks, migration records, and automated tooling tests.
- Added generated Figma payload integrity checks for unique IDs, references, value types, and color channels.
- Added release validation for the adoption Schema and example configuration.
- Locked the Google DESIGN.md exporter in `package-lock.json` instead of downloading it through an ad-hoc `npx` invocation.
- Added the `kin-design` Agent Skill with progressive build, redesign, audit, review, and product-register references.
- Added design-contract validation for required token groups, references, theme parity, and baseline contrast.
- Added the design validator to repository instructions, contribution checks, pull requests, and CI.
- Added reproducible Tailwind CSS and DTCG token exports with drift checking.
- Added state, interaction, accessibility, and acceptance matrices for core KIN components.
- Added a framework-free responsive workspace fixture with light, dark, and system themes.
- Added high-contrast light and dark reference Tokens without changing business-status semantics.
- Added a state reference for data rows, forms, empty/error/stale feedback, Command Menu, and dialog focus behavior.
- Added Playwright checks for responsive layout, theme persistence, high contrast, Inspector focus restoration, form states, and Command Menu focus.
- Added CI screenshot artifacts for visual review without platform-sensitive pixel gating.
- Added Git-based Token change reports.
- Added normative information-site, intelligence-workspace, ecommerce-operations, and engineering-canvas patterns.
- Added distinct information, ecommerce, and engineering reference interfaces alongside the intelligence workspace.
- Extended Playwright coverage to reading/provenance, money/inventory/approval, tool/object selection, units, revisions, and generated-change review.

### Documentation

- Reframed the README for a general audience, expanded the supported interface scenarios, and added separate paths for designers, engineers, teams, independent makers, and coding tools.
- Added a complete Simplified Chinese README and translation maintenance rules.

## 1.0.0 — 2026-07-12

### Added

- Normative KIN design contract.
- Light, dark and system theme guidance.
- Workspace, AI interaction, accessibility, motion and Anti-Slop contracts.
- Intelligence, ecommerce and engineering product extensions.
- Reference governance for public design sources.
- Adapters for cmdk, React Virtuoso, Sonner, NumberFlow, Liveline, dnd kit, input-otp and Leva.
- Boundaries for brand motion and long-task loaders.
- Repository governance, contribution guidance and Agent instructions.
- Dependency-free documentation validation and GitHub workflow.
- Issue and pull-request templates.
