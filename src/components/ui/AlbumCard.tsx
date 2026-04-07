import { useState } from 'react';
import { Play, Heart, Repeat2, Share2, Copy, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { SiSoundcloud } from 'react-icons/si';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helper ───────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

const INITIAL_SHOW = 3;

export default function AlbumCard({
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

  return (
    <div className="flex mb-8">

      {/* ── Cover art ────────────────────────────────────────────────────── */}
      <div className="w-[180px] shrink-0 bg-[#111] self-start">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full aspect-square object-cover"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111]">
            <SiSoundcloud size={44} className="text-[hsl(0,0%,28%)]" />
          </div>
        )}
      </div>

      {/* ── Right panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 bg-[#1a1a1a] border border-[hsl(0,0%,13%)] px-5 py-4 min-w-0">

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <button className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors shrink-0">
            <Play size={14} fill="currentColor" className="ml-0.5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-[12px] truncate">{artist}</p>
            <p className="text-white font-bold text-[15px] leading-tight truncate">
              {title}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-gray-400 text-[12px]">
              {formatTimeAgo(createdAt)}
            </span>
            <span className="text-[10px] text-gray-400 border border-[hsl(0,0%,25%)] px-2 py-0.5 rounded-sm capitalize">
              {type}
            </span>
          </div>
        </div>

        {/* Track list */}
        <div className="mb-1">
          {visibleTracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-3 py-2 border-b border-[hsl(0,0%,10%)] hover:bg-[hsl(0,0%,13%)] transition-colors cursor-pointer px-1 rounded"
            >
              {/* Number */}
              <span className="text-gray-500 text-[12px] w-4 text-right shrink-0">
                {track.number}
              </span>

              {/* Small icon */}
              <div className="w-7 h-7 bg-[hsl(0,0%,18%)] rounded shrink-0 flex items-center justify-center">
                <SiSoundcloud size={12} className="text-gray-500" />
              </div>

              {/* Title · Artist */}
              <div className="flex-1 min-w-0">
                <span className="text-white text-[13px]">{track.title}</span>
                <span className="text-gray-400 text-[12px]"> · {track.artist}</span>
              </div>

              {/* Play count */}
              <span className="text-gray-500 text-[11px] flex items-center gap-1 shrink-0">
                <Play size={9} fill="currentColor" />
                {track.playsCount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Expand / Collapse */}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[13px] text-gray-400 hover:text-white transition-colors mt-2 mb-4"
          >
            {expanded ? (
              <><ChevronUp size={14} /> View fewer</>
            ) : (
              <><ChevronDown size={14} /> View {tracks.length} tracks</>
            )}
          </button>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 mt-3">
          <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-[hsl(14,90%,58%)] text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(14,90%,40%)] transition-colors">
            <Heart size={12} />
          </button>
          <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)] transition-colors">
            <Repeat2 size={12} />
          </button>
          <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)] transition-colors">
            <Share2 size={12} />
          </button>
          <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)] transition-colors">
            <Copy size={12} />
          </button>
          <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)] transition-colors">
            <MoreHorizontal size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}