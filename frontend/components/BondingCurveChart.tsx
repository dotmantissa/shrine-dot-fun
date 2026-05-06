"use client";

export default function BondingCurveChart({ points }: { points: Array<{ t: number; p: number }> }) {
  const width = 520;
  const height = 220;
  if (!points.length) return <div style={{ border: "1px solid var(--line)", padding: 10, color: "var(--mid)" }}>No price points yet.</div>;

  const prices = points.map((x) => x.p);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const coords = points
    .map((pt, i) => {
      const x = (i / Math.max(1, points.length - 1)) * (width - 24) + 12;
      const y = height - ((pt.p - min) / Math.max(1e-12, max - min)) * (height - 24) - 12;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div style={{ border: "1px solid var(--line)", padding: 8 }}>
      <div style={{ font: "500 10px 'DM Mono', monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mid)", marginBottom: 6 }}>Price Curve</div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bonding curve price chart">
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        <polyline points={coords} fill="none" stroke="var(--ink)" strokeWidth="2" />
      </svg>
    </div>
  );
}
