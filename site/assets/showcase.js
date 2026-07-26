const showcaseRoot = document.documentElement;
const showcasePreviews = [...document.querySelectorAll("[data-showcase-preview]")];
const narrowPreview = matchMedia("(max-width: 720px)");
const reducedPreviewMotion = matchMedia("(prefers-reduced-motion: reduce)");
const previewControllers = [];

function resolvedAppearanceId() {
  const theme = showcaseRoot.dataset.theme === "light" ? "light" : "dark";
  return showcaseRoot.dataset.contrast === "more" ? `${theme}-high-contrast` : theme;
}

function syncLabLinkAppearance(link) {
  if (!link) return;
  const url = new URL(link.getAttribute("href"), window.location.href);
  url.searchParams.set("theme", resolvedAppearanceId());
  link.href = url.href;
}

function initializePreview(preview) {
  const poster = preview.querySelector("[data-preview-poster]");
  const frame = preview.querySelector("[data-preview-frame]");
  const trigger = preview.querySelector("[data-preview-activate]");
  const triggerLabel = preview.querySelector("[data-preview-trigger-label]");
  const deactivateButton = preview.querySelector("[data-preview-deactivate]");
  const status = preview.querySelector("[data-preview-status]");
  const labLinks = [...document.querySelectorAll("[data-showcase-lab-link]")];

  if (!poster || !frame || !trigger || !triggerLabel || !deactivateButton || !status) return null;

  let loadingTimer;
  let teardownTimer;
  let frameEscapeHandler;
  let focusRestorePending = false;
  let restoreTriggerOnFailure = false;

  function message(name, fallback) {
    return preview.dataset[name] || fallback;
  }

  function clearLoadingTimer() {
    if (loadingTimer !== undefined) window.clearTimeout(loadingTimer);
    loadingTimer = undefined;
  }

  function clearTeardownTimer() {
    if (teardownTimer !== undefined) window.clearTimeout(teardownTimer);
    teardownTimer = undefined;
  }

  function restoreTriggerFocus({ complete = false } = {}) {
    if (!focusRestorePending || preview.dataset.state !== "idle") return;
    trigger.focus({ preventScroll: true });
    if (complete) focusRestorePending = false;
  }

  function setStatus(state, text) {
    status.dataset.state = state;
    status.textContent = text;
  }

  function updateTriggerLabel() {
    if (narrowPreview.matches) {
      triggerLabel.textContent = message("labelNarrow", "Open preview in Lab");
      trigger.setAttribute("aria-label", message("labelNarrow", "Open preview in Lab"));
      return;
    }

    const fallback = preview.dataset.state === "fallback";
    const label = fallback
      ? message("labelRetry", "Retry interactive preview")
      : message("labelEnter", "Enter interactive preview");
    triggerLabel.textContent = label;
    trigger.setAttribute("aria-label", label);
  }

  function setFrameInteractive(interactive) {
    frame.inert = !interactive;
    frame.tabIndex = interactive ? 0 : -1;
    frame.setAttribute("aria-hidden", String(!interactive));
  }

  function detachFrameEscape() {
    if (!frameEscapeHandler) return;
    try {
      frame.contentWindow?.removeEventListener("keydown", frameEscapeHandler);
    } catch {}
    frameEscapeHandler = undefined;
  }

  function unloadFrame() {
    detachFrameEscape();
    frame.dataset.loaded = "false";
    frame.removeAttribute("src");
  }

  function syncFrameAppearance() {
    if (frame.dataset.loaded !== "true") return;

    try {
      const frameDocument = frame.contentDocument;
      if (!frameDocument) return;
      const frameRoot = frameDocument.documentElement;
      const theme = showcaseRoot.dataset.theme === "light" ? "light" : "dark";
      const contrast = showcaseRoot.dataset.contrast === "more" ? "more" : "normal";

      frameRoot.dataset.theme = theme;
      frameRoot.dataset.themePreference = theme;
      frameRoot.dataset.contrast = contrast;
      frameRoot.style.colorScheme = theme;

      const themeColor = frameDocument.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.content = theme === "dark" ? "#08090a" : "#f6f7f8";

      for (const control of frameDocument.querySelectorAll("[data-theme-switch]")) {
        control.setAttribute("aria-checked", String(theme === "dark"));
      }
      for (const control of frameDocument.querySelectorAll("[data-contrast-toggle]")) {
        control.setAttribute("aria-pressed", String(contrast === "more"));
      }
    } catch {
      failPreview();
    }
  }

  function syncAppearance() {
    for (const link of labLinks) syncLabLinkAppearance(link);
    syncFrameAppearance();
  }

  function finishActivation() {
    clearLoadingTimer();
    clearTeardownTimer();
    focusRestorePending = false;
    restoreTriggerOnFailure = false;
    preview.dataset.state = "active";
    poster.setAttribute("aria-hidden", "true");
    trigger.hidden = true;
    trigger.disabled = false;
    deactivateButton.hidden = false;
    frame.dataset.loaded = "true";
    setFrameInteractive(true);
    syncFrameAppearance();
    setStatus("active", message("statusActive", "Interactive preview active. Press Escape to return to the poster."));

    frameEscapeHandler = (event) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      deactivatePreview(true);
    };

    try {
      frame.contentWindow?.addEventListener("keydown", frameEscapeHandler);
    } catch {}

    requestAnimationFrame(() => {
      if (preview.dataset.state === "active") frame.focus({ preventScroll: true });
    });
  }

  function failPreview() {
    const shouldRestoreFocus = restoreTriggerOnFailure
      && (!document.activeElement
        || document.activeElement === document.body
        || preview.contains(document.activeElement));
    clearLoadingTimer();
    clearTeardownTimer();
    detachFrameEscape();
    restoreTriggerOnFailure = false;
    preview.dataset.state = "fallback";
    poster.setAttribute("aria-hidden", "false");
    trigger.hidden = false;
    trigger.disabled = false;
    deactivateButton.hidden = true;
    setFrameInteractive(false);
    unloadFrame();
    updateTriggerLabel();
    setStatus("fallback", message("statusFallback", "The embedded preview did not load. Open the same state in Lab."));
    if (shouldRestoreFocus) {
      requestAnimationFrame(() => {
        if (preview.dataset.state === "fallback") trigger.focus({ preventScroll: true });
      });
    }
  }

  function activatePreview() {
    syncAppearance();
    if (narrowPreview.matches) {
      const directLabLink = preview.querySelector("[data-showcase-lab-link]");
      if (directLabLink) window.location.assign(directLabLink.href);
      return;
    }

    clearTeardownTimer();
    focusRestorePending = false;
    restoreTriggerOnFailure = document.activeElement === trigger;
    if (frame.dataset.loaded === "true") {
      finishActivation();
      return;
    }

    preview.dataset.state = "loading";
    poster.setAttribute("aria-hidden", "false");
    trigger.hidden = false;
    trigger.disabled = true;
    deactivateButton.hidden = false;
    setFrameInteractive(false);
    triggerLabel.textContent = message("labelLoading", "Loading preview");
    setStatus("loading", message("statusLoading", "Loading the same-origin interactive reference…"));

    const source = frame.dataset.src;
    if (!source) {
      failPreview();
      return;
    }

    if (!frame.hasAttribute("src")) frame.src = source;
    clearLoadingTimer();
    loadingTimer = window.setTimeout(failPreview, 10000);
  }

  function deactivatePreview(restoreFocus = true) {
    if (!["active", "loading"].includes(preview.dataset.state)) return;
    clearLoadingTimer();
    detachFrameEscape();
    preview.dataset.state = "idle";
    poster.setAttribute("aria-hidden", "false");
    trigger.hidden = false;
    trigger.disabled = false;
    restoreTriggerOnFailure = false;
    deactivateButton.hidden = true;
    setFrameInteractive(false);
    updateTriggerLabel();
    setStatus("idle", message("statusIdle", "Poster shown. The interactive reference is not loaded."));
    focusRestorePending = restoreFocus;

    clearTeardownTimer();
    teardownTimer = window.setTimeout(
      () => {
        if (preview.dataset.state !== "idle") return;
        unloadFrame();
        window.setTimeout(() => restoreTriggerFocus({ complete: true }), 0);
      },
      reducedPreviewMotion.matches ? 0 : 180,
    );

    if (restoreFocus) window.setTimeout(restoreTriggerFocus, 0);
  }

  frame.addEventListener("load", () => {
    if (preview.dataset.state === "idle") {
      restoreTriggerFocus({ complete: true });
      return;
    }
    if (preview.dataset.state !== "loading" || !frame.hasAttribute("src")) return;
    try {
      const frameDocument = frame.contentDocument;
      const frameLocation = frameDocument?.location.href;
      const readySelector = frame.dataset.previewReady;
      if (!frameLocation || frameLocation === "about:blank") {
        failPreview();
        return;
      }
      if (!readySelector || !frameDocument.querySelector(readySelector)) {
        failPreview();
        return;
      }
      finishActivation();
    } catch {
      failPreview();
    }
  });
  frame.addEventListener("error", failPreview);
  trigger.addEventListener("click", activatePreview);
  deactivateButton.addEventListener("click", () => deactivatePreview(true));
  narrowPreview.addEventListener("change", updateTriggerLabel);

  trigger.hidden = false;
  updateTriggerLabel();
  syncAppearance();
  setFrameInteractive(false);

  return {
    deactivate: deactivatePreview,
    isActive: () => ["active", "loading"].includes(preview.dataset.state),
    syncAppearance,
  };
}

for (const preview of showcasePreviews) {
  const controller = initializePreview(preview);
  if (controller) previewControllers.push(controller);
}

const appearanceObserver = new MutationObserver((records) => {
  if (!records.some((record) => ["data-theme", "data-contrast"].includes(record.attributeName))) return;
  for (const controller of previewControllers) controller.syncAppearance();
});
appearanceObserver.observe(showcaseRoot, {
  attributes: true,
  attributeFilter: ["data-theme", "data-contrast"],
});

addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || event.defaultPrevented) return;
  const activeController = previewControllers.find((controller) => controller.isActive());
  if (!activeController) return;
  event.preventDefault();
  activeController.deactivate(true);
});
