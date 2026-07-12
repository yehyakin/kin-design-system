import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { Toaster, toast } from "sonner";

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
    reactRoot.render(React.createElement(Toaster, {
      theme,
      position: "bottom-right",
      visibleToasts: 3,
      expand: false,
      richColors: false,
      closeButton: true,
      gap: 8,
      duration: 4200,
      mobileOffset: 16,
      offset: 18,
      containerAriaLabel: locale === "zh" ? "通知" : "Notifications",
      toastOptions: {
        closeButtonAriaLabel: locale === "zh" ? "关闭通知" : "Close notification",
        classNames: {
          toast: "kin-toast",
          title: "kin-toast-title",
          description: "kin-toast-description",
          actionButton: "kin-toast-action",
          closeButton: "kin-toast-close",
        },
      },
    }));
  });
  return true;
}

export function updateToasterTheme(theme, locale = currentLocale) {
  if (reactRoot) renderToaster(theme, locale);
}

export function showKinToast({ title, description, actionLabel, undoTitle, theme, locale, tone = "default" }) {
  if (!renderToaster(theme ?? currentTheme, locale ?? currentLocale)) return;
  const notify = tone === "success" ? toast.success : tone === "error" ? toast.error : toast;
  notify(title, {
    description,
    action: actionLabel ? {
      label: actionLabel,
      onClick: () => toast(undoTitle || (locale === "zh" ? "操作已撤销" : "Action undone")),
    } : undefined,
  });
}

export function showKinTaskToast({ loadingTitle, successTitle, description, theme, locale, duration = 900 }) {
  if (!renderToaster(theme ?? currentTheme, locale ?? currentLocale)) return;
  const id = toast.loading(loadingTitle);
  window.setTimeout(() => {
    toast.success(successTitle, { id, description });
  }, duration);
}
