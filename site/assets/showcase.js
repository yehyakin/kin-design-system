const root = document.documentElement;
const stage = document.querySelector("[data-scenario-stage]");
const labLinks = [...document.querySelectorAll("[data-showcase-lab-link]")];

function resolvedAppearanceId() {
  const theme = root.dataset.theme === "light" ? "light" : "dark";
  return root.dataset.contrast === "more" ? `${theme}-high-contrast` : theme;
}

function syncLabLinkAppearance(link) {
  if (!link) return;
  const url = new URL(link.getAttribute("href"), window.location.href);
  url.searchParams.set("theme", resolvedAppearanceId());
  if (root.lang === "zh-CN") url.searchParams.set("lang", "zh-CN");
  link.href = url.href;
}

function syncEmbeddedAppearanceControls(frameDocument, theme, contrast) {
  const dark = theme === "dark";
  for (const control of frameDocument.querySelectorAll("[data-theme-switch]")) {
    control.setAttribute("aria-checked", String(dark));
  }
  for (const control of frameDocument.querySelectorAll("[data-contrast-toggle]")) {
    const active = String(contrast === "more");
    if (control.hasAttribute("aria-checked") || control.getAttribute("role") === "menuitemcheckbox") {
      control.setAttribute("aria-checked", active);
    }
    if (control.hasAttribute("aria-pressed") || !control.hasAttribute("aria-checked")) {
      control.setAttribute("aria-pressed", active);
    }
  }
  for (const option of frameDocument.querySelectorAll("[data-theme-option], [data-theme-preference]")) {
    const value = option.dataset.themeOption || option.dataset.themePreference;
    option.setAttribute("aria-checked", String(value === theme));
  }
}

function clearEmbeddedFocus(frameDocument) {
  frameDocument.documentElement.removeAttribute("data-showcase-component-focus");
  for (const element of frameDocument.querySelectorAll(
    "[data-showcase-focus-root], [data-showcase-focus-ancestor], [data-showcase-focus-peer], [data-showcase-focus-peer-ancestor]",
  )) {
    element.removeAttribute("data-showcase-focus-root");
    element.removeAttribute("data-showcase-focus-ancestor");
    element.removeAttribute("data-showcase-focus-peer");
    element.removeAttribute("data-showcase-focus-peer-ancestor");
  }
}

function focusEmbeddedReference(frameDocument, selector, { isolate = true } = {}) {
  clearEmbeddedFocus(frameDocument);
  if (!selector) return null;

  let contextualTrigger = null;
  if (selector === ".command-dialog") {
    contextualTrigger = frameDocument.querySelector("[data-command-open]");
    contextualTrigger?.click();
  }

  const focusRoot = frameDocument.querySelector(selector);
  if (!focusRoot) return null;

  if (focusRoot.matches("dialog")) {
    const context = contextualTrigger?.closest("section, main")
      || frameDocument.querySelector("#authentication")
      || focusRoot.previousElementSibling;
    const view = frameDocument.defaultView;
    if (view && context instanceof frameDocument.defaultView.HTMLElement) {
      const top = context.getBoundingClientRect().top + view.scrollY;
      view.scrollTo(0, Math.max(0, top - 28));
    }
    return focusRoot;
  }

  if (!isolate) {
    const view = frameDocument.defaultView;
    if (view) {
      const top = focusRoot.getBoundingClientRect().top + view.scrollY;
      view.scrollTo(0, Math.max(0, top - 20));
    }
    return focusRoot;
  }

  focusRoot.setAttribute("data-showcase-focus-root", "");
  let ancestor = focusRoot.parentElement;
  while (ancestor) {
    ancestor.setAttribute("data-showcase-focus-ancestor", "");
    ancestor = ancestor.parentElement;
  }

  for (const peer of frameDocument.querySelectorAll("[data-sonner-root]")) {
    peer.setAttribute("data-showcase-focus-peer", "");
    let peerAncestor = peer.parentElement;
    while (peerAncestor && peerAncestor !== frameDocument.body && peerAncestor !== frameDocument.documentElement) {
      peerAncestor.setAttribute("data-showcase-focus-peer-ancestor", "");
      peerAncestor = peerAncestor.parentElement;
    }
  }

  frameDocument.documentElement.dataset.showcaseComponentFocus = "true";

  const view = frameDocument.defaultView;
  if (view) {
    const top = focusRoot.getBoundingClientRect().top + view.scrollY;
    view.scrollTo(0, Math.max(0, top - 20));
  }
  return focusRoot;
}

