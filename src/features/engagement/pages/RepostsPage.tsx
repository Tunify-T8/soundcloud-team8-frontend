import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { engagementService } from '../services/engagementService';
import type { Repost } from '../types';
import { ArrowLeft } from 'lucide-react';

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

        <div className="flex gap-6 border-b border-zinc-700 mb-8 text-sm">
          <Link
            to={`/${artist}/${songName}/likes`}
            className="pb-2 text-zinc-400 border-b-2 border-transparent hover:text-white transition"
          >
            Likes
          </Link>
          <span className="pb-2 text-white font-semibold border-b-2 border-white">
            Reposts
          </span>
          <span className="pb-2 text-zinc-400 border-b-2 border-transparent">In albums</span>
          <span className="pb-2 text-zinc-400 border-b-2 border-transparent">In playlists</span>
          <span className="pb-2 text-zinc-400 border-b-2 border-transparent">Related tracks</span>
        </div>

        {loading ? (
          <p className="text-zinc-400">Loading...</p>
        ) : reposts.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No reposts yet</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {reposts.map((repost) => (
              <div key={repost.id} className="flex flex-col items-center gap-2 text-center">
                <img
                  src={repost.user.avatarUrl}
                  alt={repost.user.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <p className="text-xs text-zinc-300 font-medium truncate w-full">
                  {repost.user.username}
                </p>
                <p className="text-xs text-zinc-500">3 followers</p>
                <button className="text-xs border border-zinc-500 rounded px-3 py-0.5 hover:border-white hover:text-white transition">
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepostsPage;