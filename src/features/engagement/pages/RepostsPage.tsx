import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { engagementService } from '../services/engagementService';
import type { PaginatedReposts } from '../types';
import { ArrowLeft } from 'lucide-react';
import TrackTabs from '../components/TrackTabs';
import UserCard from '../components/UserCard';
import { makeCommentAvatar } from '../components/CommentsSection';

const normalizeUser = (entry: unknown) => {
  const item = (entry ?? {}) as Record<string, unknown>;
  const nestedUser =
    typeof item.user === 'object' && item.user !== null
      ? (item.user as Record<string, unknown>)
      : null;

  const userId =
    (typeof item.userId === 'string' ? item.userId : null) ??
    (nestedUser && typeof nestedUser.userId === 'string' ? nestedUser.userId : null) ??
    (nestedUser && typeof nestedUser.id === 'string' ? nestedUser.id : null) ??
    '';

  const username =
    (typeof item.username === 'string' ? item.username : null) ??
    (nestedUser && typeof nestedUser.username === 'string' ? nestedUser.username : null) ??
    '';

  const avatarUrl =
    (typeof item.avatarUrl === 'string' ? item.avatarUrl : null) ??
    (nestedUser && typeof nestedUser.avatarUrl === 'string' ? nestedUser.avatarUrl : null) ??
    null;

  return { userId, username, avatarUrl };
};

const RepostsPage = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const [data, setData] = useState<PaginatedReposts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackId) return;
    engagementService
      .getTrackReposts(trackId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [trackId]);

  const reposts = data?.reposts ?? [];

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          to={`/tracks/${trackId}`}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to track
        </Link>

        <TrackTabs trackId={trackId ?? ''} activeTab="reposts" />

        {loading ? (
          <p className="text-zinc-400">Loading...</p>
        ) : reposts.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No reposts yet</p>
        ) : (
          <div className="mt-8 flex flex-wrap gap-6">
            {reposts.map((entry: unknown, index: number) => {
              const user = normalizeUser(entry);
              const userId = user.userId;
              const username = user.username || user.userId || 'user';
              const cardKey = user.userId || `${username}-${index}`;

              return (
                <UserCard
                  key={cardKey}
                  userId={userId}
                  avatarUrl={
                    user.avatarUrl ??
                    makeCommentAvatar((username || 'UN').slice(0, 2).toUpperCase())
                  }
                  username={username}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepostsPage;