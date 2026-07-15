import { expect, test } from "@playwright/test";

const browserErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  const errors = [];
  browserErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.addInitScript(() => {
    localStorage.setItem("kin-reference-theme", "dark");
    localStorage.setItem("kin-integration-locale", "en");
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

async function openLab(page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/examples/workspace-reference/integrations.html");
  await expect(page.getByRole("heading", { name: "Integration Lab", level: 1 })).toBeVisible();
}

async function activateLazySections(page) {
  for (const id of ["number-flow", "virtuoso", "dnd-kit", "input-otp", "liveline"]) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByText("Loading official runtime…", { exact: true })).toHaveCount(0, { timeout: 5_000 });
  }
}

test("Integration Lab registers real official-package adapters", async ({ page }) => {
  await openLab(page);
  const rows = page.locator(".integration-status-table [role='row']");
  await expect(rows).toHaveCount(9);
  for (const name of ["Sonner", "NumberFlow", "cmdk", "React Virtuoso", "dnd kit", "input-otp", "Liveline", "Leva"]) {
    await expect(page.getByRole("row").filter({ hasText: name })).toBeVisible();
  }
  await expect(page.locator("svg.lucide").first()).toBeVisible();
});

test("theme and language controls expose explicit menus and preserve the working state", async ({ page }) => {
  await openLab(page);
  const language = page.locator('[data-integration-action="language"]');
  const theme = page.locator('[data-integration-action="theme"]');
  await expect(language.locator("svg.lucide-languages")).toBeVisible();
  await expect(language).toHaveAttribute("aria-haspopup", "menu");
  await expect(language).toHaveAttribute("aria-expanded", "false");
  await expect(theme.locator("svg.lucide-sun")).toBeVisible();
  await expect(theme.locator("svg.lucide-moon")).toBeVisible();
  await expect(theme.locator(".theme-switch-track")).toBeVisible();

  await language.click();
  const english = page.getByRole("menuitemradio", { name: "English" });
  const chinese = page.getByRole("menuitemradio", { name: "中文" });
  await expect(language).toHaveAttribute("aria-expanded", "true");
  await expect(english).toHaveAttribute("aria-checked", "true");
  await expect(english).toBeFocused();
  await chinese.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByText("第三方能力成为 KIN 的一部分", { exact: true })).toBeVisible();
  await expect(language).toBeFocused();

  await theme.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "light");
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);

  await page.locator('[data-integration-action="theme-menu"]').click();
  await page.locator('[data-preference-value="system"]').click();
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await expect(page.locator('[data-integration-action="theme"]')).toHaveAttribute("data-preference", "system");
});

