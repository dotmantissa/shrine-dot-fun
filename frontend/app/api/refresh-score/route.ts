import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({
    error: "Score refresh must be executed via on-chain contract call.",
  }, { status: 405 });
}
