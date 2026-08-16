import { expect, test } from "@playwright/test";

import { SHOWCASE_GENERATED_PATHS } from "../../scripts/lib/showcase-pages.mjs";
import { SITE_COPY_ARTIFACTS } from "../../scripts/lib/site-artifacts.mjs";

const EXPECTED_PUBLIC_HTML_COUNT = 54;
const READY_TIMEOUT = 20_000;
const MATRIX_VIEWPORTS = Object.freeze([
  { name: "1600", width: 1600, height: 1000 },
  { name: "1280", width: 1280, height: 900 },
  { name: "390", width: 390, height: 844 },
]);

const copiedHtmlPaths = SITE_COPY_ARTIFACTS
  .map(([, publicPath]) => publicPath)
  .filter((publicPath) => publicPath.endsWith(".html"));
const generatedHtmlPaths = SHOWCASE_GENERATED_PATHS.filter((publicPath) => publicPath.endsWith(".html"));
const PUBLIC_HTML_PATHS = Object.freeze([...copiedHtmlPaths, ...generatedHtmlPaths]);
const PUBLIC_HTML_SET = new Set(PUBLIC_HTML_PATHS);

function publicUrlFromHtmlPath(repositoryPath) {
  const normalized = repositoryPath.replaceAll("\\", "/").replace(/^\/+/, "");
  if (normalized === "index.html") return "/";
  if (normalized.endsWith("/index.html")) return `/${normalized.slice(0, -"index.html".length)}`;
  return `/${normalized}`;
}

const PUBLIC_ROUTES = Object.freeze(PUBLIC_HTML_PATHS.map(publicUrlFromHtmlPath));

const ACTIVE_SELECTION_SELECTOR = [
  "nav [aria-current]",
  '[role="tab"][aria-selected="true"]',
  '[role="option"][aria-selected="true"]',
  '[role="row"][aria-selected="true"]',
  '[role="treeitem"][aria-selected="true"]',
  '[data-tool-toggle][aria-pressed="true"]',
].join(",");

function expectedLanguageFor(route) {
  const url = new URL(route, "http://kin-showcase.test");
  if (/^\/zh(?:\/|$)/u.test(url.pathname)) return { exact: "zh-CN" };
  if (url.searchParams.get("lang") === "zh-CN") return { exact: "zh-CN" };
  if (url.searchParams.get("lang") === "en") return { exact: "en" };
  if (url.pathname.startsWith("/examples/")) return { oneOf: ["en", "zh-CN"] };
  return { exact: "en" };
}

