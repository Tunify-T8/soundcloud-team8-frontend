import { X, Heart, MoreHorizontal, Share2, ListPlus, Radio, Download, Repeat2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQueue } from "@/hooks/useQueue";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import type { queueTrack } from "@/features/player-core/types";

interface NextUpPanelProps {
  isOpen:  boolean;
  onClose: () => void;
}

const THUMB_COLORS = [
  "#1a3a4a", "#2d1a1a", "#1a2d1a",
  "#2d2d1a", "#1a1a3a", "#3a1a2d", "#1a3a3a",
];

function TrackThumbnail({ index, isPlaying }: { index: number; isPlaying: boolean }) {
  return (
    <div
      data-testid={`next-up-track-thumbnail-${index}`}
      className="w-10 h-10 rounded-sm flex-shrink-0 flex items-center justify-center"
      style={{ background: THUMB_COLORS[index % THUMB_COLORS.length] }}
    >
      {isPlaying ? (
        <div data-testid={`next-up-track-equalizer-${index}`} className="flex items-end gap-[2px] h-4">
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
        <svg data-testid={`next-up-track-play-icon-${index}`} width="14" height="14" viewBox="0 0 14 14" fill="rgba(255,255,255,0.3)">
          <polygon points="2,0 14,7 2,14" />
        </svg>
      )}
    </div>
  );
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

function TrackContextMenu({ x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const items = [
    { icon: <Heart size={14} />,        label: "Like",              testId: "context-menu-like"         },
    { icon: <Repeat2 size={14} />,      label: "Repost",            testId: "context-menu-repost"       },
    { icon: <Share2 size={14} />,       label: "Share",             testId: "context-menu-share"        },
    { icon: <ListPlus size={14} />,     label: "Add to Next up",    testId: "context-menu-add-next-up"  },
    { icon: <ListPlus size={14} />,     label: "Add to Playlist",   testId: "context-menu-add-playlist" },
    { icon: <Download size={14} />,     label: "Download file",     testId: "context-menu-download"     },
    { icon: <Radio size={14} />,        label: "Station",           testId: "context-menu-station"      },
  ];

  return (
    <div
      ref={menuRef}
      data-testid="next-up-context-menu"
      className="fixed z-[100] py-1 rounded-lg shadow-2xl"
      style={{
        top:        y,
        left:       x,
        background: "#1a1a1a",
        border:     "1px solid rgba(255,255,255,0.1)",
        minWidth:   "180px",
      }}
    >
      {items.map(({ icon, label, testId }) => (
        <button
          key={label}
          data-testid={testId}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors text-left tracking-tight"
          style={{ fontWeight: 500 }}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <span style={{ color: "#9ca3af" }}>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}

export default function NextUpPanel({ isOpen, onClose }: NextUpPanelProps) {
  const { tracks, jumpTo, clearQueue } = useQueue();
  const { currentTrack } = usePlayer();

  const [autoplay,    setAutoplay]    = useState(true);
  const [hoveredId,   setHoveredId]   = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; trackId: string } | null>(null);

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

      {contextMenu && (
        <TrackContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      <div data-testid="next-up-overlay" className="fixed inset-0 z-40" onClick={onClose} style={{ background: "transparent" }} />

      <div
        data-testid="next-up-panel"
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
        <div data-testid="next-up-header" className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span data-testid="next-up-title" className="text-white font-bold text-base tracking-tight">Next up</span>
          <div className="flex items-center gap-3">
            <button
              data-testid="next-up-clear-button"
              onClick={clearQueue}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
              style={{ fontWeight: 600 }}
            >
              Clear
            </button>
            <button
              data-testid="next-up-close-button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center transition-colors"
            >
              <X size={14} color="white" />
            </button>
          </div>
        </div>

        {/* Track list */}
        <div
          data-testid="next-up-track-list"
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#444 transparent" }}
        >
          {tracks.length === 0 ? (
            <div data-testid="next-up-empty-state" className="flex items-center justify-center h-24 text-zinc-500 text-sm">
              Queue is empty
            </div>
          ) : (
            tracks.map((track: queueTrack, i: number) => {
              const isPlaying = currentTrack?.id === track.trackId;

              return (
                <div
                  key={track.trackId}
                  data-testid={`next-up-track-row-${track.trackId}`}
                  data-playing={isPlaying}
                  data-track-index={i}
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
                  <div className="relative flex-shrink-0">
                    <TrackThumbnail index={i} isPlaying={isPlaying} />
                    {!isPlaying && hoveredId === track.trackId && (
                      <div
                        data-testid={`next-up-track-hover-overlay-${track.trackId}`}
                        className="absolute inset-0 rounded-sm flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.55)" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                          <polygon points="1,0 12,6 1,12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p data-testid={`next-up-track-artist-${track.trackId}`} className="text-xs text-zinc-400 truncate leading-tight" style={{ fontWeight: 600 }}>
                      {track.artist}
                    </p>
                    <p
                      data-testid={`next-up-track-title-${track.trackId}`}
                      className="text-xs truncate leading-tight mt-0.5"
                      style={{ color: isPlaying ? "#FF5500" : "white", fontWeight: 600 }}
                    >
                      {track.title}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span
                      data-testid={`next-up-track-duration-${track.trackId}`}
                      className="track-duration text-xs text-zinc-500"
                      style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                    >
                      {Math.floor(track.durationSeconds / 60)}:{String(track.durationSeconds % 60).padStart(2, "0")}
                    </span>
                    <div className="track-actions items-center gap-1.5">
                      <button
                        data-testid={`next-up-track-like-${track.trackId}`}
                        data-liked={isPlaying}
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
                        data-testid={`next-up-track-more-${track.trackId}`}
                        className="hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setContextMenu({
                            x:       rect.left - 170,
                            y:       rect.top  - 240,
                            trackId: track.trackId,
                          });
                        }}
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

        {/* Autoplay */}
        <div data-testid="next-up-autoplay-section" className="flex-shrink-0 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between">
            <span data-testid="next-up-autoplay-label" className="text-white text-sm font-bold">Autoplay station</span>
            <button
              data-testid="next-up-autoplay-toggle"
              data-enabled={autoplay}
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
                data-testid="next-up-autoplay-knob"
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
          <p data-testid="next-up-autoplay-description" className="text-zinc-500 text-xs mt-1" style={{ fontWeight: 500 }}>
            Hear related tracks based on what's playing now.
          </p>
        </div>
      </div>
    </>
  );
}