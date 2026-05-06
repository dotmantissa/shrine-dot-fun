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
  if (!score || !score.scored) return <div className="animate-pulse rounded bg-zinc-200 h-16 w-full" />;
  const vibe = score.vibeRating;
  const color = vibe <= 40 ? "bg-red-500" : vibe <= 70 ? "bg-amber-500" : "bg-green-500";

  async function refresh() {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  return (
    <div className={`rounded border p-3 ${size === "large" ? "text-base" : "text-sm"}`}>
      <div className="font-semibold">Vibe Score: {vibe}</div>
      <div className={`h-2 w-full rounded ${color}`} style={{ width: `${vibe}%` }} />
      <div className="mt-2 italic">{score.summary}</div>
      <div className="mt-1 text-red-600">Rug Risk: {score.rugRisk}</div>
      <button className="mt-2 border px-2 py-1 text-xs" onClick={refresh} disabled={!onRefresh || refreshing}>{refreshing ? "Refreshing..." : "Refresh score"}</button>
    </div>
  );
}
