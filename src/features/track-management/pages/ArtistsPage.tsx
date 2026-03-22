import { useState, useMemo, useEffect } from "react";
import { Search, Upload, Plus, Globe, DollarSign, SlidersHorizontal, ArrowUpDown, BarChart, Users, Gift } from "lucide-react";
import TrackList from "../components/TrackList";
import ArtistsNavbar from "../components/ArtistsNavbar";
import ArtistsSidebar from "../components/ArtistsSidebar";
import { trackService } from "../trackService";
import type { Track } from "@/shared/types/Track";
//import { SampleTracks } from "../tests/SampleTracks";

function UploadBanner() {
  return (
    <div className="bg-[hsl(0,0%,11%)] border-b border-[hsl(0,0%,18%)] flex items-center justify-between px-8 py-3 shrink-0">
      <div className="flex items-center gap-3">
        <Upload className="w-4 h-4 text-[hsl(0,0%,60%)]" />
        <span className="text-white text-sm font-medium tracking-tighter">0% of uploads used</span>
        <div className="w-44 h-1.5 bg-[hsl(0,0%,23%)] rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(0,0%,50%)] rounded-full" style={{ width: "0%" }} />
        </div>
        <span className="text-[hsl(0,100%,99%)] text-sm font-semibold">0 of 180 minutes</span>
      </div>
      <button className="bg-black text-white text-sm font-bold tracking-tighter px-5 py-2 rounded-full hover:bg-[hsl(0,0%,20%)] transition-colors">
        Get unlimited uploads
      </button>
    </div>
  );
}

function StudioHeader() {
  return (
    <div className="bg-[hsl(0,0%,7%)] border border-[hsl(0,0%,17%)] rounded-md mx-6 mt-5 mb-6 px-7 py-6">
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-white text-[28px] font-bold tracking-tight">Artist Studio</h1>
        <span className="text-[hsl(0,0%,45%)] text-sm">All time stats updated daily.</span>
      </div>
      <div className="flex items-center">
        <div className="flex flex-col gap-1 pr-7">
          <span className="text-white text-2xl font-semibold tabular-nums">0</span>
          <span className="text-[hsl(0,0%,42%)] text-xs">SC plays</span>
        </div>
        <div className="flex flex-col gap-1 px-7 border-l border-[hsl(0,0%,20%)]">
          <span className="text-white text-2xl font-semibold tabular-nums">0</span>
          <span className="text-[hsl(0,0%,42%)] text-xs">Reposts</span>
        </div>
        <div className="flex flex-col gap-1 px-7 border-l border-[hsl(0,0%,20%)]">
          <span className="text-white text-2xl font-semibold tabular-nums">0</span>
          <span className="text-[hsl(0,0%,42%)] text-xs">Downloads</span>
        </div>
        <div className="flex flex-col gap-1 px-7 border-l border-[hsl(0,0%,20%)]">
          <span className="text-white text-2xl font-semibold tabular-nums">0</span>
          <span className="text-[hsl(0,0%,42%)] text-xs">Likes</span>
        </div>
        <div className="flex flex-col gap-1 pl-7 border-l border-[hsl(0,0%,20%)]">
          <span className="text-white text-2xl font-semibold tabular-nums">0</span>
          <span className="text-[hsl(0,0%,42%)] text-xs">Comments</span>
        </div>

        <div className="w-px bg-[hsl(0,0%,20%)] self-stretch mx-7" />

        <div className="flex items-center gap-7">
          <button className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,65%)] hover:text-white transition-colors">
            <BarChart className="w-6 h-6" />
            <span className="text-xs">Insights</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,65%)] hover:text-white transition-colors">
            <DollarSign className="w-6 h-6" />
            <span className="text-xs">Earnings</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,65%)] hover:text-white transition-colors">
            <div className="relative">
              <Users className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full flex items-center justify-center text-black" style={{ fontSize: "8px", fontWeight: 900 }}>★</span>
            </div>
            <span className="text-xs">Fans</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-[hsl(0,0%,65%)] hover:text-white transition-colors">
            <div className="relative">
              <Gift className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold" style={{ fontSize: "9px" }}>+</span>
            </div>
            <span className="text-xs">Benefits</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = ["SoundCloud Tracks", "Distribution", "Vinyl Records", "Comments"];

