import { NextResponse } from "next/server";
import { fetchRitualTokenByAddress, fetchRitualTrades } from "../../../../lib/backend/ritual";

export async function GET(_: Request, { params }: { params: { address: string } }) {
  let token = null;
  try {
    token = await fetchRitualTokenByAddress(params.address);
  } catch (e) {
    console.error("api/tokens/[address] token read failed", e);
  }
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let market: Awaited<ReturnType<typeof fetchRitualTrades>> = { trades: [], points: [] };
  try {
    market = await fetchRitualTrades(token.curveAddress);
  } catch (e) {
    console.error("api/tokens/[address] trades read failed", e);
  }
  return NextResponse.json({ token, trades: market.trades, points: market.points });
}
