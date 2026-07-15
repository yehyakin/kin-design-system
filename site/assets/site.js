import {
  Bell,
  BookOpen,
  Bot,
  Blocks,
  Check,
  CirclePlay,
  Code2,
  Contrast,
  Copy,
  createIcons,
  Database,
  Download,
  DraftingCompass,
  ExternalLink,
  FolderDown,
  Languages,
  LayoutDashboard,
  ListChecks,
  LogIn,
  Menu,
  MonitorCog,
  Moon,
  Palette,
  PanelsTopLeft,
  PanelRightOpen,
  Search,
  ShoppingBag,
  Sun,
  Terminal,
} from "lucide";

const root = document.documentElement;
const locale = root.lang === "zh-CN" ? "zh" : "en";
const colorScheme = matchMedia("(prefers-color-scheme: dark)");
const compactLayout = matchMedia("(max-width: 780px)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const themeColor = document.querySelector('meta[name="theme-color"]');
const themeSwitch = document.querySelector("[data-theme-switch]");
const systemThemeActions = [...document.querySelectorAll("[data-theme-system]")];
const contrastToggle = document.querySelector("[data-contrast-toggle]");
const navToggle = document.querySelector("[data-nav-toggle]");
const docsNav = document.querySelector(".docs-nav");
const languageControl = document.querySelector("[data-language-control]");
const languageTrigger = document.querySelector("[data-language-trigger]");
const languageMenu = document.querySelector("[data-language-menu]");
const commandDialog = document.querySelector("[data-command-dialog]");
const commandTrigger = document.querySelector("[data-command-trigger]");
const commandSearch = document.querySelector("[data-command-search]");
const commandItems = [...document.querySelectorAll("[data-command-item]")];
const commandEmpty = document.querySelector("[data-command-empty]");
let sonnerModulePromise;

function resolveTheme(preference) {
  return preference === "system" ? (colorScheme.matches ? "dark" : "light") : preference;
}

function normalizeThemePreference(preference) {
  return ["light", "dark", "system"].includes(preference) ? preference : "system";
}

function updateThemeSwitch(resolved, preference) {
  if (!themeSwitch) return;
  const dark = resolved === "dark";
  themeSwitch.setAttribute("aria-checked", String(dark));
  themeSwitch.dataset.preference = preference;
  themeSwitch.setAttribute("aria-label", locale === "zh"
    ? `${preference === "system" ? "当前跟随系统。" : ""}切换为${dark ? "日间" : "夜间"}模式`
    : `${preference === "system" ? "Following system. " : ""}Switch to ${dark ? "light" : "dark"} mode`);
}

function applyTheme(preference, persist = true) {
  const normalized = normalizeThemePreference(preference);
  const resolved = resolveTheme(normalized);
  root.dataset.themePreference = normalized;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  if (themeColor) themeColor.content = resolved === "dark" ? "#08090a" : "#f6f7f8";
  updateThemeSwitch(resolved, normalized);
  if (persist) localStorage.setItem("kin-site-theme", normalized);
  if (sonnerModulePromise) sonnerModulePromise.then((module) => module.updateToasterTheme(resolved, locale));
}

function applyContrast(enabled, persist = true) {
  root.dataset.contrast = enabled ? "more" : "normal";
  contrastToggle?.setAttribute("aria-pressed", String(enabled));
  if (persist) localStorage.setItem("kin-site-contrast", enabled ? "more" : "normal");
}

themeSwitch?.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark"));
for (const action of systemThemeActions) action.addEventListener("click", () => applyTheme("system"));
contrastToggle?.addEventListener("click", () => applyContrast(root.dataset.contrast !== "more"));
colorScheme.addEventListener("change", () => {
  if (root.dataset.themePreference === "system") applyTheme("system", false);
});

addEventListener("storage", (event) => {
  if (event.key === "kin-site-theme") applyTheme(event.newValue || "system", false);
  if (event.key === "kin-site-contrast") applyContrast(event.newValue === "more", false);
});

function setNavigation(open, moveFocus = true) {
  document.body.classList.toggle("nav-open", open);
  navToggle?.setAttribute("aria-expanded", String(open));
  if (!moveFocus) return;
  if (open) docsNav?.querySelector("a")?.focus();
  else navToggle?.focus();
}

navToggle?.addEventListener("click", () => setNavigation(!document.body.classList.contains("nav-open")));
docsNav?.addEventListener("click", (event) => {
  if (compactLayout.matches && event.target.closest("a")) setNavigation(false, false);
});
addEventListener("resize", () => {
  if (!compactLayout.matches) setNavigation(false, false);
});

let languageOpenFrame;
let languageCloseTimer;

function cancelLanguageMenuWork() {
  if (languageOpenFrame !== undefined) cancelAnimationFrame(languageOpenFrame);
  if (languageCloseTimer !== undefined) clearTimeout(languageCloseTimer);
  languageOpenFrame = undefined;
  languageCloseTimer = undefined;
}

function setLanguageMenu(open, moveFocus = true) {
  if (!languageMenu || !languageTrigger) return;
  cancelLanguageMenuWork();
  languageTrigger.setAttribute("aria-expanded", String(open));

  if (open) {
    languageMenu.hidden = false;
    languageMenu.inert = false;
    languageMenu.dataset.state = "opening";
    if (moveFocus) (languageMenu.querySelector('[aria-current="page"]') ?? languageMenu.querySelector('[role="menuitem"]'))?.focus();
    languageOpenFrame = requestAnimationFrame(() => {
      languageOpenFrame = undefined;
      if (languageMenu.dataset.state !== "opening") return;
      languageMenu.dataset.state = "open";
    });
    return;
  }

  if (languageMenu.hidden || languageMenu.dataset.state === "closed") {
    languageMenu.dataset.state = "closed";
    if (moveFocus) languageTrigger.focus();
    return;
  }

  languageMenu.inert = true;
  languageMenu.dataset.state = "closing";
  if (moveFocus) languageTrigger.focus();
  languageCloseTimer = window.setTimeout(() => {
    languageCloseTimer = undefined;
    if (languageMenu.dataset.state !== "closing") return;
    languageMenu.hidden = true;
    languageMenu.inert = false;
    languageMenu.dataset.state = "closed";
  }, reducedMotion.matches ? 90 : 180);
}

languageTrigger?.addEventListener("click", () => {
  const open = languageMenu?.dataset.state === "open" || languageMenu?.dataset.state === "opening";
  setLanguageMenu(!open);
});
document.addEventListener("click", (event) => {
  const open = languageMenu?.dataset.state === "open" || languageMenu?.dataset.state === "opening";
  if (open && !languageControl?.contains(event.target)) setLanguageMenu(false, false);
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
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
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

let commandOpenFrame;
let commandCloseTimer;

function cancelCommandWork() {
  if (commandOpenFrame !== undefined) cancelAnimationFrame(commandOpenFrame);
  if (commandCloseTimer !== undefined) clearTimeout(commandCloseTimer);
  commandOpenFrame = undefined;
  commandCloseTimer = undefined;
}

function openCommand(invocation = "pointer") {
  if (!commandDialog) return;
  cancelCommandWork();
  if (!commandDialog.open) commandDialog.showModal();
  commandDialog.inert = false;
  commandDialog.dataset.invocation = invocation;
  commandDialog.dataset.state = "opening";
  commandSearch.value = "";
  filterCommands("");
  commandSearch?.focus({ preventScroll: true });
  commandOpenFrame = requestAnimationFrame(() => {
    commandOpenFrame = undefined;
    if (commandDialog.dataset.state !== "opening") return;
    commandDialog.dataset.state = "open";
  });
}

function closeCommand() {
  if (!commandDialog?.open) return;
  cancelCommandWork();
  commandDialog.inert = true;
  commandDialog.dataset.state = "closing";
  commandCloseTimer = window.setTimeout(() => {
    commandCloseTimer = undefined;
    if (commandDialog.dataset.state !== "closing") return;
    commandDialog.close();
    commandDialog.inert = false;
    commandDialog.dataset.state = "closed";
    commandTrigger?.focus();
  }, reducedMotion.matches ? 90 : 210);
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

commandTrigger?.addEventListener("click", () => openCommand("pointer"));
commandSearch?.addEventListener("input", () => filterCommands(commandSearch.value));
commandDialog?.addEventListener("click", (event) => {
  if (event.target === commandDialog) closeCommand();
});
commandDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeCommand();
});
for (const item of commandItems) item.addEventListener("click", closeCommand);

addEventListener("keydown", (event) => {
  const editable = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target.isContentEditable;
  if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
    event.preventDefault();
    openCommand("keyboard");
  }
  if (event.key === "/" && !editable && !commandDialog?.open) {
    event.preventDefault();
    openCommand("keyboard");
  }
  if (event.key === "Escape" && commandDialog?.open) {
    event.preventDefault();
    closeCommand();
  } else if (event.key === "Escape" && !languageMenu?.hidden) {
    event.preventDefault();
    setLanguageMenu(false);
  } else if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
    setNavigation(false);
  }
});

