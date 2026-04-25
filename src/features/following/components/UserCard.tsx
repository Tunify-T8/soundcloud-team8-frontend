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
    <div className="flex flex-col items-center w-44 group">
      <Link to={`/${id}`} className="flex flex-col items-center">
        <div className="w-44 h-44 rounded-full overflow-hidden relative bg-zinc-800">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName ?? username}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800" />
          )}
          <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="flex items-center gap-1 mt-3">
          <p className="text-white font-semibold truncate text-sm">
            {displayName ?? username}
          </p>
          {verified && <BadgeCheck size={13} className="text-blue-400 shrink-0" />}
        </div>
        {followersCount !== undefined && (
          <p className="text-zinc-400 text-xs mt-0.5">
            {followersCount} {followersCount === 1 ? "follower" : "followers"}
          </p>
        )}
      </Link>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}