"use client";

import { useState } from "react";

export default function CreatePage() {
  const [loading, setLoading] = useState(false);
  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Launch a coin</h1>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setLoading(true); }}>
        <input className="border p-2 w-full" placeholder="name" />
        <input className="border p-2 w-full" placeholder="symbol" />
        <textarea className="border p-2 w-full" placeholder="description" />
        <input className="border p-2 w-full" placeholder="twitterHandle" />
        <button className="rounded bg-black text-white px-4 py-2" type="submit">Deploy</button>
      </form>
      {loading && <p className="mt-3">AI is analyzing your coin… (est. 10-15s)</p>}
    </main>
  );
}
