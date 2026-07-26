# 006 — Make Scenario Lab controls spatial and reversible

- **Status**: IMPLEMENTED · DEVICE REVIEW PENDING
- **Commit**: 4efb996
- **Severity**: HIGH
- **Category**: Physicality, interruptibility, and missed opportunity
- **Estimated scope**: 4 files, medium interaction state machine

## Problem

Scenario Lab exposes a persistent 336px control column and a fixed-size scrollable frame. The control column has no collapse path, the preview has no Fit or 100% control, narrow screens place all controls above a 720px preview, and meaningful selection changes always replace the current history entry.

```css
/* site/assets/site.css:618 — current */
.lab-shell {
  display: grid;
  grid-template-columns: 336px minmax(0, 1fr);
  min-height: calc(100vh - 58px);
}

.lab-controls {
  position: sticky;
  top: 0;
  max-height: calc(100vh - 58px);
  overflow-y: auto;
}
```

```css
/* site/assets/site.css:894 — current */
@media (max-width: 780px) {
  .lab-shell { display: block; min-height: 0; }
  .lab-controls {
    position: static;
    max-height: none;
    overflow: visible;
  }
  .lab-preview { min-height: 720px; }
}
```

```js
/* site/assets/scenario-lab.js:114 — current */
function writeUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  url.searchParams.set("scenario", current.scenario);
  url.searchParams.set("state", current.state);
  url.searchParams.set("viewport", current.viewport);
  url.searchParams.set("theme", current.theme);
  history.replaceState(null, "", url.pathname + url.search);
}
```

The result is a hard transition between shell and reference rather than an inspection tool with a clear spatial model. On narrow screens, reaching the preview requires scrolling through the complete control document and creates multiple scroll owners.

## Target

Add one reversible Scenario Lab control surface and one preview sizing model:

- Wide screens begin with the Inspector open. Close animates the Inspector toward the left edge, then releases its grid track. Reopen restores the track before animating from the current visual state.
- Narrow screens begin with the controls closed. They open as a left-edge Drawer above a scrim; focus moves into the Drawer, remains contained, and returns to the trigger on close.
- `Fit` scales the deterministic reference to the available stage without changing the configured Scenario viewport.
- `100%` restores the catalog viewport at one CSS pixel per reference pixel.
- Fullscreen applies to the Lab preview, not the whole page, and the control reflects actual Fullscreen API state.
- Meaningful user selection changes push a history entry. Initialization and internal normalization replace the current entry. `popstate` restores a legal catalog-backed state without writing another entry.

Use these exact motion values:

```css
--lab-panel-duration: 240ms;
--lab-panel-exit-duration: 180ms;
--lab-panel-ease: cubic-bezier(0.32, 0.72, 0, 1);
--lab-panel-exit-ease: cubic-bezier(0.23, 1, 0.32, 1);
```

The control panel uses `transform: translateX(-16px)` and `opacity: 0` during wide close, and `transform: translateX(-100%)` during narrow Drawer close. Do not use `scale(0)`, `ease-in`, `transition: all`, decorative bounce, or keyframes.

Reduced Motion keeps an 80ms opacity crossfade, removes panel travel and preview scaling animation, and preserves the same focus, inert, history, fullscreen, and final layout state.

## Repo conventions to follow

- `examples/workspace-reference/reference.js:784-835` contains KIN's interruptible Inspector open/closing/closed state machine, stale-timer cancellation, inert handling, modal role switching, and focus return.
- `examples/workspace-reference/styles.css:159-170` keeps the grid track until exit motion completes and releases it only in the closed state.
- Current Scenario selection, reference verification, valid-value fallback, theme synchronization, and query serialization remain authoritative in `site/assets/scenario-lab.js`.
- Existing page colors and focus styles come from `site/assets/site.css`; this plan does not create new semantic design Tokens.

## Steps

