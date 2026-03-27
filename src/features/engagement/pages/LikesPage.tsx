import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { engagementService } from '../services/engagementService';
import type { Like } from '../types';
import { ArrowLeft } from 'lucide-react';
import TrackTabs from '../components/TrackTabs';
import UserCard from '../components/UserCard';

const LikesPage = () => {
  const { artist, songName } = useParams<{ artist: string; songName: string }>();
  const trackId = `${artist}/${songName}`;
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackId) return;
    engagementService.getTrackLikes(trackId)
      .then(setLikes)
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
          activeTab="likes"
        />

        {loading ? (
          <p className="text-zinc-400">Loading...</p>
        ) : likes.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No likes yet</p>
        ) : (

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {likes.map((like) => (
              <UserCard
                key={like.id}
                avatarUrl={like.user.avatarUrl}
                username={like.user.username}
                followersCount={2}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikesPage;