import { expect, test } from "@playwright/test";

const SPECIMENS = [
  "app-shell",
  "evidence-list",
  "suggested-change-review",
  "execution-preview",
  "agent-activity-trace",
  "background-task-queue",
  "story-timeline",
  "data-table",
  "command-menu",
  "authentication-dialog",
  "code-block",
  "button",
];

const browserErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  const errors = [];
  browserErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.addInitScript(() => {
    if (!localStorage.getItem("kin-reference-theme")) localStorage.setItem("kin-reference-theme", "dark");
    if (!localStorage.getItem("kin-reference-contrast")) localStorage.setItem("kin-reference-contrast", "normal");
  });
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

function specimenUrl(specimen, locale = "en") {
  return `/examples/workspace-reference/showcase-components.html?lang=${locale}&specimen=${specimen}`;
}

test("all featured specimens render in English and Chinese without mixed chrome", async ({ page }) => {
  test.setTimeout(60_000);
  for (const locale of ["en", "zh-CN"]) {
    for (const specimen of SPECIMENS) {
      await page.goto(specimenUrl(specimen, locale), { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("#specimen-root")).toBeVisible();
      await expect(page.locator("#specimen-root")).not.toBeEmpty();
      await expect(page).toHaveTitle(`${specimen} · KIN`);
    }
  }
});

test("Button uses real pending, notification, destructive confirmation, and undo states", async ({ page }) => {
  await page.goto(specimenUrl("button"));

  const save = page.getByRole("button", { name: "Save changes" });
  await save.click();
  await expect(page.getByRole("button", { name: "Saving…" })).toBeDisabled();
  await expect(page.locator('[data-sonner-toast][data-visible="true"]').filter({ hasText: "Changes saved" })).toBeVisible();
  const notificationRegion = page.getByRole("region", { name: /^Notifications/ });
  await expect(notificationRegion).toBeAttached();
  await expect(notificationRegion).toHaveAttribute("aria-live", "polite");

  await page.getByRole("button", { name: "Delete draft", exact: true }).first().click();
  await expect(page.getByRole("region", { name: "Delete this local draft?" })).toBeVisible();
  await page.getByRole("button", { name: "Delete draft", exact: true }).last().click();
  const removed = page.locator('[data-sonner-toast][data-visible="true"]').filter({ hasText: "Draft deleted" });
  await expect(removed).toBeVisible();
  await removed.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator('[data-sonner-toast][data-visible="true"]').filter({ hasText: "Draft restored" })).toBeVisible();
});

test("Command Menu remains keyboard-first and returns focus to its trigger", async ({ page }) => {
  await page.goto(specimenUrl("command-menu"));
  const trigger = page.getByRole("button", { name: "Open command menu" });
  const dialog = page.getByRole("dialog", { name: "KIN command menu" });
  const input = page.locator("input[cmdk-input]");
  await expect(dialog).toBeVisible();
  await expect(input).toHaveAttribute("aria-label", "Search commands");
  await expect(input).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Control+K");
  await expect(dialog).toBeVisible();
  await input.fill("evidence");
  await expect(page.getByRole("option", { name: "Open evidence" })).toBeVisible();
});

test("review, execution, task, table, shell, and evidence specimens preserve distinct states", async ({ page }) => {
  await page.goto(specimenUrl("evidence-list"));
  const firstEvidence = page.locator(".evidence-row").first();
  await firstEvidence.click();
  await expect(firstEvidence).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".evidence-detail")).toContainText("Internal price record");

  await page.goto(specimenUrl("suggested-change-review"));
  await page.getByRole("button", { name: "Accept suggestion" }).click();
  await expect(page.locator(".specimen-actions")).toContainText("Accepted");

  await page.goto(specimenUrl("execution-preview"));
  await page.getByRole("button", { name: "Run local preview" }).click();
  await expect(page.getByRole("button", { name: "Executing local fixture…" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Reset" })).toBeVisible({ timeout: 2_000 });

  await page.goto(specimenUrl("background-task-queue"));
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.locator(".task-row").filter({ hasText: "Sync campaign prices" })).toContainText("Retrying");
  await expect(page.locator(".task-row").filter({ hasText: "Sync campaign prices" })).toContainText("Running", {
    timeout: 2_000,
  });

  await page.goto(specimenUrl("data-table"));
  await page.getByRole("button", { name: /Transit Bag/ }).click();
  await expect(page.locator(".specimen-footer")).toContainText("PRD-076");

  await page.goto(specimenUrl("app-shell"));
  await page.getByRole("button", { name: /Transit Bag/ }).click();
  await expect(page.locator(".mini-inspector")).toContainText("PRD-076");
});

