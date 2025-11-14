import type { Metadata } from "next";
import Link from "next/link";

import { NotesBoard } from "@/components/notes/notes-board";

export const metadata: Metadata = {
  title: "Aurora · Notes",
  description: "A focused note-taking workspace that stores entries on your device.",
};

export default function NotesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 sm:px-10 lg:px-0">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
          >
            <span aria-hidden="true">←</span>
            Back to calculator
          </Link>
        </div>
        <NotesBoard />
      </main>
    </div>
  );
}
