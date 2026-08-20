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

const FEATURED_COMPONENT_IDS = [
  "command-menu",
  "evidence-list",
  "suggested-change-review",
  "execution-preview",
  "background-task-queue",
  "data-table",
  "authentication-dialog",
  "app-shell",
  "agent-activity-trace",
  "story-timeline",
  "code-block",
  "button",
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
      heading: "Interfaces for consequential work.",
      workflow: "Entity Database Review",
      job: "Select an entity, inspect evidence and properties, and make a reversible decision.",
      tabs: ["Information", "Intelligence", "Ecommerce", "Engineering"],
      reference: "examples/workspace-reference/index.html?lang=en",
      source: "Stable",
    },
    {
      path: "/zh/",
      lang: "zh-CN",
      title: "KIN 设计系统 — 规则、组件与交互预览",
      heading: "为重要工作而设计。",
      workflow: "档案复核",
      job: "选择一条记录，核对证据与属性，并作出可撤销的决定。",
      tabs: ["信息", "情报", "电商", "工程"],
      reference: "../examples/workspace-reference/index.html?lang=zh-CN",
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
    await expect(workflow.getByRole("tab")).toHaveCount(4);
    await expect(workflow.getByRole("tab").allTextContents()).resolves.toEqual(locale.tabs);
    await expect(workflow.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(workflow.getByRole("tab").nth(1)).toHaveAttribute("aria-controls", "showcase-stage-panel");
    await expect(workflow.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "scenario-tab-investigation");
    await expect(frame).toHaveAttribute("src", locale.reference);
    await expect(workflow).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
    await expect(workflow.locator("[data-stage-loading]")).toBeHidden();
    await expect(workflow.locator("[data-stage-frame]").contentFrame().locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(workflow.locator("[data-preview-activate], [data-preview-deactivate]")).toHaveCount(0);
    await expect(page.locator(".context-atlas > a")).toHaveCount(4);
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
    await expect(catalogDisclosure.locator('[data-showcase-count="showcased-scenarios"]')).toHaveText("18");
    await expect(catalogDisclosure.locator('[data-showcase-count="planned-scenarios"]')).toHaveText("13");
    await expect(catalogDisclosure.locator('[data-showcase-count="stable-components"]')).toHaveText("65");
    await expect(catalogDisclosure.locator('[data-showcase-count="stable-pages"]')).toHaveText("11");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expectNoHorizontalOverflow(page);
  }

  expect(consoleWarnings).toEqual([]);
});

test("homepage composition lets the live product stage dominate the first viewport", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900, maximumStageTop: 380, minimumVisibleStage: 500 },
    { width: 390, height: 844, maximumStageTop: 500, minimumVisibleStage: 300 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    const stage = page.locator("[data-scenario-stage]");
    await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
    const geometry = await stage.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        bottom: bounds.bottom,
        top: bounds.top,
        visibleHeight: Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0)),
      };
    });
    expect(geometry.top).toBeLessThanOrEqual(viewport.maximumStageTop);
    expect(geometry.visibleHeight).toBeGreaterThanOrEqual(viewport.minimumVisibleStage);
  }
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

  await page.route("**/examples/workspace-reference/index.html?lang=en", async (route) => {
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
    "examples/workspace-reference/index.html?lang=en",
  );
  await expect(stage.locator("[data-stage-language-text]")).toHaveText("English reference");
  await expect(stage.locator("[data-preview-activate], [data-preview-deactivate]")).toHaveCount(0);

  releaseInitialReference();
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(loader).toBeHidden();
  await expect(page.frameLocator("[data-stage-frame]").locator(".entity-content")).toBeVisible();
  const initialTabMaterial = await tabs.nth(1).evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      edge: getComputedStyle(element, "::after").display,
      shadow: style.boxShadow,
    };
  });
  expect(initialTabMaterial.background).toBe("rgba(255, 255, 255, 0.055)");
  expect(initialTabMaterial.edge).toBe("none");
  expect(initialTabMaterial.shadow).not.toContain("117, 128, 224");

  await tabs.nth(1).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(2)).toBeFocused();
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await expect(stage.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "scenario-tab-commerce");
  await expect(stage).toHaveAttribute("data-stage-ready", "false");
  await expect(loader).toBeVisible();
  await expect(frame).toHaveAttribute(
    "src",
    "examples/product-patterns/ecommerce.html?edit=normal#product-context",
  );
  await expect(stage.locator("[data-stage-title]")).toHaveText("Product Detail and Edit");
  await expect(stage.locator("[data-stage-language-text]")).toHaveText("Chinese reference");
  await expect(stage.locator("[data-stage-lab-link]")).toHaveAttribute(
    "href",
    /scenarios\/lab\.html\?scenario=COM-02.*mode=present/,
  );

  releaseCommerceReference();
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(loader).toBeHidden();
  await expect(page.frameLocator("[data-stage-frame]").locator(".commerce-main")).toBeVisible();

  await tabs.nth(3).click();
  await expect(frame).toHaveAttribute("src", "examples/product-patterns/canvas.html");
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator("[data-stage-frame]").locator(".canvas-shell")).toBeVisible();
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
  await expect(homeStage.locator("[data-stage-sweep]")).toHaveCount(0);
  await expect
    .poll(() =>
      homeFrame.evaluate((element) => {
        const style = getComputedStyle(element);
        return `${style.transitionProperty} ${style.transitionDuration}`;
      }),
    )
    .toBe("opacity 0.08s");

  const tabs = homeStage.getByRole("tab");
  await tabs.nth(2).click();
  await tabs.nth(3).click();
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(homeStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator("[data-scenario-stage] iframe").locator(".entity-content")).toBeVisible();

  await page.goto("/components/evidence-list/");
  const componentStage = page.locator("[data-reference-stage]");
  const componentFrame = componentStage.locator("iframe[data-stage-frame]");
  await expect
    .poll(() =>
      componentFrame.evaluate((element) => {
        const style = getComputedStyle(element);
        return `${style.transitionProperty} ${style.transitionDuration}`;
      }),
    )
    .toBe("opacity 0.08s");

  await componentStage.getByRole("button", { name: "Light" }).click();
  await componentStage.getByRole("button", { name: "Dark" }).click();
  await expect(componentStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator("[data-reference-stage] iframe").locator("#specimen-root")).toBeVisible();
});

test("global navigation preserves the same spatial model across public routes", async ({ page }) => {
  const routes = [
    ["/", "Showcase"],
    ["/components/", "Components"],
    ["/components/evidence-list/", "Components"],
    ["/patterns/", "Patterns"],
    ["/scenarios/", "Scenarios"],
    ["/scenarios/lab.html?scenario=INT-02&mode=present", "Lab"],
    ["/docs/", "Documentation"],
  ];
  const expectedLabels = ["Showcase", "Components", "Patterns", "Scenarios", "Lab", "Documentation", "GitHub"];

  for (const [route, currentLabel] of routes) {
    await page.goto(route);
    const navigation = page.locator("[data-mobile-nav]");
    const header = page.locator(".showcase-header, .global-header");
    await expect(header).toBeVisible();
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole("link")).toHaveText(expectedLabels);
    await expect(navigation.locator('a[aria-current="page"]')).toHaveCount(1);
    await expect(navigation.locator('a[aria-current="page"]')).toHaveText(currentLabel);
    const currentNavigationStyle = await navigation.locator('a[aria-current="page"]').evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.background = "var(--navigation-selected)";
      document.body.append(probe);
      const navigationSelected = getComputedStyle(probe).backgroundColor;
      probe.remove();
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        boxShadow: style.boxShadow,
        navigationSelected,
        edge: getComputedStyle(element, "::after").display,
      };
    });
    expect(currentNavigationStyle.background).toBe(currentNavigationStyle.navigationSelected);
    expect(currentNavigationStyle.boxShadow).not.toContain("94, 106, 210");
    expect(currentNavigationStyle.edge).toBe("none");

    const geometry = await header.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: rect.top, height: rect.height };
    });
    expect(Math.abs(geometry.top)).toBeLessThan(1);
    expect(Math.abs(geometry.height - 56)).toBeLessThan(1);

    await page.evaluate(() => scrollTo(0, Math.min(640, document.documentElement.scrollHeight - innerHeight)));
    await expect(header).toBeVisible();
    const scrolledTop = await header.evaluate((element) => element.getBoundingClientRect().top);
    expect(Math.abs(scrolledTop)).toBeLessThan(1);
  }
});

