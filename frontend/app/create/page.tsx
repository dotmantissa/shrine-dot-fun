"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import WalletConnectButton from "../../components/WalletConnectButton";
import { useRitualWallet } from "../../hooks/useRitualWallet";
import { contracts } from "../../lib/contracts";
import { launchTokenOnchain } from "../../lib/onchain";

export default function CreatePage() {
  const router = useRouter();
  const wallet = useRitualWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", symbol: "", description: "", twitterHandle: "", totalTokensToMint: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!wallet.isConnected || !wallet.isRitual) {
      const ok = await wallet.connect();
      if (!ok) {
        setError("Connect wallet and switch to Ritual testnet to continue.");
        return;
      }
    }
    if (!contracts.shrineFactory) {
      setError("Factory contract is not configured.");
      return;
    }
    if (!wallet.account) {
      setError("Wallet account is unavailable.");
      return;
    }

    setLoading(true);
    try {
      const launched = await launchTokenOnchain({
        factory: contracts.shrineFactory,
        account: wallet.account as `0x${string}`,
        name: form.name,
        symbol: form.symbol,
        description: form.description,
        imageURI: "",
        twitterHandle: form.twitterHandle,
        totalTokensToMint: form.totalTokensToMint,
      });
      router.push(`/${launched.token}`);
      return;
    } catch (e: any) {
      setError(e?.message || "Launch failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "28px", background: "var(--parch)" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", border: "1px solid var(--line)", background: "var(--parch)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ font: "700 22px 'Playfair Display', serif", color: "var(--ink)" }}>Launch a Coin</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <WalletConnectButton
              isConnected={wallet.isConnected}
              isRitual={wallet.isRitual}
              busy={wallet.busy}
              shortAccount={wallet.shortAccount}
              onConnect={wallet.connect}
            />
            <button onClick={() => router.push("/")} style={{ border: "1px solid var(--line)", background: "transparent", color: "var(--mid)", padding: "6px 10px", cursor: "pointer", letterSpacing: ".08em", textTransform: "uppercase", font: "400 10px 'DM Mono', monospace" }}>Back</button>
          </div>
        </div>

        <form onSubmit={onSubmit} style={{ padding: "18px 20px", display: "grid", gap: "12px" }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ font: "400 10px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)" }}>Name</span>
            <input style={{ border: "1px solid var(--line)", padding: "10px", background: "transparent", color: "var(--ink)" }} placeholder="Spirit Moth" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ font: "400 10px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)" }}>Symbol</span>
            <input style={{ border: "1px solid var(--line)", padding: "10px", background: "transparent", color: "var(--ink)" }} placeholder="$MOTH" value={form.symbol} onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))} required />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ font: "400 10px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)" }}>Description</span>
            <textarea style={{ border: "1px solid var(--line)", padding: "10px", minHeight: 90, background: "transparent", color: "var(--ink)" }} placeholder="Describe the coin's vibe" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ font: "400 10px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)" }}>Twitter Handle</span>
            <input style={{ border: "1px solid var(--line)", padding: "10px", background: "transparent", color: "var(--ink)" }} placeholder="@spiritmoth" value={form.twitterHandle} onChange={(e) => setForm((f) => ({ ...f, twitterHandle: e.target.value }))} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ font: "400 10px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)" }}>Total Tokens To Mint (On-chain)</span>
            <input
              style={{ border: "1px solid var(--line)", padding: "10px", background: "transparent", color: "var(--ink)" }}
              placeholder="1000000"
              value={form.totalTokensToMint}
              onChange={(e) => setForm((f) => ({ ...f, totalTokensToMint: e.target.value }))}
            />
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <button style={{ border: "1px solid var(--ink)", background: "var(--ink)", color: "var(--parch)", padding: "10px 18px", cursor: "pointer", letterSpacing: ".1em", textTransform: "uppercase", font: "500 11px 'Jost', sans-serif" }} type="submit" disabled={loading}>
              {loading ? "Deploying..." : "Deploy"}
            </button>
            {loading && <span style={{ font: "italic 13px 'Playfair Display', serif", color: "var(--deep)" }}>AI is analyzing your coin (est. 10-15s)</span>}
          </div>
          {(error || wallet.error) && (
            <div style={{ font: "400 11px 'DM Mono', monospace", color: "var(--accent)" }}>
              {error || wallet.error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
