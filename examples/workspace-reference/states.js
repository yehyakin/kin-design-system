const media = matchMedia("(prefers-color-scheme: dark)");
const themeButtons = [...document.querySelectorAll("[data-theme-value]")];
const contrastButton = document.querySelector("[data-contrast-toggle]");
const commandDialog = document.querySelector(".command-dialog");
const commandOpen = document.querySelector("[data-command-open]");
const commandClose = document.querySelector("[data-command-close]");
const commandSearch = document.querySelector("#command-search");

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
  contrastButton.setAttribute("aria-pressed", String(enabled));
  if (persist) localStorage.setItem("kin-reference-contrast", enabled ? "more" : "normal");
}

for (const button of themeButtons) button.addEventListener("click", () => applyTheme(button.dataset.themeValue));
contrastButton.addEventListener("click", () => applyContrast(document.documentElement.dataset.contrast !== "more"));
media.addEventListener("change", () => {
  if (document.documentElement.dataset.themePreference === "system") applyTheme("system", false);
});

addEventListener("storage", (event) => {
  if (event.key === "kin-reference-theme") applyTheme(event.newValue || "system", false);
  if (event.key === "kin-reference-contrast") applyContrast(event.newValue === "more", false);
});

commandOpen.addEventListener("click", () => {
  commandDialog.showModal();
  commandSearch.focus();
});
commandClose.addEventListener("click", () => commandDialog.close());
commandDialog.addEventListener("close", () => commandOpen.focus());

document.querySelector(".reference-form").addEventListener("submit", (event) => event.preventDefault());

applyTheme(document.documentElement.dataset.themePreference || "system", false);
applyContrast(document.documentElement.dataset.contrast === "more", false);
