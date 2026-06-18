"use client";

import { useState } from "react";
import { useAccount, useChainId, usePublicClient, useConnect, useSwitchChain } from "wagmi";
import { createWalletClient, custom } from "viem";
import { injected } from "wagmi/connectors";
import { rabby, hasRabby } from "@/lib/rabbyConnector";
import { Navbar } from "@/components/Navbar";
import { useMarketContract } from "@/hooks/useMarketContract";
import { useContractAddress } from "@/hooks/useContractAddress";
import { arcTestnet } from "@/lib/chain";
import { ARCSCAN_URL } from "@/lib/contract";

export default function DeployPage() {
  const { isConnected, address: walletAddress, connector } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { connect, isPending: isConnecting } = useConnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { bytecode, abi } = useMarketContract();
  const { address: savedAddress, reload } = useContractAddress();

  const [deploying, setDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCorrectChain = chainId === arcTestnet.id;

  const handleConnect = () => {
    connect({ connector: hasRabby() ? rabby() : injected() });
  };

  const handleSwitch = () => {
    switchChain?.({ chainId: arcTestnet.id });
  };

  const handleDeploy = async () => {
    if (!connector || !walletAddress) {
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
      const provider = await connector.getProvider();
      if (!provider) {
        throw new Error("Wallet provider not found.");
      }
      const walletClient = createWalletClient({
        account: walletAddress,
        chain: arcTestnet,
        transport: custom(provider as any),
      });
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
      <main className="relative min-h-screen overflow-hidden px-5 py-14">
        <div className="mx-auto max-w-3xl">
          <span className="label-mono fade-rise">Setup // On-Chain</span>
          <h1 className="display-title mt-3 text-4xl text-ink fade-rise sm:text-5xl">Deploy the marketplace</h1>
          <p className="mt-3 text-ink-soft fade-rise">
            This contract stores every photo, license, and payment. The deployment is signed by your wallet
            and recorded on {arcTestnet.name}.
          </p>

          <div className="surface mt-8 p-7 fade-rise" style={{ animationDelay: "0.1s" }}>
            <div className="grid gap-3 font-mono text-xs text-ink-soft sm:grid-cols-2">
              <p>NETWORK // {arcTestnet.name}</p>
              <p>CHAIN ID // {arcTestnet.id}</p>
              <p className="break-all">WALLET // {isConnected && walletAddress ? walletAddress : "Not connected"}</p>
              <p>CORRECT NET // {isConnected ? (isCorrectChain ? "Yes" : "No") : "—"}</p>
            </div>

            {!isConnected && (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="pill-primary mt-7 w-full justify-center"
              >
                {isConnecting ? "Connecting…" : hasRabby() ? "Connect Rabby" : "Connect Wallet"}
              </button>
            )}

            {isConnected && !isCorrectChain && (
              <button
                onClick={handleSwitch}
                disabled={isSwitching}
                className="pill-ghost mt-7 w-full justify-center"
              >
                {isSwitching ? "Switching…" : `Switch to ${arcTestnet.name}`}
              </button>
            )}

            {isConnected && isCorrectChain && (
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="pill-primary mt-7 w-full justify-center"
              >
                {deploying ? "Deploying…" : "Deploy SnapArcMarket"}
              </button>
            )}

            {error && (
              <div className="mt-4 rounded-2xl border border-[rgba(214,84,96,0.35)] bg-[rgba(214,84,96,0.08)] p-3 text-sm text-[rgb(var(--danger))]">
                {error}
              </div>
            )}
          </div>

          {savedAddress && (
            <div className="surface mt-6 p-5">
              <p className="display-title text-lg text-ink">Contract deployed</p>
              <p className="mt-1 break-all font-mono text-sm text-ink-soft">{savedAddress}</p>
              <a
                href={`${ARCSCAN_URL}/address/${savedAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-[rgb(var(--accent))] hover:underline"
              >
                View on Arc Scan →
              </a>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
