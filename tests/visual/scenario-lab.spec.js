import { expect, test } from "@playwright/test";

const browserErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  const errors = [];
  browserErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push("console: " + message.text());
  });
  page.on("pageerror", (error) => errors.push("pageerror: " + error.message));
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

async function expectVerified(page) {
  const verification = page.locator("[data-lab-verification]");
  await expect(verification).toHaveAttribute("data-state", "pass");
  await expect(verification).toHaveText("Verified local fixture");
}

async function expectControl(frame, control) {
  const target = frame.locator(control.assertion.selector);
  if (control.assertion.kind === "visible") {
    await expect(target).toBeVisible();
  } else if (control.assertion.kind === "attribute") {
    await expect(target).toHaveAttribute(control.assertion.attribute, control.assertion.value);
  } else if (control.assertion.kind === "text") {
    await expect(target).toContainText(control.assertion.value);
  }
}

async function expectHistoryState(page, expected) {
  await expect(page.locator("[data-lab-scenario]")).toHaveValue(expected.scenario);
  await expect(page.locator("[data-lab-state]")).toHaveValue(expected.state);
  await expect(page.locator(`[data-lab-viewport="${expected.viewport}"]`)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(`[data-lab-theme="${expected.theme}"]`)).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => {
    const params = new URL(page.url()).searchParams;
    return {
      scenario: params.get("scenario"),
      state: params.get("state"),
      viewport: params.get("viewport"),
      theme: params.get("theme"),
      mode: params.get("mode")
    };
  }).toEqual(expected);
  await expectVerified(page);
}

async function traverseHistory(page, direction) {
  const previousUrl = page.url();
  await page.evaluate((method) => window.history[method](), direction);
  await expect.poll(() => page.url()).not.toBe(previousUrl);
}

test("Present is the default and explicit mode changes replace history and persist", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark");
  await expectVerified(page);

  const root = page.locator("[data-scenario-lab]");
  const controls = page.locator("[data-lab-controls]");
  const present = page.locator('[data-lab-mode="present"]');
  const inspect = page.locator('[data-lab-mode="inspect"]');
  const preview = page.locator("[data-lab-preview]");
  const frame = page.locator("[data-lab-frame]");
  const initialHistoryLength = await page.evaluate(() => history.length);

  await expect(root).toHaveAttribute("data-mode", "present");
  await expect(root).toHaveAttribute("data-controls-state", "closed");
  await expect(present).toHaveAttribute("aria-pressed", "true");
  await expect(inspect).toHaveAttribute("aria-pressed", "false");
  expect(await controls.evaluate((element) => element.inert)).toBe(true);
  expect(await preview.evaluate((element) => element.inert)).toBe(false);
  expect(await frame.evaluate((element) => element.inert)).toBe(false);
  expect(new URL(page.url()).searchParams.get("mode")).toBe("present");
  expect(await page.evaluate(() => localStorage.getItem("kin-showcase-lab-mode"))).toBe("present");

  await inspect.click();
  await expect(root).toHaveAttribute("data-mode", "inspect");
  await expect(root).toHaveAttribute("data-controls-state", "open");
  await expect(inspect).toHaveAttribute("aria-pressed", "true");
  expect(new URL(page.url()).searchParams.get("mode")).toBe("inspect");
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength);
  expect(await page.evaluate(() => localStorage.getItem("kin-showcase-lab-mode"))).toBe("inspect");

  await present.click();
  await expect(root).toHaveAttribute("data-mode", "present");
  await expect(root).toHaveAttribute("data-controls-state", "closed");
  expect(new URL(page.url()).searchParams.get("mode")).toBe("present");
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength);
  expect(await page.evaluate(() => localStorage.getItem("kin-showcase-lab-mode"))).toBe("present");
});

