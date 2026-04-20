import { useState } from 'react';
import { Heart, Send, Trash2 } from 'lucide-react';

export interface CommentsSectionProps {
  trackId: string;
  commentCount: number;
  currentTime?: number;
  currentUserId?: string;
}

export const makeCommentAvatar = (text: string, size = 38): string =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${size / 2}" fill="#222"/>
      <text x="50%" y="50%" font-size="${Math.round(size * 0.36)}" fill="#ccc"
        text-anchor="middle" dominant-baseline="central"
        font-family="sans-serif" font-weight="600">${text}</text>
    </svg>`
  )}`;

export const formatTimestamp = (secs: number): string => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const timeAgo = (dateStr: string): string => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
};

interface MockReply {
  replyId: string;
  username: string;
  avatarUrl: string;
  text: string;
}

interface MockComment {
  commentId: string;
  user: {
    userId: string;
    username: string;
    avatarUrl: string;
  };
  text: string;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  replies: MockReply[];
}

const MOCK_COMMENTS: MockComment[] = [
  {
    commentId: 'c1',
    user: { userId: 'u1', username: 'Sasa Nour', avatarUrl: makeCommentAvatar('SN') },
    text: 'ولو نسياني 🔥 this track is everything',
    likesCount: 12,
    repliesCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    replies: [
      { replyId: 'r1', username: 'Jad S', avatarUrl: makeCommentAvatar('JS', 28), text: 'totally agree!' },
      { replyId: 'r2', username: 'Nour M', avatarUrl: makeCommentAvatar('NM', 28), text: '💯💯' },
    ],
  },
  {
    commentId: 'c2',
    user: { userId: 'u2', username: 'Omar Khaled', avatarUrl: makeCommentAvatar('OK') },
    text: 'hits different at 3am',
    likesCount: 8,
    repliesCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    replies: [
      { replyId: 'r3', username: 'Hagar S', avatarUrl: makeCommentAvatar('HS', 28), text: 'facts 😭' },
    ],
  },
  {
    commentId: 'c3',
    user: { userId: 'u3', username: 'Lena Ali', avatarUrl: makeCommentAvatar('LA') },
    text: 'the production on this is insane, love every second',
    likesCount: 5,
    repliesCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    replies: [],
  },
  {
    commentId: 'c4',
    user: { userId: 'u4', username: 'محمد اشرف', avatarUrl: makeCommentAvatar('MA') },
    text: 'انا حالي على الريبيت من امبارح 🎵',
    likesCount: 20,
    repliesCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    replies: [],
  },
  {
    commentId: 'c5',
    user: { userId: 'user1', username: 'You', avatarUrl: makeCommentAvatar('YO') },
    text: 'My previously posted comment — I can delete this one',
    likesCount: 0,
    repliesCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    replies: [],
  },
];

