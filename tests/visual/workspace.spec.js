import { expect, test } from "@playwright/test";

const browserErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  const errors = [];
  browserErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

async function seedPreferences(page, theme, contrast = "normal", locale = "zh") {
  await page.addInitScript(({ selectedTheme, selectedContrast, selectedLocale }) => {
    localStorage.setItem("kin-reference-theme", selectedTheme);
    localStorage.setItem("kin-reference-contrast", selectedContrast);
    localStorage.setItem("kin-reference-locale", selectedLocale);
  }, { selectedTheme: theme, selectedContrast: contrast, selectedLocale: locale });
}

async function assertNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

async function assertMinimumTouchTargets(page, selector) {
  const targets = await page.locator(selector).evaluateAll((elements) =>
    elements.filter((element) => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0 && bounds.height > 0;
    }).map((element) => {
      const bounds = element.getBoundingClientRect();
      return { height: bounds.height, width: bounds.width };
    }),
  );
  expect(targets.length).toBeGreaterThan(0);
  expect(targets.every(({ height, width }) => height >= 44 && width >= 44)).toBe(true);
}

async function capture(page, testInfo, name, fullPage = true) {
  await page.screenshot({ path: testInfo.outputPath(name), fullPage });
}

for (const theme of ["dark", "light"]) {
  test(`workspace desktop ${theme}`, async ({ page }, testInfo) => {
    await seedPreferences(page, theme);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/examples/workspace-reference/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.getByRole("heading", { name: "Alpha Network", level: 1 })).toBeVisible();
    await expect(page.locator(".inspector")).toBeVisible();
    expect(await page.locator("svg.lucide").count()).toBeGreaterThan(8);
    await assertNoHorizontalOverflow(page);
    await capture(page, testInfo, `workspace-${theme}-desktop.png`);
  });
}

test("workspace high contrast", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark", "more");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/workspace-reference/");

  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(page.locator("[data-contrast-toggle]")).toHaveAttribute("aria-pressed", "true");
  const lineColor = await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--line").trim());
  const positiveColor = await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--positive").trim());
  expect(lineColor).toBe("#747a86");
  expect(positiveColor).toBe("#50ad7d");
  await capture(page, testInfo, "workspace-high-contrast.png");
});

test("theme and contrast preferences synchronize across tabs", async ({ context }) => {
  const firstPage = await context.newPage();
  const secondPage = await context.newPage();
  await seedPreferences(firstPage, "dark");
  await seedPreferences(secondPage, "dark");
  await Promise.all([
    firstPage.goto("/examples/workspace-reference/"),
    secondPage.goto("/examples/workspace-reference/states.html"),
  ]);

  await firstPage.locator("[data-theme-switch]").click();
  await expect(secondPage.locator("html")).toHaveAttribute("data-theme", "light");
  await firstPage.locator("[data-contrast-toggle]").click();
  await expect(secondPage.locator("html")).toHaveAttribute("data-contrast", "more");
});

test("workspace localizes controls and loads Sonner on demand", async ({ page }) => {
  await seedPreferences(page, "dark", "normal", "zh");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/workspace-reference/");

  expect(await page.evaluate(() => performance.getEntriesByType("resource").some(({ name }) => name.includes("sonner-island")))).toBe(false);
  await page.locator("[data-language-trigger]").click();
  await page.locator('[data-locale-value="en"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText("Current status", { exact: true })).toBeVisible();

  await page.locator('[data-toast="follow"]').click();
  await expect(page.locator("[data-sonner-toast]")).toBeVisible();
  expect(await page.evaluate(() => performance.getEntriesByType("resource").some(({ name }) => name.includes("sonner-island")))).toBe(true);
});

test("workspace mobile and inspector behavior", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/workspace-reference/");

  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.locator(".inspector")).toBeHidden();
  await expect(page.locator(".breadcrumb")).toBeHidden();
  await assertMinimumTouchTargets(page, ".workspace-actions > button, .workspace-actions > .language-control > button, .view-bar a, .entity-actions button, .text-button");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "workspace-dark-mobile.png");

  const mobileOpen = page.locator("[data-inspector-open]");
  const mobileClose = page.locator("[data-inspector-close]");
  await mobileOpen.click();
  await expect(page.locator(".inspector")).toBeVisible();
  await expect(mobileClose).toBeFocused();
  await mobileClose.click();
  await expect(page.locator(".inspector")).toBeHidden();
  await expect(mobileOpen).toBeFocused();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  const close = page.locator("[data-inspector-close]");
  const open = page.locator("[data-inspector-open]");
  await close.click();
  await expect(page.locator(".inspector")).toBeHidden();
  await expect(open).toBeFocused();
  await open.click();
  await expect(page.locator(".inspector")).toBeVisible();
  await expect(close).toBeFocused();
});

