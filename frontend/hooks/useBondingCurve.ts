export function useBondingCurve(raised: number) {
  const progress = Math.min((raised / 69000) * 100, 100);
  return { progress };
}