function sizeFocusedReference(container, frameDocument, focusRoot) {
  // Stage height is authored by the showcase catalog for each specimen. Do
  // not derive it from a live fixture's bounding box: compact and dense
  // references need a stable contract across themes, remounts, and browsers.
  const configuredHeight = container.dataset.stageHeight;
  if (configuredHeight) {
    container.style.setProperty("--explorer-stage-height", configuredHeight);
  } else {
    container.style.removeProperty("--explorer-stage-height");
  }

  if (!focusRoot || !focusRoot.isConnected) return;
  const view = frameDocument.defaultView;
  if (!view) return;
  const top = focusRoot.getBoundingClientRect().top + view.scrollY;
  view.scrollTo(0, Math.max(0, top - 20));
}

function prepareEmbeddedReference(frame, { theme = "dark", contrast = "normal" } = {}) {
  const frameDocument = frame.contentDocument;
  if (!frameDocument?.documentElement) return false;
  if (frameDocument.querySelector('[data-404-key="title"]') || /^Page not found\b/u.test(frameDocument.title)) {
    return false;
  }
  const frameRoot = frameDocument.documentElement;
  frameRoot.dataset.theme = theme;
  frameRoot.dataset.themePreference = theme;
  frameRoot.dataset.contrast = contrast;
  frameRoot.dataset.showcaseEmbed = "true";
  frameRoot.style.colorScheme = theme;
  syncEmbeddedAppearanceControls(frameDocument, theme, contrast);

  const themeColor = frameDocument.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = theme === "dark" ? "#08090a" : "#f6f7f8";

  if (!frameDocument.querySelector("#kin-showcase-embed-style")) {
    const style = frameDocument.createElement("style");
    style.id = "kin-showcase-embed-style";
    style.textContent = `
      html, body, * { scrollbar-width: none !important; }
      *::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
      html[data-showcase-component-focus="true"],
      html[data-showcase-component-focus="true"] body {
        min-height: 0 !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
      }
      html[data-showcase-component-focus="true"] [data-showcase-focus-ancestor] {
        min-height: 0 !important;
        height: auto !important;
        grid-template-columns: minmax(0, 1fr) !important;
      }
      html[data-showcase-component-focus="true"] [data-showcase-focus-ancestor] > :not([data-showcase-focus-ancestor], [data-showcase-focus-root], [data-showcase-focus-peer-ancestor], [data-showcase-focus-peer]) {
        display: none !important;
      }
      html[data-showcase-component-focus="true"] [data-showcase-focus-peer-ancestor] > :not([data-showcase-focus-peer-ancestor], [data-showcase-focus-peer]) {
        display: none !important;
      }
    `;
    frameDocument.head.append(style);
  }
  return true;
}

