import {
  Activity,
  Check,
  CirclePlay,
  Contrast,
  createIcons,
  Database,
  Ellipsis,
  ExternalLink,
  Languages,
  LayoutDashboard,
  Link,
  LoaderCircle,
  Moon,
  PanelRight,
  Pause,
  RefreshCw,
  Save,
  ScanLine,
  Search,
  Star,
  Sun,
  TriangleAlert,
  X,
} from "lucide";

const root = document.documentElement;
const media = matchMedia("(prefers-color-scheme: dark)");
const themeColor = document.querySelector('meta[name="theme-color"]');
const themeSwitch = document.querySelector("[data-theme-switch]");
const appShell = document.querySelector(".app-shell");
const sidebar = document.querySelector(".sidebar");
const workspace = document.querySelector(".workspace");
const inspector = document.querySelector(".inspector");
const inspectorOpen = document.querySelector("[data-inspector-open]");
const inspectorClose = document.querySelector("[data-inspector-close]");
const inspectorScrim = document.querySelector("[data-inspector-scrim]");
const contrastToggle = document.querySelector("[data-contrast-toggle]");
const locationOverflow = document.querySelector("[data-location-overflow]");
const locationOverflowTrigger = document.querySelector("[data-location-overflow-trigger]");
const locationOverflowMenu = document.querySelector("[data-location-overflow-menu]");
const locationOverflowItems = [...locationOverflowMenu.querySelectorAll('[role^="menuitem"]')];
const copyLocation = document.querySelector("[data-copy-location]");
const locationStatus = document.querySelector("[data-location-status]");
const languageControl = document.querySelector("[data-language-control]");
const languageTrigger = document.querySelector("[data-language-trigger]");
const languageMenu = document.querySelector("[data-language-menu]");
const localeButtons = [...document.querySelectorAll("[data-locale-value]")];
const overlayLayout = matchMedia("(max-width: 1180px)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let sonnerModulePromise;
const transientSurfaceCleanups = new WeakMap();

function transientIsOpen(surface) {
  return surface.dataset.state === "opening" || surface.dataset.state === "open";
}

function setTransientSurface(surface, open, { trigger, focusTarget, restoreFocus = false } = {}) {
  transientSurfaceCleanups.get(surface)?.();
  if (open) {
    surface.hidden = false;
    surface.inert = false;
    surface.dataset.state = "opening";
    trigger.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => {
      if (surface.dataset.state !== "opening") return;
      surface.dataset.state = "open";
      focusTarget?.focus();
    });
    return;
  }

  trigger.setAttribute("aria-expanded", "false");
  surface.inert = true;
  surface.dataset.state = "closing";
  if (restoreFocus) trigger.focus();

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

const copy = {
  zh: {
    skip: "跳到主要内容", primaryNav: "主导航", workspaceNav: "工作区", overview: "情报概览",
    database: "对象数据库", signals: "风险信号", monitoring: "监测任务", savedViews: "保存视图",
    stable: "近期稳定", changed: "最近变化", review: "等待复核", workspaceSettings: "工作区设置",
    admin: "管理员", breadcrumb: "面包屑", search: "搜索", properties: "属性", language: "切换语言",
    contrast: "切换高对比度", moreActions: "更多操作", copyLink: "复制对象链接", copiedLink: "对象链接已复制", copyLinkFailed: "无法复制对象链接",
    entityViews: "对象视图", summaryTab: "概览", activityTab: "事件",
    sourcesTab: "来源", relationsTab: "关联", description: "持续记录入口、公开频道、运行状态和可验证事件。",
    follow: "加入关注", runScan: "运行检测", metrics: "关键指标", currentStatus: "当前状态",
    healthy: "正常", operatingRecord: "运营记录", operatingValue: "6 年 3 个月", completeness: "数据完整度",
    latestEvent: "最近事件", latestEventValue: "2 小时前", statusSummary: "状态摘要",
    statusSummaryDescription: "基于最近一次公开数据和监测结果。", updatedAt: "更新于 14:32",
    summaryText: "官网与公开频道当前可访问。过去 30 天记录到 2 次短时异常，均已恢复；现有证据不足以提高风险等级。",
    recentEvents: "最近事件", eventsDescription: "变化按发生时间排列，结论与来源分开显示。", viewAll: "查看全部",
    todayTime: "今天 09:42", eventOneTitle: "香港节点延迟恢复正常", eventOneBody: "HK-02 延迟从 328ms 降至 89ms。",
    monitorSystem: "检测系统", yesterdayTime: "昨天 23:18", eventTwoTitle: "公开频道发布维护通知",
    eventTwoBody: "计划维护窗口为 7 月 13 日 02:00–03:00。", publicChannel: "公开频道", dateTime: "7 月 9 日",
    eventThreeTitle: "主域名证书完成续期", eventThreeBody: "证书签发机构未发生变化。", certificateMonitor: "证书监测",
    currentObject: "当前对象", closeInspector: "关闭属性面板", status: "状态", operatingStatus: "运行状态",
    riskLevel: "风险等级", watch: "观察", lastScan: "最后检测", lastScanValue: "3 分钟前", operations: "运营信息",
    firstRecorded: "首次收录", primaryRegion: "主要地区", eastAsia: "东亚", relatedDomains: "关联域名",
    fourItems: "4 个", evidence: "证据", evidenceCount: "证据数量", sourceCount: "来源数量",
    confidence: "证据可信度", confidenceDefinition: "该分数表示当前证据来源的可信程度，不代表对象整体安全等级。",
    feedbackTitle: "交互反馈", feedbackDescription: "按钮状态说明操作进度，Sonner 只反馈用户主动触发的结果。",
    toggleLabel: "成对状态", watchButton: "暂停监测", watchingButton: "继续监测", toggleDescription: "图标、下一动作标签和 aria-pressed 共同表达可逆状态。",
    asyncLabel: "异步完成", saveButton: "保存视图", savingButton: "正在保存", savedButton: "已保存", asyncDescription: "同一按钮连续呈现等待、完成和恢复状态。",
    taskButton: "启动导出任务", taskDescription: "同一条通知从处理中更新为完成，不重复堆叠。",
    errorLabel: "失败与重试", retryButton: "模拟请求失败", errorDescription: "失败通知保留上下文，并提供明确的重试动作。",
    switchToLight: "切换到日间模式", switchToDark: "切换到夜间模式",
    followedTitle: "已加入关注", followedDescription: "Alpha Network 的变化会出现在关注视图中。", undo: "撤销", undone: "已撤销关注",
    scanTitle: "检测任务已创建", scanDescription: "系统将检测公开入口和监测节点。", viewTask: "查看任务", taskOpened: "检测任务已打开",
    savedTitle: "视图已保存", savedDescription: "筛选条件和列顺序已保存。",
    exportLoading: "正在创建导出任务", exportSuccess: "导出任务已创建", exportDescription: "任务完成后可在下载中心查看。",
    errorTitle: "请求失败", errorToastDescription: "监测服务暂时没有响应。", retry: "重试", retryQueued: "已重新提交请求",
  },
  en: {
    skip: "Skip to main content", primaryNav: "Primary navigation", workspaceNav: "Workspace", overview: "Overview",
    database: "Entity database", signals: "Risk signals", monitoring: "Monitoring", savedViews: "Saved views",
    stable: "Recently stable", changed: "Recent changes", review: "Pending review", workspaceSettings: "Workspace settings",
    admin: "Administrator", breadcrumb: "Breadcrumb", search: "Search", properties: "Properties", language: "Change language",
    contrast: "Toggle high contrast", moreActions: "More actions", copyLink: "Copy entity link", copiedLink: "Entity link copied", copyLinkFailed: "Unable to copy entity link",
    entityViews: "Entity views", summaryTab: "Summary", activityTab: "Activity",
    sourcesTab: "Sources", relationsTab: "Relations", description: "Tracks public endpoints, channels, operating status, and verifiable events.",
    follow: "Follow", runScan: "Run scan", metrics: "Key metrics", currentStatus: "Current status",
    healthy: "Healthy", operatingRecord: "Operating record", operatingValue: "6 years 3 months", completeness: "Data completeness",
    latestEvent: "Latest event", latestEventValue: "2 hours ago", statusSummary: "Status summary",
    statusSummaryDescription: "Based on the latest public data and monitoring result.", updatedAt: "Updated at 14:32",
    summaryText: "The website and public channel are currently reachable. Two brief incidents were recorded in the past 30 days and both recovered; current evidence does not justify raising the risk level.",
    recentEvents: "Recent activity", eventsDescription: "Changes are ordered by time, with findings separated from sources.", viewAll: "View all",
    todayTime: "Today 09:42", eventOneTitle: "Hong Kong node latency recovered", eventOneBody: "HK-02 latency fell from 328ms to 89ms.",
    monitorSystem: "Monitoring system", yesterdayTime: "Yesterday 23:18", eventTwoTitle: "Maintenance notice published",
    eventTwoBody: "The maintenance window is scheduled for July 13, 02:00–03:00.", publicChannel: "Public channel", dateTime: "July 9",
    eventThreeTitle: "Primary domain certificate renewed", eventThreeBody: "The certificate authority did not change.", certificateMonitor: "Certificate monitor",
    currentObject: "Current entity", closeInspector: "Close properties panel", status: "Status", operatingStatus: "Operating status",
    riskLevel: "Risk level", watch: "Watch", lastScan: "Last scan", lastScanValue: "3 minutes ago", operations: "Operations",
    firstRecorded: "First recorded", primaryRegion: "Primary region", eastAsia: "East Asia", relatedDomains: "Related domains",
    fourItems: "4 items", evidence: "Evidence", evidenceCount: "Evidence count", sourceCount: "Source count",
    confidence: "Evidence confidence", confidenceDefinition: "This score describes confidence in the current evidence sources, not the overall safety level of the entity.",
    feedbackTitle: "Interaction feedback", feedbackDescription: "Button states communicate progress; Sonner reports results initiated by the user.",
    toggleLabel: "Paired state", watchButton: "Pause monitoring", watchingButton: "Resume monitoring", toggleDescription: "The icon, next-action label, and aria-pressed communicate a reversible state together.",
    asyncLabel: "Async completion", saveButton: "Save view", savingButton: "Saving", savedButton: "Saved", asyncDescription: "One button moves through pending, complete, and restored states without shifting layout.",
    taskButton: "Start export task", taskDescription: "One notification updates from processing to complete instead of stacking duplicates.",
    errorLabel: "Failure and retry", retryButton: "Simulate request failure", errorDescription: "The error keeps its context and offers a clear retry action.",
    switchToLight: "Switch to light mode", switchToDark: "Switch to dark mode",
    followedTitle: "Added to following", followedDescription: "Changes to Alpha Network will appear in your followed view.", undo: "Undo", undone: "Follow removed",
    scanTitle: "Scan created", scanDescription: "Public endpoints and monitoring nodes will be checked.", viewTask: "View task", taskOpened: "Scan task opened",
    savedTitle: "View saved", savedDescription: "Filters and column order have been saved.",
    exportLoading: "Creating export task", exportSuccess: "Export task created", exportDescription: "The result will appear in Downloads when ready.",
    errorTitle: "Request failed", errorToastDescription: "The monitoring service did not respond.", retry: "Retry", retryQueued: "Request submitted again",
  },
};

function currentLocale() {
  return root.dataset.locale === "en" ? "en" : "zh";
}

function translate(locale, persist = true) {
  const messages = copy[locale];
  root.dataset.locale = locale;
  root.lang = locale === "zh" ? "zh-CN" : "en";
  for (const element of document.querySelectorAll("[data-i18n]")) {
    const value = messages[element.dataset.i18n];
    if (value) element.textContent = value;
  }
  for (const element of document.querySelectorAll("[data-i18n-aria]")) {
    const value = messages[element.dataset.i18nAria];
    if (value) element.setAttribute("aria-label", value);
  }
  for (const button of localeButtons) {
    const active = button.dataset.localeValue === locale;
    button.setAttribute("aria-current", active ? "true" : "false");
  }
  updateThemeSwitch(root.dataset.theme);
  if (persist) localStorage.setItem("kin-reference-locale", locale);
  if (sonnerModulePromise) sonnerModulePromise.then((module) => module.updateToasterTheme(root.dataset.theme, locale));
  const toggle = document.querySelector("[data-motion-toggle]");
  if (toggle) {
    const label = toggle.querySelector("span");
    label.textContent = messages[toggle.getAttribute("aria-pressed") === "true" ? "watchingButton" : "watchButton"];
  }
}

function updateThemeSwitch(theme) {
  const dark = theme === "dark";
  themeSwitch.setAttribute("aria-checked", String(dark));
  themeSwitch.setAttribute("aria-label", copy[currentLocale()][dark ? "switchToLight" : "switchToDark"]);
}

function applyTheme(preference, persist = true) {
  const theme = preference === "system" ? (media.matches ? "dark" : "light") : preference;
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  themeColor.content = theme === "dark" ? "#08090a" : "#f6f7f8";
  updateThemeSwitch(theme);
  if (persist) localStorage.setItem("kin-reference-theme", preference);
  if (sonnerModulePromise) sonnerModulePromise.then((module) => module.updateToasterTheme(theme, currentLocale()));
}

themeSwitch.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark"));
media.addEventListener("change", () => {
  if (root.dataset.themePreference === "system") applyTheme("system", false);
});

function applyContrast(enabled, persist = true) {
  root.dataset.contrast = enabled ? "more" : "normal";
  contrastToggle.setAttribute("aria-checked", String(enabled));
  if (persist) localStorage.setItem("kin-reference-contrast", enabled ? "more" : "normal");
}

function setLocationOverflow(open, moveFocus = true) {
  setTransientSurface(locationOverflowMenu, open, {
    trigger: locationOverflowTrigger,
    focusTarget: moveFocus ? locationOverflowItems[0] : null,
    restoreFocus: moveFocus && !open,
  });
}

locationOverflowTrigger.addEventListener("click", () => setLocationOverflow(!transientIsOpen(locationOverflowMenu)));
locationOverflowMenu.addEventListener("keydown", (event) => {
  const index = locationOverflowItems.indexOf(document.activeElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    locationOverflowItems[(index + (event.key === "ArrowDown" ? 1 : -1) + locationOverflowItems.length) % locationOverflowItems.length].focus();
  }
  if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    locationOverflowItems[event.key === "Home" ? 0 : locationOverflowItems.length - 1].focus();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    setLocationOverflow(false);
  }
});

