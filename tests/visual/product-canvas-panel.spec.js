import { expect, test } from "@playwright/test";

test("product canvas overlays preserve focus and state under reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/examples/product-patterns/canvas.html");
  await expect(page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).resolves.toBe(true);

  const panel = page.locator("#canvas-properties");
  const open = page.locator("[data-canvas-properties-open]");
  const close = page.locator("[data-canvas-properties-close]");
  const scrim = page.locator("[data-canvas-scrim]");

  await expect(panel).toBeHidden();
  await expect(panel).toHaveAttribute("data-state", "closed");
  await open.click();
  await expect(panel).toHaveAttribute("data-state", "open");
  await expect(panel).toHaveAttribute("role", "dialog");
  await expect(panel).toHaveAttribute("aria-modal", "true");
  await expect(close).toBeFocused();
  await expect(scrim).toHaveAttribute("data-state", "open");
  await expect(panel).toHaveAttribute("style", /transform:\s*none/);
  await expect(panel.evaluate((element) => getComputedStyle(element).transform)).resolves.toBe("none");

  const panelButtons = panel.getByRole("button");
  await panelButtons.last().focus();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();

  const closingSnapshot = await page.evaluate(() => {
    const panelElement = document.querySelector("#canvas-properties");
    const openElement = document.querySelector("[data-canvas-properties-open]");
    document.querySelector("[data-canvas-properties-close]").click();
    return {
      state: panelElement.dataset.state,
      hidden: panelElement.hidden,
      inert: panelElement.inert,
      ariaHidden: panelElement.getAttribute("aria-hidden"),
      focusRestored: document.activeElement === openElement,
    };
  });
  expect(closingSnapshot).toEqual({
    state: "closing",
    hidden: false,
    inert: true,
    ariaHidden: "true",
    focusRestored: true,
  });
  await expect(panel).toBeHidden();
  await expect(panel).toHaveAttribute("data-state", "closed");

  await page.setViewportSize({ width: 390, height: 844 });
  const layers = page.locator("#canvas-layers");
  const layersOpen = page.locator("[data-canvas-layers-open]");
  await layersOpen.click();
  await expect(layers).toHaveAttribute("data-state", "open");
  await expect(page.locator("[data-canvas-layers-close]")).toBeFocused();
  await scrim.click({ position: { x: 12, y: 12 } });
  await expect(layersOpen).toBeFocused();
  await expect(layers).toBeHidden();
  await expect(scrim).toBeHidden();
});
