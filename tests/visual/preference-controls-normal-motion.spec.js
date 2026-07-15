import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("kin-reference-theme", "dark"));
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 900 });
});

test("preference motion waits for initialization and remains reversible", async ({ page }) => {
  const modulePattern = "**/examples/shared/preference-controls.js";
  await page.route(modulePattern, (route) => route.fulfill({ contentType: "application/javascript", body: "" }));
  await page.goto("/examples/workspace-reference/states.html");
  await expect(page.locator("html")).not.toHaveAttribute("data-preference-controls-ready", "true");
  const unresolvedDuration = await page.locator(".kin-theme-switch-thumb").evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(unresolvedDuration).toBe("0s");

  await page.unroute(modulePattern);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-preference-controls-ready", "true");
  const thumb = page.locator(".kin-theme-switch-thumb");
  const thumbMotion = await thumb.evaluate((element) => {
    const style = getComputedStyle(element);
    return { property: style.transitionProperty, duration: style.transitionDuration };
  });
  expect(thumbMotion.property).toContain("transform");
  expect(thumbMotion.duration.split(",").some((value) => value.trim() !== "0s")).toBe(true);

  const trigger = page.locator("[data-theme-menu-trigger]");
  const menu = page.locator("[data-theme-menu]");
  await trigger.click();
  await expect(menu).toHaveAttribute("data-state", "open");
  const menuMotion = await menu.evaluate((element) => {
    const style = getComputedStyle(element);
    return { property: style.transitionProperty, duration: style.transitionDuration };
  });
  expect(menuMotion.property).toContain("opacity");
  expect(menuMotion.property).toContain("transform");
  expect(menuMotion.duration.split(",").every((value) => value.trim() !== "0s")).toBe(true);

  await trigger.click();
  await expect(menu).toHaveAttribute("data-state", "closing");
  await trigger.click();
  await expect(menu).toHaveAttribute("data-state", "open");
  await expect(menu).toBeVisible();
  await trigger.click();
  await expect(menu).toBeHidden();
  await expect(menu).toHaveAttribute("data-state", "closed");
});
