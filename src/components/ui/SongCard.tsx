import { useState, useMemo } from "react";
import { Heart, Repeat2, Share2, Copy, MoreHorizontal, Play, Pause } from "lucide-react";
import { SiSoundcloud } from "react-icons/si";
import { waveGenerators } from "../Waveforms";

interface PlayerProps {
  artistName?: string;
  title?: string;
  coverUrl?: string;
  timeAgo?: string;
  genre?: string;
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
  genre = "",
  likes = "",
  reposts = "",
  plays = "",
  comments = "",
  progress = 0,
  waveformSeed = 0,
}: PlayerProps){
  const [playing, setPlaying] = useState(false);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);

  const BAR_COUNT = 140;
  const generatorIndex = waveformSeed % waveGenerators.length;

  const bars = useMemo((): number[] => {
  return waveGenerators[generatorIndex](waveformSeed);
}, [generatorIndex, waveformSeed]);

  const displayProgress = hoverProgress ?? progress;

  const handleWaveMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverProgress((e.clientX - rect.left) / rect.width);
  };

  return (
    <div className="bg-[#1a1a1a] border border-[hsl(0,0%,13%)] rounded-sm flex gap-0 overflow-hidden w-full max-w-2xl font-sans">
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
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <div className="text-[11px] text-[hsl(0,0%,50%)] flex items-center gap-1 mb-0.5">
              <span className="truncate">{artistName}</span>
            </div>
            <p className="text-[13px] text-white font-medium leading-snug line-clamp-2">{title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <span className="text-[11px] text-[hsl(0,0%,40%)] whitespace-nowrap">{timeAgo}</span>
            <span className="text-[10px] text-[hsl(0,0%,55%)] bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,20%)] px-2 py-0.5 rounded-sm whitespace-nowrap">
              # {genre}
            </span>
          </div>
        </div>

        <div
          className="flex items-end gap-[2px] h-[52px] cursor-pointer mt-1 mb-2 relative"
          onMouseMove={handleWaveMouseMove}
          onMouseLeave={() => setHoverProgress(null)}
        >
          {bars.map((height, i) => {
            const pos = i / BAR_COUNT;
            const played = pos < displayProgress;
            return (
              <div
                key={i}
                className="flex-1 rounded-[1px] transition-colors duration-75"
                style={{
                  height: `${height * 100}%`,
                  backgroundColor: played
                    ? "#F94C00"
                    : "hsl(0,0%,28%)",
                  opacity: played ? 1 : 0.7,
                }}
              />
            );
          })}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play button */}
            <button
              onClick={() => setPlaying(!playing)}
              className="w-8 h-8 rounded-full border border-[hsl(0,0%,35%)] flex items-center justify-center text-white hover:border-white transition-colors shrink-0"
            >
              {playing
                ? <Pause size={13} fill="white" />
                : <Play size={13} fill="white" className="ml-0.5" />}
            </button>

            {/* Stats */}
            <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-[hsl(14,90%,58%)] transition-colors text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(14,90%,40%)]">
              <Heart size={12} />
              <span>{likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white transition-colors text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)]">
              <Repeat2 size={12} />
              <span>{reposts}</span>
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

          {/* Right stats */}
          <div className="flex items-center gap-3 text-[11px] text-[hsl(0,0%,40%)]">
            <span className="flex items-center gap-1">
              <Play size={10} fill="currentColor" /> {plays}
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