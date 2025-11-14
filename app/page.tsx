import Link from "next/link";

import { ScientificCalculator } from "@/components/calculator/scientific-calculator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-0">
        <ScientificCalculator />
        <aside className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
          This scientific calculator supports trigonometry, logarithms, exponentiation, constants, and
          live previews. Use the DEG/RAD toggle when working with angles or plug in constants such as
          π, τ, and e directly from the keypad.
        </aside>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
          <span>Need a lightweight workspace for your ideas?</span>
          <Link
            href="/notes"
            className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
          >
            Open Notes
          </Link>
        </div>
      </main>
    </div>
  );
}