1. In `site/scenarios/lab.html`, add:
   - one controls trigger in the top bar with `aria-controls` and `aria-expanded`;
   - a close button inside the controls surface;
   - a controls scrim;
   - `Fit`, `100%`, and Fullscreen buttons in the preview bar;
   - a sizing wrapper around the existing frame shell;
   - stable status text announcing preview scale changes.
2. In `site/assets/scenario-lab.js`, extend the element map and add one cancelable controls state machine modeled on the existing workspace Inspector. Preserve and restore the actual trigger, update `inert`, add the dialog role only in narrow overlay mode, support scrim and `Escape`, and cancel stale close timers during rapid open-close-open.
3. Add roving focus or a small explicit focus trap for the narrow control Drawer. The frame and preview MUST be inert only while the modal Drawer is open. Closing restores focus to the trigger.
4. Add a preview sizing state with `fit` and `actual`. Fit computes:

   ```js
   Math.min(
     1,
     (stage.clientWidth - horizontalPadding) / frameWidth,
     (stage.clientHeight - verticalPadding) / frameHeight
   )
   ```

   Apply the visual scale directly to the frame shell and set explicit scaled width and height on its wrapper so scroll extents match the rendered result. Recompute Fit through `ResizeObserver`; 100% remains stable.
5. Add Fullscreen API handling for the preview section. Disable the action when `requestFullscreen` is unavailable. Synchronize label and pressed state from `fullscreenchange`.
6. Refactor URL writing into explicit `push` and `replace` modes. User-driven Scenario, state, viewport, and theme changes use `pushState`; initialization, invalid-value normalization, and internal appearance synchronization use `replaceState`.
7. Add a `popstate` handler that resolves the same catalog-valid state as initialization, updates controls and the reference, and does not create another history entry.
8. In `site/assets/site.css`, add the wide Inspector close/open, narrow Drawer/scrim, preview toolbar, scaled-frame wrapper, Fullscreen, pointer, and Reduced Motion rules. Motion only begins after a ready-state attribute is present.
9. In `tests/visual/scenario-lab.spec.js`, cover:
   - wide open → close → open and rapid reversal;
   - narrow Drawer open/close, inert state, focus containment, Escape and return;
   - Fit and 100% scale/readout;
   - Fullscreen feature availability without manufacturing success when the browser disallows it;
   - Back/Forward restoration for Scenario, state, viewport, and theme;
   - equivalent normal and Reduced Motion final states.

## Boundaries

- Do NOT simplify or replace catalog loading, same-origin matching, deterministic assertions, mutation settling, inspection revision cancellation, or appearance synchronization.
- Do NOT create a second Lab controller for `/lab/`.
- Do NOT add a dependency or use Leva.
- Do NOT invent new Scenario states, query keys, reference paths, or maturity values.
- Do NOT update screenshot baselines merely to silence a visual failure.
- Do NOT make physical touch, screen-reader, real browser-zoom, or full cross-browser claims from automated checks.
- If the current source differs materially from commit `4efb996`, stop and report drift instead of improvising.

## Verification

- **Mechanical**:
  - `npm run validate`
  - `npm run site:check`
  - `npx playwright test tests/visual/scenario-lab.spec.js --project=chromium-reduced --project=chromium-normal-motion`
  - `npm run test:reference:smoke`
- **Feel check**:
  - At 1440×900, trigger open → close → open quickly. The panel retargets without disappearing from a stale timer, exits toward the owning edge, and the preview becomes usable without a frozen intermediate state.
  - At 390×844, controls arrive from the left edge, background focus is unavailable, `Escape` closes the Drawer, and focus returns to the exact trigger.
  - Compare Fit and 100%. Fit changes only presentation scale; the readout and configured Scenario viewport remain honest.
  - Use DevTools 4× slowdown. The first close frame responds immediately, the transform origin and owning edge remain clear, and no page-level choreography appears.
  - Emulate Reduced Motion. Spatial travel is removed, the 80ms opacity feedback remains, and focus/history/final layout match normal motion.
- **Done when**: the source, automated checks, normal and Reduced Motion rendered states, and local route queries agree, and the original deterministic inspection behavior remains intact.
