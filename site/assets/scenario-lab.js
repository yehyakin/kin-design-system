const requestedLocale = new URLSearchParams(window.location.search).get("lang");
const locale = requestedLocale === "zh-CN" ? "zh-CN" : "en";
const isChinese = locale === "zh-CN";
document.documentElement.lang = locale;

const STATIC_COPY_ZH = Object.freeze({
  "Skip to scenario inspection": "跳到场景预览",
  "KIN Design System home": "KIN 设计系统首页",
  "Design System": "设计系统",
  "Primary navigation": "主导航",
  "Showcase": "总览",
  "Components": "组件",
  "Patterns": "布局",
  "Scenarios": "场景",
  "Lab": "场景检查台",
  "Documentation": "文档",
  "Open navigation": "打开导航",
  "Search KIN": "搜索 KIN",
  "Search pages and sources": "搜索页面与规范",
  "Choose language": "选择语言",
  "Switch to light mode": "切换为日间模式",
  "Increase contrast": "增强对比度",
  "Pages": "页面",
  "Sources": "规范",
  "Scenario catalog": "场景目录",
  "Design contract": "设计规范",
  "No matching page or source.": "没有匹配的页面或规范。",
  "Use system theme": "跟随系统主题",
  "Scenario Lab toolbar": "场景检查台工具栏",
  "Back to the Scenario Atlas": "返回场景目录",
  "Scenario Lab": "场景检查台",
  "Back to scenarios": "返回场景",
  "Lab mode": "预览模式",
  "Present": "预览",
  "Inspect": "检查",
  "Inspection settings": "预览设置",
  "Choose a preview state.": "选择预览状态。",
  "Close inspection controls": "关闭预览设置",
  "Close": "关闭",
  "Only deterministic states implemented by the linked reference appear here.": "这里只显示当前预览已经实现且结果稳定的状态。",
  "Scenario": "场景",
  "Seventeen scenarios are available to preview.": "当前提供 17 个可预览场景。",
  "Reference state": "界面状态",
  "Viewport": "视口",
  "Wide": "宽屏",
  "Narrow": "窄屏",
  "Appearance": "外观",
  "Light": "日间",
  "Dark": "夜间",
  "Light HC": "日间高对比度",
  "Dark HC": "夜间高对比度",
  "Loading catalog...": "正在加载场景……",
  "User job": "要完成的任务",
  "Entry": "起点",
  "Completion": "完成条件",
  "Persistent context": "始终保留",
  "Known gaps": "仍需补充",
  "Motion follows the reference and the user's reduced-motion preference; this phase does not claim a separate motion fixture.": "动效由当前预览提供，并遵循系统的“减少动态效果”设置。",
  "Open this state directly": "在新标签页打开",
  "Loading scenario": "正在加载场景",
  "Preparing reference...": "正在准备预览……",
  "Preview controls": "预览工具",
  "Preview sizing": "预览尺寸",
  "Fit": "适应窗口",
  "Fullscreen": "全屏",
  "Resolved inspection settings": "当前预览设置",
  "Theme": "主题",
  "Preparing preview": "正在准备预览",
  "Scrollable scenario preview": "可滚动的场景预览",
  "Interactive reference": "交互预览",
  "Presentation poster for INT-02 in its normal, wide, dark state; not live verification.": "INT-02 常规、宽屏、夜间状态的静态预览图，不代表当前界面已经通过验证。",
  "Presentation poster only · INT-02 normal / wide / dark": "仅为展示海报 · INT-02 常规 / 宽屏 / 夜间",
  "Live reference": "交互预览",
  "Preparing Scenario Lab": "正在准备场景检查台",
  "Waiting for a catalog-backed selection.": "请选择一个可预览场景。",
  "Checking the live same-origin reference": "正在检查本地交互预览",
  "Scenario reference": "场景预览",
  "The inspection lab could not load.": "场景检查台无法加载。",
  "Check the local site build and try again.": "请检查本地站点构建后重试。",
  "Return to the Scenario Atlas": "返回场景目录",
  "JavaScript is required to resolve catalog fixtures and verify their state.": "加载交互预览需要启用 JavaScript。"
});

const LAB_COPY = Object.freeze({
  en: Object.freeze({
    checking_reference: "Checking live reference · {selection}",
    poster_label: "INT-02 presentation poster. ",
    neutral_label: "Neutral loading stage. ",
    current_selection: "Current selection: {selection}",
    checking_same_origin: "Checking the live same-origin reference",
    state_count_one: "{count} state",
    state_count_many: "{count} states",
    source: "{maturity} source",
    lab_title: "{name} - Scenario Inspection Lab",
    fit: "Fit / {percentage}%",
    fit_readonly: "Fit / {percentage}% / preview only",
    preview_scale: "Preview scale {percentage} percent. Configured viewport remains {width} by {height} pixels.",
    preview_scale_readonly: "Preview scale {percentage} percent. Touch interaction is paused at reduced scale; choose 100% or open the reference in a new tab.",
    exit_fullscreen: "Exit fullscreen",
    fullscreen: "Fullscreen",
    fullscreen_unavailable: "Fullscreen is unavailable in this browser.",
    open_direct: "Open {state} directly in a new tab",
    fixture_unavailable: "Preview unavailable",
    same_origin_unavailable: "The same-origin reference document could not be inspected.",
    invalid_selector: "Preview rule unavailable",
    verified: "Preview ready",
    fixture_failed: "Preview check failed",
    selector_failed: "The live reference did not pass its selector check",
    checking_fixture: "Preparing preview",
    inspection_unavailable: "Inspection unavailable",
    live_unavailable: "Live reference unavailable; the loading stage remains visible",
    reference_unavailable: "The reference could not be inspected: {message}",
    theme_unavailable: "The theme could not be applied: {message}",
    catalog_request_failed: "Catalog request returned {status}.",
    no_fixtures: "The catalog contains no inspectable fixtures.",
    visible_detail: "{selector} must be visible.",
    attribute_detail: "{selector} expected {attribute}=\"{expected}\"; received \"{actual}\".",
    text_detail: "{selector} must include \"{expected}\".",
    reference_document_unavailable: "The reference document is unavailable."
  }),
  "zh-CN": Object.freeze({
    checking_reference: "正在检查交互预览 · {selection}",
    poster_label: "INT-02 展示海报。",
    neutral_label: "预览正在加载。",
    current_selection: "当前选择：{selection}",
    checking_same_origin: "正在检查本地交互预览",
    state_count_one: "{count} 个状态",
    state_count_many: "{count} 个状态",
    source: "{maturity}",
    lab_title: "{name} · 场景检查台",
    fit: "适应窗口 / {percentage}%",
    fit_readonly: "适应窗口 / {percentage}% / 仅预览",
    preview_scale: "预览缩放为 {percentage}%。设定视口仍为 {width} × {height} 像素。",
    preview_scale_readonly: "预览缩放为 {percentage}%。触控环境下已暂停缩放页面的交互；请选择 100% 或在新标签页打开。",
    exit_fullscreen: "退出全屏",
    fullscreen: "全屏",
    fullscreen_unavailable: "当前浏览器不支持全屏。",
    open_direct: "在新标签页独立打开“{state}”",
    fixture_unavailable: "预览不可用",
    same_origin_unavailable: "无法读取本地预览页面。",
    invalid_selector: "预览规则无效",
    verified: "预览已就绪",
    fixture_failed: "预览检查失败",
    selector_failed: "预览状态检查未通过",
    checking_fixture: "正在准备预览",
    inspection_unavailable: "暂时无法验证",
    live_unavailable: "交互预览暂时不可用，当前保留加载界面",
    reference_unavailable: "无法验证预览：{message}",
    theme_unavailable: "无法应用主题：{message}",
    catalog_request_failed: "加载场景目录失败（{status}）。",
    no_fixtures: "场景目录中暂无可预览样例。",
    visible_detail: "{selector} 必须可见。",
    attribute_detail: "{selector} 预期 {attribute}=\"{expected}\"；实际为 \"{actual}\"。",
    text_detail: "{selector} 必须包含“{expected}”。",
    reference_document_unavailable: "预览页面不可用。"
  })
});