test("Authentication Dialog preserves validation, Escape dismissal, and focus return", async ({ page }) => {
  await page.goto(specimenUrl("authentication-dialog"));
  const dialog = page.locator("dialog[data-auth-dialog]");
  const trigger = page.getByRole("button", { name: "Open sign-in dialog" });
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(page.getByRole("textbox", { name: "Work email" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveJSProperty("open", false);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("textbox", { name: "Work email" }).fill("operator@example.com");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(dialog).toHaveJSProperty("open", false);
  await expect(page.locator('[data-sonner-toast][data-visible="true"]').filter({ hasText: "Authentication fixture submitted" })).toBeVisible();
});

test("Agent trace and Code Block expose inspectable details and honest controls", async ({ page }) => {
  await page.goto(specimenUrl("agent-activity-trace"));
  const tool = page.locator(".tool-activity");
  await expect(tool).not.toHaveAttribute("open", "");
  await tool.getByText("Tool activity", { exact: true }).click();
  await expect(tool).toHaveAttribute("open", "");
  await expect(tool).toContainText("catalog.search");
  await expect(page.locator(".trace-step .kin-status")).toHaveCount(4);
  await expect(page.locator(".trace-context")).toContainText("Waiting");
  await expect(page.locator(".trace-context")).toContainText("2026-07-30 09:40:11 UTC+8");
  await expect(page.locator(".trace-context")).toContainText("Local fixture operator");
  await expect(page.getByRole("link", { name: "Open local review route" })).toHaveAttribute(
    "href",
    "#review-recovery",
  );

  await page.goto(specimenUrl("code-block"));
  const code = page.locator(".code-lines");
  const wrap = page.getByRole("button", { name: "Wrap lines" });
  await expect(wrap).toHaveAttribute("aria-pressed", "false");
  await wrap.click();
  await expect(wrap).toHaveAttribute("aria-pressed", "true");
  await expect(code).toHaveAttribute("data-wrap", "true");
  await expect(page.locator(".code-line")).toHaveCount(9);
  await expect(page.locator(".code-line__source")).toHaveCount(9);
  await page.getByRole("button", { name: "Copy code" }).click();
  await expect(page.locator("[data-sonner-toast][data-visible='true']")).toBeVisible();

  await page.setViewportSize({ width: 320, height: 720 });
  const toolbarGeometry = await page.locator(".code-toolbar").evaluate((toolbar) => {
    const shell = toolbar.closest(".code-shell").getBoundingClientRect();
    const actions = toolbar.querySelector(".inline-actions").getBoundingClientRect();
    return {
      actionsRight: actions.right,
      shellRight: shell.right,
      scrollBehaviorY: getComputedStyle(toolbar.closest(".code-shell").querySelector(".code-scroll"))
        .overscrollBehaviorY,
    };
  });
  expect(toolbarGeometry.actionsRight).toBeLessThanOrEqual(toolbarGeometry.shellRight + 1);
  expect(toolbarGeometry.scrollBehaviorY).toBe("auto");
});

test("Story Timeline keeps one ordered model across keyboard and narrow orientation", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(specimenUrl("story-timeline"));
  const timeline = page.locator(".story-timeline");
  const markers = page.locator(".story-marker");
  const milestones = page.locator(".story-milestone");
  await expect(markers).toHaveCount(5);
  await expect(milestones).toHaveCount(5);
  expect(await milestones.evaluateAll((items) => items.map((item) => item.dataset.milestoneId))).toEqual([
    "review-opened",
    "evidence-gathered",
    "conflict-identified",
    "decision-recorded",
    "recovery-checked",
  ]);
  await markers.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(markers.first()).toBeFocused();
  await expect(markers.first()).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("End");
  await expect(markers.last()).toBeFocused();
  await expect(markers.last()).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Home");
  await expect(markers.first()).toBeFocused();
  await expect(page.locator(".timeline-detail")).toContainText("09:30");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(timeline).toHaveCSS("overflow-x", "visible");
  await markers.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(markers.first()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(markers.nth(1)).toBeFocused();
  await expect(page.locator(".timeline-heading")).toContainText("Fictional scenario");
  const markerSize = await markers.first().evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(markerSize.width).toBeGreaterThanOrEqual(44);
  expect(markerSize.height).toBeGreaterThanOrEqual(44);
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
});

test("system theme follows live media changes and the skip link transfers focus", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(`${specimenUrl("evidence-list")}&theme=system`);
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  const skipLink = page.locator(".skip-link");
  await skipLink.focus();
  await skipLink.click();
  await expect(page.locator("#specimen-root")).toBeFocused();
});

test("higher contrast strengthens the specimen without changing its structure", async ({ page }) => {
  await page.goto(specimenUrl("story-timeline"));
  await page.evaluate(() => localStorage.setItem("kin-reference-contrast", "more"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(page.locator(".story-marker")).toHaveCount(5);
  await expect(page.locator(".specimen-canvas")).toHaveCSS("border-top-color", "rgb(116, 122, 134)");
});

test("Reduced Motion removes specimen animation without removing state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(specimenUrl("story-timeline"));
  await expect(page.locator(".story-timeline__progress")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".story-marker")).toHaveCount(5);

  await page.goto(specimenUrl("background-task-queue"));
  await expect(page.locator(".spinning").first()).toHaveCSS("animation-name", "none");
  await expect(page.locator(".task-row")).toHaveCount(3);
});
