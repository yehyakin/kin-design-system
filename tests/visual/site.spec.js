import { expect, test } from "@playwright/test";

const SHOWCASE_ROOT_IDS = [
  "overview",
  "principles",
  "foundations",
  "components",
  "patterns",
  "ai-contract",
  "agents",
  "resources",
  "flows",
];

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(
    dimensions.scrollWidth,
    `${page.url()} has ${dimensions.scrollWidth - dimensions.clientWidth}px of horizontal overflow`,
  ).toBeLessThanOrEqual(dimensions.clientWidth);
}

async function expectEmbeddedDocumentsNoHorizontalOverflow(page, selector = "iframe[data-stage-frame]") {
  const frames = page.locator(selector);
  const count = await frames.count();
  for (let index = 0; index < count; index += 1) {
    const frame = frames.nth(index);
    await frame.scrollIntoViewIfNeeded();
    await expect
      .poll(
        () =>
          frame.evaluate((element) => {
            const root = element.contentDocument?.documentElement;
            return root?.clientWidth ?? 0;
          }),
        { message: `Waiting for embedded document ${index + 1} on ${page.url()}` },
      )
      .toBeGreaterThan(0);
    const dimensions = await frame.evaluate((element) => {
      const root = element.contentDocument.documentElement;
      return { clientWidth: root.clientWidth, scrollWidth: root.scrollWidth };
    });
    expect(
      dimensions.scrollWidth,
      `Embedded document ${index + 1} on ${page.url()} has ${
        dimensions.scrollWidth - dimensions.clientWidth
      }px of horizontal overflow`,
    ).toBeLessThanOrEqual(dimensions.clientWidth);
  }
}

async function expectReadableContrast(locator, minimum = 4.5) {
  const ratios = await locator.evaluateAll((elements) => {
    function parseColor(value) {
      const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0, channels[3] ?? 1];
    }

    function composite(top, bottom) {
      const alpha = top[3] + bottom[3] * (1 - top[3]);
      if (alpha === 0) return [0, 0, 0, 0];
      return [
        (top[0] * top[3] + bottom[0] * bottom[3] * (1 - top[3])) / alpha,
        (top[1] * top[3] + bottom[1] * bottom[3] * (1 - top[3])) / alpha,
        (top[2] * top[3] + bottom[2] * bottom[3] * (1 - top[3])) / alpha,
        alpha,
      ];
    }

    function luminance(color) {
      const channels = color.slice(0, 3).map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    }

    return elements
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden";
      })
      .map((element) => {
        let background = [0, 0, 0, 0];
        for (let node = element; node; node = node.parentElement) {
          background = composite(background, parseColor(getComputedStyle(node).backgroundColor));
          if (background[3] >= 0.999) break;
        }
        if (background[3] < 0.999) background = composite(background, [255, 255, 255, 1]);
        const foreground = composite(parseColor(getComputedStyle(element).color), background);
        const foregroundLuminance = luminance(foreground);
        const backgroundLuminance = luminance(background);
        return {
          background: background.slice(0, 3).map(Math.round).join(", "),
          color: foreground.slice(0, 3).map(Math.round).join(", "),
          ratio: (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
            / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05),
          text: element.textContent.trim().slice(0, 80),
        };
      });
  });

  expect(ratios.length).toBeGreaterThan(0);
  for (const result of ratios) {
    expect(
      result.ratio,
      `"${result.text}" uses rgb(${result.color}) on rgb(${result.background})`,
    ).toBeGreaterThanOrEqual(minimum);
  }
}

test("English and Chinese roots lead with a catalog-backed workflow", async ({ page }) => {
  const consoleWarnings = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) consoleWarnings.push(message.text());
  });

  const locales = [
    {
      path: "/",
      lang: "en",
      title: "KIN Showcase — Design rules and runnable references",
      heading: "Designed for consequential work.",
      workflow: "Investigation and Evidence Review",
      job: "Compare chronology, sources, conflicts, and uncertainty before recording a finding.",
      tabs: ["Investigation", "Commerce", "Canvas"],
      reference: "examples/workspace-reference/index.html?view=investigation&lang=en&state=normal",
      source: "Stable",
    },
    {
      path: "/zh/",
      lang: "zh-CN",
      title: "KIN 展示 — 设计规则与可运行参考",
      heading: "为重要工作而设计。",
      workflow: "调查与证据复核",
      job: "在记录结论前比较时间顺序、来源、冲突与不确定性。",
      tabs: ["调查", "电商", "画布"],
      reference: "../examples/workspace-reference/index.html?view=investigation&lang=zh-CN&state=normal",
      source: "稳定",
    },
  ];

  for (const locale of locales) {
    await page.goto(locale.path);
    await expect(page).toHaveTitle(locale.title);
    await expect(page.locator("html")).toHaveAttribute("lang", locale.lang);
    await expect(page.locator("main")).toHaveAttribute("data-showcase-route", "home");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale.heading);

    const firstSection = page.locator("main > section").first();
    const workflow = firstSection.locator("[data-scenario-stage]");
    const frame = workflow.locator("[data-stage-frame]");
    const disclosure = workflow.locator("details.reference-disclosure");
    await expect(workflow).toBeVisible();
    await expect(workflow.getByRole("heading", { level: 2 })).toHaveText(locale.workflow);
    await expect(workflow.locator("[data-stage-job]")).toHaveText(locale.job);
    await expect(workflow.getByRole("tab")).toHaveCount(3);
    await expect(workflow.getByRole("tab").allTextContents()).resolves.toEqual(locale.tabs);
    await expect(workflow.getByRole("tab").first()).toHaveAttribute("aria-selected", "true");
    await expect(workflow.getByRole("tab").first()).toHaveAttribute("aria-controls", "showcase-stage-panel");
    await expect(workflow.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "scenario-tab-investigation");
    await expect(frame).toHaveAttribute("src", locale.reference);
    await expect(workflow).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
    await expect(workflow.locator("[data-stage-loading]")).toBeHidden();
    await expect(workflow.locator("[data-preview-activate], [data-preview-deactivate]")).toHaveCount(0);
    await expect(page.locator(".manifesto-grid > a")).toHaveCount(4);
    await expect(disclosure).not.toHaveAttribute("open", "");
    await expect(disclosure.locator("dt")).toHaveCount(4);
    await disclosure.locator("summary").click();
    await expect(disclosure).toHaveAttribute("open", "");
    await expect(disclosure).toContainText(locale.source);

    for (const id of SHOWCASE_ROOT_IDS) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }

    const catalogDisclosure = page.locator(".showcase-evidence details.catalog-disclosure");
    await expect(catalogDisclosure).not.toHaveAttribute("open", "");
    await expect(catalogDisclosure.locator('[data-showcase-count="showcased-scenarios"]')).toHaveText("17");
    await expect(catalogDisclosure.locator('[data-showcase-count="planned-scenarios"]')).toHaveText("13");
    await expect(catalogDisclosure.locator('[data-showcase-count="stable-components"]')).toHaveText("65");
    await expect(catalogDisclosure.locator('[data-showcase-count="stable-pages"]')).toHaveText("10");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expectNoHorizontalOverflow(page);
  }

  expect(consoleWarnings).toEqual([]);
});

