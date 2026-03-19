import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { engagementService } from '../services/engagementService';
import { useEngagement } from '../hooks/useEngagement';
import type { Track } from "../../../shared/types/Track";

import {
  Heart, Repeat2, Play, Share2,
  Copy, ListPlus, MoreHorizontal
} from 'lucide-react';

const TrackPage = () => {
  const { artist, songName } = useParams<{ artist: string; songName: string }>();
  const trackId = `${artist}/${songName}`;
  const [track, setTrack] = useState<Track | null>(null);
  const [trackLoading, setTrackLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    counts,
    isLiked,
    isReposted,
    loading: engagementLoading,
    toggleLike,
    toggleRepost,
  } = useEngagement(trackId ?? '');

  useEffect(() => {
    const fetchTrack = async () => {
      if (!trackId) return;
      try {
        const data = await engagementService.getTrackDetails(trackId);
        setTrack(data);
      } catch {
        setError('Failed to load track');
      } finally {
        setTrackLoading(false);
      }
    };
    fetchTrack();
  }, [trackId]);

  if (trackLoading) return <div className="p-8 text-white">Loading...</div>;
  if (error || !track) return <div className="p-8 text-red-500">{error || 'Track not found'}</div>;

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-5xl mx-auto">

        <div className="flex bg-zinc-900">

          
          <div className="flex-1 p-6 space-y-4">

           
            <div className="flex items-center gap-4">
              <button className="w-14 h-14 shrink-0 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition">
                <Play className="w-6 h-6 fill-black" />
              </button>
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest">{track.artist}</p>
                <h1 className="text-xl font-bold leading-tight">{track.title}</h1>
              </div>
              <span className="ml-auto text-xs text-zinc-500">
                {new Date(track.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </span>
            </div>

            
            <div className="relative h-24 bg-zinc-800 rounded overflow-hidden">
              <div className="absolute inset-0 flex items-end gap-px px-1">
                {Array.from({ length: 120 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-zinc-500 rounded-sm opacity-70"
                    style={{ height: `${20 + Math.random() * 80}%` }}
                  />
                ))}
              </div>
            </div>

           
            <div className="flex items-center gap-6 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                {(track.plays ?? 0).toLocaleString()}
              </span>
              <Link
                to={`/${artist}/${songName}/likes`}
                className="flex items-center gap-1 hover:text-white transition"
              >
                <Heart className="w-3 h-3" />
                {engagementLoading ? '...' : counts.likes.toLocaleString()}
              </Link>
              <Link
                to={`/${artist}/${songName}/reposts`}
                className="flex items-center gap-1 hover:text-white transition"
              >
                <Repeat2 className="w-3 h-3" />
                {engagementLoading ? '...' : counts.reposts.toLocaleString()}
              </Link>
            </div>
            <div className="flex items-center gap-2">

              
              <button
                onClick={toggleLike}
                disabled={engagementLoading}
                className={`w-10 h-10 rounded flex items-center justify-center transition ${
                  isLiked
                    ? 'bg-zinc-700 text-orange-500'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-orange-500' : ''}`} />
              </button>

              
              <button
                onClick={toggleRepost}
                disabled={engagementLoading}
                className={`w-10 h-10 rounded flex items-center justify-center transition ${
                  isReposted
                    ? 'bg-zinc-700 text-orange-500'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                <Repeat2 className={`w-4 h-4 ${isReposted ? 'text-orange-500' : ''}`} />
              </button>

              <button className="w-10 h-10 rounded bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition">
                <Share2 className="w-4 h-4" />
              </button>

              <button className="w-10 h-10 rounded bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition">
                <Copy className="w-4 h-4" />
              </button>

              <button className="w-10 h-10 rounded bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition">
                <ListPlus className="w-4 h-4" />
              </button>

              <button className="w-10 h-10 rounded bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-48 h-48 shrink-0 self-start mt-6 mr-6">
            <img
              src={track.thumbnailUrl}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <CommentsSection trackId={trackId} commentCount={counts.comments} />
      </div>
    </div>
  );
};


interface Comment {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  body: string;
  timestamp: number;
  createdAt: string;
  likes: number;
}

const mockComments: Comment[] = [
  { id: 'c1', userId: 'u1', username: 'Jad Saadeh',     avatarUrl: '', body: 'It hits different when',            timestamp: 32, createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),          likes: 0 },
  { id: 'c2', userId: 'u2', username: 'Hagar El Soudi', avatarUrl: '', body: '💗',                                timestamp: 88, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(), likes: 1 },
  { id: 'c3', userId: 'u3', username: 'Hagar El Soudi', avatarUrl: '', body: 'انا حالي ميسرش عدو ولا حبيب',     timestamp: 2,  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(), likes: 1 },
  { id: 'c4', userId: 'u4', username: 'dr hala',        avatarUrl: '', body: 'ولو نسياني ميضرش',                timestamp: 26, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), likes: 0 },
];

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.floor(hrs / 24)} days ago`;
};

const formatTimestamp = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const makeAvatar = (text: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#374151"/><text x="50%" y="50%" font-size="14" fill="#F9FAFB" text-anchor="middle" dominant-baseline="central">${text}</text></svg>`
  )}`;

const CommentsSection = ({ trackId: _trackId, commentCount }: { trackId: string; commentCount: number }) => {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');

  const handlePost = () => {
    if (!newComment.trim()) return;
    const c: Comment = {
      id: `c${Date.now()}`,
      userId: 'user1',
      username: 'You',
      avatarUrl: '',
      body: newComment.trim(),
      timestamp: 0,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    setComments([c, ...comments]);
    setNewComment('');
  };

  return (
    <div className="border-t border-zinc-700 px-6 py-6">

      
      <div className="flex items-center gap-3 mb-6">
        <img
          src={makeAvatar('Y')}
          alt="you"
          className="w-9 h-9 rounded-full shrink-0"
        />
        <div className="flex-1 flex items-center bg-zinc-800 rounded px-3 py-2 gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePost()}
            placeholder="Write a comment"
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
          />
          <button onClick={handlePost} className="text-zinc-400 hover:text-white transition">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">
          {commentCount > 0 ? commentCount : comments.length} comments
        </h2>
        <button className="text-xs text-zinc-400 border border-zinc-600 rounded px-3 py-1 flex items-center gap-1 hover:border-zinc-400 transition">
          Sorted by: Newest
          <span className="text-zinc-500">∨</span>
        </button>
      </div>

      <div className="space-y-5">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <img
              src={c.avatarUrl || makeAvatar(c.username.slice(0, 2).toUpperCase())}
              alt={c.username}
              className="w-9 h-9 rounded-full shrink-0"
            />
            <div className="flex-1">
              <p className="text-xs text-zinc-400 mb-0.5">
                <span className="text-white font-medium">{c.username}</span>
                {' at '}
                <span className="text-orange-400">{formatTimestamp(c.timestamp)}</span>
                {' · '}
                {timeAgo(c.createdAt)}
              </p>
              <p className="text-sm text-zinc-200">{c.body}</p>
              <button className="text-xs text-zinc-500 hover:text-white mt-1 transition">Reply</button>
            </div>
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <Heart className="w-3.5 h-3.5 text-zinc-500 hover:text-white cursor-pointer transition" />
              <span className="text-xs text-zinc-500">{c.likes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackPage;