import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BookOpenText,
  Bot,
  Blocks,
  BoxSelect,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  CircleDot,
  CirclePlay,
  Code2,
  Command,
  Contrast,
  Copy,
  createIcons,
  Database,
  Download,
  DraftingCompass,
  ExternalLink,
  Focus,
  FolderDown,
  GitCompareArrows,
  Info,
  Languages,
  LayoutDashboard,
  ListChecks,
  ListRestart,
  ListTree,
  LockKeyhole,
  LogIn,
  Menu,
  Monitor,
  MonitorCog,
  MousePointerClick,
  Moon,
  PackageCheck,
  Palette,
  PanelsTopLeft,
  PanelRightOpen,
  Search,
  ScanEye,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sun,
  Table2,
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
const globalNavToggle = document.querySelector("[data-nav-toggle]");
const globalNav = document.querySelector("[data-mobile-nav]");
const localNavToggle = document.querySelector("[data-local-nav-toggle]");
const localNav = document.querySelector("[data-local-nav]");
const docsMain = document.querySelector("[data-showcase-main], .docs-main, .showcase-main");
const navigationBackgrounds = [...document.querySelectorAll("[data-nav-background]")];
const siteHeader = document.querySelector(".site-header, .showcase-header");
const skipLink = document.querySelector(".skip-link");
const languageControl = document.querySelector("[data-language-control]");
const languageTrigger = document.querySelector("[data-language-trigger]");
const languageMenu = document.querySelector("[data-language-menu]");
const preferencesRoot = document.querySelector("[data-preferences-root]");
const preferencesTrigger = document.querySelector("[data-preferences-trigger]");
const preferencesPanel = document.querySelector("[data-preferences-panel]");
const preferencesClose = document.querySelector("[data-preferences-close]");
const preferencesScrim = document.querySelector("[data-preferences-scrim]");
const commandDialog = document.querySelector("[data-command-dialog]");
const commandTrigger = document.querySelector("[data-command-trigger]");
const commandSearch = document.querySelector("[data-command-search]");
const commandItems = [...document.querySelectorAll("[data-command-item]")];
const commandEmpty = document.querySelector("[data-command-empty]");
let sonnerModulePromise;
let navCloseTimer;
let navCloseTransition;
let activeNavigationDrawer;
let preferencesCloseTimer;
let preferencesReturnFocus;

const navigationDrawers = [
  { trigger: globalNavToggle, panel: globalNav },
  { trigger: localNavToggle, panel: localNav },
].filter(({ trigger, panel }) => trigger && panel);
const navScrim = navigationDrawers.length > 0 ? document.createElement("div") : null;
if (navScrim) {
  navScrim.className = "nav-scrim";
  navScrim.setAttribute("aria-hidden", "true");
  document.body.append(navScrim);
}

function syncLanguageFragment() {
  if (!languageMenu) return;
  let fragment = "";
  if (location.hash.length > 1) {
    try {
      const id = decodeURIComponent(location.hash.slice(1));
      if (document.getElementById(id)) fragment = location.hash;
    } catch {}
  }

  for (const link of languageMenu.querySelectorAll('a[hreflang], a[role="menuitem"]')) {
    link.dataset.localeBaseHref ??= link.getAttribute("href");
    const base = link.dataset.localeBaseHref.split("#", 1)[0];
    link.setAttribute("href", `${base}${fragment}`);
  }
}

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

function setNavigationBackgroundInert(inert, drawer = activeNavigationDrawer) {
  if (docsMain) docsMain.inert = inert;
  for (const element of navigationBackgrounds) element.inert = inert;
  if (skipLink) skipLink.inert = inert;
  if (localNavToggle && localNavToggle !== drawer?.trigger) localNavToggle.inert = inert;
  if (siteHeader) {
    for (const child of siteHeader.children) {
      if (navigationDrawers.some(({ panel }) => panel === child)) continue;
      if (child === drawer?.trigger || child.contains(drawer?.trigger)) {
        for (const descendant of child.children) {
          if (descendant !== drawer.trigger && !descendant.contains(drawer.trigger)) {
            descendant.inert = inert;
            if (descendant === preferencesRoot || descendant.contains(preferencesRoot)) {
              if (preferencesTrigger) preferencesTrigger.inert = inert;
              if (preferencesPanel) preferencesPanel.inert = compactLayout.matches && preferencesState() !== "open";
            }
          }
        }
      } else {
        child.inert = inert;
      }
    }
  }
}