function formatCopy(key, values = {}) {
  let value = LAB_COPY[locale][key];
  for (const [name, replacement] of Object.entries(values)) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }
  return value;
}

function replaceNodeText(node, replacement) {
  const leading = node.nodeValue.match(/^\s*/u)?.[0] ?? "";
  const trailing = node.nodeValue.match(/\s*$/u)?.[0] ?? "";
  node.nodeValue = `${leading}${replacement}${trailing}`;
}

function localeHref(language) {
  const url = new URL("../scenarios/lab.html", window.location.href);
  const current = new URL(window.location.href);
  for (const [key, value] of current.searchParams) {
    url.searchParams.append(key, value);
  }
  url.hash = "";
  if (language === "zh-CN") url.searchParams.set("lang", "zh-CN");
  else url.searchParams.delete("lang");
  return url.pathname + url.search;
}

function syncGlobalLocaleNavigation() {
  const languageLinks = document.querySelectorAll("[data-lab-language]");
  for (const link of languageLinks) {
    const language = link.dataset.labLanguage;
    const href = localeHref(language);
    link.href = href;
    link.dataset.localeBaseHref = href;
    if (language === locale) {
      link.setAttribute("aria-current", "page");
      link.removeAttribute("hreflang");
    } else {
      link.removeAttribute("aria-current");
      link.setAttribute("hreflang", language);
    }
  }

  const routeHrefs = isChinese
    ? {
        showcase: "../zh/",
        components: "../zh/components/",
        patterns: "../zh/patterns/",
        scenarios: "./?lang=zh-CN",
        lab: localeHref("zh-CN"),
        docs: "../zh/docs/"
      }
    : {
        showcase: "../",
        components: "../components/",
        patterns: "../patterns/",
        scenarios: "./",
        lab: localeHref("en"),
        docs: "../docs/"
      };

  for (const link of document.querySelectorAll("[data-global-nav-key]")) {
    const href = routeHrefs[link.dataset.globalNavKey];
    if (href) link.href = href;
  }
  for (const link of document.querySelectorAll("[data-lab-command-key]")) {
    const href = routeHrefs[link.dataset.labCommandKey];
    if (href) link.href = href;
  }
}

function applyStaticLocale() {
  syncGlobalLocaleNavigation();
  if (!isChinese) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const value = node.nodeValue.trim();
    if (STATIC_COPY_ZH[value]) replaceNodeText(node, STATIC_COPY_ZH[value]);
    node = walker.nextNode();
  }
  for (const element of document.querySelectorAll("[aria-label], [alt], [title], [placeholder]")) {
    for (const attribute of ["aria-label", "alt", "title", "placeholder"]) {
      if (!element.hasAttribute(attribute)) continue;
      const value = element.getAttribute(attribute);
      if (STATIC_COPY_ZH[value]) element.setAttribute(attribute, STATIC_COPY_ZH[value]);
    }
  }
  document.title = "场景检查台 · KIN 设计系统";
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = "在固定的状态、视口和主题下查看 KIN 场景。";
  for (const link of document.querySelectorAll('a[href="./"]')) {
    link.href = "./?lang=zh-CN";
  }
}

applyStaticLocale();

const lab = document.querySelector("[data-scenario-lab]");

if (!lab) {
  throw new Error("Scenario lab root is missing.");
}

const elements = {
  topbar: document.querySelector(".lab-topbar"),
  globalHeader: document.querySelector(".global-header"),
  modeGroup: document.querySelector("[data-lab-mode-group]"),
  controlsTrigger: document.querySelector("[data-lab-controls-trigger]"),
  controls: document.querySelector("[data-lab-controls]"),
  controlsClose: document.querySelector("[data-lab-controls-close]"),
  controlsScrim: document.querySelector("[data-lab-controls-scrim]"),
  skipLink: document.querySelector(".skip-link"),
  scenario: document.querySelector("[data-lab-scenario]"),
  state: document.querySelector("[data-lab-state]"),
  stateCount: document.querySelector("[data-lab-state-count]"),
  viewportGroup: document.querySelector("[data-lab-viewport-group]"),
  themeGroup: document.querySelector("[data-lab-theme-group]"),
  scenarioId: document.querySelector("[data-lab-scenario-id]"),
  scenarioTitle: document.querySelector("[data-lab-scenario-title]"),
  sourceMaturity: document.querySelector("[data-lab-source-maturity]"),
  userJob: document.querySelector("[data-lab-user-job]"),
  entry: document.querySelector("[data-lab-entry]"),
  completion: document.querySelector("[data-lab-completion]"),
  context: document.querySelector("[data-lab-context]"),
  gaps: document.querySelector("[data-lab-gaps]"),
  directLink: document.querySelector("[data-lab-direct-link]"),
  previewKicker: document.querySelector("[data-lab-preview-kicker]"),
  previewTitle: document.querySelector("[data-lab-preview-title]"),
  preview: document.querySelector("[data-lab-preview]"),
  previewActions: document.querySelector(".lab-preview-actions"),
  scaleReadout: document.querySelector("[data-lab-scale-readout]"),
  scaleStatus: document.querySelector("[data-lab-scale-status]"),
  viewportReadout: document.querySelector("[data-lab-viewport-readout]"),
  themeReadout: document.querySelector("[data-lab-theme-readout]"),
  verification: document.querySelector("[data-lab-verification]"),
  stage: document.querySelector("[data-lab-stage]"),
  frameSizing: document.querySelector("[data-lab-frame-sizing]"),
  frameShell: document.querySelector("[data-lab-frame-shell]"),
  framePlaceholder: document.querySelector("[data-lab-frame-placeholder]"),
  framePoster: document.querySelector("[data-lab-frame-poster]"),
  framePosterNote: document.querySelector("[data-lab-frame-poster-note]"),
  frameNeutral: document.querySelector("[data-lab-frame-neutral]"),
  placeholderTitle: document.querySelector("[data-lab-placeholder-title]"),
  placeholderState: document.querySelector("[data-lab-placeholder-state]"),
  frameLoadingLabel: document.querySelector("[data-lab-frame-loading-label]"),
  frameSize: document.querySelector("[data-lab-frame-size]"),
  frame: document.querySelector("[data-lab-frame]"),
  fullscreen: document.querySelector("[data-lab-fullscreen]"),
  error: document.querySelector("[data-lab-error]"),
  errorMessage: document.querySelector("[data-lab-error-message]")
};