test("a valid URL mode overrides local storage and a missing mode uses the stored fallback", async ({ page }) => {
  await page.addInitScript(() => {
    if (window === window.top) localStorage.setItem("kin-showcase-lab-mode", "inspect");
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark");
  await expectVerified(page);

  const root = page.locator("[data-scenario-lab]");
  await expect(root).toHaveAttribute("data-mode", "inspect");
  await expect(root).toHaveAttribute("data-controls-state", "open");
  expect(new URL(page.url()).searchParams.get("mode")).toBe("inspect");

  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark&mode=present");
  await expectVerified(page);
  await expect(root).toHaveAttribute("data-mode", "present");
  await expect(root).toHaveAttribute("data-controls-state", "closed");
  expect(await page.evaluate(() => localStorage.getItem("kin-showcase-lab-mode"))).toBe("present");
});

test("INT-02 keeps its governed poster over an inert frame until live selector verification passes", async ({ page }) => {
  let releaseReference;
  const referenceReleased = new Promise((resolve) => {
    releaseReference = resolve;
  });
  let interceptedReference;
  const referenceIntercepted = new Promise((resolve) => {
    interceptedReference = resolve;
  });

  await page.route("**/examples/workspace-reference/index.html?*", async (route) => {
    if (!route.request().url().includes("view=investigation")) {
      await route.continue();
      return;
    }
    interceptedReference();
    await referenceReleased;
    await route.continue();
  });

  await page.goto(
    "/scenarios/lab.html?scenario=INT-02&state=normal&viewport=wide&theme=dark&mode=present",
    { waitUntil: "domcontentloaded" }
  );
  await referenceIntercepted;

  const placeholder = page.locator("[data-lab-frame-placeholder]");
  const poster = page.locator("[data-lab-frame-poster]");
  const frame = page.locator("[data-lab-frame]");
  await expect(placeholder).toHaveAttribute("data-kind", "poster");
  await expect(placeholder).toBeVisible();
  await expect(poster).toBeVisible();
  await expect(page.locator("[data-lab-frame-poster-note]")).toContainText("Presentation poster only");
  await expect(page.locator("[data-lab-frame-loading-label]")).toContainText("Attributable evidence chronology");
  expect(await frame.evaluate((element) => element.inert)).toBe(true);
  await expect(frame).toHaveAttribute("aria-hidden", "true");

  releaseReference();
  await expectVerified(page);
  await expect(placeholder).toBeHidden();
  expect(await frame.evaluate((element) => element.inert)).toBe(false);
  await expect(frame).toHaveAttribute("aria-hidden", "false");
});

test("wide Inspect controls close to Present, reopen, and reverse without stale cleanup", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark&mode=inspect");
  await expectVerified(page);

  const root = page.locator("[data-scenario-lab]");
  const controls = page.locator("[data-lab-controls]");
  const trigger = page.locator("[data-lab-controls-trigger]");
  const close = page.locator("[data-lab-controls-close]");
  const preview = page.locator("[data-lab-preview]");

  await expect(root).toHaveAttribute("data-controls-state", "open");
  await expect(root).toHaveAttribute("data-mode", "inspect");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toHaveAttribute("aria-pressed", "true");
  expect(await controls.evaluate((element) => element.inert)).toBe(false);
  expect(await preview.evaluate((element) => element.inert)).toBe(false);
  await expect(controls).toHaveCSS("transition-property", "transform, opacity");
  await expect(controls).toHaveCSS("transition-duration", "0.24s, 0.24s");

  const closing = await close.evaluate((element) => {
    element.click();
    const labRoot = document.querySelector("[data-scenario-lab]");
    const style = getComputedStyle(document.querySelector("[data-lab-controls]"));
    return {
      state: labRoot.dataset.controlsState,
      duration: style.transitionDuration,
      timing: style.transitionTimingFunction
    };
  });
  expect(closing).toEqual({
    state: "closing",
    duration: "0.18s, 0.18s",
    timing: "cubic-bezier(0.23, 1, 0.32, 1), cubic-bezier(0.23, 1, 0.32, 1)"
  });
  await expect(trigger).toBeFocused();
  await expect(root).toHaveAttribute("data-controls-state", "closed");
  await expect(root).toHaveAttribute("data-mode", "present");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator('[data-lab-mode="present"]')).toHaveAttribute("aria-pressed", "true");
  expect(await controls.evaluate((element) => element.inert)).toBe(true);

  await trigger.click();
  await expect(root).toHaveAttribute("data-controls-state", "open");
  await expect(root).toHaveAttribute("data-mode", "inspect");
  await expect(controls).toHaveCSS("transition-duration", "0.24s, 0.24s");

  await close.evaluate((element) => element.click());
  await expect(root).toHaveAttribute("data-controls-state", "closing");
  await trigger.evaluate((element) => element.click());
  await expect(root).toHaveAttribute("data-controls-state", "open");
  await expect(root).toHaveAttribute("data-mode", "inspect");
  await page.waitForTimeout(260);
  await expect(root).toHaveAttribute("data-controls-state", "open");
  await expect(controls).toBeVisible();
  expect(await controls.evaluate((element) => element.inert)).toBe(false);
  expect(await preview.evaluate((element) => element.inert)).toBe(false);
});

