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
  test.setTimeout(60_000);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-site-ready", "true");
  await expect(page).toHaveTitle("KIN Showcase — Design rules and runnable references");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const search = page.getByRole("button", { name: /Search KIN/ });
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
  await expect(page.getByRole("table", { name: "后台任务" })).toBeVisible();
  const accept = page.getByRole("button", { name: "接受建议" });
  await accept.scrollIntoViewIfNeeded();
  await accept.click();
  await expect(page.getByText("已采纳 · 尚未执行", { exact: true })).toBeVisible();

  await page.goto(
    "/examples/workspace-reference/showcase-components.html?lang=en&specimen=story-timeline",
    { waitUntil: "domcontentloaded" },
  );
  const storyMarkers = page.locator(".story-marker");
  await expect(storyMarkers).toHaveCount(5);
  await storyMarkers.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(storyMarkers.nth(1)).toBeFocused();
  await expect(page.locator(".timeline-detail")).toContainText("09:34");

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

  await page.goto("/examples/page-patterns/dashboard.html?range=90d&state=partial", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-dashboard-shell]")).toHaveAttribute("data-dashboard-state", "partial");
  await expect(page.locator('[data-dashboard-metric-value="records"]')).toHaveText("69,240");
  await expect(page.locator('[data-dashboard-notice="partial"]')).toBeVisible();
  await page.locator("[data-dashboard-state-select]").selectOption("error");
  await expect(page.locator("[data-dashboard-error]")).toBeVisible();
  await page.locator("[data-dashboard-retry]").click();
  await expect(page.locator("[data-dashboard-chart]")).toBeVisible();

  await page.goto("/scenarios/lab.html?scenario=CORE-05&state=error&viewport=narrow&theme=dark-high-contrast", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass");
  const labFrame = page.frameLocator("[data-lab-frame]");
  await expect(labFrame.locator("[data-system-code]")).toHaveText("5XX");
  await expect(labFrame.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(labFrame.locator("html")).toHaveAttribute("data-contrast", "more");

  await page.goto("/scenarios/lab.html?scenario=INT-03&state=error&viewport=narrow&theme=dark-high-contrast", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass");
  const riskFrame = page.frameLocator("[data-lab-frame]");
  await expect(riskFrame.locator("[data-risk-error]")).toBeVisible();
  await expect(riskFrame.locator("[data-risk-reason]")).not.toHaveValue("");
  await expect(riskFrame.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(riskFrame.locator("html")).toHaveAttribute("data-contrast", "more");

  await page.goto("/scenarios/lab.html?scenario=INT-02&state=error&viewport=narrow&theme=dark-high-contrast", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass");
  const investigationFrame = page.frameLocator("[data-lab-frame]");
  await expect(investigationFrame.locator("[data-investigation-error]")).toBeVisible();
  await expect(investigationFrame.locator("[data-investigation-reason]")).not.toHaveValue("");
  await expect(investigationFrame.locator("[data-investigation-chronology]")).toBeVisible();
  await expect(investigationFrame.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(investigationFrame.locator("html")).toHaveAttribute("data-contrast", "more");

  await page.goto("/scenarios/lab.html?scenario=ENG-02&state=normal&viewport=narrow&theme=light-high-contrast", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass");
  const engineeringFrame = page.frameLocator("[data-lab-frame]");
  await expect(engineeringFrame.locator("#canvas-layers")).toBeVisible();
  await expect(engineeringFrame.locator('[data-object][aria-selected="true"]')).toContainText("Bracket-01");
  await expect(engineeringFrame.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(engineeringFrame.locator("html")).toHaveAttribute("data-contrast", "more");

  await page.goto("/scenarios/lab.html?scenario=COM-02&state=failed&viewport=narrow&theme=dark-high-contrast", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass");
  const commerceFrame = page.frameLocator("[data-lab-frame]");
  await expect(commerceFrame.locator("[data-commerce-save-failure]")).toBeVisible();
  await expect(commerceFrame.locator("[data-commerce-retry]")).toBeVisible();
  await expect(commerceFrame.locator("[data-commerce-current-price]").first()).toHaveText("CNY 1,299.00");
  await expect(commerceFrame.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(commerceFrame.locator("html")).toHaveAttribute("data-contrast", "more");
});

test("docs data grid keeps activation on the current row", async ({ page }) => {
  await page.goto("/docs/", { waitUntil: "domcontentloaded" });
  const rows = page.locator(".data-demo .data-row:not(.header)");
  await expect(rows).toHaveCount(3);
  await rows.first().focus();
  await page.keyboard.press("Enter");
  await expect(rows.first()).toHaveAttribute("aria-selected", "true");
  await expect(rows.nth(1)).toHaveAttribute("aria-selected", "false");
  await page.keyboard.press("ArrowDown");
  await expect(rows.nth(1)).toBeFocused();
  await page.keyboard.press(" ");
  await expect(rows.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(rows.first()).toHaveAttribute("aria-selected", "false");
});
