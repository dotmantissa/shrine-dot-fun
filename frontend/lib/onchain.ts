"use client";

import {
  createPublicClient,
  createWalletClient,
  custom,
  decodeEventLog,
  formatUnits,
  getAddress,
  parseAbi,
  parseAbiItem,
  parseUnits,
  http,
} from "viem";
import { getEthereum, RITUAL_CHAIN_ID } from "./wallet";

const FACTORY_ABI = parseAbi([
  "function deployToken(string name,string symbol,string description,string imageURI,string twitterHandle) returns (address token,address curve)",
]);

const CURVE_ABI = parseAbi([
  "function buy(uint256 minTokensOut) payable returns (uint256 tokensOut)",
  "function sell(uint256 tokenAmount,uint256 minRitualOut) returns (uint256 ritualOut)",
]);

const TOKEN_ABI = parseAbi([
  "function approve(address spender,uint256 amount) returns (bool)",
]);

const launchedEvent = parseAbiItem(
  "event TokenLaunched(address indexed token, address indexed curve, address indexed creator, uint256 timestamp, string twitterHandle)"
);

export function getClients() {
  const eth = getEthereum();
  if (!eth) throw new Error("Wallet provider not found");

  const wallet = createWalletClient({
    chain: {
      id: RITUAL_CHAIN_ID,
      name: "Ritual Testnet",
      network: "ritual",
      nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
      rpcUrls: {
        default: { http: ["https://rpc.ritualfoundation.org"] },
        public: { http: ["https://rpc.ritualfoundation.org"] },
      },
    },
    transport: custom(eth as any),
  });

  const pub = createPublicClient({ transport: http("https://rpc.ritualfoundation.org") });
  return { wallet, pub };
}

function estimateValueForTargetMint(targetTokens: bigint) {
  const vR = 30n * 10n ** 18n;
  const vT = 1_073_000_191n * 10n ** 18n;
  const k = vR * vT;
  const safeTarget = targetTokens >= vT ? vT - 1n : targetTokens;
  if (safeTarget <= 0n) return 0n;

  const newVT = vT - safeTarget;
  const newVR = k / newVT;
  const amountInNoFee = newVR > vR ? newVR - vR : 0n;

  return (amountInNoFee * 10_000n + 9_899n) / 9_900n;
}

export async function launchTokenOnchain(args: {
  factory: `0x${string}`;
  account: `0x${string}`;
  name: string;
  symbol: string;
  description: string;
  imageURI: string;
  twitterHandle: string;
  totalTokensToMint?: string;
}) {
  const { wallet, pub } = getClients();

  const hash = await wallet.writeContract({
    address: getAddress(args.factory),
    abi: FACTORY_ABI,
    functionName: "deployToken",
    args: [args.name, args.symbol, args.description, args.imageURI, args.twitterHandle],
    account: getAddress(args.account),
    chain: null,
  });

  const receipt = await pub.waitForTransactionReceipt({ hash });

  let token: `0x${string}` | null = null;
  let curve: `0x${string}` | null = null;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({ abi: [launchedEvent], data: log.data, topics: log.topics });
      if (decoded.eventName === "TokenLaunched") {
        token = getAddress(decoded.args.token as string);
        curve = getAddress(decoded.args.curve as string);
        break;
      }
    } catch {}
  }

  if (!token || !curve) throw new Error("TokenLaunched event not found in receipt");

  const qty = args.totalTokensToMint?.trim();
  if (qty && Number(qty) > 0) {
    const target = parseUnits(qty, 18);
    const value = estimateValueForTargetMint(target);
    if (value > 0n) {
      const minOut = (target * 97n) / 100n;
      const buyHash = await wallet.writeContract({
        address: curve,
        abi: CURVE_ABI,
        functionName: "buy",
        args: [minOut],
        value,
        account: getAddress(args.account),
        chain: null,
      });
      await pub.waitForTransactionReceipt({ hash: buyHash });
    }
  }

  return { hash, token, curve };
}

export async function buyOnchain(args: {
  curve: `0x${string}`;
  account: `0x${string}`;
  ritualAmount: string;
}) {
  const { wallet, pub } = getClients();
  const value = parseUnits(args.ritualAmount || "0", 18);
  const hash = await wallet.writeContract({
    address: getAddress(args.curve),
    abi: CURVE_ABI,
    functionName: "buy",
    args: [0n],
    value,
    account: getAddress(args.account),
    chain: null,
  });
  await pub.waitForTransactionReceipt({ hash });
  return hash;
}

export async function sellOnchain(args: {
  curve: `0x${string}`;
  token: `0x${string}`;
  account: `0x${string}`;
  tokenAmount: string;
}) {
  const { wallet, pub } = getClients();
  const amount = parseUnits(args.tokenAmount || "0", 18);

  const approveHash = await wallet.writeContract({
    address: getAddress(args.token),
    abi: TOKEN_ABI,
    functionName: "approve",
    args: [getAddress(args.curve), amount],
    account: getAddress(args.account),
    chain: null,
  });
  await pub.waitForTransactionReceipt({ hash: approveHash });

  const sellHash = await wallet.writeContract({
    address: getAddress(args.curve),
    abi: CURVE_ABI,
    functionName: "sell",
    args: [amount, 0n],
    account: getAddress(args.account),
    chain: null,
  });
  await pub.waitForTransactionReceipt({ hash: sellHash });
  return sellHash;
}

export function fmtAddress(a: string) {
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

export function fmt18(v: bigint) {
  return formatUnits(v, 18);
}
