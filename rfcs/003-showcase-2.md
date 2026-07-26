# RFC 003 - Showcase 2.0

Status: accepted
Decision scope: public showcase composition, discovery routes, and inspection entry points
Normative effect: none; accepted decisions become normative only when incorporated into governing contracts
Implementation status: implemented
Accountable owner: [@yehyakin](https://github.com/yehyakin)
Audited base: `4efb996cbffe8c8411400dbe722e8daae2d153ba`
Implementation revision: `7616b5f9a87eff6a412427f446566ea39c93e5b0`
Verification revision: `a4e39f060bb8898a19c9967408fd81bf6fce4bc2`

Normative terms describe the required implementation of this accepted proposal. Acceptance authorizes phased implementation, but does not change component maturity, page maturity, adoption evidence, runtime-package maturity, Figma delivery, or release status.

Production verification completed on 2026-07-26:

- [GitHub Pages deployment](https://github.com/yehyakin/kin-design-system/actions/runs/30198324196) completed build, deployment, deployed-Showcase verification, and deployed-Agent verification successfully.
- The production verifier checked 31 Showcase responses and 17 exact Agent responses at [yehyakin.github.io/kin-design-system](https://yehyakin.github.io/kin-design-system/).
- Chromium, Firefox, and WebKit reference checks passed in CI before deployment.
- This evidence does not claim a real screen-reader session, physical touch-device review, or production adoption by another product.

## 1. Decision

KIN will separate four public jobs that are currently compressed into one documentation page:

1. **Showcase** demonstrates complete, runnable workflows.
2. **Discovery** helps readers find canonical Components, Patterns, and Scenarios.
3. **Inspection** exposes deterministic state, viewport, appearance, and reference evidence.
4. **Documentation** preserves the complete contract, adoption, delivery, and verification entry points.

The first meaningful view of the root page MUST contain a real, catalog-backed workflow before governance or implementation explanation. The root page MUST NOT become a generic marketing landing page, a dashboard card wall, or a component gallery.

## 2. Composition checkpoint

```text
KIN composition checkpoint
Mode: redesign-overhaul
Primary profile: information-site
Route/profile map: root discovery -> information-site; scenario and component inspection -> information-site with embedded product-workspace references
Representative workflow: a reader opens the public site, identifies a real KIN workflow, inspects its state and evidence, then continues to the Scenario Atlas, Lab, or governing documentation
First meaningful view: one catalog-backed workflow preview with its user job and evidence boundary
Dominant region: the workflow preview
Persistent context: resolved language, theme, contrast, selected Scenario, state, viewport, and source maturity
Surface and density strategy: continuous editorial sections around one bounded product surface; aligned rows instead of equal cards
Narrow-screen priority: identity -> action -> preview entry -> source boundary -> related workflows
Required states and interactions: preview inactive/active/fallback, keyboard entry and exit, theme and language switching, legacy hash forwarding, reduced motion, narrow navigation, Lab state restoration
Prohibited substitutions: fabricated metrics, copied Scenario DOM, decorative dashboard cards, unsupported component controls, fake AI behavior, copied external assets
Evidence and rollback: equivalent baseline/candidate screenshots; explicit route manifest; generated-output validation; revert the Showcase commit without changing canonical catalogs or Agent Distribution
```

## 3. Audited evidence

At the recorded base:

- the public site is a static multi-page output with build-time React integration islands, not a React SPA;
- the English and Chinese roots combine documentation, component links, patterns, Agent guidance, and reference discovery in one long page;
- the Scenario Atlas and Lab already provide catalog-backed routes and deterministic references;
- the Lab already persists `scenario`, `state`, `viewport`, and appearance query state and restores valid state after refresh;
- Pages publication uses an explicit source and generated-output allowlist;
- the same Pages build also publishes the Agent Distribution Layer;
- `main` contains 17 showcased Scenarios and 13 planned Scenarios; INT-02 is showcased with 11 checked states.

Implementation MUST use a clean worktree from the audited base or a later explicitly recorded `origin/main` SHA.

## 4. Public information architecture

| Route | Job | Source boundary | Compatibility |
|---|---|---|---|
| `/` | English Showcase | catalog-backed selection plus public copy | replaces the current root composition |
| `/zh/` | Chinese Showcase | same structure and evidence as English | replaces the current Chinese root composition |
| `/docs/` | English documentation overview | migrated current root content | preserves every meaningful documentation destination |
| `/zh/docs/` | Chinese documentation overview | migrated current Chinese content | preserves equivalent destinations or names an explicit exception |
| `/components/` | English Component discovery | Component catalog plus reference locators | does not replace the canonical catalog |
| `/zh/components/` | Chinese Component discovery | same machine facts, localized explanatory copy | maturity and references remain identical |
| `/components/<id>/` | bounded Component Explorer | stable canonical component plus runnable reference | first release contains eight stable components |
| `/patterns/` | English Pattern discovery | four Pattern documents joined to Page and Scenario catalogs | does not create a fifth product profile |
| `/zh/patterns/` | Chinese Pattern discovery | same machine facts, localized explanatory copy | identical evidence boundary |
| `/scenarios/` | Scenario Atlas | existing RFC 002 implementation | preserved and refined only where evidence exists |
| `/scenarios/lab.html` | canonical Scenario Lab | existing implementation | preserved |
| `/lab/` | friendly Lab alias | canonical Lab implementation contract | contains canonical metadata and no second state engine |

Existing reference, Token, Scenario catalog/schema, Agent Distribution, manifest, version, and stable-alias paths MUST remain available.

## 5. Legacy URL and state contract

Static hosting cannot rely on server redirects. The implementation MUST preserve or explicitly forward:

- current root hashes, including `#overview`, `#principles`, `#foundations`, `#components`, `#patterns`, `#ai-contract`, `#agents`, `#resources`, and `#flows`;
- current Command Menu destinations;
- existing `/examples/**`, `/scenarios/**`, `/tokens/**`, and Agent Distribution paths;
- Scenario Lab query keys and valid values.

Root documentation hashes SHOULD forward to the corresponding Documentation hash while leaving a useful no-JavaScript Documentation route visible in the first viewport.

The language control MUST preserve the equivalent route and useful context. It MUST NOT send every nested English route to `/zh/`, or every Chinese route to `/`.

## 6. Showcase composition

The public header contains KIN identity; Showcase, Components, Patterns, Scenarios, Lab, Documentation, route-aware language selection, appearance and contrast controls, and GitHub.

The first meaningful view contains:

- a plain-language statement of what KIN provides;
- one primary action to inspect Scenarios;
- one secondary action to read Documentation;
- one real workflow preview selected from the Scenario catalog;
- visible source maturity, presentation status, and reference boundary;
- an explicit “Enter interactive preview” action;
- an “Open in Lab” action that remains available when embedding fails.

The preview begins inert. It becomes keyboard-focusable and interactive only after an explicit action. `Escape` exits the embedded preview and returns focus to the trigger. Narrow screens MAY open the canonical reference or Lab instead of embedding the complete workflow.

Catalog counts form one continuous evidence strip. Appearance support is expressed as named modes, not as a quality count.

The first implementation ships only complete sections:

- one representative workflow;
- a compact task-led Scenario entry list;
- Evidence List, Suggested Change Review, Execution Preview, and Background Task Queue as canonical interaction components;
- a compact system-evidence table;
- direct Documentation and GitHub destinations.

Additional featured workflows remain absent until their reference, poster, source boundary, and narrow behavior are complete.

## 7. Component discovery

The Component discovery page is a non-normative view over the canonical catalog. Its first eight Explorers are App Shell, Evidence List, Suggested Change Review, Execution Preview, Background Task Queue, Command Menu, Authentication Dialog, and Data Table.

Every Explorer exposes canonical ID and name, maturity, user job, one authoritative reference locator, the inspected state, governing state-contract locators, contract and test locators, accessibility boundary, and known gaps.

A rendered applicable-state inventory is deferred until KIN has a canonical machine-readable state source. The Showcase MUST NOT duplicate state names in display configuration or infer completeness from one fixture. Until that source exists, every Explorer MUST label the limitation and link both the shared state contract and its component-specific contracts.

Explorer configuration MAY record display order, localized copy, and deep reference locators. It MUST NOT duplicate maturity, reference availability, contract text, tests, or runtime-package availability.

The QA State Matrix, Component Explorer, canonical catalog, and component contract remain separate evidence surfaces.

## 8. Pattern discovery

Pattern discovery contains exactly Information Site, Intelligence Workspace, Ecommerce Operations, and Engineering Canvas.

Each entry joins its Pattern document, applicable Page-family catalog record, one showcased Scenario, primary user job, first meaningful view, dominant region, persistent context, prohibited substitutions, and governing contract.

Pattern documents do not have independent machine maturity. The UI MUST NOT label a Pattern itself `stable` by borrowing a Page or Scenario maturity value.

## 9. Scenario Atlas and Lab

Existing URL persistence, valid-value restoration, deterministic assertions, same-origin reference checks, focus-preserving controls, and appearance modes MUST be preserved.

Lab refinement is limited to confirmed gaps:

- browser-history semantics for meaningful user state changes;
- Inspector collapse;
- Fit and 100% controls;
- bounded fullscreen;
- reduced nested scrolling;
- narrow-screen controls;
- explicit return to Scenario detail;
- focus restoration between shell and reference;
- reversible spatial motion and Reduced Motion parity.

The implementation MUST NOT replace the current Lab with a simplified copy.

## 10. Presentation assets

Posters are presentation evidence, not component maturity, accessibility, cross-browser, or production-adoption evidence.

Every poster record includes source commit, Scenario ID, state, viewport, appearance, source reference URL, dimensions, and localized alt text. Cross-platform byte-identical screenshots are not required. Updating a poster requires an intentional reviewed asset change; tests MUST NOT rewrite approved screenshots automatically.

## 11. Motion and input

- Keyboard-priority Command Menu invocation is immediately usable.
- Drawers and Inspectors use reversible transitions from their spatial origin.
- UI motion remains under 300 ms and uses KIN motion Tokens.
- Motion remains interruptible during rapid open-close-open sequences.
- Focus is available without waiting for animation completion.
- Reduced Motion removes spatial travel while preserving state feedback and final-state parity.
- Hover-only effects are gated to hover-capable fine pointers.
- Page-load choreography, looping ornament, glow, and automated carousels are prohibited.

Manual review includes normal speed, 4x slow playback, rapid reversal, keyboard invocation, touch-sized controls, and normal/reduced final-state comparison.

## 12. Build and publication boundary

The public shell remains static and framework-free. Existing build-time React integration islands remain allowed. Showcase 2.0 adds no client dependency and no SPA router.

Implementation updates:

- `scripts/build-site.mjs` when a bundled entry is required;
- `scripts/lib/site-artifacts.mjs` for every copied or generated public artifact;
- `scripts/validate-site.mjs` for route, language, title, canonical, local-link, fragment, catalog, and output validation;
- `site/sitemap.xml`;
- relevant Playwright specifications;
- output/tooling tests protecting the allowlist and Agent Distribution.

The build remains network-free. Generated page data belongs only in `.site-dist/`. Validation MUST NOT rewrite tracked source.

## 13. Localization

English and Simplified Chinese pages share one structural model and machine facts. The implementation MUST choose one explicit localization method and validate parity for route chrome, explanatory copy, catalog facts, links, and evidence boundaries.

Scenario Atlas and Lab remain English-first in this RFC. Their language limitation MUST be stated rather than hidden. Showcase, Documentation, Component discovery, Component Explorer chrome, and Pattern discovery require English and Simplified Chinese parity.

Seven of the eight first-release Component Explorer fixtures, plus the Information Site, Ecommerce Operations, and Engineering Canvas reference fixtures, remain Chinese-only at the audited base. This is an explicit reference-language exception, not localized runtime-reference parity. Explorer and Pattern routes MUST expose the actual fixture language before entry, MUST NOT silently relabel a Chinese fixture as English, and MUST NOT manufacture translated overlays that diverge from the canonical reference. App Shell and INT-02 remain the localized reference cases in this release.

Closing this exception requires changing and verifying the canonical reference itself, including its deterministic state, keyboard, responsive, and accessibility evidence. The discovery layer alone cannot close the gap.

## 14. Verification and evidence

Use a clean install and repository-owned commands:

```powershell
npm ci
npx playwright install chromium firefox webkit
npm run validate
npm run test:tooling
npm run runtime:check
npm run site:check
npm run test:reference
```

Final Playwright verification MUST use a freshly built server rather than a reused process on port `4173`.

Inspect English and Chinese Showcase at 1440x900 and 390x844 in Light and Dark; Documentation; Component discovery and one Explorer; Pattern discovery; Atlas; canonical Lab and alias; 404; normal and Reduced Motion; keyboard and narrow navigation; and preview inactive, active, fallback, and focus return.

Completion has three distinct states:

1. local checks and rendered review passed;
2. required GitHub CI passed for the exact commit merged to `main`;
3. GitHub Pages deployed that exact commit and live routes were observed.

A local build MUST NOT be reported as production evidence.

## 15. Delivery sequence

1. Record the clean base SHA, routes, anchors, catalogs, screenshots, and performance method.
2. Add this RFC, the public route manifest, and build validation before visual replacement.
3. Move the existing documentation composition to the Documentation routes without dropping destinations.
4. Implement the root Showcase with one complete representative workflow.
5. Implement Component and Pattern discovery from canonical machine facts.
6. Add the eight bounded Component Explorers.
7. Refine only confirmed Atlas and Lab gaps.
8. Run deterministic, visual, motion, responsive, and accessibility checks.
9. Submit for CI; merging to `main` also authorizes automatic Pages deployment.
10. Verify the deployed commit and public routes before marking this RFC implemented.

## 16. Rollback

Showcase source, discovery configuration, generated-page builder, and route allowlist changes remain isolated from canonical catalogs, contracts, runtime adapters, and Agent Distribution generation.

Rollback consists of reverting the Showcase implementation commits and rebuilding Pages. Canonical catalog, Token, Scenario, and Agent artifacts MUST NOT require data migration or manual restoration.
