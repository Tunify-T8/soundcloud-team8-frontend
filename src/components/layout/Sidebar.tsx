import { useState, useEffect } from "react";
import { FaUser, FaMusic, FaGooglePlay, FaApple } from "react-icons/fa";
import { Heart, Play } from "lucide-react";
import { SiSoundcloud } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";
import { IoChevronDown } from "react-icons/io5";
import { feedService } from "../../features/feed/feedservice";
import { followingService } from "../../features/following/followingService";
import type { LikedTrack } from "@/features/feed/type";
import UpgradeModal from "@/features/premium/components/UpgradeModal";
import { api } from "../../features/auth/services/api";
import avatarFallback from "@/assets/avatar.png";
import { notifySocialGraphUpdated } from "../../features/profile/socialGraphEvents";
import amplifyImg from "@/assets/amplifytool.png";
import replaceImg from "@/assets/replace.png";
import distributeImg from "@/assets/distribute.png";
import masterImg from "@/assets/master.png";
import monetizeImg from "@/assets/monetize.png";
import spotlightImg from "@/assets/spotlightool.png";
import topFansImg from "@/assets/top_fans.png";
import commentsImg from "@/assets/comments.png";

interface SuggestedArtist {
  id: string;
  username: string;
  displayName: string | null;
  isCertified: boolean;
  avatarUrl: string | null;
  followersCount: number;
  tracksCount: number;
  isFollowing?: boolean;
}

type ArtistTool = {
  id: string;
  label: string;
  imageSrc?: string;
  badge: "plus" | "star";
  hoverTheme: "purple" | "gold";
};

const artistToolRows: ArtistTool[][] = [
  [
    { id: "amplify", label: "Amplify", imageSrc: amplifyImg, badge: "plus", hoverTheme: "purple" },
    { id: "replace", label: "Replace", imageSrc: replaceImg, badge: "plus", hoverTheme: "purple" },
    { id: "distribute", label: "Distribute", imageSrc: distributeImg, badge: "plus", hoverTheme: "purple" },
    { id: "master", label: "Master", imageSrc: masterImg, badge: "plus", hoverTheme: "purple" },
  ],
  [
    { id: "monetize", label: "Monetize", imageSrc: monetizeImg, badge: "plus", hoverTheme: "purple" },
    { id: "spotlight", label: "Spotlight", imageSrc: spotlightImg, badge: "plus", hoverTheme: "purple" },
    { id: "top-fans", label: "Top fans", imageSrc: topFansImg, badge: "star", hoverTheme: "gold" },
    { id: "comments", label: "Comments", imageSrc: commentsImg, badge: "star", hoverTheme: "gold" },
  ],
];

