import { useRef, useState } from "react";
import { X } from "lucide-react";

import spotlightImg from "@/assets/spotlight.png";

interface SpotlightSectionProps {
  spotlightTrack?: {
    title: string;
    artist: string;
    coverUrl?: string;
  } | null;
  isMe?: boolean;
}

export default function Spotlight({ isMe }: SpotlightSectionProps) {
  const [showPromo, setShowPromo] = useState(true);
  const [showEditPopover, setShowEditPopover] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  const handleEditMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setShowEditPopover(true);
  };

  const handleEditMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setShowEditPopover(false);
    }, 120);
  };

  return (
    <div className="mt-6 w-full xl:max-w-[calc(100%-23rem)]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-[24px] tracking-tight">Spotlight</h2>

        {isMe && !showPromo && (
          <div
            className="relative flex-shrink-0"
            onMouseEnter={handleEditMouseEnter}
            onMouseLeave={handleEditMouseLeave}
          >
            <button className="text-[13px] text-zinc-600 border border-zinc-700 hover:border-zinc-00 rounded px-2 py-1.5 transition-colors font-bold tracking-tight">
              Edit Spotlight
            </button>

            {showEditPopover && (
              <div
                className="absolute right-0 top-[calc(100%+8px)] z-30 w-[272px] max-w-[calc(100vw-2rem)] rounded-md border border-zinc-700 bg-[#111111] p-4 shadow-2xl"
                onMouseEnter={handleEditMouseEnter}
                onMouseLeave={handleEditMouseLeave}
              >
                <div className="absolute -top-[8px] right-8 h-3.5 w-3.5 rotate-45 border-l border-t border-zinc-700 bg-[#111111]" />
                <p className="pr-1 text-[13px] leading-6 text-zinc-300">
                  Upgrade to Artist or Artist Pro to pin tracks at the top of your profile with Spotlight.
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => window.open("/plans", "_blank")}
                    className="rounded-md bg-white px-4 py-2 text-[13px] font-bold text-zinc-900 transition-colors hover:bg-zinc-100"
                  >
                    Learn more
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showPromo && (
        <div className="flex min-w-0 gap-4 items-start">
          <div className="flex-shrink-0 rounded cursor-pointer" style={{ width: 200, height: 200 }}>
            <img src={spotlightImg} alt="Spotlight" className="w-full h-full object-cover" />
          </div>

          <div className="relative flex min-w-0 w-full items-center gap-6 rounded-lg bg-zinc-800/80 px-8 py-6" style={{ minHeight: 200 }}>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {isMe && (
                <div
                  className="relative flex-shrink-0"
                  onMouseEnter={handleEditMouseEnter}
                  onMouseLeave={handleEditMouseLeave}
                >
                  <button className="text-[13px] text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 rounded px-3 py-1.5 transition-colors font-medium">
                    Edit Spotlight
                  </button>

                  {showEditPopover && (
                    <div
                      className="absolute right-0 top-[calc(100%+8px)] z-30 w-[272px] max-w-[calc(100vw-2rem)] rounded-md border border-zinc-700 bg-[#111111] p-4 shadow-2xl"
                      onMouseEnter={handleEditMouseEnter}
                      onMouseLeave={handleEditMouseLeave}
                    >
                      <div className="absolute -top-[8px] right-8 h-3.5 w-3.5 rotate-45 border-l border-t border-zinc-700 bg-[#111111]" />
                      <p className="pr-1 text-[13px] leading-6 text-zinc-300">
                        Upgrade to Artist or Artist Pro to pin tracks at the top of your profile with Spotlight.
                      </p>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => window.open("/plans", "_blank")}
                          className="rounded-md bg-white px-4 py-2 text-[13px] font-bold text-zinc-900 transition-colors hover:bg-zinc-100"
                        >
                          Learn more
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setShowPromo(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="min-w-0 flex-1 pr-2">
              <p className="text-white font-bold text-[22px] tracking-tight mb-2 leading-snug">
                Get more plays with Spotlight
              </p>
              <p className="text-zinc-400 text-[13px] leading-relaxed">
                Artist Pro users who spotlight tracks at the top of their profiles get heard
                10% more than those who don't.
              </p>
            </div>

            <button
              onClick={() => window.open("/plans", "_blank")}
              className="flex-shrink-0 bg-white text-zinc-900 font-bold tracking-tight text-[13px] px-5 py-2.5 rounded transition-all whitespace-nowrap hover:brightness-125 hover:shadow-[0_0_16px_rgba(255,255,255,0.5)]"
            >
              Get Spotlight
            </button>
          </div>
        </div>
      )}

      <p className="text-zinc-400 text-[14px] mt-3 tracking-tight">
        Highlight your best tracks and playlists: put them in Spotlight so that your audience will find them first when they visit your profile.
      </p>
    </div>
  );
}