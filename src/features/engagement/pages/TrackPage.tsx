import { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, Repeat2,
  Users, Flag, Info, Music2,
  Share2, Copy, MoreHorizontal,
} from 'lucide-react';

import { engagementService }   from '../services/engagementService';
import { useEngagement }       from '../hooks/useEngagement';
import type { ApiComment }     from '../types';
import type { Track }          from '../types/Track';
import CommentsSection         from '../components/CommentsSection';
import { makeCommentAvatar, formatTimestamp } from '../components/CommentsSection';
import { usePlayer }           from '@/features/playerUI/context/usePlayer';
import { api }                 from '../../auth/services/api';
import { waveGenerators }      from '@/components/Waveforms';
import { followingService }    from '../../following/followingService';


interface WaveformComment {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  body: string;
  timestamp: number;
}

/* --------------------------------------------------------- static helpers */

const makeOwnerAvatar = (text: string, size = 80): string =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" rx="${size / 2}" fill="#111"/>` +
    `<text x="50%" y="50%" font-size="${Math.round(size * 0.35)}" fill="#eee" ` +
    `text-anchor="middle" dominant-baseline="central" font-family="sans-serif" ` +
    `font-weight="700">${text}</text></svg>`
  )}`;

const MOCK_FANS = [
  { rank: 1, username: 'momen',          plays: 291, avatarUrl: makeCommentAvatar('MO') },
  { rank: 2, username: 'Mostafa Sheta',  plays: 170, avatarUrl: makeCommentAvatar('MS') },
  { rank: 3, username: 'Dalia',          plays: 159, avatarUrl: makeCommentAvatar('DA') },
  { rank: 4, username: 'User 19494150',  plays: 121, avatarUrl: makeCommentAvatar('U4') },
  { rank: 5, username: 'Mohamed Ashraf', plays: 111, avatarUrl: makeCommentAvatar('MA') },
];


/* ---------------------------------------------------------------- Waveform */

interface WaveformProps {
  onSeek:         (ratio: number) => void;
  comments:       WaveformComment[];
  waveformSeed:   number;
  isThisTrack:    boolean;
  playerProgress: number;
  duration:       number;
}

const mapTrackCommentsToWaveform = (comments: ApiComment[]): WaveformComment[] =>
  comments.map((c) => ({
    id:        c.commentId,
    userId:    c.user?.userId ?? '',
    username:  c.user?.username ?? 'Unknown',
    avatarUrl: c.user?.avatarUrl ?? makeCommentAvatar((c.user?.username ?? 'UN').slice(0, 2).toUpperCase(), 28),
    body:      c.text,
    timestamp: typeof c.timestamp === 'number' ? c.timestamp : 0,
  }));

const Waveform = ({
  onSeek, comments, waveformSeed, isThisTrack, playerProgress, duration,
}: WaveformProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const generatorIndex = waveformSeed % waveGenerators.length;
  const bars = useMemo(
    () => waveGenerators[generatorIndex](waveformSeed),
    [generatorIndex, waveformSeed],
  );

  const displayProgress = isThisTrack ? playerProgress : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    onSeek(pct);
  };

  return (
    <div className="w-full">
      <div
        className="flex items-end h-[100px] cursor-pointer w-full"
        style={{ gap: '1px' }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {bars.map((height, i) => {
          const pos        = i / (bars.length - 1);
          const played     = pos <= displayProgress;
          const showPlayed = isThisTrack && played;
          const inactive   = isHovered ? '#f5f5f5' : '#d6d6d6';
          return (
            <div
              key={i}
              style={{
                flex:            '1 1 0',
                minWidth:        0,
                maxWidth:        '3px',
                height:          `${(0.28 + height * 0.5) * 100}%`,
                backgroundColor: showPlayed ? '#F94C00' : inactive,
                opacity:         showPlayed ? 1 : isHovered ? 1 : 0.92,
                borderRadius:    '1px',
              }}
            />
          );
        })}
      </div>

      {/* comment avatars */}
      <div className="relative h-8 w-full mt-1">
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
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
                           bg-zinc-800 border border-zinc-700 text-white text-[10px]
                           rounded px-2 py-1 whitespace-nowrap pointer-events-none
                           opacity-0 group-hover/tip:opacity-100 transition-opacity z-10"
              >
                <span className="font-medium">{c.username}</span>
                <span className="text-zinc-400 mx-1">at</span>
                <span className="text-orange-400 font-mono">{formatTimestamp(c.timestamp)}</span>
                <div className="text-zinc-300 mt-0.5">{c.body}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* time labels */}
      <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-0.5 px-0.5">
        <span>0:00</span>
        <span>{formatTimestamp(duration)}</span>
      </div>
    </div>
  );
};

/* ShareModal */

const ShareModal = ({ title, onClose }: { title: string; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const link = window.location.href;
  const copy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md mx-4 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-white font-semibold text-sm">Share &ldquo;{title}&rdquo;</h3>
        <div>
          <p className="text-xs text-zinc-500 mb-1.5">Link</p>
          <div className="flex gap-2">
            <input readOnly value={link} className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-300 outline-none" />
            <button onClick={copy} className={`px-4 py-2 rounded text-xs font-medium transition ${copied ? 'bg-green-600 text-white' : 'bg-zinc-700 text-white hover:bg-zinc-600'}`}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1.5">Embed</p>
          <textarea
            readOnly rows={3}
            value={`<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(link)}"></iframe>`}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-300 outline-none resize-none font-mono"
          />
        </div>
        <button onClick={onClose} className="w-full py-2 rounded bg-zinc-800 text-zinc-400 hover:text-white text-sm transition">Close</button>
      </div>
    </div>
  );
};

