const contrastButton = document.querySelector("[data-contrast-toggle]");
const canvasShell = document.querySelector(".canvas-shell");
const canvasLayers = document.querySelector("#canvas-layers");
const canvasLayersOpen = document.querySelector("[data-canvas-layers-open]");
const canvasLayersClose = document.querySelector("[data-canvas-layers-close]");
const canvasPropertiesOpen = document.querySelector("[data-canvas-properties-open]");
const canvasPropertiesClose = document.querySelector("[data-canvas-properties-close]");
const canvasScrim = canvasShell?.appendChild(Object.assign(document.createElement("div"), {
  className: "canvas-scrim",
  hidden: true,
}));
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
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

if (canvasScrim) {
  canvasScrim.dataset.canvasScrim = "";
  canvasScrim.dataset.state = "closed";
  canvasScrim.setAttribute("aria-hidden", "true");
}

function applyContrast(enabled, persist = true) {
  document.documentElement.dataset.contrast = enabled ? "more" : "normal";
  contrastButton?.setAttribute("aria-pressed", String(enabled));
  if (persist) localStorage.setItem("kin-reference-contrast", enabled ? "more" : "normal");
}

contrastButton?.addEventListener("click", () => applyContrast(document.documentElement.dataset.contrast !== "more"));

addEventListener("storage", (event) => {
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

const canvasPanelConfigs = [
  {
    name: "layers",
    panel: canvasLayers,
    openTrigger: canvasLayersOpen,
    closeTrigger: canvasLayersClose,
    shellClass: "layers-open",
    overlayQuery: canvasMobileLayout,
    persistentFocus: () => canvasLayers?.querySelector('[data-object][aria-pressed="true"]') ?? canvasLayers?.querySelector("[data-object]"),
  },
  {
    name: "properties",
    panel: document.querySelector("#canvas-properties"),
    openTrigger: canvasPropertiesOpen,
    closeTrigger: canvasPropertiesClose,
    shellClass: "properties-open",
    overlayQuery: canvasInspectorOverlay,
    persistentFocus: () => document.querySelector("#x"),
  },
].filter(({ panel, openTrigger, closeTrigger }) => panel && openTrigger && closeTrigger);

for (const config of canvasPanelConfigs) {
  config.desiredOpen = false;
  config.overlayMode = null;
  config.openFrame = null;
  config.closeTimer = null;
  config.panel.dataset.canvasOverlay = "";
  config.panel.dataset.state ||= "open";
}

const scrimMotion = { openFrame: null, closeTimer: null };

function cancelPanelWork(config) {
  if (config.openFrame !== null) cancelAnimationFrame(config.openFrame);
  if (config.closeTimer !== null) clearTimeout(config.closeTimer);
  config.openFrame = null;
  config.closeTimer = null;
}

function canvasPanelExitDelay() {
  return reducedMotion.matches ? 120 : 220;
}

function syncCanvasPanelMotionPreference() {
  for (const config of canvasPanelConfigs) {
    if (reducedMotion.matches) config.panel.style.transform = "none";
    else config.panel.style.removeProperty("transform");
  }
}

function activeCanvasOverlay() {
  return canvasPanelConfigs.find((config) => config.overlayMode && config.desiredOpen) ?? null;
}

function syncCanvasScrim() {
  if (!canvasScrim) return;
  const hasOpenOverlay = Boolean(activeCanvasOverlay());

  if (hasOpenOverlay) {
    if (scrimMotion.closeTimer !== null) clearTimeout(scrimMotion.closeTimer);
    scrimMotion.closeTimer = null;
    const wasClosed = canvasScrim.hidden || canvasScrim.dataset.state === "closed";
    canvasScrim.hidden = false;
    if (canvasScrim.dataset.state === "closing") {
      canvasScrim.dataset.state = "open";
    } else if (wasClosed) {
      canvasScrim.dataset.state = "opening";
      scrimMotion.openFrame = requestAnimationFrame(() => {
        scrimMotion.openFrame = null;
        if (activeCanvasOverlay()) canvasScrim.dataset.state = "open";
      });
    }
    return;
  }

  if (scrimMotion.openFrame !== null) cancelAnimationFrame(scrimMotion.openFrame);
  scrimMotion.openFrame = null;
  if (canvasScrim.hidden || canvasScrim.dataset.state === "closed") return;
  canvasScrim.dataset.state = "closing";
  if (scrimMotion.closeTimer !== null) clearTimeout(scrimMotion.closeTimer);
  scrimMotion.closeTimer = setTimeout(() => {
    scrimMotion.closeTimer = null;
    if (activeCanvasOverlay()) return;
    canvasScrim.hidden = true;
    canvasScrim.dataset.state = "closed";
  }, canvasPanelExitDelay());
}

function closeCanvasPanel(config, { moveFocus = true, immediate = false } = {}) {
  if (!config) return;
  cancelPanelWork(config);
  config.desiredOpen = false;
  canvasShell?.classList.remove(config.shellClass);
  config.openTrigger.setAttribute("aria-expanded", "false");
  config.panel.inert = true;
  config.panel.setAttribute("aria-hidden", "true");

  if (immediate || config.panel.hidden || config.panel.dataset.state === "closed") {
    config.panel.hidden = true;
    config.panel.dataset.state = "closed";
  } else {
    config.panel.dataset.state = "closing";
    config.closeTimer = setTimeout(() => {
      config.closeTimer = null;
      if (config.desiredOpen || config.panel.dataset.state !== "closing") return;
      config.panel.hidden = true;
      config.panel.dataset.state = "closed";
    }, canvasPanelExitDelay());
  }

  if (moveFocus && config.openTrigger.getClientRects().length) config.openTrigger.focus();
  syncCanvasScrim();
}

function openCanvasPanel(config, { moveFocus = true } = {}) {
  if (!config?.overlayMode) return;
  const previousState = config.panel.dataset.state;
  config.desiredOpen = true;

  for (const other of canvasPanelConfigs) {
    if (other !== config && other.overlayMode && other.desiredOpen) {
      closeCanvasPanel(other, { moveFocus: false });
    }
  }

  cancelPanelWork(config);
  canvasShell?.classList.add(config.shellClass);
  config.openTrigger.setAttribute("aria-expanded", "true");
  config.panel.hidden = false;
  config.panel.inert = false;
  config.panel.removeAttribute("aria-hidden");

  if (previousState === "closing" || previousState === "open") {
    config.panel.dataset.state = "open";
  } else {
    config.panel.dataset.state = "opening";
  }

  syncCanvasScrim();
  config.openFrame = requestAnimationFrame(() => {
    config.openFrame = null;
    if (!config.desiredOpen) return;
    config.panel.dataset.state = "open";
    if (moveFocus) config.closeTrigger.focus();
  });
}

function syncCanvasPanelLayouts() {
  for (const config of canvasPanelConfigs) {
    const overlayMode = config.overlayQuery.matches;
    if (config.overlayMode === overlayMode) continue;
    const focusWasInside = config.panel.contains(document.activeElement);
    config.overlayMode = overlayMode;

    if (overlayMode) {
      config.panel.setAttribute("role", "dialog");
      config.panel.setAttribute("aria-modal", "true");
      closeCanvasPanel(config, { moveFocus: focusWasInside, immediate: true });
      continue;
    }

    cancelPanelWork(config);
    config.desiredOpen = false;
    canvasShell?.classList.remove(config.shellClass);
    config.openTrigger.setAttribute("aria-expanded", "false");
    config.panel.hidden = false;
    config.panel.inert = false;
    config.panel.removeAttribute("aria-hidden");
    config.panel.removeAttribute("aria-modal");
    config.panel.removeAttribute("role");
    config.panel.dataset.state = "open";
    if (focusWasInside) requestAnimationFrame(() => config.persistentFocus()?.focus());
  }
  syncCanvasScrim();
  syncToolbarTabStop();
}

function setCanvasLayers(open, moveFocus = true) {
  const config = canvasPanelConfigs.find((candidate) => candidate.name === "layers");
  if (open) openCanvasPanel(config, { moveFocus });
  else closeCanvasPanel(config, { moveFocus });
}

function setCanvasProperties(open, moveFocus = true) {
  const config = canvasPanelConfigs.find((candidate) => candidate.name === "properties");
  if (open) openCanvasPanel(config, { moveFocus });
  else closeCanvasPanel(config, { moveFocus });
}

function canvasFocusable(panel) {
  return [...panel.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.disabled && !element.inert && element.getClientRects().length);
}

canvasLayersOpen?.addEventListener("click", () => setCanvasLayers(true));
canvasLayersClose?.addEventListener("click", () => setCanvasLayers(false));
canvasPropertiesOpen?.addEventListener("click", () => setCanvasProperties(true));
canvasPropertiesClose?.addEventListener("click", () => setCanvasProperties(false));
canvasScrim?.addEventListener("click", () => {
  const active = activeCanvasOverlay();
  if (active) closeCanvasPanel(active);
});

addEventListener("keydown", (event) => {
  if (event.key === "Escape" && toolbarMenu && !toolbarMenu.hidden) {
    setToolbarMenu(false);
    return;
  }

  const active = activeCanvasOverlay();
  if (!active) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeCanvasPanel(active);
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = canvasFocusable(active.panel);
  if (!focusable.length) {
    event.preventDefault();
    active.panel.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!active.panel.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

canvasMobileLayout.addEventListener("change", syncCanvasPanelLayouts);
canvasInspectorOverlay.addEventListener("change", syncCanvasPanelLayouts);
reducedMotion.addEventListener("change", syncCanvasPanelMotionPreference);

applyContrast(document.documentElement.dataset.contrast === "more", false);
setSplitWidth(Number(localStorage.getItem(splitStorageKey)) || splitDefault, false);
syncCanvasPanelMotionPreference();
syncCanvasPanelLayouts();
syncToolbarTabStop();
