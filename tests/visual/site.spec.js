import { expect, test } from "@playwright/test";

test("showcase exposes the English contract and live foundations", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Clear interfaces");
  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Delivery model/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Search and results" })).toHaveAttribute("href", "examples/page-patterns/search.html");
  await expect(page.getByRole("link", { name: /Authentication and access/ })).toHaveAttribute("href", "examples/workspace-reference/core-components.html#authentication");
  await expect(page.getByRole("link", { name: /Motion Lab/ }).first()).toHaveAttribute("href", "examples/workspace-reference/motion.html");
  await expect(page.locator('.language-menu a[hreflang="zh-CN"]')).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator('svg.lucide')).not.toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).resolves.toBe(true);
  await page.screenshot({ path: "test-results/playwright/site-dark-desktop.png", fullPage: true });
});

test("showcase theme contrast and language preferences work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("switch").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.evaluate(() => localStorage.getItem("kin-site-theme"))).resolves.toBe("light");
  await page.getByRole("button", { name: "Increase contrast" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await page.getByRole("button", { name: "Choose language" }).click();
  await page.getByRole("menuitem", { name: "中文" }).click();
  await page.waitForURL("**/zh/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("清楚的界面");
  await expect(page.getByRole("link", { name: "搜索与结果" })).toHaveAttribute("href", "../examples/page-patterns/search.html");
  await expect(page.getByRole("link", { name: /登录与访问/ })).toHaveAttribute("href", "../examples/workspace-reference/core-components.html#authentication");
  await expect(page.getByRole("link", { name: /动效实验室/ }).first()).toHaveAttribute("href", "../examples/workspace-reference/motion.html");
  await page.screenshot({ path: "test-results/playwright/site-light-zh.png", fullPage: true });
});

test("GitHub Pages 404 preserves theme and locale preferences", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    localStorage.setItem("kin-site-theme", "system");
    localStorage.setItem("kin-site-locale", "en");
  });

  const response = await page.goto("/kin-design-system/missing-reference?lang=zh");
  expect(response?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("当前设计合同中没有这个页面。");
  await expect(page.getByRole("link", { name: "KIN 设计系统首页" })).toHaveAttribute("href", "/kin-design-system/zh/");

  const themeSwitch = page.locator("[data-theme-switch]");
  await expect(themeSwitch).toHaveAttribute("role", "switch");
  await expect(themeSwitch).toHaveAttribute("aria-checked", "false");
  await themeSwitch.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.evaluate(() => localStorage.getItem("kin-site-theme"))).resolves.toBe("dark");

  const languageTrigger = page.locator("[data-language-trigger]");
  await expect(languageTrigger).toHaveAttribute("aria-haspopup", "menu");
  await languageTrigger.click();
  await expect(page.locator('[data-404-language="zh"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(languageTrigger).toBeFocused();
  await expect(page.locator("[data-language-menu]")).toBeHidden();
});

test("Sonner loads on demand for user-initiated feedback", async ({ page }) => {
  await page.goto("/");
  await expect(page.evaluate(() => performance.getEntriesByType("resource").some((entry) => entry.name.includes("sonner-island")))).resolves.toBe(false);
  await page.getByRole("button", { name: "Show notification" }).click();
  await expect(page.getByText("Reference exported", { exact: true })).toBeVisible();
  await expect(page.evaluate(() => performance.getEntriesByType("resource").some((entry) => entry.name.includes("sonner-island")))).resolves.toBe(true);
  await page.getByRole("button", { name: "View", exact: true }).click();
  await expect(page.getByText("Export opened", { exact: true })).toBeVisible();
});

test("showcase command menu filters and restores focus", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: /Search sections/ });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const search = page.getByRole("searchbox", { name: "Search commands" });
  await expect(search).toBeFocused();
  await search.fill("Tokens");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("link", { name: /DTCG Tokens/ })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /AI behavior/ })).toBeHidden();
  await search.fill("Delivery model");
  await expect(dialog.getByRole("link", { name: /Delivery model/ })).toBeVisible();
  await search.fill("system theme");
  await dialog.getByRole("button", { name: /Use system theme/ }).click();
  await expect(page.evaluate(() => localStorage.getItem("kin-site-theme"))).resolves.toBe("system");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("pattern tabs support arrow keys", async ({ page }) => {
  await page.goto("/#patterns");
  const intelligence = page.getByRole("tab", { name: "Intelligence" });
  await intelligence.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Information" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Information" })).toBeVisible();
});

test("showcase mobile navigation and touch targets remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open navigation" });
  const box = await menu.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await menu.click();
  await expect(page.locator("body")).toHaveClass(/nav-open/);
  await page.getByRole("link", { name: "Foundations" }).click();
  await expect(page.locator("body")).not.toHaveClass(/nav-open/);
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).resolves.toBe(true);
  await page.screenshot({ path: "test-results/playwright/site-mobile.png", fullPage: true });
});
