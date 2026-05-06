import { NextResponse } from "next/server";
import { hasRuntimeContracts } from "../../../lib/backend/contracts";
import { fetchRitualTokens } from "../../../lib/backend/ritual";

export async function GET() {
  const tokens = await fetchRitualTokens(50);
  return NextResponse.json({
    source: "ritual-chain",
    contractsConfigured: hasRuntimeContracts(),
    tokens,
  });
}

export async function POST() {
  return NextResponse.json({
    error: "Token launch must be executed on-chain from wallet client.",
  }, { status: 405 });
}