const controlsOverlay = matchMedia("(max-width: 780px)");
const coarsePointer = matchMedia("(any-pointer: coarse)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const controlsExitDuration = 180;
const controlsReducedExitDuration = 80;
const modeStorageKey = "kin-showcase-lab-mode";
const validModes = new Set(["present", "inspect"]);

let catalog;
let localeCatalog = null;
let scenarios = [];
let viewports = [];
let themes = [];
let current = null;
let currentMode = resolveMode();
let controlsCloseTimer = null;
let controlsReturnTarget = elements.controlsTrigger;
let restoreControlsFocusOnClose = false;
let previewSizing = coarsePointer.matches ? "actual" : "fit";
let previewSizingUserSet = false;
let previewInteractionLocked = false;
let previewResizeFrame = null;
let frameObserver = null;
let frameResizeVerification = null;
let verificationObserver = null;
let verificationTimer = null;
let inspectionRevision = 0;
let verifiedRevision = 0;
let frameVerified = false;

function readStoredMode() {
  try {
    const stored = localStorage.getItem(modeStorageKey);
    return validModes.has(stored) ? stored : null;
  } catch {
    return null;
  }
}

function resolveMode(params = new URLSearchParams(window.location.search)) {
  const requested = params.get("mode");
  if (validModes.has(requested)) return requested;
  return readStoredMode() || "present";
}

function persistMode(mode) {
  try {
    localStorage.setItem(modeStorageKey, mode);
  } catch {
    // The URL remains authoritative when storage is unavailable.
  }
}

function controlsState() {
  return lab.dataset.controlsState || "closed";
}

function controlsAreOpen() {
  return controlsState() === "open";
}

function syncModeControls() {
  lab.dataset.mode = currentMode;
  for (const button of elements.modeGroup.querySelectorAll("[data-lab-mode]")) {
    button.setAttribute("aria-pressed", String(button.dataset.labMode === currentMode));
  }
  elements.controlsTrigger.setAttribute("aria-expanded", String(controlsAreOpen()));
}

function syncControlsMode() {
  if (controlsOverlay.matches) {
    elements.controls.setAttribute("role", "dialog");
    elements.controls.setAttribute("aria-modal", "true");
  } else {
    elements.controls.removeAttribute("role");
    elements.controls.removeAttribute("aria-modal");
  }
}

function syncInteractionOwnership() {
  const controlsOpen = controlsAreOpen();
  const modal = controlsOverlay.matches && ["open", "closing"].includes(controlsState());
  elements.controls.setAttribute("aria-hidden", String(!controlsOpen));
  elements.controls.inert = !controlsOpen;
  elements.preview.inert = modal;
  elements.frame.inert = modal || !frameVerified || previewInteractionLocked;
  elements.frame.setAttribute("aria-hidden", String(!frameVerified));
  elements.framePlaceholder.inert = frameVerified;
  elements.framePlaceholder.setAttribute("aria-hidden", String(frameVerified));
  elements.topbar.inert = modal;
  if (elements.globalHeader) elements.globalHeader.inert = modal;
  elements.skipLink.inert = modal;
  document.body.classList.toggle("lab-controls-modal-open", modal);
}

function updateFramePlaceholder(status) {
  if (!current || scenarios.length === 0 || viewports.length === 0 || themes.length === 0) return;
  const scenario = selectedScenario();
  const control = selectedControl();
  const viewport = selectedViewport();
  const theme = selectedTheme();
  const usesGovernedPoster = scenario.id === "INT-02"
    && control.state === "normal"
    && viewport.id === "wide"
    && theme.id === "dark";
  const selection = control.label + " · " + viewport.label + " · " + theme.label;

  elements.framePlaceholder.dataset.kind = usesGovernedPoster ? "poster" : "neutral";
  elements.framePoster.hidden = !usesGovernedPoster;
  elements.framePosterNote.hidden = !usesGovernedPoster;
  elements.frameNeutral.hidden = usesGovernedPoster;
  elements.placeholderTitle.textContent = scenario.id + " / " + scenario.canonical_name;
  elements.placeholderState.textContent = selection;
  elements.frameLoadingLabel.textContent = status || formatCopy("checking_reference", { selection });
  elements.framePlaceholder.setAttribute(
    "aria-label",
    (usesGovernedPoster ? formatCopy("poster_label") : formatCopy("neutral_label"))
      + formatCopy("current_selection", { selection })
  );
}

function setFrameVerified(verified, status) {
  frameVerified = verified;
  elements.frameShell.dataset.referenceReady = String(verified);
  elements.frameShell.dataset.loading = String(!verified);
  updateFramePlaceholder(status);
  syncInteractionOwnership();
}

function repairFocus(target, expectedOpen) {
  if (!target?.isConnected) return;
  target.focus({ preventScroll: true });
  queueMicrotask(() => {
    if (controlsAreOpen() === expectedOpen && document.activeElement !== target) {
      target.focus({ preventScroll: true });
    }
  });
  requestAnimationFrame(() => {
    if (controlsAreOpen() === expectedOpen && document.activeElement !== target) {
      target.focus({ preventScroll: true });
    }
  });
}

function finishControlsClose() {
  if (controlsState() !== "closing") return;
  clearTimeout(controlsCloseTimer);
  controlsCloseTimer = null;
  lab.dataset.controlsState = "closed";
  syncModeControls();
  syncInteractionOwnership();
  if (restoreControlsFocusOnClose) {
    restoreControlsFocusOnClose = false;
    const fallback = controlsReturnTarget?.isConnected ? controlsReturnTarget : elements.controlsTrigger;
    repairFocus(fallback, false);
  }
}

function setControls(open, { moveFocus = true, returnTarget } = {}) {
  clearTimeout(controlsCloseTimer);
  controlsCloseTimer = null;
  if (open && returnTarget) controlsReturnTarget = returnTarget;

  if (open) {
    restoreControlsFocusOnClose = false;
    lab.dataset.controlsState = "open";
  } else if (controlsState() !== "closed") {
    restoreControlsFocusOnClose ||= moveFocus;
    lab.dataset.controlsState = "closing";
    const duration = reducedMotion.matches ? controlsReducedExitDuration : controlsExitDuration;
    controlsCloseTimer = window.setTimeout(finishControlsClose, duration);
  }

  syncModeControls();
  syncInteractionOwnership();
  syncControlsMode();

  if (!moveFocus) return;
  const fallback = controlsReturnTarget?.isConnected ? controlsReturnTarget : elements.controlsTrigger;
  const target = open && controlsOverlay.matches ? elements.controlsClose : fallback;
  if (!open && controlsOverlay.matches && controlsState() === "closing") return;
  repairFocus(target, open);
}

function replaceModeOnly(mode) {
  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.set("mode", mode);
  history.replaceState({ scenarioLab: true, mode }, "", url.pathname + url.search);
  syncGlobalLocaleNavigation();
}

function setMode(mode, { historyMode = null, moveFocus, persist = true, returnTarget } = {}) {
  if (!validModes.has(mode)) mode = "present";
  const open = mode === "inspect";
  const focusedInside = elements.controls.contains(document.activeElement);
  currentMode = mode;
  if (current) current.mode = mode;
  lab.dataset.mode = mode;

  const shouldMoveFocus = moveFocus ?? ((open && controlsOverlay.matches) || (!open && focusedInside));
  setControls(open, {
    moveFocus: shouldMoveFocus,
    returnTarget: returnTarget || elements.controlsTrigger
  });
  syncModeControls();
  if (persist) persistMode(mode);
  if (historyMode) {
    if (current) writeUrl(historyMode);
    else replaceModeOnly(mode);
  }
  if (!previewSizingUserSet) {
    previewSizing = coarsePointer.matches ? "actual" : "fit";
  }
  if (current) requestAnimationFrame(() => renderPreviewSizing({ announce: false }));
}

function initializeControls() {
  const open = currentMode === "inspect";
  lab.dataset.controlsState = open ? "open" : "closed";
  syncModeControls();
  syncInteractionOwnership();
  syncControlsMode();
  persistMode(currentMode);
  requestAnimationFrame(() => {
    lab.dataset.controlsReady = "true";
    if (open && controlsOverlay.matches && !elements.controls.contains(document.activeElement)) {
      repairFocus(elements.controlsClose, true);
    }
  });
}

function focusableControls() {
  return [...elements.controls.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter((element) => {
      if (element.disabled || element.closest("[hidden], [inert]")) return false;
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
    });
}

function option(value, label) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
}

function localizeCatalogData(sourceCatalog, sourceLocaleCatalog) {
  if (!isChinese || !sourceLocaleCatalog) return sourceCatalog;
  return {
    ...sourceCatalog,
    inspection_defaults: {
      ...sourceCatalog.inspection_defaults,
      viewports: sourceCatalog.inspection_defaults.viewports.map((viewport) => ({
        ...viewport,
        label: sourceLocaleCatalog.viewports[viewport.id] ?? viewport.label
      })),
      themes: sourceCatalog.inspection_defaults.themes.map((theme) => ({
        ...theme,
        label: sourceLocaleCatalog.themes[theme.id] ?? theme.label
      }))
    },
    scenarios: sourceCatalog.scenarios.map((scenario) => {
      const translated = sourceLocaleCatalog.scenarios[scenario.id];
      if (!translated) return scenario;
      return {
        ...scenario,
        canonical_name: translated.name ?? scenario.canonical_name,
        user_job: translated.job ?? scenario.user_job,
        entry: translated.entry ?? scenario.entry,
        completion: translated.completion ?? scenario.completion,
        composition: {
          ...scenario.composition,
          persistent_context: translated.context ?? scenario.composition.persistent_context
        },
        known_gaps: translated.gaps ?? scenario.known_gaps,
        state_controls: scenario.state_controls.map((control) => ({
          ...control,
          label: translated.states?.[control.state] ?? control.label,
          assertion: control.assertion.kind === "text"
            ? {
                ...control.assertion,
                value: sourceLocaleCatalog.assertion_values[control.assertion.value] ?? control.assertion.value
              }
            : control.assertion
        }))
      };
    })
  };
}

function selectedScenario() {
  return scenarios.find((scenario) => scenario.id === current.scenario) || scenarios[0];
}

function selectedControl() {
  const scenario = selectedScenario();
  return scenario.state_controls.find((control) => control.state === current.state) || scenario.state_controls[0];
}

function selectedViewport() {
  return viewports.find((viewport) => viewport.id === current.viewport) || viewports[0];
}

function selectedTheme() {
  return themes.find((theme) => theme.id === current.theme) || themes[0];
}

function referenceUrl(referencePath) {
  const url = new URL("../" + referencePath, window.location.href);
  if (isChinese) url.searchParams.set("lang", "zh-CN");
  return url;
}

function currentFrameUrl() {
  try {
    const href = elements.frame.contentWindow?.location.href;
    if (href) return new URL(href);
  } catch {
    // Fall through to the iframe attribute while the nested document is isolated.
  }
  return new URL(elements.frame.src || "about:blank", window.location.href);
}

function beginInspection() {
  inspectionRevision += 1;
  setFrameVerified(false, formatCopy("checking_same_origin"));
  verificationObserver?.disconnect();
  verificationObserver = null;
  if (verificationTimer) {
    clearTimeout(verificationTimer);
    verificationTimer = null;
  }
  if (frameResizeVerification) {
    cancelAnimationFrame(frameResizeVerification);
    frameResizeVerification = null;
  }
  return inspectionRevision;
}

function frameMatchesCurrentReference() {
  const frameWindow = elements.frame.contentWindow;
  if (!frameWindow) return false;

  try {
    const actual = new URL(frameWindow.location.href);
    const expected = referenceUrl(selectedControl().reference_path);
    if (actual.origin !== expected.origin || actual.pathname !== expected.pathname) return false;
    for (const key of new Set(expected.searchParams.keys())) {
      const actualValues = actual.searchParams.getAll(key);
      const expectedValues = expected.searchParams.getAll(key);
      if (actualValues.length !== expectedValues.length || actualValues.some((value, index) => value !== expectedValues[index])) return false;
    }
    return !expected.hash || actual.hash === expected.hash;
  } catch {
    return false;
  }
}

function setVerification(state, message, detail) {
  elements.verification.dataset.state = state;
  elements.verification.textContent = message;
  elements.verification.title = detail || "";
}

function serializedUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  url.searchParams.set("scenario", current.scenario);
  url.searchParams.set("state", current.state);
  url.searchParams.set("viewport", current.viewport);
  url.searchParams.set("theme", current.theme);
  url.searchParams.set("mode", currentMode);
  if (isChinese) url.searchParams.set("lang", "zh-CN");
  return url.pathname + url.search;
}