test("every public route keeps one localized global navigation contract", async ({ page }) => {
  test.setTimeout(60_000);
  const explorerIds = [
    "app-shell",
    "evidence-list",
    "suggested-change-review",
    "execution-preview",
    "agent-activity-trace",
    "background-task-queue",
    "story-timeline",
    "data-table",
    "command-menu",
    "authentication-dialog",
    "code-block",
    "button",
  ];
  const surfaces = [
    ["/", "showcase", "en"],
    ["/components/", "components", "en"],
    ...explorerIds.map((id) => [`/components/${id}/`, "components", "en"]),
    ["/patterns/", "patterns", "en"],
    ["/scenarios/", "scenarios", "en"],
    ["/scenarios/lab.html?scenario=INT-02&state=normal&viewport=wide&theme=dark&mode=present", "lab", "en"],
    ["/docs/", "docs", "en"],
    ["/zh/", "showcase", "zh-CN"],
    ["/zh/components/", "components", "zh-CN"],
    ...explorerIds.map((id) => [`/zh/components/${id}/`, "components", "zh-CN"]),
    ["/zh/patterns/", "patterns", "zh-CN"],
    ["/scenarios/?lang=zh-CN", "scenarios", "zh-CN"],
    ["/scenarios/lab.html?scenario=INT-02&state=normal&viewport=wide&theme=dark&mode=present&lang=zh-CN", "lab", "zh-CN"],
    ["/zh/docs/", "docs", "zh-CN"],
  ];
  const expected = {
    en: {
      labels: {
        showcase: "Showcase",
        components: "Components",
        patterns: "Patterns",
        scenarios: "Scenarios",
        lab: "Lab",
        docs: "Documentation",
      },
      hrefs: {
        showcase: "/",
        components: "/components/",
        patterns: "/patterns/",
        scenarios: "/scenarios/",
        lab: "/scenarios/lab.html",
        docs: "/docs/",
      },
    },
    "zh-CN": {
      labels: {
        showcase: "总览",
        components: "组件",
        patterns: "布局",
        scenarios: "场景",
        lab: "场景预览",
        docs: "文档",
      },
      hrefs: {
        showcase: "/zh/",
        components: "/zh/components/",
        patterns: "/zh/patterns/",
        scenarios: "/scenarios/?lang=zh-CN",
        lab: "/scenarios/lab.html?lang=zh-CN",
        docs: "/zh/docs/",
      },
    },
  };
  const forbiddenChineseCopy = [
    "实时参考",
    "固定样例",
    "来源边界",
    "治理合同",
    "确定性参考",
    "具名人工检查",
    "目录支持范围",
    "组件舞台",
    "真实产品参考",
    "当前检查参考",
    "稳定 规范",
    "场景检查台",
    "建议变更复核",
    "智能体活动记录",
    "故事时间线",
    "度量表",
    "身份验证框架",
    "上下文线程",
    "产品布局",
    "规范已稳定",
    "规范待完善",
    "规范草稿",
    "保持语义分离",
    "诚实的无结果",
    "安全恢复",
    "付款恢复",
    "任务健康",
    "来源健康",
    "部分核验",
    "演示重新验证",
    "检查恢复",
    "记录身份",
    "精确画布",
    "运行时集成实验室",
    "组件成熟度",
  ];

  for (const [route, activeKey, locale] of surfaces) {
    await page.goto(route);
    const navigation = page.locator("[data-mobile-nav]");
    await expect(navigation).toBeVisible();
    const keyedLinks = navigation.locator("[data-global-nav-key]");
    await expect(keyedLinks).toHaveCount(6);
    await expect(navigation.locator('[data-global-nav-key][aria-current="page"]')).toHaveCount(1);
    await expect(navigation.locator('[data-global-nav-key][aria-current="page"]')).toHaveAttribute(
      "data-global-nav-key",
      activeKey,
    );

    for (const [key, label] of Object.entries(expected[locale].labels)) {
      const link = navigation.locator(`[data-global-nav-key="${key}"]`);
      await expect(link).toHaveText(label);
      const resolved = await link.evaluate((element) => {
        const url = new URL(element.href);
        return `${url.pathname}${url.search}`;
      });
      if (activeKey === "lab" && key === "lab") {
        expect(resolved).toContain("/scenarios/lab.html?");
        expect(resolved).toContain("scenario=INT-02");
        if (locale === "zh-CN") expect(resolved).toContain("lang=zh-CN");
        else expect(resolved).not.toContain("lang=");
      } else {
        expect(resolved).toBe(expected[locale].hrefs[key]);
      }
    }

    if (locale === "zh-CN") {
      const visibleCopy = await page.locator("body").innerText();
      for (const phrase of forbiddenChineseCopy) expect(visibleCopy).not.toContain(phrase);
    }
  }
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
  const documentationTabMaterial = await page.locator('.pattern-tabs [aria-selected="true"]').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      shadow: style.boxShadow,
    };
  });
  expect(documentationTabMaterial.background).toBe("rgba(255, 255, 255, 0.055)");
  expect(documentationTabMaterial.shadow).not.toContain("94, 106, 210");
  await expectNoHorizontalOverflow(page);

  await page.goto("/zh/docs/");
  await expect(page).toHaveTitle("文档 · KIN 设计系统");
  await expect(page.locator('.docs-nav a[href="../../scenarios/?lang=zh-CN"]')).toContainText("场景目录");
  await expect(page.getByRole("link", { name: "浏览 31 个任务场景" })).toHaveAttribute(
    "href",
    "../../scenarios/?lang=zh-CN",
  );
  await expect(page.locator('.command-list a[href="../../scenarios/?lang=zh-CN"]')).toContainText("31 个场景");
  expect(consoleWarnings).toEqual([]);
});

test("compact documentation and Lab metadata retain AA text contrast", async ({ page }) => {
  for (const theme of ["dark", "light"]) {
    await page.goto("/docs/");
    if (theme === "light") await page.locator("[data-theme-switch]").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator(".global-header [data-mobile-nav]")).toBeVisible();
    await expect(page.locator(".global-header [data-mobile-nav] a").first()).toHaveCSS(
      "color",
      theme === "dark" ? "rgb(139, 143, 152)" : "rgb(98, 103, 112)",
    );
    await expectReadableContrast(page.locator(".global-header [data-mobile-nav] a"));
    await expectReadableContrast(page.locator(".showcase-command-trigger"));

    for (const selector of [
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
      ".lab-controls-heading .eyebrow",
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

test("component discovery presents an interactive twelve-component workbench and a closed full catalog", async ({ page }) => {
  await page.goto("/components/");
  await expect(page).toHaveTitle("Find a component by task and evidence. · KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Components you can feel before you read.");
  await expect(page.locator("main")).toHaveAttribute("data-showcase-route", "components");
  const browser = page.locator("[data-component-gallery]");
  const cards = browser.locator("[data-component-card]");
  const catalog = page.locator("details.catalog-disclosure");
  const catalogRows = catalog.locator(".discovery-row[data-component-id]");

  await expect(cards).toHaveCount(12);
  await expect(cards.evaluateAll((items) => items.map((item) => item.dataset.componentId))).resolves.toEqual([
    "command-menu",
    "evidence-list",
    "suggested-change-review",
    "execution-preview",
    "background-task-queue",
    "data-table",
    "authentication-dialog",
    "app-shell",
    "agent-activity-trace",
    "story-timeline",
    "code-block",
    "button",
  ]);
  await expect(browser.locator("[data-component-choice]")).toHaveCount(12);
  await expect(browser.locator('[role="tablist"] [role="tab"][aria-controls="component-workbench-stage"]')).toHaveCount(12);
  await expect(browser.locator('[role="tabpanel"]#component-workbench-stage')).toHaveCount(1);
  await expect(browser.locator('[role="tabpanel"]#component-workbench-stage')).toHaveAttribute(
    "aria-labelledby",
    "component-choice-command-menu",
  );
  await expect(
    browser.locator('[role="tab"][aria-controls="component-workbench-stage"]').evaluateAll((tabs) =>
      tabs.every((tab) => document.getElementById(tab.getAttribute("aria-controls"))?.getAttribute("role") === "tabpanel"),
    ),
  ).resolves.toBe(true);
  await expect(browser.locator('[data-component-choice][aria-selected="true"]')).toHaveCount(1);
  await expect(browser.locator('[data-component-choice][aria-selected="true"]')).toHaveAttribute(
    "data-component-choice",
    "command-menu",
  );
  await expect(browser.locator("[data-reference-stage]")).toHaveCount(1);
  await expect(browser.locator("iframe[data-stage-frame]")).toHaveCount(1);
  await expect(browser.locator("[data-reference-stage]")).toHaveAttribute("data-stage-ready", "true", {
    timeout: 10_000,
  });
  await expect(browser.locator("iframe[data-stage-frame]")).toHaveAttribute(
    "src",
    "../examples/workspace-reference/showcase-components.html?lang=en&specimen=command-menu",
  );
  await expect(cards.nth(1).getByRole("link", { name: "Open: Evidence List" })).toHaveAttribute(
    "href",
    "evidence-list/",
  );
  await expect(catalog).not.toHaveAttribute("open", "");
  await expect(catalogRows).toHaveCount(80);
  await expect(catalogRows.locator(".status-badge--stable")).toHaveCount(65);
  await expect(catalogRows.locator("a.discovery-row__name")).toHaveCount(12);
  await expect(catalog.locator("#source-boundary-title")).toHaveText("Source boundary");
  await expect(catalogRows.first()).toBeHidden();

  await catalog.locator("summary").click();
  await expect(catalog).toHaveAttribute("open", "");
  await expect(catalogRows.first()).toBeVisible();
  await expect(catalog.locator('[data-component-id="evidence-list"] a.discovery-row__name')).toHaveAttribute(
    "href",
    "evidence-list/",
  );
  await expect(page.locator('.language-menu a[hreflang="zh-CN"]')).toHaveAttribute("href", "../zh/components/");
});

test("component workbench selects all twelve components and preserves one live stage", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/components/");
  const browser = page.locator("[data-component-gallery]");
  const choices = browser.locator("[data-component-choice]");
  const stage = browser.locator("[data-reference-stage]");
  const frame = stage.locator("iframe[data-stage-frame]");
  await expect(choices).toHaveCount(12);
  await expect(frame).toHaveCount(1);
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });

  for (const id of FEATURED_COMPONENT_IDS) {
    const choice = browser.locator('[data-component-choice="' + id + '"]');
    await choice.click();
    await expect(choice).toHaveAttribute("aria-selected", "true");
    await expect(browser.locator('[data-component-choice][aria-selected="true"]')).toHaveCount(1);
    await expect(stage).toHaveAttribute("aria-labelledby", "component-choice-" + id);
    await expect(stage).toHaveAttribute("data-component-id", id);
    await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
    await expect(stage).toHaveAttribute("data-ready-fragment", await choice.getAttribute("data-component-ready-fragment"));
    await expect(frame).toHaveAttribute(
      "src",
      "../examples/workspace-reference/showcase-components.html?lang=en&specimen=" + id,
    );
    await expect(stage.locator("[data-stage-language-text]")).toHaveText("English");
    await expect(stage.locator("[data-stage-reference-link]")).toHaveAttribute(
      "href",
      "../examples/workspace-reference/showcase-components.html?lang=en&specimen=" + id + "#showcase-specimen-app",
    );
    await expect(stage.locator("[data-stage-explorer-link]")).toHaveAttribute("href", id + "/");
    await expect(browser.locator("iframe[data-stage-frame]")).toHaveCount(1);

    const reference = page.frameLocator("iframe[data-stage-frame]");
    if (id === "command-menu") {
      const dialog = reference.getByRole("dialog", { name: "KIN command menu" });
      await expect(dialog).toBeVisible();
      await dialog.press("Escape");
      await expect(dialog).toBeHidden();
      await reference.getByRole("button", { name: "Open command menu" }).click();
      await expect(dialog).toBeVisible();
    } else if (id === "evidence-list") {
      const row = reference.locator("button, [role=\"option\"], [role=\"row\"]").filter({ hasText: "Internal price record" }).first();
      await row.click();
      await expect(row).toHaveAttribute("aria-selected", "true");
      await expect(reference.locator(".evidence-detail h3")).toHaveText("Internal price record");
    } else if (id === "suggested-change-review") {
      await reference.getByRole("button", { name: "Accept suggestion" }).click();
      await expect(reference.getByText("Accepted", { exact: true })).toBeVisible();
    } else if (id === "execution-preview") {
      await reference.getByRole("button", { name: "Run local preview" }).click();
      await expect(reference.getByRole("button", { name: "Executing local fixture…" })).toBeDisabled();
    } else if (id === "background-task-queue") {
      await reference.getByRole("button", { name: "Retry" }).click();
      await expect(reference.getByText("Retrying", { exact: true })).toBeVisible();
    } else if (id === "data-table") {
      const transit = reference.locator('[role="row"]').filter({ hasText: "Transit Bag" }).first();
      await transit.getByRole("button").click();
      await expect(transit).toHaveAttribute("aria-selected", "true");
      const price = reference.getByRole("button", { name: /Price/ });
      await price.click();
      await expect(reference.locator("tbody tr").first()).toContainText("Field Jacket");
    } else if (id === "authentication-dialog") {
      const dialog = reference.locator("[data-auth-dialog]");
      await expect(dialog).toBeVisible();
      await reference.getByRole("button", { name: "Cancel" }).click({ force: true });
      await expect(dialog).toBeHidden();
      await reference.getByRole("button", { name: "Open sign-in dialog" }).click({ force: true });
      await expect(dialog).toBeVisible();
    } else if (id === "app-shell") {
      const transit = reference.locator("button, [role=\"option\"], [role=\"row\"]").filter({ hasText: "Transit Bag" }).first();
      await transit.click();
      await expect(transit).toHaveAttribute("aria-selected", "true");
      await expect(reference.locator(".mini-inspector")).toContainText("PRD-076");
    } else if (id === "agent-activity-trace") {
      const toolActivity = reference.locator(".tool-activity");
      await toolActivity.locator("summary").click();
      await expect(toolActivity.locator("pre")).toBeVisible();
    } else if (id === "story-timeline") {
      const marker = reference.locator(".story-marker").nth(1);
      await marker.click();
      await expect(marker).toHaveAttribute("aria-selected", "true");
      await expect(reference.locator(".timeline-detail")).toContainText("09:34");
    } else if (id === "code-block") {
      const wrap = reference.getByRole("button", { name: "Wrap lines" });
      await wrap.click();
      await expect(wrap).toHaveAttribute("aria-pressed", "true");
    } else if (id === "button") {
      await reference.getByRole("button", { name: "Export records" }).click();
      await expect(reference.getByText("Export task created", { exact: true })).toBeVisible();
    }

    await stage.locator("[data-stage-reset]").click();
    await expect(stage.locator("[data-stage-reset]")).toBeFocused();
    await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
    await expect(stage.locator("[data-stage-reset]")).toBeFocused();
    await expect(browser.locator("iframe[data-stage-frame]")).toHaveCount(1);
    const resetReference = page.frameLocator("iframe[data-stage-frame]");
    if (id === "command-menu") {
      await expect(resetReference.getByRole("dialog", { name: "KIN command menu" })).toBeVisible();
    } else if (id === "evidence-list") {
      await expect(resetReference.locator(".evidence-detail h3")).toHaveText("External channel snapshot");
    } else if (id === "suggested-change-review") {
      await expect(resetReference.getByRole("button", { name: "Accept suggestion" })).toBeVisible();
    } else if (id === "execution-preview") {
      await expect(resetReference.getByRole("button", { name: "Run local preview" })).toBeVisible();
    } else if (id === "background-task-queue") {
      await expect(resetReference.getByRole("button", { name: "Retry" })).toBeVisible();
    } else if (id === "data-table") {
      await expect(resetReference.locator('[role="row"]').filter({ hasText: "Field Jacket" }).first()).toHaveAttribute(
        "aria-selected",
        "true",
      );
    } else if (id === "authentication-dialog") {
      await expect(resetReference.locator("[data-auth-dialog]")).toBeVisible();
    } else if (id === "app-shell") {
      await expect(resetReference.locator('[role="option"]').filter({ hasText: "Field Jacket" }).first()).toHaveAttribute(
        "aria-selected",
        "true",
      );
    } else if (id === "agent-activity-trace") {
      await expect(resetReference.locator(".tool-activity pre")).toBeHidden();
    } else if (id === "story-timeline") {
      await expect(resetReference.locator('[role="option"]').first()).toHaveAttribute("aria-selected", "true");
    } else if (id === "code-block") {
      await expect(resetReference.getByRole("button", { name: "Wrap lines" })).toHaveAttribute("aria-pressed", "false");
    } else if (id === "button") {
      await expect(resetReference.getByRole("button", { name: "Export records" })).toBeVisible();
    }
  }
});

test("component workbench restores hash, roves focus, syncs controls, and keeps reduced motion final state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/#component-data-table");
  const browser = page.locator("[data-component-gallery]");
  const stage = browser.locator("[data-reference-stage]");
  await expect(browser.locator('[data-component-choice="data-table"]')).toHaveAttribute("aria-selected", "true");
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await browser.locator('[data-component-choice="command-menu"]').focus();
  await page.keyboard.press("ArrowRight");
  await expect(browser.locator('[data-component-choice="evidence-list"]')).toBeFocused();
  await expect(browser.locator('[data-component-choice="evidence-list"]')).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  await expect(browser.locator('[data-component-choice="suggested-change-review"]')).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(browser.locator('[data-component-choice="evidence-list"]')).toBeFocused();
  await page.keyboard.press("End");
  await expect(browser.locator('[data-component-choice="button"]')).toBeFocused();
  await page.keyboard.press("Home");
  await expect(browser.locator('[data-component-choice="command-menu"]')).toBeFocused();
  await browser.locator('[data-component-choice="data-table"]').click();
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await stage.getByRole("button", { name: "Light" }).click();
  await expect(stage.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
  await stage.getByRole("button", { name: "Narrow" }).click();
  await expect(stage).toHaveAttribute("data-stage-viewport", "narrow");
  await stage.getByRole("button", { name: "In workflow" }).click();
  await expect(stage).toHaveAttribute("data-stage-context", "workflow");
  await expect(stage.locator("iframe")).toHaveCSS("transition-property", "opacity");
  await page.locator("[data-contrast-toggle]").click();
  await expect(page.frameLocator("iframe[data-stage-frame]").locator("html")).toHaveAttribute("data-contrast", "more");
  await expect(browser.locator("iframe[data-stage-frame]")).toHaveCount(1);
});

