"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { rabby, hasRabby } from "@/lib/rabbyConnector";

export function WalletButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="pill-ghost font-mono text-xs tracking-wider"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-[rgb(var(--success))]" />
        {address.slice(0, 6)}…{address.slice(-4)}
      </button>
    );
  }

  const handleConnect = () => {
    connect({ connector: hasRabby() ? rabby() : injected() });
  };

  return (
    <button onClick={handleConnect} disabled={isConnecting} className="pill-primary text-sm">
      {isConnecting ? "Connecting…" : hasRabby() ? "Connect Rabby" : "Connect Wallet"}
    </button>
  );
}
