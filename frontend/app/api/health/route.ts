import { NextResponse } from "next/server";
import { createPublicClient, getAddress, http } from "viem";
import { chainConfig, hasRuntimeContracts } from "../../../lib/backend/contracts";

export async function GET() {
  const client = createPublicClient({ transport: http(chainConfig.rpc) });
  const latestBlock = await client.getBlockNumber();

  let contractsLive = false;
  if (hasRuntimeContracts()) {
    const codes = await Promise.all([
      client.getBytecode({ address: getAddress(chainConfig.shrineFactory!) }),
      client.getBytecode({ address: getAddress(chainConfig.aiVibe!) }),
      client.getBytecode({ address: getAddress(chainConfig.narrator!) }),
    ]);
    contractsLive = codes.every((c) => !!c && c !== "0x");
  }

  return NextResponse.json({
    rpc: chainConfig.rpc,
    latestBlock: latestBlock.toString(),
    contractsConfigured: hasRuntimeContracts(),
    contractsLive,
  });
}