test("component workbench keeps a localized fallback when a selected mount is unavailable", async ({ page }) => {
  await page.route("**/examples/workspace-reference/showcase-components.html?lang=en&specimen=app-shell", async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><head><title>Valid but unrelated reference</title></head><body><main>Unrelated</main></body></html>",
    });
  });
  await page.goto("/components/");
  const browser = page.locator("[data-component-gallery]");
  const stage = browser.locator("[data-reference-stage]");
  await browser.locator('[data-component-choice="app-shell"]').click();
  await expect(stage).toHaveAttribute("data-stage-ready", "false");
  await expect(stage.locator("[data-stage-loading]")).toHaveText("Reference unavailable", { timeout: 10_000 });
  await expect(stage.locator("[data-stage-loading]")).toBeVisible();
  await expect(stage.locator("[data-stage-reference-link]")).toHaveAttribute("href", /app-shell/);
  await expect(stage.locator("[data-stage-explorer-link]")).toHaveAttribute("href", "app-shell/");
});

test("Component Explorer rejects a reference without the intended fixture mount", async ({ page }) => {
  await page.route("**/examples/workspace-reference/showcase-components.html?lang=en&specimen=app-shell", async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><head><title>Valid but unrelated reference</title></head><body><main>Unrelated</main></body></html>",
    });
  });
  await page.goto("/components/app-shell/");

  const stage = page.locator("[data-reference-stage]");
  await expect(stage).toHaveAttribute("data-ready-fragment", "showcase-specimen-app");
  await expect(stage).toHaveAttribute("data-stage-ready", "false");
  await expect(stage.locator("[data-stage-loading]")).toHaveText("Reference unavailable", { timeout: 10_000 });
  await expect(stage.locator("[data-stage-loading]")).toBeVisible();
});

test("component workbench uses a quiet desktop rail and a touch-safe mobile rail", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/components/");
  const browser = page.locator("[data-component-gallery]");
  const rail = browser.locator(".component-gallery");
  const stage = browser.locator("[data-reference-stage]");
  const desktop = await Promise.all([rail.boundingBox(), stage.boundingBox()]);
  expect(desktop[0]).not.toBeNull();
  expect(desktop[1]).not.toBeNull();
  expect(desktop[0].width).toBeGreaterThanOrEqual(220);
  expect(desktop[0].width).toBeLessThanOrEqual(280);
  expect(desktop[1].x).toBeGreaterThanOrEqual(desktop[0].x + desktop[0].width - 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectNoHorizontalOverflow(page);
  const mobileRail = await rail.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
  expect(mobileRail.scrollWidth).toBeGreaterThan(mobileRail.clientWidth);
  const choiceTargets = await browser.locator("[data-component-choice]").evaluateAll((items) =>
    items.map((item) => { const box = item.getBoundingClientRect(); return { width: box.width, height: box.height }; }),
  );
  expect(choiceTargets.every((target) => target.width >= 44 && target.height >= 44)).toBe(true);
  const controlTargets = await stage.locator("[data-stage-theme], [data-stage-viewport], [data-stage-context]").evaluateAll((items) =>
    items.map((item) => {
      const box = item.getBoundingClientRect();
      return { width: box.width, height: box.height };
    }),
  );
  expect(controlTargets.every((target) => target.width >= 44 && target.height >= 44)).toBe(true);
  const resetBox = await stage.locator("[data-stage-reset]").boundingBox();
  expect(resetBox).not.toBeNull();
  expect(resetBox.width).toBeGreaterThanOrEqual(44);
  expect(resetBox.height).toBeGreaterThanOrEqual(44);
});

