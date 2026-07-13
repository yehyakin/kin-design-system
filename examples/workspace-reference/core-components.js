const media = matchMedia("(prefers-color-scheme: dark)");
const themeButtons = [...document.querySelectorAll("[data-theme-value]")];
const contrastButton = document.querySelector("[data-contrast-toggle]");

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

const switchControl = document.querySelector("[data-core-switch]");
switchControl.addEventListener("click", () => {
  switchControl.setAttribute("aria-checked", String(switchControl.getAttribute("aria-checked") !== "true"));
});

for (const group of document.querySelectorAll("[data-segment-group]")) {
  group.addEventListener("click", (event) => {
    const selected = event.target.closest("button");
    if (!selected) return;
    for (const button of group.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button === selected));
  });
}

const combo = document.querySelector("[data-combobox]");
const comboList = document.querySelector("#owner-options");
const comboOptions = [...comboList.querySelectorAll("[data-combo-option]")];
let comboIndex = -1;

comboOptions.forEach((option, index) => { option.id = `owner-option-${index}`; });

function visibleComboOptions() {
  return comboOptions.filter((option) => !option.hidden);
}

function setComboOpen(open) {
  comboList.hidden = !open;
  combo.setAttribute("aria-expanded", String(open));
  if (!open) {
    combo.removeAttribute("aria-activedescendant");
    comboIndex = -1;
    for (const option of comboOptions) option.removeAttribute("aria-selected");
  }
}

function setComboActive(nextIndex) {
  const options = visibleComboOptions();
  if (!options.length) return;
  comboIndex = (nextIndex + options.length) % options.length;
  options.forEach((option, index) => option.setAttribute("aria-selected", String(index === comboIndex)));
  combo.setAttribute("aria-activedescendant", options[comboIndex].id);
}

function commitCombo(option) {
  combo.value = option.textContent.trim();
  setComboOpen(false);
  combo.focus();
}

combo.addEventListener("focus", () => setComboOpen(true));
combo.addEventListener("input", () => {
  const query = combo.value.trim().toLocaleLowerCase();
  for (const option of comboOptions) option.hidden = !option.textContent.toLocaleLowerCase().includes(query);
  setComboOpen(true);
  if (visibleComboOptions().length) setComboActive(0);
});
combo.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    setComboOpen(true);
    setComboActive(comboIndex + (event.key === "ArrowDown" ? 1 : -1));
  }
  if (event.key === "Enter" && comboIndex >= 0) {
    event.preventDefault();
    commitCombo(visibleComboOptions()[comboIndex]);
  }
  if (event.key === "Escape") setComboOpen(false);
});
for (const option of comboOptions) option.addEventListener("click", () => commitCombo(option));

document.querySelector("[data-core-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("[data-form-result]").textContent = "规则已保存到当前工作区。";
});

const searchField = document.querySelector("[data-core-search]");
const searchStatus = document.querySelector("[data-search-status]");
document.querySelector("[data-search-clear]").addEventListener("click", () => {
  searchField.value = "";
  searchStatus.textContent = "输入名称或 SKU 缩小结果范围。";
  searchField.focus();
});
searchField.addEventListener("input", () => {
  searchStatus.textContent = searchField.value ? `正在筛选“${searchField.value}”` : "输入名称或 SKU 缩小结果范围。";
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  for (const candidate of tabs) {
    const selected = candidate === tab;
    candidate.setAttribute("aria-selected", String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    document.querySelector(`#${candidate.getAttribute("aria-controls")}`).hidden = !selected;
  }
  tab.focus();
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    selectTab(tabs[next]);
  });
}

const menuTrigger = document.querySelector("[data-menu-trigger]");
const sampleMenu = document.querySelector(".sample-menu");
const menuItems = [...sampleMenu.querySelectorAll('[role="menuitem"]')];
function closeMenu(restore = true) {
  sampleMenu.hidden = true;
  menuTrigger.setAttribute("aria-expanded", "false");
  if (restore) menuTrigger.focus();
}
menuTrigger.addEventListener("click", () => {
  const open = sampleMenu.hidden;
  sampleMenu.hidden = !open;
  menuTrigger.setAttribute("aria-expanded", String(open));
  if (open) menuItems[0].focus();
});
sampleMenu.addEventListener("keydown", (event) => {
  const index = menuItems.indexOf(document.activeElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    menuItems[(index + (event.key === "ArrowDown" ? 1 : -1) + menuItems.length) % menuItems.length].focus();
  }
  if (event.key === "Escape") closeMenu();
});
for (const item of menuItems) item.addEventListener("click", () => closeMenu());

