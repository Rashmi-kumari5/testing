import Calculator from "./components/Calculator";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 font-sans p-4">
      <main className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Simple Calculator
          </h1>
          <p className="text-zinc-400">
            A beautiful dark-themed calculator built with Next.js
          </p>
        </div>
        <Calculator />
      </main>
    </div>
  );
}