test("Component Explorer prioritizes a featured rail, live specimen, and lower evidence tabs", async ({ page }) => {
  await page.goto("/components/evidence-list/");
  await expect(page).toHaveTitle("Evidence List · KIN Design System");
  await expect(page.locator("main")).toHaveAttribute("data-showcase-route", "component-explorer");
  const explorer = page.locator('header[data-component-id="evidence-list"]');
  const localNavigation = page.locator(".component-studio__navigation");
  const stage = page.locator("[data-reference-stage]");
  await expect(explorer.getByRole("heading", { level: 1 })).toHaveText("Evidence List");
  await expect(explorer).toContainText("Stable");
  await expect(explorer).toContainText("Map a claim or decision to supporting, missing, stale, or conflicting sources");
  const featuredLinks = localNavigation.locator("nav a");
  await expect(featuredLinks).toHaveCount(8);
  await expect(featuredLinks.allTextContents()).resolves.toEqual([
    "Command Menu",
    "Evidence List",
    "Suggested Change Review",
    "Execution Preview",
    "Background Task Queue",
    "Data Table",
    "Authentication Dialog",
    "App Shell",
  ]);
  await expect(featuredLinks.first()).toHaveAttribute("href", "../command-menu/");
  await expect(featuredLinks.nth(1)).toHaveAttribute("href", "./");
  await expect(featuredLinks.nth(1)).toHaveAttribute("aria-current", "page");
  await expect(featuredLinks.last()).toHaveAttribute("href", "../app-shell/");
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(stage.locator("[data-stage-loading]")).toBeHidden();
  await expect(stage).not.toHaveAttribute("data-focus-selector", /.+/);
  await expect(stage.locator("[data-stage-frame]")).toHaveAttribute(
    "src",
    "../../examples/workspace-reference/showcase-components.html?lang=en&specimen=evidence-list",
  );
  const reference = page.frameLocator("[data-reference-stage] [data-stage-frame]");
  await expect(stage).toHaveAttribute("data-stage-context", "isolated");
  await expect(reference.locator("html")).not.toHaveAttribute("data-showcase-component-focus", "true");
  await expect(reference.locator("#specimen-root")).toBeVisible();
  await expect(reference.locator(".evidence-layout")).toBeVisible();
  await expect(page.frameLocator("[data-reference-stage] [data-stage-frame]").locator("html")).toHaveAttribute(
    "lang",
    "en",
  );
  const explorerGeometry = await page.locator(".docs-shell").evaluate((shell) => {
    const main = shell.querySelector(".showcase-main");
    const stageViewport = shell.querySelector(".reference-stage__viewport");
    const shellRect = shell.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    const stageRect = stageViewport.getBoundingClientRect();
    return {
      shellLeft: shellRect.left,
      mainLeft: mainRect.left,
      stageWidth: stageRect.width,
      stageHeight: stageRect.height,
    };
  });
  expect(Math.abs(explorerGeometry.shellLeft - explorerGeometry.mainLeft)).toBeLessThan(1);
  expect(explorerGeometry.stageWidth).toBeGreaterThan(760);
  expect(explorerGeometry.stageHeight).toBeLessThanOrEqual(640);
  await expect(stage.locator(".reference-stage__footer")).toContainText("Reference language");
  await expect(stage.locator(".reference-stage__footer")).toContainText("English");
  await expect(stage.locator(".stage-state-readout")).toContainText("Evidence with a recorded conflict");
  await expect(stage.getByRole("group", { name: "Theme" }).getByRole("button")).toHaveCount(2);
  await expect(stage.getByRole("group", { name: "Viewport" }).getByRole("button")).toHaveCount(2);

  await stage.getByRole("button", { name: "In workflow" }).click();
  await expect(stage).toHaveAttribute("data-stage-context", "workflow");
  await expect(reference.locator("html")).not.toHaveAttribute("data-showcase-component-focus", "true");
  await expect(reference.locator(".evidence-layout")).toBeVisible();
  await stage.getByRole("button", { name: "Isolated" }).click();
  await expect(stage).toHaveAttribute("data-stage-context", "isolated");
  await expect(reference.locator("html")).not.toHaveAttribute("data-showcase-component-focus", "true");
  await expect(reference.locator(".evidence-layout")).toBeVisible();

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
  const usageTabMaterial = await tabs.getByRole("tab", { name: "Usage" }).evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      edge: getComputedStyle(element, "::after").display,
      shadow: style.boxShadow,
    };
  });
  expect(usageTabMaterial.background).toBe("rgba(255, 255, 255, 0.055)");
  expect(usageTabMaterial.edge).toBe("none");
  expect(usageTabMaterial.shadow).not.toContain("94, 106, 210");
  await expect(tabs.locator("#usage-panel .contract-boundary")).toHaveCount(0);
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
  await expect(tabs.locator("#contract-panel .contract-boundary")).toBeVisible();
  await expect(tabs.getByRole("heading", { name: "Governing contracts" })).toBeVisible();
  await expect(tabs.getByRole("heading", { name: "Automated checks" })).toBeVisible();
  await expect(tabs.getByRole("heading", { name: "Named manual checks" })).toBeVisible();
  await expect(tabs.getByRole("heading", { name: "Known gaps" })).toBeVisible();
  await expect(tabs.getByText("No gap is recorded for this component in the canonical catalog.")).toBeVisible();
  await expect(page.locator('.language-menu a[hreflang="zh-CN"]')).toHaveAttribute(
    "href",
    "../../zh/components/evidence-list/",
  );
});

test("App Shell specimen keeps visual navigation distinct from selected work", async ({ page }) => {
  await page.goto("/components/app-shell/");
  const reference = page.frameLocator("[data-reference-stage] [data-stage-frame]");
  const navigation = reference.locator(".mini-nav");
  const currentNavigation = navigation.locator('[data-active="true"]');
  await expect(navigation).toHaveAttribute("aria-hidden", "true");
  await expect(navigation.locator("a, button, [role=\"link\"], [aria-current]")).toHaveCount(0);
  await expect(currentNavigation).toBeVisible();
  const material = await currentNavigation.evaluate((element) => {
    const resolveColor = (token) => {
      const probe = document.createElement("span");
      probe.style.background = `var(${token})`;
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
      selected: resolveColor("--surface-selected"),
    };
  });
  expect(material.background).toBe(material.navigationSelected);
  expect(material.background).not.toBe(material.selected);
  expect(material.boxShadow).not.toContain(material.accent);
});

test("Component Explorer keeps a current rail link and specimen-aware stage heights", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/components/button/");
  const buttonRail = page.locator(".component-studio__navigation nav");
  await expect(buttonRail.locator('a[aria-current="page"]')).toHaveCount(1);
  await expect(buttonRail.locator('a[aria-current="page"]')).toHaveAttribute("href", "./");
  await expect(buttonRail.locator("a")).toHaveCount(9);
  await expect(page.locator("[data-reference-stage]")).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  const buttonHeight = await page.locator(".reference-stage__viewport").evaluate((element) => element.getBoundingClientRect().height);
  expect(buttonHeight).toBeLessThan(500);

  await page.goto("/components/evidence-list/");
  await expect(page.locator("[data-reference-stage]")).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  const evidenceHeight = await page.locator(".reference-stage__viewport").evaluate((element) => element.getBoundingClientRect().height);
  expect(evidenceHeight).toBeGreaterThan(buttonHeight);
  expect(evidenceHeight).toBeGreaterThanOrEqual(600);
});

test("Button Explorer demonstrates distinct tasks instead of a repeated variant matrix", async ({ page }) => {
  await page.goto("/zh/components/button/");
  await expect(page).toHaveTitle("按钮 · KIN 设计系统");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("按钮");

  const stage = page.locator("[data-reference-stage]");
  const reference = page.frameLocator("[data-reference-stage] [data-stage-frame]");
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(stage).not.toHaveAttribute("data-focus-selector", /.+/);
  await expect(reference.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(reference.locator(".button-specimen-grid")).toBeVisible();
  await expect(reference.locator(".button-matrix, .button-state-grid, .button-size-grid")).toHaveCount(0);
  await expect(reference.locator(".button-specimen-group")).toHaveCount(2);
  await expect(reference.getByRole("button", { name: "保存更改" })).toBeVisible();
  await expect(reference.getByRole("button", { name: "导出记录" })).toBeVisible();
  await expect(reference.getByRole("button", { name: "复制链接" })).toBeVisible();
  await expect(reference.getByRole("button", { name: "打开通知" })).toBeVisible();
  const save = reference.getByRole("button", { name: "保存更改" });
  await save.click();
  await expect(reference.getByRole("button", { name: "保存中…" })).toBeDisabled();
  await expect(
    reference.locator('[data-sonner-toast][data-visible="true"]').filter({ hasText: "更改已保存" }),
  ).toBeVisible();
});

test("Component Explorers expose the actual canonical fixture language", async ({ page }) => {
  const consoleWarnings = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) consoleWarnings.push(message.text());
  });

  const explorers = [
    "app-shell",
    "evidence-list",
    "suggested-change-review",
    "execution-preview",
    "agent-activity-trace",
    "background-task-queue",
    "story-timeline",
    "data-table",
    "command-menu",
    "authentication-dialog",
    "code-block",
    "button",
  ];

  for (const id of explorers) {
    await page.goto(`/components/${id}/`);
    const stage = page.locator("[data-reference-stage]");
    const frame = stage.locator("[data-stage-frame]");
    await expect(frame).toHaveAttribute("src", new RegExp(`lang=en.*specimen=${id}`));
    await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
    await expect(page.frameLocator("[data-reference-stage] [data-stage-frame]").locator("html")).toHaveAttribute(
      "lang",
      "en",
    );
    await expect(stage).not.toHaveAttribute("data-focus-selector", /.+/);
    await expect(page.frameLocator("[data-reference-stage] [data-stage-frame]").locator("#specimen-root")).toBeVisible();
    await expect(stage.locator(".reference-stage__footer")).toContainText("English");
  }

  expect(consoleWarnings).toEqual([]);
});

test("focused Command Menu remains recoverable after Escape", async ({ page }) => {
  await page.goto("/components/command-menu/");
  const stage = page.locator("[data-reference-stage]");
  const reference = page.frameLocator("[data-reference-stage] [data-stage-frame]");
  const dialog = reference.getByRole("dialog", { name: "KIN command menu" });
  const trigger = reference.getByRole("button", { name: "Open command menu" });
  const search = reference.locator("input[cmdk-input]");

  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(dialog).toBeVisible();
  await search.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(search).toBeFocused();
});

