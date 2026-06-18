"use client";

import { useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useMarketContract } from "@/hooks/useMarketContract";
import { formatUsdc, truncateAddress } from "@/lib/format";

interface PhotoCardProps {
  id: bigint;
  photographer: string;
  title: string;
  description: string;
  imageURI: string;
  price: bigint;
  onPurchase?: () => void;
}

export function PhotoCard({ id, photographer, title, description, imageURI, price, onPurchase }: PhotoCardProps) {
  const { address, abi } = useMarketContract();
  const { isConnected } = useAccount();
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);
  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleBuy = async () => {
    if (!address || !isConnected) return;
    const tx = await writeContractAsync({
      address,
      abi,
      functionName: "buyLicense",
      args: [id],
      value: price,
    });
    setHash(tx);
    onPurchase?.();
  };

  return (
    <div className="surface group flex flex-col overflow-hidden p-0 transition-transform duration-500 hover:-translate-y-1.5">
      <div className="relative m-3 aspect-[4/3] overflow-hidden rounded-2xl bg-[rgb(var(--paper-2))]">
        {imageURI ? (
          <Image
            src={imageURI}
            alt={title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          // CSS aura fallback when no image is provided — no broken hotlinks
          <div className="aura-stage h-full w-full">
            <div className="aura-blob h-full w-full" style={{ borderRadius: "16px" }}>
              <div className="aura-grain" />
            </div>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-[rgba(255,255,255,0.85)] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-ink-soft backdrop-blur">
          Frame #{id.toString()}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5">
        <h3 className="display-title text-xl text-ink">{title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{description}</p>
        <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-widest text-ink-faint">
          by {truncateAddress(photographer)}
        </p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <div className="flex flex-col">
            <span className="display-title text-2xl text-ink">{formatUsdc(price)}</span>
            <span className="label-mono">License / Direct</span>
          </div>
          <button
            onClick={handleBuy}
            disabled={isPending || isConfirming || !isConnected}
            className="pill-primary text-sm"
          >
            {isPending ? "Acquiring…" : isConfirming ? "Confirming…" : isSuccess ? "Owned" : "Acquire"}
          </button>
        </div>
      </div>
    </div>
  );
}