contrastToggle.addEventListener("click", () => {
  applyContrast(root.dataset.contrast !== "more");
  setLocationOverflow(false);
});

copyLocation.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    locationStatus.textContent = copy[currentLocale()].copiedLink;
  } catch {
    locationStatus.textContent = copy[currentLocale()].copyLinkFailed;
  }
  setLocationOverflow(false);
});

function setLanguageMenu(open, moveFocus = true) {
  setTransientSurface(languageMenu, open, {
    trigger: languageTrigger,
    focusTarget: moveFocus ? languageMenu.querySelector('[role="menuitem"]') : null,
    restoreFocus: moveFocus && !open,
  });
}

languageTrigger.addEventListener("click", () => setLanguageMenu(!transientIsOpen(languageMenu)));
for (const button of localeButtons) {
  button.addEventListener("click", () => {
    translate(button.dataset.localeValue);
    setLanguageMenu(false);
  });
}
document.addEventListener("click", (event) => {
  if (transientIsOpen(languageMenu) && !languageControl.contains(event.target)) setLanguageMenu(false, false);
  if (transientIsOpen(locationOverflowMenu) && !locationOverflow.contains(event.target)) setLocationOverflow(false, false);
});

addEventListener("storage", (event) => {
  if (event.key === "kin-reference-theme") applyTheme(event.newValue || "system", false);
  if (event.key === "kin-reference-contrast") applyContrast(event.newValue === "more", false);
  if (event.key === "kin-reference-locale") translate(event.newValue === "en" ? "en" : "zh", false);
});

