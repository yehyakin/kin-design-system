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

async function seedPreferences(page, theme, contrast = "normal") {
  await page.addInitScript(({ selectedTheme, selectedContrast }) => {
    localStorage.setItem("kin-reference-theme", selectedTheme);
    localStorage.setItem("kin-reference-contrast", selectedContrast);
  }, { selectedTheme: theme, selectedContrast: contrast });
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
    await assertNoHorizontalOverflow(page);
    await capture(page, testInfo, `workspace-${theme}-desktop.png`);
  });
}

test("workspace high contrast", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark", "more");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/workspace-reference/");

  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(page.getByRole("button", { name: "高对比" })).toHaveAttribute("aria-pressed", "true");
  const lineColor = await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--line").trim());
  const positiveColor = await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--positive").trim());
  expect(lineColor).toBe("#747a86");
  expect(positiveColor).toBe("#50ad7d");
  await capture(page, testInfo, "workspace-high-contrast.png");
});

test("theme and contrast preferences synchronize across tabs", async ({ context }) => {
  const firstPage = await context.newPage();
  const secondPage = await context.newPage();
  await Promise.all([
    firstPage.goto("/examples/workspace-reference/"),
    secondPage.goto("/examples/workspace-reference/states.html"),
  ]);

  await firstPage.getByRole("button", { name: "日间" }).click();
  await expect(secondPage.locator("html")).toHaveAttribute("data-theme", "light");
  await firstPage.getByRole("button", { name: "高对比" }).click();
  await expect(secondPage.locator("html")).toHaveAttribute("data-contrast", "more");
});

test("workspace mobile and inspector behavior", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/workspace-reference/");

  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.locator(".inspector")).toBeHidden();
  await expect(page.locator(".breadcrumb")).toBeHidden();
  await assertMinimumTouchTargets(page, ".workspace-actions > button, .theme-control button, .view-bar a, .entity-actions button, .text-button");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "workspace-dark-mobile.png");

  const mobileOpen = page.getByRole("button", { name: "属性" });
  const mobileClose = page.getByRole("button", { name: "关闭属性面板" });
  await mobileOpen.click();
  await expect(page.locator(".inspector")).toBeVisible();
  await expect(mobileClose).toBeFocused();
  await mobileClose.click();
  await expect(page.locator(".inspector")).toBeHidden();
  await expect(mobileOpen).toBeFocused();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  const close = page.getByRole("button", { name: "关闭属性面板" });
  const open = page.getByRole("button", { name: "属性" });
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

  await expect(page.getByRole("heading", { name: "组件状态基准", level: 1 })).toBeVisible();
  await expect(page.locator('[role="row"][aria-selected="true"]')).toHaveCount(1);
  await expect(page.locator('input[aria-invalid="true"]')).toHaveCount(1);
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "states-light.png");

  const open = page.getByRole("button", { name: /打开命令菜单/ });
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

  await expect(page.getByRole("heading", { name: "区域公共网络节点状态记录", level: 1 })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "来源与修订" })).toBeVisible();
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

  await expect(page.getByRole("heading", { name: "商品运营", level: 1 })).toBeVisible();
  await expect(page.locator('[role="row"][aria-selected="true"]')).toHaveCount(1);
  await expect(page.getByText("CNY 1,299.00", { exact: true })).toHaveCount(2);
  await expect(page.getByText("价格调整等待审批", { exact: true })).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "ecommerce-dark-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator(".commerce-sidebar")).toBeHidden();
  await expect(page.locator(".commerce-inspector")).toBeVisible();
  await assertMinimumTouchTargets(page, ".commerce-tools button, .checkbox-target, .commerce-inspector .theme-control button, .commerce-inspector .pattern-theme-actions > button");
  await assertNoHorizontalOverflow(page);
});

test("engineering canvas separates tool mode object selection and generated changes", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/product-patterns/canvas.html");

  await expect(page.getByRole("img", { name: "Bracket Assembly 工程图" })).toBeVisible();
  const selectTool = page.getByRole("button", { name: "选择" });
  const lineTool = page.getByRole("button", { name: "直线" });
  const selectedObject = page.locator('[data-object][aria-pressed="true"]');
  await expect(selectTool).toHaveAttribute("aria-pressed", "true");
  await expect(selectedObject).toHaveCount(1);
  await lineTool.click();
  await expect(lineTool).toHaveAttribute("aria-pressed", "true");
  await expect(selectTool).toHaveAttribute("aria-pressed", "false");
  await expect(selectedObject).toHaveCount(1);
  await expect(page.getByText("尚未写入 Revision 18。", { exact: false })).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "canvas-dark-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator(".layer-panel")).toBeHidden();
  await expect(page.locator(".property-panel")).toBeHidden();
  await assertMinimumTouchTargets(page, ".canvas-actions > button, .tool-rail button");
  const propertiesOpen = page.getByRole("button", { name: "属性" });
  const propertiesClose = page.getByRole("button", { name: "关闭属性面板" });
  await propertiesOpen.click();
  await expect(page.locator(".property-panel")).toBeVisible();
  await expect(propertiesClose).toBeFocused();
  await propertiesClose.click();
  await expect(page.locator(".property-panel")).toBeHidden();
  await expect(propertiesOpen).toBeFocused();
  await assertNoHorizontalOverflow(page);
});
