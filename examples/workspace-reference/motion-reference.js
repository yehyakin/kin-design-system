import {
  Archive,
  Blocks,
  Check,
  ChevronDown,
  CirclePlay,
  Copy,
  createIcons,
  Download,
  Ellipsis,
  Info,
  LoaderCircle,
  Moon,
  PanelLeft,
  PanelRightOpen,
  Pause,
  Pencil,
  Repeat2,
  Save,
  Sun,
  X,
} from "lucide";

const icons = { Archive, Blocks, Check, ChevronDown, CirclePlay, Copy, Download, Ellipsis, Info, LoaderCircle, Moon, PanelLeft, PanelRightOpen, Pause, Pencil, Repeat2, Save, Sun, X };
const colorScheme = matchMedia("(prefers-color-scheme: dark)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let sonnerModulePromise;

function renderIcons() {
  createIcons({ icons, attrs: { "aria-hidden": "true", "stroke-width": 1.5 } });
}

function resolvedTheme(preference) {
  return preference === "system" ? (colorScheme.matches ? "dark" : "light") : preference;
}

function applyTheme(preference, persist = true) {
  const theme = resolvedTheme(preference);
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = preference;
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#08090a" : "#f6f7f8";
  const trigger = document.querySelector("[data-lab-theme]");
  trigger.dataset.controlState = theme;
  trigger.setAttribute("aria-label", theme === "dark" ? "切换到日间模式" : "切换到夜间模式");
  if (persist) localStorage.setItem("kin-reference-theme", preference);
  if (sonnerModulePromise) sonnerModulePromise.then((module) => module.updateToasterTheme(theme, "zh"));
}

function updateMotionPreference() {
  document.querySelector("[data-motion-preference]").textContent = reducedMotion.matches ? "减少动态效果" : "普通动效";
  document.querySelector("[data-motion-travel]").textContent = reducedMotion.matches ? "短淡入淡出" : "方向一致、可反向";
}

const transientCleanups = new WeakMap();
function setTransientSurface(surface, open, { trigger, focusTarget, restoreFocus = false } = {}) {
  transientCleanups.get(surface)?.();

  if (open) {
    surface.hidden = false;
    surface.inert = false;
    surface.dataset.state = "opening";
    trigger?.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => {
      if (surface.dataset.state !== "opening") return;
      surface.dataset.state = "open";
      focusTarget?.focus();
    });
    return;
  }

  trigger?.setAttribute("aria-expanded", "false");
  surface.inert = true;
  surface.dataset.state = "closing";
  if (restoreFocus) trigger?.focus();

  let timer;
  const detach = () => {
    window.clearTimeout(timer);
    surface.removeEventListener("transitionend", onTransitionEnd);
    transientCleanups.delete(surface);
  };
  const finish = () => {
    if (surface.dataset.state !== "closing") return;
    detach();
    surface.hidden = true;
    surface.dataset.state = "closed";
  };
  const onTransitionEnd = (event) => {
    if (event.target === surface && (event.propertyName === "opacity" || event.propertyName === "transform")) finish();
  };
  surface.addEventListener("transitionend", onTransitionEnd);
  timer = window.setTimeout(finish, reducedMotion.matches ? 90 : 190);
  transientCleanups.set(surface, detach);
}

document.querySelector("[data-lab-theme]").addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});
colorScheme.addEventListener("change", () => {
  if (document.documentElement.dataset.themePreference === "system") applyTheme("system", false);
});
reducedMotion.addEventListener("change", updateMotionPreference);

const paired = document.querySelector("[data-lab-toggle]");
paired.addEventListener("click", () => {
  const active = paired.getAttribute("aria-pressed") !== "true";
  paired.setAttribute("aria-pressed", String(active));
  paired.dataset.controlState = active ? "active" : "default";
  paired.querySelector("[data-action-label]").textContent = active ? "暂停同步" : "开始同步";
});

const asyncButton = document.querySelector("[data-lab-async]");
asyncButton.addEventListener("click", () => {
  if (asyncButton.disabled) return;
  const label = asyncButton.querySelector("[data-action-label]");
  asyncButton.disabled = true;
  asyncButton.classList.add("is-pending");
  asyncButton.dataset.controlState = "pending";
  label.textContent = "正在保存";
  window.setTimeout(async () => {
    asyncButton.classList.remove("is-pending");
    asyncButton.classList.add("is-complete");
    asyncButton.dataset.controlState = "success";
    label.textContent = "已保存";
    const sonner = await getSonner();
    sonner.showKinToast({ title: "布局已保存", description: "当前视图的密度和列顺序已经更新。", theme: document.documentElement.dataset.theme, locale: "zh", tone: "success" });
    window.setTimeout(() => {
      asyncButton.classList.remove("is-complete");
      asyncButton.disabled = false;
      asyncButton.dataset.controlState = "default";
      label.textContent = "保存布局";
    }, 1100);
  }, 650);
});