/* TrackPage */

const TrackPage = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const [waveformComments, setWaveformComments] = useState<WaveformComment[]>([]);
  const [track, setTrack]                         = useState<Track | null>(null);
  const [trackLoading, setLoading]                = useState(true);
  const [error, setError]                         = useState<string | null>(null);
  const [showShare, setShowShare]                 = useState(false);
  const [fansTab, setFansTab]                     = useState<'top' | 'first'>('top');
  const [isFollowingArtist, setIsFollowingArtist] = useState(false);
  const [artistFollowers, setArtistFollowers]     = useState(0);
  const [artistTracksCount, setArtistTracksCount] = useState(0);
  const [artistUsername, setArtistUsername]       = useState('');
  const [followLoading, setFollowLoading]         = useState(false);

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

  const trackUser = (track as any)?.user ?? null;
  const artistId = trackUser?.userId ?? (track as any)?.artistId ?? null;

  useEffect(() => {
  if (!artistId) return;
  api.get(`/users/${artistId}`)
    .then(res => {
      setIsFollowingArtist(res.data.isFollowing ?? false);
      setArtistFollowers(res.data.followersCount ?? 0);
      setArtistUsername(res.data.username ?? '');
      // If tracksCount is 0 or missing, fetch separately
      if (res.data.tracksCount) {
        setArtistTracksCount(res.data.tracksCount);
      } else {
        return api.get(`/users/${artistId}/tracks?page=1&limit=1`);
      }
    })
    .then(res => {
      if (res?.data?.total) setArtistTracksCount(res.data.total);
      else if (res?.data?.totalCount) setArtistTracksCount(res.data.totalCount);
      else if (res?.data?.tracksCount) setArtistTracksCount(res.data.tracksCount);
    })
    .catch(() => {});
}, [artistId]);

  useEffect(() => {
    if (!trackId) return;
    engagementService.getTrackComments(trackId)
      .then((data) => {
        setWaveformComments(mapTrackCommentsToWaveform(data.comments));
      })
      .catch(() => {});
  }, [trackId]);

  const handleCommentsUpdate = useCallback((comments: ApiComment[]) => {
    setWaveformComments(mapTrackCommentsToWaveform(comments));
  }, []);

  if (trackLoading) return <div className="p-8 text-white">Loading...</div>;
  if (error || !track) return <div className="p-8 text-red-400">{error ?? 'Track not found'}</div>;

  const artistName    = trackUser?.displayName ?? trackUser?.username ?? (track as any).artists?.[0]?.name ?? 'Unknown Artist';
  const duration      = (track as any).durationSeconds ?? 184;
  const artworkSrc    = (track as any).artworkUrl ?? '';
  const ownerInit     = artistName.slice(0, 2).toUpperCase();
  const artistAvatarSrc =
    trackUser?.avatarUrl ??
    (track as any)?.artistAvatarUrl ??
    (track as any)?.owner?.avatarUrl ??
    (track as any)?.artists?.[0]?.avatarUrl ??
    null;
  const artistAvatar  = artistAvatarSrc || makeOwnerAvatar(ownerInit, 88);
  const artistRouteId = artistId || artistUsername || trackUser?.username || '';
  const tracksCount   = trackUser?.tracksUploadedCount ?? 28;
  //const currentUserId = localStorage.getItem('userId') ?? '';

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('sc_access_token') ?? '';
      return token ? JSON.parse(atob(token.split('.')[1]))?.sub ?? '' : '';
    } catch { return ''; }
  })();
  const waveformSeed  = 3;

  const isThisTrack   = currentTrack != null && String(currentTrack.id) === String(trackId);
  const currentTime   = isThisTrack ? playerProgress * duration : 0;
  const pageIsPlaying = isThisTrack && isPlaying;

  const trackObj = {
    id:           trackId!,
    title:        track.title,
    artist:       artistName,
    thumbnailUrl: artworkSrc || undefined,
    artworkUrl:   artworkSrc || undefined,
    audioUrl:     (track as any).audioUrl || (track as any).src || undefined,
    duration,
  };

  const handlePlayPause = () => {
    if (!trackId) return;
    if (isThisTrack) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(trackObj);
      setIsPlaying(true);
    }
  };

  const handleSeek = (ratio: number) => {
    if (!trackId) return;
    if (!isThisTrack) {
      setCurrentTrack(trackObj);
      setIsPlaying(true);
    }
    requestSeek(trackId, ratio);
  };

  const handleFollowArtist = async () => {
    if (!artistId) return;
    setFollowLoading(true);
    const wasFollowing = isFollowingArtist;
    setIsFollowingArtist(!wasFollowing);
    setArtistFollowers(prev => wasFollowing ? Math.max(0, prev - 1) : prev + 1);
    try {
      if (wasFollowing) {
        await followingService.unfollowUser(artistId);
      } else {
        await followingService.followUser(artistId);
      }
    } catch (err: any) {
      setIsFollowingArtist(wasFollowing);
      setArtistFollowers(prev => wasFollowing ? prev + 1 : Math.max(0, prev - 1));
      if (err?.response?.status === 409) setIsFollowingArtist(true);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleArtistTracksClick = () => {
    if (artistId && artistUsername) {
      navigate(`/${artistUsername}`, { state: { userId: artistId } });
    }
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {showShare && <ShareModal title={track.title} onClose={() => setShowShare(false)} />}

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">

        {/* ── HERO ── */}
        <div
          className="relative mt-5 flex w-full overflow-hidden rounded-sm"
          style={{
            background: "linear-gradient(90deg, #b78885 0%, #9f8594 50%, #697299 100%)",
            minHeight: "220px",
          }}
        >
          {/* Left: play + meta + waveform */}
          <div className="flex min-w-0 flex-1 flex-col px-6 pt-6 pb-4 sm:px-8 sm:pt-8">

            <div className="mb-6 flex items-start gap-4">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="sc-track-hero-play flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 sm:h-16 sm:w-16"
                aria-label={pageIsPlaying ? 'Pause' : 'Play'}
              >
                {pageIsPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                    <rect x="1" y="1" width="4" height="12" />
                    <rect x="9" y="1" width="4" height="12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                    <polygon points="2,0 14,7 2,14" />
                  </svg>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col items-start gap-2">
                  <h1 className="block max-w-full truncate bg-black px-3 py-1 text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-[54px] lg:leading-none">
                    {track.title}
                  </h1>
                  <p className="block max-w-full truncate bg-black px-3 py-1 text-base font-semibold text-zinc-300 sm:text-xl">
                    {artistName}
                  </p>
                </div>
              </div>

              <span className="mt-1 shrink-0 text-xs font-semibold text-white sm:text-[13px]">
                {new Date((track as any).createdAt ?? '')
                  .toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </span>
            </div>

            {/* Waveform */}
            <Waveform
              onSeek={handleSeek}
              comments={waveformComments}
              waveformSeed={waveformSeed}
              isThisTrack={isThisTrack}
              playerProgress={playerProgress}
              duration={duration}
            />
          </div>

          {/* Right: artwork flush top */}
          <div className="hidden h-[220px] w-[220px] shrink-0 self-start overflow-hidden rounded-[10px] md:mr-6 md:mt-6 md:block lg:mr-8 lg:mt-8 lg:h-[340px] lg:w-[340px]">
            {artworkSrc ? (
              <img src={artworkSrc} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span className="text-5xl font-bold text-zinc-600">{ownerInit}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── ACTION BAR ── */}
        <div className="border-b border-[hsl(0,0%,13%)] bg-[#181818]">
          <div className="flex flex-wrap items-center gap-2 px-6 py-3 sm:px-8">

            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded border transition ${
                isLiked
                  ? 'border-orange-500 text-orange-400'
                  : 'border-[hsl(0,0%,18%)] text-[hsl(0,0%,50%)] hover:text-[hsl(14,90%,58%)] hover:border-[hsl(14,90%,40%)]'
              }`}
            >
              <Heart size={12} fill={isLiked ? '#F94C00' : 'none'} style={{ color: isLiked ? '#F94C00' : undefined }} />
            </button>

            <button
              onClick={toggleRepost}
              disabled={engLoading}
              className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded border transition disabled:opacity-60 ${
                isReposted
                  ? 'border-orange-500 text-orange-400'
                  : 'border-[hsl(0,0%,18%)] text-[hsl(0,0%,50%)] hover:text-white hover:border-[hsl(0,0%,35%)]'
              }`}
            >
              <Repeat2 size={12} style={{ color: isReposted ? '#F94C00' : undefined }} />
            </button>

            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)] transition"
            >
              <Share2 size={12} />
            </button>

            <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)] transition">
              <Copy size={12} />
            </button>

            <button className="flex items-center gap-1.5 text-[hsl(0,0%,50%)] hover:text-white text-[11px] px-2 py-1 rounded border border-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,35%)] transition">
              <MoreHorizontal size={12} />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-4 text-xs text-[hsl(0,0%,40%)] shrink-0">
              <span className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor"><polygon points="2,0 14,7 2,14" /></svg>
                {(counts.plays ?? (track as any).plays ?? 0).toLocaleString()}
              </span>
              <Link to={`/tracks/${trackId}/likes`} className="flex items-center gap-1 hover:text-white transition">
                <Heart size={10} />
                {engLoading ? '...' : counts.likes.toLocaleString()}
              </Link>
              <Link to={`/tracks/${trackId}/reposts`} className="flex items-center gap-1 hover:text-white transition">
                <Repeat2 size={10} />
                {engLoading ? '...' : counts.reposts.toLocaleString()}
              </Link>
            </div>
          </div>
        </div>

        {/* ── LOWER SECTION ── */}
        <div className="flex">

          {/* Artist sidebar */}
          <aside className="w-44 shrink-0 px-5 py-6 border-r border-[hsl(0,0%,13%)] flex flex-col items-center gap-3">
            <div
              className="w-[88px] h-[88px] rounded-full overflow-hidden ring-2 ring-zinc-700 cursor-pointer hover:ring-orange-500 transition"
              onClick={handleArtistTracksClick}
            >
              <img src={artistAvatar} alt={artistName} className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <p
                className="text-sm font-semibold text-white leading-tight cursor-pointer hover:text-zinc-300 transition"
                onClick={handleArtistTracksClick}
              >
                {artistName}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1 flex items-center justify-center gap-2">
                {artistRouteId ? (
                  <Link to={`/${artistRouteId}/followers`} className="flex items-center gap-0.5 hover:text-white transition">
                    <Users className="w-2.5 h-2.5" />
                    {artistFollowers.toLocaleString()}
                  </Link>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5" />
                    {artistFollowers.toLocaleString()}
                  </span>
                )}
                <span className="text-zinc-700">·</span>
                <button
                  onClick={handleArtistTracksClick}
                  className="hover:text-white transition"
                >
                  {artistTracksCount} 
                </button>
              </p>
            </div>
            <button
              onClick={handleFollowArtist}
              disabled={followLoading}
              className="w-full rounded bg-white px-5 py-1.5 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-60"
            >
              {isFollowingArtist ? 'Following' : 'Follow'}
            </button>
            <button className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-white transition mt-1">
              <Flag className="w-3 h-3" />
              Report
            </button>
          </aside>

          {/* Comments */}
          <div className="flex-1 min-w-0 border-r border-[hsl(0,0%,13%)]">
            <CommentsSection
              trackId={trackId ?? ''}
              commentCount={counts.comments}
              currentTime={currentTime}
              currentUserId={currentUserId}
              onCommentsChange={handleCommentsUpdate}
            />
          </div>

          {/* Fans sidebar */}
          <aside className="w-60 shrink-0 px-5 py-6 space-y-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Fans</h3>
              <Info className="w-3 h-3 text-zinc-600" />
            </div>
            <div className="flex gap-3 text-xs">
              {(['top', 'first'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFansTab(tab)}
                  className={`font-medium capitalize transition ${
                    fansTab === tab ? 'text-white border-b border-white' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide leading-relaxed">
              Fans who have played this track the most:
            </p>
            <div className="space-y-3">
              {MOCK_FANS.map(fan => (
                <div key={fan.rank} className="flex items-center gap-2.5">
                  <span className="text-xs text-zinc-600 w-3 shrink-0 tabular-nums">{fan.rank}</span>
                  <img src={fan.avatarUrl} alt={fan.username} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  <span className="text-xs text-zinc-300 flex-1 truncate">{fan.username}</span>
                  <span className="text-[11px] text-zinc-500 font-mono shrink-0 tabular-nums">{fan.plays} plays</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <img src={makeCommentAvatar('?', 28)} alt="" className="w-7 h-7 rounded-full shrink-0" />
                <div>
                  <p className="text-[11px] text-white font-medium">Climb the leaderboard</p>
                  <p className="text-[10px] text-zinc-500">Complete the steps below:</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {['Avatar', 'Like', 'Follow', 'Play'].map(a => (
                  <button key={a} className="py-1.5 rounded border border-zinc-700 text-[10px] text-zinc-400 hover:border-zinc-500 hover:text-white transition col-span-1">
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
