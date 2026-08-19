import { devices, expect, test } from "@playwright/test";

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

function normalizeAxNodes(nodes) {
  return nodes.map((node) => ({
    id: node.nodeId,
    parentId: node.parentId,
    childIds: node.childIds ?? [],
    role: node.role?.value ?? "",
    name: node.name?.value ?? "",
    ignored: Boolean(node.ignored),
    properties: Object.fromEntries(
      (node.properties ?? []).map((property) => [property.name, property.value?.value]),
    ),
  }));
}

function axDescendants(nodes, root) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const descendants = [];
  const pending = [...root.childIds];
  while (pending.length > 0) {
    const node = byId.get(pending.shift());
    if (!node) continue;
    descendants.push(node);
    pending.push(...node.childIds);
  }
  return descendants;
}

async function fullAxTree(session) {
  const { nodes } = await session.send("Accessibility.getFullAXTree");
  return normalizeAxNodes(nodes);
}

async function tapCenter(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

async function createTouchPage(browser, baseURL) {
  const context = await browser.newContext({
    ...devices["iPhone 13"],
    baseURL,
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.addInitScript(() => {
    localStorage.setItem("kin-reference-theme", "dark");
    localStorage.setItem("kin-integration-locale", "en");
  });
  return { context, errors, page };
}

test("Chromium accessibility tree exposes named progress, live save state, and virtual options", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("kin-reference-theme", "dark");
    localStorage.setItem("kin-integration-locale", "en");
  });
  const session = await page.context().newCDPSession(page);
  await session.send("Accessibility.enable");

  await page.goto("/examples/workspace-reference/core-components.html", { waitUntil: "networkidle" });
  let nodes = await fullAxTree(session);
  const progress = nodes.find((node) => node.role === "progressbar");
  const meter = nodes.find((node) => node.role === "meter");
  expect(progress?.name).toBe("正在核验来源");
  expect(progress?.properties.valuemax).toBe(5);
  expect(meter?.name).toBe("本月自动化额度");
  expect(meter?.properties.valuemax).toBe(100);

  await page.goto("/examples/workspace-reference/showcase-components.html?lang=en&specimen=button", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect.poll(async () => {
    const current = await fullAxTree(session);
    const savingButton = current.find((node) => node.role === "button" && node.name === "Saving…");
    const liveText = current.find((node) => node.role === "StaticText" && node.name === "Saving…");
    return {
      busy: savingButton?.properties.busy,
      disabled: savingButton?.properties.disabled,
      liveText: Boolean(liveText),
    };
  }).toEqual({ busy: 1, disabled: true, liveText: true });
  await expect.poll(async () => {
    const current = await fullAxTree(session);
    return current.some((node) => node.role === "StaticText" && node.name === "Changes saved");
  }).toBe(true);

  await page.goto("/examples/workspace-reference/integrations.html", { waitUntil: "networkidle" });
  const virtuoso = page.locator("#virtuoso");
  await virtuoso.scrollIntoViewIfNeeded();
  await expect.poll(() => virtuoso.locator('[role="option"]').count()).toBeGreaterThan(0);
  nodes = await fullAxTree(session);
  const listbox = nodes.find((node) => node.role === "listbox" && node.name === "Virtualized entity list");
  expect(listbox).toBeDefined();
  if (!listbox) return;
  const owned = axDescendants(nodes, listbox);
  const options = owned.filter((node) => node.role === "option");
  expect(options.length).toBeGreaterThan(0);
  expect(options[0].properties.selected).toBe(true);
  expect(owned.some((node) => node.role === "list" || node.role === "listitem")).toBe(false);
});

test("trusted touchscreen taps operate Sonner recovery and dismissal inside the visual viewport", async ({ browser }, testInfo) => {
  const { context, errors, page } = await createTouchPage(browser, testInfo.project.use.baseURL);
  try {
    await page.goto("/examples/workspace-reference/integrations.html", { waitUntil: "networkidle" });
    await expect(page.evaluate(() => matchMedia("(pointer: coarse)").matches)).resolves.toBe(true);
    await expect(page.evaluate(() => navigator.maxTouchPoints)).resolves.toBeGreaterThan(0);

    await tapCenter(page, page.locator('[data-integration-action="toast-error"]'));
    const failedToast = page.locator('[data-sonner-toast][data-visible="true"]').filter({ hasText: "Export task failed" }).first();
    await expect(failedToast).toBeVisible();
    await expect.poll(() => failedToast.evaluate((element) => getComputedStyle(element).transform)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    const viewportHeight = await page.evaluate(() => visualViewport?.height ?? innerHeight);
    const toastBox = await failedToast.boundingBox();
    expect(toastBox).not.toBeNull();
    if (toastBox) {
      expect(toastBox.y).toBeGreaterThanOrEqual(0);
      expect(toastBox.y + toastBox.height).toBeLessThanOrEqual(viewportHeight);
    }

    const retry = failedToast.getByRole("button", { name: "Retry", exact: true });
    const retryBox = await retry.boundingBox();
    expect(Math.round(retryBox?.width ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.round(retryBox?.height ?? 0)).toBeGreaterThanOrEqual(44);
    await tapCenter(page, retry);
    const recoveredToast = page.locator('[data-sonner-toast][data-visible="true"]').filter({ hasText: "Export task submitted again" }).first();
    await expect(recoveredToast).toBeVisible();
    await expect.poll(() => recoveredToast.evaluate((element) => getComputedStyle(element).transform)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);

    const close = recoveredToast.getByRole("button", { name: "Close notification", exact: true });
    const closeBox = await close.boundingBox();
    expect(Math.round(closeBox?.width ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.round(closeBox?.height ?? 0)).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: testInfo.outputPath("touch-sonner-recovered.png") });
    await tapCenter(page, close);
    await expect(recoveredToast).toBeHidden();
  } finally {
    await context.close().catch(() => undefined);
  }
  expect(errors).toEqual([]);
});

test("trusted touch events activate DragOverlay and reorder the sortable list", async ({ browser }, testInfo) => {
  const { context, errors, page } = await createTouchPage(browser, testInfo.project.use.baseURL);
  try {
    await page.goto("/examples/workspace-reference/integrations.html", { waitUntil: "networkidle" });
    const section = page.locator("#dnd-kit");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator(".kin-sortable__handle")).toHaveCount(4);
    const handle = section.locator(".kin-sortable__handle").first();
    await handle.scrollIntoViewIfNeeded();
    const destination = section.locator(".kin-sortable__row").nth(1);
    const startBox = await handle.boundingBox();
    const destinationBox = await destination.boundingBox();
    expect(startBox).not.toBeNull();
    expect(destinationBox).not.toBeNull();
    if (!startBox || !destinationBox) return;

    const start = { x: startBox.x + startBox.width / 2, y: startBox.y + startBox.height / 2 };
    const end = { x: start.x, y: destinationBox.y + destinationBox.height * 0.8 };
    expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest(".kin-sortable__handle") !== null, start)).toBe(true);

    const session = await context.newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ ...start, id: 1, radiusX: 5, radiusY: 5, force: 1 }],
    });
    await page.waitForTimeout(220);
    for (let step = 1; step <= 12; step += 1) {
      const point = {
        x: start.x + ((end.x - start.x) * step) / 12,
        y: start.y + ((end.y - start.y) * step) / 12,
      };
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ ...point, id: 1, radiusX: 5, radiusY: 5, force: 1 }],
      });
      await page.waitForTimeout(30);
    }
    await expect(page.locator(".kin-sortable__row--overlay")).toBeVisible();
    const overlayBox = await page.locator(".kin-sortable__row--overlay").boundingBox();
    expect(overlayBox).not.toBeNull();
    if (overlayBox) {
      expect(overlayBox.x).toBeGreaterThanOrEqual(0);
      expect(overlayBox.x + overlayBox.width).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
    }
    await page.screenshot({ path: testInfo.outputPath("touch-dnd-overlay.png") });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page.locator(".kin-sortable__row--overlay")).toBeHidden();
    await expect(section.locator("[data-sort-id]").first()).toHaveAttribute("data-sort-id", "review");
  } finally {
    await context.close().catch(() => undefined);
  }
  expect(errors).toEqual([]);
});

