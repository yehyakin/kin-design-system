import { expect, test } from "@playwright/test";

const families = [
  {
    name: "information",
    path: "/examples/product-patterns/information.html",
    primary: ".article h1",
    selected: '.topic-nav a[aria-current="page"]',
    boundary: ".topic-nav",
    icons: ["book-open-text", "network", "shield-check"],
  },
  {
    name: "ecommerce",
    path: "/examples/product-patterns/ecommerce.html",
    primary: ".commerce-bar h1",
    selected: ".commerce-row.selected",
    boundary: ".commerce-inspector",
    selectedShadow: false,
    icons: ["shopping-bag", "package", "clipboard-check"],
  },
  {
    name: "engineering",
    path: "/examples/product-patterns/canvas.html",
    primary: ".drawing-area",
    selected: '.tool-rail button[aria-pressed="true"]',
    boundary: ".property-panel",
    icons: ["shapes", "mouse-pointer-2", "ruler"],
  },
];

async function seedAppearance(page, theme, contrast = "normal") {
  await page.addInitScript(({ selectedTheme, selectedContrast }) => {
    localStorage.setItem("kin-reference-theme", selectedTheme);
    localStorage.setItem("kin-reference-contrast", selectedContrast);
  }, { selectedTheme: theme, selectedContrast: contrast });
}

async function expectNoDocumentOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

async function expectMaterialContract(page, family) {
  const roles = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return [
      "--edge-highlight",
      "--edge-highlight-strong",
      "--edge-contact",
      "--shadow-contact",
      "--shadow-raised",
      "--shadow-floating",
    ].map((name) => [name, styles.getPropertyValue(name).trim()]);
  });
  for (const [name, value] of roles) expect(value, `${name} should resolve`).not.toBe("");

  const selectedShadow = await page.locator(family.selected).evaluate((element) => getComputedStyle(element).boxShadow);
  const boundaryShadow = await page.locator(family.boundary).evaluate((element) => getComputedStyle(element).boxShadow);
  if (family.selectedShadow !== false) expect(selectedShadow).not.toBe("none");
  expect(boundaryShadow).not.toBe("none");
}

async function selectionMaterial(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const resolveColor = (token) => {
      const probe = document.createElement("span");
      probe.style.backgroundColor = `var(${token})`;
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    };
    const style = getComputedStyle(element);
    return {
      accent: resolveColor("--accent"),
      background: style.backgroundColor,
      boxShadow: style.boxShadow,
      navigationSelected: resolveColor("--navigation-selected"),
      surfaceSelected: resolveColor("--surface-selected"),
    };
  });
}

for (const family of families) {
  test(`${family.name} reference uses KIN material and Lucide icons`, async ({ page }) => {
    await seedAppearance(page, "dark");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(family.path);

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator(family.primary)).toBeVisible();
    await expect(page.locator("i[data-lucide]")).toHaveCount(0);
    expect(await page.locator("svg.lucide").count()).toBeGreaterThan(18);
    for (const icon of family.icons) await expect(page.locator(`svg.lucide-${icon}`).first()).toBeVisible();
    await expectMaterialContract(page, family);
    await expectNoDocumentOverflow(page);
  });

  test(`${family.name} reference preserves hierarchy in light narrow layout`, async ({ page }) => {
    await seedAppearance(page, "light");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(family.path);

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator(family.primary)).toBeVisible();
    await expect(page.locator("i[data-lucide]")).toHaveCount(0);
    expect(await page.locator("svg.lucide").count()).toBeGreaterThan(14);
    await expectNoDocumentOverflow(page);
  });
}

test("high contrast removes product-reference material shadows without losing selection", async ({ page }) => {
  await seedAppearance(page, "dark", "more");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(families[0].path);

  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(page.locator(families[0].selected)).toBeVisible();
  await expect(page.locator(families[0].selected)).toHaveCSS("box-shadow", "none");
  await expect(page.locator(families[0].selected)).toHaveCSS("border-radius", "5px");
});

test("product references distinguish current navigation from selected work objects", async ({ page }) => {
  await seedAppearance(page, "dark");
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto(families[0].path);
  const informationNavigation = await selectionMaterial(page, '.topic-nav a[aria-current="page"]');
  expect(informationNavigation.background).toBe(informationNavigation.navigationSelected);
  expect(informationNavigation.background).not.toBe(informationNavigation.surfaceSelected);
  expect(informationNavigation.boxShadow).not.toContain(informationNavigation.accent);

  await page.goto(families[1].path);
  const ecommerceNavigation = await selectionMaterial(page, '.commerce-nav a[aria-current="page"]');
  const ecommerceObject = await selectionMaterial(page, ".commerce-row.selected");
  expect(ecommerceNavigation.background).toBe(ecommerceNavigation.navigationSelected);
  expect(ecommerceNavigation.background).not.toBe(ecommerceNavigation.surfaceSelected);
  expect(ecommerceNavigation.boxShadow).not.toContain(ecommerceNavigation.accent);
  expect(ecommerceObject.background).toBe(ecommerceObject.surfaceSelected);
  expect(ecommerceObject.boxShadow).not.toContain(ecommerceObject.accent);

  await page.goto(families[2].path);
  const toolSelection = await selectionMaterial(page, '.tool-rail button[aria-pressed="true"]');
  expect(toolSelection.background).toBe(toolSelection.surfaceSelected);
  expect(toolSelection.boxShadow).not.toContain(toolSelection.accent);
  const layerSelection = await selectionMaterial(page, '.layer-tree button[aria-selected="true"]');
  expect(layerSelection.background).toBe(layerSelection.surfaceSelected);
  expect(layerSelection.boxShadow).not.toContain(layerSelection.accent);
});

test("patterns showcase mounts every current reference with its product icon grammar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/zh/patterns/");

  const choices = [
    { id: "information-site", ready: ".article h1", stageIcon: "book-open-text", productIcon: "book-open-text" },
    { id: "intelligence-workspace", ready: "[data-investigation]", stageIcon: "scan-search", productIcon: "database" },
    { id: "ecommerce-operations", ready: '.commerce-row[aria-selected="true"]', stageIcon: "package-check", productIcon: "shopping-bag" },
    { id: "engineering-canvas", ready: '.drawing-area svg[role="img"]', stageIcon: "box-select", productIcon: "shapes" },
  ];

  for (const choice of choices) {
    const tab = page.locator(`[data-pattern-choice="${choice.id}"]`);
    await expect(tab.locator(`svg.lucide-${choice.stageIcon}`)).toBeVisible();
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const frame = page.frameLocator("iframe[data-stage-frame]");
    await expect(frame.locator(choice.ready)).toBeVisible();
    await expect(frame.locator(`svg.lucide-${choice.productIcon}`).first()).toBeVisible();
    await expect(frame.locator("i[data-lucide]")).toHaveCount(0);
  }
});
