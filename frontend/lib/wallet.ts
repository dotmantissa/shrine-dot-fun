export const RITUAL_CHAIN_ID = 1979;
export const RITUAL_CHAIN_HEX = "0x7bb";

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function getEthereum(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

export async function ensureRitualNetwork(provider: EthereumProvider) {
  const chainId = (await provider.request({ method: "eth_chainId" })) as string;
  if (chainId?.toLowerCase() === RITUAL_CHAIN_HEX) return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: RITUAL_CHAIN_HEX }],
    });
  } catch (err: any) {
    if (err?.code !== 4902) throw err;

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: RITUAL_CHAIN_HEX,
          chainName: "Ritual",
          nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
          rpcUrls: ["https://rpc.ritualfoundation.org"],
          blockExplorerUrls: ["https://explorer.ritualfoundation.org"],
        },
      ],
    });

    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: RITUAL_CHAIN_HEX }],
    });
  }
}

export async function connectRitualWallet() {
  const provider = getEthereum();
  if (!provider) throw new Error("No EVM wallet found");

  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts?.length) throw new Error("No account returned by wallet");

  await ensureRitualNetwork(provider);
  return { account: accounts[0], provider };
}
