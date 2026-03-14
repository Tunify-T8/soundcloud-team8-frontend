import ConversationListItem from "./ConversationListItem";

const mockConversations = [
  { id: 1, name: "Test User", preview: "asadasd", timeLabel: "29 minutes ago" },
];

export default function ConversationListPanel() {
  return (
    <section className="w-full max-w-[310px]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <button
          type="button"
          className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-black hover:text-gray-200 hover:cursor-pointer"
        >
          New
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {mockConversations.map((c) => (
          <ConversationListItem
            key={c.id}
            name={c.name}
            preview={c.preview}
            timeLabel={c.timeLabel}
          />
        ))}
      </div>
    </section>
  );
}
