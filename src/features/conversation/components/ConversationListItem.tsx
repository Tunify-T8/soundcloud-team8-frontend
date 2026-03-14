type ConversationListItemProps = {
  name: string;
  preview: string;
  timeLabel: string;
  unreadCount: number;
};

export default function ConversationListItem({
  name,
  preview,
  timeLabel,
  unreadCount,
}: ConversationListItemProps) {
  return (
    <div className="relative w-full rounded-lg bg-zinc-800 px-4 py-3">
      {unreadCount > 0 ? <span className="absolute left-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-orange-500" /> : null}

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="h-11 w-11 shrink-0 rounded-full bg-[#d5978f]" />

          <div className="min-w-0">
            <p className="text-base font-semibold text-zinc-100">{name}</p>
            <p className="truncate text-sm text-zinc-400">{preview}</p>
          </div>
        </div>

        <p className="shrink-0 whitespace-nowrap pt-0.5 text-xs text-zinc-400">{timeLabel}</p>
      </div>
    </div>
  );
}
