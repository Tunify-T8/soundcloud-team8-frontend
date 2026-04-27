import type { FollowingUser } from "../types";
import { BadgeCheck } from "lucide-react";

interface FollowingSectionProps {
  users: FollowingUser[];
}

export default function FollowingSection({ users }: FollowingSectionProps) {
  return (
    <section className="mb-8" data-testid="following-section">
      <div className="flex gap-6 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {users.map((user) => (
          <div key={user.id} data-testid={`following-card-${user.id}`} className="flex-shrink-0 w-[170px] flex flex-col items-center cursor-pointer group">
            <div className="w-[170px] h-[170px] rounded-full overflow-hidden mb-3 relative bg-[#282828]">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-[#282828]" />
              )}
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex items-center gap-1 mb-0.5">
              <p data-testid={`following-name-${user.id}`} className="text-white text-xs font-semibold truncate">{user.name}</p>
              {user.verified && <BadgeCheck size={13} className="text-blue-400 shrink-0" />}
            </div>
            <p data-testid={`following-followers-${user.id}`} className="text-zinc-500 text-xs mb-2">{user.followers} followers</p>
            <button
              data-testid={`following-btn-${user.id}`}
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white text-white text-xs font-bold px-4 py-1 rounded-sm hover:bg-white hover:text-black"
            >
              Following
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}