export default function SideBar() {
  const [open, setOpen] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const [likesLoading, setLikesLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [pendingFollowById, setPendingFollowById] = useState<Record<string, boolean>>({});

  const handleArtistToolClick = () => {
    setUpgradeOpen(true);
  };

  const fetchArtists = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/feed/suggested-artists", {
        params: { page: 1, limit: 20 },
      });
      const items: SuggestedArtist[] = res.data.items || [];
      setSuggestedUsers(items);

      const seededStates = Object.fromEntries(
        items.map((artist) => [artist.id, Boolean(artist.isFollowing)]),
      );
      setFollowStates((prev) => ({ ...prev, ...seededStates }));
      setLoading(false);

      // Resolve precise follow states in background so the list appears immediately.
      void (async () => {
        const statusEntries = await Promise.all(
          items.map(async (artist) => {
            try {
              const status = await followingService.getFollowStatus(artist.id);
              return [artist.id, status.isFollowing] as const;
            } catch {
              return [artist.id, seededStates[artist.id] ?? false] as const;
            }
          }),
        );

        setFollowStates((prev) => ({ ...prev, ...Object.fromEntries(statusEntries) }));
      })();
    } catch {
      setError("Failed to load artists");
      setLoading(false);
    }
  };

  const handleSuggestedArtistFollowToggle = async (artistId: string) => {
    setPendingFollowById((prev) => ({ ...prev, [artistId]: true }));
    const wasFollowing = followStates[artistId] ?? false;
    setFollowStates((prev) => ({ ...prev, [artistId]: !wasFollowing }));

    try {
      if (wasFollowing) {
        await followingService.unfollowUser(artistId);
      } else {
        await followingService.followUser(artistId);
      }

      notifySocialGraphUpdated();
    } catch (err) {
      setFollowStates((prev) => ({ ...prev, [artistId]: wasFollowing }));
      console.error("Failed to toggle suggested artist follow state", err);
    } finally {
      setPendingFollowById((prev) => ({ ...prev, [artistId]: false }));
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    feedService
      .getMyLikes(4)
      .then(setLikedTracks)
      .finally(() => setLikesLoading(false));
  }, []);

  return (
    <header data-testid="sidebar" className="flex flex-col justify-end mt-2">
      <div className="ml-auto flex flex-col w-[310px] mr-6">

        <div data-testid="artist-tools-section" className="w-full rounded-none bg-transparent px-0 py-4">
          <div
            data-testid="artist-tools-toggle"
            onClick={() => setOpen(!open)}
            className="mb-6 flex cursor-pointer items-center justify-between border-b border-zinc-800 pb-5"
          >
            <span className="text-[18px] font-bold tracking-tight text-white">
              ARTIST TOOLS
            </span>
            <IoChevronDown
              size={22}
              className={`text-white transition-transform ${open ? "rotate-180" : ""}`}
            />
          </div>

          <div className="mb-4 grid grid-cols-4 gap-3">
            {artistToolRows[0].map((tool) => (
              <Tool key={tool.id} tool={tool} onClick={handleArtistToolClick} />
            ))}
          </div>

          {open && (
            <div className="mb-4 grid grid-cols-4 gap-3">
              {artistToolRows[1].map((tool) => (
                <Tool key={tool.id} tool={tool} onClick={handleArtistToolClick} />
              ))}
            </div>
          )}

          <button
            type="button"
            data-testid="artist-tools-upgrade-btn"
            onClick={handleArtistToolClick}
            className="flex w-full items-center rounded-[9px] bg-[#433873] px-3 py-3.5 text-left text-white transition-colors hover:bg-[#4b3f80]"
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#735ef2] text-[22px] font-black leading-none">
              +
            </span>
            <span className="px-1 text-[13px] font-medium tracking-tight leading-snug">
              Unlock Artist tools from EGP 29.99/month.
            </span>
          </button>
        </div>

        <div data-testid="suggested-artists-section" className="mt-8 mb-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-extrabold text-white tracking-wide uppercase">
              ARTISTS YOU SHOULD FOLLOW
            </span>
            <button
              data-testid="suggested-artists-refresh-btn"
              onClick={fetchArtists}
              className="text-xs text-gray-400 hover:underline"
            >
              Refresh list
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {loading ? (
              <div data-testid="suggested-artists-loading" className="text-gray-400 text-xs">
                Loading...
              </div>
            ) : error ? (
              <div data-testid="suggested-artists-error" className="text-red-400 text-xs">
                {error}
              </div>
            ) : suggestedUsers.length === 0 ? (
              <div data-testid="suggested-artists-empty" className="text-gray-400 text-xs">
                No suggestions found.
              </div>
            ) : (
              suggestedUsers.map((artist) => (
                <div
                  key={artist.id}
                  data-testid={`suggested-artist-${artist.id}`}
                  className="flex items-center justify-between"
                >
                  <Link to={`/${artist.username || artist.id}`} className="flex items-center gap-3">
                    <img
                      src={artist.avatarUrl || avatarFallback}
                      alt={artist.displayName || artist.username}
                      data-testid={`suggested-artist-avatar-${artist.id}`}
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
                  <button
                    data-testid={`suggested-artist-follow-btn-${artist.id}`}
                    type="button"
                    disabled={Boolean(pendingFollowById[artist.id])}
                    onClick={() => handleSuggestedArtistFollowToggle(artist.id)}
                    className={`font-semibold rounded px-5 py-1.5 text-sm transition disabled:opacity-60 ${
                      followStates[artist.id]
                        ? "bg-zinc-800 text-white hover:bg-zinc-700"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    {followStates[artist.id] ? "Following" : "Follow"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div data-testid="likes-section" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-white tracking-wide uppercase">
              {likedTracks.length > 0 ? `${likedTracks.length} LIKES` : "LIKES"}
            </span>
            <button
              data-testid="likes-view-all-btn"
              className="text-xs text-gray-400 hover:underline"
            >
              View all
            </button>
          </div>

          {likesLoading ? (
            <div data-testid="likes-loading" className="text-gray-400 text-xs">
              Loading...
            </div>
          ) : likedTracks.length === 0 ? (
            <div data-testid="likes-empty" className="text-gray-400 text-xs">
              No liked tracks yet.
            </div>
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

        <div data-testid="go-mobile-section">
          <span className="text-xs font-bold tracking-wide text-white">
            GO MOBILE
          </span>
          <div className="mt-3 flex gap-2">
            <a
              href="https://apps.apple.com/us/app/soundcloud-the-music-you-love/id336353151"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="app-store-link"
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
              data-testid="google-play-link"
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

        {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
      </div>
    </header>
  );
}

type ToolProps = {
  tool: ArtistTool;
  onClick: (tool: ArtistTool) => void;
};

function Tool({ tool, onClick }: ToolProps) {
  const badgeClasses =
    tool.badge === "star"
      ? "bg-[#f5efd9] text-[#c5a64f]"
      : "bg-[#2f255f] text-[#8d74ff]";

  const hoverBarClasses =
    tool.hoverTheme === "gold"
      ? "bg-[#d4bf7b] text-[#171717]"
      : "bg-[#735ef2] text-white";

  const badgeSymbol = tool.badge === "star" ? "★" : "+";

  return (
    <button
      type="button"
      data-testid={`artist-tool-${tool.id}`}
      onClick={() => onClick(tool)}
      className="group relative h-[86px] w-full overflow-hidden rounded-2xl border border-zinc-700/60 bg-[#1a1a1a] transition-colors hover:border-zinc-600"
    >
      <span
        className={`absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-black ${badgeClasses}`}
      >
        {badgeSymbol}
      </span>

      <div className="flex h-full flex-col items-center justify-center">
        <div className="flex h-[40px] w-[45px] items-center justify-center">
          {tool.imageSrc ? (
            <img
              src={tool.imageSrc}
              alt={tool.label}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-full w-full rounded-2xl border border-dashed border-zinc-600/80 bg-zinc-900/40" />
          )}
        </div>
        <span className="text-center text-[13px] font-semibold leading-tight tracking-tight text-white transition-opacity group-hover:opacity-0">
          {tool.label}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-200 group-hover:translate-y-0">
        <div className={`flex h-11 items-center justify-center text-[13px] font-black ${hoverBarClasses}`}>
          Upgrade
        </div>
      </div>
    </button>
  );
}

function LikedTrackRow({
  track,
  onUnlike,
  onReLike,
}: {
  track: LikedTrack;
  onUnlike: (id: string) => void;
  onReLike: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(true);

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      onUnlike(track.id);
      try {
        await feedService.unlikeTrack(track.id);
      } catch {
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
      data-testid={`liked-track-${track.id}`}
      className="flex cursor-pointer items-center gap-2 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (track.id) navigate(`/tracks/${track.id}`);
      }}
    >
      <div className="relative w-11 h-11 shrink-0 rounded overflow-hidden bg-[hsl(0,0%,15%)]">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            data-testid={`liked-track-cover-${track.id}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <SiSoundcloud size={16} className="text-gray-600" />
          </div>
        )}

        {hovered && (
          <button
            data-testid={`liked-track-toggle-btn-${track.id}`}
            onClick={handleToggle}
            className="absolute inset-0 flex items-center justify-center bg-black/50 transition-colors"
            aria-label={isLiked ? "Unlike track" : "Like track"}
          >
            <Heart
              size={16}
              fill={isLiked ? "#f97316" : "none"}
              className={isLiked ? "text-orange-500" : "text-white"}
            />
          </button>
        )}
      </div>

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
            <Heart
              size={8}
              fill={isLiked ? "currentColor" : "none"}
              className={isLiked ? "text-orange-500" : ""}
            />
            {track.likesCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