test("home stage auto-loads and keyboard tabs replace the live reference", async ({ page }) => {
  let releaseInitialReference;
  let releaseCommerceReference;
  const initialReferenceGate = new Promise((resolve) => {
    releaseInitialReference = resolve;
  });
  const commerceReferenceGate = new Promise((resolve) => {
    releaseCommerceReference = resolve;
  });

  await page.route("**/examples/workspace-reference/index.html?view=investigation*", async (route) => {
    await initialReferenceGate;
    await route.continue();
  });
  await page.route("**/examples/product-patterns/ecommerce.html?edit=normal*", async (route) => {
    await commerceReferenceGate;
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const stage = page.locator("[data-scenario-stage]");
  const loader = stage.locator("[data-stage-loading]");
  const frame = stage.locator("[data-stage-frame]");
  const tabs = stage.getByRole("tab");
  await expect(stage).toHaveAttribute("data-stage-ready", "false");
  await expect(loader).toBeVisible();
  await expect(frame).toHaveAttribute(
    "src",
    "examples/workspace-reference/index.html?view=investigation&lang=en&state=normal",
  );
  await expect(stage.locator("[data-preview-activate], [data-preview-deactivate]")).toHaveCount(0);

  releaseInitialReference();
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(loader).toBeHidden();
  await expect(page.frameLocator("[data-stage-frame]").locator("[data-investigation]")).toBeVisible();

  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(stage.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "scenario-tab-commerce");
  await expect(stage).toHaveAttribute("data-stage-ready", "false");
  await expect(loader).toBeVisible();
  await expect(frame).toHaveAttribute(
    "src",
    "examples/product-patterns/ecommerce.html?edit=normal#product-context",
  );
  await expect(stage.locator("[data-stage-title]")).toHaveText("Product Detail and Edit");
  await expect(stage.locator("[data-stage-lab-link]")).toHaveAttribute(
    "href",
    /scenarios\/lab\.html\?scenario=COM-02.*mode=present/,
  );

  releaseCommerceReference();
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(loader).toBeHidden();
  await expect(page.frameLocator("[data-stage-frame]").locator(".commerce-main")).toBeVisible();
});

test("home stage retains a useful fallback when a live reference is unavailable", async ({ page }) => {
  await page.goto("/");

  const stage = page.locator("[data-scenario-stage]");
  const frame = stage.locator("[data-stage-frame]");
  const commerce = stage.getByRole("tab", { name: "Commerce" });
  await commerce.evaluate((element) => {
    element.dataset.reference = "missing-interactive-reference.html";
  });
  await commerce.click();

  await expect(stage).toHaveAttribute("data-stage-ready", "false");
  await expect(frame).toHaveAttribute("src", "missing-interactive-reference.html");
  await expect(stage.locator("[data-stage-loading]")).toHaveText(
    "Reference unavailable. Open it in Lab.",
    { timeout: 10_000 },
  );
  await expect(stage.locator("[data-stage-loading]")).toBeVisible();
  await expect(stage.locator("[data-stage-lab-link]")).toHaveAttribute(
    "href",
    /scenarios\/lab\.html\?scenario=COM-02.*mode=present/,
  );
});

test("Reduced Motion stages use opacity-only transitions and settle rapid replacement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const homeStage = page.locator("[data-scenario-stage]");
  const homeFrame = homeStage.locator("iframe[data-stage-frame]");
  await expect
    .poll(() =>
      homeFrame.evaluate((element) => {
        const style = getComputedStyle(element);
        return `${style.transitionProperty} ${style.transitionDuration}`;
      }),
    )
    .toBe("opacity 0.08s");

  const tabs = homeStage.getByRole("tab");
  await tabs.nth(1).click();
  await tabs.nth(2).click();
  await tabs.nth(0).click();
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(homeStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator("[data-scenario-stage] iframe").locator("[data-investigation]")).toBeVisible();

  await page.goto("/components/");
  const browser = page.locator("[data-component-browser]");
  const choices = browser.locator("[data-component-choice]");
  const componentStage = browser.locator("[data-reference-stage]");
  const componentFrame = componentStage.locator("iframe[data-stage-frame]");
  await expect
    .poll(() =>
      componentFrame.evaluate((element) => {
        const style = getComputedStyle(element);
        return `${style.transitionProperty} ${style.transitionDuration}`;
      }),
    )
    .toBe("opacity 0.08s");

  await choices.nth(1).click();
  await choices.nth(2).click();
  await choices.nth(0).click();
  await expect(choices.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(componentStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator("[data-component-browser] iframe").locator("#state-reference")).toBeVisible();
});

test("documentation route retains the original contract and reference destinations", async ({ page }) => {
  const consoleWarnings = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) consoleWarnings.push(message.text());
  });

  await page.goto("/docs/");
  await expect(page).toHaveTitle("Documentation - KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Clear interfaces for work that needs attention.");
  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Delivery model/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Search and results" })).toHaveAttribute("href", "../examples/page-patterns/search.html");
  await expect(page.getByRole("link", { name: /Sign-in page/, exact: true }).first()).toHaveAttribute("href", "../examples/page-patterns/access.html?lang=en");
  await expect(page.getByRole("link", { name: /Authentication dialog/, exact: true }).first()).toHaveAttribute("href", "../examples/workspace-reference/core-components.html?lang=en&dialog=authentication#authentication");
  await expect(page.getByRole("link", { name: /Session re-authentication/, exact: true }).first()).toHaveAttribute("href", "../examples/workspace-reference/core-components.html?lang=en&dialog=reauthentication#authentication");
  await expect(page.getByRole("link", { name: /Motion Lab/ }).first()).toHaveAttribute("href", "../examples/workspace-reference/motion.html");
  await expect(page.locator('.language-menu a[hreflang="zh-CN"]')).toHaveAttribute("href", "../zh/docs/");
  await expect(page.locator('.language-menu a[hreflang="zh-CN"]')).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("svg.lucide")).not.toHaveCount(0);
  await expect(page.locator(".docs-nav svg.lucide-blocks")).toBeVisible();
  await expect(page.locator(".nav-scrim")).toBeHidden();
  await expect(page.getByRole("button", { name: "Close navigation" })).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expectNoHorizontalOverflow(page);

  await page.goto("/zh/docs/");
  await expect(page).toHaveTitle("文档 - KIN Design System");
  await expect(page.locator('.docs-nav a[href="../../scenarios/"]')).toContainText("场景目录");
  await expect(page.getByRole("link", { name: "浏览 30 个任务场景（英文为主）" })).toHaveAttribute(
    "href",
    "../../scenarios/",
  );
  await expect(page.locator('.command-list a[href="../../scenarios/"]')).toContainText("30 个场景 · 英文为主");
  expect(consoleWarnings).toEqual([]);
});