function writeUrl(mode = "replace") {
  if (mode !== "push" && mode !== "replace") throw new Error("Unknown Scenario Lab history mode: " + mode);
  const nextUrl = serializedUrl();
  const currentUrl = window.location.pathname + window.location.search;
  if (mode === "push" && !window.location.hash && nextUrl === currentUrl) return;
  history[mode + "State"]({ scenarioLab: true, mode: currentMode }, "", nextUrl);
  syncGlobalLocaleNavigation();
}

function syncPressedControls() {
  for (const button of elements.viewportGroup.querySelectorAll("[data-lab-viewport]")) {
    button.setAttribute("aria-pressed", String(button.dataset.labViewport === current.viewport));
  }
  for (const button of elements.themeGroup.querySelectorAll("[data-lab-theme]")) {
    button.setAttribute("aria-pressed", String(button.dataset.labTheme === current.theme));
  }
}

function renderStateOptions(scenario) {
  elements.state.replaceChildren();
  for (const control of scenario.state_controls) {
    elements.state.append(option(control.state, control.label));
  }
  if (!scenario.state_controls.some((control) => control.state === current.state)) {
    current.state = scenario.state_controls[0].state;
  }
  elements.state.value = current.state;
  const count = scenario.state_controls.length;
  elements.stateCount.textContent = formatCopy(count === 1 ? "state_count_one" : "state_count_many", { count });
}

