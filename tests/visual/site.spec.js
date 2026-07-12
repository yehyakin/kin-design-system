import { expect, test } from "@playwright/test";

test("showcase exposes the English contract and live foundations", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Clear interfaces");
  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();
  await expect(page.getByRole("link", { name: "中文" })).toHaveAttribute("hreflang", "zh-CN");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).resolves.toBe(true);
  await page.screenshot({ path: "test-results/playwright/site-dark-desktop.png", fullPage: true });
});

test("showcase theme contrast and language preferences work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.evaluate(() => localStorage.getItem("kin-site-theme"))).resolves.toBe("light");
  await page.getByRole("button", { name: "Increase contrast" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await page.goto("/zh/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("清楚的界面");
  await page.screenshot({ path: "test-results/playwright/site-light-zh.png", fullPage: true });
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
  await page.keyboard.press("Escape");
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