function preferencesState() {
  return preferencesPanel?.dataset.state || "closed";
}

function preferencesAreOpen() {
  return preferencesState() === "open";
}

function setPreferencesBackgroundInert(inert) {
  if (!preferencesPanel) return;
  if (docsMain) docsMain.inert = inert;
  for (const element of navigationBackgrounds) element.inert = inert;
  if (skipLink) skipLink.inert = inert;
  if (siteHeader) {
    for (const child of siteHeader.children) {
      const containsPreferences = child === preferencesRoot || child.contains(preferencesRoot);
      if (!containsPreferences) {
        child.inert = inert;
        continue;
      }
      child.inert = false;
      for (const descendant of child.children) {
        const keepsPreferences = descendant === preferencesRoot || descendant.contains(preferencesRoot);
        if (!keepsPreferences) {
          descendant.inert = inert;
          continue;
        }
        descendant.inert = false;
        if (descendant === preferencesRoot) {
          if (preferencesTrigger) preferencesTrigger.inert = inert;
          preferencesPanel.inert = compactLayout.matches && preferencesState() !== "open";
        } else {
          for (const nested of descendant.children) {
            if (nested === preferencesRoot || nested.contains(preferencesRoot)) continue;
            nested.inert = inert;
          }
        }
      }
    }
  }
}

function preferenceFocusable() {
  if (!preferencesPanel) return [];
  return [
    preferencesClose,
    ...preferencesPanel.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
  ].filter((element, index, list) => {
    if (!element || list.indexOf(element) !== index || element.disabled || element.hidden || element.inert) return false;
    if (element.closest("[hidden], [inert]")) return false;
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
  });
}

function finishPreferencesClose() {
  if (!preferencesPanel || preferencesState() !== "closing") return;
  clearTimeout(preferencesCloseTimer);
  preferencesCloseTimer = undefined;
  preferencesPanel.dataset.state = "closed";
  preferencesPanel.inert = true;
  preferencesPanel.setAttribute("aria-hidden", "true");
  preferencesPanel.removeAttribute("role");
  preferencesPanel.removeAttribute("aria-modal");
  preferencesScrim?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("preferences-open");
  if (document.body.dataset.overlayOwner === "preferences") delete document.body.dataset.overlayOwner;
  setPreferencesBackgroundInert(false);
  if (preferencesFocusOnClose) {
    preferencesFocusOnClose = false;
    const target = preferencesReturnFocus?.isConnected ? preferencesReturnFocus : preferencesTrigger;
    preferencesReturnFocus = undefined;
    target?.focus({ preventScroll: true });
  }
}

let preferencesFocusOnClose = false;

function setPreferences(open, { moveFocus = true, returnTarget, immediate = false } = {}) {
  if (!preferencesPanel || !preferencesTrigger || (!compactLayout.matches && open)) return;
  clearTimeout(preferencesCloseTimer);
  preferencesCloseTimer = undefined;

  if (open) {
    document.dispatchEvent(new CustomEvent("kin:overlay-will-open", { detail: { overlay: "preferences" } }));
    preferencesReturnFocus = returnTarget || preferencesTrigger;
    preferencesFocusOnClose = false;
    preferencesTrigger.setAttribute("aria-expanded", "true");
    preferencesPanel.dataset.state = "open";
    preferencesPanel.inert = false;
    preferencesPanel.removeAttribute("aria-hidden");
    preferencesPanel.setAttribute("role", "dialog");
    preferencesPanel.setAttribute("aria-modal", "true");
    preferencesScrim?.setAttribute("aria-hidden", "false");
    document.body.classList.add("preferences-open");
    document.body.dataset.overlayOwner = "preferences";
    setPreferencesBackgroundInert(true);
    if (moveFocus) preferencesClose?.focus({ preventScroll: true });
    return;
  }

  if (preferencesState() === "closed") return;
  closeLanguageMenuImmediately();
  preferencesFocusOnClose ||= moveFocus;
  preferencesTrigger.setAttribute("aria-expanded", "false");
  preferencesPanel.dataset.state = "closing";
  const duration = immediate || reducedMotion.matches ? 0 : 240;
  if (duration === 0) {
    finishPreferencesClose();
    return;
  }
  preferencesCloseTimer = window.setTimeout(finishPreferencesClose, duration);
}