function renderScenarioDetails() {
  const scenario = selectedScenario();
  const maturity = scenario.source_maturity;
  elements.scenarioId.textContent = scenario.id + " / " + scenario.group;
  elements.scenarioTitle.textContent = scenario.canonical_name;
  elements.sourceMaturity.className = "source-status " + maturity;
  const maturityLabel = localeCatalog?.maturity?.[maturity] ?? (maturity.charAt(0).toUpperCase() + maturity.slice(1));
  elements.sourceMaturity.textContent = formatCopy("source", { maturity: maturityLabel });
  elements.userJob.textContent = scenario.user_job;
  elements.entry.textContent = scenario.entry;
  elements.completion.textContent = scenario.completion;
  elements.context.textContent = scenario.composition.persistent_context;
  elements.gaps.replaceChildren();
  for (const gap of scenario.known_gaps) {
    const item = document.createElement("li");
    item.textContent = gap;
    elements.gaps.append(item);
  }
  const groupLabel = localeCatalog?.groups?.[scenario.group] ?? scenario.group;
  elements.scenarioId.textContent = scenario.id + " / " + groupLabel;
  elements.previewKicker.textContent = scenario.id + " / " + groupLabel + " / " + formatCopy("source", { maturity: maturityLabel });
  elements.previewTitle.textContent = scenario.canonical_name;
  elements.frame.title = isChinese ? `${scenario.canonical_name}预览` : `${scenario.canonical_name} reference`;
  document.title = formatCopy("lab_title", { name: scenario.canonical_name });
  updateFramePlaceholder();
}

function syncSizingControls() {
  for (const button of elements.previewActions.querySelectorAll("[data-lab-sizing]")) {
    button.setAttribute("aria-pressed", String(button.dataset.labSizing === previewSizing));
  }
}

function stagePadding() {
  const style = getComputedStyle(elements.stage);
  return {
    horizontal: (Number.parseFloat(style.paddingLeft) || 0) + (Number.parseFloat(style.paddingRight) || 0),
    vertical: (Number.parseFloat(style.paddingTop) || 0) + (Number.parseFloat(style.paddingBottom) || 0)
  };
}

function renderPreviewSizing({ announce = true } = {}) {
  if (!current) return;
  const viewport = selectedViewport();
  const frameWidth = viewport.width + 2;
  const frameHeight = viewport.height + 32;
  const padding = stagePadding();
  const availableWidth = elements.stage.clientWidth - padding.horizontal;
  const availableHeight = elements.stage.clientHeight - padding.vertical;
  const maxScale = currentMode === "present" ? 1.2 : 1;
  const fitScale = availableWidth > 0 && availableHeight > 0
    ? Math.min(maxScale, availableWidth / frameWidth, availableHeight / frameHeight)
    : 1;
  const nextScale = previewSizing === "fit" ? fitScale : 1;
  const roundedScale = Number(nextScale.toFixed(6));
  const percentage = Math.round(roundedScale * 100);
  const previousAnnouncement = elements.scaleStatus.textContent;
  previewInteractionLocked = coarsePointer.matches && roundedScale < 1;

  elements.frameShell.style.transform = "scale(" + roundedScale + ")";
  elements.frameSizing.style.width = frameWidth * roundedScale + "px";
  elements.frameSizing.style.height = frameHeight * roundedScale + "px";
  elements.frameSizing.dataset.sizing = previewSizing;
  elements.frameSizing.dataset.scale = String(roundedScale);
  elements.frameShell.dataset.interactionLocked = String(previewInteractionLocked);
  elements.scaleReadout.textContent = previewSizing === "fit"
    ? formatCopy(previewInteractionLocked ? "fit_readonly" : "fit", { percentage })
    : "100%";
  syncSizingControls();
  syncInteractionOwnership();

  const announcement = formatCopy(previewInteractionLocked ? "preview_scale_readonly" : "preview_scale", {
    percentage,
    width: viewport.width,
    height: viewport.height
  });
  if (announce && announcement !== previousAnnouncement) elements.scaleStatus.textContent = announcement;

  if (lab.dataset.previewReady !== "true") {
    requestAnimationFrame(() => {
      lab.dataset.previewReady = "true";
    });
  }
}

function choosePreviewSizing(mode, { user = true } = {}) {
  if (!["fit", "actual"].includes(mode) || mode === previewSizing) return;
  if (user) previewSizingUserSet = true;
  previewSizing = mode;
  renderPreviewSizing();
}

