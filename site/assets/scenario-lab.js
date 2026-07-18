const lab = document.querySelector("[data-scenario-lab]");

if (!lab) {
  throw new Error("Scenario lab root is missing.");
}

const elements = {
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
  viewportReadout: document.querySelector("[data-lab-viewport-readout]"),
  themeReadout: document.querySelector("[data-lab-theme-readout]"),
  verification: document.querySelector("[data-lab-verification]"),
  stage: document.querySelector("[data-lab-stage]"),
  frameShell: document.querySelector("[data-lab-frame-shell]"),
  frameSize: document.querySelector("[data-lab-frame-size]"),
  frame: document.querySelector("[data-lab-frame]"),
  error: document.querySelector("[data-lab-error]"),
  errorMessage: document.querySelector("[data-lab-error-message]")
};

let catalog;
let scenarios = [];
let viewports = [];
let themes = [];
let current = null;
let frameObserver = null;
let frameResizeVerification = null;

function option(value, label) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
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
  return new URL("../" + referencePath, window.location.href);
}

function setVerification(state, message, detail) {
  elements.verification.dataset.state = state;
  elements.verification.textContent = message;
  elements.verification.title = detail || "";
}

function writeUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  url.searchParams.set("scenario", current.scenario);
  url.searchParams.set("state", current.state);
  url.searchParams.set("viewport", current.viewport);
  url.searchParams.set("theme", current.theme);
  history.replaceState(null, "", url.pathname + url.search);
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
  elements.stateCount.textContent = count + (count === 1 ? " state" : " states");
}

function renderScenarioDetails() {
  const scenario = selectedScenario();
  const maturity = scenario.source_maturity;
  elements.scenarioId.textContent = scenario.id + " / " + scenario.group;
  elements.scenarioTitle.textContent = scenario.canonical_name;
  elements.sourceMaturity.className = "source-status " + maturity;
  elements.sourceMaturity.textContent = maturity.charAt(0).toUpperCase() + maturity.slice(1) + " source";
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
  elements.previewKicker.textContent = scenario.id + " / " + scenario.group + " / " + maturity + " source";
  elements.previewTitle.textContent = scenario.canonical_name;
  elements.frame.title = scenario.canonical_name + " reference";
  document.title = scenario.canonical_name + " - Scenario Inspection Lab";
}

function renderViewport() {
  const viewport = selectedViewport();
  elements.frameShell.style.setProperty("--lab-frame-width", viewport.width + "px");
  elements.frameShell.style.setProperty("--lab-frame-height", viewport.height + "px");
  elements.stage.dataset.viewport = viewport.id;
  elements.viewportReadout.textContent = viewport.label + " / " + viewport.width + " px";
  elements.frameSize.textContent = viewport.width + " x " + viewport.height;
}

function renderThemeReadout(theme) {
  const resolved = theme || selectedTheme();
  elements.themeReadout.textContent = resolved.label;
}

