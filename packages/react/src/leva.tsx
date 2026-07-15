import * as React from "react";
import { Leva } from "leva";

export interface KinDevPanelProps {
  enabled: boolean;
  hidden?: boolean;
  collapsed?: boolean;
  title?: React.ReactNode;
}

export function KinDevPanel({
  enabled,
  hidden = false,
  collapsed = true,
  title = "KIN tuning",
}: KinDevPanelProps): React.JSX.Element | null {
  if (!enabled) return null;
  return (
    <Leva
      hidden={hidden}
      collapsed={collapsed}
      oneLineLabels
      hideCopyButton
      titleBar={{ title, drag: false, filter: false }}
      theme={{
        colors: {
          elevation1: "var(--surface-3)",
          elevation2: "var(--surface-2)",
          elevation3: "var(--surface-1)",
          accent1: "var(--accent)",
          accent2: "var(--accent-hover)",
          accent3: "var(--accent)",
          highlight1: "var(--text-primary)",
          highlight2: "var(--text-secondary)",
          highlight3: "var(--text-muted)",
        },
        radii: { xs: "4px", sm: "6px", lg: "8px" },
        fonts: { sans: "var(--font-ui)", mono: "var(--font-mono)" },
      }}
    />
  );
}
