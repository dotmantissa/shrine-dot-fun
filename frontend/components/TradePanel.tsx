"use client";

import { useMemo, useState } from "react";

export default function TradePanel({
  token,
  onUpdated,
}: {
  token: { address: string; price: string };
  onUpdated: (next: { price: string; curve: number; signal: string; change24h: string }) => void;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("1");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const estimatedTokens = useMemo(() => {
    const p = Number(token.price);
    const a = Number(amount);
    if (!p || !a) return "0";
    return (a / p).toFixed(2);
  }, [amount, token.price]);

  async function execute() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/trade", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: token.address, side, amount }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Trade failed");
      return;
    }
    onUpdated(data.token);
    setMsg(`Executed ${side.toUpperCase()} · impact ${data.priceImpact}%`);
  }

  return (
    <div style={{ border: "1px solid var(--line)", padding: 10, display: "grid", gap: 8 }}>
      <div style={{ font: "500 10px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)" }}>Trade</div>
      <div style={{ display: "flex", gap: 6 }}>
        <button style={{ border: "1px solid var(--line)", padding: "6px 8px", background: side === "buy" ? "var(--stone)" : "transparent", color: "var(--ink)", cursor: "pointer" }} onClick={() => setSide("buy")}>Buy</button>
        <button style={{ border: "1px solid var(--line)", padding: "6px 8px", background: side === "sell" ? "var(--stone)" : "transparent", color: "var(--ink)", cursor: "pointer" }} onClick={() => setSide("sell")}>Sell</button>
      </div>
      <input style={{ border: "1px solid var(--line)", padding: 8, background: "transparent", color: "var(--ink)" }} placeholder="Amount RITUAL" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <div style={{ font: "400 11px 'DM Mono', monospace", color: "var(--deep)" }}>You will receive: {estimatedTokens} tokens</div>
      <button style={{ border: "1px solid var(--ink)", background: "var(--ink)", color: "var(--parch)", padding: "8px 10px", cursor: "pointer", letterSpacing: ".1em", textTransform: "uppercase", font: "500 11px 'Jost', sans-serif" }} disabled={busy} onClick={execute}>{busy ? "Executing..." : "Execute trade"}</button>
      {msg && <div style={{ font: "400 10px 'DM Mono', monospace", color: "var(--mid)" }}>{msg}</div>}
    </div>
  );
}
