const media = matchMedia("(prefers-color-scheme: dark)");
const themeButtons = [...document.querySelectorAll("[data-theme-value]")];
const contrastButton = document.querySelector("[data-contrast-toggle]");
const canvasShell = document.querySelector(".canvas-shell");
const canvasLayers = document.querySelector("#canvas-layers");
const canvasLayersOpen = document.querySelector("[data-canvas-layers-open]");
const canvasLayersClose = document.querySelector("[data-canvas-layers-close]");
const canvasPropertiesOpen = document.querySelector("[data-canvas-properties-open]");
const canvasPropertiesClose = document.querySelector("[data-canvas-properties-close]");
const canvasToolbar = document.querySelector("[data-canvas-toolbar]");
const toolbarItems = [...document.querySelectorAll("[data-toolbar-item]")];
const toolbarOverflow = document.querySelector("[data-toolbar-overflow]");
const toolbarOverflowTrigger = document.querySelector("[data-toolbar-overflow-trigger]");
const toolbarMenu = document.querySelector("[data-toolbar-menu]");
const toolbarMenuItems = [...(toolbarMenu?.querySelectorAll('[role="menuitem"]') ?? [])];
const toolbarStatus = document.querySelector("[data-toolbar-status]");
const splitResizer = document.querySelector("[data-split-resizer]");
const splitStorageKey = "kin-reference-canvas-layers-width-v1";
const splitDefault = 210;
const splitMin = 160;
const splitMax = 320;
const canvasMobileLayout = matchMedia("(max-width: 700px)");
const canvasInspectorOverlay = matchMedia("(max-width: 1000px)");

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

function visibleToolbarItems() {
  return toolbarItems.filter((item) => item.getClientRects().length && !item.disabled);
}

function focusToolbarItem(item) {
  for (const candidate of toolbarItems) candidate.tabIndex = candidate === item ? 0 : -1;
  item.focus();
}

function syncToolbarTabStop() {
  const items = visibleToolbarItems();
  if (!items.length) return;
  const activeItem = document.activeElement?.closest?.("[data-toolbar-item]");
  const existing = items.find((item) => item.tabIndex === 0);
  const next = items.includes(activeItem) ? activeItem : existing ?? items[0];
  for (const item of toolbarItems) item.tabIndex = item === next ? 0 : -1;
  if (activeItem && !activeItem.getClientRects().length) next.focus();
}

canvasToolbar?.addEventListener("keydown", (event) => {
  const current = event.target.closest("[data-toolbar-item]");
  if (!current || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const items = visibleToolbarItems();
  const currentIndex = items.indexOf(current);
  if (currentIndex < 0) return;
  event.preventDefault();
  const rtl = getComputedStyle(canvasToolbar).direction === "rtl";
  const forward = event.key === "ArrowRight" ? !rtl : event.key === "ArrowLeft" ? rtl : null;
  const nextIndex = event.key === "Home"
    ? 0
    : event.key === "End"
      ? items.length - 1
      : (currentIndex + (forward ? 1 : -1) + items.length) % items.length;
  focusToolbarItem(items[nextIndex]);
});

function setToolbarMenu(open, restoreFocus = true) {
  if (!toolbarMenu || !toolbarOverflowTrigger) return;
  toolbarMenu.hidden = !open;
  toolbarOverflowTrigger.setAttribute("aria-expanded", String(open));
  if (open) toolbarMenuItems[0]?.focus();
  else if (restoreFocus) toolbarOverflowTrigger.focus();
}

toolbarOverflowTrigger?.addEventListener("click", () => setToolbarMenu(toolbarMenu.hidden));
toolbarMenu?.addEventListener("keydown", (event) => {
  const index = toolbarMenuItems.indexOf(document.activeElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    toolbarMenuItems[(index + (event.key === "ArrowDown" ? 1 : -1) + toolbarMenuItems.length) % toolbarMenuItems.length].focus();
  }
  if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    toolbarMenuItems[event.key === "Home" ? 0 : toolbarMenuItems.length - 1].focus();
  }
  if (event.key === "Escape") setToolbarMenu(false);
});

for (const action of document.querySelectorAll("[data-toolbar-action]")) {
  action.addEventListener("click", () => {
    const messages = {
      undo: "已撤销上一步操作",
      redo: "已重做上一步操作",
      export: "导出命令已打开",
      settings: "文档设置已打开",
    };
    toolbarStatus.textContent = messages[action.dataset.toolbarAction] ?? "操作已执行";
    if (action.closest("[data-toolbar-menu]")) setToolbarMenu(false);
  });
}

