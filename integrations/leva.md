# Leva Development Adapter

## Decision

Development only. Leva may accelerate visual calibration but must never become the public settings UI.

## Suggested controls

- UI density and row height.
- Sidebar and Inspector width.
- Surface and hairline contrast.
- Base, accent and theme contrast preview.
- Motion scale and chart speed.
- Reduced motion, transparency and light/dark preview.

## Contract

- Dynamically import only in development or an explicitly protected internal build.
- Exclude all public production entry points.
- Do not store values in the business database.
- Do not let temporary tuning values bypass semantic Token review.
- Promote approved values into versioned KIN Token files, then remove experiment state.

## Verification

- Production bundle contains no accessible Leva panel.
- SSR and hydration remain stable.
- Tuning does not mutate real user preferences.

## Source

[Leva](https://github.com/pmndrs/leva)