function inspectorIsOpen() {
  return appShell.classList.contains("inspector-open");
}

function syncInspectorMode() {
  if (overlayLayout.matches) {
    inspector.setAttribute("role", "dialog");
    inspector.setAttribute("aria-modal", "true");
  } else {
    inspector.removeAttribute("role");
    inspector.removeAttribute("aria-modal");
  }
}

function setInspector(open, moveFocus = true) {
  const modal = overlayLayout.matches && open;
  appShell.classList.toggle("inspector-closed", !open);
  appShell.classList.toggle("inspector-open", open);
  inspectorOpen.setAttribute("aria-expanded", String(open));
  inspector.setAttribute("aria-hidden", String(!open));
  inspector.inert = !open;
  sidebar.inert = modal;
  workspace.inert = modal;
  document.body.classList.toggle("inspector-modal-open", modal);
  syncInspectorMode();
  if (moveFocus) {
    if (open) inspectorClose.focus();
    else inspectorOpen.focus();
  }
}

inspectorOpen.addEventListener("click", () => setInspector(true));
inspectorClose.addEventListener("click", () => setInspector(false));
inspectorScrim.addEventListener("click", () => setInspector(false));

inspector.addEventListener("keydown", (event) => {
  if (!overlayLayout.matches || !inspectorIsOpen() || event.key !== "Tab") return;
  const focusable = [...inspector.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.disabled && !element.hidden);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && transientIsOpen(languageMenu)) {
    setLanguageMenu(false);
  } else if (event.key === "Escape" && transientIsOpen(locationOverflowMenu)) {
    setLocationOverflow(false);
  } else if (event.key === "Escape" && inspectorIsOpen()) {
    setInspector(false);
  }
});

