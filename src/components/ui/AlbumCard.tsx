import { useMemo, useState } from 'react';
import { Play, Heart, Repeat2, Share2, Copy, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { SiSoundcloud } from 'react-icons/si';

export interface AlbumTrack {
  id: string;
  number: number;
  title: string;
  artist: string;
  playsCount: number;
}

export interface AlbumCardProps {
  id: string;
  type: 'album' | 'playlist';
  title: string;
  artist: string;
  coverUrl: string | null;
  createdAt: string;
  tracks: AlbumTrack[];
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days   = Math.floor(diffMs / 86_400_000);
  if (days < 1)  return 'today';
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

const INITIAL_SHOW = 3;

export default function AlbumCard({
  id,
  type,
  title,
  artist,
  coverUrl,
  createdAt,
  tracks,
}: AlbumCardProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleTracks = expanded ? tracks : tracks.slice(0, INITIAL_SHOW);
  const hasMore       = tracks.length > INITIAL_SHOW;
  const bars = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => {
        const v = Math.abs(Math.sin((i + id.length) * 0.32) + Math.cos((i + 3) * 0.17));
        return 10 + v * 16;
      }),
    [id],
  );

  return (
    <div data-testid={`album-card-${id}`} className="mb-8 flex rounded-sm bg-[#0b0b0b] overflow-hidden">
      <div className="h-[130px] w-[130px] shrink-0 bg-[#111] self-start">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            data-testid={`album-card-cover-${id}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            data-testid={`album-card-cover-fallback-${id}`}
            className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111]"
          >
            <SiSoundcloud size={44} className="text-[hsl(0,0%,28%)]" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 px-4 py-2.5">
        <div className="mb-2 flex items-start gap-3">
          <button
            data-testid={`album-card-play-btn-${id}`}
            className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-black transition-transform hover:scale-105 shrink-0"
          >
            <Play size={13} fill="currentColor" className="ml-0.5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-zinc-400 truncate">{artist}</p>
            <p className="text-white font-bold text-[27px] leading-tight truncate">
              {title}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-zinc-400 text-[20px]">
              {formatTimeAgo(createdAt)}
            </span>
            <span className="text-[10px] text-zinc-400 border border-[hsl(0,0%,25%)] px-2 py-0.5 rounded-sm capitalize">
              {type}
            </span>
          </div>
        </div>

        <div className="mb-3 mt-1">
          <div className="flex h-[46px] items-end gap-[2px]">
            {bars.map((h, i) => (
              <div key={i} className="w-[2px] bg-zinc-200 rounded-[1px]" style={{ height: `${h}px` }} />
            ))}
          </div>
        </div>

        <div className="mb-1" data-testid={`album-card-tracklist-${id}`}>
          {visibleTracks.map((track) => (
            <div
              key={track.id}
              data-testid={`album-track-${track.id}`}
              className="flex items-center gap-2 py-1.5 hover:bg-[hsl(0,0%,13%)] transition-colors cursor-pointer px-1 rounded"
            >
              <span className="text-zinc-400 text-[18px] w-5 text-right shrink-0">
                {track.number}
              </span>
              <div className="w-7 h-7 bg-[hsl(0,0%,18%)] rounded shrink-0 flex items-center justify-center">
                <SiSoundcloud size={12} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-white text-[18px]">{track.artist}</span>
                <span className="text-zinc-400 text-[18px]"> · </span>
                <span className="text-white text-[18px]">{track.title}</span>
              </div>
              <span className="text-zinc-400 text-[20px] flex items-center gap-1 shrink-0">
                <Play size={10} fill="currentColor" />
                {track.playsCount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            data-testid={`album-card-expand-btn-${id}`}
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[13px] text-zinc-400 hover:text-white transition-colors mt-2 mb-4"
          >
            {expanded ? (
              <><ChevronUp size={14} /> View fewer</>
            ) : (
              <><ChevronDown size={14} /> View {tracks.length} tracks</>
            )}
          </button>
        )}

        <div
          data-testid={`album-card-actions-${id}`}
          className="flex items-center gap-2 mt-3"
        >
          <button
            data-testid={`album-card-like-btn-${id}`}
            className="flex h-8 w-10 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]"
          >
            <Heart size={13} />
          </button>
          <button
            data-testid={`album-card-repost-btn-${id}`}
            className="flex h-8 w-10 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]"
          >
            <Repeat2 size={13} />
          </button>
          <button
            data-testid={`album-card-share-btn-${id}`}
            className="flex h-8 w-10 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]"
          >
            <Share2 size={13} />
          </button>
          <button
            data-testid={`album-card-copy-btn-${id}`}
            className="flex h-8 w-10 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]"
          >
            <Copy size={13} />
          </button>
          <button
            data-testid={`album-card-more-btn-${id}`}
            className="flex h-8 w-10 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]"
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
