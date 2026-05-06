import { NextResponse } from "next/server";
import { pushPrice, pushTrade, readPriceHistory, readStore, writeStore } from "../../../lib/backend/store";

function signalFrom(vibe: number, curve: number): "AI Pick" | "Graduating" | "Rug risk" | "New" {
  if (curve >= 95) return "Graduating";
  if (vibe > 85) return "AI Pick";
  if (vibe < 35) return "Rug risk";
  return "New";
}

export async function POST(req: Request) {
  const { token, side, amount } = await req.json();
  const amt = Number(amount);
  if (!token || !["buy", "sell"].includes(side) || !Number.isFinite(amt) || amt <= 0) {
    return NextResponse.json({ error: "Invalid trade input" }, { status: 400 });
  }

  const list = readStore();
  const idx = list.findIndex((t) => t.address.toLowerCase() === String(token).toLowerCase());
  if (idx < 0) return NextResponse.json({ error: "Token not found" }, { status: 404 });

  const curr = list[idx];
  const price = Number(curr.price);
  const direction = side === "buy" ? 1 : -1;
  const priceImpact = Math.min(0.18, amt / 500);
  const nextPrice = Math.max(0.00000001, price * (1 + direction * priceImpact * 0.05));
  const nextCurve = Math.max(0, Math.min(100, curr.curve + Math.round(direction * Math.max(1, amt / 5))));

  const updated = {
    ...curr,
    price: nextPrice.toFixed(8),
    change24h: `${direction > 0 ? "+" : "−"}${Math.abs(Math.round(priceImpact * 100))}%`,
    curve: nextCurve,
    signal: signalFrom(curr.vibe, nextCurve),
  };

  list[idx] = updated;
  writeStore(list);
  pushTrade(curr.address, { side, amount: String(amt), at: Date.now() });
  pushPrice(curr.address, { t: Date.now(), p: nextPrice });

  return NextResponse.json({ ok: true, token: updated, priceImpact: Number((priceImpact * 100).toFixed(2)) });
}
