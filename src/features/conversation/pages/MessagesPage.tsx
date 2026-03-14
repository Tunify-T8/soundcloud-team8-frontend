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

        <div className="mt-4 rounded-lg bg-zinc-800 px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-12 w-12 rounded-full bg-[#d5978f]" />

              <div>
                <p className="text-lg font-semibold text-zinc-100">Test User</p>
                <p className="text-base text-zinc-400">asadasd</p>
              </div>
            </div>

            <p className="pt-1 text-sm text-zinc-400">29 minutes ago</p>
          </div>
        </div>
      </section>
    </main>
  );
}