function initializeScenarioStage(container) {
  const options = [...container.querySelectorAll("[data-scenario-stage-option]")];
  const frame = container.querySelector("[data-stage-frame]");
  const poster = container.querySelector("[data-stage-poster]");
  const loader = container.querySelector("[data-stage-loading]");
  const title = container.querySelector("[data-stage-title]");
  const job = container.querySelector("[data-stage-job]");
  const code = container.querySelector(".reference-code");
  const labLink = container.querySelector("[data-stage-lab-link]");
  const language = container.querySelector("[data-stage-language-text]");
  const panel = container.querySelector('[role="tabpanel"]');
  const source = container.querySelector("[data-stage-source]");
  const presentation = container.querySelector("[data-stage-presentation]");
  const boundary = container.querySelector("[data-stage-boundary]");
  const traceScenario = document.querySelector("[data-stage-trace-scenario]");
  const trace = Object.fromEntries(
    [...document.querySelectorAll("[data-stage-trace]")].map((element) => [element.dataset.stageTrace, element]),
  );
  if (!frame || !loader || options.length === 0 || !title || !job || !labLink || !panel) return;

  let selected = options.find((option) => option.getAttribute("aria-selected") === "true") || options[0];
  let loadRevision = 0;

  function syncStageLabLink() {
    syncLabLinkAppearance(labLink);
    const url = new URL(labLink.href, window.location.href);
    url.searchParams.set("theme", "dark");
    labLink.href = `${url.pathname}${url.search}${url.hash}`;
  }

  function setLoading(label) {
    container.dataset.stageReady = "false";
    loader.textContent = "";
    const dot = document.createElement("span");
    dot.setAttribute("aria-hidden", "true");
    loader.append(dot, document.createTextNode(label));
  }

  function selectOption(option, { moveFocus = false, invocation = "pointer" } = {}) {
    if (!option || option === selected && container.dataset.stageReady === "true") return;
    container.dataset.stageInput = invocation;
    selected = option;
    loadRevision += 1;
    const revision = loadRevision;

    for (const candidate of options) {
      const active = candidate === option;
      candidate.setAttribute("aria-selected", String(active));
      candidate.tabIndex = active ? 0 : -1;
    }

    const reference = option.dataset.reference;
    const scenarioId = option.dataset.scenarioStageOption;
    const stageTitle = option.dataset.title || option.textContent.trim();
    const stageJob = option.dataset.job || "";
    title.textContent = stageTitle;
    job.textContent = stageJob;
    code.textContent = `${scenarioId} / ${option.textContent.trim()}`;
    if (source) source.textContent = option.dataset.source || "";
    if (presentation) presentation.textContent = option.dataset.presentation || "";
    if (boundary) boundary.textContent = option.dataset.boundary || "";
    if (language) language.textContent = option.dataset.referenceLanguage || "";
    if (traceScenario) traceScenario.textContent = stageTitle;
    if (trace.entry) trace.entry.textContent = option.dataset.entry || "";
    if (trace.dominant) trace.dominant.textContent = option.dataset.dominantRegion || "";
    if (trace.completion) trace.completion.textContent = option.dataset.completion || "";
    if (trace.boundary) trace.boundary.textContent = option.dataset.boundary || "";
    panel.setAttribute("aria-labelledby", option.id);
    frame.title = document.documentElement.lang === "zh-CN"
      ? `${stageTitle}预览`
      : `${stageTitle} reference`;
    labLink.href = option.dataset.lab || labLink.href;
    syncStageLabLink();

    const posterSource = option.dataset.poster;
    if (poster) {
      if (posterSource) {
        poster.src = posterSource;
        poster.hidden = false;
      } else {
        poster.hidden = true;
      }
    }

    setLoading(document.documentElement.lang === "zh-CN" ? "正在准备交互预览" : "Preparing the reference");
    if (reference && frame.getAttribute("src") !== reference) frame.src = reference;
    else {
      requestAnimationFrame(() => {
        if (revision !== loadRevision) return;
        finishFrame();
      });
    }
    if (moveFocus) option.focus();
  }

  function finishFrame() {
    const revision = loadRevision;
    try {
      const readySelector = selected.dataset.readySelector;
      const theme = "dark";
      const contrast = root.dataset.contrast === "more" ? "more" : "normal";
      container.dataset.stageTheme = theme;
      if (!prepareEmbeddedReference(frame, { theme, contrast })) throw new Error("Reference unavailable");
      if (readySelector && !frame.contentDocument.querySelector(readySelector)) throw new Error("Reference state unavailable");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (revision === loadRevision) {
          container.dataset.stageReady = "true";
          if (container.dataset.stageInput === "keyboard") {
            requestAnimationFrame(() => delete container.dataset.stageInput);
          } else {
            delete container.dataset.stageInput;
          }
        }
      }));
    } catch {
      container.dataset.stageReady = "false";
      delete container.dataset.stageInput;
      loader.textContent = document.documentElement.lang === "zh-CN"
        ? "预览暂时不可用，请在场景检查台中打开"
        : "Reference unavailable. Open it in Lab.";
    }
  }

  frame.addEventListener("load", finishFrame);

  for (const option of options) {
    option.addEventListener("click", () => selectOption(option, { invocation: "pointer" }));
  }

  const tablist = container.querySelector('[role="tablist"]');
  tablist?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const index = options.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + options.length) % options.length;
    else next = (index + 1) % options.length;
    selectOption(options[next], { moveFocus: true, invocation: "keyboard" });
  });

  options.forEach((option) => {
    option.tabIndex = option === selected ? 0 : -1;
  });
  syncStageLabLink();
  container.dataset.stageTheme = "dark";
  setLoading(document.documentElement.lang === "zh-CN" ? "正在准备交互预览" : "Preparing the reference");
  if (frame.contentDocument?.readyState === "complete") finishFrame();

  return () => {
    const theme = "dark";
    const contrast = root.dataset.contrast === "more" ? "more" : "normal";
    container.dataset.stageTheme = theme;
    syncStageLabLink();
    if (poster) poster.hidden = !selected.dataset.poster;
    if (frame.contentDocument?.documentElement) prepareEmbeddedReference(frame, { theme, contrast });
  };
}