test("narrow controls are a modal left Drawer with containment and exact focus return", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/scenarios/lab.html?scenario=WORK-01&state=conflict&viewport=narrow&theme=dark&mode=present");
  await expectVerified(page);

  const root = page.locator("[data-scenario-lab]");
  const controls = page.locator("[data-lab-controls]");
  const trigger = page.locator("[data-lab-controls-trigger]");
  const close = page.locator("[data-lab-controls-close]");
  const scrim = page.locator("[data-lab-controls-scrim]");
  const preview = page.locator("[data-lab-preview]");
  const frame = page.locator("[data-lab-frame]");

  await expect(root).toHaveAttribute("data-controls-state", "closed");
  await expect(root).toHaveAttribute("data-mode", "present");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(controls).toHaveAttribute("role", "dialog");
  await expect(controls).toHaveAttribute("aria-modal", "true");
  expect(await controls.evaluate((element) => element.inert)).toBe(true);
  expect(await preview.evaluate((element) => element.inert)).toBe(false);
  expect(await frame.evaluate((element) => element.inert)).toBe(false);

  await trigger.click();
  await expect(root).toHaveAttribute("data-controls-state", "open");
  await expect(root).toHaveAttribute("data-mode", "inspect");
  await expect(close).toBeFocused();
  expect(await controls.evaluate((element) => element.inert)).toBe(false);
  expect(await preview.evaluate((element) => element.inert)).toBe(true);
  expect(await frame.evaluate((element) => element.inert)).toBe(true);

  await page.keyboard.press("Shift+Tab");
  expect(await controls.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(root).toHaveAttribute("data-mode", "present");
  expect(await preview.evaluate((element) => element.inert)).toBe(false);
  expect(await frame.evaluate((element) => element.inert)).toBe(false);
  await expect(root).toHaveAttribute("data-controls-state", "closed");

  await trigger.click();
  await expect(close).toBeFocused();
  await scrim.click({ position: { x: 380, y: 300 } });
  await expect(trigger).toBeFocused();
  await expect(root).toHaveAttribute("data-mode", "present");
  await expect(root).toHaveAttribute("data-controls-state", "closed");
});

