import { expect, test } from "@playwright/test";

test("normal motion keeps feedback visible without replacing state", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("kin-reference-theme", "dark");
    localStorage.setItem("kin-reference-locale", "en");
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/workspace-reference/");

  await expect(page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).resolves.toBe(false);

  const motionButton = page.locator("[data-motion-async]");
  const transition = await motionButton.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(transition.split(",").some((duration) => duration.trim() !== "0s")).toBe(true);

  await motionButton.click();
  await expect(motionButton).toHaveClass(/is-loading/);
  const loader = motionButton.locator(".button-icon-loading");
  await expect(loader).toBeVisible();
  await expect(loader.evaluate((element) => getComputedStyle(element).animationName)).resolves.toBe("button-spin");
  await expect(motionButton).toHaveClass(/is-success/, { timeout: 2_000 });
  await expect(page.getByText("View saved", { exact: true })).toBeVisible();
});

test("normal motion streaming can be stopped without losing input", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("kin-reference-theme", "light"));
  await page.goto("/examples/workspace-reference/advanced-components.html#ai-assistance");

  const instruction = page.getByLabel("说明");
  const originalValue = await instruction.inputValue();
  await page.getByRole("button", { name: "生成参考结果" }).click();

  const caret = page.locator(".stream-caret");
  await expect(caret).toBeVisible();
  await expect(caret.evaluate((element) => getComputedStyle(element).animationName)).resolves.toBe("caret-pulse");
  await page.getByRole("button", { name: "停止" }).click();

  await expect(caret).toHaveCount(0);
  await expect(instruction).toHaveValue(originalValue);
  await expect(page.getByText("已停止 · 保留部分结果", { exact: true })).toBeVisible();
});
