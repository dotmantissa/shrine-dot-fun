import { NextResponse } from "next/server";
import { hasRuntimeContracts } from "../../../lib/backend/contracts";
import { fetchRitualTokens } from "../../../lib/backend/ritual";

export async function GET() {
  let tokens: Awaited<ReturnType<typeof fetchRitualTokens>> = [];
  try {
    tokens = await fetchRitualTokens(50);
  } catch (e) {
    console.error("api/tokens fetchRitualTokens failed", e);
  }
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
