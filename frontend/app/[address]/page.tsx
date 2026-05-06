"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AIVibeScore from "../../components/AIVibeScore";
import BondingCurveChart from "../../components/BondingCurveChart";
import SocialPulse from "../../components/SocialPulse";
import TradePanel from "../../components/TradePanel";
import WalletConnectButton from "../../components/WalletConnectButton";
import { useRitualWallet } from "../../hooks/useRitualWallet";

type Token = {
  address: string;
  curveAddress: string;
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
  const router = useRouter();
  const wallet = useRitualWallet();
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
  }, []);

  useEffect(() => {
    load();
  }, [params.address]);

  async function refreshScore() {
    const ok = wallet.isConnected && wallet.isRitual ? true : await wallet.connect();
    if (!ok) return;
    await fetch("/api/refresh-score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: params.address, wallet: wallet.account }),
    });
    await load();
  }

  if (!mounted) return null;
  if (!token) return <main style={{ padding: 24, color: "var(--deep)" }}>Loading token...</main>;

  return (
    <main className="token-main">
      <style>{`
        .token-main{min-height:100vh;padding:24px;background:var(--parch)}
        .token-card{max-width:1280px;margin:0 auto;border:1px solid var(--line);background:var(--parch)}
        .token-head{border-bottom:1px solid var(--line);padding:12px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
        .token-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .token-grid{display:grid;grid-template-columns:1fr 1.1fr .9fr;gap:12px;padding:12px}
        @media (max-width:1024px){ .token-grid{grid-template-columns:1fr;}}
        @media (max-width:768px){
          .token-main{padding:12px}
          .token-head{padding:12px}
        }
      `}</style>
      <div className="token-card">
        <div className="token-head">
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <h1 style={{ margin: 0, font: "700 24px 'Playfair Display', serif", color: "var(--ink)" }}>{token.name}</h1>
            <span style={{ font: "400 12px 'DM Mono', monospace", color: "var(--mid)" }}>{token.symbol}</span>
          </div>
          <div className="token-actions">
            <WalletConnectButton
              isConnected={wallet.isConnected}
              isRitual={wallet.isRitual}
              busy={wallet.busy}
              shortAccount={wallet.shortAccount}
              onConnect={wallet.connect}
            />
            <button onClick={() => router.push("/")} style={{ border: "1px solid var(--line)", background: "transparent", color: "var(--mid)", padding: "6px 10px", cursor: "pointer", letterSpacing: ".08em", textTransform: "uppercase", font: "400 10px 'DM Mono', monospace" }}>Back to Feed</button>
          </div>
        </div>

        <div className="token-grid">
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ border: "1px solid var(--line)", padding: 10, color: "var(--deep)", font: "400 14px 'Jost', sans-serif" }}>{token.description}</div>
            <AIVibeScore tokenAddress={token.address} size="large" score={{ vibeRating: token.vibe, rugRisk: Math.max(0, 100 - token.vibe), summary: "On-chain AI sentiment estimate.", scored: true }} onRefresh={refreshScore} />
            <SocialPulse tokenAddress={token.address} twitterHandle={token.twitterHandle} mentions={Math.max(0, Math.round(token.vibe * 1.3))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Stat label="Price" value={token.price} />
              <Stat label="Curve" value={`${token.curve}%`} />
              <Stat label="Signal" value={token.signal} />
              <Stat label="24h" value={token.change24h || "+0%"} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <BondingCurveChart points={points} />
            <div style={{ border: "1px solid var(--line)", padding: 10 }}>
              <div style={{ font: "500 10px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)", marginBottom: 8 }}>Recent Trades</div>
              {trades.length === 0 ? <div style={{ color: "var(--mid)", font: "400 13px 'Jost', sans-serif" }}>No trades yet.</div> : trades.map((t, i) => <div key={i} style={{ padding: "4px 0", borderBottom: "1px solid var(--line)", font: "400 12px 'DM Mono', monospace", color: "var(--deep)" }}>{new Date(t.at).toLocaleTimeString()} · {t.side.toUpperCase()} {t.amount} RITUAL</div>)}
            </div>
          </div>

          <TradePanel
            token={{ address: token.address, curveAddress: token.curveAddress, price: token.price }}
            wallet={{
              account: wallet.account,
              isConnected: wallet.isConnected,
              isRitual: wallet.isRitual,
              connect: wallet.connect,
              error: wallet.error,
            }}
            onUpdated={load}
          />
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid var(--line)", padding: 8 }}>
      <div style={{ font: "500 9px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)" }}>{label}</div>
      <div style={{ marginTop: 4, font: "700 14px 'Playfair Display', serif", color: "var(--ink)" }}>{value}</div>
    </div>
  );
}