test("Fit scales the wrapper honestly while 100% preserves the configured viewport", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark&mode=inspect");
  await expectVerified(page);

  const sizing = page.locator("[data-lab-frame-sizing]");
  const shell = page.locator("[data-lab-frame-shell]");
  const frame = page.locator("[data-lab-frame]");
  const fit = page.locator('[data-lab-sizing="fit"]');
  const actual = page.locator('[data-lab-sizing="actual"]');

  await expect(fit).toHaveAttribute("aria-pressed", "true");
  const fitted = await page.evaluate(() => {
    const stage = document.querySelector("[data-lab-stage]");
    const wrapper = document.querySelector("[data-lab-frame-sizing]");
    const frameShell = document.querySelector("[data-lab-frame-shell]");
    const style = getComputedStyle(stage);
    const horizontalPadding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const verticalPadding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const expected = Math.min(
      1,
      (stage.clientWidth - horizontalPadding) / frameShell.offsetWidth,
      (stage.clientHeight - verticalPadding) / frameShell.offsetHeight
    );
    return {
      scale: Number(wrapper.dataset.scale),
      expected,
      wrapperWidth: wrapper.getBoundingClientRect().width,
      wrapperHeight: wrapper.getBoundingClientRect().height,
      shellWidth: frameShell.offsetWidth,
      shellHeight: frameShell.offsetHeight
    };
  });
  expect(fitted.scale).toBeCloseTo(fitted.expected, 5);
  // Chromium quantizes transformed layout to 1/64 CSS px.
  expect(Math.abs(fitted.wrapperWidth - fitted.shellWidth * fitted.scale)).toBeLessThanOrEqual(0.02);
  expect(Math.abs(fitted.wrapperHeight - fitted.shellHeight * fitted.scale)).toBeLessThanOrEqual(0.02);
  expect(fitted.scale).toBeLessThanOrEqual(1);

  await actual.click();
  await expect(actual).toHaveAttribute("aria-pressed", "true");
  await expect(sizing).toHaveAttribute("data-scale", "1");
  await expect(page.locator("[data-lab-scale-readout]")).toHaveText("100%");
  await expect(page.locator("[data-lab-viewport-readout]")).toHaveText("Wide / 1180 px");
  await expect(page.locator("[data-lab-scale-status]")).toContainText("Configured viewport remains 1180 by 760 pixels");
  await expect.poll(() => frame.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(1180);

  await fit.click();
  await expect(fit).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => sizing.getAttribute("data-scale")).not.toBe("1");

  await page.locator("[data-lab-controls-close]").click();
  await expect(page.locator("[data-scenario-lab]")).toHaveAttribute("data-controls-state", "closed");
  await expect(page.locator("[data-scenario-lab]")).toHaveAttribute("data-mode", "present");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const stage = document.querySelector("[data-lab-stage]");
        const wrapper = document.querySelector("[data-lab-frame-sizing]");
        const frameShell = document.querySelector("[data-lab-frame-shell]");
        const style = getComputedStyle(stage);
        const expected = Math.min(
          1,
          (stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)) / frameShell.offsetWidth,
          (stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)) / frameShell.offsetHeight
        );
        return Math.abs(Number(wrapper.dataset.scale) - expected);
      }),
    )
    .toBeLessThan(0.00001);
  await expect(shell).toHaveCSS("transform-origin", "0px 0px");
});

test("Fullscreen availability and pressed state follow the browser API", async ({ page }) => {
  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark");
  await expectVerified(page);
  const fullscreen = page.locator("[data-lab-fullscreen]");
  const available = await page.evaluate(() => {
    const preview = document.querySelector("[data-lab-preview]");
    return typeof preview.requestFullscreen === "function"
      && typeof document.exitFullscreen === "function"
      && document.fullscreenEnabled !== false;
  });
  expect(await fullscreen.isEnabled()).toBe(available);

  if (available) {
    await fullscreen.click();
    await page.waitForTimeout(100);
    const active = await page.evaluate(() => document.fullscreenElement === document.querySelector("[data-lab-preview]"));
    await expect(fullscreen).toHaveAttribute("aria-pressed", String(active));
    await expect(fullscreen).toHaveText(active ? "Exit fullscreen" : "Fullscreen");
    if (active) {
      await fullscreen.click();
      await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBe(null);
      await expect(fullscreen).toHaveAttribute("aria-pressed", "false");
    }
  } else {
    await expect(fullscreen).toBeDisabled();
    await expect(fullscreen).toHaveAttribute("aria-pressed", "false");
  }
});

test("Fullscreen action disables when requestFullscreen is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      value: undefined
    });
  });
  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark");
  await expectVerified(page);
  await expect(page.locator("[data-lab-fullscreen]")).toBeDisabled();
  await expect(page.locator("[data-lab-fullscreen]")).toHaveAttribute("aria-pressed", "false");
});

