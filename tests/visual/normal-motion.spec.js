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

test("normal motion preserves spatial direction for Inspector and Drawer", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("kin-reference-theme", "dark"));
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("/examples/workspace-reference/");

  const inspector = page.locator(".inspector");
  const inspectorDuration = await inspector.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(inspectorDuration.split(",").some((duration) => duration.trim() !== "0s")).toBe(true);
  await expect(inspector).toBeHidden();
  await page.locator("[data-inspector-open]").click();
  await expect(inspector).toBeVisible();
  await page.waitForTimeout(280);
  await expect(inspector.evaluate((element) => getComputedStyle(element).transform)).resolves.toMatch(/matrix\(1, 0, 0, 1, 0, 0\)|none/);
  await page.locator("[data-inspector-close]").click();
  await expect(inspector).toBeHidden();

  await page.goto("/examples/workspace-reference/core-components.html#overlays");
  const drawer = page.locator(".core-drawer");
  const drawerDuration = await drawer.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(drawerDuration.split(",").some((duration) => duration.trim() !== "0s")).toBe(true);
  await page.locator("[data-drawer-open]").click();
  await expect(drawer).toBeVisible();
  await page.waitForTimeout(260);
  await expect(drawer.evaluate((element) => getComputedStyle(element).transform)).resolves.toMatch(/matrix\(1, 0, 0, 1, 0, 0\)|none/);
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-drawer-layer]")).toHaveAttribute("data-state", "closed");
});

test("normal motion core controls expose visible state transitions", async ({ page }) => {
  await page.goto("/examples/workspace-reference/core-components.html#motion");
  const disclosure = page.locator("[data-motion-disclosure]");
  const chevron = disclosure.locator("svg");
  await expect(chevron.evaluate((element) => getComputedStyle(element).transitionDuration)).resolves.not.toBe("0s");
  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");

  const asyncButton = page.locator("[data-motion-save]");
  await asyncButton.click();
  await expect(asyncButton).toHaveClass(/is-pending/);
  const pendingIcon = asyncButton.locator('[data-icon-state="pending"]');
  await expect(pendingIcon).toBeVisible();
  await expect(pendingIcon.evaluate((element) => getComputedStyle(element).animationName)).resolves.toBe("core-spin");
  await expect(asyncButton).toHaveClass(/is-complete/, { timeout: 2_000 });
});

test("normal motion menus keep their exit phase and cancel stale cleanup on reopen", async ({ page }) => {
  await page.goto("/examples/workspace-reference/core-components.html#navigation");
  const trigger = page.getByRole("button", { name: "更多操作" });
  const menu = page.locator(".sample-menu").first();

  await trigger.click();
  await expect(menu).toHaveAttribute("data-state", "open");
  const durations = await menu.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(durations.split(",").some((duration) => duration.trim() !== "0s")).toBe(true);

  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("data-state", "closing");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(menu).toHaveAttribute("data-state", "open");
  await page.waitForTimeout(230);
  await expect(menu).toHaveAttribute("data-state", "open");
  await expect(menu).toBeVisible();
});

test("normal motion primary workspace menus share the interruptible surface contract", async ({ page }) => {
  await page.goto("/examples/workspace-reference/");
  const trigger = page.locator("[data-location-overflow-trigger]");
  const menu = page.locator("[data-location-overflow-menu]");

  await trigger.click();
  await expect(menu).toHaveAttribute("data-state", "open");
  await expect(menu.getByRole("menuitemcheckbox")).toBeFocused();
  const duration = await menu.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(duration.split(",").some((value) => value.trim() !== "0s")).toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("data-state", "closing");
  await trigger.click();
  await expect(menu).toHaveAttribute("data-state", "open");
  await page.waitForTimeout(230);
  await expect(menu).toBeVisible();
});

test("normal motion Drawer rapid reversal ends in the latest requested state", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("/examples/workspace-reference/motion.html");
  const trigger = page.locator("[data-lab-drawer-open]");
  const layer = page.locator("[data-lab-drawer-layer]");

  await trigger.click();
  await expect(layer).toHaveAttribute("data-state", "open");
  await page.locator("[data-lab-drawer-reverse]").click();
  await expect(layer).toHaveAttribute("data-state", "open", { timeout: 500 });
  await page.waitForTimeout(300);
  await expect(layer).toHaveAttribute("data-phase", "open");
  await expect(page.locator(".motion-drawer")).toBeVisible();
  await expect(page.getByText("最后请求为打开；没有旧的关闭计时器覆盖当前状态。")).toBeVisible();
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

test("normal motion coordinates Sidebar collapse and reversible Context Sidecar reflow", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("kin-reference-theme", "dark");
    localStorage.removeItem("kin-reference-sidebar-collapsed-v1");
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/examples/page-patterns/scheduling.html");

  const shell = page.locator("[data-schedule-shell]");
  const sidecar = page.locator("[data-schedule-sidecar]");
  const shellDuration = await shell.evaluate((element) => getComputedStyle(element).transitionDuration);
  const sidecarDuration = await sidecar.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(shellDuration.split(",").some((value) => value.trim() !== "0s")).toBe(true);
  expect(sidecarDuration.split(",").some((value) => value.trim() !== "0s")).toBe(true);

  const collapse = page.locator("[data-schedule-collapse]");
  await collapse.click();
  await collapse.click();
  await collapse.click();
  await page.waitForTimeout(300);
  await expect(shell).toHaveAttribute("data-sidebar-collapsed", "true");
  await expect(collapse).toBeFocused();

  const item = page.locator('[data-event-id="SCH-103"]');
  await item.click();
  await expect(shell).toHaveAttribute("data-sidecar-open", "true");
  await page.locator("[data-sidecar-close]").click();
  await page.locator("[data-sidecar-trigger]").click();
  await page.waitForTimeout(320);
  await expect(shell).toHaveAttribute("data-sidecar-open", "true");
  await expect(sidecar.evaluate((element) => getComputedStyle(element).transform)).resolves.toMatch(/matrix\(1, 0, 0, 1, 0, 0\)|none/);
  await expect(sidecar).toBeVisible();
});
