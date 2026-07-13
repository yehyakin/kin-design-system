import { expect, test } from "@playwright/test";

async function assertNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

test("200 percent reflow proxy keeps required workspace actions reachable", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 640, height: 720 });
  await page.goto("/examples/workspace-reference/");

  await expect(page.getByRole("heading", { name: "Alpha Network" })).toBeVisible();
  await expect(page.locator("[data-inspector-open]")).toBeVisible();
  await expect(page.locator(".sidebar")).toBeHidden();
  await assertNoHorizontalOverflow(page);

  await page.locator("[data-inspector-open]").click();
  await expect(page.locator(".inspector")).toBeVisible();
  await expect(page.locator("[data-inspector-close]")).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath("reflow-proxy-640-css-px.png"), fullPage: true });
});

test("long translated content preserves actions and wrapping", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/workspace-reference/core-components.html#actions");

  await page.locator("#actions").evaluate((section) => {
    const labels = section.querySelectorAll("button, label, legend");
    const replacements = [
      "Automatische Aktualisierung für alle verbundenen Arbeitsbereiche",
      "Änderungen nach sorgfältiger Prüfung speichern und fortfahren",
      "Benachrichtigungen für fehlgeschlagene Hintergrundaufgaben aktivieren",
      "Standarddarstellung mit zusätzlichen Kontextinformationen",
    ];
    labels.forEach((element, index) => {
      if (index < replacements.length) element.textContent = replacements[index];
    });
  });

  await expect(page.locator("#actions")).toContainText("Automatische Aktualisierung");
  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("long-content-mobile.png"), fullPage: true });
});

test("RTL stress preserves focus order and layout access", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/examples/workspace-reference/core-components.html#navigation");
  await page.locator("html").evaluate((element) => {
    element.dir = "rtl";
    element.lang = "ar";
  });
  await page.locator("#navigation").evaluate((section) => {
    section.querySelector("h2").textContent = "التنقل والإفصاح";
    section.querySelector(".reference-section-heading p").textContent = "يبقى الموقع والعرض والأوامر وحالة التوسيع واضحة.";
    const tabList = section.querySelector("[data-core-tabs]");
    tabList.setAttribute("aria-label", "طرق عرض القاعدة");
    ["الملخص", "السجل", "المصادر"].forEach((label, index) => {
      tabList.querySelectorAll('[role="tab"]')[index].textContent = label;
    });
    section.querySelector("[data-menu-trigger]").textContent = "إجراءات إضافية";
    ["نسخ القاعدة", "عرض سجل التدقيق", "تعطيل القاعدة"].forEach((label, index) => {
      section.querySelectorAll('.sample-menu [role="menuitem"]')[index].textContent = label;
    });
  });

  const tabs = page.getByRole("tablist", { name: "طرق عرض القاعدة" });
  await tabs.getByRole("tab", { name: "الملخص" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: "السجل" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "إجراءات إضافية" }).click();
  await expect(page.getByRole("menuitem", { name: "نسخ القاعدة" })).toBeFocused();
  await page.keyboard.press("Escape");
  await assertNoHorizontalOverflow(page);

  await page.screenshot({ path: testInfo.outputPath("rtl-navigation-mobile.png"), fullPage: true });
});

test("Forced Colors preserves focus and state boundaries", async ({ page }, testInfo) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto("/examples/workspace-reference/core-components.html#feedback");

  await expect(page.evaluate(() => matchMedia("(forced-colors: active)").matches)).resolves.toBe(true);
  const retry = page.getByRole("button", { name: "重试", exact: true });
  await retry.focus();
  await expect(retry).toBeFocused();
  const outline = await retry.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outline).not.toBe("none");
  await expect(page.getByRole("alert")).toContainText("来源同步失败");

  await page.screenshot({ path: testInfo.outputPath("forced-colors-feedback.png"), fullPage: false });
});

test("reduced motion removes spatial travel from Inspector and Drawer", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("/examples/workspace-reference/");
  await page.locator("[data-inspector-open]").click();
  await expect(page.locator(".inspector").evaluate((element) => getComputedStyle(element).transform)).resolves.toBe("none");

  await page.goto("/examples/workspace-reference/core-components.html#overlays");
  await page.locator("[data-drawer-open]").click();
  await expect(page.locator(".core-drawer").evaluate((element) => getComputedStyle(element).transform)).resolves.toBe("none");
  await expect(page.locator("[data-drawer-layer]")).toHaveAttribute("data-state", "open");
});

test("reduced motion keeps Motion Lab state and focus without directional travel", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/examples/workspace-reference/motion.html");

  await expect(page.getByText("减少动态效果", { exact: true })).toBeVisible();
  const paired = page.locator("[data-lab-toggle]");
  await paired.click();
  await expect(paired).toHaveAttribute("aria-pressed", "true");
  await expect(paired.locator('[data-icon-state="active"]').evaluate((element) => getComputedStyle(element).transform)).resolves.toBe("none");

  const menuTrigger = page.getByRole("button", { name: "对象操作" });
  await menuTrigger.click();
  const menu = page.locator(".lab-menu");
  await expect(menu).toHaveAttribute("data-state", "open");
  await expect(menu.evaluate((element) => getComputedStyle(element).transform)).resolves.toBe("none");
  await page.keyboard.press("Escape");
  await expect(menuTrigger).toBeFocused();

  await page.locator("[data-lab-drawer-open]").click();
  await expect(page.locator(".motion-drawer").evaluate((element) => getComputedStyle(element).transform)).resolves.toBe("none");
});