test("Back and Forward restore mode with every catalog-backed selection field", async ({ page }) => {
  await page.setViewportSize({ width: 1500, height: 940 });
  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark&mode=present");
  await expectHistoryState(page, { scenario: "INT-01", state: "normal", viewport: "wide", theme: "dark", mode: "present" });
  const initialHistoryLength = await page.evaluate(() => window.history.length);

  await page.locator('[data-lab-mode="inspect"]').click();
  await expectHistoryState(page, { scenario: "INT-01", state: "normal", viewport: "wide", theme: "dark", mode: "inspect" });
  expect(await page.evaluate(() => window.history.length)).toBe(initialHistoryLength);
  await page.locator("[data-lab-scenario]").selectOption("CORE-05");
  await expectHistoryState(page, { scenario: "CORE-05", state: "recovery", viewport: "wide", theme: "dark", mode: "inspect" });
  await page.locator("[data-lab-state]").selectOption("conflict");
  await expectHistoryState(page, { scenario: "CORE-05", state: "conflict", viewport: "wide", theme: "dark", mode: "inspect" });
  await page.locator('[data-lab-viewport="narrow"]').click();
  await expectHistoryState(page, { scenario: "CORE-05", state: "conflict", viewport: "narrow", theme: "dark", mode: "inspect" });
  await page.locator('[data-lab-theme="light-high-contrast"]').click();
  await expectHistoryState(page, { scenario: "CORE-05", state: "conflict", viewport: "narrow", theme: "light-high-contrast", mode: "inspect" });
  await page.locator('[data-lab-mode="present"]').click();
  await expectHistoryState(page, { scenario: "CORE-05", state: "conflict", viewport: "narrow", theme: "light-high-contrast", mode: "present" });
  expect(await page.evaluate(() => window.history.length)).toBe(initialHistoryLength + 4);

  await traverseHistory(page, "back");
  await expectHistoryState(page, { scenario: "CORE-05", state: "conflict", viewport: "narrow", theme: "dark", mode: "inspect" });
  await traverseHistory(page, "back");
  await expectHistoryState(page, { scenario: "CORE-05", state: "conflict", viewport: "wide", theme: "dark", mode: "inspect" });
  await traverseHistory(page, "back");
  await expectHistoryState(page, { scenario: "CORE-05", state: "recovery", viewport: "wide", theme: "dark", mode: "inspect" });
  await traverseHistory(page, "back");
  await expectHistoryState(page, { scenario: "INT-01", state: "normal", viewport: "wide", theme: "dark", mode: "inspect" });

  await traverseHistory(page, "forward");
  await expectHistoryState(page, { scenario: "CORE-05", state: "recovery", viewport: "wide", theme: "dark", mode: "inspect" });
  await traverseHistory(page, "forward");
  await expectHistoryState(page, { scenario: "CORE-05", state: "conflict", viewport: "wide", theme: "dark", mode: "inspect" });
  await traverseHistory(page, "forward");
  await expectHistoryState(page, { scenario: "CORE-05", state: "conflict", viewport: "narrow", theme: "dark", mode: "inspect" });
  await traverseHistory(page, "forward");
  await expectHistoryState(page, { scenario: "CORE-05", state: "conflict", viewport: "narrow", theme: "light-high-contrast", mode: "present" });
  await expect(page.locator("[data-scenario-lab]")).toHaveAttribute("data-controls-state", "closed");
  await expect(page.frameLocator("[data-lab-frame]").locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.frameLocator("[data-lab-frame]").locator("html")).toHaveAttribute("data-contrast", "more");
});