test("compact documentation and Lab metadata retain AA text contrast", async ({ page }) => {
  for (const theme of ["dark", "light"]) {
    await page.goto("/docs/");
    if (theme === "light") await page.locator("[data-theme-switch]").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator(".command-trigger")).toHaveCSS(
      "background-color",
      theme === "dark" ? "rgb(20, 21, 22)" : "rgb(244, 245, 246)",
    );

    for (const selector of [
      ".command-trigger kbd",
      ".nav-group h2",
      ".nav-group .nav-count",
      ".nav-footer",
      ".section-rail h2",
      ".section-rail .release-note",
    ]) {
      await expectReadableContrast(page.locator(selector));
    }

    await page.locator("[data-command-trigger]").click();
    await expect(page.locator("[data-command-dialog]")).toBeVisible();
    await expectReadableContrast(page.locator(".command-group-label"));
    await expectReadableContrast(page.locator(".command-item span"));
    await page.keyboard.press("Escape");

    await page.goto(`/scenarios/lab.html?scenario=INT-02&state=normal&viewport=wide&theme=${theme}&mode=inspect`);
    await expect(page.locator("[data-scenario-lab]")).toHaveAttribute("data-mode", "inspect");
    await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass");
    for (const selector of [
      ".lab-phase",
      ".lab-label-row span",
      ".lab-field-help",
      ".lab-segmented button small",
      ".lab-brief-list dt",
      ".lab-motion-note",
      ".lab-frame-label",
    ]) {
      await expectReadableContrast(page.locator(selector));
    }
  }
});

test("component discovery presents eight choices, a live stage, and a closed full catalog", async ({ page }) => {
  await page.goto("/components/");
  await expect(page).toHaveTitle("Find a component by task and evidence. · KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Featured components");
  await expect(page.locator("main")).toHaveAttribute("data-showcase-route", "components");
  const browser = page.locator("[data-component-browser]");
  const choices = browser.locator("[data-component-choice]");
  const stage = browser.locator("[data-reference-stage]");
  const catalog = page.locator("details.catalog-disclosure");
  const catalogRows = catalog.locator(".discovery-row[data-component-id]");

  await expect(choices).toHaveCount(8);
  await expect(choices.first()).toHaveAttribute("data-component-id", "command-menu");
  await expect(choices.first()).toHaveAttribute("aria-selected", "true");
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(stage.locator("[data-stage-loading]")).toBeHidden();
  await expect(stage.locator("[data-stage-frame]")).toHaveAttribute(
    "src",
    "../examples/workspace-reference/states.html?lang=zh-CN#state-reference",
  );
  await expect(catalog).not.toHaveAttribute("open", "");
  await expect(catalogRows).toHaveCount(77);
  await expect(catalogRows.locator(".status-badge--stable")).toHaveCount(65);
  await expect(catalogRows.locator("a.discovery-row__name")).toHaveCount(8);
  await expect(catalog.locator("#source-boundary-title")).toHaveText("Source boundary");
  await expect(catalogRows.first()).toBeHidden();

  await choices.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(choices.nth(1)).toBeFocused();
  await expect(choices.nth(1)).toHaveAttribute("data-component-id", "evidence-list");
  await expect(choices.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(stage.locator("[data-stage-title]")).toHaveText("Evidence List");
  await expect(stage.locator("[data-stage-explorer]")).toHaveAttribute("href", "evidence-list/");
  await expect(stage.locator("[data-stage-frame]")).toHaveAttribute(
    "src",
    "../examples/workspace-reference/advanced-components.html?lang=zh-CN#evidence-title",
  );
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator("[data-component-browser] [data-stage-frame]").locator("#evidence-title")).toBeVisible();

  await stage.getByRole("button", { name: "Light" }).click();
  await expect(stage.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.frameLocator("[data-component-browser] [data-stage-frame]").locator("html")).toHaveAttribute(
    "data-theme",
    "light",
  );
  await catalog.locator("summary").click();
  await expect(catalog).toHaveAttribute("open", "");
  await expect(catalogRows.first()).toBeVisible();
  await expect(catalog.locator('[data-component-id="evidence-list"] a.discovery-row__name')).toHaveAttribute(
    "href",
    "evidence-list/",
  );
  await expect(page.locator('.language-menu a[hreflang="zh-CN"]')).toHaveAttribute("href", "../zh/components/");
});

