import { useEffect } from "react";
import { X, Music, Upload, Wifi, Star, InfinityIcon } from "lucide-react";

interface PaymentSuccessModalProps {
  plan: "artist" | "artist-pro";
  onClose: () => void;
}

const PLAN_PERKS = {
  artist: {
    displayName: "Artist Plan",
    color: "from-orange-400 to-orange-600",
    badge: "bg-orange-500",
    perks: [
      { icon: Upload, text: "180 uploads per month" },
      { icon: Star, text: "Ad-free listening" },
      { icon: Wifi, text: "Offline listening" },
      { icon: InfinityIcon, text: "Unlimited playlists" },
    ],
  },
  "artist-pro": {
    displayName: "Artist Pro Plan",
    color: "from-purple-500 to-purple-700",
    badge: "bg-purple-600",
    perks: [
      { icon: Upload, text: "Unlimited uploads" },
      { icon: Star, text: "Ad-free listening" },
      { icon: Wifi, text: "Offline listening" },
      { icon: Music, text: "Full playback access" },
      { icon: InfinityIcon, text: "Unlimited playlists" },
    ],
  },
};

export default function PaymentSuccessModal({
  plan,
  onClose,
}: PaymentSuccessModalProps) {
  const config = PLAN_PERKS[plan];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden animate-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
        >
          <X size={16} className="text-white" />
        </button>

        {/* Header gradient */}
        <div className={`bg-gradient-to-br ${config.color} px-8 pt-10 pb-8 flex flex-col items-center`}>
          {/* Animated checkmark */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-orange-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: plan === "artist-pro" ? "#9333ea" : "#f97316" }}
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
            {/* Decorative dots */}
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-300" />
            <span className="absolute bottom-0 -left-2 w-2 h-2 rounded-full bg-white/60" />
            <span className="absolute top-2 -left-3 w-1.5 h-1.5 rounded-full bg-pink-300" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight mb-1">
            Payment Successful
          </h2>
          <p className="text-white/80 text-sm font-medium text-center">
            You're now on the{" "}
            <span className="text-white font-black">{config.displayName}</span>
          </p>
        </div>

        {/* Perks */}
        <div className="px-8 py-6">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
            You now have access to
          </p>
          <ul className="space-y-3">
            {config.perks.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg ${config.badge} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={13} className="text-white" />
                </span>
                <span className="text-sm font-medium text-zinc-700">{text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={onClose}
            className={`mt-6 w-full py-3 rounded-xl bg-gradient-to-r ${config.color} text-white text-sm font-bold transition-opacity hover:opacity-90`}
          >
            Start listening ›
          </button>
        </div>
      </div>
    </div>
  );
}