test("normal and Reduced Motion produce equivalent panel and sizing final states", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const snapshots = {};

  for (const mode of ["no-preference", "reduce"]) {
    await page.emulateMedia({ reducedMotion: mode });
    await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark&mode=inspect");
    await expectVerified(page);
    await page.locator("[data-lab-controls-close]").click();
    await expect(page.locator("[data-scenario-lab]")).toHaveAttribute("data-controls-state", "closed");
    await page.locator("[data-lab-controls-trigger]").click();
    await expect(page.locator("[data-scenario-lab]")).toHaveAttribute("data-controls-state", "open");
    await page.waitForTimeout(mode === "reduce" ? 100 : 260);

    snapshots[mode] = await page.evaluate(() => {
      const root = document.querySelector("[data-scenario-lab]");
      const controls = document.querySelector("[data-lab-controls]");
      const preview = document.querySelector("[data-lab-preview]");
      const sizing = document.querySelector("[data-lab-frame-sizing]");
      return {
        mode: root.dataset.mode,
        state: root.dataset.controlsState,
        expanded: document.querySelector("[data-lab-controls-trigger]").getAttribute("aria-expanded"),
        controlsHidden: controls.getAttribute("aria-hidden"),
        controlsInert: controls.inert,
        previewInert: preview.inert,
        controlsWidth: Math.round(controls.getBoundingClientRect().width),
        sizing: sizing.dataset.sizing,
        scale: Number(sizing.dataset.scale)
      };
    });

    const controls = page.locator("[data-lab-controls]");
    const shell = page.locator("[data-lab-frame-shell]");
    if (mode === "reduce") {
      await expect(controls).toHaveCSS("transition-property", "opacity");
      await expect(controls).toHaveCSS("transition-duration", "0.08s");
      await expect(shell).toHaveCSS("transition-property", "opacity");
      await expect(shell).toHaveCSS("transition-duration", "0.08s");
    } else {
      await expect(controls).toHaveCSS("transition-property", "transform, opacity");
      await expect(shell).toHaveCSS("transition-property", "transform, opacity");
    }
  }

  expect(snapshots.reduce).toEqual(snapshots["no-preference"]);
});

test("scenario lab verifies every catalog-backed showcased state", async ({ page, request }, testInfo) => {
  test.setTimeout(120_000);
  const response = await request.get("/scenarios/catalog.json");
  expect(response.ok()).toBe(true);
  const catalog = await response.json();
  const showcased = catalog.scenarios.filter((scenario) => scenario.presentation_status === "showcased");
  expect(showcased).toHaveLength(17);

  for (const scenario of showcased) {
    await page.goto("/scenarios/lab.html?scenario=" + scenario.id + "&viewport=narrow&theme=light-high-contrast&mode=inspect");
    await expect(page.locator("[data-lab-scenario]")).toHaveValue(scenario.id);
    await expect(page.locator("[data-lab-state] option")).toHaveCount(scenario.state_controls.length);
    await expect(page.locator("[data-lab-scenario-title]")).toHaveText(scenario.canonical_name);

    for (const control of scenario.state_controls) {
      await page.locator("[data-lab-state]").selectOption(control.state);
      await expectVerified(page);
      const frame = page.frameLocator("[data-lab-frame]");
      await expectControl(frame, control);
      await expect(frame.locator("html")).toHaveAttribute("data-theme", "light");
      await expect(frame.locator("html")).toHaveAttribute("data-contrast", "more");
      const params = new URL(page.url()).searchParams;
      expect(params.get("scenario")).toBe(scenario.id);
      expect(params.get("state")).toBe(control.state);
      expect(await page.locator("[data-lab-direct-link]").getAttribute("href")).toContain(control.reference_path.split(/[?#]/)[0]);
    }

    if (scenario.id === "ENG-02") {
      await expect(page.frameLocator("[data-lab-frame]").locator('[data-object][aria-pressed="true"]')).toContainText("Bracket-01");
      await page.screenshot({ path: testInfo.outputPath("scenario-lab-layer-structure.png"), fullPage: true });
    }
    if (scenario.id === "COM-02") {
      await expect(page.frameLocator("[data-lab-frame]").locator("[data-commerce-save-failure]")).toBeVisible();
      await page.locator("[data-lab-scenario]").focus();
      await page.screenshot({ path: testInfo.outputPath("scenario-lab-commerce-save-failure.png") });
    }
    if (scenario.id === "INT-03") {
      await expect(page.frameLocator("[data-lab-frame]").locator("[data-risk-error]")).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath("scenario-lab-risk-queue-error.png") });
    }
    if (scenario.id === "INT-02") {
      await expect(page.frameLocator("[data-lab-frame]").locator("[data-investigation-error]")).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath("scenario-lab-investigation-error.png") });
    }
  }

  await expect(page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).resolves.toBe(true);
});