for (const link of labLinks) syncLabLinkAppearance(link);
const syncScenarioStageAppearance = stage ? initializeScenarioStage(stage) : null;
const referenceStageAppearanceSyncs = [];

const appearanceObserver = new MutationObserver((records) => {
  if (!records.some((record) => ["data-theme", "data-contrast"].includes(record.attributeName))) return;
  for (const link of labLinks) syncLabLinkAppearance(link);
  syncScenarioStageAppearance?.();
  for (const syncAppearance of referenceStageAppearanceSyncs) syncAppearance();
});
appearanceObserver.observe(root, {
  attributes: true,
  attributeFilter: ["data-theme", "data-contrast"],
});

function initializeReferenceStage(container) {
  const frame = container.querySelector("[data-stage-frame]");
  const loader = container.querySelector("[data-stage-loading]");
  if (!frame || !loader) return;

  let theme = root.dataset.theme === "light" ? "light" : "dark";
  let viewport = container.dataset.stageViewport === "narrow" ? "narrow" : "wide";
  let contextMode = container.dataset.stageContext === "isolated" ? "isolated" : "workflow";
  let themeExplicit = false;
  let referenceRevision = 0;
  let contrast = root.dataset.contrast === "more" ? "more" : "normal";
  let revealRetryTimer = null;

  function matchesExpectedDocument(expected, loaded) {
    if (!expected || !loaded) return true;
    const expectedUrl = new URL(expected, window.location.href);
    const loadedUrl = new URL(loaded, window.location.href);
    if (expectedUrl.origin !== loadedUrl.origin || expectedUrl.pathname !== loadedUrl.pathname) return false;
    for (const key of ["specimen", "view", "lang", "scenario"]) {
      if (expectedUrl.searchParams.has(key) && expectedUrl.searchParams.get(key) !== loadedUrl.searchParams.get(key)) {
        return false;
      }
    }
    return true;
  }

  function retryReveal(revision) {
    if (revision !== referenceRevision || revealRetryTimer !== null) return;
    revealRetryTimer = window.setTimeout(() => {
      revealRetryTimer = null;
      if (revision === referenceRevision) reveal();
    }, 50);
  }

  function syncControls() {
    for (const control of container.querySelectorAll("button[data-stage-theme]")) {
      control.setAttribute("aria-pressed", String(control.dataset.stageTheme === theme));
    }
    for (const control of container.querySelectorAll("button[data-stage-viewport]")) {
      control.setAttribute("aria-pressed", String(control.dataset.stageViewport === viewport));
    }
    for (const control of container.querySelectorAll("button[data-stage-context]")) {
      control.setAttribute("aria-pressed", String(control.dataset.stageContext === contextMode));
    }
    container.dataset.stageViewport = viewport;
    container.dataset.stageContext = contextMode;
  }

  function reveal() {
    const revision = referenceRevision;
    const expectedSource = frame.getAttribute("src");
    const loadedUrl = frame.contentWindow?.location?.href || "";
    if (!matchesExpectedDocument(expectedSource, loadedUrl)) {
      retryReveal(revision);
      return;
    }
    try {
      if (!prepareEmbeddedReference(frame, { theme, contrast })) throw new Error("unavailable");
      const frameDocument = frame.contentDocument;
      const readyFragment = container.dataset.readyFragment;
      const readySelector = container.dataset.readySelector;
      if (readyFragment && !frameDocument.getElementById(readyFragment)) throw new Error("reference fragment unavailable");
      if (readySelector && !frameDocument.querySelector(readySelector)) throw new Error("reference state unavailable");
      const focusRoot = focusEmbeddedReference(frameDocument, container.dataset.focusSelector, {
        isolate: contextMode === "isolated",
      });
      if (container.dataset.focusSelector && !focusRoot) throw new Error("reference focus unavailable");
      if (contextMode === "isolated") {
        sizeFocusedReference(container, frameDocument, focusRoot);
      } else {
        container.style.removeProperty("--explorer-stage-height");
      }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (revision !== referenceRevision) return;
        const currentSource = frame.getAttribute("src");
        const currentLoadedUrl = frame.contentWindow?.location?.href || "";
        if (!matchesExpectedDocument(currentSource, currentLoadedUrl)) {
          retryReveal(revision);
          return;
        }
        container.dataset.stageReady = "true";
        frame.dispatchEvent(new CustomEvent("kin:stage-ready", { bubbles: true }));
        if (container.dataset.stageInput === "keyboard") {
          requestAnimationFrame(() => delete container.dataset.stageInput);
        } else {
          delete container.dataset.stageInput;
        }
      }));
    } catch {
      if (revision !== referenceRevision) return;
      container.dataset.stageReady = "false";
      delete container.dataset.stageInput;
      loader.replaceChildren(document.createTextNode(
        root.lang === "zh-CN" ? "交互预览暂不可用" : "Reference unavailable",
      ));
    }
  }

  function setTheme(nextTheme, { revealReference = true, explicit = true } = {}) {
    theme = nextTheme === "light" ? "light" : "dark";
    if (explicit) themeExplicit = true;
    syncControls();
    if (revealReference && frame.contentDocument?.documentElement) reveal();
  }

  function syncOuterAppearance() {
    contrast = root.dataset.contrast === "more" ? "more" : "normal";
    if (themeExplicit) {
      container.dataset.stageContrast = contrast;
      if (frame.contentDocument?.documentElement) reveal();
      return;
    }
    const nextTheme = root.dataset.theme === "light" ? "light" : "dark";
    if (nextTheme === theme && container.dataset.stageContrast === contrast) {
      syncControls();
      return;
    }
    setTheme(nextTheme, { explicit: false });
  }

  function setViewport(nextViewport) {
    viewport = nextViewport === "narrow" ? "narrow" : "wide";
    syncControls();
    if (frame.contentDocument?.documentElement) {
      const focusRoot = frame.contentDocument.querySelector("[data-showcase-focus-root]");
      if (contextMode === "isolated") sizeFocusedReference(container, frame.contentDocument, focusRoot);
    }
  }

  function setContext(nextContext) {
    contextMode = nextContext === "isolated" ? "isolated" : "workflow";
    syncControls();
    if (frame.contentDocument?.documentElement) reveal();
  }

  frame.addEventListener("load", reveal);
  for (const control of container.querySelectorAll("button[data-stage-theme]")) {
    control.addEventListener("click", () => setTheme(control.dataset.stageTheme));
  }
  for (const control of container.querySelectorAll("button[data-stage-viewport]")) {
    control.addEventListener("click", () => setViewport(control.dataset.stageViewport));
  }
  for (const control of container.querySelectorAll("button[data-stage-context]")) {
    control.addEventListener("click", () => setContext(control.dataset.stageContext));
  }

  container.addEventListener("kin:reference-change", () => {
    referenceRevision += 1;
    contrast = root.dataset.contrast === "more" ? "more" : "normal";
    container.dataset.stageContrast = contrast;
    container.dataset.stageReady = "false";
    container.style.removeProperty("--explorer-stage-height");
  });
  container.addEventListener("kin:reference-refresh", reveal);
  container.addEventListener("kin:stage-theme", (event) =>
    setTheme(event.detail?.theme, {
      revealReference: event.detail?.reveal !== false,
      explicit: event.detail?.explicit !== false,
    }));
  syncControls();
  container.dataset.stageContrast = contrast;
  if (frame.contentDocument?.readyState === "complete") reveal();
  return syncOuterAppearance;
}