function closeLanguageMenuImmediately() {
  if (!languageMenu || !languageTrigger) return;
  cancelLanguageMenuWork();
  languageMenu.hidden = true;
  languageMenu.inert = false;
  languageMenu.dataset.state = "closed";
  delete languageMenu.dataset.invocation;
  languageTrigger.setAttribute("aria-expanded", "false");
}

function cancelNavigationCloseWait() {
  if (navCloseTimer !== undefined) window.clearTimeout(navCloseTimer);
  navCloseTimer = undefined;
  if (navCloseTransition) {
    navCloseTransition.panel.removeEventListener("transitionend", navCloseTransition.handler);
    navCloseTransition = undefined;
  }
}

function finishNavigationClose(drawer) {
  cancelNavigationCloseWait();
  document.body.classList.remove("nav-closing");
  drawer.panel.dataset.drawerState = "closed";
  setNavigationBackgroundInert(false, drawer);
  if (document.body.dataset.overlayOwner === "navigation") delete document.body.dataset.overlayOwner;
}

function navigationLabel(drawer, open) {
  const key = open ? "closeLabel" : "openLabel";
  if (drawer.trigger.dataset[key]) return drawer.trigger.dataset[key];
  return locale === "zh" ? `${open ? "关闭" : "打开"}导航` : `${open ? "Close" : "Open"} navigation`;
}

function setNavigation(drawer, open, moveFocus = true, immediate = false) {
  if (!drawer) return;
  cancelNavigationCloseWait();
  drawer.trigger.setAttribute("aria-expanded", String(open));
  drawer.trigger.setAttribute("aria-label", navigationLabel(drawer, open));

  if (open) {
    document.dispatchEvent(new CustomEvent("kin:overlay-will-open", { detail: { overlay: "navigation" } }));
    if (activeNavigationDrawer && activeNavigationDrawer !== drawer) {
      setNavigation(activeNavigationDrawer, false, false, true);
    }
    activeNavigationDrawer = drawer;
    document.body.classList.remove("nav-closing");
    document.body.classList.add("nav-open");
    document.body.dataset.overlayOwner = "navigation";
    drawer.panel.dataset.drawerState = "open";
    setNavigationBackgroundInert(true, drawer);
    drawer.panel.inert = false;
    drawer.panel.removeAttribute("aria-hidden");
    drawer.panel.setAttribute("role", "dialog");
    drawer.panel.setAttribute("aria-modal", "true");
    drawer.trigger.inert = false;
    if (moveFocus) drawer.panel.querySelector("a, button:not([disabled])")?.focus();
    return;
  }

  const wasOpen = activeNavigationDrawer === drawer && document.body.classList.contains("nav-open");
  document.body.classList.remove("nav-open");
  if (activeNavigationDrawer === drawer) activeNavigationDrawer = undefined;
  drawer.panel.inert = compactLayout.matches;
  if (compactLayout.matches) drawer.panel.setAttribute("aria-hidden", "true");
  else drawer.panel.removeAttribute("aria-hidden");
  drawer.panel.removeAttribute("role");
  drawer.panel.removeAttribute("aria-modal");
  if (moveFocus && wasOpen) drawer.trigger.focus();

  if (!wasOpen || !compactLayout.matches || immediate || reducedMotion.matches) {
    finishNavigationClose(drawer);
    return;
  }

  document.body.classList.add("nav-closing");
  drawer.panel.dataset.drawerState = "closing";
  const handleTransitionEnd = (event) => {
    if (event.target !== drawer.panel || event.propertyName !== "transform") return;
    finishNavigationClose(drawer);
  };
  navCloseTransition = { panel: drawer.panel, handler: handleTransitionEnd };
  drawer.panel.addEventListener("transitionend", handleTransitionEnd);
  navCloseTimer = window.setTimeout(() => {
    finishNavigationClose(drawer);
  }, 320);
}

