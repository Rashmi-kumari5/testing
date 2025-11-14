import { HighPriorityBoard } from "@/components/asama/high-priority-board";
import { fetchAsamaHighPriorityTasks } from "@/lib/asama";

export default async function Home() {
  const data = await fetchAsamaHighPriorityTasks();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-white">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-0">
        <HighPriorityBoard data={data} />
        <aside className="rounded-2xl border border-dashed border-zinc-200 bg-white/70 p-4 text-sm text-zinc-600">
          Configure <code className="rounded bg-zinc-100 px-1 py-0.5">ASAMA_API_BASE_URL</code> (and
          optionally <code className="rounded bg-zinc-100 px-1 py-0.5">ASAMA_BOARD_ID</code>) to pull
          live data. Without those variables the UI falls back to the latest checked-in snapshot so
          product reviews stay unblocked.
        </aside>
      </main>
    </div>
  );
}
