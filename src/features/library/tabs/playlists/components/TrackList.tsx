import { Pause, Play, GripVertical } from "lucide-react";
import { useState } from "react";
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
  currentTrackId?: string;
  isPlaying?: boolean;
  onPlayTrack?: (track: CollectionTrack) => void;
}

interface SortableTrackRowProps {
  ct: CollectionTrack;
  index: number;
  draggable: boolean;
  currentTrackId?: string;
  isPlaying?: boolean;
  onPlayTrack?: (track: CollectionTrack) => void;
}

const SortableTrackRow: React.FC<SortableTrackRowProps> = ({
  ct,
  index,
  draggable,
  currentTrackId,
  isPlaying = false,
  onPlayTrack,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ct.track.id, disabled: !draggable });
  const [hovered, setHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const isCurrentTrack = currentTrackId === ct.track.id;
  const showPause = isCurrentTrack && isPlaying;

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-testid={`playlist-track-row-${ct.track.id}`}
      className={`flex items-center justify-between gap-3 px-2 py-2.5 transition hover:bg-zinc-900/60 ${
        isCurrentTrack ? "bg-zinc-800/80" : ""
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        <button
          type="button"
          onClick={() => onPlayTrack?.(ct)}
          className="group relative h-7 w-7 shrink-0 overflow-hidden"
          aria-label={showPause ? "Pause track" : "Play track"}
        >
          <img
            src={ct.track.coverUrl || trackFallback}
            alt={ct.track.title}
            className="h-7 w-7 object-cover"
          />
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/55 transition-opacity ${
              showPause || hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
              {showPause ? <Pause size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
            </div>
          </div>
        </button>
        <p className="truncate text-[13px] font-semibold leading-none text-zinc-100">
          <span className="text-zinc-500 font-bold">{index + 1}</span>
          <span className="text-zinc-500 font-bold">. </span>
          <span className="text-zinc-500 font-bold">
            {ct.track.user.displayName || ct.track.user.username}
          </span>
          <span className="text-zinc-300"> . </span>
          <span className={isCurrentTrack ? "text-[#F94C00]" : ""}>{ct.track.title}</span>
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

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  onReorder,
  currentTrackId,
  isPlaying,
  onPlayTrack,
}) => {
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
            <SortableTrackRow
              key={ct.track.id}
              ct={ct}
              index={i}
              draggable={draggable}
              currentTrackId={currentTrackId}
              isPlaying={isPlaying}
              onPlayTrack={onPlayTrack}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default TrackList;
