"use client";

import { useState } from "react";
import { useAccount, useWalletClient, useChainId, usePublicClient, useConnect } from "wagmi";
import { metaMask, injected } from "wagmi/connectors";
import { Navbar } from "@/components/Navbar";
import { useMarketContract } from "@/hooks/useMarketContract";
import { useContractAddress } from "@/hooks/useContractAddress";
import { arcTestnet } from "@/lib/chain";
import { ARCSCAN_URL } from "@/lib/contract";

function hasMetaMask() {
  if (typeof window === "undefined") return false;
  const ethereum = (window as unknown as { ethereum?: unknown }).ethereum;
  return (
    !!ethereum &&
    typeof ethereum === "object" &&
    "isMetaMask" in ethereum &&
    ethereum.isMetaMask === true
  );
}

export default function DeployPage() {
  const { isConnected, address: walletAddress } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { connect, isPending: isConnecting } = useConnect();
  const { bytecode, abi } = useMarketContract();
  const { address: savedAddress, reload } = useContractAddress();

  const [deploying, setDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCorrectChain = chainId === arcTestnet.id;

  const handleConnect = () => {
    if (hasMetaMask()) {
      connect({ connector: metaMask() });
    } else {
      connect({ connector: injected() });
    }
  };

  const handleDeploy = async () => {
    if (!walletClient || !walletAddress) {
      setError("Connect your wallet first.");
      return;
    }
    if (!isCorrectChain) {
      setError(`Switch to ${arcTestnet.name} (Chain ID ${arcTestnet.id}) in your wallet.`);
      return;
    }
    setDeploying(true);
    setError(null);
    try {
      const hash = await walletClient.deployContract({
        abi,
        bytecode,
        args: ["Snap Arc License", "SNAPARC", walletAddress],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      if (!receipt || !receipt.contractAddress) {
        throw new Error("Deployment did not return a contract address.");
      }
      const address = receipt.contractAddress;
      setDeployedAddress(address);
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deployment failed.");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden px-4 py-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Deploy the marketplace</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            This contract stores every photo, license, and payment. The deployment is signed by your wallet
            and recorded on {arcTestnet.name}.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Network:</span> {arcTestnet.name}
              </p>
              <p>
                <span className="font-medium">Chain ID:</span> {arcTestnet.id}
              </p>
              <p>
                <span className="font-medium">Wallet:</span>{" "}
                {isConnected && walletAddress ? walletAddress : "Not connected"}
              </p>
              <p>
                <span className="font-medium">Correct network:</span>{" "}
                {isConnected ? (isCorrectChain ? "Yes" : "No") : "-"}
              </p>
            </div>

            {!isConnected && (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 hover:shadow-indigo-600/30 disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : hasMetaMask() ? "Connect MetaMask" : "Connect Wallet"}
              </button>
            )}

            {isConnected && (
              <button
                onClick={handleDeploy}
                disabled={deploying || !isCorrectChain}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 hover:shadow-indigo-600/30 disabled:opacity-50"
              >
                {deploying ? "Deploying..." : "Deploy SnapArcMarket"}
              </button>
            )}

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}
          </div>

          {savedAddress && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              <p className="font-semibold">Contract deployed</p>
              <p className="mt-1 break-all font-mono text-sm">{savedAddress}</p>
              <a
                href={`${ARCSCAN_URL}/address/${savedAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium hover:underline"
              >
                View on ArcScan
              </a>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
