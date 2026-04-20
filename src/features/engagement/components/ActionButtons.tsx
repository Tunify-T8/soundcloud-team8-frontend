import { Heart, Repeat2, Share2, Copy, ListPlus, MoreHorizontal } from 'lucide-react';

interface Props {
  isLiked:    boolean;
  isReposted: boolean;
  isLoading:  boolean;
  onLike:     () => void;
  onRepost:   () => void;
  onShare?:   () => void;
}

const ActionButtons = ({
  isLiked, isReposted, isLoading, onLike, onRepost, onShare,
}: Props) => (
  <div className="flex items-center gap-2">

    <button
      onClick={onLike}
      disabled={isLoading}
      title="Like"
      className={`w-10 h-10 rounded flex items-center justify-center transition ${
        isLiked
          ? 'bg-zinc-700 text-orange-500'
          : 'bg-zinc-800 text-white hover:bg-zinc-700'
      }`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? 'fill-orange-500' : ''}`} />
    </button>

    <button
      onClick={onRepost}
      disabled={isLoading}
      title="Repost"
      className={`w-10 h-10 rounded flex items-center justify-center transition ${
        isReposted
          ? 'bg-zinc-700 text-orange-500'
          : 'bg-zinc-800 text-white hover:bg-zinc-700'
      }`}
    >
      <Repeat2 className={`w-4 h-4 ${isReposted ? 'text-orange-500' : ''}`} />
    </button>

    <button
      onClick={onShare}
      title="Share / Copy link"
      className="w-10 h-10 rounded bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition"
    >
      <Share2 className="w-4 h-4" />
    </button>

    <button
      onClick={() => navigator.clipboard?.writeText(window.location.href)}
      title="Copy link"
      className="w-10 h-10 rounded bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition"
    >
      <Copy className="w-4 h-4" />
    </button>

    <button
      title="Add to playlist"
      className="w-10 h-10 rounded bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition"
    >
      <ListPlus className="w-4 h-4" />
    </button>

    <button
      title="More options"
      className="w-10 h-10 rounded bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition"
    >
      <MoreHorizontal className="w-4 h-4" />
    </button>

  </div>
);

export default ActionButtons;