async function showToast(kind) {
  sonnerModulePromise ??= import("../../site/assets/sonner-island.js");
  const module = await sonnerModulePromise;
  const messages = copy[currentLocale()];
  const isFollow = kind === "follow";
  const isError = kind === "error";
  module.showKinToast({
    title: messages[isError ? "errorTitle" : isFollow ? "followedTitle" : "scanTitle"],
    description: messages[isError ? "errorToastDescription" : isFollow ? "followedDescription" : "scanDescription"],
    actionLabel: messages[isError ? "retry" : isFollow ? "undo" : "viewTask"],
    undoTitle: messages[isError ? "retryQueued" : isFollow ? "undone" : "taskOpened"],
    theme: root.dataset.theme,
    locale: currentLocale(),
    tone: isError ? "error" : "default",
  });
}

for (const trigger of document.querySelectorAll("[data-toast]")) {
  trigger.addEventListener("click", () => showToast(trigger.dataset.toast));
}

const motionToggle = document.querySelector("[data-motion-toggle]");
motionToggle.addEventListener("click", () => {
  const active = motionToggle.getAttribute("aria-pressed") !== "true";
  motionToggle.setAttribute("aria-pressed", String(active));
  motionToggle.querySelector("span").textContent = copy[currentLocale()][active ? "watchingButton" : "watchButton"];
});

