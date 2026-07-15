import { Check, ChevronDown, createIcons, Monitor, Moon, Sun } from "lucide";

const root = document.documentElement;
const controls = [...document.querySelectorAll("[data-preference-controls]")];
const colorScheme = matchMedia("(prefers-color-scheme: dark)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const themeColor = document.querySelector('meta[name="theme-color"]');
const menuCleanups = new WeakMap();

function normalizePreference(value) {
  return ["light", "dark", "system"].includes(value) ? value : "system";
}

function resolveTheme(preference) {
  return preference === "system" ? (colorScheme.matches ? "dark" : "light") : preference;
}

function updateControl(control, preference, resolved) {
  const themeSwitch = control.querySelector("[data-theme-switch]");
  const dark = resolved === "dark";
  themeSwitch.dataset.preference = preference;
  themeSwitch.setAttribute("aria-checked", String(dark));
  themeSwitch.setAttribute("aria-label", `${preference === "system" ? "当前跟随系统。" : ""}切换为${dark ? "日间" : "夜间"}模式`);

  for (const item of control.querySelectorAll("[data-theme-preference]")) {
    const selected = item.dataset.themePreference === preference;
    item.setAttribute("aria-checked", String(selected));
    if (selected) item.setAttribute("aria-current", "true");
    else item.removeAttribute("aria-current");
  }
}

function applyTheme(preference, persist = true) {
  const normalized = normalizePreference(preference);
  const resolved = resolveTheme(normalized);
  root.dataset.themePreference = normalized;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  themeColor?.setAttribute("content", resolved === "dark" ? "#08090a" : "#f6f7f8");
  for (const control of controls) updateControl(control, normalized, resolved);
  if (persist) localStorage.setItem("kin-reference-theme", normalized);

  // Integration contract: theme-aware islands can react without owning,
  // persisting, or re-applying the global preference themselves.
  window.dispatchEvent(new CustomEvent("kin:themechange", {
    detail: { preference: normalized, resolved },
  }));
}

function menuIsOpen(menu) {
  return menu.dataset.state === "opening" || menu.dataset.state === "open";
}

function setMenu(control, open, { restoreFocus = false } = {}) {
  const trigger = control.querySelector("[data-theme-menu-trigger]");
  const menu = control.querySelector("[data-theme-menu]");
  menuCleanups.get(menu)?.();

  if (open) {
    menu.hidden = false;
    menu.inert = false;
    menu.dataset.state = "opening";
    trigger.setAttribute("aria-expanded", "true");
    menu.querySelector('[aria-checked="true"]')?.focus();
    requestAnimationFrame(() => {
      if (menu.dataset.state !== "opening") return;
      menu.dataset.state = "open";
    });
    return;
  }

  trigger.setAttribute("aria-expanded", "false");
  menu.inert = true;
  menu.dataset.state = "closing";
  if (restoreFocus) trigger.focus();

  let timer;
  const detach = () => {
    clearTimeout(timer);
    menu.removeEventListener("transitionend", onTransitionEnd);
    menuCleanups.delete(menu);
  };
  const finish = () => {
    if (menu.dataset.state !== "closing") return;
    detach();
    menu.hidden = true;
    menu.dataset.state = "closed";
  };
  const onTransitionEnd = (event) => {
    if (event.target === menu && (event.propertyName === "opacity" || event.propertyName === "transform")) finish();
  };
  menu.addEventListener("transitionend", onTransitionEnd);
  timer = setTimeout(finish, reducedMotion.matches ? 100 : 220);
  menuCleanups.set(menu, detach);
}

function moveMenuFocus(menu, event) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const items = [...menu.querySelectorAll('[role="menuitemradio"]')];
  const currentIndex = items.indexOf(document.activeElement);
  event.preventDefault();
  let nextIndex = currentIndex;
  if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
  if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = items.length - 1;
  items[nextIndex]?.focus();
}

for (const control of controls) {
  createIcons({
    root: control,
    icons: { Check, ChevronDown, Monitor, Moon, Sun },
    attrs: { "aria-hidden": "true", "stroke-width": "1.5" },
  });

  const themeSwitch = control.querySelector("[data-theme-switch]");
  const menuTrigger = control.querySelector("[data-theme-menu-trigger]");
  const menu = control.querySelector("[data-theme-menu]");

  themeSwitch.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark"));
  menuTrigger.addEventListener("click", () => setMenu(control, !menuIsOpen(menu)));
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setMenu(control, false, { restoreFocus: true });
      return;
    }
    moveMenuFocus(menu, event);
  });

  for (const item of menu.querySelectorAll("[data-theme-preference]")) {
    item.addEventListener("click", () => {
      applyTheme(item.dataset.themePreference);
      setMenu(control, false, { restoreFocus: true });
    });
  }
}

document.addEventListener("pointerdown", (event) => {
  for (const control of controls) {
    const menu = control.querySelector("[data-theme-menu]");
    if (menuIsOpen(menu) && !control.contains(event.target)) setMenu(control, false);
  }
});

addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  for (const control of controls) {
    const menu = control.querySelector("[data-theme-menu]");
    if (!menuIsOpen(menu)) continue;
    event.preventDefault();
    setMenu(control, false, { restoreFocus: true });
  }
});

colorScheme.addEventListener("change", () => {
  if (root.dataset.themePreference === "system") applyTheme("system", false);
});

addEventListener("storage", (event) => {
  if (event.key === "kin-reference-theme") applyTheme(event.newValue || "system", false);
});

applyTheme(root.dataset.themePreference || localStorage.getItem("kin-reference-theme") || "system", false);
root.dataset.preferenceControlsReady = "true";