function renderViewport() {
  const viewport = selectedViewport();
  elements.frameShell.style.setProperty("--lab-frame-width", viewport.width + "px");
  elements.frameShell.style.setProperty("--lab-frame-height", viewport.height + "px");
  elements.stage.dataset.viewport = viewport.id;
  elements.viewportReadout.textContent = viewport.label + " / " + viewport.width + " px";
  elements.frameSize.textContent = viewport.width + " x " + viewport.height;
  renderPreviewSizing();
  updateFramePlaceholder();
}

function renderThemeReadout(theme) {
  const resolved = theme || selectedTheme();
  elements.themeReadout.textContent = resolved.label;
  updateFramePlaceholder();
}

function fullscreenAvailable() {
  return typeof elements.preview.requestFullscreen === "function"
    && typeof document.exitFullscreen === "function"
    && document.fullscreenEnabled !== false;
}

function syncFullscreenControl() {
  const available = fullscreenAvailable();
  const active = document.fullscreenElement === elements.preview;
  elements.fullscreen.disabled = !available;
  elements.fullscreen.setAttribute("aria-pressed", String(active));
  elements.fullscreen.textContent = formatCopy(active ? "exit_fullscreen" : "fullscreen");
  elements.preview.dataset.fullscreen = String(active);
  if (available) {
    elements.fullscreen.removeAttribute("title");
  } else {
    elements.fullscreen.title = formatCopy("fullscreen_unavailable");
  }
}

async function toggleFullscreen() {
  if (!fullscreenAvailable()) return;
  try {
    if (document.fullscreenElement === elements.preview) {
      await document.exitFullscreen();
    } else {
      await elements.preview.requestFullscreen();
    }
  } catch {
    // Fullscreen permission and user-agent policy are authoritative. The control
    // remains synchronized by fullscreenchange instead of manufacturing success.
    syncFullscreenControl();
  }
}

function renderDirectLink() {
  const control = selectedControl();
  elements.directLink.href = referenceUrl(control.reference_path).href;
  elements.directLink.setAttribute("aria-label", formatCopy("open_direct", { state: control.label }));
  elements.directLink.hidden = false;
}

function syncEmbeddedAppearanceControls(frameDocument, theme) {
  const dark = theme.theme === "dark";
  for (const control of frameDocument.querySelectorAll("[data-theme-switch]")) {
    control.setAttribute("aria-checked", String(dark));
  }
  for (const control of frameDocument.querySelectorAll("[data-contrast-toggle]")) {
    const active = String(theme.contrast === "more");
    if (control.hasAttribute("aria-checked") || control.getAttribute("role") === "menuitemcheckbox") control.setAttribute("aria-checked", active);
    if (control.hasAttribute("aria-pressed") || !control.hasAttribute("aria-checked")) control.setAttribute("aria-pressed", active);
  }
  for (const option of frameDocument.querySelectorAll("[data-theme-option], [data-theme-preference]")) {
    const value = option.dataset.themeOption || option.dataset.themePreference;
    option.setAttribute("aria-checked", String(value === theme.theme));
  }
}

function applyAppearance() {
  const frameDocument = elements.frame.contentDocument;
  if (!frameDocument) throw new Error(formatCopy("reference_document_unavailable"));
  const root = frameDocument.documentElement;
  const theme = selectedTheme();

  frameObserver?.disconnect();
  root.dataset.theme = theme.theme;
  root.dataset.themePreference = theme.theme;
  root.dataset.contrast = theme.contrast;
  root.style.colorScheme = theme.theme;
  syncEmbeddedAppearanceControls(frameDocument, theme);

  const themeColor = frameDocument.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = theme.theme === "dark" ? "#111315" : "#ffffff";

  frameObserver = new MutationObserver(() => {
    const resolved = themes.find((candidate) => candidate.theme === root.dataset.theme && candidate.contrast === root.dataset.contrast);
    if (!resolved) return;
    if (resolved.id !== current.theme) {
      current.theme = resolved.id;
      syncPressedControls();
      writeUrl("replace");
      updateFramePlaceholder();
    }
    renderThemeReadout(resolved);
  });
  frameObserver.observe(root, { attributes: true, attributeFilter: ["data-theme", "data-contrast"] });
  renderThemeReadout(theme);
}

function visibleInFrame(target, frameWindow) {
  if (!target || target.hidden) return false;
  let node = target;
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    const style = frameWindow.getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
    node = node.parentElement;
  }
  return target.getClientRects().length > 0;
}

function verifyCurrentState(revision = inspectionRevision, { reportFailure = true } = {}) {
  if (revision !== inspectionRevision || !frameMatchesCurrentReference()) return false;
  const control = selectedControl();
  const assertion = control.assertion;
  const frameDocument = elements.frame.contentDocument;
  const frameWindow = elements.frame.contentWindow;
  if (!frameDocument || !frameWindow) {
    setVerification("fail", formatCopy("fixture_unavailable"), formatCopy("same_origin_unavailable"));
    setFrameVerified(false, formatCopy("same_origin_unavailable"));
    return false;
  }

  let target;
  try {
    target = frameDocument.querySelector(assertion.selector);
  } catch (error) {
    if (reportFailure) setVerification("fail", formatCopy("invalid_selector"), error.message);
    return false;
  }

  let passed = false;
  let detail = "";
  if (assertion.kind === "visible") {
    passed = visibleInFrame(target, frameWindow);
    detail = formatCopy("visible_detail", { selector: assertion.selector });
  } else if (assertion.kind === "attribute") {
    const actual = target?.getAttribute(assertion.attribute);
    passed = actual === assertion.value;
    detail = formatCopy("attribute_detail", {
      selector: assertion.selector,
      attribute: assertion.attribute,
      expected: assertion.value,
      actual
    });
  } else if (assertion.kind === "text") {
    const actual = target?.textContent?.replace(/\s+/g, " ").trim() || "";
    passed = actual.includes(assertion.value);
    detail = formatCopy("text_detail", { selector: assertion.selector, expected: assertion.value });
  }

  if (passed) {
    verifiedRevision = revision;
    clearError();
    setVerification("pass", formatCopy("verified"), detail);
    lab.dataset.loadState = "ready";
    setFrameVerified(true);
  } else if (reportFailure) {
    setVerification("fail", formatCopy("fixture_failed"), detail);
    lab.dataset.loadState = "mismatch";
    setFrameVerified(false, formatCopy("selector_failed"));
  }
  return passed;
}

function afterLayout(callback, revision = inspectionRevision) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (revision === inspectionRevision) callback();
  }));
}

