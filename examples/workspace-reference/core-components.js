import {
  Activity,
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  CirclePause,
  CirclePlay,
  Copy,
  createIcons,
  Ellipsis,
  Eye,
  EyeOff,
  ExternalLink,
  History,
  KeyRound,
  Link,
  ListFilter,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  MousePointerClick,
  PanelRightOpen,
  PanelTop,
  Pause,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  TableProperties,
  TextCursorInput,
  X,
} from "lucide";

const media = matchMedia("(prefers-color-scheme: dark)");
const themeButtons = [...document.querySelectorAll("[data-theme-value]")];
const contrastButton = document.querySelector("[data-contrast-toggle]");
let coreSonnerModulePromise;

const iconSet = {
  Activity,
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  CirclePause,
  CirclePlay,
  Copy,
  Ellipsis,
  Eye,
  EyeOff,
  ExternalLink,
  History,
  KeyRound,
  Link,
  ListFilter,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  MousePointerClick,
  PanelRightOpen,
  PanelTop,
  Pause,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  TableProperties,
  TextCursorInput,
  X,
};

function renderIcons() {
  createIcons({
    icons: iconSet,
    attrs: { "aria-hidden": "true", "stroke-width": 1.5 },
  });
}

function applyTheme(preference, persist = true) {
  const theme = preference === "system" ? (media.matches ? "dark" : "light") : preference;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = preference;
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#08090a" : "#f6f7f8";
  for (const button of themeButtons) button.setAttribute("aria-pressed", String(button.dataset.themeValue === preference));
  if (persist) localStorage.setItem("kin-reference-theme", preference);
  if (coreSonnerModulePromise) coreSonnerModulePromise.then((module) => module.updateToasterTheme(theme, "zh"));
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

const fileUpload = document.querySelector("[data-file-upload]");
const fileInput = fileUpload.querySelector("[data-file-input]");
const fileDropzone = fileUpload.querySelector("[data-file-dropzone]");
const fileBrowse = fileUpload.querySelector("[data-file-browse]");
const fileStatus = fileUpload.querySelector("[data-file-status]");
const fileName = fileUpload.querySelector("[data-file-name]");
const fileState = fileUpload.querySelector("[data-file-state]");
const fileProgress = fileUpload.querySelector("[data-file-progress]");
const fileMessage = fileUpload.querySelector("[data-file-message]");
const fileCancel = fileUpload.querySelector("[data-file-cancel]");
const fileRetry = fileUpload.querySelector("[data-file-retry]");
const fileRemove = fileUpload.querySelector("[data-file-remove]");
const acceptedFileTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);
const maxFileSize = 10 * 1024 * 1024;
let selectedFile = null;
let uploadTimer = 0;
let validationTimer = 0;
let transferAttempt = 0;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function stopFileTimers() {
  clearInterval(uploadTimer);
  clearTimeout(validationTimer);
  uploadTimer = 0;
  validationTimer = 0;
}

function renderFileState(state, label, message, progress = 0) {
  fileStatus.dataset.state = state;
  fileStatus.setAttribute("aria-busy", String(["validating", "uploading"].includes(state)));
  fileState.textContent = label;
  fileMessage.textContent = message;
  fileProgress.value = progress;
  fileProgress.textContent = `${progress}%`;
  fileProgress.hidden = state !== "uploading";
  fileCancel.hidden = !["validating", "uploading"].includes(state);
  fileRetry.hidden = !["failed", "cancelled"].includes(state) || !selectedFile || state === "failed-validation";
  fileRemove.hidden = !selectedFile || ["validating", "uploading"].includes(state);
}

function resetFileUpload() {
  stopFileTimers();
  selectedFile = null;
  transferAttempt = 0;
  fileInput.value = "";
  fileName.textContent = "尚未选择文件";
  renderFileState("empty", "等待选择", "选择前可查看类型、大小和隐私约束。");
}

function failFileValidation(message) {
  renderFileState("failed-validation", "验证失败", message);
  fileRetry.hidden = true;
  fileRemove.hidden = false;
}

function rejectDroppedSelection(message) {
  stopFileTimers();
  selectedFile = null;
  transferAttempt = 0;
  fileInput.value = "";
  fileName.textContent = "未接受拖放内容";
  failFileValidation(message);
  fileRemove.hidden = true;
}

function startLocalTransfer() {
  stopFileTimers();
  transferAttempt += 1;
  let progress = 0;
  renderFileState("uploading", "本地模拟中", "正在运行本地交互 fixture；文件不会发送到服务器。", progress);
  uploadTimer = setInterval(() => {
    progress = Math.min(100, progress + 20);
    fileProgress.value = progress;
    fileProgress.textContent = `${progress}%`;
    if (selectedFile?.name.toLocaleLowerCase().includes("retry") && transferAttempt === 1 && progress >= 60) {
      stopFileTimers();
      renderFileState("failed", "模拟传输失败", "本地 fixture 在传输阶段失败。可重试；没有文件离开此页面。", progress);
      return;
    }
    if (progress >= 100) {
      stopFileTimers();
      renderFileState("complete", "本地模拟完成", "本地交互已完成；未连接服务器，也未创建真实上传记录。", 100);
    }
  }, 55);
}

