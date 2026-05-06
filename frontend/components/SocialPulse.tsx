"use client";

export default function SocialPulse({ twitterHandle, mentions }: { tokenAddress: string; twitterHandle: string; mentions?: number }) {
  const q = twitterHandle?.replace(/^@/, "") || "shrinefun";
  return (
    <div style={{ border: "1px solid var(--line)", padding: 10 }}>
      <div style={{ font: "500 10px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)" }}>Social Pulse</div>
      <div style={{ marginTop: 6, color: "var(--deep)", font: "400 13px 'Jost', sans-serif" }}>{mentions ?? 0} mentions in last 24h</div>
      <a style={{ display: "inline-block", marginTop: 8, color: "var(--ink)", font: "400 10px 'DM Mono', monospace", letterSpacing: ".08em", textTransform: "uppercase" }} href={`https://x.com/search?q=${encodeURIComponent(q)}`} target="_blank" rel="noreferrer">View on X</a>
    </div>
  );
}
