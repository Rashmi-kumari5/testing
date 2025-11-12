import Calculator from "./components/Calculator";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans px-4">
      <main className="flex flex-col items-center justify-center gap-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Simple Calculator
          </h1>
          <p className="text-zinc-400 text-lg">
            A beautiful dark-themed calculator
          </p>
        </div>
        <Calculator />
      </main>
    </div>
  );
}