async function showToast(trigger, overrides = {}) {
  sonnerModulePromise ??= import("./sonner-island.js");
  const module = await sonnerModulePromise;
  module.showKinToast({
    title: overrides.title || trigger.dataset.toastTitle,
    description: overrides.description || trigger.dataset.toastDescription,
    actionLabel: trigger.dataset.toastAction,
    undoTitle: trigger.dataset.toastUndo,
    theme: root.dataset.theme,
    locale,
  });
}

for (const trigger of document.querySelectorAll("[data-toast-title]")) {
  trigger.addEventListener("click", () => showToast(trigger));
}

for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copy);
    const status = document.getElementById(button.getAttribute("aria-describedby"));
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      if (status) status.textContent = button.dataset.success;
      await showToast(button, { title: button.dataset.success, description: button.dataset.toastDescription });
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

createIcons({
  icons: {
    Bell,
    BookOpen,
    Bot,
    Blocks,
    Check,
    CirclePlay,
    Code2,
    Contrast,
    Copy,
    Database,
    Download,
    DraftingCompass,
    ExternalLink,
    FolderDown,
    Languages,
    LayoutDashboard,
    ListChecks,
    LogIn,
    Menu,
    MonitorCog,
    Moon,
    Palette,
    PanelRightOpen,
    PanelsTopLeft,
    Search,
    ShoppingBag,
    Sun,
    Terminal,
  },
  attrs: { "aria-hidden": "true", "stroke-width": "1.5" },
});

document.documentElement.dataset.siteReady = "true";
