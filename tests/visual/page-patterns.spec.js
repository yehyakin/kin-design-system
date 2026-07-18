import { expect, test } from "@playwright/test";

const browserErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  const errors = [];
  browserErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error" || (message.type() === "warning" && /lucide|icon|createicons/i.test(message.text()))) {
      errors.push(`console: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

async function seedPreferences(page, theme = "light", language = "zh-CN") {
  await page.addInitScript(({ selectedTheme, selectedLanguage }) => {
    localStorage.setItem("kin-reference-theme", selectedTheme);
    localStorage.setItem("kin-reference-locale", selectedLanguage === "en" ? "en" : "zh");
  }, { selectedTheme: theme, selectedLanguage: language });
}

async function assertNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

async function assertMinimumTouchTargets(page, selector) {
  const targets = await page.locator(selector).evaluateAll((elements) => elements
    .filter((element) => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0 && bounds.height > 0;
    })
    .map((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        height: bounds.height,
        label: element.getAttribute("aria-label") || element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) || element.tagName,
        width: bounds.width,
      };
    }));
  expect(targets.length).toBeGreaterThan(0);
  expect(targets.filter(({ height, width }) => height < 44 || width < 44)).toEqual([]);
}

async function capture(page, testInfo, name) {
  await page.screenshot({ path: testInfo.outputPath(name), fullPage: true });
}

async function renderedTextLines(locator) {
  return locator.evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const lines = [];
    let node = walker.nextNode();

    while (node) {
      for (let index = 0; index < node.textContent.length; index += 1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const top = Math.round(rect.top);
          const line = lines.find((candidate) => Math.abs(candidate.top - top) <= 1);
          if (line) line.text += node.textContent[index];
          else lines.push({ text: node.textContent[index], top });
        }
      }
      node = walker.nextNode();
    }

    return lines
      .sort((left, right) => left.top - right.top)
      .map(({ text }) => text.trim().replace(/\s+/g, " "))
      .filter(Boolean);
  });
}

const accessTitleCases = [
  { height: 900, language: "zh-CN", theme: "light", width: 1440 },
  { height: 900, language: "en", theme: "dark", width: 1440 },
  { height: 800, language: "zh-CN", theme: "dark", width: 1280 },
  { height: 800, language: "en", theme: "light", width: 1280 },
  { height: 844, language: "zh-CN", theme: "dark", width: 390 },
  { height: 844, language: "en", theme: "light", width: 390 },
];

for (const { height, language, theme, width } of accessTitleCases) {
  test(`access title avoids orphaned lines at ${width}px in ${language} ${theme}`, async ({ page }) => {
    await seedPreferences(page, theme, language);
    await page.setViewportSize({ width, height });
    await page.goto(`/examples/page-patterns/access.html?lang=${language}`);

    const title = page.locator("#access-context-title");
    await expect(title).toBeVisible();
    const lines = await renderedTextLines(title);
    expect(lines.length).toBeGreaterThan(0);

    if (language === "zh-CN") {
      expect(lines.filter((line) => Array.from(line.replace(/\s/g, "")).length === 1)).toEqual([]);
    } else {
      expect(lines.filter((line) => line.split(/\s+/).length === 1)).toEqual([]);
    }

    await assertNoHorizontalOverflow(page);
  });
}

for (const pattern of ["access", "onboarding", "settings", "system", "search", "support", "scheduling"]) {
  test(`${pattern} exposes the complete theme and language preference contract`, async ({ page }) => {
    await seedPreferences(page, "light");
    await page.goto(`/examples/page-patterns/${pattern}.html`);

    const languageTrigger = page.locator("[data-language-trigger]");
    const languageMenu = page.locator("[data-language-menu]");
    await expect(languageTrigger).toHaveAttribute("aria-haspopup", "menu");
    await expect(languageTrigger.locator("svg.lucide-languages")).toBeVisible();
    await languageTrigger.click();
    await expect(languageMenu).toHaveAttribute("data-state", "open");
    await expect(page.locator('[data-language-option="zh-CN"]')).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator('[data-language-option="en"]')).toBeFocused();
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
    await expect(page.locator('[data-theme-option="system"]')).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
    await expect(page.locator('[data-theme-option="system"]')).toHaveAttribute("aria-checked", "true");
    await expect(themeMenuTrigger).toBeFocused();
  });
}

test("access flow covers sign-in, recovery, and contextual reauthentication", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/page-patterns/access.html");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const password = page.locator("#sign-in-password");
  const passwordToggle = page.locator("[data-password-toggle]");
  await expect(password).toHaveAttribute("type", "password");
  await expect(passwordToggle.locator("svg")).toHaveCount(2);
  await passwordToggle.click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(passwordToggle).toHaveAttribute("aria-pressed", "true");
  await expect(passwordToggle).toHaveAccessibleName("隐藏密码");
  await expect(password).toBeFocused();
  await passwordToggle.click();
  await expect(password).toHaveAttribute("type", "password");

  const provider = page.locator(".provider-action");
  await expect(provider).toBeDisabled();
  await expect(provider).toHaveAttribute("aria-describedby", "sso-unavailable");
  await expect(page.locator("#sso-unavailable")).toContainText("未配置组织 SSO");

  const fixtureSelect = page.locator("[data-auth-fixture-select]");
  const fixtureStatus = page.locator("[data-auth-fixture-status]");
  for (const [state, message] of [
    ["throttled", "何时可以安全重试"],
    ["locked", "管理员或恢复路径"],
    ["provider-unavailable", "组织 SSO 暂不可用"],
    ["offline", "保留输入"],
    ["expired", "重新发起验证"],
    ["verified", "未创建真实会话"],
    ["session-expired", "保留当前工作"],
  ]) {
    await fixtureSelect.selectOption(state);
    await expect(page.locator("[data-auth-fixture]")).toHaveAttribute("data-fixture-state", state);
    await expect(fixtureStatus).toContainText(message);
  }
  await fixtureSelect.selectOption("idle");

  const languageTrigger = page.locator("[data-language-trigger]");
  await expect(languageTrigger).toHaveAttribute("aria-haspopup", "menu");
  await languageTrigger.click();
  await expect(page.locator("[data-language-menu]")).toHaveAttribute("data-state", "open");
  await expect(page.locator('[data-language-option="zh-CN"]')).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-language-option="en"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(languageTrigger).toBeFocused();
  await expect(page.locator("[data-language-menu]")).toBeHidden();

  const themeSwitch = page.locator("[data-theme-switch]");
  await expect(themeSwitch.locator(".theme-switch-icon svg")).toHaveCount(2);
  await expect(themeSwitch.locator(".theme-switch-track")).toBeVisible();
  const themeMenuTrigger = page.locator("[data-theme-menu-trigger]");
  await expect(themeMenuTrigger).toHaveAttribute("aria-haspopup", "menu");
  await themeMenuTrigger.click();
  await page.locator('[data-theme-option="system"]').click();
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await themeMenuTrigger.click();
  await page.locator('[data-theme-option="dark"]').click();
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "dark");

  await page.locator("#sign-in-email").fill("");
  await password.fill("");
  await page.locator("[data-sign-in-form]").getByRole("button", { name: "继续" }).click();
  await expect(page.locator("#sign-in-email")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#sign-in-email-error")).toBeVisible();
  await expect(password).toHaveAttribute("aria-describedby", /sign-in-password-error/);
  await expect(page.locator("[data-sign-in-status]")).toBeFocused();
  await page.locator("#sign-in-email").fill("not-an-email");
  await expect(page.locator("#sign-in-email-error")).toContainText("有效的邮箱地址");
  await page.locator("#sign-in-email").fill("operator@example.com");
  await password.fill("reference-only");
  await expect(page.locator("#sign-in-email-error")).toBeHidden();
  await page.locator("[data-sign-in-form]").getByRole("button", { name: "继续" }).click();
  await expect(page.locator("[data-sign-in-status]")).toContainText("未连接身份服务");

  await page.locator("[data-recovery-open]").click();
  await expect(page.locator("[data-recovery-view]")).toBeVisible();
  await page.locator("[data-recovery-form]").getByRole("button", { name: "发送恢复说明" }).click();
  await expect(page.locator("#recovery-email")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#recovery-email-error")).toBeVisible();
  await expect(page.locator("[data-recovery-status]")).toBeFocused();
  await page.locator("#recovery-email").fill("operator@example.com");
  await page.locator("[data-recovery-form]").getByRole("button", { name: "发送恢复说明" }).click();
  await expect(page.locator("[data-recovery-status]")).toContainText("如果该账号存在");
  await page.locator("[data-recovery-back]").click();

  const reauthOpen = page.locator("[data-reauth-open]");
  const reauthDialog = page.locator("[data-reauth-dialog]");
  const accessScroll = await page.evaluate(() => scrollY);
  await reauthOpen.click();
  await expect(page.locator("body")).toHaveCSS("position", "fixed");
  await expect(reauthDialog).toBeVisible();
  await expect(reauthDialog).toHaveAttribute("data-state", "open");
  await expect(page.locator("#reauth-password")).toBeFocused();
  await reauthDialog.getByRole("button", { name: "验证并继续" }).click();
  await expect(page.locator("#reauth-password")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#reauth-password-error")).toBeVisible();
  await expect(page.locator("[data-reauth-status]")).toBeFocused();
  await page.locator("[data-reauth-cancel]").click();
  await expect(reauthDialog).toHaveAttribute("data-state", "closing");
  await expect(reauthDialog).toHaveAttribute("inert", "");
  await expect(reauthDialog).toHaveAttribute("aria-hidden", "true");
  await expect(reauthDialog).toBeHidden();
  await expect(reauthOpen).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(accessScroll);

  await reauthOpen.click();
  await page.locator("[data-reauth-cancel]").click();
  await expect(reauthDialog).toHaveAttribute("data-state", "closing");
  await reauthOpen.evaluate((element) => element.click());
  await expect(reauthDialog).toHaveAttribute("data-state", "open");
  await expect(reauthDialog).not.toHaveAttribute("inert", "");
  await expect(page.locator("body")).toHaveCSS("position", "fixed");
  await expect(page.locator("#reauth-password")).toBeFocused();
  await page.waitForTimeout(300);
  await expect(reauthDialog).toBeVisible();
  await expect(reauthDialog).toHaveAttribute("data-state", "open");
  await page.locator("[data-reauth-cancel]").click();
  await expect(reauthDialog).toBeHidden();
  await expect(reauthOpen).toBeFocused();
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-access-dark-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await assertMinimumTouchTargets(page, "button, .flow-button");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-access-dark-mobile.png");
});

test("onboarding validates required data and resumes the current step", async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.removeItem("kin-reference-onboarding-step-v1"));
  await seedPreferences(page, "light");
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto("/examples/page-patterns/onboarding.html");

  await page.locator("#workspace-name").fill("");
  await page.locator('[data-onboarding-step="1"] [data-onboarding-next]').click();
  await expect(page.locator('[data-onboarding-step="1"]')).toBeVisible();
  await page.locator("#workspace-name").fill("Northstar Operations");
  await page.locator('[data-onboarding-step="1"] [data-onboarding-next]').click();
  await expect(page.locator('[data-onboarding-step="2"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-onboarding-step="2"]')).toBeVisible();
  await page.locator('[data-onboarding-step="2"] [data-onboarding-next]').click();
  await page.locator('[data-onboarding-step="3"] [data-onboarding-next]').click();
  await expect(page.locator('[data-onboarding-step="4"]')).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-onboarding-light-complete.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await assertMinimumTouchTargets(page, "button, .flow-button");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-onboarding-light-mobile.png");
});

test("settings preserve unsaved state, update preferences, and confirm session revocation", async ({ page }, testInfo) => {
  await seedPreferences(page, "light");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/examples/page-patterns/settings.html");

  const save = page.locator("[data-settings-save]");
  await expect(save).toBeDisabled();
  await page.locator("#profile-name").fill("林简宁");
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.locator("[data-settings-status]")).toContainText("已保存");

  await page.locator('[data-settings-nav="appearance"]').click();
  await page.locator('[name="appearance-theme"][value="dark"]').check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("[data-language-trigger]").click();
  await page.locator('[data-language-option="en"]').click();
  await expect(page.getByRole("heading", { name: "Appearance", level: 2 })).toBeVisible();

  await page.locator('[data-settings-nav="security"]').click();
  const revokeOpen = page.locator("[data-revoke-open]");
  await revokeOpen.click();
  await page.locator("[data-revoke-cancel]").click();
  await expect(revokeOpen).toBeFocused();
  await revokeOpen.click();
  await page.locator("[data-revoke-confirm]").click();
  await expect(page.locator("[data-session-status]")).toContainText("revoked");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-settings-dark-security.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await assertMinimumTouchTargets(page, "button, .flow-button");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-settings-dark-mobile.png");
});

test("system states preserve context and expose distinct recovery actions", async ({ page }, testInfo) => {
  await seedPreferences(page, "light");
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto("/examples/page-patterns/system.html");

  await expect(page.locator("[data-system-code]")).toHaveText("401");
  await page.locator('[data-system-state="not-found"]').click();
  await expect(page).toHaveURL(/#not-found$/);
  await expect(page.locator("[data-system-code]")).toHaveText("404");
  await expect(page.locator("[data-system-title]")).toContainText("找不到");
  await page.locator('[data-system-state="conflict"]').click();
  await expect(page.locator("[data-system-code]")).toHaveText("409");
  await expect(page.locator("[data-system-title]")).toContainText("发生变化");
  await page.locator("[data-system-primary]").click();
  await expect(page.locator("[data-system-status]")).toContainText("实际产品");
  await page.locator('[data-system-state="offline"]').click();
  await expect(page.locator("[data-system-code]")).toHaveText("OFFLINE");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-system-light-offline.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await assertMinimumTouchTargets(page, "button, .flow-button");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-system-light-mobile.png");
});

test("search preserves URL state and separates partial empty error and selected results", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto("/examples/page-patterns/search.html");

  await page.locator("[data-theme-switch]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator("[data-theme-switch]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  const query = page.locator("[data-search-query]");
  await query.fill("权限");
  await page.locator("[data-search-form]").getByRole("button", { name: "搜索" }).click();
  await expect(page).toHaveURL(/q=%E6%9D%83%E9%99%90/);
  await expect(page.locator("[data-search-summary]")).toHaveText("2 条结果");
  await expect(page.locator("[data-search-summary]")).toBeFocused();

  await page.keyboard.press("j");
  await expect(page.locator('[data-result-id="REC-204"] [data-search-result-link]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/selected=REC-204/);
  await expect(page.locator("[data-search-detail-title]")).toHaveText("工作区角色复核");
  await page.locator('[data-result-id="REC-055"] [data-search-result-link]').click();
  await expect(page.locator("[data-search-detail-title]")).toHaveText("受限审计记录");
  await page.goBack();
  await expect(page.locator("[data-search-detail-title]")).toHaveText("工作区角色复核");

  await page.locator('[name="scope"][value="document"]').check();
  await page.locator("[data-search-filter-form]").getByRole("button", { name: "应用筛选" }).click();
  await expect(page).toHaveURL(/scope=document/);
  await expect(page).not.toHaveURL(/selected=/);
  await expect(page.locator("[data-search-selection-status]")).toContainText("详情已关闭");
  await expect(page.locator("[data-search-empty]")).toBeVisible();
  await expect(query).toHaveValue("权限");
  await page.locator("[data-search-reset-all]").click();
  await expect(query).toHaveValue("");
  await expect(page.locator("[data-search-summary]")).toHaveText("4 条结果");

  const state = page.locator("[data-search-state]");
  await state.selectOption("partial");
  await expect(page.locator("[data-search-state-banner]")).toContainText("部分来源暂时不可用");
  await expect(page.locator("[data-search-summary]")).toContainText("3 条可用结果");
  await expect(page.locator('[data-result-id="TASK-074"]')).toBeHidden();
  await state.selectOption("stale");
  await expect(page.locator("[data-search-state-banner]")).toContainText("过期索引");
  await state.selectOption("no-results");
  await expect(page.locator("[data-search-empty]")).toBeVisible();
  await expect(page.locator("[data-search-summary]")).toHaveText("0 条结果");
  await state.selectOption("error");
  await expect(page.locator("[data-search-error]")).toBeVisible();
  await expect(page.locator("[data-search-empty]")).toBeHidden();
  await expect(page.locator("[data-search-summary]")).toHaveText("结果不可用");
  await page.locator("[data-search-retry]").click();
  await expect(page.locator("[data-search-summary]")).toHaveText("4 条结果");

  await page.locator("[data-search-sort]").selectOption("name");
  await expect(page.locator("[data-search-result]:visible").first()).toHaveAttribute("data-result-id", "TASK-074");
  await page.locator('[data-result-id="REC-204"] [data-search-result-link]').click();
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-search-dark-desktop.png");

  await page.locator("[data-language-trigger]").click();
  await page.locator('[data-language-option="en"]').click();
  await expect(page.getByRole("heading", { name: "Find records, documents, and tasks", level: 1 })).toBeVisible();
  await expect(page.locator("[data-search-detail-title]")).toHaveText("Workspace role review");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.evaluate(() => scrollTo(0, 0));
  await expect(page.locator("[data-search-detail-title]")).toHaveText("工作区角色复核");
  await page.locator("[data-search-filter-toggle]").click();
  await expect(page.locator("[data-search-filters]")).toBeVisible();
  await assertMinimumTouchTargets(page, ".search-query-field input, .search-compact-control select, .search-filters label, button, .flow-button");
  await assertNoHorizontalOverflow(page);
  await page.evaluate(() => scrollTo(0, 0));
  await capture(page, testInfo, "page-search-dark-mobile.png");
});

test("help and support separates guidance requests tickets and sourced status", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/examples/page-patterns/support.html");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("[data-help-search]").fill("权限");
  await expect(page.locator("[data-help-summary]")).toContainText("1 条");
  await page.locator("[data-help-article]:visible > button").click();
  await expect(page.locator("[data-help-article]:visible .support-article-answer")).toBeVisible();
  await page.locator("[data-help-search]").fill("不存在的帮助主题");
  await expect(page.locator("[data-help-empty]")).toBeVisible();

  await page.locator('[data-support-nav="request"]').click();
  await expect(page).toHaveURL(/#request$/);
  await page.locator("#request-type").selectOption("data");
  await page.locator("#affected-reference").fill("TASK-204");
  await page.locator("#request-description").fill("导出结果缺少两条记录，刷新和重新筛选后仍然缺失。");
  await page.locator('[name="safe-content"]').check();
  await page.locator("[data-support-request-form]").getByRole("button", { name: "提交参考请求" }).click();
  await expect(page.locator("[data-support-request-status]")).toContainText("未发送");
  await expect(page.locator("[data-support-request-result]")).toContainText("REF-SUP-2407");

  await page.locator('[data-support-nav="tickets"]').click();
  await page.locator('[data-ticket-select="SUP-1037"]').click();
  await expect(page.locator('[data-ticket-detail="SUP-1037"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-support-section="tickets"]')).toBeVisible();

  await page.locator('[data-support-nav="status"]').click();
  await expect(page.locator("[data-support-status-feedback]")).toBeEmpty();
  await page.locator("[data-support-status-source]").click();
  await expect(page.locator("[data-support-status-feedback]")).toContainText("没有配置外部状态服务");
  await page.locator("[data-language-trigger]").click();
  await page.locator('[data-language-option="en"]').click();
  await expect(page.getByRole("heading", { name: "Service status and source", level: 2 })).toBeVisible();

  await page.locator('[data-support-nav="help"]').click();
  await expect(page.locator('[data-support-nav="help"]')).toHaveAttribute("aria-current", "page");
  await expect(page.locator('[data-support-nav="status"]')).not.toHaveAttribute("aria-current", "page");
  await expect(page.locator("[data-help-empty]")).toBeHidden();
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-support-dark-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await assertMinimumTouchTargets(page, "button, .flow-button");
  await assertMinimumTouchTargets(page, '.support-section input:not([type="checkbox"]), .support-section select, .support-section textarea, .support-confirm');
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-support-dark-mobile.png");
});

test("scheduling preserves period, selection, Sidebar, Sidecar, agenda, and responsive focus", async ({ page }, testInfo) => {
  await seedPreferences(page, "dark");
  await page.addInitScript(() => localStorage.removeItem("kin-reference-sidebar-collapsed-v1"));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/page-patterns/scheduling.html");

  const shell = page.locator("[data-schedule-shell]");
  const primary = page.locator("[data-schedule-primary]");
  const sidecar = page.locator("[data-schedule-sidecar]");
  const conflict = page.locator('[data-event-id="SCH-103"]');
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("heading", { name: "发布与审核排期", level: 1 })).toBeVisible();
  await expect(page.locator("[data-schedule-period]")).toContainText("2026");

  await page.locator("[data-theme-switch]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator("[data-theme-switch]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  const expandedWidth = await primary.evaluate((element) => element.getBoundingClientRect().width);
  await page.locator("[data-schedule-collapse]").click();
  await expect(shell).toHaveAttribute("data-sidebar-collapsed", "true");
  await expect(page.locator("[data-schedule-collapse]")).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => primary.evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(expandedWidth + 100);
  const collapsedWidth = await primary.evaluate((element) => element.getBoundingClientRect().width);
  expect(collapsedWidth).toBeGreaterThan(expandedWidth);

  await conflict.click();
  await expect(page).toHaveURL(/selected=SCH-103/);
  await expect(shell).toHaveAttribute("data-sidecar-open", "true");
  await expect(sidecar).toHaveAttribute("role", "region");
  await expect(sidecar).not.toHaveAttribute("aria-modal", "true");
  await expect(page.locator("[data-sidecar-title]")).toHaveText("主图审核");
  await expect(page.locator("[data-sidecar-title]")).toBeFocused();
  await expect(primary).not.toHaveAttribute("inert", "");
  await expect.poll(() => primary.evaluate((element) => element.getBoundingClientRect().width)).toBeLessThan(collapsedWidth - 250);

  await page.locator("[data-sidecar-close]").click();
  await expect(sidecar).toHaveAttribute("aria-hidden", "true");
  await expect(page).not.toHaveURL(/selected=/);
  await expect(conflict).toBeFocused();

  await page.locator("[data-schedule-next]").click();
  await expect(page).toHaveURL(/week=2026-07-20/);
  await expect(page.locator("[data-schedule-empty]")).toBeVisible();
  await page.locator("[data-schedule-today]").click();
  await expect(page).not.toHaveURL(/week=/);
  await page.locator('[data-schedule-view-button="agenda"]').click();
  await expect(page).toHaveURL(/view=agenda/);
  await expect(page.locator("[data-schedule-agenda]")).toBeVisible();
  await page.locator("[data-language-trigger]").click();
  await page.locator('[data-language-option="en"]').click();
  await expect(page.getByRole("heading", { name: "Publication and review schedule", level: 1 })).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-scheduling-dark-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator("[data-schedule-agenda]")).toBeVisible();
  const mobileItem = page.locator('[data-agenda-event="SCH-103"]');
  await mobileItem.click();
  await expect(sidecar).toHaveAttribute("role", "dialog");
  await expect(sidecar).toHaveAttribute("aria-modal", "true");
  await expect(primary).toHaveAttribute("inert", "");
  await expect(page.locator("body")).toHaveClass(/schedule-modal-open/);
  await page.keyboard.press("Shift+Tab");
  await expect(sidecar.locator(":focus")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sidecar).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("body")).not.toHaveClass(/schedule-modal-open/);
  await expect(page.locator('[data-agenda-event="SCH-103"]')).toBeFocused();
  await assertMinimumTouchTargets(page, ".schedule-mobile-nav a, .schedule-sidecar button, .schedule-toolbar button, .schedule-filter select, .schedule-agenda-item");
  await assertNoHorizontalOverflow(page);
  await capture(page, testInfo, "page-scheduling-dark-mobile.png");
});
