type ConversationListItemProps = {
  name: string;
  preview: string;
  timeLabel: string;
};

export default function ConversationListItem({
  name,
  preview,
  timeLabel,
}: ConversationListItemProps) {
  return (
    <div className="rounded-lg bg-zinc-800 px-3 py-2.5">
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