test("Pattern discovery compares four compositions through one dominant live stage", async ({ page }) => {
  await page.goto("/patterns/");
  await expect(page).toHaveTitle("Four layouts, shaped by the work. · KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Four layouts, shaped by the work.");
  await expect(page.locator("main")).toHaveAttribute("data-showcase-route", "patterns");
  const browser = page.locator("[data-pattern-browser]");
  const choices = browser.locator("[data-pattern-choice]");
  const contexts = browser.locator("[data-pattern-context]");
  const stage = browser.locator("[data-reference-stage]");
  await expect(choices).toHaveCount(4);
  await expect(contexts).toHaveCount(4);
  await expect(stage).toHaveCount(1);
  await expect(stage.locator("iframe[data-stage-frame]")).toHaveCount(1);
  await expect(page.locator(".pattern-blueprint, [data-pattern-blueprint]")).toHaveCount(0);
  await expect(page.locator("details.pattern-details")).toHaveCount(4);
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(stage.locator("[data-stage-loading]")).toBeHidden();
  const initialOuterTheme = await page.locator("html").getAttribute("data-theme");
  await expect(page.frameLocator("[data-pattern-browser] [data-reference-stage] iframe").locator("html")).toHaveAttribute(
    "data-theme",
    initialOuterTheme,
  );

  const maturityDisclosure = page.locator("details.catalog-disclosure--compact");
  await expect(maturityDisclosure).not.toHaveAttribute("open", "");
  await expect(maturityDisclosure.locator("summary")).toContainText(
    "Pattern documents have no independent machine maturity. The status shown here belongs only to the joined Page record.",
  );

  await choices.filter({ hasText: "Intelligence Workspace" }).click();
  await expect(choices.filter({ hasText: "Intelligence Workspace" })).toHaveAttribute("aria-selected", "true");
  await expect(choices.first().locator("strong")).toHaveText("Information Site");
  await expect(choices.first().locator("small")).toHaveText(
      "Search, subject identity, reading order, provenance, revision, and stable location lead before explanation.",
  );
  await expect(browser.locator("[data-pattern-title]")).toHaveText("Intelligence Workspace");
  await expect(browser.locator(".pattern-browser__heading [data-pattern-summary]")).toHaveText(
    "Entity identity, evidence, history, and reversible review stay visible while list selection changes.",
  );
  await expect(stage.locator("[data-pattern-language]")).toHaveText("English");
  await expect(browser.locator('[data-pattern-context="intelligence-workspace"]')).toBeVisible();
  await expect(browser.locator('[data-pattern-context="intelligence-workspace"]')).toContainText(
    "Investigation and Evidence Review",
  );
  await expect(browser.getByRole("link", { name: /Inspect in Scenario Lab/ })).toHaveAttribute(
    "href",
    /\/scenarios\/lab\.html\?scenario=INT-02&mode=present(?:&theme=(?:light|dark))?$/,
  );
  await expect(browser.locator('[data-pattern-context="intelligence-workspace"] details.pattern-details a.button')).toHaveAttribute(
    "href",
    "../examples/workspace-reference/index.html?view=investigation&lang=en&state=normal",
  );
  await expect(stage.locator("iframe[data-stage-frame]")).toHaveAttribute(
    "src",
    "../examples/workspace-reference/index.html?view=investigation&lang=en&state=normal",
  );
  await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.locator("details.pattern-details a.button").filter({ hasText: "Open Chinese reference" })).toHaveCount(3);
  await expect(page.locator(".reference-language-note")).toHaveCount(3);
  const stageOverride = initialOuterTheme === "dark" ? "Light" : "Dark";
  await stage.getByRole("button", { name: stageOverride }).click();
  const overrideTheme = stageOverride.toLowerCase();
  await expect(page.frameLocator("[data-pattern-browser] [data-reference-stage] iframe").locator("html")).toHaveAttribute(
    "data-theme",
    overrideTheme,
  );
  await page.locator("[data-theme-switch]").click();
  await expect(page.frameLocator("[data-pattern-browser] [data-reference-stage] iframe").locator("html")).toHaveAttribute(
    "data-theme",
    overrideTheme,
  );
  await choices.filter({ hasText: "Information Site" }).click();
  await expect(page.frameLocator("[data-pattern-browser] [data-reference-stage] iframe").locator("html")).toHaveAttribute(
    "data-theme",
    overrideTheme,
  );
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

  const stage = page.locator("[data-pattern-browser] [data-reference-stage]");
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
      path: "/components/evidence-list/",
      stage: "[data-reference-stage]",
      previous: 'button[data-stage-viewport="narrow"]',
    },
    {
      path: "/patterns/",
      stage: "[data-pattern-browser] [data-reference-stage]",
      previous: '[data-pattern-browser] button[data-stage-viewport="narrow"]',
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
  await expect(page).toHaveTitle("组件与交互 · KIN 设计系统");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("先试用组件，再查看规范。");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  const browser = page.locator("[data-component-gallery]");
  const catalog = page.locator("details.catalog-disclosure");
  const catalogRows = catalog.locator(".discovery-row[data-component-id]");
  await expect(browser.locator("[data-component-card]")).toHaveCount(12);
  await expect(browser.locator("[data-component-choice]")).toHaveCount(12);
  await expect(browser.locator("[data-reference-stage]")).toHaveCount(1);
  await expect(browser.locator("iframe[data-stage-frame]")).toHaveCount(1);
  await expect(browser.locator("[data-reference-stage]")).toHaveAttribute("data-stage-ready", "true", {
    timeout: 10_000,
  });
  await expect(catalog).not.toHaveAttribute("open", "");
  await expect(catalogRows).toHaveCount(80);
  await expect(catalogRows.locator(".status-badge--stable")).toHaveCount(65);
  await expect(catalogRows.locator("a.discovery-row__name")).toHaveCount(12);
  await expect(catalog).toContainText("通用的交互或内容组件。");
  await catalog.locator("summary").click();
  await expect(catalog).toHaveAttribute("open", "");
  await expect(catalogRows.first()).toBeVisible();
  await expect(catalogRows.locator('.discovery-row__name[lang="zh-CN"]')).toHaveCount(80);
  await expect(catalogRows.locator('.discovery-row__name[lang="en"]')).toHaveCount(0);
  await expect(catalog.locator('[data-component-id="empty-state"] .discovery-row__name')).toHaveText("空状态");
  await expect(catalog.locator('[data-component-id="activity-feed"] .discovery-row__name')).toHaveText("活动记录");
  await expect(catalog.locator('[data-component-id="live-chart"] .discovery-row__name')).toHaveText("实时图表");
  await expect(catalog.locator('[data-component-id="evidence-list"] a')).toHaveAttribute("href", "evidence-list/");
  await expect(catalog.locator('[data-component-id="evidence-list"] a')).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator('.language-menu a[hreflang="en"]')).toHaveAttribute("href", "../../components/");
  await expect(browser.locator('[data-component-id="evidence-list"]')).toHaveAttribute("data-component-name", "证据列表");
  await expect(
    browser.locator('[data-component-id="evidence-list"]').getByRole("link", { name: "打开: 证据列表" }),
  ).toHaveAttribute("href", "evidence-list/");
  await expect(browser.locator('[data-component-choice="command-menu"]')).toHaveAttribute("aria-selected", "true");
  await expect(browser.locator("iframe[data-stage-frame]")).toHaveAttribute(
    "src",
    "../../examples/workspace-reference/showcase-components.html?lang=zh-CN&specimen=command-menu",
  );
  await expect(page.frameLocator("iframe[data-stage-frame]").locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator('a[href="../../scenarios/?lang=zh-CN"]').first()).toContainText("场景");
  await expect(page.locator('a[href="../../scenarios/lab.html?lang=zh-CN"]').first()).toContainText("场景预览");

  await page.goto("/zh/components/evidence-list/");
  await expect(page).toHaveTitle("证据列表 · KIN 设计系统");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("证据列表");
  const chineseFeaturedLinks = page.locator(".component-studio__navigation nav a");
  await expect(chineseFeaturedLinks).toHaveCount(8);
  await expect(chineseFeaturedLinks.allTextContents()).resolves.toEqual([
    "命令菜单",
    "证据列表",
    "变更审核",
    "执行预览",
    "后台任务",
    "数据表格",
    "登录对话框",
    "应用框架",
  ]);
  await expect(chineseFeaturedLinks.first()).toHaveAttribute("href", "../command-menu/");
  await expect(chineseFeaturedLinks.nth(1)).toHaveAttribute("aria-current", "page");
  await expect(chineseFeaturedLinks.last()).toHaveAttribute("href", "../app-shell/");
  await expect(page.locator("[data-reference-stage]")).toHaveAttribute("data-stage-ready", "true", {
    timeout: 10_000,
  });
  const explorerStage = page.locator("[data-reference-stage]");
  const explorerReference = page.frameLocator("[data-reference-stage] [data-stage-frame]");
  await expect(explorerStage).toHaveAttribute("data-stage-context", "isolated");
  await expect(explorerReference.locator("html")).not.toHaveAttribute("data-showcase-component-focus", "true");
  await expect(explorerReference.locator("body")).toContainText("渠道快照");
  await expect(explorerReference.locator("body")).toContainText("今天 09:31");
  await expect(explorerReference.locator("body")).not.toContainText("Channel snapshot");
  await expect(explorerReference.locator("body")).not.toContainText("Today, 09:31");
  await page.getByRole("button", { name: "工作流中" }).click();
  await expect(explorerStage).toHaveAttribute("data-stage-context", "workflow");
  await expect(explorerReference.locator("html")).not.toHaveAttribute("data-showcase-component-focus", "true");
  await page.getByRole("button", { name: "单独预览" }).click();
  await expect(explorerStage).toHaveAttribute("data-stage-context", "isolated");
  await expect(explorerReference.locator("html")).not.toHaveAttribute("data-showcase-component-focus", "true");
  await expect(page.locator("#usage-panel .contract-boundary")).toHaveCount(0);
  await page.getByRole("tab", { name: "规范" }).click();
  await expect(page.locator("#contract-panel .contract-boundary")).toBeVisible();
  await expect(page.getByRole("heading", { name: "人工检查" })).toBeVisible();
  await expect(page.getByText("冲突证据", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "无障碍" }).click();
  await expect(page.getByRole("heading", { name: "支持情况" })).toBeVisible();
  await expect(page.locator('.component-support-grid [data-supported="true"]')).toHaveCount(5);

  await page.goto("/zh/patterns/");
  await expect(page).toHaveTitle("为不同任务选择合适布局 · KIN 设计系统");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("为不同任务选择合适布局");
  const patternBrowser = page.locator("[data-pattern-browser]");
  await expect(patternBrowser.locator("[data-pattern-choice]")).toHaveCount(4);
  await expect(patternBrowser.locator("iframe[data-stage-frame]")).toHaveCount(1);
  await expect(page.locator(".pattern-blueprint, [data-pattern-blueprint]")).toHaveCount(0);
  await patternBrowser.locator('[data-pattern-choice="intelligence-workspace"]').click();
  await expect(patternBrowser.locator("[data-pattern-title]")).toHaveText("情报工作台");
  await expect(patternBrowser.locator('[data-pattern-context="intelligence-workspace"]')).toContainText("INT-02");
  await expect(patternBrowser.locator("iframe")).toHaveAttribute(
    "src",
    "../../examples/workspace-reference/index.html?view=investigation&lang=zh-CN&state=normal",
  );
  await expect(patternBrowser.locator('[data-pattern-context="information-site"] details.pattern-details')).toContainText("信息详情页");
  await expect(patternBrowser.locator('[data-pattern-context="information-site"] details.pattern-details')).toContainText("查找并核验信息");
  await expect(patternBrowser.locator('[data-pattern-context="information-site"] details.pattern-details')).toContainText(
    "搜索、筛选并打开记录，同时确认来源与时效。",
  );
  for (const [index, scenarioId] of ["INF-01", "INT-02", "COM-01", "ENG-01"].entries()) {
    await patternBrowser.locator("[data-pattern-choice]").nth(index).click();
    await expect(patternBrowser.locator("a[data-pattern-lab]")).toHaveAttribute(
      "href",
      new RegExp(`scenario=${scenarioId}.*lang=zh-CN`),
    );
  }
  await expect(page.locator('.language-menu a[hreflang="en"]')).toHaveAttribute("href", "../../patterns/");
});

