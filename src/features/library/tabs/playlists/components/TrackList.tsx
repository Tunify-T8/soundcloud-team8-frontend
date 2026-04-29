import { Play, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import trackFallback from "@/assets/track.jpg";
import type { CollectionTrack } from "@/features/library/types";

function formatCompactNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return null;
  return Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

interface TrackListProps {
  tracks: CollectionTrack[];
  onReorder?: (newTracks: CollectionTrack[]) => void;
}

interface SortableTrackRowProps {
  ct: CollectionTrack;
  index: number;
  draggable: boolean;
}

const SortableTrackRow: React.FC<SortableTrackRowProps> = ({ ct, index, draggable }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ct.track.id, disabled: !draggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-testid={`playlist-track-row-${ct.track.id}`}
      className="flex items-center justify-between gap-3 px-2 py-2.5 transition hover:bg-zinc-900/60"
    >
      <div className="flex min-w-0 items-center gap-3">
        {draggable && (
          <button
            type="button"
            data-testid={`playlist-track-drag-handle-${ct.track.id}`}
            aria-label="Drag to reorder"
            className="cursor-grab touch-none p-1 text-zinc-500 hover:text-zinc-300 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
        )}
        <img
          src={ct.track.coverUrl || trackFallback}
          alt={ct.track.title}
          className="h-7 w-7 shrink-0 object-cover"
        />
        <p className="truncate text-[13px] font-semibold leading-none text-zinc-100">
          <span className="text-zinc-500 font-bold">{index + 1}</span>
          <span className="text-zinc-500 font-bold">. </span>
          <span className="text-zinc-500 font-bold">
            {ct.track.user.displayName || ct.track.user.username}
          </span>
          <span className="text-zinc-300"> . </span>
          <span>{ct.track.title}</span>
        </p>
      </div>

      <div className="ml-2 flex shrink-0 items-center gap-1 text-zinc-400">
        <Play size={10} fill="currentColor" />
        <span className="text-[12px] font-medium leading-none">
          {formatCompactNumber(
            (ct.track as { playCount?: number; playsCount?: number }).playCount ??
              (ct.track as { playCount?: number; playsCount?: number }).playsCount,
          ) || "0"}
        </span>
      </div>
    </li>
  );
};

const TrackList: React.FC<TrackListProps> = ({ tracks, onReorder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const draggable = Boolean(onReorder);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;

    const oldIndex = tracks.findIndex((t) => t.track.id === active.id);
    const newIndex = tracks.findIndex((t) => t.track.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(tracks, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={tracks.map((ct) => ct.track.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul data-testid="playlist-track-list">
          {tracks.map((ct, i) => (
            <SortableTrackRow key={ct.track.id} ct={ct} index={i} draggable={draggable} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default TrackList;