const CommentsSection = ({
  trackId: _trackId,
  currentUserId = 'user1',
}: CommentsSectionProps) => {
  const [comments, setComments] = useState<MockComment[]>(MOCK_COMMENTS);
  const [inputBody, setInputBody] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());

  const handlePost = () => {
    if (!inputBody.trim()) return;
    const newComment: MockComment = {
      commentId: `c_${Date.now()}`,
      user: { userId: currentUserId, username: 'You', avatarUrl: makeCommentAvatar('YO') },
      text: inputBody.trim(),
      likesCount: 0,
      repliesCount: 0,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setComments((prev) => [newComment, ...prev]);
    setInputBody('');
  };

  const handleDelete = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.commentId !== commentId));
  };

  const handleLikeComment = (commentId: string) => {
    const isLiked = likedCommentIds.has(commentId);
    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      isLiked ? next.delete(commentId) : next.add(commentId);
      return next;
    });
    setComments((prev) =>
      prev.map((c) =>
        c.commentId === commentId
          ? { ...c, likesCount: c.likesCount + (isLiked ? -1 : 1) }
          : c
      )
    );
  };

  const handleToggleReplies = (commentId: string) => {
    setShowReplies((prev) => {
      const next = new Set(prev);
      next.has(commentId) ? next.delete(commentId) : next.add(commentId);
      return next;
    });
  };

  const handleReply = (commentId: string) => {
    if (!replyBody.trim()) return;
    const newReply: MockReply = {
      replyId: `r_${Date.now()}`,
      username: 'You',
      avatarUrl: makeCommentAvatar('YO', 28),
      text: replyBody.trim(),
    };
    setComments((prev) =>
      prev.map((c) =>
        c.commentId === commentId
          ? { ...c, replies: [...c.replies, newReply], repliesCount: c.repliesCount + 1 }
          : c
      )
    );
    setReplyBody('');
    setReplyingTo(null);
    setShowReplies((prev) => new Set(prev).add(commentId));
  };

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-6">
        <input
          value={inputBody}
          onChange={(e) => setInputBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
          placeholder="Write a comment"
          className="flex-1 bg-zinc-800 px-3 py-2 text-white rounded outline-none focus:ring-1 focus:ring-orange-500"
        />
        <button
          onClick={handlePost}
          disabled={!inputBody.trim()}
          className="w-10 h-10 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded transition disabled:opacity-40"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>

      {comments.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-8">No comments yet. Be the first!</p>
      )}

      {comments.map((c) => {
        const isLiked = likedCommentIds.has(c.commentId);
        const isOpen = showReplies.has(c.commentId);
        const isOwner = c.user.userId === currentUserId;

        return (
          <div key={c.commentId} className="mb-6">
            <div className="flex justify-between items-start gap-3">
              <div className="flex gap-3">
                <img
                  src={c.user.avatarUrl}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  alt={c.user.username}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{c.user.username}</p>
                    <span className="text-zinc-600 text-[10px]">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-zinc-300 text-sm mt-0.5">{c.text}</p>

                  <div className="flex gap-3 text-xs text-zinc-500 mt-1.5">
                    <button
                      onClick={() => setReplyingTo(replyingTo === c.commentId ? null : c.commentId)}
                      className="hover:text-white transition"
                    >
                      Reply
                    </button>

                    {c.repliesCount > 0 && (
                      <button
                        onClick={() => handleToggleReplies(c.commentId)}
                        className="hover:text-white transition"
                      >
                        {isOpen ? 'Hide replies' : `View replies (${c.repliesCount})`}
                      </button>
                    )}

                    {isOwner && (
                      <button
                        onClick={() => handleDelete(c.commentId)}
                        className="hover:text-red-400 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLikeComment(c.commentId)}
                className="flex flex-col items-center gap-0.5 shrink-0"
              >
                <Heart
                  className={`w-4 h-4 transition ${
                    isLiked
                      ? 'text-orange-400 fill-orange-400'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                />
                {c.likesCount > 0 && (
                  <span className="text-[10px] text-zinc-500">{c.likesCount}</span>
                )}
              </button>
            </div>

            {replyingTo === c.commentId && (
              <div className="ml-10 mt-2 flex gap-2">
                <input
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply(c.commentId)}
                  placeholder="Write a reply"
                  className="flex-1 bg-zinc-800 px-2 py-1 text-white text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={() => handleReply(c.commentId)}
                  disabled={!replyBody.trim()}
                  className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded transition disabled:opacity-40"
                >
                  <Send className="w-3 h-3 text-white" />
                </button>
              </div>
            )}

            {isOpen && (
              <div className="ml-10 mt-3 space-y-3">
                {c.replies.map((r) => (
                  <div key={r.replyId} className="flex gap-2">
                    <img
                      src={r.avatarUrl}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                      alt={r.username}
                    />
                    <div>
                      <p className="text-white text-xs font-medium">{r.username}</p>
                      <p className="text-zinc-300 text-xs">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CommentsSection;