test("Chinese component fixtures localize table values and cmdk suggestion semantics", async ({ page }) => {
  await page.goto("/zh/components/data-table/");
  await expect(page.locator("[data-reference-stage]")).toHaveAttribute("data-stage-ready", "true", {
    timeout: 10_000,
  });
  const tableReference = page.frameLocator("[data-reference-stage] [data-stage-frame]");
  await expect(tableReference.getByText("官网 + 2", { exact: true })).toBeVisible();
  await expect(tableReference.getByText("官网", { exact: true })).toBeVisible();
  await expect(tableReference.getByText("官网 + 1", { exact: true })).toBeVisible();
  await expect(tableReference.getByText("昨天", { exact: true })).toBeVisible();
  await expect(tableReference.getByText("Yesterday", { exact: true })).toHaveCount(0);

  await page.goto("/zh/components/command-menu/");
  await expect(page.locator("[data-reference-stage]")).toHaveAttribute("data-stage-ready", "true", {
    timeout: 10_000,
  });
  const commandReference = page.frameLocator("[data-reference-stage] [data-stage-frame]");
  await expect(commandReference.getByRole("dialog", { name: "KIN 命令菜单" })).toBeVisible();
  await expect(commandReference.getByRole("listbox", { name: "命令建议" })).toBeVisible();
  await expect(commandReference.getByRole("listbox", { name: "Suggestions" })).toHaveCount(0);
});

test("Chinese component fixture bootstrap localizes before the React module loads", async ({ page }) => {
  await page.route("**/showcase-components.js", (route) => route.abort("failed"));
  await page.goto(
    "/examples/workspace-reference/showcase-components.html?lang=zh-CN&specimen=button",
    { waitUntil: "domcontentloaded" },
  );

  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page).toHaveTitle("KIN 组件展示参考");
  await expect(page.getByRole("link", { name: "跳到组件" })).toBeVisible();
  await expect(page.getByText("Skip to component", { exact: true })).toBeHidden();
  await expect(page.locator("#showcase-specimen-app")).toBeEmpty();
});

test("scenario atlas exposes honest coverage and eighteen inspectable scenarios", async ({ page }) => {
  const consoleWarnings = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) consoleWarnings.push(message.text());
  });

  await page.goto("/scenarios/");
  await expect(page).toHaveTitle("Scenario Atlas - KIN Design System");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Inspect KIN across product tasks.");
  await expect(page.getByRole("heading", { level: 2, name: "Investigation and Evidence Review" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start with evidence review" })).toHaveAttribute(
    "href",
    "lab.html?scenario=INT-02&state=normal&viewport=wide&theme=dark&mode=present",
  );
  await expect(page.locator("[data-atlas-feature-frame]")).toHaveAttribute(
    "src",
    "../examples/workspace-reference/index.html?view=investigation&lang=en&state=normal",
  );
  await expect(page.locator("[data-scenario-id]")).toHaveCount(31);
  await expect(page.locator('[data-scenario-id][data-presentation-status="showcased"]')).toHaveCount(18);
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
  await expect(page.locator('[data-scenario-id="WORK-05"]').getByRole("link", { name: "Inspect scenario" })).toHaveAttribute("href", "lab.html?scenario=WORK-05");
  await expect(page.locator('[data-scenario-id="WORK-01"] .source-status.candidate')).toHaveText("Candidate source");
  await expect(page.getByText("Discovery is not adoption evidence.")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectNoHorizontalOverflow(page);
  await expect(page.locator('[data-scenario-id="COM-02"]').getByRole("link", { name: "Inspect scenario" })).toBeVisible();
  expect(consoleWarnings).toEqual([]);
});

test("Chinese Scenario Atlas and Lab preserve language through discovery and verification", async ({ page }) => {
  const consoleWarnings = [];
  const featureFrameRequests = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) consoleWarnings.push(message.text());
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      request.resourceType() === "document"
      && url.pathname.endsWith("/examples/workspace-reference/index.html")
    ) {
      featureFrameRequests.push(url.pathname + url.search);
    }
  });

  await page.goto("/scenarios/?lang=zh-CN");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page).toHaveTitle("场景目录 · KIN 设计系统");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("在真实任务中体验 KIN。");
  await expect(page.getByRole("heading", { level: 2, name: "调查与证据复核" })).toBeVisible();
  await expect(page.getByRole("link", { name: "从证据复核开始" })).toHaveAttribute(
    "href",
    "/scenarios/lab.html?scenario=INT-02&state=normal&viewport=wide&theme=dark&mode=present&lang=zh-CN",
  );
  await expect(page.locator("[data-atlas-feature-frame]")).toHaveAttribute(
    "src",
    "../examples/workspace-reference/index.html?view=investigation&lang=zh-CN&state=normal",
  );
  await expect.poll(() => featureFrameRequests).toEqual([
    "/examples/workspace-reference/index.html?view=investigation&lang=zh-CN&state=normal",
  ]);
  await expect(page.locator("[data-scenario-id]")).toHaveCount(31);
  await expect(page.locator('[data-scenario-id="INT-01"]')).toContainText("档案复核");
  await expect(page.locator('[data-scenario-id="CORE-03"]')).toContainText("搜索与结果");
  await expect(page.locator('[data-scenario-id="WORK-01"]')).toContainText("排期工作台");
  await expect(page.locator(".release-note")).toContainText("13 个计划项");
  await expect(page.locator(".release-note")).toContainText("第三阶段支持中英双语。");
  await expect(page.getByText(/FAMILY \d/)).toHaveCount(0);
  await expect(
    page.locator('[data-scenario-id="INT-02"]').getByRole("link", { name: "打开预览" }),
  ).toHaveAttribute("href", "/scenarios/lab.html?scenario=INT-02&lang=zh-CN");

  await page.goto(
    "/scenarios/lab.html?scenario=INT-02&state=normal&viewport=wide&theme=dark&mode=present&lang=zh-CN",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page).toHaveTitle("调查与证据复核 · 场景预览");
  await expect(page.getByRole("heading", { level: 2, name: "调查与证据复核" })).toBeVisible();
  await expect(page.locator('[data-lab-mode="present"]')).toHaveText("预览");
  await expect(page.locator('[data-lab-mode="inspect"]')).toHaveText("检查");
  await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass", {
    timeout: 10_000,
  });
  await expect(page.locator("[data-lab-verification]")).toHaveText("预览已就绪");
  await expect(page.frameLocator("[data-lab-frame]").locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.frameLocator("[data-lab-frame]").getByText("情报工作台", { exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get("lang")).toBe("zh-CN");

  await page.locator('[data-lab-mode="inspect"]').click();
  await expect(page.locator("[data-scenario-lab]")).toHaveAttribute("data-controls-state", "open");
  await page.locator("[data-lab-state]").selectOption("permission");
  await expect(page).toHaveURL(/state=permission/);
  expect(new URL(page.url()).searchParams.get("lang")).toBe("zh-CN");
  await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass", {
    timeout: 10_000,
  });
  expect(consoleWarnings).toEqual([]);
});

test("Scenario localization failure falls back to a coherent English surface", async ({ page }) => {
  await page.route("**/scenarios/locale.zh-CN.json", (route) => route.fulfill({ status: 500, body: "unavailable" }));
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/scenarios/?lang=zh-CN");
  await page.waitForURL((url) => !url.searchParams.has("lang"));
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Inspect KIN across product tasks.");
  await expect(page.locator('[data-scenario-id="INT-01"]')).toContainText("Entity Database Review");
  await expect(page.getByRole("switch")).toHaveAccessibleName(/Switch to (light|dark) mode/);
  const navigation = page.locator("[data-nav-toggle]");
  await expect(navigation).toHaveAccessibleName("Open navigation");
  await navigation.click();
  await expect(navigation).toHaveAccessibleName("Close navigation");

  await page.goto(
    "/scenarios/lab.html?scenario=INT-02&state=normal&viewport=wide&theme=dark&mode=present&lang=zh-CN",
  );
  await page.waitForURL((url) => !url.searchParams.has("lang"));
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("button", { name: "Inspect" })).toBeVisible();
});

test("Chinese Lab verifies translated text assertions instead of English source copy", async ({ page }) => {
  for (const entry of [
    {
      url: "/scenarios/lab.html?scenario=CORE-03&state=partial&viewport=wide&theme=dark&mode=present&lang=zh-CN",
      title: "搜索与结果",
    },
    {
      url: "/scenarios/lab.html?scenario=WORK-01&state=conflict&viewport=wide&theme=dark&mode=present&lang=zh-CN",
      title: "排期工作台",
    },
  ]) {
    await page.goto(entry.url);
    await expect(page.getByRole("heading", { level: 2, name: entry.title })).toBeVisible();
    await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass", {
      timeout: 10_000,
    });
    await expect(page.locator("[data-lab-verification]")).toHaveText("预览已就绪");
    await expect(page.frameLocator("[data-lab-frame]").locator("html")).toHaveAttribute("lang", "zh-CN");
  }
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
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("为不同任务选择合适布局");

  await page.getByRole("button", { name: "选择语言" }).click();
  await expect(page.getByRole("menuitem", { name: "English" })).toHaveAttribute("href", "../../patterns/");
});

test("global material roles resolve by theme and fall back to structure in contrast modes", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Computed material and Forced Colors coverage is recorded in Chromium.");

  await page.goto("/docs/");
  const readMaterial = () => page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries([
      "edge-highlight",
      "edge-highlight-strong",
      "edge-contact",
      "shadow-contact",
      "shadow-raised",
      "shadow-floating",
    ].map((role) => [role, style.getPropertyValue(`--${role}`).trim()]));
  });

  const dark = await readMaterial();
  expect(dark["edge-highlight"]).toBe("#ffffff08");
  expect(dark["shadow-contact"]).not.toBe("none");
  expect(dark["shadow-raised"]).not.toBe("none");
  expect(dark["shadow-floating"]).not.toBe("none");

  await page.getByRole("switch").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const light = await readMaterial();
  expect(light["edge-highlight"]).toBe("#ffffffd6");
  expect(light["shadow-floating"]).not.toBe(dark["shadow-floating"]);

  await page.getByRole("button", { name: "Increase contrast" }).click();
  const higherContrast = await readMaterial();
  expect(higherContrast["edge-highlight"]).toBe("#00000000");
  expect(higherContrast["edge-highlight-strong"]).toBe("#00000000");
  expect(higherContrast["edge-contact"]).toBe("#00000000");
  expect(higherContrast["shadow-contact"]).toBe("none");
  expect(higherContrast["shadow-raised"]).toBe("none");
  expect(higherContrast["shadow-floating"]).toBe("none");

  await page.emulateMedia({ forcedColors: "active" });
  const forcedColors = await readMaterial();
  expect(["transparent", "#00000000"]).toContain(forcedColors["edge-highlight"]);
  expect(forcedColors["shadow-contact"]).toBe("none");
  expect(forcedColors["shadow-raised"]).toBe("none");
  expect(forcedColors["shadow-floating"]).toBe("none");
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

test("mobile horizontal references expose continuation cues without root overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/components/button/");
  const componentRail = page.locator(".component-studio__navigation nav");
  const componentRailCue = await componentRail.evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    return { overflow: element.scrollWidth > element.clientWidth, width: style.width, display: style.display };
  });
  expect(componentRailCue.overflow).toBe(true);
  expect(componentRailCue.display).not.toBe("none");
  expect(Number.parseFloat(componentRailCue.width)).toBeGreaterThan(0);
  const controlCue = await page.locator(".reference-stage__controls").evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    return { width: style.width, display: style.display };
  });
  expect(controlCue.display).not.toBe("none");
  expect(Number.parseFloat(controlCue.width)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.goto("/patterns/");
  const patternSelector = page.locator(".pattern-browser__selector");
  const patternCue = await patternSelector.evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    return { overflow: element.scrollWidth > element.clientWidth, width: style.width, display: style.display };
  });
  expect(patternCue.overflow).toBe(true);
  expect(patternCue.display).not.toBe("none");
  expect(Number.parseFloat(patternCue.width)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("mobile global navigation remains available on nested routes with exact focus return", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/");

  const trigger = page.locator("[data-nav-toggle]");
  await expect(trigger).toHaveAccessibleName("Open navigation");
  const navigation = page.locator("[data-mobile-nav]");
  const main = page.locator(".docs-main");

  await expect(navigation).toHaveAttribute("aria-hidden", "true");
  await trigger.click();
  await expect(trigger).toHaveAccessibleName("Close navigation");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(navigation).toHaveAttribute("role", "dialog");
  await expect(navigation).toHaveAttribute("aria-modal", "true");
  await expect(main).toHaveJSProperty("inert", true);
  await expect(navigation.getByRole("link", { name: "Showcase" })).toBeFocused();
  const currentNavigationStyle = await navigation.locator('a[aria-current="page"]').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      boxShadow: style.boxShadow,
      edge: getComputedStyle(element, "::after").display,
    };
  });
  expect(currentNavigationStyle.background).not.toContain("94, 106, 210");
  expect(currentNavigationStyle.boxShadow).not.toContain("94, 106, 210");
  expect(currentNavigationStyle.edge).toBe("none");

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    const contained = await page.evaluate(() => {
      const active = document.activeElement;
      return active === document.querySelector("[data-nav-toggle]")
        || document.querySelector("[data-mobile-nav]")?.contains(active);
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

test("mobile documentation sections remain a separate local Drawer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/");

  const trigger = page.locator("[data-local-nav-toggle]");
  const navigation = page.locator("[data-local-nav]");
  const main = page.locator(".docs-main");
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAccessibleName("Open documentation sections");
  await expect(navigation).toHaveAttribute("aria-hidden", "true");

  await trigger.click();
  await expect(trigger).toHaveAccessibleName("Close documentation sections");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(navigation).toHaveAttribute("role", "dialog");
  await expect(navigation).toHaveAttribute("aria-modal", "true");
  await expect(main).toHaveJSProperty("inert", true);
  await expect(navigation.getByRole("link").first()).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).toHaveAttribute("aria-hidden", "true");
  await expect(main).toHaveJSProperty("inert", false);
  await expect(page.locator("body")).not.toHaveClass(/nav-closing/);
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
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("找不到这个页面。");
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
  await expect(page.locator('[data-404-language="zh-CN"]')).toBeFocused();
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
    "/components/button/",
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
  await expect(page.getByRole("link", { name: "Explore components" })).toHaveAttribute("href", "components/");
  await expect(page.locator("[data-preview-activate], [data-preview-deactivate]")).toHaveCount(0);

  const touchTargets = await page
    .locator(
      "[data-nav-toggle], [data-command-trigger], [data-language-trigger], [data-theme-switch], [data-contrast-toggle], .showcase-button.primary",
    )
    .evaluateAll((items) =>
      items
        .filter((item) => !item.hidden)
        .map((item) => {
          const box = item.getBoundingClientRect();
          return { width: box.width, height: box.height };
        }),
    );
  expect(touchTargets).toHaveLength(6);
  expect(touchTargets.every((target) => target.width >= 44 && target.height >= 44)).toBe(true);

  const navigationTrigger = page.locator("[data-nav-toggle]");
  const mobileNavigation = page.locator("[data-mobile-nav]");
  await navigationTrigger.click();
  await expect(navigationTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(mobileNavigation).toHaveAttribute("role", "dialog");
  await expect(mobileNavigation.getByRole("link", { name: "Showcase" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(navigationTrigger).toBeFocused();
  await expect(navigationTrigger).toHaveAttribute("aria-expanded", "false");
  const stageTouchTargets = await page
    .locator("[data-scenario-stage] [role=tab], [data-stage-lab-link]")
    .evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        return { width: box.width, height: box.height };
      }),
    );
  expect(stageTouchTargets).toHaveLength(5);
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

  await page.goto("/components/evidence-list/");
  const mobileExplorerStage = await page.locator("[data-reference-stage]").boundingBox();
  expect(mobileExplorerStage).not.toBeNull();
  expect(mobileExplorerStage.y).toBeLessThanOrEqual(360);
  expect(
    Math.min(mobileExplorerStage.y + mobileExplorerStage.height, 844) - mobileExplorerStage.y,
  ).toBeGreaterThanOrEqual(420);
  const explorerTargets = await page
    .locator(
      ".reference-stage__toolbar button, .stage-state-readout, .component-studio__navigation nav a",
    )
    .evaluateAll((items) =>
      items
        .filter((item) => !item.hidden)
        .map((item) => {
          const box = item.getBoundingClientRect();
          return { width: box.width, height: box.height, text: item.textContent.trim() };
        }),
    );
  expect(explorerTargets.length).toBeGreaterThan(7);
  expect(explorerTargets.every((target) => target.height >= 44)).toBe(true);
  expect(
    explorerTargets
      .filter((target) => target.text === "" || ["Light", "Dark", "Wide", "Narrow"].includes(target.text))
      .every((target) => target.width >= 44),
  ).toBe(true);
  const explorerNavigationTargets = await page
    .locator(".component-studio__navigation nav a")
    .evaluateAll((items) => items.map((item) => item.getBoundingClientRect()).map(({ width, height }) => ({ width, height })));
  expect(explorerNavigationTargets.every((target) => target.width >= 44 && target.height >= 44)).toBe(true);

  await page.locator("[data-language-trigger]").click();
  const languageTargets = await page.locator("[data-language-menu] a").evaluateAll((items) =>
    items.map((item) => item.getBoundingClientRect().height),
  );
  expect(Math.min(...languageTargets)).toBeGreaterThanOrEqual(44);
  await page.keyboard.press("Escape");

  await page.locator("[data-command-trigger]").click();
  const commandTargets = await page.locator("[data-command-item]:visible").evaluateAll((items) =>
    items.map((item) => item.getBoundingClientRect().height),
  );
  expect(commandTargets.length).toBeGreaterThan(0);
  // Chromium can report a nominal 44 CSS px box as 43.999984 under parallel
  // layout. Round only the measurement residue; a real 43.99 px target still fails.
  const minimumCommandTarget = Math.round(Math.min(...commandTargets) * 1_000) / 1_000;
  expect(minimumCommandTarget).toBeGreaterThanOrEqual(44);
  await page.keyboard.press("Escape");

  await page.goto("/scenarios/lab.html?scenario=INT-02&state=normal&viewport=narrow&theme=dark&mode=present");
  await expect(page.locator("[data-lab-verification]")).toHaveAttribute("data-state", "pass");
  await expectNoHorizontalOverflow(page);
  await expectEmbeddedDocumentsNoHorizontalOverflow(page, "iframe[data-lab-frame]");
});

test("mobile Explorer controls and reference overlays stay reachable inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of ["/components/button/", "/components/command-menu/", "/components/authentication-dialog/"]) {
    await page.goto(path);
    const stage = page.locator("[data-reference-stage]");
    await expect(stage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
    for (const name of ["Light", "Dark", "Wide", "Narrow"]) {
      await expect(stage.getByRole("button", { name })).toBeVisible();
    }
    const controls = await stage.locator(".reference-stage__controls").evaluate((element) => {
      const root = document.documentElement;
      const bounds = element.getBoundingClientRect();
      return {
        bottom: bounds.bottom,
        clientWidth: root.clientWidth,
        right: bounds.right,
        scrollWidth: root.scrollWidth,
        top: bounds.top,
      };
    });
    expect(controls.scrollWidth).toBe(controls.clientWidth);
    expect(controls.right).toBeLessThanOrEqual(390);
    expect(controls.top).toBeGreaterThanOrEqual(0);
    expect(controls.bottom).toBeLessThanOrEqual(844);
  }

  await page.goto("/docs/");
  const compactSiteTargets = await page.locator(".button:visible, .demo-toolbar button:visible").evaluateAll((items) =>
    items.map((item) => item.getBoundingClientRect().height),
  );
  expect(compactSiteTargets.length).toBeGreaterThan(0);
  expect(Math.min(...compactSiteTargets)).toBeGreaterThanOrEqual(44);
  await page.locator("[data-command-trigger]").click();
  await expect(page.locator(".command-search input")).toHaveCSS("min-height", "44px");
  await page.keyboard.press("Escape");

  await page.goto("/examples/workspace-reference/core-components.html?lang=en");
  await expectNoHorizontalOverflow(page);
  const assertOverlayFits = async (trigger, overlay) => {
    await trigger.click();
    await expect(overlay).toBeVisible();
    const bounds = await overlay.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { bottom: rect.bottom, left: rect.left, right: rect.right, top: rect.top };
    });
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(390);
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.bottom).toBeLessThanOrEqual(844);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  };
  await assertOverlayFits(page.locator("[data-menu-trigger]"), page.locator(".sample-menu").first());
  await assertOverlayFits(page.locator("[data-popover-trigger]"), page.locator(".sample-popover"));

  await page.goto("/examples/workspace-reference/integrations.html?lang=en");
  await expectNoHorizontalOverflow(page);
  const sourceLinks = page.locator(".integration-section .reference-section-heading > a");
  await expect(sourceLinks.first()).toBeVisible();
  const sourceSizes = await sourceLinks.evaluateAll((links) => links.map((link) => {
    const box = link.getBoundingClientRect();
    return { height: box.height, width: box.width };
  }));
  expect(sourceSizes.every((size) => size.width >= 44 && size.height >= 44)).toBe(true);
});

