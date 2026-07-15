import * as React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  Announcements,
  DragEndEvent,
  DragStartEvent,
  ScreenReaderInstructions,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cx } from "./shared.js";

export interface KinSortableItem {
  id: UniqueIdentifier;
}

export interface KinSortableRenderState {
  dragging: boolean;
  overlay: boolean;
}

export interface KinSortableListProps<T extends KinSortableItem> {
  items: readonly T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, state: KinSortableRenderState) => React.ReactNode;
  getLabel: (item: T) => string;
  dragHandleLabel: (item: T) => string;
  dragHandleContent?: React.ReactNode;
  announcements?: Announcements;
  screenReaderInstructions?: ScreenReaderInstructions;
  className?: string;
}

interface SortableRowProps<T extends KinSortableItem>
  extends Pick<KinSortableListProps<T>, "renderItem" | "dragHandleLabel" | "dragHandleContent"> {
  item: T;
}

function SortableRow<T extends KinSortableItem>({
  item,
  renderItem,
  dragHandleLabel,
  dragHandleContent,
}: SortableRowProps<T>): React.JSX.Element {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      role="listitem"
      className="kin-sortable__row"
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="kin-sortable__handle"
        aria-label={dragHandleLabel(item)}
        {...attributes}
        {...listeners}
      >
        <span aria-hidden="true">{dragHandleContent ?? "⋮⋮"}</span>
      </button>
      <div className="kin-sortable__content">{renderItem(item, { dragging: isDragging, overlay: false })}</div>
    </div>
  );
}

export function KinSortableList<T extends KinSortableItem>({
  items,
  onReorder,
  renderItem,
  getLabel,
  dragHandleLabel,
  dragHandleContent,
  announcements: suppliedAnnouncements,
  screenReaderInstructions,
  className,
}: KinSortableListProps<T>): React.JSX.Element {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const activeItem = activeId == null ? undefined : items.find((item) => item.id === activeId);
  const labels = React.useMemo(() => new Map(items.map((item) => [item.id, getLabel(item)])), [getLabel, items]);
  const defaultAnnouncements = React.useMemo<Announcements>(
    () => ({
      onDragStart: ({ active }) => `Picked up ${labels.get(active.id) ?? String(active.id)}.`,
      onDragOver: ({ active, over }) =>
        over ? `${labels.get(active.id) ?? String(active.id)} is over ${labels.get(over.id) ?? String(over.id)}.` : undefined,
      onDragEnd: ({ active, over }) =>
        over
          ? `${labels.get(active.id) ?? String(active.id)} was placed at ${labels.get(over.id) ?? String(over.id)}.`
          : `${labels.get(active.id) ?? String(active.id)} was returned to its original position.`,
      onDragCancel: ({ active }) => `${labels.get(active.id) ?? String(active.id)} was returned to its original position.`,
    }),
    [labels],
  );
  const announcements = suppliedAnnouncements ?? defaultAnnouncements;

  const handleStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
  };
  const handleEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0) onReorder(arrayMove([...items], oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{ announcements, screenReaderInstructions, restoreFocus: true }}
      onDragStart={handleStart}
      onDragCancel={() => {
        setActiveId(null);
      }}
      onDragEnd={handleEnd}
    >
      <div className={cx("kin-sortable", className)} role="list">
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableRow
              key={item.id}
              item={item}
              renderItem={renderItem}
              dragHandleLabel={dragHandleLabel}
              dragHandleContent={dragHandleContent}
            />
          ))}
        </SortableContext>
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="kin-sortable__row kin-sortable__row--overlay">
            <span className="kin-sortable__handle" aria-hidden="true">{dragHandleContent ?? "⋮⋮"}</span>
            <div className="kin-sortable__content">{renderItem(activeItem, { dragging: true, overlay: true })}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
