import allPlatformsImg from "@/assets/all_platforms.png";
import fansImg from "@/assets/fanz.png";
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
              <h2 className="text-3xl font-bold mb-5 leading-snug">
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
              <img
                src={allPlatformsImg}
                alt="All platforms illustration"
                className="w-56 h-auto object-contain"
              />
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
              <img
                src={fansImg}
                alt="Fans illustration"
                className="w-56 h-auto object-contain"
              />
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
            className="relative bg-zinc-950 max-w-2xl w-full mx-4 p-8 flex gap-6 shadow-2xl border border-zinc-800"
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
            <div className="hidden sm:flex items-center justify-center w-60 shrink-0">
              <img
                src={allPlatformsImg}
                alt="All platforms illustration"
                className="w-full h-auto object-contain"
              />
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