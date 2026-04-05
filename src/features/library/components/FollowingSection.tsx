import type { FollowingUser } from "../types";

export default function FollowingSection({ users }: { users: FollowingUser[] }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-sm">Following</h2>
        <span className="text-zinc-500 text-xs hover:text-white cursor-pointer">Browse trending playlists</span>
      </div>
      <div className="flex gap-6 flex-wrap">
        {users.map((user) => (
          <div key={user.id} className="flex flex-col items-center gap-2 cursor-pointer group w-[170px]">
            <div className="w-[170px] h-[170px] rounded-full overflow-hidden bg-[#282828] relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-[#282828]" />
              )}
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-white text-xs font-semibold">{user.name}</p>
                {user.verified && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="#1da1f2">
                    <circle cx="6" cy="6" r="6" />
                    <path d="M4 6l1.5 1.5L8 4" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <p className="text-zinc-500 text-xs mt-0.5">{user.followers} followers</p>
            </div>
          </div>
        ))}
        {Array.from({ length: Math.max(0, 6 - users.length) }).map((_, i) => (
          <div key={`ghost-${i}`} className="w-[170px] h-[170px] rounded-full bg-[#282828]" />
        ))}
      </div>
    </section>
  );
}
