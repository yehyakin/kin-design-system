# Brand Motion

Brand motion is an optional identity layer, not application navigation or loading feedback.

## Pixel2Motion candidate

[Pixel2Motion](https://github.com/nolangz/pixel2motion) may be evaluated after the product shell, accessibility and performance are stable.

## Allowed

- First-run brand reveal.
- About page.
- PWA launch asset.
- Promotional video or social material.

## Forbidden

- Every route transition.
- Sidebar logo looping.
- Loading indicators.
- Blocking access to application content.
- Replaying on every visit.

## Contract

- Requires an approved original KIN brand asset.
- Provide dark, light, monochrome and static variants.
- Target 700–1000ms.
- At most once for an eligible first experience; user can skip.
- Reduced motion displays the static asset immediately.
- Do not introduce glow, scan lines or network nodes merely to imply intelligence.
- Measure startup and bundle cost before shipping.

## Adoption decision

The design-system repository documents behavior only. Generated assets and tool code belong in a separate brand-assets package after license and output-rights review.
