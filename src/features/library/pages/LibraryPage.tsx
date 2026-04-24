import { useState } from "react";
import OverviewTab from "../tabs/OverviewTab";
import LikesTab from "../tabs/LikesTab";
import PlaylistsTab from "../tabs/playlists/PlaylistsTab";
import AlbumsTab from "../tabs/AlbumsTab";
import StationsTab from "../tabs/StationsTab";
import FollowingTab from "../tabs/FollowingTab";
import HistoryTab from "../tabs/HistoryTab";

const TABS = ["Overview", "Likes", "Playlists", "Albums", "Stations", "Following", "History"] as const;
type Tab = typeof TABS[number];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const footerLinks = [
    "Legal",
    "Privacy",
    "Cookie Policy",
    "Cookie Manager",
    "Imprint",
    "Artist Resources",
    "Newsroom",
    "Charts",
    "Transparency Reports",
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":  return <OverviewTab />;
      case "Likes":     return <LikesTab />;
      case "Playlists": return <PlaylistsTab />;
      case "Albums":    return <AlbumsTab />;
      case "Stations":  return <StationsTab />;
      case "Following": return <FollowingTab />;
      case "History":   return <HistoryTab />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Tab bar */}
      <div className="border-b border-zinc-800 sticky top-[48px] bg-black z-40">
        <div className="flex gap-0 pl-40">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-3 transition-colors relative whitespace-nowrap"
              style={{
                color:         activeTab === tab ? "white" : "#71717a",
                fontWeight:    activeTab === tab ? 700 : 600,
                fontSize:      "18px",
                letterSpacing: "-0.01em",
              }}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pl-40 pr-6 pt-6 max-w-6xl">
        {renderTab()}
      </div>

      {/* Footer */}
      <div className="pl-40 pr-6 pt-12 pb-10 text-xs text-zinc-400">
        <div className="flex flex-wrap items-center gap-1.5">
          {footerLinks.map((link, index) => (
            <span key={link} className="inline-flex items-center">
              <a href="#" className="hover:text-zinc-200 transition-colors">
                {link}
              </a>
              {index < footerLinks.length - 1 && (
                <span className="mx-1 text-zinc-600">·</span>
              )}
            </span>
          ))}
        </div>
        <p className="mt-6 text-sm text-zinc-100">
          <span className="font-bold">Language:</span>{" "}
          <a href="#" className="text-[#2f7fdc] hover:underline">
            English (US)
          </a>
        </p>
      </div>
    </div>
  );
}
