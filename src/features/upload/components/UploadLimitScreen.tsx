import { Link } from "react-router-dom";
import ArtistProUpgradeButton from "@/features/premium/components/ArtistProUpgradeButton";
import hourglassImg from "@/assets/broken_clock.png"; 

type UploadQuota = {
  tier: string;
  uploadMinutesLimit: number | null;
  uploadMinutesUsed: number;
  uploadMinutesRemaining: number | null;
  canReplaceFiles: boolean;
  canScheduleRelease: boolean;
  canAccessAdvancedTab: boolean;
};

interface UploadLimitScreenProps {
  quota: UploadQuota;
}

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    title: "Unlimited track uploads",
    desc: "Artist Pro subscribers can upload as many private & public tracks as they want.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Unlimited Distribution",
    desc: "Upload as much music as you want and share it with your community and collaborators.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    title: "Replace Track",
    desc: "Replace the audio file on your tracks anytime.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Amplify",
    desc: "Get up to 100 or more plays per upload.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Advanced Fan Insights",
    desc: "Find fans, build connections and get insights to plan promotions, releases and tours.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Spotlight Tracks",
    desc: "Pin tracks to the top of your SoundCloud profile to feature them and drive listens.",
  },
];

export default function UploadLimitScreen({ quota }: UploadLimitScreenProps) {
  return (
    <>
      <main className="relative flex-1 flex px-8 py-12 max-w-[1100px] mx-auto w-full gap-16 items-start">
        <Link
          to="/artists"
          aria-label="Exit upload limit"
          className="absolute right-6 top-6 text-[#888] hover:text-white transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Link>
        {/* Left: text */}
        <div className="flex-1 pt-4">
          <h1 className="text-[28px] font-bold mb-3">You've reached your upload limit.</h1>
          <p className="text-[#aaa] text-[15px] mb-8">
            Unlock unlimited uploads, monetization, distribution, and much more with Artist Pro
          </p>
          <ArtistProUpgradeButton
            className="bg-white text-black font-bold px-6 py-3 rounded-full text-[14px] hover:bg-[#eee] transition"
          >
            Unlock with Artist Pro
          </ArtistProUpgradeButton>

          {/* Feature highlights */}
          <div className="mt-12">
            <p className="text-xs text-[#666] font-semibold tracking-widest uppercase mb-6">
              Artist Pro Membership Highlights
            </p>
            <div className="grid grid-cols-3 gap-x-8 gap-y-6">
              {FEATURES.map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="text-white mt-0.5 flex-shrink-0">{icon}</div>
                  <div>
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="text-xs text-[#777] mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: hourglass image — no SVG, just your imported asset */}
        <div className="w-[320px] flex-shrink-0 flex items-center justify-center pt-4">
          <img
            src={hourglassImg}
            alt="Upload limit reached"
            className="w-64 h-auto object-contain select-none"
            draggable={false}
          />
        </div>
      </main>
    </>
  );
}
