import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    localStorage.setItem("kin-reference-theme", "dark");
    localStorage.setItem("kin-integration-locale", "en");
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/examples/workspace-reference/integrations.html");
});

test("Sonner preserves its official toast transition", async ({ page }) => {
  await expect(page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).resolves.toBe(false);
  await page.locator('[data-integration-action="toast-success"]').click();
  const toast = page.locator("[data-sonner-toast]").first();
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute("data-mounted", "true");
  const duration = await toast.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(duration.split(",").some((value) => value.trim() !== "0s")).toBe(true);
});

test("preference menus retain their exit frame and support rapid reversal", async ({ page }) => {
  await page.clock.install();
  await page.goto("/examples/workspace-reference/integrations.html");
  const trigger = page.locator('[data-integration-action="language"]');
  const menu = page.locator(".integration-preference-menu").first();

  await trigger.click();
  await expect(menu).toHaveAttribute("data-state", "open");
  await page.clock.pauseAt(new Date("2030-01-01T00:00:00Z"));
  const duration = await menu.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(duration.split(",").some((value) => value.trim() !== "0s")).toBe(true);

  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toHaveAttribute("data-state", "closing");
  await expect(menu).toBeVisible();

  await trigger.click();
  await page.clock.runFor(20);
  await expect(menu).toHaveAttribute("data-state", "open");
  await expect(menu).toBeVisible();

  await page.keyboard.press("Escape");
  await page.clock.runFor(180);
  await expect(menu).toHaveAttribute("data-state", "closed");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("main showcase gates the theme thumb transition until the first theme is resolved", async ({ page }) => {
  await page.route("**/assets/site.js", (route) => route.fulfill({ contentType: "application/javascript", body: "" }));
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-site-ready", "true");
  const unresolvedDuration = await page.locator("[data-theme-switch]").evaluate((element) => getComputedStyle(element, "::after").transitionDuration);
  expect(unresolvedDuration).toBe("0s");

  await page.unroute("**/assets/site.js");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-site-ready", "true");
  const themeSwitch = page.locator("[data-theme-switch]");
  const before = await themeSwitch.evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    return { duration: style.transitionDuration, property: style.transitionProperty, translate: style.translate };
  });
  expect(before.duration.split(",").some((value) => value.trim() !== "0s")).toBe(true);
  expect(before.property).toContain("translate");
  await themeSwitch.click();
  await page.waitForTimeout(220);
  const afterTranslate = await themeSwitch.evaluate((element) => getComputedStyle(element, "::after").translate);
  expect(afterTranslate).not.toBe(before.translate);
});

test("main showcase menus and command surface keep a reversible exit phase", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const languageTrigger = page.getByRole("button", { name: "Choose language" });
  const languageMenu = page.locator("[data-language-menu]");

  await languageTrigger.click();
  await expect(languageMenu).toHaveAttribute("data-state", "open");
  await page.clock.pauseAt(new Date("2030-01-01T00:00:00Z"));
  const menuDuration = await languageMenu.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(menuDuration.split(",").some((value) => value.trim() !== "0s")).toBe(true);
  await page.keyboard.press("Escape");
  await expect(languageMenu).toHaveAttribute("data-state", "closing");
  await expect(languageMenu).toBeVisible();
  await languageTrigger.click();
  await page.clock.runFor(20);
  await expect(languageMenu).toHaveAttribute("data-state", "open");
  await page.keyboard.press("Escape");
  await page.clock.runFor(180);
  await expect(languageMenu).toHaveAttribute("data-state", "closed");
  await expect(languageMenu).toBeHidden();

  const commandTrigger = page.getByRole("button", { name: /Search sections/ });
  const command = page.locator("[data-command-dialog]");
  await commandTrigger.click();
  await page.clock.runFor(20);
  await expect(command).toHaveAttribute("data-state", "open");
  const commandDuration = await command.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(commandDuration.split(",").some((value) => value.trim() !== "0s")).toBe(true);
  await page.keyboard.press("Escape");
  const closingCommand = await command.evaluate((element) => ({
    state: element.dataset.state,
    open: element.open,
    display: getComputedStyle(element).display,
  }));
  expect(closingCommand).toEqual({ state: "closing", open: true, display: "block" });
  await page.clock.runFor(210);
  await expect(command).toHaveAttribute("data-state", "closed");
  await expect(command).toBeHidden();
  await expect(commandTrigger).toBeFocused();
});

