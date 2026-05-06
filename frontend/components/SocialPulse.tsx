"use client";

export default function SocialPulse({ twitterHandle, mentions }: { tokenAddress: string; twitterHandle: string; mentions?: number }) {
  const q = twitterHandle?.replace(/^@/, "") || "shrinefun";
  return (
    <div className="rounded border p-3">
      <div className="font-semibold">Social Pulse</div>
      <div>{mentions ?? 0} mentions in last 24h</div>
      <a className="text-blue-600" href={`https://x.com/search?q=${encodeURIComponent(q)}`} target="_blank" rel="noreferrer">View on X</a>
    </div>
  );
}