function renderDirectLink() {
  const control = selectedControl();
  elements.directLink.href = referenceUrl(control.reference_path).href;
  elements.directLink.setAttribute("aria-label", "Open " + control.label + " directly in a new tab");
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
  if (!frameDocument) throw new Error("The reference document is unavailable.");
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
      writeUrl();
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

function verifyCurrentState() {
  const control = selectedControl();
  const assertion = control.assertion;
  const frameDocument = elements.frame.contentDocument;
  const frameWindow = elements.frame.contentWindow;
  if (!frameDocument || !frameWindow) {
    setVerification("fail", "Fixture unavailable", "The same-origin reference document could not be inspected.");
    return false;
  }

  let target;
  try {
    target = frameDocument.querySelector(assertion.selector);
  } catch (error) {
    setVerification("fail", "Invalid fixture selector", error.message);
    return false;
  }

  let passed = false;
  let detail = "";
  if (assertion.kind === "visible") {
    passed = visibleInFrame(target, frameWindow);
    detail = assertion.selector + " must be visible.";
  } else if (assertion.kind === "attribute") {
    const actual = target?.getAttribute(assertion.attribute);
    passed = actual === assertion.value;
    detail = assertion.selector + " expected " + assertion.attribute + "=\"" + assertion.value + "\"; received \"" + actual + "\".";
  } else if (assertion.kind === "text") {
    const actual = target?.textContent?.replace(/\s+/g, " ").trim() || "";
    passed = actual.includes(assertion.value);
    detail = assertion.selector + " must include \"" + assertion.value + "\".";
  }

  if (passed) clearError();
  setVerification(passed ? "pass" : "fail", passed ? "Verified local fixture" : "Fixture check failed", detail);
  lab.dataset.loadState = passed ? "ready" : "mismatch";
  elements.frameShell.dataset.loading = "false";
  return passed;
}

function afterLayout(callback) {
  requestAnimationFrame(() => requestAnimationFrame(callback));
}

function inspectReference() {
  clearError();
  try {
    applyAppearance();
    afterLayout(verifyCurrentState);
  } catch (error) {
    showError("The reference could not be inspected: " + error.message);
  }
}

function loadReference() {
  const control = selectedControl();
  const nextUrl = referenceUrl(control.reference_path);
  clearError();
  elements.frame.dataset.referencePath = control.reference_path;
  renderDirectLink();
  setVerification("loading", "Checking fixture", control.label);
  lab.dataset.loadState = "loading";
  elements.frameShell.dataset.loading = "true";

  if (elements.frame.src === nextUrl.href) {
    inspectReference();
    return;
  }

  const currentUrl = new URL(elements.frame.src || "about:blank", window.location.href);
  const sameDocument = currentUrl.origin === nextUrl.origin
    && currentUrl.pathname === nextUrl.pathname
    && currentUrl.search === nextUrl.search;
  if (sameDocument && currentUrl.hash !== nextUrl.hash) {
    elements.frame.contentWindow?.addEventListener("hashchange", inspectReference, { once: true });
  }
  elements.frame.src = nextUrl.href;
}

function renderAll(options = {}) {
  renderScenarioDetails();
  renderViewport();
  renderThemeReadout();
  renderDirectLink();
  syncPressedControls();
  writeUrl();
  if (options.reload !== false) loadReference();
}

function chooseScenario(id) {
  const scenario = scenarios.find((candidate) => candidate.id === id) || scenarios[0];
  current.scenario = scenario.id;
  current.state = scenario.state_controls[0].state;
  elements.scenario.value = scenario.id;
  renderStateOptions(scenario);
  renderAll();
}

function chooseState(state) {
  const scenario = selectedScenario();
  const control = scenario.state_controls.find((candidate) => candidate.state === state) || scenario.state_controls[0];
  current.state = control.state;
  elements.state.value = control.state;
  renderDirectLink();
  writeUrl();
  loadReference();
}

function chooseViewport(id) {
  if (!viewports.some((viewport) => viewport.id === id)) return;
  clearError();
  current.viewport = id;
  renderViewport();
  syncPressedControls();
  writeUrl();
  setVerification("loading", "Checking fixture", selectedControl().label);
  afterLayout(verifyCurrentState);
}

function chooseTheme(id) {
  if (!themes.some((theme) => theme.id === id)) return;
  clearError();
  current.theme = id;
  syncPressedControls();
  writeUrl();
  setVerification("loading", "Checking fixture", selectedControl().label);
  try {
    applyAppearance();
    afterLayout(verifyCurrentState);
  } catch (error) {
    showError("The theme could not be applied: " + error.message);
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
    buttons[next].click();
  });
}

function showError(message) {
  frameObserver?.disconnect();
  lab.dataset.loadState = "error";
  elements.error.hidden = false;
  elements.errorMessage.textContent = message;
  setVerification("fail", "Inspection unavailable", message);
}

function clearError() {
  elements.error.hidden = true;
  elements.errorMessage.textContent = "";
}

elements.frame.addEventListener("load", () => {
  if (!current || !elements.frame.dataset.referencePath) return;
  inspectReference();
});

const frameResizeObserver = new ResizeObserver(() => {
  const frameDocument = elements.frame.contentDocument;
  if (!current || !elements.frame.dataset.referencePath || frameDocument?.readyState !== "complete") return;
  if (frameResizeVerification) cancelAnimationFrame(frameResizeVerification);
  frameResizeVerification = requestAnimationFrame(() => {
    frameResizeVerification = null;
    afterLayout(verifyCurrentState);
  });
});
frameResizeObserver.observe(elements.frame);

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

bindArrowNavigation(elements.viewportGroup, "[data-lab-viewport]");
bindArrowNavigation(elements.themeGroup, "[data-lab-theme]");

async function initialize() {
  try {
    const response = await fetch(new URL("catalog.json", window.location.href), { cache: "no-store" });
    if (!response.ok) throw new Error("Catalog request returned " + response.status + ".");
    catalog = await response.json();
    scenarios = catalog.scenarios.filter((scenario) => scenario.presentation_status === "showcased" && scenario.state_controls.length > 0);
    viewports = catalog.inspection_defaults.viewports;
    themes = catalog.inspection_defaults.themes;
    if (scenarios.length === 0 || viewports.length === 0 || themes.length === 0) throw new Error("The catalog contains no inspectable fixtures.");

    elements.scenario.replaceChildren();
    for (const scenario of scenarios) {
      elements.scenario.append(option(scenario.id, scenario.id + " / " + scenario.canonical_name));
    }

    const params = new URLSearchParams(window.location.search);
    const scenario = scenarios.find((candidate) => candidate.id === params.get("scenario")) || scenarios[0];
    const control = scenario.state_controls.find((candidate) => candidate.state === params.get("state")) || scenario.state_controls[0];
    const viewport = viewports.find((candidate) => candidate.id === params.get("viewport"))
      || viewports.find((candidate) => candidate.id === (matchMedia("(max-width: 720px)").matches ? "narrow" : "wide"))
      || viewports[0];
    const theme = themes.find((candidate) => candidate.id === params.get("theme"))
      || themes.find((candidate) => candidate.id === "dark")
      || themes[0];

    current = {
      scenario: scenario.id,
      state: control.state,
      viewport: viewport.id,
      theme: theme.id
    };

    elements.scenario.value = scenario.id;
    renderStateOptions(scenario);
    renderAll();
  } catch (error) {
    showError(error.message);
  }
}

initialize();
