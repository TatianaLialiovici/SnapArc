"use client";

import { useAccount, useReadContract } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { LicenseCard } from "@/components/LicenseCard";
import { useMarketContract } from "@/hooks/useMarketContract";

export default function LicensesPage() {
  const { address: walletAddress, isConnected } = useAccount();
  const { address, abi, enabled } = useMarketContract();

  const { data: tokenIds, isLoading } = useReadContract({
    address,
    abi,
    functionName: "getLicenseIdsByOwner",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!address && !!walletAddress },
  });

  const ids = Array.isArray(tokenIds) ? (tokenIds as bigint[]) : [];

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <span className="label-mono fade-rise">Collection // Rights Held</span>
          <h1 className="display-title mt-3 text-4xl text-ink fade-rise sm:text-5xl">My licenses</h1>
          <p className="mt-3 text-ink-soft fade-rise">
            Every license NFT you have acquired on Snap&nbsp;Arc.
          </p>

          {!isConnected && (
            <p className="mt-6 font-mono text-sm text-ink-faint">Connect your wallet to view your licenses.</p>
          )}

          {isLoading && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="surface h-96 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && ids.length === 0 && isConnected && (
            <p className="mt-6 font-mono text-sm text-ink-faint">You do not own any licenses yet.</p>
          )}

          {!isLoading && ids.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ids.map((id) => (
                <LicenseCard key={id.toString()} tokenId={id} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
