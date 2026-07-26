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
  const panel = container.querySelector('[role="tabpanel"]');
  if (!frame || !loader || options.length === 0 || !title || !job || !labLink || !panel) return;

  let selected = options.find((option) => option.getAttribute("aria-selected") === "true") || options[0];
  let loadRevision = 0;

  function setLoading(label) {
    container.dataset.stageReady = "false";
    loader.textContent = "";
    const dot = document.createElement("span");
    dot.setAttribute("aria-hidden", "true");
    loader.append(dot, document.createTextNode(label));
  }

  function selectOption(option, { moveFocus = false } = {}) {
    if (!option || option === selected && container.dataset.stageReady === "true") return;
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
    panel.setAttribute("aria-labelledby", option.id);
    frame.title = `${stageTitle} reference`;
    labLink.href = option.dataset.lab || labLink.href;
    syncLabLinkAppearance(labLink);

    const posterSource = option.dataset.poster;
    if (poster) {
      if (posterSource) {
        poster.src = posterSource;
        poster.hidden = false;
      } else {
        poster.hidden = true;
      }
    }

    setLoading(document.documentElement.lang === "zh-CN" ? "正在准备参考界面" : "Preparing the reference");
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
      if (!prepareEmbeddedReference(frame, { theme: "dark", contrast: "normal" })) throw new Error("Reference unavailable");
      if (readySelector && !frame.contentDocument.querySelector(readySelector)) throw new Error("Reference state unavailable");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (revision === loadRevision) container.dataset.stageReady = "true";
      }));
    } catch {
      container.dataset.stageReady = "false";
      loader.textContent = document.documentElement.lang === "zh-CN"
        ? "参考界面暂不可用，请在 Lab 中打开"
        : "Reference unavailable. Open it in Lab.";
    }
  }

  frame.addEventListener("load", finishFrame);

  for (const option of options) {
    option.addEventListener("click", () => selectOption(option));
  }

  const tablist = container.querySelector('[role="tablist"]');
  tablist?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const index = options.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else if (event.key === "ArrowLeft") next = (index - 1 + options.length) % options.length;
    else next = (index + 1) % options.length;
    selectOption(options[next], { moveFocus: true });
  });

  options.forEach((option) => {
    option.tabIndex = option === selected ? 0 : -1;
  });
  syncLabLinkAppearance(labLink);
  setLoading(document.documentElement.lang === "zh-CN" ? "正在准备参考界面" : "Preparing the reference");
  if (frame.contentDocument?.readyState === "complete") finishFrame();
}

for (const link of labLinks) syncLabLinkAppearance(link);
if (stage) initializeScenarioStage(stage);

const appearanceObserver = new MutationObserver((records) => {
  if (!records.some((record) => ["data-theme", "data-contrast"].includes(record.attributeName))) return;
  for (const link of labLinks) syncLabLinkAppearance(link);
});
appearanceObserver.observe(root, {
  attributes: true,
  attributeFilter: ["data-theme", "data-contrast"],
});

