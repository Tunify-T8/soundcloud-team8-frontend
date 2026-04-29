import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { User } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import { playlistService } from "../../../libraryService";
import type { Collection, CollectionTrack } from "../../../types";

import PlaylistHeader from "../components/PlaylistHeader";
import TrackList from "../components/TrackList";
import ActionBar from "../components/ActionBar";
import EditPlaylistOverlay from "../components/EditPlaylistOverlay";

const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [playlist, setPlaylist] = useState<Collection | null>(null);
  const [tracks, setTracks] = useState<CollectionTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const {
    currentTrack,
    isPlaying,
    progress,
    setCurrentTrack,
    setIsPlaying,
    requestSeek,
  } = usePlayer();

  const fetchData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    // if (id === MOCK_PLAYLIST_ID && currentUser) {
    //   setPlaylist(buildMockPlaylist(currentUser));
    //   setTracks(buildMockTracks(currentUser));
    //   setLoading(false);
    //   return;
    // }

    try {
      const [playlistData, tracksData] = await Promise.all([
        playlistService.getPlaylistById(id),
        playlistService.getPlaylistTracks(id),
      ]);

      setPlaylist(playlistData ?? null);
      setTracks(tracksData?.data ?? []);
    } catch {
      setError("Collection not found");
      setPlaylist(null);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!reorderError) return;
    const timeout = setTimeout(() => setReorderError(null), 4000);
    return () => clearTimeout(timeout);
  }, [reorderError]);

  const handleReorder = useCallback(
    async (newTracks: CollectionTrack[]) => {
      if (!id) return;
      const previousTracks = tracks;
      setTracks(newTracks);
      setReorderError(null);

      // if (id === MOCK_PLAYLIST_ID) {
      //   return;
      // }

      const ok = await playlistService.reorderTracks(id, {
        trackIds: newTracks.map((ct) => ct.track.id),
      });
      if (!ok) {
        setTracks(previousTracks);
        setReorderError("Couldn't save the new track order. Please try again.");
      }
    },
    [id, tracks],
  );

  const toPlayerTrack = useCallback((ct: CollectionTrack) => ({
    id: ct.track.id,
    title: ct.track.title,
    artist: ct.track.user.displayName || ct.track.user.username,
    thumbnailUrl: ct.track.coverUrl ?? undefined,
    artworkUrl: ct.track.coverUrl ?? undefined,
    duration: ct.track.durationSeconds || 0,
  }), []);

  const activePlaylistTrack = currentTrack
    ? tracks.find((item) => item.track.id === currentTrack.id) ?? null
    : null;

  const handlePlayTrack = useCallback((ct: CollectionTrack) => {
    if (currentTrack?.id === ct.track.id) {
      setIsPlaying(!isPlaying);
      return;
    }

    setCurrentTrack(toPlayerTrack(ct));
    setIsPlaying(true);
  }, [currentTrack?.id, isPlaying, setCurrentTrack, setIsPlaying, toPlayerTrack]);

  const handlePlayPlaylist = useCallback(() => {
    const targetTrack = activePlaylistTrack ?? tracks[0];
    if (!targetTrack) return;
    handlePlayTrack(targetTrack);
  }, [activePlaylistTrack, tracks, handlePlayTrack]);

  const handleSeek = useCallback((ratio: number) => {
    const targetTrack = activePlaylistTrack ?? tracks[0];
    if (!targetTrack) return;

    if (currentTrack?.id !== targetTrack.track.id) {
      setCurrentTrack(toPlayerTrack(targetTrack));
      setIsPlaying(true);
    }

    requestSeek(targetTrack.track.id, ratio);
  }, [activePlaylistTrack, tracks, currentTrack?.id, requestSeek, setCurrentTrack, setIsPlaying, toPlayerTrack]);

  if (loading)
    return (
      <div className="min-h-screen bg-black text-zinc-400 text-center py-20">
        Loading...
      </div>
    );

  if (error || !playlist)
    return (
      <div className="min-h-screen bg-black text-red-400 text-center py-20">
        Collection not found
      </div>
    );

  const isOwner = currentUser?.id === playlist.owner.id;

  return (
    <div className="min-h-screen bg-black text-white">
      {reorderError && (
        <div
          data-testid="playlist-reorder-error"
          role="alert"
          className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-md border border-red-500/40 bg-red-950/90 px-4 py-2 text-sm font-semibold text-red-200 shadow-lg backdrop-blur"
        >
          {reorderError}
        </div>
        
      )}
    
      <div className="mx-auto max-w-[1200px] px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
        <PlaylistHeader
          playlist={playlist}
          tracks={tracks}
          onUpdate={() => void fetchData()}
          isMe={isOwner}
          activeTrack={activePlaylistTrack}
          isPlaying={Boolean(activePlaylistTrack && isPlaying)}
          playerProgress={activePlaylistTrack ? progress : 0}
          onPlayToggle={handlePlayPlaylist}
          onSeek={handleSeek}
        />

        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <ActionBar
              playlist={playlist}
              canDelete={isOwner}
              onEdit={() => setIsEditOpen(true)}
              onDeleted={() => navigate("/library")}
            />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <aside className="w-full lg:w-[112px] lg:shrink-0">
                <div className="flex flex-row items-center gap-4 lg:flex-col lg:items-start lg:gap-0">
                  <Link
                    to={`/${encodeURIComponent(playlist.owner.username)}`}
                    className="group block shrink-0"
                  >
                    <img
                      src={playlist.owner?.avatarUrl || "/default-avatar.png"}
                      alt={
                        playlist.owner?.displayName || playlist.owner?.username
                      }
                      className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20 lg:h-28 lg:w-28"
                    />
                  </Link>
                  <div className="lg:mt-3 lg:self-center lg:text-center">
                    <div className="text-[15px] font-bold leading-none text-white transition-colors lg:text-[16px]">
                      <Link
                        to={`/${encodeURIComponent(playlist.owner.username)}`}
                        className="hover:text-zinc-300"
                      >
                        {playlist.owner?.displayName ||
                          playlist.owner?.username}
                      </Link>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-zinc-400 lg:mt-2 lg:justify-center">
                      <User size={12} />
                      <span className="text-[11px]">
                        {playlist.owner.followerCount}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="min-w-0 flex-1 mt-4">
                <TrackList
                  tracks={tracks}
                  onReorder={isOwner ? handleReorder : undefined}
                  currentTrackId={currentTrack?.id}
                  isPlaying={isPlaying}
                  onPlayTrack={handlePlayTrack}
                />
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-[340px] lg:shrink-0">
            <div className="lg:sticky lg:top-24">
              <span className="text-xs font-bold tracking-wide text-white">
                GO MOBILE
              </span>
              <div className="mt-3 flex gap-2">
                <a
                  href="https://apps.apple.com/us/app/soundcloud-the-music-you-love/id336353151"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-37 items-center gap-2 rounded-md border border-zinc-500 bg-black px-3 text-white transition hover:border-zinc-300"
                >
                  <FaApple size={24} />
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-[9px] font-medium text-zinc-300">
                      Download on the
                    </span>
                    <span className="text-[17px] font-semibold leading-3.5">
                      App Store
                    </span>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.soundcloud.android&hl=us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-38 items-center gap-2 rounded-md border border-zinc-500 bg-black px-3 text-white transition hover:border-zinc-300"
                >
                  <FaGooglePlay size={24} />
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-[9px] font-medium text-zinc-300">
                      GET IT ON
                    </span>
                    <span className="text-[17px] font-semibold leading-3.5">
                      Google Play
                    </span>
                  </div>
                </a>
              </div>

              <div className="mt-6 text-zinc-400">
                <div className="text-[14px]">
                  <a href="#" className="hover:text-zinc-300">
                    Legal
                  </a>
                  <span> · </span>
                  <a href="#" className="hover:text-zinc-300">
                    Privacy
                  </a>
                  <span> · </span>
                  <a href="#" className="hover:text-zinc-300">
                    Cookie Policy
                  </a>
                  <span> · </span>
                  <a href="#" className="hover:text-zinc-300">
                    Cookie Manager
                  </a>
                  <span> · </span>
                  <a href="#" className="hover:text-zinc-300">
                    Imprint
                  </a>
                  <span> · </span>
                  <a href="#" className="hover:text-zinc-300">
                    Artist Resources
                  </a>
                  <span> · </span>
                  <a href="#" className="hover:text-zinc-300">
                    Newsroom
                  </a>
                  <span> · </span>
                  <a href="#" className="hover:text-zinc-300">
                    Charts
                  </a>
                  <span> · </span>
                  <a href="#" className="hover:text-zinc-300">
                    Transparency Reports
                  </a>
                </div>
                <div className="mt-7 text-[13px] leading-none">
                  <span className="font-semibold text-white">Language:</span>{" "}
                  <a href="#" className="text-blue-400 hover:text-blue-300">
                    English (US)
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <EditPlaylistOverlay
          isOpen={isEditOpen}
          playlist={playlist}
          tracks={tracks}
          onClose={() => setIsEditOpen(false)}
          onSaved={() => void fetchData()}
        />
      </div>
    </div>
  );
};

export default PlaylistPage;
