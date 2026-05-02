import { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  Repeat2,
  Share2,
  Copy,
  MoreHorizontal,
  ListPlus,
  ListMusic,
  Radio,
  Download,
  Check,
  Loader2,
} from "lucide-react";
import { SiSoundcloud } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";
import { waveGenerators } from "../Waveforms";
import { engagementService } from "@/features/engagement/services/engagementService";
import { Genre } from "@/shared/types/Genre";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import { useSubscription } from "@/hooks/useSubscription";
import { useMe } from "@/features/profile/context/useMe";
import { playbackService } from "@/features/player-core/Playbackservice";
import { useQueue } from "@/hooks/useQueue";
import CreatePlaylistOverlay from "@/features/library/tabs/playlists/components/CreatePlaylistOverlay";
import trackFallback from "@/assets/track.jpg";
import {
  notifyTrackLikeChanged,
  TRACK_LIKE_CHANGED_EVENT,
  type TrackLikeChangedDetail,
} from "@/features/engagement/engagementEvents";
import ShareOverlay from "@/components/ui/ShareOverlay";
import {
  DOWNLOAD_LIBRARY_CHANGED_EVENT,
  hasDownload,
  saveDownload,
  type DownloadLibraryChangedDetail,
} from "@/features/library/downloadStorage";

interface PlayerProps {
  trackId?: string;
  entityLinkTo?: string;
  artistLinkTo?: string;
  artistRouteState?: { userId?: string };
  smallCoverOnMobile?: boolean;
  isLikedInitial?: boolean;
  isRepostedInitial?: boolean;
  artistName?: string;
  title?: string;
  coverUrl?: string;
  timeAgo?: string;
  genre?: Genre;
  likes?: string;
  reposts?: string;
  plays?: string;
  comments?: string;
  progress?: number;
  waveformSeed?: number;
  repostDisabled?: boolean;
  onToggleRepost?: () => void;
  onAddToNextUp?: () => void;
  onAddToPlaylist?: () => void;
  onStation?: () => void;
  contextTag?: string;
  offlineSrc?: string;
  playlistTracks?: Array<{
    id: string;
    number: number;
    title: string;
    artist: string;
    playsCount?: number;
    avatarUrl?: string | null;
  }>;
  profileTrackTextStyle?: "default" | "titleWhiteArtistGray";
}

