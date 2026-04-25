import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { engagementService } from '../services/engagementService';
import type { PaginatedLikes } from '../types';
import { ArrowLeft } from 'lucide-react';
import TrackTabs from '../components/TrackTabs';
import UserCard from '../components/UserCard';
import { makeCommentAvatar } from '../components/CommentsSection';

const LikesPage = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const [data, setData] = useState<PaginatedLikes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackId) return;
    engagementService
      .getTrackLikes(trackId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [trackId]);

  const likes = data?.likes ?? [];

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

        <TrackTabs trackId={trackId ?? ''} activeTab="likes" />

        {loading ? (
          <p className="text-zinc-400">Loading...</p>
        ) : likes.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No likes yet</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {likes.map((entry: any) => (   // or reposts.map
  <           UserCard
                key={entry.user.id}
                userId={entry.user.id}
                avatarUrl={
                  entry.user.avatarUrl ??
                  makeCommentAvatar((entry.user.username || 'UN').slice(0, 2).toUpperCase())
                }
                username={entry.user.username || 'Unknown'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikesPage;
