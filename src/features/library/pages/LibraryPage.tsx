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
      <div className="border-b border-zinc-800 px-6 sticky top-0 bg-black z-10">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-3 text-sm font-semibold transition-colors relative"
              style={{ color: activeTab === tab ? "white" : "#71717a" }}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6 max-w-6xl">
        {renderTab()}
      </div>
    </div>
  );
}
