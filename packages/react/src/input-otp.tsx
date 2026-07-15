import * as React from "react";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import type { OTPInputProps } from "input-otp";
import { cx } from "./shared.js";

export interface KinOTPInputProps
  extends Omit<OTPInputProps, "render" | "children" | "maxLength" | "containerClassName"> {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  length?: number;
  groupAt?: number;
  className?: string;
  slotClassName?: string;
}
export function KinOTPInput({
  label,
  description,
  error,
  length = 6,
  groupAt = 3,
  className,
  slotClassName,
  id,
  pattern = REGEXP_ONLY_DIGITS,
  inputMode = "numeric",
  autoComplete = "one-time-code",
  ...props
}: KinOTPInputProps): React.JSX.Element {
  const generatedId = React.useId();
  const inputId = id ?? `kin-otp-${generatedId}`;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx("kin-otp", className)} data-invalid={Boolean(error) || undefined}>
      <label className="kin-otp__label" htmlFor={inputId}>{label}</label>
      {description ? <p className="kin-otp__description" id={descriptionId}>{description}</p> : null}
      <OTPInput
        {...props}
        id={inputId}
        maxLength={length}
        pattern={pattern}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error) || undefined}
        containerClassName="kin-otp__input"
        render={({ slots }) => (
          <div className="kin-otp__slots">
            {slots.map((slot, index) => (
              <React.Fragment key={index}>
                {index === groupAt ? <span className="kin-otp__separator" aria-hidden="true">—</span> : null}
                <span
                  className={cx("kin-otp__slot", slotClassName)}
                  data-active={slot.isActive || undefined}
                  aria-hidden="true"
                >
                  {slot.char ?? slot.placeholderChar}
                  {slot.hasFakeCaret ? <span className="kin-otp__caret" /> : null}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      />
      {error ? <p className="kin-otp__error" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}
