"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { PhotoCard } from "@/components/PhotoCard";
import { useMarketContract } from "@/hooks/useMarketContract";

interface PhotoTuple {
  0: string;
  1: string;
  2: string;
  3: string;
  4: bigint;
  5: boolean;
  6: bigint;
}

export default function BrowsePage() {
  const { address, abi, enabled } = useMarketContract();

  const { data: activeIds, isLoading: idsLoading } = useReadContract({
    address,
    abi,
    functionName: "getActivePhotoIds",
    query: { enabled },
  });

  const ids = Array.isArray(activeIds) ? (activeIds as bigint[]) : [];

  const contracts = ids.map((id) => ({
    address,
    abi,
    functionName: "photos" as const,
    args: [id] as const,
  }));

  const { data: photoData, isLoading: photosLoading } = useReadContracts({
    contracts,
    query: { enabled: ids.length > 0 },
  });

  const isLoading = idsLoading || photosLoading;

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden px-4 py-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">Browse photos</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Purchase a license NFT and use the photo under the standard royalty-free terms.
          </p>

          {!enabled && !isLoading && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              The marketplace contract is not deployed yet. Go to the{" "}
              <a href="/deploy" className="font-semibold underline">Deploy</a> page and connect your wallet.
            </div>
          )}

          {isLoading && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {!isLoading && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ids.map((id, index) => {
                const result = photoData?.[index];
                const photo = result?.result as PhotoTuple | undefined;
                if (!photo) return null;
                return (
                  <PhotoCard
                    key={id.toString()}
                    id={id}
                    photographer={photo[0]}
                    title={photo[1]}
                    description={photo[2]}
                    imageURI={photo[3]}
                    price={photo[4]}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
