"use client";

import { useEffect, useMemo, useState } from "react";
import { buyOnchain, sellOnchain } from "../lib/onchain";

export default function TradePanel({
  token,
  wallet,
  onUpdated,
}: {
  token: { address: string; curveAddress: string; price: string };
  wallet: {
    account: string | null;
    isConnected: boolean;
    isRitual: boolean;
    connect: () => Promise<boolean>;
    error: string;
  };
  onUpdated: () => void;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("1");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const estimatedTokens = useMemo(() => {
    const p = Number(token.price);
    const a = Number(amount);
    if (!p || !a) return "0";
    return (a / p).toFixed(2);
  }, [amount, token.price]);

  async function execute() {
    if (!wallet.isConnected || !wallet.isRitual) {
      const ok = await wallet.connect();
      if (!ok) {
        setMsg("Connect wallet and switch to Ritual testnet.");
        return;
      }
    }
    if (!wallet.account) {
      setMsg("Wallet account unavailable.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      if (side === "buy") {
        await buyOnchain({
          curve: token.curveAddress as `0x${string}`,
          account: wallet.account as `0x${string}`,
          ritualAmount: amount,
        });
      } else {
        await sellOnchain({
          curve: token.curveAddress as `0x${string}`,
          token: token.address as `0x${string}`,
          account: wallet.account as `0x${string}`,
          tokenAmount: amount,
        });
      }
      setMsg(`Executed ${side.toUpperCase()} on-chain.`);
      onUpdated();
    } catch (e: any) {
      setMsg(e?.message || "Trade failed");
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) return null;

  return (
    <div style={{ border: "1px solid var(--line)", padding: 10, display: "grid", gap: 8 }}>
      <div style={{ font: "500 10px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)" }}>Trade</div>
      <div style={{ display: "flex", gap: 6 }}>
        <button style={{ border: "1px solid var(--line)", padding: "6px 8px", background: side === "buy" ? "var(--stone)" : "transparent", color: "var(--ink)", cursor: "pointer" }} onClick={() => setSide("buy")}>Buy</button>
        <button style={{ border: "1px solid var(--line)", padding: "6px 8px", background: side === "sell" ? "var(--stone)" : "transparent", color: "var(--ink)", cursor: "pointer" }} onClick={() => setSide("sell")}>Sell</button>
      </div>
      <input style={{ border: "1px solid var(--line)", padding: 8, background: "transparent", color: "var(--ink)" }} placeholder={side === "buy" ? "Amount RITUAL" : "Amount TOKEN"} value={amount} onChange={(e) => setAmount(e.target.value)} />
      <div style={{ font: "400 11px 'DM Mono', monospace", color: "var(--deep)" }}>
        {side === "buy" ? `You will receive: ${estimatedTokens} tokens` : "Sell uses token amount input"}
      </div>
      <button style={{ border: "1px solid var(--ink)", background: "var(--ink)", color: "var(--parch)", padding: "8px 10px", cursor: "pointer", letterSpacing: ".1em", textTransform: "uppercase", font: "500 11px 'Jost', sans-serif" }} disabled={busy} onClick={execute}>{busy ? "Executing..." : "Execute trade"}</button>
      {msg && <div style={{ font: "400 10px 'DM Mono', monospace", color: "var(--mid)" }}>{msg}</div>}
      {!msg && wallet.error && <div style={{ font: "400 10px 'DM Mono', monospace", color: "var(--accent)" }}>{wallet.error}</div>}
    </div>
  );
}
