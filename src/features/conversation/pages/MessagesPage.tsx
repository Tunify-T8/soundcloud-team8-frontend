import ConversationListItem from "../components/ConversationListItem";

export default function MessagesPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-8 text-white">
      <section className="w-full max-w-[340px]">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">Messages</h1>
          <button
            type="button"
            className="rounded-md bg-white px-4 py-1.5 text-base font-semibold text-black"
          >
            New
          </button>
        </div>

        <div className="mt-4">
          <ConversationListItem
            name="Test User"
            preview="asadasd"
            timeLabel="29 minutes ago"
          />
        </div>
      </section>
    </main>
  );
}
