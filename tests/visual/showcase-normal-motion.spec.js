import { expect, test } from "@playwright/test";

async function transitionMilliseconds(locator) {
  return locator.evaluate((element) => {
    const values = getComputedStyle(element).transitionDuration.split(",").map((value) => value.trim());
    return Math.max(
      ...values.map((value) => (value.endsWith("ms") ? Number.parseFloat(value) : Number.parseFloat(value) * 1000)),
    );
  });
}

test("Showcase stages keep restrained normal motion and settle rapid replacement", async ({ page }) => {
  await page.goto("/");
  const homeStage = page.locator("[data-scenario-stage]");
  const homeFrame = homeStage.locator("iframe[data-stage-frame]");
  expect(await transitionMilliseconds(homeFrame)).toBeGreaterThanOrEqual(180);

  const tabs = homeStage.getByRole("tab");
  await tabs.nth(1).click();
  await tabs.nth(2).click();
  await tabs.nth(0).click();
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(homeStage.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "scenario-tab-investigation");
  await expect(homeStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator("[data-scenario-stage] iframe").locator("[data-investigation]")).toBeVisible();

  await page.goto("/components/");
  const browser = page.locator("[data-component-browser]");
  const componentStage = browser.locator("[data-reference-stage]");
  const choices = browser.locator("[data-component-choice]");
  expect(await transitionMilliseconds(componentStage.locator("iframe[data-stage-frame]"))).toBeGreaterThanOrEqual(160);

  await choices.nth(1).click();
  await choices.nth(2).click();
  await choices.nth(0).click();
  await expect(choices.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(componentStage).toHaveAttribute("data-ready-fragment", "state-reference");
  await expect(componentStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator("[data-component-browser] iframe").locator("#state-reference")).toBeVisible();

  await page.goto("/patterns/");
  const patternStage = page.locator('[data-pattern-id="information-site"] [data-reference-stage]');
  await patternStage.scrollIntoViewIfNeeded();
  expect(await transitionMilliseconds(patternStage.locator("iframe[data-stage-frame]"))).toBeGreaterThanOrEqual(160);
  await expect(patternStage).toHaveAttribute("data-stage-ready", "true", { timeout: 10_000 });
  await expect(page.frameLocator('[data-pattern-id="information-site"] iframe').locator("main.article h1")).toBeVisible();
});
