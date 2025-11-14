import Calculator from "@/components/Calculator";

const checklist = [
  "Basic operators with smart chaining",
  "Keyboard-sized layout that scales on mobile",
  "Helpful commands for sign and percentage",
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-purple-500/30 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-[180px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-20 lg:py-24">
        <section className="flex-1 space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">
            Task 2 · Dark Calculator
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Make quick calculations without straining your eyes.
          </h1>
          <p className="text-lg text-white/70">
            The interface mimics the feel of a hardware keypad, but is responsive,
            accessible, and ready for keyboard warriors and touch users alike.
          </p>
          <ul className="space-y-3 text-base text-white/80">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm text-cyan-300">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex-1">
          <Calculator />
          <p className="mt-6 text-center text-sm text-white/60">
            Tip: tap operators repeatedly to chain expressions without pressing
            equals every time.
          </p>
        </section>
      </main>
    </div>
  );
}
