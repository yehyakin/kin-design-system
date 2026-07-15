import * as React from "react";
import { Toaster, toast } from "sonner";
import type { ExternalToast, ToasterProps } from "sonner";
import type { KinDirection, KinTheme } from "./shared.js";

const defaultMobileOffset = {
  top: "max(16px, env(safe-area-inset-top))",
  right: "max(16px, env(safe-area-inset-right))",
  bottom: "max(16px, env(safe-area-inset-bottom))",
  left: "max(16px, env(safe-area-inset-left))",
} as const;

export interface KinToasterProps extends Omit<ToasterProps, "theme" | "dir" | "toastOptions"> {
  theme?: KinTheme;
  direction?: KinDirection;
  /** BCP 47 language tag used only for KIN's built-in fallback labels. */
  locale?: string;
  labels?: Partial<KinToasterLabels>;
  toastOptions?: ToasterProps["toastOptions"];
}

export interface KinToasterLabels {
  notifications: string;
  closeNotification: string;
}

const fallbackLabels: Record<"en" | "zh", KinToasterLabels> = {
  en: {
    notifications: "Notifications",
    closeNotification: "Close notification",
  },
  zh: {
    notifications: "通知",
    closeNotification: "关闭通知",
  },
};

function getFallbackLabels(locale: string): KinToasterLabels {
  return locale.toLowerCase().startsWith("zh") ? fallbackLabels.zh : fallbackLabels.en;
}

export function KinToaster({
  theme = "system",
  direction = "auto",
  locale = "en",
  position = "bottom-right",
  visibleToasts = 3,
  expand = false,
  closeButton = true,
  gap = 8,
  duration = 4200,
  offset = 18,
  mobileOffset = defaultMobileOffset,
  richColors = false,
  containerAriaLabel,
  labels,
  toastOptions,
  ...props
}: KinToasterProps): React.JSX.Element {
  const defaults = getFallbackLabels(locale);
  return (
    <Toaster
      {...props}
      theme={theme}
      dir={direction}
      position={position}
      visibleToasts={Math.min(visibleToasts, 3)}
      expand={expand}
      closeButton={closeButton}
      gap={gap}
      duration={duration}
      offset={offset}
      mobileOffset={mobileOffset}
      richColors={richColors}
      containerAriaLabel={containerAriaLabel ?? labels?.notifications ?? defaults.notifications}
      toastOptions={{
        ...toastOptions,
        closeButtonAriaLabel:
          toastOptions?.closeButtonAriaLabel ?? labels?.closeNotification ?? defaults.closeNotification,
        classNames: {
          toast: "kin-toast",
          title: "kin-toast__title",
          description: "kin-toast__description",
          content: "kin-toast__content",
          icon: "kin-toast__icon",
          actionButton: "kin-toast__action",
          cancelButton: "kin-toast__cancel",
          closeButton: "kin-toast__close",
          ...toastOptions?.classNames,
        },
      }}
    />
  );
}

export interface KinUndoToastOptions extends ExternalToast {
  undoLabel: React.ReactNode;
  onUndo: () => void;
}

export interface KinTaskToastMessages<T> {
  loading: React.ReactNode;
  success: React.ReactNode | ((value: T) => React.ReactNode);
  error: React.ReactNode | ((error: unknown) => React.ReactNode);
  description?: React.ReactNode | ((value: T) => React.ReactNode);
}

export const kinToast = {
  message(message: React.ReactNode, options?: ExternalToast) {
    return toast(message, options);
  },
  success(message: React.ReactNode, options?: ExternalToast) {
    return toast.success(message, options);
  },
  error(message: React.ReactNode, options?: ExternalToast) {
    return toast.error(message, options);
  },
  undoable(message: React.ReactNode, { undoLabel, onUndo, ...options }: KinUndoToastOptions) {
    return toast(message, {
      ...options,
      action: {
        label: undoLabel,
        onClick: onUndo,
      },
    });
  },
  task<T>(task: Promise<T> | (() => Promise<T>), messages: KinTaskToastMessages<T>) {
    return toast.promise(task, messages);
  },
  dismiss(id?: string | number) {
    return toast.dismiss(id);
  },
};
