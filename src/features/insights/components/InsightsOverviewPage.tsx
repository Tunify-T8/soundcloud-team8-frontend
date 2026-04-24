import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { MdPlayArrow } from "react-icons/md";
import { FaHeart, FaComment, FaDownload } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";

type InsightsTab = "soundcloud" | "all-platforms" | "fans";
type TimeRange = "Today" | "Last 7 days" | "Last 30 days" | "Last 12 months" | "All time" | "Custom range";
type StatKey = "plays" | "likes" | "comments" | "reposts" | "downloads";

const TIME_RANGES: TimeRange[] = [
  "Today",
  "Last 7 days",
  "Last 30 days",
  "Last 12 months",
  "All time",
  "Custom range",
];

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "Today": "today",
  "Last 7 days": "the last 7 days",
  "Last 30 days": "the last 30 days",
  "Last 12 months": "the last 12 months",
  "All time": "all time",
  "Custom range": "the selected timeframe",
};

const STAT_ICONS: Record<StatKey, React.ReactNode> = {
  plays: <MdPlayArrow size={16} />,
  likes: <FaHeart size={13} />,
  comments: <FaComment size={13} />,
  reposts: <BiRepost size={16} />,
  downloads: <FaDownload size={13} />,
};

// ── Decorative SVG for All Platforms upsell card ──────────────────────────────
function AllPlatformsIllustration() {
  return (
    <svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" className="w-56 h-56">
      <rect x="60" y="60" width="130" height="120" rx="18" fill="#2d1b6e" />
      <rect x="72" y="72" width="106" height="90" rx="12" fill="#1a0f3c" />
      <rect x="85" y="100" width="8" height="30" rx="4" fill="#7c3aed" opacity="0.9" />
      <rect x="99" y="90" width="8" height="50" rx="4" fill="#a855f7" opacity="0.9" />
      <rect x="113" y="105" width="8" height="25" rx="4" fill="#7c3aed" opacity="0.9" />
      <rect x="127" y="85" width="8" height="55" rx="4" fill="#ec4899" opacity="0.9" />
      <rect x="141" y="98" width="8" height="32" rx="4" fill="#a855f7" opacity="0.9" />
      <rect x="155" y="110" width="8" height="20" rx="4" fill="#7c3aed" opacity="0.9" />
      <circle cx="125" cy="158" r="12" fill="#2d1b6e" stroke="#7c3aed" strokeWidth="1.5" />
      <polygon points="122,154 122,162 131,158" fill="#a855f7" />
      <g transform="translate(100,158)">
        <polygon points="-6,-5 -6,5 0,0" fill="#555" />
        <rect x="1" y="-5" width="2" height="10" rx="1" fill="#555" />
      </g>
      <g transform="translate(150,158)">
        <polygon points="6,-5 6,5 0,0" fill="#555" />
        <rect x="-3" y="-5" width="2" height="10" rx="1" fill="#555" />
      </g>
      <path d="M125 180 C125 210, 160 200, 175 230" stroke="#7c3aed" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="175" cy="233" r="5" fill="#555" />
      <path d="M180 70 C190 50, 210 60, 220 45 C230 30, 215 20, 225 10" stroke="#ec4899" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M185 75 C200 65, 215 75, 225 60" stroke="#f472b6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <polygon points="100,130 115,105 130,130" fill="#ec4899" opacity="0.25" />
    </svg>
  );
}

