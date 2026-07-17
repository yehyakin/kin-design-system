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

  await page.goto("/examples/page-patterns/access.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-sign-in-view]")).toBeVisible();
  await page.locator("[data-recovery-open]").click();
  await expect(page.locator("[data-recovery-view]")).toBeVisible();

  await page.goto("/examples/page-patterns/system.html#conflict", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-system-code]")).toHaveText("409");
  await expect(page.locator("[data-system-primary]")).toBeVisible();

  await page.goto("/examples/page-patterns/support.html#tickets", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-support-section="tickets"]')).toBeVisible();
  await page.locator('[data-ticket-select="SUP-1037"]').click();
  await expect(page.locator('[data-ticket-detail="SUP-1037"]')).toBeVisible();

  await page.goto("/examples/page-patterns/search.html?q=export", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-search-query]")).toHaveValue("export");
  await expect(page.locator("[data-search-summary]")).toHaveText("1 条结果");
  await page.locator('[data-result-id="DOC-118"] [data-search-result-link]').click();
  await expect(page).toHaveURL(/selected=DOC-118/);
  await expect(page.locator("[data-search-detail-title]")).toHaveText("导出失败恢复说明");

  await page.goto("/examples/page-patterns/scheduling.html?selected=SCH-103", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-schedule-sidecar]")).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator("[data-sidecar-title]")).toHaveText("主图审核");
  await page.keyboard.press("Escape");
  await expect(page).not.toHaveURL(/selected=/);

  await page.goto("/scenarios/lab.html?scenario=CORE-05&state=error&viewport=narrow&theme=dark-high-contrast", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass");
  const labFrame = page.frameLocator("[data-lab-frame]");
  await expect(labFrame.locator("[data-system-code]")).toHaveText("5XX");
  await expect(labFrame.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(labFrame.locator("html")).toHaveAttribute("data-contrast", "more");

  await page.goto("/scenarios/lab.html?scenario=ENG-02&state=normal&viewport=narrow&theme=light-high-contrast", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass");
  const engineeringFrame = page.frameLocator("[data-lab-frame]");
  await expect(engineeringFrame.locator("#canvas-layers")).toBeVisible();
  await expect(engineeringFrame.locator('[data-object][aria-pressed="true"]')).toContainText("Bracket-01");
  await expect(engineeringFrame.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(engineeringFrame.locator("html")).toHaveAttribute("data-contrast", "more");
});
