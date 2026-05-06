import { NextResponse } from "next/server";
import { hasRuntimeContracts } from "../../../lib/backend/contracts";
import { readStore, writeStore } from "../../../lib/backend/store";
import { fetchRitualTokens } from "../../../lib/backend/ritual";

function normalizeSignal(vibe: number): "AI Pick" | "Graduating" | "Rug risk" | "New" {
  if (vibe > 85) return "AI Pick";
  if (vibe < 35) return "Rug risk";
  return "New";
}

export async function GET() {
  const ritual = await fetchRitualTokens(25);
  const tokens = ritual.length > 0 ? ritual : readStore();
  return NextResponse.json({
    source: ritual.length > 0 ? "ritual-chain" : hasRuntimeContracts() ? "runtime+backend" : "backend-fallback",
    contractsConfigured: hasRuntimeContracts(),
    tokens,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const now = Date.now();
  const address = `0x${(now + Math.floor(Math.random() * 1e6)).toString(16).padStart(40, "0").slice(0, 40)}`;

  const next = {
    address,
    emoji: "⛩️",
    name: body.name || "Untitled",
    symbol: body.symbol || "$NEW",
    price: "0.00000010",
    change24h: "+0%",
    vibe: 50,
    curve: 1,
    signal: normalizeSignal(50),
    description: body.description || "",
    twitterHandle: body.twitterHandle || "",
    createdAt: now,
  };

  const store = readStore();
  writeStore([next, ...store]);

  return NextResponse.json({ ok: true, token: next, queuedAiScore: true }, { status: 201 });
}