function validateSelectedFile(file) {
  stopFileTimers();
  selectedFile = file;
  transferAttempt = 0;
  fileName.textContent = `${file.name} · ${formatFileSize(file.size)}`;
  renderFileState("validating", "正在验证", "正在检查文件类型与大小；尚未开始模拟传输。");
  validationTimer = setTimeout(() => {
    const extensionAccepted = /\.(pdf|png|jpe?g)$/i.test(file.name);
    if (!acceptedFileTypes.has(file.type) && !extensionAccepted) {
      failFileValidation("文件类型不受支持。请选择 PDF、PNG 或 JPG。");
      return;
    }
    if (file.size > maxFileSize) {
      failFileValidation("文件超过 10 MB 限制。请选择更小的文件。");
      return;
    }
    startLocalTransfer();
  }, 70);
}

fileBrowse.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const [file] = fileInput.files;
  if (file) validateSelectedFile(file);
});
for (const eventName of ["dragenter", "dragover"]) {
  fileDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    fileDropzone.classList.add("is-drag-active");
  });
}
for (const eventName of ["dragleave", "drop"]) {
  fileDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    fileDropzone.classList.remove("is-drag-active");
  });
}
fileDropzone.addEventListener("drop", (event) => {
  const files = [...event.dataTransfer.files];
  const hasDirectory = [...event.dataTransfer.items].some((item) => {
    const entry = typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null;
    return entry?.isDirectory;
  });
  if (hasDirectory) {
    rejectDroppedSelection("不支持文件夹。请选择一个 PDF、PNG 或 JPG 文件。");
    return;
  }
  if (files.length !== 1) {
    rejectDroppedSelection(files.length > 1 ? "一次只能选择 1 个文件。" : "未检测到本地文件；不接受 URL 或文本拖放。");
    return;
  }
  validateSelectedFile(files[0]);
});
fileCancel.addEventListener("click", () => {
  stopFileTimers();
  renderFileState("cancelled", "已取消", "本地模拟已取消。可重试或移除所选文件。", Number(fileProgress.value));
});
fileRetry.addEventListener("click", startLocalTransfer);
fileRemove.addEventListener("click", resetFileUpload);

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
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const transientSurfaceCleanups = new WeakMap();

function setTransientSurface(surface, open, { trigger, focusTarget, restoreFocus = false } = {}) {
  const cleanup = transientSurfaceCleanups.get(surface);
  if (cleanup) cleanup();

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
    transientSurfaceCleanups.delete(surface);
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
  transientSurfaceCleanups.set(surface, detach);
}

function closeMenu(restore = true) {
  setTransientSurface(sampleMenu, false, { trigger: menuTrigger, restoreFocus: restore });
}
menuTrigger.addEventListener("click", () => {
  const open = sampleMenu.hidden || sampleMenu.dataset.state === "closing";
  setTransientSurface(sampleMenu, open, { trigger: menuTrigger, focusTarget: menuItems[0] });
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
  setTransientSurface(contextMenu, open, { trigger: contextTarget, focusTarget: contextItems[0], restoreFocus: restore });
}
contextTarget.addEventListener("click", () => setContextMenu(contextMenu.hidden || contextMenu.dataset.state === "closing"));
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

for (const toggle of document.querySelectorAll("[data-truncation-toggle]")) {
  const fullValue = document.querySelector(`#${toggle.getAttribute("aria-controls")}`);
  const sample = toggle.closest(".truncation-sample");
  const preview = sample.querySelector("[data-truncation-preview]");
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    toggle.textContent = expanded ? "显示完整值" : "收起完整值";
    preview.hidden = !expanded;
    fullValue.hidden = expanded;
  });
}

const authForm = document.querySelector("[data-auth-form]");
const authPassword = authForm.querySelector("[data-auth-password]");
const passwordToggle = authForm.querySelector("[data-password-toggle]");
const authStatus = authForm.querySelector("[data-auth-status]");

passwordToggle.addEventListener("click", () => {
  const revealing = authPassword.type === "password";
  authPassword.type = revealing ? "text" : "password";
  passwordToggle.setAttribute("aria-pressed", String(revealing));
  passwordToggle.setAttribute("aria-label", revealing ? "隐藏密码" : "显示密码");
  passwordToggle.dataset.controlState = revealing ? "active" : "default";
  authPassword.focus();
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!authForm.checkValidity()) {
    authForm.reportValidity();
    return;
  }
  authStatus.textContent = "这是本地界面参考，未连接身份服务，也不会发送凭据。";
  authStatus.focus();
});