function initializeReferenceStage(container) {
  const frame = container.querySelector("[data-stage-frame]");
  const loader = container.querySelector("[data-stage-loading]");
  if (!frame || !loader) return;

  let theme = container.dataset.initialTheme === "light" ? "light" : "dark";
  let viewport = container.dataset.stageViewport === "narrow" ? "narrow" : "wide";

  function syncControls() {
    for (const control of container.querySelectorAll("button[data-stage-theme]")) {
      control.setAttribute("aria-pressed", String(control.dataset.stageTheme === theme));
    }
    for (const control of container.querySelectorAll("button[data-stage-viewport]")) {
      control.setAttribute("aria-pressed", String(control.dataset.stageViewport === viewport));
    }
    container.dataset.stageViewport = viewport;
  }

  function reveal() {
    try {
      if (!prepareEmbeddedReference(frame, { theme, contrast: "normal" })) throw new Error("unavailable");
      const frameDocument = frame.contentDocument;
      const readyFragment = container.dataset.readyFragment;
      const readySelector = container.dataset.readySelector;
      if (readyFragment && !frameDocument.getElementById(readyFragment)) throw new Error("reference fragment unavailable");
      if (readySelector && !frameDocument.querySelector(readySelector)) throw new Error("reference state unavailable");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        container.dataset.stageReady = "true";
        frame.dispatchEvent(new CustomEvent("kin:stage-ready", { bubbles: true }));
      }));
    } catch {
      container.dataset.stageReady = "false";
      loader.replaceChildren(document.createTextNode(
        root.lang === "zh-CN" ? "参考界面暂不可用" : "Reference unavailable",
      ));
    }
  }

  function setTheme(nextTheme) {
    theme = nextTheme === "light" ? "light" : "dark";
    syncControls();
    if (frame.contentDocument?.documentElement) reveal();
  }

  function setViewport(nextViewport) {
    viewport = nextViewport === "narrow" ? "narrow" : "wide";
    syncControls();
  }

  frame.addEventListener("load", reveal);
  for (const control of container.querySelectorAll("button[data-stage-theme]")) {
    control.addEventListener("click", () => setTheme(control.dataset.stageTheme));
  }
  for (const control of container.querySelectorAll("button[data-stage-viewport]")) {
    control.addEventListener("click", () => setViewport(control.dataset.stageViewport));
  }

  container.addEventListener("kin:reference-change", () => {
    container.dataset.stageReady = "false";
  });
  syncControls();
  if (frame.contentDocument?.readyState === "complete") reveal();
}

function initializeComponentBrowser(browser) {
  const choices = [...browser.querySelectorAll("[data-component-choice]")];
  const stageContainer = browser.querySelector("[data-reference-stage]");
  const frame = browser.querySelector("[data-stage-frame]");
  const title = browser.querySelector("[data-stage-title]");
  const job = browser.querySelector("[data-stage-job]");
  const explorer = browser.querySelector("[data-stage-explorer]");
  if (!stageContainer || !frame || !title || !job || !explorer || choices.length === 0) return;

  let selected = choices.find((choice) => choice.getAttribute("aria-selected") === "true") || choices[0];

  function activate(choice, { focus = false } = {}) {
    selected = choice;
    for (const candidate of choices) {
      const active = candidate === choice;
      candidate.setAttribute("aria-selected", String(active));
      candidate.tabIndex = active ? 0 : -1;
    }
    title.textContent = choice.dataset.componentName;
    job.textContent = choice.dataset.componentJob;
    explorer.href = choice.dataset.componentExplorer;
    stageContainer.dataset.readyFragment = choice.dataset.componentReadyFragment;
    frame.title = `${choice.dataset.componentName}: ${choice.dataset.componentState}`;
    stageContainer.dispatchEvent(new CustomEvent("kin:reference-change"));
    frame.src = choice.dataset.componentReference;
    if (focus) choice.focus();
  }

  for (const choice of choices) choice.addEventListener("click", () => activate(choice));
  browser.querySelector('[role="listbox"]')?.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const index = choices.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = choices.length - 1;
    else if (event.key === "ArrowUp") next = (index - 1 + choices.length) % choices.length;
    else next = (index + 1) % choices.length;
    activate(choices[next], { focus: true });
  });

  frame.addEventListener("kin:stage-ready", () => {
    if (selected.dataset.componentId !== "command-menu") return;
    frame.contentDocument?.querySelector("[data-command-open]")?.click();
  });
  if (selected.dataset.componentId === "command-menu" && frame.contentDocument?.readyState === "complete") {
    frame.contentDocument.querySelector("[data-command-open]")?.click();
  }
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

for (const referenceStage of document.querySelectorAll("[data-reference-stage]")) {
  initializeReferenceStage(referenceStage);
}
for (const browser of document.querySelectorAll("[data-component-browser]")) {
  initializeComponentBrowser(browser);
}
for (const tabset of document.querySelectorAll("[data-component-tabs]")) {
  initializeComponentTabs(tabset);
}