async function getSonner() {
  sonnerModulePromise ??= import("../../site/assets/sonner-island.js");
  return sonnerModulePromise;
}
document.querySelector("[data-lab-task]").addEventListener("click", async () => {
  const sonner = await getSonner();
  sonner.showKinTaskToast({ loadingTitle: "正在创建导出任务", successTitle: "导出任务已创建", description: "任务完成后可在下载中心查看。", theme: document.documentElement.dataset.theme, locale: "zh", duration: 850 });
});

const menuTrigger = document.querySelector("[data-lab-menu-trigger]");
const menu = document.querySelector(".lab-menu");
const menuItems = [...menu.querySelectorAll('[role="menuitem"]')];
function setMenu(open, restoreFocus = false) {
  setTransientSurface(menu, open, { trigger: menuTrigger, focusTarget: menuItems[0], restoreFocus });
}
menuTrigger.addEventListener("click", () => setMenu(menu.hidden || menu.dataset.state === "closing"));
menu.addEventListener("keydown", (event) => {
  const current = menuItems.indexOf(document.activeElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    menuItems[(current + (event.key === "ArrowDown" ? 1 : -1) + menuItems.length) % menuItems.length].focus();
  }
  if (event.key === "Escape") setMenu(false, true);
});
for (const item of menuItems) item.addEventListener("click", () => setMenu(false, true));

const popoverTrigger = document.querySelector("[data-lab-popover-trigger]");
const popover = document.querySelector(".lab-popover");
const popoverClose = document.querySelector("[data-lab-popover-close]");
function setPopover(open, restoreFocus = false) {
  setTransientSurface(popover, open, { trigger: popoverTrigger, focusTarget: popoverClose, restoreFocus });
}
popoverTrigger.addEventListener("click", () => setPopover(popover.hidden || popover.dataset.state === "closing"));
popoverClose.addEventListener("click", () => setPopover(false, true));
popover.addEventListener("keydown", (event) => { if (event.key === "Escape") setPopover(false, true); });

const disclosure = document.querySelector("[data-lab-disclosure]");
const details = document.querySelector("#lab-details");
details.inert = true;
disclosure.addEventListener("click", () => {
  const open = disclosure.getAttribute("aria-expanded") !== "true";
  disclosure.setAttribute("aria-expanded", String(open));
  details.dataset.state = open ? "open" : "closed";
  details.setAttribute("aria-hidden", String(!open));
  details.inert = !open;
});

const drawerLayer = document.querySelector("[data-lab-drawer-layer]");
const drawer = drawerLayer.querySelector(".motion-drawer");
const drawerOpen = document.querySelector("[data-lab-drawer-open]");
const drawerClose = document.querySelector("[data-lab-drawer-close]");
const drawerScrim = document.querySelector("[data-lab-drawer-scrim]");
const drawerReverse = document.querySelector("[data-lab-drawer-reverse]");
const drawerStatus = document.querySelector("[data-lab-drawer-status]");
const header = document.querySelector(".reference-header");
const main = document.querySelector("#motion-lab");
let drawerPhaseTimer;
let reversalTimer;

function setDrawer(open, restoreFocus = true) {
  window.clearTimeout(drawerPhaseTimer);
  drawerLayer.dataset.state = open ? "open" : "closed";
  drawerLayer.dataset.phase = open ? "opening" : "closing";
  drawerLayer.setAttribute("aria-hidden", String(!open));
  drawerLayer.inert = !open;
  header.inert = open;
  main.inert = open;
  document.body.classList.toggle("drawer-modal-open", open);
  drawerOpen.setAttribute("aria-expanded", String(open));
  if (open) drawerClose.focus();
  else if (restoreFocus) drawerOpen.focus();
  drawerPhaseTimer = window.setTimeout(() => {
    if (drawerLayer.dataset.state === (open ? "open" : "closed")) drawerLayer.dataset.phase = open ? "open" : "closed";
  }, reducedMotion.matches ? 90 : 240);
}

drawerLayer.inert = true;
drawerOpen.addEventListener("click", () => setDrawer(true));
drawerClose.addEventListener("click", () => setDrawer(false));
drawerScrim.addEventListener("click", () => setDrawer(false));
drawerReverse.addEventListener("click", () => {
  window.clearTimeout(reversalTimer);
  drawerStatus.textContent = "正在关闭并从当前位置反向打开…";
  setDrawer(false, false);
  reversalTimer = window.setTimeout(() => {
    setDrawer(true, false);
    drawerStatus.textContent = "最后请求为打开；没有旧的关闭计时器覆盖当前状态。";
  }, reducedMotion.matches ? 20 : 80);
});
drawer.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { event.preventDefault(); setDrawer(false); }
  if (event.key !== "Tab") return;
  const focusable = [...drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((element) => !element.disabled);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

applyTheme(document.documentElement.dataset.themePreference || "system", false);
updateMotionPreference();
renderIcons();
