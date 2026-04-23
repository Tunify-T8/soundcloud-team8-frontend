import { NavLink } from "react-router-dom";

type SocialInfoBarProps = {
  avatarUrl?: string | null;
  title: string;
  basePath: string;
};

export default function SocialInfoBar({
  avatarUrl,
  title,
  basePath,
}: SocialInfoBarProps) {
  return (
    <div>
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-zinc-400">
          {avatarUrl ? (
            <img src={avatarUrl} alt={title} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
      </div>

      <div className="mt-6 flex items-center gap-8 border-b border-zinc-800">
        <NavLink
          to={basePath}
          end
          className={({ isActive }) =>
            `pb-3 text-xl font-semibold transition-colors ${
              isActive ? "text-white border-b-2 border-white" : "text-zinc-400 hover:text-white"
            }`
          }
        >
          Likes
        </NavLink>
        <NavLink
          to={`${basePath}/following`}
          className={({ isActive }) =>
            `pb-3 text-xl font-semibold transition-colors ${
              isActive ? "text-white border-b-2 border-white" : "text-zinc-400 hover:text-white"
            }`
          }
        >
          Following
        </NavLink>
        <NavLink
          to={`${basePath}/followers`}
          className={({ isActive }) =>
            `pb-3 text-xl font-semibold transition-colors ${
              isActive ? "text-white border-b-2 border-white" : "text-zinc-400 hover:text-white"
            }`
          }
        >
          Followers
        </NavLink>
      </div>
    </div>
  );
}
