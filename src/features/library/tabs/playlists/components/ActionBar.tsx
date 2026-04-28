import { Copy, Edit3, Heart, Repeat2, Share, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { playlistService } from "../../../libraryService";
import type { Collection } from "../../../types";

function ShareOverlay({
  onClose,
  shareUrl,
  isPrivate,
  playlistId,
}: {
  onClose: () => void;
  shareUrl: string;
  isPrivate: boolean;
  playlistId: string;
}) {
  const [activeTab, setActiveTab] = useState<"share" | "embed" | "message">(
    "share",
  );
  const [shortenLink, setShortenLink] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);
  const [embedCode, setEmbedCode] = useState("");
  const [embedLoading, setEmbedLoading] = useState(false);

  const selectAllLink = () => {
    linkRef.current?.focus();
    linkRef.current?.select();
  };

  useEffect(() => {
    if (activeTab !== "embed" || embedCode || embedLoading) return;

    setEmbedLoading(true);
    void playlistService
      .getEmbedCode(playlistId)
      .then((code) => {
        setEmbedCode(code ?? "");
      })
      .finally(() => {
        setEmbedLoading(false);
      });
  }, [activeTab, embedCode, embedLoading, playlistId]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-white/40 px-4 pt-28"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] rounded-[3px] border border-zinc-800 bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-7 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("share")}
            className={`pb-2 text-[20px] font-bold tracking-tight sm:text-[22px] ${
              activeTab === "share"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Share
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("embed")}
            className={`pb-2 text-[20px] font-bold tracking-tight sm:text-[22px] ${
              activeTab === "embed"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Embed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("message")}
            className={`pb-2 text-[20px] font-bold tracking-tight sm:text-[22px] ${
              activeTab === "message"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Message
          </button>
        </div>

        {activeTab === "share" ? (
          <>
            {isPrivate && (
              <div className="mb-3 text-[15px] font-bold leading-tight text-white">
                Private Share
              </div>
            )}
            <div className="mb-3 rounded-[3px] bg-[#242424] px-4 py-3">
              <input
                ref={linkRef}
                readOnly
                value={shareUrl}
                onClick={selectAllLink}
                onFocus={selectAllLink}
                className="w-full bg-transparent text-[14px] font-semibold text-zinc-100 outline-none sm:text-[15px]"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-[14px] font-semibold text-zinc-100 sm:text-[15px]">
              <input
                type="checkbox"
                checked={shortenLink}
                onChange={(e) => setShortenLink(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-500 bg-transparent"
              />
              Shorten link
            </label>
          </>
        ) : activeTab === "embed" ? (
          <div className="mb-3 rounded-[3px] bg-[#242424] px-4 py-3">
            <textarea
              readOnly
              value={embedLoading ? "Loading embed code..." : embedCode}
              className="min-h-[96px] w-full resize-none bg-transparent text-[14px] font-semibold text-zinc-100 outline-none sm:text-[15px]"
            />
          </div>
        ) : (
          <div className="py-6 text-[24px] text-zinc-400">
            Messaging share is coming soon.
          </div>
        )}
      </div>
    </div>
  );
}

interface ActionBarProps {
  playlist: Collection;
  canDelete?: boolean;
  onEdit?: () => void;
  onDeleted?: () => void;
}

const buttonClass =
  "flex h-8 w-9 items-center justify-center rounded-[4px] bg-[#2b2d31] text-zinc-200 transition-colors hover:bg-[#3a3d42] hover:text-white";

const ActionBar: React.FC<ActionBarProps> = ({
  playlist,
  canDelete = false,
  onEdit,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isLiked, setIsLiked] = useState(playlist.isLiked);
  const [likesCount, setLikesCount] = useState(playlist.likeCount ?? 0);
  const [repostsCount, setRepostsCount] = useState(playlist.repostsCount ?? 0);

  useEffect(() => {
    setLikesCount(playlist.likeCount ?? 0);
    setRepostsCount(playlist.repostsCount ?? 0);
    setIsLiked(playlist.isLiked);
  }, [
    playlist.id,
    playlist.likeCount,
    playlist.repostsCount,
    playlist.isLiked,
  ]);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    const ok = await playlistService.deletePlaylist(playlist.id);
    setIsDeleting(false);

    if (ok) {
      onDeleted?.();
    }
  };

  const handleLikeToggle = async () => {
    if (isLiking) return;

    setIsLiking(true);
    const ok = isLiked
      ? await playlistService.unlikePlaylist(playlist.id)
      : await playlistService.likePlaylist(playlist.id);
    setIsLiking(false);

    if (ok) {
      setIsLiked((prev) => {
        const next = !prev;
        setLikesCount((count) => (next ? count + 1 : Math.max(0, count - 1)));
        return next;
      });
    }
  };

  const fetchShareUrl = async (): Promise<string | null> => {
    if (isSharing) return null;
    setIsSharing(true);
    const isPrivatePlaylist = playlist.privacy?.toLowerCase?.() === "private";
    let shareUrl: string | null = null;

    if (isPrivatePlaylist) {
      shareUrl = await playlistService.resetPrivatePlaylistShareUrl(playlist.id);
      if (!shareUrl) {
        shareUrl = await playlistService.getPlaylistShareUrl(playlist.id);
      }
    } else {
      shareUrl = await playlistService.getPlaylistShareUrl(playlist.id);
    }

    setIsSharing(false);
    return shareUrl;
  };

  const showCopiedMessage = () => {
    setShowCopyToast(true);
    window.setTimeout(() => {
      setShowCopyToast(false);
    }, 2200);
  };

  const handleCopyLink = async () => {
    const shareUrl = await fetchShareUrl();
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    showCopiedMessage();
  };

  const handleShare = async () => {
    const shareUrl = await fetchShareUrl();
    if (!shareUrl) return;
    setShareUrl(shareUrl);
    setShowShareOverlay(true);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            className={`${buttonClass} ${isSharing ? "cursor-not-allowed opacity-60" : ""}`}
            title="Share"
            onClick={() => void handleShare()}
            disabled={isSharing}
          >
            <Share size={15} strokeWidth={2} />
          </button>
          <button
            className={`${buttonClass} ${isSharing ? "cursor-not-allowed opacity-60" : ""}`}
            title="Copy Link"
            onClick={() => void handleCopyLink()}
            disabled={isSharing}
          >
            <Copy size={15} strokeWidth={2} />
          </button>
          {canDelete && (
            <button className={buttonClass} title="Edit" onClick={onEdit}>
              <Edit3 size={15} strokeWidth={2} />
            </button>
          )}
          <button
            className={`${buttonClass} ${isLiking ? "cursor-not-allowed opacity-60" : ""}`}
            title={isLiked ? "Unlike" : "Like"}
            onClick={() => void handleLikeToggle()}
            disabled={isLiking}
          >
            <Heart
              size={15}
              strokeWidth={1.8}
              fill={isLiked ? "currentColor" : "none"}
              className={isLiked ? "text-white" : ""}
            />
          </button>
          <button className={buttonClass} title="Repost">
            <Repeat2 size={15} strokeWidth={2} />
          </button>

          {canDelete && (
            <button
              className={`${buttonClass} ${isDeleting ? "cursor-not-allowed opacity-60" : ""}`}
              title="Delete Playlist"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              <Trash2 size={15} strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-[13px] text-zinc-300">
          <div className="flex items-center gap-1">
            <Heart size={12} fill="currentColor" className="text-zinc-300" />
            <span>{likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Repeat2 size={12} className="text-zinc-300" />
            <span>{repostsCount}</span>
          </div>
        </div>
      </div>

      {showCopyToast && (
        <div className="fixed right-6 top-6 z-[140]">
          <div className="flex items-center gap-4 rounded-[4px] border border-zinc-500 bg-[#2f2f2f] px-5 py-4 text-white shadow-xl">
            <div className="text-emerald-400 text-xl">✓</div>
            <div className="text-[16px] font-semibold leading-tight">
              Link has been copied to the clipboard!
            </div>
          </div>
        </div>
      )}

      {showShareOverlay && (
        <ShareOverlay
          onClose={() => setShowShareOverlay(false)}
          shareUrl={shareUrl}
          isPrivate={playlist.privacy?.toLowerCase?.() === "private"}
          playlistId={playlist.id}
        />
      )}
    </>
  );
};

export default ActionBar;