test.describe("coarse-pointer explorer controls", () => {
  test.use({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  });

  test("remain at least 44px on touch-capable tablet viewports", async ({ page }) => {
    for (const path of ["/", "/components/", "/patterns/", "/scenarios/"]) {
      await page.goto(path);
      const headerTargets = await page
        .locator(
          "[data-command-trigger]:visible, [data-language-trigger]:visible, [data-theme-switch]:visible, [data-contrast-toggle]:visible",
        )
        .evaluateAll((items) =>
          items.map((item) => {
            const box = item.getBoundingClientRect();
            return { height: box.height, width: box.width };
          }),
        );
      expect(headerTargets.length, `${path} should expose public header controls`).toBeGreaterThan(0);
      expect(
        headerTargets.every((target) => target.width >= 44 && target.height >= 44),
        `${path} exposes a public header control below 44px: ${JSON.stringify(headerTargets)}`,
      ).toBe(true);
    }

    await page.goto("/components/");
    const galleryActions = await page
      .locator("[data-component-gallery] .component-gallery-card__header a")
      .evaluateAll((items) =>
        items.map((item) => {
          const box = item.getBoundingClientRect();
          return { height: box.height, width: box.width };
        }),
      );
    expect(galleryActions).toHaveLength(12);
    expect(galleryActions.every((target) => target.width >= 44 && target.height >= 44)).toBe(true);

    await page.goto("/components/evidence-list/");

    const targets = await page
      .locator(".stage-segmented button, .stage-state-readout, .component-studio__navigation nav a")
      .evaluateAll((items) =>
        items
          .filter((item) => !item.hidden)
          .map((item) => {
            const box = item.getBoundingClientRect();
            return {
              height: box.height,
              width: box.width,
              text: item.textContent.trim(),
            };
          }),
      );

    expect(targets.length).toBeGreaterThan(7);
    expect(targets.every((target) => target.height >= 44)).toBe(true);
    expect(
      targets
        .filter((target) => target.text === "" || ["Light", "Dark", "Wide", "Narrow"].includes(target.text))
        .every((target) => target.width >= 44),
    ).toBe(true);
    const navigationTargets = await page
      .locator(".component-studio__navigation nav a")
      .evaluateAll((items) => items.map((item) => item.getBoundingClientRect()).map(({ width, height }) => ({ width, height })));
    expect(navigationTargets.every((target) => target.width >= 44 && target.height >= 44)).toBe(true);

    await page.goto("/components/button/");
    await expect(page.locator("[data-reference-stage]")).toHaveAttribute("data-stage-ready", "true", {
      timeout: 10_000,
    });
    const buttonReference = page.frameLocator("[data-reference-stage] [data-stage-frame]");
    const buttonTargets = await buttonReference
      .locator(".kin-button:visible, .kin-icon-button:visible")
      .evaluateAll((items) =>
        items.map((item) => {
          const box = item.getBoundingClientRect();
          return {
            height: box.height,
            width: box.width,
            iconOnly: item.classList.contains("kin-icon-button"),
          };
        }),
      );
    expect(buttonTargets.length).toBeGreaterThanOrEqual(7);
    expect(buttonTargets.every((target) => target.height >= 44)).toBe(true);
    expect(buttonTargets.filter((target) => target.iconOnly).every((target) => target.width >= 44)).toBe(true);
  });

  test("shared references preserve the touch contract across product families", async ({ page }) => {
    const routes = [
      "/examples/workspace-reference/index.html?lang=zh-CN",
      "/examples/workspace-reference/states.html",
      "/examples/workspace-reference/core-components.html",
      "/examples/workspace-reference/advanced-components.html",
      "/examples/workspace-reference/motion.html",
      "/examples/workspace-reference/integrations.html",
      "/examples/product-patterns/information.html",
      "/examples/product-patterns/ecommerce.html",
      "/examples/product-patterns/canvas.html",
      "/examples/page-patterns/scheduling.html",
      "/examples/page-patterns/support.html",
    ];
    const controlSelector = [
      "button",
      "input",
      "select",
      "textarea",
      "summary",
      '[role="button"]',
      '[role="switch"]',
      '[role="tab"]',
      '[role="menuitem"]',
      '[role="menuitemradio"]',
      ".chart-point-hit",
    ].join(",");
    const navigationSelector = [
      ".brand-mark",
      ".primary-nav a",
      ".saved-views a",
      ".view-bar a",
      ".reference-back",
      ".info-brand",
      ".topic-nav a",
      ".commerce-nav > a",
      ".flow-brand",
      ".schedule-mobile-nav a",
    ].join(",");

    for (const route of routes) {
      await page.goto(route);
      const undersizedControls = await page.locator(controlSelector).evaluateAll((items) =>
        items.flatMap((item) => {
          const style = getComputedStyle(item);
          const bounds = item.getBoundingClientRect();
          if (
             item.hidden ||
             item.disabled ||
             item.classList.contains("visually-hidden") ||
             item.getAttribute("aria-disabled") === "true" ||
            style.display === "none" ||
            style.visibility === "hidden" ||
             style.pointerEvents === "none" ||
             bounds.width === 0 ||
             bounds.height === 0 ||
             item.closest("[inert], [aria-hidden=\"true\"]")
          ) {
            return [];
          }
          const target = item.matches('input[type="checkbox"], input[type="radio"]')
            ? item.closest("label") || item.parentElement || item
            : item;
          const targetBounds = target.getBoundingClientRect();
          if (targetBounds.width >= 44 && targetBounds.height >= 44) return [];
          return [{
            height: targetBounds.height,
            target: item.getAttribute("aria-label") || item.textContent?.trim() || item.tagName,
            width: targetBounds.width,
          }];
        }),
      );
      expect(
        undersizedControls,
        `${route} exposes a reference control below 44px: ${JSON.stringify(undersizedControls)}`,
      ).toEqual([]);

      const undersizedNavigation = await page.locator(navigationSelector).evaluateAll((items) =>
        items.flatMap((item) => {
          const style = getComputedStyle(item);
          const bounds = item.getBoundingClientRect();
          if (
            style.display === "none" ||
             style.visibility === "hidden" ||
             bounds.width === 0 ||
             bounds.height === 0 ||
             item.closest("[inert], [aria-hidden=\"true\"]")
          ) {
            return [];
          }
          if (bounds.width >= 44 && bounds.height >= 44) return [];
          return [{
            height: bounds.height,
            target: item.getAttribute("aria-label") || item.textContent?.trim() || item.tagName,
            width: bounds.width,
          }];
        }),
      );
      expect(
        undersizedNavigation,
        `${route} exposes a navigation target below 44px: ${JSON.stringify(undersizedNavigation)}`,
      ).toEqual([]);
    }
  });
});

test.describe("coarse-pointer standalone actions", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });

  test("keep a 44px hit area without becoming visually heavy", async ({ page }) => {
    const routes = [
      { path: "/", selector: ".showcase-text-action" },
      { path: "/components/evidence-list/", selector: ".back-link, .reference-stage__footer .stage-text-link" },
      { path: "/patterns/", selector: ".pattern-browser__heading .stage-text-link" },
      {
        path: "/scenarios/lab.html?scenario=INT-02&state=normal&viewport=narrow&theme=dark&mode=inspect&lang=zh-CN",
        selector: ".lab-brand, .lab-controls-close",
      },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      const targets = page.locator(route.selector);
      await expect(targets.first()).toBeVisible();
      const sizes = await targets.evaluateAll((items) =>
        items
          .filter((item) => {
            const style = getComputedStyle(item);
            return !item.hidden && style.display !== "none" && style.visibility !== "hidden";
          })
          .map((item) => {
            const box = item.getBoundingClientRect();
            return { height: box.height, text: item.textContent.trim(), width: box.width };
          }),
      );
      expect(sizes.length, `${route.path} should expose at least one visible standalone action`).toBeGreaterThan(0);
      expect(
        sizes.every((target) => target.width >= 44 && target.height >= 44),
        `${route.path} exposes a standalone action below 44px: ${JSON.stringify(sizes)}`,
      ).toBe(true);
    }
  });

  test("keeps reduced-scale Scenario Lab previews non-interactive on touch", async ({ page }) => {
    await page.goto("/scenarios/lab.html?scenario=INT-02&state=normal&viewport=wide&theme=dark&mode=present");
    await expect(page.locator("[data-lab-frame-shell]")).toHaveAttribute("data-reference-ready", "true");
    await expect(page.locator("[data-lab-frame-sizing]")).toHaveAttribute("data-sizing", "actual");

    await page.locator('[data-lab-sizing="fit"]').click();
    await expect(page.locator("[data-lab-frame-shell]")).toHaveAttribute("data-interaction-locked", "true");
    await expect(page.locator("[data-lab-frame]")).toHaveJSProperty("inert", true);
    await expect(page.locator("[data-lab-scale-readout]")).toContainText("preview only");

    await page.locator('[data-lab-sizing="actual"]').click();
    await expect(page.locator("[data-lab-frame-shell]")).toHaveAttribute("data-interaction-locked", "false");
    await expect(page.locator("[data-lab-frame]")).toHaveJSProperty("inert", false);
  });

  test("keeps Story Timeline markers touch-safe inside Component Explorer", async ({ page }) => {
    await page.goto("/components/story-timeline/");
    const markers = page.frameLocator(".reference-stage__viewport iframe").locator(".story-marker");
    await expect(markers.first()).toBeVisible();
    const sizes = await markers.evaluateAll((items) =>
      items.map((item) => {
        const bounds = item.getBoundingClientRect();
        return { height: bounds.height, width: bounds.width };
      }),
    );
    expect(sizes.length).toBe(5);
    expect(sizes.every((item) => item.width >= 44 && item.height >= 44)).toBe(true);
  });
});
