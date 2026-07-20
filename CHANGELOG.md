# Changelog

All notable changes to KIN Design System are documented here.

The project follows semantic versioning for normative design documentation.

## Unreleased

### Public documentation and discovery

- Added the INT-02 Investigation and Evidence Review presentation with an entity-led, flat evidence chronology; separate occurrence, observation, source availability, verification, and finding semantics; URL-addressable scope and selection; and normal, loading, partial, conflict, stale, empty, pending, committed, undo, permission, and failed-record fixtures. Finding validation, retry, undo, draft preservation, and narrow evidence Drawer behavior remain deterministic local interactions with no live source, permission-service, durable-record, or production-adoption claim.
- Continued Scenario Atlas Phase 3 across five stable shared workflows plus intelligence investigation and risk review, information reading and revision history, commerce product editing, and engineering hierarchy scenarios. The Atlas now exposes 17 showcased scenarios and 58 independently checked local states while 13 entries remain visibly planned.
- Hardened the runnable references with an intermediate-width Commerce Drawer, stable risk-review history and focus containment, a cancelable upload interval, scoped fixture styling, working information and commerce destinations, and access-page title wrapping that avoids isolated Chinese characters or English words at the checked viewports.
- Completed Scenario Atlas Phase 2 with a public inspection lab for six showcased P0 scenarios, 14 independently checked local states, exact wide and narrow viewport fixtures, four theme and contrast modes, shareable URL state, preserved control focus, and explicit unresolved behavior without changing source maturity or adoption status.
- Accepted RFC 002 and added the Phase 1 Scenario Atlas: a machine-validated 30-scenario coverage map with six linked P0 references, 24 visibly planned entries, separate source-maturity and presentation labels, and an explicit non-adoption boundary.
- Reworked the English and Chinese README as a shorter public entry point with plain-language positioning, direct live links to the workspace, authentication pages and dialogs, Motion Lab, and Integration Lab, plus distinct paths for stable adoption, current development, contribution, and coding-tool use.
- Clarified the contract-first delivery boundary, product profiles, runtime-integration tiers, adoption evidence stages, and repository map without presenting component counts, a design lab, or a passing build as proof of production adoption.

### Contract lifecycle and repository integrity

- Accepted RFC 001 and implemented its repository-only Phase 1 Agent Distribution Layer: deterministic four-mode English and Chinese Snapshots, a non-self-referential Manifest, source and artifact checksums, strict local Schemas, truthful unreviewed-locale gates, validated staged replacement with best-effort backup restoration, and byte-for-byte drift validation without publishing `/next/` or creating stable aliases and Recipes early.
- Split release validation into a protected-branch-compatible pre-Tag gate and a strict post-Tag gate. The latter requires an annotated Tag on the exact release commit with matching tagged contract bytes, the Tag workflow requires that commit to be reachable from `main`, and Pages defers released-candidate deployment until the Tag gate succeeds.
- Advanced the working contract to KIN 3.0.0 development while preserving v2.3.0 as the latest immutable stable release; development adoption examples now pin a full commit whose DESIGN checksum is verified against Git history.
- Added machine-validated `release_status` and `latest_stable` fields, honest development badges and site copy, released/development Changelog rules, and tag-content verification that prevents a version label from pointing at a different contract.
- Gated GitHub Pages deployment on the complete validation workflow, pinned third-party Actions to exact commits, added CodeQL, dependency review, registry signature checks, Dependabot and a private-reporting security policy, and added React 18/19 SSR-to-hydration CI coverage.

### Contract and generated-artifact consistency

- Aligned every product-profile entry point on `information-site`, `intelligence-workspace`, `ecommerce-operations`, and `engineering-canvas`, and routed the external KIN Skill through the runtime integration catalog and private-package ownership contract when official adapters are in scope.
- Added the normative `micro` type style and complete Chinese-capable font stacks to machine-readable typography, then promoted the documented duration and easing values into generated DTCG, Tailwind-compatible CSS, and Figma Variables interoperability output.
- Corrected the registry summary to 65 stable, 6 candidate, and 6 draft components; standardized `Progress Indicator` as the canonical term; and removed stale release wording from the bilingual README and roadmap.
- Expanded repository validation instructions to include integration, runtime-package, and built-site checks, and corrected the four-file adoption initializer description.

### Reference-control and overlay completion