test("component stages reveal only the intended fixture fragment", async ({ page }) => {
  await page.route("**/examples/workspace-reference/states.html?lang=zh-CN", async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><head><title>Valid but unrelated reference</title></head><body><main>Unrelated</main></body></html>",
    });
  });
  await page.goto("/components/");

  const stage = page.locator("[data-component-browser] [data-reference-stage]");
  await expect(stage).toHaveAttribute("data-ready-fragment", "state-reference");
  await expect(stage).toHaveAttribute("data-stage-ready", "false");
  await expect(stage.locator("[data-stage-loading]")).toHaveText("Reference unavailable", { timeout: 10_000 });
  await expect(stage.locator("[data-stage-loading]")).toBeVisible();
});

test("Component Explorer prioritizes local navigation, stage controls, and lower evidence tabs", async ({ page }) => {
  await page.goto("/components/evidence-list/");
  await expect(page).toHaveTitle("Evidence List · KIN Design System");
  await expect(page.locator("main")).toHaveAttribute("data-showcase-route", "component-explorer");
  const explorer = page.locator('header[data-component-id="evidence-list"]');
  const localNavigation = page.locator(".component-studio__navigation");
  const stage = page.locator("[data-reference-stage]");
  await expect(explorer.getByRole("heading", { level: 1 })).toHaveText("Evidence List");
  await expect(explorer).toContainText("Stable");
  await expect(explorer).toContainText("Map a claim or decision to supporting, missing, stale, or conflicting sources");
  await expect(localNavigation.locator("nav a")).toHaveCount(8);
  await expect(localNavigation.locator('a[aria-current="page"]')).toHaveText("Evidence List");
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(stage.locator("[data-stage-loading]")).toBeHidden();
  await expect(stage.locator("[data-stage-frame]")).toHaveAttribute(
    "src",
    "../../examples/workspace-reference/advanced-components.html?lang=zh-CN#evidence-title",
  );
  await expect(page.frameLocator("[data-reference-stage] [data-stage-frame]").locator("#evidence-title")).toBeVisible();
  await expect(page.frameLocator("[data-reference-stage] [data-stage-frame]").locator("html")).toHaveAttribute(
    "lang",
    "zh-CN",
  );
  await expect(stage.locator(".reference-stage__footer")).toContainText("Reference language");
  await expect(stage.locator(".reference-stage__footer")).toContainText("中文");
  await expect(stage.getByRole("combobox", { name: "States" })).toHaveValue("Evidence with a recorded conflict");
  await expect(stage.getByRole("group", { name: "Theme" }).getByRole("button")).toHaveCount(2);
  await expect(stage.getByRole("group", { name: "Viewport" }).getByRole("button")).toHaveCount(2);

  await stage.getByRole("button", { name: "Light" }).click();
  await expect(stage.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.frameLocator("[data-reference-stage] [data-stage-frame]").locator("html")).toHaveAttribute(
    "data-theme",
    "light",
  );
  await stage.getByRole("button", { name: "Narrow" }).click();
  await expect(stage).toHaveAttribute("data-stage-viewport", "narrow");
  await expect(stage.getByRole("button", { name: "Narrow" })).toHaveAttribute("aria-pressed", "true");

  const tabs = page.locator("[data-component-tabs]");
  await expect(tabs.getByRole("tab")).toHaveCount(4);
  await expect(tabs.getByRole("tab", { name: "Usage" })).toHaveAttribute("aria-selected", "true");
  await tabs.getByRole("tab", { name: "Usage" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: "States" })).toBeFocused();
  await expect(tabs.getByRole("tabpanel", { name: "States" })).toBeVisible();
  await expect(tabs.getByRole("heading", { name: "State coverage boundary" })).toBeVisible();
  await expect(tabs.getByText(/inventory is deferred until canonical machine-readable state sources exist/)).toBeVisible();
  await expect(tabs.getByRole("link", { name: "Open the core state contract" })).toHaveAttribute(
    "href",
    /components\/core-states\.md$/,
  );
  await tabs.getByRole("tab", { name: "Accessibility" }).click();
  await expect(tabs.getByRole("tabpanel", { name: "Accessibility" })).toBeVisible();
  await expect(tabs.locator('.component-support-grid [data-supported="true"]')).toHaveCount(5);
  await expect(tabs.getByText(/do not establish assistive-technology/)).toBeVisible();
  await tabs.getByRole("tab", { name: "Contract" }).click();
  await expect(tabs.getByRole("tabpanel", { name: "Contract" })).toBeVisible();
  await expect(tabs.getByRole("heading", { name: "Known gaps" })).toBeVisible();
  await expect(tabs.getByText("No gap is recorded for this component in the canonical catalog.")).toBeVisible();
  await expect(page.locator('.language-menu a[hreflang="zh-CN"]')).toHaveAttribute(
    "href",
    "../../zh/components/evidence-list/",
  );
});