const reauthDialog = document.querySelector("[data-reauth-dialog]");
const reauthOpen = document.querySelector("[data-reauth-open]");
const reauthCancel = reauthDialog.querySelector("[data-reauth-cancel]");
const reauthForm = reauthDialog.querySelector("[data-reauth-form]");
const reauthStatus = reauthDialog.querySelector("[data-reauth-status]");

reauthOpen.addEventListener("click", () => {
  reauthStatus.textContent = "";
  reauthDialog.showModal();
  reauthForm.elements.namedItem("reauth-password").focus();
});
reauthCancel.addEventListener("click", () => reauthDialog.close("cancel"));
reauthForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!reauthForm.checkValidity()) {
    reauthForm.reportValidity();
    return;
  }
  reauthStatus.textContent = "这是本地界面参考；连接真实身份服务后才能继续。";
  reauthStatus.focus();
});
reauthDialog.addEventListener("close", () => reauthOpen.focus());

async function getCoreSonner() {
  coreSonnerModulePromise ??= import("../../site/assets/sonner-island.js");
  return coreSonnerModulePromise;
}

const motionToggle = document.querySelector("[data-motion-toggle]");
motionToggle.addEventListener("click", () => {
  const active = motionToggle.getAttribute("aria-pressed") !== "true";
  motionToggle.setAttribute("aria-pressed", String(active));
  motionToggle.dataset.controlState = active ? "active" : "default";
  motionToggle.querySelector("[data-action-label]").textContent = active ? "暂停监测" : "开始监测";
});

const motionSave = document.querySelector("[data-motion-save]");
motionSave.addEventListener("click", () => {
  if (motionSave.disabled) return;
  const label = motionSave.querySelector("[data-action-label]");
  motionSave.disabled = true;
  motionSave.classList.add("is-pending");
  motionSave.dataset.controlState = "pending";
  label.textContent = "正在保存";
  window.setTimeout(async () => {
    motionSave.classList.remove("is-pending");
    motionSave.classList.add("is-complete");
    motionSave.dataset.controlState = "success";
    label.textContent = "已保存";
    const sonner = await getCoreSonner();
    sonner.showKinToast({
      title: "视图已保存",
      description: "筛选条件和列顺序已更新。",
      theme: document.documentElement.dataset.theme,
      locale: "zh",
      tone: "success",
    });
    window.setTimeout(() => {
      motionSave.classList.remove("is-complete");
      motionSave.disabled = false;
      motionSave.dataset.controlState = "default";
      label.textContent = "保存视图";
    }, 1100);
  }, 650);
});

document.querySelector("[data-motion-toast]").addEventListener("click", async () => {
  const sonner = await getCoreSonner();
  sonner.showKinTaskToast({
    loadingTitle: "正在创建导出任务",
    successTitle: "导出任务已创建",
    description: "完成后可在下载中心查看。",
    theme: document.documentElement.dataset.theme,
    locale: "zh",
    duration: 850,
  });
});

const motionDisclosure = document.querySelector("[data-motion-disclosure]");
const motionDetails = document.querySelector(`#${motionDisclosure.getAttribute("aria-controls")}`);
motionDetails.inert = true;
motionDisclosure.addEventListener("click", () => {
  const open = motionDisclosure.getAttribute("aria-expanded") !== "true";
  motionDisclosure.setAttribute("aria-expanded", String(open));
  motionDetails.dataset.state = open ? "open" : "closed";
  motionDetails.setAttribute("aria-hidden", String(!open));
  motionDetails.inert = !open;
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
const referenceHeader = document.querySelector(".reference-header");
const coreReference = document.querySelector("#core-reference");
let drawerPhaseTimer;

function setDrawer(open, restoreFocus = true) {
  window.clearTimeout(drawerPhaseTimer);
  drawerLayer.dataset.state = open ? "open" : "closed";
  drawerLayer.dataset.phase = open ? "opening" : "closing";
  drawerLayer.setAttribute("aria-hidden", String(!open));
  drawerLayer.inert = !open;
  referenceHeader.inert = open;
  coreReference.inert = open;
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
drawer.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    setDrawer(false);
  }
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
  setTransientSurface(popover, open, { trigger: popoverTrigger, focusTarget: popoverClose, restoreFocus: restore });
}
popoverTrigger.addEventListener("click", () => setPopover(popover.hidden || popover.dataset.state === "closing"));
popoverClose.addEventListener("click", () => setPopover(false, true));
popover.addEventListener("keydown", (event) => { if (event.key === "Escape") setPopover(false, true); });

applyTheme(document.documentElement.dataset.themePreference || "system", false);
applyContrast(document.documentElement.dataset.contrast === "more", false);
renderIcons();