export default function SongCard({
  trackId = "",
  entityLinkTo,
  artistLinkTo,
  artistRouteState,
  smallCoverOnMobile = false,
  isLikedInitial = false,
  isRepostedInitial = false,
  artistName = "",
  title = "",
  coverUrl = "",
  timeAgo = "",
  genre = Genre.POP,
  likes = "",
  reposts = "",
  plays = "",
  comments = "",
  progress = 0,
  waveformSeed = 0,
  repostDisabled = false,
  onToggleRepost,
  onAddToNextUp,
  onAddToPlaylist,
  onStation,
  contextTag,
  offlineSrc,
  playlistTracks = [],
  profileTrackTextStyle = "default",
}: PlayerProps) {
  const {
    currentTrack,
    isPlaying,
    progress: playerProgress,
    setCurrentTrack,
    setIsPlaying,
    requestSeek,
  } = usePlayer();
  const { hasOfflineListening } = useSubscription();
  const { me } = useMe();
  const navigate = useNavigate();
  const { addTrack, currentIndex, currentTrackId } = useQueue();

  const isThisTrack = currentTrack?.id === trackId;
  const playing = isThisTrack && isPlaying;

  const [isWaveHovered, setIsWaveHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPlaylistOverlay, setShowPlaylistOverlay] = useState(false);
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
  const [showAlreadyDownloaded, setShowAlreadyDownloaded] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showDownloadSuccessToast, setShowDownloadSuccessToast] = useState(false);
  const [randomSeed] = useState(() => Math.random() * 1000000);
  const [barCount, setBarCount] = useState<number | null>(null);
  const [hoveredSubtrackId, setHoveredSubtrackId] = useState<string | null>(null);
  const copyToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlayToggle = () => {
    if (!trackId) return;
    if (isThisTrack) {
      setIsPlaying(!isPlaying);
      return;
    }

    setCurrentTrack({
      id: trackId,
      title,
      artist: artistName,
      thumbnailUrl: coverUrl || undefined,
      duration: 0,
      offlineSrc,
    });
    setIsPlaying(true);
  };

  const handleSubtrackPlayToggle = (subtrack: {
    id: string;
    title: string;
    artist: string;
    avatarUrl?: string | null;
  }) => {
    const isCurrentSubtrack = currentTrack?.id === subtrack.id;
    if (isCurrentSubtrack) {
      setIsPlaying(!isPlaying);
      return;
    }

    setCurrentTrack({
      id: subtrack.id,
      title: subtrack.title,
      artist: subtrack.artist,
      thumbnailUrl: subtrack.avatarUrl || coverUrl || undefined,
      artworkUrl: subtrack.avatarUrl || coverUrl || undefined,
      duration: 0,
    });
    setIsPlaying(true);
  };

  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [isReposted, setIsReposted] = useState(isRepostedInitial);
  const [likesCount, setLikesCount] = useState(Number(likes) || 0);
  const [repostsCount, setRepostsCount] = useState(Number(reposts) || 0);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isRepostPending, setIsRepostPending] = useState(false);
  const likeMutationVersionRef = useRef(0);

  useEffect(() => {
    setIsLiked(isLikedInitial);
    setIsReposted(isRepostedInitial);
    setLikesCount(Number(likes) || 0);
    setRepostsCount(Number(reposts) || 0);
  }, [trackId, isLikedInitial, isRepostedInitial, likes, reposts]);

  useEffect(() => {
    if (!trackId) return;
    let mounted = true;
    const fetchMutationVersion = likeMutationVersionRef.current;
    engagementService
      .getEngagement(trackId)
      .then((data) => {
        if (!mounted || likeMutationVersionRef.current !== fetchMutationVersion) return;
        setIsLiked(Boolean(data.isLiked));
        setIsReposted(Boolean(data.isReposted));
        if (Number.isFinite(data.likesCount)) {
          setLikesCount(Number(data.likesCount));
        }
        if (Number.isFinite(data.repostsCount)) {
          setRepostsCount(Number(data.repostsCount));
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [trackId]);

  useEffect(() => {
    if (!trackId) return;

    const handleTrackLikeChanged = (event: Event) => {
      const detail = (event as CustomEvent<TrackLikeChangedDetail>).detail;
      if (!detail || detail.trackId !== trackId) return;

      setIsLiked(detail.isLiked);
      if (typeof detail.likesCount === "number") {
        setLikesCount(detail.likesCount);
      }
    };

    window.addEventListener(TRACK_LIKE_CHANGED_EVENT, handleTrackLikeChanged);
    return () => {
      window.removeEventListener(TRACK_LIKE_CHANGED_EVENT, handleTrackLikeChanged);
    };
  }, [trackId]);

  useEffect(() => {
    if (!trackId || !me?.id || !hasOfflineListening) return;
    let mounted = true;
    hasDownload(me.id, trackId)
      .then((exists) => {
        if (!mounted) return;
        setDownloaded(exists);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [trackId, me?.id, hasOfflineListening]);

  useEffect(() => {
    if (!trackId || !me?.id) return;

    const handleDownloadLibraryChanged = (event: Event) => {
      const detail = (event as CustomEvent<DownloadLibraryChangedDetail>).detail;
      if (!detail || detail.userId !== me.id) return;

      if (detail.action === "saved" && detail.trackId === trackId) {
        setDownloaded(true);
        return;
      }

      if (
        (detail.action === "deleted" && detail.trackId === trackId) ||
        detail.action === "cleared"
      ) {
        setDownloaded(false);
      }
    };

    window.addEventListener(DOWNLOAD_LIBRARY_CHANGED_EVENT, handleDownloadLibraryChanged);
    return () => {
      window.removeEventListener(DOWNLOAD_LIBRARY_CHANGED_EVENT, handleDownloadLibraryChanged);
    };
  }, [trackId, me?.id]);

  useEffect(() => {
    return () => {
      if (copyToastTimerRef.current) {
        clearTimeout(copyToastTimerRef.current);
      }
      if (downloadToastTimerRef.current) {
        clearTimeout(downloadToastTimerRef.current);
      }
    };
  }, []);

  const copyTextToClipboard = async (value: string) => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "true");
    helper.style.position = "absolute";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
  };

  const handleCopyLink = async () => {
    if (!trackId) return;
    const shareUrl = `${window.location.origin}/tracks/${trackId}`;
    try {
      await copyTextToClipboard(shareUrl);
      setShowCopyToast(true);
      if (copyToastTimerRef.current) clearTimeout(copyToastTimerRef.current);
      copyToastTimerRef.current = setTimeout(() => {
        setShowCopyToast(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy track link:", error);
    }
  };

  const handleLikeToggle = async () => {
    if (!trackId || isLikePending) return;
    const mutationVersion = ++likeMutationVersionRef.current;
    const wasLiked = isLiked;
    const nextIsLiked = !wasLiked;
    const nextLikesCount = Math.max(0, likesCount + (wasLiked ? -1 : 1));
    setIsLikePending(true);
    setIsLiked(nextIsLiked);
    setLikesCount(nextLikesCount);
    notifyTrackLikeChanged({
      trackId,
      isLiked: nextIsLiked,
      likesCount: nextLikesCount,
    });
    try {
      if (wasLiked) {
        await engagementService.unlikeTrack(trackId);
      } else {
        await engagementService.likeTrack(trackId);
      }
    } catch {
      if (likeMutationVersionRef.current === mutationVersion) {
        setIsLiked(wasLiked);
        setLikesCount(likesCount);
        notifyTrackLikeChanged({
          trackId,
          isLiked: wasLiked,
          likesCount,
        });
      }
    } finally {
      if (likeMutationVersionRef.current === mutationVersion) {
        setIsLikePending(false);
      }
    }
  };

  const handleRepostToggle = async () => {
    if (!trackId || repostDisabled || isRepostPending) return;
    const mutationVersion = ++likeMutationVersionRef.current;
    const wasReposted = isReposted;
    setIsRepostPending(true);
    setIsReposted(!wasReposted);
    setRepostsCount((prev) => Math.max(0, prev + (wasReposted ? -1 : 1)));
    try {
      if (wasReposted) {
        await engagementService.unrepostTrack(trackId);
      } else {
        await engagementService.repostTrack(trackId);
      }
      onToggleRepost?.();
    } catch {
      if (likeMutationVersionRef.current === mutationVersion) {
        setIsReposted(wasReposted);
        setRepostsCount((prev) => Math.max(0, prev + (wasReposted ? 1 : -1)));
      }
    } finally {
      if (likeMutationVersionRef.current === mutationVersion) {
        setIsRepostPending(false);
      }
    }
  };

  async function handleDownload() {
    if (!hasOfflineListening || !me?.id || downloading || !trackId) return;

    if (downloaded) {
      setShowAlreadyDownloaded(true);
      return;
    }

    setDownloading(true);
    try {
      const streamData = await playbackService.requestStreamUrl(trackId);
      const audioRes = await fetch(streamData.stream.url);
      const blob = await audioRes.blob();
      const artworkBlob = coverUrl
        ? await fetch(coverUrl)
            .then((res) => (res.ok ? res.blob() : null))
            .catch(() => null)
        : null;

      const estimate = await navigator.storage.estimate();
      const free = (estimate.quota ?? 0) - (estimate.usage ?? 0);
      const requiredBytes = blob.size + (artworkBlob?.size ?? 0);
      if (free < requiredBytes) {
        alert("Not enough storage space to download this track.");
        return;
      }

      await navigator.storage.persist().catch(() => {});
      await saveDownload(
        me.id,
        trackId,
        { id: trackId, title, artist: artistName, coverUrl },
        blob,
        artworkBlob,
      );
      setDownloaded(true);
      setShowAlreadyDownloaded(false);
      setShowDownloadSuccessToast(true);
      if (downloadToastTimerRef.current) clearTimeout(downloadToastTimerRef.current);
      downloadToastTimerRef.current = setTimeout(() => {
        setShowDownloadSuccessToast(false);
      }, 3500);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download. Please try again.");
    } finally {
      setDownloading(false);
      setMenuOpen(false);
    }
  }

  const GAP = 1;
  const effectiveSeed = waveformSeed || randomSeed;
  const generatorIndex = Math.floor(effectiveSeed) % waveGenerators.length;
  const menuRef = useRef<HTMLDivElement>(null);

  const bars = useMemo((): number[] => {
    return waveGenerators[generatorIndex](effectiveSeed);
  }, [generatorIndex, effectiveSeed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateBarCount = () => {
      const width = window.innerWidth;
      if (width < 420) {
        setBarCount(72);
      } else if (width < 640) {
        setBarCount(96);
      } else if (width < 900) {
        setBarCount(120);
      } else {
        setBarCount(null);
      }
    };

    updateBarCount();
    window.addEventListener("resize", updateBarCount);
    return () => window.removeEventListener("resize", updateBarCount);
  }, []);

  const visibleBars = useMemo(() => {
    if (!barCount || barCount >= bars.length) return bars;
    const step = bars.length / barCount;
    return Array.from(
      { length: barCount },
      (_, i) => bars[Math.floor(i * step)],
    );
  }, [bars, barCount]);

  const displayProgress = isThisTrack ? playerProgress : progress;
  const cardPrimaryLink = entityLinkTo || (trackId ? `/tracks/${trackId}` : "");
  const isCollectionCard = contextTag === "Album" || contextTag === "Playlist";
  const mobileCoverSizeClass = smallCoverOnMobile
    ? "h-[72px] w-[72px]"
    : "h-[88px] w-[88px]";

  const buildShareUrl = () => {
    if (typeof window === "undefined") return "";
    if (!cardPrimaryLink) return window.location.href;
    if (/^https?:\/\//i.test(cardPrimaryLink)) return cardPrimaryLink;
    const normalized = cardPrimaryLink.startsWith("/")
      ? cardPrimaryLink
      : `/${cardPrimaryLink}`;
    return `${window.location.origin}${normalized}`;
  };

  const handleShareClick = () => {
    const nextShareUrl = buildShareUrl();
    if (!nextShareUrl) return;
    setShareUrl(nextShareUrl);
    setShowShareOverlay(true);
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));

    if (!isThisTrack) {
      setCurrentTrack({
        id: trackId,
        title,
        artist: artistName,
        thumbnailUrl: coverUrl || undefined,
        duration: 0,
        offlineSrc,
      });
      setIsPlaying(true);
    }

    requestSeek(trackId, pct);
  };

  const handleAddToNextUp = () => {
    if (!trackId) return;

    if (onAddToNextUp) {
      onAddToNextUp();
      return;
    }

    addTrack(
      {
        trackId,
        title,
        artist: artistName,
        durationSeconds: 0,
      },
      currentTrackId ? currentIndex + 1 : 0,
    );
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  return (
    <div className="bg-[#0b0b0b] rounded-sm flex flex-col gap-0 overflow-visible w-full min-w-0 font-sans sm:flex-row">
      {cardPrimaryLink ? (
        <Link
          to={cardPrimaryLink}
          className={`shrink-0 bg-[#111] relative block h-[170px] w-full sm:h-[130px] sm:w-[130px] ${mobileCoverSizeClass}`}
          aria-label={`Open ${title || "track"}`}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={trackFallback}
              alt={title || "track"}
              className="w-full h-full object-cover"
            />
          )}
        </Link>
      ) : (
        <div
          className={`shrink-0 bg-[#111] relative h-[170px] w-full sm:h-[130px] sm:w-[130px] ${mobileCoverSizeClass}`}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={trackFallback}
              alt={title || "track"}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col px-2 pb-2 pt-2 sm:px-4 sm:pb-3 sm:pt-0">
        <div className="mb-1 flex flex-wrap items-start gap-1.5 sm:flex-nowrap sm:gap-3">
          <button
            onClick={handlePlayToggle}
            disabled={!trackId}
            className="h-6 w-6 shrink-0 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed sm:h-9 sm:w-9"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="black">
                <rect x="1" y="1" width="4" height="12" />
                <rect x="9" y="1" width="4" height="12" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="black">
                <polygon points="2,0 14,7 2,14" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            {artistLinkTo ? (
              <Link
                to={artistLinkTo}
                state={artistRouteState}
                className="mb-0.5 block truncate text-[8px] text-[hsl(0,0%,50%)] transition-colors hover:text-[hsl(0,0%,35%)] sm:text-[11px]"
              >
                {artistName}
              </Link>
            ) : (
              <div className="mb-0.5 truncate text-[8px] text-[hsl(0,0%,50%)] transition-colors hover:text-[hsl(0,0%,35%)] sm:text-[11px]">
                {artistName}
              </div>
            )}
            {cardPrimaryLink ? (
              <Link
                to={cardPrimaryLink}
                className="block line-clamp-2 text-[10px] font-medium leading-snug text-white hover:underline sm:text-[13px]"
              >
                {title}
              </Link>
            ) : (
              <p className="line-clamp-2 text-[10px] font-medium leading-snug text-white sm:text-[13px]">
                {title}
              </p>
            )}
          </div>

          <div className="flex w-full items-center gap-1 pl-7 sm:w-auto sm:shrink-0 sm:gap-2 sm:pl-0">
            <span className="whitespace-nowrap text-[8px] text-[hsl(0,0%,40%)] sm:text-[11px]">
              {timeAgo}
            </span>
            {!isCollectionCard ? (
              <span className="whitespace-nowrap rounded-sm border border-[hsl(0,0%,20%)] bg-[hsl(0,0%,12%)] px-1 py-0.5 text-[7px] text-[hsl(0,0%,55%)] sm:px-2 sm:text-[10px]">
                {contextTag ?? `# ${genre}`}
              </span>
            ) : null}
          </div>
        </div>

        <div
          className="relative mb-1 mt-0.5 flex h-[28px] w-full cursor-pointer items-center sm:h-[52px]"
          style={{ gap: `${GAP}px` }}
          onClick={handleWaveformClick}
          onMouseEnter={() => setIsWaveHovered(true)}
          onMouseLeave={() => setIsWaveHovered(false)}
        >
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
          {visibleBars.map((height, i) => {
            const pos = i / (visibleBars.length - 1);
            const played = pos <= displayProgress;
            const showPlayedProgress = isThisTrack && played;
            const inactiveColor = isWaveHovered ? "#d8d8d8" : "#c8c8c8";
            const lowerNoise =
              (Math.sin(effectiveSeed * 0.017 + i * 1.913) + 1) / 2;
            const topHeight = 6 + height * 26;
            const bottomHeight = 2 + height * (3 + lowerNoise * 5);
            const barColor = showPlayedProgress ? "#ff5500" : inactiveColor;
            return (
              <div
                key={i}
                className="relative flex-1"
                style={{
                  minWidth: "1px",
                  height: "100%",
                }}
              >
                <div
                  className="absolute bottom-1/2 left-0 w-full rounded-[1px] transition-colors duration-150"
                  style={{
                    height: `${topHeight}px`,
                    backgroundColor: barColor,
                    opacity: showPlayedProgress ? 1 : isWaveHovered ? 1 : 0.94,
                    borderRadius: "1px",
                  }}
                />
                <div
                  className="absolute left-0 top-1/2 w-full rounded-[1px] transition-colors duration-150"
                  style={{
                    height: `${bottomHeight}px`,
                    backgroundColor: barColor,
                    opacity: showPlayedProgress
                      ? 0.78
                      : isWaveHovered
                        ? 0.78
                        : 0.66,
                    borderRadius: "1px",
                  }}
                />
              </div>
            );
          })}
        </div>
        {isCollectionCard && playlistTracks.length > 0 ? (
          <div className="mb-2 mt-2 space-y-2">
            {playlistTracks.map((collectionTrack) => (
              <div key={collectionTrack.id} className="flex items-center gap-2 py-0.5 text-sm text-zinc-300">
                <button
                  type="button"
                  onClick={() => handleSubtrackPlayToggle(collectionTrack)}
                  onMouseEnter={() => setHoveredSubtrackId(collectionTrack.id)}
                  onMouseLeave={() =>
                    setHoveredSubtrackId((current) =>
                      current === collectionTrack.id ? null : current,
                    )
                  }
                  className="group relative h-7 w-7 shrink-0 overflow-hidden rounded-[2px]"
                  aria-label={
                    currentTrack?.id === collectionTrack.id && isPlaying
                      ? "Pause track"
                      : "Play track"
                  }
                >
                  <img
                    src={collectionTrack.avatarUrl || trackFallback}
                    alt={collectionTrack.title}
                    className="h-7 w-7 object-cover"
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/55 transition-opacity ${
                      (currentTrack?.id === collectionTrack.id && isPlaying) ||
                      hoveredSubtrackId === collectionTrack.id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                      {currentTrack?.id === collectionTrack.id && isPlaying ? (
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor">
                          <rect x="1" y="1" width="4" height="12" />
                          <rect x="9" y="1" width="4" height="12" />
                        </svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor">
                          <polygon points="2,0 14,7 2,14" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
                <span className="text-zinc-400">{collectionTrack.number} ·</span>
                <span className="truncate">
                  <span
                    className={
                      profileTrackTextStyle === "titleWhiteArtistGray"
                        ? "font-semibold text-zinc-400"
                        : "font-semibold text-white"
                    }
                  >
                    {collectionTrack.artist}
                  </span>
                  {" · "}
                  <span
                    className={
                      profileTrackTextStyle === "titleWhiteArtistGray"
                        ? "text-white"
                        : ""
                    }
                  >
                    {collectionTrack.title}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-1 flex flex-wrap items-center justify-between gap-1.5 sm:mt-2 sm:gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 sm:flex-none tracking-tight sm:gap-2">
            <button
              type="button"
              onClick={handleLikeToggle}
              disabled={isLikePending}
              className={`flex h-7 shrink-0 items-center gap-1.5 rounded-[4px] bg-[#2f3033] ${isCollectionCard ? "w-7 justify-center px-0" : "px-2"} text-[11px] font-semibold transition-colors hover:bg-[#3a3b3f] disabled:opacity-60 sm:h-8 sm:text-[13px] ${
                isLiked ? "text-[#ff5500]" : "text-zinc-100"
              }`}
              aria-label={`Like (${likesCount})`}
            >
              <Heart
                size={16}
                fill={isLiked ? "#ff5500" : "none"}
                style={{ color: isLiked ? "#ff5500" : "currentColor" }}
              />
              {!isCollectionCard ? <span>{likesCount}</span> : null}
            </button>
            {!isCollectionCard ? (
              <button
                type="button"
                onClick={handleRepostToggle}
                disabled={repostDisabled}
                aria-disabled={repostDisabled || isRepostPending}
                data-pending={isRepostPending}
                aria-label={isReposted ? "Undo repost" : "Repost"}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-[4px] bg-[#2f3033] px-3 text-[13px] font-semibold transition-colors hover:bg-[#3a3b3f] disabled:cursor-not-allowed ${
                  isReposted ? "text-[#ff5500]" : "text-zinc-100"
                }`}
              >
                <Repeat2
                  size={16}
                  style={{ color: isReposted ? "#ff5500" : "currentColor" }}
                />
                <span>{repostsCount}</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleShareClick}
              aria-label="Share"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f] sm:h-8 sm:w-8"
            >
              <Share2 size={16} />
            </button>
            <button
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f]"
              onClick={handleCopyLink}
              aria-label="Copy track link"
              type="button"
            >
              <Copy size={16} />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-[#2f3033] text-zinc-100 transition-colors hover:bg-[#3a3b3f] sm:h-8 sm:w-8"
                aria-label="More options"
              >
                <MoreHorizontal size={16} />
              </button>

              {menuOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 min-w-[180px] overflow-visible rounded-md border border-[hsl(0,0%,18%)] bg-[#0b0b0b] py-0.5 shadow-2xl">
                  <button
                    onClick={() => {
                      handleAddToNextUp();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <ListMusic size={14} className="text-zinc-300" />
                    Add to Next up
                  </button>

                  <button
                    onClick={() => {
                      onAddToPlaylist?.();
                      setShowPlaylistOverlay(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <ListPlus size={14} className="text-zinc-300" />
                    Add to Playlist
                  </button>

                  <button
                    onClick={() => {
                      onStation?.();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold text-white hover:text-zinc-500"
                  >
                    <Radio size={14} className="text-zinc-300" />
                    Station
                  </button>

                  <div className="my-0.5 border-t border-[hsl(0,0%,15%)]" />

                  <div
                    className="relative"
                    onMouseEnter={() => {
                      if (!hasOfflineListening) setShowDownloadTooltip(true);
                    }}
                    onMouseLeave={() => setShowDownloadTooltip(false)}
                  >
                    <button
                      onClick={handleDownload}
                      disabled={!hasOfflineListening || downloading}
                      className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] font-semibold transition-colors ${
                        !hasOfflineListening
                          ? "opacity-40 cursor-not-allowed text-zinc-400"
                          : downloaded
                            ? "text-green-400 cursor-default"
                            : "text-white hover:text-zinc-400"
                      }`}
                    >
                      {downloading ? (
                        <Loader2
                          size={14}
                          className="animate-spin text-zinc-400"
                        />
                      ) : downloaded ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Download
                          size={14}
                          className={
                            hasOfflineListening
                              ? "text-zinc-300"
                              : "text-zinc-500"
                          }
                        />
                      )}
                      {downloading
                        ? "Downloading…"
                        : downloaded
                          ? "Downloaded"
                          : "Download"}
                    </button>

                    {showAlreadyDownloaded && downloaded && (
                      <div className="px-2.5 pb-1.5 text-[11px] text-zinc-300">
                        This song is already downloaded, Check{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            navigate("/me/downloads");
                          }}
                          className="text-[#2f7fdc] underline"
                        >
                          Downloads
                        </button>
                        .
                      </div>
                    )}

                    {showDownloadTooltip && !hasOfflineListening && (
                      <div
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-md text-[11px] text-white whitespace-nowrap z-50 pointer-events-none"
                        style={{
                          background: "#1a1a1a",
                          border: "1px solid hsl(0,0%,22%)",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                        }}
                      >
                        Upgrade to Artist Pro to download songs
                        <div
                          className="absolute right-full top-1/2 -translate-y-1/2"
                          style={{
                            width: 0,
                            height: 0,
                            borderTop: "5px solid transparent",
                            borderBottom: "5px solid transparent",
                            borderRight: "5px solid #1a1a1a",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto hidden shrink-0 items-center gap-4 text-[13px] font-medium text-[#8f8f8f] sm:flex">
            <span className="flex items-center gap-1.5">
              <svg
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="currentColor"
              >
                <polygon points="2,0 14,7 2,14" />
              </svg>
              {plays}
            </span>
            <span className="flex items-center gap-1.5">
              <SiSoundcloud size={14} /> {comments}
            </span>
          </div>
        </div>
      </div>

      <CreatePlaylistOverlay
        isOpen={showPlaylistOverlay}
        onClose={() => setShowPlaylistOverlay(false)}
        track={{ id: trackId, title, artist: artistName, coverUrl }}
        defaultCoverUrl={coverUrl}
        autoAddTrackId={trackId}
      />

      {showCopyToast ? (
        <div className="fixed right-6 top-6 z-[140]">
          <div className="flex max-w-[360px] items-center gap-3 rounded-[4px] border border-zinc-500 bg-[#2f2f2f] px-4 py-2.5 text-white shadow-xl">
            <Check className="h-5 w-5 text-emerald-400" />
            <div className="text-[13px] font-semibold leading-tight">
              Link has been copied to the clipboard!
            </div>
          </div>
        </div>
      ) : null}

      {showDownloadSuccessToast ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Dismiss download success message"
            onClick={() => setShowDownloadSuccessToast(false)}
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
          />
          <div className="relative flex max-w-[420px] items-start gap-3 rounded-xl border border-zinc-500 bg-[#2b2b2b] px-5 py-4 text-white shadow-2xl">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div className="text-sm font-semibold leading-snug">
              <div className="mb-1 text-white">Download complete.</div>
              <div className="text-zinc-300">
                Your file is saved in Downloads.
                <button
                  type="button"
                  onClick={() => {
                    setShowDownloadSuccessToast(false);
                    navigate("/me/downloads");
                  }}
                  className="ml-1 font-bold text-[#66a8ff] underline underline-offset-2"
                >
                  Open Downloads
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
     
        {showShareOverlay && (
  <ShareOverlay
    onClose={() => setShowShareOverlay(false)}
    shareUrl={shareUrl}
    track={{
      id: trackId,
      title,
      artist: artistName,
      coverUrl: coverUrl || undefined,
      type: "TRACK_UPLOAD",
    }}
  />
)}
    </div>
  );
}