async function clearPersistedPreferences(page) {
  if (page.url() === "about:blank") return;
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function expectNoPageOverflow(page, route, label = "page") {
  await expect
    .poll(
      () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      { message: `${route} ${label} dimensions did not settle`, timeout: READY_TIMEOUT },
    )
    .toBe(true);
}

async function expectShellVisibleAndUnclipped(page, route) {
  const shell = page.locator("header.showcase-header, header.global-header, body > header.site-header");
  const shellCount = await shell.count();
  for (let index = 0; index < shellCount; index += 1) {
    const header = shell.nth(index);
    await expect(header, `${route} shell header ${index + 1}`).toBeVisible();
    const bounds = await header.boundingBox();
    expect(bounds, `${route} shell header ${index + 1} has no geometry`).not.toBeNull();
    const viewport = page.viewportSize();
    expect(bounds.width, `${route} shell header ${index + 1} has no width`).toBeGreaterThan(0);
    expect(bounds.x, `${route} shell header ${index + 1} starts outside viewport`).toBeGreaterThanOrEqual(-1);
    expect(
      bounds.x + bounds.width,
      `${route} shell header ${index + 1} is clipped by the viewport`,
    ).toBeLessThanOrEqual((viewport?.width ?? 0) + 1);
    expect(bounds.y, `${route} shell header ${index + 1} is clipped at startup`).toBeGreaterThanOrEqual(-1);

    const navigation = header.locator("nav").first();
    if (await navigation.count()) {
      if (await navigation.isVisible()) {
        const navigationBounds = await navigation.boundingBox();
        expect(navigationBounds, `${route} shell navigation has no geometry`).not.toBeNull();
        expect(
          navigationBounds.x + navigationBounds.width,
          `${route} shell navigation is clipped by the viewport`,
        ).toBeLessThanOrEqual((viewport?.width ?? 0) + 1);
      } else {
        const navigationToggle = header.locator("[data-nav-toggle]");
        await expect(
          navigationToggle,
          `${route} hides shell navigation without a visible navigation control`,
        ).toBeVisible();
      }
    }
  }
}

async function expectHtmlLanguage(page, route) {
  const language = await page.locator("html").getAttribute("lang");
  const expectation = expectedLanguageFor(route);
  if (expectation.exact) {
    expect(language, `${route} has an unexpected html language`).toBe(expectation.exact);
  } else {
    expect(expectation.oneOf, `${route} has no language contract`).toContain(language);
  }
}

async function expectStageReadiness(page, route) {
  const stages = page.locator("[data-stage-ready]");
  for (let index = 0; index < (await stages.count()); index += 1) {
    await expect(stages.nth(index), `${route} stage ${index + 1}`).toHaveAttribute(
      "data-stage-ready",
      "true",
      { timeout: READY_TIMEOUT },
    );
  }

  const labShells = page.locator("[data-lab-frame-shell]");
  for (let index = 0; index < (await labShells.count()); index += 1) {
    await expect(labShells.nth(index), `${route} Lab frame ${index + 1}`).toHaveAttribute(
      "data-reference-ready",
      "true",
      { timeout: READY_TIMEOUT },
    );
  }
}

async function expectEmbeddedFramesReadyAndFitting(page, route) {
  const frames = page.locator("iframe");
  for (let index = 0; index < (await frames.count()); index += 1) {
    const frame = frames.nth(index);
    const label = `${route} iframe ${index + 1}`;
    const source = await frame.getAttribute("src");
    const referencePath = await frame.getAttribute("data-reference-path");
    if (!source && !referencePath) continue;
    if (source) {
      await expect(frame, label).toHaveAttribute("src", /\S/u, { timeout: READY_TIMEOUT });
    } else {
      await expect
        .poll(
          () => frame.evaluate((element) => element.contentWindow?.location?.href ?? ""),
          { message: `${label} dynamic reference did not navigate`, timeout: READY_TIMEOUT },
        )
        .not.toMatch(/^about:blank(?:#.*)?$/u);
    }
    await expect
      .poll(
        () => frame.evaluate((element) => element.contentDocument?.readyState ?? ""),
        { message: `${label} did not reach a complete readyState`, timeout: READY_TIMEOUT },
      )
      .toBe("complete");
    await expect
      .poll(
        () => frame.evaluate((element) => element.contentDocument?.documentElement?.clientWidth ?? 0),
        { message: `${label} has no loaded document`, timeout: READY_TIMEOUT },
      )
      .toBeGreaterThan(0);

    const dimensions = await frame.evaluate((element) => {
      const root = element.contentDocument?.documentElement;
      return {
        clientWidth: root?.clientWidth ?? 0,
        scrollWidth: root?.scrollWidth ?? 0,
      };
    });
    expect(
      dimensions.scrollWidth,
      `${label} has ${dimensions.scrollWidth - dimensions.clientWidth}px of horizontal overflow`,
    ).toBeLessThanOrEqual(dimensions.clientWidth);
  }
}

async function collectAccentStripFindings(frame) {
  return frame.evaluate((selector) => {
    const parseChannels = (value) => {
      const match = value.match(/(?:rgb|rgba)\(([^)]+)\)/iu);
      if (!match) return null;
      const channels = match[1].match(/[-\d.]+/gu)?.map(Number) ?? [];
      return channels.length >= 3 ? channels.slice(0, 3).join(",") : null;
    };
    const colorMatches = (value, channels) => parseChannels(value) === channels;
    const accentChannels = (() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--accent)";
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return parseChannels(color);
    })();
    if (!accentChannels) return [];

    const hasAccentInsetStrip = (element) => {
      const style = getComputedStyle(element);
      const shadow = style.boxShadow;
      if (shadow === "none" || !/\binset\b/iu.test(shadow)) return false;
      const accentShadow = [...shadow.matchAll(/(?:rgb|rgba)\([^)]+\)/giu)].some((match) =>
        colorMatches(match[0], accentChannels),
      );
      if (!accentShadow) return false;
      const offsets = shadow.match(/\binset\s+(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+(-?[\d.]+)px)?(?:\s+(-?[\d.]+)px)?/iu);
      if (!offsets) return false;
      return offsets.slice(1).some((value) => Math.abs(Number(value ?? 0)) >= 2);
    };

    const hasAccentBorder = (element) => {
      const style = getComputedStyle(element);
      return Number.parseFloat(style.borderLeftWidth) >= 2 && colorMatches(style.borderLeftColor, accentChannels);
    };

    const isAllowedDecisionEdge = (element) => Boolean(element.closest("[data-decision-edge]"));

    return [...document.querySelectorAll(selector)].flatMap((element) => {
      if (element.matches(":focus, :focus-visible") || isAllowedDecisionEdge(element)) return [];
      const findings = [];
      if (hasAccentInsetStrip(element)) findings.push("accent inset shadow");
      if (hasAccentBorder(element)) findings.push("accent border-left");
      for (const pseudo of ["::before", "::after"]) {
        const style = getComputedStyle(element, pseudo);
        const bounds = element.getBoundingClientRect();
        const pseudoWidth = Number.parseFloat(style.width);
        const pseudoHeight = Number.parseFloat(style.height);
        const left = Number.parseFloat(style.left);
        if (
          style.display !== "none" &&
          colorMatches(style.backgroundColor, accentChannels) &&
          pseudoWidth >= 2 &&
          pseudoWidth <= 4 &&
          pseudoHeight >= bounds.height * 0.8 &&
          Number.isFinite(left) &&
          left <= 1
        ) {
          findings.push(`${pseudo} accent strip`);
        }
      }
      if (findings.length === 0) return [];
      const role = element.getAttribute("role");
      const current = element.getAttribute("aria-current");
      const selected = element.getAttribute("aria-selected");
      const identity = element.id ? `#${element.id}` : "";
      const classes = [...element.classList].map((name) => `.${name}`).join("");
      return [{
        selector: `${element.tagName.toLowerCase()}${identity}${classes}`,
        role,
        current,
        selected,
        findings,
      }];
    });
  }, ACTIVE_SELECTION_SELECTOR);
}