test("Component Explorers expose the actual canonical fixture language", async ({ page }) => {
  const consoleWarnings = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) consoleWarnings.push(message.text());
  });

  const explorers = [
    ["app-shell", "en"],
    ["evidence-list", "zh-CN"],
    ["suggested-change-review", "zh-CN"],
    ["execution-preview", "zh-CN"],
    ["background-task-queue", "zh-CN"],
    ["command-menu", "zh-CN"],
    ["authentication-dialog", "zh-CN"],
    ["data-table", "zh-CN"],
  ];

  for (const [id, referenceLanguage] of explorers) {
    await page.goto(`/components/${id}/`);
    const stage = page.locator("[data-reference-stage]");
    const frame = stage.locator("[data-stage-frame]");
    await expect(frame).toHaveAttribute("src", new RegExp(`lang=${referenceLanguage}`));
    await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
    await expect(page.frameLocator("[data-reference-stage] [data-stage-frame]").locator("html")).toHaveAttribute(
      "lang",
      referenceLanguage,
    );
    await expect(stage.locator(".reference-stage__footer")).toContainText(
      referenceLanguage === "en" ? "English" : "中文",
    );
  }

  expect(consoleWarnings).toEqual([]);
});

test("Pattern discovery renders four live references without blueprint substitutes", async ({ page }) => {
  await page.goto("/patterns/");
  await expect(page).toHaveTitle("Choose composition from the work. · KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Choose composition from the work.");
  await expect(page.locator("main")).toHaveAttribute("data-showcase-route", "patterns");
  const patterns = page.locator("[data-pattern-id]");
  const stages = patterns.locator("[data-reference-stage]");
  await expect(patterns).toHaveCount(4);
  await expect(stages).toHaveCount(4);
  await expect(patterns.locator("iframe[data-stage-frame]")).toHaveCount(4);
  await expect(page.locator(".pattern-blueprint, [data-pattern-blueprint]")).toHaveCount(0);
  await expect(page.locator("details.pattern-details")).toHaveCount(4);

  for (let index = 0; index < 4; index += 1) {
    await stages.nth(index).scrollIntoViewIfNeeded();
    await expect(stages.nth(index)).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
    await expect(stages.nth(index).locator("[data-stage-loading]")).toBeHidden();
  }

  const maturityDisclosure = page.locator("details.catalog-disclosure--compact");
  await expect(maturityDisclosure).not.toHaveAttribute("open", "");
  await expect(maturityDisclosure.locator("summary")).toContainText(
    "Pattern documents have no independent machine maturity. The status shown here belongs only to the joined Page record.",
  );

  const intelligence = page.locator('[data-pattern-id="intelligence-workspace"]');
  await expect(intelligence.getByRole("heading", { name: "Intelligence Workspace", exact: true })).toBeVisible();
  await expect(intelligence).toContainText("Investigation and Evidence Review");
  await expect(intelligence.getByRole("link", { name: /Inspect in Scenario Lab/ })).toHaveAttribute(
    "href",
    "../scenarios/lab.html?scenario=INT-02&mode=present",
  );
  await expect(intelligence.locator('details.pattern-details a.button')).toHaveAttribute(
    "href",
    "../examples/workspace-reference/index.html?view=investigation&lang=en&state=normal",
  );
  await expect(intelligence.locator("iframe[data-stage-frame]")).toHaveAttribute(
    "src",
    "../examples/workspace-reference/index.html?view=investigation&lang=en&state=normal",
  );
  await expect(page.locator("details.pattern-details a.button").filter({ hasText: "Open Chinese reference" })).toHaveCount(3);
  await expect(page.locator(".reference-language-note")).toHaveCount(3);
  await expect(page.locator('.language-menu a[hreflang="zh-CN"]')).toHaveAttribute("href", "../zh/patterns/");
});

test("Pattern stages reveal only after their catalog assertion is present", async ({ page }) => {
  await page.route("**/examples/product-patterns/information.html", async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><head><title>Valid but unrelated reference</title></head><body><main>Unrelated</main></body></html>",
    });
  });
  await page.goto("/patterns/");

  const stage = page.locator('[data-pattern-id="information-site"] [data-reference-stage]');
  await expect(stage).toHaveAttribute("data-ready-selector", "main.article h1");
  await expect(stage).toHaveAttribute("data-stage-ready", "false");
  await expect(stage.locator("[data-stage-loading]")).toHaveText("Reference unavailable", { timeout: 10_000 });
  await expect(stage.locator("[data-stage-loading]")).toBeVisible();
});

test("public product stages expose a native iframe focus entry and return path", async ({ page }) => {
  const cases = [
    {
      path: "/",
      stage: "[data-scenario-stage]",
      previous: "[data-scenario-stage] [data-stage-lab-link]",
    },
    {
      path: "/components/",
      stage: "[data-component-browser] [data-reference-stage]",
      previous: '[data-component-browser] button[data-stage-theme="dark"]',
    },
    {
      path: "/patterns/",
      stage: '[data-pattern-id="information-site"] [data-reference-stage]',
      previous: '[data-pattern-id="information-site"] .pattern-discovery-section__actions a',
    },
  ];

  for (const entry of cases) {
    await page.goto(entry.path);
    const stage = page.locator(entry.stage);
    await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
    const frame = stage.locator("iframe[data-stage-frame]");
    const previous = page.locator(entry.previous);
    await previous.focus();
    await page.keyboard.press("Tab");
    await expect(frame).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(previous).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(frame).toBeFocused();
  }
});

