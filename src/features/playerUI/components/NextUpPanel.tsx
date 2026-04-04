import { X, Heart, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useQueue } from "@/hooks/useQueue";
import type { queueTrack } from "@/features/player-core/types";

interface NextUpPanelProps {
  isOpen:  boolean;
  onClose: () => void;
}

const THUMB_COLORS = [
  "#1a3a4a",
  "#2d1a1a",
  "#1a2d1a",
  "#2d2d1a",
  "#1a1a3a",
  "#3a1a2d",
  "#1a3a3a",
];

function TrackThumbnail({ index, isPlaying }: { index: number; isPlaying: boolean }) {
  return (
    <div
      className="w-10 h-10 rounded-sm flex-shrink-0 flex items-center justify-center"
      style={{ background: THUMB_COLORS[index % THUMB_COLORS.length] }}
    >
      {isPlaying ? (
        <div className="flex items-end gap-[2px] h-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-[3px] bg-orange-500 rounded-sm"
              style={{
                height: `${[60, 100, 75][i]}%`,
                animation: `eq-bar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
              }}
            />
          ))}
        </div>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="rgba(255,255,255,0.3)">
          <polygon points="2,0 14,7 2,14" />
        </svg>
      )}
    </div>
  );
}

export default function NextUpPanel({ isOpen, onClose }: NextUpPanelProps) {
  const { tracks, currentIndex, jumpTo, clearQueue } = useQueue();

  const [autoplay,  setAutoplay]  = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes eq-bar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1);   }
        }
        .next-up-panel { animation: slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .track-row:hover .track-duration { display: none; }
        .track-row:hover .track-actions  { display: flex; }
        .track-actions { display: none; }
      `}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} style={{ background: "transparent" }} />

      {/* Panel */}
      <div
        className="next-up-panel fixed right-75 z-50 flex flex-col"
        style={{
          bottom:       "56px",
          width:        "380px",
          maxHeight:    "520px",
          background:   "#1a1a1a",
          border:       "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px",
          boxShadow:    "0 -8px 40px rgba(0,0,0,0.7)",
          overflow:     "hidden",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span className="text-white font-bold text-base tracking-tight">Next up</span>
          <div className="flex items-center gap-3">
            <button
              onClick={clearQueue}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
              style={{ fontWeight: 600, letterSpacing: "0.01em" }}
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center transition-colors"
            >
              <X size={14} color="white" />
            </button>
          </div>
        </div>

        {/* Track list */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#444 transparent" }}
        >
          {tracks.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-zinc-500 text-sm">
              Queue is empty
            </div>
          ) : (
            tracks.map((track: queueTrack, i: number) => {
              const isPlaying = i === currentIndex;

              return (
                <div
                  key={track.trackId}
                  className="track-row flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                  style={{
                    background: isPlaying
                      ? "rgba(255,255,255,0.06)"
                      : hoveredId === track.trackId
                      ? "rgba(255,255,255,0.04)"
                      : "transparent",
                    borderLeft: isPlaying ? "2px solid #FF5500" : "2px solid transparent",
                  }}
                  onMouseEnter={() => setHoveredId(track.trackId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => jumpTo(i)}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <TrackThumbnail index={i} isPlaying={isPlaying} />
                    {!isPlaying && hoveredId === track.trackId && (
                      <div
                        className="absolute inset-0 rounded-sm flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.55)" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                          <polygon points="1,0 12,6 1,12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-400 truncate leading-tight" style={{ fontWeight: 600 }}>
                      —
                    </p>
                    <p
                      className="text-xs truncate leading-tight mt-0.5"
                      style={{ color: isPlaying ? "#FF5500" : "white", fontWeight: 600 }}
                    >
                      {track.trackId}
                    </p>
                  </div>

                  {/* Duration / actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span
                      className="track-duration text-xs text-zinc-500"
                      style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                    >
                      —:——
                    </span>
                    <div className="track-actions items-center gap-1.5">
                      <button
                        className="hover:opacity-80 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Heart
                          size={13}
                          fill={isPlaying ? "#FF5500" : "none"}
                          color={isPlaying ? "#FF5500" : "#9ca3af"}
                        />
                      </button>
                      <button
                        className="hover:opacity-80 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal size={13} color="#9ca3af" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Autoplay section */}
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-white text-sm font-bold">Autoplay station</span>
            <button
              onClick={() => setAutoplay((v) => !v)}
              className="relative flex-shrink-0"
              style={{
                width:        "40px",
                height:       "22px",
                borderRadius: "11px",
                background:   autoplay ? "#FF5500" : "#555",
                border:       "none",
                cursor:       "pointer",
                transition:   "background 0.2s",
              }}
              aria-label="Toggle autoplay"
            >
              <span
                style={{
                  position:     "absolute",
                  top:          "3px",
                  left:         autoplay ? "21px" : "3px",
                  width:        "16px",
                  height:       "16px",
                  borderRadius: "50%",
                  background:   "white",
                  transition:   "left 0.2s",
                }}
              />
            </button>
          </div>
          <p className="text-zinc-500 text-xs mt-1" style={{ fontWeight: 500 }}>
            Hear related tracks based on what's playing now.
          </p>
        </div>
      </div>
    </>
  );
}