for (const drawer of navigationDrawers) {
  drawer.trigger.addEventListener("click", () => setNavigation(drawer, activeNavigationDrawer !== drawer));
  drawer.panel.addEventListener("click", (event) => {
    if (compactLayout.matches && event.target.closest("a")) setNavigation(drawer, false);
  });
}
navScrim?.addEventListener("click", () => setNavigation(activeNavigationDrawer, false));

document.addEventListener("kin:overlay-will-open", (event) => {
  const overlay = event.detail?.overlay;
  if (overlay === "preferences") {
    if (activeNavigationDrawer) setNavigation(activeNavigationDrawer, false, false, true);
    if (commandDialog?.open) closeCommand({ immediate: true });
  } else if (overlay === "navigation") {
    setPreferences(false, { moveFocus: false, immediate: true });
    if (commandDialog?.open) closeCommand({ immediate: true });
  } else if (overlay === "command") {
    if (activeNavigationDrawer) setNavigation(activeNavigationDrawer, false, false, true);
    setPreferences(false, { moveFocus: false, immediate: true });
  } else if (overlay === "inspect") {
    if (activeNavigationDrawer) setNavigation(activeNavigationDrawer, false, false, true);
    setPreferences(false, { moveFocus: false, immediate: true });
    if (commandDialog?.open) closeCommand({ immediate: true });
  }
});

function syncPreferencesMode() {
  if (!preferencesPanel || !preferencesTrigger) return;
  preferencesPanel.dataset.state = "closed";
  preferencesTrigger.setAttribute("aria-expanded", "false");
  preferencesPanel.inert = compactLayout.matches;
  if (compactLayout.matches) {
    preferencesPanel.setAttribute("aria-hidden", "true");
  } else {
    preferencesPanel.removeAttribute("aria-hidden");
    preferencesPanel.removeAttribute("role");
    preferencesPanel.removeAttribute("aria-modal");
  }
  preferencesScrim?.setAttribute("aria-hidden", "true");
}

syncPreferencesMode();
preferencesTrigger?.addEventListener("click", () => setPreferences(!preferencesAreOpen(), { returnTarget: preferencesTrigger }));
preferencesClose?.addEventListener("click", () => setPreferences(false, { moveFocus: true }));
preferencesScrim?.addEventListener("click", () => setPreferences(false, { moveFocus: true }));

addEventListener("resize", () => {
  if (!compactLayout.matches) {
    if (activeNavigationDrawer) setNavigation(activeNavigationDrawer, false, false, true);
    if (preferencesState() !== "closed") setPreferences(false, { moveFocus: false, immediate: true });
    syncPreferencesMode();
  } else if (preferencesState() === "closed") {
    syncPreferencesMode();
  }
  for (const drawer of navigationDrawers) {
    if (compactLayout.matches) {
      if (activeNavigationDrawer !== drawer) {
        drawer.panel.dataset.drawerState = "closed";
        drawer.panel.inert = true;
        drawer.panel.setAttribute("aria-hidden", "true");
      }
    } else {
      drawer.panel.dataset.drawerState = "closed";
      drawer.panel.inert = false;
      drawer.panel.removeAttribute("aria-hidden");
      drawer.panel.removeAttribute("role");
      drawer.panel.removeAttribute("aria-modal");
    }
  }
});

addEventListener("keydown", (event) => {
  if (event.key === "Tab" && compactLayout.matches && preferencesAreOpen()) {
    const focusable = preferenceFocusable();
    if (focusable.length === 0) return;
    const currentIndex = focusable.indexOf(document.activeElement);
    const nextIndex = event.shiftKey
      ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
      : (currentIndex < 0 || currentIndex === focusable.length - 1 ? 0 : currentIndex + 1);
    event.preventDefault();
    focusable[nextIndex].focus();
    return;
  }
  if (
    event.key !== "Tab"
    || !compactLayout.matches
    || !document.body.classList.contains("nav-open")
    || !activeNavigationDrawer
  ) return;
  const { trigger, panel } = activeNavigationDrawer;
  const focusable = [
    trigger,
    ...panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  ].filter((element) => !element.inert && !element.hidden);
  if (focusable.length === 0) return;
  const currentIndex = focusable.indexOf(document.activeElement);
  const nextIndex = event.shiftKey
    ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
    : (currentIndex < 0 || currentIndex === focusable.length - 1 ? 0 : currentIndex + 1);
  event.preventDefault();
  focusable[nextIndex].focus();
});

