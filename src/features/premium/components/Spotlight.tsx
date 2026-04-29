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
    <div className="mt-6 w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[20px] font-bold tracking-tight text-white sm:text-[24px]">Spotlight</h2>

        {isMe && !showPromo && (
          <div
            className="relative flex-shrink-0"
            onMouseEnter={handleEditMouseEnter}
            onMouseLeave={handleEditMouseLeave}
          >
            <button className="rounded border border-zinc-700 px-2 py-1.5 text-[12px] font-bold tracking-tight text-zinc-600 transition-colors hover:border-zinc-00 sm:text-[13px]">
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
        <div className="flex min-w-0 flex-col items-start gap-4 sm:gap-5 md:flex-row">
          <div className="hidden h-[200px] w-[200px] max-w-[220px] cursor-pointer rounded md:block">
            <img src={spotlightImg} alt="Spotlight" className="w-full h-full object-cover" />
          </div>

          <div className="relative flex min-w-0 w-full flex-col gap-4 rounded-lg bg-zinc-800/80 px-4 py-4 sm:px-6 sm:py-5 lg:min-h-[200px] lg:px-8 lg:py-6">
            <div className="mb-1 flex w-full items-center justify-end gap-2 lg:absolute lg:right-4 lg:top-4 lg:mb-0 lg:w-auto">
              {isMe && (
                <div
                  className="relative flex-shrink-0"
                  onMouseEnter={handleEditMouseEnter}
                  onMouseLeave={handleEditMouseLeave}
                >
                  <button className="rounded border border-zinc-700 px-2.5 py-1.5 text-[12px] font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:bg-zinc-800 hover:text-white sm:px-3 sm:text-[13px]">
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

            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 flex-1 pr-0 sm:pr-2">
                <p className="mb-2 text-[20px] leading-snug font-bold tracking-tight text-white sm:text-[22px]">
                Get more plays with Spotlight
                </p>
                <p className="text-[13px] leading-relaxed text-zinc-400">
                  Artist Pro users who spotlight tracks at the top of their profiles get heard
                  10% more than those who don't.
                </p>
              </div>

              <button
                onClick={() => window.open("/plans", "_blank")}
                className="w-full rounded bg-white px-5 py-2.5 text-[13px] font-bold tracking-tight text-zinc-900 whitespace-nowrap transition-all hover:brightness-125 hover:shadow-[0_0_16px_rgba(255,255,255,0.5)] sm:w-auto"
              >
                Get Spotlight
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-zinc-400 text-[14px] mt-3 tracking-tight">
        Highlight your best tracks and playlists: put them in Spotlight so that your audience will find them first when they visit your profile.
      </p>
    </div>
  );
}
