import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";

interface UserCardProps {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  followersCount?: number;
  verified?: boolean;
  action?: React.ReactNode; // slot for Follow/Unfollow button
}

export default function UserCard({
  id,
  username,
  displayName,
  avatarUrl,
  followersCount,
  verified,
  action,
}: UserCardProps) {
  return (
    <div data-testid={`user-card-${id}`} className="flex flex-col items-center w-44 group">
      <Link to={`/${id}`} className="flex flex-col items-center">
        <div data-testid={`user-card-avatar-container-${id}`} className="w-44 h-44 rounded-full overflow-hidden relative bg-zinc-800">
          {avatarUrl ? (
            <img
              data-testid={`user-card-avatar-${id}`}
              src={avatarUrl}
              alt={displayName ?? username}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div data-testid={`user-card-avatar-placeholder-${id}`} className="w-full h-full bg-zinc-800" />
          )}
          <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div data-testid={`user-card-name-row-${id}`} className="flex items-center gap-1 mt-3">
          <p data-testid={`user-card-name-${id}`} className="text-white font-semibold truncate text-sm">
            {displayName ?? username}
          </p>
          {verified && <BadgeCheck data-testid={`user-card-verified-${id}`} size={13} className="text-blue-400 shrink-0" />}
        </div>
        {followersCount !== undefined && (
          <p data-testid={`user-card-followers-count-${id}`} className="text-zinc-400 text-xs mt-0.5">
            {followersCount} {followersCount === 1 ? "follower" : "followers"}
          </p>
        )}
      </Link>
      {action && <div data-testid={`user-card-action-${id}`} className="mt-2">{action}</div>}
    </div>
  );
}