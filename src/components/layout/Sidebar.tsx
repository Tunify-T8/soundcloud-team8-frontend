import { useState, useEffect } from "react";
// import axios from "axios";
import { FaUser, FaMusic, FaGooglePlay, FaApple } from "react-icons/fa";
import { Heart, Play } from "lucide-react";
import { SiSoundcloud } from "react-icons/si";
import { Link } from "react-router-dom";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { FiRefreshCcw } from "react-icons/fi";
import { TbWorld } from "react-icons/tb";
import { MdOutlineAutoFixHigh } from "react-icons/md";
import { IoAddCircle, IoChevronDown } from "react-icons/io5";
import { feedService } from "../../features/feed/feedservice";
import type { LikedTrack } from "@/shared/types/Feed";
import { api } from '../../features/auth/services/api';
import avatarFallback from "@/assets/avatar.png";

// ─── Local types ──────────────────────────────────────────────────────────────

interface SuggestedArtist {
  id: string;
  username: string;
  displayName: string | null;
  isCertified: boolean;
  avatarUrl: string | null;
  followersCount: number;
  tracksCount: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SideBar() {
  const [open, setOpen] = useState(true);

  // Artists state — typed so TypeScript knows the shape
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedArtist[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  // Likes state
  const [likedTracks, setLikedTracks]   = useState<LikedTrack[]>([]);
  const [likesLoading, setLikesLoading] = useState(true);

  // ── Fetch artists ────────────────────────────────────────────────────────────
  const fetchArtists = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/feed/suggested-artists", {
        params: { page: 1, limit: 20 },
      });
      setSuggestedUsers(res.data.items || []);
    } catch {
      setError("Failed to load artists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  // ── Fetch liked tracks ───────────────────────────────────────────────────────
  useEffect(() => {
    feedService
      .getMyLikes(4)
      .then(setLikedTracks)
      .finally(() => setLikesLoading(false));
  }, []);

  return (
    <header className="flex flex-col justify-end mt-2">
      <div className="ml-auto flex flex-col w-1xl mr-25">

        {/* ── ARTIST TOOLS ──────────────────────────────────────────────────── */}
        <div className="w-full">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center justify-between cursor-pointer text-xs text-zinc-400 font-semibold tracking-wide mb-3"
          >
            <span>ARTIST TOOLS</span>
            <IoChevronDown
              size={14}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </div>

          <div className="grid grid-cols-4 gap-3 mb-3">
            <Tool icon={<HiOutlineSpeakerphone size={20} />} label="Amplify" />
            <Tool icon={<FiRefreshCcw size={20} />}          label="Replace" />
            <Tool icon={<TbWorld size={20} />}               label="Distribute" />
            <Tool icon={<MdOutlineAutoFixHigh size={20} />}  label="Master" />
          </div>

          {open && (
            <div className="grid grid-cols-4 gap-3">
              <Tool icon={<HiOutlineSpeakerphone size={20} />} label="Promote" />
              <Tool icon={<FiRefreshCcw size={20} />}          label="Insights" />
              <Tool icon={<TbWorld size={20} />}               label="Monetize" />
              <Tool icon={<MdOutlineAutoFixHigh size={20} />}  label="Pro Tools" />
            </div>
          )}
        </div>

        {/* ── ARTISTS YOU SHOULD FOLLOW ──────────────────────────────────────── */}
        <div className="mt-8 mb-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-extrabold text-white tracking-wide uppercase">
              ARTISTS YOU SHOULD FOLLOW
            </span>
            <button
              onClick={fetchArtists}
              className="text-xs text-gray-400 hover:underline"
            >
              Refresh list
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-gray-400 text-xs">Loading...</div>
            ) : error ? (
              <div className="text-red-400 text-xs">{error}</div>
            ) : suggestedUsers.length === 0 ? (
              <div className="text-gray-400 text-xs">No suggestions found.</div>
            ) : (
              suggestedUsers.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between">
                  <Link
                    to={`/${artist.id}`}
                    className="flex items-center gap-3 "
                  >
                    <img
                      src={artist.avatarUrl || avatarFallback}
                      alt={artist.displayName || artist.username}
                      className="w-11 h-11 rounded-full object-cover bg-linear-to-br from-gray-700 to-gray-900"
                    />
                    <div>
                      <div className="font-bold text-white text-[15px] leading-tight hover:text-zinc-500">
                        {artist.displayName || artist.username}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1 hover:text-zinc-600">
                          <FaUser size={12} />
                          {artist.followersCount}
                        </span>
                        <span className="flex items-center gap-1 hover:text-zinc-600">
                          <FaMusic size={12} />
                          {artist.tracksCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <button className="bg-white text-black font-semibold rounded px-5 py-1.5 text-sm hover:bg-gray-100 transition">
                    Follow
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── LIKES SECTION ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-white tracking-wide uppercase">
              {likedTracks.length > 0 ? `${likedTracks.length} LIKES` : "LIKES"}
            </span>
            <button className="text-xs text-gray-400 hover:underline">
              View all
            </button>
          </div>

          {likesLoading ? (
            <div className="text-gray-400 text-xs">Loading...</div>
          ) : likedTracks.length === 0 ? (
            <div className="text-gray-400 text-xs">No liked tracks yet.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {likedTracks.map((track) => (
                <LikedTrackRow
                  key={track.id}
                  track={track}
                  onUnlike={(id) =>
                    setLikedTracks((prev) => prev.filter((t) => t.id !== id))
                  }
                  onReLike={(id) =>
                    setLikedTracks((prev) =>
                      prev.some((t) => t.id === id) ? prev : [...prev, track]
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* ── GO MOBILE ─────────────────────────────────────────────────────── */}
        <div>
          <span className="text-xs font-bold tracking-wide text-white">
            GO MOBILE
          </span>
          <div className="mt-3 flex gap-2">
            <a
              href="https://apps.apple.com/us/app/soundcloud-the-music-you-love/id336353151"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-37 items-center gap-2 rounded-md border border-zinc-500 bg-black px-3 text-white hover:border-zinc-300 transition"
            >
              <FaApple size={24} />
              <div className="flex flex-col leading-tight text-left">
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
              className="flex h-11 w-38 items-center gap-2 rounded-md border border-zinc-500 bg-black px-3 text-white hover:border-zinc-300 transition"
            >
              <FaGooglePlay size={24} />
              <div className="flex flex-col leading-tight text-left">
                <span className="text-[9px] font-medium text-zinc-300">
                  GET IT ON
                </span>
                <span className="text-[17px] font-semibold leading-3.5">
                  Google Play
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* ── LEGAL ─────────────────────────────────────────────────────────── */}
        <div className="mt-6 text-zinc-400">
          <div className="text-[14px]">
            <a href="#" className="hover:text-zinc-300">Legal</a>
            <span> · </span>
            <a href="#" className="hover:text-zinc-300">Privacy</a>
            <span> · </span>
            <a href="#" className="hover:text-zinc-300">Cookie Policy</a>
            <span> · </span>
            <a href="#" className="hover:text-zinc-300">Cookie Manager</a>
            <span> · </span>
            <a href="#" className="hover:text-zinc-300">Imprint</a>
            <span> · </span>
            <a href="#" className="hover:text-zinc-300">Artist Resources</a>
            <span> · </span>
            <a href="#" className="hover:text-zinc-300">Newsroom</a>
            <span> · </span>
            <a href="#" className="hover:text-zinc-300">Charts</a>
            <span> · </span>
            <a href="#" className="hover:text-zinc-300">Transparency Reports</a>
          </div>
          <div className="mt-7 text-[13px] leading-none">
            <span className="font-semibold text-white">Language:</span>{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              English (US)
            </a>
          </div>
        </div>

      </div>
    </header>
  );
}

// ─── Tool component ───────────────────────────────────────────────────────────

type ToolProps = {
  icon: React.ReactNode;
  label: string;
};

function Tool({ icon, label }: ToolProps) {
  return (
    <div className="relative flex flex-col items-center justify-center w-17.5 h-17.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:bg-zinc-900 hover:border-zinc-700 cursor-pointer transition">
      <IoAddCircle size={14} className="absolute top-1 right-1 text-purple-500" />
      <div className="text-zinc-300">{icon}</div>
      <span className="text-[11px] mt-1 text-zinc-400">{label}</span>
    </div>
  );
}
// ─── LikedTrackRow component ──────────────────────────────────────────────────

function LikedTrackRow({
  track,
  onUnlike,
  onReLike,
}: {
  track: LikedTrack;
  onUnlike: (id: string) => void;
  onReLike: (id: string) => void;
}) {
  const [hovered, setHovered]   = useState(false);
  const [isLiked, setIsLiked]   = useState(true);

  const handleToggle = async () => {
    if (isLiked) {
      setIsLiked(false);
      onUnlike(track.id);
      try {
        await feedService.unlikeTrack(track.id);
      } catch {
        // revert if API fails
        setIsLiked(true);
        onReLike(track.id);
      }
    } else {
      setIsLiked(true);
      onReLike(track.id);
      try {
        await feedService.likeTrack(track.id);
      } catch {
        setIsLiked(false);
        onUnlike(track.id);
      }
    }
  };

  return (
    <div
      className="flex items-center gap-2 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail with heart overlay on hover */}
      <div className="relative w-11 h-11 shrink-0 rounded overflow-hidden bg-[hsl(0,0%,15%)]">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <SiSoundcloud size={16} className="text-gray-600" />
          </div>
        )}

        {/* Heart overlay — appears on hover */}
        {hovered && (
          <button
            onClick={handleToggle}
            className="absolute inset-0 flex items-center justify-center bg-black/50 transition-colors"
            aria-label={isLiked ? 'Unlike track' : 'Like track'}
          >
            <Heart
              size={16}
              fill={isLiked ? '#f97316' : 'none'}
              className={isLiked ? 'text-orange-500' : 'text-white'}
            />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-[13px] font-medium truncate leading-tight">
          {track.title}
        </p>
        <p className="text-gray-400 text-[11px] truncate">{track.artist}</p>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
          <span className="flex items-center gap-0.5">
            <Play size={8} fill="currentColor" />
            {track.playsCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5">
            <Heart size={8} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-orange-500' : ''} />
            {track.likesCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}