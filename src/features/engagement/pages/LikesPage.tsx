import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { engagementService } from '../services/engagementService';
import type { Like } from '../types';
import { ArrowLeft } from 'lucide-react';

const LikesPage = () => {
  const { artist, songName } = useParams<{ artist: string; songName: string }>();
  const trackId = `${artist}/${songName}`;
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'likes' | 'reposts'>('likes');

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
        
        <div className="flex gap-6 border-b border-zinc-700 mb-8 text-sm">
          {(['likes', 'reposts'] as const).map((tab) => (
            <Link
              key={tab}
              to={tab === 'reposts' ? `/${artist}/${songName}/reposts` : `/${artist}/${songName}/likes`}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 capitalize transition border-b-2 ${
                activeTab === tab
                  ? 'border-white text-white font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </Link>
          ))}
          <span className="pb-2 text-zinc-400 border-b-2 border-transparent">In albums</span>
          <span className="pb-2 text-zinc-400 border-b-2 border-transparent">In playlists</span>
          <span className="pb-2 text-zinc-400 border-b-2 border-transparent">Related tracks</span>
        </div>

        {loading ? (
          <p className="text-zinc-400">Loading...</p>
        ) : likes.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No likes yet</p>
        ) : (

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {likes.map((like) => (
              <div key={like.id} className="flex flex-col items-center gap-2 text-center">
                <img
                  src={like.user.avatarUrl}
                  alt={like.user.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <p className="text-xs text-zinc-300 font-medium truncate w-full">
                  {like.user.username}
                </p>
                <p className="text-xs text-zinc-500">2 followers</p>
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

export default LikesPage;