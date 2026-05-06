import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    error: "Trades must be executed on-chain from wallet client.",
  }, { status: 405 });
}
