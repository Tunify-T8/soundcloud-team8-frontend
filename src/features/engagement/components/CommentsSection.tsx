import { useState, useEffect } from 'react';
import { Heart, Send, Trash2 } from 'lucide-react';
import { engagementService } from '../services/engagementService';
import type { ApiComment, ApiReply } from '../types';
import { AdminIDDisplay } from '@/features/admin/components/AdminIDDisplay';
import {
  HIDDEN_COMMENTS_UPDATED_EVENT,
  getHiddenCommentIds,
  isCommentHidden,
} from '@/features/admin/utils/hiddenComments';

export interface CommentsSectionProps {
  trackId: string;
  commentCount: number;
  currentTime?: number;
  currentUserId?: string;
  onCommentsChange?: (comments: ApiComment[]) => void;
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

const CommentsSection = ({
  trackId,
  currentTime = 0,
  currentUserId = '',
  onCommentsChange,
}: CommentsSectionProps) => {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputBody, setInputBody] = useState('');
  const [posting, setPosting] = useState(false);

  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [postingReply, setPostingReply] = useState(false);

  const [repliesMap, setRepliesMap] = useState<Record<string, ApiReply[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [hiddenCommentIds, setHiddenCommentIds] = useState<Set<string>>(() => getHiddenCommentIds());

  useEffect(() => {
    const syncHiddenCommentIds = () => setHiddenCommentIds(getHiddenCommentIds());

    window.addEventListener(HIDDEN_COMMENTS_UPDATED_EVENT, syncHiddenCommentIds);
    window.addEventListener('storage', syncHiddenCommentIds);

    return () => {
      window.removeEventListener(HIDDEN_COMMENTS_UPDATED_EVENT, syncHiddenCommentIds);
      window.removeEventListener('storage', syncHiddenCommentIds);
    };
  }, []);

  useEffect(() => {
    if (!trackId) return;
    setLoading(true);
    engagementService
      .getTrackComments(trackId)
      .then((data) => {
        setComments(data.comments);
        const initialLiked = new Set(
          data.comments.filter((c) => c.isLiked).map((c) => c.commentId)
        );
        setLikedCommentIds(initialLiked);
        onCommentsChange?.(data.comments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [trackId, onCommentsChange]);

  const handlePost = async () => {
    if (!inputBody.trim()) return;
    setPosting(true);
    try {
      await engagementService.postComment(trackId, inputBody.trim(), currentTime);
      const data = await engagementService.getTrackComments(trackId);
      setComments(data.comments);
      onCommentsChange?.(data.comments);
      setInputBody('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await engagementService.deleteComment(commentId);
      setComments((prev) => {
        const next = prev.filter((c) => c.commentId !== commentId);
        onCommentsChange?.(next);
        return next;
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const isLiked = likedCommentIds.has(commentId);
    try {
      if (isLiked) {
        await engagementService.unlikeComment(commentId);
        setLikedCommentIds((prev) => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
        setComments((prev) =>
          prev.map((c) =>
            c.commentId === commentId
              ? { ...c, likesCount: Math.max(0, c.likesCount - 1) }
              : c
          )
        );
      } else {
        await engagementService.likeComment(commentId);
        setLikedCommentIds((prev) => new Set(prev).add(commentId));
        setComments((prev) =>
          prev.map((c) =>
            c.commentId === commentId
              ? { ...c, likesCount: c.likesCount + 1 }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    }
  };

  const handleToggleReplies = async (commentId: string) => {
    const isOpen = showReplies.has(commentId);
    if (isOpen) {
      setShowReplies((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
      return;
    }

    setShowReplies((prev) => new Set(prev).add(commentId));

    if (!repliesMap[commentId]) {
      setLoadingReplies((prev) => new Set(prev).add(commentId));
      try {
        const data = await engagementService.getReplies(commentId);
        setRepliesMap((prev) => ({ ...prev, [commentId]: data.replies }));
      } catch (error) {
        console.error('Failed to load replies:', error);
      } finally {
        setLoadingReplies((prev) => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
      }
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyBody.trim()) return;
    setPostingReply(true);
    try {
      await engagementService.postReply(commentId, replyBody.trim());
      const data = await engagementService.getReplies(commentId);
      setRepliesMap((prev) => ({ ...prev, [commentId]: data.replies }));
      setComments((prev) =>
        prev.map((c) =>
          c.commentId === commentId
            ? { ...c, repliesCount: c.repliesCount + 1 }
            : c
        )
      );
      setReplyBody('');
      setReplyingTo(null);
      setShowReplies((prev) => new Set(prev).add(commentId));
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setPostingReply(false);
    }
  };

  const visibleComments = comments.filter(
    (comment) => !hiddenCommentIds.has(comment.commentId) && !isCommentHidden(comment.commentId)
  );

  if (loading) {
    return <div className="p-6 text-zinc-500 text-sm">Loading comments…</div>;
  }

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-6">
        <input
          value={inputBody}
          onChange={(e) => setInputBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
          placeholder="Write a comment"
          disabled={posting}
          className="flex-1 bg-zinc-800 px-3 py-2 text-white rounded outline-none focus:ring-1 focus:ring-orange-500"
        />
        <button
          onClick={handlePost}
          disabled={posting || !inputBody.trim()}
          className="w-10 h-10 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded transition disabled:opacity-40"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>

      {visibleComments.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-8">No comments yet. Be the first!</p>
      )}

      {visibleComments.map((c) => {
        const isLiked = likedCommentIds.has(c.commentId);
        const isOpen = showReplies.has(c.commentId);
        const isLoadingReplies = loadingReplies.has(c.commentId);
        const replies = repliesMap[c.commentId] ?? [];
        const isOwner = (c.user.userId ?? (c.user as any).id) === currentUserId;
        const initials = c.user.username.slice(0, 2).toUpperCase();
        const avatarUrl = c.user.avatarUrl ?? makeCommentAvatar(initials);

        return (
          <div key={c.commentId} className="mb-6">
            <div className="flex justify-between items-start gap-3">
              <div className="flex gap-3">
                <img
                  src={avatarUrl}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  alt={c.user.username}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{c.user.username}</p>
                    <span className="text-zinc-600 text-[10px]">{timeAgo(c.createdAt)}</span>
                    <AdminIDDisplay id={c.commentId} label="Comment ID" variant="icon" />
                  </div>
                  <p className="text-zinc-300 text-sm mt-0.5">{c.text}</p>

                  <div className="flex gap-3 text-xs text-zinc-500 mt-1.5">
                    <button
                      onClick={() =>
                        setReplyingTo(replyingTo === c.commentId ? null : c.commentId)
                      }
                      className="hover:text-white transition"
                    >
                      Reply
                    </button>

                    {c.repliesCount > 0 && (
                      <button
                        onClick={() => handleToggleReplies(c.commentId)}
                        className="hover:text-white transition"
                      >
                        {isOpen
                          ? 'Hide replies'
                          : `View replies (${c.repliesCount})`}
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
                  disabled={postingReply}
                  className="flex-1 bg-zinc-800 px-2 py-1 text-white text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={() => handleReply(c.commentId)}
                  disabled={postingReply || !replyBody.trim()}
                  className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded transition disabled:opacity-40"
                >
                  <Send className="w-3 h-3 text-white" />
                </button>
              </div>
            )}

            {isOpen && (
              <div className="ml-10 mt-3 space-y-3">
                {isLoadingReplies ? (
                  <p className="text-zinc-500 text-xs">Loading replies…</p>
                ) : (
                  replies.map((r) => {
                    const rInitials = r.user.username.slice(0, 2).toUpperCase();
                    const rAvatar = r.user.avatarUrl ?? makeCommentAvatar(rInitials, 28);
                    const isReplyOwner = (r.user.userId ?? (r.user as any).id) === currentUserId;
                    return (
                      <div key={r.replyId} className="flex gap-2 justify-between items-start">
                        <div className="flex gap-2">
                          <img
                            src={rAvatar}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                            alt={r.user.username}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white text-xs font-medium">{r.user.username}</p>
                              <AdminIDDisplay id={r.replyId} label="Reply ID" variant="icon" />
                            </div>
                            <p className="text-zinc-300 text-xs">{r.text}</p>
                          </div>
                        </div>
                        {isReplyOwner && (
                          <button
                            onClick={async () => {
                              try {
                                await engagementService.deleteComment(r.replyId);
                                setRepliesMap((prev) => {
                                  const updatedReplies = (prev[c.commentId] ?? []).filter(
                                    (reply) => reply.replyId !== r.replyId,
                                  );
                                  return {
                                    ...prev,
                                    [c.commentId]: updatedReplies,
                                  };
                                });
                                setComments((prev) =>
                                  prev.map((comment) =>
                                    comment.commentId === c.commentId
                                      ? {
                                          ...comment,
                                          repliesCount: Math.max(0, comment.repliesCount - 1),
                                        }
                                      : comment,
                                  ),
                                );
                                setShowReplies((prev) => {
                                  const next = new Set(prev);
                                  if ((replies.length - 1) <= 0) {
                                    next.delete(c.commentId);
                                  }
                                  return next;
                                });
                              } catch {}
                            }}
                            className="hover:text-red-400 transition flex items-center gap-1 text-zinc-500 text-[10px] shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CommentsSection;