import { useState } from "react";
import OverviewTab from "../tabs/OverviewTab";
import LikesTab from "../tabs/LikesTab";
import PlaylistsTab from "../tabs/PlaylistsTab";
import AlbumsTab from "../tabs/AlbumsTab";
import StationsTab from "../tabs/StationsTab";
import FollowingTab from "../tabs/FollowingTab";
import HistoryTab from "../tabs/HistoryTab";

const TABS = ["Overview", "Likes", "Playlists", "Albums", "Stations", "Following", "History"] as const;
type Tab = typeof TABS[number];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

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
    </div>
  );
}