test("Chinese Component and Pattern discovery preserve machine-fact parity", async ({ page }) => {
  await page.goto("/zh/components/");
  await expect(page).toHaveTitle("按任务与证据查找组件。 · KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("精选组件");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  const browser = page.locator("[data-component-browser]");
  const catalog = page.locator("details.catalog-disclosure");
  const catalogRows = catalog.locator(".discovery-row[data-component-id]");
  await expect(browser.locator("[data-component-choice]")).toHaveCount(8);
  await expect(browser.locator("[data-reference-stage]")).toHaveAttribute("data-stage-ready", "true", {
    timeout: 10_000,
  });
  await expect(catalog).not.toHaveAttribute("open", "");
  await expect(catalogRows).toHaveCount(77);
  await expect(catalogRows.locator(".status-badge--stable")).toHaveCount(65);
  await expect(catalogRows.locator("a.discovery-row__name")).toHaveCount(8);
  await expect(catalog).toContainText("通用交互或内容基础组件。");
  await expect(catalog.locator('[data-component-id="evidence-list"] a')).toHaveAttribute("href", "evidence-list/");
  await expect(catalog.locator('[data-component-id="evidence-list"] a')).toHaveAttribute("lang", "en");
  await expect(page.locator('.language-menu a[hreflang="en"]')).toHaveAttribute("href", "../../components/");

  await page.goto("/zh/components/evidence-list/");
  await expect(page.locator(".component-studio__navigation nav a")).toHaveCount(8);
  await expect(page.locator("[data-reference-stage]")).toHaveAttribute("data-stage-ready", "true", {
    timeout: 10_000,
  });
  await page.getByRole("tab", { name: "合同" }).click();
  await expect(page.getByRole("heading", { name: "具名人工检查" })).toBeVisible();
  await expect(page.getByText("冲突证据", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "无障碍" }).click();
  await expect(page.getByRole("heading", { name: "目录支持范围" })).toBeVisible();
  await expect(page.locator('.component-support-grid [data-supported="true"]')).toHaveCount(5);

  await page.goto("/zh/patterns/");
  await expect(page).toHaveTitle("从真实工作选择构图。 · KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("从真实工作选择构图。");
  await expect(page.locator("[data-pattern-id]")).toHaveCount(4);
  await expect(page.locator("[data-pattern-id] iframe[data-stage-frame]")).toHaveCount(4);
  await expect(page.locator(".pattern-blueprint, [data-pattern-blueprint]")).toHaveCount(0);
  await expect(page.locator('[data-pattern-id="intelligence-workspace"]')).toContainText("情报工作台");
  await expect(page.locator('[data-pattern-id="intelligence-workspace"]')).toContainText("INT-02");
  await expect(page.locator('[data-pattern-id="intelligence-workspace"] iframe')).toHaveAttribute(
    "src",
    "../../examples/workspace-reference/index.html?view=investigation&lang=zh-CN&state=normal",
  );
  await expect(page.locator('.language-menu a[hreflang="en"]')).toHaveAttribute("href", "../../patterns/");
});

test("scenario atlas exposes honest coverage and seventeen inspectable scenarios", async ({ page }) => {
  const consoleWarnings = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) consoleWarnings.push(message.text());
  });

  await page.goto("/scenarios/");
  await expect(page).toHaveTitle("Scenario Atlas - KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Inspect KIN across product tasks.");
  await expect(page.locator("[data-scenario-id]")).toHaveCount(30);
  await expect(page.locator('[data-scenario-id][data-presentation-status="showcased"]')).toHaveCount(17);
  await expect(page.locator('[data-scenario-id][data-presentation-status="linked"]')).toHaveCount(0);
  await expect(page.locator('[data-scenario-id][data-presentation-status="planned"]')).toHaveCount(13);
  await expect(page.getByRole("heading", { name: "Entity Database Review" })).toBeVisible();
  await expect(page.locator('[data-scenario-id="INT-01"]').getByRole("link", { name: "Inspect scenario" })).toHaveAttribute("href", "lab.html?scenario=INT-01");
  await expect(page.locator('[data-scenario-id="INT-02"]').getByRole("link", { name: "Inspect scenario" })).toHaveAttribute("href", "lab.html?scenario=INT-02");
  await expect(page.locator('[data-scenario-id="INT-03"]').getByRole("link", { name: "Inspect scenario" })).toHaveAttribute("href", "lab.html?scenario=INT-03");
  await expect(page.locator('[data-scenario-id="CORE-03"]').getByRole("link", { name: "Inspect scenario" })).toHaveAttribute("href", "lab.html?scenario=CORE-03");
  await expect(page.locator('[data-scenario-id="INF-02"]').getByRole("link", { name: "Inspect scenario" })).toHaveAttribute("href", "lab.html?scenario=INF-02");
  await expect(page.locator('[data-scenario-id="COM-02"]').getByRole("link", { name: "Inspect scenario" })).toHaveAttribute("href", "lab.html?scenario=COM-02");
  await expect(page.locator('[data-scenario-id="ENG-02"]').getByRole("link", { name: "Inspect scenario" })).toHaveAttribute("href", "lab.html?scenario=ENG-02");
  await expect(page.locator('[data-scenario-id="WORK-01"] .source-status.candidate')).toHaveText("Candidate source");
  await expect(page.getByText("Discovery is not adoption evidence.")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectNoHorizontalOverflow(page);
  await expect(page.locator('[data-scenario-id="COM-02"]').getByRole("link", { name: "Inspect scenario" })).toBeVisible();
  expect(consoleWarnings).toEqual([]);
});