test("Sonner keeps result, undo, and promise-update behavior", async ({ page }) => {
  await openLab(page);
  await page.locator('[data-integration-action="toast-success"]').click();
  await expect(page.getByText("View saved", { exact: true })).toBeVisible();

  await page.locator('[data-integration-action="toast-undo"]').click();
  await expect(page.getByText("Removed from watchlist", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Watch restored", { exact: true })).toBeVisible();

  await page.locator('[data-integration-action="toast-task"]').click();
  await expect(page.getByText("Creating export task", { exact: true })).toBeVisible();
  await expect(page.getByText("Export task created", { exact: true })).toBeVisible({ timeout: 2_000 });

  await page.locator('[data-integration-action="toast-error"]').click();
  await expect(page.getByText("Export task failed", { exact: true })).toBeVisible();
  await expect(page.getByText("The export service did not respond.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByText("Export task submitted again", { exact: true })).toBeVisible();
  expect(await page.locator('[data-sonner-toast][data-visible="true"]').count()).toBeLessThanOrEqual(3);
});

test("Sonner exposes all six upstream positions and an RTL direction", async ({ page }) => {
  await openLab(page);
  await page.locator('[data-integration-action="toast-success"]').click();
  const toaster = page.locator("[data-sonner-toaster]");
  await expect(toaster).toBeAttached();
  const expectations = {
    "top-left": ["top", "left"],
    "top-center": ["top", "center"],
    "top-right": ["top", "right"],
    "bottom-left": ["bottom", "left"],
    "bottom-center": ["bottom", "center"],
    "bottom-right": ["bottom", "right"],
  };

  for (const [position, [vertical, horizontal]] of Object.entries(expectations)) {
    const control = page.locator(`[data-toast-position="${position}"]`);
    await control.click();
    await expect(control).toHaveAttribute("aria-checked", "true");
    await expect(toaster).toHaveAttribute("data-y-position", vertical);
    await expect(toaster).toHaveAttribute("data-x-position", horizontal);
  }

  await page.locator('[data-toast-direction="rtl"]').click();
  await expect(toaster).toHaveAttribute("dir", "rtl");
  await page.locator('[data-toast-position="top-left"]').click();
  await page.locator('[data-integration-action="toast-undo"]').click();
  const toast = page.locator('[data-sonner-toast][data-visible="true"]').first();
  await expect(toast).toHaveAttribute("data-x-position", "left");
  await expect(toast).toHaveAttribute("data-y-position", "top");
  await expect(toast.getByRole("button", { name: "Undo" })).toBeVisible();
});

test("NumberFlow suppresses motion under Reduced Motion and keeps the latest value across theme changes", async ({ page }) => {
  await openLab(page);
  await expect(page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).resolves.toBe(true);
  const section = page.locator("#number-flow");
  await section.scrollIntoViewIfNeeded();
  const metric = section.locator("[data-kin-number-flow]").first();
  await expect(metric).toBeVisible();
  await expect(metric).toHaveAttribute("data-kin-can-animate", "false");
  await expect(metric).toHaveAttribute("data-kin-motion-phase", "idle");
  await expect(metric.locator("number-flow-react")).toHaveAttribute("aria-label", "Availability: 98.7%");

  await section.locator('[data-integration-action="number-sample"]').click();
  await expect(metric.locator("number-flow-react")).toHaveAttribute("aria-label", "Availability: 99.1%");
  await expect(metric).toHaveAttribute("data-kin-motion-phase", "idle");

  await page.locator('[data-integration-action="theme"]').click();
  await expect(metric.locator("number-flow-react")).toHaveAttribute("aria-label", "Availability: 99.1%");
});

test("cmdk opens from the keyboard, filters, and restores focus", async ({ page }) => {
  await openLab(page);
  const trigger = page.locator('[data-integration-action="command-open"]');
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  await page.keyboard.press("Control+K");
  const dialog = page.getByRole("dialog", { name: "KIN command menu" });
  await expect(dialog).toBeVisible();
  const input = dialog.locator("[cmdk-input]");
  await expect(input).toHaveAttribute("aria-label", "Search commands");
  await expect(input).toBeFocused();
  await input.fill("motion");
  await expect(dialog.getByText("Motion Lab", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.keyboard.press("Control+K");
  await expect(input).toBeFocused();
  await input.fill("save");
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.getByText("View saved", { exact: true })).toBeVisible();
  await expect(trigger).toBeFocused();
});

test("React Virtuoso windows one thousand rows and follows keyboard selection", async ({ page }) => {
  await openLab(page);
  const section = page.locator("#virtuoso");
  await section.scrollIntoViewIfNeeded();
  const shell = section.locator("[data-integration-virtual]");
  await shell.scrollIntoViewIfNeeded();
  await expect(shell).toBeVisible();
  const renderedRows = shell.locator(".integration-entity-row");
  expect(await renderedRows.count()).toBeGreaterThan(0);
  expect(await renderedRows.count()).toBeLessThan(100);
  await shell.focus();
  await page.keyboard.press("j");
  await expect(shell.locator('.integration-entity-row[aria-current="true"]')).toContainText("ENT-0002");
});

test("dnd kit supports keyboard sorting with localized instructions", async ({ page }) => {
  await openLab(page);
  const section = page.locator("#dnd-kit");
  await section.scrollIntoViewIfNeeded();
  const handles = section.locator(".kin-sortable__handle");
  await expect(handles).toHaveCount(4);
  await expect(handles.first()).toHaveAttribute("aria-describedby", /DndDescribedBy/);
  await handles.first().focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(50);
  await page.keyboard.press("ArrowDown");
  await expect(section.getByText(/moved over Needs review/)).toBeAttached();
  await page.keyboard.press("Space");
  await expect(section.locator("[data-sort-id]").first()).toHaveAttribute("data-sort-id", "review");
  await expect(handles.nth(1)).toBeFocused();
});

test("input-otp preserves clipboard paste behavior without claiming a backend", async ({ page, context }) => {
  await openLab(page);
  const section = page.locator("#input-otp");
  await section.scrollIntoViewIfNeeded();
  const input = page.getByRole("textbox", { name: "Six-digit verification code" });
  await expect(input).toHaveAttribute("autocomplete", "one-time-code");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.evaluate(() => navigator.clipboard.writeText("123456"));
  await input.focus();
  await page.keyboard.press("Control+V");
  await expect(input).toHaveValue("123456");
  await expect(section.locator(".kin-otp__slot")).toHaveCount(6);
  await expect(section.getByText("Local input fixture · no authentication service", { exact: true })).toBeVisible();
});

test("Liveline uses its upstream Reduced Motion behavior and exposes a structured fallback", async ({ page }) => {
  await openLab(page);
  const section = page.locator("#liveline");
  await section.scrollIntoViewIfNeeded();
  const chart = section.locator(".kin-live-chart");
  await expect(chart).toBeVisible();
  await expect(chart).toHaveAttribute("data-kin-reduced-motion", "true");
  await expect(chart).not.toHaveAttribute("data-kin-paused", "true");
  const canvas = chart.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect.poll(async () => canvas.evaluate((element) => {
    const context = element.getContext("2d");
    if (!context || element.width === 0 || element.height === 0) return 0;
    const pixels = context.getImageData(0, 0, element.width, element.height).data;
    let painted = 0;
    for (let index = 3; index < pixels.length; index += 16) {
      if (pixels[index] > 0) painted += 1;
    }
    return painted;
  })).toBeGreaterThan(50);
  await expect(chart.getByText(/Latency ranged from 82–126ms/)).toBeVisible();
  await chart.getByText("View data table", { exact: true }).click();
  await expect(chart.getByRole("table")).toBeVisible();
  await expect(chart.getByRole("row")).toHaveCount(13);
});

test("Integration Lab reflows without horizontal page overflow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/workspace-reference/integrations.html");
  await activateLazySections(page);
  await page.locator("#integration-status").scrollIntoViewIfNeeded();
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  const iconControls = page.locator(".integration-header .icon-only-control");
  const sizes = await iconControls.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  expect(sizes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("integration-lab-mobile-dark.png"), fullPage: true });
});

test("Sonner keeps mobile notifications inside safe-area-aware offsets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/workspace-reference/integrations.html");
  await page.locator('[data-toast-position="top-left"]').click();
  await page.locator('[data-integration-action="toast-success"]').click();
  const toaster = page.locator("[data-sonner-toaster]");
  await expect(toaster).toBeAttached();
  const offsets = await toaster.evaluate((element) => ({
    top: element.style.getPropertyValue("--mobile-offset-top"),
    right: element.style.getPropertyValue("--mobile-offset-right"),
    bottom: element.style.getPropertyValue("--mobile-offset-bottom"),
    left: element.style.getPropertyValue("--mobile-offset-left"),
  }));
  expect(offsets.top).toContain("env(safe-area-inset-top)");
  expect(offsets.right).toContain("env(safe-area-inset-right)");
  expect(offsets.bottom).toContain("env(safe-area-inset-bottom)");
  expect(offsets.left).toContain("env(safe-area-inset-left)");

  const toast = page.locator('[data-sonner-toast][data-visible="true"]').first();
  const box = await toast.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  expect(box.x).toBeGreaterThanOrEqual(16);
  expect(box.y).toBeGreaterThanOrEqual(16);
  expect(box.x + box.width).toBeLessThanOrEqual(390 - 16);
});

