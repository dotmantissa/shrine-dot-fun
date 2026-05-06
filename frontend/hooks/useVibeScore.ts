import { useMemo } from "react";

export function useVibeScore(vibe: number, rugRisk: number) {
  const color = useMemo(() => (vibe <= 40 ? "red" : vibe <= 70 ? "amber" : "green"), [vibe]);
  const isAIPick = vibe > 85;
  const isRugRisk = rugRisk > 70;
  return { color, isAIPick, isRugRisk };
}
