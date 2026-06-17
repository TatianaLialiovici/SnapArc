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
      <main className="relative min-h-screen overflow-hidden px-4 py-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">My licenses</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            All license NFTs you have purchased on Snap Arc.
          </p>

          {!isConnected && (
            <p className="mt-6 text-slate-500">Connect your wallet to view your licenses.</p>
          )}

          {isLoading && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {!isLoading && ids.length === 0 && isConnected && (
            <p className="mt-6 text-slate-500">You do not own any licenses yet.</p>
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
