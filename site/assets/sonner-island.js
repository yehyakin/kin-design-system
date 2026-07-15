import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { KinToaster, kinToast } from "@kin-design/react/sonner";

let reactRoot;
let currentTheme = "dark";
let currentLocale = "en";

function renderToaster(theme, locale) {
  const container = document.querySelector("[data-sonner-root]");
  if (!container) return false;
  if (!reactRoot) reactRoot = createRoot(container);
  currentTheme = theme;
  currentLocale = locale;
  flushSync(() => {
    reactRoot.render(React.createElement(KinToaster, {
      theme,
      locale,
      position: "bottom-right",
    }));
  });
  return true;
}

export function updateToasterTheme(theme, locale = currentLocale) {
  if (reactRoot) renderToaster(theme, locale);
}

export function showKinToast({ title, description, actionLabel, undoTitle, theme, locale, tone = "default" }) {
  if (!renderToaster(theme ?? currentTheme, locale ?? currentLocale)) return;
  const resolvedLocale = locale ?? currentLocale;
  if (actionLabel) {
    return kinToast.undoable(title, {
      description,
      undoLabel: actionLabel,
      onUndo: () => kinToast.message(undoTitle || (resolvedLocale === "zh" ? "操作已撤销" : "Action undone")),
    });
  }
  if (tone === "success") return kinToast.success(title, { description });
  if (tone === "error") return kinToast.error(title, { description });
  return kinToast.message(title, { description });
}

export function showKinTaskToast({ loadingTitle, successTitle, description, theme, locale, duration = 900 }) {
  if (!renderToaster(theme ?? currentTheme, locale ?? currentLocale)) return;
  const resolvedLocale = locale ?? currentLocale;
  return kinToast.task(
    () => new Promise((resolve) => window.setTimeout(resolve, duration)),
    {
      loading: loadingTitle,
      success: successTitle,
      error: resolvedLocale === "zh" ? "任务失败" : "Task failed",
      description,
    },
  );
}
