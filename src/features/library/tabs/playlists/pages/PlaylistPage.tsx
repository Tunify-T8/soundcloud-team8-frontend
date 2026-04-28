import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { User } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
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

  const fetchData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

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
  }, [id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

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
      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-10">
        <PlaylistHeader
          playlist={playlist}
          tracks={tracks}
          onUpdate={() => void fetchData()}
          isMe={isOwner}
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
                <div className="flex flex-col items-start text-left">
                  <img
                    src={playlist.owner?.avatarUrl || "/default-avatar.png"}
                    alt={
                      playlist.owner?.displayName || playlist.owner?.username
                    }
                    className="h-28 w-28 rounded-full object-cover"
                  />
                  <div className="mt-3 self-center text-center">
                    <div className="text-[16px] font-bold leading-none text-white">
                      {playlist.owner?.displayName || playlist.owner?.username}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1 text-sm font-semibold text-zinc-400">
                      <User size={12} />
                      <span className="text-[11px]">
                        {playlist.owner.followerCount}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="min-w-0 flex-1 mt-4">
                <TrackList tracks={tracks} />
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