const contextTarget = document.querySelector("[data-context-target]");
const contextMenu = document.querySelector(".context-menu");
const contextItems = [...contextMenu.querySelectorAll('[role="menuitem"]')];
function setContextMenu(open, restore = false) {
  contextMenu.hidden = !open;
  contextTarget.setAttribute("aria-expanded", String(open));
  if (open) contextItems[0].focus();
  else if (restore) contextTarget.focus();
}
contextTarget.addEventListener("click", () => setContextMenu(contextMenu.hidden));
contextTarget.addEventListener("contextmenu", (event) => { event.preventDefault(); setContextMenu(true); });
contextTarget.addEventListener("keydown", (event) => {
  if ((event.shiftKey && event.key === "F10") || event.key === "ContextMenu") { event.preventDefault(); setContextMenu(true); }
});
contextMenu.addEventListener("keydown", (event) => {
  const index = contextItems.indexOf(document.activeElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    contextItems[(index + (event.key === "ArrowDown" ? 1 : -1) + contextItems.length) % contextItems.length].focus();
  }
  if (event.key === "Escape") setContextMenu(false, true);
});
for (const item of contextItems) item.addEventListener("click", () => setContextMenu(false, true));

const tooltipSample = document.querySelector(".tooltip-sample");
const tooltipTrigger = tooltipSample.querySelector("button");
tooltipTrigger.addEventListener("keydown", (event) => {
  if (event.key === "Escape") tooltipSample.classList.add("is-dismissed");
});
tooltipTrigger.addEventListener("blur", () => tooltipSample.classList.remove("is-dismissed"));

const tree = document.querySelector('[role="tree"]');
const treeItems = [...tree.querySelectorAll('[role="treeitem"]')];
function focusTreeItem(next) {
  for (const item of treeItems) item.tabIndex = item === next ? 0 : -1;
  next.focus();
}
tree.addEventListener("keydown", (event) => {
  const current = document.activeElement.closest('[role="treeitem"]');
  const index = treeItems.indexOf(current);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    focusTreeItem(treeItems[Math.max(0, Math.min(treeItems.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))]);
  }
  if (event.key === "ArrowRight" && current.hasAttribute("aria-expanded")) {
    event.preventDefault();
    current.setAttribute("aria-expanded", "true");
    const child = current.querySelector('[role="treeitem"]');
    if (child) focusTreeItem(child);
  }
  if (event.key === "ArrowLeft") {
    const parent = current.parentElement.closest('[role="treeitem"]');
    if (parent) { event.preventDefault(); focusTreeItem(parent); }
    else if (current.hasAttribute("aria-expanded")) { event.preventDefault(); current.setAttribute("aria-expanded", "false"); }
  }
});

const dialog = document.querySelector(".core-dialog");
const dialogOpen = document.querySelector("[data-dialog-open]");
dialogOpen.addEventListener("click", () => {
  dialog.showModal();
  dialog.querySelector('button[value="cancel"]').focus();
});
dialog.addEventListener("close", () => dialogOpen.focus());

const drawerLayer = document.querySelector("[data-drawer-layer]");
const drawer = drawerLayer.querySelector(".core-drawer");
const drawerOpen = document.querySelector("[data-drawer-open]");
const drawerClose = drawer.querySelector("[data-drawer-close]");
const drawerScrim = drawerLayer.querySelector("[data-drawer-scrim]");

function closeDrawer() {
  drawerLayer.hidden = true;
  document.body.style.overflow = "";
  drawerOpen.focus();
}
drawerOpen.addEventListener("click", () => {
  drawerLayer.hidden = false;
  document.body.style.overflow = "hidden";
  drawerClose.focus();
});
drawerClose.addEventListener("click", closeDrawer);
drawerScrim.addEventListener("click", closeDrawer);
drawer.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
  if (event.key !== "Tab") return;
  const focusable = [...drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((element) => !element.disabled);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

const popoverTrigger = document.querySelector("[data-popover-trigger]");
const popover = document.querySelector(".sample-popover");
const popoverClose = popover.querySelector("[data-popover-close]");
function setPopover(open, restore = false) {
  popover.hidden = !open;
  popoverTrigger.setAttribute("aria-expanded", String(open));
  if (open) popoverClose.focus();
  else if (restore) popoverTrigger.focus();
}
popoverTrigger.addEventListener("click", () => setPopover(popover.hidden));
popoverClose.addEventListener("click", () => setPopover(false, true));
popover.addEventListener("keydown", (event) => { if (event.key === "Escape") setPopover(false, true); });

applyTheme(document.documentElement.dataset.themePreference || "system", false);
applyContrast(document.documentElement.dataset.contrast === "more", false);
