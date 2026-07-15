const contrastButton = document.querySelector("[data-contrast-toggle]");
const commandDialog = document.querySelector(".command-dialog");
const commandOpen = document.querySelector("[data-command-open]");
const commandClose = document.querySelector("[data-command-close]");
const commandSearch = document.querySelector("#command-search");

function applyContrast(enabled, persist = true) {
  document.documentElement.dataset.contrast = enabled ? "more" : "normal";
  contrastButton.setAttribute("aria-pressed", String(enabled));
  if (persist) localStorage.setItem("kin-reference-contrast", enabled ? "more" : "normal");
}

contrastButton.addEventListener("click", () => applyContrast(document.documentElement.dataset.contrast !== "more"));

addEventListener("storage", (event) => {
  if (event.key === "kin-reference-contrast") applyContrast(event.newValue === "more", false);
});

commandOpen.addEventListener("click", () => {
  commandDialog.showModal();
  commandSearch.focus();
});
commandClose.addEventListener("click", () => commandDialog.close());
commandDialog.addEventListener("close", () => commandOpen.focus());

document.querySelector(".reference-form").addEventListener("submit", (event) => event.preventDefault());

applyContrast(document.documentElement.dataset.contrast === "more", false);
