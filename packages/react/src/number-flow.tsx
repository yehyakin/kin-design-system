import * as React from "react";
import NumberFlow, { useCanAnimate } from "@number-flow/react";
import type { NumberFlowProps } from "@number-flow/react";
import { cx } from "./shared.js";

export interface AnimatedMetricProps extends Omit<NumberFlowProps, "value" | "animated"> {
  value: number;
  label: string;
  className?: string;
  skipWhenDocumentHidden?: boolean;
}

function formattedValue({
  value,
  locales,
  format,
  prefix = "",
  suffix = "",
}: Pick<AnimatedMetricProps, "value" | "locales" | "format" | "prefix" | "suffix">): string {
  return `${prefix}${new Intl.NumberFormat(locales, format).format(value)}${suffix}`;
}

export function AnimatedMetric({
  value,
  label,
  locales,
  format,
  prefix,
  suffix,
  className,
  skipWhenDocumentHidden = true,
  respectMotionPreference = true,
  onAnimationsStart,
  onAnimationsFinish,
  ...props
}: AnimatedMetricProps): React.JSX.Element {
  const [hasMounted, setHasMounted] = React.useState(false);
  const [motionPhase, setMotionPhase] = React.useState<"idle" | "animating">("idle");
  const upstreamCanAnimate = useCanAnimate({ respectMotionPreference });
  const canAnimate =
    hasMounted &&
    upstreamCanAnimate &&
    (!skipWhenDocumentHidden || typeof document === "undefined" || document.visibilityState === "visible");
  const finalText = formattedValue({ value, locales, format, prefix, suffix });

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <span
      className={cx("kin-animated-metric", className)}
      data-kin-number-flow
      data-kin-can-animate={canAnimate}
      data-kin-motion-phase={motionPhase}
    >
      <span className="kin-animated-metric__label">{label}</span>
      <NumberFlow
        {...props}
        value={value}
        locales={locales}
        format={format}
        prefix={prefix}
        suffix={suffix}
        animated={canAnimate}
        respectMotionPreference={respectMotionPreference}
        onAnimationsStart={(event) => {
          setMotionPhase("animating");
          onAnimationsStart?.(event);
        }}
        onAnimationsFinish={(event) => {
          setMotionPhase("idle");
          onAnimationsFinish?.(event);
        }}
        aria-label={`${label}: ${finalText}`}
      />
    </span>
  );
}

export type { NumberFlowProps } from "@number-flow/react";
