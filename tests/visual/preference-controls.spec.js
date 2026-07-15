import { expect, test } from "@playwright/test";

const references = [
  "/examples/product-patterns/canvas.html",
  "/examples/product-patterns/ecommerce.html",
  "/examples/product-patterns/information.html",
  "/examples/workspace-reference/states.html",
  "/examples/workspace-reference/core-components.html",
  "/examples/workspace-reference/advanced-components.html",
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
    localStorage.setItem("kin-reference-theme", "system");
    window.__kinThemeEvents = [];
    window.addEventListener("kin:themechange", (event) => window.__kinThemeEvents.push(event.detail));
  });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

for (const path of references) {
  test(`${path} uses the canonical single-locale preference control`, async ({ page }) => {
    await page.goto(path);
    const root = page.locator("html");
    const control = page.locator("[data-preference-controls]");
    const themeSwitch = control.locator("[data-theme-switch]");
    const menuTrigger = control.locator("[data-theme-menu-trigger]");
    const menu = control.locator("[data-theme-menu]");

    await expect(root).toHaveAttribute("data-preference-controls-ready", "true");
    await expect(control).toHaveCount(1);
    await expect(page.locator("[data-theme-value]")).toHaveCount(0);
    await expect(page.locator("[data-language-trigger]")).toHaveCount(0);
    await expect(themeSwitch).toHaveAttribute("role", "switch");
    await expect(themeSwitch).toHaveAttribute("aria-checked", "true");
    await expect(themeSwitch).toHaveAttribute("data-preference", "system");
    await expect(themeSwitch.locator("svg.lucide-sun")).toBeVisible();
    await expect(themeSwitch.locator("svg.lucide-moon")).toBeVisible();
    await expect(control.locator(".kin-theme-switch-track")).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.__kinThemeEvents.at(-1))).toEqual({
      preference: "system",
      resolved: "dark",
    });

    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toHaveAttribute("data-state", "open");
    const systemItem = menu.getByRole("menuitemradio", { name: "跟随系统" });
    await expect(systemItem).toHaveAttribute("aria-checked", "true");
    await expect(systemItem).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(menu.getByRole("menuitemradio", { name: "夜间" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(menu).toHaveAttribute("data-state", "closed");
    await expect(menuTrigger).toBeFocused();

    await menuTrigger.click();
    await menu.getByRole("menuitemradio", { name: "日间" }).click();
    await expect(root).toHaveAttribute("data-theme", "light");
    await expect(root).toHaveAttribute("data-theme-preference", "light");
    await expect(themeSwitch).toHaveAttribute("aria-checked", "false");
    await expect(themeSwitch).toHaveAttribute("aria-label", "切换为夜间模式");
    await expect(page.evaluate(() => localStorage.getItem("kin-reference-theme"))).resolves.toBe("light");
    await expect.poll(() => page.evaluate(() => window.__kinThemeEvents.at(-1))).toEqual({
      preference: "light",
      resolved: "light",
    });

    await themeSwitch.click();
    await expect(root).toHaveAttribute("data-theme", "dark");
    await expect(root).toHaveAttribute("data-theme-preference", "dark");
    await expect(themeSwitch).toHaveAttribute("aria-label", "切换为日间模式");

    await menuTrigger.click();
    await menu.getByRole("menuitemradio", { name: "跟随系统" }).click();
    await expect(root).toHaveAttribute("data-theme-preference", "system");
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await expect(root).toHaveAttribute("data-theme", "light");
    await expect(themeSwitch).toHaveAttribute("data-preference", "system");
  });
}

test("the core Sonner island follows the shared resolved theme", async ({ page }) => {
  await page.goto("/examples/workspace-reference/core-components.html");
  await page.locator("[data-motion-toast]").click();
  const toaster = page.locator('[data-sonner-toaster="true"]');
  await expect(toaster).toHaveAttribute("data-sonner-theme", "dark");

  await page.locator("[data-theme-switch]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "light");
  await expect(toaster).toHaveAttribute("data-sonner-theme", "light");
});

test("preference changes synchronize across runnable references", async ({ page, context }) => {
  await page.goto(references[0]);
  const secondPage = await context.newPage();
  await secondPage.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await secondPage.goto(references[3]);

  await page.locator("[data-theme-switch]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "light");
  await expect(secondPage.locator("html")).toHaveAttribute("data-theme-preference", "light");
  await expect(secondPage.locator("[data-theme-switch]")).toHaveAttribute("aria-checked", "false");
  await secondPage.close();
});

test("Reduced Motion keeps the appearance menu to a short crossfade", async ({ page }) => {
  await page.goto(references[4]);
  const trigger = page.locator("[data-theme-menu-trigger]");
  const menu = page.locator("[data-theme-menu]");
  await trigger.click();
  const motion = await menu.evaluate((element) => {
    const style = getComputedStyle(element);
    return { property: style.transitionProperty, duration: style.transitionDuration, transform: style.transform };
  });
  expect(motion.property).toBe("opacity");
  expect(motion.duration).toBe("0.08s");
  expect(motion.transform).toBe("none");
});