test("state reference and command dialog", async ({ page }, testInfo) => {
  await seedPreferences(page, "light");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/examples/workspace-reference/states.html");

  await expect(page.locator(".states-page h1")).toBeVisible();
  await expect(page.locator('[role="row"][aria-selected="true"]')).toHaveCount(1);
  await expect(page.locator('input[aria-invalid="true"]')).toHaveCount(1);
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "states-light.png");

  const open = page.locator("[data-command-open]");
  await open.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.locator("#command-search")).toBeFocused();
  await capture(page, testInfo, "states-command-dialog.png", false);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();
});

test("information site preserves reading and provenance", async ({ page }, testInfo) => {
  await seedPreferences(page, "light");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/product-patterns/information.html");

  await expect(page.locator(".article h1")).toBeVisible();
  await expect(page.locator(".source-rail")).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "information-light-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator(".topic-nav")).toBeHidden();
  await expect(page.locator(".source-rail")).toBeVisible();
  await assertMinimumTouchTargets(page, ".theme-control button, .pattern-theme-actions > button, .info-search");
  await assertNoHorizontalOverflow(page);
});

test("ecommerce operations keeps money inventory and approval distinct", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/product-patterns/ecommerce.html");

  await expect(page.locator(".commerce-bar h1")).toBeVisible();
  await expect(page.locator('[role="row"][aria-selected="true"]')).toHaveCount(1);
  await expect(page.getByText("CNY 1,299.00", { exact: true })).toHaveCount(2);
  await expect(page.locator(".approval")).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "ecommerce-dark-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator(".commerce-sidebar")).toBeHidden();
  await expect(page.locator(".commerce-inspector")).toBeVisible();
  await assertMinimumTouchTargets(page, ".commerce-tools button, .checkbox-target, .commerce-inspector .theme-control button, .commerce-inspector .pattern-theme-actions > button");
  await assertNoHorizontalOverflow(page);
});

test("engineering canvas separates tools, selection, and generated changes", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/product-patterns/canvas.html");

  await expect(page.locator('.drawing-area svg[role="img"]')).toBeVisible();
  const tools = page.locator("[data-tool]");
  expect(await tools.count()).toBe(5);
  const selectedObject = page.locator('[data-object][aria-pressed="true"]');
  await expect(selectedObject).toHaveCount(1);
  const lineTool = page.locator('[data-tool][aria-pressed="false"]');
  expect(await lineTool.count()).toBe(4);
  await lineTool.nth(0).click();
  await expect(selectedObject).toHaveCount(1);
  await expect(page.locator(".generated-change")).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "canvas-dark-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator(".layer-panel")).toBeHidden();
  await expect(page.locator(".property-panel")).toBeHidden();
  await assertMinimumTouchTargets(page, ".canvas-actions > button, .tool-rail button");
  const propertiesOpen = page.locator("[data-canvas-properties-open]");
  const propertiesClose = page.locator("[data-canvas-properties-close]");
  await propertiesOpen.click();
  await expect(page.locator(".property-panel")).toBeVisible();
  await expect(propertiesClose).toBeFocused();
  await propertiesClose.click();
  await expect(page.locator(".property-panel")).toBeHidden();
  await expect(propertiesOpen).toBeFocused();
  await assertNoHorizontalOverflow(page);
});
