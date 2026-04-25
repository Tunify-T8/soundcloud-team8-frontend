import { useNavigate, useLocation } from "react-router-dom";
import OverviewTab from "../tabs/OverviewTab";
import LikesTab from "../tabs/LikesTab";
import PlaylistsTab from "../tabs/PlaylistsTab";
import AlbumsTab from "../tabs/AlbumsTab";
import StationsTab from "../tabs/StationsTab";
import FollowingTab from "../tabs/FollowingTab";
import HistoryTab from "../tabs/HistoryTab";

const TABS = ["Overview", "Likes", "Playlists", "Albums", "Stations", "Following", "History"] as const;
type Tab = typeof TABS[number];

const TAB_TO_PATH: Record<Tab, string> = {
  Overview:  "/library",
  Likes:     "/me/likes",
  Playlists: "/me/sets",
  Albums:    "/me/albums",
  Stations:  "/me/stations",
  Following: "/me/following",
  History:   "/me/history",
};

const PATH_TO_TAB: Record<string, Tab> = Object.fromEntries(
  Object.entries(TAB_TO_PATH).map(([tab, path]) => [path, tab as Tab])
);

export default function LibraryPage() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const activeTab: Tab = PATH_TO_TAB[pathname] ?? "Overview";

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
    <div data-testid="library-page" className="min-h-screen bg-black text-white pb-20">
      {/* Tab bar */}
      <div data-testid="library-tab-bar" className="border-b border-zinc-800 sticky top-[48px] bg-black z-40">
        <div className="flex gap-0 pl-40">
          {TABS.map((tab) => (
            <button
              key={tab}
              data-testid={`library-tab-${tab.toLowerCase()}`}
              data-active={activeTab === tab}
              onClick={() => navigate(TAB_TO_PATH[tab])}
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
                <div data-testid={`library-tab-${tab.toLowerCase()}-indicator`} className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div data-testid="library-tab-content" className="pl-40 pr-6 pt-6 max-w-6xl">
        {renderTab()}
      </div>
    </div>
  );
}