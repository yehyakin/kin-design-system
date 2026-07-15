# Verification and accessibility evidence

Status: normative

KIN treats accessibility, responsive behavior, motion, and browser support as product behavior. A rendered screenshot is useful evidence, but it is not proof that an interface is accessible or production-ready.

This contract defines the minimum verification record for KIN components and product patterns. It supplements [`DESIGN.md`](../DESIGN.md), the component contracts in [`components/`](../components/), and the maturity rules in [`components/catalog.md`](../components/catalog.md).

## Evidence classes

Every verification result MUST be identified as one of the following:

| Evidence | What it can establish | What it cannot establish alone |
|---|---|---|
| Static validation | Required files, links, Tokens, catalog structure, and deterministic rules | Visual quality, interaction, or assistive-technology behavior |
| Automated browser test | Repeatable DOM, focus, input, state, viewport, media-query, and browser behavior | Complete usability, screen-reader comprehension, or visual judgment |
| Screenshot review | Layout, hierarchy, clipping, contrast treatment, and visible states in a named environment | Keyboard order, announcements, hidden semantics, or every responsive state |
| Manual interaction review | Real keyboard, touch, zoom, speech, and platform behavior | Broad regression coverage unless the procedure and environment are recorded |
| Consuming-product evidence | Integration behavior with real data, permissions, latency, errors, and content | Universal behavior in other products |

- A report MUST NOT describe an unperformed check as passed.
- A screenshot MUST NOT be presented as proof of screen-reader support.
- Automated accessibility checks MAY identify detectable failures but MUST NOT be described as complete WCAG conformance.
- A component MUST NOT become `stable` without the evidence required by [`components/catalog.md`](../components/catalog.md).

## Baseline automated matrix

Reference interfaces MUST run the following baseline where the environment supports it:

| Coverage | Minimum purpose |
|---|---|
| Chromium with reduced motion | Full deterministic component and product-pattern suite |
| Chromium with normal motion | Motion exists only where intended and does not replace state or content |
| Firefox smoke | Core navigation, focus, theme, layout, and advanced reference loading |
| WebKit smoke | Core navigation, focus, theme, layout, and advanced reference loading |
| Narrow viewport | Reflow, touch targets, overlay adaptation, and horizontal overflow |
| Higher contrast | KIN contrast preference preserves hierarchy and semantics |
| Forced Colors | Native controls, focus, selection, status, and boundaries remain identifiable |
| Long-content stress | Required actions and values remain available with expanded labels and content |
| RTL stress | Logical reading order, directional controls, and layout remain usable where RTL is supported |
| 200% reflow proxy | A viewport equivalent to the reduced CSS width at 200% zoom reflows without losing required functions |

The 200% reflow proxy is an automated approximation. A release that claims browser-zoom support MUST also include a real browser check at 200%.

Cross-browser smoke tests MAY be narrower than the Chromium suite. The scope MUST be named, and a passing smoke test MUST NOT be reported as complete browser parity.

## Motion verification

Normal-motion and reduced-motion behavior MUST be tested separately.

Under normal motion:

- feedback MUST begin from the current state;
- interactive transitions SHOULD use the KIN timing and easing rules;
- animation MUST NOT delay input, hide a committed result, or manufacture progress;
- continuous animation MUST have a task reason.
- high-frequency and keyboard-priority paths MUST be exercised repeatedly; surface availability and focus MUST not wait for entrance motion;
- rapid reversal MUST end in the latest requested state without stale timers, remounts or focus restoration from an older state.

Under reduced motion:

- state changes MUST remain understandable without movement;
- repeated, spatial, parallax, spring, counting, streaming-caret, and loader motion MUST be removed or reduced as specified by the component contract;
- content, status text, and final values MUST remain available;
- disabling animation MUST NOT disable the underlying action.

Theme, language, resize, remount, and virtualized-row changes MUST NOT replay value or completion animation as if new work occurred.

### Manual motion-craft review

Automated state tests do not establish motion quality. A release that changes motion Tokens, temporary surfaces, coordinated state transitions or gestures SHOULD include a recorded manual review that covers:

1. normal speed for perceived responsiveness and task interruption;
2. `4×` slow mode or browser animation playback at approximately 10–25% for first-frame response, transform origin and coordinated property timing;
3. frame-by-frame inspection when opacity, transform, color, clipping or multiple surfaces must land together;
4. repeated invocation for high-frequency paths, including keyboard open/close and adjacent Tooltip scanning;
5. `open → close → open` and inverse pressure tests;
6. normal and reduced-motion outcomes with the same final state and focus behavior.

Lab-only slow mode is review instrumentation. It MUST NOT become a production motion preference or Token.

## Zoom and reflow

Automated reflow checks MUST use a named viewport and MUST record that they are a proxy rather than browser zoom.

A manual 200% browser-zoom check MUST verify:

1. no required control is clipped or unreachable;
2. text does not overlap adjacent content;
3. overlays retain their title, body, and critical actions;
4. tables provide an equivalent path when all columns cannot fit;
5. sticky and fixed regions do not cover the focused element;
6. horizontal scrolling is limited to content that genuinely requires two dimensions;
7. focus remains visible while scrolling.

## Localization and RTL

Long-content stress tests MUST expand labels, values, dates, numbers, and helper text rather than testing headings alone.