test("scenario lab changes viewport and appearance without stealing control focus", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1500, height: 940 });
  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark&mode=inspect");
  await expectVerified(page);

  const frameElement = page.locator("[data-lab-frame]");
  const initialSource = await frameElement.evaluate((element) => element.contentWindow.location.href);
  await page.locator('[data-lab-sizing="actual"]').click();
  await expect(page.locator("[data-lab-frame-sizing]")).toHaveAttribute("data-scale", "1");
  await expect.poll(() => frameElement.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(1180);

  const narrow = page.locator('[data-lab-viewport="narrow"]');
  await narrow.click();
  await expect(narrow).toBeFocused();
  await expect(narrow).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => frameElement.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(390);
  await expect.poll(() => frameElement.evaluate((element) => element.contentWindow.location.href)).toBe(initialSource);
  await expectVerified(page);

  const light = page.locator('[data-lab-theme="light"]');
  const dark = page.locator('[data-lab-theme="dark"]');
  await light.focus();
  await page.keyboard.press("ArrowRight");
  await expect(dark).toBeFocused();
  await expect(dark).toHaveAttribute("aria-pressed", "true");

  const highContrast = page.locator('[data-lab-theme="light-high-contrast"]');
  await highContrast.click();
  await expect(highContrast).toBeFocused();
  const frame = page.frameLocator("[data-lab-frame]");
  await expect(frame.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(frame.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(frame.locator("[data-contrast-toggle]")).toHaveAttribute("aria-checked", "true");
  await expect.poll(() => frameElement.evaluate((element) => element.contentWindow.location.href)).toBe(initialSource);
  await expectVerified(page);

  const scenarioSelect = page.locator("[data-lab-scenario]");
  await scenarioSelect.focus();
  await scenarioSelect.selectOption("CORE-05");
  await expect(scenarioSelect).toBeFocused();
  const stateSelect = page.locator("[data-lab-state]");
  await stateSelect.focus();
  await stateSelect.selectOption("conflict");
  await expect(stateSelect).toBeFocused();
  await expectVerified(page);
  const systemFrame = page.frameLocator("[data-lab-frame]");
  await expect(systemFrame.locator("[data-system-code]")).toHaveText("409");
  await expect(systemFrame.locator("[data-theme-switch]")).toHaveAttribute("aria-checked", "false");

  const params = new URL(page.url()).searchParams;
  expect(params.get("scenario")).toBe("CORE-05");
  expect(params.get("state")).toBe("conflict");
  expect(params.get("viewport")).toBe("narrow");
  expect(params.get("theme")).toBe("light-high-contrast");
  await page.screenshot({ path: testInfo.outputPath("scenario-lab-system-conflict.png"), fullPage: true });
});

test("scenario lab snaps exact viewport sizes under normal motion and settles rapid reversal", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1500, height: 940 });
  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark&mode=inspect");
  await expectVerified(page);

  const shell = page.locator("[data-lab-frame-shell]");
  const frame = page.locator("[data-lab-frame]");
  await expect(shell).toHaveCSS("transition-property", "transform, opacity");
  await expect(shell).toHaveCSS("transition-duration", "0.18s, 0.12s");
  await page.locator('[data-lab-sizing="actual"]').click();

  const wide = page.locator('[data-lab-viewport="wide"]');
  const narrow = page.locator('[data-lab-viewport="narrow"]');
  await wide.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");

  await expect(narrow).toBeFocused();
  await expect(narrow).toHaveAttribute("aria-pressed", "true");
  await expect(wide).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => frame.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(390);
  await expectVerified(page);
});

test("scenario lab ignores stale fixture callbacks during rapid state reversal", async ({ page }) => {
  await page.goto("/scenarios/lab.html?scenario=INT-02&state=normal&viewport=narrow&theme=light-high-contrast&mode=inspect");
  await expectVerified(page);

  const state = page.locator("[data-lab-state]");
  await state.selectOption("permission");
  await state.selectOption("error");
  await state.selectOption("permission");

  await expect(state).toHaveValue("permission");
  await expectVerified(page);
  const frame = page.frameLocator("[data-lab-frame]");
  await expect(frame.locator("[data-investigation-permission]")).toBeVisible();
  await expect(frame.locator("[data-investigation-error]")).toBeHidden();
  expect(new URL(page.url()).searchParams.get("state")).toBe("permission");
});

