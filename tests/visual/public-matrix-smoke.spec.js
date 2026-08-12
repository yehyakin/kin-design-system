import { expect, test } from "@playwright/test";

import { SHOWCASE_GENERATED_PATHS } from "../../scripts/lib/showcase-pages.mjs";
import { SITE_COPY_ARTIFACTS } from "../../scripts/lib/site-artifacts.mjs";

const READY_TIMEOUT = 20_000;

const publicHtmlPaths = Object.freeze([
  ...SITE_COPY_ARTIFACTS
    .map(([, publicPath]) => publicPath)
    .filter((publicPath) => publicPath.endsWith(".html")),
  ...SHOWCASE_GENERATED_PATHS.filter((publicPath) => publicPath.endsWith(".html")),
]);

function publicUrlFromHtmlPath(repositoryPath) {
  const normalized = repositoryPath.replaceAll("\\", "/").replace(/^\/+/, "");
  if (normalized === "index.html") return "/";
  if (normalized.endsWith("/index.html")) return `/${normalized.slice(0, -"index.html".length)}`;
  return `/${normalized}`;
}

function canonicalRoute(predicate, label) {
  const path = publicHtmlPaths.find(predicate);
  if (!path) throw new Error(`Missing canonical public route for ${label}.`);
  return publicUrlFromHtmlPath(path);
}

function withQuery(route, query) {
  return `${route}${route.includes("?") ? "&" : "?"}${query}`;
}

const routes = Object.freeze({
  home: {
    desktop: canonicalRoute((path) => path === "index.html", "home"),
    mobile: canonicalRoute((path) => path === "zh/index.html", "Chinese home"),
    desktopLang: "en",
    mobileLang: "zh-CN",
  },
  components: {
    desktop: canonicalRoute((path) => path === "components/index.html", "Components landing"),
    mobile: canonicalRoute((path) => path === "zh/components/index.html", "Chinese Components landing"),
    desktopLang: "en",
    mobileLang: "zh-CN",
  },
  explorer: {
    desktop: canonicalRoute((path) => path === "components/app-shell/index.html", "Component Explorer"),
    mobile: canonicalRoute((path) => path === "zh/components/app-shell/index.html", "Chinese Component Explorer"),
    desktopLang: "en",
    mobileLang: "zh-CN",
  },
  patterns: {
    desktop: canonicalRoute((path) => path === "patterns/index.html", "Patterns"),
    mobile: canonicalRoute((path) => path === "zh/patterns/index.html", "Chinese Patterns"),
    desktopLang: "en",
    mobileLang: "zh-CN",
  },
  atlas: {
    desktop: canonicalRoute((path) => path === "scenarios/index.html", "Scenario Atlas"),
    mobile: withQuery(canonicalRoute((path) => path === "scenarios/index.html", "Scenario Atlas"), "lang=zh-CN"),
    desktopLang: "en",
    mobileLang: "zh-CN",
  },
  lab: {
    desktop: withQuery(
      canonicalRoute((path) => path === "scenarios/lab.html", "Scenario Lab"),
      "scenario=INT-02&state=normal&viewport=wide&theme=dark&mode=present",
    ),
    mobile: withQuery(
      canonicalRoute((path) => path === "scenarios/lab.html", "Scenario Lab"),
      "scenario=INT-02&state=normal&viewport=narrow&theme=dark&mode=present&lang=zh-CN",
    ),
    desktopLang: "en",
    mobileLang: "zh-CN",
  },
  docs: {
    desktop: canonicalRoute((path) => path === "docs/index.html", "Documentation"),
    mobile: canonicalRoute((path) => path === "zh/docs/index.html", "Chinese Documentation"),
    desktopLang: "en",
    mobileLang: "zh-CN",
  },
  workspace: {
    desktop: withQuery(
      canonicalRoute((path) => path === "examples/workspace-reference/index.html", "workspace reference"),
      "lang=en&view=investigation&state=normal",
    ),
    mobile: withQuery(
      canonicalRoute((path) => path === "examples/workspace-reference/index.html", "workspace reference"),
      "lang=zh-CN&view=investigation&state=normal",
    ),
    desktopLang: "en",
    mobileLang: "zh-CN",
  },
  productPattern: {
    desktop: canonicalRoute((path) => path === "examples/product-patterns/ecommerce.html", "product pattern"),
    mobile: canonicalRoute((path) => path === "examples/product-patterns/ecommerce.html", "product pattern"),
    desktopLang: "zh-CN",
    mobileLang: "zh-CN",
  },
  pagePattern: {
    desktop: withQuery(
      canonicalRoute((path) => path === "examples/page-patterns/access.html", "page pattern"),
      "lang=en",
    ),
    mobile: withQuery(
      canonicalRoute((path) => path === "examples/page-patterns/access.html", "page pattern"),
      "lang=zh-CN",
    ),
    desktopLang: "en",
    mobileLang: "zh-CN",
  },
});

