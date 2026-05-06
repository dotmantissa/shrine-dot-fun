"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", symbol: "", description: "", twitterHandle: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/tokens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data?.token?.address) {
      router.push(`/${data.token.address}`);
      return;
    }
    setLoading(false);
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Launch a coin</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="border p-2 w-full" placeholder="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input className="border p-2 w-full" placeholder="symbol" value={form.symbol} onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))} />
        <textarea className="border p-2 w-full" placeholder="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <input className="border p-2 w-full" placeholder="twitterHandle" value={form.twitterHandle} onChange={(e) => setForm((f) => ({ ...f, twitterHandle: e.target.value }))} />
        <button className="rounded bg-black text-white px-4 py-2" type="submit" disabled={loading}>{loading ? "Deploying..." : "Deploy"}</button>
      </form>
      {loading && <p className="mt-3">AI is analyzing your coin… (est. 10-15s)</p>}
    </main>
  );
}
