import { Copy, Edit3, Heart, Repeat2, Share, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { playlistService } from "../../../../libraryService";
import type { Collection } from "../../../../types";

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
  const [isLiked, setIsLiked] = useState(playlist.isLiked);
  const [likesCount, setLikesCount] = useState(playlist.likeCount ?? 0);
  const [repostsCount, setRepostsCount] = useState(playlist.repostsCount ?? 0);

  useEffect(() => {
    setLikesCount(playlist.likeCount ?? 0);
    setRepostsCount(playlist.repostsCount ?? 0);
    setIsLiked(playlist.isLiked);
  }, [playlist.id, playlist.likeCount, playlist.repostsCount, playlist.isLiked]);

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

  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button className={buttonClass} title="Share">
          <Share size={15} strokeWidth={2} />
        </button>
        <button className={buttonClass} title="Copy Link">
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
  );
};

export default ActionBar;