document.addEventListener("click", (event) => {
  if (toolbarMenu && !toolbarMenu.hidden && !toolbarOverflow.contains(event.target)) setToolbarMenu(false, false);
});

function clampSplit(value) {
  return Math.min(splitMax, Math.max(splitMin, Math.round(value)));
}

function setSplitWidth(value, persist = true) {
  if (!canvasShell || !splitResizer) return;
  const width = clampSplit(value);
  canvasShell.style.setProperty("--layers-width", `${width}px`);
  splitResizer.setAttribute("aria-valuenow", String(width));
  splitResizer.setAttribute("aria-valuetext", `${width} 像素`);
  if (persist) localStorage.setItem(splitStorageKey, String(width));
}

splitResizer?.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  splitResizer.setPointerCapture(event.pointerId);
});

splitResizer?.addEventListener("pointermove", (event) => {
  if (!splitResizer.hasPointerCapture(event.pointerId)) return;
  const shellLeft = canvasShell.getBoundingClientRect().left;
  setSplitWidth(event.clientX - shellLeft - 48, false);
});

splitResizer?.addEventListener("pointerup", (event) => {
  if (!splitResizer.hasPointerCapture(event.pointerId)) return;
  splitResizer.releasePointerCapture(event.pointerId);
  localStorage.setItem(splitStorageKey, splitResizer.getAttribute("aria-valuenow"));
});

splitResizer?.addEventListener("keydown", (event) => {
  const current = Number(splitResizer.getAttribute("aria-valuenow")) || splitDefault;
  const next = event.key === "Home"
    ? splitMin
    : event.key === "End"
      ? splitMax
      : event.key === "ArrowLeft"
        ? current - 10
        : event.key === "ArrowRight"
          ? current + 10
          : null;
  if (next === null) return;
  event.preventDefault();
  setSplitWidth(next);
});

splitResizer?.addEventListener("dblclick", () => setSplitWidth(splitDefault));

function setCanvasLayers(open, moveFocus = true) {
  if (!canvasShell || !canvasLayers || !canvasLayersOpen || !canvasLayersClose) return;
  if (open) canvasShell.classList.remove("properties-open");
  canvasShell.classList.toggle("layers-open", open);
  canvasLayersOpen.setAttribute("aria-expanded", String(open));
  if (open) canvasPropertiesOpen?.setAttribute("aria-expanded", "false");
  if (moveFocus) {
    if (open) canvasLayersClose.focus();
    else canvasLayersOpen.focus();
  }
}

function setCanvasProperties(open, moveFocus = true) {
  if (!canvasShell || !canvasPropertiesOpen || !canvasPropertiesClose) return;
  if (open) canvasShell.classList.remove("layers-open");
  canvasShell.classList.toggle("properties-open", open);
  canvasPropertiesOpen.setAttribute("aria-expanded", String(open));
  if (open) canvasLayersOpen?.setAttribute("aria-expanded", "false");
  if (moveFocus) {
    if (open) canvasPropertiesClose.focus();
    else canvasPropertiesOpen.focus();
  }
}

canvasLayersOpen?.addEventListener("click", () => setCanvasLayers(true));
canvasLayersClose?.addEventListener("click", () => setCanvasLayers(false));
canvasPropertiesOpen?.addEventListener("click", () => setCanvasProperties(true));
canvasPropertiesClose?.addEventListener("click", () => setCanvasProperties(false));
addEventListener("keydown", (event) => {
  if (event.key === "Escape" && toolbarMenu && !toolbarMenu.hidden) setToolbarMenu(false);
  else if (event.key === "Escape" && canvasShell?.classList.contains("properties-open")) setCanvasProperties(false);
  else if (event.key === "Escape" && canvasShell?.classList.contains("layers-open")) setCanvasLayers(false);
});

canvasMobileLayout.addEventListener("change", (event) => {
  if (!event.matches && canvasShell?.classList.contains("layers-open")) {
    const restoreTarget = canvasLayers.querySelector('[data-object][aria-pressed="true"]') ?? canvasLayers.querySelector("[data-object]");
    setCanvasLayers(false, false);
    restoreTarget?.focus();
  }
  syncToolbarTabStop();
});
canvasInspectorOverlay.addEventListener("change", (event) => {
  if (!event.matches && canvasShell?.classList.contains("properties-open")) {
    setCanvasProperties(false, false);
    document.querySelector("#x")?.focus();
  }
  syncToolbarTabStop();
});

applyTheme(document.documentElement.dataset.themePreference || "system", false);
applyContrast(document.documentElement.dataset.contrast === "more", false);
setSplitWidth(Number(localStorage.getItem(splitStorageKey)) || splitDefault, false);
syncToolbarTabStop();