test("friendly Lab route preserves query state when handing off to the canonical Lab", async ({ page }) => {
  await page.goto("/lab/?scenario=INT-02&state=permission&viewport=narrow&theme=light-high-contrast");
  await page.waitForURL(
    "**/scenarios/lab.html?scenario=INT-02&state=permission&viewport=narrow&theme=light-high-contrast&mode=present",
  );
  await expect(page).toHaveTitle("Investigation and Evidence Review - Scenario Inspection Lab");
  await expect(page.getByRole("heading", { level: 2, name: "Investigation and Evidence Review" })).toBeVisible();
  await expect(page.locator('[data-lab-mode="present"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-lab-scenario]")).toHaveValue("INT-02");
  await expect(page.locator("[data-lab-state]")).toHaveValue("permission");
  await expect(page.locator('[data-lab-viewport="narrow"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-lab-theme="light-high-contrast"]')).toHaveAttribute("aria-pressed", "true");
});

test("theme and contrast persist through route-aware language links", async ({ page }) => {
  await page.goto("/patterns/");
  await page.getByRole("switch").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await expect(page.evaluate(() => localStorage.getItem("kin-site-theme"))).resolves.toBe("light");
  await page.getByRole("button", { name: "Increase contrast" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(page.evaluate(() => localStorage.getItem("kin-site-contrast"))).resolves.toBe("more");

  await page.getByRole("button", { name: "Choose language" }).click();
  const chineseRoute = page.getByRole("menuitem", { name: "中文" });
  await expect(chineseRoute).toHaveAttribute("href", "../zh/patterns/");
  await chineseRoute.click();
  await page.waitForURL("**/zh/patterns/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("从真实工作选择构图。");

  await page.getByRole("button", { name: "选择语言" }).click();
  await expect(page.getByRole("menuitem", { name: "English" })).toHaveAttribute("href", "../../patterns/");
});

test("route-aware language switching preserves valid shared fragments", async ({ page }) => {
  await page.goto("/docs/#components");
  await page.getByRole("button", { name: "Choose language" }).click();
  await page.getByRole("menuitem", { name: "中文" }).click();
  await page.waitForURL("**/zh/docs/#components");
  await expect(page.locator("#components")).toBeVisible();

  await page.getByRole("button", { name: "选择语言" }).click();
  await page.getByRole("menuitem", { name: "English" }).click();
  await page.waitForURL("**/docs/#components");
  await expect(page.locator("#components")).toBeVisible();

  await page.goto("/patterns/#pattern-intelligence-workspace");
  await page.getByRole("button", { name: "Choose language" }).click();
  await page.getByRole("menuitem", { name: "中文" }).click();
  await page.waitForURL("**/zh/patterns/#pattern-intelligence-workspace");
  await expect(page.locator("#pattern-intelligence-workspace")).toBeVisible();

  for (const id of SHOWCASE_ROOT_IDS) {
    await page.goto(`/#${id}`);
    await page.getByRole("button", { name: "Choose language" }).click();
    await expect(page.getByRole("menuitem", { name: "中文" })).toHaveAttribute("href", `zh/#${id}`);

    await page.goto(`/zh/#${id}`);
    await page.getByRole("button", { name: "选择语言" }).click();
    await expect(page.getByRole("menuitem", { name: "English" })).toHaveAttribute("href", `../#${id}`);
  }
});

test("language menu supports arrow, Home, End, Escape, and focus return on a nested route", async ({ page }) => {
  await page.goto("/components/evidence-list/");
  const trigger = page.getByRole("button", { name: "Choose language" });
  const english = page.getByRole("menuitem", { name: "English" });
  const chinese = page.getByRole("menuitem", { name: "中文" });

  await trigger.focus();
  await page.keyboard.press("End");
  await expect(chinese).toBeFocused();
  await page.keyboard.press("Home");
  await expect(english).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(chinese).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(english).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.locator("[data-language-menu]")).toBeHidden();

  await page.keyboard.press("ArrowDown");
  await expect(english).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(chinese).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("[data-theme-switch]")).toBeFocused();
  await expect(page.locator("[data-language-menu]")).toBeHidden();
});

test("mobile documentation navigation is a contained Drawer with exact focus return", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/");

  const trigger = page.locator("[data-nav-toggle]");
  await expect(trigger).toHaveAccessibleName("Open navigation");
  const navigation = page.locator(".docs-nav");
  const main = page.locator(".docs-main");

  await expect(navigation).toHaveAttribute("aria-hidden", "true");
  await trigger.click();
  await expect(trigger).toHaveAccessibleName("Close navigation");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(navigation).toHaveAttribute("role", "dialog");
  await expect(navigation).toHaveAttribute("aria-modal", "true");
  await expect(main).toHaveJSProperty("inert", true);
  await expect(navigation.getByRole("link").first()).toBeFocused();

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    const contained = await page.evaluate(() => {
      const active = document.activeElement;
      return active === document.querySelector("[data-nav-toggle]")
        || document.querySelector(".docs-nav")?.contains(active);
    });
    expect(contained).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).toHaveAttribute("aria-hidden", "true");
  await expect(main).toHaveJSProperty("inert", false);
  await expect(page.locator("body")).not.toHaveClass(/nav-open/);
});

test("documentation command menu preserves authentication demos", async ({ page }) => {
  await page.goto("/docs/");
  await page.keyboard.press("Control+K");
  const command = page.getByRole("dialog", { name: "Search KIN" });
  await expect(command).toBeVisible();
  await command.getByRole("searchbox").fill("sign-in");
  await expect(command.getByRole("link", { name: /Sign-in page/ })).toHaveAttribute(
    "href",
    "../examples/page-patterns/access.html?lang=en",
  );
  await command.getByRole("searchbox").fill("authentication dialog");
  await expect(command.getByRole("link", { name: /Authentication dialog/ })).toHaveAttribute(
    "href",
    "../examples/workspace-reference/core-components.html?lang=en&dialog=authentication#authentication",
  );
});

test("authentication destinations preserve the language of their entry point", async ({ page }) => {
  await page.goto("/docs/");
  await page.getByRole("link", { name: /Sign-in page/, exact: true }).first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Sign in to the workspace" })).toBeVisible();
  await page.getByRole("button", { name: "Change language" }).click();
  await page.getByRole("menuitemradio", { name: "中文" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page).toHaveURL(/lang=zh-CN/);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { name: "登录工作区" })).toBeVisible();

  await page.goto("/docs/");
  await page.getByRole("link", { name: /Authentication dialog/, exact: true }).first().click();
  const englishAuthDialog = page.getByRole("dialog", { name: "Sign in to save the filter view" });
  await expect(englishAuthDialog).toBeVisible();
  await expect(englishAuthDialog).toHaveAttribute("lang", "en");
  await expect(englishAuthDialog.getByLabel("Work email")).toBeFocused();
  await englishAuthDialog.getByRole("button", { name: "Cancel" }).click();

  await page.goto("/zh/docs/");
  await page.getByRole("link", { name: /登录弹窗/, exact: true }).first().click();
  const chineseAuthDialog = page.getByRole("dialog", { name: "登录后保存筛选视图" });
  await expect(chineseAuthDialog).toBeVisible();
  await expect(chineseAuthDialog.getByLabel("工作邮箱")).toBeFocused();
});