function initializeComponentTabs(container) {
  const tabs = [...container.querySelectorAll('[role="tab"]')];
  const panels = [...container.querySelectorAll('[role="tabpanel"]')];
  if (tabs.length === 0 || panels.length === 0) return;

  function activate(tab, { focus = false } = {}) {
    for (const candidate of tabs) {
      const selected = candidate === tab;
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      const panel = panels.find((entry) => entry.id === candidate.getAttribute("aria-controls"));
      if (panel) panel.hidden = !selected;
    }
    if (focus) tab.focus();
  }

  for (const tab of tabs) tab.addEventListener("click", () => activate(tab));
  container.querySelector('[role="tablist"]')?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else next = (index + 1) % tabs.length;
    activate(tabs[next], { focus: true });
  });
}

function initializeComponentWorkbench(browser) {
  const choices = [...browser.querySelectorAll("[data-component-choice]")];
  const stageContainer = browser.querySelector("[data-reference-stage]");
  const frame = stageContainer?.querySelector("[data-stage-frame]");
  const stageTitle = stageContainer?.querySelector("[data-stage-title]");
  const stageJob = stageContainer?.querySelector("[data-stage-job]");
  const stageState = stageContainer?.querySelector("[data-stage-state]");
  const stageLanguage = stageContainer?.querySelector("[data-stage-language-text]");
  const stageLanguageNotes = stageContainer?.querySelectorAll("[data-stage-language-note]") || [];
  const directReference = stageContainer?.querySelector("[data-stage-reference-link]");
  const explorerLink = stageContainer?.querySelector("[data-stage-explorer-link]");
  const reset = stageContainer?.querySelector("[data-stage-reset]");
  if (
    choices.length === 0 ||
    !stageContainer ||
    !frame ||
    !stageTitle ||
    !stageJob ||
    !stageState ||
    !stageLanguage ||
    !directReference ||
    !explorerLink
  ) return;

  const syncAppearance = initializeReferenceStage(stageContainer);
  if (syncAppearance) referenceStageAppearanceSyncs.push(syncAppearance);

  let selected = choices.find((choice) => choice.getAttribute("aria-selected") === "true") || choices[0];
  let selectionRevision = 0;
  let focusIntent = null;

  function restoreIntentFocus() {
    const target = focusIntent;
    if (!target || !target.isConnected) return;
    if (document.activeElement !== target) target.focus();
  }

  function updateLanguageNotice(choice) {
    const notice = choice.dataset.componentReferenceLanguage || "";
    for (const element of stageLanguageNotes) {
      if (element === stageLanguage) continue;
      element.textContent = notice;
      element.hidden = !notice;
    }
  }

  function activate(choice, { focus = false, invocation = "pointer", updateHash = true, force = false } = {}) {
    if (!choice || (!force && choice === selected && stageContainer.dataset.stageReady === "true")) return;
    selected = choice;
    selectionRevision += 1;
    stageContainer.dataset.stageInput = invocation;
    stageContainer.dataset.stageSelectionRevision = String(selectionRevision);

    for (const candidate of choices) {
      const active = candidate === choice;
      candidate.setAttribute("aria-selected", String(active));
      candidate.tabIndex = active ? 0 : -1;
    }
    stageContainer.setAttribute("aria-labelledby", choice.id);

    const componentId = choice.dataset.componentChoice;
    const reference = choice.dataset.componentReference;
    const referenceWithFragment = `${reference}${choice.dataset.componentReadyFragment ? `#${choice.dataset.componentReadyFragment}` : ""}`;
    stageContainer.dataset.componentId = componentId;
    stageContainer.dataset.readyFragment = choice.dataset.componentReadyFragment || "";
    stageContainer.dataset.stageHeight = choice.dataset.componentStageHeight || "";
    stageTitle.textContent = choice.dataset.componentName || "";
    stageJob.textContent = choice.dataset.componentJob || "";
    stageState.textContent = choice.dataset.componentState || "";
    const referenceLocale = choice.dataset.componentReferenceLocale || (root.lang === "zh-CN" ? "zh-CN" : "en");
    stageLanguage.textContent = referenceLocale === "zh-CN" ? "中文" : "English";
    stageLanguage.lang = referenceLocale;
    updateLanguageNotice(choice);
    directReference.href = referenceWithFragment;
    explorerLink.href = choice.dataset.componentExplorer || "";
    if (directReference.firstChild?.nodeType === Node.TEXT_NODE) {
      directReference.firstChild.nodeValue = root.lang === "zh-CN" ? "打开预览 " : "Open reference ";
    }
    if (explorerLink.firstChild?.nodeType === Node.TEXT_NODE) {
      explorerLink.firstChild.nodeValue = root.lang === "zh-CN" ? "打开演示 " : "Open Explorer ";
    }

    stageContainer.dispatchEvent(new CustomEvent("kin:reference-change", { detail: { revision: selectionRevision } }));
    frame.title = `${choice.dataset.componentName || "Component"}: ${choice.dataset.componentState || "reference"}`;
    if (frame.getAttribute("src") === reference) {
      frame.contentWindow?.location?.reload?.();
    } else {
      frame.src = reference;
      const nextUrl = new URL(reference, window.location.href).href;
      if (frame.contentWindow?.location?.href && frame.contentWindow.location.href !== nextUrl) {
        frame.contentWindow.location.replace(nextUrl);
      }
    }
    if (focus) {
      focusIntent = choice;
      choice.focus();
    }
    if (updateHash) {
      const hash = `#component-${componentId}`;
      if (location.hash !== hash) history.replaceState(history.state, "", hash);
    }
  }

  for (const choice of choices) {
    choice.addEventListener("click", () => activate(choice, { invocation: "pointer" }));
  }

  browser.querySelector('[role="tablist"]')?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const index = choices.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = choices.length - 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + choices.length) % choices.length;
    else next = (index + 1) % choices.length;
    activate(choices[next], { focus: true, invocation: "keyboard" });
  });

  stageContainer.addEventListener("kin:stage-ready", () => {
    restoreIntentFocus();
  });
  frame.addEventListener("load", () => {
    // Navigating the shared frame can transiently move focus into the frame
    // under heavy parallel loading. Restore an intentional tab/reset target.
    restoreIntentFocus();
  });

  reset?.addEventListener("click", () => {
    focusIntent = reset;
    activate(selected, { invocation: "programmatic", updateHash: false, force: true });
    reset.focus();
  });

  const requestedId = location.hash.match(/^#component-(.+)$/)?.[1];
  const requestedChoice = choices.find((choice) => choice.dataset.componentChoice === requestedId);
  if (requestedChoice) activate(requestedChoice, { invocation: "programmatic", updateHash: false });
}

