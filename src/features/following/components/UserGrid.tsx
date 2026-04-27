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
  placeholders?: number; 
}

export default function UserGrid({ users, renderAction, placeholders = 0 }: UserGridProps) {
  return (
    <div data-testid="user-grid" className="mt-8 flex flex-wrap gap-6">
      {users.map((user) => (
        <UserCard
          key={user.id}
          {...user}
          action={renderAction?.(user)}
        />
      ))}
      {Array.from({ length: Math.max(0, placeholders - users.length) }).map((_, i) => (
        <div data-testid={`user-grid-placeholder-${i}`} key={i} className="h-44 w-44 rounded-full bg-zinc-800/70" />
      ))}
    </div>
  );
}