- Exposed the full sign-in page, in-context Authentication Dialog, and Session Re-authentication Dialog as separate bilingual showcase and Command Menu destinations; direct dialog links now open the requested reference, preserve focus behavior, and remove transient URL state on close.
- Replaced focus suppression in chart points, virtual lists, command input, and Motion Lab search with transparent forced-color fallbacks plus explicit `:focus-visible` or `:focus-within` boundaries; the Integration Lab now resolves browser theme color from the active canvas Token.
- Corrected the candidate audit so generated, test, coverage, and dependency directories remain excluded at nested workspace depths instead of only at the repository root.
- Completed the authentication references with an in-context Authentication Dialog, honest unavailable-provider messaging, deterministic full-page failure and recovery fixtures, stable password icons, and reversible Dialog motion with focus restoration.
- Added a complete Button and Icon Button reference matrix covering primary, secondary, ghost, destructive, busy, success, error, disabled, and accessible icon-only states.
- Standardized the runnable preference controls around Lucide language icons and Sun–track–Moon theme switches while keeping light, dark, and system choices available without first-render animation; language menus and the showcase Command surface now retain reversible exit states with Reduced Motion crossfades.
- Expanded the upstream Sonner reference with success, undo, loading-to-result, safe retry, six desktop placements, LTR/RTL behavior, and mobile safe-area handling without replacing Sonner's native stacking, swipe, or transition engine.
- Replaced abrupt Product Canvas panel visibility changes with retained, reversible right-edge and bottom-sheet transitions, shared scrim behavior, inert closing states, focus containment, rapid-reversal cleanup, and Reduced Motion crossfades.

### Frequency-aware motion and direct manipulation

- Added a normative motion-frequency and invocation contract so keyboard-priority paths are immediately usable while occasional pointer paths retain only justified feedback.
- Added KIN-owned motion terminology, responsive exit timing, grouped Tooltip sequencing, and a direct-manipulation contract covering intent thresholds, pointer capture, velocity projection, edge resistance, alternatives, and reduced motion.
- Expanded the Motion Lab with keyboard/pointer comparison, first-delay and continuous Tooltip browsing, a contained gesture Sheet, 4× slow review, and automated normal/reduced-motion checks; strengthened manual review requirements for first frames, repetition, reversal, and physical-device feel.

### Official runtime integrations

- Added the private pre-release `@kin-design/react` integration laboratory with isolated subpath exports for Sonner, cmdk, React Virtuoso, NumberFlow, dnd kit, input-otp, Liveline, and development-only Leva.
- Preserved official upstream animation, virtualization, drag, input, chart, notification, and control engines while adding KIN semantic APIs, Token styling, themes, accessibility boundaries, localization, bundle isolation, migration, and rollback contracts.
- Added a bilingual Integration Lab, machine-readable integration registry, package/SSR/bundle checks, and browser evidence for result/undo feedback, number continuity, command focus return, real DOM windowing, keyboard sorting, OTP input metadata, chart fallbacks, normal motion, and Reduced Motion.
- Preserved Liveline's native Reduced Motion path instead of mapping the preference to its separate paused-data state, so motion can reduce without hiding the chart's first useful frame.
- Corrected the Liveline adapter and showcase to honor its Unix-seconds time contract and use identical formatters for Canvas and data-table output.
- Added a normative, machine-validated upstream-preservation contract: official packages remain the runtime engines, mature motion and behavior are not reimplemented, and any override requires a recorded exception.
- Consolidated the existing showcase Sonner island onto `KinToaster` and `kinToast`, removing a second configuration path while preserving its lazy-loading boundary and public fixture API.
- Kept Number Transition, Drag and Drop, OTP, and Live Chart at `candidate`; runtime integration does not replace their remaining backend, manual accessibility, cross-input, recovery, or consuming-product evidence.

## 2.3.0 — 2026-07-14

### Scheduling workspace and contextual layout

- Added a candidate Scheduling Workspace page contract covering time semantics, period and URL state, schedule and agenda parity, conflicts, recurrence boundaries, non-drag alternatives, time zones, failure recovery, and narrow-screen behavior.
- Added the candidate Context Sidecar component and canonical terminology, distinguishing persistent task context from Inspector, Sidebar, Drawer, Popover, and generic AI chat.
- Strengthened Sidebar collapse choreography and container-aware density rules with reversible motion, stable labels and focus, layout-versioned persistence, and mobile alternatives.
- Added Serena as a third-party interaction observation with explicit exclusions for copied assets, hosted fonts, simulated AI, desktop-only rejection, and unsupported production claims.
- Added a bilingual deterministic scheduling reference and automated checks for themes, period and selected-item URL state, Sidebar collapse, Sidecar wide reflow, narrow modal adaptation, focus restoration, agenda presentation, and Reduced Motion.

### Interruptible motion and external-reference translation

- Added an explicit translation matrix for Boneyard, Reicon, Hiraki, Interfaces, Rico Bookmark Manager, and motion-gallery evidence so external references produce KIN-owned contracts, runnable evidence, and verification rather than copied aesthetics.
- Required stable icon slots for paired and asynchronous Button states, animated Menu closing phases that remain non-interactive until cleanup, and rapid-reversal safety for Menu and Drawer motion.
- Added a discoverable Motion Lab with Lucide-supported Menu actions, stable paired and async Button icons, updating Sonner tasks, animated Popover and Disclosure, and a reversible right-edge Drawer that adapts to a bottom Sheet on narrow screens; the primary workspace language and overflow menus now use the same interruptible surface contract.

### Project-level composition and Agent adoption gate

