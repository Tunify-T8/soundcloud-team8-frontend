import { Link } from 'react-router-dom';

interface Props {
  trackId: string;
  activeTab: 'likes' | 'reposts';
}

const TrackTabs = ({ trackId, activeTab }: Props) => {
  return (
    <div className="flex gap-6 border-b border-zinc-700 mb-8 text-sm">
      <Link
        to={`/tracks/${trackId}/likes`}
        className={`pb-2 capitalize transition border-b-2 ${
          activeTab === 'likes'
            ? 'border-white text-white font-semibold'
            : 'border-transparent text-zinc-400 hover:text-white'
        }`}
      >
        likes
      </Link>
      <Link
        to={`/tracks/${trackId}/reposts`}
        className={`pb-2 capitalize transition border-b-2 ${
          activeTab === 'reposts'
            ? 'border-white text-white font-semibold'
            : 'border-transparent text-zinc-400 hover:text-white'
        }`}
      >
        reposts
      </Link>

    </div>
  );
};

export default TrackTabs;
