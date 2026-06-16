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
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    );
  }

  const handleConnect = () => {
    connect({ connector: hasRabby() ? rabby() : injected() });
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 hover:shadow-indigo-600/30"
    >
      {isConnecting ? "Connecting..." : hasRabby() ? "Connect Rabby" : "Connect Wallet"}
    </button>
  );
}
