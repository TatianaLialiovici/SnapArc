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
      <main className="relative min-h-screen overflow-hidden px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <span className="label-mono fade-rise">Gallery // Acquire Light</span>
          <h1 className="display-title mt-3 text-4xl text-ink fade-rise sm:text-5xl">Browse the gallery</h1>
          <p className="mt-3 max-w-xl text-ink-soft fade-rise">
            Acquire a license NFT and use the photo under the standard royalty-free terms. Payment
            goes direct to the photographer.
          </p>

          {!enabled && !isLoading && (
            <div className="surface mt-6 p-5 text-sm text-ink-soft">
              The marketplace contract is not deployed yet. Go to the{" "}
              <a href="/deploy" className="font-semibold text-[rgb(var(--accent))] underline">Deploy</a> page and connect your wallet.
            </div>
          )}

          {isLoading && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="surface h-80 animate-pulse" />
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
