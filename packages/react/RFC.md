# KIN React integration package RFC

Status: pre-release implementation proposal

This document records the isolated `@kin-design/react` delivery surface required by the runtime-package gate in [`../../DELIVERY.md`](../../DELIVERY.md). The package integrates official upstream libraries directly. KIN does not vendor, fork, or recreate their animation and behavior engines.

The package is currently `private: true`. It is runnable evidence and a migration target for reviewed React products, not a public stable release or a claim that KIN has become a universal React system.

## 1. Ownership and support

| Responsibility | Owner |
|---|---|
| Product and contract decisions | KIN repository owner |
| Package API and release notes | KIN React maintainers |
| Dependency, license, and security review | KIN release reviewer |
| Product data, permissions, backend, analytics, and recovery | Consuming-product owner |
| Representative-workflow verification | Consuming-product design and engineering owners |

Pre-release support is best effort. Breaking changes before `1.0.0` MUST include a migration note. A production consumer MUST pin both the KIN repository revision and the exact package version.

## 2. Scope and commitments

- Framework: React 18.2 or React 19.
- Rendering: ESM subpath exports. Server rendering is supported only for adapters covered by the package SSR smoke test; browser-owned behavior begins after hydration.
- Styling: one optional CSS entry bound to KIN semantic Tokens. The package MUST NOT introduce a second theme system.
- Browsers: the same named modern-browser matrix used by KIN reference interfaces. Smoke coverage MUST NOT be reported as complete parity.
- Accessibility: each adapter inherits the applicable KIN component contract and preserves upstream keyboard or assistive behavior unless a recorded KIN correction is required.
- Localization: adapters accept product-owned labels. KIN MUST NOT ship embedded product copy as the only option.
- RTL: upstream direction support is preserved where available. Full RTL support remains unclaimed until the required manual and automated evidence exists.

The package does not provide an App Shell, application state, routing, authentication backend, data fetching, persistence, authorization, analytics, or product workflows.

## 3. Public API and catalog mapping

Stable-contract adapters:

| Export | Upstream engine | KIN contract |
|---|---|---|
| `@kin-design/react/sonner` | `sonner` | Toast |
| `@kin-design/react/cmdk` | `cmdk` | Command Menu |
| `@kin-design/react/virtuoso` | `react-virtuoso` | Data Row, Activity Feed, and long-list behavior |

Candidate KIN components remain explicitly experimental even when their upstream libraries are mature:

| Export | Upstream engine | KIN candidate |
|---|---|---|
| `@kin-design/react/experimental/number-flow` | `@number-flow/react` | Number Transition |
| `@kin-design/react/experimental/dnd-kit` | `@dnd-kit/*` | Drag and Drop |
| `@kin-design/react/experimental/input-otp` | `input-otp` | OTP |
| `@kin-design/react/experimental/liveline` | `liveline` | Live Chart |

Development-only export:

| Export | Upstream engine | Boundary |
|---|---|---|
| `@kin-design/react/dev/leva` | `leva` | Development tuning only; MUST NOT be loaded by a production entry |

The package root exports status and shared types only. It MUST remain free of optional integration engines so consumers pay only for imported subpaths.

## 4. What is preserved and what KIN owns

The following upstream behavior MUST remain upstream-owned:

- Sonner stacking, promise updates, dismissal, swipe, and toast motion;
- NumberFlow glyph interpolation and animation lifecycle;
- cmdk composition, filtering, selection, and focus mechanics;
- React Virtuoso measurement, virtualization, and scroll positioning;
- dnd kit sensors, collision detection, keyboard coordinates, Drag Overlay, and drop motion;
- input-otp paste, autofill, focus, and hidden-input behavior;
- Liveline Canvas interpolation and continuous plotting;
- Leva control state and panel behavior.

The adapter MUST use the official package as the runtime engine. When the official visual result already satisfies KIN, it SHOULD remain unchanged. Otherwise the adapter MAY bind KIN Tokens through public class, property, theme, or composition APIs. It MUST NOT replace the package's motion curves, duration logic, gestures, focus mechanics, measurement, or state engine with a lookalike implementation unless the exception process below is satisfied.

KIN owns:

