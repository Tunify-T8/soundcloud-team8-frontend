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
    <div className="flex flex-col items-center gap-2 text-center">
      <img
        src={avatarUrl}
        alt={username}
        onClick={() => navigate(`/${userId}`)}
        className="w-20 h-20 rounded-full object-cover cursor-pointer
                   hover:ring-2 hover:ring-orange-400 transition-all duration-150"
      />
      <p
        onClick={() => navigate(`/${userId}`)}
        className="text-xs text-zinc-300 font-medium truncate w-full
                   cursor-pointer hover:text-white transition"
      >
        {username}
      </p>
      <p className="text-xs text-zinc-500">
        {followersCount.toLocaleString()} followers
      </p>
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`text-xs border rounded px-3 py-0.5 transition disabled:opacity-50 ${
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