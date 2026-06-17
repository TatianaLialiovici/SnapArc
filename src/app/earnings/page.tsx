"use client";

import { useAccount, useReadContract } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { useMarketContract } from "@/hooks/useMarketContract";
import { formatUsdc, truncateAddress } from "@/lib/format";

export default function EarningsPage() {
  const { address: walletAddress, isConnected } = useAccount();
  const { address, abi, enabled } = useMarketContract();

  const { data: earnings, isLoading } = useReadContract({
    address,
    abi,
    functionName: "photographerEarnings",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!address && !!walletAddress },
  });

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden px-4 py-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Total USDC earned from license sales. Payments are transferred instantly to your wallet.
          </p>

          {!isConnected && (
            <p className="mt-6 text-slate-500">Connect your wallet to see earnings.</p>
          )}

          {isConnected && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Lifetime earnings
              </p>
              <p className="mt-2 text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {isLoading ? "..." : formatUsdc((earnings as bigint) ?? 0n)}
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Wallet: {walletAddress ? truncateAddress(walletAddress) : "-"}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
