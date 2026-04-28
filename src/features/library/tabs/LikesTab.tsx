import { useState, useMemo, useEffect } from "react";
import TrackRow from "../components/TrackRow";
import { getLikedTracks, mapLikedTrackToTrackItem } from "../libraryService";
import { feedService } from "@/features/feed/feedservice";
import type { TrackItem } from "../types";

const COLS = 6;

export default function LikesTab() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchLikedTracks = async () => {
      setLoading(true);
      setError(null);
      const response = await getLikedTracks(1, 100);
      
      if (!mounted) return;
      
      if (!response) {
        setError("Failed to load liked tracks.");
        setTracks([]);
        setLoading(false);
        return;
      }

      const mappedTracks = response.data.map(mapLikedTrackToTrackItem);
      setTracks(mappedTracks);
      setLoading(false);
    };

    void fetchLikedTracks();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q)
    );
  }, [tracks, query]);

  const handleUnlike = async (trackId: string) => {
    await feedService.unlikeTrack(trackId);
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const totalSlots = Math.ceil(Math.max(filteredTracks.length, 1) / COLS) * COLS;
  return (
    <div data-testid="likes-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-sm">Hear the tracks you've liked:</h2>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 text-xs">View</span>
          <button
            data-testid="likes-grid-view-btn"
            onClick={() => setView("grid")}
            className={`p-1.5 rounded ${view === "grid" ? "bg-orange-500" : "hover:bg-zinc-700"}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <rect x="0" y="0" width="6" height="6" />
              <rect x="8" y="0" width="6" height="6" />
              <rect x="0" y="8" width="6" height="6" />
              <rect x="8" y="8" width="6" height="6" />
            </svg>
          </button>
          <button
            data-testid="likes-list-view-btn"
            onClick={() => setView("list")}
            className={`p-1.5 rounded ${view === "list" ? "bg-orange-500" : "hover:bg-zinc-700"}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="#9ca3af">
              <rect x="0" y="1" width="14" height="2" />
              <rect x="0" y="6" width="14" height="2" />
              <rect x="0" y="11" width="14" height="2" />
            </svg>
          </button>
          <input
            data-testid="likes-filter-input"
            placeholder="Filter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 w-64"
          />
        </div>
      </div>

      {loading ? (
        <p data-testid="likes-loading" className="text-white font-bold text-lg text-center py-20">
          Loading your liked tracks...
        </p>
      ) : error ? (
        <p data-testid="likes-error" className="text-red-400 font-bold text-lg text-center py-20">
          {error}
        </p>
      ) : tracks.length === 0 ? (
        <p data-testid="likes-empty-msg" className="text-white font-bold text-lg text-center py-20">
          You have not liked any tracks yet
        </p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-6 gap-4" data-testid="likes-grid">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const track = filteredTracks[i];
            return track ? (
              <TrackRow key={track.id} track={track} view="grid" isLiked={true} onUnlike={handleUnlike} />
            ) : (
              <div key={i} data-testid={`likes-slot-${i}`} className="w-full aspect-square rounded-sm bg-[#282828]" />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4" data-testid="likes-list">
          {filteredTracks.map((track) => (
            <TrackRow key={track.id} track={track} view="list" isLiked={true} onUnlike={handleUnlike} />
          ))}
        </div>
      )}
    </div>
  );
}


// import { useState, useMemo, useEffect } from "react";
// import TrackRow from "../components/TrackRow";
// import { feedService } from "@/features/feed/feedService";
// import type { TrackItem } from "../types";

// const COLS = 6;

// function mapLikedTrackToTrackItem(t: {
//   id: string;
//   title: string;
//   artist: string;
//   coverUrl: string | null;
//   likesCount: number;
//   repostsCount: number;
//   commentsCount: number;
//   playsCount: number;
// }): TrackItem {
//   return {
//     id: t.id,
//     title: t.title,
//     artist: t.artist,
//     coverUrl: t.coverUrl ?? undefined,
//     likes: String(t.likesCount),
//     reposts: String(t.repostsCount),
//     comments: String(t.commentsCount),
//     plays: String(t.playsCount),
//   };
// }

// export default function LikesTab() {
//   const [view, setView] = useState<"grid" | "list">("grid");
//   const [query, setQuery] = useState("");
//   const [tracks, setTracks] = useState<TrackItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let mounted = true;
//     const fetch = async () => {
//       setLoading(true);
//       setError(null);
//       const res = await feedService.getMyLikes(50);
//       if (!mounted) return;
//       if (!res) { setError("Failed to load liked tracks."); setLoading(false); return; }
//       setTracks(res.map(mapLikedTrackToTrackItem));
//       setLoading(false);
//     };
//     void fetch();
//     return () => { mounted = false; };
//   }, []);

//   const filteredTracks = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return tracks;
//     return tracks.filter(
//       (t) =>
//         t.title.toLowerCase().includes(q) ||
//         t.artist.toLowerCase().includes(q)
//     );
//   }, [tracks, query]);

//   const totalSlots = Math.ceil(Math.max(filteredTracks.length, 1) / COLS) * COLS;

//   return (
//     <div data-testid="likes-tab">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-white font-bold text-sm">Hear the tracks you've liked:</h2>
//         <div className="flex items-center gap-3">
//           <span className="text-zinc-400 text-xs">View</span>
//           <button
//             data-testid="likes-grid-view-btn"
//             onClick={() => setView("grid")}
//             className={`p-1.5 rounded ${view === "grid" ? "bg-orange-500" : "hover:bg-zinc-700"}`}
//           >
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
//               <rect x="0" y="0" width="6" height="6" />
//               <rect x="8" y="0" width="6" height="6" />
//               <rect x="0" y="8" width="6" height="6" />
//               <rect x="8" y="8" width="6" height="6" />
//             </svg>
//           </button>
//           <button
//             data-testid="likes-list-view-btn"
//             onClick={() => setView("list")}
//             className={`p-1.5 rounded ${view === "list" ? "bg-orange-500" : "hover:bg-zinc-700"}`}
//           >
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="#9ca3af">
//               <rect x="0" y="1" width="14" height="2" />
//               <rect x="0" y="6" width="14" height="2" />
//               <rect x="0" y="11" width="14" height="2" />
//             </svg>
//           </button>
//           <input
//             data-testid="likes-filter-input"
//             placeholder="Filter"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="bg-[#282828] border border-zinc-700 rounded-sm px-3 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-64"
//           />
//         </div>
//       </div>

//       {loading ? (
//         <div className="grid grid-cols-6 gap-4" data-testid="likes-loading">
//           {Array.from({ length: COLS }).map((_, i) => (
//             <div key={i} className="w-full aspect-square rounded-sm bg-[#282828] animate-pulse" />
//           ))}
//         </div>
//       ) : error ? (
//         <p data-testid="likes-error" className="text-red-400 text-sm text-center py-20">{error}</p>
//       ) : tracks.length === 0 ? (
//         <p data-testid="likes-empty-msg" className="text-white font-bold text-lg text-center py-20">
//           You have not liked any tracks yet
//         </p>
//       ) : filteredTracks.length === 0 ? (
//         <p data-testid="likes-no-results" className="text-white font-bold text-lg text-center py-20">
//           No tracks match your filter
//         </p>
//       ) : view === "grid" ? (
//         <div className="grid grid-cols-6 gap-4" data-testid="likes-grid">
//           {Array.from({ length: totalSlots }).map((_, i) => {
//             const track = filteredTracks[i];
//             return track ? (
//               <TrackRow key={track.id} track={track} view="grid" isLiked={true} />
//             ) : (
//               <div key={i} data-testid={`likes-slot-${i}`} className="w-full aspect-square rounded-sm bg-[#282828]" />
//             );
//           })}
//         </div>
//       ) : (
//         <div className="flex flex-col gap-4" data-testid="likes-list">
//           {filteredTracks.map((track) => (
//             <TrackRow key={track.id} track={track} view="list" isLiked={true} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
