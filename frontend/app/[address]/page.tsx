"use client";

import { useEffect, useState } from "react";
import AIVibeScore from "../../components/AIVibeScore";
import BondingCurveChart from "../../components/BondingCurveChart";
import SocialPulse from "../../components/SocialPulse";
import TradePanel from "../../components/TradePanel";

type Token = {
  address: string;
  name: string;
  symbol: string;
  description: string;
  twitterHandle: string;
  price: string;
  vibe: number;
  curve: number;
  signal: string;
  change24h?: string;
};

export default function TokenPage({ params }: { params: { address: string } }) {
  const [token, setToken] = useState<Token | null>(null);
  const [trades, setTrades] = useState<Array<{ side: string; amount: string; at: number }>>([]);
  const [points, setPoints] = useState<Array<{ t: number; p: number }>>([]);

  async function load() {
    const d = await fetch(`/api/tokens/${params.address}`).then((r) => r.json());
    setToken(d.token ?? null);
    setTrades(d.trades ?? []);
    setPoints(d.points ?? []);
  }

  useEffect(() => {
    load();
  }, [params.address]);

  async function refreshScore() {
    await fetch("/api/refresh-score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: params.address }),
    });
    await load();
  }

  if (!token) return <main className="p-6">Loading token...</main>;

  return (
    <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">{token.name} <span className="opacity-60">{token.symbol}</span></h1>
        <p>{token.description}</p>
        <AIVibeScore tokenAddress={token.address} size="large" score={{ vibeRating: token.vibe, rugRisk: Math.max(0, 100 - token.vibe), summary: "On-chain AI sentiment estimate.", scored: true }} onRefresh={refreshScore} />
        <SocialPulse tokenAddress={token.address} twitterHandle={token.twitterHandle} mentions={Math.max(0, Math.round(token.vibe * 1.3))} />
        <div className="grid grid-cols-2 gap-3">
          <div className="border p-3">Price: {token.price}</div>
          <div className="border p-3">Curve: {token.curve}%</div>
          <div className="border p-3">Signal: {token.signal}</div>
          <div className="border p-3">24h: {token.change24h || "+0%"}</div>
        </div>
      </div>
      <div>
        <BondingCurveChart points={points} />
        <div className="border p-3 mt-3">
          <h2 className="font-semibold mb-2">Recent Trades</h2>
          {trades.length === 0 ? <div>No trades yet.</div> : trades.map((t, i) => <div key={i}>{new Date(t.at).toLocaleTimeString()} · {t.side.toUpperCase()} {t.amount} RITUAL</div>)}
        </div>
      </div>
      <TradePanel token={{ address: token.address, price: token.price }} onUpdated={(next) => setToken((t) => t ? ({ ...t, ...next }) : t)} />
    </main>
  );
}
