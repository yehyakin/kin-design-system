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

test("workspace exposes keyboard-complete theme and language preferences", async ({ page }) => {
  await seedPreferences(page, "light");
  await page.goto("/examples/workspace-reference/");

  const languageTrigger = page.locator("[data-language-trigger]");
  const languageMenu = page.locator("[data-language-menu]");
  await expect(languageTrigger).toHaveAttribute("aria-haspopup", "menu");
  await expect(languageTrigger.locator("svg.lucide-languages")).toBeVisible();
  await languageTrigger.click();
  await expect(page.locator('[data-locale-value="zh"]')).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-locale-value="en"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(languageTrigger).toBeFocused();
  await expect(languageMenu).toBeHidden();

  const themeSwitch = page.locator("[data-theme-switch]");
  await expect(themeSwitch).toHaveAttribute("role", "switch");
  await expect(themeSwitch).toHaveAttribute("aria-checked", "false");
  await expect(themeSwitch.locator(".theme-switch-icon svg")).toHaveCount(2);
  await expect(themeSwitch.locator(".theme-switch-track")).toBeVisible();

  const themeMenuTrigger = page.locator("[data-theme-menu-trigger]");
  const themeMenu = page.locator("[data-theme-menu]");
  await expect(themeMenuTrigger).toHaveAttribute("aria-haspopup", "menu");
  await themeMenuTrigger.click();
  await expect(page.locator('[data-theme-option="light"]')).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-theme-option="dark"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(themeMenuTrigger).toBeFocused();
  await expect(themeMenu).toBeHidden();

  await themeMenuTrigger.click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await expect(page.locator('[data-theme-option="system"]')).toHaveAttribute("aria-checked", "true");
  await expect(themeMenuTrigger).toBeFocused();
});

test("Motion Lab uses the canonical switch and supports the system theme path", async ({ page }) => {
  await seedPreferences(page, "light");
  await page.goto("/examples/workspace-reference/motion.html");

  const themeSwitch = page.locator("[data-lab-theme]");
  await expect(themeSwitch).toHaveAttribute("role", "switch");
  await expect(themeSwitch).toHaveAttribute("aria-checked", "false");
  await expect(themeSwitch.locator(".theme-switch-icon svg")).toHaveCount(2);
  await expect(themeSwitch.locator(".theme-switch-track")).toBeVisible();

  const trigger = page.locator("[data-lab-theme-menu-trigger]");
  const menu = page.locator("[data-lab-theme-menu]");
  await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  await trigger.click();
  await expect(page.locator('[data-lab-theme-preference="light"]')).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-lab-theme-preference="dark"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(menu).toBeHidden();

  await trigger.click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await expect(page.locator('[data-lab-theme-preference="system"]')).toHaveAttribute("aria-checked", "true");
  await expect(trigger).toBeFocused();
});

test("workspace high contrast", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark", "more");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/workspace-reference/");

  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(page.locator("[data-contrast-toggle]")).toHaveAttribute("aria-checked", "true");
  const lineColor = await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--line").trim());
  const positiveColor = await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--positive").trim());
  expect(lineColor).toBe("#747a86");
  expect(positiveColor).toBe("#50ad7d");
  await capture(page, testInfo, "workspace-high-contrast.png");
});

