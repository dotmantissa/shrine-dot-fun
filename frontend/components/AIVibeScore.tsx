"use client";

import { useState } from "react";

type Props = {
  tokenAddress: string;
  size: "small" | "large";
  score?: { vibeRating: number; rugRisk: number; summary: string; scored: boolean };
  onRefresh?: () => Promise<void>;
};

export default function AIVibeScore({ size, score, onRefresh }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  if (!score || !score.scored) return <div style={{ border: "1px solid var(--line)", padding: 10, color: "var(--mid)" }}>Scoring...</div>;

  const vibe = score.vibeRating;
  const color = vibe <= 40 ? "var(--accent)" : vibe <= 70 ? "var(--gold)" : "var(--up)";

  async function refresh() {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  return (
    <div style={{ border: "1px solid var(--line)", padding: 10, fontSize: size === "large" ? 15 : 13 }}>
      <div style={{ font: "500 10px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)" }}>Vibe Score</div>
      <div style={{ marginTop: 4, font: "700 20px 'Playfair Display', serif", color: "var(--ink)" }}>{vibe}</div>
      <div style={{ height: 2, background: "var(--line)", marginTop: 6 }}><div style={{ width: `${vibe}%`, height: 2, background: color }} /></div>
      <div style={{ marginTop: 8, font: "italic 13px 'Playfair Display', serif", color: "var(--deep)" }}>{score.summary}</div>
      <div style={{ marginTop: 6, font: "400 11px 'DM Mono', monospace", color: "var(--accent)" }}>Rug Risk: {score.rugRisk}</div>
      <button style={{ marginTop: 8, border: "1px solid var(--line)", background: "transparent", color: "var(--mid)", padding: "5px 8px", cursor: "pointer", font: "400 10px 'DM Mono', monospace", letterSpacing: ".08em", textTransform: "uppercase" }} onClick={refresh} disabled={!onRefresh || refreshing}>{refreshing ? "Refreshing" : "Refresh score"}</button>
    </div>
  );
}