- Added a normative project-owned implementation brief so adopting Agents must resolve the real task, route/profile map, representative workflow, first meaningful view, dominant region, persistent context, Surface and density strategy, narrow-screen order, states, interactions, evidence, and rollback before page implementation.
- Removed the initializer's implicit information-site default; new adoptions must choose a product profile explicitly and may map different route families to different profiles for hybrid products.
- Strengthened adoption evidence with a nine-criterion visual-signature matrix and blocked `mapped` or `verified` claims when the brief, representative route, visual criteria, or human approval remains unresolved.
- Added profile-specific composition guidance to the information, intelligence, ecommerce, and engineering patterns, plus a progressive Agent Skill composition reference and checkpoint.

### Showcase discovery and interaction references

- Promoted sign-in, password visibility, contextual reauthentication, motion, Sonner task feedback, and overlay examples into the core component page and added direct English and Chinese showcase links so these references are discoverable from the component section.
- Replaced instant Inspector and Drawer visibility changes with directionally consistent, interruptible transitions, scrim feedback, focus containment, background inertness, scroll locking, focus restoration, and reduced-motion crossfades without changing their normative component status.
- Added normal-motion and reduced-motion browser checks for Inspector and Drawer travel, plus deterministic authentication and core feedback interaction coverage.

### Page contracts and reference flows

- Added a machine-readable page-family catalog with stable, candidate, draft, and deprecated maturity states plus a page-level Definition of Complete.
- Added normative contracts for authentication and access, resumable onboarding, settings and administration, and system recovery; documented search, workspace home, import, notifications, organization, and billing as explicit candidate or conditional page families rather than implying completion.
- Added Authentication Shell, Sign-in Form, Account Recovery Form, and Session Re-authentication Dialog to the stable component catalog while keeping Verification Challenge conditional and candidate until a real verification flow can support a runnable reference.
- Added bilingual, theme-aware reference pages for sign-in and account recovery, in-page reauthentication, resumable setup, settings and session management, and 401/403/404/offline/429/5xx recovery states.
- Added a page-catalog validator, CI coverage, and Playwright checks for keyboard focus, URL state, persistence, mobile touch targets, localization, theme changes, and contextual recovery.
- Added and promoted a bilingual Help and Support page contract and deterministic reference after a supplemental fintech-template review; covered help search and no results, local-only request validation, ticket history, status-source boundaries, themes, responsive behavior, and cross-browser smoke checks without adopting the template's styling or mock behavior.
- Completed and promoted the Search and Results page contract with a bilingual deterministic reference for shareable query, filter, sort and selected-result state; partial, stale, empty and service-error boundaries; keyboard traversal; responsive filters; browser history; and product-owned ranking, authorization and privacy checks.
- Strengthened Workspace Home personalization, actionable notification, and simulated/live-data boundaries.

## 2.2.0 — 2026-07-13

### Contract and component maturity

- Added a normative workspace-structure contract for Location Bar action priority, Toolbar grouping and keyboard behavior, and Split View resizing, persistence, and mobile fallback.
- Completed the File Upload contract and deterministic local fixture across validation, simulated transfer, cancellation, failure, retry, and completion while keeping real backend verification in the consuming product.
- Completed the Truncation contract and reference for end, middle, line-clamp, full-value access, localization, and mixed-direction content.
- Promoted Location Bar, Toolbar, File Upload, Split View, and Truncation to stable, bringing the catalog to 60 stable components while leaving optional package integrations conditional.

## 2.1.1 — 2026-07-13

### Fixed

- Made contract checksums stable across Windows and Unix checkouts by canonicalizing UTF-8 BOM and line endings before hashing.

## 2.1.0 — 2026-07-13

### Contract, components, and verification

- Harden adoption evidence with optional immutable contract revision/checksum records, checksum validation, truthful `mapped` stage requirements, and timestamps for completed automated checks.
- Defined the contract-first KIN delivery model and explicit Figma/runtime package gates; added machine-readable adoption evidence stages, mappings, verification, ownership, exceptions, and production observation; updated initialization and checking so unperformed work cannot be represented as verified.
- Added a normative verification and accessibility-evidence contract; separated reduced and normal motion projects; added Firefox and WebKit smoke coverage plus automated reflow-proxy, long-content, RTL, and Forced Colors checks without claiming that automation replaces real zoom or screen-reader review.
- Added normative AI assistance, review and approval, background work, and charts and analysis contracts; added a deterministic advanced-component reference with Composer stop/retry, Evidence List, Diff Review, Execution Preview, Media Review, durable task states, and a keyboard-accessible chart with semantic Table fallback; promoted 55 catalog components to stable.
- Added six normative core-component contracts for actions and selection, forms and entry, navigation and disclosure, data display, feedback and progress, and overlays; added a runnable reference and Playwright acceptance coverage, and promoted 47 catalog components to stable while keeping real-backend File Upload as a candidate.
- Added a normative component terminology dictionary and maturity catalog with machine-readable JSON, path validation, Agent routing, and CI enforcement.
- Added a normative micro-interaction contract for paired states, committed results, async progress, disclosures, input parity, feedback ownership, and reduced-motion fallbacks.
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
