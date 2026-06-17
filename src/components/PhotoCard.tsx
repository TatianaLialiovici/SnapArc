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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
        {imageURI ? (
          <Image
            src={imageURI}
            alt={title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
          {description}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          by {truncateAddress(photographer)}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {formatUsdc(price)}
          </span>
          <button
            onClick={handleBuy}
            disabled={isPending || isConfirming || !isConnected}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {isPending ? "Buying..." : isConfirming ? "Confirming..." : isSuccess ? "Owned" : "Buy License"}
          </button>
        </div>
      </div>
    </div>
  );
}