async function clearPersistedPreferences(page) {
  if (page.url() === "about:blank") return;
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function expectNoPageOverflow(page, route) {
  await expect
    .poll(
      () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      { message: `${route} root overflow did not settle`, timeout: READY_TIMEOUT },
    )
    .toBe(true);
}

async function expectShell(page, route) {
  const shell = page.locator("header.showcase-header, header.global-header, body > header.site-header");
  for (let index = 0; index < (await shell.count()); index += 1) {
    const header = shell.nth(index);
    await expect(header, `${route} shell`).toBeVisible();
    const bounds = await header.boundingBox();
    const viewport = page.viewportSize();
    expect(bounds, `${route} shell has no geometry`).not.toBeNull();
    expect(bounds.x).toBeGreaterThanOrEqual(-1);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual((viewport?.width ?? 0) + 1);
    const nav = header.locator("nav").first();
    if (await nav.count()) {
      if (await nav.isVisible()) {
        const navBounds = await nav.boundingBox();
        expect(navBounds, `${route} shell nav has no geometry`).not.toBeNull();
        expect(navBounds.x + navBounds.width).toBeLessThanOrEqual((viewport?.width ?? 0) + 1);
      } else {
        await expect(header.locator("[data-nav-toggle]"), `${route} shell nav toggle`).toBeVisible();
      }
    }
  }
}

async function expectReadyFrames(page, route, selector, parentSelector = null, { focus = true } = {}) {
  const iframe = page.locator(selector);
  await expect(iframe, `${route} reference frame`).toHaveCount(1);
  const source = await iframe.getAttribute("src");
  const referencePath = await iframe.getAttribute("data-reference-path");
  expect(source || referencePath, `${route} reference frame has no source`).toBeTruthy();
  if (source) {
    await expect(iframe, `${route} reference frame src`).toHaveAttribute("src", /\S/u, {
      timeout: READY_TIMEOUT,
    });
  } else {
    await expect
      .poll(
        () => iframe.evaluate((element) => element.contentWindow?.location?.href ?? ""),
        { message: `${route} dynamic reference did not navigate`, timeout: READY_TIMEOUT },
      )
      .not.toMatch(/^about:blank(?:#.*)?$/u);
  }
  if (parentSelector) {
    await expect(page.locator(parentSelector), `${route} reference parent`).toHaveAttribute(
      "data-stage-ready",
      "true",
      { timeout: READY_TIMEOUT },
    );
  }
  await expect
    .poll(() => iframe.evaluate((element) => element.contentDocument?.readyState ?? ""), {
      message: `${route} reference frame did not finish loading`,
      timeout: READY_TIMEOUT,
    })
    .toBe("complete");
  await expect
    .poll(() => iframe.evaluate((element) => element.contentDocument?.documentElement?.clientWidth ?? 0), {
      message: `${route} reference frame has no document`,
      timeout: READY_TIMEOUT,
    })
    .toBeGreaterThan(0);

  const dimensions = await iframe.evaluate((element) => {
    const root = element.contentDocument?.documentElement;
    return { clientWidth: root?.clientWidth ?? 0, scrollWidth: root?.scrollWidth ?? 0 };
  });
  expect(
    dimensions.scrollWidth,
    `${route} reference frame has ${dimensions.scrollWidth - dimensions.clientWidth}px of overflow`,
  ).toBeLessThanOrEqual(dimensions.clientWidth);

  if (focus) {
    const frame = iframe.contentFrame();
    const focusable = frame.locator(
      'button:not([disabled]):visible, a[href]:visible, input:not([disabled]):visible, [tabindex]:not([tabindex="-1"]):visible',
    ).first();
    await expect(focusable, `${route} reference frame has no visible focus target`).toBeVisible();
    await focusable.focus();
    await expect(focusable, `${route} reference frame focus target`).toBeFocused();
  }
}

async function expectStageReadiness(page, route) {
  const stages = page.locator("[data-stage-ready]");
  for (let index = 0; index < (await stages.count()); index += 1) {
    await expect(stages.nth(index), `${route} stage ${index + 1}`).toHaveAttribute("data-stage-ready", "true", {
      timeout: READY_TIMEOUT,
    });
  }
  const labShell = page.locator("[data-lab-frame-shell]");
  if (await labShell.count()) {
    await expect(labShell, `${route} Lab frame shell`).toHaveAttribute("data-reference-ready", "true", {
      timeout: READY_TIMEOUT,
    });
  }
}

async function expectRepresentativeControls(page, family, route) {
  if (family === "home") {
    await expect(page.locator("[data-command-trigger]:visible, [data-nav-toggle]:visible, [data-theme-switch]:visible").first()).toBeVisible();
  } else if (family === "components") {
    await expect(page.locator('[data-component-choice][aria-selected="true"]')).toHaveCount(1);
  } else if (family === "explorer") {
    await expect(page.locator("[data-stage-theme], [data-stage-viewport]").first()).toBeVisible();
  } else if (family === "patterns") {
    await expect(page.locator('[data-pattern-choice][aria-selected="true"]')).toHaveCount(1);
  } else if (family === "atlas") {
    await expect(page.locator('a[href*="lab.html"]').first()).toBeVisible();
  } else if (family === "lab") {
    await expect(page.locator('[data-lab-verification][data-state="pass"]')).toBeVisible();
  } else if (family === "docs") {
    await expect(page.locator(".docs-nav:visible, [data-nav-toggle]:visible").first()).toBeVisible();
  } else if (family === "workspace") {
    await expect(page.locator("button, a[href]").first()).toBeVisible();
  } else if (family === "productPattern") {
    await expect(page.locator('[role="row"][aria-selected="true"]')).toBeVisible();
  } else if (family === "pagePattern") {
    await expect(page.locator("[data-language-trigger], [data-theme-switch]").first()).toBeVisible();
  } else {
    throw new Error(`No representative control contract for ${family} (${route}).`);
  }
}

async function checkRoute(page, family, route, expectedLanguage, viewportName, pageErrors) {
  pageErrors.length = 0;
  await clearPersistedPreferences(page);
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `${route} did not return a response`).not.toBeNull();
  expect(response.ok(), `${route} returned HTTP ${response.status()}`).toBe(true);
  expect(new URL(response.url()).origin, `${route} escaped the local site origin`).toBe(new URL(page.url()).origin);
  await page.waitForLoadState("load");
  await expect.poll(() => page.evaluate(() => document.readyState), {
    message: `${route} DOM did not finish loading`,
    timeout: READY_TIMEOUT,
  }).toBe("complete");
  await expect(page.locator("html"), `${route} language`).toHaveAttribute("lang", expectedLanguage);
  const shell = page.locator("header.showcase-header, header.global-header, body > header.site-header");
  if (await shell.count()) {
    await expect(page.locator("html"), `${route} site shell`).toHaveAttribute("data-site-ready", "true", {
      timeout: READY_TIMEOUT,
    });
  }
  await expectStageReadiness(page, route);
  await expectNoPageOverflow(page, route);
  await expectShell(page, route);
  await expectRepresentativeControls(page, family, route);

  if (family === "components") {
    await expectReadyFrames(page, route, "iframe[data-stage-frame]", "[data-component-workbench-stage]");
  } else if (family === "explorer") {
    await expectReadyFrames(page, route, "iframe[data-stage-frame]", "[data-reference-stage]");
  } else if (family === "patterns") {
    await expectReadyFrames(page, route, "iframe[data-stage-frame]", "[data-reference-stage]");
  } else if (family === "atlas") {
    await expectReadyFrames(page, route, "iframe[data-atlas-feature-frame]", null, { focus: false });
  } else if (family === "lab") {
    await expectReadyFrames(page, route, "iframe[data-lab-frame]", null);
  }

  expect(pageErrors, `${route} emitted uncaught browser errors`).toEqual([]);
  console.log(`[public-matrix-smoke] viewport=${viewportName} family=${family} route=${route}`);
}

test("representative public route families hold across Firefox and WebKit", async ({ page }) => {
  test.setTimeout(8 * 60_000);
  const pageErrors = [];
  let activeRoute = "about:blank";
  page.on("console", (message) => {
    if (message.type() === "error") pageErrors.push(`${activeRoute} console: ${message.text()}`);
  });
  page.on("pageerror", (error) => pageErrors.push(`${activeRoute} pageerror: ${error.message}`));
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // about:blank and opaque documents can reject storage access.
    }
  });
  const startedAt = Date.now();
  for (const viewport of [
    { name: "desktop-1600", width: 1600, height: 1000, key: "desktop" },
    { name: "mobile-390", width: 390, height: 844, key: "mobile" },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const [family, contract] of Object.entries(routes)) {
      activeRoute = contract[viewport.key];
      await checkRoute(
        page,
        family,
        contract[viewport.key],
        contract[`${viewport.key}Lang`],
        viewport.name,
        pageErrors,
      );
    }
  }
  console.log(`[public-matrix-smoke] routes=${Object.keys(routes).length * 2} duration_ms=${Date.now() - startedAt}`);
});
