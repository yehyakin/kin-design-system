import process from "node:process";

import { SHOWCASE_COMPONENT_IDS } from "./lib/showcase-pages.mjs";

const PUBLIC_ORIGIN = "https://yehyakin.github.io/kin-design-system/";

const LEGACY_HOME_FRAGMENTS = Object.freeze([
  "overview",
  "principles",
  "foundations",
  "components",
  "patterns",
  "ai-contract",
  "agents",
  "resources",
  "flows",
]);

const EXPLORER_ROUTES = SHOWCASE_COMPONENT_IDS.flatMap((id) => [
  {
    path: `components/${id}/`,
    lang: "en",
    canonical: `/components/${id}/`,
    alternate: `/zh/components/${id}/`,
  },
  {
    path: `zh/components/${id}/`,
    lang: "zh-CN",
    canonical: `/zh/components/${id}/`,
    alternate: `/components/${id}/`,
  },
]);

const ROUTES = Object.freeze([
  { path: "", lang: "en", canonical: "/" },
  { path: "zh/", lang: "zh-CN", canonical: "/zh/" },
  { path: "docs/", lang: "en", canonical: "/docs/" },
  { path: "zh/docs/", lang: "zh-CN", canonical: "/zh/docs/" },
  { path: "components/", lang: "en", canonical: "/components/" },
  { path: "zh/components/", lang: "zh-CN", canonical: "/zh/components/" },
  { path: "patterns/", lang: "en", canonical: "/patterns/" },
  { path: "zh/patterns/", lang: "zh-CN", canonical: "/zh/patterns/" },
  { path: "lab/", lang: "en", canonical: "/scenarios/lab.html" },
  { path: "scenarios/", lang: "en", canonical: "/scenarios/" },
  { path: "scenarios/lab.html?scenario=INT-02", lang: "en", canonical: "/scenarios/lab.html" },
  ...EXPLORER_ROUTES,
]);

const STATIC_ASSETS = Object.freeze([
  "assets/showcase.css",
  "assets/showcase.js",
  "assets/posters/int-02-normal-dark.png",
]);

function parseArguments(args) {
  let baseUrl = null;
  let attempts = 6;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--base-url" && args[index + 1]) baseUrl = args[++index];
    else if (args[index] === "--attempts" && args[index + 1]) attempts = Number(args[++index]);
    else throw new Error("Usage: node scripts/verify-showcase-responses.mjs --base-url <url> [--attempts N]");
  }
  if (!baseUrl) throw new Error("--base-url is required");
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10) {
    throw new Error("--attempts must be an integer from 1 to 10");
  }
  return { baseUrl: baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`, attempts };
}

function canonicalUrl(route) {
  return new URL(route.replace(/^\//u, ""), PUBLIC_ORIGIN).href;
}

async function inspectShowcase({ baseUrl }) {
  const failures = [];
  let checked = 0;

  for (const route of ROUTES) {
    const url = new URL(route.path, baseUrl);
    const response = await fetch(url);
    checked += 1;
    if (!response.ok) {
      failures.push(`${route.path || "/"}: expected a successful response, received ${response.status}`);
      continue;
    }
    const source = await response.text();
    if (route.lang && !new RegExp(`<html\\b[^>]*\\blang=["']${route.lang}["']`, "iu").test(source)) {
      failures.push(`${route.path || "/"}: expected html language ${route.lang}`);
    }
    const expectedCanonical = canonicalUrl(route.canonical);
    if (!source.includes(`<link rel="canonical" href="${expectedCanonical}">`)) {
      failures.push(`${route.path || "/"}: canonical URL does not match ${expectedCanonical}`);
    }
    if (route.alternate) {
      const expectedAlternate = canonicalUrl(route.alternate);
      const alternateLanguage = route.lang === "en" ? "zh-CN" : "en";
      if (!source.includes(`<link rel="alternate" hreflang="${alternateLanguage}" href="${expectedAlternate}">`)) {
        failures.push(`${route.path || "/"}: alternate ${alternateLanguage} URL does not match ${expectedAlternate}`);
      }
    }
    if (!/<title>[^<]+<\/title>/iu.test(source)) failures.push(`${route.path || "/"}: title is missing`);
    if (route.path === "" || route.path === "zh/") {
      for (const fragment of LEGACY_HOME_FRAGMENTS) {
        if (!new RegExp(`(?:^|[\\s<])id=["']${fragment}["']`, "u").test(source)) {
          failures.push(`${route.path || "/"}: legacy fragment #${fragment} is missing`);
        }
      }
      const proofCounts = [
        ...source.matchAll(/data-showcase-count=["'][^"']+["'][^>]*>([^<]*)</gu),
      ];
      if (
        proofCounts.length === 0
        || proofCounts.some((match) => !/^\s*\d+\s*$/u.test(match[1]))
      ) {
        failures.push(`${route.path || "/"}: a proof count is missing or unresolved`);
      }
    }
  }

  for (const asset of STATIC_ASSETS) {
    const response = await fetch(new URL(asset, baseUrl));
    checked += 1;
    if (!response.ok) failures.push(`${asset}: expected a successful response, received ${response.status}`);
  }

  const sitemapResponse = await fetch(new URL("sitemap.xml", baseUrl));
  checked += 1;
  if (!sitemapResponse.ok) {
    failures.push(`sitemap.xml: expected a successful response, received ${sitemapResponse.status}`);
  } else {
    const sitemap = await sitemapResponse.text();
    const sitemapRoutes = [
      "/docs/",
      "/zh/docs/",
      "/components/",
      "/zh/components/",
      "/patterns/",
      "/zh/patterns/",
      ...EXPLORER_ROUTES.map((route) => route.canonical),
    ];
    for (const route of sitemapRoutes) {
      const expected = canonicalUrl(route);
      if (!sitemap.includes(`<loc>${expected}</loc>`)) failures.push(`sitemap.xml: missing ${expected}`);
    }
  }

  return { checked, failures };
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

let result = null;
for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
  try {
    result = await inspectShowcase(options);
  } catch (error) {
    result = { checked: 0, failures: [`request failed: ${error.message}`] };
  }
  if (result.failures.length === 0) break;
  if (attempt < options.attempts) {
    const delay = Math.min(10_000, 1_000 * (2 ** (attempt - 1)));
    console.error(`Showcase response verification attempt ${attempt} failed; retrying in ${delay}ms.`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

if (result.failures.length > 0) {
  console.error(`Showcase response verification failed (${result.failures.length}):`);
  for (const failure of result.failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Showcase response verification passed: ${result.checked} public responses.`);
