interface Props {
  avatarUrl: string;
  username: string;
  followersCount?: number;
}

const UserCard = ({ avatarUrl, username, followersCount = 0 }: Props) => {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <img
        src={avatarUrl}
        alt={username}
        className="w-20 h-20 rounded-full object-cover"
      />
      <p className="text-xs text-zinc-300 font-medium truncate w-full">
        {username}
      </p>
      <p className="text-xs text-zinc-500">{followersCount} followers</p>
      <button className="text-xs border border-zinc-500 rounded px-3 py-0.5 hover:border-white hover:text-white transition">
        Follow
      </button>
    </div>
  );
};

export default UserCard;