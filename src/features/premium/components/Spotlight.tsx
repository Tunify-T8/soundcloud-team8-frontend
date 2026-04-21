import { useState } from "react";
import { X } from "lucide-react";

interface SpotlightSectionProps {
  spotlightTrack?: {
    title: string;
    artist: string;
    coverUrl?: string;
  } | null;
  isMe?: boolean;
}

export default function Spotlight({ spotlightTrack, isMe }: SpotlightSectionProps) {
  const [showPromo, setShowPromo] = useState(true);

  const handleGetSpotlight = () => {
    //This opens the full PlansPage in a new browser tab.
    window.open("/plans", "_blank");
  };

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-[18px]">Spotlight</h2>
        {isMe && (
          <button className="text-[13px] text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded px-3 py-1.5 transition-colors font-medium">
            Edit Spotlight
          </button>
        )}
      </div>

      <div className="flex gap-4 items-start">
        {/* Track thumbnail placeholder */}
        <div
          className="w-[155px] h-[155px] flex-shrink-0 rounded border-2 border-dashed border-zinc-600 bg-zinc-900 flex items-center justify-center overflow-hidden cursor-pointer"
          style={{ minWidth: 155 }}
        >
          {spotlightTrack?.coverUrl ? (
            <img
              src={spotlightTrack.coverUrl}
              alt="Spotlight track"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 via-green-700 to-green-900 relative">
              {/* Decorative blobs matching screenshot */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-2 left-4 w-12 h-8 bg-green-800 rounded-full opacity-80" />
                <div className="absolute top-8 left-2 w-8 h-14 bg-green-700 rounded-full opacity-80" />
                <div className="absolute bottom-4 left-6 w-10 h-10 bg-orange-500 rounded-full opacity-90" />
                <div className="absolute top-4 right-6 w-14 h-10 bg-green-600 rounded-full opacity-80" />
                <div className="absolute bottom-8 right-4 w-8 h-12 bg-green-800 rounded-full opacity-70" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-400 rounded-full opacity-90" />
              </div>
            </div>
          )}
        </div>

        {/* Promo banner */}
        {showPromo && (
          <div className="relative flex-1 bg-zinc-800/80 rounded-lg px-6 py-5 flex items-center gap-6">
            <button
              onClick={() => setShowPromo(false)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex-1 min-w-0">
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
              className="flex-shrink-0 bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-[13px] px-5 py-2.5 rounded transition-colors whitespace-nowrap"
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