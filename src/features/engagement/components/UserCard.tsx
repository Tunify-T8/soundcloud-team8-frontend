import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../auth/services/api';

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


  useEffect(() => {
  if (!userId || hasFetched) return;
  api.get(`/users/${userId}`)
    .then((res) => {
      setFollowersCount(res.data.followersCount ?? 0);
      setIsFollowing(res.data.isFollowing ?? false);
      setHasFetched(true);
    })
    .catch(() => {});
}, [userId, hasFetched]);

  const handleFollow = async () => {
  setLoading(true);
  try {
    if (isFollowing) {
      await api.delete(`/users/${userId}/follow`);
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
    } else {
      await api.post(`/users/${userId}/follow`);
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
  } catch (err: any) {
    if (err?.response?.status === 409) {
     
      setIsFollowing(true);
    } else if (err?.response?.status === 404) {
      
      setIsFollowing(false);
    }
  } finally {
    setLoading(false);
  }
};

  return (
  <div className="flex flex-col items-center w-44 group">
    <div className="w-44 h-44 rounded-full overflow-hidden relative bg-zinc-800 cursor-pointer"
      onClick={() => navigate(`/${userId}`)}>
      <img
        src={avatarUrl}
        alt={username}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    <p
      onClick={() => navigate(`/${userId}`)}
      className="mt-3 text-white font-semibold text-sm truncate w-full text-center cursor-pointer hover:text-zinc-300 transition"
    >
      {username}
    </p>
    <p className="text-zinc-400 text-xs mt-0.5">
      {followersCount.toLocaleString()} followers
    </p>
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`mt-2 text-xs border rounded px-3 py-0.5 transition disabled:opacity-50 ${
        isFollowing
          ? 'border-orange-500 text-orange-400 hover:border-red-400 hover:text-red-400'
          : 'border-zinc-500 text-white hover:border-white'
      }`}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  </div>
);
};

export default UserCard;