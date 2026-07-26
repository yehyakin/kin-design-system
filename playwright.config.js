import { defineConfig, devices } from "@playwright/test";

const externalBaseURL = process.env.KIN_SHOWCASE_BASE_URL;
const baseURL = externalBaseURL ?? "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/visual",
  outputDir: "./test-results/playwright",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["line"], ["html", { outputFolder: "playwright-report", open: "never" }]] : "line",
  use: {
    baseURL,
    colorScheme: "dark",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-reduced",
      testIgnore: [/normal-motion\.spec\.js/, /browser-smoke\.spec\.js/],
      use: {
        ...devices["Desktop Chrome"],
        reducedMotion: "reduce",
      },
    },
    {
      name: "chromium-normal-motion",
      testMatch: /normal-motion\.spec\.js/,
      use: {
        ...devices["Desktop Chrome"],
        reducedMotion: "no-preference",
      },
    },
    {
      name: "firefox-smoke",
      testMatch: /browser-smoke\.spec\.js/,
      use: {
        ...devices["Desktop Firefox"],
        reducedMotion: "reduce",
      },
    },
    {
      name: "webkit-smoke",
      testMatch: /browser-smoke\.spec\.js/,
      use: {
        ...devices["Desktop Safari"],
        reducedMotion: "reduce",
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: "npm run site:build && node scripts/serve-site.mjs",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
});
