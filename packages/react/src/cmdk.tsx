import * as React from "react";
import { Command } from "cmdk";
import { cx, isEditableTarget } from "./shared.js";

export interface KinCommandItem {
  id: string;
  label: React.ReactNode;
  value?: string;
  keywords?: string[];
  shortcut?: React.ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}

export interface KinCommandGroup {
  id: string;
  heading: React.ReactNode;
  items: KinCommandItem[];
}

export type KinCommandInvocation = "keyboard" | "pointer";

export interface KinCommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: KinCommandGroup[];
  label: string;
  inputLabel: string;
  placeholder?: string;
  emptyLabel?: React.ReactNode;
  loading?: boolean;
  loadingLabel?: React.ReactNode;
  shouldFilter?: boolean;
  invocation?: KinCommandInvocation;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

export function KinCommandMenu({
  open,
  onOpenChange,
  groups,
  label,
  inputLabel,
  placeholder,
  emptyLabel = "No results",
  loading = false,
  loadingLabel = "Loading",
  shouldFilter = true,
  invocation = "keyboard",
  returnFocusRef,
  className,
}: KinCommandMenuProps): React.JSX.Element {
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
      if (!nextOpen && returnFocusRef?.current) {
        requestAnimationFrame(() => returnFocusRef.current?.focus({ preventScroll: true }));
      }
    },
    [onOpenChange, returnFocusRef],
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={handleOpenChange}
      label={label}
      shouldFilter={shouldFilter}
      loop
      overlayClassName="kin-command__overlay"
      contentClassName={cx("kin-command", className)}
      data-kin-command
      data-kin-invocation={invocation}
    >
      <div className="kin-command__input-row">
        <Command.Input aria-label={inputLabel} autoFocus placeholder={placeholder} />
      </div>
      <Command.List className="kin-command__list" aria-label={label}>
        {loading ? <Command.Loading>{loadingLabel}</Command.Loading> : null}
        <Command.Empty>{emptyLabel}</Command.Empty>
        {groups.map((group) => (
          <Command.Group key={group.id} value={group.id} heading={group.heading}>
            {group.items.map((item) => (
              <Command.Item
                key={item.id}
                value={item.value ?? item.id}
                keywords={item.keywords}
                disabled={item.disabled}
                onSelect={() => {
                  item.onSelect();
                  handleOpenChange(false);
                }}
              >
                <span className="kin-command__item-label">{item.label}</span>
                {item.shortcut ? <span className="kin-command__shortcut">{item.shortcut}</span> : null}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}

export interface UseKinCommandShortcutOptions {
  open: boolean;
  onOpenChange: (open: boolean, invocation: KinCommandInvocation) => void;
  slashToOpen?: boolean;
}

export function useKinCommandShortcut({
  open,
  onOpenChange,
  slashToOpen = false,
}: UseKinCommandShortcutOptions): void {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || isEditableTarget(event.target)) return;
      const commandShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const slashShortcut = slashToOpen && event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
      if (!commandShortcut && !slashShortcut) return;
      event.preventDefault();
      onOpenChange(!open, "keyboard");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open, slashToOpen]);
}