export default function ArtistsPage() {
  const [activeTab, setActiveTab] = useState("SoundCloud Tracks");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [tracks, setTracks] = useState<Track[]>([]);

useEffect(() => {
  try{
  const fetchTracks = async () => {
    const data = await trackService.getUploadedTracks();
    setTracks(data);}
     fetchTracks();
  }
    catch(e:any)
    {
      console.log(e)
    }
 
}, []);

const filteredTracks = useMemo(() => {
  return tracks.filter((track) => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "public" && !track.isPrivate) ||
      (visibilityFilter === "private" && track.isPrivate);
    return matchesSearch && matchesVisibility;
  });
}, [tracks, searchQuery, visibilityFilter]);

  const handleVisibilityChange = (v: "public" | "private") => {
    setVisibilityFilter((prev) => (prev === v ? "all" : v));
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      <ArtistsSidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <ArtistsNavbar />
        <UploadBanner />

       
       <div className="flex-1 overflow-y-auto [overflow-x:clip]">
          <StudioHeader />

          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-[hsl(0,0%,17%)] px-6 mb-5">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-3 text-sm transition-colors
                  ${activeTab === tab
                    ? "text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white"
                    : "text-[hsl(0,0%,50%)] hover:text-white"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "SoundCloud Tracks" && (
            <div className="px-6 space-y-4">
              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { icon: Plus, label: "Upload or drop tracks" },
                  { icon: Globe, label: "Distribute tracks" },
                  { icon: DollarSign, label: "Monetize tracks" },
                  { icon: SlidersHorizontal, label: "Master track audio" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="flex items-center gap-2 bg-[hsl(0,0%,16%)] hover:bg-[hsl(0,0%,21%)] border border-[hsl(0,0%,26%)] text-white text-sm font-medium px-4 py-2.5 rounded transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Search + filters + count */}
              <div className="flex items-center gap-3 font-bold tracking-tighter flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0,0%,42%)]" />
                  <input
                    type="text"
                    placeholder="Search tracks"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border border-[hsl(0,0%,26%)] rounded-full text-white text-sm pl-9 pr-3 py-2 w-56 placeholder:text-[hsl(0,0%,42%)] focus:outline-none focus:border-[hsl(0,0%,48%)]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleVisibilityChange("public")}
                    className={`px-5 py-2 text-sm border font-semibold rounded-full transition-colors
                      ${visibilityFilter === "public"
                        ? "bg-[hsl(0,0%,23%)] text-white tracking-tighter border-[hsl(0,0%,38%)]"
                        : "bg-transparent text-[hsl(0,0%,65%)] border-[hsl(0,0%,26%)] hover:bg-[hsl(0,0%,16%)]"
                      }`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => handleVisibilityChange("private")}
                    className={`px-5 py-2 text-sm border font-semibold rounded-full transition-colors
                      ${visibilityFilter === "private"
                        ? "bg-[hsl(0,0%,23%)] text-white tracking-tighter border-[hsl(0,0%,38%)]"
                        : "bg-transparent text-[hsl(0,0%,65%)] border-[hsl(0,0%,26%)] hover:bg-[hsl(0,0%,16%)]"
                      }`}
                  >
                    Private
                  </button>
                </div>

                <div className="ml-auto flex items-center gap-2 text-[hsl(0,0%,50%)] text-sm">
                  <span>{filteredTracks.length} tracks</span>
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Date</span>
                  </button>
                </div>
              </div>

              {/* Track list */}
              <TrackList tracks={filteredTracks} />
            </div>
          )}

          {activeTab !== "SoundCloud Tracks" && (
            <div className="flex items-center justify-center py-24 text-[hsl(0,0%,35%)] text-sm px-6">
              {activeTab} content coming soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}