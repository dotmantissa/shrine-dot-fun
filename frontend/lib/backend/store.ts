export type TokenRecord = {
  address: string;
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

export type Trade = { side: "buy" | "sell"; amount: string; at: number };
export type PricePoint = { t: number; p: number };

const TOKENS_KEY = "__SHRINE_TOKEN_STORE__";
const TRADES_KEY = "__SHRINE_TRADES_STORE__";
const PRICE_KEY = "__SHRINE_PRICE_STORE__";

const seed: TokenRecord[] = [
  { address: "0x00000000000000000000000000000000000000a1", emoji: "🦋", name: "Spirit Moth", symbol: "$MOTH", price: "0.00000421", change24h: "+284%", vibe: 58, curve: 72, signal: "New", description: "Meme swarm with strong community momentum.", twitterHandle: "@spiritmoth", createdAt: Date.now() - 450000 },
  { address: "0x00000000000000000000000000000000000000a2", emoji: "👺", name: "Oni Coin", symbol: "$ONI", price: "0.00000089", change24h: "−12%", vibe: 91, curve: 12, signal: "AI Pick", description: "Volatile launch with weak buyer retention.", twitterHandle: "@onicoin", createdAt: Date.now() - 390000 },
  { address: "0x00000000000000000000000000000000000000a3", emoji: "🐉", name: "Ghost Koi", symbol: "$GKOI", price: "0.00001337", change24h: "+1,204%", vibe: 40, curve: 97, signal: "Graduating", description: "Breakout curve and strong buy pressure.", twitterHandle: "@ghostkoi", createdAt: Date.now() - 320000 },
  { address: "0x00000000000000000000000000000000000000a4", emoji: "🕯️", name: "Kami Candle", symbol: "$KAMI", price: "0.00000203", change24h: "+44%", vibe: 77, curve: 45, signal: "AI Pick", description: "Steady order flow, early-stage growth.", twitterHandle: "@kamicandle", createdAt: Date.now() - 220000 },
  { address: "0x00000000000000000000000000000000000000a5", emoji: "💀", name: "Hollow Monk", symbol: "$MONK", price: "0.00000011", change24h: "−67%", vibe: 19, curve: 83, signal: "Rug risk", description: "Low-liquidity tail risk.", twitterHandle: "@hollowmonk", createdAt: Date.now() - 160000 },
];

function getGlobal() {
  return globalThis as typeof globalThis & {
    [TOKENS_KEY]?: TokenRecord[];
    [TRADES_KEY]?: Record<string, Trade[]>;
    [PRICE_KEY]?: Record<string, PricePoint[]>;
  };
}

export function readStore(): TokenRecord[] {
  const g = getGlobal();
  if (!g[TOKENS_KEY]) g[TOKENS_KEY] = [...seed];
  return g[TOKENS_KEY] as TokenRecord[];
}

export function writeStore(next: TokenRecord[]) {
  getGlobal()[TOKENS_KEY] = next;
}

export function readTrades(token: string): Trade[] {
  const g = getGlobal();
  if (!g[TRADES_KEY]) g[TRADES_KEY] = {};
  return g[TRADES_KEY]![token] || [];
}

export function pushTrade(token: string, trade: Trade) {
  const g = getGlobal();
  if (!g[TRADES_KEY]) g[TRADES_KEY] = {};
  if (!g[TRADES_KEY]![token]) g[TRADES_KEY]![token] = [];
  g[TRADES_KEY]![token] = [trade, ...g[TRADES_KEY]![token]].slice(0, 50);
}

export function readPriceHistory(token: string): PricePoint[] {
  const g = getGlobal();
  if (!g[PRICE_KEY]) g[PRICE_KEY] = {};
  return g[PRICE_KEY]![token] || [];
}

export function pushPrice(token: string, point: PricePoint) {
  const g = getGlobal();
  if (!g[PRICE_KEY]) g[PRICE_KEY] = {};
  if (!g[PRICE_KEY]![token]) g[PRICE_KEY]![token] = [];
  g[PRICE_KEY]![token] = [...g[PRICE_KEY]![token], point].slice(-80);
}
