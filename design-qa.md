# Design QA — Entity workspace hierarchy and material depth

## Visual truth

- Source: `C:/Users/a/AppData/Local/Temp/codex-clipboard-063e9c28-d21b-4b73-a913-baaf5caad654.png`
- Scope: dark product-workspace hierarchy and restrained material depth, not Linear branding, copy, icons, fonts, or proprietary assets
- KIN reference: `examples/workspace-reference/index.html?lang=en`
- Governed viewport: 1180 × 760 CSS pixels at 1× density
- Source pixels: 3708 × 1240 composite supplied by the user; its Linear region is a direction reference rather than an equal-viewport geometry baseline
- Implementation pixels: 1180 × 760 at device scale 1; the local lighting comparison normalizes the source region to 760px height only for material-depth review
- State: Entity database, dark theme, Inspector visible, Context Thread open

## Evidence

- Before: `reviews/visual-parity/kin-before-1440x900.png`
- After: `reviews/visual-parity/kin-after-1180x760.png`
- Lighting baseline: `reviews/visual-parity/kin-before-lighting-1180x664.png` (captured before the governed 760px viewport was restored)
- Lighting pass 1: `reviews/visual-parity/kin-after-lighting-pass1-1180x760.png`
- Lighting final: `reviews/visual-parity/kin-after-lighting-1180x760.png`
- Light-theme check: `reviews/visual-parity/kin-after-lighting-light-1180x760.png`
- Narrow dark check: `reviews/visual-parity/kin-after-lighting-mobile-dark-375x812.png`
- Narrow Thread check: `reviews/visual-parity/kin-after-lighting-mobile-thread-dark-375x812.png`
- Same-input comparison (local QA only; not a repository asset): `C:/Users/a/AppData/Local/Temp/kin-linear-final-comparison.png`
- Lighting comparison (local QA only; not a repository asset): `C:/Users/a/AppData/Local/Temp/kin-linear-lighting-comparison.png`
- Public loading poster: `site/assets/posters/int-01-normal-dark.png`
- Focused-region evidence was not needed for this pass because the actionable differences were visible across the full Shell, adjacent surface boundaries, Activity rows, and Context Thread. Typography, copy, icons, and product geometry were already covered by the prior same-viewport hierarchy pass.

## Iteration record

1. Separated canvas, Sidebar, Workspace, Inspector, floating Thread, nested card, and composer into a restrained surface ladder.
2. Removed the repeated object description, shortened the remaining summary, and moved Activity into the first reading viewport.
3. Rebalanced responsive Sidebar and Inspector widths so the Workspace remains the dominant plane at the governed showcase width.
4. Lowered and shortened the Context Thread to preserve visible status metadata; compacted its internal rhythm so result, source-change card, and composer remain legible together.
5. Reduced equal-weight activity treatment, strengthened selected navigation and metadata contrast, and replaced dark-only literal colors with paired light/dark semantic aliases.
6. Re-captured the poster from the same 1180 × 760 live state used for visual review.
7. Added a restrained material-lighting layer with separate edge-light, contact-shadow, shell-ambient, and floating-surface roles. Removed the doubled Workspace/Inspector divider after the first lighting pass, then rechecked the final dark, light, and narrow-screen states.

## QA result

- P0: none observed.
- P1: none observed in the scoped hierarchy comparison.
- P2: none observed after dark, light, 375 × 812, command-menu keyboard, Context Thread open/close, focus-return, and material-depth checks.
- Intentional differences: KIN-owned content, identity, domain semantics, and icon choices remain independent from Linear.

Final result: passed