function clearPendingVerification() {
  verificationObserver?.disconnect();
  verificationObserver = null;
  if (verificationTimer) {
    clearTimeout(verificationTimer);
    verificationTimer = null;
  }
}

function scheduleVerification(revision = inspectionRevision) {
  clearPendingVerification();
  afterLayout(() => {
    if (verifyCurrentState(revision, { reportFailure: false })) return;
    const frameDocument = elements.frame.contentDocument;
    if (!frameDocument?.documentElement || revision !== inspectionRevision || !frameMatchesCurrentReference()) return;

    const verifyAfterMutation = () => {
      if (revision !== inspectionRevision) {
        clearPendingVerification();
        return;
      }
      if (verifyCurrentState(revision, { reportFailure: false })) clearPendingVerification();
    };

    verificationObserver = new MutationObserver(verifyAfterMutation);
    verificationObserver.observe(frameDocument.documentElement, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true
    });

    if (verifyCurrentState(revision, { reportFailure: false })) {
      clearPendingVerification();
      return;
    }

    verificationTimer = setTimeout(() => {
      verificationTimer = null;
      verificationObserver?.disconnect();
      verificationObserver = null;
      verifyCurrentState(revision);
    }, 3000);
  }, revision);
}

function inspectReference(revision = inspectionRevision) {
  if (revision !== inspectionRevision) return;
  try {
    if (!elements.frame.contentDocument) throw new Error(formatCopy("reference_document_unavailable"));
    if (!frameMatchesCurrentReference()) return;
    clearError();
    applyAppearance();
    scheduleVerification(revision);
  } catch (error) {
    if (revision === inspectionRevision) showError(formatCopy("reference_unavailable", { message: error.message }));
  }
}

function navigateFrame(url) {
  try {
    elements.frame.contentWindow.location.replace(url.href);
  } catch {
    elements.frame.src = url.href;
  }
}

function awaitCurrentReference(revision = inspectionRevision, attempt = 0) {
  if (revision !== inspectionRevision || revision === verifiedRevision) return;
  const matchesReference = frameMatchesCurrentReference();
  if (matchesReference && elements.frame.contentDocument?.documentElement) {
    // Same-document navigations can settle out of issue order. Inspect only
    // after the latest revision remains current for a short stability window.
    setTimeout(() => {
      if (revision !== inspectionRevision || revision === verifiedRevision) return;
      if (frameMatchesCurrentReference() && elements.frame.contentDocument?.documentElement) inspectReference(revision);
      else awaitCurrentReference(revision, attempt + 1);
    }, 120);
    return;
  }
  if (attempt >= 26) {
    showError(formatCopy("reference_unavailable", { message: formatCopy("same_origin_unavailable") }));
    return;
  }
  if (!matchesReference) navigateFrame(referenceUrl(selectedControl().reference_path));
  setTimeout(() => awaitCurrentReference(revision, attempt + 1), 150);
}

function loadReference() {
  const revision = beginInspection();
  const control = selectedControl();
  const nextUrl = referenceUrl(control.reference_path);
  clearError();
  elements.frame.dataset.referencePath = control.reference_path;
  renderDirectLink();
  setVerification("loading", formatCopy("checking_fixture"), control.label);
  lab.dataset.loadState = "loading";
  setFrameVerified(false, formatCopy("checking_reference", { selection: control.label }));

  // Scenario controls own the top-level history entry. Replacing the nested
  // document keeps iframe navigations from adding duplicate Back/Forward steps.
  if (currentFrameUrl().href !== nextUrl.href) navigateFrame(nextUrl);
  awaitCurrentReference(revision);
}

function renderAll(options = {}) {
  renderScenarioDetails();
  renderViewport();
  renderThemeReadout();
  renderDirectLink();
  syncPressedControls();
  if (options.historyMode) writeUrl(options.historyMode);
  if (options.reload !== false) loadReference();
}

function chooseScenario(id, historyMode = "push") {
  const scenario = scenarios.find((candidate) => candidate.id === id) || scenarios[0];
  if (scenario.id === current.scenario) return;
  current.scenario = scenario.id;
  current.state = scenario.state_controls[0].state;
  elements.scenario.value = scenario.id;
  renderStateOptions(scenario);
  renderAll({ historyMode });
}

function chooseState(state, historyMode = "push") {
  const scenario = selectedScenario();
  const control = scenario.state_controls.find((candidate) => candidate.state === state) || scenario.state_controls[0];
  if (control.state === current.state) return;
  current.state = control.state;
  elements.state.value = control.state;
  renderDirectLink();
  writeUrl(historyMode);
  loadReference();
}

function chooseViewport(id, historyMode = "push") {
  if (!viewports.some((viewport) => viewport.id === id) || id === current.viewport) return;
  const revision = beginInspection();
  clearError();
  current.viewport = id;
  renderViewport();
  syncPressedControls();
  writeUrl(historyMode);
  setVerification("loading", formatCopy("checking_fixture"), selectedControl().label);
  scheduleVerification(revision);
}

function chooseTheme(id, historyMode = "push") {
  if (!themes.some((theme) => theme.id === id) || id === current.theme) return;
  const revision = beginInspection();
  clearError();
  current.theme = id;
  syncPressedControls();
  updateFramePlaceholder();
  writeUrl(historyMode);
  setVerification("loading", formatCopy("checking_fixture"), selectedControl().label);
  try {
    if (frameMatchesCurrentReference()) {
      applyAppearance();
      scheduleVerification(revision);
    }
  } catch (error) {
    if (revision === inspectionRevision) showError(formatCopy("theme_unavailable", { message: error.message }));
  }
}

function bindArrowNavigation(group, selector) {
  group.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const buttons = [...group.querySelectorAll(selector)];
    const index = buttons.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
    else next = (index + 1) % buttons.length;
    buttons[next].focus();
    lab.dataset.sizingInput = "keyboard";
    buttons[next].click();
    requestAnimationFrame(() => delete lab.dataset.sizingInput);
  });
}

function showError(message) {
  frameObserver?.disconnect();
  lab.dataset.loadState = "error";
  elements.error.hidden = false;
  elements.errorMessage.textContent = message;
  setVerification("fail", formatCopy("inspection_unavailable"), message);
  setFrameVerified(false, formatCopy("live_unavailable"));
}

function clearError() {
  elements.error.hidden = true;
  elements.errorMessage.textContent = "";
}

elements.frame.addEventListener("load", () => {
  if (!current || !elements.frame.dataset.referencePath) return;
  inspectReference(inspectionRevision);
});

