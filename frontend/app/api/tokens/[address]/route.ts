import { NextResponse } from "next/server";
import { readPriceHistory, readStore, readTrades } from "../../../../lib/backend/store";

export async function GET(_: Request, { params }: { params: { address: string } }) {
  const token = readStore().find((t) => t.address.toLowerCase() === params.address.toLowerCase());
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const trades = readTrades(token.address);
  const points = readPriceHistory(token.address);
  return NextResponse.json({ token, trades, points });
}