test("forced colors and Reduced Motion preserve focus, boundaries, and non-animated state", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    ...devices["Desktop Chrome"],
    baseURL: testInfo.project.use.baseURL,
    colorScheme: "dark",
    forcedColors: "active",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.addInitScript(() => {
    localStorage.setItem("kin-reference-theme", "dark");
    localStorage.setItem("kin-integration-locale", "en");
  });

  try {
    await page.goto("/examples/workspace-reference/integrations.html", { waitUntil: "networkidle" });
    await expect(page.evaluate(() => matchMedia("(forced-colors: active)").matches)).resolves.toBe(true);
    await expect(page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).resolves.toBe(true);

    const commandTrigger = page.locator('[data-integration-action="command-open"]');
    await commandTrigger.click();
    const command = page.locator(".kin-command");
    const selectedItem = page.locator('[cmdk-item][data-selected="true"]');
    await expect(selectedItem).toBeVisible();
    await expect(command).toHaveCSS("box-shadow", "none");
    await expect(selectedItem).toHaveCSS("outline-width", "2px");
    await page.keyboard.press("Escape");

    const dnd = page.locator("#dnd-kit");
    await dnd.scrollIntoViewIfNeeded();
    const firstRow = dnd.locator(".kin-sortable__row").first();
    await dnd.locator(".kin-sortable__handle").first().focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await expect(firstRow).toHaveCSS("transition-duration", "0s");
    const overlay = page.locator(".kin-sortable__row--overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveCSS("box-shadow", "none");
    await page.keyboard.press("Escape");

    await page.locator('[data-integration-action="toast-error"]').click();
    const toast = page.locator('[data-sonner-toast][data-visible="true"]').first();
    await expect(toast).toBeVisible();
    await expect(toast).toHaveCSS("box-shadow", "none");
    await page.screenshot({ path: testInfo.outputPath("forced-colors-integrations.png") });
  } finally {
    await context.close().catch(() => undefined);
  }
  expect(errors).toEqual([]);
});
