"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { connectRitualWallet, ensureRitualNetwork, getEthereum, RITUAL_CHAIN_HEX } from "../lib/wallet";

export function useRitualWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const isConnected = !!account;
  const isRitual = chainId?.toLowerCase() === RITUAL_CHAIN_HEX;

  const refresh = useCallback(async () => {
    const provider = getEthereum();
    if (!provider) return;

    const [accounts, activeChain] = await Promise.all([
      provider.request({ method: "eth_accounts" }) as Promise<string[]>,
      provider.request({ method: "eth_chainId" }) as Promise<string>,
    ]);

    setAccount(accounts?.[0] ?? null);
    setChainId(activeChain ?? null);
  }, []);

  const connect = useCallback(async () => {
    try {
      setBusy(true);
      setError("");
      const { account: next } = await connectRitualWallet();
      setAccount(next);
      setChainId(RITUAL_CHAIN_HEX);
      return true;
    } catch (err: any) {
      setError(err?.message || "Wallet connection failed");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const provider = getEthereum();
    if (!provider?.on) return;

    const onAccountsChanged = (accounts: string[]) => setAccount(accounts?.[0] ?? null);
    const onChainChanged = (nextChain: string) => setChainId(nextChain);

    provider.on("accountsChanged", onAccountsChanged);
    provider.on("chainChanged", onChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", onAccountsChanged);
      provider.removeListener?.("chainChanged", onChainChanged);
    };
  }, [refresh]);

  useEffect(() => {
    if (!account) return;
    if (!chainId || chainId.toLowerCase() === RITUAL_CHAIN_HEX) return;

    const provider = getEthereum();
    if (!provider) return;

    let cancelled = false;
    (async () => {
      try {
        setBusy(true);
        setError("");
        await ensureRitualNetwork(provider);
        if (!cancelled) setChainId(RITUAL_CHAIN_HEX);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Please switch to Ritual testnet.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [account, chainId]);

  const shortAccount = useMemo(() => {
    if (!account) return "";
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  }, [account]);

  return { account, shortAccount, isConnected, isRitual, busy, error, connect, refresh };
}