async function expectNoAccentSelectionStrips(page, route) {
  for (const frame of page.frames()) {
    if (frame.url() === "about:blank") continue;
    let findings;
    try {
      findings = await collectAccentStripFindings(frame);
    } catch {
      continue;
    }
    expect(
      findings,
      `${route} active selection uses a static accent strip in ${frame.url()}: ${JSON.stringify(findings)}`,
    ).toEqual([]);
  }
}

async function visitAndCheckRoute(page, route, viewport, pageErrors) {
  pageErrors.length = 0;
  await clearPersistedPreferences(page);
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `${route} did not return a response`).not.toBeNull();
  expect(response.ok(), `${route} returned HTTP ${response.status()}`).toBe(true);
  expect(new URL(response.url()).origin, `${route} escaped the local site origin`).toBe(new URL(page.url()).origin);
  await page.waitForLoadState("load");
  await expect
    .poll(() => page.evaluate(() => document.readyState), {
      message: `${route} DOM did not finish loading`,
      timeout: READY_TIMEOUT,
    })
    .toBe("complete");
  await expectHtmlLanguage(page, route);

  const shell = page.locator("header.showcase-header, header.global-header, body > header.site-header");
  if (await shell.count()) {
    await expect(page.locator("html"), `${route} site shell`).toHaveAttribute("data-site-ready", "true", {
      timeout: READY_TIMEOUT,
    });
  }
  await expectStageReadiness(page, route);
  await expectEmbeddedFramesReadyAndFitting(page, route);
  await expectShellVisibleAndUnclipped(page, route);
  await expectNoPageOverflow(page, route);
  await expectNoAccentSelectionStrips(page, route);
  expect(pageErrors, `${route} emitted uncaught browser errors`).toEqual([]);

  return { width: viewport.width, route };
}

test("canonical public HTML manifest is unique and complete", () => {
  expect(PUBLIC_HTML_PATHS).toHaveLength(EXPECTED_PUBLIC_HTML_COUNT);
  expect(PUBLIC_HTML_SET.size).toBe(PUBLIC_HTML_PATHS.length);
  expect(PUBLIC_HTML_PATHS.every((path) => path.endsWith(".html"))).toBe(true);
  expect(PUBLIC_ROUTES).toHaveLength(EXPECTED_PUBLIC_HTML_COUNT);
  expect(PUBLIC_ROUTES.every((route) => route.startsWith("/"))).toBe(true);
  expect(PUBLIC_ROUTES).toContain("/");
  expect(PUBLIC_ROUTES).toContain("/components/");
  expect(PUBLIC_ROUTES).toContain("/zh/components/");
});

for (const viewport of MATRIX_VIEWPORTS) {
  test(`all canonical public HTML routes fit at ${viewport.name}px`, async ({ page }) => {
    test.setTimeout(12 * 60_000);
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
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const startedAt = Date.now();
    for (const route of PUBLIC_ROUTES) {
      activeRoute = route;
      await visitAndCheckRoute(page, route, viewport, pageErrors);
    }
    console.log(
      `[public-matrix] viewport=${viewport.name} routes=${PUBLIC_ROUTES.length} duration_ms=${Date.now() - startedAt}`,
    );
  });
}