for (const drawer of navigationDrawers) {
  drawer.panel.dataset.drawerState = "closed";
  if (compactLayout.matches) {
    drawer.panel.inert = true;
    drawer.panel.setAttribute("aria-hidden", "true");
  }
}

let languageOpenFrame;
let languageCloseTimer;

function cancelLanguageMenuWork() {
  if (languageOpenFrame !== undefined) cancelAnimationFrame(languageOpenFrame);
  if (languageCloseTimer !== undefined) clearTimeout(languageCloseTimer);
  languageOpenFrame = undefined;
  languageCloseTimer = undefined;
}

function setLanguageMenu(open, moveFocus = true, invocation = "pointer") {
  if (!languageMenu || !languageTrigger) return;
  cancelLanguageMenuWork();
  languageTrigger.setAttribute("aria-expanded", String(open));
  languageMenu.dataset.invocation = invocation;

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
    delete languageMenu.dataset.invocation;
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
    delete languageMenu.dataset.invocation;
  }, reducedMotion.matches ? 90 : 180);
}

languageTrigger?.addEventListener("click", () => {
  const open = languageMenu?.dataset.state === "open" || languageMenu?.dataset.state === "opening";
  setLanguageMenu(!open);
});
languageTrigger?.addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || !languageMenu) return;
  event.preventDefault();
  setLanguageMenu(true, false, "keyboard");
  const items = [...languageMenu.querySelectorAll('[role="menuitem"]')];
  const target = ["ArrowUp", "End"].includes(event.key) ? items.at(-1) : items[0];
  target?.focus();
});
languageMenu?.addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const items = [...languageMenu.querySelectorAll('[role="menuitem"]')];
  const currentIndex = items.indexOf(document.activeElement);
  if (items.length === 0 || currentIndex < 0) return;
  event.preventDefault();
  let nextIndex = currentIndex;
  if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
  if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = items.length - 1;
  items[nextIndex].focus();
});
document.addEventListener("click", (event) => {
  const open = languageMenu?.dataset.state === "open" || languageMenu?.dataset.state === "opening";
  if (open && !languageControl?.contains(event.target)) setLanguageMenu(false, false);
});
document.addEventListener("focusin", (event) => {
  const open = languageMenu?.dataset.state === "open" || languageMenu?.dataset.state === "opening";
  if (open && !languageControl?.contains(event.target)) setLanguageMenu(false, false);
});
addEventListener("hashchange", syncLanguageFragment);

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
let commandFocusTimer;
let commandReturnFocus;

function cancelCommandWork() {
  if (commandOpenFrame !== undefined) cancelAnimationFrame(commandOpenFrame);
  if (commandCloseTimer !== undefined) clearTimeout(commandCloseTimer);
  if (commandFocusTimer !== undefined) clearTimeout(commandFocusTimer);
  commandOpenFrame = undefined;
  commandCloseTimer = undefined;
  commandFocusTimer = undefined;
}

function openCommand(invocation = "pointer") {
  if (!commandDialog) return;
  document.dispatchEvent(new CustomEvent("kin:overlay-will-open", { detail: { overlay: "command" } }));
  cancelCommandWork();
  const activeElement = document.activeElement;
  const activeStyle = activeElement instanceof HTMLElement ? getComputedStyle(activeElement) : null;
  commandReturnFocus = activeElement instanceof HTMLElement
    && activeElement !== document.body
    && activeElement !== document.documentElement
    && activeElement.isConnected
    && !activeElement.closest("[inert], [aria-hidden=\"true\"]")
    && activeStyle?.display !== "none"
    && activeStyle?.visibility !== "hidden"
    ? activeElement
    : commandTrigger;
  if (!commandDialog.open) commandDialog.showModal();
  commandDialog.inert = false;
  document.body.dataset.overlayOwner = "command";
  commandDialog.dataset.invocation = invocation;
  commandDialog.dataset.state = "opening";
  commandSearch.value = "";
  filterCommands("");
  commandSearch?.focus({ preventScroll: true });
  if (invocation === "keyboard" || reducedMotion.matches) {
    commandDialog.dataset.state = "open";
    return;
  }
  commandOpenFrame = requestAnimationFrame(() => {
    commandOpenFrame = undefined;
    if (commandDialog.dataset.state !== "opening") return;
    commandDialog.dataset.state = "open";
  });
}

