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

test("scenario lab verifies every catalog-backed showcased state", async ({ page, request }, testInfo) => {
  test.setTimeout(120_000);
  const response = await request.get("/scenarios/catalog.json");
  expect(response.ok()).toBe(true);
  const catalog = await response.json();
  const showcased = catalog.scenarios.filter((scenario) => scenario.presentation_status === "showcased");
  expect(showcased).toHaveLength(14);

  for (const scenario of showcased) {
    await page.goto("/scenarios/lab.html?scenario=" + scenario.id + "&viewport=narrow&theme=light-high-contrast");
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
  }

  await expect(page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).resolves.toBe(true);
});

test("scenario lab changes viewport and appearance without stealing control focus", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1500, height: 940 });
  await page.goto("/scenarios/lab.html?scenario=INT-01&state=normal&viewport=wide&theme=dark");
  await expectVerified(page);

  const frameElement = page.locator("[data-lab-frame]");
  const initialSource = await frameElement.getAttribute("src");
  const wideWidth = await frameElement.evaluate((element) => element.getBoundingClientRect().width);
  expect(wideWidth).toBeGreaterThanOrEqual(1178);

  const narrow = page.locator('[data-lab-viewport="narrow"]');
  await narrow.click();
  await expect(narrow).toBeFocused();
  await expect(narrow).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => frameElement.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(390);
  await expect(frameElement).toHaveAttribute("src", initialSource);
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
  await expect(frameElement).toHaveAttribute("src", initialSource);
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

test("scenario lab defaults to a contained narrow preview on mobile", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/scenarios/lab.html?scenario=WORK-01&state=conflict");
  await expectVerified(page);

  const params = new URL(page.url()).searchParams;
  expect(params.get("viewport")).toBe("narrow");
  await expect(page.locator("[data-lab-source-maturity]")).toHaveText("Candidate source");
  await expect(page.frameLocator("[data-lab-frame]").locator("[data-sidecar-conflict]")).toContainText("share one reviewer");
  await expect.poll(() => page.locator("[data-lab-frame]").evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBe(390);

  const touchTargets = await page.locator("[data-lab-viewport], [data-lab-theme]").evaluateAll((items) => items.map((item) => {
    const box = item.getBoundingClientRect();
    return { height: box.height, width: box.width };
  }));
  expect(touchTargets.every((target) => target.height >= 44 && target.width >= 44)).toBe(true);
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).resolves.toBe(true);
  await page.screenshot({ path: testInfo.outputPath("scenario-lab-work-conflict-mobile.png"), fullPage: true });
});
