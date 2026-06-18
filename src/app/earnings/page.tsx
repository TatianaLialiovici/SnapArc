"use client";

import { useAccount, useReadContract } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { AuraBlob } from "@/components/AuraBlob";
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
      <main className="relative min-h-screen overflow-hidden px-5 py-14">
        <div className="mx-auto max-w-3xl">
          <span className="label-mono fade-rise">Studio // Direct Payouts</span>
          <h1 className="display-title mt-3 text-4xl text-ink fade-rise sm:text-5xl">Earnings</h1>
          <p className="mt-3 text-ink-soft fade-rise">
            Total USDC earned from license sales. Payments are transferred instantly, direct to your wallet.
          </p>

          {!isConnected && (
            <p className="mt-6 font-mono text-sm text-ink-faint">Connect your wallet to see earnings.</p>
          )}

          {isConnected && (
            <div className="surface mt-8 flex items-center gap-7 p-8 fade-rise" style={{ animationDelay: "0.1s" }}>
              <AuraBlob size={120} />
              <div>
                <p className="label-mono">Lifetime earnings</p>
                <p className="display-title mt-2 text-5xl text-ink">
                  {isLoading ? "…" : formatUsdc((earnings as bigint) ?? 0n)}
                </p>
                <p className="mt-4 font-mono text-xs text-ink-faint">
                  WALLET // {walletAddress ? truncateAddress(walletAddress) : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