function closeCommand({ immediate = false } = {}) {
  if (!commandDialog?.open) return;
  cancelCommandWork();
  commandDialog.inert = true;
  commandDialog.dataset.state = "closing";
  const finish = () => {
    commandCloseTimer = undefined;
    if (commandDialog.dataset.state !== "closing") return;
    commandDialog.close();
    commandDialog.inert = false;
    commandDialog.dataset.state = "closed";
    if (document.body.dataset.overlayOwner === "command") delete document.body.dataset.overlayOwner;
    const target = commandReturnFocus?.isConnected ? commandReturnFocus : commandTrigger;
    commandReturnFocus = undefined;
    let focusAttempts = 0;
    const restoreFocus = () => {
      commandFocusTimer = undefined;
      if (commandDialog.dataset.state !== "closed" || !target?.isConnected) return;
      target.focus({ preventScroll: true });
      if (document.activeElement !== target && focusAttempts < 2) {
        focusAttempts += 1;
        commandFocusTimer = window.setTimeout(restoreFocus, 16);
      }
    };
    commandFocusTimer = window.setTimeout(restoreFocus, 0);
  };
  if (immediate || commandDialog.dataset.invocation === "keyboard" || reducedMotion.matches) {
    finish();
    return;
  }
  commandCloseTimer = window.setTimeout(finish, 180);
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
    if (document.body.classList.contains("lab-controls-modal-open") || preferencesAreOpen() || activeNavigationDrawer) return;
    event.preventDefault();
    openCommand("keyboard");
  }
  if (event.key === "/" && !editable && !commandDialog?.open) {
    if (document.body.classList.contains("lab-controls-modal-open") || preferencesAreOpen() || activeNavigationDrawer) return;
    event.preventDefault();
    openCommand("keyboard");
  }
  if (event.key === "Escape" && commandDialog?.open) {
    event.preventDefault();
    closeCommand();
  } else if (event.key === "Escape" && !languageMenu?.hidden) {
    event.preventDefault();
    setLanguageMenu(false, true, "keyboard");
  } else if (event.key === "Escape" && preferencesAreOpen()) {
    event.preventDefault();
    setPreferences(false, { moveFocus: true });
  } else if (event.key === "Escape" && activeNavigationDrawer) {
    event.preventDefault();
    setNavigation(activeNavigationDrawer, false);
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
syncLanguageFragment();

createIcons({
  icons: {
    Accessibility,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    Bell,
    BookOpen,
    BookOpenText,
    Bot,
    Blocks,
    BoxSelect,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleCheckBig,
    CircleDot,
    CirclePlay,
    Code2,
    Command,
    Contrast,
    Copy,
    Database,
    Download,
    DraftingCompass,
    ExternalLink,
    Focus,
    FolderDown,
    GitCompareArrows,
    Info,
    Languages,
    LayoutDashboard,
    ListChecks,
    ListRestart,
    ListTree,
    LockKeyhole,
    LogIn,
    Menu,
    Monitor,
    MonitorCog,
    MousePointerClick,
    Moon,
    PackageCheck,
    Palette,
    PanelRightOpen,
    PanelsTopLeft,
    Search,
    ScanEye,
    ScanSearch,
    ShieldAlert,
    ShieldCheck,
    ShoppingBag,
    Smartphone,
    Sun,
    Table2,
    Terminal,
  },
  attrs: { "aria-hidden": "true", "stroke-width": "1.5" },
});

document.documentElement.dataset.siteReady = "true";