test("GitHub Pages 404 preserves theme and locale preferences", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    localStorage.setItem("kin-site-theme", "system");
    localStorage.setItem("kin-site-locale", "en");
  });

  const response = await page.goto("/kin-design-system/missing-reference?lang=zh");
  expect(response?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("当前设计合同中没有这个页面。");
  await expect(page.getByRole("link", { name: "KIN 设计系统首页" })).toHaveAttribute("href", "/kin-design-system/zh/");

  const themeSwitch = page.locator("[data-theme-switch]");
  await expect(themeSwitch).toHaveAttribute("role", "switch");
  await expect(themeSwitch).toHaveAttribute("aria-checked", "false");
  await themeSwitch.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.evaluate(() => localStorage.getItem("kin-site-theme"))).resolves.toBe("dark");

  const languageTrigger = page.locator("[data-language-trigger]");
  await expect(languageTrigger).toHaveAttribute("aria-haspopup", "menu");
  await languageTrigger.click();
  await expect(page.locator('[data-404-language="zh"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(languageTrigger).toBeFocused();
  await expect(page.locator("[data-language-menu]")).toBeHidden();
});

test("Sonner loads on demand for user-initiated feedback", async ({ page }) => {
  await page.goto("/docs/");
  await expect(
    page.evaluate(() => performance.getEntriesByType("resource").some((entry) => entry.name.includes("sonner-island"))),
  ).resolves.toBe(false);
  await page.getByRole("button", { name: "Show notification" }).click();
  await expect(page.getByText("Reference exported", { exact: true })).toBeVisible();
  await expect(
    page.evaluate(() => performance.getEntriesByType("resource").some((entry) => entry.name.includes("sonner-island"))),
  ).resolves.toBe(true);
  await page.getByRole("button", { name: "View", exact: true }).click();
  await expect(page.getByText("Export opened", { exact: true })).toBeVisible();
});

test("Showcase command menu opens immediately, filters, and restores pointer focus", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Search KIN", exact: true });
  const dialog = page.getByRole("dialog", { name: "Search KIN" });
  const search = dialog.getByRole("searchbox", { name: "Search commands" });

  await page.keyboard.press("Control+K");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("data-state", "open");
  await expect(search).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await trigger.click();
  await expect(search).toBeFocused();
  await search.fill("Evidence List");
  await expect(dialog.getByRole("link", { name: /Evidence List/ })).toHaveAttribute(
    "href",
    "components/evidence-list/",
  );
  await expect(dialog.getByRole("link", { name: /Patterns/ })).toBeHidden();
  await search.fill("system theme");
  await dialog.getByRole("button", { name: /Use system theme/ }).click();
  await expect(page.evaluate(() => localStorage.getItem("kin-site-theme"))).resolves.toBe("system");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("documentation pattern tabs support arrow keys", async ({ page }) => {
  await page.goto("/docs/#patterns");
  const intelligence = page.getByRole("tab", { name: "Intelligence" });
  await intelligence.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Information" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Information" })).toBeVisible();
});

test("Showcase routes avoid mobile overflow and expose 44px primary touch targets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const responsiveRoutes = [
    "/",
    "/zh/",
    "/docs/",
    "/components/",
    "/components/evidence-list/",
    "/patterns/",
    "/zh/components/",
    "/zh/patterns/",
  ];

  for (const route of responsiveRoutes) {
    await page.goto(route);
    await expectNoHorizontalOverflow(page);
    const stages = page.locator("[data-scenario-stage], [data-reference-stage]");
    const stageCount = await stages.count();
    for (let index = 0; index < stageCount; index += 1) {
      await stages.nth(index).scrollIntoViewIfNeeded();
      await expect(stages.nth(index)).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
    }
    await expectEmbeddedDocumentsNoHorizontalOverflow(page);
  }

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Explore the scenarios" })).toBeVisible();
  await expect(page.locator("[data-preview-activate], [data-preview-deactivate]")).toHaveCount(0);

  const touchTargets = await page
    .locator(
      "[data-command-trigger], [data-language-trigger], [data-theme-switch], [data-contrast-toggle], .showcase-button.primary",
    )
    .evaluateAll((items) =>
      items
        .filter((item) => !item.hidden)
        .map((item) => {
          const box = item.getBoundingClientRect();
          return { width: box.width, height: box.height };
        }),
    );
  expect(touchTargets).toHaveLength(5);
  expect(touchTargets.every((target) => target.width >= 44 && target.height >= 44)).toBe(true);
  const stageTouchTargets = await page
    .locator("[data-scenario-stage] [role=tab], [data-stage-lab-link]")
    .evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        return { width: box.width, height: box.height };
      }),
    );
  expect(stageTouchTargets).toHaveLength(4);
  expect(stageTouchTargets.every((target) => target.width >= 44 && target.height >= 44)).toBe(true);

  for (const route of ["/docs/", "/components/evidence-list/"]) {
    await page.goto(route);
    const contrast = page.locator("[data-contrast-toggle]");
    await expect(contrast).toBeVisible();
    const box = await contrast.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  await page.goto("/scenarios/lab.html?scenario=INT-02&state=normal&viewport=narrow&theme=dark&mode=present");
  await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass");
  await expectNoHorizontalOverflow(page);
  await expectEmbeddedDocumentsNoHorizontalOverflow(page, "iframe[data-lab-frame]");
});