- Controls MUST wrap, resize, or move to an overflow mechanism without hiding the primary action.
- Fixed widths MUST NOT be used only to fit one language.
- Truncation MUST follow the full-value access rules in the governing component contract.
- Icons with directional meaning MUST mirror in RTL; universal symbols MUST NOT be mirrored automatically.
- Data direction and UI direction MUST be considered separately. Timelines, axes, codes, URLs, and identifiers MAY retain their domain direction.
- RTL testing MUST include focus order and overlay placement, not only text alignment.

Products that do not support an RTL locale MUST record that boundary. They MUST NOT claim RTL support based only on a mirrored fixture.

## Forced Colors and contrast

Forced Colors verification MUST use the platform media query rather than simulating a high-contrast palette with ordinary CSS alone.

- Focus, selection, error, warning, current state, and disabled state MUST remain distinguishable.
- Meaning MUST NOT depend on background color, shadow, transparency, or a colored dot alone.
- Native control appearance SHOULD remain available unless a tested custom replacement is necessary.
- Essential icons and status marks MUST remain visible in system colors.
- Decorative surfaces MAY disappear; content and boundaries MUST remain.
- `forced-color-adjust: none` MUST be limited to elements whose authored color is essential and has been manually verified.

KIN's higher-contrast theme and platform Forced Colors are separate checks. Passing one does not imply passing the other.

## Screen-reader review

Every release that changes navigation, forms, overlays, live feedback, data tables, AI output, approval, or durable tasks SHOULD include a manual screen-reader pass in an environment supported by the consuming product.

The reviewer MUST record:

- operating system;
- browser;
- screen reader;
- input method;
- component or route;
- date and reviewer;
- findings, severity, and unresolved limitations.

The pass MUST verify, where applicable:

1. page title, landmarks, heading order, and current location;
2. accessible names, descriptions, values, errors, required state, and disabled state;
3. focus entry, reading order, focus containment, Escape behavior, and focus restoration;
4. menu, listbox, tree, tabs, grid, and dialog roles and state announcements;
5. status updates without duplicate, character-by-character, or excessively frequent announcements;
6. tables expose headers, scope, selection, sorting, and equivalent responsive access;
7. charts provide a useful summary and structured data alternative;
8. AI output separates generated content, evidence, uncertainty, actions, and completion state;
9. approval and execution controls announce what is selected, accepted, pending, or committed;
10. background tasks retain identity, state, progress, recovery, and result access.

A manual pass MUST record failures. It MUST NOT be reduced to a checked box with no environment or notes.

## Touch and device review

Automated target-size checks MUST cover visible interactive controls at narrow viewports. Manual touch review SHOULD additionally verify:

- scrolling does not start an unintended drag;
- long press does not hide the only action path;
- virtual keyboards do not cover the active field or primary action;
- bottom sheets and drawers respect safe areas;
- hover-only information has a focus and touch path;
- pointer precision is not required for sliders, charts, resize handles, or drag handles.

Gesture-driven controls additionally require a physical-device review when a release claims their feel or momentum quality. Record:

- device, operating system, browser and refresh-rate class where known;
- pointer or touch input used;
- grab-offset continuity, scroll arbitration and pointer capture;
- slow drag, quick flick, reversal, cancellation and boundary over-drag;
- velocity handoff, projected target and reduced-motion settle;
- non-gesture Close, keyboard and recovery alternatives.

Playwright MAY prove state, capture and cleanup. It MUST NOT be described as proof that gesture physics feel correct on hardware.

## Verification record

Each consuming product SHOULD maintain a dated record using this structure:

```md
## Verification record

- KIN version or commit:
- Product revision:
- Routes/components:
- Automated commands:
- Browsers and viewports:
- Theme and contrast modes:
- Normal/reduced motion:
- 200% browser zoom:
- Long-content locale:
- RTL locale or declared boundary:
- Forced Colors environment:
- Screen reader environment:
- Touch device/environment:
- Screenshot or trace artifacts:
- Findings and severity:
- Accepted limitations and owner:
- Rollback or follow-up:
```

The record MAY link to CI artifacts, issues, or audit reports. Links MUST identify immutable or dated evidence where possible.

## Reporting language

Use precise statements:

- “28 deterministic Chromium checks passed under reduced motion.”
- “Firefox and WebKit smoke routes loaded without console errors.”
- “Manual 200% zoom review completed on the named route and environment.”
- “Screen-reader behavior has not yet been manually reviewed.”

Do not write:

- “Fully accessible” based on screenshots or automated tests;
- “Cross-browser complete” after a smoke route;
- “RTL supported” after changing `dir` without testing content and interaction;
- “WCAG compliant” without a scoped conformance process and supporting evidence.

## Acceptance checklist

- Automated and manual evidence are labeled separately.
- Normal and reduced motion have distinct checks.
- Chromium regression and Firefox/WebKit smoke coverage are named.
- Narrow viewport, long content, RTL, contrast, Forced Colors, and reflow evidence are recorded where applicable.
- Required manual screen-reader and real browser-zoom work is not represented as automated.
- Screenshots and traces are review artifacts, not the sole accessibility evidence.
- Findings include owners and follow-up rather than being hidden to preserve a pass result.
