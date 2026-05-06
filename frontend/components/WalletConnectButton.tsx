"use client";

export default function WalletConnectButton({
  isConnected,
  isRitual,
  busy,
  shortAccount,
  onConnect,
}: {
  isConnected: boolean;
  isRitual: boolean;
  busy: boolean;
  shortAccount: string;
  onConnect: () => Promise<boolean> | void;
}) {
  const label = !isConnected
    ? "Connect Wallet"
    : isRitual
      ? shortAccount
      : "Switch to Ritual";

  return (
    <button
      onClick={() => onConnect()}
      disabled={busy}
      style={{
        border: "1px solid var(--line)",
        background: isConnected && isRitual ? "var(--stone)" : "transparent",
        color: "var(--ink)",
        padding: "8px 12px",
        cursor: "pointer",
        letterSpacing: ".08em",
        textTransform: "uppercase",
        font: "500 10px 'DM Mono', monospace",
      }}
    >
      {busy ? "Connecting..." : label}
    </button>
  );
}
