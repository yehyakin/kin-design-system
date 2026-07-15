import * as React from "react";
import { Liveline } from "liveline";
import type { LivelinePoint, LivelineProps } from "liveline";
import { cx, useReducedMotion } from "./shared.js";

export interface KinLiveChartProps
  extends Omit<
    LivelineProps,
    "degen" | "pulse" | "exaggerate" | "valueMomentumColor" | "theme" | "data" | "value" | "color"
  > {
  data: LivelinePoint[];
  value: number;
  theme: "light" | "dark";
  summary: React.ReactNode;
  tableLabel: string;
  timeLabel?: string;
  valueLabel?: string;
  color?: string;
  className?: string;
}

export function KinLiveChart({
  data,
  value,
  theme,
  summary,
  tableLabel,
  timeLabel = "Time",
  valueLabel = "Value",
  color,
  className,
  paused = false,
  fill = false,
  grid = false,
  badge = false,
  momentum = false,
  lineWidth = 1.5,
  formatTime = (time) => new Date(time * 1_000).toLocaleString(),
  formatValue = (nextValue) => String(nextValue),
  ...props
}: KinLiveChartProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const resolvedColor = color ?? (theme === "dark" ? "#4fd0de" : "#167f8d");
  return (
    <figure
      className={cx("kin-live-chart", className)}
      data-kin-paused={paused || undefined}
      data-kin-reduced-motion={reducedMotion || undefined}
    >
      <div className="kin-live-chart__canvas" aria-hidden="true">
        <Liveline
          {...props}
          data={data}
          value={value}
          theme={theme}
          color={resolvedColor}
          paused={paused}
          fill={fill}
          grid={grid}
          badge={badge}
          momentum={momentum}
          lineWidth={lineWidth}
          formatTime={formatTime}
          formatValue={formatValue}
          degen={false}
          pulse={false}
          exaggerate={false}
          valueMomentumColor={false}
        />
      </div>
      <figcaption className="kin-live-chart__summary">{summary}</figcaption>
      <details className="kin-live-chart__data">
        <summary>{tableLabel}</summary>
        <div className="kin-live-chart__table-scroll">
          <table>
            <thead><tr><th scope="col">{timeLabel}</th><th scope="col">{valueLabel}</th></tr></thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.time}><td>{formatTime(point.time)}</td><td>{formatValue(point.value)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

export type { LivelinePoint, LivelineProps } from "liveline";
