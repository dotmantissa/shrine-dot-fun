import { createPublicClient, getAddress, http, parseAbiItem } from "viem";
import { chainConfig } from "./contracts";
import type { TokenRecord } from "./store";

const tokenLaunchedEvent = parseAbiItem(
  "event TokenLaunched(address indexed token, address indexed curve, address indexed creator, uint256 timestamp, string twitterHandle)"
);

const FACTORY_ABI = [
  {
    type: "function",
    name: "metadata",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "description", type: "string" },
      { name: "imageURI", type: "string" },
      { name: "twitterHandle", type: "string" },
    ],
  },
] as const;

const AIVIBE_ABI = [
  {
    type: "function",
    name: "scores",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "vibeRating", type: "uint8" },
      { name: "rugRisk", type: "uint8" },
      { name: "summaryHash", type: "bytes32" },
      { name: "scoredAt", type: "uint256" },
      { name: "scored", type: "bool" },
    ],
  },
] as const;

export async function fetchRitualTokens(limit = 25): Promise<TokenRecord[]> {
  if (!chainConfig.shrineFactory || !chainConfig.aiVibe) return [];

  const client = createPublicClient({ transport: http(chainConfig.rpc) });
  const latest = await client.getBlockNumber();
  const fromBlock = latest > 50_000n ? latest - 50_000n : 0n;

  const logs = await client.getLogs({
    address: getAddress(chainConfig.shrineFactory),
    event: tokenLaunchedEvent,
    fromBlock,
    toBlock: "latest",
  });

  const newest = logs.slice(-limit).reverse();
  const out: TokenRecord[] = [];

  for (const log of newest) {
    const tokenArg = log.args.token;
    if (!tokenArg) continue;
    const token = getAddress(tokenArg);

    let meta: readonly [string, string, string, string, string] = ["Unknown", "$UNK", "", "", ""];
    let vibe = 50;
    let signal: TokenRecord["signal"] = "New";

    try {
      const m = await client.readContract({
        address: getAddress(chainConfig.shrineFactory),
        abi: FACTORY_ABI,
        functionName: "metadata",
        args: [token],
      });
      meta = m;
    } catch {}

    try {
      const s = await client.readContract({
        address: getAddress(chainConfig.aiVibe),
        abi: AIVIBE_ABI,
        functionName: "scores",
        args: [token],
      });
      vibe = Number(s[0]);
      if (vibe > 85) signal = "AI Pick";
      if (vibe < 35) signal = "Rug risk";
    } catch {}

    out.push({
      address: token,
      emoji: "⛩️",
      name: meta[0] || "Unknown",
      symbol: meta[1] || "$UNK",
      price: "0.00000000",
      change24h: "+0%",
      vibe,
      curve: 0,
      signal,
      description: meta[2] || "",
      twitterHandle: meta[4] || "",
      createdAt: Number(log.args.timestamp ?? 0n) * 1000 || Date.now(),
    });
  }

  return out;
}