// ── Decorative SVG for Fans upsell card ──────────────────────────────────────
function FansIllustration() {
  return (
    <svg viewBox="0 0 280 220" xmlns="http://www.w3.org/2000/svg" className="w-64 h-52">
      {/* back card */}
      <rect x="10" y="20" width="180" height="100" rx="10" fill="#1c1c1c" stroke="#333" strokeWidth="1" />
      <circle cx="45" cy="55" r="20" fill="#7c3aed" opacity="0.8" />
      <circle cx="45" cy="48" r="8" fill="#a78bfa" />
      <ellipse cx="45" cy="70" rx="13" ry="8" fill="#a78bfa" />
      <rect x="72" y="44" width="70" height="8" rx="4" fill="#444" />
      <rect x="72" y="58" width="50" height="6" rx="3" fill="#333" />
      <rect x="72" y="72" width="90" height="5" rx="2.5" fill="#222" />
      <rect x="72" y="72" width="55" height="5" rx="2.5" fill="#ec4899" />
      <rect x="72" y="82" width="38" height="16" rx="4" fill="#333" />
      <rect x="116" y="82" width="38" height="16" rx="4" fill="#7c3aed" opacity="0.7" />
      {/* front card */}
      <rect x="90" y="100" width="175" height="100" rx="10" fill="#1c1c1c" stroke="#333" strokeWidth="1" />
      <circle cx="125" cy="135" r="20" fill="#be185d" opacity="0.8" />
      <circle cx="125" cy="128" r="8" fill="#f9a8d4" />
      <ellipse cx="125" cy="150" rx="13" ry="8" fill="#f9a8d4" />
      <rect x="152" y="124" width="70" height="8" rx="4" fill="#444" />
      <rect x="152" y="138" width="50" height="6" rx="3" fill="#333" />
      <rect x="152" y="152" width="90" height="5" rx="2.5" fill="#222" />
      <rect x="152" y="152" width="72" height="5" rx="2.5" fill="#7c3aed" />
      <rect x="152" y="162" width="38" height="16" rx="4" fill="#333" />
      <rect x="196" y="162" width="38" height="16" rx="4" fill="#be185d" opacity="0.7" />
      {/* sparkles */}
      <path d="M200 25 L203 18 L206 25 L213 28 L206 31 L203 38 L200 31 L193 28 Z" fill="white" opacity="0.9" />
      <path d="M255 55 L257 50 L259 55 L264 57 L259 59 L257 64 L255 59 L250 57 Z" fill="white" opacity="0.5" />
    </svg>
  );
}

