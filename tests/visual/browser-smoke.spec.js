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

test("cross-browser smoke preserves navigation focus and advanced states", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-site-ready", "true");
  await expect(page).toHaveTitle("KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const search = page.getByRole("button", { name: /Search sections/ });
  await search.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Search commands" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(search).toBeFocused();

  await page.getByRole("switch").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.goto("/examples/workspace-reference/advanced-components.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toHaveAttribute("data-fixture-ready", "true");
  await expect(page.getByRole("heading", { name: "AI 与专业工作流组件" })).toBeVisible();
  await expect(page.getByRole("table", { name: "后台任务队列" })).toBeVisible();
  const accept = page.getByRole("button", { name: "接受建议" });
  await accept.scrollIntoViewIfNeeded();
  await accept.click();
  await expect(page.getByText("已接受 · 尚未执行", { exact: true })).toBeVisible();
});
