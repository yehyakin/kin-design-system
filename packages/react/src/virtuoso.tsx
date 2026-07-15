import * as React from "react";
import { Virtuoso } from "react-virtuoso";
import type { FollowOutput, ListRange, VirtuosoHandle } from "react-virtuoso";
import { cx } from "./shared.js";

export interface KinVirtualListProps<T> {
  items: readonly T[];
  getKey: (item: T, index: number) => React.Key;
  renderItem: (item: T, index: number) => React.ReactNode;
  label: string;
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

  React.useEffect(() => {
    if (activeIndex == null || activeIndex < 0 || activeIndex >= items.length) return;
    listRef.current?.scrollIntoView({ index: activeIndex, behavior: "auto", done: () => undefined });
  }, [activeIndex, items.length]);

  return (
    <Virtuoso
      ref={listRef}
      data={items}
      role="list"
      aria-label={label}
      className={cx("kin-virtual-list", className)}
      style={{ height: 320, ...style }}
      defaultItemHeight={defaultItemHeight}
      overscan={overscan}
      followOutput={followOutput}
      rangeChanged={onRangeChanged}
      endReached={onEndReached}
      computeItemKey={(index, item) => getKey(item, index)}
      itemContent={(index, item) => (
        <div
          className="kin-virtual-list__item"
          role="listitem"
          aria-posinset={index + 1}
          aria-setsize={items.length}
          data-active={index === activeIndex || undefined}
        >
          {renderItem(item, index)}
        </div>
      )}
    />
  );
}
