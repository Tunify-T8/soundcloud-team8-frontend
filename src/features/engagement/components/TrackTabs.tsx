// src/features/engagement/components/TrackTabs.tsx
import { Link } from 'react-router-dom';

interface Props {
  artist: string;
  songName: string;
  activeTab: 'likes' | 'reposts';
}

const TrackTabs = ({ artist, songName, activeTab }: Props) => {
  return (
    <div className="flex gap-6 border-b border-zinc-700 mb-8 text-sm">
      <Link
        to={`/${artist}/${songName}/likes`}
        className={`pb-2 capitalize transition border-b-2 ${
          activeTab === 'likes'
            ? 'border-white text-white font-semibold'
            : 'border-transparent text-zinc-400 hover:text-white'
        }`}
      >
        likes
      </Link>
      <Link
        to={`/${artist}/${songName}/reposts`}
        className={`pb-2 capitalize transition border-b-2 ${
          activeTab === 'reposts'
            ? 'border-white text-white font-semibold'
            : 'border-transparent text-zinc-400 hover:text-white'
        }`}
      >
        reposts
      </Link>
      <span className="pb-2 text-zinc-400 border-b-2 border-transparent">In albums</span>
      <span className="pb-2 text-zinc-400 border-b-2 border-transparent">In playlists</span>
      <span className="pb-2 text-zinc-400 border-b-2 border-transparent">Related tracks</span>
    </div>
  );
};

export default TrackTabs;