export default function InsightsOverviewPage() {
  const [activeTab, setActiveTab] = useState<InsightsTab>("soundcloud");
  const [selectedRange, setSelectedRange] = useState<TimeRange>("Last 30 days");
  const [activeStat, setActiveStat] = useState<StatKey>("plays");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const stats: StatKey[] = ["plays", "likes", "comments", "reposts", "downloads"];

  const rangeLabel = TIME_RANGE_LABELS[selectedRange];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <div className="flex items-center gap-3">
            {activeTab === "all-platforms" && (
              <button
                type="button"
                onClick={() => setShowAboutModal(true)}
                className="inline-flex items-center gap-1.5 rounded-sm bg-zinc-800 px-3 py-2 text-sm font-bold text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                About these Insights
              </button>
            )}
            {/* Time range dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown((p) => !p)}
                className="inline-flex items-center gap-2 rounded-sm bg-zinc-800 px-3 py-2 text-sm font-bold text-white hover:bg-zinc-700 cursor-pointer"
              >
                {selectedRange}
                <ChevronDown size={14} />
              </button>
              {showDropdown && (
                <div className="absolute top-full right-0 mt-1 w-44 flex flex-col rounded-sm border border-zinc-800 bg-zinc-950 shadow-xl z-20">
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => {
                        setSelectedRange(range);
                        setShowDropdown(false);
                      }}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <span className={range === selectedRange ? "font-bold text-white" : "text-zinc-400"}>
                        {range}
                      </span>
                      {range === selectedRange && (
                        <span className="text-white">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-zinc-800 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("soundcloud")}
            className={`pb-3 text-sm font-semibold cursor-pointer transition-colors border-b-2 -mb-px ${
              activeTab === "soundcloud"
                ? "border-white text-white"
                : "border-transparent text-zinc-500 hover:text-white"
            }`}
          >
            SoundCloud
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("all-platforms")}
            className={`pb-3 text-sm font-semibold cursor-pointer transition-colors border-b-2 -mb-px ${
              activeTab === "all-platforms"
                ? "border-white text-white"
                : "border-transparent text-zinc-500 hover:text-white"
            }`}
          >
            All Platforms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fans")}
            className={`pb-3 text-sm font-semibold cursor-pointer transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === "fans"
                ? "border-white text-white"
                : "border-transparent text-zinc-500 hover:text-white"
            }`}
          >
            Fans
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              NEW
            </span>
          </button>
        </div>

        {/* SoundCloud Tab Content */}
        {activeTab === "soundcloud" && (
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              0 {activeStat} in {rangeLabel}{" "}
              <span className="text-zinc-500">(0%)</span>
            </h2>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              {stats.map((stat) => (
                <button
                  key={stat}
                  type="button"
                  onClick={() => setActiveStat(stat)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                    activeStat === stat
                      ? "bg-white text-black"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  {STAT_ICONS[stat]}
                  <span>0 {stat}</span>
                </button>
              ))}
              <span className="ml-auto text-sm text-zinc-500 self-center">
                Data updates every 24 hours
              </span>
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-base font-bold text-white mb-2">
                Looks like there is no activity for the selected timeframe
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                Try selecting another timeframe.
              </p>
              <button
                type="button"
                onClick={() => setSelectedRange("Last 12 months")}
                className="border border-white px-6 py-2.5 text-sm font-bold text-black bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                Switch to last 12 months
              </button>
            </div>
          </div>
        )}

        {/* All Platforms Tab Content */}
        {activeTab === "all-platforms" && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-10 flex items-center justify-between gap-8">
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold mb-5 leading-snug tracking-tight">
                Unlock key performance and audience insights across multiple platforms for your music
              </h2>
              <p className="text-sm text-zinc-300 mb-3 leading-relaxed">
                Access audience and performance insights for your distributed tracks from Spotify, Apple Music, and SoundCloud all from one dashboard.
              </p>
              <p className="text-sm text-zinc-300 mb-8 leading-relaxed">
                Upgrade your account, upload and distribute your track to get started.
              </p>
              <button
                type="button"
                className="border border-white px-6 py-3 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
                onClick={() => window.open("/plans", "_blank")}
              >
                Upgrade to Artist Pro
              </button>
            </div>
            <div className="shrink-0 hidden md:block">
              <AllPlatformsIllustration />
            </div>
          </div>
        )}

        {/* Fans Tab Content */}
        {activeTab === "fans" && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-10 flex items-center justify-between gap-8">
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold mb-5 leading-snug">
                Connect with your biggest fans
              </h2>
              <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
                See which fans are your most engaged and connect directly with them to create fans for life. Other
                platforms call them followers - we know they are way more than that. Your fans are your day ones, your
                biggest supporters, your best promoters.
              </p>
              <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
                Get to know your fans - start today.
              </p>
              <p className="text-sm font-bold text-white mb-6">
                Available to Artist Pro subscribers.
              </p>
              <button
                type="button"
                className="border border-white px-6 py-3 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
                onClick={() => window.open("/plans", "_blank")}
              >
                Upgrade to Artist Pro
              </button>
            </div>
            <div className="shrink-0 hidden md:block">
              <FansIllustration />
            </div>
          </div>
        )}
      </div>

      {/* About These Insights Modal */}
      {showAboutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowAboutModal(false)}
        >
          <div
            className="relative bg-zinc-950 rounded-lg max-w-lg w-full mx-4 p-8 flex gap-6 shadow-2xl border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">All Platform Insights</h2>
              <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
                Your All Platforms Insights only shows Spotify and Apple Music data
                for tracks you've released using{" "}
                <span className="font-bold text-white">SoundCloud Distribution</span>.
              </p>
              <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
                If you've distributed songs through other services, those streams
                won't appear here—so your totals may differ from what you see on
                other platforms. If you want to migrate previously released tracks to
                SoundCloud, simply{" "}
                <a href="#" className="underline text-white hover:text-zinc-400">
                  follow these instructions
                </a>
                .
              </p>
              <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
                Once a track is released through SoundCloud, its data will appear in
                your All Platforms Insights within 24–48 hours.
              </p>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="rounded-full border border-white px-6 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
            {/* Illustration */}
            <div className="hidden sm:flex items-center justify-center w-40 shrink-0">
              <AllPlatformsIllustration />
            </div>
            <button
              type="button"
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}