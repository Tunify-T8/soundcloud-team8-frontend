import UserCard from "./UserCard";

interface User {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  followersCount?: number;
  verified?: boolean;
}

interface UserGridProps {
  users: User[];
  renderAction?: (user: User) => React.ReactNode;
  placeholders?: number; // ghost cards to pad the row
}

export default function UserGrid({ users, renderAction, placeholders = 0 }: UserGridProps) {
  return (
    <div className="mt-8 flex flex-wrap gap-6">
      {users.map((user) => (
        <UserCard
          key={user.id}
          {...user}
          action={renderAction?.(user)}
        />
      ))}
      {Array.from({ length: Math.max(0, placeholders - users.length) }).map((_, i) => (
        <div key={i} className="h-44 w-44 rounded-full bg-zinc-800/70" />
      ))}
    </div>
  );
}