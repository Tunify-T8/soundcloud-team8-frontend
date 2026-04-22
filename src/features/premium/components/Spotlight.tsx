import { useState } from "react";
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

  const handleGetSpotlight = () => {
    window.open("/plans", "_blank");
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-[18px]">Spotlight</h2>
        {isMe && (
          <button className="text-[13px] text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded px-3 py-1.5 transition-colors font-medium">
            Edit Spotlight
          </button>
        )}
      </div>

      <div className="flex gap-4 items-start">
        {/* 155×155 container — image is clipped inside */}
        <div
          className="flex-shrink-0 rounded cursor-pointer"
          style={{ width: 155, height: 155 }}
        >
          <img
            src={spotlightImg}
            alt="Spotlight"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Promo banner */}
        {showPromo && (
          <div className="relative bg-zinc-800/80 rounded-lg px-6 py-5 flex items-center gap-6 min-w-0 max-w-[560px]">
            <button
              onClick={() => setShowPromo(false)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="min-w-0 pr-2">
              <p className="text-white font-bold text-[16px] mb-1.5 leading-snug">
                Get more plays with Spotlight
              </p>
              <p className="text-zinc-400 text-[13px] leading-relaxed">
                Artist Pro users who spotlight tracks at the top of their profiles get heard
                10% more than those who don't.
              </p>
            </div>

            <button
              onClick={handleGetSpotlight}
              className="flex-shrink-0 bg-white text-zinc-900 font-bold text-[13px] px-5 py-2.5 rounded transition-all whitespace-nowrap hover:brightness-125 hover:shadow-[0_0_16px_rgba(255,255,255,0.5)]"
            >
              Get Spotlight
            </button>
          </div>
        )}
      </div>

      <p className="text-zinc-500 text-[12px] mt-3">
        Highlight your best tracks and playlists: put them in Spotlight so that your audience will find them first when they visit your profile.
      </p>
    </div>
  );
}