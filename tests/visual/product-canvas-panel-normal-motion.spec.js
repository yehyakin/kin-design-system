import { expect, test } from "@playwright/test";

async function translation(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    const matrix = transform === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(transform);
    return { x: matrix.m41, y: matrix.m42 };
  });
}

async function closedTranslation(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const wasHidden = element.hidden;
    element.hidden = false;
    const transform = getComputedStyle(element).transform;
    const matrix = transform === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(transform);
    element.hidden = wasHidden;
    return { x: matrix.m41, y: matrix.m42 };
  });
}

async function transitionContract(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const style = getComputedStyle(element);
    return { property: style.transitionProperty, duration: style.transitionDuration };
  });
}

test("compact canvas properties use a reversible right-edge path", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 844 });
  await page.goto("/examples/product-patterns/canvas.html");

  const panel = page.locator("#canvas-properties");
  const open = page.locator("[data-canvas-properties-open]");
  const close = page.locator("[data-canvas-properties-close]");

  const closed = await closedTranslation(page, "#canvas-properties");
  expect(closed.x).toBeGreaterThan(0);
  expect(Math.abs(closed.y)).toBeLessThan(1);
  const motion = await transitionContract(page, "#canvas-properties");
  expect(motion.property).toContain("transform");
  expect(motion.duration.split(",").some((value) => value.trim() !== "0s")).toBe(true);

  await open.click();
  await expect(panel).toHaveAttribute("data-state", "open");
  await expect.poll(async () => Math.abs((await translation(page, "#canvas-properties")).x)).toBeLessThan(1);

  await close.click();
  await expect(panel).toHaveAttribute("data-state", "closing");
  await expect(panel.evaluate((element) => element.inert)).resolves.toBe(true);

  await open.click();
  await expect(panel).toHaveAttribute("data-state", "open");
  await page.waitForTimeout(260);
  await expect(panel).toBeVisible();
  await expect(panel.evaluate((element) => element.inert)).resolves.toBe(false);
  await expect(open).toHaveAttribute("aria-expanded", "true");
});

test("mobile canvas panels share a bottom-edge path and scrim dismissal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/product-patterns/canvas.html");

  const layers = page.locator("#canvas-layers");
  const layersOpen = page.locator("[data-canvas-layers-open]");
  const layersClose = page.locator("[data-canvas-layers-close]");
  const scrim = page.locator("[data-canvas-scrim]");

  const closed = await closedTranslation(page, "#canvas-layers");
  expect(closed.y).toBeGreaterThan(0);
  expect(Math.abs(closed.x)).toBeLessThan(1);
  const motion = await transitionContract(page, "#canvas-layers");
  expect(motion.property).toContain("transform");
  expect(motion.duration.split(",").some((value) => value.trim() !== "0s")).toBe(true);

  await layersOpen.click();
  await expect(layers).toHaveAttribute("data-state", "open");
  await expect.poll(async () => Math.abs((await translation(page, "#canvas-layers")).y)).toBeLessThan(1);

  await layersClose.click();
  await expect(layers).toHaveAttribute("data-state", "closing");
  await expect(layers.evaluate((element) => element.inert)).resolves.toBe(true);
  await expect(layers).toBeHidden();
  const closedAgain = await closedTranslation(page, "#canvas-layers");
  expect(closedAgain.y).toBeGreaterThan(0);

  await layersOpen.click();
  await expect(layers).toHaveAttribute("data-state", "open");
  await scrim.click({ position: { x: 12, y: 12 } });
  await expect(layersOpen).toBeFocused();
  await expect(layers).toBeHidden();
  await expect(scrim).toBeHidden();
});
