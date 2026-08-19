import * as React from "react";
import { Virtuoso } from "react-virtuoso";
import type { Components, FollowOutput, ItemProps, ListRange, VirtuosoHandle } from "react-virtuoso";
import { cx } from "./shared.js";

export interface KinVirtualListProps<T> {
  items: readonly T[];
  getKey: (item: T, index: number) => React.Key;
  renderItem: (item: T, index: number) => React.ReactNode;
  label: string;
  /** Semantic role for the Virtuoso root. Defaults to an ordinary list. */
  containerRole?: React.AriaRole;
  /** Semantic role for each virtualized item wrapper. Defaults to a list item. */
  itemRole?: React.AriaRole;
  /** Additional DOM attributes for the Virtuoso root, excluding its owned semantics. */
  containerProps?: Omit<React.HTMLAttributes<HTMLDivElement>, "role" | "aria-label" | "className" | "style">;
  /** Additional DOM attributes for each virtualized item wrapper, excluding its owned role. */
  getItemProps?: (item: T, index: number) => Omit<React.HTMLAttributes<HTMLDivElement>, "role" | "style">;
  activeIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  defaultItemHeight?: number;
  overscan?: number;
  followOutput?: FollowOutput;
  onRangeChanged?: (range: ListRange) => void;
  onEndReached?: (index: number) => void;
}

export function KinVirtualList<T>({
  items,
  getKey,
  renderItem,
  label,
  containerRole = "list",
  itemRole = "listitem",
  containerProps,
  getItemProps,
  activeIndex,
  className,
  style,
  defaultItemHeight,
  overscan = 160,
  followOutput,
  onRangeChanged,
  onEndReached,
}: KinVirtualListProps<T>): React.JSX.Element {
  const listRef = React.useRef<VirtuosoHandle>(null);
  const Item = React.useCallback(({ item, children, ...props }: ItemProps<T>) => {
    const itemProps = getItemProps?.(item, props["data-index"]);
    const { className: itemClassName, ...semanticProps } = itemProps ?? {};
    return (
      <div
        {...semanticProps}
        {...props}
        className={cx("kin-virtual-list__item", itemClassName)}
        role={itemRole}
        aria-posinset={props["data-index"] + 1}
        aria-setsize={items.length}
        data-active={props["data-index"] === activeIndex || undefined}
      >
        {children}
      </div>
    );
  }, [activeIndex, getItemProps, itemRole, items.length]);
  const components = React.useMemo<Components<T>>(() => ({ Item }), [Item]);

  React.useEffect(() => {
    if (activeIndex == null || activeIndex < 0 || activeIndex >= items.length) return;
    listRef.current?.scrollIntoView({ index: activeIndex, behavior: "auto", done: () => undefined });
  }, [activeIndex, items.length]);

  return (
    <Virtuoso
      ref={listRef}
      data={items}
      {...containerProps}
      role={containerRole}
      aria-label={label}
      className={cx("kin-virtual-list", className)}
      style={{ height: 320, ...style }}
      defaultItemHeight={defaultItemHeight}
      overscan={overscan}
      followOutput={followOutput}
      rangeChanged={onRangeChanged}
      endReached={onEndReached}
      components={components}
      computeItemKey={(index, item) => getKey(item, index)}
      itemContent={(index, item) => renderItem(item, index)}
    />
  );
}
