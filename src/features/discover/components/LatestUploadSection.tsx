import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpToLine,
  ArrowRightLeft,
  Check,
  ChevronRight,
  Copy,
  Heart,
  ListMusic,
  ListPlus,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Pin,
  Play,
  Radio,
  Repeat2,
  Trash2,
  Upload,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import trackFallback from "@/assets/track.jpg";
import CreatePlaylistOverlay from "@/features/library/tabs/playlists/components/CreatePlaylistOverlay";
import TrackDeleteConfirmModal from "@/features/track-management/components/TrackDeleteConfirmModal";
import EditTrackDrawer from "@/features/track-management/components/EditTrackDrawer";
import { useQueue } from "@/hooks/useQueue";
import type { Track } from "@/shared/types/Track";

interface LatestUploadSectionProps {
  track: Track;
  artistName: string;
  onTrackUpdated: (updatedTrack: Track) => void;
  onTrackDeleted: (trackId: string) => void;
}

function formatStat(value: number | null | undefined) {
  return value ?? 0;
}

function ActionButton({
  onClick,
  ariaLabel,
  tooltip,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  tooltip: string;
  children: ReactNode;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#f5f5f5] text-[#111] transition-all hover:-translate-y-0.5 hover:bg-white"
      >
        {children}
      </button>

      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#2f2f2f] px-2.5 py-1.5 text-[12px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {tooltip}
        <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1 rotate-45 bg-[#2f2f2f]" />
      </div>
    </div>
  );
}

export function LatestUploadSection({
  track,
  artistName,
  onTrackUpdated,
  onTrackDeleted,
}: LatestUploadSectionProps) {
  const navigate = useNavigate();
  const { addTrack, currentIndex, currentTrackId } = useQueue();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPlaylistOverlay, setShowPlaylistOverlay] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const trackPagePath = useMemo(() => `/tracks/${track.id}`, [track.id]);
  const plansUrl = useMemo(() => `${window.location.origin}/plans`, []);
  const availablePlansUrl = useMemo(
    () => `${window.location.origin}/plans#available-plans`,
    [],
  );

  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!showCopyToast) return;

    const timeout = window.setTimeout(() => {
      setShowCopyToast(false);
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [showCopyToast]);

  const addToNextUp = () => {
    addTrack(
      {
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        durationSeconds: track.duration ?? 0,
      },
      currentTrackId ? currentIndex + 1 : 0,
    );
  };

  const copyTextToClipboard = async (value: string) => {
    if (navigator.clipboard?.writeText) {
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
    const shareUrl = `${window.location.origin}${trackPagePath}`;
    try {
      await copyTextToClipboard(shareUrl);
      setShowCopyToast(true);
    } catch (error) {
      console.error("Failed to copy track link:", error);
    } finally {
      setMenuOpen(false);
    }
  };

  const handleEditTrack = () => {
    setEditingTrack(track);
    setMenuOpen(false);
  };

  const handleDeleteTrack = () => {
    setShowDeleteModal(true);
    setMenuOpen(false);
  };

  const openPlansInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <section className="mb-12">
        <h2 className="mb-6 text-[28px] font-bold tracking-tight text-white">
          Your Latest Upload
        </h2>

        <div className="rounded-[2px] bg-[#9ba7af] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-5">
            <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-5 sm:flex-row">
              <Link
                to={trackPagePath}
                className="block h-[160px] w-full max-w-[160px] shrink-0 overflow-hidden rounded-[4px] border border-black/10 bg-[#a7b1b8] sm:h-[176px] sm:max-w-[176px]"
              >
                <img
                  src={track.thumbnailUrl || trackFallback}
                  alt={track.title}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  to="/me"
                  className="w-fit text-[14px] font-medium text-white/95 transition-opacity hover:opacity-75"
                >
                  {artistName}
                </Link>

                <Link
                  to={trackPagePath}
                  className="mt-1 block max-w-[520px] truncate text-[18px] font-bold tracking-tight text-white transition-opacity hover:opacity-75 sm:text-[20px]"
                >
                  {track.title}
                </Link>

                <Link
                  to="/me/insights/overview"
                  className="group/metrics mt-4 flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex flex-wrap items-center gap-5 text-[13px] font-semibold text-white transition-opacity duration-150 group-hover/metrics:opacity-65">
                    <span className="flex items-center gap-1.5">
                      <Play className="h-3.5 w-3.5 fill-white text-white" />
                      {formatStat(track.plays)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 fill-white text-white" />
                      {formatStat(track.likes)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Repeat2 className="h-3.5 w-3.5 text-white" />
                      {formatStat(track.reposts)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-white" />
                      {formatStat(track.comments)}
                    </span>
                  </div>
                  <span className="inline-flex w-fit items-center gap-1 self-start text-[14px] font-bold text-white transition-opacity duration-150 group-hover/metrics:opacity-65 lg:self-auto">
                    Advanced Insights
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>

                <div className="relative z-20 mt-5 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-4">
                    <ActionButton
                      ariaLabel="Copy track link"
                      tooltip="Share"
                      onClick={() => {
                        void handleCopyLink();
                      }}
                    >
                      <Upload className="h-4 w-4" />
                    </ActionButton>

                    <ActionButton
                      ariaLabel="Pin to profile"
                      tooltip="Pin to Profile"
                      onClick={() => navigate("/me")}
                    >
                      <Pin className="h-4 w-4" />
                    </ActionButton>

                    <ActionButton
                      ariaLabel="Replace file"
                      tooltip="Replace File"
                      onClick={() => openPlansInNewTab(plansUrl)}
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </ActionButton>

                    <ActionButton
                      ariaLabel="Distribute"
                      tooltip="Distribute"
                      onClick={() => openPlansInNewTab(availablePlansUrl)}
                    >
                      <ArrowUpToLine className="h-4 w-4" />
                    </ActionButton>
                  </div>

                  <div className="relative z-30" ref={menuRef}>
                    <ActionButton
                      ariaLabel="More track actions"
                      tooltip="More"
                      onClick={() => setMenuOpen((prev) => !prev)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </ActionButton>

                    {menuOpen ? (
                      <div className="absolute left-0 top-full z-40 mt-3 min-w-[190px] overflow-hidden rounded-[4px] border border-white/10 bg-[#111] py-2 shadow-2xl">
                        <button
                          type="button"
                          onClick={() => {
                            void handleCopyLink();
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-semibold text-white transition-colors hover:bg-white/5"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            addToNextUp();
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-semibold text-white transition-colors hover:bg-white/5"
                        >
                          <ListMusic className="h-4 w-4" />
                          Add to Next up
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPlaylistOverlay(true);
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-semibold text-white transition-colors hover:bg-white/5"
                        >
                          <ListPlus className="h-4 w-4" />
                          Add to Playlist
                        </button>
                        <button
                          type="button"
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-semibold text-white transition-colors hover:bg-white/5"
                        >
                          <Radio className="h-4 w-4" />
                          Station
                        </button>
                        <button
                          type="button"
                          onClick={handleEditTrack}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-semibold text-white transition-colors hover:bg-white/5"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Track
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteTrack}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-semibold text-white transition-colors hover:bg-white/5"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Track
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Link
            to="/artists"
            className="inline-flex w-fit rounded-[4px] bg-[#2c2c2c] px-4 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#363636]"
          >
            See all your tracks
          </Link>
        </div>
      </section>

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

      <CreatePlaylistOverlay
        isOpen={showPlaylistOverlay}
        onClose={() => setShowPlaylistOverlay(false)}
        track={{
          id: track.id,
          title: track.title,
          artist: track.artist,
          coverUrl: track.thumbnailUrl || "",
        }}
        defaultCoverUrl={track.thumbnailUrl || ""}
        autoAddTrackId={track.id}
      />

      {editingTrack ? (
        <EditTrackDrawer
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
          onUpdate={(updatedTrack) => {
            onTrackUpdated(updatedTrack);
            setEditingTrack(updatedTrack);
          }}
        />
      ) : null}

      {showDeleteModal ? (
        <TrackDeleteConfirmModal
          track={track}
          onCancel={() => setShowDeleteModal(false)}
          onDeleted={(trackId) => {
            setShowDeleteModal(false);
            onTrackDeleted(trackId);
          }}
        />
      ) : null}
    </>
  );
}

export default LatestUploadSection;
