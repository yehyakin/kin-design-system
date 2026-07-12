const media = matchMedia("(prefers-color-scheme: dark)");
const themeButtons = [...document.querySelectorAll("[data-theme-value]")];
const contrastButton = document.querySelector("[data-contrast-toggle]");
const canvasShell = document.querySelector(".canvas-shell");
const canvasPropertiesOpen = document.querySelector("[data-canvas-properties-open]");
const canvasPropertiesClose = document.querySelector("[data-canvas-properties-close]");

function applyTheme(preference, persist = true) {
  const theme = preference === "system" ? (media.matches ? "dark" : "light") : preference;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = preference;
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#08090a" : "#f6f7f8";
  for (const button of themeButtons) button.setAttribute("aria-pressed", String(button.dataset.themeValue === preference));
  if (persist) localStorage.setItem("kin-reference-theme", preference);
}

function applyContrast(enabled, persist = true) {
  document.documentElement.dataset.contrast = enabled ? "more" : "normal";
  contrastButton?.setAttribute("aria-pressed", String(enabled));
  if (persist) localStorage.setItem("kin-reference-contrast", enabled ? "more" : "normal");
}

for (const button of themeButtons) button.addEventListener("click", () => applyTheme(button.dataset.themeValue));
contrastButton?.addEventListener("click", () => applyContrast(document.documentElement.dataset.contrast !== "more"));
media.addEventListener("change", () => {
  if (document.documentElement.dataset.themePreference === "system") applyTheme("system", false);
});

addEventListener("storage", (event) => {
  if (event.key === "kin-reference-theme") applyTheme(event.newValue || "system", false);
  if (event.key === "kin-reference-contrast") applyContrast(event.newValue === "more", false);
});

for (const tool of document.querySelectorAll("[data-tool]")) {
  tool.addEventListener("click", () => {
    for (const item of document.querySelectorAll("[data-tool]")) item.setAttribute("aria-pressed", "false");
    tool.setAttribute("aria-pressed", "true");
  });
}

for (const object of document.querySelectorAll("[data-object]")) {
  object.addEventListener("click", () => {
    for (const item of document.querySelectorAll("[data-object]")) item.setAttribute("aria-pressed", "false");
    object.setAttribute("aria-pressed", "true");
  });
}

function setCanvasProperties(open) {
  if (!canvasShell || !canvasPropertiesOpen || !canvasPropertiesClose) return;
  canvasShell.classList.toggle("properties-open", open);
  canvasPropertiesOpen.setAttribute("aria-expanded", String(open));
  if (open) canvasPropertiesClose.focus();
  else canvasPropertiesOpen.focus();
}

canvasPropertiesOpen?.addEventListener("click", () => setCanvasProperties(true));
canvasPropertiesClose?.addEventListener("click", () => setCanvasProperties(false));
addEventListener("keydown", (event) => {
  if (event.key === "Escape" && canvasShell?.classList.contains("properties-open")) setCanvasProperties(false);
});

applyTheme(document.documentElement.dataset.themePreference || "system", false);
applyContrast(document.documentElement.dataset.contrast === "more", false);
