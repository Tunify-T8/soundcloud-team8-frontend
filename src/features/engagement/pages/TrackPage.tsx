import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play, Pause, Heart, Repeat2,
  Users, Flag, Info,
} from 'lucide-react';

import { engagementService }   from '../services/engagementService';
import { useEngagement }       from '../hooks/useEngagement';
import type { Track }          from '../types/Track';
import ActionButtons           from '../components/ActionButtons';
import CommentsSection         from '../components/CommentsSection';
import { makeCommentAvatar, formatTimestamp } from '../components/CommentsSection';
import { usePlayer }           from '@/features/playerUI/context/usePlayer';

interface WaveformComment {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  body: string;
  timestamp: number;
}

const makeOwnerAvatar = (text: string, size = 80): string =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" rx="${size / 2}" fill="#333"/>` +
    `<text x="50%" y="50%" font-size="${Math.round(size * 0.35)}" fill="#eee" ` +
    `text-anchor="middle" dominant-baseline="central" font-family="sans-serif" ` +
    `font-weight="700">${text}</text></svg>`
  )}`;

const MOCK_FANS = [
  { rank: 1, username: 'momen',         plays: 291, avatarUrl: makeCommentAvatar('MO') },
  { rank: 2, username: 'Mostafa Sheta', plays: 170, avatarUrl: makeCommentAvatar('MS') },
  { rank: 3, username: 'Dalia',         plays: 159, avatarUrl: makeCommentAvatar('DA') },
  { rank: 4, username: 'User 19494150', plays: 121, avatarUrl: makeCommentAvatar('U4') },
  { rank: 5, username: 'محمد اشرف',    plays: 111, avatarUrl: makeCommentAvatar('MA') },
];

const WAVEFORM_COMMENTS: WaveformComment[] = [
  { id: 'wc1', userId: 'u1', username: 'Sasa',  avatarUrl: makeCommentAvatar('SN', 28), body: 'ولو نسياني',    timestamp: 18  },
  { id: 'wc2', userId: 'u2', username: 'Jad',   avatarUrl: makeCommentAvatar('JS', 28), body: 'hits different', timestamp: 32  },
  { id: 'wc3', userId: 'u3', username: 'Nour',  avatarUrl: makeCommentAvatar('NO', 28), body: 'love this',      timestamp: 55  },
  { id: 'wc4', userId: 'u4', username: 'Omar',  avatarUrl: makeCommentAvatar('OM', 28), body: '🎵',             timestamp: 72  },
  { id: 'wc5', userId: 'u5', username: 'Hagar', avatarUrl: makeCommentAvatar('HS', 28), body: '💗',             timestamp: 88  },
  { id: 'wc6', userId: 'u6', username: 'Lena',  avatarUrl: makeCommentAvatar('LE', 28), body: 'wow',            timestamp: 110 },
  { id: 'wc7', userId: 'u7', username: 'Mai',   avatarUrl: makeCommentAvatar('MA', 28), body: 'repeat',         timestamp: 130 },
  { id: 'wc8', userId: 'u8', username: 'Fatma', avatarUrl: makeCommentAvatar('FA', 28), body: 'انا حالي',      timestamp: 148 },
  { id: 'wc9', userId: 'u9', username: 'Ali',   avatarUrl: makeCommentAvatar('AL', 28), body: 'great',          timestamp: 162 },
];

interface WaveformProps {
  duration:    number;
  currentTime: number;
  onSeek:      (t: number) => void;
  comments:    WaveformComment[];
}

const WAVEFORM_HEIGHTS = Array.from({ length: 140 }, (_, i) =>
  18 + Math.abs(Math.sin(i * 0.38) * 50 + Math.sin(i * 0.11) * 28)
);


const Waveform = ({ duration, currentTime, onSeek, comments }: WaveformProps) => {
  const ref      = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? currentTime / duration : 0;

  

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || duration === 0) return;
    const rect  = ref.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div className="w-full">
      <div
        ref={ref}
        onClick={handleClick}
        className="relative h-[88px] flex items-end gap-px px-1 cursor-pointer select-none"
        style={{ background: 'transparent' }}
      >
        {WAVEFORM_HEIGHTS.map((h, i) => {
          const ratio  = i / WAVEFORM_HEIGHTS.length;
          const played = ratio < progress;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height:          `${h}%`,
                backgroundColor: played ? '#f97316' : '#52525b',
                opacity:         played ? 1 : 0.8,
                transition:      'background-color 0.1s',
              }}
            />
          );
        })}

        {duration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-px bg-white/50 pointer-events-none"
            style={{ left: `${progress * 100}%` }}
          >
            <span
              className="absolute -top-6 -translate-x-1/2 text-[10px] text-white
                         bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded
                         font-mono whitespace-nowrap"
            >
              {formatTimestamp(currentTime)}
            </span>
          </div>
        )}
      </div>

      <div className="relative h-8 w-full mt-0.5">
        {comments.map(c => {
          const left = duration > 0 ? (c.timestamp / duration) * 100 : 0;
          return (
            <div
              key={c.id}
              className="absolute -translate-x-1/2 group/tip"
              style={{ left: `${left}%` }}
            >
              <img
                src={c.avatarUrl}
                alt={c.username}
                className="w-7 h-7 rounded-full ring-1 ring-zinc-600 object-cover
                           group-hover/tip:ring-orange-400 group-hover/tip:scale-110
                           cursor-pointer transition-all duration-150"
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
                              bg-zinc-800 border border-zinc-700 text-white text-[10px]
                              rounded px-2 py-1 whitespace-nowrap pointer-events-none
                              opacity-0 group-hover/tip:opacity-100 transition-opacity z-10">
                <span className="font-medium">{c.username}</span>
                <span className="text-zinc-400 mx-1">at</span>
                <span className="text-orange-400 font-mono">{formatTimestamp(c.timestamp)}</span>
                <div className="text-zinc-300 mt-0.5">{c.body}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-0.5 px-1">
        <span>0:00</span>
        <span>{formatTimestamp(duration)}</span>
      </div>
    </div>
  );
};

interface ShareModalProps { title: string; onClose: () => void }

const ShareModal = ({ title, onClose }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const link = window.location.href;

  const copy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md
                   mx-4 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-white font-semibold text-sm">Share "{title}"</h3>

        <div>
          <p className="text-xs text-zinc-500 mb-1.5">Link</p>
          <div className="flex gap-2">
            <input
              readOnly value={link}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2
                         text-xs text-zinc-300 outline-none"
            />
            <button
              onClick={copy}
              className={`px-4 py-2 rounded text-xs font-medium transition ${
                copied ? 'bg-green-600 text-white' : 'bg-zinc-700 text-white hover:bg-zinc-600'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-zinc-500 mb-1.5">Embed</p>
          <textarea
            readOnly rows={3}
            value={`<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(link)}"></iframe>`}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2
                       text-xs text-zinc-300 outline-none resize-none font-mono"
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded bg-zinc-800 text-zinc-400 hover:text-white text-sm transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const TrackPage = () => {
  const { trackId } = useParams<{ trackId: string }>();

  const [track, setTrack]             = useState<Track | null>(null);
  const [trackLoading, setLoading]    = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [showShare, setShowShare]     = useState(false);
  const [fansTab, setFansTab]         = useState<'top' | 'first'>('top');
  const {
    currentTrack,
    isPlaying,
    progress: playerProgress,
    setCurrentTrack,
    setIsPlaying,
    requestSeek,
  } = usePlayer();

  const {
    counts, isLiked, isReposted,
    loading: engLoading, toggleLike, toggleRepost,
  } = useEngagement(trackId ?? '');

  useEffect(() => {
    if (!trackId) return;
    engagementService.getTrackDetails(trackId)
      .then(setTrack)
      .catch(() => setError('Failed to load track'))
      .finally(() => setLoading(false));
  }, [trackId]);

  if (trackLoading) return <div className="p-8 text-white">Loading…</div>;
  if (error || !track) return <div className="p-8 text-red-400">{error ?? 'Track not found'}</div>;

  const artistName =
    track.artist ??
    (track as any).artistName ??
    (track as any).owner?.displayName ??
    (track as any).owner?.username ??
    'Unknown Artist';
  const duration   = (track as any).duration ?? 184;
  const artworkSrc = (track as any).artworkUrl ?? (track as any).thumbnailUrl ?? '';
  const ownerInit  = artistName.slice(0, 2).toUpperCase();
  const currentUserId = localStorage.getItem('userId') ?? '';
  const isThisTrack = currentTrack?.id === track.id;
  const currentTime = isThisTrack ? playerProgress * duration : 0;
  const pageIsPlaying = isThisTrack && isPlaying;

  const ensureCurrentTrack = () => {
    if (isThisTrack) return;

    setCurrentTrack({
      id: track.id,
      title: track.title,
      artist: artistName,
      thumbnailUrl: artworkSrc || undefined,
      artworkUrl: artworkSrc || undefined,
      duration,
    });
  };

  const handlePlayPause = () => {
    ensureCurrentTrack();

    if (isThisTrack) {
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(true);
    }
  };

  const handleSeek = (t: number) => {
    if (!track.id || duration <= 0) return;

    ensureCurrentTrack();
    requestSeek(track.id, t / duration);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {showShare && (
        <ShareModal title={track.title} onClose={() => setShowShare(false)} />
      )}

      <div className="max-w-6xl mx-auto">
        <div className="bg-zinc-800 flex">

          <div className="flex-1 px-6 pt-5 pb-3 space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="w-11 h-11 shrink-0 rounded-full bg-orange-500 hover:bg-orange-400
                           flex items-center justify-center transition-colors shadow-md"
              >
                {pageIsPlaying
                  ? <Pause className="w-5 h-5 fill-white text-white" />
                  : <Play  className="w-5 h-5 fill-white text-white ml-0.5" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-zinc-400 uppercase tracking-widest truncate">
                  {artistName}
                </p>
                <h1 className="text-base font-bold leading-tight truncate">{track.title}</h1>
              </div>
              <span className="text-[11px] text-zinc-500 shrink-0">
                {new Date((track as any).date ?? (track as any).createdAt ?? '')
                  .toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </span>
            </div>

            <Waveform
              duration={duration}
              currentTime={currentTime}
              onSeek={handleSeek}
              comments={WAVEFORM_COMMENTS}
            />
          </div>

          <div className="w-[184px] h-[184px] shrink-0 self-start mt-0">
            {artworkSrc
              ? <img src={artworkSrc} alt={track.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                  <span className="text-4xl font-bold text-zinc-500">{ownerInit}</span>
                </div>
            }
          </div>
        </div>

        <div className="bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-4 px-6 py-3">

            <ActionButtons
              isLiked={isLiked}
              isReposted={isReposted}
              isLoading={engLoading}
              onLike={toggleLike}
              onRepost={toggleRepost}
              onShare={() => setShowShare(true)}
            />

            <div className="flex-1" />

            <div className="flex items-center gap-5 text-xs text-zinc-400 shrink-0">
              <span className="flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-zinc-400" />
                {(counts.plays ?? (track as any).plays ?? 0).toLocaleString()}
              </span>
              <Link
                to={`/tracks/${trackId}/likes`}
                className="flex items-center gap-1.5 hover:text-white transition"
              >
                <Heart className="w-3 h-3" />
                {engLoading ? '…' : counts.likes.toLocaleString()}
              </Link>
              <Link
                to={`/tracks/${trackId}/reposts`}
                className="flex items-center gap-1.5 hover:text-white transition"
              >
                <Repeat2 className="w-3 h-3" />
                {engLoading ? '…' : counts.reposts.toLocaleString()}
              </Link>
            </div>

          </div>
        </div>

        <div className="flex">

          <aside className="w-44 shrink-0 px-5 py-6 border-r border-zinc-800 flex flex-col items-center gap-3">
            <div className="w-[88px] h-[88px] rounded-full overflow-hidden ring-2 ring-zinc-700">
              <img
                src={makeOwnerAvatar(ownerInit, 88)}
                alt={artistName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-white leading-tight">{artistName}</p>
              <p className="text-[11px] text-zinc-500 mt-1 flex items-center justify-center gap-2">
                <span className="flex items-center gap-0.5">
                  <Users className="w-2.5 h-2.5" />
                  2,160
                </span>
                <span className="text-zinc-700">·</span>
                <span>28</span>
              </p>
            </div>

            <button className="w-full py-1.5 rounded border border-zinc-600 text-xs text-white
                               hover:border-white hover:bg-white/5 transition-colors font-medium">
              Follow
            </button>

            <button className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-white transition mt-1">
              <Flag className="w-3 h-3" />
              Report
            </button>
          </aside>

          <div className="flex-1 min-w-0 border-r border-zinc-800">
            <CommentsSection
              trackId={trackId ?? ''}
              commentCount={counts.comments}
              currentTime={currentTime}
              currentUserId={currentUserId}
            />
          </div>

          <aside className="w-60 shrink-0 px-5 py-6 space-y-4">

            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Fans</h3>
              <Info className="w-3 h-3 text-zinc-600" />
            </div>

            <div className="flex gap-3 text-xs">
              <button
                onClick={() => setFansTab('top')}
                className={`font-medium transition ${
                  fansTab === 'top' ? 'text-white border-b border-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                Top
              </button>
              <button
                onClick={() => setFansTab('first')}
                className={`font-medium transition ${
                  fansTab === 'first' ? 'text-white border-b border-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                First
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 uppercase tracking-wide leading-relaxed">
              Fans who have played this track the most:
            </p>

            <div className="space-y-3">
              {MOCK_FANS.map(fan => (
                <div key={fan.rank} className="flex items-center gap-2.5">
                  <span className="text-xs text-zinc-600 w-3 shrink-0 tabular-nums">
                    {fan.rank}
                  </span>
                  <img
                    src={fan.avatarUrl}
                    alt={fan.username}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <span className="text-xs text-zinc-300 flex-1 truncate">{fan.username}</span>
                  <span className="text-[11px] text-zinc-500 font-mono shrink-0 tabular-nums">
                    {fan.plays} plays
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <img
                  src={makeCommentAvatar('?', 28)}
                  alt=""
                  className="w-7 h-7 rounded-full shrink-0"
                />
                <div>
                  <p className="text-[11px] text-white font-medium">Climb the leaderboard</p>
                  <p className="text-[10px] text-zinc-500">Complete the steps below:</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {['Avatar', 'Like', 'Follow', 'Play'].map(a => (
                  <button
                    key={a}
                    className="py-1.5 rounded border border-zinc-700 text-[10px] text-zinc-400
                               hover:border-zinc-500 hover:text-white transition col-span-1"
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

export default TrackPage;
