# RFC 004 - Present-first Showcase

Status: accepted
Decision scope: public Showcase presentation hierarchy and inspection-mode defaults
Normative effect: none; this RFC changes the non-normative public presentation layer only
Implementation status: local review candidate
Accountable owner: [@yehyakin](https://github.com/yehyakin)
Audited base: `006c45a3a8dd09a9b62e701c23f917fba18aac0f`

## 1. Decision

The public Showcase will make a runnable product reference the dominant first-view region. Catalog maturity, source boundaries, verification detail, and known gaps remain available, but move behind secondary disclosure or lower-page inspection surfaces.

This decision refines RFC 003 Section 6. It does not change canonical catalogs, maturity, release status, runtime-package status, production-adoption claims, or the evidence required by `principles/verification.md`.

## 2. Presentation hierarchy

### Home

The first view MUST contain:

- one short statement;
- one sentence of context;
- one primary action;
- one dominant, real product reference;
- three representative Scenario choices;
- a quiet link to Scenario Lab.

Source, poster, reference, verification, and catalog details MUST remain reachable without competing with the product reference.

### Components

The first view MUST present eight selected Components through one real reference stage. The complete catalog remains available through a secondary disclosure. The catalog MUST NOT be the first meaningful view.

### Component Explorer

The first view MUST prioritize:

- the Component name and one-sentence user job;
- one large runnable reference;
- honest state, appearance, and viewport controls;
- local navigation between the selected Components.

Usage, state coverage, accessibility, contracts, checks, gaps, and source boundaries remain available below the stage. Unsupported states MUST NOT be fabricated for the sake of a control.

### Patterns

Each of the four product Patterns MUST show a real, catalog-backed reference. A neutral structural blueprint MUST NOT substitute for the product surface.

### Scenario Lab

Scenario Lab adds two explicit presentation modes:

- `present`: the product reference owns attention and inspection controls are closed;
- `inspect`: the complete control and evidence surface is available.

The default is `present`. The mode is shareable in the URL and may be remembered as a local preference. The reference MUST retain a useful loading surface until runtime verification completes.

## 3. Interaction requirements

- Poster and live reference appearance MUST remain visually continuous.
- Loading MUST NOT expose a blank frame.
- Embedded references MUST avoid unnecessary nested browser chrome and visible scrollbar competition.
- Mode, panel, tab, and stage transitions MUST be interruptible and MUST reduce to a short opacity change under Reduced Motion.
- Keyboard focus and return behavior MUST remain explicit.
- Existing Scenario, state, viewport, theme, and browser-history behavior MUST remain compatible.

## 4. Evidence boundary

This RFC authorizes a presentation redesign. It does not establish:

- production adoption by another product;
- physical-device review;
- real screen-reader completion;
- a new Component or Page maturity;
- a new Figma or runtime-package delivery claim.

The local review candidate MUST pass the repository validation commands and receive visual review before merge or deployment.

## 5. Rollback

The implementation remains isolated to the public Showcase source, generators, Lab presentation state, tests, and this RFC. Reverting the implementation MUST NOT require a catalog, Token, runtime-package, Agent Distribution, or release rollback.
