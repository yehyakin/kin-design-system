import { expect, test } from "@playwright/test";

async function transitionMilliseconds(locator) {
  return locator.evaluate((element) => {
    const values = getComputedStyle(element).transitionDuration.split(",").map((value) => value.trim());
    return Math.max(
      ...values.map((value) => (value.endsWith("ms") ? Number.parseFloat(value) : Number.parseFloat(value) * 1000)),
    );
  });
}

test("Showcase stages keep restrained normal motion and settle rapid replacement", async ({ page }) => {
  await page.goto("/");
  const homeStage = page.locator("[data-scenario-stage]");
  const homeFrame = homeStage.locator("iframe[data-stage-frame]");
  await expect(homeStage.locator("[data-stage-sweep]")).toHaveCount(0);
  expect(await transitionMilliseconds(homeFrame)).toBeGreaterThanOrEqual(180);

  const tabs = homeStage.getByRole("tab");
  await tabs.nth(2).click();
  await tabs.nth(3).click();
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(homeStage.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "scenario-tab-investigation");
  await expect(homeStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator("[data-scenario-stage] iframe").locator(".entity-content")).toBeVisible();
  await homeStage.evaluate((element) => {
    window.__kinKeyboardStageTransitions = [];
    for (const target of element.querySelectorAll("iframe, [data-stage-loading], [data-stage-poster]")) {
      target.addEventListener("transitionrun", (event) => {
        window.__kinKeyboardStageTransitions.push(`${target.tagName}:${event.propertyName}`);
      });
    }
  });
  await tabs.nth(1).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await expect(homeStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  expect(await page.evaluate(() => window.__kinKeyboardStageTransitions)).toEqual([]);

  await page.goto("/components/evidence-list/");
  const componentStage = page.locator("[data-reference-stage]");
  expect(await transitionMilliseconds(componentStage.locator("iframe[data-stage-frame]"))).toBeGreaterThanOrEqual(160);

  await expect(componentStage).toHaveAttribute("data-ready-fragment", "showcase-specimen-app");
  await expect(componentStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator("[data-reference-stage] iframe").locator("#specimen-root")).toBeVisible();

  await page.goto("/patterns/");
  const patternBrowser = page.locator("[data-pattern-browser]");
  const patternStage = patternBrowser.locator("[data-reference-stage]");
  await patternStage.scrollIntoViewIfNeeded();
  expect(await transitionMilliseconds(patternStage.locator("iframe[data-stage-frame]"))).toBeGreaterThanOrEqual(160);
  await expect(patternStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator("[data-pattern-browser] iframe").locator("main.article h1")).toBeVisible();
  await patternStage.evaluate((element) => {
    window.__kinKeyboardStageTransitions = [];
    for (const target of element.querySelectorAll("iframe, [data-stage-loading]")) {
      target.addEventListener("transitionrun", (event) => {
        window.__kinKeyboardStageTransitions.push(`${target.tagName}:${event.propertyName}`);
      });
    }
  });
  const patternChoices = patternBrowser.locator("[data-pattern-choice]");
  await patternChoices.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(patternChoices.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(patternStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  expect(await page.evaluate(() => window.__kinKeyboardStageTransitions)).toEqual([]);
});

test("component gallery actions expose a restrained hover response", async ({ page }) => {
  await page.goto("/components/");
  const action = page.locator("[data-component-gallery] .component-gallery-card__header a").nth(1);
  await expect(action).toBeVisible();
  const before = await action.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await transitionMilliseconds(action)).toBeGreaterThanOrEqual(140);
  await action.hover();
  await expect
    .poll(() => action.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(before);
});

test("component fixtures use physical button feedback and transform-only progress", async ({ page }) => {
  await page.goto(
    "/examples/workspace-reference/showcase-components.html?lang=en&specimen=button",
    { waitUntil: "domcontentloaded" },
  );
  const save = page.getByRole("button", { name: "Save changes" });
  await expect(save).toBeVisible();
  await expect(save).toHaveCSS("transition-property", /transform/);
  await save.hover();
  await page.mouse.down();
  await expect
    .poll(() => save.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe("none");
  await page.mouse.up();

  await page.goto(
    "/examples/workspace-reference/showcase-components.html?lang=en&specimen=background-task-queue",
    { waitUntil: "domcontentloaded" },
  );
  const progress = page.locator(".progress-track > span").nth(1);
  await expect(progress).toHaveCSS("transition-property", "transform");
  await expect(progress).toHaveCSS("transform", "matrix(0, 0, 0, 1, 0, 0)");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect
    .poll(() => progress.evaluate((element) => element.style.getPropertyValue("--progress-ratio")))
    .toBe("0.18");
  await expect
    .poll(() => progress.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe("matrix(0, 0, 0, 1, 0, 0)");
});

test("Story Timeline preserves purposeful draw motion and keyboard selection", async ({ page }) => {
  await page.goto(
    "/examples/workspace-reference/showcase-components.html?lang=en&specimen=story-timeline",
    { waitUntil: "domcontentloaded" },
  );
  const progress = page.locator(".story-timeline__progress");
  await expect(progress).toBeAttached();
  await expect(progress).toHaveCSS("animation-name", "timeline-draw");
  await expect(progress).toHaveCSS("animation-duration", "0.72s");

  const markers = page.locator(".story-marker");
  await markers.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(markers.nth(1)).toBeFocused();
  await expect(markers.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".timeline-detail")).toContainText("09:34");
});

test("mobile documentation Drawer retains modal ownership through its exit motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/");

  const trigger = page.locator("[data-local-nav-toggle]");
  const navigation = page.locator("[data-local-nav]");
  const main = page.locator(".docs-main");

  await trigger.click();
  await expect(main).toHaveJSProperty("inert", true);
  await navigation.evaluate((element) => {
    window.__kinDrawerCloseStarted = new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        if (element.dataset.drawerState !== "closing") return;
        observer.disconnect();
        resolve({
          backgroundInert: document.querySelector(".docs-main").inert,
          bodyClosing: document.body.classList.contains("nav-closing"),
          drawerState: element.dataset.drawerState,
        });
      });
      observer.observe(element, { attributes: true, attributeFilter: ["data-drawer-state"] });
    });
    window.__kinDrawerTransformEnd = new Promise((resolve) => {
      const handleTransition = (event) => {
        if (
          event.target !== element
          || event.propertyName !== "transform"
          || element.dataset.drawerState !== "closing"
        ) return;
        element.removeEventListener("transitionend", handleTransition);
        resolve({
          backgroundInert: document.querySelector(".docs-main").inert,
          drawerState: element.dataset.drawerState,
        });
      };
      element.addEventListener("transitionend", handleTransition);
    });
  });
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  const atCloseStart = await page.evaluate(() => window.__kinDrawerCloseStarted);
  expect(atCloseStart).toEqual({
    backgroundInert: true,
    bodyClosing: true,
    drawerState: "closing",
  });
  const atTransformEnd = await page.evaluate(() => window.__kinDrawerTransformEnd);
  expect(atTransformEnd).toEqual({ backgroundInert: true, drawerState: "closing" });
  await expect(navigation).toHaveAttribute("data-drawer-state", "closed", { timeout: 1_000 });
  await expect(main).toHaveJSProperty("inert", false);
  await expect(page.locator("body")).not.toHaveClass(/nav-closing/);
});
