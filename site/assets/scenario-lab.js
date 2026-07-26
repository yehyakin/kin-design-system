const lab = document.querySelector("[data-scenario-lab]");

if (!lab) {
  throw new Error("Scenario lab root is missing.");
}

const elements = {
  topbar: document.querySelector(".lab-topbar"),
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
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const controlsExitDuration = 180;
const controlsReducedExitDuration = 80;
const modeStorageKey = "kin-showcase-lab-mode";
const validModes = new Set(["present", "inspect"]);

let catalog;
let scenarios = [];
let viewports = [];
let themes = [];
let current = null;
let currentMode = resolveMode();
let controlsCloseTimer = null;
let controlsReturnTarget = elements.controlsTrigger;
let previewSizing = "fit";
let previewResizeFrame = null;
let frameObserver = null;
let frameResizeVerification = null;
let verificationObserver = null;
let verificationTimer = null;
let inspectionRevision = 0;
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
  const modal = controlsOverlay.matches && controlsOpen;
  elements.controls.setAttribute("aria-hidden", String(!controlsOpen));
  elements.controls.inert = !controlsOpen;
  elements.preview.inert = modal;
  elements.frame.inert = modal || !frameVerified;
  elements.frame.setAttribute("aria-hidden", String(!frameVerified));
  elements.framePlaceholder.inert = frameVerified;
  elements.framePlaceholder.setAttribute("aria-hidden", String(frameVerified));
  elements.topbar.inert = modal;
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
  elements.frameLoadingLabel.textContent = status || "Checking live reference · " + selection;
  elements.framePlaceholder.setAttribute(
    "aria-label",
    (usesGovernedPoster ? "INT-02 presentation poster. " : "Neutral loading stage. ") + "Current selection: " + selection
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
}

function setControls(open, { moveFocus = true, returnTarget } = {}) {
  clearTimeout(controlsCloseTimer);
  controlsCloseTimer = null;
  if (open && returnTarget) controlsReturnTarget = returnTarget;

  if (open) {
    if (controlsState() === "closed" && !controlsOverlay.matches) {
      lab.dataset.controlsTrack = "restored";
      void lab.offsetWidth;
    }
    lab.dataset.controlsState = "open";
    delete lab.dataset.controlsTrack;
  } else if (controlsState() !== "closed") {
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
  repairFocus(target, open);
}

function replaceModeOnly(mode) {
  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.set("mode", mode);
  history.replaceState({ scenarioLab: true, mode }, "", url.pathname + url.search);
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
  setFrameVerified(false, "Checking the live same-origin reference");
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
  return url.pathname + url.search;
}

function writeUrl(mode = "replace") {
  if (mode !== "push" && mode !== "replace") throw new Error("Unknown Scenario Lab history mode: " + mode);
  const nextUrl = serializedUrl();
  const currentUrl = window.location.pathname + window.location.search;
  if (mode === "push" && !window.location.hash && nextUrl === currentUrl) return;
  history[mode + "State"]({ scenarioLab: true, mode: currentMode }, "", nextUrl);
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
  const fitScale = availableWidth > 0 && availableHeight > 0
    ? Math.min(1, availableWidth / frameWidth, availableHeight / frameHeight)
    : 1;
  const nextScale = previewSizing === "fit" ? fitScale : 1;
  const roundedScale = Number(nextScale.toFixed(6));
  const percentage = Math.round(roundedScale * 100);
  const previousAnnouncement = elements.scaleStatus.textContent;

  elements.frameShell.style.transform = "scale(" + roundedScale + ")";
  elements.frameSizing.style.width = frameWidth * roundedScale + "px";
  elements.frameSizing.style.height = frameHeight * roundedScale + "px";
  elements.frameSizing.dataset.sizing = previewSizing;
  elements.frameSizing.dataset.scale = String(roundedScale);
  elements.scaleReadout.textContent = previewSizing === "fit" ? "Fit / " + percentage + "%" : "100%";
  syncSizingControls();

  const announcement = "Preview scale " + percentage + " percent. Configured viewport remains "
    + viewport.width + " by " + viewport.height + " pixels.";
  if (announce && announcement !== previousAnnouncement) elements.scaleStatus.textContent = announcement;

  if (lab.dataset.previewReady !== "true") {
    requestAnimationFrame(() => {
      lab.dataset.previewReady = "true";
    });
  }
}

function choosePreviewSizing(mode) {
  if (!["fit", "actual"].includes(mode) || mode === previewSizing) return;
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
  elements.fullscreen.textContent = active ? "Exit fullscreen" : "Fullscreen";
  elements.preview.dataset.fullscreen = String(active);
  if (available) {
    elements.fullscreen.removeAttribute("title");
  } else {
    elements.fullscreen.title = "Fullscreen is unavailable in this browser.";
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
  elements.directLink.setAttribute("aria-label", "Open " + control.label + " directly in a new tab");
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
    setVerification("fail", "Fixture unavailable", "The same-origin reference document could not be inspected.");
    setFrameVerified(false, "The live reference could not be inspected");
    return false;
  }

  let target;
  try {
    target = frameDocument.querySelector(assertion.selector);
  } catch (error) {
    if (reportFailure) setVerification("fail", "Invalid fixture selector", error.message);
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

  if (passed) {
    clearError();
    setVerification("pass", "Verified local fixture", detail);
    lab.dataset.loadState = "ready";
    setFrameVerified(true);
  } else if (reportFailure) {
    setVerification("fail", "Fixture check failed", detail);
    lab.dataset.loadState = "mismatch";
    setFrameVerified(false, "The live reference did not pass its selector check");
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
    if (!elements.frame.contentDocument) throw new Error("The reference document is unavailable.");
    if (!frameMatchesCurrentReference()) return;
    clearError();
    applyAppearance();
    scheduleVerification(revision);
  } catch (error) {
    if (revision === inspectionRevision) showError("The reference could not be inspected: " + error.message);
  }
}

function loadReference() {
  const revision = beginInspection();
  const control = selectedControl();
  const nextUrl = referenceUrl(control.reference_path);
  clearError();
  elements.frame.dataset.referencePath = control.reference_path;
  renderDirectLink();
  setVerification("loading", "Checking fixture", control.label);
  lab.dataset.loadState = "loading";
  setFrameVerified(false, "Checking live reference · " + control.label);

  const currentUrl = currentFrameUrl();
  if (currentUrl.href === nextUrl.href) {
    inspectReference(revision);
    return;
  }

  const sameDocument = currentUrl.origin === nextUrl.origin
    && currentUrl.pathname === nextUrl.pathname
    && currentUrl.search === nextUrl.search;
  if (sameDocument && currentUrl.hash !== nextUrl.hash) {
    try {
      elements.frame.contentWindow?.addEventListener("hashchange", () => inspectReference(revision), { once: true });
    } catch {
      // A temporarily isolated fixture cannot expose its Window. The fallback below restores the requested reference.
    }
  }
  try {
    const frameWindow = elements.frame.contentWindow;
    if (!frameWindow) throw new Error("The reference frame Window is unavailable.");
    // Scenario controls own the top-level history entry. Replacing the nested
    // document keeps iframe navigations from adding duplicate Back/Forward steps.
    frameWindow.location.replace(nextUrl.href);
  } catch {
    elements.frame.src = nextUrl.href;
  }
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
  setVerification("loading", "Checking fixture", selectedControl().label);
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
  setVerification("loading", "Checking fixture", selectedControl().label);
  try {
    if (frameMatchesCurrentReference()) {
      applyAppearance();
      scheduleVerification(revision);
    }
  } catch (error) {
    if (revision === inspectionRevision) showError("The theme could not be applied: " + error.message);
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
  setFrameVerified(false, "Live reference unavailable; the loading stage remains visible");
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
  if (event.key === "Escape" && !document.fullscreenElement && controlsAreOpen()) {
    setMode("present", { historyMode: "replace", moveFocus: true, returnTarget: elements.controlsTrigger });
  }
});

controlsOverlay.addEventListener("change", (event) => {
  setMode(currentMode, {
    moveFocus: event.matches && currentMode === "inspect",
    persist: false,
    returnTarget: elements.controlsTrigger
  });
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
  if (sizing) choosePreviewSizing(sizing.dataset.labSizing);
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