const frameResizeObserver = new ResizeObserver(() => {
  const frameDocument = elements.frame.contentDocument;
  if (!current || !elements.frame.dataset.referencePath || frameDocument?.readyState !== "complete") return;
  if (frameResizeVerification) cancelAnimationFrame(frameResizeVerification);
  const revision = inspectionRevision;
  frameResizeVerification = requestAnimationFrame(() => {
    frameResizeVerification = null;
    scheduleVerification(revision);
  });
});
frameResizeObserver.observe(elements.frame);

const previewResizeObserver = new ResizeObserver(() => {
  if (!current || previewSizing !== "fit") return;
  if (previewResizeFrame) cancelAnimationFrame(previewResizeFrame);
  previewResizeFrame = requestAnimationFrame(() => {
    previewResizeFrame = null;
    renderPreviewSizing();
  });
});
previewResizeObserver.observe(elements.stage);

elements.modeGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lab-mode]");
  if (!button) return;
  setMode(button.dataset.labMode, {
    historyMode: "replace",
    moveFocus: button.dataset.labMode === "inspect" && controlsOverlay.matches,
    returnTarget: button
  });
});

elements.controlsClose.addEventListener("click", () => {
  setMode("present", { historyMode: "replace", moveFocus: true, returnTarget: elements.controlsTrigger });
});
elements.controlsScrim.addEventListener("click", () => {
  setMode("present", { historyMode: "replace", moveFocus: true, returnTarget: elements.controlsTrigger });
});

elements.controls.addEventListener("keydown", (event) => {
  if (!controlsOverlay.matches || !controlsAreOpen() || event.key !== "Tab") return;
  const focusable = focusableControls();
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
  const commandOpen = document.querySelector("[data-command-dialog]")?.open;
  const languageOpen = document.querySelector("[data-language-menu]")?.dataset.state !== "closed";
  if (event.key === "Escape" && !commandOpen && !languageOpen && !document.fullscreenElement && controlsAreOpen()) {
    setMode("present", { historyMode: "replace", moveFocus: true, returnTarget: elements.controlsTrigger });
  }
});

controlsOverlay.addEventListener("change", (event) => {
  if (!previewSizingUserSet) {
    previewSizing = coarsePointer.matches ? "actual" : "fit";
  }
  setMode(currentMode, {
    moveFocus: event.matches && currentMode === "inspect",
    persist: false,
    returnTarget: elements.controlsTrigger
  });
});

coarsePointer.addEventListener("change", () => {
  if (!previewSizingUserSet) previewSizing = coarsePointer.matches ? "actual" : "fit";
  renderPreviewSizing({ announce: false });
});

reducedMotion.addEventListener("change", () => {
  if (controlsState() === "closing") setControls(false, { moveFocus: false });
});

elements.scenario.addEventListener("change", () => chooseScenario(elements.scenario.value));
elements.state.addEventListener("change", () => chooseState(elements.state.value));

elements.viewportGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lab-viewport]");
  if (button) chooseViewport(button.dataset.labViewport);
});

elements.themeGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lab-theme]");
  if (button) chooseTheme(button.dataset.labTheme);
});

elements.previewActions.addEventListener("click", (event) => {
  const sizing = event.target.closest("[data-lab-sizing]");
  if (sizing) choosePreviewSizing(sizing.dataset.labSizing, { user: true });
});

elements.fullscreen.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", syncFullscreenControl);
document.addEventListener("fullscreenerror", syncFullscreenControl);

bindArrowNavigation(elements.viewportGroup, "[data-lab-viewport]");
bindArrowNavigation(elements.themeGroup, "[data-lab-theme]");
bindArrowNavigation(elements.modeGroup, "[data-lab-mode]");

function resolveLocationState(params = new URLSearchParams(window.location.search)) {
  const scenario = scenarios.find((candidate) => candidate.id === params.get("scenario")) || scenarios[0];
  const control = scenario.state_controls.find((candidate) => candidate.state === params.get("state")) || scenario.state_controls[0];
  const viewport = viewports.find((candidate) => candidate.id === params.get("viewport"))
    || viewports.find((candidate) => candidate.id === (matchMedia("(max-width: 720px)").matches ? "narrow" : "wide"))
    || viewports[0];
  const theme = themes.find((candidate) => candidate.id === params.get("theme"))
    || themes.find((candidate) => candidate.id === "dark")
    || themes[0];

  return {
    scenario: scenario.id,
    state: control.state,
    viewport: viewport.id,
    theme: theme.id,
    mode: resolveMode(params)
  };
}

function restoreFromLocation() {
  if (scenarios.length === 0 || viewports.length === 0 || themes.length === 0) return;
  current = resolveLocationState();
  elements.scenario.value = current.scenario;
  renderStateOptions(selectedScenario());
  setMode(current.mode, { moveFocus: current.mode === "inspect" && controlsOverlay.matches });
  renderAll();
  if (window.location.hash || serializedUrl() !== window.location.pathname + window.location.search) {
    writeUrl("replace");
  }
}

window.addEventListener("popstate", restoreFromLocation);

async function initialize() {
  try {
    const catalogUrl = new URL("catalog.json", window.location.href);
    const localeUrl = new URL("locale.zh-CN.json", window.location.href);
    const [response, localeResponse] = await Promise.all([
      fetch(catalogUrl, { cache: "no-store" }),
      isChinese ? fetch(localeUrl, { cache: "no-store" }) : Promise.resolve(null)
    ]);
    if (!response.ok) throw new Error(formatCopy("catalog_request_failed", { status: response.status }));
    if (isChinese && !localeResponse?.ok) {
      const fallbackUrl = new URL(window.location.href);
      fallbackUrl.searchParams.delete("lang");
      window.location.replace(fallbackUrl);
      return;
    }
    localeCatalog = isChinese ? await localeResponse.json() : null;
    catalog = localizeCatalogData(await response.json(), localeCatalog);
    scenarios = catalog.scenarios.filter((scenario) => scenario.presentation_status === "showcased" && scenario.state_controls.length > 0);
    viewports = catalog.inspection_defaults.viewports;
    themes = catalog.inspection_defaults.themes;
    if (scenarios.length === 0 || viewports.length === 0 || themes.length === 0) throw new Error(formatCopy("no_fixtures"));

    elements.scenario.replaceChildren();
    for (const scenario of scenarios) {
      elements.scenario.append(option(scenario.id, scenario.id + " / " + scenario.canonical_name));
    }

    current = resolveLocationState();
    elements.scenario.value = current.scenario;
    renderStateOptions(selectedScenario());
    setMode(current.mode, { moveFocus: false });
    renderAll({ historyMode: "replace" });
  } catch (error) {
    showError(error.message);
  }
}

initializeControls();
syncFullscreenControl();
initialize();
