type ConversationListItemProps = {
  name: string;
  preview: string;
  timeLabel: string;
  unreadCount: number;
  avatarUrl?: string | null;
};

export default function ConversationListItem({
  name,
  preview,
  timeLabel,
  unreadCount,
  avatarUrl,
}: ConversationListItemProps) {
  return (
    <div className="relative w-full rounded-lg bg-zinc-800 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-600 text-sm font-semibold text-zinc-100">
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-base font-semibold text-zinc-100">{name}</p>
            <p className="truncate text-sm text-zinc-400">{preview}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
          <p className="whitespace-nowrap text-xs text-zinc-400">{timeLabel}</p>
          {unreadCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}