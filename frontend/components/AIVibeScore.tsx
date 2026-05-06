"use client";

type Props = {
  tokenAddress: string;
  size: "small" | "large";
  score?: { vibeRating: number; rugRisk: number; summary: string; scored: boolean };
};

export default function AIVibeScore({ size, score }: Props) {
  if (!score || !score.scored) return <div className="animate-pulse rounded bg-zinc-200 h-16 w-full" />;
  const vibe = score.vibeRating;
  const color = vibe <= 40 ? "bg-red-500" : vibe <= 70 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className={`rounded border p-3 ${size === "large" ? "text-base" : "text-sm"}`}>
      <div className="font-semibold">Vibe Score: {vibe}</div>
      <div className={`h-2 w-full rounded ${color}`} style={{ width: `${vibe}%` }} />
      <div className="mt-2 italic">{score.summary}</div>
      <div className="mt-1 text-red-600">Rug Risk: {score.rugRisk}</div>
    </div>
  );
}
