import { useState, useMemo, useRef } from "react";
import { Heart, Repeat2, Share2, Copy, MoreHorizontal } from "lucide-react";
import { SiSoundcloud } from "react-icons/si";
import { waveGenerators } from "../Waveforms";
import { Genre } from "@/shared/types/Genre";

interface PlayerProps {
  artistName?: string;
  title?: string;
  coverUrl?: string;
  timeAgo?: string;
  genre?: Genre;
  likes?: string;
  reposts?: string;
  plays?: string;
  comments?: string;
  progress?: number;
  waveformSeed?: number;
}

export default function SongCard({
  artistName = "",
  title = "",
  coverUrl = "",
  timeAgo = "",
  genre = Genre.POP,
  likes = "",
  reposts = "",
  plays = "",
  comments = "",
  progress = 0,
  waveformSeed = 0,
}: PlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const waveRef = useRef<HTMLDivElement>(null);

  const GAP = 1;
  const generatorIndex = waveformSeed % waveGenerators.length;

  const bars = useMemo((): number[] => {
    return waveGenerators[generatorIndex](waveformSeed);
  }, [generatorIndex, waveformSeed]);

  const displayProgress = hoverProgress ?? progress;

  const handleWaveMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const raw = (e.clientX - rect.left) / rect.width;
    setHoverProgress(Math.min(1, Math.max(0, raw)));
  };

  return (
    <div className="bg-[#1a1a1a] border border-[hsl(0,0%,13%)] rounded-sm flex gap-0 overflow-hidden w-full font-sans">
      {/* Cover Art */}
      <div className="w-[130px] h-[130px] shrink-0 bg-[#111] relative">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111]">
            <SiSoundcloud size={40} className="text-[hsl(0,0%,30%)]" />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 pt-3 pb-3 min-w-0">

        {/* Top row: play button + artist/title + time/genre */}
        <div className="flex items-start gap-3 mb-1">
          {/* Play button — top left of content area */}
          <button
            onClick={() => setPlaying(!playing)}
            className="w-9 h-9 rounded-full border border-[hsl(0,0%,35%)] flex items-center justify-center text-white hover:border-white transition-colors shrink-0 mt-0.5"
          >
            {playing ? (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="white">
                <rect x="1" y="1" width="4" height="12" />
                <rect x="9" y="1" width="4" height="12" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="white">
                <polygon points="2,0 14,7 2,14" />
              </svg>
            )}
          </button>

          {/* Artist + title */}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-[hsl(0,0%,50%)] truncate mb-0.5">{artistName}</div>
            <p className="text-[13px] text-white font-medium leading-snug line-clamp-2">{title}</p>
          </div>

          {/* Time + genre */}
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <span className="text-[11px] text-[hsl(0,0%,40%)] whitespace-nowrap">{timeAgo}</span>
            <span className="text-[10px] text-[hsl(0,0%,55%)] bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,20%)] px-2 py-0.5 rounded-sm whitespace-nowrap">
              # {genre}
            </span>
          </div>
        </div>

        {/* Waveform */}
        <div
          ref={waveRef}
          className="flex items-end h-[52px] cursor-pointer mt-1 mb-2 w-full"
          style={{ gap: `${GAP}px` }}
          onMouseMove={handleWaveMouseMove}
          onMouseLeave={() => setHoverProgress(null)}
        >
          {bars.map((height, i) => {
            const pos = i / (bars.length - 1);
            const played = pos <= displayProgress;
            return (
              <div
                key={i}
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  maxWidth: "2px",
                  height: `${height * 100}%`,
                  backgroundColor: played ? "#F94C00" : "hsl(0,0%,28%)",
                  opacity: played ? 1 : 0.7,
                  borderRadius: "1px",
                }}
              />
            );
          })}
        </div>

        {/* Controls row — stats only, no play button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-[hsl(14,90%,58%)] transition-colors text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(14,90%,40%)]">
              <Heart size={12} /><span>{likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white transition-colors text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)]">
              <Repeat2 size={12} /><span>{reposts}</span>
            </button>
            <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white transition-colors text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)]">
              <Share2 size={12} />
            </button>
            <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white transition-colors text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)]">
              <Copy size={12} />
            </button>
            <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white transition-colors text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)]">
              <MoreHorizontal size={12} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[hsl(0,0%,40%)]">
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor"><polygon points="2,0 14,7 2,14" /></svg>
              {plays}
            </span>
            <span className="flex items-center gap-1">
              <SiSoundcloud size={12} /> {comments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}