test("location bar preserves identity and moves secondary actions into overflow", async ({ page }) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/workspace-reference/");

  const location = page.locator(".location-identity");
  const more = page.locator("[data-location-overflow-trigger]");
  await expect(location.getByText("Alpha Network", { exact: true })).toBeVisible();
  await more.click();
  await expect(page.getByRole("menuitemcheckbox", { name: "切换高对比度" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "复制对象链接" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(more).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(location.getByText("Alpha Network", { exact: true })).toBeVisible();
  await expect(location.getByText("对象数据库", { exact: true })).toBeHidden();
  await assertNoHorizontalOverflow(page);
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
  await firstPage.locator("[data-location-overflow-trigger]").click();
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

test("workspace demonstrates button motion and Sonner result patterns", async ({ page }) => {
  await seedPreferences(page, "dark", "normal", "en");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/workspace-reference/");

  const toggle = page.locator("[data-motion-toggle]");
  await expect(toggle).toContainText("Pause monitoring");
  await expect(toggle.locator(".paired-icon-default")).toBeVisible();
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toContainText("Resume monitoring");
  await expect(toggle.locator(".paired-icon-active")).toBeVisible();

  const asyncButton = page.locator("[data-motion-async]");
  await asyncButton.hover();
  await expect(asyncButton).not.toHaveClass(/is-success/);
  await asyncButton.click();
  await expect(asyncButton).toHaveClass(/is-loading/);
  await expect(asyncButton).toHaveClass(/is-success/, { timeout: 2_000 });
  await expect(page.getByText("View saved", { exact: true })).toBeVisible();

  await page.locator("[data-motion-task]").click();
  await expect(page.getByText("Creating export task", { exact: true })).toBeVisible();
  await expect(page.getByText("Export task created", { exact: true })).toBeVisible({ timeout: 2_000 });

  await page.locator('[data-toast="error"]').click();
  await expect(page.getByText("Request failed", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});

test("workspace mobile and inspector behavior", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/workspace-reference/");

  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.locator(".inspector")).toBeHidden();
  await expect(page.locator(".location-identity strong")).toHaveText("Alpha Network");
  await expect(page.locator(".location-identity strong")).toBeVisible();
  await assertMinimumTouchTargets(page, ".workspace-actions > button, .workspace-actions > .language-control > button, .workspace-actions > .location-overflow > button, .view-bar a, .entity-actions button, .text-button");
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

test("core actions preserve distinct selection semantics", async ({ page }) => {
  await seedPreferences(page, "dark");
  await page.goto("/examples/workspace-reference/core-components.html#actions");

  const switchControl = page.getByRole("switch", { name: "自动刷新" });
  await expect(switchControl).toHaveAttribute("aria-checked", "true");
  await switchControl.focus();
  await page.keyboard.press("Space");
  await expect(switchControl).toHaveAttribute("aria-checked", "false");

  const density = page.getByRole("group", { name: "显示密度" });
  await density.getByRole("button", { name: "标准" }).click();
  await expect(density.getByRole("button", { name: "标准" })).toHaveAttribute("aria-pressed", "true");
  await expect(density.getByRole("button", { name: "紧凑" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("radio", { name: "人工确认" })).toBeChecked();

  const buttonMatrix = page.getByRole("table", { name: "按钮变体与状态矩阵" });
  await expect(buttonMatrix.getByRole("rowheader", { name: "主要操作" })).toBeVisible();
  await expect(buttonMatrix.getByRole("button", { name: "正在保存" })).toHaveAttribute("aria-busy", "true");
  await expect(buttonMatrix.getByRole("button", { name: "复制对象链接" })).toHaveAttribute("title", "复制对象链接");
  await expect(buttonMatrix.getByRole("button", { name: "移除记录" }).first()).toBeEnabled();
});

test("core authentication reference preserves context and never submits credentials", async ({ page }, testInfo) => {
  await seedPreferences(page, "light");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/examples/workspace-reference/core-components.html#authentication");

  await expect(page.getByRole("heading", { name: "登录与身份验证" })).toBeVisible();
  await expect(page.getByText(/不会发送、保存或验证任何凭据/)).toBeVisible();
  const password = page.getByLabel("密码").first();
  await expect(password).toHaveAttribute("type", "password");
  const reveal = page.getByRole("button", { name: "显示密码" });
  await reveal.click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(page.getByRole("button", { name: "隐藏密码" })).toBeVisible();

  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page.getByText(/未连接身份服务/)).toBeFocused();

  const authDialogOpen = page.getByRole("button", { name: "打开登录弹窗" });
  await authDialogOpen.click();
  const authDialog = page.getByRole("dialog", { name: "登录后保存筛选视图" });
  await expect(authDialog).toBeVisible();
  await expect(authDialog.getByLabel("工作邮箱")).toBeFocused();
  const authDialogPassword = authDialog.getByLabel("密码", { exact: true });
  await authDialog.getByRole("button", { name: "显示密码" }).click();
  await expect(authDialogPassword).toHaveAttribute("type", "text");
  await expect(authDialog.getByRole("button", { name: "使用组织 SSO" })).toBeDisabled();
  await authDialog.screenshot({ path: testInfo.outputPath("authentication-dialog-light.png") });
  await authDialog.getByRole("button", { name: "取消" }).click();
  await expect(authDialog).toBeHidden();
  await expect(authDialogOpen).toBeFocused();

  const reauthOpen = page.getByRole("button", { name: "打开示例" });
  await reauthOpen.click();
  const reauth = page.getByRole("dialog", { name: "重新验证身份" });
  await expect(reauth).toBeVisible();
  await expect(reauth.getByLabel("密码")).toBeFocused();
  await reauth.getByRole("button", { name: "取消" }).click();
  await expect(reauth).toBeHidden();
  await expect(reauthOpen).toBeFocused();
  await page.locator("#authentication").screenshot({ path: testInfo.outputPath("core-authentication-light.png") });
});

test("core form retains input and commits combobox value", async ({ page }) => {
  await seedPreferences(page, "light");
  await page.goto("/examples/workspace-reference/core-components.html#forms");

  const combo = page.getByRole("combobox", { name: "负责人" });
  await combo.fill("周");
  await expect(combo).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(combo).toHaveValue("周远");

  await page.getByRole("button", { name: "保存规则" }).click();
  await expect(page.getByText("规则已保存到当前工作区。", { exact: true })).toBeVisible();
  await expect(page.getByLabel("规则名称")).toHaveValue("价格异常复核");
  await page.getByLabel("通知频率").selectOption({ label: "每日汇总" });
  await expect(page.getByLabel("通知频率")).toHaveValue("每日汇总");
  await page.getByLabel("搜索商品").fill("SKU-024");
  await expect(page.getByText("正在筛选“SKU-024”", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "清除", exact: true }).click();
  await expect(page.getByLabel("搜索商品")).toHaveValue("");
  await expect(page.getByLabel("补充证据文件")).toHaveAttribute("accept", /application\/pdf/);
});

test("file upload fixture distinguishes validation transfer retry cancel and completion", async ({ page }, testInfo) => {
  await seedPreferences(page, "light");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/examples/workspace-reference/core-components.html#forms");

  const input = page.getByLabel("补充证据文件");
  const upload = page.locator("[data-file-upload]");
  await input.setInputFiles({ name: "retry-evidence.pdf", mimeType: "application/pdf", buffer: Buffer.from("fixture") });
  await expect(page.getByText("模拟传输失败", { exact: true })).toBeVisible({ timeout: 2_000 });
  await expect(page.getByText(/没有文件离开此页面/)).toBeVisible();
  await upload.getByRole("button", { name: "重试", exact: true }).click();
  await expect(page.getByText("本地模拟完成", { exact: true })).toBeVisible({ timeout: 2_000 });
  await expect(page.getByText(/未连接服务器/)).toBeVisible();
  await upload.screenshot({ path: testInfo.outputPath("file-upload-local-complete-light.png") });

  await upload.getByRole("button", { name: "移除", exact: true }).click();
  await input.setInputFiles({ name: "unsupported.exe", mimeType: "application/octet-stream", buffer: Buffer.from("fixture") });
  await expect(page.getByText("验证失败", { exact: true })).toBeVisible();
  await expect(page.getByText(/文件类型不受支持/)).toBeVisible();

  await upload.getByRole("button", { name: "移除", exact: true }).click();
  await input.setInputFiles({ name: "cancel-evidence.pdf", mimeType: "application/pdf", buffer: Buffer.from("fixture") });
  await expect(page.getByText("本地模拟中", { exact: true })).toBeVisible();
  await upload.getByRole("button", { name: "取消", exact: true }).click();
  await expect(page.getByText("已取消", { exact: true })).toBeVisible();
  await expect(upload.getByRole("button", { name: "重试", exact: true })).toBeVisible();

  await upload.getByRole("button", { name: "移除", exact: true }).click();
  await page.locator("[data-file-dropzone]").evaluate((dropzone) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(["one"], "one.pdf", { type: "application/pdf" }));
    dataTransfer.items.add(new File(["two"], "two.pdf", { type: "application/pdf" }));
    dropzone.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
  });
  await expect(page.getByText("一次只能选择 1 个文件。", { exact: true })).toBeVisible();

  await page.locator("[data-file-dropzone]").evaluate((dropzone) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(["fixture"], "drop-evidence.pdf", { type: "application/pdf" }));
    dropzone.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
  });
  await expect(page.getByText("drop-evidence.pdf · 7 B", { exact: true })).toBeVisible();
  await expect(page.getByText("本地模拟完成", { exact: true })).toBeVisible({ timeout: 2_000 });
});

test("core navigation separates tabs menus disclosures and pagination", async ({ page }) => {
  await seedPreferences(page, "dark");
  await page.goto("/examples/workspace-reference/core-components.html#navigation");

  const summaryTab = page.getByRole("tab", { name: "摘要" });
  await summaryTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "历史" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "历史" })).toBeVisible();

  const navigation = page.locator("#navigation");
  const menuTrigger = navigation.locator("[data-menu-trigger]");
  await menuTrigger.click();
  await expect(page.getByRole("menuitem", { name: "复制规则" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "查看审计记录" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menuTrigger).toBeFocused();
  const contextTarget = page.getByRole("button", { name: "当前对象操作" });
  await contextTarget.focus();
  await page.keyboard.press("Shift+F10");
  await expect(page.getByRole("menuitem", { name: "打开详情" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(contextTarget).toBeFocused();
  await expect(page.getByRole("navigation", { name: "面包屑" })).toContainText("价格异常");
  const tooltipTrigger = page.getByRole("button", { name: "?" });
  const tooltip = page.locator("#rule-help");
  await tooltipTrigger.focus();
  await expect(tooltip).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  const disclosure = page.locator("details");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await disclosure.locator("summary").click();
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(page.getByRole("link", { name: "1" })).toHaveAttribute("aria-current", "page");
});

test("core data display preserves labels status and loading meaning", async ({ page }, testInfo) => {
  await seedPreferences(page, "light");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/examples/workspace-reference/core-components.html#data-display");

  await expect(page.getByRole("table", { name: "等待审核的价格变化" })).toBeVisible();
  await expect(page.getByText("来源不可用", { exact: true })).toBeVisible();
  await expect(page.locator("#data-display").getByText("RULE-024", { exact: true })).toBeVisible();
  await expect(page.getByRole("tree", { name: "规则分组" })).toBeVisible();
  await expect(page.getByText("人工复核", { exact: true })).toBeVisible();
  const treeRoot = page.getByRole("treeitem", { name: /价格规则/ });
  await treeRoot.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("treeitem", { name: "异常变化" })).toBeFocused();
  await expect(page.getByLabel("正在载入下一批审核记录")).toHaveAttribute("aria-busy", "true");
  await assertNoHorizontalOverflow(page);
  await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
  await capture(page, testInfo, "core-components-light-desktop.png");
});

test("truncation preserves full values and mixed-direction access", async ({ page }, testInfo) => {
  await seedPreferences(page, "light");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/workspace-reference/core-components.html#data-display");

  const domainPreview = page.locator("[data-truncation-preview]").first();
  await expect(domainPreview).toHaveAccessibleName("monitoring-primary-endpoint.alpha-network.example.com");
  const domainToggle = page.locator("[data-truncation-toggle]").first();
  await domainToggle.click();
  await expect(domainToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#full-domain")).toBeVisible();
  await expect(domainPreview).toBeHidden();
  await expect(page.locator(".truncation-sample[dir='rtl'] bdi")).toHaveAttribute("dir", "ltr");
  await assertNoHorizontalOverflow(page);
  await page.locator(".truncation-grid").screenshot({ path: testInfo.outputPath("truncation-mobile-light.png") });
});

test("core feedback keeps progress and recovery in context", async ({ page }) => {
  await seedPreferences(page, "dark");
  await page.goto("/examples/workspace-reference/core-components.html#feedback");

  await expect(page.getByRole("alert")).toContainText("来源同步失败");
  await expect(page.getByRole("status").filter({ hasText: "审核服务将在 18:00 维护" })).toBeVisible();
  const progress = page.getByRole("progressbar");
  await expect(progress).toHaveAttribute("max", "5");
  await expect(progress).toHaveAttribute("value", "3");
  await expect(page.getByRole("meter")).toHaveAttribute("value", "68");
  await expect(page.getByRole("status").filter({ hasText: "正在读取审核历史" })).toBeVisible();
  await expect(page.getByRole("button", { name: "清除筛选" })).toBeVisible();
});

test("core motion reference exposes paired async disclosure and Sonner states", async ({ page }) => {
  await seedPreferences(page, "dark");
  await page.goto("/examples/workspace-reference/core-components.html#motion");

  const paired = page.locator("[data-motion-toggle]");
  await paired.click();
  await expect(paired).toHaveAttribute("aria-pressed", "true");
  await expect(paired).toContainText("暂停监测");

  const disclosure = page.locator("[data-motion-disclosure]");
  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#motion-details")).toHaveAttribute("data-state", "open");

  const asyncButton = page.locator("[data-motion-save]");
  await asyncButton.click();
  await expect(asyncButton).toHaveClass(/is-pending/);
  await expect(asyncButton).toHaveClass(/is-complete/, { timeout: 2_000 });
  await expect(page.getByText("视图已保存", { exact: true })).toBeVisible();

  await page.locator("[data-motion-toast]").click();
  await expect(page.getByText("正在创建导出任务", { exact: true })).toBeVisible();
  await expect(page.getByText("导出任务已创建", { exact: true })).toBeVisible({ timeout: 2_000 });
});

test("Motion Lab exposes icon, menu, feedback, disclosure, theme and Drawer behavior", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/examples/workspace-reference/motion.html");

  const paired = page.locator("[data-lab-toggle]");
  await expect(paired.locator('[data-icon-state="default"]')).toBeVisible();
  await paired.click();
  await expect(paired).toHaveAttribute("aria-pressed", "true");
  await expect(paired.locator('[data-icon-state="active"]')).toBeVisible();

  await page.getByRole("button", { name: "对象操作" }).click();
  await expect(page.getByRole("menuitem", { name: "编辑名称 E" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "复制链接 C" })).toBeFocused();
  await page.keyboard.press("Escape");

  const disclosure = page.locator("[data-lab-disclosure]");
  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#lab-details")).toHaveAttribute("data-state", "open");

  await page.locator("[data-lab-task]").click();
  await expect(page.getByText("正在创建导出任务", { exact: true })).toBeVisible();
  await expect(page.getByText("导出任务已创建", { exact: true })).toBeVisible({ timeout: 2_000 });

  const theme = page.locator("[data-lab-theme]");
  await theme.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(theme).toHaveAttribute("aria-label", "切换到夜间模式");

  await page.locator("[data-lab-drawer-open]").click();
  await expect(page.getByRole("dialog", { name: "同步规则属性" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-lab-drawer-open]")).toBeFocused();
  await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
  await page.screenshot({ path: testInfo.outputPath("motion-lab-light-desktop.png"), fullPage: true });
});

test("Motion Lab adapts Drawer to a touch-safe bottom Sheet", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/workspace-reference/motion.html");

  await page.locator("[data-lab-drawer-open]").click();
  const drawer = page.locator(".motion-drawer");
  await expect(drawer).toBeVisible();
  await expect(page.locator("[data-lab-drawer-layer]")).toHaveAttribute("data-phase", "open");
  await expect(drawer).toHaveCSS("bottom", "0px");
  await assertMinimumTouchTargets(page, ".motion-drawer button");
  await page.locator("[data-lab-drawer-close]").click();
  await expect(page.locator("[data-lab-drawer-open]")).toBeFocused();
  await expect(page.locator("[data-lab-drawer-layer]")).toHaveAttribute("data-phase", "closed");
  await assertNoHorizontalOverflow(page);
  await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
  await page.screenshot({ path: testInfo.outputPath("motion-lab-dark-mobile.png"), fullPage: true });
});

test("core overlays restore focus and contain modal tasks", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.goto("/examples/workspace-reference/core-components.html#overlays");

  const dialogOpen = page.getByRole("button", { name: "打开确认 Dialog" });
  await dialogOpen.click();
  await expect(page.getByRole("dialog", { name: "停用价格异常规则？" })).toBeVisible();
  await expect(page.getByRole("button", { name: "取消" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialogOpen).toBeFocused();

  const drawerOpen = page.getByRole("button", { name: "打开属性 Drawer" });
  await drawerOpen.click();
  await expect(drawerOpen).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("[data-drawer-layer]")).toHaveAttribute("data-state", "open");
  await expect(page.getByRole("dialog", { name: "规则属性" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "规则属性" }).getByRole("button", { name: "关闭属性 Drawer" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawerOpen).toHaveAttribute("aria-expanded", "false");
  await expect(drawerOpen).toBeFocused();

  const popoverOpen = page.getByRole("button", { name: "筛选说明" });
  await popoverOpen.click();
  await expect(page.getByRole("dialog", { name: "筛选说明" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popoverOpen).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await assertMinimumTouchTargets(page, ".overlay-triggers > button, .overlay-triggers .popover-anchor > button, .reference-actions > button, .reference-back");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "core-components-dark-mobile.png");
});

test("AI fixture preserves input through stop retry and completion", async ({ page }) => {
  await seedPreferences(page, "dark");
  await page.goto("/examples/workspace-reference/advanced-components.html#ai-assistance");

  await expect(page.getByRole("note")).toContainText("不会联系模型");
  const instruction = page.getByLabel("说明");
  await expect(instruction).toHaveValue(/根据已验证来源/);
  await page.getByRole("button", { name: "生成参考结果" }).click();
  await expect(page.getByText("正在生成本地参考结果", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "停止" }).click();
  await expect(page.getByText("已停止 · 保留部分结果", { exact: true })).toBeVisible();
  await expect(instruction).toHaveValue(/根据已验证来源/);
  await page.getByRole("button", { name: "重试", exact: true }).click();
  await expect(page.getByText("已完成 · 本地基准", { exact: true })).toBeVisible({ timeout: 2_000 });
  await expect(page.getByText("仍需确认", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /外部渠道快照/ })).toHaveAttribute("href", "#evidence-3");
});

test("review separates acceptance execution and task creation", async ({ page }) => {
  await seedPreferences(page, "light");
  await page.goto("/examples/workspace-reference/advanced-components.html#review");

  await page.getByRole("button", { name: "接受建议" }).click();
  await expect(page.getByText("已接受 · 尚未执行", { exact: true })).toBeVisible();
  await expect(page.getByText("源数据尚未修改", { exact: false })).toBeVisible();

  const createTask = page.getByRole("button", { name: "确认并创建发布任务" });
  await expect(createTask).toBeDisabled();
  await page.getByRole("checkbox", { name: /核对目标/ }).check();
  await expect(createTask).toBeEnabled();
  await createTask.click();
  await expect(page.getByText("发布任务已在本地基准中创建", { exact: false })).toBeVisible();
  await expect(page.getByText("TASK-NEW", { exact: false })).toBeVisible();
  await expect(page.locator("[data-created-cancel]")).toBeFocused();
  await page.locator("[data-created-cancel]").click();
  await expect(page.getByText("排队任务已取消", { exact: false })).toBeVisible();
});

test("media review keeps selection and approval distinct", async ({ page }) => {
  await seedPreferences(page, "dark");
  await page.goto("/examples/workspace-reference/advanced-components.html#media-review");

  await expect(page.getByRole("img", { name: /商品主图本地占位预览/ })).toBeVisible();
  const select = page.getByRole("button", { name: "已选择" });
  await expect(select).toHaveAttribute("aria-pressed", "true");
  await select.click();
  await expect(page.getByText("资产未选择，也未批准。", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "批准发布" }).click();
  await expect(page.getByText("渠道 B 的裁切仍待处理", { exact: false })).toBeVisible();
  await expect(page.getByText("品牌素材已授权", { exact: true })).toBeVisible();
});

test("background task fixture exposes durable recovery states", async ({ page }) => {
  await seedPreferences(page, "dark");
  await page.goto("/examples/workspace-reference/advanced-components.html#background-work");

  await expect(page.getByRole("table", { name: "后台任务队列" })).toBeVisible();
  await page.getByRole("button", { name: "重试失败任务" }).click();
  await expect(page.getByText("排队重试", { exact: true })).toBeVisible();
  await expect(page.getByText("原始筛选保持不变", { exact: false })).toBeVisible();
  await page.locator("[data-task-cancel]").click();
  await expect(page.getByText("取消请求中", { exact: true })).toBeVisible();
});

test("chart provides keyboard points and a semantic table fallback", async ({ page }, testInfo) => {
  await seedPreferences(page, "light");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/examples/workspace-reference/advanced-components.html#chart");

  await expect(page.getByRole("img", { name: "近 7 日 Field Jacket 商品价格" })).toBeVisible();
  const firstPoint = page.locator(".chart-points circle").first();
  await firstPoint.focus();
  await expect(firstPoint).toHaveAttribute("aria-label", "7 月 7 日，CNY 1,399");
  await page.getByRole("button", { name: "数据表" }).click();
  await expect(page.getByRole("table", { name: "近 7 日 Field Jacket 商品价格数据" })).toBeVisible();
  await expect(page.getByRole("img", { name: "近 7 日 Field Jacket 商品价格" })).toBeHidden();
  await assertNoHorizontalOverflow(page);
  await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
  await capture(page, testInfo, "advanced-components-light-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("[data-theme-switch]").click();
  await page.getByRole("button", { name: "图表", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await assertMinimumTouchTargets(page, ".reference-actions > button, .reference-back, .composer-actions button, .review-actions button, .media-actions button, .task-row button, .chart-toolbar button");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "advanced-components-dark-mobile.png");
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
  const toolbar = page.getByRole("toolbar", { name: "编辑操作" });
  const undo = toolbar.getByRole("button", { name: "撤销" });
  await undo.focus();
  await page.keyboard.press("ArrowRight");
  await expect(toolbar.getByRole("button", { name: "重做" })).toBeFocused();
  const toolbarMore = toolbar.getByRole("button", { name: "更多" });
  await toolbarMore.click();
  await expect(page.getByRole("menuitem", { name: "导出" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toolbarMore).toBeFocused();

  const split = page.getByRole("separator", { name: "调整对象面板宽度" });
  const splitBounds = await split.boundingBox();
  await page.mouse.move(splitBounds.x + splitBounds.width / 2, splitBounds.y + splitBounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(splitBounds.x + splitBounds.width / 2 + 30, splitBounds.y + splitBounds.height / 2);
  await page.mouse.up();
  expect(Number(await split.getAttribute("aria-valuenow"))).toBeGreaterThan(210);
  await split.dblclick();
  await expect(split).toHaveAttribute("aria-valuenow", "210");
  await split.focus();
  await page.keyboard.press("ArrowRight");
  await expect(split).toHaveAttribute("aria-valuenow", "220");
  await page.keyboard.press("End");
  await expect(split).toHaveAttribute("aria-valuenow", "320");
  await page.reload();
  await expect(page.getByRole("separator", { name: "调整对象面板宽度" })).toHaveAttribute("aria-valuenow", "320");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "canvas-dark-desktop.png");

  await page.setViewportSize({ width: 900, height: 844 });
  await page.reload();
  await expect(page.locator(".layer-panel")).toBeVisible();
  await expect(page.locator(".property-panel")).toBeHidden();
  const compactPropertiesOpen = page.locator("[data-canvas-properties-open]");
  await expect(compactPropertiesOpen).toBeVisible();
  await compactPropertiesOpen.click();
  await expect(page.locator(".property-panel")).toBeVisible();
  await expect(page.locator("[data-canvas-properties-close]")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(compactPropertiesOpen).toBeFocused();
  await assertNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator(".layer-panel")).toBeHidden();
  await expect(page.locator(".property-panel")).toBeHidden();
  await assertMinimumTouchTargets(page, ".canvas-toolbar button, .canvas-actions > button, .tool-rail button");
  await expect(page.getByRole("separator", { name: "调整对象面板宽度" })).toBeHidden();
  const layersOpen = page.locator("[data-canvas-layers-open]");
  const layersClose = page.locator("[data-canvas-layers-close]");
  await expect(layersOpen).toBeVisible();
  await layersOpen.click();
  await expect(page.locator(".layer-panel")).toBeVisible();
  await expect(layersClose).toBeFocused();
  await layersClose.click();
  await expect(page.locator(".layer-panel")).toBeHidden();
  await expect(layersOpen).toBeFocused();
  const propertiesOpen = page.locator("[data-canvas-properties-open]");
  const propertiesClose = page.locator("[data-canvas-properties-close]");
  await propertiesOpen.click();
  await expect(page.locator(".property-panel")).toBeVisible();
  await expect(propertiesClose).toBeFocused();
  await propertiesClose.click();
  await expect(page.locator(".property-panel")).toBeHidden();
  await expect(propertiesOpen).toBeFocused();
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "canvas-dark-mobile.png", false);
});