test("scenario lab clears a surfaced inspection error when a valid reference loads", async ({ page }) => {
  await page.goto("/scenarios/lab.html?scenario=CORE-05&state=expired&viewport=narrow&theme=dark&mode=inspect");
  await expectVerified(page);

  const frame = page.locator("[data-lab-frame]");
  await frame.evaluate((element) => {
    element.setAttribute("sandbox", "allow-scripts");
    element.srcdoc = "<!doctype html><title>isolated fixture</title>";
  });

  const error = page.locator("[data-lab-error]");
  await expect(error).toBeVisible();
  await expect(error).toContainText("could not be inspected");
  await expect(page.locator("[data-lab-frame-placeholder]")).toHaveAttribute("data-kind", "neutral");
  await expect(page.locator("[data-lab-frame-placeholder]")).toBeVisible();
  await expect(page.locator("[data-lab-frame-poster]")).toBeHidden();
  await expect(page.locator("[data-lab-placeholder-title]")).toContainText("CORE-05");
  expect(await frame.evaluate((element) => element.inert)).toBe(true);
  await expect(frame).toHaveAttribute("aria-hidden", "true");

  await frame.evaluate((element) => {
    element.removeAttribute("sandbox");
    element.removeAttribute("srcdoc");
  });
  await page.locator("[data-lab-state]").selectOption("permission");
  await expectVerified(page);
  await expect(error).toBeHidden();
  await expect(page.locator("[data-lab-error-message]")).toBeEmpty();
  await expect(page.locator("[data-lab-frame-placeholder]")).toBeHidden();
  expect(await frame.evaluate((element) => element.inert)).toBe(false);
});

test("scenario lab uses solid bars when reduced transparency is requested", async ({ page }) => {
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }]
  });
  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark");
  await expectVerified(page);

  await expect(page.locator(".lab-topbar")).toHaveCSS("backdrop-filter", "none");
  await expect(page.locator(".lab-preview-bar")).toHaveCSS("backdrop-filter", "none");
  await expect(page.locator(".lab-topbar")).toHaveCSS("background-color", "rgb(15, 16, 17)");
  await expect(page.locator(".lab-preview-bar")).toHaveCSS("background-color", "rgb(15, 16, 17)");
});

test("scenario lab defaults to a contained narrow preview on mobile", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/scenarios/lab.html?scenario=WORK-01&state=conflict");
  await expectVerified(page);

  const params = new URL(page.url()).searchParams;
  expect(params.get("viewport")).toBe("narrow");
  expect(params.get("mode")).toBe("present");
  await expect(page.locator("[data-scenario-lab]")).toHaveAttribute("data-mode", "present");
  await expect(page.locator("[data-scenario-lab]")).toHaveAttribute("data-controls-state", "closed");
  await expect(page.locator("[data-lab-source-maturity]")).toHaveText("Candidate source");
  await expect(page.frameLocator("[data-lab-frame]").locator("[data-sidecar-conflict]")).toContainText("share one reviewer");
  await expect(page.locator('[data-lab-sizing="fit"]')).toHaveAttribute("aria-pressed", "true");
  const fitWidth = await page.locator("[data-lab-frame]").evaluate((element) => element.getBoundingClientRect().width);
  expect(fitWidth).toBeLessThanOrEqual(390);
  expect(fitWidth).toBeGreaterThan(0);

  await page.locator('[data-lab-mode="inspect"]').click();
  await expect(page.locator("[data-scenario-lab]")).toHaveAttribute("data-controls-state", "open");
  const touchTargets = await page.locator("[data-lab-mode], [data-lab-viewport], [data-lab-theme]").evaluateAll((items) => items.map((item) => {
    const box = item.getBoundingClientRect();
    return { height: box.height, width: box.width };
  }));
  expect(touchTargets.every((target) => target.height >= 44 && target.width >= 44)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-scenario-lab]")).toHaveAttribute("data-mode", "present");
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).resolves.toBe(true);
  await page.screenshot({ path: testInfo.outputPath("scenario-lab-work-conflict-mobile.png"), fullPage: true });
});