- canonical component semantics and allowed use;
- product-facing labels, error, recovery, and evidence boundaries;
- semantic Token binding, themes, density, optical alignment, and responsive placement;
- native Reduced Motion behavior where the upstream engine exposes it;
- package subpaths, TypeScript adapters, tests, migration notes, and rollback;
- bounded defaults that remove effects forbidden by KIN, such as decorative chart particles or false first-load counting.

KIN MUST NOT copy upstream source into this repository by default. A necessary upstream change SHOULD be proposed upstream first; a local override requires a reproduced conflict, decision record, tests, owner, migration note, rollback, and removal condition.

## 5. Versioning and deprecation

- Package versions follow SemVer independently from the KIN contract version.
- Before `1.0.0`, breaking changes require a changelog entry and migration instructions.
- After `1.0.0`, an API marked deprecated MUST remain for at least one minor release unless a security issue requires earlier removal.
- Upstream dependency upgrades MUST be exact, reviewed individually, and accompanied by runtime, visual, accessibility, and bundle checks relevant to the integration.
- Candidate exports MUST NOT move out of `experimental` until their KIN catalog entries are `stable`.

## 6. Verification contract

The package test surface MUST cover:

- type checking and ESM export resolution;
- server-render smoke for adapters that claim SSR-safe output;
- subpath tree-shaking and dependency isolation;
- Sonner result, undo, promise update, dismissal, and motion evidence;
- NumberFlow first-render suppression, genuine-value transition, theme stability, and Reduced Motion;
- cmdk pointer and keyboard open, focus, filtering, selection, and focus restoration;
- Virtuoso real DOM windowing, stable key behavior, keyboard selection, and scroll positioning;
- dnd kit pointer or keyboard reorder, localized announcements, cancellation, focus restoration, and Reduced Motion outcome;
- input-otp paste, autofill metadata, validation linkage, and no fake backend claim;
- Liveline Canvas rendering, theme update without data reset, upstream Reduced Motion behavior, summary, and table fallback;
- Liveline Unix-seconds input and matching Canvas/table value and time formatting;
- Leva bundle isolation from all production subpaths.

Automated tests do not prove screen-reader quality, touch physics, browser zoom, or complete cross-browser parity. Those claims require the manual records defined in [`../../principles/verification.md`](../../principles/verification.md).

## 7. Dependency, bundle, and security policy

- Dependencies MUST use exact versions in the package manifest and lockfile.
- Official package and license sources MUST be reviewed before adoption and each release upgrade.
- The package root and every subpath MUST be independently bundle-inspected.
- Leva MUST be absent from root, stable, and experimental production bundles unless `/dev/leva` is imported explicitly.
- A dependency with a security advisory, unmaintained critical path, or unacceptable bundle cost MUST be disabled, replaced, or kept project-owned with a recorded decision.
- `npm audit` is one evidence source and MUST NOT replace manual supply-chain review.

Current reviewed versions and evidence paths are recorded in [`../../integrations/catalog.json`](../../integrations/catalog.json).

## 8. Migration and rollback

Adoption sequence:

1. pin the KIN revision and package version;
2. map the local component and its states to the KIN catalog;
3. install only the required official dependency subpaths;
4. import `@kin-design/react/styles.css` once after product Token definitions;
5. replace one project adapter behind its existing feature flag or component boundary;
6. compare real light, dark, narrow, keyboard, Reduced Motion, loading, error, and recovery states;
7. record bundle and representative-workflow evidence;
8. remove the previous adapter only after rollback is proven.

Rollback MUST be possible by restoring the prior project-owned component and removing the KIN subpath import. A consuming project MUST NOT couple backend schema or public API changes to this UI migration.

## 9. Consuming-product evidence

Promotion requires two materially different products. The intended evidence pair is:

- 52.mk or another information/intelligence product;
- DD AI OS or another ecommerce-operations product.

Neither product is counted until it records a real representative workflow, exact revisions, bundle result, accessibility evidence, migration, owner, and rollback. Repository showcase fixtures are not consuming-product evidence.

## 10. Promotion decision

The package remains private and pre-release until all ten runtime gates in `DELIVERY.md` pass. At that point maintainers must choose one of three explicit outcomes:

1. publish a supported package with named owners and release automation;
2. retain it as an internal integration laboratory;
3. remove it and return to project-owned adapters if that remains lower cost.

No package name, demo, or successful build is itself approval to publish.
