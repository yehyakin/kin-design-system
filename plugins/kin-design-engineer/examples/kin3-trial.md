# kin3.net independent repair trial

Date: 2026-07-20

Plugin: KIN Design Engineer `0.1.0`

Baseline target revision: kin3.net `bc96172ccb9e9a7c530aedc8090da9dc6ae10648`

Repaired target revision: kin3.net `e3c75a7`

Mode: audit, user-authorized repair, and verification

This second codebase tests whether the workflow generalizes beyond the AgentOS submission demo. kin3.net keeps its own editorial portfolio brand; KIN and Emil are used as interaction and verification contracts, not as a replacement aesthetic.

## Deterministic packets

The baseline collector used the authoritative KIN 3.0.0 checkout, scanned 18 frontend files, and returned 13 candidates. The repaired checkout scanned 19 frontend files and returned 12 candidates. The removed candidate was a confirmed decorative emoji; the remaining gradient, blur, and pill candidates were reviewed in their actual brand or semantic contexts rather than edited automatically.

The collector did not execute the site, call a model, access the network, or modify the target.

## Candidate review and repair

| Priority and evidence | Before | After | Why |
|---|---|---|---|
| P1 · production browser and new regression test | `vinext start` returned the document, but generated CSS and JavaScript assets returned 404 on Windows because filesystem-relative cache keys contained backslashes. | A version-pinned `patch-package` fix normalizes the Vinext static cache key to URL separators; the production asset test now requires HTML, CSS, and JavaScript responses to return 200. | A successful HTML response is not a working production build. The failure was confirmed in the browser and made reproducible in a test. |
| P2 · rendered mobile geometry | The home-page primary controls exposed roughly 40-pixel touch targets. | Navigation and primary action targets now use a 45-pixel minimum in both dimensions where applicable. | Rendered geometry—not the visual size of a wrapper—determines the usable target. |
| P2 · rendered inner routes | Several back, archive, about, and footer links measured roughly 24–30 pixels high. | Interactive text links now expose at least 45 pixels of height without changing the visual typography. | The repair improves touch access while preserving the site's dense editorial composition. |
| P2 · source plus Reduced Motion emulation | Fade-in, magnetic-pointer, marquee, and project-card motion did not all share an explicit user-preference boundary. | Framer Motion and pointer-driven effects now read `useReducedMotion`; the marquee holds a fixed composition and magnetic movement is disabled when reduction is requested. | Reduced Motion needs to affect JavaScript-driven movement as well as CSS transitions. |
| P3 · baseline `app/page.tsx` | A native emoji was used as interface decoration. | The decorative emoji was removed. | The product already has a coherent typographic and graphic language; the platform-dependent glyph added noise. |
| P2 · gradient, blur, and pill candidates | The scanner identified brand gradients, a temporary floating layer, and deliberately rounded action controls. | Preserved after source and rendered review. | These candidates express the existing visual identity or valid component semantics; a pattern match alone is not repair authority. |

## Changed files

- `app/globals.css`
- `app/page.tsx`
- `package.json` and `package-lock.json`
- `patches/vinext+0.0.50.patch`
- `tests/production-assets.test.mjs`
- `README.md`

## Verification evidence

- Clean detached worktree at `e3c75a7`: `npm ci` applied the pinned Vinext patch successfully.
- `npm test`: 4/4 passing, including the production HTML/CSS/JavaScript asset regression.
- `npm run lint`: zero errors; seven retained `<img>` warnings correspond to intentional third-party portfolio assets.
- `npm audit --omit=dev`: zero reported production vulnerabilities.
- `npm audit --audit-level=high`: passing; six low/moderate findings remain in development-only lint or migration tooling.
- Chromium production review at `390 × 844`: `/`, `/about`, `/projects`, `/blog`, and `/blog/ai-product-moat` had no horizontal overflow, failed images, or visible interactive target below 44 pixels.
- Keyboard review: first Tab exposed the skip link and the inspected focus style resolved to a visible two-pixel solid outline.
- Reduced Motion emulation: the media query matched, marquee position stayed fixed, project cards did not transform, and pointer movement did not move the magnetic wrapper.
- Fine-pointer hover: the primary contact action still produced its deliberate lift and brightness response.
- Repaired deterministic packet: 19 files and 12 reviewed P2 candidates.

The clean-worktree checks ran on Node.js 22.12.0 while the repository declares Node.js 22.13 or newer. All named checks passed, but this environment warning is retained rather than treated as version-conformance evidence.

## Not verified

- Firefox, WebKit, screen-reader output, real device touch physics, zoom/reflow, performance budgets, deployment, external asset availability, and user adoption were not tested.
- The seven external-image lint warnings were reviewed but not converted to framework image components in this bounded repair.
- The remaining development dependency advisories were not removed because their upstream fixes require major or unavailable dependency changes; production dependencies audit cleanly.

## Rollback

```bash
git revert e3c75a7
```

## Result

The independent trial confirms that the workflow can preserve a visually distinct product while finding failures outside the original scanner list. The strongest result—the Windows production asset failure—came from combining model-led source inspection, a real browser, and a permanent regression test rather than treating the static packet as a score.
