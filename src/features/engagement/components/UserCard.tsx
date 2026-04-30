import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../auth/services/api';
import { followingService } from '../../following/followingService';
import { notifySocialGraphUpdated } from '../../profile/socialGraphEvents';
import { FaUser } from 'react-icons/fa';

interface Props {
  userId: string;
  avatarUrl: string;
  username: string;
}

const UserCard = ({ userId, avatarUrl, username }: Props) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [resolvedUsername, setResolvedUsername] = useState(username);
  const [resolvedUserId, setResolvedUserId] = useState(userId);
  const [followStateReady, setFollowStateReady] = useState(false);
  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('sc_access_token') ?? '';
      return token ? JSON.parse(atob(token.split('.')[1]))?.sub ?? '' : '';
    } catch {
      return '';
    }
  })();
  const isMe = currentUserId !== '' && currentUserId === userId;

  useEffect(() => {
    if (!userId || hasFetched) return;
    api.get(`/users/${encodeURIComponent(userId)}`)
      .then(async (profileRes) => {
        const canonicalUserId =
          profileRes.data?.id ??
          profileRes.data?.userId ??
          userId;
        let resolvedIsFollowing = profileRes.data?.isFollowing;

        if (typeof resolvedIsFollowing !== 'boolean') {
          try {
            const followStatus = await followingService.getFollowStatus(canonicalUserId);
            resolvedIsFollowing = followStatus.isFollowing;
          } catch {
            resolvedIsFollowing = false;
          }
        }

        setFollowersCount(profileRes.data.followersCount ?? 0);
        setResolvedUserId(canonicalUserId);
        setIsFollowing(Boolean(resolvedIsFollowing));
        if (profileRes.data.username) setResolvedUsername(profileRes.data.username);
        setFollowStateReady(true);
        setHasFetched(true);
      })
      .catch(() => {
        setFollowStateReady(true);
      });
  }, [userId, hasFetched]);

  const handleFollow = async () => {
    if (!resolvedUserId || loading || !followStateReady) return;

    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowersCount((prev) =>
      wasFollowing ? Math.max(0, prev - 1) : prev + 1,
    );
    setLoading(true);
    try {
      if (wasFollowing) {
        await followingService.unfollowUser(resolvedUserId);
      } else {
        await followingService.followUser(resolvedUserId);
      }
      notifySocialGraphUpdated();
    } catch (err: any) {
      setIsFollowing(wasFollowing);
      setFollowersCount((prev) =>
        wasFollowing ? prev + 1 : Math.max(0, prev - 1),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    navigate(`/${resolvedUsername}`, { state: { userId: resolvedUserId } });
  };

  return (
    <div className="flex flex-col items-center w-44 group">
      <div
        className="w-44 h-44 rounded-full overflow-hidden relative bg-zinc-800 cursor-pointer"
        onClick={handleNavigate}
      >
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <p
        onClick={handleNavigate}
        className="mt-3 text-white font-semibold text-sm truncate w-full text-center cursor-pointer hover:text-zinc-300 transition"
      >
        {username}
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-zinc-400 text-xs">
        <FaUser size={11} />
        {followersCount.toLocaleString()} follower{followersCount === 1 ? '' : 's'}
      </p>
      {!isMe && (
        <button
          onClick={handleFollow}
          disabled={loading || !followStateReady}
          className={`mt-2 text-sm font-semibold rounded px-5 py-1.5 transition disabled:opacity-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto ${
            isFollowing
              ? 'border border-zinc-600 bg-transparent text-white hover:border-white'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          {!followStateReady ? '...' : loading ? (isFollowing ? 'Following...' : 'Follow...') : isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};

export default UserCard;