test("main showcase opens its high-frequency command surface without keyboard travel", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+K");

  const command = page.locator("[data-command-dialog]");
  await expect(command).toHaveAttribute("data-invocation", "keyboard");
  await expect(command).toHaveAttribute("data-state", "open");
  const motion = await command.evaluate((element) => ({
    transform: getComputedStyle(element).transform,
    duration: getComputedStyle(element).transitionDuration,
  }));
  expect(motion.transform).toBe("none");
  expect(motion.duration).toBe("0s");
});

test("NumberFlow runs the upstream animation lifecycle only after a real value change", async ({ page }) => {
  const section = page.locator("#number-flow");
  await section.scrollIntoViewIfNeeded();
  const metric = section.locator("[data-kin-number-flow]").first();
  await expect(metric).toBeVisible();
  await expect(metric).toHaveAttribute("data-kin-can-animate", "true");
  await expect(metric).toHaveAttribute("data-kin-motion-phase", "idle");
  await section.locator('[data-integration-action="number-sample"]').click();
  await expect(metric).toHaveAttribute("data-kin-motion-phase", "animating");
  await expect(metric).toHaveAttribute("data-kin-motion-phase", "idle", { timeout: 2_000 });
  await expect(metric.locator("number-flow-react")).toHaveAttribute("aria-label", "Availability: 99.1%");
});

test("dnd kit retains transform-based sortable motion", async ({ page }) => {
  const section = page.locator("#dnd-kit");
  await section.scrollIntoViewIfNeeded();
  const firstHandle = section.locator(".kin-sortable__handle").first();
  const firstRow = section.locator(".kin-sortable__row").first();
  await firstHandle.focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(50);
  await page.keyboard.press("ArrowDown");
  await expect(section.getByText(/moved over Needs review/)).toBeAttached();
  const motion = await firstRow.evaluate((element) => ({
    transform: element.style.transform,
    transition: element.style.transition,
  }));
  expect(motion.transform).not.toBe("");
  expect(motion.transition).not.toBe("");
  await page.keyboard.press("Space");
  await expect(section.locator("[data-sort-id]").first()).toHaveAttribute("data-sort-id", "review");
});

test("dnd kit retains its pointer sensor, DragOverlay, and drop result", async ({ page }) => {
  const section = page.locator("#dnd-kit");
  await section.scrollIntoViewIfNeeded();
  const firstHandle = section.locator(".kin-sortable__handle").first();
  const secondHandle = section.locator(".kin-sortable__handle").nth(1);
  const start = await firstHandle.boundingBox();
  const destination = await secondHandle.boundingBox();
  expect(start).not.toBeNull();
  expect(destination).not.toBeNull();
  if (!start || !destination) return;

  const startX = start.x + start.width / 2;
  const startY = start.y + start.height / 2;
  await firstHandle.hover();
  await page.mouse.down();
  await page.mouse.move(startX + 12, startY, { steps: 4 });
  await expect(page.locator(".kin-sortable__row--overlay")).toBeVisible();
  await page.mouse.move(destination.x + destination.width / 2, destination.y + destination.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(section.locator("[data-sort-id]").first()).toHaveAttribute("data-sort-id", "review");
});

test("Liveline remains animated in normal motion", async ({ page }) => {
  const section = page.locator("#liveline");
  await section.scrollIntoViewIfNeeded();
  const chart = section.locator(".kin-live-chart");
  await expect(chart).toBeVisible();
  await expect(chart).not.toHaveAttribute("data-kin-paused", "true");
  await expect(chart).not.toHaveAttribute("data-kin-reduced-motion", "true");
  await expect(chart.locator("canvas")).toBeVisible();
});