test("showcase registers the Blocks icon and removes thumb motion for Reduced Motion", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-site-ready", "true");
  const integrationLink = page.locator('a[href="examples/workspace-reference/integrations.html"]');
  await expect(integrationLink.locator("svg.lucide-blocks")).toBeVisible();
  const duration = await page.locator("[data-theme-switch]").evaluate((element) => getComputedStyle(element, "::after").transitionDuration);
  expect(duration).toBe("0s");

  const languageMenu = page.locator("[data-language-menu]");
  await page.getByRole("button", { name: "Choose language" }).click();
  await expect(languageMenu).toHaveAttribute("data-state", "open");
  await expect(languageMenu.evaluate((element) => getComputedStyle(element).transform)).resolves.toBe("none");
  await page.keyboard.press("Escape");
  await expect(languageMenu).toHaveAttribute("data-state", "closed");

  const command = page.locator("[data-command-dialog]");
  await page.getByRole("button", { name: /Search sections/ }).click();
  await expect(command).toHaveAttribute("data-state", "open");
  await expect(command.evaluate((element) => getComputedStyle(element).transform)).resolves.toBe("none");
  await page.keyboard.press("Escape");
  await expect(command).toHaveAttribute("data-state", "closed");

  await page.goto("/zh/");
  const chineseThemeSwitch = page.locator("[data-theme-switch]");
  await expect(chineseThemeSwitch).toHaveAttribute("aria-label", "当前跟随系统。切换为日间模式");
  await chineseThemeSwitch.click();
  await expect(chineseThemeSwitch).toHaveAttribute("aria-label", "切换为夜间模式");
});

test("Integration Lab visual review renders the official runtimes", async ({ page }, testInfo) => {
  await openLab(page);
  await activateLazySections(page);
  await page.locator("#integration-status").scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("integration-lab-desktop-dark.png"), fullPage: true });
});
