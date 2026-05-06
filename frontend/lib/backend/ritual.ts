import { createPublicClient, getAddress, http, parseAbiItem } from "viem";
import { chainConfig } from "./contracts";

export type ChainToken = {
  address: string;
  curveAddress: string;
  emoji: string;
  name: string;
  symbol: string;
  price: string;
  change24h: string;
  vibe: number;
  curve: number;
  signal: "AI Pick" | "Graduating" | "Rug risk" | "New";
  description: string;
  twitterHandle: string;
  createdAt: number;
};

const tokenLaunchedEvent = parseAbiItem(
  "event TokenLaunched(address indexed token, address indexed curve, address indexed creator, uint256 timestamp, string twitterHandle)"
);
const tradeEvent = parseAbiItem(
  "event Trade(address indexed trader, bool isBuy, uint256 ritualAmount, uint256 tokenAmount, uint256 price, uint256 marketCap)"
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
  {
    type: "function",
    name: "tokenToCurve",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

const CURVE_ABI = [
  { type: "function", name: "getCurrentPrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "realRitualReserve", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "graduationThreshold", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
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

function toSignal(vibe: number, progress: number): ChainToken["signal"] {
  if (progress >= 95) return "Graduating";
  if (vibe > 85) return "AI Pick";
  if (vibe < 35) return "Rug risk";
  return "New";
}

function createClient() {
  return createPublicClient({ transport: http(chainConfig.rpc) });
}

async function getLaunchedLogsChunked(
  client: ReturnType<typeof createClient>,
  factory: `0x${string}`,
  fromBlock: bigint,
  toBlock: bigint,
) {
  const step = 95_000n;
  const all: Awaited<ReturnType<typeof client.getLogs>> = [];
  let cursor = fromBlock;

  while (cursor <= toBlock) {
    const end = cursor + step < toBlock ? cursor + step : toBlock;
    const part = await client.getLogs({
      address: factory,
      event: tokenLaunchedEvent,
      fromBlock: cursor,
      toBlock: end,
    });
    all.push(...part);
    cursor = end + 1n;
  }

  return all;
}

async function getTradeLogsChunked(
  client: ReturnType<typeof createClient>,
  curve: `0x${string}`,
  fromBlock: bigint,
  toBlock: bigint,
) {
  const step = 95_000n;
  const all: Awaited<ReturnType<typeof client.getLogs>> = [];
  let cursor = fromBlock;

  while (cursor <= toBlock) {
    const end = cursor + step < toBlock ? cursor + step : toBlock;
    const part = await client.getLogs({
      address: curve,
      event: tradeEvent,
      fromBlock: cursor,
      toBlock: end,
    });
    all.push(...part);
    cursor = end + 1n;
  }

  return all;
}

export async function fetchRitualTokens(limit = 25): Promise<ChainToken[]> {
  if (!chainConfig.shrineFactory) return [];
  const client = createClient();
  const latest = await client.getBlockNumber();
  const fromBlock = latest > 500_000n ? latest - 500_000n : 0n;
  const logs = await getLaunchedLogsChunked(client, getAddress(chainConfig.shrineFactory), fromBlock, latest);

  const newest = logs.slice(-limit).reverse();
  const out: ChainToken[] = [];

  for (const log of newest) {
    const args = (log as any).args ?? {};
    const tokenArg = args.token as string | undefined;
    const curveArg = args.curve as string | undefined;
    if (!tokenArg || !curveArg) continue;

    const token = getAddress(tokenArg);
    const curve = getAddress(curveArg);

    let meta: readonly [string, string, string, string, string] = ["Unknown", "$UNK", "", "", ""];
    let vibe = 50;
    let price = "0.00000000";
    let progress = 0;

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
      const p = (await client.readContract({
        address: curve,
        abi: CURVE_ABI,
        functionName: "getCurrentPrice",
      })) as bigint;
      price = (Number(p) / 1e18).toFixed(8);

      const reserve = (await client.readContract({
        address: curve,
        abi: CURVE_ABI,
        functionName: "realRitualReserve",
      })) as bigint;

      const threshold = (await client.readContract({
        address: curve,
        abi: CURVE_ABI,
        functionName: "graduationThreshold",
      })) as bigint;

      progress = threshold > 0n ? Number((reserve * 10000n) / threshold) / 100 : 0;
      if (progress > 100) progress = 100;
    } catch {}

    if (chainConfig.aiVibe) {
      try {
        const s = await client.readContract({
          address: getAddress(chainConfig.aiVibe),
          abi: AIVIBE_ABI,
          functionName: "scores",
          args: [token],
        });
        vibe = Number(s[0]);
      } catch {}
    }

    out.push({
      address: token,
      curveAddress: curve,
      emoji: "⛩️",
      name: meta[0] || "Unknown",
      symbol: meta[1] || "$UNK",
      price,
      change24h: "+0%",
      vibe,
      curve: Math.round(progress),
      signal: toSignal(vibe, progress),
      description: meta[2] || "",
      twitterHandle: meta[4] || "",
      createdAt: Number(args.timestamp ?? 0n) * 1000 || Date.now(),
    });
  }

  return out;
}

export async function fetchRitualTokenByAddress(address: string) {
  if (!chainConfig.shrineFactory) return null;
  const client = createClient();
  const token = getAddress(address);

  const curve = (await client.readContract({
    address: getAddress(chainConfig.shrineFactory),
    abi: FACTORY_ABI,
    functionName: "tokenToCurve",
    args: [token],
  })) as `0x${string}`;

  if (!curve || curve === "0x0000000000000000000000000000000000000000") return null;

  const all = await fetchRitualTokens(200);
  const found = all.find((t) => t.address.toLowerCase() === token.toLowerCase());
  if (found) return found;

  const meta = await client.readContract({
    address: getAddress(chainConfig.shrineFactory),
    abi: FACTORY_ABI,
    functionName: "metadata",
    args: [token],
  }) as readonly [string, string, string, string, string];

  return {
    address: token,
    curveAddress: curve,
    emoji: "⛩️",
    name: meta[0],
    symbol: meta[1],
    description: meta[2],
    twitterHandle: meta[4],
    price: "0.00000000",
    change24h: "+0%",
    vibe: 50,
    curve: 0,
    signal: "New" as const,
    createdAt: Date.now(),
  };
}

export async function fetchRitualTrades(curveAddress: string, fromBlockLookback = 50_000n) {
  const client = createClient();
  const latest = await client.getBlockNumber();
  const fromBlock = latest > fromBlockLookback ? latest - fromBlockLookback : 0n;
  const logs = await getTradeLogsChunked(client, getAddress(curveAddress), fromBlock, latest);

  const trades = logs.slice(-80).reverse().map((l) => {
    const args = (l as any).args ?? {};
    return {
    side: args.isBuy ? "buy" : "sell",
    amount: ((args.ritualAmount ?? 0n) / 10n ** 18n).toString(),
    at: Date.now(),
    price: Number(args.price ?? 0n) / 1e18,
  };});

  const points = trades
    .slice()
    .reverse()
    .map((t, i) => ({ t: Date.now() - (trades.length - i) * 12_000, p: t.price || 0 }));

  return { trades, points };
}
