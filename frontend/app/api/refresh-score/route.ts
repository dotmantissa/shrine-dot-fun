import { NextResponse } from "next/server";
import { readStore, writeStore } from "../../../lib/backend/store";

function signalFrom(vibe: number, curve: number): "AI Pick" | "Graduating" | "Rug risk" | "New" {
  if (curve >= 95) return "Graduating";
  if (vibe > 85) return "AI Pick";
  if (vibe < 35) return "Rug risk";
  return "New";
}

export async function POST(req: Request) {
  const { token } = await req.json();
  const list = readStore();
  const idx = list.findIndex((t) => t.address.toLowerCase() === String(token).toLowerCase());
  if (idx < 0) return NextResponse.json({ error: "Token not found" }, { status: 404 });

  const current = list[idx];
  const delta = Math.floor(Math.random() * 21) - 10;
  const vibe = Math.max(0, Math.min(100, current.vibe + delta));
  const updated = { ...current, vibe, signal: signalFrom(vibe, current.curve) };
  list[idx] = updated;
  writeStore(list);

  return NextResponse.json({ ok: true, token: updated, changedBy: delta });
}
