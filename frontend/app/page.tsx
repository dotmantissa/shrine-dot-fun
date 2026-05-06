import AIVibeScore from "../components/AIVibeScore";

export default function HomePage() {
  return (
    <main className="p-6 space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shrine.fun</h1>
        <a href="/create" className="underline">Create a coin</a>
      </header>
      <section className="rounded border p-3">Live Narrator Banner</section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded border p-3">
          <div className="font-semibold">Token Card</div>
          <AIVibeScore tokenAddress="0x0" size="small" score={{ vibeRating: 88, rugRisk: 22, summary: "Strong meme momentum", scored: true }} />
        </div>
      </section>
    </main>
  );
}