const asyncButton = document.querySelector("[data-motion-async]");
asyncButton.addEventListener("click", () => {
  if (asyncButton.disabled) return;
  const messages = copy[currentLocale()];
  const label = asyncButton.querySelector("[data-motion-label]");
  asyncButton.disabled = true;
  asyncButton.classList.add("is-loading");
  label.textContent = messages.savingButton;
  window.setTimeout(async () => {
    asyncButton.classList.remove("is-loading");
    asyncButton.classList.add("is-success");
    label.textContent = copy[currentLocale()].savedButton;
    sonnerModulePromise ??= import("../../site/assets/sonner-island.js");
    const module = await sonnerModulePromise;
    const currentMessages = copy[currentLocale()];
    module.showKinToast({
      title: currentMessages.savedTitle,
      description: currentMessages.savedDescription,
      theme: root.dataset.theme,
      locale: currentLocale(),
      tone: "success",
    });
    window.setTimeout(() => {
      asyncButton.classList.remove("is-success");
      asyncButton.disabled = false;
      label.textContent = copy[currentLocale()].saveButton;
    }, 1100);
  }, 700);
});

document.querySelector("[data-motion-task]").addEventListener("click", async () => {
  sonnerModulePromise ??= import("../../site/assets/sonner-island.js");
  const module = await sonnerModulePromise;
  const messages = copy[currentLocale()];
  module.showKinTaskToast({
    loadingTitle: messages.exportLoading,
    successTitle: messages.exportSuccess,
    description: messages.exportDescription,
    theme: root.dataset.theme,
    locale: currentLocale(),
  });
});

overlayLayout.addEventListener("change", (event) => setInspector(!event.matches, false));
applyTheme(root.dataset.themePreference || "system", false);
applyContrast(root.dataset.contrast === "more", false);
translate(root.dataset.locale === "en" ? "en" : "zh", false);
setInspector(!overlayLayout.matches, false);

createIcons({
  icons: {
    Activity,
    Check,
    CirclePlay,
    Contrast,
    Database,
    Ellipsis,
    ExternalLink,
    Languages,
    LayoutDashboard,
    Link,
    LoaderCircle,
    Moon,
    PanelRight,
    RefreshCw,
    Pause,
    Save,
    ScanLine,
    Search,
    Star,
    Sun,
    TriangleAlert,
    X,
  },
  attrs: { "aria-hidden": "true", "stroke-width": "1.5" },
});
