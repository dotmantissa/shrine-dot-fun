import { NextResponse } from "next/server";
import { fetchRitualTokenByAddress, fetchRitualTrades } from "../../../../lib/backend/ritual";

export async function GET(_: Request, { params }: { params: { address: string } }) {
  const token = await fetchRitualTokenByAddress(params.address);
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const market = await fetchRitualTrades(token.curveAddress);
  return NextResponse.json({ token, trades: market.trades, points: market.points });
}