function initializePatternBrowser(browser) {
  const choices = [...browser.querySelectorAll("[data-pattern-choice]")];
  const contexts = [...browser.querySelectorAll("[data-pattern-context]")];
  const stageContainer = browser.querySelector("[data-reference-stage]");
  const frame = browser.querySelector("[data-stage-frame]");
  const heading = browser.querySelector(".pattern-browser__heading");
  const title = heading?.querySelector("[data-pattern-title]");
  const summary = heading?.querySelector("[data-pattern-summary]");
  const stageTitle = stageContainer?.querySelector("[data-pattern-stage-title]");
  const language = stageContainer?.querySelector("[data-pattern-language]");
  const labLink = browser.querySelector("a[data-pattern-lab]");
  if (!stageContainer || !frame || !title || !summary || !stageTitle || !labLink || choices.length === 0) return;

  let selected = choices.find((choice) => choice.getAttribute("aria-selected") === "true") || choices[0];

  function activate(choice, { focus = false, invocation = "pointer", updateHash = true } = {}) {
    if (!choice || choice === selected && stageContainer.dataset.stageReady === "true") return;
    selected = choice;
    stageContainer.dataset.stageInput = invocation;

    for (const candidate of choices) {
      const active = candidate === choice;
      candidate.setAttribute("aria-selected", String(active));
      candidate.tabIndex = active ? 0 : -1;
    }
    for (const context of contexts) {
      context.hidden = context.dataset.patternContext !== choice.dataset.patternChoice;
    }

    title.textContent = choice.dataset.patternName;
    summary.textContent = choice.dataset.patternSummary;
    stageTitle.textContent = choice.dataset.patternName;
    if (language) language.textContent = choice.dataset.patternLanguage;
    labLink.href = choice.dataset.patternLab;
    syncLabLinkAppearance(labLink);
    stageContainer.dataset.readySelector = choice.dataset.patternReadySelector;
    stageContainer.dispatchEvent(new CustomEvent("kin:reference-change"));
    frame.title = `${choice.dataset.patternName}: ${
      root.lang === "zh-CN" ? "产品布局预览" : "live product reference"
    }`;
    if (frame.getAttribute("src") === choice.dataset.patternReference) {
      frame.dispatchEvent(new Event("load"));
    } else {
      frame.src = choice.dataset.patternReference;
    }
    if (focus) choice.focus();
    if (updateHash) {
      const hash = `#pattern-${choice.dataset.patternChoice}`;
      if (location.hash !== hash) history.replaceState(history.state, "", hash);
    }
  }

  for (const choice of choices) {
    choice.addEventListener("click", () => activate(choice, { invocation: "pointer" }));
  }
  browser.querySelector('[role="tablist"]')?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const index = choices.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = choices.length - 1;
    else if (event.key === "ArrowLeft") next = (index - 1 + choices.length) % choices.length;
    else next = (index + 1) % choices.length;
    activate(choices[next], { focus: true, invocation: "keyboard" });
  });

  const requestedPattern = location.hash.match(/^#pattern-(.+)$/)?.[1];
  const requestedChoice = choices.find((choice) => choice.dataset.patternChoice === requestedPattern);
  if (requestedChoice && requestedChoice !== selected) {
    activate(requestedChoice, { invocation: "programmatic", updateHash: false });
  }
}

for (const referenceStage of document.querySelectorAll("[data-reference-stage]")) {
  if (referenceStage.hasAttribute("data-component-workbench-stage")) continue;
  const syncAppearance = initializeReferenceStage(referenceStage);
  if (syncAppearance) referenceStageAppearanceSyncs.push(syncAppearance);
}
for (const tabset of document.querySelectorAll("[data-component-tabs]")) {
  initializeComponentTabs(tabset);
}
for (const browser of document.querySelectorAll("[data-pattern-browser]")) {
  initializePatternBrowser(browser);
}
for (const browser of document.querySelectorAll("[data-component-workbench]")) {
  initializeComponentWorkbench(browser);
}
