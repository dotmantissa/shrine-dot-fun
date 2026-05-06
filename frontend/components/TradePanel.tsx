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
    <div className="rounded border p-4 space-y-2">
      <div className="font-semibold">Trade</div>
      <div className="flex gap-2">
        <button className={`border px-2 py-1 ${side === "buy" ? "bg-green-50" : ""}`} onClick={() => setSide("buy")}>Buy</button>
        <button className={`border px-2 py-1 ${side === "sell" ? "bg-red-50" : ""}`} onClick={() => setSide("sell")}>Sell</button>
      </div>
      <input className="border p-2 w-full" placeholder="Amount RITUAL" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <div className="text-sm">You will receive: {estimatedTokens} tokens</div>
      <button className="rounded bg-black text-white px-4 py-2" disabled={busy} onClick={execute}>{busy ? "Executing..." : "Execute trade"}</button>
      {msg && <div className="text-xs opacity-70">{msg}</div>}
    </div>
  );
}
