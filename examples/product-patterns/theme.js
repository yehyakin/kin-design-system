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

function setupCommerceEditor() {
  const form = document.querySelector("[data-commerce-edit-form]");
  if (!form) return;

  const fields = form.querySelector("[data-commerce-edit-fields]");
  const price = form.querySelector("#commerce-price");
  const stock = form.querySelector("#commerce-stock");
  const priceError = form.querySelector("[data-commerce-price-error]");
  const stockError = form.querySelector("[data-commerce-stock-error]");
  const priceHelp = form.querySelector("[data-commerce-price-help]");
  const impact = form.querySelector("[data-commerce-edit-impact]");
  const status = form.querySelector("[data-commerce-edit-status]");
  const permission = form.querySelector("[data-commerce-permission]");
  const saveFailure = form.querySelector("[data-commerce-save-failure]");
  const activity = document.querySelector("[data-commerce-edit-activity] span");
  const shanghaiStock = document.querySelector("[data-commerce-stock-shanghai]");
  const shenzhenStock = document.querySelector("[data-commerce-stock-shenzhen]");
  const approvalTitle = document.querySelector("[data-commerce-approval-title]");
  const approvalCopy = document.querySelector("[data-commerce-approval-copy]");
  const discard = form.querySelector("[data-commerce-discard]");
  const retry = form.querySelector("[data-commerce-retry]");
  const save = form.querySelector("[data-commerce-save]");
  const stateLabel = document.querySelector("[data-commerce-edit-state-label]");
  const fixtures = {
    normal: { currentPrice: 1299, currentStock: 6, draftPrice: 1299, draftStock: 6 },
    pending: { currentPrice: 1299, currentStock: 6, draftPrice: 1349, draftStock: 8 },
    error: { currentPrice: 1299, currentStock: 6, draftPrice: 0, draftStock: 8 },
    loading: { currentPrice: 1299, currentStock: 6, draftPrice: 1349, draftStock: 8 },
    committed: { currentPrice: 1349, currentStock: 8, draftPrice: 1349, draftStock: 8 },
    permission: { currentPrice: 1299, currentStock: 6, draftPrice: 1299, draftStock: 6 },
    failed: { currentPrice: 1299, currentStock: 6, draftPrice: 1349, draftStock: 8 },
  };
  const labels = {
    normal: "无待保存",
    pending: "未保存",
    error: "需修正",
    loading: "保存中",
    committed: "本地已保存",
    permission: "只读",
    failed: "保存失败",
  };
  let currentPrice = 1299;
  let currentStock = 6;
  let saveTimer = null;

  function numberValue(input) {
    return input.value.trim() === "" ? Number.NaN : Number(input.value);
  }

  function formattedPrice(value) {
    return `CNY ${new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
  }

  function syncCurrentValues() {
    for (const target of document.querySelectorAll("[data-commerce-current-price]")) target.textContent = formattedPrice(currentPrice);
    for (const target of document.querySelectorAll("[data-commerce-current-stock]")) target.textContent = String(currentStock);
    priceHelp.textContent = `含币种；当前记录值 ${formattedPrice(currentPrice)}。`;
    const shanghai = Math.round(currentStock * 2 / 3);
    shanghaiStock.textContent = `${shanghai} 可售`;
    shenzhenStock.textContent = `${currentStock - shanghai} 可售`;
  }

  function clearValidation() {
    price.setAttribute("aria-invalid", "false");
    stock.setAttribute("aria-invalid", "false");
    priceError.hidden = true;
    stockError.hidden = true;
    priceError.textContent = "";
    stockError.textContent = "";
  }

  function validateFields() {
    clearValidation();
    let firstInvalid = null;
    const draftPrice = numberValue(price);
    const draftStock = numberValue(stock);
    if (!Number.isFinite(draftPrice) || draftPrice <= 0) {
      price.setAttribute("aria-invalid", "true");
      priceError.textContent = "售价必须高于 CNY 0.00。";
      priceError.hidden = false;
      firstInvalid = price;
    }
    if (!Number.isInteger(draftStock) || draftStock < 0) {
      stock.setAttribute("aria-invalid", "true");
      stockError.textContent = "可售库存必须是 0 或更大的整数。";
      stockError.hidden = false;
      firstInvalid ??= stock;
    }
    return firstInvalid;
  }

  function differenceSummary(state) {
    if (state === "normal") return "无待保存更改";
    if (state === "permission") return "只读：售价、库存与渠道状态均保持不变";
    if (state === "committed") return `${formattedPrice(currentPrice)} · ${currentStock} 件可售 · 渠道发布仍为 2 / 3`;
    const draftPrice = numberValue(price);
    const draftStock = numberValue(stock);
    const changes = [];
    if (Number.isFinite(draftPrice) && draftPrice !== currentPrice) changes.push(`售价 ${formattedPrice(currentPrice)} → ${formattedPrice(draftPrice)}`);
    if (Number.isFinite(draftStock) && draftStock !== currentStock) changes.push(`可售 ${currentStock} → ${draftStock}`);
    return `${changes.length ? changes.join("；") : "没有有效字段变化"}；渠道发布仍为 2 / 3`;
  }

  function statusMessage(state) {
    const changed = [numberValue(price) !== currentPrice, numberValue(stock) !== currentStock].filter(Boolean).length;
    const messages = {
      normal: "商品数据已加载，没有待保存更改。",
      pending: `${changed} 项本地更改待保存；当前记录值保持可见。`,
      error: "请修正标记字段；当前商品记录没有改变。",
      loading: "正在保存到本地参考；不会自动发布到渠道。",
      committed: "本地参考已保存为修订 R19；未发送到服务端。",
      permission: "当前角色没有商品编辑权限；未创建草稿。",
      failed: "保存失败；当前记录值保持不变，可重试或放弃本地更改。",
    };
    return messages[state];
  }

  function activityMessage(state) {
    if (state === "normal" && (currentPrice !== 1299 || currentStock !== 6)) return "本地修订 R19 保持为当前记录，未发布到渠道。";
    const messages = {
      normal: "商品数据已加载，记录值未改变。",
      pending: "本地草稿包含未保存的商品更改。",
      error: "本地草稿校验失败，记录值未改变。",
      loading: "本地参考正在保存商品更改。",
      committed: "本地参考已保存为修订 R19，未发布到渠道。",
      permission: "当前角色被限制为只读，没有创建草稿。",
      failed: "保存失败，本地草稿已保留，记录值未改变。",
    };
    return messages[state];
  }

  function syncApproval(state) {
    if (state === "committed" || currentPrice !== 1299 || currentStock !== 6) {
      approvalTitle.textContent = "本地修订等待审批";
      approvalCopy.textContent = `修订 R19 将基础售价调整为 ${formattedPrice(currentPrice)}；仍未发布到任何渠道。`;
      return;
    }
    approvalTitle.textContent = "价格调整等待审批";
    approvalCopy.textContent = "建议从 CNY 1,399.00 调整为 CNY 1,299.00；尚未发布到任何渠道。";
  }

  function writeCommerceState(state) {
    const url = new URL(location.href);
    url.searchParams.set("edit", state);
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  function renderState(state, { writeUrl = false, commit = false } = {}) {
    if (!fixtures[state]) state = "normal";
    if (commit) {
      currentPrice = numberValue(price);
      currentStock = numberValue(stock);
    }
    form.dataset.state = state;
    form.setAttribute("aria-busy", String(state === "loading"));
    fields.disabled = state === "loading" || state === "permission";
    stateLabel.dataset.state = state;
    stateLabel.textContent = labels[state];
    permission.hidden = state !== "permission";
    saveFailure.hidden = state !== "failed";
    retry.hidden = state !== "failed";
    retry.disabled = state !== "failed";
    save.hidden = state === "failed";
    save.disabled = ["normal", "loading", "committed", "permission", "failed"].includes(state);
    discard.disabled = ["normal", "loading", "committed", "permission"].includes(state);
    if (state === "error") validateFields();
    else clearValidation();
    syncCurrentValues();
    impact.textContent = differenceSummary(state);
    status.textContent = statusMessage(state);
    activity.textContent = activityMessage(state);
    syncApproval(state);
    if (writeUrl) writeCommerceState(state);
  }

  function applyFixture(state) {
    const fixture = fixtures[state] ?? fixtures.normal;
    currentPrice = fixture.currentPrice;
    currentStock = fixture.currentStock;
    price.value = fixture.draftPrice.toFixed(2);
    stock.value = String(fixture.draftStock);
    renderState(fixtures[state] ? state : "normal");
  }

  function startSave() {
    clearTimeout(saveTimer);
    renderState("loading", { writeUrl: true });
    saveTimer = setTimeout(() => renderState("committed", { writeUrl: true, commit: true }), 650);
  }

  form.addEventListener("input", () => {
    clearTimeout(saveTimer);
    renderState("pending", { writeUrl: true });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const firstInvalid = validateFields();
    if (firstInvalid) {
      renderState("error", { writeUrl: true });
      firstInvalid.focus();
      return;
    }
    startSave();
  });

  discard.addEventListener("click", () => {
    clearTimeout(saveTimer);
    price.value = currentPrice.toFixed(2);
    stock.value = String(currentStock);
    renderState("normal", { writeUrl: true });
  });
  retry.addEventListener("click", startSave);

  const requestedState = new URLSearchParams(location.search).get("edit");
  applyFixture(requestedState);
}

setupCommerceEditor();

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

function syncCanvasPanelLayoutAndFixture() {
  syncCanvasPanelLayouts();
  const requestedCanvasPanel = new URLSearchParams(location.search).get("panel");
  if (requestedCanvasPanel === "layers") setCanvasLayers(true, false);
  if (requestedCanvasPanel === "properties") setCanvasProperties(true, false);
}

canvasMobileLayout.addEventListener("change", syncCanvasPanelLayoutAndFixture);
canvasInspectorOverlay.addEventListener("change", syncCanvasPanelLayoutAndFixture);
reducedMotion.addEventListener("change", syncCanvasPanelMotionPreference);

applyContrast(document.documentElement.dataset.contrast === "more", false);
setSplitWidth(Number(localStorage.getItem(splitStorageKey)) || splitDefault, false);
syncCanvasPanelMotionPreference();
syncCanvasPanelLayoutAndFixture();
syncToolbarTabStop();
