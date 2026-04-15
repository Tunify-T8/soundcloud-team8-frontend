import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import type { UserSearchResult } from '../../features/feed/type';

export default function UserResultRow({ user }: { user: UserSearchResult }) {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const handleNavigate = () => {
    if (currentUser && user.username === currentUser.username) {
      navigate('/me');
    } else {
      navigate(`/${user.username}`);
    }
  };

  return (
    <div
      data-testid={`user-result-row-${user.id}`}
      className="flex items-center gap-5 py-4 border-b border-[hsl(0,0%,11%)] cursor-pointer hover:bg-[hsl(0,0%,11%)] px-2 rounded transition-colors mb-2"
      onClick={handleNavigate}
    >
      {/* Avatar — initial letter */}
      <div
        data-testid={`user-avatar-${user.id}`}
        className="w-[70px] h-[70px] rounded-full bg-[hsl(0,0%,20%)] flex items-center justify-center shrink-0 overflow-hidden"
      >
        <span className="text-[26px] font-bold text-gray-400">
          {(user.displayName ?? user.username).charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            data-testid={`user-display-name-${user.id}`}
            className="text-white font-bold text-[15px] truncate"
          >
            {user.displayName ?? user.username}
          </p>
          {user.isCertified && (
            <span
              data-testid={`user-certified-badge-${user.id}`}
              className="text-[10px] bg-[hsl(14,90%,52%)] text-white px-1.5 py-0.5 rounded font-bold shrink-0"
            >
              ✓
            </span>
          )}
        </div>
        <p
          data-testid={`user-meta-${user.id}`}
          className="text-gray-400 text-[12px]"
        >
          @{user.username} · {user.followersCount.toLocaleString()} followers
        </p>
        {user.bio && (
          <p
            data-testid={`user-bio-${user.id}`}
            className="text-gray-500 text-[12px] truncate mt-0.5"
          >
            {user.bio}
          </p>
        )}
      </div>

      {/* Follow button */}
      <button
        data-testid={`user-follow-btn-${user.id}`}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 px-5 py-1.5 rounded border border-[hsl(0,0%,40%)] text-white text-[13px] font-semibold hover:bg-white hover:text-black transition-colors"
      >
        Follow
      </button>
    </div>
  );
}