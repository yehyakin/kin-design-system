const root = document.documentElement;
const colorScheme = matchMedia("(prefers-color-scheme: dark)");
const compactLayout = matchMedia("(max-width: 780px)");
const themeColor = document.querySelector('meta[name="theme-color"]');
const themeButtons = [...document.querySelectorAll("[data-theme-value]")];
const contrastToggle = document.querySelector("[data-contrast-toggle]");
const navToggle = document.querySelector("[data-nav-toggle]");
const docsNav = document.querySelector(".docs-nav");
const commandDialog = document.querySelector("[data-command-dialog]");
const commandTrigger = document.querySelector("[data-command-trigger]");
const commandSearch = document.querySelector("[data-command-search]");
const commandItems = [...document.querySelectorAll("[data-command-item]")];
const commandEmpty = document.querySelector("[data-command-empty]");

function resolveTheme(preference) {
  return preference === "system" ? (colorScheme.matches ? "dark" : "light") : preference;
}

function applyTheme(preference, persist = true) {
  const resolved = resolveTheme(preference);
  root.dataset.themePreference = preference;
  root.dataset.theme = resolved;
  if (themeColor) themeColor.content = resolved === "dark" ? "#08090a" : "#f6f7f8";
  for (const button of themeButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.themeValue === preference));
  }
  if (persist) localStorage.setItem("kin-site-theme", preference);
}

function applyContrast(enabled, persist = true) {
  root.dataset.contrast = enabled ? "more" : "normal";
  contrastToggle?.setAttribute("aria-pressed", String(enabled));
  if (persist) localStorage.setItem("kin-site-contrast", enabled ? "more" : "normal");
}

for (const button of themeButtons) {
  button.addEventListener("click", () => applyTheme(button.dataset.themeValue));
}

contrastToggle?.addEventListener("click", () => applyContrast(root.dataset.contrast !== "more"));
colorScheme.addEventListener("change", () => {
  if (root.dataset.themePreference === "system") applyTheme("system", false);
});

addEventListener("storage", (event) => {
  if (event.key === "kin-site-theme") applyTheme(event.newValue || "system", false);
  if (event.key === "kin-site-contrast") applyContrast(event.newValue === "more", false);
});

function setNavigation(open) {
  document.body.classList.toggle("nav-open", open);
  navToggle?.setAttribute("aria-expanded", String(open));
  if (open) docsNav?.querySelector("a")?.focus();
  else navToggle?.focus();
}

navToggle?.addEventListener("click", () => setNavigation(!document.body.classList.contains("nav-open")));
docsNav?.addEventListener("click", (event) => {
  if (compactLayout.matches && event.target.closest("a")) setNavigation(false);
});
addEventListener("resize", () => {
  if (!compactLayout.matches) {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

for (const tablist of document.querySelectorAll("[data-pattern-tabs]")) {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
  const selectTab = (selected, moveFocus = true) => {
    for (const [index, tab] of tabs.entries()) {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    }
    if (moveFocus) selected.focus();
  };

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", () => selectTab(tab, false));
    tab.addEventListener("keydown", (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let targetIndex = index;
      if (event.key === "ArrowLeft") targetIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") targetIndex = (index + 1) % tabs.length;
      if (event.key === "Home") targetIndex = 0;
      if (event.key === "End") targetIndex = tabs.length - 1;
      selectTab(tabs[targetIndex]);
    });
  }
}

function openCommand() {
  if (!commandDialog?.open) {
    commandDialog?.showModal();
    commandSearch.value = "";
    filterCommands("");
    requestAnimationFrame(() => commandSearch?.focus());
  }
}

function closeCommand() {
  if (commandDialog?.open) commandDialog.close();
}

function filterCommands(query) {
  const normalized = query.trim().toLocaleLowerCase();
  let visible = 0;
  for (const item of commandItems) {
    const matches = !normalized || item.textContent.toLocaleLowerCase().includes(normalized);
    item.hidden = !matches;
    if (matches) visible += 1;
  }
  commandEmpty.hidden = visible > 0;
}

commandTrigger?.addEventListener("click", openCommand);
commandSearch?.addEventListener("input", () => filterCommands(commandSearch.value));
commandDialog?.addEventListener("click", (event) => {
  if (event.target === commandDialog) closeCommand();
});
commandDialog?.addEventListener("close", () => commandTrigger?.focus());
for (const item of commandItems) {
  item.addEventListener("click", () => closeCommand());
}

addEventListener("keydown", (event) => {
  const editable = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target.isContentEditable;
  if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
    event.preventDefault();
    openCommand();
  }
  if (event.key === "/" && !editable && !commandDialog?.open) {
    event.preventDefault();
    openCommand();
  }
  if (event.key === "Escape" && commandDialog?.open) {
    event.preventDefault();
    closeCommand();
  }
  if (event.key === "Escape" && document.body.classList.contains("nav-open")) setNavigation(false);
});

for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copy);
    const status = document.getElementById(button.getAttribute("aria-describedby"));
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      if (status) status.textContent = button.dataset.success;
    } catch {
      if (status) status.textContent = button.dataset.failure;
    }
  });
}

const observedSections = [...document.querySelectorAll("main section[id]")];
const navLinks = new Map([...document.querySelectorAll('.docs-nav a[href^="#"]')].map((link) => [link.hash.slice(1), link]));
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    for (const link of navLinks.values()) link.removeAttribute("aria-current");
    navLinks.get(visible.target.id)?.setAttribute("aria-current", "location");
  }, { rootMargin: "-18% 0px -70%", threshold: [0, 0.1, 0.5] });
  for (const section of observedSections) observer.observe(section);
}

applyTheme(root.dataset.themePreference || localStorage.getItem("kin-site-theme") || "system", false);
applyContrast(root.dataset.contrast === "more" || localStorage.getItem("kin-site-contrast") === "more", false);
