const media = matchMedia("(prefers-color-scheme: dark)");
const themeButtons = [...document.querySelectorAll("[data-theme-value]")];
const themeColor = document.querySelector('meta[name="theme-color"]');
const appShell = document.querySelector(".app-shell");
const inspector = document.querySelector(".inspector");
const inspectorOpen = document.querySelector("[data-inspector-open]");
const inspectorClose = document.querySelector("[data-inspector-close]");
const contrastToggle = document.querySelector("[data-contrast-toggle]");
const compactLayout = matchMedia("(max-width: 760px)");

function applyTheme(preference, persist = true) {
  const theme = preference === "system" ? (media.matches ? "dark" : "light") : preference;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = preference;
  themeColor.content = theme === "dark" ? "#08090a" : "#f6f7f8";
  for (const button of themeButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.themeValue === preference));
  }
  if (persist) localStorage.setItem("kin-reference-theme", preference);
}

for (const button of themeButtons) {
  button.addEventListener("click", () => applyTheme(button.dataset.themeValue));
}

media.addEventListener("change", () => {
  if (document.documentElement.dataset.themePreference === "system") applyTheme("system", false);
});

addEventListener("storage", (event) => {
  if (event.key === "kin-reference-theme") applyTheme(event.newValue || "system", false);
  if (event.key === "kin-reference-contrast") applyContrast(event.newValue === "more", false);
});

applyTheme(document.documentElement.dataset.themePreference || "system", false);

function applyContrast(enabled, persist = true) {
  document.documentElement.dataset.contrast = enabled ? "more" : "normal";
  contrastToggle.setAttribute("aria-pressed", String(enabled));
  if (persist) localStorage.setItem("kin-reference-contrast", enabled ? "more" : "normal");
}

contrastToggle.addEventListener("click", () => {
  applyContrast(document.documentElement.dataset.contrast !== "more");
});

applyContrast(localStorage.getItem("kin-reference-contrast") === "more", false);

function setInspector(open, moveFocus = true) {
  appShell.classList.toggle("inspector-closed", !open);
  appShell.classList.toggle("inspector-open", open);
  inspector.hidden = !open;
  inspectorOpen.setAttribute("aria-expanded", String(open));
  if (moveFocus) {
    if (open) inspector.querySelector("button").focus();
    else inspectorOpen.focus();
  }
}

inspectorOpen.addEventListener("click", () => setInspector(true));
inspectorClose.addEventListener("click", () => setInspector(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !inspector.hidden) setInspector(false);
});

compactLayout.addEventListener("change", (event) => setInspector(!event.matches, false));
setInspector(!compactLayout.matches, false);
