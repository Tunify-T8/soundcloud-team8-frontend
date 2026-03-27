import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { engagementService } from '../services/engagementService';
import type { Repost } from '../types';
import { ArrowLeft } from 'lucide-react';
import TrackTabs from '../components/TrackTabs';
import UserCard from '../components/UserCard';

const RepostsPage = () => {
  const { artist, songName } = useParams<{ artist: string; songName: string }>();
  const trackId = `${artist}/${songName}`;
  const [reposts, setReposts] = useState<Repost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackId) return;
    engagementService.getTrackReposts(trackId)
      .then(setReposts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [trackId]);

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">

        <Link
          to={`/${artist}/${songName}`}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to track
        </Link>

        <TrackTabs
          artist={artist ?? ''}
          songName={songName ?? ''}
          activeTab="reposts"
        />

        {loading ? (
          <p className="text-zinc-400">Loading...</p>
        ) : reposts.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No reposts yet</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {reposts.map((repost) => (
              <UserCard
                key={repost.id}
                avatarUrl={repost.user.avatarUrl}
                username={repost.user.username}
                followersCount={3}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepostsPage;